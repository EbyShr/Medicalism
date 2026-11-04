import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

surgery_dir = os.path.join('chapters', 'Surgery')
files = [f for f in sorted(os.listdir(surgery_dir)) if f.endswith('.md')]

box_diagrams = []
for f in files:
    with open(os.path.join(surgery_dir, f), 'r', encoding='utf-8', errors='ignore') as fp:
        c = fp.read()
    blocks = re.findall(r'```([^\n]*)\n(.*?)```', c, re.DOTALL)
    for i, (lang, body) in enumerate(blocks):
        b = body.strip()
        if '┌' in b or '┬' in b or '┴' in b:
            lines = [l for l in b.splitlines() if l.strip()]
            box_diagrams.append((f, i, lines[0], len(lines), b))

print(f"Total box_branch diagrams: {len(box_diagrams)}")
for f, i, title, nlines, b in box_diagrams:
    print(f"[{f} #{i+1}] ({nlines} lines): {title[:70]}")
