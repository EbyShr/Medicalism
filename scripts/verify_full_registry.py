# -*- coding: utf-8 -*-
import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

data = json.load(open('chapters/Surgery/surgery_registry.json', encoding='utf-8'))
chapters = data['chapters']

total_pre = 0
total_diagrams = 0
lone_emojis = []
bare_sections = []

for ch in chapters:
    for sec in ch['sections']:
        html = sec['contentHtml']
        if '<pre>' in html:
            total_pre += 1
        diagram_cards = re.findall(r'<div class="clinical-flowchart-card[^"]*"[^>]*>', html)
        total_diagrams += len(diagram_cards)
        
        # Check for lone emoji spans
        for m in re.finditer(r'<span class="(?:ctree-text|ctree-badge[^"]*|ctree-action-text)">\s*([🎯⚠️\[\]\s]+)\s*</span>', html):
            lone_emojis.append((ch['shortTitle'], sec['title'], m.group(1)))
            
        # Check for bare titles
        if re.match(r'^بخش\s*[\d\u06F0-\u06F9]+$', sec['title'].strip()):
            bare_sections.append((ch['shortTitle'], sec['title']))

print(f"Total Chapters: {len(chapters)}")
print(f"Total Sections: {sum(len(c['sections']) for c in chapters)}")
print(f"Total Clinical Diagrams Rendered: {total_diagrams}")
print(f"Total <pre> code blocks found: {total_pre} (MUST BE 0)")
print(f"Total Bare Section Titles: {len(bare_sections)} (MUST BE 0)")
print(f"Total Lone Emoji Nodes: {len(lone_emojis)} (MUST BE 0)")

if lone_emojis:
    print("Lone emojis found:")
    for le in lone_emojis[:10]:
        print("  ", le)
