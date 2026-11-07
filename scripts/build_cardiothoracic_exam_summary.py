# -*- coding: utf-8 -*-
"""
Build High-Yield Exam Summary for Surgery Chapter 25: Cardiothoracic Surgery
Source: chapters/Surgery/summaries/Cardiothoracic Surgery.md
Output: Injects examSummaryHtml and summaryContent into js/data/surgery-registry.js and surgery_registry.json
"""

import os
import sys
import re
import json
import markdown

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

SOURCE_PATH = "chapters/Surgery/summaries/Cardiothoracic Surgery.md"
ALT_SOURCE_PATH = r"C:/Users/abolf/.gemini/antigravity/brain/d031b241-113f-4331-832d-14f1f4fb5137/.user_uploaded/media_1793904009169_f3d4114a.md"

TOPIC_CONFIGS = [
    {
        "num": 1,
        "color": "#0284c7",     # Sky / Ocean Blue
        "badge": "پایش همودینامیک و فیزیولوژی قلب",
        "icon": "🩺",
        "short_title": "آناتومی و همودینامیک"
    },
    {
        "num": 2,
        "color": "#e11d48",     # Crimson / Heart Red
        "badge": "بیماری ایسکمیک قلب و CABG",
        "icon": "❤️",
        "short_title": "بیماری ایسکمیک (IHD)"
    },
    {
        "num": 3,
        "color": "#8b5cf6",     # Vibrant Purple
        "badge": "دریچه‌های قلبی و پروستتیک",
        "icon": "🫀",
        "short_title": "بیماری‌های دریچه‌ای"
    },
    {
        "num": 4,
        "color": "#d97706",     # Amber / Golden Orange
        "badge": "قوس آئورت و واسکولیت‌ها",
        "icon": "🧬",
        "short_title": "عروق بزرگ و آئورتیت"
    },
    {
        "num": 5,
        "color": "#dc2626",     # Red Alert
        "badge": "آسیب بلانت آئورت و TEVAR",
        "icon": "⚡",
        "short_title": "آسیب بلانت آئورت (BAI)"
    },
    {
        "num": 6,
        "color": "#7c3aed",     # Deep Violet
        "badge": "دایسکشن آئورت و TAA",
        "icon": "🛡️",
        "short_title": "دایسکشن و آنوریسم آئورت"
    },
    {
        "num": 7,
        "color": "#059669",     # Emerald Green
        "badge": "بیماری‌های پارانشیم و پلور ریه",
        "icon": "🫁",
        "short_title": "پلور و پارانشیم ریه"
    },
    {
        "num": 8,
        "color": "#ea580c",     # Fire Orange
        "badge": "ترومای توراکس و اقدامات اورژانس",
        "icon": "🚑",
        "short_title": "ترومای قفسه سینه"
    },
    {
        "num": 9,
        "color": "#0891b2",     # Dark Cyan / Teal
        "badge": "انکولوژی توراکس و سرطان ریه",
        "icon": "🔬",
        "short_title": "نئوپلاسم‌ها و کنسر ریه"
    }
]

TOP_LEVEL_SUBHEADS = [
    ('پاتوفیزیولوژی و نکات طلایی تئوری', '🧬', 'پاتوفیزیولوژی و نکات طلایی تئوری', 'نکات پایه و تئوری', 'trauma-theory-box'),
    ('مسیر مدیریت گام‌به‌گام بیمار', '🩺', 'مسیر مدیریت گام‌به‌گام بالینی (کیس‌محور و OSCE)', 'الگوریتم تصمیم‌گیری', 'trauma-stepper-box'),
    ('ارزیابی فیزیولوژیک و ذخیره ریوی قبل از عمل', '🫁', 'ارزیابی فیزیولوژیک و ذخیره ریوی قبل از عمل (الگوریتم تصمیم‌گیری)', 'الگوریتم ارزیابی', 'cardio-pulm-box'),
    ('اندیکاسیون‌های جراحی CABG', '❤️', 'اندیکاسیون‌های قطعی جراحی بای‌پس کرونری (CABG)', 'جراحی کرونر', 'cardio-cabg-box'),
    ('اندیکاسیون‌های تعبیه چست‌تیوب در افیوژن', '🧪', 'اندیکاسیون‌های تعبیه چست‌تیوب در افیوژن و آمپیم', 'معیارهای لایت', 'cardio-chesttube-box'),
    ('اندیکاسیون‌های توراکوتومی اورژانس', '⚡', 'اندیکاسیون‌های توراکوتومی اورژانس در ترومای توراکس', 'خط قرمز جراحی', 'cardio-thoracotomy-box'),
    ('اندیکاسیون‌های جراحی در پنوموتوراکس', '🩹', 'اندیکاسیون‌های جراحی در پنوموتوراکس و پلورودز', 'اندیکاسیون جراحی', 'cardio-pneumo-box')
]

def clean_markdown_text(raw_text):
    # 0. Clean (صفحات X تا Y) if present anywhere
    text = re.sub(r'\s*\(صفحات\s*[\d\u06F0-\u06F9]+\s*تا\s*[\d\u06F0-\u06F9]+\)', '', raw_text)

    # Clean all LaTeX math tokens to clean Unicode / HTML equivalents
    math_replacements = [
        (r'\$\\leftarrow\$', '←'),
        (r'\$\\text\{Tension\}\s*\\propto\s*\\text\{Pressure\}\s*\\times\s*\\text\{Radius\}\$', 'Tension ∝ Pressure × Radius'),
        (r'\$1\.8\\text\{\s*L/min/m\}\^2\$', '1.8 L/min/m²'),
        (r'\$\\text\{\s*L/min/m\}\^2\$', 'L/min/m²'),
        (r'\$\\text\{dyn\}\\cdot\\text\{s/cm\}\^\{-5\}\$', 'dyn·s/cm⁻⁵'),
        (r'\$\\text\{Diastolic BP\}\s*\+\s*\(\\text\{Pulse Pressure\}\s*/\s*3\)\$', 'Diastolic BP + (Pulse Pressure / 3)'),
        (r'\$\\text\{Cardiac Output \(CO\)\}\s*/\s*\\text\{BSA\}\$', 'Cardiac Output (CO) / BSA'),
        (r'\$\[\(\\text\{MAP\}\s*-\s*\\text\{CVP\}\)\s*\\times\s*80\]\s*/\s*\\text\{CO\}\$', '[(MAP - CVP) × 80] / CO'),
        (r'\$\[\(\\text\{PAP\}_\{\\text\{mean\}\}\s*-\s*\\text\{PWP\}\)\s*\\times\s*80\]\s*/\s*\\text\{CO\}\$', '[(PAP_mean - PWP) × 80] / CO'),
        (r'\$\\ge\s*10\\text\{\s*mmHg\}\$', '≥ 10 mmHg'),
        (r'\$-20\\text\{\s*cm H\}_2\\text\{O\}\$', '-20 cm H₂O'),
        (r'\$\\text\{PaCO\}_2\s*>\s*50\\text\{\s*mmHg\}\$', 'PaCO₂ > 50 mmHg'),
        (r'\$\\text\{PaO\}_2\s*<\s*50\\text\{\s*mmHg\}\$', 'PaO₂ < 50 mmHg'),
        (r'\$\\text\{ppo-FEV\}_1\s*>\s*0\.8\\text\{\s*L\}\$', 'ppo-FEV₁ > 0.8 L'),
        (r'\$\\text\{ppo-FEV\}_1\$', 'ppo-FEV₁'),
        (r'\$\\text\{ppo-DLCO\}\s*>\s*40\\%\$', 'ppo-DLCO > 40%'),
        (r'\$\\text\{ppo-DLCO\}\$', 'ppo-DLCO'),
        (r'\$FEV_1\s*>\s*2\.0\\text\{\s*L\}\$', 'FEV₁ > 2.0 L'),
        (r'\$FEV_1\s*<\s*2\.0\\text\{\s*L\}\$', 'FEV₁ < 2.0 L'),
        (r'\$FEV_1\$', 'FEV₁'),
        (r'\$DLCO\$', 'DLCO'),
        (r'\$SvO_2\$', 'SvO₂'),
        (r'\$T_3\$', 'T₃'),
        (r'\$T_4\$', 'T₄'),
        (r'\$N_0/N_1\$', 'N₀/N₁'),
        (r'\$N_2\$', 'N₂'),
        (r'\$N_3\$', 'N₃'),
        (r'\$M_1\$', 'M₁'),
        (r'\$A_9\$', 'A₉'),
        (r'\$dP/dt\$', 'dP/dt'),
    ]

    for pattern, repl in math_replacements:
        text = re.sub(pattern, repl, text)

    return text

def preprocess_markdown(raw_text):
    text = clean_markdown_text(raw_text)

    # Ensure double newlines before bullet lists
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

def build_cardiothoracic_summary_html(clean_md):
    hero_title = "جراحی قلب و قفسه سینه: بیماری‌های قلب، عروق بزرگ و حفره توراکس"
    ch_num_str = "۲۵"

    # 1. Extract Tree Map
    tree_match = re.search(r'##\s+(?:نمای کلی و نقشه راه|نقشه)[^\n]+\n(.*?)(?=\n---|\n## )', clean_md, re.DOTALL)
    tree_html = ""
    if tree_match:
        tree_text = tree_match.group(1).strip()
        branches = re.split(r'\n(?=- \*\*)', tree_text)

        branch_cards = []
        colors = ["#0284c7", "#6366f1", "#8b5cf6", "#e11d48", "#d97706", "#059669", "#0891b2"]
        for idx, b_block in enumerate(branches):
            lines = b_block.strip().split('\n')
            if not lines or not lines[0].strip():
                continue
            b_title = lines[0].replace('- **', '').replace('**', '').strip()
            # Dedent child lines by 2 spaces
            body_lines = [l[2:] if l.startswith('  ') else l for l in lines[1:]]
            b_body = '\n'.join(body_lines)
            sub_html = markdown.markdown(b_body, tab_length=2)

            color = colors[idx % len(colors)]

            branch_cards.append(f"""
              <div class="summary-tree-card" data-branch="{idx+1}" style="border-inline-start-color: {color};">
                <div class="tree-card-header">
                  <span class="tree-branch-num" style="background-color: {color};">{idx+1}</span>
                  <h4 class="tree-branch-title">{b_title}</h4>
                </div>
                <div class="tree-branch-content" style="border-inline-start-color: {color}44;">
                  {sub_html}
                </div>
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
                <span class="summary-tree-subtitle">ساختار درختی و طبقه‌بندی ۳ حوزه کلیدی: بیماری‌های قلب، عروق بزرگ و حفره توراکس</span>
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
        lines = [l for l in master_text.split('\n') if l.strip()]

        item_lis = []
        for l in lines:
            clean_l = re.sub(r'^[\*\-]\s+', '', l).strip()
            # If bold title at start, extract it
            bm = re.match(r'^\*\*(.*?)\*\*(.*)$', clean_l)
            if bm:
                btitle, bdesc = bm.group(1), bm.group(2)
                desc_html = markdown.markdown(bdesc.strip()).replace('<p>', '').replace('</p>', '').strip()
                item_lis.append(f"""
                  <li>
                    <strong>{btitle}</strong>
                    <span>{desc_html}</span>
                  </li>
                """)
            else:
                html_content = markdown.markdown(clean_l).replace('<p>', '').replace('</p>', '').strip()
                item_lis.append(f"""
                  <li>
                    <span class="master-item-text">{html_content}</span>
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
        if 'نمای کلی و نقشه راه' in first_line or 'نقشه' in first_line or '⚡ جمع‌بندی' in first_line:
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
        card_id = f"cardioTopic-{sec_idx}"

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
        <p class="summary-hero-desc">خلاصه خط‌به‌خط و فوق‌فشرده نکات امتحانی، تعاریف طلایی، معیارهای همودینامیک، بیماری‌های ایسکمیک، دریچه‌ای، عروق بزرگ و انکولوژی توراکس (مطابق آخرین ویرایش رفرنس لارنس)</p>
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
        <button type="button" class="btn-mark-cram-completed" onclick="window.StudyFeatures && window.StudyFeatures.toggleChapterCompletion('surg-ch25')">
          <span>✓ تسلط کامل بر خلاصه امتحانی این فصل</span>
        </button>
      </footer>
    </div>
    """
    return full_summary_html

def build_detailed_sections(clean_md):
    """
    Build sections array for the detailed view of surg-ch25
    """
    parts = re.split(r'\n(?=## )', clean_md)
    sections = []
    sec_num = 0

    for part in parts:
        part = part.strip()
        if not part.startswith('## '):
            continue
        first_line = part.split('\n')[0].strip()
        if 'نمای کلی و نقشه راه' in first_line or 'نقشه' in first_line or '⚡ جمع‌بندی' in first_line:
            continue

        sec_num += 1
        lines = part.split('\n')
        topic_title = lines[0].replace('## ', '').strip()
        topic_body_md = '\n'.join(lines[1:]).strip()
        topic_body_md = re.sub(r'^\s*---\s*$', '', topic_body_md, flags=re.MULTILINE)

        topic_html = markdown.markdown(topic_body_md, tab_length=2, extensions=['extra', 'tables', 'fenced_code'])
        topic_html = re.sub(r'(<table.*?>.*?</table>)', r'<div class="exam-table-responsive">\1</div>', topic_html, flags=re.DOTALL)
        topic_html = topic_html.replace('style="text-align: left;"', 'style="text-align: right; direction: rtl;"')

        def format_blockquote(match):
            bq_content = match.group(1).strip()
            return f"""<blockquote class="exam-trap-callout">{bq_content}</blockquote>"""

        topic_html = re.sub(r'<blockquote>(.*?)</blockquote>', format_blockquote, topic_html, flags=re.DOTALL)

        sec_id = f"surg-ch25-sec0{sec_num}" if sec_num < 10 else f"surg-ch25-sec{sec_num}"
        sections.append({
            "id": sec_id,
            "chapterId": "surg-ch25",
            "number": sec_num,
            "partNumber": sec_num,
            "title": f"بخش {sec_num}: {topic_title}",
            "shortTitle": topic_title.split('(')[0].strip(),
            "summary": f"خلاصه و نکات کلیدی {topic_title}",
            "contentHtml": topic_html,
            "rawText": topic_body_md
        })

    return sections

def build_mindmap_html(clean_md):
    tree_match = re.search(r'##\s+(?:نمای کلی و نقشه راه|نقشه)[^\n]+\n(.*?)(?=\n---|\n## )', clean_md, re.DOTALL)
    branch_cards = []
    colors = ["#0284c7", "#6366f1", "#8b5cf6"]
    if tree_match:
        tree_text = tree_match.group(1).strip()
        branches = re.split(r'\n(?=- \*\*)', tree_text)
        for idx, b_block in enumerate(branches):
            lines = b_block.strip().split('\n')
            if not lines or not lines[0].strip():
                continue
            b_title = lines[0].replace('- **', '').replace('**', '').strip()
            body_lines = [l[2:] if l.startswith('  ') else l for l in lines[1:]]
            b_body = '\n'.join(body_lines)
            sub_html = markdown.markdown(b_body, tab_length=2)
            color = colors[idx % len(colors)]
            branch_cards.append(f"""
              <div class="mindmap-card-branch" data-branch="{idx+1}" style="border-inline-start-color: {color};">
                <div class="branch-card-header">
                  <span class="branch-badge" style="background: {color};">بخش {idx+1}</span>
                  <span class="branch-title-text">{b_title}</span>
                </div>
                <div class="branch-content" style="padding-top: 8px;">
                  {sub_html}
                </div>
              </div>
            """)

    return f"""
<div class="chapter-mindmap-container" id="chapterMindMap-surg-ch25">
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
          <span class="mindmap-subtitle">نقشه ساختاری ۳ شاخه کلیدی قلب، عروق بزرگ و قفسه سینه</span>
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
          <span>فصل ۲۵: جراحی قلب و قفسه سینه: بیماری‌های قلب، عروق بزرگ و حفره توراکس</span>
        </div>
      </div>

      <div class="mindmap-grid">
        {"".join(branch_cards)}
      </div>
    </div>
  </div>
</div>
"""

def main():
    src = SOURCE_PATH if os.path.exists(SOURCE_PATH) else ALT_SOURCE_PATH
    print(f"Reading source file: {src}")
    with open(src, 'r', encoding='utf-8') as f:
        raw_md = f.read()

    # Apply thorough preprocessing
    clean_md = preprocess_markdown(raw_md)
    print("Preprocessed markdown text length:", len(clean_md))

    # Write deliverables:
    deliverable_paths = [
        "Cardiothoracic Surgery.md",
        "chapters/Surgery/summaries/Cardiothoracic Surgery.md",
        "chapters/Surgery/Cardiothoracic Surgery.md"
    ]
    for p in deliverable_paths:
        os.makedirs(os.path.dirname(p) if os.path.dirname(p) else '.', exist_ok=True)
        with open(p, 'w', encoding='utf-8') as f:
            f.write(clean_md)
        print(f"Written cleaned file to: {p}")

    # Build HTML
    exam_summary_html = build_cardiothoracic_summary_html(clean_md)
    sections = build_detailed_sections(clean_md)
    mindmap_html = build_mindmap_html(clean_md)

    print(f"Generated examSummaryHtml length: {len(exam_summary_html)}")
    print(f"Generated {len(sections)} detailed sections")

    # Load registry
    json_path = 'chapters/Surgery/surgery_registry.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        registry_data = json.load(f)

    # Find surg-ch25
    ch25_obj = None
    for ch in registry_data['chapters']:
        if ch['id'] == 'surg-ch25' or 'cardiothoracic' in ch.get('latinTitle', '').lower():
            ch25_obj = ch
            break

    if ch25_obj:
        print("Found existing ch25 object, updating...")
        ch25_obj['examSummaryHtml'] = exam_summary_html
        ch25_obj['summaryContent'] = clean_md
        ch25_obj['sections'] = sections
        ch25_obj['mindMapHtml'] = mindmap_html
    else:
        raise RuntimeError("surg-ch25 not found in registry!")

    # Save surgery_registry.json
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(registry_data, f, ensure_ascii=False, indent=2)
    print(f"Saved {json_path}")

    # Save js/data/surgery-registry.js
    js_path = 'js/data/surgery-registry.js'
    js_content = f"// Comprehensive Surgery Chapters Registry\nwindow.SURGERY_REGISTRY = {json.dumps(registry_data, ensure_ascii=False, indent=2)};\n"
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"Saved {js_path}")

    print("SUCCESS: Chapter 25 Cardiothoracic Surgery Enhanced Exam Mode integrated!")

if __name__ == '__main__':
    main()
