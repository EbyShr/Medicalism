import glob, sys, re, os
sys.stdout.reconfigure(encoding='utf-8')

formulas = []
for f in sorted(glob.glob('chapters/Surgery/*.md')):
    with open(f, 'r', encoding='utf-8') as fp:
        txt = fp.read()
    matches = re.findall(r'\$\$([\s\S]*?)\$\$', txt)
    for m in matches:
        formulas.append((os.path.basename(f), m.strip()))

print(f'Total display formulas ($$...$$): {len(formulas)}')
for f, form in formulas:
    print(f'=== {f}:\n{form}\n')
