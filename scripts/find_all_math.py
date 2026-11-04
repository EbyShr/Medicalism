import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

surgery_dir = os.path.join('chapters', 'Surgery')
files = [f for f in sorted(os.listdir(surgery_dir)) if f.endswith('.md')]

all_math = set()

for f in files:
    with open(os.path.join(surgery_dir, f), 'r', encoding='utf-8', errors='ignore') as fp:
        c = fp.read()
    matches = re.findall(r'\$([^\$\n]+)\$', c)
    for m in matches:
        all_math.add(m.strip())

print(f"Total distinct $...$ expressions: {len(all_math)}")
for m in sorted(list(all_math))[:40]:
    print(f"  ${m}$")
