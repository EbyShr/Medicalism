import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

surgery_dir = os.path.join('chapters', 'Surgery')

samples = [
    ('Biliary Tract.md', 0),
    ('Biliary Tract.md', 1),
    ('Fluids, Electrolytes, and Surgical Nutrition.md', 0),
    ('Fluids, Electrolytes, and Surgical Nutrition.md', 2),
    ('Diseases of the Vascular System.md', 0),
    ('Trauma.md', 9),
    ('Trauma.md', 10),
    ('Wounds and Wound Healing.md', 0),
    ('Wounds and Wound Healing.md', 2),
]

for filename, idx in samples:
    path = os.path.join(surgery_dir, filename)
    with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
        c = fp.read()
    blocks = re.findall(r'```([^\n]*)\n(.*?)```', c, re.DOTALL)
    if idx < len(blocks):
        print(f"\n=================================================================")
        print(f"SAMPLE: {filename} - Block #{idx+1}")
        print(blocks[idx][1])
