import sys

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

target = """            <p class="bento-card-text">
              درسنامه جامع بالینی بر اساس رفرنس مصوب لارنس، آناتومی جدار شکم، فتق‌های ونترال و اینگوئینال، الگوریتم‌های لحظه‌به‌لحظه اختناق و اورژانس، تکنیک‌های باز و لاپاراسکوپی، مش‌ها و پیشگیری از عوارض بعد عمل.
            </p>

            <div class="bento-tags-list">
              <span class="bento-tag">فصل ۱۰ لارنس</span>
              <span class="bento-tag">۷ بخش بالینی</span>
              <span class="bento-tag">الگوریتم‌های گام‌به‌گام</span>
              <span class="bento-tag">مرور شب امتحان</span>
            </div>"""

replacement = """            <p class="bento-card-text">
              درسنامه جامع بالینی بر اساس رفرنس مصوب لارنس (Lawrence)، پوشش کامل ۱۴ فصل جراحی جنرال شامل ارزیابی پری‌اپراتیو، آب و الکترولیت، شوک، تروما، جدار شکم و فتق‌ها، کبد، صفرا، لوزالمعده، معده، عروق و مراقبت‌های ویژه (SICU).
            </p>

            <div class="bento-tags-list">
              <span class="bento-tag">۱۴ فصل رفرنس لارنس</span>
              <span class="bento-tag">۱۰۰ مبحث بالینی</span>
              <span class="bento-tag">۸۸ الگوریتم و فلوچارت</span>
              <span class="bento-tag">مرور شب امتحان</span>
            </div>"""

if target in content:
    content = content.replace(target, replacement)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESS: index.html updated successfully!")
else:
    # Try normalizing line endings
    content_norm = content.replace('\r\n', '\n')
    target_norm = target.replace('\r\n', '\n')
    if target_norm in content_norm:
        content_norm = content_norm.replace(target_norm, replacement.replace('\r\n', '\n'))
        with open('index.html', 'w', encoding='utf-8') as f:
            f.write(content_norm)
        print("SUCCESS: index.html updated successfully with normalized newlines!")
    else:
        print("Target not found directly.")
