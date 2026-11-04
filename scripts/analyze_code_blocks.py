import os
import re
import sys
from collections import Counter

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

surgery_dir = os.path.join('chapters', 'Surgery')
files = [f for f in sorted(os.listdir(surgery_dir)) if f.endswith('.md')]

langs = Counter()
multiline_langs = Counter()
diagram_blocks = []

for f in files:
    with open(os.path.join(surgery_dir, f), 'r', encoding='utf-8', errors='ignore') as fp:
        c = fp.read()
    blocks = re.findall(r'```([^\n]*)\n(.*?)```', c, re.DOTALL)
    for idx, (lang, body) in enumerate(blocks):
        lang = lang.strip()
        langs[lang] += 1
        lines = body.strip().splitlines()
        if len(lines) > 2:
            multiline_langs[lang] += 1
            # Check if it looks like an ASCII diagram or decision tree
            has_arrows = any(sym in body for sym in ['├──', '└──', '┌──', '│', '───', '▼', '⬇️', '➡️', '⬅️', '<--', '-->'])
            if has_arrows:
                diagram_blocks.append((f, idx, lang, len(lines), lines[0]))

print(f"Total files: {len(files)}")
print(f"Total by lang: {dict(langs)}")
print(f"Multiline (>2 lines) by lang: {dict(multiline_langs)}")
print(f"Identified Diagram/Flowchart blocks: {len(diagram_blocks)}")
for f, idx, lang, nlines, first in diagram_blocks[:25]:
    print(f"  {f} [block #{idx+1}, {nlines} lines]: {first[:60]}")
