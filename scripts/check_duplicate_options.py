import sys
sys.path.insert(0, '.')
import json
import os
from scripts.find_duplicates import duplicates

print(f'Checking {len(duplicates)} duplicate groups for matching options and answers:')
mismatched = []
for norm, list_qs in duplicates.items():
    q0 = list_qs[0][1]
    opts0 = set(opt['text'].strip() for opt in q0.get('options', []))
    for f, q in list_qs[1:]:
        opts = set(opt['text'].strip() for opt in q.get('options', []))
        if opts0 != opts:
            mismatched.append((list_qs[0], (f, q)))

print(f'Mismatched option groups among normalized stem duplicates: {len(mismatched)}')
for (f1, q1), (f2, q2) in mismatched:
    print(f'Mismatched: [{os.path.basename(f1)} #{q1["id"]}] vs [{os.path.basename(f2)} #{q2["id"]}]')
    print('  Stem:', q1['stem'][:60])
    print('  Opts 1:', [o['text'][:30] for o in q1.get('options', [])])
    print('  Opts 2:', [o['text'][:30] for o in q2.get('options', [])])
