# -*- coding: utf-8 -*-
"""
Medicalism Alborz - Master OSCE, Computerized PMP (EPMP), KF & Surgery End-of-Rotation Guide Builder
Course: Surgery (جراحی جنرال لارنس - بسته ویژه آسکی و PMP البرز)
Source: Lawrence's Essentials of General Surgery + ABZUMS Department Materials (Dr. Shahram Shayan EPMP Guide)
Verbatim 100% Preservation with Zero Data Loss
"""

import os
import re
import json
import markdown
import sys

# Ensure UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Helper functions for latex math & table formatting
sys.path.insert(0, os.path.dirname(__file__))
import build_surgery_chapters as bsc

SECTION_DEFINITIONS = [
    # PART 1: گاید ۱: ارزیابی قبل عمل، تروما و مبانی
    {
        "pattern": r'(?m)^## ۱\. قوانین طلایی نرم‌افزار',
        "id": "surg-osce-01-epmp-rules",
        "title": "قوانین نرم‌افزار EPMP و فرمول نمره‌دهی",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "🖥️ قوانین EPMP"
    },
    {
        "pattern": r'(?m)^## ۲\. ایستگاه جامع KF:',
        "id": "surg-osce-02-kf-preop",
        "title": "ایستگاه KF: ارزیابی و آمادگی قبل از عمل",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "📋 ایستگاه KF"
    },
    {
        "pattern": r'(?m)^### الف\) اپروچ اولیه به بیمار مالتیپل تروما',
        "id": "surg-osce-03-trauma-abcde",
        "title": "تروما: اپروچ اولیه (ABCDE) و ۱۰ نکته تنفس",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "🩺 تروما ABCDE"
    },
    {
        "pattern": r'(?m)^### ب\) ایستگاه PMP و اسلایدهای پنوموتوراکس',
        "id": "surg-osce-04-pneumothorax",
        "title": "ایستگاه PMP: پنوموتوراکس (فشارنده و خودبه‌خودی)",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "🖥️ کیس PMP"
    },
    {
        "pattern": r'(?m)^### ج\) ایستگاه PMP ترومای نافذ توراکوآبدومینال',
        "id": "surg-osce-05-thoracoabdominal",
        "title": "ایستگاه PMP: ترومای توراکوآبدومینال و دیافراگم",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "🖥️ کیس PMP"
    },
    {
        "pattern": r'(?m)^### د\) اپروچ جامع به ترومای شکم',
        "id": "surg-osce-06-abdominal-trauma",
        "title": "ایستگاه PMP: ترومای شکم و خودزنی (نوروفیبروماتوز)",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "🖥️ کیس PMP"
    },
    {
        "pattern": r'(?m)^### هـ\) ایستگاه اسلاید ترومای بلانت شکم',
        "id": "surg-osce-07-blunt-liver",
        "title": "ایستگاه اسلاید: ترومای بلانت شکم، FAST و آسیب کبد",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "🖼️ اسلاید آسکی"
    },
    {
        "pattern": r'(?m)^### و\) تروما در مادر باردار',
        "id": "surg-osce-08-preg-trauma",
        "title": "تروما در بارداری، آنوریسم طحال و شکستگی هنگمن",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "🩺 تروماهای ویژه"
    },
    {
        "pattern": r'(?m)^### الف\) شوک، احیا و معیارهای کفایت احیا',
        "id": "surg-osce-09-shock-resuscitation",
        "title": "مباحث پایه: شوک و احیا و معیارهای کفایت احیا",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "📊 مبحث پایه"
    },
    {
        "pattern": r'(?m)^### ب\) آب، الکترولیت و کلیه در بیماران جراحی',
        "id": "surg-osce-10-fluids-renal",
        "title": "مباحث پایه: آسیب حاد کلیه (AKI)، هایپرکالمی و هایپرکلسمی",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "📊 مبحث پایه"
    },
    {
        "pattern": r'(?m)^### ج\) تغذیه در بیماران جراحی',
        "id": "surg-osce-11-nutrition",
        "title": "مباحث پایه: تغذیه روده‌ای (Enteral) و وریدی (TPN/PPN)",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "📊 مبحث پایه"
    },
    {
        "pattern": r'(?m)^### د\) هموستاز، انتقال خون و عوارض کاتتر مرکزی',
        "id": "surg-osce-12-hemostasis-transfusion",
        "title": "مباحث پایه: فاکتورهای انعقادی، TRALI، ABO و کاتتر پورت",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "📊 مبحث پایه"
    },
    {
        "pattern": r'(?m)^### هـ\) بیولوژی و مراحل ترمیم زخم و سوختگی',
        "id": "surg-osce-13-wound-burns",
        "title": "مباحث پایه: مراحل ترمیم زخم، انواع بستن زخم و سوختگی",
        "guideIndex": 1,
        "guideTitle": "گاید ۱: ارزیابی قبل عمل، تروما و مبانی",
        "badge": "📊 مبحث پایه"
    },

    # PART 2: گاید ۲: گوارش و شکم حاد
    {
        "pattern": r'(?m)^## ۱\. ایستگاه PMP و اسلاید پانکراتیت حاد',
        "id": "surg-osce-14-pancreatitis",
        "title": "ایستگاه PMP: پانکراتیت حاد (اورژانس، ICU و اوردر)",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "🖥️ کیس PMP"
    },
    {
        "pattern": r'(?m)^## ۲\. ایستگاه PMP و اسلاید انسداد روده باریک',
        "id": "surg-osce-15-sbo-gallstone-ileus",
        "title": "ایستگاه PMP: انسداد روده باریک (SBO) و ایلئوس سنگ صفراوی",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "🖥️ کیس PMP"
    },
    {
        "pattern": r'(?m)^## ۳\. ایستگاه PMP ولولوس سیگموئید',
        "id": "surg-osce-16-sigmoid-cecal-volvulus",
        "title": "ایستگاه PMP: ولولوس سیگموئید در برابر ولولوس سکوم",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "🖥️ کیس PMP"
    },
    {
        "pattern": r'(?m)^### الف\) ایستگاه اسلاید پرفوراسیون زخم پپتیک',
        "id": "surg-osce-17-perforated-pud",
        "title": "ایستگاه اسلاید: پرفوراسیون زخم پپتیک در مصرف‌کننده متادون",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "🖼️ اسلاید آسکی"
    },
    {
        "pattern": r'(?m)^### ب\) ایستگاه PMP خونریزی زخم پپتیک',
        "id": "surg-osce-18-bleeding-pud",
        "title": "ایستگاه PMP: خونریزی زخم پپتیک (Upper GI Bleeding)",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "🖥️ کیس PMP"
    },
    {
        "pattern": r'(?m)^### ج\) اپروچ به ریفلاکس معده به مری',
        "id": "surg-osce-19-gerd",
        "title": "اپروچ به ریفلاکس معده به مری (GERD) و درمان",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "🩺 گوارش بالینی"
    },
    {
        "pattern": r'(?m)^### د\) گاسترینوما',
        "id": "surg-osce-20-gastrinoma",
        "title": "گاسترینوما / سندرم زولینگر-الیسون (ZES)",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "🧬 تومور نورواندوکرین"
    },
    {
        "pattern": r'(?m)^### هـ\) تومور استرومال گوارشی',
        "id": "surg-osce-21-gist",
        "title": "تومور استرومال گوارشی (GIST معده و تومور c-kit+)",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "🧬 تومور GIST"
    },
    {
        "pattern": r'(?m)^### و\) بلع مواد سوزاننده',
        "id": "surg-osce-22-caustic-ingestion",
        "title": "بلع مواد سوزاننده (Corrosive / Caustic Ingestion)",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "⚠️ اورژانس سوزاننده"
    },
    {
        "pattern": r'(?m)^### الف\) کدام روش هم تشخیصی و هم درمانی',
        "id": "surg-osce-23-choledocholithiasis-gb-cancer",
        "title": "سنگ کلدوک (ERCP) و ریسک‌فاکتورهای کنسر کیسه صفرا",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "🩺 مجاری صفراوی"
    },
    {
        "pattern": r'(?m)^### الف\) آپاندیسیت حاد و ۵ تشخیص افتراقی',
        "id": "surg-osce-24-acute-appendicitis",
        "title": "آپاندیسیت حاد و ۵ تشخیص افتراقی درد RLQ",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "🩺 شکم حاد"
    },
    {
        "pattern": r'(?m)^### ب\) سندرم لینچ',
        "id": "surg-osce-25-lynch-syndrome",
        "title": "سندرم لینچ (Lynch Syndrome / HNPCC)",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "🧬 انکولوژی ارثی"
    },
    {
        "pattern": r'(?m)^### ج\) بررسی بیماری‌های رکتوم و درمان کنسر رکتوم',
        "id": "surg-osce-26-rectal-cancer",
        "title": "بررسی رکتوم و درمان کنسر رکتوم (توده <2 cm)",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "🩺 کولورکتال"
    },
    {
        "pattern": r'(?m)^### د\) اسلایدهای جراحی اطفال گوارش: پرولاپس رکتوم',
        "id": "surg-osce-27-pediatric-gi",
        "title": "جراحی اطفال: پرولاپس رکتوم و مقعد سوراخ‌نشده",
        "guideIndex": 2,
        "guideTitle": "گاید ۲: گوارش و شکم حاد",
        "badge": "👶 جراحی اطفال"
    },

    # PART 3: گاید ۳: پستان، اندوکرین، فتق، عروق و اطفال
    {
        "pattern": r'(?m)^## ۱\. ایستگاه PMP اپروچ به توده پستان',
        "id": "surg-osce-28-breast-mass-idc",
        "title": "ایستگاه PMP: توده پستان و کارسینوم داکتال انفیلتراتیو (IDC)",
        "guideIndex": 3,
        "guideTitle": "گاید ۳: پستان، اندوکرین، فتق، عروق و اطفال",
        "badge": "🖥️ کیس PMP"
    },
    {
        "pattern": r'(?m)^## ۲\. ایستگاه PMP اپروچ به ندول تیروئید',
        "id": "surg-osce-29-thyroid-parathyroid",
        "title": "ایستگاه PMP: ندول تیروئید (بتسدا) و هایپرپاراتیروئیدیسم ثالثیه",
        "guideIndex": 3,
        "guideTitle": "گاید ۳: پستان، اندوکرین، فتق، عروق و اطفال",
        "badge": "🖥️ کیس PMP"
    },
    {
        "pattern": r'(?m)^### الف\) اپروچ به فتق اینکارسره',
        "id": "surg-osce-30-hernia-wall",
        "title": "فتق اینکارسره، استرانگوله، هرنی انسیزیونال و دیاستاز رکتوس",
        "guideIndex": 3,
        "guideTitle": "گاید ۳: پستان، اندوکرین، فتق، عروق و اطفال",
        "badge": "🩺 فتق و جدار شکم"
    },
    {
        "pattern": r'(?m)^### د\) بیضه نزول‌نکرده در اطفال',
        "id": "surg-osce-31-cryptorchidism-udt",
        "title": "جراحی اطفال: بیضه نزول‌نکرده (UDT / Cryptorchidism)",
        "guideIndex": 3,
        "guideTitle": "گاید ۳: پستان، اندوکرین، فتق، عروق و اطفال",
        "badge": "👶 جراحی اطفال"
    },
    {
        "pattern": r'(?m)^### الف\) زخم پای دیابتی مزمن',
        "id": "surg-osce-32-diabetic-foot-cvi",
        "title": "زخم پای دیابتی ایسکمیک در برابر زخم نارسایی وریدی (CVI)",
        "guideIndex": 3,
        "guideTitle": "گاید ۳: پستان، اندوکرین، فتق، عروق و اطفال",
        "badge": "🩺 جراحی عروق"
    },
    {
        "pattern": r'(?m)^### ب\) ویژگی‌های افیوژن پلور ترانسوداتیو',
        "id": "surg-osce-33-pleural-effusion-lung-abscess",
        "title": "افیوژن پلور ترانسوداتیو و آبسه ریه (Lung Abscess)",
        "guideIndex": 3,
        "guideTitle": "گاید ۳: پستان، اندوکرین، فتق، عروق و اطفال",
        "badge": "🫁 توراکس و ریه"
    },
    {
        "pattern": r'(?m)^### د\) بررسی لنفادنیت / لنفادنوپاتی',
        "id": "surg-osce-34-lymphadenopathy",
        "title": "بررسی لنفادنیت / لنفادنوپاتی: بیوپسی باز در برابر سوزنی",
        "guideIndex": 3,
        "guideTitle": "گاید ۳: پستان، اندوکرین، فتق، عروق و اطفال",
        "badge": "🩺 سیستم لنفاوی"
    },
    {
        "pattern": r'(?m)^### الف\) درمان کارسینوم سلول بازال',
        "id": "surg-osce-35-bcc-sarcoma",
        "title": "ضایعات پوست و بافت نرم: BCC و سارکوم بافت نرم (STS)",
        "guideIndex": 3,
        "guideTitle": "گاید ۳: پستان، اندوکرین، فتق، عروق و اطفال",
        "badge": "🩺 پوست و سارکوم"
    }
]

def format_osce_tables(html_content):
    """
    Ensures 100% RTL colorful styling on all tables.
    """
    # Wrap tables in our colorful container
    def repl_table(m):
        tbl_inside = m.group(1)
        return f'<div class="table-container osce-table-wrapper" data-card-type="table"><table class="data-table clinical-table osce-table" dir="rtl">{tbl_inside}</table></div>'

    html_content = re.sub(r'<table>([\s\S]*?)</table>', repl_table, html_content)
    return html_content

def transform_decision_branches(html_content):
    """
    Transforms decision branch bullets:
    🔴 حالت/شاخه الف یا ناپایدار -> .branch-card-unstable (Rose/Red accent)
    🟢 حالت/شاخه ب یا پایدار -> .branch-card-stable (Teal/Emerald accent)
    """
    branch_b_lookahead = r'(?=(?:<br\s*/?>)?\s*(?:<li>\s*)?(?:-\s*)?<strong>(?:🟢\s*)?(?:حالت|شاخه)\s*ب)'
    
    # Branch A:
    html_content = re.sub(
        r'(?:<br\s*/?>)?\s*(?:<li>\s*)?(?:-\s*)?(<strong>(?:🔴\s*)?(?:حالت|شاخه)\s*الف[\s\S]*?</strong>[\s\S]*?)' + branch_b_lookahead,
        r'<div class="branch-card branch-card-unstable"><span class="branch-pill pill-unstable">🔴 حالت / شاخه الف (ناپایدار / لاپاراتومی / پریتونیت)</span>\1</div>',
        html_content
    )
    
    # Branch B:
    next_boundary_lookahead = r'(?=(?:<br\s*/?>)?\s*(?:<li>\s*)?(?:-\s*)?<strong>|</li>|</p>|<hr|</div>|\Z)'
    html_content = re.sub(
        r'(?:<br\s*/?>)?\s*(?:<li>\s*)?(?:-\s*)?(<strong>(?:🟢\s*)?(?:حالت|شاخه)\s*ب[\s\S]*?</strong>[\s\S]*?)' + next_boundary_lookahead,
        r'<div class="branch-card branch-card-stable"><span class="branch-pill pill-stable">🟢 حالت / شاخه ب (پایدار / درمان غیرجراحی / آندوسکوپیک)</span>\1</div>',
        html_content
    )

    # Hemodynamics
    html_content = re.sub(
        r'(?:<li>)?\s*(همودینامیک\s*<strong>ناپایدار[\s\S]*?)(?=</li>|<br\s*/?>|\Z)',
        r'<div class="branch-card branch-card-unstable"><span class="branch-pill pill-unstable">🔴 همودینامیک ناپایدار (Unstable)</span>\1</div>',
        html_content
    )
    html_content = re.sub(
        r'(?:<li>)?\s*(همودینامیک\s*<strong>پایدار[\s\S]*?)(?=</li>|<br\s*/?>|\Z)',
        r'<div class="branch-card branch-card-stable"><span class="branch-pill pill-stable">🟢 همودینامیک پایدار (Stable)</span>\1</div>',
        html_content
    )

    return html_content

def transform_inline_badges(html_content):
    """
    Transforms inline negative traps (❌/🚫) and positive actions (✅) into mini visual alert cards.
    """
    # Inline negative items
    def repl_neg_item(m):
        inner = m.group(1).strip()
        inner = re.sub(r'^(?:❌|🚫|⛔)\s*', '', inner)
        return f'<div class="epmp-negative-inline-box epmp-negative-box" data-card-type="negative-trap"><div class="epmp-box-badge epmp-badge-negative"><span class="trap-pulse-dot"></span>⛔ نمره منفی در EPMP — کلیک نکنید!</div><div class="epmp-box-body">{inner}</div></div>'

    html_content = re.sub(r'<li>\s*(?:❌|🚫|⛔)([\s\S]*?)</li>', repl_neg_item, html_content)
    html_content = re.sub(r'<p>\s*(?:❌|🚫|⛔)([\s\S]*?)</p>', repl_neg_item, html_content)

    # Inline positive items
    def repl_pos_item(m):
        inner = m.group(1).strip()
        inner = re.sub(r'^✅\s*', '', inner)
        return f'<div class="epmp-positive-inline-box epmp-positive-box" data-card-type="positive-action"><div class="epmp-box-badge epmp-badge-positive"><span class="badge-icon">✅</span> انتخاب الزامی در EPMP (نمره مثبت)</div><div class="epmp-box-body">{inner}</div></div>'

    html_content = re.sub(r'<li>\s*✅([\s\S]*?)</li>', repl_pos_item, html_content)
    html_content = re.sub(r'<p>\s*✅([\s\S]*?)</p>', repl_pos_item, html_content)

    return html_content

def parse_osce_section_content(section_md):
    """
    Parses a single section markdown into rich semantic HTML with OSCE/PMP visual widgets.
    """
    section_md = section_md.replace('\r\n', '\n')

    # Convert display math $$...$$
    def repl_display_math(m):
        raw = m.group(1).strip()
        h = bsc.render_latex_to_html(raw)
        return f'\n\n<div class="med-formula-box" dir="ltr">{h}</div>\n\n'
    section_md = re.sub(r'\$\$([\s\S]*?)\$\$', repl_display_math, section_md)

    # Convert inline math $...$
    def repl_inline_math(m):
        raw = m.group(1).strip()
        h = bsc.render_latex_to_html(raw)
        return f'<span class="med-math-inline" dir="ltr">{h}</span>'
    section_md = re.sub(r'\$([^\$\n]+)\$', repl_inline_math, section_md)

    # Detect sub-blocks marked by ### (or #####)
    # Sub-blocks:
    # 1. 📋 سناریو -> Case Vignette Card
    # 2. ✅ اقدامات الزامی -> EPMP Positive Box
    # 3. ❌ / 🚫 تله‌های نمره منفی -> EPMP Negative Box
    # 4. 📝 اوردر -> Order Sheet Card
    # 5. 💡 / ⚖️ -> Stagery Topic Card
    # 6. Other -> Standard block

    sub_matches = list(re.finditer(r'(?m)^(?P<hashes>#{3,5})\s+(?P<header>[^\n]+)$', section_md))
    
    if not sub_matches:
        # No subheaders, parse directly
        raw_html = markdown.markdown(section_md, extensions=['extra', 'sane_lists', 'nl2br'])
        raw_html = format_osce_tables(raw_html)
        raw_html = transform_decision_branches(raw_html)
        raw_html = transform_inline_badges(raw_html)
        raw_html = re.sub(r'\*\*([^\*\n]+)\*\*', r'<strong>\1</strong>', raw_html)
        raw_html = raw_html.replace('**', '')
        return f'<div class="osce-general-block">{raw_html}</div>'

    splits = [m.start() for m in sub_matches] + [len(section_md)]
    rendered_parts = []

    # Content before first subheader
    pre_content = section_md[:splits[0]].strip()
    if pre_content:
        # Strip section title line if it was duplicated
        pre_content = re.sub(r'^##\s+[^\n]+\n*', '', pre_content).strip()
        if pre_content:
            p_html = markdown.markdown(pre_content, extensions=['extra', 'sane_lists', 'nl2br'])
            p_html = format_osce_tables(p_html)
            p_html = transform_decision_branches(p_html)
            p_html = transform_inline_badges(p_html)
            p_html = re.sub(r'\*\*([^\*\n]+)\*\*', r'<strong>\1</strong>', p_html)
            p_html = p_html.replace('**', '')
            rendered_parts.append(f'<div class="osce-intro-block">{p_html}</div>')

    for i, m in enumerate(sub_matches):
        h_text = m.group('header').strip()
        chunk = section_md[splits[i]:splits[i+1]]
        # Remove the header line from chunk body
        chunk_lines = chunk.splitlines()
        header_line = chunk_lines[0]
        body_lines = chunk_lines[1:]
        body_md = '\n'.join(body_lines).strip()

        # Parse body markdown to HTML
        body_html = markdown.markdown(body_md, extensions=['extra', 'sane_lists', 'nl2br'])
        body_html = format_osce_tables(body_html)
        body_html = transform_decision_branches(body_html)
        body_html = transform_inline_badges(body_html)
        body_html = re.sub(r'\*\*([^\*\n]+)\*\*', r'<strong>\1</strong>', body_html)
        body_html = body_html.replace('**', '')

        # Classify subheader
        if any(k in h_text for k in ['📋', 'سناریو', 'شرح سناریو', 'صورت سوال']):
            # 1. Case Vignette Card
            card = f'''<div class="case-vignette-card" data-card-type="case">
  <div class="case-vignette-header">
    <div class="case-vignette-title-group">
      <span class="case-vignette-badge">📋 سناریوی بالینی (Clinical Vignette)</span>
      <h3 class="case-vignette-heading">{h_text}</h3>
    </div>
  </div>
  <div class="case-vignette-body">
    {body_html}
  </div>
</div>'''
        elif any(k in h_text for k in ['✅', 'اقدامات و گزینه‌های الزامی', 'پاسخ جامع', 'دستورات مدیریت']):
            # 2. Positive EPMP Action Card
            card = f'''<div class="epmp-positive-box" data-card-type="positive-action">
  <div class="epmp-box-badge epmp-badge-positive">
    <span class="badge-icon">✅</span> انتخاب الزامی در EPMP (نمره مثبت)
  </div>
  <h3 class="epmp-box-title">{h_text}</h3>
  <div class="epmp-box-body">
    {body_html}
  </div>
</div>'''
        elif any(k in h_text for k in ['❌', '🚫', 'تله‌های نمره منفی', 'نمره منفی']):
            # 3. Negative EPMP Trap Card
            card = f'''<div class="epmp-negative-box" data-card-type="negative-trap">
  <div class="epmp-box-badge epmp-badge-negative">
    <span class="trap-pulse-dot"></span>⛔ نمره منفی در EPMP — کلیک نکنید! («در این مرحله اندیکاسیون ندارد»)
  </div>
  <h3 class="epmp-box-title">{h_text}</h3>
  <div class="epmp-box-body">
    {body_html}
  </div>
</div>'''
        elif any(k in h_text for k in ['📝', 'اوردر', 'Order']):
            # 4. Hospital Order Sheet
            card = f'''<div class="order-sheet-card" data-card-type="order">
  <div class="order-sheet-header">
    <div class="order-sheet-header-title">
      <span class="order-sheet-icon">📝</span>
      <span class="order-sheet-title">برگه اوردر استاندارد بیمارستانی (Physician Hospital Order Sheet)</span>
    </div>
    <span class="order-sheet-badge">بخش جراحی البرز</span>
  </div>
  <h3 class="order-sheet-subtitle">{h_text}</h3>
  <div class="order-sheet-body">
    {body_html}
  </div>
</div>'''
        elif any(k in h_text for k in ['💡', '⚖️', 'مبحث ویژه', 'مقایسه طلایی', 'جدول کامل', 'مباحث پایه']):
            # 5. Stagery Topic / Comparison Card
            card = f'''<div class="stagery-topic-card" data-card-type="stagery">
  <div class="stagery-topic-badge">💡 مبحث کلیدی و های‌یلد استاجری جراحی</div>
  <h3 class="stagery-topic-title">{h_text}</h3>
  <div class="stagery-topic-body">
    {body_html}
  </div>
</div>'''
        else:
            # Standard section part card
            card = f'''<div class="osce-part-card" data-card-type="general">
  <h3 class="osce-part-title">{h_text}</h3>
  <div class="osce-part-body">
    {body_html}
  </div>
</div>'''

        rendered_parts.append(card)

    full_html = '\n'.join(rendered_parts)
    return full_html

def generate_quick_filter_bar_html():
    """Generates the sticky exam-day quick filter pill bar."""
    return '''<!-- Quick Exam-Day Filter Bar -->
<div class="osce-quick-filter-bar sticky-filter-bar" id="osceQuickFilterBar">
  <div class="filter-bar-header">
    <div class="filter-bar-label">
      <span class="filter-bolt-icon">⚡</span>
      <span class="filter-title">فیلتر سریع روز امتحان:</span>
    </div>
    <div class="filter-active-count" id="osceFilterActiveCount">نمایش ۱۰۰٪ محتوای بسته جامع آزمون</div>
  </div>
  <div class="filter-pills-group" role="group" aria-label="فیلترهای محتوای آزمونی">
    <button type="button" class="osce-filter-btn is-active" data-filter="all" onclick="window.applyOSCEFilter && window.applyOSCEFilter('all')">
      <span>📚 نمایش کامل همه بخش‌ها</span>
    </button>
    <button type="button" class="osce-filter-btn" data-filter="cases" onclick="window.applyOSCEFilter && window.applyOSCEFilter('cases')">
      <span>🖥️ فقط کیس‌های PMP و KF</span>
    </button>
    <button type="button" class="osce-filter-btn filter-btn-danger" data-filter="negative" onclick="window.applyOSCEFilter && window.applyOSCEFilter('negative')">
      <span class="trap-pulse-dot"></span>
      <span>⛔ فقط تله‌های نمره منفی EPMP</span>
    </button>
    <button type="button" class="osce-filter-btn" data-filter="orders" onclick="window.applyOSCEFilter && window.applyOSCEFilter('orders')">
      <span>📝 فقط اوردرها (Orders)</span>
    </button>
    <button type="button" class="osce-filter-btn" data-filter="tables" onclick="window.applyOSCEFilter && window.applyOSCEFilter('tables')">
      <span>📊 فقط جداول و ۵۰ مبحث استاجری</span>
    </button>
  </div>
</div>'''

def build_osce_module(base_dir):
    """
    Main builder for Master OSCE, PMP, and KF Surgery Guide.
    Processes the markdown file and creates the flagship chapter record.
    """
    md_path = os.path.join(base_dir, 'chapters', 'Surgery', 'Master OSCE, PMP, and KF Surgery Guide.md')
    if not os.path.exists(md_path):
        print(f"Error: Markdown file not found at: {md_path}")
        return None

    with open(md_path, 'r', encoding='utf-8') as f:
        full_text = f.read()

    # Find matches for all 35 sections
    matched = []
    for defn in SECTION_DEFINITIONS:
        pat = defn['pattern']
        m = re.search(pat, full_text)
        if not m:
            print(f"ERROR: Could not find section pattern: {pat}")
            return None
        matched.append((m.start(), defn))

    matched.sort(key=lambda x: x[0])

    sections = []
    for i in range(len(matched)):
        start_idx = matched[i][0]
        end_idx = matched[i+1][0] if i+1 < len(matched) else len(full_text)
        chunk = full_text[start_idx:end_idx]
        defn = matched[i][1]

        # Parse chunk to rich HTML
        content_html = parse_osce_section_content(chunk)

        # Extract plain text summary
        clean_text = re.sub(r'<[^>]+>', ' ', content_html)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        summary = clean_text[:280] + '...' if len(clean_text) > 280 else clean_text

        sec_record = {
            "id": defn['id'],
            "title": defn['title'],
            "guideIndex": defn['guideIndex'],
            "guideTitle": defn['guideTitle'],
            "badge": defn['badge'],
            "contentHtml": content_html,
            "summary": summary
        }
        sections.append(sec_record)

    filter_bar_html = generate_quick_filter_bar_html()

    chapter_record = {
        "id": "surg-osce-pmp",
        "slug": "osce-pmp",
        "courseId": "surgery",
        "number": 0,
        "isFlagship": True,
        "isExam": True,
        "badgeText": "🔥 ویژه امتحان: آسکی، PMP و پایان‌بخش البرز",
        "title": "بسته ویژه: راهنمای جامع آزمون‌های آسکی (OSCE)، نرم‌افزار کامپیوتری PMP (EPMP)، ایستگاه KF و پایان‌بخش جراحی البرز",
        "shortTitle": "🔥 ویژه امتحان: آسکی، PMP و پایان‌بخش البرز",
        "latinTitle": "Master OSCE, Computerized PMP (EPMP), KF & Surgery End-of-Rotation Guide (ABZUMS)",
        "author": "دکتر شهرام شایان و هیئت علمی گروه جراحی عمومی البرز",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • بیمارستان‌های شهید مدنی و شهید رجایی • رفرنس لارنس و تجمیع اسلایدهای پایان‌بخش",
        "totalSections": len(sections),
        "estimatedReadTime": "مرور جامع و فشرده روز امتحان (۳۵ ایستگاه بالینی، کیس‌های PMP و تله‌های نمره منفی)",
        "filterBarHtml": filter_bar_html,
        "mindMapHtml": filter_bar_html,  # Injected directly above sections stream
        "sections": sections
    }

    return chapter_record

if __name__ == '__main__':
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    ch = build_osce_module(base_dir)
    if ch:
        print(f"SUCCESS: OSCE Module built with {len(ch['sections'])} sections.")
    else:
        print("FAILED to build OSCE module.")
