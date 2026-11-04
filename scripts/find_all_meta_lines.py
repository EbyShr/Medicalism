import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

surgery_dir = os.path.join('chapters', 'Surgery')
files = [f for f in sorted(os.listdir(surgery_dir)) if f.endswith('.md')]

meta_patterns = [
    re.compile(r'بخش\s+[\d\u06F0-\u06F9]+.*به\s+پایان\s+رسید', re.IGNORECASE),
    re.compile(r'آیا\s+بخش\s+', re.IGNORECASE),
    re.compile(r'در\s+ادامه\s+بخش\s+', re.IGNORECASE),
    re.compile(r'ادامه\s+فصل\s+', re.IGNORECASE),
    re.compile(r'پایان\s+بخش\s+', re.IGNORECASE),
    re.compile(r'پوشش\s+۱۰۰٪', re.IGNORECASE),
    re.compile(r'نقشه\s+درختی\s+و\s+تقسیم‌بندی', re.IGNORECASE),
    re.compile(r'دستورات\s+سیستمی', re.IGNORECASE),
    re.compile(r'فاز\s+[۱-۹\d]:\s*تنظیم', re.IGNORECASE),
]

for f in files:
    with open(os.path.join(surgery_dir, f), 'r', encoding='utf-8', errors='ignore') as fp:
        lines = fp.readlines()
    matches = []
    for idx, l in enumerate(lines):
        for p in meta_patterns:
            if p.search(l):
                matches.append((idx + 1, l.strip()))
                break
    if matches:
        print(f"\n==========================================")
        print(f"FILE: {f} ({len(matches)} meta lines found)")
        for line_no, text in matches[:10]:
            print(f"  Line {line_no}: {text[:80]}")
