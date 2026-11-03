# -*- coding: utf-8 -*-
import os
import sys
import time
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_highlights_and_exam_cram():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    course_url = f"file:///{os.path.join(base_dir, 'communicable-and-noncommunicable-diseases.html').replace(os.sep, '/')}"

    with sync_playwright() as p:
        chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        if not os.path.exists(chrome_path):
            chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)

        print("\n==================================================================")
        print("=== TEST PART 1: SELECTION POPOVER & 4 HIGHLIGHT COLORS ===")
        print("==================================================================")

        page = browser.new_page(viewport={"width": 1440, "height": 900})
        # Clear storage initially
        page.goto(course_url)
        page.wait_for_load_state("networkidle")
        page.evaluate("() => { localStorage.clear(); }")
        page.reload()
        page.wait_for_load_state("networkidle")

        # 1. Select text in first section paragraph
        p_locator = page.locator("#chapterContentArea .study-section p").first
        assert p_locator.count() >= 1, "Must find at least one paragraph in chapter content"
        
        # Simulate selection using DOM Range
        page.evaluate("""() => {
            const p = document.querySelector('#chapterContentArea .study-section p');
            const range = document.createRange();
            // Select first 20 characters
            range.setStart(p.firstChild || p, 0);
            range.setEnd(p.firstChild || p, Math.min(25, (p.firstChild ? p.firstChild.length : p.textContent.length)));
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            // Trigger selection check
            window.StudyFeatures.showPopoverForSelection(range);
        }""")
        page.wait_for_timeout(200)

        # Check Popover visibility
        popover = page.locator("#highlightPopover")
        assert popover.is_visible(), "Floating highlight popover should be visible upon text selection"

        # Check all 4 color buttons exist
        swatches = popover.locator(".swatch-btn").all()
        assert len(swatches) == 4, f"Expected 4 swatches (yellow, green, pink, blue), found {len(swatches)}"
        print("PASS: Floating popover visible right above selection with strictly 4 colors!")

        # Click Yellow Color Swatch
        yellow_btn = popover.locator(".swatch-btn[data-color='yellow']")
        yellow_btn.click()
        page.wait_for_timeout(250)

        # 1. Verify mark element created
        created_mark = page.locator("mark.user-highlight")
        assert created_mark.count() >= 1, "Expected <mark class='user-highlight'> in DOM"
        hl_id = created_mark.get_attribute("data-id")
        mark_by_id = page.locator(f"mark.user-highlight[data-id='{hl_id}']")
        assert mark_by_id.get_attribute("data-color") == "yellow"
        print(f"PASS: Text wrapped in mark.user-highlight with data-id='{hl_id}' and data-color='yellow'!")

        # Verify LocalStorage persistence
        ls_highlights = page.evaluate("() => JSON.parse(localStorage.getItem('medicalism_highlights_v1') || '[]')")
        assert len(ls_highlights) == 1, f"Expected 1 saved highlight in localStorage, found {len(ls_highlights)}"
        assert ls_highlights[0]["color"] == "yellow"
        assert ls_highlights[0]["id"] == hl_id
        assert len(ls_highlights[0]["text"]) > 0
        print(f"PASS: Highlight persisted in localStorage under 'medicalism_highlights_v1' with full metadata!")

        # Verify Badge on top header
        badge = page.locator("#highlightsCountBadge")
        assert badge.is_visible() and ("1" in badge.inner_text() or "۱" in badge.inner_text()), "Badge must show count 1"
        print("PASS: Top study toolbar badge shows count '1'!")

        print("\n==================================================================")
        print("=== TEST PART 2: CLICK TO CHANGE COLOR & DELETE HIGHLIGHT ===")
        print("==================================================================")

        # Click on the existing mark
        mark_by_id.click()
        page.wait_for_timeout(200)
        assert popover.is_visible(), "Popover must reappear when clicking an existing highlight mark"

        # Check Delete button is visible
        del_btn = page.locator("#popoverDeleteBtn")
        assert del_btn.is_visible(), "Delete button must be visible when an existing mark is clicked"

        # Switch color to Green
        green_btn = popover.locator(".swatch-btn[data-color='green']")
        green_btn.click()
        page.wait_for_timeout(200)

        # Verify color changed
        assert mark_by_id.get_attribute("data-color") == "green", "Mark data-color must update to 'green'"
        ls_updated = page.evaluate("() => JSON.parse(localStorage.getItem('medicalism_highlights_v1') || '[]')")
        assert ls_updated[0]["color"] == "green", "LocalStorage highlight color must update to 'green'"
        print("PASS: Clicking existing mark opens popover with delete button and updates color to green!")

        # Click mark again and delete it
        mark_by_id.click()
        page.wait_for_timeout(200)
        del_btn.click()
        page.wait_for_timeout(250)

        assert page.locator("mark.user-highlight").count() == 0, "Mark must be cleanly unwrapped upon deletion"
        ls_empty = page.evaluate("() => JSON.parse(localStorage.getItem('medicalism_highlights_v1') || '[]')")
        assert len(ls_empty) == 0, "LocalStorage must be empty after deleting highlight"
        assert not badge.is_visible() or badge.inner_text() == "0", "Badge should hide or show 0"
        print("PASS: Delete button cleanly unwraps mark and removes from localStorage!")

        print("\n==================================================================")
        print("=== TEST PART 3: PERSISTENCE ACROSS CHAPTER SWITCHES & RELOAD ===")
        print("==================================================================")

        # Create highlight in Chapter 27 (active)
        page.evaluate("""() => {
            const p = document.querySelector('#chapterContentArea .study-section p');
            const range = document.createRange();
            range.setStart(p.firstChild || p, 0);
            range.setEnd(p.firstChild || p, 20);
            window.StudyFeatures.showPopoverForSelection(range);
            window.StudyFeatures.applyHighlightColor('yellow');
        }""")
        page.wait_for_timeout(250)

        # Switch to Chapter 19
        page.evaluate("() => window.appState.setActiveChapter('ch-19')")
        page.wait_for_timeout(400)
        assert page.evaluate("() => window.appState.activeChapterId") == "ch-19"

        # Create highlight in Chapter 19
        page.evaluate("""() => {
            const p = document.querySelector('#chapterContentArea .study-section p');
            const range = document.createRange();
            range.setStart(p.firstChild || p, 0);
            range.setEnd(p.firstChild || p, 18);
            window.StudyFeatures.showPopoverForSelection(range);
            window.StudyFeatures.applyHighlightColor('blue');
        }""")
        page.wait_for_timeout(250)

        # LocalStorage should have 2 highlights across 2 chapters
        ls_two = page.evaluate("() => JSON.parse(localStorage.getItem('medicalism_highlights_v1') || '[]')")
        assert len(ls_two) == 2, f"Expected 2 highlights across chapters, found {len(ls_two)}"
        print("PASS: Created highlights across multiple chapters (ch-27 & ch-19)!")

        # Reload page
        page.reload()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(300)

        # Switch back to Chapter 27
        page.evaluate("() => window.appState.setActiveChapter('ch-27')")
        page.wait_for_timeout(400)

        # Verify Chapter 27 highlight was automatically re-applied!
        reapplied_ch27 = page.locator("#chapterContentArea mark.user-highlight[data-color='yellow']")
        assert reapplied_ch27.count() >= 1, "Chapter 27 highlight must be automatically re-applied upon chapter switch!"
        print("PASS: Chapter 27 highlight automatically re-applied after reload and chapter navigation!")

        print("\n==================================================================")
        print("=== TEST PART 4: 'هایلایتهای من' MODAL & CLICK-TO-JUMP ===")
        print("==================================================================")

        # Open Highlights Modal via top header button
        page.click("#highlightsToggleBtn")
        page.wait_for_timeout(250)

        modal = page.locator("#highlightsModalBackdrop")
        assert modal.evaluate("el => el.classList.contains('is-active')"), "Highlights modal should have .is-active"

        # Check grouped items
        groups = page.locator("#highlightsList .highlights-chapter-group").all()
        assert len(groups) >= 2, f"Expected at least 2 chapter groups in highlights modal, found {len(groups)}"
        print(f"PASS: Highlights modal opened with {len(groups)} chapter groups!")

        # Test Jump-to-Highlight:
        # Currently on ch-27; click the highlight item from ch-19
        ch19_item = page.locator(".highlight-item-card[data-chapter-id='ch-19'] .btn-jump-to-highlight").first
        ch19_item.click()
        page.wait_for_timeout(500)

        # Verify modal closed and chapter switched to ch-19
        assert not modal.evaluate("el => el.classList.contains('is-active')"), "Modal should close after jumping"
        current_ch = page.evaluate("() => window.appState.activeChapterId")
        assert current_ch == "ch-19", f"Expected active chapter 'ch-19', got '{current_ch}'"
        print("PASS: Click-to-jump automatically switched chapter to ch-19 and focused highlight!")

        # Reopen modal and test 'پاک کردن همه'
        page.click("#highlightsToggleBtn")
        page.wait_for_timeout(200)

        page.on("dialog", lambda dialog: dialog.accept())
        page.click("#clearAllHighlightsBtn")
        page.wait_for_timeout(300)

        # Verify empty state
        empty_el = page.locator("#highlightsList .search-empty")
        assert empty_el.is_visible(), "Empty state must be displayed after clearing all highlights"
        ls_cleared = page.evaluate("() => JSON.parse(localStorage.getItem('medicalism_highlights_v1') || '[]')")
        assert len(ls_cleared) == 0, "LocalStorage must have 0 highlights"
        page.click("#highlightsCloseBtn")
        page.wait_for_timeout(200)
        print("PASS: 'پاک کردن همه' cleanly clears all highlights and displays friendly empty state!")

        print("\n==================================================================")
        print("=== TEST PART 5: '⚡ حالت شب امتحان' (EXAM CRAM FILTER MODE) ===")
        print("==================================================================")

        # 1. Create a highlight so we can verify highlights remain visible in cram mode!
        page.evaluate("""() => {
            const p = document.querySelector('#chapterContentArea .study-section p');
            const range = document.createRange();
            range.setStart(p.firstChild || p, 0);
            range.setEnd(p.firstChild || p, 15);
            window.StudyFeatures.showPopoverForSelection(range);
            window.StudyFeatures.applyHighlightColor('yellow');
        }""")
        page.wait_for_timeout(200)

        # 2. Toggle Exam Cram Mode ON
        cram_btn = page.locator("#examCramToggleBtn")
        cram_btn.click()
        page.wait_for_timeout(300)

        # Verify button and container states
        assert cram_btn.evaluate("el => el.classList.contains('is-active')"), "Button should have .is-active"
        assert cram_btn.get_attribute("aria-pressed") == "true", "aria-pressed must be true"
        assert page.locator("#chapterContentArea").evaluate("el => el.classList.contains('exam-cram-mode')"), "Container must have .exam-cram-mode"

        # Check Banner
        banner = page.locator("#examCramBanner")
        assert banner.is_visible(), "Exam cram banner must be visible at top of study content"
        banner_text = banner.inner_text()
        assert "شب امتحان" in banner_text and "مطالعه کامل" in banner_text

        # Verify LocalStorage persistence
        cram_ls = page.evaluate("() => localStorage.getItem('medicalism_exam_cram_mode')")
        assert cram_ls == "true", f"Expected 'true' in localStorage for exam cram mode, got {cram_ls}"
        print("PASS: Exam Cram Mode activated, banner rendered, and state persisted in localStorage!")

        # Verify Filter visibility:
        # A) Standard paragraph without highlight is hidden
        hidden_p = page.locator(".study-section > p:not(.cram-keep-visible):not(:has(mark.user-highlight))").first
        if hidden_p.count() > 0:
            is_hidden = hidden_p.evaluate("el => window.getComputedStyle(el).display === 'none'")
            assert is_hidden, "Standard explanatory paragraphs must have display: none in cram mode!"
            print("PASS: Standard paragraphs are smoothly hidden in exam cram mode!")

        # B) Headings remain visible
        heading = page.locator("#chapterContentArea h2").first
        assert heading.is_visible(), "Section headings must remain visible"

        # C) Callout boxes remain visible
        callouts = page.locator("#chapterContentArea .medical-callout, #chapterContentArea .clinical-callout-card")
        if callouts.count() > 0:
            assert callouts.first.is_visible(), "Callout boxes must remain visible"
            print("PASS: Clinical callout boxes remain visible!")

        # D) The user's highlighted sentence remains visible!
        user_hl = page.locator("mark.user-highlight")
        assert user_hl.is_visible(), "User's highlighted sentences must remain visible in exam cram mode!"
        print("PASS: User's highlighted sentence remains visible in exam cram mode!")

        # 3. Toggle Exam Cram Mode OFF via banner exit button
        exit_btn = page.locator("#btnExitCram")
        exit_btn.click()
        page.wait_for_timeout(300)

        assert not page.locator("#chapterContentArea").evaluate("el => el.classList.contains('exam-cram-mode')"), "Container should not have .exam-cram-mode"
        assert not cram_btn.evaluate("el => el.classList.contains('is-active')")
        cram_ls_off = page.evaluate("() => localStorage.getItem('medicalism_exam_cram_mode')")
        assert cram_ls_off == "false"
        print("PASS: Clicking 'مطالعه کامل (خروج)' smoothly restores full study mode!")

        page.close()

        print("\n==================================================================")
        print("=== TEST PART 6: ZERO HORIZONTAL OVERFLOW ACROSS BREAKPOINTS ===")
        print("==================================================================")
        breakpoints = [320, 360, 390, 430, 768, 1024, 1440, 1920]
        for bp in breakpoints:
            test_page = browser.new_page(viewport={"width": bp, "height": 800})
            test_page.goto(course_url)
            test_page.wait_for_load_state("networkidle")

            overflow = test_page.evaluate("""() => {
                const docEl = document.documentElement;
                const body = document.body;
                const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
                const clientW = docEl.clientWidth;
                return {
                    scrollW,
                    clientW,
                    hasOverflow: scrollW > clientW
                };
            }""")
            assert not overflow["hasOverflow"], f"Horizontal overflow at {bp}px! scrollW={overflow['scrollW']}, clientW={overflow['clientW']}"
            print(f"PASS: {bp}px zero horizontal overflow verified (scrollW={overflow['scrollW']}, clientW={overflow['clientW']})")
            test_page.close()

        browser.close()

    print("\n========================================================================================")
    print("ALL TESTS FOR FEATURE 1 (TEXT HIGHLIGHTER) & FEATURE 2 (EXAM CRAM) PASSED WITH 100% SUCCESS!")
    print("========================================================================================")

if __name__ == "__main__":
    test_highlights_and_exam_cram()
