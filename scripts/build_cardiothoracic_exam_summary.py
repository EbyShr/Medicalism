# -*- coding: utf-8 -*-
"""
Build High-Yield Exam Summary for Surgery Chapter 25: Cardiothoracic Surgery
Source: Cardiothoracic Surgery.md (media_1793904009169_f3d4114a.md)
Output: Injects examSummaryHtml and summaryContent into js/data/surgery-registry.js and surgery_registry.json
"""

import os
import sys
import re
import json
import markdown

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

SOURCE_PATH = r"C:/Users/abolf/.gemini/antigravity/brain/d031b241-113f-4331-832d-14f1f4fb5137/.user_uploaded/media_1793904009169_f3d4114a.md"

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

def build_cardiothoracic_summary_html(clean_md):
    full_title = "فصل ۲۵: جراحی قلب و قفسه سینه (Cardiothoracic Surgery)"
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
            # Dedent child lines by 2 spaces to avoid <pre><code> blocks in markdown
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

    # 3. Extract Intermediate Topic Sections
    parts = re.split(r'\n(?=## )', clean_md)
    topic_cards = []
    topic_nav_pills = []
    
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
        
        card_id = f"cardioTopic-{sec_idx}"
        topic_nav_pills.append(f"""<a href="#{card_id}" class="summary-nav-pill">بخش {sec_idx}: {topic_title.split('(')[0].strip()}</a>""")

        topic_cards.append(f"""
          <section class="summary-topic-card" id="{card_id}">
            <div class="summary-topic-header">
              <h3 class="summary-topic-title">
                <span style="color: #0d9488;">❖ بخش {sec_idx}:</span>
                <span>{topic_title}</span>
              </h3>
            </div>
            <div class="summary-topic-body">
              {topic_html}
            </div>
          </section>
        """)

    # 4. Assemble Full Exam Summary View
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

      <!-- Topic Quick Jump Bar -->
      <nav class="summary-topics-nav" aria-label="فهرست دسترسی سریع به مباحث خلاصه">
        {"".join(topic_nav_pills)}
      </nav>

      <!-- 1. Clinical Tree & Decision Pathways -->
      {tree_html}

      <!-- 2. Master 1-Minute Cram Card -->
      {master_html}

      <!-- 3. Comprehensive High-Yield Topic Cards -->
      <div class="summary-topics-container">
        {"".join(topic_cards)}
      </div>

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

        topic_html = markdown.markdown(topic_body_md, tab_length=2, extensions=['tables', 'fenced_code'])
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
    print(f"Reading source file: {SOURCE_PATH}")
    with open(SOURCE_PATH, 'r', encoding='utf-8') as f:
        raw_md = f.read()

    clean_md = clean_markdown_text(raw_md)
    print("Cleaned markdown text length:", len(clean_md))

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

    # Check if surg-ch25 exists or if we should add it
    ch25_obj = None
    existing_idx = None
    for idx, ch in enumerate(registry_data['chapters']):
        if ch['id'] == 'surg-ch25' or 'cardiothoracic' in ch.get('latinTitle', '').lower():
            ch25_obj = ch
            existing_idx = idx
            break

    if ch25_obj:
        print("Found existing ch25 object, updating...")
        ch25_obj['examSummaryHtml'] = exam_summary_html
        ch25_obj['summaryContent'] = clean_md
        ch25_obj['sections'] = sections
        ch25_obj['mindMapHtml'] = mindmap_html
    else:
        print("Creating new chapter surg-ch25...")
        ch25_obj = {
            "id": "surg-ch25",
            "slug": "ch25",
            "courseId": "surgery",
            "number": 25,
            "title": "فصل ۲۵: جراحی قلب و قفسه سینه (Cardiothoracic Surgery)",
            "shortTitle": "جراحی قلب و قفسه سینه",
            "latinTitle": "Cardiothoracic Surgery: Diseases of the Heart, Great Vessels & Thoracic Cavity",
            "author": "گروه جراحی قلب، عروق و قفسه سینه",
            "authorAffiliation": "دانشگاه علوم پزشکی البرز (ABZUMS) • رفرنس مصوب لارنس",
            "totalSections": len(sections),
            "estimatedReadTime": "۵۰ دقیقه مطالعه عمیق و مرور بالینی",
            "mindMapHtml": mindmap_html,
            "sections": sections,
            "examSummaryHtml": exam_summary_html,
            "summaryContent": clean_md
        }
        # Insert between 24 and 28
        insert_idx = len(registry_data['chapters'])
        for idx, ch in enumerate(registry_data['chapters']):
            if ch.get('number', 0) > 25:
                insert_idx = idx
                break
        registry_data['chapters'].insert(insert_idx, ch25_obj)
        print(f"Inserted surg-ch25 at index {insert_idx}")

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

    print("SUCCESS: Chapter 25 Cardiothoracic Surgery Exam Mode integrated!")

if __name__ == '__main__':
    main()
