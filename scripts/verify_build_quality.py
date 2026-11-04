# -*- coding: utf-8 -*-
import json
import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

with open('chapters/Surgery/surgery_registry.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

chapters = data['chapters']
print(f"Total Chapters: {len(chapters)}")
total_sections = sum(len(c['sections']) for c in chapters)
print(f"Total Sections: {total_sections}")

# 1. Check for <pre> or schematic code
pre_count = 0
for c in chapters:
    for s in c['sections']:
        if '<pre' in s['contentHtml'] or 'schematic-tree-code' in s['contentHtml']:
            pre_count += 1
            print(f"  Warning: <pre> found in {c['id']} {s['id']}")
print(f"1. Sections with <pre> or schematic-code: {pre_count} (Must be 0)")

# 2. Check for broken tags like <span class="stepper-arrow-indicator">></span>
broken_tag_count = 0
for c in chapters:
    for s in c['sections']:
        html = s['contentHtml']
        if re.search(r'<span class="stepper-arrow-indicator">\s*&gt;\s*</span>', html) or re.search(r'<span class="stepper-arrow-indicator">></span>', html) or re.search(r'&lt;span class="stepper-arrow', html):
            broken_tag_count += 1
            print(f"  Warning: Broken arrow tag found in {c['id']} {s['id']}")
print(f"2. Sections with broken arrow/trap tags: {broken_tag_count} (Must be 0)")

# 3. Check for bare section titles (e.g., "بخش ۱")
bare_titles = []
for c in chapters:
    for s in c['sections']:
        t = s['title'].strip()
        if re.match(r'^بخش\s*[\d\u06F0-\u06F9]+:?$', t):
            bare_titles.append((c['id'], s['number'], t))
print(f"3. Bare section titles: {len(bare_titles)} (Must be 0)")
if bare_titles:
    for bt in bare_titles:
        print(f"  {bt}")

# 4. Check chapter mindmap HTML
mindmap_issues = 0
for c in chapters:
    mm = c.get('mindMapHtml', '')
    if 'id="btnToggleMindmap"' not in mm or 'id="mindmapContent"' not in mm:
        mindmap_issues += 1
        print(f"  Warning: Mindmap missing IDs in {c['id']}")
print(f"4. Mindmap ID issues: {mindmap_issues} (Must be 0)")

# 5. Check for AI conversational leftovers
ai_phrases = ['به پایان رسید', 'ادامه فصل', 'آیا بخش', 'پوشش ۱۰۰', 'شروع کنم']
ai_leftovers = 0
for c in chapters:
    for s in c['sections']:
        for phrase in ai_phrases:
            if phrase in s['contentHtml']:
                ai_leftovers += 1
                print(f"  Warning: AI phrase '{phrase}' in {c['id']} {s['id']}")
print(f"5. AI conversational leftovers: {ai_leftovers} (Must be 0)")

# 6. Check for flowcharts generated
flowcharts_count = 0
for c in chapters:
    for s in c['sections']:
        flowcharts_count += s['contentHtml'].count('data-flowchart="true"')
print(f"6. Total visual flowchart cards rendered: {flowcharts_count}")

# 7. Check for styled Latin tags and lead keywords
latin_tags_count = 0
lead_keywords_count = 0
for c in chapters:
    for s in c['sections']:
        latin_tags_count += s['contentHtml'].count('class="med-latin-tag"')
        lead_keywords_count += s['contentHtml'].count('class="med-lead')
print(f"7. Total med-latin-tag elements: {latin_tags_count}")
print(f"8. Total med-lead colorized keywords: {lead_keywords_count}")

print("\nALL QUALITY CHECKS COMPLETED!")
