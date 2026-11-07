# -*- coding: utf-8 -*-
"""
Verification of user-requested fixes for Cardiothoracic Surgery Exam Summary
"""

import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        url = "http://localhost:8000/surgery.html#surg-ch25"
        print(f"Navigating to {url} ...")
        page.goto(url, wait_until="networkidle")
        page.wait_for_timeout(1000)

        # Click Exam Mode
        btn_summary = page.locator("#btnTabSummary")
        if not btn_summary.is_visible():
            raise AssertionError("Summary toggle button #btnTabSummary not visible!")
        btn_summary.click()
        page.wait_for_timeout(600)

        exam_view = page.locator("#examSummaryView")
        if not exam_view.is_visible():
            raise AssertionError("Exam view not visible!")
        print("✓ Exam summary view is active.")

        # 1. Verify Top Quick-Jump Nav Bar is REMOVED
        pills_nav = exam_view.locator(".summary-topics-nav")
        if pills_nav.count() > 0:
            raise AssertionError("Top quick-jump nav bar should be REMOVED!")
        print("✓ Top quick-jump nav bar successfully REMOVED.")

        # 2. Verify Master Card is at the very END
        is_after = page.evaluate("""() => {
            const topicsContainer = document.querySelector('.summary-topics-container');
            const masterCard = document.querySelector('#summaryMasterCard');
            if (!topicsContainer || !masterCard) return false;
            return (topicsContainer.compareDocumentPosition(masterCard) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
        }""")
        if not is_after:
            raise AssertionError("Master Card (#summaryMasterCard) MUST follow topics container!")
        print("✓ Master Card is placed at the very END of the summary.")

        # 3. Verify Table wrappers and headers
        tbl_wrappers = exam_view.locator(".trauma-table-wrapper")
        wrapper_count = tbl_wrappers.count()
        print(f"✓ Found {wrapper_count} styled table wrappers (.trauma-table-wrapper). Expected 6.")
        if wrapper_count != 6:
            raise AssertionError(f"Expected 6 table wrappers, got {wrapper_count}")

        # Verify high-contrast headers on all tables
        for i in range(wrapper_count):
            wrapper = tbl_wrappers.nth(i)
            th = wrapper.locator("thead th").first
            th_color = th.evaluate("el => window.getComputedStyle(el).color")
            th_bg = th.evaluate("el => window.getComputedStyle(el).backgroundImage || window.getComputedStyle(el).backgroundColor")
            title = wrapper.locator(".table-card-title").inner_text()
            tbody_rows = wrapper.locator("tbody tr").count()
            print(f"  Table {i+1}: '{title}' | {tbody_rows} rows | th color: {th_color} | th bg: {th_bg[:35]}...")
            if "255, 255, 255" not in th_color and "#ffffff" not in th_color:
                raise AssertionError(f"Table {i+1} th header color should be white! Got {th_color}")

        # Expected rows:
        expected_rows = [8, 5, 4, 5, 5, 4]
        for i, exp in enumerate(expected_rows):
            actual = tbl_wrappers.nth(i).locator("tbody tr").count()
            if actual != exp:
                raise AssertionError(f"Table {i+1} expected {exp} rows, got {actual}")
        print("✓ All 6 tables have exact expected row counts in tbody!")

        # 4. Check for leaked pipes in paragraphs
        raw_pipes = page.evaluate("""() => {
            const ps = Array.from(document.querySelectorAll('#examSummaryView p'));
            return ps.filter(p => p.innerText.includes('|')).map(p => p.innerText);
        }""")
        print(f"✓ Raw pipes leaked into <p>: {len(raw_pipes)}")
        if len(raw_pipes) > 0:
            raise AssertionError(f"Found {len(raw_pipes)} leaked pipe paragraphs!")

        # 5. Check for pseudo-dots
        dots_count = page.evaluate("""() => {
            const lis = document.querySelectorAll('.summary-topic-card ul > li');
            let visibleDots = 0;
            lis.forEach(li => {
                const beforeStyle = window.getComputedStyle(li, '::before');
                if (beforeStyle.display !== 'none' && beforeStyle.content !== 'none' && beforeStyle.content !== '""') {
                    visibleDots++;
                }
            });
            return visibleDots;
        }""")
        print(f"✓ Floating pseudo-dots count: {dots_count} (expected 0).")
        if dots_count != 0:
            raise AssertionError(f"Expected 0 pseudo-dots, got {dots_count}")

        # 6. Check Topic cards count and styling
        cards = exam_view.locator(".summary-topic-card")
        cards_count = cards.count()
        print(f"✓ Found {cards_count} topic cards (expected 9).")
        if cards_count != 9:
            raise AssertionError(f"Expected 9 topic cards, got {cards_count}")

        # 7. Check Subhead banners and trap callouts
        subheads_count = exam_view.locator(".trauma-subhead-banner").count()
        traps_count = exam_view.locator(".trauma-trap-callout").count()
        print(f"✓ Found {subheads_count} subhead banners and {traps_count} trap callouts.")
        if subheads_count < 9:
            raise AssertionError(f"Expected at least 9 subhead banners, got {subheads_count}")
        if traps_count < 3:
            raise AssertionError(f"Expected at least 3 trap callouts, got {traps_count}")

        # 8. Check list items (avoiding giant wall of text)
        lis_count = exam_view.locator(".summary-topic-card ul > li").count()
        print(f"✓ Found {lis_count} list items properly separated into bullets (avoiding dense paragraph wall of text).")
        if lis_count < 50:
            raise AssertionError(f"List items too few ({lis_count}), possible smushed paragraphs!")

        # Take screenshots
        tbl_wrappers.first.scroll_into_view_if_needed()
        page.wait_for_timeout(200)
        tbl_wrappers.first.screenshot(path="cardio_t1_fixed.png")
        print("✓ Saved cardio_t1_fixed.png")

        cards.first.scroll_into_view_if_needed()
        page.wait_for_timeout(200)
        page.screenshot(path="cardio_card1_fixed.png")
        print("✓ Saved cardio_card1_fixed.png")

        page.locator("#summaryMasterCard").scroll_into_view_if_needed()
        page.wait_for_timeout(200)
        page.locator("#summaryMasterCard").screenshot(path="cardio_master_card_bottom.png")
        print("✓ Saved cardio_master_card_bottom.png")

        browser.close()
        print("\nALL CARDIOTHORACIC SURGERY FIXES VERIFIED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    run()
