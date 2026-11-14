# -*- coding: utf-8 -*-
"""
Medicalism Alborz - Fast Surgery Bundle Splitter & Pre-Compiler
Splits the monolithic 11.5 MB surgery registry into:
1. Lightweight index file: js/surgery-index.js (< 30 KB, zero body HTML)
2. Individual chapter payloads: data/surgery/chapter-0.js .. chapter-N.js (< 150 KB each)
"""

import base64
import json
import os
import re
import sys
import zlib

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_REGISTRY_JS = os.path.join(BASE_DIR, "js", "data", "surgery-registry.js")
INDEX_OUT_JS = os.path.join(BASE_DIR, "js", "surgery-index.js")
CHAPTERS_OUT_DIR = os.path.join(BASE_DIR, "data", "surgery")


def load_split_chapters():
    """Fallback loader when monolithic surgery-registry.js has been removed."""
    if not os.path.isdir(CHAPTERS_OUT_DIR):
        return []
    files = []
    for name in os.listdir(CHAPTERS_OUT_DIR):
        m = re.match(r"^chapter-(\d+)\.js$", name)
        if m:
            files.append((int(m.group(1)), os.path.join(CHAPTERS_OUT_DIR, name)))
    files.sort(key=lambda pair: pair[0])

    chapters = []
    for _, fpath in files:
        with open(fpath, "r", encoding="utf-8") as f:
            text = f.read()
        m = re.search(r'__decodeSurgeryPayload\("([^"]+)"\)', text)
        if not m:
            raise ValueError(f"Could not decode split payload in {fpath}")
        raw_bytes = zlib.decompress(base64.b64decode(m.group(1)), -zlib.MAX_WBITS)
        chapters.append(json.loads(raw_bytes.decode("utf-8")))
    return chapters


def load_source_chapters():
    if os.path.exists(SOURCE_REGISTRY_JS):
        with open(SOURCE_REGISTRY_JS, "r", encoding="utf-8") as f:
            raw = f.read()
        start = raw.find("[")
        if start == -1:
            raise ValueError("Could not locate JSON array in surgery-registry.js")
        payload = raw[start:].strip()
        if payload.endswith(";"):
            payload = payload[:-1].strip()
        data = json.loads(payload)
        if isinstance(data, dict) and "chapters" in data:
            data = data["chapters"]
        if not isinstance(data, list) or len(data) == 0:
            raise ValueError("Parsed surgery chapters array is empty")
        return data

    split_data = load_split_chapters()
    if not split_data:
        raise FileNotFoundError(
            f"Missing both {SOURCE_REGISTRY_JS} and split files in {CHAPTERS_OUT_DIR}"
        )
    return split_data


def clean_html(html_str):
    if not html_str:
        return ""
    # Collapse redundant blank lines while preserving inline spacing
    cleaned = re.sub(r"\r\n?", "\n", html_str)
    cleaned = re.sub(r"\n[ \t]*\n+", "\n", cleaned)
    return cleaned.strip()


def build_index_entry(ch, idx):
    sections_stub = []
    for sec in ch.get("sections", []):
        stub = {
            "id": sec.get("id", ""),
            "title": sec.get("title", ""),
        }
        if sec.get("badge"):
            stub["badge"] = sec["badge"]
        if sec.get("guideIndex") is not None:
            stub["guideIndex"] = sec["guideIndex"]
        sections_stub.append(stub)

    entry = {
        "id": ch.get("id", f"surg-ch-{idx}"),
        "courseId": "surgery",
        "number": ch.get("number", idx),
        "category": "exam" if (ch.get("isExam") or ch.get("isFlagship")) else "lawrence",
        "title": ch.get("title", ""),
        "shortTitle": ch.get("shortTitle", ch.get("title", "")),
        "author": ch.get("author", ""),
        "totalSections": ch.get("totalSections", len(sections_stub)),
        "estimatedReadTime": ch.get("estimatedReadTime", ""),
        "dataFile": f"./data/surgery/chapter-{idx}.js",
        "sections": sections_stub,
    }
    if ch.get("isFlagship"):
        entry["isFlagship"] = True
    if ch.get("isExam"):
        entry["isExam"] = True
    return entry


def build_chapter_payload(ch):
    clean_sections = []
    for sec in ch.get("sections", []):
        sec_obj = {
            "id": sec.get("id", ""),
            "title": sec.get("title", ""),
            "contentHtml": clean_html(sec.get("contentHtml", "")),
        }
        if sec.get("latinTitle"):
            sec_obj["latinTitle"] = sec["latinTitle"]
        if sec.get("badge"):
            sec_obj["badge"] = sec["badge"]
        if sec.get("guideIndex") is not None:
            sec_obj["guideIndex"] = sec["guideIndex"]
        if sec.get("guideTitle"):
            sec_obj["guideTitle"] = sec["guideTitle"]
        if sec.get("number") is not None:
            sec_obj["number"] = sec["number"]
        clean_sections.append(sec_obj)

    payload = {
        "id": ch.get("id", ""),
        "slug": ch.get("slug", ""),
        "courseId": "surgery",
        "number": ch.get("number", 0),
        "title": ch.get("title", ""),
        "shortTitle": ch.get("shortTitle", ""),
        "latinTitle": ch.get("latinTitle", ""),
        "author": ch.get("author", ""),
        "authorAffiliation": ch.get("authorAffiliation", ""),
        "totalSections": ch.get("totalSections", len(clean_sections)),
        "estimatedReadTime": ch.get("estimatedReadTime", ""),
        "mindMapHtml": clean_html(ch.get("mindMapHtml", "")),
        "sections": clean_sections,
    }
    if ch.get("isFlagship"):
        payload["isFlagship"] = True
    if ch.get("isExam"):
        payload["isExam"] = True
    if ch.get("badgeText"):
        payload["badgeText"] = ch["badgeText"]
    if ch.get("examSummaryHtml"):
        payload["examSummaryHtml"] = clean_html(ch["examSummaryHtml"])
    return payload


def compress_payload_b64(obj):
    raw_json = json.dumps(obj, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    # RFC 1951 raw deflate stream (strip 2-byte zlib header and 4-byte adler32 trailer)
    compressed = zlib.compress(raw_json, level=9)[2:-4]
    return base64.b64encode(compressed).decode("ascii")


def main():
    os.makedirs(CHAPTERS_OUT_DIR, exist_ok=True)
    chapters = load_source_chapters()

    index_entries = []
    max_chapter_kb = 0.0

    for idx, ch in enumerate(chapters):
        index_entries.append(build_index_entry(ch, idx))
        payload_obj = build_chapter_payload(ch)
        b64_payload = compress_payload_b64(payload_obj)

        out_path = os.path.join(CHAPTERS_OUT_DIR, f"chapter-{idx}.js")
        ch_id_json = json.dumps(ch["id"], ensure_ascii=False)
        js_code = (
            "window.__SURGERY_CACHE = window.__SURGERY_CACHE || {};\n"
            f'window.__SURGERY_CACHE[{ch_id_json}] = window.__decodeSurgeryPayload("{b64_payload}");\n'
        )
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(js_code)

        size_kb = os.path.getsize(out_path) / 1024.0
        if size_kb > max_chapter_kb:
            max_chapter_kb = size_kb
        print(f"  chapter-{idx:02d}.js ({ch['id']}): {size_kb:6.2f} KB")
        assert size_kb < 150.0, f"chapter-{idx}.js exceeded 150 KB limit: {size_kb:.2f} KB"

    index_b64 = compress_payload_b64(index_entries)
    index_js = (
        "/* Lightweight Surgery Chapter Index (Zero body HTML) */\n"
        f'window.SURGERY_INDEX = window.__decodeSurgeryPayload("{index_b64}");\n'
        "window.SURGERY_REGISTRY = window.SURGERY_INDEX;\n"
    )
    with open(INDEX_OUT_JS, "w", encoding="utf-8") as f:
        f.write(index_js)

    index_kb = os.path.getsize(INDEX_OUT_JS) / 1024.0
    surgery_html_kb = os.path.getsize(os.path.join(BASE_DIR, "surgery.html")) / 1024.0
    ch0_kb = os.path.getsize(os.path.join(CHAPTERS_OUT_DIR, "chapter-0.js")) / 1024.0
    combined_kb = surgery_html_kb + index_kb + ch0_kb

    print("\n=== BUILD SUMMARY ===")
    print(f"Total chapters split : {len(chapters)}")
    print(f"js/surgery-index.js  : {index_kb:.2f} KB (limit < 30 KB)")
    print(f"Max chapter-X.js     : {max_chapter_kb:.2f} KB (limit < 150 KB)")
    print(f"surgery.html         : {surgery_html_kb:.2f} KB")
    print(f"data/surgery/ch-0.js : {ch0_kb:.2f} KB")
    print(f"Combined initial     : {combined_kb:.2f} KB (limit < 200 KB)")

    assert index_kb < 30.0, f"surgery-index.js exceeded 30 KB: {index_kb:.2f} KB"
    assert combined_kb < 200.0, f"Combined initial size exceeded 200 KB: {combined_kb:.2f} KB"
    print("SUCCESS: All size budgets satisfied!")


if __name__ == "__main__":
    main()
