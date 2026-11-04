import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

surgery_dir = os.path.join('chapters', 'Surgery')
files = [f for f in sorted(os.listdir(surgery_dir)) if f.endswith('.md')]

for f in files:
    with open(os.path.join(surgery_dir, f), 'r', encoding='utf-8', errors='ignore') as fp:
        c = fp.read()
    blocks = re.findall(r'```([^\n]*)\n(.*?)```', c, re.DOTALL)
    for i, (lang, body) in enumerate(blocks):
        b = body.strip()
        if '┌' in b or '┬' in b or '┴' in b:
            lines = b.splitlines()
            # find the line with box characters
            box_lines = [l for l in lines if ('┌' in l or '┬' in l or '┴' in l)]
            divs = []
            for bl in box_lines:
                pos = [idx for idx, ch in enumerate(bl) if ch in '┴┬┼']
                divs.append((bl.strip()[:30], pos))
            print(f"{f} #{i+1}: {len(box_lines)} box-split lines found, split pos: {divs[:2]}")
