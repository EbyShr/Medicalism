import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('chapters/Surgery/Surgical Bleeding.md', 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        if line.startswith('#'):
            print(f'Line {idx+1}: {line.strip()}')
