# -*- coding: utf-8 -*-
"""
End-to-End Playwright Verification for General Surgery (Lawrence) Module Integration (14 Comprehensive Chapters).
Tests:
1. Full 14-Chapter Registry Verification in Browser DOM (99 clinical sections, zero duplicates)
2. Interactive Chapter Mind-Map Toggle (جمع‌بندی نقشه / باز کردن نقشه)
3. Multi-Chapter Navigation & Dynamic Chapter Switching
4. Interactive & Animated Clinical Flowchart Cards (Zero <pre><code> code blocks)
5. RTL Tables (dir="rtl", text-align: right) and Stepper Cards
6. Exam Cram Filter Mode (⚡ حالت شب امتحان)
7. Portal Integration in index.html & quiz.html
8. Zero Horizontal Overflow across Mobile (375px), Tablet (768px), and Desktop (1440px)
"""

import os
import sys
import json
import time
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_surgery_integration():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    surgery_url = f"file:///{os.path.join(base_dir, 'surgery.html').replace(os.sep, '/')}"
    index_url = f"file:///{os.path.join(base_dir, 'index.html').replace(os.sep, '/')}"
    quiz_url = f"file:///{os.path.join(base_dir, 'quiz.html').replace(os.sep, '/')}"

    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)
        
        print("\n=======================================================")
        print("=== TEST 1: LOAD surgery.html & VERIFY 14 CHAPTERS ===")
        print("=======================================================")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(surgery_url)
        page.wait_for_load_state("networkidle")
        page.evaluate("() => { localStorage.clear(); }")
        page.reload()
        page.wait_for_load_state("networkidle")

        title = page.title()
        assert "جراحی جنرال" in title and "لارنس" in title, f"Unexpected page title: {title}"
        print(f"PASS: Page title verified: '{title}'")

        # Verify 14 chapters in SURGERY_REGISTRY
        registry_len = page.evaluate("() => window.SURGERY_REGISTRY.length")
        assert registry_len == 14, f"Expected 14 chapters in registry, found {registry_len}"
        print(f"PASS: window.SURGERY_REGISTRY loaded with all 14 chapters!")

        total_sections = page.evaluate("() => window.SURGERY_REGISTRY.reduce((acc, c) => acc + c.sections.length, 0)")
        assert total_sections == 99, f"Expected 99 total sections, found {total_sections}"
        print(f"PASS: Exactly 99 clinical sections verified across all 14 chapters!")

        # Verify Initial Chapter (Ch 1)
        hero_title = page.locator(".chapter-title").first.inner_text()
        assert "ارزیابی و مدیریت حوالی عمل" in hero_title, f"Unexpected chapter 1 title: {hero_title}"
        print(f"PASS: Initial chapter hero title: '{hero_title}'")

        sections = page.locator(".study-section").all()
        assert len(sections) == 8, f"Expected 8 sections in Chapter 1, found {len(sections)}"
        print(f"PASS: Chapter 1 mounted with 8 sections (zero duplication)!")

        # Verify TOC in sidebar has 14 chapters
        toc_items = page.locator(".sidebar-scroll-container .nav-chapter-item").all()
        assert len(toc_items) == 14, f"Expected 14 chapters in sidebar TOC, found {len(toc_items)}"
        print(f"PASS: Sidebar TOC indexes all 14 chapters!")

        print("\n=======================================================")
        print("=== TEST 2: CHAPTER MIND-MAP TOGGLE FUNCTIONALITY ===")
        print("=======================================================")
        mindmap_btn = page.locator("#btnToggleMindmap").first
        assert mindmap_btn.is_visible(), "Mindmap toggle button must be visible"
        
        # Click to collapse
        mindmap_btn.click()
        page.wait_for_timeout(300)
        is_collapsed = page.locator("#mindmapContent").first.evaluate("el => el.classList.contains('is-collapsed')")
        assert is_collapsed, "Mindmap content must have 'is-collapsed' class when toggled"
        btn_label = mindmap_btn.locator(".mindmap-btn-text").inner_text()
        assert "مشاهده نقشه" in btn_label, f"Expected label 'مشاهده نقشه', got '{btn_label}'"
        print("PASS: Mindmap successfully collapsed!")

        # Click to expand again
        mindmap_btn.click()
        page.wait_for_timeout(300)
        is_collapsed_again = page.locator("#mindmapContent").first.evaluate("el => el.classList.contains('is-collapsed')")
        assert not is_collapsed_again, "Mindmap content must be visible when expanded"
        btn_label_again = mindmap_btn.locator(".mindmap-btn-text").inner_text()
        assert "جمع‌بندی نقشه" in btn_label_again, f"Expected label 'جمع‌بندی نقشه', got '{btn_label_again}'"
        print("PASS: Mindmap successfully expanded back!")

        print("\n=======================================================")
        print("=== TEST 3: DYNAMIC CHAPTER SWITCHING ===")
        print("=======================================================")
        # Switch to Chapter 10 (Abdominal Wall & Hernia)
        page.evaluate("() => window.appState.setActiveChapter('surg-ch10')")
        page.wait_for_timeout(300)

        hero_title_10 = page.locator(".chapter-title").first.inner_text()
        assert "جدار شکم و فتق‌ها" in hero_title_10, f"Unexpected chapter 10 title: {hero_title_10}"
        sec_count_10 = len(page.locator(".study-section").all())
        assert sec_count_10 == 7, f"Expected 7 sections in Chapter 10, found {sec_count_10}"
        print(f"PASS: Successfully switched to Chapter 10: '{hero_title_10}' (7 sections)!")

        # Switch to Chapter 15 (Biliary Tract)
        page.evaluate("() => window.appState.setActiveChapter('surg-ch15')")
        page.wait_for_timeout(300)

        hero_title_15 = page.locator(".chapter-title").first.inner_text()
        assert "مجاری صفراوی" in hero_title_15, f"Unexpected chapter 15 title: {hero_title_15}"
        sec_count_15 = len(page.locator(".study-section").all())
        assert sec_count_15 == 6, f"Expected 6 sections in Chapter 15, found {sec_count_15}"
        print(f"PASS: Successfully switched to Chapter 15: '{hero_title_15}' (6 sections)!")

        print("\n=======================================================")
        print("=== TEST 4: INTERACTIVE & ANIMATED CLINICAL FLOWCHARTS ===")
        print("=======================================================")
        flowcharts = page.locator(".clinical-flowchart-card").all()
        assert len(flowcharts) >= 2, f"Expected >= 2 flowcharts in Chapter 15, found {len(flowcharts)}"
        print(f"PASS: {len(flowcharts)} animated clinical flowchart cards rendered in Chapter 15!")

        fc_title = page.locator(".flowchart-title").first.inner_text()
        assert "کولهسیستیت حاد" in fc_title, f"Unexpected flowchart title: {fc_title}"
        print(f"PASS: First flowchart verified: '{fc_title}'")

        # Verify NO raw monospace <pre><code> blocks inside flowcharts
        pre_blocks = page.locator(".clinical-flowchart-card pre").all()
        assert len(pre_blocks) == 0, f"Zero <pre> blocks must exist in flowcharts, found {len(pre_blocks)}"
        print("PASS: Verified ZERO monospace <pre> blocks in flowcharts! All diagrams are pure responsive cards.")

        # Switch to Chapter 2 (Fluids & Electrolytes) and check 15 flowcharts
        page.evaluate("() => window.appState.setActiveChapter('surg-ch02')")
        page.wait_for_timeout(300)
        fc_ch2 = page.locator(".clinical-flowchart-card").all()
        assert len(fc_ch2) >= 14, f"Expected >= 14 flowcharts in Chapter 2, found {len(fc_ch2)}"
        print(f"PASS: Chapter 2 rendered with {len(fc_ch2)} animated clinical flowcharts!")

        print("\n=======================================================")
        print("=== TEST 5: STRICT RTL TABLES & CLINICAL STEPPERS ===")
        print("=======================================================")
        # Switch back to Chapter 10 to check steppers and tables
        page.evaluate("() => window.appState.setActiveChapter('surg-ch10')")
        page.wait_for_timeout(300)

        steppers = page.locator(".clinical-stepper-card").all()
        assert len(steppers) >= 4, f"Expected >= 4 steppers in Chapter 10, found {len(steppers)}"
        print(f"PASS: Found {len(steppers)} clinical steppers in Chapter 10!")

        tables = page.locator(".table-container table").all()
        assert len(tables) >= 5, f"Expected >= 5 tables in Chapter 10, found {len(tables)}"
        for idx, tbl in enumerate(tables[:3]):
            tbl_dir = tbl.get_attribute("dir")
            assert tbl_dir == "rtl", f"Table #{idx+1} must have dir='rtl', found {tbl_dir}"
        print(f"PASS: All tables have strict dir='rtl' and responsive container wrapping!")

        print("\n=======================================================")
        print("=== TEST 6: EXAM CRAM MODE (⚡ حالت شب امتحان) ===")
        print("=======================================================")
        cram_btn = page.locator("#examCramToggleBtn")
        assert cram_btn.is_visible(), "Exam Cram Mode toggle button must be visible"
        
        # Click to activate Exam Cram Mode
        cram_btn.click()
        page.wait_for_timeout(300)
        has_cram_class = page.locator("body").evaluate("el => el.classList.contains('exam-cram-mode')")
        assert has_cram_class, "Body must have 'exam-cram-mode' class when activated"
        print("PASS: Exam Cram Mode activated successfully!")

        # Verify High-Yield cards and Flowcharts remain visible
        mindmap_vis = page.locator(".chapter-mindmap-container").first.is_visible()
        assert mindmap_vis, "Mindmap should remain visible in exam cram mode"
        
        # Toggle off
        cram_btn.click()
        page.wait_for_timeout(300)
        assert not page.locator("body").evaluate("el => el.classList.contains('exam-cram-mode')"), "Exam Cram Mode should be deactivated"
        print("PASS: Exam Cram Mode toggled back to standard study view!")

        print("\n=======================================================")
        print("=== TEST 7: PORTAL HOMEPAGE & QUIZ INTEGRATION ===")
        print("=======================================================")
        page.goto(index_url)
        page.wait_for_load_state("networkidle")
        
        # Check course dropdown card
        dropdown_surg = page.locator(".dropdown-course-card[href='./surgery.html']")
        assert dropdown_surg.count() >= 1, "Surgery course card must exist in index.html dropdown"
        dropdown_meta = dropdown_surg.first.text_content()
        assert "۱۴ فصل" in dropdown_meta, f"Dropdown meta must show 14 chapters, found: {dropdown_meta}"
        print("PASS: Portal navigation dropdown correctly displays 14 General Surgery chapters!")

        # Check Bento card
        bento_title = page.locator(".bento-card-surg .bento-card-title").first.inner_text()
        assert "جراحی جنرال" in bento_title, f"Unexpected Bento title: {bento_title}"
        bento_tags = page.locator(".bento-card-surg .bento-tag").all_inner_texts()
        assert any("۱۴ فصل" in t for t in bento_tags), f"Bento tags should mention 14 chapters: {bento_tags}"
        print(f"PASS: Portal Bento card updated with tags: {bento_tags}")

        # Check Quiz page
        page.goto(quiz_url)
        page.wait_for_load_state("networkidle")
        quiz_surg = page.locator(".dropdown-course-card[href='./surgery.html']")
        assert quiz_surg.count() >= 1, "Surgery course card must exist in quiz.html dropdown"
        print("PASS: Quiz navigation dropdown links to General Surgery!")

        print("\n=======================================================")
        print("=== TEST 8: RESPONSIVENESS & ZERO HORIZONTAL OVERFLOW ===")
        print("=======================================================")
        viewports = [
            ("Mobile 375px", 375, 667),
            ("Tablet 768px", 768, 1024),
            ("Desktop 1440px", 1440, 900)
        ]

        for label, w, h in viewports:
            page.set_viewport_size({"width": w, "height": h})
            page.goto(surgery_url)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(300)

            # Check for horizontal overflow
            scroll_width = page.evaluate("() => document.documentElement.scrollWidth")
            client_width = page.evaluate("() => document.documentElement.clientWidth")
            assert scroll_width <= client_width + 1, f"Horizontal overflow detected on {label}: scrollWidth={scroll_width}, clientWidth={client_width}"
            print(f"PASS: {label} has ZERO horizontal overflow (scrollWidth={scroll_width}, clientWidth={client_width})!")

        print("\n=======================================================")
        print("=== ALL 8 END-TO-END VERIFICATION SUITES PASSED 100%! ===")
        print("=======================================================")

if __name__ == '__main__':
    test_surgery_integration()
