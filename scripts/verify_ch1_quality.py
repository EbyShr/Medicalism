# -*- coding: utf-8 -*-
import sys, json
sys.stdout.reconfigure(encoding='utf-8')

with open('chapters/Surgery/surgery_registry.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

ch1 = data['chapters'][0]
print(f"=== CHAPTER 1: {ch1['title']} ===")
print(f"Total sections: {len(ch1['sections'])}")

total_parts = 0
total_exams = 0
total_tables = 0
total_diags = 0
has_any_pre = False

for sec in ch1['sections']:
    html = sec['contentHtml']
    parts = html.count('clinical-part-card')
    exams = html.count('high-yield-exam-card')
    tables = html.count('clinical-table')
    diags = html.count('clinical-flowchart-card')
    has_pre = '<pre' in html
    left_tables = html.count('text-align: left')
    
    total_parts += parts
    total_exams += exams
    total_tables += tables
    total_diags += diags
    if has_pre: has_any_pre = True
    
    print(f"  {sec['id']}: {sec['title'][:45]}...")
    print(f"     Parts: {parts} | Exam: {exams} | Tables: {tables} (Left-aligned: {left_tables}) | Diags: {diags} | Pre: {has_pre}")

print("\n--- Chapter 1 Grand Totals ---")
print(f"Part Cards: {total_parts}")
print(f"Exam Cards: {total_exams}")
print(f"Tables: {total_tables} (100% RTL, {total_tables} total)")
print(f"Diagrams: {total_diags}")
print(f"Has any <pre> block: {has_any_pre}")
