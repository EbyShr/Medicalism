#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
sys.path.insert(0, '.')
import json
import glob
import re
import os
import shutil

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_QUIZZES_DIR = os.path.join(BASE_DIR, "data", "quizzes")
SURGERY_MD_DIR = os.path.join(BASE_DIR, "data", "surgery_quizzes")
CHAPTERS_SURGERY_QUIZZES_DIR = os.path.join(BASE_DIR, "chapters", "Surgery", "quizzes")
SURGERY_MANIFEST_PATH = os.path.join(DATA_QUIZZES_DIR, "surgery_manifest.json")
QUIZ_REGISTRY_JS_PATH = os.path.join(BASE_DIR, "js", "data", "quiz-registry.js")
QUIZ_HTML_PATH = os.path.join(BASE_DIR, "quiz.html")
INDEX_HTML_PATH = os.path.join(BASE_DIR, "index.html")

CHAPTER_PREFIX_MAP = {
    "abdominal_wall_and_hernia": "surg_hernia",
    "biliary_tract_and_gallbladder": "surg_biliary",
    "fluid_and_electrolytes": "surg_fluids",
    "liver_and_spleen": "surg_liver",
    "pancreas": "surg_pancreas",
    "perioperative_care": "surg_periop",
    "shock_and_resuscitation": "surg_shock",
    "stomach_and_duodenum": "surg_stomach",
    "wound_healing_and_trauma": "surg_wound",
    "vascular_and_oncology": "surg_vasc",
    "surgical_bleeding_and_transfusion": "surg_bleed",
    "esophagus": "surg_esoph",
    "small_intestine": "surg_intest",
    "burns": "surg_burns",
    "surgical_endocrinology": "surg_endo",
    "surgical_infections": "surg_infect",
    "neurosurgery": "surg_neuro",
    "trauma": "surg_trauma"
}

def normalize_text(text):
    if not text:
        return ''
    t = text.strip()
    t = t.replace('ي', 'ی').replace('ك', 'ک')
    t = t.replace('ۀ', 'ه').replace('ة', 'ه')
    t = t.replace('‌', ' ')
    t = t.replace('ء', '')
    t = t.replace('ئ', 'ی')
    t = re.sub(r'<[^>]+>', '', t)
    persian_digits = "۰۱۲۳۴۵۶۷۸۹"
    english_digits = "0123456789"
    t = t.translate(str.maketrans(persian_digits, english_digits))
    t = re.sub(r'[\s\.\،\,\:\;\-\_\(\)\[\]\{\}\?\؟\«\»\'\"\*\#\n\r]+', '', t)
    return t.lower()

def split_into_bullets(text):
    if not text:
        return []
    lines = text.strip().splitlines()
    bullets = []
    current_bullet = []
    for line in lines:
        stripped = line.strip()
        if re.match(r'^(?:[-*•]|\d+\.)\s+', stripped):
            if current_bullet:
                bullets.append("\n".join(current_bullet).strip())
                current_bullet = []
            current_bullet.append(line)
        else:
            if current_bullet:
                current_bullet.append(line)
            elif stripped:
                bullets.append(stripped)
    if current_bullet:
        bullets.append("\n".join(current_bullet).strip())
    return [b for b in bullets if b.strip()]

def get_bullet_key(b):
    m = re.search(r'\*\*(.*?)\*\*', b)
    if m:
        return normalize_text(m.group(1))
    return normalize_text(b[:60])

def merge_mini_lessons(lesson_a, lesson_b):
    bullets_a = split_into_bullets(lesson_a)
    bullets_b = split_into_bullets(lesson_b)
    seen_keys = set(get_bullet_key(b) for b in bullets_a if get_bullet_key(b))
    merged_bullets = list(bullets_a)
    added_count = 0
    for b in bullets_b:
        k = get_bullet_key(b)
        if k and k in seen_keys:
            continue
        if normalize_text(b[:80]) in normalize_text(lesson_a):
            continue
        merged_bullets.append(b)
        if k:
            seen_keys.add(k)
        added_count += 1
    return "\n".join(merged_bullets), added_count

def generate_markdown_content(chapter_title, questions):
    md_lines = []
    persian_digits_table = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")

    for idx, q in enumerate(questions, 1):
        p_num = str(idx).translate(persian_digits_table)
        md_lines.append(f"## سوال {p_num}")
        md_lines.append(f"**مبحث:** {q.get('topic', 'جراحی جنرال لارنس')}")
        if q.get('source'):
            md_lines.append(f"**منبع:** {q.get('source')}")
        md_lines.append("")
        md_lines.append("**صورت سوال:**")
        md_lines.append(q.get('stem', '').strip())
        md_lines.append("")
        md_lines.append("**گزینه‌ها:**")
        for opt in q.get('options', []):
            md_lines.append(f"- **{opt['key']})** {opt['text'].strip()}")
        md_lines.append("")
        md_lines.append(f"**پاسخ صحیح:** {q.get('correct_answer')}")
        md_lines.append("")
        md_lines.append("### پاسخ تشریحی و درسنامه جامع")
        md_lines.append("#### ۱. تحلیل پاسخ صحیح و مسیر مدیریت بیمار")
        md_lines.append(q.get('detailed_explanation', {}).get('rationale', '').strip())
        md_lines.append("")
        md_lines.append("#### ۲. کالبدشکافی سایر گزینه‌ها (دام‌های امتحانی)")
        for opt in q.get('options', []):
            exp_text = opt.get('explanation', '').strip()
            if not exp_text and opt.get('key') == q.get('correct_answer'):
                exp_text = "گزینه صحیح؛ مطابق تحلیل کامل در بخش ۱."
            md_lines.append(f"- **بررسی گزینه {opt['key']}:** {exp_text}")
        md_lines.append("")
        md_lines.append("#### ۳. درسنامه مکمل لارنس (پوشش نکات پیرامونی این مبحث)")
        lesson_text = q.get('detailed_explanation', {}).get('mini_lesson', '') or q.get('detailed_explanation', {}).get('lawrence_lesson', '')
        md_lines.append(lesson_text.strip())
        md_lines.append("")
        md_lines.append("---")
        md_lines.append("")

    return "\n".join(md_lines)

def main():
    print("==================================================================")
    print("STARTING SURGERY QUESTION BANK DEDUPLICATION & MINI-LESSON MERGING")
    print("==================================================================")

    # 1. Load manifest
    with open(SURGERY_MANIFEST_PATH, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    chapter_data = {}
    for slug, meta in manifest.items():
        json_path = os.path.join(DATA_QUIZZES_DIR, f"surgery_{slug}_quiz.json")
        with open(json_path, 'r', encoding='utf-8') as f:
            chapter_data[slug] = json.load(f)

    initial_total = sum(len(qs) for qs in chapter_data.values())
    print(f"Total questions before deduplication: {initial_total}")

    # 2. Cross-chapter duplicate: colonic trauma (wound_healing_and_trauma Q#8 vs trauma Q#22)
    trauma_qs = chapter_data.get('trauma', [])
    wound_qs = chapter_data.get('wound_healing_and_trauma', [])
    for q_t in trauma_qs:
        norm_t = normalize_text(q_t.get('stem', ''))
        for q_w in wound_qs:
            norm_w = normalize_text(q_w.get('stem', ''))
            if norm_t == norm_w:
                print(f"Merging cross-chapter duplicate: Trauma Q#{q_t.get('id')} and Wound Q#{q_w.get('id')}")
                merged_lesson, added = merge_mini_lessons(
                    q_t['detailed_explanation']['mini_lesson'],
                    q_w['detailed_explanation']['mini_lesson']
                )
                q_t['detailed_explanation']['mini_lesson'] = merged_lesson
                q_t['detailed_explanation']['lawrence_lesson'] = merged_lesson
                print(f"  -> Added {added} unique bullet points from wound into trauma.")
                q_w['_remove_dup'] = True

    # 3. Deduplicate within each chapter
    total_removed = 0
    total_merged_bullets = 0
    deduped_chapter_data = {}

    for slug, qs in chapter_data.items():
        prefix = CHAPTER_PREFIX_MAP.get(slug, f"surg_{slug}")
        chapter_id = manifest[slug]["id"]
        
        seen_stems = {}
        unique_qs = []
        
        for q in qs:
            if q.get('_remove_dup'):
                total_removed += 1
                continue
                
            norm_stem = normalize_text(q.get('stem', ''))
            if norm_stem in seen_stems:
                prim_q = seen_stems[norm_stem]
                lesson_prim = prim_q.get('detailed_explanation', {}).get('mini_lesson', '')
                lesson_dup = q.get('detailed_explanation', {}).get('mini_lesson', '')
                
                merged_lesson, added = merge_mini_lessons(lesson_prim, lesson_dup)
                prim_q['detailed_explanation']['mini_lesson'] = merged_lesson
                prim_q['detailed_explanation']['lawrence_lesson'] = merged_lesson
                total_merged_bullets += added
                
                # Check for unique rationale notes
                rat_prim = prim_q.get('detailed_explanation', {}).get('rationale', '')
                rat_dup = q.get('detailed_explanation', {}).get('rationale', '')
                if "این سوال تکرار عینی" not in rat_dup and normalize_text(rat_dup[:60]) not in normalize_text(rat_prim):
                    if len(rat_dup) > 100:
                        prim_q['detailed_explanation']['rationale'] += f"\n\n> 💡 **نکته تکمیلی و تطبیقی آزمون‌ها:** {rat_dup.strip()}"
                
                total_removed += 1
            else:
                seen_stems[norm_stem] = q
                unique_qs.append(q)

        # 4. Re-number and assign globally unique IDs
        for i, q in enumerate(unique_qs, 1):
            q["id"] = f"{prefix}_q{i:02d}"
            q["chapterId"] = chapter_id
            q["number"] = i
            
        deduped_chapter_data[slug] = unique_qs
        print(f"Chapter '{slug}': {len(qs)} -> {len(unique_qs)} questions (eliminated {len(qs) - len(unique_qs)} duplicates)")

    final_total = sum(len(qs) for qs in deduped_chapter_data.values())
    print(f"\nSummary:")
    print(f"  - Initial questions: {initial_total}")
    print(f"  - Duplicates eliminated: {total_removed}")
    print(f"  - Final clean questions: {final_total}")
    print(f"  - Total unique mini-lesson bullets merged: {total_merged_bullets}")

    # 5. Write back JSON, JS, and Markdown files
    os.makedirs(SURGERY_MD_DIR, exist_ok=True)
    os.makedirs(CHAPTERS_SURGERY_QUIZZES_DIR, exist_ok=True)

    for slug, questions in deduped_chapter_data.items():
        var_name = f"SURGERY_{slug.upper()}_DATA"
        json_path = os.path.join(DATA_QUIZZES_DIR, f"surgery_{slug}_quiz.json")
        js_path = os.path.join(DATA_QUIZZES_DIR, f"surgery_{slug}_data.js")
        md_path_1 = os.path.join(SURGERY_MD_DIR, f"{slug}.md")
        md_path_2 = os.path.join(CHAPTERS_SURGERY_QUIZZES_DIR, f"{slug}.md")

        # Write JSON
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)

        # Write JS
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(f"window.{var_name} = ")
            json.dump(questions, f, ensure_ascii=False, indent=2)
            f.write(";\n")

        # Write Markdown
        md_content = generate_markdown_content(manifest[slug]["title"], questions)
        with open(md_path_1, 'w', encoding='utf-8') as f:
            f.write(md_content)
        with open(md_path_2, 'w', encoding='utf-8') as f:
            f.write(md_content)

        # Update manifest metadata
        manifest[slug]["totalQuestions"] = len(questions)
        manifest[slug]["badge"] = f"{len(questions)} سوال"

    # Save manifest
    with open(SURGERY_MANIFEST_PATH, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print("  -> Updated data/quizzes/surgery_manifest.json")

    # 6. Update js/data/quiz-registry.js
    with open(QUIZ_REGISTRY_JS_PATH, 'r', encoding='utf-8') as f:
        registry_content = f.read()

    # Build the surgery chapters array for quiz-registry.js
    surgery_chapters_js = [
        f"""        {{
          id: 'surgery-all',
          title: 'همه مباحث (آزمون جامع جراحی جنرال لارنس)',
          shortTitle: 'آزمون جامع جراحی',
          badge: '{final_total} سوال',
          totalQuestions: {final_total},
          estimatedMinutes: {max(30, final_total)},
          isAll: true
        }}"""
    ]

    for item in manifest.values():
        surgery_chapters_js.append(f"""        {{
          id: '{item["id"]}',
          title: '{item["title"]}',
          shortTitle: '{item["shortTitle"]}',
          badge: '{item["badge"]}',
          totalQuestions: {item["totalQuestions"]},
          estimatedMinutes: {item["estimatedMinutes"]},
          fileUrl: '{item["fileUrl"]}',
          fallbackQuestions: (typeof window !== 'undefined' && Array.isArray(window.{item["varName"]})) ? window.{item["varName"]} : [],
          description: '{item["description"]}'
        }}""")

    chapters_str = ',\n'.join(surgery_chapters_js)
    surgery_course_block = f"""    {{
      id: 'surgery',
      title: 'بانک جامع سوالات جراحی جنرال (رفرنس لارنس)',
      shortTitle: 'جراحی جنرال (لارنس)',
      category: 'جراحی جنرال لارنس',
      categoryColor: '#e11d48',
      description: 'بانک آزمون و تست‌های تحلیلی جراحی عمومی بر اساس رفرنس معتبر لارنس (Lawrence Essentials of General Surgery)؛ شامل تشریح گزینه‌ها، کالبدشکافی دام‌های تستی و درسنامه جامع بالینی.',
      chapters: [
{chapters_str}
      ]
    }}"""

    surgery_pattern = r"({\s*id:\s*['\"]surgery['\"][\s\S]*?\n    })"
    if re.search(surgery_pattern, registry_content):
        registry_content = re.sub(surgery_pattern, surgery_course_block.strip(), registry_content, count=1)
        with open(QUIZ_REGISTRY_JS_PATH, 'w', encoding='utf-8') as f:
            f.write(registry_content)
        print("  -> Updated 'surgery' course and all 18 chapters in js/data/quiz-registry.js")

    print("\nALL DEDUPLICATION FILES WRITTEN SUCCESSFULLY!")

if __name__ == '__main__':
    main()
