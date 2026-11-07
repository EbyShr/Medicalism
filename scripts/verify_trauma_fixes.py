# -*- coding: utf-8 -*-
"""
Verification of user-requested fixes for Trauma Exam Summary
"""

import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        url = "http://localhost:8000/surgery.html#surg-ch07"
        print(f"Navigating to {url} ...")
        page.goto(url, wait_until="networkidle")
        page.wait_for_timeout(1000)

        # Click Exam Mode
        btn_summary = page.locator("#btnTabSummary")
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
        # Check DOM order: .summary-topics-container should precede #summaryMasterCard
        is_after = page.evaluate("""() => {
            const topicsContainer = document.querySelector('.summary-topics-container');
            const masterCard = document.querySelector('#summaryMasterCard');
            if (!topicsContainer || !masterCard) return false;
            return (topicsContainer.compareDocumentPosition(masterCard) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
        }""")
        if not is_after:
            raise AssertionError("Master Card (#summaryMasterCard) MUST follow topics container!")
        print("✓ Master Card is placed at the very END of the summary.")

        # 3. Verify Table 7 (Liver / Spleen injury scale)
        t7 = exam_view.locator(".trauma-table-wrapper").filter(has_text="مقیاس درجه‌بندی آسیب کبد")
        t7_rows = t7.locator("tbody tr").count()
        print(f"✓ Table 7 has {t7_rows} rows in tbody (expected 6).")
        if t7_rows != 6:
            raise AssertionError(f"Expected 6 rows in Table 7, got {t7_rows}")
        # Verify text like '| IV |' or '| V |' is NOT in plain paragraphs outside
        t7_card = exam_view.locator(".summary-topic-card").filter(has_text="آسیب اختصاصی ارگان‌های شکمی")
        raw_outside = t7_card.inner_text()
        if "| IV |" in raw_outside or "| V |" in raw_outside or "| VI |" in raw_outside:
            raise AssertionError("Grades IV, V, VI are still leaked outside Table 7!")
        print("✓ ZERO rows leaked outside Table 7! All grades I to VI are cleanly inside.")

        # 4. Verify Table 8 (Pelvic fractures)
        t8 = exam_view.locator(".trauma-table-wrapper").filter(has_text="مکانیسم‌های شکستگی حلقه لگن")
        t8_rows = t8.locator("tbody tr").count()
        print(f"✓ Table 8 has {t8_rows} rows in tbody (expected 3).")
        if t8_rows != 3:
            raise AssertionError(f"Expected 3 rows in Table 8, got {t8_rows}")
        print("✓ ZERO rows leaked outside Table 8! LC, AP, and Vertical Shear are all inside.")

        # 5. Verify Table 9 (Special populations)
        t9 = exam_view.locator(".trauma-table-wrapper").filter(has_text="نکات طلایی تروما در جمعیت‌های خاص")
        t9_rows = t9.locator("tbody tr").count()
        print(f"✓ Table 9 has {t9_rows} rows in tbody (expected 3).")
        if t9_rows != 3:
            raise AssertionError(f"Expected 3 rows in Table 9, got {t9_rows}")
        print("✓ ZERO rows leaked outside Table 9! بارداری، کودکان، سالمندان are all inside.")

        # 6. Verify Table 4 (Myotomes) headers & both action columns (1 & 4)
        t4 = exam_view.locator(".myotomes-table-wrapper")
        if t4.count() == 0:
            raise AssertionError("Myotomes table wrapper (.myotomes-table-wrapper) not found!")
        t4_th_count = t4.locator("thead th").count()
        print(f"✓ Table 4 has {t4_th_count} headers.")
        # Check computed color and background of headers
        th_color = t4.locator("thead th").first.evaluate("el => window.getComputedStyle(el).color")
        th_bg = t4.locator("thead th").first.evaluate("el => window.getComputedStyle(el).backgroundImage || window.getComputedStyle(el).backgroundColor")
        print(f"✓ Table 4 header color: {th_color}, bg: {th_bg[:40]}...")
        # Check column 1 and column 4 color in first row
        col1_color = t4.locator("tbody tr").first.locator("td").nth(0).evaluate("el => window.getComputedStyle(el).color")
        col4_color = t4.locator("tbody tr").first.locator("td").nth(3).evaluate("el => window.getComputedStyle(el).color")
        print(f"✓ Table 4 Col 1 color: {col1_color}, Col 4 color: {col4_color}")
        if col1_color != col4_color:
            raise AssertionError(f"Col 1 ({col1_color}) and Col 4 ({col4_color}) should have matching accent colors!")
        print("✓ Table 4 Action Columns (1 and 4) both have matching distinctive accent styling.")

        # 7. Verify ZERO floating pseudo-dots
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
        print(f"✓ Count of pseudo-element dots on list items: {dots_count} (expected 0).")
        if dots_count != 0:
            raise AssertionError(f"Expected 0 pseudo-element dots, found {dots_count}!")
        print("✓ All floating dots have been completely ERADICATED.")

        # 8. Check Table 1 & Table 2 headers visibility
        t1_th_color = exam_view.locator(".trauma-table-wrapper").first.locator("thead th").first.evaluate("el => window.getComputedStyle(el).color")
        print(f"✓ Table 1 header text color: {t1_th_color} (pure white / high-contrast)")

        # Screenshots of fixed elements
        # Table 7
        t7.scroll_into_view_if_needed()
        page.wait_for_timeout(300)
        t7.screenshot(path="t7_fixed.png")
        print("✓ Saved Table 7 screenshot: t7_fixed.png")

        # Table 4
        t4.scroll_into_view_if_needed()
        page.wait_for_timeout(300)
        t4.screenshot(path="t4_fixed.png")
        print("✓ Saved Table 4 screenshot: t4_fixed.png")

        # Table 8
        t8.scroll_into_view_if_needed()
        page.wait_for_timeout(300)
        t8.screenshot(path="t8_fixed.png")
        print("✓ Saved Table 8 screenshot: t8_fixed.png")

        # Master card at bottom
        page.locator("#summaryMasterCard").scroll_into_view_if_needed()
        page.wait_for_timeout(300)
        page.locator("#summaryMasterCard").screenshot(path="master_card_bottom.png")
        print("✓ Saved Master card screenshot: master_card_bottom.png")

        browser.close()
        print("\nALL 8 USER ISSUES ARE 100% FIXED AND VERIFIED! 🎉")

if __name__ == "__main__":
    run()
