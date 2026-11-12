import json

with open('data/quizzes/surgery_manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

print(f"Total chapters: {len(manifest)}")
total_q = sum(c['totalQuestions'] for c in manifest.values())
print(f"Total questions: {total_q}")
for i, (slug, meta) in enumerate(manifest.items()):
    print(f"{i+1}. {slug}: {meta['totalQuestions']} Qs - {meta['title']}")
