import os
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

surgery_dir = os.path.join('chapters', 'Surgery')
files = [f for f in sorted(os.listdir(surgery_dir)) if f.endswith('.md')]

def clean_page_numbers(text):
    if not text:
        return ""
    t = re.sub(r'\s*\([صفحات\s\dتا\sPDF\.]+\)', '', text)
    t = re.sub(r'\s*\(صفحات\s*[\d\u06F0-\u06F9]+\s*تا\s*[\d\u06F0-\u06F9]+\s*(?:PDF|pdf)?\)', '', t)
    t = re.sub(r'\s*\(صفحه\s*[\d\u06F0-\u06F9]+\s*(?:PDF|pdf)?\)', '', t)
    return t.strip()

def split_chapter_sections(text, filename):
    # Pattern 1: ## بخش (\d+)...
    # Pattern 2: # بخش (\d+)...
    # Pattern 3: # فصل ... — بخش (\d+)...
    
    # Check which pattern is used
    p1 = list(re.finditer(r'^##\s*بخش\s+([\d\u06F0-\u06F9]+)(?:\s*\((.*?)\))?:\s*(.*)$', text, re.MULTILINE))
    p2 = list(re.finditer(r'^#\s*بخش\s+([\d\u06F0-\u06F9]+)(?:\s*\((.*?)\))?:\s*(.*)$', text, re.MULTILINE))
    p3 = list(re.finditer(r'^#\s*فصل\s*[\d\u06F0-\u06F9]+.*?—\s*بخش\s+([\d\u06F0-\u06F9]+)(?:\s*\((.*?)\))?:\s*(.*)$', text, re.MULTILINE))
    
    matches = p1 or p2 or p3
    if not matches and 'Pancreas.md' in filename:
        # Check alternative pancreas pattern
        matches = list(re.finditer(r'^#\s*فصل\s*[\d\u06F0-\u06F9]+.*?بخش\s+([\d\u06F0-\u06F9]+).*$', text, re.MULTILINE))
    
    if not matches:
        return []
    
    splits = [m.start() for m in matches]
    splits.append(len(text))
    
    sections = []
    for i in range(len(matches)):
        start_idx = splits[i]
        end_idx = splits[i+1]
        chunk = text[start_idx:end_idx]
        lines = chunk.splitlines()
        first_line = lines[0].strip()
        part_num = i + 1
        raw_part_title = first_line.lstrip('#').strip()
        clean_part_title = clean_page_numbers(raw_part_title)
        body = '\n'.join(lines[1:])
        sections.append({
            'num': part_num,
            'title': clean_part_title,
            'raw_first_line': first_line,
            'body_len': len(body)
        })
    return sections

total_all_sections = 0
for f in files:
    path = os.path.join(surgery_dir, f)
    with open(path, 'r', encoding='utf-8', errors='ignore') as fp:
        content = fp.read()
    secs = split_chapter_sections(content, f)
    total_all_sections += len(secs)
    print(f"\n=======================================================")
    print(f"FILE: {f} -> {len(secs)} sections")
    for s in secs:
        print(f"  Sec {s['num']}: {s['title'][:70]} ({s['body_len']} chars)")

print(f"\n=======================================================")
print(f"TOTAL SECTIONS ACROSS ALL FILES: {total_all_sections}")
