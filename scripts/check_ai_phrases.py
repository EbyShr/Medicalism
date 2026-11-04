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
    
    # check first 5 lines and last 5 lines
    first_5 = [l.strip() for l in lines[:5] if l.strip()]
    last_5 = [l.strip() for l in lines[-5:] if l.strip()]
    
    # Check lines around any "# بخش" or "## بخش"
    suspect_lines = []
    for idx, l in enumerate(lines):
        if '؟' in l or '?' in l:
            # check if it looks like AI conversation
            if any(w in l for w in ['شروع کنم', 'مایلید', 'ادامه دهم', 'بنویسم', 'پایان رسید', 'تقدیم']):
                suspect_lines.append((idx+1, l.strip()))
                
    print(f"\nFILE: {f} (total lines={len(lines)})")
    print(f"  First lines: {first_5[:2]}")
    print(f"  Last line: {last_5[-1] if last_5 else ''}")
    if suspect_lines:
        print(f"  SUSPECT AI LINES ({len(suspect_lines)}):")
        for num, txt in suspect_lines:
            print(f"    Line {num}: {txt[:80]}")
