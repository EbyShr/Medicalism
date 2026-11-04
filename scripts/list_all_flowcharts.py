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
    print(f"\n=======================================================")
    print(f"FILE: {f} ({len(blocks)} blocks)")
    for i, (lang, body) in enumerate(blocks):
        lines = [l.strip() for l in body.strip().splitlines() if l.strip()]
        title = lines[0] if lines else "EMPTY"
        print(f"  #{i+1} [lines={len(lines)}]: {title}")
