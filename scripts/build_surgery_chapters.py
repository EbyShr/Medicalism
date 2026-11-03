# -*- coding: utf-8 -*-
"""
Medicalism Alborz - Automated Surgery Chapter Parser & Builder
Source: Lawrence's Essentials of General Surgery (جراحی جنرال لارنس)

Features:
- Zero Data Loss: 100% verbatim retention of medical sentences, tables, English terms, and numbers.
- Automated Chat Wrapper Sanitization: strips AI conversational intros/outros.
- Headings Sanitization: strips (صفحات x تا y PDF) from all headings and titles.
- Strict RTL Table Formatting: enforces direction: rtl and text-align: right with beautiful medical matrix styling.
- Uncluttered Badges: replaces heavy repeating tag text with sleek tooltip-enabled micro-indicators (🎯 / ⚠️ دام تستی) while preserving data attributes and accessible text.
- Vibrant Medical UI Design: theme colors for clinical steppers (indigo, rose, amber, cyan, emerald), stylish section banners, English term highlighting, and rich high-yield cards.
- Output: outputs js/data/surgery-registry.js and chapters/Surgery/surgery_registry.json.
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
    re.compile(r'^\*{0,2}نقشه\s+درختی\s+و\s+تقسیم‌بندی\s+کالیبره‌شده\s+فصل\s+آماده\s+است.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}آیا\s+بخش\s+۱\s+را\s+با\s+تمام\s+جزئیات\s+شروع\s+کنم\?.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}بخش\s+[\d\u06F0-\u06F9]+.*به\s+پایان\s+رسید.*آیا\s+بخش.*شروع\s+کنم\?.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}بخش\s+[\d\u06F0-\u06F9]+.*به\s+پایان\s+رسید.*آیا\s+مایلید.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}در\s+ادامه\s+بخش\s+[\d\u06F0-\u06F9]+.*تقدیم\s+می‌شود.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}ادامه\s+فصل\s+۱۰:.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}فاز\s+۱:\s*مهندسی\s+ساختار\s+و\s+نقشه\s+درختی.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}فاز\s+۲:\s*تولید\s+محتوای\s+فصل.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}اکنون\s+آماده\s+تولید\s+بخش.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}توضیح:\s*برای\s+حفظ\s+دقت\s+صددرصدی.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}دستورات\s+سیستمی.*$', re.IGNORECASE),
    re.compile(r'^\*{0,2}پایان\s+فصل\s+۱۰\s*\(جدار\s+شکم\s+و\s+فتق‌ها\).*موفق\s+باشید.*$', re.IGNORECASE)
]

def clean_page_numbers(text):
    """Strips (صفحات x تا y PDF) or (صفحه x) from headings and titles."""
    if not text:
        return ""
    t = re.sub(r'\s*\([صفحات\s\dتا\sPDF\.]+\)', '', text)
    t = re.sub(r'\s*\(صفحات\s*[\d\u06F0-\u06F9]+\s*تا\s*[\d\u06F0-\u06F9]+\s*(?:PDF|pdf)?\)', '', t)
    t = re.sub(r'\s*\(صفحه\s*[\d\u06F0-\u06F9]+\s*(?:PDF|pdf)?\)', '', t)
    return t.strip()

def format_math_expr(match):
    """Formats LaTeX math into clean accessible HTML markup."""
    raw = match.group(1).strip()
    s = raw
    s = s.replace(r'\text{cm}', 'cm').replace(r'\text{ cm}', ' cm')
    s = s.replace(r'\text{bpm}', 'bpm').replace(r'\text{ bpm}', ' bpm')
    s = s.replace(r'\text{ kg/m}^2', ' kg/m²').replace(r'\text{kg/m}^2', ' kg/m²')
    s = s.replace(r'\text{BMI}', 'BMI')
    s = s.replace(r'^\circ\text{F}', '°F').replace(r'^\circ F', '°F')
    s = s.replace(r'HbA_{1c}', 'HbA<sub>1c</sub>')
    s = s.replace(r'\%', '%')
    s = s.replace(r'<', '&lt;').replace(r'>', '&gt;')
    return f'<span class="medical-math" dir="ltr">{s}</span>'

def transform_inline_elements(text):
    """Transforms inline badges, math, arrows, English medical terms, and decision pills."""
    # 1. Inline Theory and Trap badges - micro-indicators with tooltip & sr-only metadata to prevent visual clutter
    text = re.sub(
        r'`?\[🎯\s*نکته\s*تئوری\]`?',
        '<span class="badge-theory pearl-micro-badge" data-exam-point="theory" title="نکته تئوری امتحانی"><span class="badge-icon" aria-hidden="true">🎯</span><span class="badge-text sr-only">نکته تئوری</span></span>',
        text
    )
    text = re.sub(
        r'`?\[⚠️\s*تله\s*امتحانی\]`?',
        '<span class="badge-trap trap-micro-badge" data-exam-point="trap" title="تله و دام امتحانی"><span class="badge-icon" aria-hidden="true">⚠️</span><span class="trap-label-mini">دام تستی</span><span class="badge-text sr-only">تله امتحانی</span></span>',
        text
    )
    
    # 2. Inline math expressions ($...$)
    text = re.sub(r'\$([^\$]+)\$', format_math_expr, text)

    # 3. Directional arrows in diagnostic/treatment algorithms
    text = re.sub(r'([⬅️➡️⬇️⬆️])', r'<span class="stepper-arrow-indicator">\1</span>', text)
    text = re.sub(r'✅', '<span class="badge-decision-yes" title="موفقیت‌آمیز / پایدار">✅</span>', text)
    text = re.sub(r'❌', '<span class="badge-decision-no" title="ناموفق / ناپایدار / خط قرمز">❌</span>', text)

    # 4. Highlight English medical terms in bold (**English Term**) for crisp contrast
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

def parse_section_markdown(markdown_text):
    """
    Parses section markdown text into rich HTML with:
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

        # 2. Check for High-Yield Blockquote
        if line_s.startswith('>') and ('مرور شب امتحان' in line_s or (i + 1 < total_lines and 'مرور شب امتحان' in lines[i+1])):
            block_lines = []
            while i < total_lines and lines[i].strip().startswith('>'):
                block_lines.append(lines[i])
                i += 1
            html_chunks.append(parse_high_yield_card(block_lines))
            continue

        # 3. Check for Clinical Stepper Heading (e.g., #### گام ۱: ...)
        step_match = re.match(r'^####\s*گام\s*([\d\u06F0-\u06F9]+):\s*(.*)$', line_s)
        if step_match:
            step_num = step_match.group(1)
            step_title = clean_page_numbers(step_match.group(2).strip())
            step_theme = step_theme_map.get(str(step_num), "indigo")
            i += 1
            step_content_lines = []
            while i < total_lines:
                curr_s = lines[i].strip()
                if curr_s.startswith('###') or curr_s.startswith('##') or re.match(r'^####\s*گام\s*[\d\u06F0-\u06F9]+:', curr_s) or curr_s.startswith('>') or curr_s == '---':
                    break
                step_content_lines.append(lines[i])
                i += 1

            step_md = '\n'.join(step_content_lines)
            step_md = transform_inline_elements(step_md)
            step_body_html = markdown.markdown(step_md, extensions=['tables', 'nl2br'])
            
            # Enforce RTL and clean table wrappers inside stepper
            step_body_html = re.sub(r' align="left"', ' align="right"', step_body_html)
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

        # 4. Check for Markdown Table (| ... |)
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

        # 5. Check for Subheadings (### and ####)
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

        # 6. Accumulate standard markdown blocks (bullet lists, paragraphs, quotes)
        std_lines = []
        while i < total_lines:
            curr_s = lines[i].strip()
            if not curr_s or curr_s == '---':
                i += 1
                break
            # If we already accumulated some lines and now hit a special block, stop so outer loop can handle it
            if std_lines and (
                curr_s.startswith('#') or 
                curr_s.startswith('|') or 
                curr_s.startswith('>') or 
                re.match(r'^####\s*گام\s*[\d\u06F0-\u06F9]+:', curr_s)
            ):
                break
            std_lines.append(lines[i])
            i += 1

        if std_lines:
            chunk_md = '\n'.join(std_lines)
            chunk_md = transform_inline_elements(chunk_md)
            # Enhance bullet steppers: * **گام ۱ (...):** -> styled bullet
            chunk_md = re.sub(
                r'(\*\s*\*\*گام\s*([\d\u06F0-\u06F9]+)(.*?)\*\*:?)',
                r'* <span class="step-num-pill">گام \2</span> <strong>\2 \3</strong>',
                chunk_md
            )
            chunk_html = markdown.markdown(chunk_md, extensions=['tables'])

            # Style list items containing pearls and traps
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

def generate_mindmap_html():
    """Generates the interactive Chapter Mind-Map Card HTML for Chapter 10 with clean branch titles and vibrant branch badges."""
    return """
<div class="chapter-mindmap-container" id="chapterMindMap">
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
          <span class="mindmap-subtitle">نقشه ساختاری و مسیر یادگیری ۷ بخش بالینی فصل ۱۰ جراحی لارنس • کلیک روی هر شاخه برای پرش مستقیم</span>
        </div>
      </div>
      <button type="button" class="btn-toggle-mindmap" id="btnToggleMindmap" aria-expanded="true" title="جمع‌بندی / باز کردن نقشه مفهومی">
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
          <span>فصل ۱۰ جراحی لارنس: جدار شکم و فتق‌ها (Abdominal Wall & Hernias)</span>
        </div>
      </div>

      <div class="mindmap-grid">
        <!-- Branch 1 -->
        <div class="mindmap-card-branch" data-branch="1">
          <div class="branch-card-header">
            <span class="branch-badge">بخش ۱</span>
            <a href="#surg-ch10-sec01" class="branch-title-link">کلیات، آناتومی جدار شکم و مدیریت بالینی فتق‌های شکمی</a>
          </div>
          <ul class="branch-items-list">
            <li>آناتومی لایه‌ها (Central vs. Lateral، خط هلالی، خط قوسی Arcuate)</li>
            <li>خون‌رسانی عروق اپی‌گاستریک و عصب‌دهی سگمنتال</li>
            <li>گام‌های بالینی ۱ تا ۴ و الگوریتم گیر افتادن حاد (Incarcerated)</li>
            <li>بهینه‌سازی ریسک‌فاکتورها قبل عمل (سیگار، وزن، دیابت)</li>
          </ul>
        </div>

        <!-- Branch 2 -->
        <div class="mindmap-card-branch" data-branch="2">
          <div class="branch-card-header">
            <span class="branch-badge">بخش ۲</span>
            <a href="#surg-ch10-sec02" class="branch-title-link">استراتژی‌های جراحی فتق‌های جدار شکم، انتخاب مش و Component Separation</a>
          </div>
          <ul class="branch-items-list">
            <li>ترمیم اولیه سوچور در برابر ترمیم با مش (Primary vs. Mesh)</li>
            <li>مقایسه ۳ نوع مش: دائم، قابل جذب و بیولوژیک</li>
            <li>۵ موقعیت آناتومیک کارگذاری مش (Onlay, Inlay, Sublay, ...)</li>
            <li>تکنیک‌های جداسازی اجزا (قدامی Ramirez و خلفی TAR)</li>
          </ul>
        </div>

        <!-- Branch 3 -->
        <div class="mindmap-card-branch" data-branch="3">
          <div class="branch-card-header">
            <span class="branch-badge">بخش ۳</span>
            <a href="#surg-ch10-sec03" class="branch-title-link">پیگیری بعد از عمل فتق‌های جدار شکم و ارزیابی توده</a>
          </div>
          <ul class="branch-items-list">
            <li>مدیریت بالینی: سروما در برابر عود فتق (Seroma vs. Recurrence)</li>
            <li>پیشگیری و کنترل عفونت زخم و مش (Surgical Site Infection)</li>
            <li>فتق اشپیگل (Spigelian) و فتق پاراستومال (Parastomal)</li>
            <li>دیاستاز عضلات رکتوس و افتراق حیاتی از فتق حقیقی</li>
          </ul>
        </div>

        <!-- Branch 4 -->
        <div class="mindmap-card-branch" data-branch="4">
          <div class="branch-card-header">
            <span class="branch-badge">بخش ۴</span>
            <a href="#surg-ch10-sec04" class="branch-title-link">آناتومی کانال میوپکتینئال (MPO)، کانال اینگوینال و رویکرد تشخیصی</a>
          </div>
          <ul class="branch-items-list">
            <li>سوراخ میوپکتینئال فرشارو (MPO) و مرزهای چهارگانه آن</li>
            <li>آناتومی کانال اینگوئینال و مثلث هسلباخ</li>
            <li>مقایسه فتق‌های ۳گانه (مستقیم، غیرمستقیم، فمورال)</li>
            <li>اپونیم‌های ویژه: ریشتر، لیتوره، امیاند، پانتالون و مایدل</li>
          </ul>
        </div>

        <!-- Branch 5 -->
        <div class="mindmap-card-branch" data-branch="5">
          <div class="branch-card-header">
            <span class="branch-badge">بخش ۵</span>
            <a href="#surg-ch10-sec05" class="branch-title-link">استراتژی‌های جراحی فتق‌های کشاله ران (MPO) و تکنیک‌های کم‌تهاجمی</a>
          </div>
          <ul class="branch-items-list">
            <li>رویکرد قدامی: ترمیم استاندارد لیختن‌اشتاین (Lichtenstein)</li>
            <li>ترمیم‌های بافتی بدون مش: Bassini, Shouldice, McVay</li>
            <li>رویکرد خلفی کم‌تهاجمی: مقایسه دقیق روش‌های TEP و TAPP</li>
            <li>مثلث‌های خطر لاپاراسکوپی (Doom & Pain) و درخت تصمیم‌گیری</li>
          </ul>
        </div>

        <!-- Branch 6 -->
        <div class="mindmap-card-branch" data-branch="6">
          <div class="branch-card-header">
            <span class="branch-badge">بخش ۶</span>
            <a href="#surg-ch10-sec06" class="branch-title-link">پیگیری بعد از عمل فتق‌های کشاله ران و فتق‌های خاص شکمی-لترال-پلویک</a>
          </div>
          <ul class="branch-items-list">
            <li>آسیب ۴ عصب اصلی (Ilioinguinal, Iliohypogastric, Genitofemoral, LFCN)</li>
            <li>ارکیت ایسکمیک، آتروفی بیضه و مشوما (Meshoma)</li>
            <li>سندرم درد پوبیک-اینگوئینال (فتق ورزشی / Sports Hernia)</li>
            <li>مسیر گام‌به‌گام ۱ تا ۵ ارزیابی و درمان درد پوبیک</li>
          </ul>
        </div>

        <!-- Branch 7 -->
        <div class="mindmap-card-branch" data-branch="7">
          <div class="branch-card-header">
            <span class="branch-badge">بخش ۷</span>
            <a href="#surg-ch10-sec07" class="branch-title-link">فتق‌های خاص لگنی، کمری و دیافراگم + سناریوهای آزمون لارنس</a>
          </div>
          <ul class="branch-items-list">
            <li>فتق ابتوراتور (Obturator / علامت Howship-Romberg)</li>
            <li>فتق سیاتیک، لومبار/فلنک (Grynfeltt, Petit) و پرینئال</li>
            <li>کالبدشکافی تشریحی سناریوهای بالینی ۵ گانه پایان فصل لارنس</li>
            <li>تله‌های امتحانی، استومای قبلی و فاکتورهای عود فتق</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
"""

def extract_plain_text(html_str):
    """Strips HTML tags for client-side search engine indexing."""
    text = re.sub(r'<[^>]+>', ' ', html_str)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def build_surgery_chapter(input_md_path):
    """Processes a single Surgery markdown file into structured registry and JSON."""
    with open(input_md_path, 'r', encoding='utf-8') as f:
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

    # Detect Chapter Title
    chapter_title = "فصل ۱۰: جدار شکم و فتق‌ها (Abdominal Wall, Including Hernia)"
    ch_m = re.search(r'^#\s*فصل\s*([\d\u06F0-\u06F9]+):\s*(.*)$', sanitized_text, re.MULTILINE)
    if ch_m:
        chapter_title = f"فصل ۱۰: {clean_page_numbers(ch_m.group(2).strip())}"

    # Split into sections by: ## بخش (\d+)(?:\s*\((.*?)\))?:\s*(.*)
    part_re = re.compile(r'^##\s*بخش\s+([\d\u06F0-\u06F9]+)(?:\s*\((.*?)\))?:\s*(.*)$', re.MULTILINE)
    splits = [m.start() for m in part_re.finditer(sanitized_text)]
    splits.append(len(sanitized_text))

    sections = []
    
    latin_titles = {
        1: "Overview, Abdominal Wall Anatomy & Clinical Management of Ventral Hernias",
        2: "Surgical Techniques, Mesh Prosthetics & Component Separation",
        3: "Postoperative Complications & Special Clinical Entities",
        4: "Myopectineal Orifice (MPO), Inguinal Canal Anatomy & Clinical Evaluation",
        5: "Surgical Techniques for Groin Hernias (Lichtenstein, Tissue, TEP/TAPP)",
        6: "Postoperative Groin Complications & Pubic Inguinal Pain Syndrome",
        7: "Rare Abdominal & Pelvic Hernias with Chapter Review Mastery"
    }

    short_titles = {
        1: "کلیات و آناتومی جدار شکم",
        2: "تکنیک‌های جراحی و انواع مش",
        3: "عوارض بعد عمل و فتق‌های خاص",
        4: "آناتومی MPO و کشاله ران",
        5: "تکنیک‌های جراحی کشاله ران",
        6: "عوارض بعد عمل و فتق ورزشی",
        7: "فتق‌های نادر و سناریوهای کیس"
    }

    for i in range(len(splits) - 1):
        chunk = sanitized_text[splits[i]:splits[i+1]]
        chunk_lines = chunk.splitlines()
        first_line = chunk_lines[0].strip()
        part_num = i + 1
        raw_part_title = first_line.lstrip('#').strip()
        clean_part_title = clean_page_numbers(raw_part_title)
        
        # Section body is chunk excluding the first '## بخش ...' header line
        body_md = '\n'.join(chunk_lines[1:])
        
        # Parse into rich HTML
        content_html = parse_section_markdown(body_md)
        raw_text = extract_plain_text(content_html)
        summary = raw_text[:280] + '...' if len(raw_text) > 280 else raw_text

        sec_id = f"surg-ch10-sec{part_num:02d}"
        
        sections.append({
            "id": sec_id,
            "chapterId": "surg-ch10",
            "number": part_num,
            "partNumber": part_num,
            "title": clean_part_title,
            "shortTitle": short_titles.get(part_num, clean_part_title),
            "latinTitle": latin_titles.get(part_num, ""),
            "summary": summary,
            "contentHtml": content_html,
            "rawText": raw_text
        })

    mindmap_html = generate_mindmap_html()

    chapter_record = {
        "id": "surg-ch10",
        "slug": "abdominal-wall-hernias",
        "courseId": "surgery",
        "number": 10,
        "title": chapter_title,
        "shortTitle": "جدار شکم و فتق‌ها",
        "latinTitle": "Abdominal Wall, Including Hernia",
        "author": "گروه جراحی عمومی و لاپاراسکوپی بالینی",
        "authorAffiliation": "دانشگاه علوم پزشکی و خدمات بهداشتی درمانی البرز (ABZUMS) • رفرنس مصوب لارنس",
        "totalSections": len(sections),
        "estimatedReadTime": "۴۵ دقیقه مطالعه عمیق و مرور بالینی",
        "mindMapHtml": mindmap_html,
        "sections": sections
    }

    return chapter_record, stripped_meta_lines

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    surgery_md_path = os.path.join(base_dir, 'chapters', 'Surgery', 'Abdominal Wall, Including Hernia.md')

    if not os.path.exists(surgery_md_path):
        print(f"Error: Could not find surgery markdown at {surgery_md_path}")
        sys.exit(1)

    print(f"Reading and building Surgery Chapter from: {surgery_md_path}")
    chapter_record, stripped_lines = build_surgery_chapter(surgery_md_path)

    # 1. Write JavaScript registry file
    registry_js_path = os.path.join(base_dir, 'js', 'data', 'surgery-registry.js')
    os.makedirs(os.path.dirname(registry_js_path), exist_ok=True)
    
    js_content = f"""/**
 * MEDICAL STUDY WEBAPP - GENERAL SURGERY COURSE REGISTRY
 * Course: جراحی جنرال (رفرنس لارنس - Lawrence's Essentials of General Surgery)
 * Chapter 10: جدار شکم و فتق‌ها (Abdominal Wall, Including Hernia)
 * Generated automatically by scripts/build_surgery_chapters.py
 */

window.SURGERY_REGISTRY = [
{json.dumps(chapter_record, ensure_ascii=False, indent=2)}
];
"""
    with open(registry_js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"SUCCESS: Wrote JavaScript registry to: {registry_js_path}")

    # 2. Write JSON registry file
    registry_json_path = os.path.join(base_dir, 'chapters', 'Surgery', 'surgery_registry.json')
    with open(registry_json_path, 'w', encoding='utf-8') as f:
        json.dump({"course": "surgery", "chapters": [chapter_record]}, f, ensure_ascii=False, indent=2)
    print(f"SUCCESS: Wrote JSON registry to: {registry_json_path}")

    print("\n--- SANITIZATION & ZERO DATA LOSS REPORT ---")
    print(f"Total stripped conversational meta-lines: {len(stripped_lines)}")
    for line_num, line_txt in stripped_lines:
        print(f"  [Line {line_num}]: {line_txt[:75]}...")
    print(f"Total Sections successfully parsed: {len(chapter_record['sections'])}")
    for sec in chapter_record['sections']:
        print(f"  ✓ {sec['id']}: {sec['title']} ({len(sec['contentHtml']):,} chars HTML)")

if __name__ == '__main__':
    main()
