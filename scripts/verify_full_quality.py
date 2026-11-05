import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')

with open('chapters/Surgery/surgery_registry.json', 'r', encoding='utf-8') as f:
    reg = json.load(f)

total_sections = 0
all_html = ""
for ch in reg['chapters']:
    for s in ch['sections']:
        total_sections += 1
        all_html += s.get('contentHtml', '') + "\n"

print("=================================================================")
print(f"FULL REGISTRY QUALITY AUDIT: 22 CHAPTERS, {total_sections} SECTIONS")
print("=================================================================")

# 1. Raw Carets (^)
carets = re.findall(r'.{0,25}\^.{0,25}', all_html)
print(f"1. Raw Carets (^) in generated HTML: {len(carets)}")
if carets:
    for c in carets[:5]:
        print("   Sample caret:", c)

# 2. Raw $$ in HTML
dollars = re.findall(r'\$\$', all_html)
print(f"2. Raw $$ display math tokens in HTML: {len(dollars)}")

# 3. Unescaped LaTeX Arrows
arrows = re.findall(r'\\(?:rightarrow|longrightarrow|longleftrightarrow|leftarrow|to\b)', all_html)
print(f"3. Unescaped LaTeX arrow commands: {len(arrows)}")

# 4. Display Formula Boxes
formulas = re.findall(r'<div class="med-formula-box"[^>]*>', all_html)
print(f"4. Total Display Formula Boxes: {len(formulas)}")

# 5. Fractions
fractions = re.findall(r'<span class="med-fraction">', all_html)
print(f"5. Total Rendered Fractions: {len(fractions)}")

# 6. Superscripts and Subscripts
sups = re.findall(r'<sup>', all_html)
subs = re.findall(r'<sub>', all_html)
print(f"6. Total Superscripts (<sup>): {len(sups)}")
print(f"   Total Subscripts (<sub>): {len(subs)}")

# 7. Check HCO3- and Na+
hco3_count = len(re.findall(r'HCO<sub>3</sub><sup>-</sup>', all_html))
na_count = len(re.findall(r'Na<sup>\+</sup>', all_html))
k_count = len(re.findall(r'K<sup>\+</sup>', all_html))
cl_count = len(re.findall(r'Cl<sup>-</sup>', all_html))
print(f"7. Key Chemical Ions:")
print(f"   HCO3- count: {hco3_count}")
print(f"   Na+ count:   {na_count}")
print(f"   K+ count:    {k_count}")
print(f"   Cl- count:   {cl_count}")

# 8. Check for raw code blocks (<pre>)
pres = re.findall(r'<pre\b', all_html)
print(f"8. Raw <pre> blocks in HTML: {len(pres)}")

print("=================================================================")
print("ALL QUALITY CHECKS COMPLETED!")
