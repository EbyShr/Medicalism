import json
import glob
import re
import os

def tokenize(text):
    if not text:
        return set()
    t = text.replace('ي', 'ی').replace('ك', 'ک')
    words = re.findall(r'\w+', t)
    return set(words)

files = sorted(glob.glob('data/quizzes/surgery_*_quiz.json'))
questions = []
for f in files:
    with open(f, encoding='utf-8') as fp:
        for q in json.load(fp):
            questions.append((f, q))

print(f'Total questions: {len(questions)}')
near_dups = []
for i in range(len(questions)):
    f1, q1 = questions[i]
    tokens1 = tokenize(q1.get('stem', ''))
    if len(tokens1) < 5: continue
    for j in range(i + 1, len(questions)):
        f2, q2 = questions[j]
        tokens2 = tokenize(q2.get('stem', ''))
        if len(tokens2) < 5: continue
        sim = len(tokens1 & tokens2) / len(tokens1 | tokens2)
        if 0.75 <= sim < 0.999:
            near_dups.append((sim, f1, q1, f2, q2))

print(f'Found {len(near_dups)} near duplicates with similarity >= 0.75:')
for sim, f1, q1, f2, q2 in near_dups:
    print(f'Sim {sim:.2f}: [{os.path.basename(f1)} #{q1["id"]}] vs [{os.path.basename(f2)} #{q2["id"]}]')
    print('  Stem 1:', q1['stem'][:70].replace('\n', ' '))
    print('  Stem 2:', q2['stem'][:70].replace('\n', ' '))
