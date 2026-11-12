import sys
sys.path.insert(0, '.')
import json
import glob
import re
import os
from collections import defaultdict

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_QUIZZES_DIR = os.path.join(BASE_DIR, "data", "quizzes")
SURGERY_MD_DIR = os.path.join(BASE_DIR, "data", "surgery_quizzes")
CHAPTERS_SURGERY_QUIZZES_DIR = os.path.join(BASE_DIR, "chapters", "Surgery", "quizzes")
SURGERY_MANIFEST_PATH = os.path.join(DATA_QUIZZES_DIR, "surgery_manifest.json")
QUIZ_REGISTRY_JS_PATH = os.path.join(BASE_DIR, "js", "data", "quiz-registry.js")

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

def run_deduplication():
    # 1. Load manifest
    with open(SURGERY_MANIFEST_PATH, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    chapter_data = {}
    for slug, meta in manifest.items():
        json_path = os.path.join(DATA_QUIZZES_DIR, f"surgery_{slug}_quiz.json")
        with open(json_path, 'r', encoding='utf-8') as f:
            chapter_data[slug] = json.load(f)

    initial_total = sum(len(qs) for qs in chapter_data.values())
    print(f"Initial total questions across all 18 chapters: {initial_total}")

    # Cross-chapter duplicate: colonic trauma in surgery_trauma vs wound_healing_and_trauma
    # Check if Q#22 in trauma and Q#8 in wound_healing_and_trauma match
    trauma_qs = chapter_data.get('trauma', [])
    wound_qs = chapter_data.get('wound_healing_and_trauma', [])
    for q_t in trauma_qs:
        norm_t = normalize_text(q_t.get('stem', ''))
        for q_w in wound_qs:
            norm_w = normalize_text(q_w.get('stem', ''))
            if norm_t == norm_w:
                print(f"Found cross-chapter duplicate: Trauma Q#{q_t.get('id')} and Wound Q#{q_w.get('id')}")
                merged_lesson, added = merge_mini_lessons(
                    q_t['detailed_explanation']['mini_lesson'],
                    q_w['detailed_explanation']['mini_lesson']
                )
                q_t['detailed_explanation']['mini_lesson'] = merged_lesson
                q_t['detailed_explanation']['lawrence_lesson'] = merged_lesson
                print(f"  -> Merged {added} unique bullet points from wound into trauma.")
                # Mark q_w for removal
                q_w['_remove_dup'] = True

    # Now deduplicate within each chapter
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
                # Merge into primary question
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
                    # Append unique clinical note
                    if len(rat_dup) > 100:
                        prim_q['detailed_explanation']['rationale'] += f"\n\n> 💡 **نکته تکمیلی و تطبیقی آزمون‌ها:** {rat_dup.strip()}"
                
                total_removed += 1
            else:
                seen_stems[norm_stem] = q
                unique_qs.append(q)

        # Re-number and assign globally unique IDs
        for i, q in enumerate(unique_qs, 1):
            q["id"] = f"{prefix}_q{i:02d}"
            q["chapterId"] = chapter_id
            q["number"] = i
            
        deduped_chapter_data[slug] = unique_qs
        print(f"Chapter '{slug}': {len(qs)} -> {len(unique_qs)} questions (removed {len(qs) - len(unique_qs)})")

    final_total = sum(len(qs) for qs in deduped_chapter_data.values())
    print(f"\n=======================================================")
    print(f"Deduplication Complete!")
    print(f"Initial: {initial_total} questions")
    print(f"Removed duplicates: {total_removed}")
    print(f"Final unique questions: {final_total}")
    print(f"Total mini-lesson bullet points merged: {total_merged_bullets}")
    print(f"=======================================================")

    return deduped_chapter_data, manifest

if __name__ == '__main__':
    run_deduplication()
