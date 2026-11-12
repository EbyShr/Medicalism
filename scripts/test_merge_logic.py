import sys
sys.path.insert(0, '.')
import json
import glob
import re
import os
from collections import defaultdict

def normalize_text(text):
    if not text:
        return ''
    t = text.strip()
    t = t.replace('ي', 'ی').replace('ك', 'ک')
    t = t.replace('ۀ', 'ه').replace('ة', 'ه')
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
    if not lesson_a and not lesson_b:
        return ""
    if not lesson_a:
        return lesson_b
    if not lesson_b:
        return lesson_a
    
    bullets_a = split_into_bullets(lesson_a)
    bullets_b = split_into_bullets(lesson_b)
    
    seen_keys = set()
    for b in bullets_a:
        key = get_bullet_key(b)
        if key:
            seen_keys.add(key)
    
    merged_bullets = list(bullets_a)
    added_count = 0
    for b in bullets_b:
        key = get_bullet_key(b)
        # Check if key is already seen or b is already in lesson_a
        if key and key in seen_keys:
            continue
        if normalize_text(b[:80]) in normalize_text(lesson_a):
            continue
        
        merged_bullets.append(b)
        if key:
            seen_keys.add(key)
        added_count += 1
        
    return "\n".join(merged_bullets), added_count

if __name__ == '__main__':
    from scripts.find_duplicates import duplicates
    print(f"Testing merge across {len(duplicates)} duplicate groups:")
    total_added = 0
    for idx, (norm, list_qs) in enumerate(duplicates.items(), 1):
        q_prim = list_qs[0][1]
        lesson_prim = q_prim.get('detailed_explanation', {}).get('mini_lesson', '')
        
        merged = lesson_prim
        group_added = 0
        for f, q_dup in list_qs[1:]:
            lesson_dup = q_dup.get('detailed_explanation', {}).get('mini_lesson', '')
            merged, added = merge_mini_lessons(merged, lesson_dup)
            group_added += added
            
        total_added += group_added
        if group_added > 0 and idx <= 5:
            print(f"Group {idx}: Added {group_added} unique bullet points to primary question.")
    print(f"Total unique bullet points successfully merged across all duplicates: {total_added}")
