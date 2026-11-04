import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

surgery_dir = os.path.join('chapters', 'Surgery')
files = [f for f in sorted(os.listdir(surgery_dir)) if f.endswith('.md')]

cat_counts = {'box_branch': 0, 'tree_indent': 0, 'stepper_linear': 0, 'other': 0}

for f in files:
    with open(os.path.join(surgery_dir, f), 'r', encoding='utf-8', errors='ignore') as fp:
        c = fp.read()
    blocks = re.findall(r'```([^\n]*)\n(.*?)```', c, re.DOTALL)
    for i, (lang, body) in enumerate(blocks):
        b = body.strip()
        lines = b.splitlines()
        if '┌' in b or '┬' in b or '┴' in b:
            cat = 'box_branch'
        elif '├──' in b or '└──' in b:
            cat = 'tree_indent'
        elif ('⬇️' in b or '➡️' in b or '⬅️' in b) and ('│' not in b):
            cat = 'stepper_linear'
        else:
            cat = 'other'
        cat_counts[cat] += 1

print("Categories count:", cat_counts)
