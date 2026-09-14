import os
import sys
import time
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def run_tests():
    file_path = os.path.abspath("index.html")
    file_url = f"file:///{file_path.replace(os.sep, '/')}"
    print(f"Testing URL: {file_url}")

    breakpoints = [320, 360, 390, 430, 768, 1024, 1440]
    errors = []

    with sync_playwright() as p:
        chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        if not os.path.exists(chrome_path):
            chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)
        
        # 1. Test Zero Horizontal Overflow across all breakpoints
        print("\n--- Testing Zero Horizontal Overflow Across Breakpoints ---")
        for bp in breakpoints:
            page = browser.new_page(viewport={"width": bp, "height": 800})
            page.goto(file_url)
            page.wait_for_load_state("networkidle")
            
            # Check horizontal overflow
            overflow = page.evaluate("""() => {
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
            
            if overflow["hasOverflow"]:
                msg = f"FAIL: Horizontal overflow at {bp}px! scrollWidth={overflow['scrollW']}, clientWidth={overflow['clientW']}"
                print(msg)
                errors.append(msg)
            else:
                print(f"PASS: {bp}px has zero horizontal overflow (scrollW={overflow['scrollW']}, clientW={overflow['clientW']})")
            
            page.close()

        # 2. Detailed Functional Testing on Desktop (1440px)
        print("\n--- Testing Desktop Functional Interactions & Rationally Reordered Chapters (1440px) ---")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(file_url)
        page.wait_for_load_state("networkidle")

        # Verify Chapter Registry in Navigation Tree (28 Chapters, 144 Sections total)
        chapter_items = page.locator("#desktopNavTree .nav-chapter-item").all()
        print(f"Registered chapters in nav: {len(chapter_items)} (Expected: 28)")
        assert len(chapter_items) == 28, f"Expected 28 chapters, got {len(chapter_items)}"

        total_nav_links = page.locator("#desktopNavTree .nav-heading-link").all()
        print(f"Total nav heading links: {len(total_nav_links)} (Expected: 144)")
        assert len(total_nav_links) == 144, f"Expected 144 nav links across all 28 chapters, got {len(total_nav_links)}"

        # Verify Initial Chapter (Now Chapter 1: ch-27 کلیات و تعاریف اپیدمیولوژی بیماری‌های واگیر)
        ch1_title = page.locator(".chapter-title").inner_text()
        print(f"Initial Chapter Title (Chapter 1): {ch1_title}")
        assert "کلیات" in ch1_title or "واگیر" in ch1_title, f"Expected کلیات/واگیر in title, got {ch1_title}"
        
        ch1_sections = page.locator(".study-section").all()
        print(f"Chapter 1 rendered sections: {len(ch1_sections)} (Expected: 4)")
        assert len(ch1_sections) == 4, f"Expected 4 sections in Chapter 1, got {len(ch1_sections)}"

        # Verify Right-Side Navigation items and physical position
        sidebar_box = page.locator(".app-sidebar").bounding_box()
        content_box = page.locator(".app-content").bounding_box()
        print(f"Sidebar x: {sidebar_box['x']}, Content x: {content_box['x']}")
        assert sidebar_box['x'] > content_box['x'], f"Sidebar must be on physical RIGHT: sidebar={sidebar_box['x']}, content={content_box['x']}"
        print("PASS: Desktop navigation is physically on the RIGHT side!")

        screenshot_dir = os.path.join(os.environ.get("USERPROFILE", ""), ".gemini", "antigravity", "brain", "cdd73345-6d72-425e-85da-d976b9a696b6")
        
        # Capture Initial Light Theme Screenshot (Chapter 1)
        light_shot_path = os.path.join(screenshot_dir, "desktop_light_theme.png")
        page.screenshot(path=light_shot_path, full_page=False)
        print(f"Saved light theme screenshot to {light_shot_path}")

        # Test Continuous Font Zoom (A- / A+)
        initial_zoom = page.locator("#zoomDisplay").inner_text()
        page.click("#zoomInBtn")
        zoomed_in = page.locator("#zoomDisplay").inner_text()
        assert zoomed_in == "105%", f"Expected 105%, got {zoomed_in}"

        page.click("#zoomOutBtn")
        page.click("#zoomOutBtn")
        zoomed_out = page.locator("#zoomDisplay").inner_text()
        assert zoomed_out == "95%", f"Expected 95%, got {zoomed_out}"
        
        # Reset zoom back to 100%
        page.click("#zoomDisplay")
        page.wait_for_timeout(100)

        # Test Font Switcher
        page.select_option("#fontSelect", "shabnam")

        # Test Dark Theme Switcher
        page.click("#themeToggleBtn")
        page.wait_for_timeout(350)
        theme_attr = page.locator("html").get_attribute("data-theme")
        assert theme_attr == "dark", f"Expected dark, got {theme_attr}"
        
        # Capture Dark Theme Screenshot
        dark_shot_path = os.path.join(screenshot_dir, "desktop_dark_theme.png")
        page.screenshot(path=dark_shot_path, full_page=False)
        print(f"Saved dark theme screenshot to {dark_shot_path}")

        # Revert to light theme for chapter testing
        page.click("#themeToggleBtn")
        page.wait_for_timeout(200)

        # 3. Test Navigation & Content Rendering Across All 30 Chapters in Rational Sequence
        expected_chapters = [
            ("ch-27", "کلیات", 4),        # فصل ۱
            ("ch-19", "واگیر", 5),        # فصل ۲
            ("ch-22", "سندرم", 5),        # فصل ۳
            ("ch-26", "تعاریف", 6),       # فصل ۴
            ("ch-20", "نوپدید", 5),       # فصل ۵
            ("ch-18", "واکسن", 7),        # فصل ۶
            ("ch-01", "HIV/AIDS", 11),    # فصل ۷
            ("ch-02", "سل", 7),           # فصل ۸
            ("ch-29", "مالاریا", 3),      # فصل ۹
            ("ch-24", "مالاریا", 5),      # فصل ۱۰
            ("ch-28", "سالک", 5),         # فصل ۱۱
            ("ch-25", "کالا آزار", 4),    # فصل ۱۲
            ("ch-30", "هاری", 7),         # فصل ۱۳ (بیماری‌های مشترک انسان و حیوان - هاری و بروسلوز)
            ("ch-16", "بیمارستانی", 4),   # فصل ۱۴ (ادغام‌شده: عفونت‌های بیمارستانی)
            ("ch-17", "مقاومت", 4),       # فصل ۱۵
            ("ch-15", "غیرواگیر", 5),     # فصل ۱۶
            ("ch-09", "غیرواگیر", 6),     # فصل ۱۷
            ("ch-13", "پرفشاری", 4),      # فصل ۱۸
            ("ch-03", "ایسکمیک", 6),      # فصل ۱۹
            ("ch-06", "سکته", 4),         # فصل ۲۰
            ("ch-07", "روماتیسمی", 3),    # فصل ۲۱
            ("ch-04", "چاقی", 6),         # فصل ۲۲
            ("ch-05", "سرطان", 6),        # فصل ۲۳
            ("ch-12", "تیروئید", 6),      # فصل ۲۴
            ("ch-14", "ریزمغذی", 3),      # فصل ۲۵
            ("ch-11", "دخانیات", 4),      # فصل ۲۶
            ("ch-10", "سوءمصرف", 5),      # فصل ۲۷
            ("ch-08", "روان", 4),         # فصل ۲۸
        ]

        print("\n--- Testing Navigation, Zero Undefined & Content Rendering Across All 28 Chapters ---")
        for new_num, (ch_id, keyword, expected_sec_count) in enumerate(expected_chapters, 1):
            ch_header = page.locator(f"#desktopNavTree .nav-chapter-header[data-chapter-id='{ch_id}']")
            ch_header.click()
            page.wait_for_timeout(250)

            title = page.locator(".chapter-title").inner_text()
            print(f"Switched to Chapter {new_num} ({ch_id}): Title='{title}'")
            assert keyword in title, f"Expected '{keyword}' in title for {ch_id}, got '{title}'"

            rendered_sec = page.locator(".study-section").all()
            print(f"  Sections rendered: {len(rendered_sec)} (Expected: {expected_sec_count})")
            assert len(rendered_sec) == expected_sec_count, f"Expected {expected_sec_count} sections for {ch_id}, got {len(rendered_sec)}"

            # Strict Zero Undefined & Zero NaN Check across entire chapter content
            has_undefined = page.evaluate("""() => {
                const stream = document.querySelector('.sections-stream');
                if (!stream) return false;
                const text = stream.innerText;
                const html = stream.innerHTML;
                return text.includes('undefined') || html.includes('>undefined<') || text.includes('NaN');
            }""")
            assert not has_undefined, f"ERROR: Found 'undefined' or 'NaN' token in {ch_id} rendered DOM!"
            print(f"  PASS: Chapter {new_num} ({ch_id}) is 100% free of 'undefined' and 'NaN'!")

        # Capture key showcase screenshots
        ch_shots = [
            ("ch-27", "desktop_ch01_communicable_principles.png"),
            ("ch-30", "desktop_ch13_rabies_brucellosis.png"),
            ("ch-29", "desktop_ch09_malaria_lifecycle.png"),
            ("ch-28", "desktop_ch11_cutaneous_leishmaniasis.png"),
            ("ch-15", "desktop_ch17_ncd_principles.png"),
            ("ch-08", "desktop_ch29_mental_health.png"),
        ]

        for ch_id, filename in ch_shots:
            page.locator(f"#desktopNavTree .nav-chapter-header[data-chapter-id='{ch_id}']").click()
            page.wait_for_timeout(250)
            shot_path = os.path.join(screenshot_dir, filename)
            page.screenshot(path=shot_path, full_page=False)
            print(f"Saved {ch_id} screenshot to {shot_path}")

        # Test Chapter Progression Footer (Navigate back from Chapter 28 (ch-08) to Chapter 27 (ch-10) via footer card)
        page.locator("#desktopNavTree .nav-chapter-header[data-chapter-id='ch-08']").click()
        page.wait_for_timeout(250)
        prev_card = page.locator(".chapter-nav-card.prev-chapter-card")
        assert prev_card.is_visible(), "Previous chapter card should be visible in Chapter 28"
        prev_card.click()
        page.wait_for_timeout(300)
        back_ch27_title = page.locator(".chapter-title").inner_text()
        print(f"Title after clicking prev chapter card: {back_ch27_title}")
        assert "سوءمصرف" in back_ch27_title, f"Expected return to Chapter 27 (سوءمصرف مواد), got {back_ch27_title}"

        # 4. Test Multi-Chapter Search Engine Across Chapters
        print("\n--- Testing Multi-Chapter Search Engine Across All Chapters ---")
        search_tests = [
            ("INCDC", "ch-09", "ch09-sec01"),          # NCD Roadmap
            ("هلال طلایی", "ch-10", "ch10-sec03"),      # Substance Abuse
            ("MPOWER", "ch-11", "ch11-sec04"),         # Tobacco
            ("دیس‌ژنز", "ch-12", "ch12-sec01"),         # Hypothyroidism
            ("همودینامیک", "ch-13", "ch13-sec01"),      # Hypertension
            ("گرسنگی پنهان", "ch-14", "ch14-sec01"),   # Hidden Hunger
            ("فریدن", "ch-15", "ch15-sec04"),          # Frieden Pyramid
            ("کارباپنم", "ch-17", "ch17-sec02"),        # AMR Principles
            ("کوپلیک", "ch-18", "ch18-sec01"),          # Measles
            ("روتاویروس", "ch-20", "ch20-sec01"),       # Emerging
            ("بوتولیسم", "ch-22", "ch22-sec01"),        # 16 Syndromes
            ("NNIS", "ch-16", "ch16-sec03"),           # Nosocomial NNIS (Merged Chapter)
            ("هیپنوزوئیت", "ch-24", "ch24-sec02"),      # Malaria Management
            ("دلتامترین", "ch-25", "ch25-sec04"),       # Kala-azar
            ("سرخک", "ch-26", "ch26-sec01"),          # Surveillance Definitions
            ("میاسما", "ch-27", "ch27-sec01"),          # Communicable Principles
            ("اسپوروتریکوئید", "ch-28", "ch28-sec02"),  # Cutaneous Leishmaniasis
            ("میلواکی", "ch-30", "ch30-sec04"),        # Rabies PEP & Milwaukee
            ("بروسلوز", "ch-30", "ch30-sec05"),        # Brucellosis Epidemiology
        ]

        for query, target_ch, target_sec in search_tests:
            page.click(".btn-search-trigger")
            page.wait_for_selector("#searchModalBackdrop.is-active")
            page.fill("#searchInput", query)
            page.wait_for_timeout(300) # wait for debounce
            
            search_results = page.locator(".search-result-item").all()
            print(f"Search results for '{query}': {len(search_results)}")
            assert len(search_results) > 0, f"Expected search results for '{query}'"
            
            # Click the matching target result item
            target_item = page.locator(f".search-result-item[data-target-id='{target_sec}']")
            assert target_item.is_visible(), f"Expected search result item for {target_sec} with query '{query}'"
            target_item.click()
            page.wait_for_timeout(350)
            
            # Verify modal closed
            assert not page.locator("#searchModalBackdrop").is_visible(), "Search modal should close on selection"
            
            # Verify target section is visible
            assert page.locator(f"#{target_sec}").is_visible(), f"Target section #{target_sec} should be rendered and visible"
            print(f"PASS: Search for '{query}' successfully opened {target_ch} and navigated to #{target_sec}")

        # Test Bookmarking
        first_bm_btn = page.locator(".study-section .btn-bookmark").first
        first_bm_btn.click()
        page.wait_for_timeout(200)
        bm_count = page.locator("#bookmarksCountBadge").inner_text()
        print(f"Bookmarks count badge: {bm_count}")
        assert int(bm_count) >= 1, f"Expected at least 1 bookmark, got {bm_count}"

        page.close()

        # 5. Detailed Mobile Navigation Drawer Testing (390px)
        print("\n--- Testing Mobile Navigation Drawer (390px) ---")
        mobile_page = browser.new_page(viewport={"width": 390, "height": 844})
        mobile_page.goto(file_url)
        mobile_page.wait_for_load_state("networkidle")

        # Verify mobile toggle visible, sidebar hidden
        sidebar_visible = mobile_page.locator(".app-sidebar").is_visible()
        toggle_visible = mobile_page.locator("#mobileNavToggle").is_visible()
        assert not sidebar_visible, "Sidebar must be hidden on mobile"
        assert toggle_visible, "Mobile nav toggle must be visible"

        # Open drawer
        mobile_page.click("#mobileNavToggle")
        mobile_page.wait_for_selector("#mobileDrawer.is-open")
        mobile_page.wait_for_timeout(400) # wait for 320ms slide-in transition to complete
        
        drawer_box = mobile_page.locator("#mobileDrawer").bounding_box()
        print(f"Drawer box: {drawer_box}")
        assert drawer_box["width"] <= 390, f"Drawer width {drawer_box['width']} exceeds mobile width!"
        assert drawer_box["x"] >= 0, f"Drawer renders offscreen to the left: {drawer_box['x']}"
        assert drawer_box["x"] + drawer_box["width"] <= 390.1, f"Drawer renders offscreen to the right: {drawer_box['x'] + drawer_box['width']}"
        print("PASS: Drawer is fully within mobile viewport!")

        # Verify all 28 chapters are listed in mobile drawer
        mobile_chapters = mobile_page.locator("#mobileNavTree .nav-chapter-item").all()
        print(f"Mobile nav drawer chapters: {len(mobile_chapters)} (Expected: 28)")
        assert len(mobile_chapters) == 28, f"Expected 28 chapters in mobile drawer, got {len(mobile_chapters)}"

        # Screenshot of mobile drawer
        mobile_shot_path = os.path.join(screenshot_dir, "mobile_nav_drawer.png")
        mobile_page.screenshot(path=mobile_shot_path)
        print(f"Saved mobile drawer screenshot to {mobile_shot_path}")

        # Close drawer
        mobile_page.click("#drawerCloseBtn")
        mobile_page.wait_for_timeout(350)
        drawer_open = mobile_page.locator("#mobileDrawer").evaluate("el => el.classList.contains('is-open')")
        print(f"Drawer is open after close button: {drawer_open} (Expected: False)")
        assert not drawer_open, "Drawer should be closed"

        mobile_page.close()
        browser.close()

    if errors:
        print("\nSUMMARY: Failed with errors:")
        for err in errors:
            print(f" - {err}")
        sys.exit(1)
    else:
        print("\nALL AUTOMATED TESTS PASSED WITH 100% SUCCESS ACROSS ALL 28 RATIONALLY REORDERED CHAPTERS AND 144 SECTIONS!")

if __name__ == "__main__":
    run_tests()
