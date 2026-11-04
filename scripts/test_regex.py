import re
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sample = 'بخش ۱: مبانی بیولوژیک و مراحل التیام زخم (صفحات ۱ تا ۳ PDF لارنس)'
print("Characters:", [ord(c) for c in sample])

# Test regex
t = re.sub(r'\s*\([^)]*صفح[هات]+[^)]*\)', '', sample)
print("Result with general paren match:", t)
