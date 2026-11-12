import json
import glob
import re
import os
from collections import defaultdict

def normalize_text(text):
    if not text:
        return ''
    t = text.strip()
    # Normalize arabic/persian characters
    t = t.replace('ي', 'ی').replace('ك', 'ک')
    t = t.replace('ۀ', 'ه').replace('ة', 'ه')
    # Normalize numbers (Persian to English)
    persian_digits = "۰۱۲۳۴۵۶۷۸۹"
    english_digits = "0123456789"
    trans = str.maketrans(persian_digits, english_digits)
    t = t.translate(trans)
    # Remove all whitespace and punctuation
    t = re.sub(r'[\s\.\،\,\:\;\-\_\(\)\[\]\{\}\?\؟\«\»\'\"\*\#\n\r]+', '', t)
    return t.lower()

files = sorted(glob.glob('data/quizzes/surgery_*_quiz.json'))
print(f'Found {len(files)} surgery quiz JSON files.')

all_questions = []
file_questions = {}

for f in files:
    with open(f, 'r', encoding='utf-8') as fp:
        qs = json.load(fp)
        file_questions[f] = qs
        for q in qs:
            all_questions.append((f, q))

print(f'Total questions across files: {len(all_questions)}')

stem_map = defaultdict(list)
for f, q in all_questions:
    norm_stem = normalize_text(q.get('stem', ''))
    stem_map[norm_stem].append((f, q))

duplicates = {k: v for k, v in stem_map.items() if len(v) > 1}
print(f'Found {len(duplicates)} duplicate question groups!')

total_dup_count = sum(len(v) - 1 for v in duplicates.values())
print(f'Total redundant duplicate questions to eliminate: {total_dup_count}')

intra_file = 0
cross_file = 0
for norm, list_qs in duplicates.items():
    files = set(f for f, q in list_qs)
    if len(files) == 1:
        intra_file += 1
    else:
        cross_file += 1
        print(f'\nCross-file dup ({len(list_qs)} copies):')
        for f, q in list_qs:
            print(f'   {os.path.basename(f)} Q#{q.get("id")} - {q.get("topic")}')

print(f'\nIntra-file dup groups: {intra_file}')
print(f'Cross-file dup groups: {cross_file}')

for idx, (norm, list_qs) in enumerate(duplicates.items(), 1):
    print(f'\n--- Duplicate Group {idx} ({len(list_qs)} copies) ---')
    for f, q in list_qs:
        f_name = os.path.basename(f)
        stem_preview = q.get('stem', '')[:80].replace('\n', ' ')
        lesson = q.get('detailed_explanation', {}).get('mini_lesson', '') or q.get('detailed_explanation', {}).get('lawrence_lesson', '')
        print(f'  [{f_name}] Q#{q.get("id")} (Topic: {q.get("topic")})')
        print(f'    Stem: {stem_preview}')
        print(f'    Lesson length: {len(lesson)} chars')
        lines = [l.strip() for l in lesson.splitlines() if l.strip().startswith(('-', '*', '•'))]
        print(f'    Bullet points ({len(lines)}):')
        for l in lines[:3]:
            print(f'      {l[:80]}...')
