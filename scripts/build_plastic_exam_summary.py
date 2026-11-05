# -*- coding: utf-8 -*-
"""
Build High-Yield Exam Summary for Surgery Chapter 22: Plastic Surgery
Source: Plastic Surgery.md
Output: Injects examSummaryHtml and summaryContent into js/data/surgery-registry.js and surgery_registry.json
"""

import os
import sys
import re
import json
import markdown

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def build_plastic_summary_html(md_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        raw_md = f.read()

    # 0. Clean (صفحات X تا Y) if present anywhere
    clean_md = re.sub(r'\s*\(صفحات\s*[\d\u06F0-\u06F9]+\s*تا\s*[\d\u06F0-\u06F9]+\)', '', raw_md)

    # 1. Extract Main Title
    title_match = re.search(r'^#\s*(.*?)$', clean_md, re.MULTILINE)
    full_title = title_match.group(1).strip() if title_match else "فصل ۲۲: جراحی پلاستیک؛ بیماری‌های پوست، بافت نرم، صورت و دست"
    hero_title = re.sub(r'^فصل\s*[\d\u06F0-\u06F9]+[:\s\-]*', '', full_title).strip()
    if not hero_title:
        hero_title = full_title

    # Extract chapter number
    ch_num_match = re.search(r'فصل\s*([\d\u06F0-\u06F9]+)', full_title)
    ch_num_str = ch_num_match.group(1) if ch_num_match else "۲۲"

    # 2. Extract Tree Map (supports any variant of نقشه فصل/ساختار)
    tree_match = re.search(r'## نقشه[^\n]+(?:فصل|ساختار)\s*\n(.*?)(?=\n---|\n## )', clean_md, re.DOTALL)
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
                <span class="summary-tree-subtitle">ساختار درختی و طبقه‌بندی {len(branch_cards)} مبحث کلیدی فصل جراحی پلاستیک، صورت و دست</span>
              </div>
            </div>
            <div class="summary-tree-grid">
              {"".join(branch_cards)}
            </div>
          </section>
        """

    # 3. Extract Master Card (⚡ جمع‌بندی ۱ دقیقه‌ای شب امتحان)
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

    # 4. Extract Intermediate Topic Sections
    parts = re.split(r'\n(?=## )', clean_md)
    topic_cards = []
    
    for part in parts:
        part = part.strip()
        if not part.startswith('## '):
            continue
        first_line = part.split('\n')[0].strip()
        # Skip Tree map and Master card sections
        if 'نقشه' in first_line or '⚡ جمع‌بندی' in first_line:
            continue
        
        lines = part.split('\n')
        topic_title = lines[0].replace('## ', '').strip()
        topic_body_md = '\n'.join(lines[1:]).strip()
        
        # Remove standalone '---'
        topic_body_md = re.sub(r'^\s*---\s*$', '', topic_body_md, flags=re.MULTILINE)
        
        # Convert topic_body_md with tab_length=2, tables, fenced_code
        topic_html = markdown.markdown(topic_body_md, tab_length=2, extensions=['tables', 'fenced_code'])
        
        # Post-process tables: wrap in .exam-table-responsive
        topic_html = re.sub(r'(<table.*?>.*?</table>)', r'<div class="exam-table-responsive">\1</div>', topic_html, flags=re.DOTALL)
        
        # Post-process table alignment: ensure direction rtl
        topic_html = topic_html.replace('style="text-align: left;"', 'style="text-align: right; direction: rtl;"')
        
        # Post-process blockquotes: make sure they have callout class
        def format_blockquote(match):
            bq_content = match.group(1).strip()
            return f"""<blockquote class="exam-trap-callout">{bq_content}</blockquote>"""
        
        topic_html = re.sub(r'<blockquote>(.*?)</blockquote>', format_blockquote, topic_html, flags=re.DOTALL)
        
        topic_cards.append(f"""
          <section class="summary-topic-card">
            <div class="summary-topic-header">
              <h3 class="summary-topic-title">
                <span style="color: #0d9488;">❖</span>
                <span>{topic_title}</span>
              </h3>
            </div>
            <div class="summary-topic-body">
              {topic_html}
            </div>
          </section>
        """)

    # 5. Assemble Full Exam Summary View
    full_summary_html = f"""
    <div class="exam-summary-container">
      <!-- Top Exam Summary Hero Banner -->
      <header class="exam-summary-hero">
        <div class="summary-hero-badges">
          <span class="summary-hero-badge">⚡ خلاصه جامع شب امتحان</span>
          <span class="summary-hero-tag">فصل {ch_num_str} جراحی لارنس</span>
          <span class="summary-hero-time">⏱️ مرور سریع: ۱۵ دقیقه</span>
        </div>
        <h1 class="summary-hero-title">{hero_title}</h1>
        <p class="summary-hero-desc">خلاصه خط‌به‌خط و فوق‌فشرده نکات امتحانی، تعاریف طلایی، معیارهای تشخیصی و الگوریتم‌های درمانی مصوب دستیاری و پره‌انترنی (مطابق آخرین ویرایش رفرنس لارنس)</p>
        <div class="summary-hero-actions">
          <button type="button" class="btn-return-detailed" onclick="window.setChapterViewMode ? window.setChapterViewMode('detailed') : (window.StudyFeatures && window.StudyFeatures.applyExamCramMode(false, true))">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            <span>📖 بازگشت به درسنامه کامل</span>
          </button>
        </div>
      </header>

      <!-- 1. Chapter Architecture Tree Map -->
      {tree_html}

      <!-- 2. Core Clinical Topic Cards -->
      {"".join(topic_cards)}

      <!-- 3. End-of-Chapter 1-Minute Master Card -->
      {master_html}

      <!-- Bottom Action Bar -->
      <footer class="summary-footer-actions">
        <button type="button" class="btn-return-detailed" onclick="window.setChapterViewMode ? window.setChapterViewMode('detailed') : (window.StudyFeatures && window.StudyFeatures.applyExamCramMode(false, true))">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span>📖 بازگشت به درسنامه کامل این فصل</span>
        </button>
        <a href="./quiz.html" class="btn-goto-quiz">
          <span>🎯 شرکت در کوئیز و تست‌های جراحی</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="transform: rotate(180deg);">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </footer>
    </div>
    """

    return full_summary_html, clean_md

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    md_path = os.path.join(base_dir, 'Plastic Surgery.md')
    if not os.path.exists(md_path):
        md_path = os.path.join(base_dir, 'chapters', 'Surgery', 'summaries', 'Plastic Surgery.md')

    print(f"Reading summary markdown from: {md_path}")
    summary_html, raw_md = build_plastic_summary_html(md_path)
    print(f"Generated summary HTML length: {len(summary_html)} bytes")

    # Update js/data/surgery-registry.js
    registry_js_path = os.path.join(base_dir, 'js', 'data', 'surgery-registry.js')
    with open(registry_js_path, 'r', encoding='utf-8') as f:
        js_content = f.read()

    prefix = "window.SURGERY_REGISTRY = "
    idx = js_content.find(prefix)
    if idx != -1:
        json_str = js_content[idx + len(prefix):].rstrip(';\n ')
        chapters = json.loads(json_str)
        
        found = False
        for ch in chapters:
            if ch.get('id') == 'surg-ch22':
                ch['examSummaryHtml'] = summary_html
                ch['summaryContent'] = raw_md
                found = True
                print("Attached examSummaryHtml and summaryContent to surg-ch22 in chapters list.")
                break
        
        if not found:
            print("ERROR: surg-ch22 not found in surgery-registry.js!")
            sys.exit(1)

        new_js = f"""/**
 * MEDICAL STUDY WEBAPP - GENERAL SURGERY COURSE REGISTRY (22 COMPREHENSIVE CHAPTERS)
 * Course: جراحی جنرال (رفرنس لارنس - Lawrence's Essentials of General Surgery)
 * Total Chapters: {len(chapters)}
 * Total Sections: {sum(len(c['sections']) for c in chapters)}
 * Generated automatically with High-Yield Exam Summary integration
 */

window.SURGERY_REGISTRY = {json.dumps(chapters, ensure_ascii=False, indent=2)};
"""
        with open(registry_js_path, 'w', encoding='utf-8') as f:
            f.write(new_js)
        print(f"Updated {registry_js_path}")

        # Also update chapters/Surgery/surgery_registry.json
        registry_json_path = os.path.join(base_dir, 'chapters', 'Surgery', 'surgery_registry.json')
        with open(registry_json_path, 'w', encoding='utf-8') as f:
            json.dump({"course": "surgery", "totalChapters": len(chapters), "chapters": chapters}, f, ensure_ascii=False, indent=2)
        print(f"Updated {registry_json_path}")

if __name__ == '__main__':
    main()
