import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

surgery_dir = os.path.join('chapters', 'Surgery')
files = [f for f in os.listdir(surgery_dir) if f.endswith('.md')]

print(f"Total markdown files found: {len(files)}\n")

for f in sorted(files):
    path = os.path.join(surgery_dir, f)
    with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
        lines = fp.readlines()
    
    # 1. First 5 lines for chapter title
    first_lines = [l.strip() for l in lines[:10] if l.strip()]
    ch_title = first_lines[0] if first_lines else "UNKNOWN"
    
    # 2. Find all ## بخش headers
    part_headers = [l.strip() for l in lines if l.strip().startswith('## بخش')]
    
    # 3. Search for ASCII art / diagrams (e.g. lines with |, \, /, ---, -->, +---, ```)
    # Check for code blocks or indented blocks with tree-like characters
    code_blocks = []
    in_code = False
    curr_code = []
    for idx, l in enumerate(lines):
        if l.strip().startswith('```'):
            if in_code:
                code_blocks.append((idx + 1, curr_code))
                curr_code = []
                in_code = False
            else:
                in_code = True
                curr_code = [l]
        elif in_code:
            curr_code.append(l)

    # Search for ascii diagram patterns outside or inside code blocks
    diagram_indicators = []
    for idx, l in enumerate(lines):
        s = l.strip()
        # Look for tree drawings: characters like ├──, └──, │, /\, \__, <---, --->, |  |
        if any(c in s for c in ['├──', '└──', '│', '┌', '└', '├', '─', '──>']):
            diagram_indicators.append((idx + 1, "Unicode Tree", s))
        elif re.search(r'[\/\\\|]{2,}', s) or re.search(r'^\s*[\/\|\\]\s*[\/\|\\]', s):
            diagram_indicators.append((idx + 1, "Slash/Pipe Art", s))
        elif '->' in s and ('|' in s or '\\' in s or '/' in s):
            diagram_indicators.append((idx + 1, "Arrow/Line", s))

    print("==================================================")
    print(f"FILE: {f}")
    print(f"Lines: {len(lines):,} | Ch Title: {ch_title}")
    print(f"Sections (## بخش): {len(part_headers)}")
    for ph in part_headers[:3]:
        print(f"  - {ph}")
    if len(part_headers) > 3:
        print(f"  ... and {len(part_headers) - 3} more sections")
    print(f"Code blocks: {len(code_blocks)}")
    print(f"Diagram indicators found: {len(diagram_indicators)}")
    if diagram_indicators:
        print("  Sample diagrams:")
        for ln, kind, txt in diagram_indicators[:4]:
            print(f"    Line {ln} [{kind}]: {txt[:70]}")
    print()
