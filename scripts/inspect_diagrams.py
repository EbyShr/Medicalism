import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

surgery_dir = os.path.join('chapters', 'Surgery')
files = [f for f in sorted(os.listdir(surgery_dir)) if f.endswith('.md')]

for f in files:
    path = os.path.join(surgery_dir, f)
    with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
        content = fp.read()

    # Find all code blocks
    code_blocks = re.findall(r'```([^\n]*)\n(.*?)```', content, re.DOTALL)
    if code_blocks:
        print(f"\n==================================================")
        print(f"FILE: {f} (Found {len(code_blocks)} code blocks)")
        for idx, (lang, body) in enumerate(code_blocks):
            preview = '\n'.join(body.strip().splitlines()[:6])
            print(f"  --- Code Block #{idx+1} (lang='{lang}'): ---")
            print(preview)
            if len(body.strip().splitlines()) > 6:
                print(f"      ... [{len(body.strip().splitlines())} lines total]")
