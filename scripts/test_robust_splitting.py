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
    # Pattern A: ## بخش X
    p_a = list(re.finditer(r'^##\s*بخش\s+([\d\u06F0-\u06F9]+)(?:[:\s\-—(].*|\s*)$', text, re.MULTILINE))
    # Pattern B: # بخش X
    p_b = list(re.finditer(r'^#\s*بخش\s+([\d\u06F0-\u06F9]+)(?:[:\s\-—(].*|\s*)$', text, re.MULTILINE))
    # Pattern C: # فصل ... بخش X (Pancreas)
    p_c = list(re.finditer(r'^#\s*فصل\s*[\d\u06F0-\u06F9]+.*?بخش\s+([\d\u06F0-\u06F9]+).*$', text, re.MULTILINE))
    
    matches = p_a or p_b or p_c
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
        
        # If title is just "بخش X", grab subtitle from next header if available
        if clean_part_title in [f'بخش {part_num}', f'بخش {part_num}:']:
            for l in lines[1:10]:
                if l.startswith('### '):
                    sub = clean_page_numbers(l.lstrip('#').strip())
                    clean_part_title = f"بخش {part_num}: {sub}"
                    break
                    
        body = '\n'.join(lines[1:])
        sections.append({
            'num': part_num,
            'title': clean_part_title,
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
    print(f"FILE: {f:<60} -> {len(secs)} sections")

print(f"\nTOTAL SECTIONS ACROSS ALL 14 FILES: {total_all_sections}")
