import os
import glob
import re

upload_dir = r"C:\Users\abolf\.gemini\antigravity\brain\7b44df4f-6241-414b-b3c9-303aa89ce9b5\.user_uploaded"
files = glob.glob(os.path.join(upload_dir, "*.md"))
files.sort(key=lambda x: os.path.getmtime(x))

for fpath in files:
    fname = os.path.basename(fpath)
    size = os.path.getsize(fpath)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    first_few = [line for line in content.splitlines() if line.strip()][:5]
    questions = re.findall(r"##\s*سوال\s*[\d\u06F0-\u06F9]+", content)
    print(f"File: {fname} | Size: {size} bytes | Questions: {len(questions)}")
    for line in first_few[:2]:
        print(f"   {line}")
    print("-" * 50)
