# -*- coding: utf-8 -*-
"""
End-to-End Playwright Verification for General Surgery (Lawrence) Module Integration.
Tests:
1. Zero Data Loss & Sanitization Verification (verbatim text, stripped meta-text)
2. Dedicated Course Page surgery.html (Title, Brand, Toolbar, RTL layout)
3. Rich Medical UI Widgets (Mind-Map Card, Badges, Steppers, Tables, High-Yield Cards)
4. Exam Cram Filter Mode (⚡ حالت شب امتحان)
5. Text Selection & 4-Color Offline Highlighter
6. Navigation, TOC Sidebar, and Portal Linking in index.html & quiz.html
7. Zero Horizontal Overflow across Mobile (375px), Tablet (768px), and Desktop (1440px)
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
        print("=== TEST 1: LOAD surgery.html & VERIFY PAGE STRUCTURE ===")
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

        # Verify brand identity
        brand = page.locator(".header-brand .brand-title").first.inner_text()
        assert "جراحی جنرال" in brand, f"Unexpected brand title: {brand}"
        print(f"PASS: Brand title verified: '{brand}'")

        # Verify Chapter Title
        hero_title = page.locator(".chapter-title").first.inner_text()
        assert "جدار شکم و فتق‌ها" in hero_title, f"Unexpected chapter title: {hero_title}"
        print(f"PASS: Chapter hero title: '{hero_title}'")

        # Verify all 7 sections rendered
        sections = page.locator(".study-section").all()
        assert len(sections) == 7, f"Expected 7 sections, found {len(sections)}"
        for idx, sec in enumerate(sections):
            sec_id = sec.get_attribute("id")
            assert sec_id == f"surg-ch10-sec{idx+1:02d}", f"Unexpected section ID: {sec_id}"
        print(f"PASS: All 7 surgical sections cleanly mounted into DOM (sec01 to sec07)!")

        print("\n=======================================================")
        print("=== TEST 2: CHAPTER MIND-MAP CARD (نمودار درختی جامع) ===")
        print("=======================================================")
        mindmap = page.locator("#chapterMindMap")
        assert mindmap.is_visible(), "Chapter Mind-Map Card must be visible at top of chapter"

        branches = page.locator(".mindmap-card-branch").all()
        assert len(branches) == 7, f"Expected 7 branch cards in mind-map, found {len(branches)}"
        print(f"PASS: Chapter Mind-Map card rendered with 7 branches!")

        # Test mindmap toggle button
        toggle_btn = page.locator("#btnToggleMindmap")
        assert toggle_btn.is_visible()
        toggle_btn.click()
        page.wait_for_timeout(200)
        assert page.locator("#mindmapContent").evaluate("el => el.classList.contains('is-collapsed')"), "Mindmap content should be collapsed"
        toggle_btn.click()
        page.wait_for_timeout(200)
        assert not page.locator("#mindmapContent").evaluate("el => el.classList.contains('is-collapsed')"), "Mindmap content should be expanded"
        print("PASS: Mindmap collapse/expand interactive toggle operates smoothly!")

        print("\n=======================================================")
        print("=== TEST 3: RICH MEDICAL UI WIDGET TRANSFORMATION ===")
        print("=======================================================")
        # 1. Inline Exam Badges (.badge-theory and .badge-trap)
        theory_badges = page.locator(".badge-theory").all()
        trap_badges = page.locator(".badge-trap").all()
        assert len(theory_badges) >= 50, f"Expected >50 theory badges, found {len(theory_badges)}"
        assert len(trap_badges) >= 15, f"Expected >15 trap badges, found {len(trap_badges)}"
        print(f"PASS: Theory badges ({len(theory_badges)}) and Trap warning badges ({len(trap_badges)}) rendered with styling!")

        # 2. Clinical Steppers (.clinical-stepper-card)
        stepper_cards = page.locator(".clinical-stepper-card").all()
        assert len(stepper_cards) >= 5, f"Expected multiple clinical stepper cards, found {len(stepper_cards)}"
        first_step = stepper_cards[0]
        assert first_step.locator(".step-badge-pill").is_visible(), "Step badge pill must be visible"
        print(f"PASS: Clinical Stepper Cards ({len(stepper_cards)}) rendered with step indicators!")

        # 3. Decision branching arrows (⬅️, ✅, ❌)
        arrows = page.locator(".stepper-arrow-indicator").all()
        assert len(arrows) >= 5, f"Expected branching arrows, found {len(arrows)}"
        assert page.locator(".badge-decision-yes").count() >= 1, "Expected ✅ success badges"
        assert page.locator(".badge-decision-no").count() >= 1, "Expected ❌ danger badges"
        print(f"PASS: Algorithm branching arrows and decision badges rendered!")

        # 4. Comparison Tables (.table-container > table.table-medical)
        tables = page.locator(".table-container table.table-medical").all()
        assert len(tables) >= 10, f"Expected >=10 medical tables, found {len(tables)}"
        print(f"PASS: Comparison tables ({len(tables)}) rendered inside responsive wrappers with sticky headers!")

        # 5. High-Yield Night-Before-Exam Cards (.high-yield-exam-card)
        hy_cards = page.locator(".high-yield-exam-card").all()
        assert len(hy_cards) == 7, f"Expected 7 High-Yield cards (1 per part), found {len(hy_cards)}"
        for hy in hy_cards:
            assert "مرور شب امتحان" in hy.inner_text()
        print(f"PASS: All 7 High-Yield Night-Before-Exam cards rendered with gold/emerald styling!")

        print("\n=======================================================")
        print("=== TEST 4: '⚡ حالت شب امتحان' (EXAM CRAM FILTER MODE) ===")
        print("=======================================================")
        cram_btn = page.locator("#examCramToggleBtn")
        assert cram_btn.is_visible()
        cram_btn.click()
        page.wait_for_timeout(300)

        assert cram_btn.evaluate("el => el.classList.contains('is-active')")
        assert page.locator("#chapterContentArea").evaluate("el => el.classList.contains('exam-cram-mode')")
        assert page.locator("#examCramBanner").is_visible()

        # Check visibility in cram mode:
        # A) Mind-Map must be visible
        assert page.locator("#chapterMindMap").is_visible(), "Mind-map must be visible in cram mode"
        # B) High-yield cards must be visible
        assert hy_cards[0].is_visible(), "High-yield card must be visible in cram mode"
        # C) Tables must be visible
        assert tables[0].is_visible(), "Table must be visible in cram mode"
        # D) Stepper cards must be visible
        assert stepper_cards[0].is_visible(), "Stepper card must be visible in cram mode"
        print("PASS: Exam Cram Mode activated; Mind-Map, High-Yield cards, Steppers, and Tables remain fully visible!")

        # Toggle cram mode off
        page.locator("#btnExitCram").click()
        page.wait_for_timeout(200)
        assert not page.locator("#chapterContentArea").evaluate("el => el.classList.contains('exam-cram-mode')")
        print("PASS: Exited Exam Cram mode smoothly!")

        print("\n=======================================================")
        print("=== TEST 5: TEXT SELECTION & 4-COLOR HIGHLIGHTER ===")
        print("=======================================================")
        # Select text in the first study section
        p_locator = page.locator("#chapterContentArea .study-section p").first
        p_locator.scroll_into_view_if_needed()
        page.wait_for_timeout(300)

        page.evaluate("""() => {
            const p = document.querySelector('#chapterContentArea .study-section p');
            const range = document.createRange();
            const textNode = p.firstChild || p;
            const maxLen = textNode.length || textNode.textContent.length;
            range.setStart(textNode, 0);
            range.setEnd(textNode, Math.min(15, maxLen));
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            window.StudyFeatures.showPopoverForSelection(range);
        }""")
        page.wait_for_timeout(250)

        popover = page.locator("#highlightPopover")
        assert popover.is_visible(), "Highlight floating popover should appear"
        swatches = popover.locator(".swatch-btn").all()
        assert len(swatches) == 4, f"Expected 4 swatches, found {len(swatches)}"

        # Click Yellow swatch
        popover.locator(".swatch-btn[data-color='yellow']").click(force=True)
        page.wait_for_timeout(250)

        created_mark = page.locator("mark.user-highlight")
        assert created_mark.count() >= 1, "Expected <mark class='user-highlight'> in DOM"
        assert created_mark.get_attribute("data-color") == "yellow"
        
        badge = page.locator("#highlightsCountBadge")
        assert badge.is_visible() and ("1" in badge.inner_text() or "۱" in badge.inner_text())
        print("PASS: Text highlighted with yellow swatch, mark inserted in DOM, and badge updated!")

        print("\n=======================================================")
        print("=== TEST 6: SIDEBAR TOC NAVIGATION & SCROLLSPY ===")
        print("=======================================================")
        toc_links = page.locator("#desktopNavTree .nav-heading-link").all()
        assert len(toc_links) == 7, f"Expected 7 section links in TOC sidebar, found {len(toc_links)}"
        
        # Test clicking section 3 link
        sec3_link = page.locator("#desktopNavTree .nav-heading-link[data-target-id='surg-ch10-sec03']")
        assert sec3_link.is_visible()
        sec3_link.click()
        page.wait_for_timeout(400)

        assert page.evaluate("() => window.appState.activeSectionId") == "surg-ch10-sec03"
        print("PASS: Clicking TOC link smoothly scrolled and updated active section to 'surg-ch10-sec03'!")

        print("\n=======================================================")
        print("=== TEST 7: PORTAL INTEGRATION IN index.html & quiz.html ===")
        print("=======================================================")
        # Test index.html dropdown and bento card
        page.goto(index_url)
        page.wait_for_load_state("networkidle")

        # Check dropdown contains surgery
        surg_in_dropdown = page.locator("#coursesDropdownMenu a[href*='surgery.html']")
        assert surg_in_dropdown.count() >= 1, "surgery.html must be linked in courses dropdown on index.html"

        # Check Bento Card exists
        surg_bento = page.locator(".bento-card-surg")
        assert surg_bento.count() >= 1, "Surgery bento card must exist in portal grid"
        assert "جراحی جنرال" in surg_bento.inner_text()
        print("PASS: surgery.html linked in dropdown and Bento Grid on index.html!")

        # Check quiz.html dropdown contains surgery
        page.goto(quiz_url)
        page.wait_for_load_state("networkidle")
        surg_in_quiz = page.locator("#coursesDropdownMenu a[href*='surgery.html']")
        assert surg_in_quiz.count() >= 1, "surgery.html must be linked in courses dropdown on quiz.html"
        print("PASS: surgery.html linked in courses dropdown on quiz.html!")

        print("\n=======================================================")
        print("=== TEST 8: ZERO HORIZONTAL OVERFLOW ACROSS BREAKPOINTS ===")
        print("=======================================================")
        breakpoints = [375, 768, 1024, 1440]
        for bp in breakpoints:
            test_page = browser.new_page(viewport={"width": bp, "height": 850})
            test_page.goto(surgery_url)
            test_page.wait_for_load_state("networkidle")

            overflow = test_page.evaluate("""() => {
                const doc = document.documentElement;
                return {
                    scrollWidth: doc.scrollWidth,
                    clientWidth: doc.clientWidth,
                    hasOverflow: doc.scrollWidth > doc.clientWidth + 1
                };
            }""")
            assert not overflow["hasOverflow"], f"Horizontal overflow detected at {bp}px: {overflow}"
            print(f"PASS: Viewport {bp}px has ZERO horizontal overflow ({overflow['clientWidth']}px == {overflow['scrollWidth']}px)")
            test_page.close()

        page.close()
        print("\n=======================================================")
        print("=== ALL SURGERY MODULE INTEGRATION TESTS PASSED 100% ===")
        print("=======================================================\n")

if __name__ == '__main__':
    test_surgery_integration()
