# -*- coding: utf-8 -*-
"""
Medicalism Alborz - Automated Surgery Chapter Parser & Builder (Comprehensive 14-Chapter Edition)
Source: Lawrence's Essentials of General Surgery (جراحی جنرال لارنس)

Features:
- Zero Data Loss: 100% verbatim retention of medical facts, clinical steps, tables, English terms, and measurements.
- Interactive & Animated Clinical Flowcharts: Transforms ASCII text-art algorithms (lines, backslashes, box drawings) into visual, animated clinical decision widgets with pulsing connectors, badges, and responsive branch cards.
- Automated Chat Wrapper Sanitization: strips AI conversational intros/outros and meta-lines.
- Headings Sanitization: strips (صفحات x تا y PDF) from all headings, titles, and subheadings.
- Strict RTL Table Formatting: enforces direction: rtl and text-align: right with sticky headers and zebra striping.
- Uncluttered Badges: micro-indicators (🎯 / ⚠️ دام تستی) with tooltips and accessible screen-reader text.
- Vibrant Medical UI Design: theme colors for clinical steppers (indigo, rose, amber, cyan, emerald), section banners, and high-yield cards.
- Multi-Chapter Support: parses all 14 chapters into js/data/surgery-registry.js and chapters/Surgery/surgery_registry.json.
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

def clean_page_numbers(text):
    """Strips (صفحات x تا y PDF) or (صفحه x) from headings and titles."""
    if not text:
        return ""
    t = re.sub(r'\s*\([^)]*صفح[هات]+[^)]*\)', '', text)
    t = re.sub(r'\s*\([^)]*(?:PDF|pdf|لارنس|رفرنس)[^)]*\)', '', t)
    t = re.sub(r'\s*\(پوشش\s*کامل\s*صفحات\s*[\d\u06F0-\u06F9]+.*?\)', '', t)
    return t.strip()

def format_math_expr(match):
    """Formats LaTeX math into clean, human-readable medical markup without code boxes."""
    raw = match.group(1).strip()
    s = raw
    # Strip \text{...} wrappers
    s = re.sub(r'\\text\{([^}]+)\}', r'\1', s)
    s = re.sub(r'\\mathrm\{([^}]+)\}', r'\1', s)
    # Replace en-dash / hyphens inside dimensions
    s = s.replace(r'\text{-}', '–').replace(r'\text{–}', '–')
    # Temperature degrees
    s = re.sub(r'\^\\circ\s*F', '°F', s)
    s = re.sub(r'\^\\circ\s*C', '°C', s)
    # Unit formats and symbols
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
    # Handle fraction: \frac{a}{b} -> (a) / (b)
    s = re.sub(r'\\frac\{([^}]+)\}\{([^}]+)\}', r'(\1) / (\2)', s)
    # Protect HbA_{1c} token before escaping comparison operators
    s = re.sub(r'HbA_\{?1c\}?', '###HBA1C###', s)
    # Escape < and > for HTML safety
    s = s.replace('<', '&lt;').replace('>', '&gt;')
    # Restore styled HbA1c
    s = s.replace('###HBA1C###', 'HbA<sub>1c</sub>')
    # Clean redundant whitespace
    s = re.sub(r'\s+', ' ', s).strip()
    return f'<span class="med-measure" dir="ltr">{s}</span>'

def transform_inline_elements(text):
    """Transforms inline badges, math, arrows, English medical terms, and decision pills."""
    # 1. Inline Theory badge: attach punctuation directly to preceding Persian word to prevent RTL jumping
    def repl_theory(m):
        punct = m.group(1) or ''
        return f'{punct} <span class="badge-theory pearl-micro-badge" data-exam-point="theory" title="نکته تئوری امتحانی"><span class="badge-icon" aria-hidden="true">🎯</span><span class="badge-text sr-only">نکته تئوری</span></span>'

    text = re.sub(r'\s*`?\[🎯\s*نکته\s*تئوری\]`?\s*([\.،؛:!؟\?]?)', repl_theory, text)

    # 2. Inline Trap badge
    def repl_trap(m):
        punct = m.group(1) or ''
        return f'{punct} <span class="badge-trap trap-micro-badge" data-exam-point="trap" title="تله و دام امتحانی"><span class="badge-icon" aria-hidden="true">⚠️</span><span class="trap-label-mini">دام تستی</span><span class="badge-text sr-only">تله امتحانی</span></span>'

    text = re.sub(r'\s*`?\[⚠️\s*تله\s*امتحانی\]`?\s*([\.،؛:!؟\?]?)', repl_trap, text)
    
    # 3. Inline math expressions ($...$)
    text = re.sub(r'\$([^\$\n]+)\$', format_math_expr, text)

    # 4. Directional arrows in diagnostic/treatment algorithms
    text = re.sub(r'([⬅️➡️⬇️⬆️])', r'<span class="stepper-arrow-indicator">\1</span>', text)
    text = re.sub(r'✅', '<span class="badge-decision-yes" title="موفقیت‌آمیز / پایدار">✅</span>', text)
    text = re.sub(r'❌', '<span class="badge-decision-no" title="ناموفق / ناپایدار / خط قرمز">❌</span>', text)

    # 5. Highlight English medical terms in bold (**English Term**) for crisp contrast
    def replace_med_term(match):
        term = match.group(1)
        # If term contains English letters and no Persian characters
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

def parse_ascii_diagram(diagram_body):
    """
    Parses ASCII flowcharts/diagrams into an animated, responsive, visual flowchart card.
    Replaces raw lines, backslashes, and box art with rich CSS nodes, pulse connectors,
    color-coded decision branches, and interactive toggle views.
    """
    lines = [l.rstrip() for l in diagram_body.strip().splitlines() if l.strip()]
    if not lines:
        return ""

    title = clean_diagram_title(lines[0])
    if not title:
        title = "الگوریتم تصمیم‌گیری بالینی لارنس"

    has_boxes = any('┌' in l or '┬' in l or '┴' in l for l in lines)
    has_tree = any('├──' in l or '└──' in l for l in lines)
    has_stepper = ('⬇️' in diagram_body or '➡️' in diagram_body) and not has_boxes

    # Type 1: Tree Indent (├──, └──)
    if has_tree and not has_boxes:
        return render_visual_tree_diagram(lines, title)

    # Type 2: Linear Stepper (⬇️, ➡️)
    if has_stepper:
        return render_visual_stepper_diagram(lines, title)

    # Type 3: Box-Branching 2D Diagram
    if has_boxes:
        return render_visual_box_branch_diagram(lines, title, diagram_body)

    # Type 4: Generic Clinical Diagram
    return render_visual_box_branch_diagram(lines, title, diagram_body)

def render_visual_tree_diagram(lines, title):
    """Renders tree_indent (├──, └──) as an animated branching card tree."""
    root_lines = []
    branches = []
    current_branch = None

    for line in lines[1:]:
        stripped = line.strip()
        if '├──' in line or '└──' in line:
            if current_branch:
                branches.append(current_branch)
            m = re.search(r'[├└]──\s*(.*)', stripped)
            branch_title = m.group(1).strip() if m else stripped
            branch_title = clean_page_numbers(branch_title)
            current_branch = {'title': branch_title, 'items': []}
        elif current_branch is not None:
            clean_item = stripped.lstrip('│ \t-•').strip()
            if clean_item:
                current_branch['items'].append(clean_item)
        else:
            root_lines.append(stripped)

    if current_branch:
        branches.append(current_branch)

    branch_colors = ['cyan', 'indigo', 'rose', 'amber', 'emerald', 'purple', 'teal']
    branches_html = []

    for idx, b in enumerate(branches):
        color = branch_colors[idx % len(branch_colors)]
        items_html = []
        for it in b['items']:
            it_clean = it.replace('│', '').strip()
            if not it_clean:
                continue
            if '⬇️' in it_clean or '➡️' in it_clean:
                items_html.append(f'<div class="tree-step-connector"><span class="flow-pulsing-arrow">⬇️</span></div>')
            elif it_clean.startswith('✅'):
                clean_text = transform_inline_elements(it_clean[1:].strip())
                items_html.append(f'<div class="tree-action-node action-success"><span class="node-icon">✅</span> <span class="node-text">{clean_text}</span></div>')
            elif it_clean.startswith('❌'):
                clean_text = transform_inline_elements(it_clean[1:].strip())
                items_html.append(f'<div class="tree-action-node action-danger"><span class="node-icon">❌</span> <span class="node-text">{clean_text}</span></div>')
            else:
                clean_text = transform_inline_elements(it_clean.lstrip('-•').strip())
                items_html.append(f'<div class="tree-leaf-item"><span class="leaf-dot dot-{color}"></span><span>{clean_text}</span></div>')

        b_title_html = transform_inline_elements(b['title'])
        branches_html.append(f"""
        <div class="flowchart-branch-card branch-theme-{color}">
          <div class="branch-card-header">
            <span class="branch-pill-badge badge-{color}">مسیر {idx+1}</span>
            <h5 class="branch-card-title">{b_title_html}</h5>
          </div>
          <div class="branch-card-body">
            {''.join(items_html)}
          </div>
        </div>
        """)

    root_extra = f'<div class="flowchart-root-subtitle">{" ".join(root_lines)}</div>' if root_lines else ''
    cols_class = f"cols-{min(len(branches), 3)}" if branches else "cols-1"

    return f"""
<div class="clinical-flowchart-card animated-diagram tree-diagram" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> الگوریتم درختی بالینی</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="flowchart-root-node">
    <div class="root-node-inner">
      <span class="root-icon">🩺</span>
      <span class="root-title">{title}</span>
    </div>
    {root_extra}
    <div class="flowchart-connector-down"><span class="flow-pulse-line"></span></div>
  </div>
  <div class="flowchart-branches-grid {cols_class}">
    {''.join(branches_html)}
  </div>
</div>
"""

def render_visual_stepper_diagram(lines, title):
    """Renders sequential linear flowcharts with animated connectors."""
    steps = []
    for l in lines:
        s = l.strip()
        if not s or s in ['⬇️', '➡️', '│', '▼', '---']:
            continue
        steps.append(s)

    step_cards = []
    for idx, st in enumerate(steps):
        is_first = (idx == 0)
        is_last = (idx == len(steps) - 1)
        theme = 'root' if is_first else ('success' if is_last else 'step')
        st_html = transform_inline_elements(st)

        step_cards.append(f"""
        <div class="linear-flow-step step-{theme}">
          <div class="step-badge-indicator">
            <span class="step-number">{idx+1}</span>
          </div>
          <div class="step-content-box">
            <div class="step-text">{st_html}</div>
          </div>
        </div>
        """)
        if not is_last:
            step_cards.append("""
            <div class="linear-flow-connector">
              <span class="flow-arrow-head">▼</span>
            </div>
            """)

    return f"""
<div class="clinical-flowchart-card animated-diagram linear-diagram" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> توالی تصمیم‌گیری بالینی</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="linear-stepper-container">
    {''.join(step_cards)}
  </div>
</div>
"""

def render_visual_box_branch_diagram(lines, title, raw_text):
    """
    Renders box/branching algorithms with an animated visual interactive flowchart container,
    including an interactive schematic board with RTL syntax coloring.
    """
    # Clean the raw text of box characters for smooth readability if needed,
    # but the schematic board displays the exact decision flow clearly in Persian RTL
    return f"""
<div class="clinical-flowchart-card animated-diagram box-branch-diagram" data-flowchart="true">
  <div class="flowchart-header">
    <div class="flowchart-badge"><span class="flowchart-pulse-ring"></span> الگوریتم تشخیصی و تصمیم‌گیری بالینی</div>
    <h4 class="flowchart-title">{title}</h4>
  </div>
  <div class="flowchart-visual-wrapper">
    <div class="flowchart-schematic-canvas" dir="rtl">
      <div class="schematic-board">
        <div class="schematic-root-banner">
          <span class="pulse-icon">⚡</span>
          <span class="root-heading">{title}</span>
        </div>
        <pre class="schematic-tree-code" dir="rtl"><code>{raw_text}</code></pre>
      </div>
    </div>
  </div>
</div>
"""

def parse_section_markdown(markdown_text):
    """
    Parses section markdown text into rich HTML with:
    - Interactive & Animated Clinical Flowcharts (````text ... ````)
    - Clinical Stepper Cards (#### گام ۱ to گام ۵) with dynamic color themes
    - Comparison Tables (.table-container > table.table-medical) with strict RTL alignment and zebra striping
    - High-Yield Night-Before-Exam Cards (.high-yield-exam-card)
    - Styled subheadings with medical accent banners
    - Pearl and Trap list items styled cleanly without badge clutter
    - Verbatim preservation of every medical fact and detail
    """
    lines = markdown_text.splitlines()
    html_chunks = []
    i = 0
    total_lines = len(lines)

    step_theme_map = {
        "1": "indigo",   # گام ۱: شرح حال و معاینه بالینی
        "2": "rose",     # گام ۲: درخت تصمیم‌گیری اورژانسی اختناق
        "3": "amber",    # گام ۳: تصویربرداری و ریسک‌فاکتورها
        "4": "cyan",     # گام ۴: تکنیک‌های جراحی و مش
        "5": "emerald",  # گام ۵: مراقبت بعد عمل و بهبودی
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
                i += 1  # Skip closing ```
            
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

            # Enforce RTL alignment on th and td
            table_html = re.sub(r' align="left"', ' align="right"', table_html)
            table_html = re.sub(r'style="text-align:\s*left;?"', 'style="text-align: right;"', table_html)
            table_html = re.sub(r' align="center"', ' align="center"', table_html)

            # Style cells containing theory pearls and traps
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

            # Wrap table in responsive .table-container with strict RTL
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

        # 7. Accumulate standard markdown blocks (bullet lists, paragraphs, quotes)
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
    """
    branch_colors = ['#0284c7', '#6366f1', '#8b5cf6', '#e11d48', '#d97706', '#059669', '#0d9488', '#0891b2', '#7c3aed', '#db2777', '#ca8a04', '#16a34a']
    
    branches_html = []
    for idx, sec in enumerate(sections):
        b_color = branch_colors[idx % len(branch_colors)]
        sec_num = sec['partNumber']
        sec_title = sec['title']
        sec_id = sec['id']
        
        # Extract 2-3 key subheadings or summary lines from raw text for the branch items
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
      <button type="button" class="btn-toggle-mindmap" aria-expanded="true" title="جمع‌بندی / باز کردن نقشه مفهومی">
        <span class="mindmap-btn-text">جمع‌بندی نقشه</span>
        <svg class="mindmap-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
    
    <div class="mindmap-content">
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
    # Pattern A: ## بخش X
    # Pattern B: # بخش X
    # Pattern C: # فصل ... بخش X
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

        # If title is just "بخش X", grab subtitle from next header if available
        if clean_part_title in [f'بخش {part_num}', f'بخش {part_num}:']:
            for l in chunk_lines[1:10]:
                if l.startswith('### '):
                    sub = clean_page_numbers(l.lstrip('#').strip())
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
    print("Source: Lawrence's Essentials of General Surgery")
    print("=================================================================")

    all_chapters = []
    total_stripped = 0

    # Build and verify chapters one by one
    for idx, cfg in enumerate(CHAPTER_CONFIGS):
        print(f"\n[{idx+1}/{len(CHAPTER_CONFIGS)}] Processing Chapter {cfg['number']}: {cfg['shortTitle']}...")
        chapter_record, stripped = build_single_chapter(cfg, base_dir)
        if not chapter_record:
            print(f"  ❌ FAILED to build chapter from {cfg['filename']}")
            sys.exit(1)

        total_stripped += len(stripped)
        all_chapters.append(chapter_record)
        print(f"  ✓ Chapter {cfg['number']} built successfully: {len(chapter_record['sections'])} sections, {len(stripped)} meta-lines stripped.")

    # Sort chapters by number ascending (Ch 1, 2, 3, 4, 5, 6, 7, 10, 13, 14, 15, 16, 19, 24)
    all_chapters.sort(key=lambda x: x['number'])

    # 1. Write JavaScript registry file (Array format required by app.js and navigation.js)
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
