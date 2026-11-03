import os
import sys
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_study_enhancements():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    course_url = f"file:///{os.path.join(base_dir, 'communicable-and-noncommunicable-diseases.html').replace(os.sep, '/')}"

    with sync_playwright() as p:
        chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        if not os.path.exists(chrome_path):
            chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)

        print("\n=== STEP 1: Desktop Viewport (1440x900) Tests ===")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(course_url)
        page.wait_for_load_state("networkidle")

        # 1. Check Reading Progress Bar
        bar = page.locator("#readingProgressBar")
        assert bar.count() == 1, "Reading progress bar element must exist"
        initial_width = bar.evaluate("el => el.style.width")
        print(f"Initial progress bar width: {initial_width}")

        # Scroll down
        page.evaluate("window.scrollTo(0, document.body.scrollHeight / 2)")
        page.wait_for_timeout(300)
        mid_width = bar.evaluate("el => el.style.width")
        print(f"Scrolled progress bar width: {mid_width}")
        assert mid_width != "0%" and "%" in mid_width, f"Progress bar should fill on scroll, got {mid_width}"
        print("PASS: Reading progress bar dynamically responds to scroll!")

        # 2. Check Nav Tree item counts (Strict 30 chapters, 154 links)
        ch_items = page.locator("#desktopNavTree .nav-chapter-item").all()
        assert len(ch_items) == 30, f"Expected strictly 30 chapters in desktop nav tree, got {len(ch_items)}"
        links = page.locator("#desktopNavTree .nav-heading-link").all()
        assert len(links) == 154, f"Expected strictly 154 heading links, got {len(links)}"
        print("PASS: Strict 30 chapters and 154 links preserved in desktop TOC tree!")

        # 3. Check Study Progress Widget in sidebar
        widget = page.locator("#sidebarStudyProgressWidget")
        assert widget.is_visible(), "Sidebar study progress widget must be visible"
        stats_text = page.locator("#studyProgressStats").inner_text()
        print(f"Initial study progress text: {stats_text}")
        assert "از" in stats_text and "فصل" in stats_text, f"Stats text format error: {stats_text}"

        # 4. Check End-of-Chapter Cross-Link to Quiz Hub
        quiz_card = page.locator(".chapter-quiz-crosslink-card")
        assert quiz_card.count() >= 1, "Quiz crosslink card must be rendered at end of chapter"
        quiz_btn = quiz_card.locator(".btn-quiz-crosslink")
        assert quiz_btn.is_visible(), "Quiz action button must be visible"
        href = quiz_btn.get_attribute("href")
        print(f"Quiz cross-link href: {href}")
        assert "quiz.html" in href, f"Expected link to quiz.html, got {href}"
        print("PASS: Quiz cross-link callout card verified!")

        # 5. Check Chapter Completion Button
        completion_btn = page.locator(".btn-toggle-chapter-completed")
        assert completion_btn.count() >= 1, "Chapter completion toggle button must exist"
        assert not completion_btn.evaluate("el => el.classList.contains('is-completed')"), "Chapter initially not completed"

        # Click completion button to mark as completed
        completion_btn.click()
        page.wait_for_timeout(300)
        assert completion_btn.evaluate("el => el.classList.contains('is-completed')"), "Button should have is-completed class"
        box_text = completion_btn.locator(".completion-checkbox-box").inner_text()
        assert "✓" in box_text, f"Checkbox box should contain checkmark, got '{box_text}'"

        # Check localStorage persistence
        completed_ls = page.evaluate("() => localStorage.getItem('med_completed_chapters')")
        print(f"LocalStorage completed chapters: {completed_ls}")
        assert completed_ls is not None and "ch-" in completed_ls, "LocalStorage should store completed chapter"

        # Check study progress widget updated
        updated_stats = page.locator("#studyProgressStats").inner_text()
        print(f"Updated study progress text: {updated_stats}")
        assert "۱ از ۳۰ فصل" in updated_stats, f"Expected '۱ از ۳۰ فصل', got '{updated_stats}'"
        fill_width = page.locator("#studyProgressFill").evaluate("el => el.style.width")
        assert fill_width == "3%", f"Expected 3% fill width (1/30), got {fill_width}"

        # Check sidebar badge
        active_ch_id = page.evaluate("() => window.appState.activeChapterId")
        nav_item = page.locator(f'#desktopNavTree [data-nav-chapter="{active_ch_id}"]')
        badge = nav_item.locator(".nav-chapter-completed-badge")
        assert badge.is_visible(), "Sidebar nav chapter completed badge should be visible"
        print("PASS: Chapter completion updates button, localStorage, sidebar badge, and study progress widget!")

        # Toggle off
        completion_btn.click()
        page.wait_for_timeout(300)
        assert not completion_btn.evaluate("el => el.classList.contains('is-completed')"), "Button should revert to incomplete"
        updated_stats2 = page.locator("#studyProgressStats").inner_text()
        assert "۰ از ۳۰ فصل" in updated_stats2, f"Expected 0 completed chapters, got '{updated_stats2}'"
        print("PASS: Chapter completion toggles off smoothly!")

        page.close()

        print("\n=== STEP 2: Mobile Viewport (390x844) Tests ===")
        mob_page = browser.new_page(viewport={"width": 390, "height": 844})
        mob_page.goto(course_url)
        mob_page.wait_for_load_state("networkidle")

        # Open drawer
        mob_page.click("#mobileNavToggle")
        mob_page.wait_for_selector("#mobileDrawer.is-open")

        # Check mobile study progress widget
        mob_widget = mob_page.locator("#mobileStudyProgressWidget")
        assert mob_widget.is_visible(), "Mobile study progress widget must be visible in drawer"
        mob_stats = mob_page.locator("#mobileStudyProgressStats").inner_text()
        print(f"Mobile progress text: {mob_stats}")

        # Check mobile chapters count
        mob_chapters = mob_page.locator("#mobileNavTree .nav-chapter-item").all()
        assert len(mob_chapters) == 30, f"Expected 30 chapters in mobile nav tree, got {len(mob_chapters)}"
        print("PASS: Mobile drawer study progress widget and strictly 30 chapters verified!")

        mob_page.close()

        print("\n=== STEP 3: Zero Horizontal Overflow Across Breakpoints ===")
        breakpoints = [320, 360, 390, 430, 768, 1024, 1440, 1920]
        for bp in breakpoints:
            test_page = browser.new_page(viewport={"width": bp, "height": 800})
            test_page.goto(course_url)
            test_page.wait_for_load_state("networkidle")

            overflow = test_page.evaluate("""() => {
                const docEl = document.documentElement;
                const body = document.body;
                const clientW = docEl.clientWidth;
                const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
                return { clientW, scrollW, hasOverflow: scrollW > clientW };
            }""")
            assert not overflow["hasOverflow"], f"Horizontal overflow at {bp}px! scrollW={overflow['scrollW']}, clientW={overflow['clientW']}"
            print(f"PASS: {bp}px zero horizontal overflow (scrollW={overflow['scrollW']}, clientW={overflow['clientW']})")
            test_page.close()

        browser.close()
        print("\n=======================================================")
        print("ALL STUDY ENHANCEMENTS TESTS PASSED WITH 100% SUCCESS!")
        print("=======================================================")

if __name__ == "__main__":
    test_study_enhancements()
