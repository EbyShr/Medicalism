import os
import re
import sys
import json

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

registry_path = os.path.join('chapters', 'Surgery', 'surgery_registry.json')
with open(registry_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

chapters = data['chapters']
print(f"Total Chapters: {len(chapters)}")
print(f"Total Sections: {sum(len(c['sections']) for c in chapters)}")

# 1. Check for page numbers in headings
page_pattern = re.compile(r'\(صفحات?\s*[\d\u06F0-\u06F9]+.*?\)', re.IGNORECASE)
found_pages = []
for ch in chapters:
    if page_pattern.search(ch['title']):
        found_pages.append((ch['id'], ch['title']))
    for sec in ch['sections']:
        if page_pattern.search(sec['title']):
            found_pages.append((sec['id'], sec['title']))

print(f"\n1. Page numbers in titles: {len(found_pages)} found (Target: 0)")
if found_pages:
    for item in found_pages:
        print(f"   - {item}")

# 2. Check for conversational AI text in contentHtml
convo_pattern = re.compile(r'(?:پایان\s+رسید|آیا\s+بخش|در\s+ادامه\s+بخش|ادامه\s+فصل|پوشش\s+۱۰۰٪)', re.IGNORECASE)
found_convo = []
for ch in chapters:
    for sec in ch['sections']:
        for m in convo_pattern.finditer(sec['contentHtml']):
            # Exclude clinical phrases like 'پایان فاز' or 'پایان بخش' if within medical context, let's see
            found_convo.append((sec['id'], m.group(0)))

print(f"\n2. Conversational markers in content: {len(found_convo)} found")
for item in found_convo:
    print(f"   - {item}")

# 3. Check for unrendered code fences
unrendered_fences = []
for ch in chapters:
    for sec in ch['sections']:
        if '```' in sec['contentHtml']:
            unrendered_fences.append(sec['id'])

print(f"\n3. Unrendered ``` code blocks: {len(unrendered_fences)} found (Target: 0)")

# 4. Count rendered flowcharts
total_flowcharts = 0
for ch in chapters:
    for sec in ch['sections']:
        fc_count = sec['contentHtml'].count('class="clinical-flowchart-card')
        total_flowcharts += fc_count

print(f"\n4. Rendered .clinical-flowchart-card elements: {total_flowcharts} across all chapters!")

# 5. Check table RTL
total_tables = 0
rtl_tables = 0
for ch in chapters:
    for sec in ch['sections']:
        tables = re.findall(r'<table[^>]*>', sec['contentHtml'])
        total_tables += len(tables)
        for t in tables:
            if 'dir="rtl"' in t:
                rtl_tables += 1

print(f"\n5. Medical Tables: {total_tables} total, {rtl_tables} with strict dir='rtl'")

# 6. Check HbA1c formatting
hba1c_tags = 0
raw_hba1c_escapes = 0
for ch in chapters:
    for sec in ch['sections']:
        hba1c_tags += sec['contentHtml'].count('HbA<sub>1c</sub>')
        raw_hba1c_escapes += sec['contentHtml'].count('&lt;sub&gt;1c&lt;/sub&gt;')

print(f"\n6. HbA1c formatting: {hba1c_tags} clean HbA<sub>1c</sub> tags, {raw_hba1c_escapes} broken escaped tags (Target: 0)")
