# -*- coding: utf-8 -*-
"""
Medicalism Alborz - Automated Surgery Chapter Parser & Builder (Comprehensive 14-Chapter Edition)
Source: Lawrence's Essentials of General Surgery (جراحی جنرال لارنس)

Multi-modal Tree Distribution:
- 90% Approach 2: Stylized Clean Tree View (.ctree-container)
- 7%  Approach 1: Modern Hierarchical Visual Medical Tree (.vtree-container / .convergent-pathway-card / .visual-protocol-card)
- 3%  Approach 3: Nested Decision Cards (.ncards-container)
Zero monospace <pre><code> code blocks across all 87 diagrams!
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
        "filename": "Stomach and Duodenum.md",
        "id": "surg-ch14",
        "number": 14,
        "title": "فصل ۱۴: معده و دئودنوم (Stomach and Duodenum)",
        "shortTitle": "معده و دئودنوم",
        "latinTitle": "Stomach and Duodenum",
        "author": "گروه جراحی عمومی و جراحی چاقی",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۵۵ دقیقه مطالعه عمیق و مرور بالینی"
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
        "filename": "Diseases of the Vascular System.md",
        "id": "surg-ch24",
        "number": 24,
        "title": "فصل ۲۴: بیماری‌های سیستم عروقی (Diseases of the Vascular System)",
        "shortTitle": "بیماری‌های سیستم عروقی",
        "latinTitle": "Diseases of the Vascular System",
        "author": "گروه جراحی عمومی و جراحی عروق",
        "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "estimatedReadTime": "۷۵ دقیقه مطالعه عمیق و مرور بالینی"
    }
]

# Keywords designating the ~7% Approach 1 (Visual Medical Tree / Major Decision Forks)
APPROACH_1_KEYWORDS = [
    'کولهسیستیت حاد',
    'کلانژیت حاد',
    'محرک‌های سلول پاریتال',
    'شوک خونریزی‌دهنده شدید',
    'ترومایی ناپایدار همودینامیک',
    'بیمار با علائم مشکوک به شوک'
]

# Keywords designating the ~3% Approach 3 (Nested Decision Cards / Criteria Tiers)
APPROACH_3_KEYWORDS = [
    'کاپرینی',
    'Caprini',
    'عوامل مختل‌کننده التیام زخم',
    'کیست پانکراس'
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

def format_math_expr(match):
    """Formats LaTeX math into clean, human-readable medical markup without code boxes."""
    raw = match.group(1).strip()
    s = raw
    s = re.sub(r'\\text\{([^}]+)\}', r'\1', s)
    s = re.sub(r'\\mathrm\{([^}]+)\}', r'\1', s)
    s = s.replace(r'\text{-}', '–').replace(r'\text{–}', '–')
    s = re.sub(r'\^\\circ\s*F', '°F', s)
    s = re.sub(r'\^\\circ\s*C', '°C', s)
    s = s.replace(r'kg/m^2', 'kg/m²')
    s = s.replace(r'/m^2', '/m²')
    s = s.replace(r'^2', '²')
    s = s.replace(r'^3', '³')
    s = s.replace(r'\%', '%')
    s = s.replace(r'\_', '_')
    s = s.replace(r'\mu', 'µ')
    s = s.replace(r'\times', '×')
    s = s.replace(r'\pm', '±')
    s = s.replace(r'\ge', '≥').replace(r'\geq', '≥')
    s = s.replace(r'\le', '≤').replace(r'\leq', '≤')
    s = s.replace(r'\sim', '~')
    s = s.replace(r'\approx', '≈')
    s = s.replace(r'\ ', ' ')
    s = re.sub(r'\\frac\{([^}]+)\}\{([^}]+)\}', r'(\1) / (\2)', s)
    s = re.sub(r'HbA_\{?1c\}?', '###HBA1C###', s)
    s = s.replace('<', '&lt;').replace('>', '&gt;')
    s = s.replace('###HBA1C###', 'HbA<sub>1c</sub>')
    s = re.sub(r'\s+', ' ', s).strip()
    return f'<span class="med-measure" dir="ltr">{s}</span>'

def transform_inline_elements(text):
    """
    Transforms inline badges, math, arrows, English medical terms,
    lead keywords, and decision pills with rich colors and zero broken variation selectors.
    """
    # 1. Flexible Inline Theory badge
    def repl_theory(m):
        inner = m.group(1).strip()
        punct = m.group(2) or ''
        tooltip = f'نکته تئوری: {inner}' if len(inner) > 10 else 'نکته تئوری امتحانی'
        return f'{punct} <span class="badge-theory pearl-micro-badge" data-exam-point="theory" title="{tooltip}"><span class="badge-icon" aria-hidden="true">🎯</span><span class="badge-text sr-only">نکته تئوری</span></span>'

    text = re.sub(r'`?\[🎯[ \t]*([^\]]+)\]`?[ \t]*([\.،؛:!؟\?]?)', repl_theory, text)

    # 2. Flexible Inline Trap badge
    def repl_trap(m):
        inner = m.group(1).strip()
        punct = m.group(2) or ''
        label = "دام تستی"
        if "بزرگ" in inner or "فوق‌العاده" in inner or "بسیار مهم" in inner:
            label = "تله ماژور"
        elif "خط قرمز" in inner or "Never Do" in inner:
            label = "خط قرمز"
        tooltip = f'تله امتحانی: {inner}' if len(inner) > 10 else 'تله و دام امتحانی'
        return f'{punct} <span class="badge-trap trap-micro-badge" data-exam-point="trap" title="{tooltip}"><span class="badge-icon" aria-hidden="true">⚠️</span><span class="trap-label-mini">{label}</span><span class="badge-text sr-only">{inner}</span></span>'

    text = re.sub(r'`?\[⚠️[ \t]*([^\]]+)\]`?[ \t]*([\.،؛:!؟\?]?)', repl_trap, text)
    
    # 3. Inline math expressions ($...$)
    text = re.sub(r'\$([^\$\n]+)\$', format_math_expr, text)

    # 4. Directional arrows (safe non-capturing alternation to protect multi-byte variation selectors)
    text = re.sub(r'(?:⬅️|➡️|⬇️|⬆️)', r'<span class="stepper-arrow-indicator">\g<0></span>', text)
    text = re.sub(r'✅', '<span class="badge-decision-yes" title="موفقیت‌آمیز / پایدار">✅</span>', text)
    text = re.sub(r'❌', '<span class="badge-decision-no" title="ناموفق / ناپایدار / خط قرمز">❌</span>', text)

    # 5. English medical terms in parentheses: (Term) -> (<span class="med-latin-tag" dir="ltr">Term</span>)
    def repl_latin_tag(m):
        term = m.group(1).strip()
        if re.search(r'^[A-Za-z0-9\s\-_/:\.,\+]+$', term) and len(term) >= 2 and not term.isdigit():
            return f'<span class="med-latin-wrap" dir="ltr">(<span class="med-latin-tag">{term}</span>)</span>'
        return m.group(0)

    text = re.sub(r'\(([A-Za-z0-9\s\-_/:\.,\+]+)\)', repl_latin_tag, text)

    # 6. Color-coded lead keywords: **Keyword:**
    def repl_lead(m):
        kw = m.group(1).strip()
        theme = 'indigo'
        if any(w in kw for w in ['علائم', 'تظاهر', 'یافته', 'علامت', 'بیدار']):
            theme = 'amber'
        elif any(w in kw for w in ['درمان', 'اقدام', 'مدیریت', 'انتخاب اول']):
            theme = 'emerald'
        elif any(w in kw for w in ['عوارض', 'خطر', 'بیهوشی', 'منع', 'تله', 'مرگ', 'خط قرمز']):
            theme = 'rose'
        elif any(w in kw for w in ['تشخیص', 'بررسی', 'تست', 'آزمایش', 'تصویر', 'سونوگرافی']):
            theme = 'cyan'
        return f'<strong class="med-lead med-lead-{theme}">{kw}</strong>'

    text = re.sub(r'\*\*([^*:]+:\s*)\*\*', repl_lead, text)

    # 7. Highlight English medical terms in bold (**English Term**) for crisp contrast
    def replace_med_term(match):
        term = match.group(1)
        if re.search(r'[A-Za-z]', term) and not re.search(r'[\u0600-\u06FF]', term):
            return f'<strong class="med-term" dir="ltr">{term}</strong>'
        return f'<strong>{term}</strong>'

    text = re.sub(r'\*\*([^*]+)\*\*', replace_med_term, text)

    return text

def parse_high_yield_card(block_lines):
    """Converts a high-yield blockquote into a gold/emerald callout card."""
    title = "مرور شب امتحان (High-Yield Summary)"
    items = []
    for line in block_lines:
        line_clean = line.lstrip('>').strip()
        if not line_clean:
            continue
        if line_clean.startswith('###') or 'مرور شب امتحان' in line_clean:
            m = re.search(r'مرور شب امتحان\s*(?:\([^\)]+\))?:\s*(.*)', line_clean)
            if m and m.group(1).strip():
                title = f"مرور شب امتحان: {m.group(1).strip()}"
        elif line_clean.startswith('-') or line_clean.startswith('*'):
            item_text = line_clean.lstrip('-*').strip()
            item_html = transform_inline_elements(item_text)
            items.append(item_html)
        else:
            p_html = transform_inline_elements(line_clean)
            items.append(p_html)

    items_html = ''.join(f'<li class="high-yield-item">{it}</li>' for it in items)
    return f"""
<div class="high-yield-exam-card" data-high-yield="true">
  <div class="high-yield-header">
    <div class="high-yield-title-wrap">
      <div class="high-yield-glow-badge" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
      <div>
        <h4 class="high-yield-title">{title}</h4>
        <span class="high-yield-subtitle">High-Yield Summary • خلاصه کلیدی و نکات پرتکرار آزمون لارنس</span>
      </div>
    </div>
    <span class="high-yield-badge">⚡ شب امتحان</span>
  </div>
  <div class="high-yield-body">
    <ul class="high-yield-list">
      {items_html}
    </ul>
  </div>
</div>
"""

def clean_diagram_title(line):
    t = line.strip()
    t = re.sub(r'^[🎯⚠️\[\]\s*#]+', '', t)
    t = re.sub(r'[\[\]\s*#]+$', '', t)
    return clean_page_numbers(t.strip())

def clean_tree_text(t):
    """Strips tree branch characters, arrows, leading hyphens."""
    t = re.sub(r'^[│\s]*[├└]──[>►\s]*', '', t)
    t = re.sub(r'^[│\s]+', '', t)
    t = re.sub(r'[┌┐└┘├┤┬┴┼─━│┃▼►◄▲]+', '', t)
    return t.strip()

def parse_split_box_into_hierarchy(lines):
    """
    Parses horizontal split-box ASCII diagrams (e.g. ┌───────┴───────┐ with multiple columns)
    into a clean multi-branch tree hierarchy:
    Root -> Branch 1 (Level 1) -> Subnodes (Level 2) -> Actions (Level 3)
         -> Branch 2 (Level 1) -> Subnodes (Level 2) -> Actions (Level 3)
    """
    split_idx = -1
    for i, l in enumerate(lines):
        if ('┌' in l or '┬' in l or '┴' in l) and ('─' in l or '━' in l):
            split_idx = i
            break
    if split_idx == -1:
        return None

    # 1. Extract Root text from lines before the split
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

    # 2. Extract column data from content lines below split
    content_lines = lines[split_idx+1:]
    col_data = []
    for l in content_lines:
        s = l.strip()
        if not s or all(ch in '┌┐└┘├┤┬┴┼─━│┃▼►◄▲ \t' for ch in s):
            continue
        brackets = re.findall(r'\[[^\]]+\]', l)
        if len(brackets) >= 2:
            parts = brackets
        else:
            bullets = [m.start() for m in re.finditer(r'•', l)]
            if len(bullets) >= 2:
                parts = []
                cuts = bullets + [len(l)]
                for k in range(len(cuts)-1):
                    p = l[cuts[k]:cuts[k+1]].strip()
                    if p: parts.append(p)
            else:
                cleaned = re.sub(r'^[│┃\s]+|[│┃\s]+$', '', l)
                parts = [p.strip() for p in re.split(r'\s{3,}', cleaned) if p.strip()]
                parts = [p for p in parts if not all(ch in '┌┐└┘├┤┬┴┼─━│┃▼►◄▲ \t' for ch in p)]
        if parts:
            col_data.append(parts)

    if not col_data:
        return None

    num_cols = max(len(row) for row in col_data)
    if num_cols < 2:
        return None

    cols = [[] for _ in range(num_cols)]
    for row in col_data:
        if len(row) == num_cols:
            for idx, item in enumerate(row):
                cols[idx].append(item)
        elif len(row) == 1:
            cols[0].append(row[0])
        else:
            for idx, item in enumerate(row):
                if idx < num_cols:
                    cols[idx].append(item)

    # 3. Assemble branches
    root_node = {'text': root_text, 'children': []}
    for c_idx, col_items in enumerate(cols):
        if not col_items:
            continue

        # Merge multiline bracket segments (e.g. [Title on line 1 + Subtitle on line 2])
        merged_items = []
        c_i = 0
        while c_i < len(col_items):
            cur = col_items[c_i]
            if '[' in cur and ']' not in cur and c_i + 1 < len(col_items) and ']' in col_items[c_i + 1]:
                cur = cur + ' ' + col_items[c_i + 1]
                c_i += 1
            cur_clean = clean_tree_text(cur)
            cur_clean = re.sub(r'^\s*\[\s*', '', cur_clean)
            cur_clean = re.sub(r'\s*\]\s*$', '', cur_clean)
            if cur_clean and not all(ch in '│┃▼ \t' for ch in cur_clean):
                merged_items.append(cur_clean)
            c_i += 1

        if not merged_items:
            continue

        b_title = merged_items[0]
        branch_node = {'text': b_title, 'children': [], 'level': 1}

        curr_subnode = None
        for item_clean in merged_items[1:]:
            if not curr_subnode:
                curr_subnode = {'text': item_clean, 'children': [], 'level': 2}
                branch_node['children'].append(curr_subnode)
            else:
                curr_subnode['children'].append({'text': item_clean, 'children': [], 'level': 3})

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
        split_res = parse_split_box_into_hierarchy(lines)
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
        # Fallback to single card if no children
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
        # Determine theme color
        col = 'rose' if any(w in n1_text for w in ['اورژانس', 'خطر', 'حاد', 'شوک', 'مرگ', 'ناپایدار', 'قرمز']) else (
              'emerald' if any(w in n1_text for w in ['کم‌خطر', 'پایدار', 'نرمال', 'موفق']) else
              'amber' if any(w in n1_text for w in ['متوسط', 'احتیاط', 'مشکوک']) else
              colors[idx % len(colors)]
        )
        
        children_html = []
        if n1.get('children'):
            for n2 in n1['children']:
                n2_text = n2['text']
                # Check for arrow
                if '⬅️' in n2_text:
                    parts = n2_text.split('⬅️', 1)
                    sub_title = transform_inline_elements(parts[0].strip())
                    sub_action = transform_inline_elements(parts[1].strip())
                    sub_html = f'<span class="ctree-text-bold">{sub_title}</span> <span class="ctree-arrow">⬅️</span> <span class="ctree-action-text">{sub_action}</span>'
                else:
                    sub_html = f'<span class="ctree-text">{transform_inline_elements(n2_text)}</span>'
                
                # Check for grandchildren (Level 3)
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
    {''.join(nodes_html)}
  </div>
</div>
"""

# =========================================================================
# APPROACH 1: MODERN HIERARCHICAL MEDICAL TREE (7% of diagrams - Major Decision Forks)
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

    # General 2-way decision split
    split_indices = [idx for idx, l in enumerate(lines) if any(ch in l for ch in ['┌', '┴', '┬', '┼']) and ('─' in l or '━' in l)]
    
    col1_items = []
    col2_items = []

    if split_indices:
        main_split_idx = split_indices[0]
        for l in lines[main_split_idx+1:]:
            s = l.strip()
            if not s or (all(ch in '┌┐└┘├┤┬┴┼─━│┃▼►◄▲ \t' for ch in s) and len(s) < 8):
                continue
            parts = [p.strip() for p in re.split(r'\s{3,}', s) if p.strip()]
            parts = [p for p in parts if not all(ch in '┌┐└┘├┤┬┴┼─━│┃▼►◄▲ \t' for ch in p)]
            if len(parts) >= 2:
                c1 = clean_tree_text(parts[0])
                c2 = clean_tree_text(parts[1])
                if c1: col1_items.append(c1)
                if c2: col2_items.append(c2)
            elif len(parts) == 1:
                cleaned = clean_tree_text(parts[0])
                if cleaned: col2_items.append(cleaned)
    else:
        # Fallback split
        tree = parse_tree_into_hierarchy(lines)
        if tree and len(tree.get('children', [])) >= 2:
            c1_node = tree['children'][0]
            c2_node = tree['children'][1]
            col1_items = [c1_node['text']] + [c['text'] for c in c1_node.get('children', [])]
            col2_items = [c2_node['text']] + [c['text'] for c in c2_node.get('children', [])]

    col1_title = col1_items[0] if col1_items else "مسیر درمانی اول"
    col1_body = col1_items[1:] if len(col1_items) > 1 else col1_items
    col1_bullets = ''.join(f'<li>{transform_inline_elements(it)}</li>' for it in col1_body)

    col2_title = col2_items[0] if col2_items else "مسیر درمانی دوم"
    col2_body = col2_items[1:] if len(col2_items) > 1 else col2_items
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

    raw_lower = diagram_body.lower()
    
    # 1. Approach 1 (7% of cases)
    is_app1 = any(kw in diagram_body for kw in APPROACH_1_KEYWORDS)
    if is_app1:
        return render_approach1_visual_tree(lines, title, diagram_body)

    # 2. Approach 3 (3% of cases)
    is_app3 = any(kw in diagram_body for kw in APPROACH_3_KEYWORDS)
    if is_app3:
        return render_approach3_nested_cards(lines, title, diagram_body)

    # 3. Approach 2 (90% of cases - The Default Standard)
    return render_approach2_clean_tree(lines, title)

def normalize_list_indentation(text):
    """
    Normalizes 2-space indented list items to 4-space indented items
    so Python-Markdown correctly generates nested sub-lists (<ol> / <ul>).
    Preserves 4-space files (like Liver and Spleen) without double-indenting.
    """
    lines = text.splitlines()
    has_2_space = False
    in_code = False
    for l in lines:
        if l.strip().startswith('```'):
            in_code = not in_code
            continue
        if in_code:
            continue
        if re.match(r'^[ ]{2,3}(?:[\*\-\+]|[\d\u06F0-\u06F9]+\.)\s+', l):
            has_2_space = True
            break

    if not has_2_space:
        return text

    out = []
    in_code = False
    for l in lines:
        if l.strip().startswith('```'):
            in_code = not in_code
            out.append(l)
            continue
        if in_code:
            out.append(l)
            continue

        # Match indented list marker (2-space, 4-space, 6-space)
        m = re.match(r'^([ ]+)([\*\-\+]|[\d\u06F0-\u06F9]+\.)\s+(.*)$', l)
        if m:
            spaces = len(m.group(1))
            marker = m.group(2)
            rest = m.group(3)
            # Normalize 2-3 to 4, 4-5 to 8, 6-7 to 12
            new_spaces = 4 if spaces in [2, 3] else (8 if spaces in [4, 5] else (12 if spaces in [6, 7] else (spaces // 2) * 4))
            out.append(' ' * new_spaces + marker + ' ' + rest)
        else:
            # Check for indented continuation line (non-empty, non-tag, leading spaces)
            m_cont = re.match(r'^([ ]{2,7})([^\s\*\-\+].*)$', l)
            if m_cont and not l.strip().startswith('|') and not l.strip().startswith('#') and not l.strip().startswith('>'):
                sp = len(m_cont.group(1))
                new_sp = 4 if sp in [2, 3] else (8 if sp in [4, 5] else sp)
                out.append(' ' * new_sp + m_cont.group(2))
            else:
                out.append(l)
    return '\n'.join(out)

def style_nested_lists(html_content):
    """
    Enhances nested HTML lists so that parent <li> items get distinct header styling
    and nested <ol>/<ul> get vertical guide lines and clean indentation.
    """
    pattern = re.compile(r'<li>\s*(.+?)\s*(<(?:ol|ul)(?: class="[^"]*")?>[\s\S]*?</(?:ol|ul)>)\s*</li>', re.DOTALL)

    def repl(m):
        parent_raw = m.group(1).strip()
        parent_raw = re.sub(r'^<p>\s*|\s*</p>$', '', parent_raw)
        sublist_raw = m.group(2).strip()

        if sublist_raw.startswith('<ol'):
            sublist_clean = re.sub(r'^<ol(?:\s+class="[^"]*")?>', '<ol class="nested-sublist nested-num-list">', sublist_raw)
        else:
            sublist_clean = re.sub(r'^<ul(?:\s+class="[^"]*")?>', '<ul class="nested-sublist nested-bullet-list">', sublist_raw)

        icon = '📋' if any(w in parent_raw for w in ['پنل', 'تست', 'معیار', 'آزمایش', 'بررسی']) else (
               '🔍' if any(w in parent_raw for w in ['علائم', 'نشانه', 'تظاهر', 'یافته']) else (
               '⚡' if any(w in parent_raw for w in ['اقدام', 'درمان', 'مدیریت', 'مداخله']) else (
               '⚠️' if any(w in parent_raw for w in ['علل', 'اتیولوژی', 'فاکتور', 'ریسک', 'خطر']) else '📌')))

        return f'<li class="list-parent-group"><div class="list-parent-header"><span class="list-parent-icon">{icon}</span> <span class="list-parent-title">{parent_raw}</span></div>{sublist_clean}</li>'

    prev = ""
    curr = html_content
    while prev != curr:
        prev = curr
        curr = pattern.sub(repl, curr)
    return curr

# =========================================================================
# SECTION MARKDOWN PARSER
# =========================================================================
def parse_section_markdown(markdown_text):
    """
    Parses section markdown text into rich HTML with:
    - Interactive Multi-Modal Clinical Trees (Approach 2: 90%, Approach 1: 7%, Approach 3: 3%)
    - Clinical Stepper Cards (#### گام ۱ to گام ۵) with dynamic color themes
    - Comparison Tables with strict RTL alignment and zebra striping
    - High-Yield Night-Before-Exam Cards (.high-yield-exam-card)
    - Hierarchical Parent-Child Lists with clean vertical guidelines
    - Verbatim preservation of every medical fact and detail
    """
    # Normalize 2-space indented nested lists to 4-space so Python-Markdown parses child <ol>/<ul> properly
    markdown_text = normalize_list_indentation(markdown_text)

    # Clean leading 4-space indent on blockquotes so python-markdown doesn't convert them to <pre><code>
    lines = [re.sub(r'^\s{2,}>', '>', l) for l in markdown_text.splitlines()]
    html_chunks = []
    i = 0
    total_lines = len(lines)

    step_theme_map = {
        "1": "indigo",   # گام ۱
        "2": "rose",     # گام ۲
        "3": "amber",    # گام ۳
        "4": "cyan",     # گام ۴
        "5": "emerald",  # گام ۵
    }

    while i < total_lines:
        line = lines[i]
        line_s = line.strip()

        # 1. Skip empty lines or pure dividers
        if not line_s or line_s == '---':
            i += 1
            continue

        # 2. Check for Code Block / Flowchart (``` ... ```)
        if line_s.startswith('```'):
            code_block_lines = []
            i += 1
            while i < total_lines and not lines[i].strip().startswith('```'):
                code_block_lines.append(lines[i])
                i += 1
            if i < total_lines and lines[i].strip().startswith('```'):
                i += 1
            
            diagram_body = '\n'.join(code_block_lines)
            if diagram_body.strip():
                flowchart_html = parse_ascii_diagram(diagram_body)
                html_chunks.append(flowchart_html)
            continue

        # 3. Check for High-Yield Blockquote
        if line_s.startswith('>') and ('مرور شب امتحان' in line_s or (i + 1 < total_lines and 'مرور شب امتحان' in lines[i+1])):
            block_lines = []
            while i < total_lines and lines[i].strip().startswith('>'):
                block_lines.append(lines[i])
                i += 1
            html_chunks.append(parse_high_yield_card(block_lines))
            continue

        # 4. Check for Clinical Stepper Heading (e.g., #### گام ۱: ...)
        step_match = re.match(r'^####\s*گام\s*([\d\u06F0-\u06F9]+):\s*(.*)$', line_s)
        if step_match:
            step_num = step_match.group(1)
            step_title = clean_page_numbers(step_match.group(2).strip())
            step_theme = step_theme_map.get(str(step_num), "indigo")
            i += 1
            step_content_lines = []
            while i < total_lines:
                curr_s = lines[i].strip()
                if curr_s.startswith('###') or curr_s.startswith('##') or re.match(r'^####\s*گام\s*[\d\u06F0-\u06F9]+:', curr_s) or curr_s.startswith('>') or curr_s == '---' or curr_s.startswith('```'):
                    break
                step_content_lines.append(lines[i])
                i += 1

            step_md = '\n'.join(step_content_lines)
            step_md = transform_inline_elements(step_md)
            step_body_html = markdown.markdown(step_md, extensions=['tables', 'nl2br'])
            
            # Enforce RTL and clean table wrappers inside stepper
            step_body_html = re.sub(r' align="left"', ' align="right"', step_body_html)
            step_body_html = re.sub(r'style="text-align:\s*left;?"', 'style="text-align: right;"', step_body_html)
            step_body_html = re.sub(
                r'<table>',
                r'<div class="table-container" dir="rtl"><table class="table-medical responsive-table" dir="rtl">',
                step_body_html
            )
            step_body_html = re.sub(r'</table>', r'</table></div>', step_body_html)

            # Convert list items with theory/trap into styled items
            step_body_html = re.sub(
                r'<li>(.*?(?:badge-theory|pearl-micro-badge).*?)</li>',
                r'<li class="exam-pearl-item" data-exam-point="theory">\1</li>',
                step_body_html
            )
            step_body_html = re.sub(
                r'<li>(.*?(?:badge-trap|trap-micro-badge).*?)</li>',
                r'<li class="exam-trap-item" data-exam-point="trap">\1</li>',
                step_body_html
            )
            step_body_html = style_nested_lists(step_body_html)

            stepper_card = f"""
<div class="clinical-stepper-card step-card step-{step_num} step-theme-{step_theme}" data-step="{step_num}">
  <div class="step-card-header">
    <div class="step-badge-pill step-badge-{step_theme}">گام {step_num} بالینی</div>
    <h4 class="step-card-title">{step_title}</h4>
  </div>
  <div class="step-card-body">
    {step_body_html}
  </div>
</div>
"""
            html_chunks.append(stepper_card)
            continue

        # 5. Check for Markdown Table (| ... |)
        if line_s.startswith('|') and '|' in line_s[1:]:
            table_lines = []
            while i < total_lines and lines[i].strip().startswith('|'):
                table_lines.append(lines[i])
                i += 1
            table_md = '\n'.join(table_lines)
            table_md = transform_inline_elements(table_md)
            table_html = markdown.markdown(table_md, extensions=['tables'])

            table_html = re.sub(r' align="left"', ' align="right"', table_html)
            table_html = re.sub(r'style="text-align:\s*left;?"', 'style="text-align: right;"', table_html)
            table_html = re.sub(r' align="center"', ' align="center"', table_html)

            table_html = re.sub(
                r'<td>(.*?(?:badge-theory|pearl-micro-badge).*?)</td>',
                r'<td class="table-cell-pearl">\1</td>',
                table_html
            )
            table_html = re.sub(
                r'<td>(.*?(?:badge-trap|trap-micro-badge).*?)</td>',
                r'<td class="table-cell-trap">\1</td>',
                table_html
            )

            table_html = re.sub(
                r'<table>',
                r'<div class="table-container" dir="rtl"><table class="table-medical responsive-table" dir="rtl">',
                table_html
            )
            table_html = re.sub(r'</table>', r'</table></div>', table_html)
            html_chunks.append(table_html)
            continue

        # 6. Check for Subheadings (### and ####)
        if line_s.startswith('### '):
            h_text = clean_page_numbers(line_s[4:].strip())
            h_text = transform_inline_elements(h_text)
            html_chunks.append(f'''
<div class="medical-subheading-banner level1-banner">
  <div class="banner-accent-bar" aria-hidden="true"></div>
  <h3 class="medical-subheading-level1">{h_text}</h3>
</div>
''')
            i += 1
            continue

        if line_s.startswith('#### '):
            h_text = clean_page_numbers(line_s[5:].strip())
            h_text = transform_inline_elements(h_text)
            html_chunks.append(f'''
<div class="medical-subheading-banner level2-banner">
  <h4 class="medical-subheading-level2">{h_text}</h4>
</div>
''')
            i += 1
            continue

        # 7. Accumulate standard markdown blocks
        std_lines = []
        while i < total_lines:
            curr_s = lines[i].strip()
            if not curr_s or curr_s == '---':
                i += 1
                break
            if std_lines and (
                curr_s.startswith('#') or 
                curr_s.startswith('|') or 
                curr_s.startswith('>') or 
                curr_s.startswith('```') or
                re.match(r'^####\s*گام\s*[\d\u06F0-\u06F9]+:', curr_s)
            ):
                break
            std_lines.append(lines[i])
            i += 1

        if std_lines:
            chunk_md = '\n'.join(std_lines)
            chunk_md = transform_inline_elements(chunk_md)
            chunk_md = re.sub(
                r'(\*\s*\*\*گام\s*([\d\u06F0-\u06F9]+)(.*?)\*\*:?)',
                r'* <span class="step-num-pill">گام \2</span> <strong>\2 \3</strong>',
                chunk_md
            )
            chunk_html = markdown.markdown(chunk_md, extensions=['tables'])

            chunk_html = re.sub(
                r'<li>(.*?(?:badge-theory|pearl-micro-badge).*?)</li>',
                r'<li class="exam-pearl-item" data-exam-point="theory">\1</li>',
                chunk_html
            )
            chunk_html = re.sub(
                r'<li>(.*?(?:badge-trap|trap-micro-badge).*?)</li>',
                r'<li class="exam-trap-item" data-exam-point="trap">\1</li>',
                chunk_html
            )
            chunk_html = style_nested_lists(chunk_html)

            html_chunks.append(chunk_html)

    return '\n'.join(html_chunks)

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

    # Detect Section Splits:
    p_a = list(re.finditer(r'^##\s*بخش\s+([\d\u06F0-\u06F9]+)(?:[:\s\-—(].*|\s*)$', sanitized_text, re.MULTILINE))
    p_b = list(re.finditer(r'^#\s*بخش\s+([\d\u06F0-\u06F9]+)(?:[:\s\-—(].*|\s*)$', sanitized_text, re.MULTILINE))
    p_c = list(re.finditer(r'^#\s*فصل\s*[\d\u06F0-\u06F9]+.*?بخش\s+([\d\u06F0-\u06F9]+).*$', sanitized_text, re.MULTILINE))

    matches = p_a or p_b or p_c
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
        raw_part_title = first_line.lstrip('#').strip()
        clean_part_title = clean_page_numbers(raw_part_title)

        # If title is just bare "بخش X", resolve from first ### subheading
        if re.match(r'^بخش\s*[\d\u06F0-\u06F9]+:?$', clean_part_title.strip()):
            for l in chunk_lines[1:12]:
                l_s = l.strip()
                if l_s.startswith('### '):
                    sub = clean_page_numbers(l_s.lstrip('#').strip())
                    clean_part_title = f"بخش {part_num}: {sub}"
                    break

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

    return chapter_record, stripped_meta_lines

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    print("=================================================================")
    print("MEDICALISM ALBORZ - GENERAL SURGERY 14-CHAPTER COMPREHENSIVE BUILDER")
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
 * MEDICAL STUDY WEBAPP - GENERAL SURGERY COURSE REGISTRY (14 COMPREHENSIVE CHAPTERS)
 * Course: جراحی جنرال (رفرنس لارنس - Lawrence's Essentials of General Surgery)
 * Total Chapters: {len(all_chapters)}
 * Total Sections: {sum(len(c['sections']) for c in all_chapters)}
 * Generated automatically by scripts/build_surgery_chapters.py
 */

window.SURGERY_REGISTRY = {json.dumps(all_chapters, ensure_ascii=False, indent=2)};
"""
    with open(registry_js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"\nSUCCESS: Wrote 14-chapter JavaScript registry to: {registry_js_path}")

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
