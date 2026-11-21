#!/usr/bin/env python3
"""
MEDICALISM V2 — UNIVERSAL NATIVE COURSE COMPILER
Compiles AI-generated JSON chapters (medicalism.chapter.v2) into:
  1) Per-chapter < 100 KB on-demand JS chunks: data/<courseId>/<chapterId>.js
  2) Lightweight course TOC & metadata index: data/<courseId>/index.js
  3) Refreshed global search index (when build_global_search_index.py is present)

Usage:
  python scripts/compile_v2_course.py --course obgyn --input content/v2/obgyn --output data/obgyn
"""

import argparse
import base64
import copy
import json
import math
import os
import re
import subprocess
import sys
import zlib
from pathlib import Path

VALID_BLOCK_TYPES = {
    "prose",
    "accordion",
    "table",
    "pathway",
    "osce_card",
    "ward_orders",
    "callout",
    "stat_strip",
    "gestational_timeline",
    "scoring_table",
}

VALID_TONES = {"info", "success", "warning", "danger", "neutral"}
VALID_CALLOUT_KINDS = {"pearl", "exam_trap", "red_flag", "acog_update"}
VALID_URGENCIES = {"routine", "urgent", "critical"}
VALID_ACCORDION_VARIANTS = {
    "pathophysiology",
    "deep-dive",
    "evidence",
    "clinical-note",
    "exceptions",
    "differential",
    "guideline",
    "pharmacology",
    "case-note",
}

PERSIAN_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
ASCII_DIGITS = str.maketrans("۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩", "01234567890123456789")
RAW_DEFLATE_THRESHOLD_BYTES = 80 * 1024  # Compress chunks > 80 KB to stay < 100 KB


def to_persian_digits(val) -> str:
    return str(val).translate(PERSIAN_DIGITS)


def strip_markdown_fences(raw_text: str) -> str:
    """Strip UTF-8 BOM and all standalone ```json / ``` fence lines copied from AI Studio."""
    cleaned = raw_text.lstrip("\ufeff")
    cleaned = re.sub(r"(?m)^\s*```(?:json|JSON)?\s*\r?$", "", cleaned)
    return cleaned.strip()


def extract_json_objects(raw_text: str, filename: str) -> list[dict]:
    """Extract one or more sequential top-level JSON objects from a raw .json/.txt file."""
    cleaned = strip_markdown_fences(raw_text)
    if not cleaned:
        raise ValueError(f"{filename}: file is empty")

    decoder = json.JSONDecoder()
    objs: list[dict] = []
    pos = 0
    n = len(cleaned)

    while pos < n:
        idx = cleaned.find("{", pos)
        if idx == -1:
            break
        line_start = cleaned.rfind("\n", 0, idx) + 1
        line_end = cleaned.find("\n", idx)
        if line_end == -1:
            line_end = n
        cur_line = cleaned[line_start:line_end].lstrip()

        try:
            obj, end = decoder.raw_decode(cleaned, idx)
        except json.JSONDecodeError as err:
            if cur_line.startswith("📊"):
                pos = line_end
                continue
            raise ValueError(f"Invalid JSON in {filename}: {err}") from err

        if not isinstance(obj, dict):
            raise ValueError(f"{filename}: top-level JSON value must be an object")
        objs.append(obj)
        pos = end

    if not objs:
        raise ValueError(f"{filename}: no valid JSON chapter object found")
    return objs


def merge_chapter_parts(chapter_id: str, part_records: list[tuple[int, int, str, dict]]) -> tuple[dict, int]:
    """Sort multi-part JSON fragments for one chapterId and merge sections/metadata deterministically."""
    explicit_totals = []
    normalized_items = []
    for seq_idx, (file_idx, obj_idx, src_name, obj) in enumerate(part_records, start=1):
        p_meta = obj.get("part")
        if isinstance(p_meta, dict):
            cur = p_meta.get("current", seq_idx)
            tot = p_meta.get("total", 1)
            if not isinstance(cur, int) or cur < 1:
                raise ValueError(f"{chapter_id} ({src_name}): invalid part.current '{cur}'")
            if not isinstance(tot, int) or tot < 1:
                raise ValueError(f"{chapter_id} ({src_name}): invalid part.total '{tot}'")
            explicit_totals.append(tot)
        else:
            cur = seq_idx
            tot = len(part_records)
        normalized_items.append((cur, file_idx, obj_idx, src_name, obj))

    normalized_items.sort(key=lambda item: (item[0], item[1], item[2]))

    if len(normalized_items) > 1 or (explicit_totals and max(explicit_totals) > 1):
        expected_total = max(explicit_totals) if explicit_totals else len(normalized_items)
        if explicit_totals and len(set(explicit_totals)) > 1:
            raise ValueError(f"{chapter_id}: conflicting part.total values across parts ({explicit_totals})")
        seen_currents = [item[0] for item in normalized_items]
        if len(set(seen_currents)) != len(seen_currents):
            raise ValueError(f"{chapter_id}: duplicate part.current values found ({seen_currents})")
        missing = sorted(set(range(1, expected_total + 1)) - set(seen_currents))
        if missing:
            raise ValueError(f"{chapter_id}: incomplete multi-part chapter (missing parts: {missing})")

    base = copy.deepcopy(normalized_items[0][4])
    base.pop("part", None)

    expected_number = base.get("number")
    expected_course = base.get("courseId")
    base_src = dict(base.get("source") or {})

    merged_sections: list[dict] = []
    sec_by_id: dict[str, dict] = {}
    seen_block_ids_per_sec: dict[str, set[str]] = {}
    merged_cram: list[str] = []
    seen_cram: set[str] = set()
    part_count = len(normalized_items)

    for cur, _fidx, _oidx, src_name, part_obj in normalized_items:
        if part_obj.get("courseId") != expected_course:
            raise ValueError(
                f"{chapter_id} ({src_name}): mismatched courseId '{part_obj.get('courseId')}' != '{expected_course}'"
            )
        if part_obj.get("number") != expected_number:
            raise ValueError(
                f"{chapter_id} ({src_name}): mismatched chapter number {part_obj.get('number')} != {expected_number}"
            )
        if not base.get("latinTitle") and part_obj.get("latinTitle"):
            base["latinTitle"] = part_obj["latinTitle"]
        part_src = part_obj.get("source") or {}
        if not base_src.get("guideline") and part_src.get("guideline"):
            base_src["guideline"] = part_src["guideline"]
        if not base_src.get("textbook") and part_src.get("textbook"):
            base_src["textbook"] = part_src["textbook"]
        if not base_src.get("chapterRef") and part_src.get("chapterRef"):
            base_src["chapterRef"] = part_src["chapterRef"]

        part_sections = part_obj.get("sections")
        if not isinstance(part_sections, list) or len(part_sections) == 0:
            raise ValueError(f"{chapter_id} ({src_name}): part has empty or invalid 'sections'")

        for raw_sec in part_sections:
            sec = copy.deepcopy(raw_sec)
            s_id = sec.get("id")
            if isinstance(s_id, str) and s_id in sec_by_id:
                existing_sec = sec_by_id[s_id]
                existing_ids = seen_block_ids_per_sec[s_id]
                if not existing_sec.get("latinTitle") and sec.get("latinTitle"):
                    existing_sec["latinTitle"] = sec["latinTitle"]
                for blk in sec.get("blocks") or []:
                    b_id = blk.get("id")
                    if isinstance(b_id, str) and b_id in existing_ids:
                        candidate = f"{b_id}-p{cur}"
                        suffix_idx = 2
                        while candidate in existing_ids:
                            candidate = f"{b_id}-p{cur}-{suffix_idx}"
                            suffix_idx += 1
                        blk["id"] = candidate
                    if isinstance(blk.get("id"), str):
                        existing_ids.add(blk["id"])
                    existing_sec.setdefault("blocks", []).append(blk)
            else:
                if isinstance(s_id, str):
                    sec_by_id[s_id] = sec
                    seen_block_ids_per_sec[s_id] = {
                        blk["id"] for blk in (sec.get("blocks") or []) if isinstance(blk, dict) and isinstance(blk.get("id"), str)
                    }
                merged_sections.append(sec)

        for item in part_obj.get("cramSummary") or []:
            if isinstance(item, str) and item.strip() and item not in seen_cram:
                seen_cram.add(item)
                merged_cram.append(item)

    if base_src:
        base["source"] = base_src
    base["sections"] = merged_sections
    if merged_cram:
        base["cramSummary"] = merged_cram

    # Canonical top-level key ordering so single-file, split-file, and out-of-order pastes emit identical JS bytes
    canonical_order = [
        "schemaVersion",
        "courseId",
        "chapterId",
        "number",
        "title",
        "shortTitle",
        "latinTitle",
        "source",
        "metrics",
        "capabilities",
        "cramSummary",
        "sections",
    ]
    ordered: dict = {}
    for k in canonical_order:
        if k in base and base[k] is not None:
            ordered[k] = base[k]
    for k in sorted(base.keys()):
        if k not in ordered:
            ordered[k] = base[k]
    return ordered, part_count


def validate_str_list(items, ctx: str, max_len: int | None = None):
    if not isinstance(items, list):
        raise ValueError(f"{ctx}: expected list")
    for idx, item in enumerate(items):
        if not isinstance(item, str) or not item.strip():
            raise ValueError(f"{ctx}[{idx}]: expected non-empty string")
        if max_len is not None and len(item) > max_len:
            if len(item) <= max_len + 230:
                print(
                    f"  [WARN] {ctx}[{idx}]: length {len(item)} slightly exceeds guideline {max_len}"
                )
            else:
                raise ValueError(
                    f"{ctx}[{idx}]: length {len(item)} exceeds hard limit {max_len + 230} (split into micro-paragraphs)"
                )


def _parse_score_range(text: str):
    """Parse numeric score ranges like '8-10' or '6' (including Persian digits); return None for caveats."""
    if not isinstance(text, str):
        return None
    norm = text.translate(ASCII_DIGITS).strip()
    m = re.search(r"(\d+)\s*(?:[–—\-]|تا)\s*(\d+)", norm)
    if m:
        a, b = int(m.group(1)), int(m.group(2))
        return (min(a, b), max(a, b))
    m_single = re.match(r"^\s*(\d+)\b", norm)
    if m_single:
        v = int(m_single.group(1))
        return (v, v)
    return None


def validate_block(block: dict, ctx: str, section_prefix: str, seen_block_ids: set):
    if not isinstance(block, dict):
        raise ValueError(f"{ctx}: block must be an object")
    b_id = block.get("id")
    b_type = block.get("type")
    if not isinstance(b_id, str) or not b_id.strip():
        raise ValueError(f"{ctx}: missing valid 'id'")
    if b_type not in VALID_BLOCK_TYPES:
        raise ValueError(f"{ctx} ({b_id}): invalid block type '{b_type}'")

    stable_id = f"{section_prefix}-{b_id}"
    if stable_id in seen_block_ids:
        raise ValueError(f"{ctx}: duplicate stable blockId '{stable_id}'")
    seen_block_ids.add(stable_id)
    block["blockId"] = stable_id

    if b_type == "prose":
        paragraphs = block.get("paragraphs", [])
        bullets = block.get("bullets", [])
        if not paragraphs and not bullets:
            raise ValueError(f"{ctx} ({b_id}): prose must have paragraphs or bullets")
        if paragraphs:
            validate_str_list(paragraphs, f"{ctx}.paragraphs", max_len=520)
        if bullets:
            validate_str_list(bullets, f"{ctx}.bullets", max_len=520)

    elif b_type == "accordion":
        if not isinstance(block.get("title"), str) or not block["title"].strip():
            raise ValueError(f"{ctx} ({b_id}): accordion missing 'title'")
        raw_variant = block.get("variant")
        variant = str(raw_variant if raw_variant is not None else "deep-dive").strip().replace("_", "-").lower()
        if variant not in VALID_ACCORDION_VARIANTS:
            print(f"  [WARN] {ctx} ({b_id}): unknown accordion variant '{raw_variant}', falling back to 'clinical-note'")
            variant = "clinical-note"
        block["variant"] = variant
        block.setdefault("collapsedByDefault", True)
        nested = block.get("blocks")
        if not isinstance(nested, list) or len(nested) == 0:
            raise ValueError(f"{ctx} ({b_id}): accordion must contain non-empty 'blocks'")
        for idx, nb in enumerate(nested):
            validate_block(nb, f"{ctx}.blocks[{idx}]", section_prefix, seen_block_ids)

    elif b_type == "table":
        cols = block.get("columns")
        rows = block.get("rows")
        if not isinstance(cols, list) or len(cols) < 2:
            raise ValueError(f"{ctx} ({b_id}): table needs >= 2 columns")
        if not isinstance(rows, list) or len(rows) < 1:
            raise ValueError(f"{ctx} ({b_id}): table needs >= 1 row")
        for r_idx, row in enumerate(rows):
            if not isinstance(row, list) or len(row) != len(cols):
                raise ValueError(f"{ctx} ({b_id}).rows[{r_idx}]: column count mismatch ({len(row) if isinstance(row, list) else '?'} != {len(cols)})")

    elif b_type == "pathway":
        if not isinstance(block.get("title"), str) or not block["title"].strip():
            raise ValueError(f"{ctx} ({b_id}): pathway missing 'title'")
        steps = block.get("steps")
        if not isinstance(steps, list) or len(steps) < 1:
            raise ValueError(f"{ctx} ({b_id}): pathway needs >= 1 step")
        for s_idx, st in enumerate(steps):
            if not isinstance(st, dict) or not st.get("label"):
                raise ValueError(f"{ctx} ({b_id}).steps[{s_idx}]: missing 'label'")
            if st.get("tone") and st["tone"] not in VALID_TONES:
                raise ValueError(f"{ctx} ({b_id}).steps[{s_idx}]: invalid tone '{st['tone']}'")
            for br_idx, br in enumerate(st.get("branches") or []):
                if not br.get("condition") or not br.get("action"):
                    raise ValueError(f"{ctx} ({b_id}).steps[{s_idx}].branches[{br_idx}]: missing condition/action")
                if br.get("urgency") and br["urgency"] not in VALID_URGENCIES:
                    raise ValueError(f"{ctx} ({b_id}).steps[{s_idx}].branches[{br_idx}]: invalid urgency")

    elif b_type == "osce_card":
        if not block.get("title") or not block.get("scenario"):
            raise ValueError(f"{ctx} ({b_id}): osce_card requires 'title' and 'scenario'")
        ctg = block.get("ctgNst")
        if ctg is not None:
            for req_k in ("baseline", "variability", "category", "action"):
                if not ctg.get(req_k):
                    raise ValueError(f"{ctx} ({b_id}).ctgNst: missing '{req_k}'")

    elif b_type == "ward_orders":
        if not block.get("title"):
            raise ValueError(f"{ctx} ({b_id}): ward_orders missing 'title'")
        orders = block.get("orders")
        if not isinstance(orders, list) or len(orders) < 1:
            raise ValueError(f"{ctx} ({b_id}): ward_orders needs >= 1 order")
        for o_idx, od in enumerate(orders):
            for req_k in ("category", "drug", "dose", "monitoring"):
                if not od.get(req_k):
                    raise ValueError(f"{ctx} ({b_id}).orders[{o_idx}]: missing '{req_k}'")

    elif b_type == "callout":
        if block.get("kind") not in VALID_CALLOUT_KINDS:
            raise ValueError(f"{ctx} ({b_id}): invalid callout kind '{block.get('kind')}'")
        if not block.get("title") or not block.get("body"):
            raise ValueError(f"{ctx} ({b_id}): callout requires 'title' and 'body'")

    elif b_type == "stat_strip":
        items = block.get("items")
        if not isinstance(items, list) or not (1 <= len(items) <= 6):
            raise ValueError(f"{ctx} ({b_id}): stat_strip needs 1..6 items")
        for i_idx, it in enumerate(items):
            if not it.get("label") or not it.get("value"):
                raise ValueError(f"{ctx} ({b_id}).items[{i_idx}]: missing label/value")

    elif b_type == "gestational_timeline":
        if not block.get("title"):
            raise ValueError(f"{ctx} ({b_id}): gestational_timeline missing 'title'")
        if "nodes" not in block:
            for alias_key in ("milestones", "stages"):
                if isinstance(block.get(alias_key), list):
                    block["nodes"] = block.pop(alias_key)
                    break
        nodes = block.get("nodes")
        if not isinstance(nodes, list) or len(nodes) < 2:
            raise ValueError(f"{ctx} ({b_id}): gestational_timeline needs >= 2 nodes")
        urg_tone_map = {"routine": "info", "urgent": "warning", "critical": "danger"}
        for n_idx, nd in enumerate(nodes):
            if not isinstance(nd, dict):
                raise ValueError(f"{ctx} ({b_id}).nodes[{n_idx}]: node must be an object")
            if not nd.get("id"):
                nd["id"] = f"{b_id}-n{n_idx + 1}"
            if not nd.get("headline"):
                if nd.get("title"):
                    nd["headline"] = nd["title"]
                elif nd.get("label") and nd.get("subtitle"):
                    nd["headline"] = f"{nd['label']} — {nd['subtitle']}"
                elif nd.get("subtitle"):
                    nd["headline"] = nd["subtitle"]
                elif nd.get("label"):
                    nd["headline"] = nd["label"]
            if not nd.get("tone") and nd.get("urgency"):
                nd["tone"] = urg_tone_map.get(str(nd["urgency"]).strip().lower(), "info")
            for req_k in ("id", "label", "headline", "summary"):
                if not nd.get(req_k):
                    raise ValueError(f"{ctx} ({b_id}).nodes[{n_idx}]: missing '{req_k}'")

    elif b_type == "scoring_table":
        if not block.get("title"):
            raise ValueError(f"{ctx} ({b_id}): scoring_table missing 'title'")
        criteria = block.get("criteria")
        if not isinstance(criteria, list) or len(criteria) < 1:
            raise ValueError(f"{ctx} ({b_id}): scoring_table needs >= 1 criterion")
        synth_headers = None
        for c_idx, cr in enumerate(criteria):
            if not isinstance(cr, dict):
                raise ValueError(f"{ctx} ({b_id}).criteria[{c_idx}]: criterion must be an object")
            if not cr.get("id"):
                cr["id"] = f"{b_id}-c{c_idx + 1}"
            if not cr.get("parameter"):
                raise ValueError(f"{ctx} ({b_id}).criteria[{c_idx}]: missing 'parameter'")
            if "options" not in cr and isinstance(cr.get("scores"), list):
                raw_scores = cr.pop("scores")
                mapped_opts = []
                row_headers = []
                for sc in raw_scores:
                    if not isinstance(sc, dict):
                        continue
                    pts = sc.get("points", 0)
                    lbl = (sc.get("description") or sc.get("label") or str(pts)).strip()
                    mapped_opts.append({"points": pts, "label": lbl})
                    hdr = (sc.get("label") or f"{to_persian_digits(pts)} امتیاز").strip()
                    row_headers.append(hdr)
                cr["options"] = mapped_opts
                if synth_headers is None and row_headers:
                    synth_headers = row_headers
            opts = cr.get("options")
            if not isinstance(opts, list) or len(opts) < 2:
                raise ValueError(f"{ctx} ({b_id}).criteria[{c_idx}]: needs >= 2 options")
        if not block.get("columns"):
            if synth_headers:
                block["columns"] = ["شاخص بالینی"] + synth_headers
            else:
                first_opts = criteria[0].get("options") or []
                block["columns"] = ["شاخص بالینی"] + [
                    f"{to_persian_digits(o.get('points', i))} امتیاز"
                    for i, o in enumerate(first_opts)
                ]
        if "interpretations" not in block and isinstance(block.get("interpretation"), list):
            raw_interps = block.pop("interpretation")
            norm_interps = []
            notes = list(block.get("notes") or [])
            for it in raw_interps:
                if not isinstance(it, dict):
                    continue
                rng_text = str(it.get("range") or "").strip()
                if it.get("min") is not None and it.get("max") is not None:
                    parsed_rng = (it["min"], it["max"])
                else:
                    parsed_rng = _parse_score_range(rng_text)
                label_text = (it.get("label") or it.get("meaning") or rng_text).strip()
                action_text = (it.get("action") or "").strip()
                tone = it.get("tone") or "info"
                if parsed_rng is not None:
                    norm_interps.append({
                        "min": parsed_rng[0],
                        "max": parsed_rng[1],
                        "label": label_text,
                        "action": action_text,
                        "tone": tone,
                    })
                else:
                    notes.append({
                        "title": rng_text,
                        "label": label_text,
                        "action": action_text,
                        "tone": tone,
                    })
            block["interpretations"] = norm_interps
            if notes:
                block["notes"] = notes


def count_text_words(val) -> int:
    if isinstance(val, str):
        clean = re.sub(r"[`*=_~]+", " ", val)
        return len([w for w in clean.split() if w.strip()])
    if isinstance(val, list):
        return sum(count_text_words(x) for x in val)
    if isinstance(val, dict):
        skip_keys = {"id", "blockId", "type", "tone", "kind", "urgency", "variant", "cram", "interactive", "collapsedByDefault", "defaultNodeId", "layout", "step", "min", "max", "points", "pill"}
        return sum(count_text_words(v) for k, v in val.items() if k not in skip_keys)
    return 0


def analyze_chapter(chapter: dict):
    """Validate chapter schema, attach stable blockIds, compute 100wpm reading time & capabilities."""
    for req in ("schemaVersion", "courseId", "chapterId", "number", "title", "shortTitle", "source", "sections"):
        if req not in chapter or chapter[req] in (None, ""):
            raise ValueError(f"Chapter missing required field '{req}'")
    if chapter["schemaVersion"] != "2.0":
        raise ValueError(f"Unsupported schemaVersion '{chapter['schemaVersion']}', expected '2.0'")
    if not isinstance(chapter["sections"], list) or len(chapter["sections"]) == 0:
        raise ValueError("Chapter must contain >= 1 section")

    seen_sec_ids = set()
    seen_block_ids = set()
    core_words = 0
    deep_words = 0
    has_cram = bool(chapter.get("cramSummary"))
    has_osce = False
    has_orders = False
    has_interactive = False

    def inspect_block_flags(b: dict, inside_accordion: bool):
        nonlocal core_words, deep_words, has_cram, has_osce, has_orders, has_interactive
        if b.get("cram") is True:
            has_cram = True
        bt = b["type"]
        if bt == "osce_card":
            has_osce = True
        elif bt == "ward_orders":
            has_orders = True
        elif bt in ("gestational_timeline", "scoring_table"):
            has_interactive = True

        if bt == "accordion":
            deep_words += count_text_words(b.get("title", ""))
            for nb in b["blocks"]:
                inspect_block_flags(nb, True)
        else:
            wc = count_text_words(b)
            if inside_accordion:
                deep_words += wc
            else:
                core_words += wc

    for s_idx, sec in enumerate(chapter["sections"]):
        s_id = sec.get("id")
        if not isinstance(s_id, str) or not re.match(r"^[a-z0-9-]+$", s_id):
            raise ValueError(f"sections[{s_idx}]: invalid section id '{s_id}'")
        if s_id in seen_sec_ids:
            raise ValueError(f"Duplicate section id '{s_id}'")
        seen_sec_ids.add(s_id)
        if not sec.get("title"):
            raise ValueError(f"sections[{s_idx}] ({s_id}): missing 'title'")
        blocks = sec.get("blocks")
        if not isinstance(blocks, list) or len(blocks) == 0:
            raise ValueError(f"sections[{s_idx}] ({s_id}): must contain >= 1 block")

        for b_idx, blk in enumerate(blocks):
            validate_block(blk, f"sections[{s_idx}].blocks[{b_idx}]", s_id, seen_block_ids)
            inspect_block_flags(blk, False)

    total_words = core_words + deep_words
    core_min = max(1, math.ceil(core_words / 100))
    deep_min = math.ceil(deep_words / 100) if deep_words > 0 else 0

    if deep_min > 0:
        read_label = f"{to_persian_digits(core_min)} دقیقه مطالعه پایه (+ {to_persian_digits(deep_min)} دقیقه تکمیلی)"
    else:
        read_label = f"{to_persian_digits(core_min)} دقیقه مطالعه بالینی"

    chapter["metrics"] = {
        "autoComputedByCompiler": True,
        "wordCount": total_words,
        "coreWordCount": core_words,
        "deepDiveWordCount": deep_words,
        "coreStudyMinutes": core_min,
        "deepDiveMinutes": deep_min,
        "estimatedReadTime": read_label,
    }
    chapter["capabilities"] = {
        "hasCramMode": has_cram,
        "hasOsceCards": has_osce,
        "hasWardOrders": has_orders,
        "hasInteractiveBlocks": has_interactive,
    }


def raw_deflate_b64(text: str) -> str:
    compressor = zlib.compressobj(level=9, wbits=-15)
    compressed = compressor.compress(text.encode("utf-8")) + compressor.flush()
    return base64.b64encode(compressed).decode("ascii")


def compile_course(course_id: str, input_dir: Path, output_dir: Path, run_search_builder: bool = True):
    if not input_dir.exists():
        raise FileNotFoundError(f"Input directory not found: {input_dir}")

    input_files = sorted(
        list(input_dir.glob("*.json")) + list(input_dir.glob("*.txt")),
        key=lambda p: p.name.lower(),
    )
    if not input_files:
        raise RuntimeError(f"No .json or .txt chapter files found in {input_dir}")

    output_dir.mkdir(parents=True, exist_ok=True)
    grouped_parts: dict[str, list[tuple[int, int, str, dict]]] = {}

    for f_idx, fp in enumerate(input_files):
        raw_text = fp.read_text(encoding="utf-8")
        extracted = extract_json_objects(raw_text, fp.name)
        for o_idx, obj in enumerate(extracted):
            if obj.get("courseId") != course_id:
                raise ValueError(
                    f"{fp.name}[{o_idx}]: courseId '{obj.get('courseId')}' does not match --course '{course_id}'"
                )
            ch_id = obj.get("chapterId")
            if not isinstance(ch_id, str) or not ch_id.strip():
                raise ValueError(f"{fp.name}[{o_idx}]: missing 'chapterId'")
            grouped_parts.setdefault(ch_id, []).append((f_idx, o_idx, fp.name, obj))

    chapters = []
    part_counts: dict[str, int] = {}
    for ch_id, records in grouped_parts.items():
        merged_ch, p_cnt = merge_chapter_parts(ch_id, records)
        analyze_chapter(merged_ch)
        chapters.append(merged_ch)
        part_counts[ch_id] = p_cnt

    chapters.sort(key=lambda c: (int(c["number"]), c["chapterId"]))

    index_entries = []
    for ch in chapters:
        ch_id = ch["chapterId"]
        serialized = json.dumps(ch, ensure_ascii=False, separators=(",", ":"))
        chunk_filename = f"{ch_id}.js"
        chunk_path = output_dir / chunk_filename

        if len(serialized.encode("utf-8")) > RAW_DEFLATE_THRESHOLD_BYTES:
            b64 = raw_deflate_b64(serialized)
            js_content = (
                "/* Medicalism V2 Pre-Compiled Compressed Chapter (<100KB) */\n"
                "window.__MEDICALISM_V2_CACHE = window.__MEDICALISM_V2_CACHE || {};\n"
                f'window.__MEDICALISM_V2_CACHE["{ch_id}"] = window.__decodeV2Payload("{b64}");\n'
            )
            mode_tag = "deflate"
        else:
            js_content = (
                "/* Medicalism V2 Native Chapter Chunk */\n"
                "window.__MEDICALISM_V2_CACHE = window.__MEDICALISM_V2_CACHE || {};\n"
                f'window.__MEDICALISM_V2_CACHE["{ch_id}"] = {serialized};\n'
            )
            mode_tag = "raw-json"

        chunk_path.write_text(js_content, encoding="utf-8")
        chunk_kb = chunk_path.stat().st_size / 1024.0
        if chunk_kb > 100.0:
            raise RuntimeError(
                f"Chunk {chunk_path} is {chunk_kb:.2f} KB, exceeding strict 100 KB mobile chunk budget!"
            )

        p_note = f", parts={part_counts[ch_id]}" if part_counts.get(ch_id, 1) > 1 else ""
        print(
            f"  [OK] {ch_id:16} -> {chunk_path.as_posix():32} ({chunk_kb:5.2f} KB, {mode_tag}{p_note}) | "
            f"{ch['metrics']['wordCount']} words -> {ch['metrics']['coreStudyMinutes']}m+{ch['metrics']['deepDiveMinutes']}m | "
            f"cram={ch['capabilities']['hasCramMode']}"
        )

        # Build lightweight index entry (zero block bodies)
        sec_summaries = []
        for s in ch["sections"]:
            sec_summaries.append({
                "id": s["id"],
                "title": s["title"],
                "latinTitle": s.get("latinTitle", ""),
                "badge": s.get("badge", ""),
                "blockCount": len(s["blocks"]),
            })

        # Relative path from web root
        rel_data_file = "./" + chunk_path.as_posix().lstrip("./")
        index_entries.append({
            "id": ch_id,
            "chapterId": ch_id,
            "courseId": course_id,
            "number": ch["number"],
            "title": ch["title"],
            "shortTitle": ch["shortTitle"],
            "latinTitle": ch.get("latinTitle", ""),
            "source": ch["source"],
            "metrics": ch["metrics"],
            "estimatedReadTime": ch["metrics"]["estimatedReadTime"],
            "capabilities": ch["capabilities"],
            "totalSections": len(sec_summaries),
            "sections": sec_summaries,
            "dataFile": rel_data_file,
        })

    index_path = output_dir / "index.js"
    index_json = json.dumps(index_entries, ensure_ascii=False, separators=(",", ":"))
    index_js = (
        f"/* Medicalism V2 Course Index ({course_id}) - Lightweight TOC Only */\n"
        "window.MEDICALISM_V2_INDEX = window.MEDICALISM_V2_INDEX || {};\n"
        f'window.MEDICALISM_V2_INDEX["{course_id}"] = {index_json};\n'
    )
    index_path.write_text(index_js, encoding="utf-8")
    index_kb = index_path.stat().st_size / 1024.0
    print(f"  [INDEX] {index_path.as_posix()} ({index_kb:.2f} KB, {len(index_entries)} chapters)")

    search_script = Path(__file__).parent / "build_global_search_index.py"
    if run_search_builder and search_script.exists():
        subprocess.run([sys.executable, str(search_script)], check=True)


def main():
    parser = argparse.ArgumentParser(description="Compile Medicalism V2 JSON chapters into chunked JS data.")
    parser.add_argument("--course", default="obgyn", help="Course ID (e.g. obgyn, pediatrics)")
    parser.add_argument("--input", default="content/v2/obgyn", help="Directory containing raw chapter .json files")
    parser.add_argument("--output", default="data/obgyn", help="Output directory for compiled .js chunks + index.js")
    parser.add_argument("--no-search-index", action="store_true", help="Skip rebuilding global-search-index.js")
    args = parser.parse_args()

    compile_course(
        course_id=args.course,
        input_dir=Path(args.input),
        output_dir=Path(args.output),
        run_search_builder=not args.no_search_index,
    )


if __name__ == "__main__":
    main()
