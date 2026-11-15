#!/usr/bin/env python3
"""
100% Verbatim Parser for Exam F.md -> Recent Surgery Recall Questions & Self-Sufficient Lawrence Mini-Lessons.
Preserves exact 1-to-N sequential order, all tables, bullet points, key-verification alerts, and math expressions.
Never modifies localStorage or existing quizzes.
"""

import json
import os
import re
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_MD = os.path.join(BASE_DIR, "Exam F.md")
OUTPUT_JSON = os.path.join(BASE_DIR, "data", "quizzes", "surgery_recent_recalls_quiz.json")
OUTPUT_JS = os.path.join(BASE_DIR, "data", "quizzes", "surgery_recent_recalls_data.js")

PERSIAN_TO_EN = str.maketrans("۰۱۲۳۴۵۶۷۸۹", "0123456789")


def clean_block_end(text: str) -> str:
    """Remove only trailing markdown separator '---' at the end of a question block."""
    if not text:
        return ""
    s = text.strip()
    s = re.sub(r'(?:\r?\n)+\s*---\s*$', '', s).strip()
    return s


def extract_mc_letter(ans_text: str, valid_keys: list) -> str:
    """Extract the correct option letter (A/B/C/D) from a multiple-choice answer line."""
    patterns = [
        r'گزینه\s*\*\*([A-D])\b',
        r'گزینه\s+([A-D])\b',
        r'\*\*([A-D])\)',
        r'\*\*([A-D])\*\*',
        r'\*\*گزینه\s+([A-D])\b',
        r'[-–—]\s*گزینه\s+([A-D])\b',
    ]
    for pat in patterns:
        m = re.search(pat, ans_text)
        if m and m.group(1) in valid_keys:
            return m.group(1)
    # Fallback: check any standalone A-D inside valid_keys
    for pat in [r'\*\*([A-D])\b', r'\b([A-D])\b']:
        m = re.search(pat, ans_text)
        if m and m.group(1) in valid_keys:
            return m.group(1)
    return ""


def parse_exam_markdown(raw_text: str):
    # Strip only the 1-line progress footers between batches if present
    cleaned_lines = [
        line for line in raw_text.splitlines()
        if not re.match(r'^\s*📊\s*وضعیت پیشرفت:.*$', line)
    ]
    text = "\n".join(cleaned_lines)

    # Split verbatim on "## سوال " headings
    blocks = [
        b for b in re.split(r'(?=^## سوال )', text, flags=re.MULTILINE)
        if b.strip().startswith("## سوال ")
    ]

    questions = []
    for idx, block in enumerate(blocks, 1):
        lines = block.splitlines()
        header_line = lines[0].lstrip("#").strip()

        m_num = re.match(r'^سوال\s+([۰-۹\d]+)\s*(.*)$', header_line)
        if not m_num:
            raise ValueError(f"Block {idx} header mismatch: {header_line}")

        parsed_num = int(m_num.group(1).translate(PERSIAN_TO_EN))
        if parsed_num != idx:
            raise ValueError(f"Sequential numbering mismatch: expected {idx}, got {parsed_num}")

        source_badge = m_num.group(2).strip()
        is_frequent = ("پرتکرار" in source_badge) or ("🔥" in source_badge)

        # Extract core metadata markers in strict order
        m_type = re.search(r'^\*\*نوع سوال:\*\*\s*(.+)$', block, flags=re.MULTILINE)
        m_topic = re.search(r'^\*\*مبحث و فصل مرتبط در لارنس:\*\*\s*(.+)$', block, flags=re.MULTILINE)
        if not m_type or not m_topic:
            raise ValueError(f"Question {idx} missing نوع سوال or مبحث")

        qtype_raw = m_type.group(1).strip()
        topic = m_topic.group(1).strip()

        # Locate positions of Stem -> Options (optional) -> Correct Answer -> Key Verification -> Explanations
        pos_stem_hdr = block.find("**صورت سوال:**")
        pos_opts_hdr = block.find("**گزینه‌ها:**")
        pos_ans_hdr = block.find("**پاسخ صحیح:**")
        pos_key_hdr = block.find("**بررسی صحت کلید منبع:**")
        pos_exp_hdr = block.find("### پاسخ تشریحی و درسنامه لارنس")

        if min(pos_stem_hdr, pos_ans_hdr, pos_key_hdr, pos_exp_hdr) == -1:
            raise ValueError(f"Question {idx} missing one of required section markers")

        stem_start = pos_stem_hdr + len("**صورت سوال:**")
        stem_end = pos_opts_hdr if pos_opts_hdr != -1 else pos_ans_hdr
        stem = block[stem_start:stem_end].strip()

        options = []
        if pos_opts_hdr != -1:
            opts_start = pos_opts_hdr + len("**گزینه‌ها:**")
            opts_raw = block[opts_start:pos_ans_hdr].strip()
            for opt_line in opts_raw.splitlines():
                m_opt = re.match(r'^-\s*\*\*([A-D])\)\*\*\s*(.+)$', opt_line.strip())
                if m_opt:
                    options.append({
                        "key": m_opt.group(1),
                        "text": m_opt.group(2).strip(),
                        "is_correct": False
                    })

        ans_start = pos_ans_hdr + len("**پاسخ صحیح:**")
        correct_answer_text = block[ans_start:pos_key_hdr].strip()

        key_start = pos_key_hdr + len("**بررسی صحت کلید منبع:**")
        key_verification = block[key_start:pos_exp_hdr].strip()
        key_verification_status = (
            "discrepancy" if ("⚠️" in key_verification or "هشدار" in key_verification) else "verified"
        )

        # Short-answer vs Multiple-choice
        is_short_answer = (len(options) == 0)
        correct_letter = None
        if not is_short_answer:
            valid_keys = [o["key"] for o in options]
            correct_letter = extract_mc_letter(correct_answer_text, valid_keys)
            if not correct_letter:
                raise ValueError(f"Q{idx} has {len(options)} options {valid_keys} but failed to extract correct letter from: {correct_answer_text}")
            for o in options:
                o["is_correct"] = (o["key"] == correct_letter)

        # Extract 3 explanation cards 100% verbatim
        exp_block = block[pos_exp_hdr + len("### پاسخ تشریحی و درسنامه لارنس"):]
        m_s1 = re.search(r'^####\s*(۱\..+)$', exp_block, flags=re.MULTILINE)
        m_s2 = re.search(r'^####\s*(۲\..+)$', exp_block, flags=re.MULTILINE)
        m_s3 = re.search(r'^####\s*(۳\..+)$', exp_block, flags=re.MULTILINE)

        if not (m_s1 and m_s2 and m_s3):
            raise ValueError(f"Q{idx} missing one of the 3 explanation headers (#### ۱/۲/۳)")

        sec1_title = m_s1.group(1).strip()
        sec1_body = exp_block[m_s1.end():m_s2.start()].strip()

        sec2_title = m_s2.group(1).strip()
        sec2_body = exp_block[m_s2.end():m_s3.start()].strip()

        sec3_title = m_s3.group(1).strip()
        sec3_body = clean_block_end(exp_block[m_s3.end():])

        if not (stem and correct_answer_text and key_verification and sec1_body and sec2_body and sec3_body):
            raise ValueError(f"Q{idx} has an empty required text field")

        questions.append({
            "id": f"surg_recent_q{idx:03d}",
            "globalId": f"surg_recent_q{idx:03d}",
            "chapterId": "surgery-recent-recalls",
            "number": idx,
            "header_title": header_line,
            "source_badge": source_badge,
            "is_frequent": is_frequent,
            "question_type": qtype_raw,
            "is_short_answer": is_short_answer,
            "topic": topic,
            "stem": stem,
            "options": options,
            "correct_answer": correct_letter,
            "correct_answer_text": correct_answer_text,
            "key_verification": key_verification,
            "key_verification_status": key_verification_status,
            "detailed_explanation": {
                "rationale_title": sec1_title,
                "rationale": sec1_body,
                "distractors_title": sec2_title,
                "distractors_markdown": sec2_body,
                "distractors_correction": [],
                "mini_lesson_title": sec3_title,
                "mini_lesson": sec3_body,
            },
        })

    return questions


def main():
    if not os.path.exists(SOURCE_MD):
        print(f"ERROR: Source markdown not found at {SOURCE_MD}", file=sys.stderr)
        sys.exit(1)

    with open(SOURCE_MD, "r", encoding="utf-8") as f:
        raw_text = f.read()

    questions = parse_exam_markdown(raw_text)
    mc_count = sum(1 for q in questions if not q["is_short_answer"])
    sa_count = sum(1 for q in questions if q["is_short_answer"])
    disc_count = sum(1 for q in questions if q["key_verification_status"] == "discrepancy")
    ver_count = sum(1 for q in questions if q["key_verification_status"] == "verified")
    freq_count = sum(1 for q in questions if q["is_frequent"])

    os.makedirs(os.path.dirname(OUTPUT_JSON), exist_ok=True)

    payload = {
        "id": "surgery-recent-recalls",
        "title": "🔥 بانک سوالات اخیر و پرتکرار جراحی (تحلیل کلیدها + درسنامه جامع لارنس)",
        "totalQuestions": len(questions),
        "mcCount": mc_count,
        "shortAnswerCount": sa_count,
        "discrepancyCount": disc_count,
        "verifiedCount": ver_count,
        "frequentCount": freq_count,
        "questions": questions,
    }

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, separators=(",", ":"))

    with open(OUTPUT_JS, "w", encoding="utf-8") as f:
        f.write("window.SURGERY_RECENT_RECALLS_DATA=")
        json.dump(questions, f, ensure_ascii=False, separators=(",", ":"))
        f.write(";\n")

    json_kb = os.path.getsize(OUTPUT_JSON) / 1024
    js_kb = os.path.getsize(OUTPUT_JS) / 1024

    print(f"Successfully parsed {len(questions)} questions verbatim from Exam F.md!")
    print(f"  - Multiple-choice (with 2/3/4 options): {mc_count}")
    print(f"  - Short-answer (reveal button mode):   {sa_count}")
    print(f"  - Key discrepancies (⚠️ alerts):       {disc_count}")
    print(f"  - Verified keys (✅ badges):           {ver_count}")
    print(f"  - High-frequency (🔥 پرتکرار):          {freq_count}")
    print(f"  - Output JSON: {OUTPUT_JSON} ({json_kb:.1f} KB)")
    print(f"  - Output JS:   {OUTPUT_JS} ({js_kb:.1f} KB)")


if __name__ == "__main__":
    main()
