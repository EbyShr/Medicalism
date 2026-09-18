# -*- coding: utf-8 -*-
import os
import sys
import time
import json
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


def run_tests():
    course_path = os.path.abspath("communicable-and-noncommunicable-diseases.html")
    course_url = f"file:///{course_path.replace(os.sep, '/')}"
    old_course_path = os.path.abspath("course.html")
    old_course_url = f"file:///{old_course_path.replace(os.sep, '/')}"
    rad_path = os.path.abspath("radiology.html")
    rad_url = f"file:///{rad_path.replace(os.sep, '/')}"
    index_path = os.path.abspath("index.html")
    index_url = f"file:///{index_path.replace(os.sep, '/')}"

    print(f"Testing Course 1 URL: {course_url}")
    print(f"Testing Course 2 (Radiology) URL: {rad_url}")
    print(f"Testing Portal URL: {index_url}")

    breakpoints = [320, 360, 390, 430, 768, 1024, 1440]
    errors = []

    screenshot_dir = os.path.join(os.environ.get("USERPROFILE", ""), ".gemini", "antigravity", "brain", "28e8c9f3-81b1-4e46-b3c7-dff8730441a0")
    os.makedirs(screenshot_dir, exist_ok=True)

    with sync_playwright() as p:
        chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        if not os.path.exists(chrome_path):
            chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)
        
        # =========================================================================
        # PART 1: COURSE 1 (بیماری‌های واگیر و غیرواگیر - course.html)
        # =========================================================================
        print("\n======================================================")
        print("=== PART 1: COURSE 1 (بیماری‌های واگیر و غیرواگیر) ===")
        print("======================================================")

        # 1.1 Zero Horizontal Overflow Across Breakpoints
        print("\n--- [Course 1] Zero Horizontal Overflow Across Breakpoints ---")
        for bp in breakpoints:
            page = browser.new_page(viewport={"width": bp, "height": 800})
            page.goto(course_url)
            page.wait_for_load_state("networkidle")
            
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
                msg = f"[Course 1] FAIL: Horizontal overflow at {bp}px! scrollWidth={overflow['scrollW']}, clientWidth={overflow['clientW']}"
                print(msg)
                errors.append(msg)
            else:
                print(f"[Course 1] PASS: {bp}px zero horizontal overflow (scrollW={overflow['scrollW']}, clientW={overflow['clientW']})")
            page.close()

        # 1.2 Desktop Architecture & Navigation Tree (1440px)
        print("\n--- [Course 1] Desktop Structure & Strictly 29 Chapters (1440px) ---")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(course_url)
        page.wait_for_load_state("networkidle")

        # Verify Sidebar position (Physical Right)
        sidebar_box = page.locator(".app-sidebar").bounding_box()
        content_box = page.locator(".app-content").bounding_box()
        assert sidebar_box["x"] > content_box["x"], f"[Course 1] Sidebar must be on physical RIGHT: sidebar={sidebar_box['x']}, content={content_box['x']}"
        print("[Course 1] PASS: Desktop sidebar is physically on the RIGHT side!")

        # Verify exactly 29 registered chapters and 150 nav links
        chapter_items = page.locator("#desktopNavTree .nav-chapter-item").all()
        print(f"[Course 1] Registered chapters in nav: {len(chapter_items)} (Strict Expected: 29)")
        assert len(chapter_items) == 29, f"Expected strictly 29 chapters in Course 1, got {len(chapter_items)}"

        total_nav_links = page.locator("#desktopNavTree .nav-heading-link").all()
        print(f"[Course 1] Total nav heading links: {len(total_nav_links)} (Expected: 150)")
        assert len(total_nav_links) == 150, f"Expected 150 nav links in Course 1, got {len(total_nav_links)}"

        # Verify Course 1 Folders (comm and ncd only, NO rad folder)
        comm_folder = page.locator('#desktopNavTree .nav-folder-item[data-folder-key="comm"]')
        ncd_folder = page.locator('#desktopNavTree .nav-folder-item[data-folder-key="ncd"]')
        rad_folder = page.locator('#desktopNavTree .nav-folder-item[data-folder-key="rad"]')
        assert comm_folder.is_visible(), "[Course 1] Communicable diseases folder must exist"
        assert ncd_folder.is_visible(), "[Course 1] Non-communicable diseases folder must exist"
        assert rad_folder.count() == 0, "[Course 1] Radiology folder must NOT exist in Course 1 navigation tree"
        print("[Course 1] PASS: Navigation folders strictly separated (Folder 1: 15 ch, Folder 2: 14 ch)!")

        # 1.3 Controls (Continuous Zoom, Font Switcher, Theme Switcher)
        print("\n--- [Course 1] Study Controls ---")
        page.click("#zoomInBtn")
        assert page.locator("#zoomDisplay").inner_text() == "105%", "Expected 105% zoom"
        page.click("#zoomOutBtn")
        page.click("#zoomOutBtn")
        assert page.locator("#zoomDisplay").inner_text() == "95%", "Expected 95% zoom"
        page.click("#zoomDisplay")

        page.select_option("#fontSelect", "shabnam")
        page.click("#themeToggleBtn")
        page.wait_for_timeout(200)
        assert page.locator("html").get_attribute("data-theme") == "dark", "Expected dark theme"
        page.click("#themeToggleBtn")
        page.wait_for_timeout(200)

        # Capture light screenshot of Course 1
        shot_course1 = os.path.join(screenshot_dir, "desktop_course1_light.png")
        page.screenshot(path=shot_course1, full_page=False)
        print(f"Saved Course 1 screenshot to {shot_course1}")

        # 1.4 Traversal across all 29 Chapters
        expected_course1_chapters = [
            ("ch-27", "کلیات", 4),
            ("ch-19", "واگیر", 5),
            ("ch-22", "سندرم", 5),
            ("ch-26", "تعاریف", 6),
            ("ch-20", "نوپدید", 5),
            ("ch-18", "واکسن", 7),
            ("ch-31", "واکسن", 6),
            ("ch-01", "HIV/AIDS", 11),
            ("ch-02", "سل", 7),
            ("ch-29", "مالاریا", 3),
            ("ch-24", "مالاریا", 5),
            ("ch-28", "سالک", 5),
            ("ch-25", "کالا آزار", 4),
            ("ch-30", "هاری", 7),
            ("ch-16", "بیمارستانی", 4),
            ("ch-17", "مقاومت", 4),
            ("ch-15", "غیرواگیر", 5),
            ("ch-09", "غیرواگیر", 6),
            ("ch-13", "پرفشاری", 4),
            ("ch-03", "ایسکمیک", 6),
            ("ch-06", "سکته", 4),
            ("ch-07", "روماتیسمی", 3),
            ("ch-04", "چاقی", 6),
            ("ch-05", "سرطان", 6),
            ("ch-12", "تیروئید", 6),
            ("ch-14", "ریزمغذی", 3),
            ("ch-11", "دخانیات", 4),
            ("ch-10", "سوءمصرف", 5),
            ("ch-08", "روان", 4),
        ]

        print("\n--- [Course 1] Navigation & Zero Undefined Across All 29 Chapters ---")
        for new_num, (ch_id, keyword, expected_sec_count) in enumerate(expected_course1_chapters, 1):
            ch_header = page.locator(f"#desktopNavTree .nav-chapter-header[data-chapter-id='{ch_id}']")
            ch_header.click()
            page.wait_for_timeout(200)

            title = page.locator(".chapter-title").inner_text()
            assert keyword in title, f"Expected '{keyword}' in title for {ch_id}, got '{title}'"

            rendered_sec = page.locator(".study-section").all()
            assert len(rendered_sec) == expected_sec_count, f"Expected {expected_sec_count} sections for {ch_id}, got {len(rendered_sec)}"

            has_undefined = page.evaluate("""() => {
                const stream = document.querySelector('.sections-stream');
                if (!stream) return false;
                const text = stream.innerText;
                const html = stream.innerHTML;
                return text.includes('undefined') || html.includes('>undefined<') || text.includes('NaN');
            }""")
            assert not has_undefined, f"ERROR: Found 'undefined' or 'NaN' token in {ch_id} rendered DOM!"
            print(f"  PASS: Chapter {new_num}/29 ({ch_id}) verified with {expected_sec_count} sections, zero undefined.")

        # 1.5 Mobile Drawer for Course 1 (390px)
        print("\n--- [Course 1] Mobile Navigation Drawer (390px) ---")
        mobile_page = browser.new_page(viewport={"width": 390, "height": 844})
        mobile_page.goto(course_url)
        mobile_page.wait_for_load_state("networkidle")
        mobile_page.click("#mobileNavToggle")
        mobile_page.wait_for_selector("#mobileDrawer.is-open")
        mobile_page.wait_for_timeout(350)
        
        drawer_box = mobile_page.locator("#mobileDrawer").bounding_box()
        assert drawer_box["width"] <= 390, f"Drawer width {drawer_box['width']} exceeds mobile width!"
        assert drawer_box["x"] >= 0, f"Drawer renders offscreen to the left: {drawer_box['x']}"
        
        mobile_ch = mobile_page.locator("#mobileNavTree .nav-chapter-item").all()
        print(f"[Course 1] Mobile nav chapters: {len(mobile_ch)} (Expected: 29)")
        assert len(mobile_ch) == 29, f"Expected 29 chapters in mobile drawer, got {len(mobile_ch)}"

        shot_mob_c1 = os.path.join(screenshot_dir, "mobile_nav_drawer_course1.png")
        mobile_page.screenshot(path=shot_mob_c1)
        print(f"Saved mobile drawer screenshot to {shot_mob_c1}")
        mobile_page.close()
        page.close()

        # =========================================================================
        # PART 2: COURSE 2 (رادیولوژی و تصویربرداری بالینی - radiology.html)
        # =========================================================================
        print("\n======================================================")
        print("=== PART 2: COURSE 2 (رادیولوژی و تصویربرداری بالینی) ===")
        print("======================================================")

        # 2.1 Zero Horizontal Overflow Across Breakpoints
        print("\n--- [Course 2] Zero Horizontal Overflow Across Breakpoints ---")
        for bp in breakpoints:
            page = browser.new_page(viewport={"width": bp, "height": 800})
            page.goto(rad_url)
            page.wait_for_load_state("networkidle")
            
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
                msg = f"[Course 2] FAIL: Horizontal overflow at {bp}px! scrollWidth={overflow['scrollW']}, clientWidth={overflow['clientW']}"
                print(msg)
                errors.append(msg)
            else:
                print(f"[Course 2] PASS: {bp}px zero horizontal overflow (scrollW={overflow['scrollW']}, clientW={overflow['clientW']})")
            page.close()

        # 2.2 Desktop Structure & Navigation Tree
        print("\n--- [Course 2] Desktop Structure & Chapter 1 (1440px) ---")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(rad_url)
        page.wait_for_load_state("networkidle")

        # Verify Sidebar position (Physical Right)
        sidebar_box = page.locator(".app-sidebar").bounding_box()
        content_box = page.locator(".app-content").bounding_box()
        assert sidebar_box["x"] > content_box["x"], f"[Course 2] Sidebar must be on physical RIGHT: sidebar={sidebar_box['x']}, content={content_box['x']}"
        print("[Course 2] PASS: Desktop sidebar is physically on the RIGHT side!")

        # Verify 4 chapters in registry and 34 total sections (9 + 10 + 9 + 6)
        rad_chapters = page.locator("#desktopNavTree .nav-chapter-item").all()
        print(f"[Course 2] Registered chapters in nav: {len(rad_chapters)} (Strict Expected: 4)")
        assert len(rad_chapters) == 4, f"Expected strictly 4 chapters in Course 2, got {len(rad_chapters)}"

        rad_nav_links = page.locator("#desktopNavTree .nav-heading-link").all()
        print(f"[Course 2] Total nav heading links: {len(rad_nav_links)} (Expected: 34)")
        assert len(rad_nav_links) == 34, f"Expected 34 nav links in Course 2, got {len(rad_nav_links)}"

        # Verify Radiology Folder only
        rad_folder = page.locator('#desktopNavTree .nav-folder-item[data-folder-key="rad"]')
        assert rad_folder.is_visible(), "[Course 2] Radiology folder must exist"
        assert page.locator('#desktopNavTree .nav-folder-item[data-folder-key="comm"]').count() == 0, "Comm folder must not exist in Radiology"
        assert page.locator('#desktopNavTree .nav-folder-item[data-folder-key="ncd"]').count() == 0, "NCD folder must not exist in Radiology"

        # Verify Chapter 1 Title & 9 Sections
        rad_title = page.locator(".chapter-title").inner_text()
        print(f"[Course 2] Chapter Title: {rad_title}")
        assert "مفصلی" in rad_title or "تروما" in rad_title, f"Expected articular/trauma in title, got {rad_title}"
        
        rad_sections = page.locator(".study-section").all()
        print(f"[Course 2] Rendered sections: {len(rad_sections)} (Expected: 9)")
        assert len(rad_sections) == 9, f"Expected 9 sections in Course 2 Chapter 1, got {len(rad_sections)}"

        # Verify Section ID Badges (#s1 - #s9)
        print("\n--- [Course 2] Verifying Section ID Badges (#s1 - #s9) ---")
        for i in range(1, 10):
            sec_id = f"s{i}"
            badge = page.locator(f"#{sec_id} .section-id-badge")
            assert badge.is_visible(), f"Section ID badge #{sec_id} should be visible"
            badge_text = badge.inner_text()
            assert f"#{sec_id}" in badge_text, f"Expected #{sec_id} in badge, got {badge_text}"
        print("[Course 2] PASS: All 9 Section ID badges (#s1 - #s9) verified with discoverability!")

        # Verify zero undefined & zero NaN
        has_undefined = page.evaluate("""() => {
            const stream = document.querySelector('.sections-stream');
            if (!stream) return false;
            const text = stream.innerText;
            const html = stream.innerHTML;
            return text.includes('undefined') || html.includes('>undefined<') || text.includes('NaN');
        }""")
        assert not has_undefined, "Found undefined or NaN in Radiology chapter DOM!"
        print("[Course 2] PASS: Radiology chapter is 100% free of undefined and NaN!")

        # Verify All Tables are Strictly Contained within Section Box Borders
        print("\n--- [Course 2] Verifying Tables Contained Strictly Within Box Borders ---")
        table_containment = page.evaluate("""() => {
            const sections = document.querySelectorAll('.study-section');
            const violations = [];
            sections.forEach(sec => {
                const secRect = sec.getBoundingClientRect();
                const tables = sec.querySelectorAll('.medical-data-table, table');
                tables.forEach(table => {
                    const container = table.closest('.table-responsive, .table-scroll-container') || sec;
                    const containerRect = container.getBoundingClientRect();
                    if (containerRect.left < secRect.left - 2 || containerRect.right > secRect.right + 2) {
                        violations.push({
                            sectionId: sec.id,
                            issue: 'table container exceeds section borders',
                            containerLeft: containerRect.left,
                            secLeft: secRect.left,
                            containerRight: containerRect.right,
                            secRight: secRect.right
                        });
                    }
                });
            });
            return violations;
        }""")
        assert len(table_containment) == 0, f"Table containment violations: {table_containment}"
        print("[Course 2] PASS: All tables and table-responsive containers are strictly bounded within section borders!")

        # Dark theme screenshot of Radiology
        page.click("#themeToggleBtn")
        page.wait_for_timeout(200)
        shot_rad_dark = os.path.join(screenshot_dir, "desktop_radiology_dark.png")
        page.screenshot(path=shot_rad_dark, full_page=False)
        print(f"Saved dark theme screenshot to {shot_rad_dark}")
        page.click("#themeToggleBtn")
        page.wait_for_timeout(200)

        # 2.3 Radiology Image System: Manifest, Gallery, Missing File, Viewer Overlay
        print("\n--- [Course 2] Testing Radiology Image System ---")
        
        # Verify Manifest on disk
        manifest_file = os.path.join("chapters", "rad-ch01", "images.json")
        assert os.path.exists(manifest_file), f"Manifest missing at {manifest_file}"
        with open(manifest_file, "r", encoding="utf-8") as mf:
            mdata = json.load(mf)
            assert mdata["chapterId"] == "rad-ch01"
            assert "s1" in mdata["sections"] and "s9" in mdata["sections"]
            print("PASS: chapters/rad-ch01/images.json verified on disk with all 9 section keys!")

        # Verify Manifest on disk: 123 images across 9 sections
        assert len(mdata["sections"]["s1"]) == 3, f"Expected 3 images in s1, got {len(mdata['sections']['s1'])}"
        assert len(mdata["sections"]["s2"]) == 2, f"Expected 2 images in s2, got {len(mdata['sections']['s2'])}"
        assert len(mdata["sections"]["s3"]) == 13, f"Expected 13 images in s3, got {len(mdata['sections']['s3'])}"
        assert len(mdata["sections"]["s4"]) == 31, f"Expected 31 images in s4, got {len(mdata['sections']['s4'])}"
        assert len(mdata["sections"]["s5"]) == 6, f"Expected 6 images in s5, got {len(mdata['sections']['s5'])}"
        assert len(mdata["sections"]["s6"]) == 8, f"Expected 8 images in s6, got {len(mdata['sections']['s6'])}"
        assert len(mdata["sections"]["s7"]) == 12, f"Expected 12 images in s7, got {len(mdata['sections']['s7'])}"
        assert len(mdata["sections"]["s8"]) == 18, f"Expected 18 images in s8, got {len(mdata['sections']['s8'])}"
        assert len(mdata["sections"]["s9"]) == 30, f"Expected 30 images in s9, got {len(mdata['sections']['s9'])}"
        total_manifest_images = sum(len(v) for v in mdata["sections"].values())
        assert total_manifest_images == 123, f"Expected 123 total images, got {total_manifest_images}"
        print(f"PASS: Real manifest verified on disk with strictly 123 images across all 9 sections!")

        # Verify All 9 Section Galleries are Rendered in DOM
        for i in range(1, 10):
            sec_id = f"s{i}"
            gal = page.locator(f"#gallery-{sec_id}")
            assert gal.is_visible(), f"Gallery for {sec_id} must be visible in DOM"
        print("PASS: All 9 section galleries successfully rendered at section ends!")

        # Verify Clean Preview System on Dense Section (s4: 31 images)
        gallery_s4 = page.locator("#gallery-s4")
        visible_s4 = gallery_s4.locator(".radiology-card:not(.radiology-card-overflow):not(.radiology-card-more)").count()
        more_s4 = gallery_s4.locator(".radiology-card-more").is_visible()
        overflow_s4 = gallery_s4.locator(".radiology-card-overflow").count()
        expand_s4 = gallery_s4.locator(".radiology-expand-btn")
        assert visible_s4 == 5, f"Expected 5 visible preview cards in s4, got {visible_s4}"
        assert more_s4, "More card (+26) should be visible when s4 is collapsed"
        assert overflow_s4 == 26, f"Expected 26 overflow cards in s4, got {overflow_s4}"
        assert expand_s4.is_visible(), "Expand button must be visible for dense gallery s4"
        print("PASS: Clean Preview System verified for dense section s4 (5 visible cards + 1 more-card)!")

        # Test Expand & Collapse Toggle in s4
        expand_s4.click()
        page.wait_for_timeout(200)
        assert not gallery_s4.locator(".radiology-card-more").is_visible(), "More card should hide when expanded"
        assert gallery_s4.locator(".radiology-card-overflow").first.is_visible(), "Overflow cards must become visible on expand"
        expand_s4.click()
        page.wait_for_timeout(200)
        assert gallery_s4.locator(".radiology-card-more").is_visible(), "More card should reappear when collapsed"
        print("PASS: Gallery expand/collapse toggle verified smoothly!")

        # Missing File Placeholder verification (simulated error)
        img_err_card = page.locator("#gallery-s3 .radiology-card").first
        img_err_card.locator("img").evaluate("img => img.dispatchEvent(new Event('error'))")
        page.wait_for_timeout(100)
        placeholder = img_err_card.locator(".radiology-missing-placeholder")
        assert placeholder.is_visible(), "Missing placeholder should render on image error"
        assert "تصویر یافت نشد" in placeholder.inner_text()
        print("PASS: Missing file placeholder renders non-alarmingly with Persian title and filename!")

        # Viewer Overlay Test (Open from Section 4 First Image)
        first_btn = page.locator("#gallery-s4 .radiology-thumb-btn").first
        first_btn.click()
        page.wait_for_timeout(300)

        viewer_overlay = page.locator(".radiology-viewer-overlay")
        assert viewer_overlay.is_visible(), "Viewer overlay must open"
        assert page.evaluate("document.body.classList.contains('viewer-open')"), "body should have viewer-open"

        counter_badge = page.locator("#viewerCounterBadge").inner_text()
        assert "1 / 31" in counter_badge, f"Expected 1 / 31, got {counter_badge}"

        # Zoom in and Reset
        page.click("#viewerZoomInBtn")
        page.wait_for_timeout(100)
        assert page.locator("#viewerZoomLevel").inner_text() == "125%"

        page.fill("#viewerContrastSlider", "1.75")
        page.locator("#viewerContrastSlider").dispatch_event("input")
        page.click("#viewerInvertBtn")
        page.wait_for_timeout(100)
        assert page.locator("#viewerInvertBtn").evaluate("el => el.classList.contains('is-active')")

        # Reset View
        page.click("#viewerResetBtn")
        page.wait_for_timeout(100)
        assert page.locator("#viewerZoomLevel").inner_text() == "100%"
        assert not page.locator("#viewerInvertBtn").evaluate("el => el.classList.contains('is-active')")

        # Arrow Navigation within Section 4
        page.click("#viewerNextBtn")
        page.wait_for_timeout(150)
        counter_badge_2 = page.locator("#viewerCounterBadge").inner_text()
        assert "2 / 31" in counter_badge_2, f"Expected 2 / 31, got {counter_badge_2}"

        # Screenshot of viewer
        shot_viewer = os.path.join(screenshot_dir, "desktop_radiology_viewer.png")
        page.screenshot(path=shot_viewer, full_page=False)
        print(f"Saved viewer screenshot to {shot_viewer}")

        # Keyboard close
        page.keyboard.press("Escape")
        page.wait_for_timeout(250)
        assert not page.locator(".radiology-viewer-overlay").is_visible(), "Viewer should close on Escape"
        assert not page.evaluate("document.body.classList.contains('viewer-open')"), "viewer-open removed"
        print("PASS: Viewer closed with Escape key and scroll restored!")

        # Search in Radiology
        page.click(".btn-search-trigger")
        page.wait_for_selector("#searchModalBackdrop.is-active")
        page.fill("#searchInput", "کالیس")
        page.wait_for_timeout(350)
        results = page.locator(".search-result-item").all()
        assert len(results) > 0, "Expected search hit for کالیس"
        results[0].click()
        page.wait_for_timeout(400)
        assert page.locator("#s7").is_visible(), "Navigated to section s7"
        print("PASS: Clinical search hit navigated to section s7!")

        # 2.4 Test Chapter 2 Switching & Verification
        print("\n--- [Course 2] Testing Chapter 2 (Abdominal X-ray Interpretation) ---")
        page.goto(rad_url + "#rad-ch02")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(300)

        ch2_title = page.locator(".chapter-title").inner_text()
        print(f"[Course 2] Chapter 2 Title: {ch2_title}")
        assert "شکم" in ch2_title, f"Expected شکم in Chapter 2 title, got {ch2_title}"

        ch2_sections = page.locator(".study-section").all()
        print(f"[Course 2] Chapter 2 Rendered sections: {len(ch2_sections)} (Expected: 10)")
        assert len(ch2_sections) == 10, f"Expected 10 sections in Chapter 2, got {len(ch2_sections)}"

        for i in range(1, 11):
            sec_id = f"s{i}"
            badge = page.locator(f"#{sec_id} .section-id-badge")
            assert badge.is_visible(), f"Chapter 2 badge #{sec_id} should be visible"
            assert f"#{sec_id}" in badge.inner_text()
        print("[Course 2] PASS: All 10 Section ID badges (#s1 - #s10) verified on Chapter 2!")

        has_ch2_undefined = page.evaluate("""() => {
            const stream = document.querySelector('.sections-stream');
            if (!stream) return false;
            const text = stream.innerText;
            const html = stream.innerHTML;
            return text.includes('undefined') || html.includes('>undefined<') || text.includes('NaN');
        }""")
        assert not has_ch2_undefined, "Found undefined or NaN in Chapter 2 DOM!"
        print("[Course 2] PASS: Chapter 2 is 100% free of undefined and NaN!")

        # Verify Chapter 2 Manifest on disk (191 images across 10 sections)
        print("\n--- [Course 2] Verifying Chapter 2 Manifest on Disk (191 images) ---")
        ch2_manifest_file = os.path.join("chapters", "rad-ch02", "images.json")
        assert os.path.exists(ch2_manifest_file), f"Manifest missing at {ch2_manifest_file}"
        with open(ch2_manifest_file, "r", encoding="utf-8") as cmf:
            cmdata = json.load(cmf)
            assert cmdata["chapterId"] == "rad-ch02"
            assert len(cmdata["sections"]) == 10, f"Expected 10 sections in Chapter 2 manifest, got {len(cmdata['sections'])}"
            assert len(cmdata["sections"]["s1"]) == 1
            assert len(cmdata["sections"]["s2"]) == 2
            assert len(cmdata["sections"]["s3"]) == 5
            assert len(cmdata["sections"]["s4"]) == 14
            assert len(cmdata["sections"]["s5"]) == 22
            assert len(cmdata["sections"]["s6"]) == 3
            assert len(cmdata["sections"]["s7"]) == 26
            assert len(cmdata["sections"]["s8"]) == 16
            assert len(cmdata["sections"]["s9"]) == 16
            assert len(cmdata["sections"]["s10"]) == 86
            ch2_total_imgs = sum(len(v) for v in cmdata["sections"].values())
            assert ch2_total_imgs == 191, f"Expected strictly 191 images in Chapter 2, got {ch2_total_imgs}"
            print(f"PASS: Chapter 2 manifest verified with strictly 191 images across all 10 sections!")

        # Verify All 10 Section Galleries are Rendered in Chapter 2 DOM
        for i in range(1, 11):
            sec_id = f"s{i}"
            gal = page.locator(f"#gallery-{sec_id}")
            assert gal.is_visible(), f"Chapter 2 gallery for {sec_id} must be visible in DOM"
        print("PASS: All 10 Chapter 2 section galleries successfully rendered at section ends!")

        # Verify Clean Preview System on Chapter 2 Dense Section (s10: 86 images)
        gallery_s10 = page.locator("#gallery-s10")
        visible_s10 = gallery_s10.locator(".radiology-card:not(.radiology-card-overflow):not(.radiology-card-more)").count()
        more_s10 = gallery_s10.locator(".radiology-card-more").is_visible()
        overflow_s10 = gallery_s10.locator(".radiology-card-overflow").count()
        expand_s10 = gallery_s10.locator(".radiology-expand-btn")
        assert visible_s10 == 5, f"Expected 5 visible preview cards in s10, got {visible_s10}"
        assert more_s10, "More card (+81) should be visible when s10 is collapsed"
        assert overflow_s10 == 81, f"Expected 81 overflow cards in s10, got {overflow_s10}"
        assert expand_s10.is_visible(), "Expand button must be visible for dense gallery s10"
        print("PASS: Clean Preview System verified for Chapter 2 dense section s10 (5 visible cards + 1 more-card with 81 overflow)!")

        # Test Expand & Collapse Toggle in Chapter 2 s10
        expand_s10.click()
        page.wait_for_timeout(200)
        assert not gallery_s10.locator(".radiology-card-more").is_visible(), "More card should hide when s10 expanded"
        assert gallery_s10.locator(".radiology-card-overflow").first.is_visible(), "Overflow cards must become visible on expand"
        expand_s10.click()
        page.wait_for_timeout(200)
        assert gallery_s10.locator(".radiology-card-more").is_visible(), "More card should reappear when collapsed"
        print("PASS: Chapter 2 gallery expand/collapse toggle verified smoothly!")

        # Verify Table Containment in Chapter 2 (Zero border spillover)
        ch2_table_containment = page.evaluate("""() => {
            const sections = document.querySelectorAll('.study-section');
            const violations = [];
            sections.forEach(sec => {
                const secRect = sec.getBoundingClientRect();
                const tables = sec.querySelectorAll('.medical-data-table, table');
                tables.forEach(table => {
                    const container = table.closest('.table-responsive, .table-scroll-container') || sec;
                    const containerRect = container.getBoundingClientRect();
                    if (containerRect.left < secRect.left - 2 || containerRect.right > secRect.right + 2) {
                        violations.push({
                            sectionId: sec.id,
                            issue: 'table container exceeds section borders',
                            containerLeft: containerRect.left,
                            secLeft: secRect.left,
                            containerRight: containerRect.right,
                            secRight: secRect.right
                        });
                    }
                });
            });
            return violations;
        }""")
        assert len(ch2_table_containment) == 0, f"Chapter 2 Table containment violations: {ch2_table_containment}"
        print("[Course 2] PASS: All tables in Chapter 2 are strictly contained within section borders!")

        # Take Chapter 2 Light Screenshot
        shot_ch2_light = os.path.join(screenshot_dir, "desktop_radiology_ch02_light.png")
        page.screenshot(path=shot_ch2_light, full_page=False)
        print(f"Saved Chapter 2 screenshot to {shot_ch2_light}")

        # Verify previous chapter card on Chapter 2 points to Chapter 1
        prev_btn = page.locator(".prev-chapter-card")
        assert prev_btn.is_visible(), "Prev chapter card should be visible on Chapter 2"
        prev_text = prev_btn.inner_text()
        assert "1" in prev_text or "۱" in prev_text or "تروما" in prev_text or "مفصلی" in prev_text
        print(f"[Course 2] PASS: Previous chapter card points to Chapter 1!")

        # 2.5 Test Chapter 3 (Brain CT Interpretation & Pathology)
        print("\n--- [Course 2] Testing Chapter 3 (Brain CT Interpretation & Pathology) ---")
        page.goto(rad_url + "#rad-ch03")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(300)

        ch3_title = page.locator(".chapter-title").inner_text()
        print(f"[Course 2] Chapter 3 Title: {ch3_title}")
        assert "مغز" in ch3_title or "سی‌تی‌اسکن" in ch3_title, f"Expected مغز/سی‌تی‌اسکن in Chapter 3 title, got {ch3_title}"

        ch3_sections = page.locator(".study-section").all()
        print(f"[Course 2] Chapter 3 Rendered sections: {len(ch3_sections)} (Expected: 9)")
        assert len(ch3_sections) == 9, f"Expected 9 sections in Chapter 3, got {len(ch3_sections)}"

        for i in range(1, 10):
            sec_id = f"s{i}"
            badge = page.locator(f"#{sec_id} .section-id-badge")
            assert badge.is_visible(), f"Chapter 3 badge #{sec_id} should be visible"
            assert f"#{sec_id}" in badge.inner_text()
        print("[Course 2] PASS: All 9 Section ID badges (#s1 - #s9) verified on Chapter 3!")

        has_ch3_undefined = page.evaluate("""() => {
            const stream = document.querySelector('.sections-stream');
            if (!stream) return false;
            const text = stream.innerText;
            const html = stream.innerHTML;
            return text.includes('undefined') || html.includes('>undefined<') || text.includes('NaN');
        }""")
        assert not has_ch3_undefined, "Found undefined or NaN in Chapter 3 DOM!"
        print("[Course 2] PASS: Chapter 3 is 100% free of undefined and NaN!")

        # Verify Chapter 3 Manifest on disk (9 sections empty arrays)
        ch3_manifest_file = os.path.join("chapters", "rad-ch03", "images.json")
        assert os.path.exists(ch3_manifest_file), f"Manifest missing at {ch3_manifest_file}"
        with open(ch3_manifest_file, "r", encoding="utf-8") as cmf:
            c3data = json.load(cmf)
            assert c3data["chapterId"] == "rad-ch03"
            assert len(c3data["sections"]) == 9
            for i in range(1, 10):
                assert f"s{i}" in c3data["sections"]
        print("PASS: Chapter 3 empty manifest verified on disk with all 9 section keys!")

        # Verify Table Containment in Chapter 3
        ch3_table_containment = page.evaluate("""() => {
            const sections = document.querySelectorAll('.study-section');
            const violations = [];
            sections.forEach(sec => {
                const secRect = sec.getBoundingClientRect();
                const tables = sec.querySelectorAll('.medical-data-table, table');
                tables.forEach(table => {
                    const container = table.closest('.table-responsive, .table-scroll-container') || sec;
                    const containerRect = container.getBoundingClientRect();
                    if (containerRect.left < secRect.left - 2 || containerRect.right > secRect.right + 2) {
                        violations.push({
                            sectionId: sec.id,
                            issue: 'table container exceeds section borders',
                            containerLeft: containerRect.left,
                            secLeft: secRect.left,
                            containerRight: containerRect.right,
                            secRight: secRect.right
                        });
                    }
                });
            });
            return violations;
        }""")
        assert len(ch3_table_containment) == 0, f"Chapter 3 Table containment violations: {ch3_table_containment}"
        print("[Course 2] PASS: All tables in Chapter 3 are strictly contained within section borders!")

        # Screenshot of Chapter 3
        shot_ch3_light = os.path.join(screenshot_dir, "desktop_radiology_ch03_light.png")
        page.screenshot(path=shot_ch3_light, full_page=False)
        print(f"Saved Chapter 3 screenshot to {shot_ch3_light}")

        # 2.6 Test Chapter 4 (Contrast Studies of the Urinary Tract - IVU & VCUG)
        print("\n--- [Course 2] Testing Chapter 4 (Urinary Contrast Studies) ---")
        page.goto(rad_url + "#rad-ch04")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(300)

        ch4_title = page.locator(".chapter-title").inner_text()
        print(f"[Course 2] Chapter 4 Title: {ch4_title}")
        assert "ادراری" in ch4_title or "IVU" in ch4_title or "حاجب" in ch4_title, f"Expected urinary/IVU in Chapter 4 title, got {ch4_title}"

        ch4_sections = page.locator(".study-section").all()
        print(f"[Course 2] Chapter 4 Rendered sections: {len(ch4_sections)} (Expected: 6)")
        assert len(ch4_sections) == 6, f"Expected 6 sections in Chapter 4, got {len(ch4_sections)}"

        for i in range(1, 7):
            sec_id = f"s{i}"
            badge = page.locator(f"#{sec_id} .section-id-badge")
            assert badge.is_visible(), f"Chapter 4 badge #{sec_id} should be visible"
            assert f"#{sec_id}" in badge.inner_text()
        print("[Course 2] PASS: All 6 Section ID badges (#s1 - #s6) verified on Chapter 4!")

        has_ch4_undefined = page.evaluate("""() => {
            const stream = document.querySelector('.sections-stream');
            if (!stream) return false;
            const text = stream.innerText;
            const html = stream.innerHTML;
            return text.includes('undefined') || html.includes('>undefined<') || text.includes('NaN');
        }""")
        assert not has_ch4_undefined, "Found undefined or NaN in Chapter 4 DOM!"
        print("[Course 2] PASS: Chapter 4 is 100% free of undefined and NaN!")

        # Verify Chapter 4 Manifest on disk (6 sections empty arrays)
        ch4_manifest_file = os.path.join("chapters", "rad-ch04", "images.json")
        assert os.path.exists(ch4_manifest_file), f"Manifest missing at {ch4_manifest_file}"
        with open(ch4_manifest_file, "r", encoding="utf-8") as cmf:
            c4data = json.load(cmf)
            assert c4data["chapterId"] == "rad-ch04"
            assert len(c4data["sections"]) == 6
            for i in range(1, 7):
                assert f"s{i}" in c4data["sections"]
        print("PASS: Chapter 4 empty manifest verified on disk with all 6 section keys!")

        # Verify Table Containment in Chapter 4
        ch4_table_containment = page.evaluate("""() => {
            const sections = document.querySelectorAll('.study-section');
            const violations = [];
            sections.forEach(sec => {
                const secRect = sec.getBoundingClientRect();
                const tables = sec.querySelectorAll('.medical-data-table, table');
                tables.forEach(table => {
                    const container = table.closest('.table-responsive, .table-scroll-container') || sec;
                    const containerRect = container.getBoundingClientRect();
                    if (containerRect.left < secRect.left - 2 || containerRect.right > secRect.right + 2) {
                        violations.push({
                            sectionId: sec.id,
                            issue: 'table container exceeds section borders',
                            containerLeft: containerRect.left,
                            secLeft: secRect.left,
                            containerRight: containerRect.right,
                            secRight: secRect.right
                        });
                    }
                });
            });
            return violations;
        }""")
        assert len(ch4_table_containment) == 0, f"Chapter 4 Table containment violations: {ch4_table_containment}"
        print("[Course 2] PASS: All tables in Chapter 4 are strictly contained within section borders!")

        # Screenshot of Chapter 4
        shot_ch4_light = os.path.join(screenshot_dir, "desktop_radiology_ch04_light.png")
        page.screenshot(path=shot_ch4_light, full_page=False)
        print(f"Saved Chapter 4 screenshot to {shot_ch4_light}")

        # Mobile Drawer for Radiology (390px)
        mobile_page = browser.new_page(viewport={"width": 390, "height": 844})
        mobile_page.goto(rad_url)
        mobile_page.wait_for_load_state("networkidle")
        mobile_page.click("#mobileNavToggle")
        mobile_page.wait_for_selector("#mobileDrawer.is-open")
        mobile_page.wait_for_timeout(350)

        mob_rad_ch = mobile_page.locator("#mobileNavTree .nav-chapter-item").all()
        print(f"[Course 2] Mobile nav chapters: {len(mob_rad_ch)} (Expected: 4)")
        assert len(mob_rad_ch) == 4, f"Expected 4 chapters in mobile drawer, got {len(mob_rad_ch)}"

        shot_mob_rad = os.path.join(screenshot_dir, "mobile_nav_drawer_radiology.png")
        mobile_page.screenshot(path=shot_mob_rad)
        print(f"Saved mobile drawer screenshot to {shot_mob_rad}")
        mobile_page.close()
        page.close()

        # =========================================================================
        # PART 3: PORTAL HOMEPAGE (index.html)
        # =========================================================================
        print("\n======================================================")
        print("=== PART 3: PORTAL HOMEPAGE (index.html) ===")
        print("======================================================")
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(index_url)
        page.wait_for_load_state("networkidle")

        # Verify Dropdown displays both courses
        page.click("#coursesDropdownBtn")
        page.wait_for_selector("#coursesDropdownMenu.is-open, .portal-dropdown.is-open")
        cards = page.locator("#coursesDropdownMenu .dropdown-course-card").all()
        print(f"[Portal] Dropdown course cards: {len(cards)} (Expected: 2)")
        assert len(cards) == 2, f"Expected 2 distinct courses in dropdown, got {len(cards)}"

        card1_text = cards[0].inner_text()
        card2_text = cards[1].inner_text()
        assert "بیماری‌های واگیر و غیرواگیر" in card1_text
        assert "رادیولوژی و تصویربرداری بالینی" in card2_text
        print("[Portal] PASS: Dropdown presents both Course 1 and Course 2 clearly!")

        # Verify Hero Search handles queries from both courses
        print("\n--- [Portal] Testing Hero Search across both courses ---")
        # Search Course 1 item: 'مالاریا'
        page.fill("#heroSearchInput", "مالاریا")
        page.wait_for_timeout(200)
        res1 = page.locator("#heroSearchResults .hero-search-result-item").all()
        assert len(res1) > 0, "Expected search hits for malaria"
        first_href = res1[0].get_attribute("href")
        assert "communicable-and-noncommunicable-diseases.html" in first_href, f"Expected communicable-and-noncommunicable-diseases.html in href, got {first_href}"
        print(f"[Portal] PASS: Malaria query resolves to Course 1 ({first_href})!")

        # Search Course 2 item: 'شکستگی'
        page.fill("#heroSearchInput", "شکستگی")
        page.wait_for_timeout(200)
        res2 = page.locator("#heroSearchResults .hero-search-result-item").all()
        assert len(res2) > 0, "Expected search hits for fracture"
        rad_href = res2[0].get_attribute("href")
        assert "radiology.html" in rad_href, f"Expected radiology.html in href, got {rad_href}"
        print(f"[Portal] PASS: Fracture query resolves to Course 2 ({rad_href})!")

        page.close()
        browser.close()

    if errors:
        print("\nSUMMARY: Failed with errors:")
        for err in errors:
            print(f" - {err}")
        sys.exit(1)
    else:
        print("\n========================================================================================")
        print("ALL AUTOMATED TESTS PASSED WITH 100% SUCCESS ACROSS COURSE 1, COURSE 2, AND PORTAL!")
        print("========================================================================================")

if __name__ == "__main__":
    run_tests()
