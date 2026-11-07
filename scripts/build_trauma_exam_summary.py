# -*- coding: utf-8 -*-
"""
Enhanced High-Yield Exam Summary Builder for Surgery Chapter 7: Trauma
Features:
- Fixes dense unbroken paragraph bug by ensuring blank lines before lists and subheadings
- Thematic color identities for all 8 topics
- Zero floating pseudo-element dots (pure border-accent cards)
- Clean clinical tables with high-contrast crystal-clear headers
- All table rows preserved inside tables (Table 7, 8, 9)
- Table 4 (Myotomes) dual action columns highlighted (Upper & Lower)
- Removed top quick-jump nav bar per user request
- Placed 1-minute golden master card at the very END of the summary per user request
- Injects updated examSummaryHtml and summaryContent into js/data/surgery-registry.js and surgery_registry.json
"""

import os
import sys
import re
import json
import markdown

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

SOURCE_MD = "chapters/Surgery/summaries/Trauma.md"

TOPIC_CONFIGS = [
    {
        "num": 1,
        "color": "#e11d48",     # Crimson / Emergency Red
        "badge": "پروتکل ATLS و احیای اورژانس",
        "icon": "🚑",
        "short_title": "ارزیابی اولیه و ATLS"
    },
    {
        "num": 2,
        "color": "#7c3aed",     # Royal Violet
        "badge": "ترومای سر، ICP و فتق‌های مغزی",
        "icon": "🧠",
        "short_title": "ترومای سر (TBI)"
    },
    {
        "num": 3,
        "color": "#0284c7",     # Ocean Blue
        "badge": "ستون فقرات، نخاع و شوک نوروژنیک",
        "icon": "🦴",
        "short_title": "ستون فقرات و نخاع"
    },
    {
        "num": 4,
        "color": "#d97706",     # Fiery Amber
        "badge": "ترومای توراکس، EDT و REBOA",
        "icon": "🫁",
        "short_title": "ترومای قفسه سینه"
    },
    {
        "num": 5,
        "color": "#059669",     # Emerald Green
        "badge": "الگوریتم تصمیم‌گیری ترومای شکم",
        "icon": "🩺",
        "short_title": "کلیات ترومای شکم"
    },
    {
        "num": 6,
        "color": "#0d9488",     # Dark Teal
        "badge": "آسیب ارگان‌ها، Damage Control و ACS",
        "icon": "⚡",
        "short_title": "ارگان‌های شکمی و DCS"
    },
    {
        "num": 7,
        "color": "#4f46e5",     # Modern Indigo
        "badge": "شکستگی‌های لگن و ترومای گردن",
        "icon": "🛡️",
        "short_title": "لگن، اورولوژی و گردن"
    },
    {
        "num": 8,
        "color": "#db2777",     # Rose / Fuchsia
        "badge": "ترومای اندام و جمعیت‌های خاص",
        "icon": "👶",
        "short_title": "اندام و جمعیت‌های خاص"
    }
]

TOP_LEVEL_SUBHEADS = [
    ('پاتوفیزیولوژی و نکات طلایی تئوری', '🧬', 'پاتوفیزیولوژی و نکات طلایی تئوری', 'نکات پایه و تئوری', 'trauma-theory-box'),
    ('مسیر مدیریت گام‌به‌گام بیمار', '🩺', 'مسیر مدیریت گام‌به‌گام بالینی (کیس‌محور و OSCE)', 'الگوریتم تصمیم‌گیری', 'trauma-stepper-box'),
    ('سندرم‌های نخاعی ناقص و مسیر تشخیصی', '🦴', 'سندرم‌های نخاعی ناقص و مسیر تشخیصی', 'نورولوژی تروما', 'trauma-spine-box'),
    ('توراکوتومی احیایی در اورژانس', '🫁', 'توراکوتومی احیایی در اورژانس (EDT) و REBOA', 'مداخلات اورژانس', 'trauma-chest-box'),
    ('مدیریت اختصاصی ارگان‌های داخل شکمی', '🛡️', 'مدیریت اختصاصی ارگان‌های داخل شکمی', 'رویکرد به احشا', 'trauma-organ-box'),
    ('جراحی کنترل آسیب', '⚡', 'جراحی کنترل آسیب (Damage Control) و ACS', 'پروتکل فازیک', 'trauma-dcs-box'),
    ('آسیب‌های ادراری-تناسلی تحتانی', '💧', 'آسیب‌های ادراری-تناسلی تحتانی (مثانه و پیشابراه)', 'اورولوژی تروما', 'trauma-gu-box'),
    ('ترومای نافذ گردن', '🎯', 'ترومای نافذ گردن (نواحی سیاه‌سفید I تا III)', 'رویکرد عروقی و هوایی', 'trauma-neck-box'),
    ('ترومای اندام، سندرم کمپارتمان و رابدومیولیز', '🩹', 'ترومای اندام، سندرم کمپارتمان و رابدومیولیز', 'ارتوپدی و تروما', 'trauma-extremity-box')
]

def clean_trauma_tables(text):
    # Fix Table 4 headers (clarify upper vs lower extremity actions)
    text = re.sub(
        r'\| عملکرد حرکتی \| گروه عضلانی \| سگمان نخاعی \| عملکرد حرکتی \| گروه عضلانی \| سگمان نخاعی \|',
        r'| عملکرد حرکتی (اندام فوقانی) | عضلات درگیر | سگمان نخاعی | عملکرد حرکتی (اندام تحتانی) | عضلات درگیر | سگمان نخاعی |',
        text
    )

    # Fix Table 7: remove empty lines between rows
    def fix_t7(m):
        header = m.group(1)
        body = m.group(2)
        clean_body = re.sub(r'\n\s*\n\s*\|', r'\n|', body)
        return header + clean_body

    text = re.sub(r'(###\s+جدول\s+۷:[^\n]+.*?\n)(\|.*?)(?=\n\n\*\*|\n\n###|\n## |$)', fix_t7, text, flags=re.DOTALL)

    # Fix Table 8: remove empty lines, ensure 3 full columns for all 3 mechanisms
    def fix_t8(m):
        header = m.group(1)
        clean_body = """| مکانیسم شکستگی | ویژگی بیومکانیکی و بالینی | اصول مدیریت خونریزی لگنی |
| :--- | :--- | :--- |
| **فشردگی جانبی (Lateral Compression - LC)** | **شایع‌ترین و پایدارترین نوع** (کمترین احتمال پارگی لیگامان‌های ساکروایلیاک). | **۱. منشأ خونریزی:** ۹۰٪ از **شبکه وریدی پره‌ساکرال** و لبه‌های استخوان؛ **۱۰٪ شریانی**.<br>**۲. پایدارسازی مکانیکی حجم لگن:** بستن ملافه یا **Pelvic Binder** (بهترین اثر در شکستگی AP) یا فیکساتور خارجی ارتوپدی.<br>**۳. خط قرمز:** **باز کردن جراحی رتروپریتوئن ممنوع است** (اثر تامپوناد را از بین می‌برد؛ در صورت لاپاراتومی برای طحال، هماتوم لگن به صورت جداگانه پک می‌شود).<br>**۴. خونریزی شریانی فعال (Extravasation در CT):** **آنژیوامبولیزاسیون با کاتتر (درمان انتخابی)**. |
| **فشردگی قدامی-خلفی (AP Compression)** | ایجاد شکستگی **کتاب باز (Open-book)**؛ باز شدن سمفیز پوبیس و بال‌های ایلیاک با آسیب متغیر لیگامان ساکروایلیاک. | بستن فوری Pelvic Binder یا ملافه دور تروکانتر بزرگ جهت کاهش حجم لگن و مهار خونریزی وریدی؛ در صورت ناپایداری مستمر، آنژیوامبولیزاسیون فوری. |
| **برش عمودی (Vertical Shear)** | **نادرترین و ناپایدارترین نوع**؛ جدا شدن همی‌پلویس از ستون فقرات با آسیب شدید عروقی و احشایی. | ناپایدارترین مکانیسم با مورتالیتی بالا؛ نیازمند فیکساسیون اسکلتی اورژانس، احیای پرحجم خون و ارزیابی تهاجمی عروقی/احشایی. |"""
        return header + "\n" + clean_body + "\n"

    text = re.sub(r'(###\s+جدول\s+۸:[^\n]+.*?\n)(\|.*?)(?=\n\n\*\*|\n\n###|\n## |$)', fix_t8, text, flags=re.DOTALL)

    # Fix Table 9: remove empty lines between rows
    def fix_t9(m):
        header = m.group(1)
        body = m.group(2)
        clean_body = re.sub(r'\n\s*\n\s*\|', r'\n|', body)
        return header + clean_body

    text = re.sub(r'(###\s+جدول\s+۹:[^\n]+.*?\n)(\|.*?)(?=\n\n\*\*|\n\n###|\n## |$)', fix_t9, text, flags=re.DOTALL)

    return text

def preprocess_markdown(raw_text):
    text = re.sub(r'\s*\(صفحات\s*[\d\u06F0-\u06F9]+\s*تا\s*[\d\u06F0-\u06F9]+\)', '', raw_text)
    
    # Clean tables first
    text = clean_trauma_tables(text)

    # Ensure double newlines before lists
    text = re.sub(r'([^\n])\n([ \t]*[-*]\s+)', r'\1\n\n\2', text)
    text = re.sub(r'([^\n])\n([ \t]*\d+\.\s+)', r'\1\n\n\2', text)
    # Ensure double newlines after subheadings
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

    # 2. Transform tables with their preceding <h3> into .trauma-table-wrapper
    def format_table(m):
        h3_title = m.group(1).strip()
        table_html = m.group(2).strip()
        table_html = table_html.replace('style="text-align: left;"', 'style="text-align: right; direction: rtl;"')
        
        # Check if this is Table 4 (Myotomes)
        is_myotomes = 'عصب‌دهی' in h3_title or 'Myotomes' in h3_title or 'جدول ۴' in h3_title
        extra_class = " myotomes-table-wrapper" if is_myotomes else ""

        return f"""
        <div class="trauma-table-wrapper{extra_class}">
          <div class="table-card-header">
            <span class="table-icon">📊</span>
            <h4 class="table-card-title">{h3_title}</h4>
          </div>
          <div class="exam-table-responsive">
            {table_html}
          </div>
        </div>
        """
    html = re.sub(r'<h3>(جدول\s*[\d\u06F0-\u06F9]+:[^<]+)</h3>\s*(<table.*?>.*?</table>)', format_table, html, flags=re.DOTALL)
    html = re.sub(r'(?<!<div class="exam-table-responsive">)(<table.*?>.*?</table>)', r'<div class="exam-table-responsive">\1</div>', html, flags=re.DOTALL)

    # 3. Transform Sub-headings like <p><strong>عنوان:</strong></p> into stylish section banners
    # STRICT MATCHING: Only top-level subheadings, NEVER nested bullet bold titles!
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
        # If not a recognized top-level heading, leave it as normal paragraph bold text!
        return f"<p><strong>{raw_text}</strong></p>"

    html = re.sub(r'<p>\s*<strong>([^<]+:[^<]*)</strong>\s*</p>', format_subhead, html)

    # Clean redundant <p> inside <li>
    html = re.sub(r'<li>\s*<p>(.*?)</p>\s*</li>', r'<li>\1</li>', html, flags=re.DOTALL)

    return html

def build_trauma_summary_html(clean_md):
    hero_title = "ترومای جامع و رویکرد ATLS (Trauma)"
    ch_num_str = "۷"

    # 1. Extract Tree Map
    tree_match = re.search(r'## نقشه[^\n]+(?:فصل|ساختار|کلی)\s*\n(.*?)(?=\n---|\n## )', clean_md, re.DOTALL)
    tree_html = ""
    if tree_match:
        tree_text = tree_match.group(1).strip()
        branches = re.findall(r'- \*\*(.*?)\*\*\s*\n((?:  - .*\n?)+)', tree_text)
        
        branch_cards = []
        colors = ["#0284c7", "#6366f1", "#8b5cf6", "#e11d48", "#d97706", "#059669", "#0891b2"]
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
                <h2 class="summary-tree-title">نقشه ساختار فصل: {hero_title}</h2>
                <span class="summary-tree-subtitle">ساختار درختی و طبقه‌بندی {len(branch_cards)} بخش کلیدی ارزیابی اولیه، ترومای سر، ستون فقرات، توراکس، شکم، لگن و اندام‌ها</span>
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
        if 'نقشه' in first_line or '⚡ جمع‌بندی' in first_line:
            continue
        
        sec_idx += 1
        lines = part.split('\n')
        topic_title = lines[0].replace('## ', '').strip()
        topic_body_md = '\n'.join(lines[1:]).strip()
        topic_body_md = re.sub(r'^\s*---\s*$', '', topic_body_md, flags=re.MULTILINE)
        
        cfg = TOPIC_CONFIGS[(sec_idx - 1) % len(TOPIC_CONFIGS)]
        color = cfg['color']
        badge_text = cfg['badge']
        icon = cfg['icon']
        card_id = f"traumaTopic-{sec_idx}"
        
        # Convert to HTML with tables & fenced code
        raw_html = markdown.markdown(topic_body_md, tab_length=2, extensions=['tables', 'fenced_code'])
        
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
        <p class="summary-hero-desc">خلاصه تفکیک‌شده و فوق‌فشرده الگوریتم‌های نجات‌بخش ATLS، ترومای سر، ستون فقرات، توراکس، شکم، لگن، جراحی کنترل آسیب و تله‌های پره‌انترنی و دستیاری (مطابق آخرین ویرایش رفرنس لارنس)</p>
        <div class="summary-hero-actions">
          <button type="button" class="btn-return-detailed" onclick="window.setChapterViewMode ? window.setChapterViewMode('detailed') : (window.StudyFeatures && window.StudyFeatures.applyExamCramMode(false, true))">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>📖 بازگشت به درسنامه کامل</span>
          </button>
          <a href="#summaryMasterCard" class="btn-jump-master">
            <span>⚡ پرش به جمع‌بندی نهایی انتهای فصل</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </a>
        </div>
      </header>

      <!-- 1. Clinical Tree & Decision Pathways -->
      {tree_html}

      <!-- 2. Comprehensive High-Yield Topic Cards -->
      <div class="summary-topics-container">
        {"".join(topic_cards)}
      </div>

      <!-- 3. Master 1-Minute Cram Card (Placed at the very END of summary) -->
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
        <button type="button" class="btn-mark-cram-completed" onclick="window.StudyFeatures && window.StudyFeatures.toggleChapterCompletion('surg-ch07')">
          <span>✓ تسلط کامل بر خلاصه امتحانی تروما</span>
        </button>
      </footer>
    </div>
    """
    return full_summary_html

def main():
    print(f"Reading {SOURCE_MD}...")
    with open(SOURCE_MD, 'r', encoding='utf-8') as f:
        raw_md = f.read()

    clean_md = preprocess_markdown(raw_md)
    print("Preprocessed markdown length:", len(clean_md))

    # Save cleaned markdown back to Trauma.md and summaries/Trauma.md
    with open("Trauma.md", 'w', encoding='utf-8') as f:
        f.write(clean_md)
    with open("chapters/Surgery/summaries/Trauma.md", 'w', encoding='utf-8') as f:
        f.write(clean_md)
    print("Updated Trauma.md files.")

    # Build Enhanced HTML
    exam_summary_html = build_trauma_summary_html(clean_md)
    print(f"Generated examSummaryHtml length: {len(exam_summary_html)}")

    # Update surgery_registry.json
    json_path = 'chapters/Surgery/surgery_registry.json'
    with open(json_path, 'r', encoding='utf-8') as f:
        registry_data = json.load(f)

    target_ch = None
    for ch in registry_data['chapters']:
        if ch['id'] == 'surg-ch07':
            target_ch = ch
            break

    if not target_ch:
        raise ValueError("Could not find surg-ch07 in surgery_registry.json!")

    target_ch['examSummaryHtml'] = exam_summary_html
    target_ch['summaryContent'] = clean_md

    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(registry_data, f, ensure_ascii=False, indent=2)
    print(f"Updated {json_path}")

    # Update js/data/surgery-registry.js
    js_path = 'js/data/surgery-registry.js'
    js_content = f"// Comprehensive Surgery Chapters Registry\nwindow.SURGERY_REGISTRY = {json.dumps(registry_data, ensure_ascii=False, indent=2)};\n"
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"Updated {js_path}")

    print("SUCCESS: Enhanced Trauma Exam Summary successfully compiled and integrated!")

if __name__ == '__main__':
    main()
