import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

surgery_dir = os.path.join('chapters', 'Surgery')
files = [f for f in sorted(os.listdir(surgery_dir)) if f.endswith('.md')]

for f in files:
    with open(os.path.join(surgery_dir, f), 'r', encoding='utf-8', errors='ignore') as fp:
        lines = fp.readlines()
    
    # First 10 lines
    title_lines = [l.strip() for l in lines[:10] if l.strip().startswith('#')]
    # Check section headers
    sec_h2 = [l.strip() for l in lines if re.match(r'^##\s*بخش\s+[\d\u06F0-\u06F9]+', l.strip())]
    sec_h1 = [l.strip() for l in lines if re.match(r'^#\s*بخش\s+[\d\u06F0-\u06F9]+', l.strip())]
    sec_pancreas = [l.strip() for l in lines if re.match(r'^#\s*فصل\s*[\d\u06F0-\u06F9]+.*بخش', l.strip())]
    
    print(f"\n=======================================================")
    print(f"FILE: {f}")
    print(f"  Headings: {title_lines[:2]}")
    print(f"  Sections found: ## بخش={len(sec_h2)}, # بخش={len(sec_h1)}, # فصل...بخش={len(sec_pancreas)}")
