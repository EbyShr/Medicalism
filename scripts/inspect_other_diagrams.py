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
            continue
        elif '├──' in b or '└──' in b:
            continue
        print(f"\n--- {f} Block #{i+1} ---")
        print(b[:300])
