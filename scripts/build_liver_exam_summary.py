# -*- coding: utf-8 -*-
"""
Build High-Yield Exam Summary for Surgery Chapter 19: Liver and Spleen
Source: chapters/Surgery/summaries/Liver and Spleen.md
Output: Injects examSummaryHtml and summaryContent into js/data/surgery-registry.js and surgery_registry.json
"""

import os
import sys
import re
import json
import markdown

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

TOPIC_CONFIGS = [
    {
        "num": 1,
        "color": "#0284c7",     # Sky / Ocean Blue
        "badge": "آناتومی سگمنتال و ترومای کبد",
        "icon": "🩺",
        "short_title": "آناتومی و ترومای کبد"
    },
    {
        "num": 2,
        "color": "#059669",     # Emerald Green
        "badge": "تومورهای خوش‌خیم و انسیفالنتالومای کبد",
        "icon": "🔬",
        "short_title": "تومورهای خوش‌خیم کبد"
    },
    {
        "num": 3,
        "color": "#e11d48",     # Crimson / Oncology Red
        "badge": "بدخیمی‌های اولیه، متاستازها و معیارهای میلان",
        "icon": "⚡",
        "short_title": "نئوپلاسم‌های بدخیم کبد"
    },
    {
        "num": 4,
        "color": "#d97706",     # Amber / Golden Orange
        "badge": "آبسه‌های چرکی، آمیبی و کیست هیداتید",
        "icon": "🧪",
        "short_title": "کیست‌ها و آبسه‌های کبدی"
    },
    {
        "num": 5,
        "color": "#dc2626",     # Red Alert
        "badge": "پورتال هایپرتنشن و هموستاز واریس",
        "icon": "🩸",
        "short_title": "پورتال هایپرتنشن و واریس"
    },
    {
        "num": 6,
        "color": "#7c3aed",     # Deep Violet
        "badge": "عوارض سیروز، چایلد-پیو و پیوند کبد",
        "icon": "🛡️",
        "short_title": "عوارض سیروز و پیوند کبد"
    },
    {
        "num": 7,
        "color": "#0d9488",     # Dark Teal
        "badge": "آناتومی عروقی و عملکردهای ایمونولوژیک طحال",
        "icon": "🧬",
        "short_title": "آناتومی و فیزیولوژی طحال"
    },
    {
        "num": 8,
        "color": "#ea580c",     # Fire Orange
        "badge": "هماتولوژی جراحی و ترومای طحال",
        "icon": "🫀",
        "short_title": "بیماری‌های جراحی و ترومای طحال"
    },
    {
        "num": 9,
        "color": "#db2777",     # Rose / Fuchsia
        "badge": "سندرم OPSI، واکسیناسیون و ترومبوسیتوز",
        "icon": "💉",
        "short_title": "پیامدها و عوارض اسپلنکتومی"
    }
]

TOP_LEVEL_SUBHEADS = [
    ('پاتوفیزیولوژی و نکات طلایی تئوری', '🧬', 'پاتوفیزیولوژی و نکات طلایی تئوری', 'نکات پایه و تئوری', 'trauma-theory-box'),
    ('مسیر مدیریت گام‌به‌گام بیمار (ترومای کبد)', '🩺', 'مسیر مدیریت گام‌به‌گام بالینی (ترومای کبد)', 'الگوریتم تصمیم‌گیری', 'trauma-stepper-box'),
    ('مسیر مدیریت گام‌به‌گام بیمار (خونریزی حاد واریس مری)', '🩸', 'مسیر مدیریت اورژانس خونریزی حاد واریس مری', 'پروتکل اورژانس', 'trauma-stepper-box'),
    ('مسیر مدیریت گام‌به‌گام بیمار (رویکرد تشخیصی طحال)', '🩺', 'مسیر مدیریت گام‌به‌گام بالینی و تشخیصی طحال', 'الگوریتم تشخیصی', 'trauma-stepper-box'),
    ('مسیر مدیریت گام‌به‌گام بیمار', '🩺', 'مسیر مدیریت گام‌به‌گام بالینی (کیس‌محور و OSCE)', 'الگوریتم بالینی', 'trauma-stepper-box'),
    ('بیمار HCC سیروتیک واجد معیارهای میلان', '🎯', 'معیارهای طلایی میلان (Milan Criteria) جهت پیوند کبد در HCC', 'معیار انکولوژی', 'liver-milan-box'),
    ('کنترااندیکاسیون‌های مطلق پیوند کبد', '⛔', 'کنترااندیکاسیون‌های مطلق پیوند کبد', 'خط قرمز پیوند', 'liver-transplant-box'),
    ('معیارهای عددی اسپلنکتومی در هایپراسپلنیسم', '📊', 'معیارهای هماتولوژیک اسپلنکتومی در هایپراسپلنیسم', 'معیارهای جراحی', 'spleen-criteria-box'),
    ('ترومای طحال ناپایدار همودینامیک', '⚡', 'پروتکل لاپاراتومی اورژانس در ترومای ناپایدار طحال', 'جراحی اورژانس', 'spleen-trauma-box'),
    ('ترومای طحال پایدار همودینامیک', '🛡️', 'پروتکل مدیریت غیرجراحی (NOM) و آنژیوامبولیزاسیون در ترومای طحال', 'مدیریت محافظه‌کارانه', 'spleen-trauma-box')
]

def preprocess_markdown(raw_text):
    text = raw_text

    # 0. Clean (صفحات X تا Y) if present anywhere
    text = re.sub(r'\s*\(صفحات\s*[\d\u06F0-\u06F9]+\s*تا\s*[\d\u06F0-\u06F9]+\)', '', text)

    # 1. Ensure table titles are present before each pipe table if missing
    table_heads = [
        (r'(\| نیمه کبد \(خط Cantlie\))', r'### جدول ۱: آناتومی سگمنتال کبد (کوینود) و نام‌گذاری استاندارد رزکسیون‌های جراحی\n\n\1'),
        (r'(\| ویژگی کلیدی \| همانژیوم کاورنوس)', r'### جدول ۲: مقایسه تشخیصی و درمانی تومورهای خوش‌خیم کبد (همانژیوم، FNH و آدنوم)\n\n\1'),
        (r'(\| ویژگی \| آبسه پیوژنیک \| آبسه آمیبی)', r'### جدول ۳: مقایسه جامع عفونت‌ها و ضایعات کیستیک کبد (آبسه پیوژنیک، آمیبی و هیداتید)\n\n\1'),
        (r'(\| متغیر در Child-Pugh \| ۱ امتیاز)', r'### جدول ۴: سیستم امتیازدهی چایلد-پیو (Child-Pugh Score) در بیماران سیروز\n\n\1'),
        (r'(\| ویژگی \| بیماری مزمن پیشرونده کبد \(ESLD\))', r'### جدول ۵: مقایسه نارسایی مزمن کبد (ESLD) و نارسایی برق‌آسای کبد (FHF)\n\n\1'),
        (r'(\| بیماری \| پاتوفیزیولوژی / کلید تشخیصی)', r'### جدول ۶: بیماری‌های هماتولوژیک طحال، خط اول درمان و جایگاه اسپلنکتومی\n\n\1'),
    ]
    for pat, repl in table_heads:
        if not re.search(r'### جدول\s*[\d\u06F0-\u06F9]+:.*?' + pat, text, flags=re.DOTALL):
            text = re.sub(pat, repl, text)

    # 2. Ensure double newlines before bullet lists
    text = re.sub(r'([^\n])\n([ \t]*[-*]\s+)', r'\1\n\n\2', text)
    # Ensure double newlines before numbered lists
    text = re.sub(r'([^\n])\n([ \t]*\d+\.\s+)', r'\1\n\n\2', text)
    # Ensure double newlines after subheadings (bold colon)
    text = re.sub(r'(\*\*[^*]+:\*\*)\n([^\n])', r'\1\n\n\2', text)
    # Ensure double newlines before blockquotes (line must start with >)
    text = re.sub(r'(?m)([^\n])\n(>[ \t]+)', r'\1\n\n\2', text)
    # Ensure double newlines after blockquotes (line starting with > followed by non-> line)
    text = re.sub(r'(?m)(^>[^\n]*)\n([^>\n])', r'\1\n\n\2', text)
    # Ensure double newlines before table headings
    text = re.sub(r'([^\n])\n(###\s+جدول)', r'\1\n\n\2', text)
    # Ensure double newlines before table start | (only if previous line was not a pipe row)
    text = re.sub(r'(?m)^([^|\n].*)\n(\|.*)$', r'\1\n\n\2', text)

    return text

def transform_topic_body_html(html, color):
    # 1. Transform blockquotes into high-yield emergency trap callouts
    def format_trap(m):
        content = m.group(1).strip()
        content = re.sub(r'^\s*<p>\s*<strong>تله امتحانی:?</strong>\s*(.*?)</p>', r'<p>\1</p>', content, flags=re.DOTALL)
        content = re.sub(r'^\s*<strong>تله امتحانی:?</strong>\s*', '', content)
        return f"""
        <div class="trauma-trap-callout">
          <div class="trap-callout-header">
            <div class="trap-icon-box">⚠️</div>
            <h4 class="trap-title">تله امتحانی و خط قرمز بالینی (Exam Trap & Red Flag)</h4>
          </div>
          <div class="trap-callout-body">
            {content}
          </div>
        </div>
        """
    html = re.sub(r'<blockquote>(.*?)</blockquote>', format_trap, html, flags=re.DOTALL)

    # 1.5. Transform standalone paragraph traps (e.g. <p><strong>تله امتحانی...</strong>...</p>)
    def format_trap_p(m):
        full_p = m.group(1).strip()
        body = re.sub(r'^<strong>تله امتحانی[^<]*:?</strong>\s*', '', full_p)
        return f"""
        <div class="trauma-trap-callout">
          <div class="trap-callout-header">
            <div class="trap-icon-box">⚠️</div>
            <h4 class="trap-title">تله امتحانی و خط قرمز بالینی (Exam Trap & Red Flag)</h4>
          </div>
          <div class="trap-callout-body">
            <p>{body}</p>
          </div>
        </div>
        """
    html = re.sub(r'<p>\s*(<strong>تله امتحانی[^<]*:?</strong>.*?)</p>', format_trap_p, html, flags=re.DOTALL)

    # 2. Transform tables with their preceding <h3> into .trauma-table-wrapper
    def format_table(m):
        h3_title = m.group(1).strip()
        table_html = m.group(2).strip()
        table_html = table_html.replace('style="text-align: left;"', 'style="text-align: right; direction: rtl;"')

        return f"""
        <div class="trauma-table-wrapper">
          <div class="table-card-header">
            <span class="table-icon">📊</span>
            <h4 class="table-card-title">{h3_title}</h4>
          </div>
          <div class="exam-table-responsive">
            {table_html}
          </div>
        </div>
        """
    html = re.sub(r'<h3>(جدول\s*[^<]+)</h3>\s*(<table.*?>.*?</table>)', format_table, html, flags=re.DOTALL)
    html = re.sub(r'(?<!<div class="exam-table-responsive">)(<table.*?>.*?</table>)', r'<div class="exam-table-responsive">\1</div>', html, flags=re.DOTALL)

    # 3. Transform Sub-headings like <p><strong>عنوان:</strong></p> into stylish section banners
    def format_subhead(m):
        raw_text = m.group(1).strip()
        for key, icon, clean_title, tag, box_cls in TOP_LEVEL_SUBHEADS:
            if key in raw_text:
                return f"""
                <div class="trauma-subhead-banner {box_cls}" style="border-inline-start-color: {color};">
                  <div class="subhead-main">
                    <span class="subhead-icon">{icon}</span>
                    <h4 class="subhead-title">{clean_title}</h4>
                  </div>
                  <span class="subhead-tag" style="background: {color}1a; color: {color};">{tag}</span>
                </div>
                """
        return f"<p><strong>{raw_text}</strong></p>"

    html = re.sub(r'<p>\s*<strong>([^<]+:[^<]*)</strong>\s*</p>', format_subhead, html)

    # Clean redundant <p> inside <li>
    html = re.sub(r'<li>\s*<p>(.*?)</p>\s*</li>', r'<li>\1</li>', html, flags=re.DOTALL)

    return html

def build_liver_summary_html(clean_md):
    hero_title = "کبد و طحال: پاتولوژی، تومورها، هایپرتنشن پورت، تروما و پیوند"
    ch_num_str = "۱۹"

    # 1. Extract Tree Map
    tree_match = re.search(r'## نقشه[^\n]+\n(.*?)(?=\n---|\n## )', clean_md, re.DOTALL)
    tree_html = ""
    if tree_match:
        tree_text = tree_match.group(1).strip()
        branches = re.findall(r'- \*\*(.*?)\*\*\s*\n((?:  - .*\n?)+)', tree_text)

        branch_cards = []
        colors = ["#0284c7", "#059669", "#e11d48", "#d97706", "#dc2626", "#7c3aed", "#0d9488", "#ea580c", "#db2777"]
        for idx, (b_title, b_sub) in enumerate(branches):
            sub_items = [s.replace('  - ', '').strip() for s in b_sub.strip().split('\n') if s.strip()]
            sub_li_html = "".join([f"<li>{item}</li>" for item in sub_items])
            color = colors[idx % len(colors)]

            branch_cards.append(f"""
              <div class="summary-tree-card" data-branch="{idx+1}" style="border-inline-start-color: {color};">
                <div class="tree-card-header">
                  <span class="tree-branch-num" style="background-color: {color};">{idx+1}</span>
                  <h4 class="tree-branch-title">{b_title}</h4>
                </div>
                <ul class="tree-branch-list" style="border-inline-start-color: {color}44;">
                  {sub_li_html}
                </ul>
              </div>
            """)

        tree_html = f"""
          <section class="summary-tree-section">
            <div class="summary-tree-header">
              <div class="tree-header-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                  <circle cx="12" cy="5" r="3"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <path d="M5 12h14"></path>
                  <line x1="5" y1="12" x2="5" y2="16"></line>
                  <line x1="19" y1="12" x2="19" y2="16"></line>
                  <circle cx="5" cy="19" r="3"></circle>
                  <circle cx="19" cy="19" r="3"></circle>
                </svg>
              </div>
              <div>
                <h2 class="summary-tree-title">نقشه ساختار و الگوریتم‌های بالینی فصل: {hero_title}</h2>
                <span class="summary-tree-subtitle">ساختار درختی و طبقه‌بندی ۹ مبحث کلیدی بیماری‌های جراحی کبد، عروق پورت و طحال</span>
              </div>
            </div>
            <div class="summary-tree-grid">
              {"".join(branch_cards)}
            </div>
          </section>
        """

    # 2. Extract Master Card (⚡ جمع‌بندی ۱ دقیقه‌ای شب امتحان)
    master_match = re.search(r'## ⚡ جمع‌بندی ۱ دقیقه‌ای شب امتحان \(کل فصل\)\s*\n(.*)', clean_md, re.DOTALL)
    master_html = ""
    if master_match:
        master_text = master_match.group(1).strip()
        items = re.findall(r'^[\*\-]\s+\*\*(.*?)\*\*(.*)$', master_text, re.MULTILINE)

        item_lis = []
        for title, desc in items:
            desc_html = markdown.markdown(desc.strip()).replace('<p>', '').replace('</p>', '').strip()
            item_lis.append(f"""
              <li>
                <strong>{title}</strong>
                <span>{desc_html}</span>
              </li>
            """)

        master_html = f"""
          <section class="summary-master-card" id="summaryMasterCard">
            <div class="master-card-header">
              <div class="master-card-title-group">
                <span class="master-card-icon">⚡</span>
                <h2 class="master-card-title">جمع‌بندی ۱ دقیقه‌ای شب امتحان (کل فصل)</h2>
              </div>
              <span class="master-card-badge">مرور سریع {len(item_lis)} نکته فوق طلایی</span>
            </div>
            <ul class="master-card-list">
              {"".join(item_lis)}
            </ul>
          </section>
        """

    # 3. Extract Intermediate Topic Sections with Thematic Colors & Modern Badges
    parts = re.split(r'\n(?=## )', clean_md)
    topic_cards = []

    sec_idx = 0
    for part in parts:
        part = part.strip()
        if not part.startswith('## '):
            continue
        first_line = part.split('\n')[0].strip()
        # Skip Tree map and Master card sections
        if 'نقشه' in first_line or '⚡ جمع‌بندی' in first_line:
            continue

        sec_idx += 1
        lines = part.split('\n')
        topic_title = lines[0].replace('## ', '').strip()
        topic_body_md = '\n'.join(lines[1:]).strip()

        # Remove standalone '---'
        topic_body_md = re.sub(r'^\s*---\s*$', '', topic_body_md, flags=re.MULTILINE)

        cfg = TOPIC_CONFIGS[(sec_idx - 1) % len(TOPIC_CONFIGS)]
        color = cfg['color']
        badge_text = cfg['badge']
        icon = cfg['icon']
        card_id = f"liverTopic-{sec_idx}"

        # Convert to HTML with tables & fenced code
        raw_html = markdown.markdown(topic_body_md, tab_length=2, extensions=['extra', 'tables', 'fenced_code'])

        # Transform into enhanced visual components
        topic_html = transform_topic_body_html(raw_html, color)

        topic_cards.append(f"""
          <section class="summary-topic-card" id="{card_id}" style="--topic-accent: {color}; border-inline-start: 5px solid {color};">
            <div class="trauma-topic-header-group">
              <div class="trauma-topic-badge-row">
                <span class="trauma-topic-badge" style="background: {color};">
                  <span>{icon}</span>
                  <span>{badge_text}</span>
                </span>
                <span class="trauma-topic-num-pill">مبحث {sec_idx} از {len(TOPIC_CONFIGS)}</span>
              </div>
              <h3 class="summary-topic-title">
                <span>{topic_title}</span>
              </h3>
            </div>
            <div class="summary-topic-body">
              {topic_html}
            </div>
          </section>
        """)

    # 4. Assemble Full Exam Summary View
    # NOTE: Master card placed at the very END as explicitly requested!
    # NOTE: Top quick jump nav removed as explicitly requested!
    full_summary_html = f"""
    <div class="exam-summary-container">
      <!-- Top Exam Summary Hero Banner -->
      <header class="exam-summary-hero">
        <div class="summary-hero-badges">
          <span class="summary-hero-badge">⚡ خلاصه جامع شب امتحان</span>
          <span class="summary-hero-tag">فصل {ch_num_str} جراحی لارنس</span>
          <span class="summary-hero-time">⏱️ مرور سریع: ۲۰ دقیقه</span>
        </div>
        <h1 class="summary-hero-title">{hero_title}</h1>
        <p class="summary-hero-desc">خلاصه خط‌به‌خط و فوق‌فشرده نکات امتحانی، تعاریف طلایی، معیارهای چایلد-پیو و میلان، تومورهای خوش‌خیم و بدخیم کبد، پورتال هایپرتنشن، ترومای احشا، هماتولوژی طحال و عوارض اسپلنکتومی (مطابق آخرین ویرایش رفرنس لارنس)</p>
        <div class="summary-hero-actions">
          <button type="button" class="btn-return-detailed" onclick="window.setChapterViewMode ? window.setChapterViewMode('detailed') : (window.StudyFeatures && window.StudyFeatures.applyExamCramMode(false, true))">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>📖 بازگشت به درسنامه کامل</span>
          </button>
          <a href="#summaryMasterCard" class="btn-jump-master">
            <span>⚡ پرش به نکات ۱ دقیقه‌ای شب امتحان</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </a>
        </div>
      </header>

      <!-- 1. Clinical Tree & Decision Pathways -->
      {tree_html}

      <!-- 2. Intermediate Topic Cards (Thematic Visual Grouping) -->
      <div class="summary-topics-container">
        {"".join(topic_cards)}
      </div>

      <!-- 3. Golden 1-Minute Master Cram Card placed at the END per user request -->
      {master_html}

      <!-- Bottom Sticky-Like Return & Completion Action Bar -->
      <footer class="summary-bottom-bar">
        <button type="button" class="btn-return-detailed" onclick="window.setChapterViewMode ? window.setChapterViewMode('detailed') : (window.StudyFeatures && window.StudyFeatures.applyExamCramMode(false, true))">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span>📖 بازگشت به درسنامه کامل لارنس</span>
        </button>
        <button type="button" class="btn-mark-cram-completed" onclick="window.StudyFeatures && window.StudyFeatures.toggleChapterCompletion('surg-ch19')">
          <span>✓ تسلط کامل بر خلاصه امتحانی این فصل</span>
        </button>
      </footer>
    </div>
    """
    return full_summary_html

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src_paths = [
        os.path.join(base_dir, 'chapters', 'Surgery', 'summaries', 'Liver and Spleen.md'),
        os.path.join(base_dir, 'Liver and Spleen.md'),
    ]
    src = None
    for p in src_paths:
        if os.path.exists(p):
            src = p
            break

    if not src:
        raise RuntimeError("Source Liver and Spleen.md not found!")

    print(f"Reading source file: {src}")
    with open(src, 'r', encoding='utf-8') as f:
        raw_md = f.read()

    # Preprocess markdown
    clean_md = preprocess_markdown(raw_md)
    print(f"Preprocessed markdown text length: {len(clean_md)}")

    # Update deliverable markdown files
    for p in ['Liver and Spleen.md', 'chapters/Surgery/summaries/Liver and Spleen.md']:
        dest = os.path.join(base_dir, p)
        with open(dest, 'w', encoding='utf-8') as f:
            f.write(clean_md)
        print(f"Updated {dest}")

    # Build HTML
    exam_summary_html = build_liver_summary_html(clean_md)
    print(f"Generated examSummaryHtml length: {len(exam_summary_html)} bytes")

    # Update surgery_registry.json
    registry_json_path = os.path.join(base_dir, 'chapters', 'Surgery', 'surgery_registry.json')
    with open(registry_json_path, 'r', encoding='utf-8') as f:
        registry_data = json.load(f)

    ch19_obj = None
    for ch in registry_data['chapters']:
        if ch.get('id') == 'surg-ch19':
            ch19_obj = ch
            break

    if not ch19_obj:
        raise RuntimeError("surg-ch19 not found in surgery_registry.json!")

    ch19_obj['examSummaryHtml'] = exam_summary_html
    ch19_obj['summaryContent'] = clean_md

    with open(registry_json_path, 'w', encoding='utf-8') as f:
        json.dump(registry_data, f, ensure_ascii=False, indent=2)
    print(f"Updated {registry_json_path}")

    # Update js/data/surgery-registry.js
    registry_js_path = os.path.join(base_dir, 'js', 'data', 'surgery-registry.js')
    js_content = f"// Comprehensive Surgery Chapters Registry\nwindow.SURGERY_REGISTRY = {json.dumps(registry_data, ensure_ascii=False, indent=2)};\n"
    with open(registry_js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"Updated {registry_js_path}")

    print("SUCCESS: Chapter 19 Liver and Spleen Enhanced Exam Mode integrated!")

if __name__ == '__main__':
    main()
