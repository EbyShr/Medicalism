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
        lines = fp.readlines()

    h1_lines = [(i+1, l.strip()) for i, l in enumerate(lines) if l.strip().startswith('# ')]
    h2_lines = [(i+1, l.strip()) for i, l in enumerate(lines) if l.strip().startswith('## ')]
    h2_bakhsh = [(i+1, l.strip()) for i, l in enumerate(lines) if l.strip().startswith('## بخش')]
    h1_bakhsh = [(i+1, l.strip()) for i, l in enumerate(lines) if l.strip().startswith('# بخش')]

    print("==================================================")
    print(f"FILE: {f} ({len(lines)} lines)")
    print(f"  # Lines: {len(h1_lines)} | Sample # line: {h1_lines[0] if h1_lines else 'NONE'}")
    print(f"  ## بخش Lines: {len(h2_bakhsh)}")
    print(f"  # بخش Lines (Level 1 sections): {len(h1_bakhsh)}")
    if h1_bakhsh:
        print(f"    Sample # بخش: {h1_bakhsh[:2]}")
    if h2_bakhsh:
        print(f"    Sample ## بخش: {h2_bakhsh[:2]}")
