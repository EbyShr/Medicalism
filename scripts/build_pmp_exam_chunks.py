# -*- coding: utf-8 -*-
"""
Medicalism Alborz - PMP Surgery Exam Data Extractor & Sharder
Extracts all 46 PMP cases, scoring config, grading keys, and 42 embedded clinical images
from EXAM_P34_user_ultrasound_P41-P46_user_images_embedded.html without loading monoliths
in the browser.

Outputs:
1. assets/pmp/*.jpg (or .png/.webp)   - extracted clinical images (lazy-loaded per stage)
2. js/pmp-exam-index.js (< 50 KB)    - lightweight case metadata + cfg (instant startup)
3. data/pmp/pmp-chunk-0.js ... (< 100 KB each) - on-demand case + grading-key bundles
"""

import base64
import json
import os
import re
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_HTML = os.path.join(BASE_DIR, "EXAM_P34_user_ultrasound_P41-P46_user_images_embedded.html")
ASSETS_DIR = os.path.join(BASE_DIR, "assets", "pmp")
CHUNKS_DIR = os.path.join(BASE_DIR, "data", "pmp")
INDEX_OUT = os.path.join(BASE_DIR, "js", "pmp-exam-index.js")

MAX_CHUNK_BYTES = 95 * 1024  # Keep every chunk comfortably under 100 KB


def extract_embedded_image(data_uri, case_id, img_counter):
    m = re.match(r"^data:image/([a-zA-Z0-9+.-]+);base64,([A-Za-z0-9+/=\s]+)$", data_uri.strip())
    if not m:
        return data_uri
    fmt = m.group(1).lower()
    ext = "jpg" if fmt in ("jpeg", "jpg") else fmt.replace("+xml", "")
    raw_bytes = base64.b64decode(m.group(2))
    fname = f"{case_id}-img-{img_counter:02d}.{ext}"
    out_path = os.path.join(ASSETS_DIR, fname)
    with open(out_path, "wb") as f:
        f.write(raw_bytes)
    return f"./assets/pmp/{fname}"


def rewrite_case_images(case_obj):
    cid = case_obj["caseId"]
    img_idx = 0

    def walk(node):
        nonlocal img_idx
        if isinstance(node, dict):
            for k, v in list(node.items()):
                if isinstance(v, str) and v.startswith("data:image/"):
                    img_idx += 1
                    node[k] = extract_embedded_image(v, cid, img_idx)
                else:
                    walk(v)
        elif isinstance(node, list):
            for idx, item in enumerate(node):
                if isinstance(item, str) and item.startswith("data:image/"):
                    img_idx += 1
                    node[idx] = extract_embedded_image(item, cid, img_idx)
                else:
                    walk(item)

    walk(case_obj)
    return img_idx


def main():
    if not os.path.exists(SOURCE_HTML):
        raise FileNotFoundError(f"Source HTML not found: {SOURCE_HTML}")

    os.makedirs(ASSETS_DIR, exist_ok=True)
    os.makedirs(CHUNKS_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(INDEX_OUT), exist_ok=True)

    # Clear old chunk files before rebuilding
    for old_name in os.listdir(CHUNKS_DIR):
        if old_name.startswith("pmp-chunk-") and old_name.endswith(".js"):
            os.remove(os.path.join(CHUNKS_DIR, old_name))

    with open(SOURCE_HTML, "r", encoding="utf-8") as f:
        html_text = f.read()

    m_data = re.search(r'<script id="pmp-data" type="application/json">(.*?)</script>', html_text, re.S)
    m_keys = re.search(r'<script id="pmp-keys" type="application/json">(.*?)</script>', html_text, re.S)
    if not m_data or not m_keys:
        raise ValueError("Could not locate #pmp-data or #pmp-keys JSON payloads.")

    raw_data = json.loads(m_data.group(1))
    raw_keys = json.loads(m_keys.group(1))
    cases = raw_data.get("cases", [])
    cfg = raw_data.get("cfg", {})

    total_imgs = 0
    case_records = []

    for c in cases:
        cid = c["caseId"]
        extracted = rewrite_case_images(c)
        total_imgs += extracted
        if cid not in raw_keys:
            raise KeyError(f"Missing grading key for case {cid}")
        key_obj = raw_keys[cid]
        # Estimate combined JSON byte size for chunk packing
        combo = json.dumps({"c": c, "k": key_obj}, ensure_ascii=False, separators=(",", ":"))
        case_records.append((c, key_obj, len(combo.encode("utf-8"))))

    # Greedy pack cases into balanced chunks strictly < MAX_CHUNK_BYTES
    chunks = []
    cur_cases = []
    cur_keys = {}
    cur_bytes = 256

    for c, key_obj, est_bytes in case_records:
        if cur_cases and (cur_bytes + est_bytes > MAX_CHUNK_BYTES):
            chunks.append({"cases": cur_cases, "keys": cur_keys})
            cur_cases = []
            cur_keys = {}
            cur_bytes = 256
        cur_cases.append(c)
        cur_keys[c["caseId"]] = key_obj
        cur_bytes += est_bytes

    if cur_cases:
        chunks.append({"cases": cur_cases, "keys": cur_keys})

    # Write chunk JS files and map each caseId -> chunkId
    case_to_chunk = {}
    max_chunk_kb = 0.0

    for chunk_id, payload in enumerate(chunks):
        for c in payload["cases"]:
            case_to_chunk[c["caseId"]] = chunk_id

        out_path = os.path.join(CHUNKS_DIR, f"pmp-chunk-{chunk_id}.js")
        js_body = (
            "window.__PMP_CHUNK_CACHE = window.__PMP_CHUNK_CACHE || {};\n"
            f'window.__PMP_CHUNK_CACHE["{chunk_id}"] = '
            + json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
            + ";\n"
        )
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(js_body)

        kb = os.path.getsize(out_path) / 1024.0
        if kb > max_chunk_kb:
            max_chunk_kb = kb
        cids = [c["caseId"] for c in payload["cases"]]
        print(f"  pmp-chunk-{chunk_id:02d}.js ({cids[0]}..{cids[-1]}, {len(cids)} cases): {kb:6.2f} KB")
        assert kb < 120.0, f"pmp-chunk-{chunk_id}.js exceeded 120 KB limit ({kb:.2f} KB)"

    # Build lightweight Master Index (< 50 KB) with zero clinical prose/keys
    topic_counts = {}
    index_cases = []
    total_stages = 0

    for idx, c in enumerate(cases):
        cid = c["caseId"]
        chunk_id = case_to_chunk[cid]
        for t in c.get("topics", []):
            topic_counts[t] = topic_counts.get(t, 0) + 1

        sorted_stages = sorted(c.get("stages", []), key=lambda s: s.get("seq", 0))
        stages_meta = []
        case_has_img = False
        for s in sorted_stages:
            total_stages += 1
            has_att_img = any(a.get("kind") == "image" for a in s.get("attachments", []))
            has_media = len(s.get("attachments", [])) > 0
            if has_att_img:
                case_has_img = True
            meta = {
                "itemId": s["itemId"],
                "seq": s["seq"],
                "format": s.get("format", "multi_response"),
                "phase": s.get("phase", ""),
                "topic": s.get("topic", ""),
                "next": s.get("next", None),
            }
            if s.get("branches"):
                meta["branches"] = s["branches"]
            if has_media:
                meta["hasMedia"] = True
            stages_meta.append(meta)

        index_cases.append({
            "caseId": cid,
            "order": idx,
            "title": c.get("title", ""),
            "topics": c.get("topics", []),
            "patient": c.get("patient", {}),
            "chunkId": str(chunk_id),
            "chunkFile": f"./data/pmp/pmp-chunk-{chunk_id}.js",
            "stageCount": len(stages_meta),
            "hasImages": case_has_img,
            "stagesMeta": stages_meta,
        })

    index_obj = {
        "cfg": cfg,
        "totalCases": len(index_cases),
        "totalStages": total_stages,
        "chunkCount": len(chunks),
        "topicCounts": topic_counts,
        "cases": index_cases,
    }

    index_js = (
        "/* Lightweight PMP Surgery Exam Master Index (Zero case prose/keys/images) */\n"
        "window.PMP_EXAM_INDEX = "
        + json.dumps(index_obj, ensure_ascii=False, separators=(",", ":"))
        + ";\n"
    )
    with open(INDEX_OUT, "w", encoding="utf-8") as f:
        f.write(index_js)

    index_kb = os.path.getsize(INDEX_OUT) / 1024.0
    print("\n=== PMP BUILD SUMMARY ===")
    print(f"Total cases extracted : {len(index_cases)}")
    print(f"Total stages indexed  : {total_stages}")
    print(f"Images saved to disk  : {total_imgs} files in assets/pmp/")
    print(f"js/pmp-exam-index.js  : {index_kb:.2f} KB (limit < 50 KB)")
    print(f"Total data chunks     : {len(chunks)}")
    print(f"Max pmp-chunk-X.js    : {max_chunk_kb:.2f} KB (limit < 120 KB)")

    assert index_kb < 50.0, f"js/pmp-exam-index.js exceeded 50 KB limit ({index_kb:.2f} KB)"
    print("SUCCESS: All PMP index & chunk budgets satisfied!")


if __name__ == "__main__":
    main()
