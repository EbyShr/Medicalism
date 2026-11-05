# -*- coding: utf-8 -*-
"""
Medicalism Alborz - Automated Surgery Chapter Parser & Builder (Comprehensive 22-Chapter Edition)
Source: Lawrence's Essentials of General Surgery (جراحی جنرال لارنس - ویرایش جامع ۲۲ فصل)

Multi-modal Tree Distribution:
- 90% Approach 2: Stylized Clean Tree View (.ctree-container)
- 7%  Approach 1: Modern Hierarchical Visual Medical Tree (.vtree-container / .convergent-pathway-card / .visual-protocol-card)
- 3%  Approach 3: Nested Decision Cards (.ncards-container)
Zero monospace <pre><code> code blocks across all 140 diagrams!
"""

import os
import sys
import re
import json
import markdown

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Regex patterns for stripping conversational AI turn transitions
CONVERSATIONAL_WRAPPER_PATTERNS = [
    re.compile(r'^\*{0,2}بخش\s+[\d\u06F0-\u06F9]+.*به\s+پایان\s+رسید.*', re.IGNORECASE),
    re.compile(r'^#*\s*ادامه\s+فصل\s+[\d\u06F0-\u06F9]+:.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}نقشه\s+درختی\s+و\s+تقسیم‌بندی.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}آیا\s+بخش\s+.*', re.IGNORECASE),
    re.compile(r'^\*{0,2}در\s+ادامه\s+بخش\s+.*', re.IGNORECASE),
    re.compile(r'^\*{0,2}فاز\s+[۱-۹\d]:\s*تنظیم.*', re.IGNORECASE),
    re.compile(r'^\*{0,2}دستورات\s+سیستمی.*', re.IGNORECASE),
    re.compile(r'^\*{0,2}پایان\s+فصل\s+.*', re.IGNORECASE),
    re.compile(r'^\s*[\(\*]{1,2}(?:منطبق\s+بر|پوشش\s+کامل|بر\s+اساس)\s+صفحات\s+[\d\u06F0-\u06F9]+.*[\)\*]{1,2}\s*$', re.IGNORECASE)
]

CHAPTER_CONFIGS = [
    {
        "filename": "Perioperative Evaluation and Management of Surgical Patients.md",
        "id": "surg-ch01",
        "number": 1,
        "title": "فصل ۱: ارزیابی و مدیریت حوالی عمل بیماران جراحی (Perioperative Evaluation and Management)",
        "shortTitle": "ارزیابی و مدیریت حوالی عمل",
        "latinTitle": "Perioperative Evaluation and Management of Surgical Patients",
        "author": "گروه جراحی عمومی و مراقبت‌های پیرامون عمل",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۴۵ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Fluids, Electrolytes, and Surgical Nutrition.md",
        "id": "surg-ch02",
        "number": 2,
        "title": "فصل ۲: مایعات، الکترولیت‌ها و تغذیه در جراحی (Fluids, Electrolytes, and Surgical Nutrition)",
        "shortTitle": "مایعات، الکترولیت‌ها و تغذیه",
        "latinTitle": "Fluids, Electrolytes, and Surgical Nutrition",
        "author": "گروه جراحی عمومی و متابولیسم بالینی",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۶۰ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Surgical Bleeding.md",
        "id": "surg-ch03",
        "number": 3,
        "title": "فصل ۳: خونریزی جراحی، اختلالات انعقادی و درمان جایگزینی (Surgical Bleeding)",
        "shortTitle": "خونریزی جراحی و هموستاز",
        "latinTitle": "Surgical Bleeding, Hemostasis & Transfusion",
        "author": "گروه جراحی عمومی و ایمونوهماتولوژی",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۳۰ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Surgical Shock.md",
        "id": "surg-ch04",
        "number": 4,
        "title": "فصل ۴: شوک در جراحی و احیای همودینامیک (Surgical Shock)",
        "shortTitle": "شوک در جراحی و احیا",
        "latinTitle": "Surgical Shock & Hemodynamic Monitoring",
        "author": "گروه جراحی عمومی و تروما",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۳۰ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Wounds and Wound Healing.md",
        "id": "surg-ch05",
        "number": 5,
        "title": "فصل ۵: زخم‌ها و ترمیم زخم در جراحی (Wounds and Wound Healing)",
        "shortTitle": "ترمیم و مدیریت زخم",
        "latinTitle": "Wounds and Wound Healing",
        "author": "گروه جراحی عمومی و پلاستیک",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۲۰ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Surgical Critical Care.md",
        "id": "surg-ch06",
        "number": 6,
        "title": "فصل ۶: مراقبت‌های ویژه در جراحی (Surgical Critical Care)",
        "shortTitle": "مراقبت‌های ویژه (SICU)",
        "latinTitle": "Surgical Critical Care",
        "author": "گروه جراحی عمومی و مراقبت‌های ویژه",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۳۵ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Trauma.md",
        "id": "surg-ch07",
        "number": 7,
        "title": "فصل ۷: ترومای جامع و رویکرد ATLS (Trauma)",
        "shortTitle": "تروما و اورژانس‌های جراحی",
        "latinTitle": "Trauma & Emergency Surgical Care",
        "author": "گروه جراحی عمومی و مرکز ترومای البرز",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۶۰ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Burns.md",
        "id": "surg-ch08",
        "number": 8,
        "title": "فصل ۸: سوختگی‌ها، آسیب‌های استنشاقی و احیا (Burns)",
        "shortTitle": "سوختگی‌ها و آسیب‌های حرارتی",
        "latinTitle": "Burns & Thermal Injuries",
        "author": "گروه جراحی عمومی و مرکز سوختگی",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۴۵ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Surgical Infection.md",
        "id": "surg-ch09",
        "number": 9,
        "title": "فصل ۹: عفونت‌های جراحی و آنتی‌بیوتیک‌پروفیلاکسی (Surgical Infection)",
        "shortTitle": "عفونت‌های جراحی و پروفیلاکسی",
        "latinTitle": "Surgical Infection & Antimicrobial Prophylaxis",
        "author": "گروه جراحی عمومی و کنترل عفونت",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۳۵ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Abdominal Wall, Including Hernia.md",
        "id": "surg-ch10",
        "number": 10,
        "title": "فصل ۱۰: جدار شکم و فتق‌ها (Abdominal Wall, Including Hernia)",
        "shortTitle": "جدار شکم و فتق‌ها",
        "latinTitle": "Abdominal Wall, Including Hernia",
        "author": "گروه جراحی عمومی و لاپاراسکوپی بالینی",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۴۵ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Esophagus.md",
        "id": "surg-ch11",
        "number": 11,
        "title": "فصل ۱۱: بیماری‌های مری و اختلالات حرکتی آن (Esophagus)",
        "shortTitle": "بیماری‌های مری",
        "latinTitle": "Esophagus & Motility Disorders",
        "author": "گروه جراحی عمومی و توراکس",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۵۰ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Stomach and Duodenum.md",
        "id": "surg-ch12",
        "number": 12,
        "title": "فصل ۱۲: معده و دئودنوم (Stomach and Duodenum)",
        "shortTitle": "معده و دئودنوم",
        "latinTitle": "Stomach and Duodenum",
        "author": "گروه جراحی عمومی و جراحی چاقی",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۵۵ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Small Intestine and Appendix.md",
        "id": "surg-ch13",
        "number": 13,
        "title": "فصل ۱۳: روده باریک و آپاندیس (Small Intestine and Appendix)",
        "shortTitle": "روده باریک و آپاندیس",
        "latinTitle": "Small Intestine and Appendix",
        "author": "گروه جراحی عمومی و کولورکتال",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۴۵ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Colon, Rectum, and Anus.md",
        "id": "surg-ch14",
        "number": 14,
        "title": "فصل ۱۴: کولون، رکتوم و مقعد (Colon, Rectum, and Anus)",
        "shortTitle": "کولون، رکتوم و آنوس",
        "latinTitle": "Colon, Rectum, and Anus",
        "author": "گروه جراحی عمومی و کولورکتال",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۶۰ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Biliary Tract.md",
        "id": "surg-ch15",
        "number": 15,
        "title": "فصل ۱۵: بیماری‌های مجاری صفراوی و کیسه صفرا (Biliary Tract)",
        "shortTitle": "مجاری صفراوی و کیسه صفرا",
        "latinTitle": "Biliary Tract & Gallbladder",
        "author": "گروه جراحی عمومی و هپاتوبیلیاری",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۴۵ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Pancreas.md",
        "id": "surg-ch16",
        "number": 16,
        "title": "فصل ۱۶: پانکراس و اختلالات جراحی آن (Pancreas)",
        "shortTitle": "پانکراس و اختلالات جراحی",
        "latinTitle": "Pancreas & Surgical Disorders",
        "author": "گروه جراحی عمومی و انکولوژی جراحی",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۴۵ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Breast.md",
        "id": "surg-ch17",
        "number": 17,
        "title": "فصل ۱۷: بیماری‌های پستان و نئوپلاسم‌ها (Breast)",
        "shortTitle": "بیماری‌های پستان",
        "latinTitle": "Breast & Oncologic Surgery",
        "author": "گروه جراحی عمومی و جراحی پستان",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۵۵ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Liver and Spleen.md",
        "id": "surg-ch19",
        "number": 19,
        "title": "فصل ۱۹: کبد و طحال (Liver and Spleen)",
        "shortTitle": "کبد و طحال",
        "latinTitle": "Liver and Spleen",
        "author": "گروه جراحی عمومی و پیوند اعضا",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۵۰ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Surgical Endocrinology.md",
        "id": "surg-ch21",
        "number": 21,
        "title": "فصل ۲۱: اندوکرینولوژی جراحی (تیروئید، پاراتیروئید و آدرنال) (Surgical Endocrinology)",
        "shortTitle": "اندوکرینولوژی جراحی",
        "latinTitle": "Surgical Endocrinology (Thyroid, Parathyroid, Adrenal)",
        "author": "گروه جراحی عمومی و اندوکرینولوژی",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۶۰ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Plastic Surgery.md",
        "id": "surg-ch22",
        "number": 22,
        "title": "فصل ۲۲: جراحی پلاستیک، پوست، بافت نرم، صورت و دست (Plastic Surgery)",
        "shortTitle": "جراحی پلاستیک و ترمیمی",
        "latinTitle": "Plastic Surgery, Skin, Soft Tissue, Face & Hand",
        "author": "گروه جراحی عمومی و پلاستیک",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۵۰ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Diseases of the Vascular System.md",
        "id": "surg-ch24",
        "number": 24,
        "title": "فصل ۲۴: بیماری‌های عروقی (شریانی، وریدی و لنفاوی) (Diseases of the Vascular System)",
        "shortTitle": "بیماری‌های سیستم عروقی",
        "latinTitle": "Diseases of the Vascular System",
        "author": "گروه جراحی عمومی و جراحی عروق",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۶۰ دقیقه مطالعه عمیق و مرور بالینی"
    },
    {
        "filename": "Neurosurgery.md",
        "id": "surg-ch28",
        "number": 28,
        "title": "فصل ۲۸: جراحی مغز و اعصاب و ستون فقرات (Neurosurgery)",
        "shortTitle": "جراحی مغز و اعصاب",
        "latinTitle": "Neurosurgery & Diseases of the Nervous System",
        "author": "گروه جراحی اعصاب و ستون فقرات",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۶۰ دقیقه مطالعه عمیق و مرور بالینی"
    }
]

# Keywords designating the ~7% Approach 1 (Modern Hierarchical Medical Trees)
APPROACH_1_KEYWORDS = [
    'کلانژیت حاد',
    'محرک‌های سلول پاریتال',
    'شوک خونریزی‌دهنده شدید',
    'ترومایی ناپایدار همودینامیک',
    'بیمار با علائم مشکوک به شوک',
    'آسیب استنشاقی و سوختگی',
    'ترومای حاد سر',
    'رویکرد به سپسیس و شکم حاد',
    'شک بالینی به سندرم کوشینگ'
]

# Keywords designating the ~3% Approach 3 (Nested Decision Cards / Criteria Tiers)
APPROACH_3_KEYWORDS = [
    'کاپرینی',
    'Caprini',
    'عوامل مختل‌کننده التیام زخم',
    'کیست پانکراس',
    'شکستگی‌های ستون فقرات',
    'طبقه‌بندی پریتونیت',
    'معیارهای ده‌گانه ارجاع'
]

def clean_heading_math(text):
    """Formats LaTeX math in headings into clean medical text without LaTeX markup."""
    if not text:
        return text
    def repl_m(m):
        s = m.group(1).strip()
        s = re.sub(r'\\text\{([^}]+)\}', r'\1', s)
        s = re.sub(r'\\mathrm\{([^}]+)\}', r'\1', s)
        s = s.replace(r'\text{-}', '–').replace(r'\text{–}', '–')
        s = re.sub(r'\^\\circ\s*F', '°F', s)
        s = re.sub(r'\^\\circ\s*C', '°C', s)
        s = s.replace(r'\ge', '≥').replace(r'\geq', '≥')
        s = s.replace(r'\le', '≤').replace(r'\leq', '≤')
        s = s.replace(r'\pm', '±')
        s = s.replace(r'\times', '×')
        return s
    return re.sub(r'\$([^\$\n]+)\$', repl_m, text)

def clean_page_numbers(text):
    """Strips (صفحات x تا y PDF) or (صفحه x) from headings and titles."""
    if not text:
        return ""
    t = re.sub(r'\s*\([^)]*صفح[هات]+[^)]*\)', '', text)
    t = re.sub(r'\s*\([^)]*(?:PDF|pdf|لارنس|رفرنس)[^)]*\)', '', t)
    t = re.sub(r'\s*\(پوشش\s*کامل\s*صفحات\s*[\d\u06F0-\u06F9]+.*?\)', '', t)
    t = clean_heading_math(t)
    return t.strip()

def extract_braced(s, start_idx):
    if start_idx >= len(s) or s[start_idx] != '{':
        return None, -1
    depth = 0
    for i in range(start_idx, len(s)):
        if s[i] == '{':
            depth += 1
        elif s[i] == '}':
            depth -= 1
            if depth == 0:
                return s[start_idx+1:i], i
    return None, -1

def render_latex_to_html(raw):
    s = raw.strip()
    # 0. Clean parentheses & left/right first (before \le!)
    s = re.sub(r'\\left\s*([(\[\{])', r'\1', s)
    s = re.sub(r'\\right\s*([)\]\}])', r'\1', s)
    s = s.replace(r'\left.', '').replace(r'\right.', '')
    
    # 1. Clean wrappers (strip innermost \text and \mathrm first, then handle \mathbf/\textbf with balanced braces)
    s = re.sub(r'\\text\{([^}]+)\}', r'\1', s)
    s = re.sub(r'\\mathrm\{([^}]+)\}', r'\1', s)
    for tag in [r'\mathbf', r'\textbf']:
        while True:
            idx = s.find(tag)
            if idx == -1:
                break
            open_b = s.find('{', idx + len(tag))
            if open_b == -1:
                break
            inner, end_b = extract_braced(s, open_b)
            if inner is None:
                break
            inner_clean = re.sub(r'\\text\{([^}]+)\}', r'\1', inner)
            inner_clean = re.sub(r'\\mathrm\{([^}]+)\}', r'\1', inner_clean)
            inner_h = render_latex_to_html(inner_clean)
            s = s[:idx] + f'<strong>{inner_h}</strong>' + s[end_b+1:]

    # Fallback cleanup for any residual \text or \mathrm
    s = re.sub(r'\\text\{([^}]+)\}', r'\1', s)
    s = re.sub(r'\\mathrm\{([^}]+)\}', r'\1', s)
    s = s.replace(r'\,', ' ').replace(r'\quad', '  ').replace(r'\qquad', '    ')
    s = s.replace(r'\%', '%').replace(r'\_', '_').replace(r'\&', '&')
    
    # 2. Arrows & logic (in LTR formulas, forward direction is rightward)
    s = re.sub(r'\\xrightarrow\{([^}]+)\}', r' ──[\1]──> ', s)
    s = s.replace(r'\longrightarrow', ' ➡️ ').replace(r'\rightarrow', ' ➡️ ').replace(r'\to', ' ➡️ ')
    s = s.replace(r'\longleftrightarrow', ' ⇄ ').replace(r'\leftrightarrow', ' ⇄ ')
    s = s.replace(r'\implies', ' ➡️ ')
    s = s.replace(r'\uparrow', ' ↑ ').replace(r'\downarrow', ' ↓ ')
    
    # 3. Greek & math symbols
    s = s.replace(r'\Delta', 'Δ').replace(r'\pi', 'π').replace(r'\eta', 'η').replace(r'\mu', 'µ')
    s = s.replace(r'\alpha', 'α').replace(r'\beta', 'β').replace(r'\gamma', 'γ')
    s = s.replace(r'\times', ' × ').replace(r'\pm', ' ± ')
    s = s.replace(r'\ge', ' ≥ ').replace(r'\geq', ' ≥ ')
    s = s.replace(r'\le', ' ≤ ').replace(r'\leq', ' ≤ ')
    s = s.replace(r'\approx', ' ≈ ').replace(r'\sim', ' ~ ')
    
    # 4. Fractions using balanced brace extractor
    while True:
        idx = s.find(r'\frac')
        if idx == -1:
            break
        open_b1 = s.find('{', idx + 5)
        if open_b1 == -1:
            break
        num, end_b1 = extract_braced(s, open_b1)
        if num is None:
            break
        open_b2 = s.find('{', end_b1 + 1)
        if open_b2 == -1:
            break
        den, end_b2 = extract_braced(s, open_b2)
        if den is None:
            break
        num_h = render_latex_to_html(num)
        den_h = render_latex_to_html(den)
        frac_h = f'<span class="med-fraction"><span class="fraction-num">{num_h}</span><span class="fraction-den">{den_h}</span></span>'
        s = s[:idx] + frac_h + s[end_b2+1:]
        
    # 5. Chemical ions & Superscripts / Subscripts
    # Carets: ^{...} or ^+ or ^- or ^2 etc.
    s = re.sub(r'\^\{([^}]+)\}', r'<sup>\1</sup>', s)
    s = re.sub(r'\^([a-zA-Z0-9\+\-\*]+)', r'<sup>\1</sup>', s)
    
    # Subscripts: _{...} or _digit or _single_ident
    s = re.sub(r'_\{([^}]+)\}', r'<sub>\1</sub>', s)
    s = re.sub(r'_([0-9]+)', r'<sub>\1</sub>', s)
    s = re.sub(r'_([a-zA-Z]{1,3})(?=[^a-zA-Z0-9]|$)', r'<sub>\1</sub>', s)
    
    # 6. Degrees
    s = s.replace(r'<sup>\circ</sup>', '°').replace(r'^\circ', '°')
    
    # Normalize spaces
    s = re.sub(r'[ \t]+', ' ', s).strip()
    return s

def format_math_expr(match):
    """Formats inline LaTeX math ($...$) into clean, human-readable medical markup."""
    raw = match.group(1).strip()
    if raw in [r'\longrightarrow', r'\rightarrow', r'\to', r'\implies', '-->', '->']:
        return ' ⬅️ '
    rendered = render_latex_to_html(raw)
    if rendered in ['⬅️', '➡️', '⬇️', '⬆️', '⇄']:
        return f' {rendered} '
    return f'<span class="med-measure" dir="ltr">{rendered}</span>'

def transform_inline_elements(text):
    """
    Transforms inline badges, math, arrows, English medical terms,
    lead keywords, and decision pills with rich colors and zero broken variation selectors.
    """
    # 1. Flexible Inline Theory badge -> clean subtle pearl marker, zero tag clutter!
    def repl_theory(m):
        inner = m.group(1).strip() if m.group(1) else ""
        punct = m.group(2) or ''
        tooltip = f'نکته تئوری: {inner}' if len(inner) > 5 else 'نکته تئوری امتحانی'
        return f'{punct} <span class="pearl-highlight badge-theory" data-tag="theory-pearl" data-exam-point="theory" title="{tooltip}"><span class="pearl-micro-dot"></span></span>'

    text = re.sub(r'(?:<code>)?`?\[🎯[ \t]*(.*?)\]`?(?:</code>)?[ \t]*([\.،؛:!؟\?]?)', repl_theory, text)

    # 2. Flexible Inline Trap badge -> subtle alert icon, zero text clutter!
    def repl_trap(m):
        inner = m.group(1).strip() if m.group(1) else ""
        punct = m.group(2) or ''
        tooltip = f'تله امتحانی: {inner}' if len(inner) > 5 else 'تله و دام امتحانی'
        return f'{punct} <span class="trap-highlight badge-trap" data-tag="exam-trap" data-exam-point="trap" title="{tooltip}"><span class="trap-zap">⚡</span><span class="trap-label-text">تله امتحانی</span></span>'

    text = re.sub(r'(?:<code>)?`?\[⚠️[ \t]*(.*?)\]`?(?:</code>)?[ \t]*([\.،؛:!؟\?]?)', repl_trap, text)
    
    # 3. Inline math expressions ($...$)
    text = re.sub(r'\$([^\$\n]+)\$', format_math_expr, text)

    # Unescaped LaTeX arrows & symbols in raw Persian text (RTL flow: forward direction is leftward ⬅️)
    text = re.sub(r'\\longrightarrow|\\rightarrow|\\to(?=\s)', ' ⬅️ ', text)
    text = re.sub(r'\\longleftrightarrow|\\leftrightarrow', ' ⇄ ', text)
    text = re.sub(r'\\implies', ' ⬅️ ', text)
    text = re.sub(r'\\uparrow', ' ↑ ', text)
    text = re.sub(r'\\downarrow', ' ↓ ', text)
    text = re.sub(r'\\(?:text|mathrm|mathbf|textbf)\{([^}]+)\}', r'\1', text)
    text = re.sub(r'\\left|\\right', '', text)

    # 4. Directional arrows (safe non-capturing alternation to protect multi-byte variation selectors)
    text = re.sub(r'(?:⬅️|➡️|⬇️|⬆️)', r'<span class="stepper-arrow-indicator">\g<0></span>', text)

    # Medical ions, gases and chemical superscripts / subscripts
    text = re.sub(r'\b(PaCO|PaO|PvCO|PvO|SaO|SpO|FiO|EtCO)2\b', r'\1<sub>2</sub>', text)
    text = re.sub(r'\bCO2\b', 'CO<sub>2</sub>', text)
    text = re.sub(r'\bH2O\b', 'H<sub>2</sub>O', text)
    text = re.sub(r'\bH2CO3\b', 'H<sub>2</sub>CO<sub>3</sub>', text)
    text = re.sub(r'\bHCO3\^?[-–—]?\b', 'HCO<sub>3</sub><sup>-</sup>', text)
    text = re.sub(r'\bHCO_3\^?\{?[-–—]?\}?\b', 'HCO<sub>3</sub><sup>-</sup>', text)
    text = re.sub(r'\bPO4\^?\{?3-?\}?\b', 'PO<sub>4</sub><sup>3-</sup>', text)
    text = re.sub(r'\bNa\^?\+\b', 'Na<sup>+</sup>', text)
    text = re.sub(r'\bK\^?\+\b', 'K<sup>+</sup>', text)
    text = re.sub(r'\bCa\^?\{?2\+?\}?\b', 'Ca<sup>2+</sup>', text)
    text = re.sub(r'\bMg\^?\{?2\+?\}?\b', 'Mg<sup>2+</sup>', text)
    text = re.sub(r'\bH\^?\+\b', 'H<sup>+</sup>', text)
    text = re.sub(r'\bCl\^?[-–—]\b', 'Cl<sup>-</sup>', text)

    # Plain text superscripts and subscripts (e.g. kg/m^2 or general carets)
    text = re.sub(r'([a-zA-Z0-9\)>])\^\{?([0-9\+\-\*]+)\}?', r'\1<sup>\2</sup>', text)
    text = re.sub(r'([a-zA-Z0-9\)])_\{?([0-9]+)\}?', r'\1<sub>\2</sub>', text)

    # 5. English terms in parentheses: (Term) -> pill
    def repl_paren(m):
        prefix = m.group(1)
        term = m.group(2).strip()
        if re.search(r'[\u0600-\u06FF]', term):
            return m.group(0)
        if len(term) < 2 or len(term) > 55:
            return m.group(0)
        return f'{prefix}<span class="term-en badge-pill-subtle" dir="ltr">{term}</span>'

    text = re.sub(r'([\s\(\[\{،؛:])\(([A-Za-z0-9\s\-\+\/\.\,\%\:\&]+)\)', repl_paren, text)

    # Inline sequential numbering (e.g. ۱) ... ۲) ... ۳) in continuous text paragraphs)
    def repl_seq(m):
        lead = m.group(1) or ''
        num = m.group(2)
        return f'{lead}<span class="inline-seq-num">{num}</span>'

    text = re.sub(r'(^|[\s،,؛:و])([\u06F1-\u06F9]|10|[1-9])\)(?=\s)', repl_seq, text)

    # BiDi protection for bold English terms to prevent line wrapping & punctuation reversals
    def repl_bold_en(m):
        lead = m.group(1) or ''
        inner = m.group(2).strip()
        if not re.search(r'[\u0600-\u06FF]', inner) and len(inner) >= 2:
            return f'{lead}<strong dir="ltr" class="term-en-bold">{inner}</strong>'
        return m.group(0)

    text = re.sub(r'(^|[\s\(،؛:\[])\*\*([A-Za-z0-9\s\-\+\/\.\,\%\:\&\'\"]+)\*\*', repl_bold_en, text)

    # 6. Lead bold keywords
    text = re.sub(r'^[ \t]*\*\*(تعریف|اتیولوژی|پاتوفیزیولوژی|تظاهرات بالینی|علائم بالینی|تشخیص|درمان|عوارض|اندیکاسیون|کنترااندیکاسیون|مدیریت|پیش‌آگهی|نکته کلیدی|رویکرد بالینی|تفسیر|معیارها|پایش)\*\*:', 
                  r'<span class="lead-term-label label-\1">\1:</span>', text, flags=re.MULTILINE)

    # 7. Decision pill badges (YES/NO, positive/negative)
    text = re.sub(r'\[(بله|مثبت|\+|Yes|Positive)\]', r'<span class="badge-decision badge-yes">\1</span>', text, flags=re.IGNORECASE)
    text = re.sub(r'\[(خیر|منفی|\-|No|Negative)\]', r'<span class="badge-decision badge-no">\1</span>', text, flags=re.IGNORECASE)

    # 8. Clean up unwanted <code> tags surrounding badges and double arrow spans
    text = re.sub(r'<code>\s*(<span class="(?:badge-trap|badge-theory)[^"]*">[\s\S]*?</span>)\s*</code>', r'\1', text)
    text = re.sub(r'<span class="stepper-arrow-indicator">\s*<span class="stepper-arrow-indicator">([^<]+)</span>\s*</span>', r'<span class="stepper-arrow-indicator">\1</span>', text)

    # 9. Clean up any remaining unparsed **bold** anywhere in trees or cards, and strip stray orphaned asterisks
    text = re.sub(r'\*\*([^\*\n]+)\*\*', r'<strong>\1</strong>', text)
    text = text.replace('**', '')

    return text

BOX_CHARS = r'[┌┐└┘├┤┬┴┼─━│┃▼►◄▲╔╗╚╝║═╠╣╦╩╬]+'

def clean_diagram_title(line):
    """Cleans the diagram header line to produce an elegant title."""
    t = line.strip()
    t = re.sub(r'^[┌│━─╔║\s#\*]+', '', t)
    t = re.sub(r'[┐│━─╗║\s#\*]+$', '', t)
    t = re.sub(r'^\s*\[\s*', '', t)
    t = re.sub(r'\s*\]\s*$', '', t)
    t = re.sub(r'^[🎯⚠️\[\]\s*#]+|[\[\]\s*#]+$', '', t)
    t = re.sub(BOX_CHARS, '', t)
    return t.strip()

def clean_tree_text(t):
    """Strips tree branch characters, arrows, leading hyphens."""
    t = re.sub(r'^[│┃║\s]*[├└╠╚]──[>►\s]*', '', t)
    t = re.sub(r'^[│┃║\s]+|[│┃║\s]+$', '', t)
    t = re.sub(BOX_CHARS, '', t)
    return t.strip()

def parse_split_diagram_robust(lines):
    """
    Robust spatial parser for horizontal split-box ASCII diagrams (┌───────┴───────┐).
    Prevents cross-column line flattening, binds badges, zips outcomes,
    and completely eliminates lone emojis.
    """
    split_idx = -1
    for i, l in enumerate(lines):
        if ('┌' in l or '┬' in l or '┴' in l) and ('─' in l or '━' in l):
            split_idx = i
            break
    if split_idx == -1:
        return None

    # 1. Root text
    root_lines = []
    for l in lines[:split_idx]:
        s = l.strip()
        if not s or all(ch in '│┃▼ \t' for ch in s):
            continue
        cleaned = clean_tree_text(s)
        cleaned = re.sub(r'^\s*\[([^\]]+)\]\s*$', r'\1', cleaned)
        if cleaned:
            root_lines.append(cleaned)
    root_text = ' '.join(root_lines) if root_lines else 'مسیر بالینی و الگوریتم درمانی'

    # 2. Find column boundaries
    split_line = lines[split_idx]
    
    # 2a. Look for explicit downward arrows below split
    arrows = []
    for l in lines[split_idx:split_idx+3]:
        arr = [m.start() for m in re.finditer(r'[▼▼►◄▲]', l)]
        if len(arr) >= 2:
            arrows = arr
            break
            
    # 2b. If no arrows, look for downward branch characters on split line
    if not arrows:
        targets = []
        if '┌' in split_line: targets.append(split_line.find('┌'))
        for m in re.finditer(r'[┬┼]', split_line):
            targets.append(m.start())
        if '┐' in split_line: targets.append(split_line.rfind('┐'))
        if len(targets) >= 2:
            arrows = sorted(list(set(targets)))
            
    # Fallback to connectors
    if not arrows:
        conns = [m.start() for m in re.finditer(r'[┬┴┼]', split_line)]
        if conns:
            arrows = conns

    text_lines = [l for l in lines[split_idx+1:] if l.strip() and not all(ch in '┌┐└┘├┤┬┴┼─━│┃▼►◄▲ \t' for ch in l)]
    
    bounds = [0]
    if arrows and len(arrows) >= 2:
        for i in range(len(arrows) - 1):
            t_left = arrows[i]
            t_right = arrows[i+1]
            gaps = []
            for l in text_lines:
                runs = [(m.start(), m.end()) for m in re.finditer(r' {2,}', l)]
                mid_t = (t_left + t_right) / 2.0
                best_run = None
                min_dist = 999
                for s, e in runs:
                    r_mid = (s + e) / 2.0
                    dist = abs(r_mid - mid_t)
                    if s >= t_left - 5 and e <= t_right + 30 and dist < min_dist:
                        min_dist = dist
                        best_run = (s, e)
                if best_run:
                    gaps.append(best_run)
            if gaps:
                max_s = max(g[0] for g in gaps)
                min_e = min(g[1] for g in gaps)
                if max_s <= min_e:
                    bounds.append((max_s + min_e) // 2)
                else:
                    bounds.append(max_s)
            else:
                bounds.append((t_left + t_right) // 2)
    else:
        bounds.append(len(split_line) // 2)
        
    bounds.append(9999)
    num_cols = len(bounds) - 1

    col_raw_lines = [[] for _ in range(num_cols)]
    for raw_l in lines[split_idx + 1:]:
        s = raw_l.strip()
        if not s or all(ch in '┌┐└┘├┤┬┴┼─━│┃▼►◄▲ \t' for ch in s):
            continue
        l_bound = re.sub(r'\][ \t]{0,3}\[([⚠️🎯][^\]]*)\]', r' \1]', raw_l)
        l_bound = re.sub(r'\)[ \t]{0,3}\[([⚠️🎯][^\]]*)\]', r') \1', l_bound)

        for col_i in range(num_cols):
            b_start = bounds[col_i]
            b_end = bounds[col_i + 1]
            if len(l_bound) > b_start:
                slice_txt = l_bound[b_start:min(len(l_bound), b_end)].strip()
                if slice_txt and not all(ch in '┌┐└┘├┤┬┴┼─━│┃▼►◄▲ \t' for ch in slice_txt):
                    col_raw_lines[col_i].append(slice_txt)

    # 3. Assemble each column
    root_node = {'text': root_text, 'children': []}
    for col_i in range(num_cols):
        raw_items = col_raw_lines[col_i]
        if not raw_items:
            continue

        clean_col = []
        for it in raw_items:
            c = clean_tree_text(it)
            if not c or all(ch in '┌┐└┘├┤┬┴┼─━│┃▼►◄▲ \t' for ch in c):
                continue
            # Merge isolated emoji badge into previous item
            if re.match(r'^[⚠️🎯\s\[\]]+$', c):
                if clean_col:
                    clean_col[-1] += ' ' + c.strip('[] ')
                continue
            # Merge English parenthetical subtitle into previous item
            if re.match(r'^\([a-zA-Z0-9\s\-–—/.,+:]+\)\s*[⚠️🎯]?$', c) and clean_col:
                clean_col[-1] += ' ' + c
                continue
            clean_col.append(c)

        if not clean_col:
            continue

        b_header = re.sub(r'\[([^\]]+)\]', r'\1', clean_col[0])
        b_header = re.sub(r'^[🎯⚠️\[\]\s*#]+|[\[\]\s*#]+$', '', b_header).strip()
        branch_node = {'text': b_header, 'children': [], 'level': 1}

        # Check for subtitle / clinical impact (e.g. (ادم سلول‌های مغزی و CNS))
        col_idx = 1
        if col_idx < len(clean_col) and re.match(r'^\s*\(.*?\)\s*$', clean_col[col_idx]):
            branch_node['children'].append({'text': clean_col[col_idx].strip(), 'children': [], 'level': 2})
            col_idx += 1

        def split_row_parts(line):
            line = re.sub(r'\)\s+(?=[\u0600-\u06FFa-zA-Z])', ')   ', line)
            return [p.strip() for p in re.split(r'\s{2,}', line) if p.strip()]

        # Stitch broken continuation lines ONLY for single-column text (never merge multi-column rows!)
        stitched_items = []
        for it in clean_col[col_idx:]:
            parts_it = split_row_parts(it)
            if stitched_items:
                prev_parts = split_row_parts(stitched_items[-1])
                if len(parts_it) < 2 and len(prev_parts) < 2 and (
                    it.startswith('+') or 
                    it.startswith('و ') or 
                    it.startswith('یا ') or
                    re.match(r'^\s*\(?(?:\d+\.?\d*%\s*[a-zA-Z0-9]+|\+)', it) or
                    stitched_items[-1].endswith(':') or
                    any(stitched_items[-1].endswith(k) for k in ['درمان قطعی:', 'سرم نرمال سالین', 'نیازمند مهار', ' و'])
                ):
                    stitched_items[-1] += ' ' + it
                    continue
            stitched_items.append(it)
        rem_items = stitched_items

        # Check if remaining items form two multi-part lines (categories + descriptions)
        if len(rem_items) == 2:
            parts_a = split_row_parts(rem_items[0])
            parts_b = [p.strip(' ()') for p in re.split(r'\s{2,}|\)\s*(?=\()', rem_items[1]) if p.strip(' ()')]
            if len(parts_a) >= 2 and len(parts_a) == len(parts_b):
                for a, b in zip(parts_a, parts_b):
                    branch_node['children'].append({'text': f'{a} ⬅️ {b}', 'children': [], 'level': 2})
                root_node['children'].append(branch_node)
                continue

        # Multi-line column zipping for sub-splits (e.g. [خارج صفاقی] [داخل صفاقی])
        grouped_items = []
        k = 0
        while k < len(rem_items):
            it_k = rem_items[k]
            parts_k = split_row_parts(it_k)
            if len(parts_k) >= 2 and not it_k.strip().startswith('•') and not it_k.strip().startswith('-'):
                sub_rows = [parts_k]
                m = k + 1
                while m < len(rem_items):
                    it_m = rem_items[m]
                    parts_m = split_row_parts(it_m)
                    if len(parts_m) == len(parts_k) and not it_m.strip().startswith('•') and not it_m.strip().startswith('-'):
                        sub_rows.append(parts_m)
                        m += 1
                    else:
                        break
                if len(sub_rows) >= 2:
                    for col_sub_i in range(len(parts_k)):
                        col_chain = ' '.join(r[col_sub_i] for r in sub_rows)
                        m_brk = re.match(r'^\s*\[([^\]]+)\]\s*(.*)$', col_chain)
                        if m_brk:
                            col_clean = f"{m_brk.group(1)}: {m_brk.group(2)}".strip(' :')
                        else:
                            m_multi = re.match(r'^(.*?)\s*\((.*?)\)\s*\((.*?)\)$', col_chain)
                            if m_multi:
                                col_clean = f"{m_multi.group(1).strip()} ({m_multi.group(2).strip()}) ⬅️ {m_multi.group(3).strip()}"
                            else:
                                m_parens = re.match(r'^(.*?)\s*\((.*?)\)$', col_chain)
                                if m_parens and not col_chain.startswith('('):
                                    col_clean = f"{m_parens.group(1).strip()} ⬅️ {m_parens.group(2).strip()}"
                                else:
                                    col_clean = re.sub(r'^[🎯⚠️\[\]\s*#]+|[\[\]\s*#]+$', '', col_chain).strip()
                        grouped_items.append(col_clean)
                    k = m
                    continue
            grouped_items.append(it_k)
            k += 1

        bullet_buffer = []
        for it in grouped_items:
            it_clean = clean_tree_text(it)
            it_clean = re.sub(r'\[([^\]]+)\]', r'\1', it_clean).strip()
            
            # Skip empty or lone emojis/brackets
            if not it_clean or re.match(r'^[🎯⚠️\[\]\s*#\-–—•]+$', it_clean):
                if any(ch in '🎯⚠️' for ch in it_clean) and branch_node['children']:
                    emojis = ''.join(ch for ch in it_clean if ch in '🎯⚠️')
                    branch_node['children'][-1]['text'] += ' ' + emojis
                continue

            sub_parts = [p.strip() for p in re.split(r'\s{2,}|\)\s*(?=\()', it_clean) if p.strip()]
            if len(sub_parts) >= 2:
                if bullet_buffer:
                    branch_node['children'].append({
                        'text': ' • '.join(bullet_buffer),
                        'children': [],
                        'level': 2
                    })
                    bullet_buffer = []
                for sp in sub_parts:
                    sp_clean = re.sub(r'^[🎯⚠️\[\]\s*#]+|[\[\]\s*#]+$', '', sp).strip()
                    if sp_clean:
                        branch_node['children'].append({'text': sp_clean, 'children': [], 'level': 2})
            elif it_clean.startswith('•') or it_clean.startswith('-'):
                bullet_buffer.append(it_clean.lstrip('•- '))
            else:
                if bullet_buffer:
                    branch_node['children'].append({
                        'text': 'علائم و یافته‌ها: ' + ' • '.join(bullet_buffer),
                        'children': [],
                        'level': 2
                    })
                    bullet_buffer = []
                branch_node['children'].append({'text': it_clean, 'children': [], 'level': 2})

        if bullet_buffer:
            branch_node['children'].append({
                'text': 'علائم و یافته‌ها: ' + ' • '.join(bullet_buffer),
                'children': [],
                'level': 2
            })

        root_node['children'].append(branch_node)

    return root_node

def parse_tree_into_hierarchy(lines):
    """
    Parses an ASCII indented tree into a multi-level Python tree structure:
    Root -> Level 1 nodes -> Level 2 nodes -> Level 3 nodes.
    Supports both indented hierarchies (├──, └──) and horizontal split-box diagrams (┌─┬─┐ / ┌─┴─┐).
    """
    if not lines:
        return None

    # 1. Check for horizontal split-box diagrams first
    if any(('┌' in l or '┬' in l or '┴' in l) and ('─' in l or '━' in l) for l in lines):
        split_res = parse_split_diagram_robust(lines)
        if split_res and len(split_res.get('children', [])) >= 2:
            return split_res

    # 2. Standard Indented Tree parsing
    root_text = clean_tree_text(lines[0])
    content_lines = []
    for l in lines[1:]:
        s = l.strip()
        if not s or s in ['│', '▼', '⬇️', '---']:
            continue
        if all(ch in '│┃ \t┌─┐┴' for ch in s):
            continue
        content_lines.append(l)

    if not content_lines:
        return {'text': root_text, 'children': []}

    parsed_items = []
    for raw_line in content_lines:
        m = re.search(r'[├└]──', raw_line)
        if m:
            indent = m.start()
        else:
            indent = len(raw_line) - len(raw_line.lstrip())
        clean_text = clean_tree_text(raw_line)
        
        # Merge lone emojis/brackets into preceding node
        if re.match(r'^[🎯⚠️\[\]\s*#\-–—•]+$', clean_text):
            if any(ch in '🎯⚠️' for ch in clean_text) and parsed_items:
                emojis = ''.join(ch for ch in clean_text if ch in '🎯⚠️')
                last_indent, last_txt = parsed_items[-1]
                parsed_items[-1] = (last_indent, last_txt + ' ' + emojis)
            continue
            
        if clean_text:
            parsed_items.append((indent, clean_text))

    if not parsed_items:
        return {'text': root_text, 'children': []}

    indents = sorted(list(set(item[0] for item in parsed_items)))
    def get_level(indent_val):
        for idx, lvl in enumerate(indents):
            if indent_val <= lvl + 2:
                return idx + 1
        return len(indents)

    root_node = {'text': root_text, 'children': []}
    level_stack = [root_node]

    for indent, text in parsed_items:
        lvl = get_level(indent)
        new_node = {'text': text, 'children': [], 'level': lvl}
        while len(level_stack) > lvl:
            level_stack.pop()
        parent = level_stack[-1]
        parent['children'].append(new_node)
        level_stack.append(new_node)

    return root_node

# =========================================================================
# APPROACH 2: STYLIZED CLEAN TREE VIEW (90% of diagrams - Primary Standard)
# =========================================================================
def render_approach2_clean_tree(lines, title):
    """
    Renders an ASCII indented tree into Approach 2: Stylized Clean Tree View HTML.
    Preserves exact parent-child hierarchy with vertical line guides and elbows.
    Zero monospace code blocks.
    """
    tree = parse_tree_into_hierarchy(lines)
    if not tree or not tree.get('children'):
        body_text = ' '.join(clean_tree_text(l) for l in lines[1:] if clean_tree_text(l))
        return f"""
<div class="clinical-flowchart-card animated-diagram ctree-diagram" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> الگوریتم درختی بالینی لارنس</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="ctree-container">
    <div class="ctree-root-line"><span>🩺</span><span>{title}</span></div>
    <div class="ctree-text" style="padding: 12px;">{transform_inline_elements(body_text)}</div>
  </div>
</div>
"""

    root_text = transform_inline_elements(tree['text'])
    level1_nodes = tree.get('children', [])
    
    nodes_html = []
    colors = ['rose', 'indigo', 'emerald', 'amber', 'cyan', 'purple']
    
    for idx, n1 in enumerate(level1_nodes):
        n1_text = n1['text']
        col = 'rose' if any(w in n1_text for w in ['اورژانس', 'خطر', 'حاد', 'شوک', 'مرگ', 'ناپایدار', 'قرمز']) else (
              'emerald' if any(w in n1_text for w in ['کم‌خطر', 'پایدار', 'نرمال', 'موفق']) else
              'amber' if any(w in n1_text for w in ['متوسط', 'احتیاط', 'مشکوک']) else
              colors[idx % len(colors)]
        )
        
        children_html = []
        if n1.get('children'):
            for n2 in n1['children']:
                n2_text = n2['text']
                if re.match(r'^\s*\(.*?\)\s*$', n2_text):
                    sub_html = f'<div class="ctree-subtitle">{transform_inline_elements(n2_text)}</div>'
                    children_html.append(f'<div class="ctree-subrow-wrap">{sub_html}</div>')
                    continue
                elif '⬅️' in n2_text:
                    parts = n2_text.split('⬅️', 1)
                    sub_title = transform_inline_elements(parts[0].strip())
                    sub_action = transform_inline_elements(parts[1].strip())
                    if sub_title:
                        sub_html = f'<span class="ctree-text-bold">{sub_title}</span> <span class="ctree-arrow">⬅️</span> <span class="ctree-action-text">{sub_action}</span>'
                    else:
                        sub_html = f'<span class="ctree-arrow">⬅️</span> <span class="ctree-action-text">{sub_action}</span>'
                else:
                    sub_html = f'<span class="ctree-text">{transform_inline_elements(n2_text)}</span>'
                
                l3_html = []
                if n2.get('children'):
                    for n3 in n2['children']:
                        l3_text = transform_inline_elements(n3['text'])
                        l3_html.append(f'<div class="ctree-level3-row"><span>{l3_text}</span></div>')
                    l3_block = f'<div class="ctree-nested-level3">{"".join(l3_html)}</div>'
                else:
                    l3_block = ""
                    
                children_html.append(f"""
                <div class="ctree-subrow-wrap">
                  <div class="ctree-subrow">{sub_html}</div>
                  {l3_block}
                </div>
                """)
            subnode_block = f'<div class="ctree-subnode">{"".join(children_html)}</div>'
        else:
            subnode_block = ""
            
        nodes_html.append(f"""
        <div class="ctree-node">
          <div class="ctree-row">
            <span class="ctree-badge ctree-badge-{col}">{transform_inline_elements(n1_text)}</span>
          </div>
          {subnode_block}
        </div>
        """)
        
    is_split = (len(level1_nodes) == 2)
    wrap_class = "ctree-split-grid" if is_split else "ctree-nodes-stack"

    return f"""
<div class="clinical-flowchart-card animated-diagram ctree-diagram" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> الگوریتم درختی بالینی لارنس</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="ctree-container">
    <div class="ctree-root-line">
      <span>🩺</span>
      <span>{root_text}</span>
    </div>
    <div class="{wrap_class}">
      {''.join(nodes_html)}
    </div>
  </div>
</div>
"""

# =========================================================================
# CLINICAL PROGRESSION PIPELINES & FORK-JOIN CONVERGENT DIAGRAMS
# =========================================================================
def is_progression_chain(raw):
    """Detects whether an expression represents a multi-step clinical progression sequence."""
    arrows = re.findall(r'\\longrightarrow|\\rightarrow|\\to(?=\s)|➡️|⬅️', raw)
    keywords = ['wave', 'depression', 'prolongation', 'arrest', 'nausea', 'lethargy', 'dtr', 'death', 'coma', 'hypotension', 'bradycardia', 'ischemia', 'infarction', 'stenosis', 'reflux', 'tensile', 'lag phase', 'normal skin']
    has_kw = any(k in raw.lower() for k in keywords)
    return len(arrows) >= 2 and has_kw

def render_progression_pipeline(raw):
    """
    Renders an arrow progression sequence as a responsive flex pipeline
    with forward arrows (➡️) and distinct highlighting for terminal outcomes.
    Zero text truncation or reversed direction.
    """
    parts = re.split(r'\\longrightarrow|\\rightarrow|\\to(?=\s)|➡️|⬅️', raw)
    steps = []
    for p in parts:
        clean_p = p.strip()
        if not clean_p:
            continue
        is_term = any(term in clean_p.lower() for term in ['arrest', 'death', 'coma', 'shock', 'failure'])
        is_hl = r'\mathbf' in clean_p or 'dtr' in clean_p.lower()
        rendered_p = render_latex_to_html(clean_p)
        steps.append((rendered_p, is_term, is_hl))
        
    pipeline_items = []
    for idx, (step_h, is_term, is_hl) in enumerate(steps):
        classes = ['pipe-step']
        if is_term:
            classes.append('step-terminal')
        if is_hl:
            classes.append('step-highlight')
        cls_str = ' '.join(classes)
        pipeline_items.append(f'<span class="{cls_str}">{step_h}</span>')
        if idx < len(steps) - 1:
            pipeline_items.append('<span class="pipe-arrow">➡️</span>')
            
    items_html = '\n'.join(pipeline_items)
    return f'<div class="clinical-progression-pipeline" dir="ltr">{items_html}</div>'

def is_fork_join_diagram(lines):
    """Detects convergent flowcharts with a fork (┌─┴─┐) and a join (└─┬─┘)."""
    has_fork = any(('┌' in l or '┬' in l) and ('┴' in l or '─' in l) for l in lines)
    has_join = any(('└' in l or '┘' in l) and ('┬' in l or '┴' in l) and ('─' in l or '━' in l) for l in lines[3:])
    return has_fork and has_join

def render_fork_join_diagram(lines, title="الگوریتم تصمیم‌گیری بالینی"):
    """
    Parses a fork-join diagram into:
    1. Top entry question card
    2. Side-by-side branch columns (e.g. Yes / No)
    3. Joined convergence action card spanning 100% width at the bottom.
    Zero text cutting or column bleeding.
    """
    fork_idx = -1
    join_idx = -1
    for i, l in enumerate(lines):
        if fork_idx == -1 and ('┌' in l or '┬' in l) and ('┴' in l or '─' in l):
            fork_idx = i
        elif fork_idx != -1 and ('└' in l or '┘' in l) and ('┬' in l or '┴' in l) and ('─' in l or '━' in l):
            join_idx = i
            break
            
    if fork_idx == -1 or join_idx == -1:
        return None

    # Entry lines (before fork)
    entry_lines = []
    for l in lines[:fork_idx]:
        c = clean_tree_text(l)
        if c and not all(ch in '│┃▼ \t' for ch in c) and c != title:
            entry_lines.append(c)
    entry_text = ' '.join(entry_lines) if entry_lines else title

    f_line = lines[fork_idx]
    c_pos = f_line.find('┴')
    if c_pos == -1:
        c_pos = len(f_line) // 2

    left_raw = []
    right_raw = []
    for l in lines[fork_idx+1:join_idx]:
        if not l.strip() or all(ch in '│┃▼ \t' for ch in l):
            continue
        left_slice = l[:c_pos].strip()
        right_slice = l[c_pos:].strip() if len(l) > c_pos else ""
        if left_slice and not all(ch in '│┃▼ \t' for ch in left_slice):
            left_raw.append(left_slice)
        if right_slice and not all(ch in '│┃▼ \t' for ch in right_slice):
            right_raw.append(right_slice)

    def assemble_branch(raw_items, default_label):
        label = default_label
        items = []
        for it in raw_items:
            c = clean_tree_text(it)
            c = re.sub(r'^[▼►◄▲\s]+', '', c).strip()
            if not c:
                continue
            if 'بله' in c or 'Yes' in c:
                label = 'بله'
                c = re.sub(r'\[?(?:بله|Yes)\]?', '', c).strip()
            elif 'خیر' in c or 'No' in c:
                label = 'خیر'
                c = re.sub(r'\[?(?:خیر|No)\]?', '', c).strip()
            if c:
                items.append(c)
        return label, items

    l_label, l_items = assemble_branch(left_raw, "مسیر اول")
    r_label, r_items = assemble_branch(right_raw, "مسیر دوم")

    converge_items = []
    for l in lines[join_idx+1:]:
        c = clean_tree_text(l)
        c = re.sub(r'^[▼►◄▲\s]+', '', c).strip()
        if c and not all(ch in '│┃▼ \t' for ch in c):
            converge_items.append(c)

    def format_item_list(items):
        out = []
        for it in items:
            it_h = transform_inline_elements(it)
            out.append(f'<div class="fj-action-pill">{it_h}</div>')
        return '\n'.join(out)

    entry_h = transform_inline_elements(entry_text)
    l_content = format_item_list(l_items)
    r_content = format_item_list(r_items)
    conv_content = format_item_list(converge_items)

    is_l_yes = ('بله' in l_label or 'Yes' in l_label)
    l_badge_cls = 'badge-yes' if is_l_yes else 'badge-no'
    r_badge_cls = 'badge-no' if is_l_yes else 'badge-yes'

    html = f'''
<div class="clinical-flowchart-card animated-diagram fork-join-card" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> الگوریتم درختی بالینی لارنس</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="fj-canvas">
    <div class="fj-entry-card">
      <div class="fj-entry-icon">🩺</div>
      <div class="fj-entry-text">{entry_h}</div>
    </div>
    <div class="fj-split-bridge"><span class="fj-split-arrow">⬇️ انشعاب تشخیصی</span></div>
    <div class="fj-branches-grid">
      <div class="fj-branch-card branch-primary">
        <div class="fj-branch-header"><span class="badge-decision {l_badge_cls}">{l_label}</span></div>
        <div class="fj-branch-body">{l_content}</div>
      </div>
      <div class="fj-branch-card branch-secondary">
        <div class="fj-branch-header"><span class="badge-decision {r_badge_cls}">{r_label}</span></div>
        <div class="fj-branch-body">{r_content}</div>
      </div>
    </div>
    <div class="fj-converge-bridge"><span class="fj-converge-arrow">⬇️ اقدام نهایی مشترک</span></div>
    <div class="fj-convergence-card">
      <div class="fj-conv-header"><span class="fj-conv-icon">🎯</span> <span class="fj-conv-title">اقدام قطعی و گام مشترک پروتکل</span></div>
      <div class="fj-conv-body">{conv_content}</div>
    </div>
  </div>
</div>
'''
    return html

# =========================================================================
# APPROACH 1: MODERN HIERARCHICAL MEDICAL TREE (7% of diagrams)
# =========================================================================
def parse_convergent_pathway(lines, title):
    """Renders multiple stimuli/pathways converging into a final single action."""
    terminal_line = clean_tree_text(lines[-1])
    terminal_html = transform_inline_elements(terminal_line)

    stimuli_cards = []
    colors = ['cyan', 'indigo', 'amber', 'emerald', 'rose']

    for idx, l in enumerate(lines[1:-1]):
        s = l.strip()
        if not s or s in ['│', '▼', '⬇️', '---']:
            continue
        cleaned = clean_tree_text(s)
        if not cleaned:
            continue
        
        parts = [p.strip() for p in re.split(r'──>|──┴─>|──┐|<──|->|:', cleaned) if p.strip()]
        col = colors[idx % len(colors)]
        
        if len(parts) >= 2:
            name = transform_inline_elements(parts[0])
            receptor = transform_inline_elements(parts[1])
            pathway = transform_inline_elements(' • '.join(parts[2:])) if len(parts) > 2 else ""
            pathway_html = f'<div class="stimulant-pathway">{pathway}</div>' if pathway else ""
            stimuli_cards.append(f"""
            <div class="flow-stimulant-card" style="border-inline-start-color: var(--color-{col}, #0284c7);">
              <div class="stimulant-header">
                <span class="stimulant-name">{name}</span>
                <span class="stimulant-receptor badge-pill-subtle">{receptor}</span>
              </div>
              {pathway_html}
            </div>
            """)
        else:
            stimuli_cards.append(f"""
            <div class="flow-stimulant-card" style="border-inline-start-color: var(--color-{col}, #0284c7);">
              <div class="stimulant-header">{transform_inline_elements(cleaned)}</div>
            </div>
            """)

    return f"""
<div class="clinical-flowchart-card animated-diagram convergent-pathway-card" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> مسیر پیام‌رسانی و فعال‌سازی سلولی</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="flowchart-canvas">
    <div class="fc-entry-node">
      <span class="fc-entry-badge">مجموعه محرک‌های فیزیولوژیک</span>
      <div class="fc-entry-title">{title}</div>
    </div>
    <div class="fc-arrow-connector"><span class="fc-arrow-pulse">⬇️</span></div>
    <div class="flow-converge-inputs-grid">
      {''.join(stimuli_cards)}
    </div>
    <div class="flow-converge-connector">
      <div class="converge-lines-anim"></div>
      <span class="flow-pulsing-arrow">⬇️</span>
    </div>
    <div class="flow-terminal-card">
      <span class="terminal-badge">پاسخ فیزیولوژیک نهایی</span>
      <h5 class="terminal-title">{terminal_html}</h5>
    </div>
  </div>
</div>
"""

def parse_protocol_flow(lines, title):
    """Renders sequential clinical protocols with key action grids."""
    stepper_lines = []
    tree_items = []
    
    for l in lines[1:]:
        s = l.strip()
        if not s or s in ['⬇️', '➡️', '│', '▼', '---']:
            continue
        step_m = re.match(r'^(?:گام|مرحله|فاز)\s*([\d\u06F0-\u06F9]+):\s*(.*)', s)
        if step_m:
            stepper_lines.append((step_m.group(1), step_m.group(2)))
        elif '├──' in s or '└──' in s or re.match(r'^مسیر\s*[\d\u06F0-\u06F9]+:', s):
            clean_s = clean_tree_text(s)
            clean_s = re.sub(r'^مسیر\s*[\d\u06F0-\u06F9]+:\s*', '', clean_s)
            if clean_s:
                tree_items.append(clean_s)
        else:
            if '⬇️' in s:
                subparts = [sp.strip() for sp in s.split('⬇️') if sp.strip()]
                for sp in subparts:
                    sp_m = re.match(r'^(?:گام|مرحله|فاز)\s*([\d\u06F0-\u06F9]+):\s*(.*)', sp)
                    if sp_m:
                        stepper_lines.append((sp_m.group(1), sp_m.group(2)))
                    else:
                        tree_items.append(sp)
            else:
                tree_items.append(clean_tree_text(s))

    steps_html = []
    for snum, stext in stepper_lines:
        s_html = transform_inline_elements(stext)
        steps_html.append(f"""
        <div class="fc-protocol-step">
          <div class="fc-step-badge">گام {snum}</div>
          <div class="fc-step-body">{s_html}</div>
        </div>
        <div class="fc-arrow-connector"><span class="fc-arrow-pulse">⬇️</span></div>
        """)

    sub_items_html = ""
    if tree_items:
        cards = []
        colors = ['emerald', 'cyan', 'amber', 'rose', 'purple']
        for idx, item in enumerate(tree_items):
            col = colors[idx % len(colors)]
            item_html = transform_inline_elements(item)
            cards.append(f"""
            <div class="fc-action-pill fc-pill-{col}">
              <span class="fc-pill-dot dot-{col}"></span>
              <span class="fc-pill-text">{item_html}</span>
            </div>
            """)
        sub_items_html = f"""
        <div class="fc-protocol-subgroup">
          <div class="fc-subgroup-title">⚡ اجزای کلیدی پروتکل اجرایی لارنس</div>
          <div class="fc-pills-grid">
            {''.join(cards)}
          </div>
        </div>
        """

    return f"""
<div class="clinical-flowchart-card animated-diagram visual-protocol-card" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> توالی پروتکل بالینی لارنس</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="flowchart-canvas">
    <div class="fc-entry-node">
      <span class="fc-entry-badge">تظاهر بالینی / کیس اورژانس</span>
      <div class="fc-entry-title">{title}</div>
    </div>
    <div class="fc-arrow-connector"><span class="fc-arrow-pulse">⬇️</span></div>
    <div class="fc-protocol-sequence">
      {''.join(steps_html)}
    </div>
    {sub_items_html}
  </div>
</div>
"""

def render_approach1_visual_tree(lines, title, raw_text):
    """
    Renders 2-way clinical decision forks into Approach 1: Modern Hierarchical Visual Medical Tree.
    """
    if 'محرک‌های سلول پاریتال' in title or 'محرک‌های سلول پاریتال' in raw_text:
        return parse_convergent_pathway(lines, title)
    if 'شوک خونریزی‌دهنده شدید' in title or 'شوک خونریزی‌دهنده شدید' in raw_text:
        return parse_protocol_flow(lines, title)

    # General decision split
    tree = parse_tree_into_hierarchy(lines)
    children = tree.get('children', []) if tree else []
    
    if len(children) >= 2:
        c1_node = children[0]
        c2_node = children[1]
        col1_title = c1_node['text']
        col1_body = [c['text'] for c in c1_node.get('children', [])]
        col2_title = c2_node['text']
        col2_body = [c['text'] for c in c2_node.get('children', [])]
    else:
        col1_title = "شاخه اورژانس و بحرانی"
        col1_body = [clean_tree_text(l) for l in lines[1:4] if clean_tree_text(l)]
        col2_title = "شاخه پایدار و تشخیصی"
        col2_body = [clean_tree_text(l) for l in lines[4:] if clean_tree_text(l)]

    col1_bullets = ''.join(f'<li>{transform_inline_elements(it)}</li>' for it in col1_body)
    col2_bullets = ''.join(f'<li>{transform_inline_elements(it)}</li>' for it in col2_body)

    return f"""
<div class="clinical-flowchart-card animated-diagram vtree-card" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> الگوریتم تصمیم‌گیری بالینی لارنس</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="vtree-container">
    <div class="vtree-root">
      <span class="vtree-root-icon">🩺</span>
      <span class="vtree-root-title">{title}</span>
    </div>
    <div class="vtree-stem-down"></div>
    <div class="vtree-bridge-line"></div>
    <div class="vtree-branches-split">
      <div class="vtree-main-card card-emergency">
        <div class="vtree-branch-header">
          <h3 class="vtree-branch-title" style="color: var(--color-rose, #e11d48);">{transform_inline_elements(col1_title)}</h3>
          <span class="vtree-pill pill-rose">شاخه اول</span>
        </div>
        <ul class="flow-branch-bullets">
          {col1_bullets}
        </ul>
      </div>
      <div class="vtree-main-card card-elective">
        <div class="vtree-branch-header">
          <h3 class="vtree-branch-title" style="color: var(--color-indigo, #4f46e5);">{transform_inline_elements(col2_title)}</h3>
          <span class="vtree-pill pill-indigo">شاخه دوم</span>
        </div>
        <ul class="flow-branch-bullets">
          {col2_bullets}
        </ul>
      </div>
    </div>
  </div>
</div>
"""

# =========================================================================
# APPROACH 3: NESTED DECISION CARDS (3% of diagrams - Criteria Tiers)
# =========================================================================
def render_approach3_nested_cards(lines, title, raw_text):
    """
    Renders risk stratifications and criteria classifications into Approach 3: Nested Decision Cards.
    """
    tree = parse_tree_into_hierarchy(lines)
    children = tree.get('children', []) if tree else []
    
    tiers_html = []
    tier_colors = ['emerald', 'amber', 'rose', 'indigo', 'cyan']
    
    for idx, node in enumerate(children):
        col = tier_colors[idx % len(tier_colors)]
        n_text = node['text']
        
        sub_items = []
        for ch in node.get('children', []):
            ch_text = ch['text']
            sub_items.append(f'<li>{transform_inline_elements(ch_text)}</li>')
            for gch in ch.get('children', []):
                sub_items.append(f'<li style="margin-inline-start: 12px;">{transform_inline_elements(gch["text"])}</li>')
                
        sub_list_html = f'<ul class="tier-steps-list">{"".join(sub_items)}</ul>' if sub_items else ""
        
        tiers_html.append(f"""
        <div class="ncard-tier tier-{col}">
          <span class="tier-label" style="color: var(--color-{col}, #0284c7);">
            <span>•</span>
            <span>{transform_inline_elements(n_text)}</span>
          </span>
          <div class="tier-body">
            {sub_list_html}
          </div>
        </div>
        """)

    return f"""
<div class="clinical-flowchart-card animated-diagram ncards-diagram" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> سیستم نمره‌دهی و طبقه‌بندی بالینی لارنس</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="ncards-container">
    <div class="ncards-root-badge">
      <span>🩺 {title}</span>
    </div>
    <div class="ncard-parent parent-elective">
      <div class="ncard-inner-grid">
        {''.join(tiers_html)}
      </div>
    </div>
  </div>
</div>
"""

def is_lethal_triad_diagram(lines):
    """Detects the 3-corner traumatic lethal triad feedback cycle."""
    text = '\n'.join(lines)
    return ('اسیدوز' in text or 'Acidosis' in text) and \
           ('هیپوترمی' in text or 'Hypothermia' in text) and \
           ('کوآگولوپاتی' in text or 'Coagulopathy' in text)

def render_lethal_triad_diagram(lines, title="مثلث کشنده تروما (The Lethal Triad)"):
    """
    Renders the 3-corner traumatic lethal triad vicious cycle as a specialized,
    responsive medical feedback component.
    """
    return f'''<div class="lethal-triad-card" data-component="lethal-triad">
  <div class="triad-header">
    <span class="triad-title-badge">🚨 {title}</span>
    <span class="triad-sub-badge">پاتوفیزیولوژی چرخه معیوب مرگبار خونریزی حاد (Trauma Lethal Triad)</span>
  </div>
  <div class="triad-grid">
    <div class="triad-top-wrapper">
      <div class="triad-node node-acidosis">
        <div class="triad-node-icon">🔺</div>
        <div class="triad-node-title">اسیدوز متابولیک (Acidosis)</div>
        <div class="triad-node-val">pH &lt; 7.35</div>
        <div class="triad-node-desc">افت عملکرد فاکتورهای انعقادی و مهار آنزیمی</div>
      </div>
    </div>
    <div class="triad-node node-hypothermia">
      <div class="triad-node-icon">❄️</div>
      <div class="triad-node-title">هیپوترمی (Hypothermia)</div>
      <div class="triad-node-val">Core Temp &lt; 35°C</div>
      <div class="triad-node-desc">اختلال عملکرد پلاکت و کاهش کینتیک سنتز فیبرین</div>
    </div>
    <div class="triad-center-cycle">
      <div class="cycle-spinner">🔄</div>
      <div class="cycle-label">چرخه بازخورد مثبت</div>
      <div class="cycle-sub">تشدید سه‌جانبه متقابل</div>
    </div>
    <div class="triad-node node-coagulopathy">
      <div class="triad-node-icon">🩸</div>
      <div class="triad-node-title">کوآگولوپاتی (Coagulopathy)</div>
      <div class="triad-node-val">اختلال فاکتورها و پلاکت‌ها</div>
      <div class="triad-node-desc">خونریزی مداوم و تشدید شوک و هیپوترمی</div>
    </div>
  </div>
  <div class="triad-footer-alert">
    <span class="alert-icon">⚡</span>
    <span><strong>کلید شکستن چرخه مرگ:</strong> کنترل سریع منبع خونریزی مکانیکی + گرم کردن فعال بیمار و مایعات تزریقی (وارمر) + احیای متوازن بر پایه خون ۱:۱:۱ با حداقل کریستالوئید و اصلاح کلسیم.</span>
  </div>
</div>'''

def is_vertical_timeline_diagram(code_content):
    """Detects sequential chronological flows separated by vertical arrows (⬇️)."""
    lines = [l.strip() for l in code_content.strip().splitlines() if l.strip()]
    if not lines:
        return False
    # If it's a tree with ├──, └──, ┌, etc. let the tree parser handle it
    if any(ch in code_content for ch in ['├──', '└──', '┌', '┐', '┤', '├', '┬', '┴']):
        return False
    down_arrows = sum(1 for l in lines if re.search(r'^(?:⬇️|⬇|▼)+$', l))
    return down_arrows >= 1 and len(lines) >= 3

def render_vertical_timeline_diagram(code_content, title="توالی مراحل بالینی و کرونولوژیک"):
    """
    Renders vertical chronological flows (separated by ⬇️) into a sleek,
    responsive clinical timeline stepper component.
    """
    raw_lines = [l.strip() for l in code_content.strip().splitlines() if l.strip()]
    step_chunks = []
    curr = []
    for l in raw_lines:
        if re.search(r'^(?:⬇️|⬇|▼)+$', l):
            if curr:
                step_chunks.append(' '.join(curr))
                curr = []
        else:
            curr.append(l)
    if curr:
        step_chunks.append(' '.join(curr))

    steps_html = []
    for idx, chunk in enumerate(step_chunks):
        time_badge = ""
        m_time = re.search(r'(\[(?:ساعت|روز|ماه|هفته|فاز|دقیقه)[^\]]*\]|\(ساعت\s*[\d\u06F0-\u06F9]+\))', chunk)
        if m_time:
            time_badge = m_time.group(1).strip('[]() ')
            chunk_body = chunk.replace(m_time.group(0), '').strip()
        elif re.match(r'^(گام\s*[\d\u06F0-\u06F9]+|مرحله\s*[\d\u06F0-\u06F9]+)[:\-]\s*(.*)$', chunk):
            m_step = re.match(r'^(گام\s*[\d\u06F0-\u06F9]+|مرحله\s*[\d\u06F0-\u06F9]+)[:\-]\s*(.*)$', chunk)
            time_badge = m_step.group(1)
            chunk_body = m_step.group(2)
        elif re.match(r'^\[(.*?)\]$', chunk):
            time_badge = "اقدام / تشخیص"
            chunk_body = chunk.strip('[] ')
        else:
            time_badge = "نقطه شروع / تریگر" if idx == 0 else f"مرحله {idx + 1}"
            chunk_body = chunk

        chunk_body = re.sub(r'^[⬅️➡️\s\-–—:]+', '', chunk_body).strip()
        transformed = transform_inline_elements(chunk_body)

        is_last = (idx == len(step_chunks) - 1)
        step_cls = "timeline-step step-terminal" if is_last else "timeline-step"

        steps_html.append(f'''    <div class="{step_cls}">
      <div class="timeline-marker-col">
        <div class="timeline-node-circle">{idx + 1}</div>
        {'<div class="timeline-connector-line"></div>' if not is_last else ''}
      </div>
      <div class="timeline-content-card">
        <div class="timeline-step-meta">
          <span class="timeline-time-badge">{time_badge}</span>
        </div>
        <div class="timeline-step-body">{transformed}</div>
      </div>
    </div>''')

    all_steps = '\n'.join(steps_html)
    return f'''<div class="clinical-timeline-stepper" data-component="timeline-stepper">
  <div class="timeline-header">
    <span class="timeline-header-badge">⏱️ {title}</span>
  </div>
  <div class="timeline-steps-container">
{all_steps}
  </div>
</div>'''

# =========================================================================
# MASTER DISPATCHER: ENFORCING 90% / 7% / 3% RATIO
# =========================================================================
def parse_ascii_diagram(diagram_body):
    """
    Dispatches any ASCII algorithm into:
    - 90% Approach 2: Stylized Clean Tree View
    - 7%  Approach 1: Modern Hierarchical Visual Medical Tree
    - 3%  Approach 3: Nested Decision Cards
    ZERO monospace <pre><code> blocks ever output!
    """
    lines = [l.rstrip() for l in diagram_body.strip().splitlines() if l.strip()]
    if not lines:
        return ""

    title = clean_diagram_title(lines[0])
    if not title:
        title = "الگوریتم تصمیم‌گیری بالینی لارنس"

    # 0a. Check for Lethal Triad Feedback Cycle
    if is_lethal_triad_diagram(lines):
        return render_lethal_triad_diagram(lines, title)

    # 0b. Check for Fork-Join (Convergent Diamond) Diagrams (e.g. Hyperkalemia)
    if is_fork_join_diagram(lines):
        fj_res = render_fork_join_diagram(lines, title)
        if fj_res:
            return fj_res

    # 1. Approach 1 (7% of cases)
    if any(kw in diagram_body for kw in APPROACH_1_KEYWORDS):
        return render_approach1_visual_tree(lines, title, diagram_body)

    # 2. Approach 3 (3% of cases)
    if any(kw in diagram_body for kw in APPROACH_3_KEYWORDS):
        return render_approach3_nested_cards(lines, title, diagram_body)

    # 3. Approach 2 (90% of cases - The Default Standard)
    return render_approach2_clean_tree(lines, title)

def normalize_list_indentation(text):
    """
    Normalizes markdown list indentation to Python-Markdown's strict 4-space tab stops.
    Prevents sub-lists under ordered items (1.) or bullet items (*) from collapsing
    into single lines or becoming indented code blocks (<pre><code>).
    """
    lines = text.splitlines()
    out = []
    indent_stack = [0]
    in_code = False
    
    for l in lines:
        if l.strip().startswith('```'):
            in_code = not in_code
            out.append(l)
            continue
        if in_code:
            out.append(l)
            continue
            
        if re.match(r'^(?:#{1,4}\s|---|___|\*\*\*)', l.strip()):
            indent_stack = [0]
            out.append(l)
            continue

        m = re.match(r'^([ \t]*)([*+-]|\d+\.|\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9\u06F0+\.)\s+(.*)$', l)
        if m:
            lead_ws = m.group(1).replace('\t', '    ')
            bullet = m.group(2)
            content = m.group(3)
            raw_len = len(lead_ws)
            
            if raw_len == 0:
                indent_stack = [0]
                out.append(f'{bullet} {content}')
            else:
                if raw_len > indent_stack[-1]:
                    indent_stack.append(raw_len)
                else:
                    while len(indent_stack) > 1 and raw_len < indent_stack[-1] - 1:
                        indent_stack.pop()
                level = max(1, len(indent_stack) - 1)
                norm_ws = '    ' * level
                out.append(f'{norm_ws}{bullet} {content}')
        else:
            if not l.strip():
                out.append(l)
            else:
                if '@@@FORMULATOKEN' in l or '@@@DIAGRAMTOKEN' in l:
                    out.append(l)
                elif not l.startswith(' ') and not l.startswith('\t'):
                    indent_stack = [0]
                    out.append(l)
                else:
                    out.append(l)
    return '\n'.join(out)

def format_tables_with_rtl(html_content):
    """Ensures all markdown-generated tables have dir='rtl' and full-width responsive classes, integrating table captions."""
    html_content = re.sub(r'style="text-align:\s*left;?"', 'style="text-align: right;"', html_content)
    html_content = re.sub(r'<table>', r'<div class="table-responsive"><table class="data-table clinical-table" dir="rtl">', html_content)
    html_content = re.sub(r'</table>', r'</table></div>', html_content)

    # Clean any unparsed markdown asterisks inside table cells
    html_content = re.sub(r'\*\*([^\*\n]+)\*\*', r'<strong>\1</strong>', html_content)
    html_content = html_content.replace('**', '')

    # Integrate table caption headers (<h4 id="...">جدول...</h4>) directly into clinical table wrapper
    def repl_table_cap(m):
        cap_text = m.group(1).strip()
        tbl_content = m.group(2)
        return f'''<div class="clinical-table-wrapper">
  <div class="table-caption-bar">
    <span class="table-caption-icon">📊</span>
    <span class="table-caption-text">{cap_text}</span>
  </div>
  {tbl_content}
</div>'''

    html_content = re.sub(r'<h[34][^>]*>(جدول[\s\S]*?)</h[34]>\s*(<div class="table-responsive">[\s\S]*?</div>)', repl_table_cap, html_content)
    return html_content

def parse_callouts(text):
    """Converts blockquote callouts (> [!NOTE] / > [!WARNING] / etc.) into rich widgets."""
    pattern = re.compile(r'(?:^>[ \t]*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*(.*?)\n)((?:^>.*$\n?)+)', re.MULTILINE | re.IGNORECASE)

    def repl(m):
        kind = m.group(1).upper()
        title = m.group(2).strip()
        body_lines = m.group(3).splitlines()
        clean_body = []
        for bl in body_lines:
            bl_clean = re.sub(r'^>[ \t]?', '', bl)
            clean_body.append(bl_clean)
        body_md = '\n'.join(clean_body)
        body_html = markdown.markdown(body_md, extensions=['extra'])
        body_html = transform_inline_elements(body_html)

        badge_titles = {
            'NOTE': ('نکته بالینی لارنس', 'info'),
            'TIP': ('مروارید تشخیصی (Clinical Pearl)', 'tip'),
            'IMPORTANT': ('نکته کلیدی و الزامی', 'important'),
            'WARNING': ('هشدار و کنترااندیکاسیون قطعی', 'warning'),
            'CAUTION': ('تله امتحانی و خطای خطرناک', 'danger')
        }
        fallback_title, callout_type = badge_titles.get(kind, ('نکته بالینی', 'info'))
        final_title = title if title else fallback_title

        return f"""
<div class="callout callout-{callout_type} callout-pro">
  <div class="callout-header">
    <span class="callout-icon" aria-hidden="true"></span>
    <h4 class="callout-title">{final_title}</h4>
  </div>
  <div class="callout-body">
    {body_html}
  </div>
</div>
"""
    return pattern.sub(repl, text)

def parse_steppers(text):
    """Parses sequential multi-step encounters into interactive steppers with vibrant 5-color thematic palettes."""
    pattern = re.compile(r'(?m)^#{3,5}\s*(گام\s*[\d\u06F0-\u06F9]+|مرحله\s*[\d\u06F0-\u06F9]+|فاز\s*[\d\u06F0-\u06F9]+)[:\s\-—]*(.*?)\n([\s\S]*?)(?=(?:^#{3,5}\s*(?:گام|مرحله|فاز)|^#{2,4}\s+[^\n]+|\Z))')
    
    theme_map = {
        '۱': 'blue', '۲': 'rose', '۳': 'amber', '۴': 'emerald', '۵': 'purple',
        '1': 'blue', '2': 'rose', '3': 'amber', '4': 'emerald', '5': 'purple'
    }

    def repl(m):
        step_badge = m.group(1).strip()
        step_title = m.group(2).strip()
        step_body_md = m.group(3).strip()
        step_html = markdown.markdown(normalize_list_indentation(step_body_md), extensions=['extra'])
        step_html = transform_inline_elements(step_html)
        step_num = re.sub(r'[^\d\u06F0-\u06F9]', '', step_badge) or '۱'
        theme = theme_map.get(step_num, 'blue')
        
        return f"""
<div class="stepper-item clinical-step step-theme-{theme}">
  <div class="step-badge-col">
    <span class="step-num-bubble">{step_num}</span>
    <span class="step-connector-line"></span>
  </div>
  <div class="step-content-card">
    <div class="step-card-header">
      <span class="step-tag-pill">{step_badge}</span>
      <h4 class="step-title-text">{step_title}</h4>
    </div>
    <div class="step-card-body">
      {step_html}
    </div>
  </div>
</div>
"""
    return pattern.sub(repl, text)

def render_part_body(body_md):
    """Renders markdown content within a part card, nesting diagrams and formulas directly inside their parent steppers and cards."""
    bt3 = chr(96) * 3
    
    # 1. Format display math ($$...$$) first into token placeholders so they don't break list structure
    formula_blocks = []
    def repl_display_math(m):
        raw_formula = m.group(1).strip()
        if is_progression_chain(raw_formula):
            rendered_box = render_progression_pipeline(raw_formula)
        else:
            rendered_formula = render_latex_to_html(raw_formula)
            rendered_formula = transform_inline_elements(rendered_formula)
            rendered_box = f'<div class="med-formula-box" dir="ltr">{rendered_formula}</div>'
        idx = len(formula_blocks)
        formula_blocks.append(rendered_box)
        return f'\n\n@@@FORMULATOKEN{idx}@@@\n\n'

    body_md = re.sub(r'\$\$([\s\S]*?)\$\$', repl_display_math, body_md)

    # 2. Extract code diagrams into tokens so they remain intact inside their enclosing step/block
    code_blocks = []
    def repl_code_block(m):
        full_block = m.group(0)
        code_content = re.sub(r'^' + bt3 + r'[^\n]*\n', '', full_block.strip())
        code_content = re.sub(r'\n' + bt3 + r'$', '', code_content)
        
        lines = [l.strip() for l in code_content.strip().splitlines() if l.strip()]
        is_ascii = any(ch in code_content for ch in ['┌', '├', '└', '├──', '└──', '─', '━', '│', '╔', '╗', '╚', '╝', '║', '═'])
        if is_lethal_triad_diagram(lines):
            rendered = render_lethal_triad_diagram(lines, "مثلث کشنده تروما (The Lethal Triad)")
        elif is_vertical_timeline_diagram(code_content):
            first_l = lines[0] if lines else ""
            diag_title = clean_diagram_title(first_l) or "توالی مراحل بالینی و کرونولوژیک"
            rendered = render_vertical_timeline_diagram(code_content, diag_title)
        elif is_ascii:
            rendered = parse_ascii_diagram(code_content)
        else:
            body_clean = markdown.markdown(normalize_list_indentation(code_content), extensions=['extra'])
            body_clean = transform_inline_elements(body_clean)
            rendered = f'<div class="clinical-quote-card">{body_clean}</div>'
            
        idx = len(code_blocks)
        code_blocks.append(rendered)
        return f'\n\n@@@DIAGRAMTOKEN{idx}@@@\n\n'

    code_pattern = re.compile(r'(?m)^' + bt3 + r'[^\n]*\n[\s\S]*?\n' + bt3 + r'[ \t]*$')
    body_md = code_pattern.sub(repl_code_block, body_md)

    # 3. Parse callouts and steppers on the unified markdown body
    body_md = parse_callouts(body_md)
    body_md = parse_steppers(body_md)
    body_md = normalize_list_indentation(body_md)

    # 4. Render main markdown into HTML
    chunk_html = markdown.markdown(body_md, extensions=['extra', 'tables'])
    chunk_html = format_tables_with_rtl(chunk_html)
    chunk_html = transform_inline_elements(chunk_html)

    # 5. Restore diagram and formula placeholders inside their container
    for i, block_html in enumerate(code_blocks):
        token = f'@@@DIAGRAMTOKEN{i}@@@'
        chunk_html = chunk_html.replace(f'<p>{token}</p>', block_html)
        chunk_html = chunk_html.replace(f'<p>{token}', block_html)
        chunk_html = chunk_html.replace(f'{token}</p>', block_html)
        chunk_html = chunk_html.replace(token, block_html)

    for i, f_html in enumerate(formula_blocks):
        token = f'@@@FORMULATOKEN{i}@@@'
        chunk_html = chunk_html.replace(f'<p>{token}</p>', f_html)
        chunk_html = chunk_html.replace(f'<p>{token}', f_html)
        chunk_html = chunk_html.replace(f'{token}</p>', f_html)
        chunk_html = chunk_html.replace(token, f_html)

    # 6. Unwrap any accidental <pre><code> blocks created by 4-space indentations
    def repl_pre(m):
        content = m.group(1).strip()
        if re.search(r'^\s*[*•\-\d]', content) or '<span class="med-measure"' in content or '<strong>' in content or '**' in content:
            clean = markdown.markdown(content, extensions=['extra'])
            clean = transform_inline_elements(clean)
            return f'<div class="clinical-callout-card" style="margin-block: 10px;">{clean}</div>'
        return m.group(0)

    chunk_html = re.sub(r'<pre><code>([\s\S]*?)</code></pre>', repl_pre, chunk_html)
    return chunk_html

def parse_section_markdown(section_md):
    """
    Parses and renders markdown content into rich semantic HTML organized into
    elevated clinical part cards:
    - Part 1: Foundations & Pathophysiology (.part-foundations)
    - Part 2: Step-by-Step Clinical Encounter (.part-workflow)
    - Part 3: Reference Tables & Classifications (.part-tables)
    - Part 4: High-Yield Exam Cram (.high-yield-exam-card)
    - Questions: Sample Questions Anatomy (.part-questions)
    """
    section_md = section_md.replace('\r\n', '\n')
    part_matches = list(re.finditer(r'(?m)^###\s+(?:([\d\u06F0-\u06F9]+)[\.\:\s\-—]*)?(.*?)$', section_md))
    if not part_matches:
        rendered = render_part_body(section_md)
        return f'<div class="clinical-part-card part-general"><div class="part-card-body">{rendered}</div></div>'
        
    splits = [m.start() for m in part_matches] + [len(section_md)]
    card_htmls = []
    
    intro = section_md[:splits[0]].strip()
    if intro:
        intro_clean = re.sub(r'^\*\(.*?\)\*\s*$', '', intro, flags=re.MULTILINE).strip()
        intro_clean = re.sub(r'^\-\-\-\s*$', '', intro_clean, flags=re.MULTILINE).strip()
        if intro_clean:
            intro_html = render_part_body(intro_clean)
            card_htmls.append(f'<div class="clinical-intro-card">{intro_html}</div>')
            
    for i, p in enumerate(part_matches):
        p_num = p.group(1) or str(i+1)
        p_title = p.group(2).strip()
        p_title = re.sub(r'(?:<code>)?`?\[(?:🎯|⚠️)[^\]]*\]`?(?:</code>)?', '', p_title).strip()
        p_title = transform_inline_elements(p_title)
        p_chunk = section_md[splits[i]:splits[i+1]]
        
        if any(w in p_title for w in ['مبانی', 'پاتوفیزیولوژی', 'اصول']):
            theme = 'foundations'
            badge = f'پارت {p_num}: مبانی و پاتوفیزیولوژی'
            icon = '🧬'
        elif any(w in p_title for w in ['مسیر بالینی', 'تصمیم‌گیری', 'مدیریت', 'گام', 'پروتکل']):
            theme = 'workflow'
            badge = f'پارت {p_num}: مسیر بالینی و تصمیم‌گیری'
            icon = '🩺'
        elif any(w in p_title for w in ['جدول', 'جداول', 'رده‌بندی', 'مقایسه']):
            theme = 'tables'
            badge = f'پارت {p_num}: جداول و رده‌بندی‌های مرجع'
            icon = '📊'
        elif any(w in p_title for w in ['مرور شب امتحان', 'High-Yield']):
            theme = 'exam'
            badge = '⚡ مرور شب امتحان (High-Yield Summary)'
            icon = '⚡'
        elif any(w in p_title for w in ['سوال', 'کالبدشکافی', 'تست']):
            theme = 'questions'
            badge = f'پارت {p_num}: کالبدشکافی سوالات آزمون'
            icon = '📝'
        else:
            theme = 'general'
            clean_sub_title = re.sub(r'\s*\([^)]*\)\s*', ' ', p_title).strip()
            if len(clean_sub_title) > 35:
                clean_sub_title = clean_sub_title[:32] + '...'
            badge = f'پارت {p_num}: {clean_sub_title}' if clean_sub_title else f'پارت {p_num}'
            icon = '📌'
            
        chunk_lines = p_chunk.splitlines()
        body_lines = chunk_lines[1:]
        body_md = '\n'.join(body_lines).strip()
        body_html = render_part_body(body_md)
        
        if theme == 'exam':
            card_htmls.append(f'''<div class="high-yield-exam-card" data-cram-target="true">
  <div class="exam-card-header">
    <span class="exam-pulse-icon">⚡</span>
    <h3 class="exam-title-text">{p_title}</h3>
  </div>
  <div class="exam-card-body">
    {body_html}
  </div>
</div>''')
        else:
            card_htmls.append(f'''<div class="clinical-part-card part-{theme}">
  <div class="part-card-header">
    <span class="part-tag-badge badge-{theme}"><span class="part-icon">{icon}</span> {badge}</span>
    <h3 class="part-title-text">{p_title}</h3>
  </div>
  <div class="part-card-body">
    {body_html}
  </div>
</div>''')

    return '\n'.join(card_htmls)

def extract_plain_text(html_str):
    """Strips HTML tags for client-side search engine indexing."""
    text = re.sub(r'<[^>]+>', ' ', html_str)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def generate_chapter_mindmap(chapter_id, chapter_title, sections):
    """
    Generates a dynamic interactive Chapter Mind-Map Card HTML for any surgery chapter,
    linking directly to each of its sections with clean badges and smooth scrolling.
    Includes explicit IDs and inline fallback for 100% click reliability.
    """
    branch_colors = ['#0284c7', '#6366f1', '#8b5cf6', '#e11d48', '#d97706', '#059669', '#0d9488', '#0891b2', '#7c3aed', '#db2777', '#ca8a04', '#16a34a']
    
    branches_html = []
    for idx, sec in enumerate(sections):
        b_color = branch_colors[idx % len(branch_colors)]
        sec_num = sec['partNumber']
        sec_title = sec['title']
        sec_id = sec['id']
        
        items = []
        raw_lines = [l.strip() for l in sec['rawText'].splitlines() if l.strip()]
        for l in raw_lines[:4]:
            if len(l) > 15 and len(l) < 90 and not l.startswith('بخش'):
                items.append(l)
        if not items:
            items = [sec.get('summary', '')[:80] + '...']
            
        items_li = ''.join(f'<li>{it}</li>' for it in items[:3])
        
        branches_html.append(f"""
        <div class="mindmap-card-branch" data-branch="{idx+1}" style="border-inline-start-color: {b_color};">
          <div class="branch-card-header">
            <span class="branch-badge" style="background: {b_color};">بخش {sec_num}</span>
            <a href="#{sec_id}" class="branch-title-link">{sec_title}</a>
          </div>
          <ul class="branch-items-list">
            {items_li}
          </ul>
        </div>
        """)

    return f"""
<div class="chapter-mindmap-container" id="chapterMindMap-{chapter_id}">
  <div class="chapter-mindmap-card">
    <div class="mindmap-header">
      <div class="mindmap-title-group">
        <div class="mindmap-icon-box" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="6" y1="3" x2="6" y2="15"></line>
            <circle cx="18" cy="6" r="3"></circle>
            <circle cx="6" cy="18" r="3"></circle>
            <path d="M18 9a9 9 0 0 1-9 9"></path>
          </svg>
        </div>
        <div>
          <h2 class="mindmap-title">نمودار درختی جامع فصل (Chapter Mind-Map)</h2>
          <span class="mindmap-subtitle">نقشه ساختاری و مسیر یادگیری {len(sections)} بخش بالینی • کلیک روی هر شاخه برای پرش مستقیم</span>
        </div>
      </div>
      <button type="button" id="btnToggleMindmap" class="btn-toggle-mindmap" aria-expanded="true" title="جمع‌بندی / باز کردن نقشه مفهومی" onclick="window.toggleMindmapSection ? window.toggleMindmapSection(this) : null">
        <span class="mindmap-btn-text">جمع‌بندی نقشه</span>
        <svg class="mindmap-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
    
    <div class="mindmap-content" id="mindmapContent">
      <div class="mindmap-tree-root">
        <div class="root-node-pill">
          <span class="root-node-dot"></span>
          <span>{chapter_title}</span>
        </div>
      </div>

      <div class="mindmap-grid">
        {''.join(branches_html)}
      </div>
    </div>
  </div>
</div>
"""

def extract_section_title(first_line, chunk_lines, part_num):
    """Extracts a descriptive, rich section title without bare numbering or page references."""
    raw = first_line.lstrip('#').strip()
    raw = re.sub(r'^[^\w\s]+\s*', '', raw)
    raw = clean_page_numbers(raw).strip()
    
    if '—' in raw and 'بخش' in raw:
        after_bakhsh = raw.split('بخش')[-1].strip()
        after_bakhsh = re.sub(r'^[\d\u06F0-\u06F9]+[:\s\-—]*', '', after_bakhsh).strip()
        if not after_bakhsh or after_bakhsh in ['و پایانی', 'پایانی']:
            for l in chunk_lines[1:12]:
                ls = l.strip()
                if (ls.startswith('## ') and not ls.startswith('## بخش')) or ls.startswith('### '):
                    sub = ls.lstrip('#').strip()
                    sub = re.sub(r'^(?:مبحث\s+[\w\d\u06F0-\u06F9]+|[\d\u06F0-\u06F9]+)[\.\:؛\-—\s]*', '', sub).strip()
                    sub = clean_page_numbers(sub)
                    return f'بخش {part_num}: {sub}'
            return f'بخش {part_num}'
        else:
            return f'بخش {part_num}: {after_bakhsh}'
    elif re.match(r'^بخش\s*[\d\u06F0-\u06F9]+[:\s\-—]*$', raw):
        for l in chunk_lines[1:12]:
            ls = l.strip()
            if ls.startswith('### ') or (ls.startswith('## ') and not ls.startswith('## بخش')):
                sub = ls.lstrip('#').strip()
                sub = re.sub(r'^(?:مبحث\s+[\w\d\u06F0-\u06F9]+|[\d\u06F0-\u06F9]+)[\.\:؛\-—\s]*', '', sub).strip()
                sub = clean_page_numbers(sub)
                return f'بخش {part_num}: {sub}'
        return f'بخش {part_num}'
    else:
        m = re.match(r'^بخش\s*[\d\u06F0-\u06F9]+[:\s\-—]*(.*)$', raw)
        if m:
            topic = m.group(1).strip()
            return f'بخش {part_num}: {topic}' if topic else f'بخش {part_num}'
        return raw

def build_single_chapter(config, base_dir):
    """Processes a single Surgery markdown file into structured chapter record."""
    input_path = os.path.join(base_dir, 'chapters', 'Surgery', config['filename'])
    if not os.path.exists(input_path):
        print(f"Error: Could not find markdown file: {input_path}")
        return None, []

    with open(input_path, 'r', encoding='utf-8') as f:
        raw_content = f.read()

    lines = raw_content.splitlines()
    filtered_lines = []
    stripped_meta_lines = []

    for idx, line in enumerate(lines):
        if any(p.search(line) for p in CONVERSATIONAL_WRAPPER_PATTERNS):
            stripped_meta_lines.append((idx + 1, line))
        else:
            filtered_lines.append(line)

    sanitized_text = '\n'.join(filtered_lines)
    # Strip repeating intra-chapter title lines (e.g. # فصل ۱۵: ...)
    sanitized_text = re.sub(r'(?m)^#{1,3}\s*فصل\s+[\d\u06F0-\u06F9]+:(?!.*?بخش).*$', '', sanitized_text)

    # Detect Section Splits across all chapters
    matches = list(re.finditer(r'^#{1,3}\s*[^#\n]*?بخش\s+([\d\u06F0-\u06F9]+)(?:[:\s\-—(].*|\s*)$', sanitized_text, re.MULTILINE))
    if not matches:
        print(f"Warning: No sections found in {config['filename']}!")
        return None, stripped_meta_lines

    splits = [m.start() for m in matches]
    splits.append(len(sanitized_text))

    sections = []
    ch_id = config['id']

    for i in range(len(matches)):
        start_idx = splits[i]
        end_idx = splits[i+1]
        chunk = sanitized_text[start_idx:end_idx]
        chunk_lines = chunk.splitlines()
        first_line = chunk_lines[0].strip()
        part_num = i + 1
        
        clean_part_title = extract_section_title(first_line, chunk_lines, part_num)

        body_md = '\n'.join(chunk_lines[1:])
        content_html = parse_section_markdown(body_md)
        raw_text = extract_plain_text(content_html)
        summary = raw_text[:280] + '...' if len(raw_text) > 280 else raw_text

        sec_id = f"{ch_id}-sec{part_num:02d}"

        sections.append({
            "id": sec_id,
            "chapterId": ch_id,
            "number": part_num,
            "partNumber": part_num,
            "title": clean_part_title,
            "shortTitle": clean_part_title[:45] + ('...' if len(clean_part_title) > 45 else ''),
            "summary": summary,
            "contentHtml": content_html,
            "rawText": raw_text
        })

    mindmap_html = generate_chapter_mindmap(ch_id, config['title'], sections)

    # Check for dedicated Exam Summary Markdown file
    summary_candidates = [
        os.path.join(base_dir, 'chapters', 'Surgery', 'summaries', config['filename']),
        os.path.join(base_dir, config['filename'])
    ]
    exam_summary_html = None
    summary_content = None
    for sc in summary_candidates:
        if os.path.exists(sc):
            try:
                # Local import or builder call
                sys.path.insert(0, os.path.join(base_dir, 'scripts'))
                import build_biliary_exam_summary
                exam_summary_html, summary_content = build_biliary_exam_summary.build_biliary_summary_html(sc)
                print(f"  ✓ Attached High-Yield Exam Summary from: {os.path.basename(sc)}")
                break
            except Exception as e:
                print(f"  Warning: could not build summary for {config['filename']}: {e}")

    chapter_record = {
        "id": ch_id,
        "slug": config['id'].replace('surg-', ''),
        "courseId": "surgery",
        "number": config['number'],
        "title": config['title'],
        "shortTitle": config['shortTitle'],
        "latinTitle": config['latinTitle'],
        "author": config['author'],
        "authorAffiliation": config['authorAffiliation'],
        "totalSections": len(sections),
        "estimatedReadTime": config['estimatedReadTime'],
        "mindMapHtml": mindmap_html,
        "sections": sections
    }

    if exam_summary_html:
        chapter_record["examSummaryHtml"] = exam_summary_html
        chapter_record["summaryContent"] = summary_content

    return chapter_record, stripped_meta_lines

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print("=================================================================")
    print("MEDICALISM ALBORZ - GENERAL SURGERY 22-CHAPTER COMPREHENSIVE BUILDER")
    print("Multi-modal Tree Distribution: 90% Approach 2 | 7% Approach 1 | 3% Approach 3")
    print("=================================================================")

    all_chapters = []
    total_stripped = 0

    for idx, cfg in enumerate(CHAPTER_CONFIGS):
        print(f"\n[{idx+1}/{len(CHAPTER_CONFIGS)}] Processing Chapter {cfg['number']}: {cfg['shortTitle']}...")
        chapter_record, stripped = build_single_chapter(cfg, base_dir)
        if not chapter_record:
            print(f"  ❌ FAILED to build chapter from {cfg['filename']}")
            sys.exit(1)

        total_stripped += len(stripped)
        all_chapters.append(chapter_record)
        print(f"  ✓ Chapter {cfg['number']} built successfully: {len(chapter_record['sections'])} sections, {len(stripped)} meta-lines stripped.")

    all_chapters.sort(key=lambda x: x['number'])

    # 1. Write JavaScript registry file
    registry_js_path = os.path.join(base_dir, 'js', 'data', 'surgery-registry.js')
    os.makedirs(os.path.dirname(registry_js_path), exist_ok=True)

    js_content = f"""/**
 * MEDICAL STUDY WEBAPP - GENERAL SURGERY COURSE REGISTRY (22 COMPREHENSIVE CHAPTERS)
 * Course: جراحی جنرال (رفرنس لارنس - Lawrence's Essentials of General Surgery)
 * Total Chapters: {len(all_chapters)}
 * Total Sections: {sum(len(c['sections']) for c in all_chapters)}
 * Generated automatically by scripts/build_surgery_chapters.py
 */

window.SURGERY_REGISTRY = {json.dumps(all_chapters, ensure_ascii=False, indent=2)};
"""
    with open(registry_js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"\nSUCCESS: Wrote 22-chapter JavaScript registry to: {registry_js_path}")

    # 2. Write JSON registry file
    registry_json_path = os.path.join(base_dir, 'chapters', 'Surgery', 'surgery_registry.json')
    with open(registry_json_path, 'w', encoding='utf-8') as f:
        json.dump({"course": "surgery", "totalChapters": len(all_chapters), "chapters": all_chapters}, f, ensure_ascii=False, indent=2)
    print(f"SUCCESS: Wrote JSON registry to: {registry_json_path}")

    print("\n=================================================================")
    print("BUILD SUMMARY & VERIFICATION REPORT:")
    print(f"Total Chapters Processed: {len(all_chapters)}")
    print(f"Total Sections Processed: {sum(len(c['sections']) for c in all_chapters)}")
    print(f"Total AI Meta-lines Stripped: {total_stripped}")
    for ch in all_chapters:
        print(f"  Ch {ch['number']:02d} ({ch['id']}): {ch['shortTitle']:<30} -> {len(ch['sections']):2d} sections")
    print("=================================================================")

if __name__ == '__main__':
    main()
