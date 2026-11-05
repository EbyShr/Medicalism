# -*- coding: utf-8 -*-
"""
Verification script for Surgery Chapter 25: Cardiothoracic Surgery Exam Summary & View-Swap
"""

import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        # Capture console errors
        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))

        url = "http://localhost:8000/surgery.html#surg-ch25"
        print(f"Navigating to {url} ...")
        page.goto(url, wait_until="networkidle")
        page.wait_for_timeout(1000)

        # 1. Verify chapter loaded
        article = page.locator("article#surg-ch25")
        if not article.is_visible():
            raise AssertionError("Chapter article #surg-ch25 is NOT visible!")
        print("✓ Chapter #surg-ch25 article rendered successfully.")

        # 2. Verify View Mode bar
        view_mode_bar = page.locator("#chapterViewModeBar")
        if not view_mode_bar.is_visible():
            raise AssertionError("#chapterViewModeBar is NOT visible!")
        print("✓ View mode bar #chapterViewModeBar is visible.")

        btn_detailed = page.locator("#btnTabDetailed")
        btn_summary = page.locator("#btnTabSummary")
        if not btn_detailed.is_visible() or not btn_summary.is_visible():
            raise AssertionError("Detailed or Summary tab is NOT visible!")
        print("✓ View mode tabs are visible.")

        # 3. Check Detailed View initially
        detailed_view = page.locator("#detailedChapterView")
        exam_view = page.locator("#examSummaryView")
        print(f"Initial Detailed view visible: {detailed_view.is_visible()}")
        print(f"Initial Exam view visible: {exam_view.is_visible()}")

        # 4. Click Exam Mode Summary Tab
        print("Clicking #btnTabSummary ...")
        btn_summary.click()
        page.wait_for_timeout(600)

        if not exam_view.is_visible():
            raise AssertionError("Exam summary view should be VISIBLE after clicking #btnTabSummary!")
        if detailed_view.is_visible():
            raise AssertionError("Detailed view should be HIDDEN after clicking #btnTabSummary!")
        print("✓ View Swap to Exam Mode SUCCESSFUL: Exam view visible, Detailed view hidden.")

        # 5. Verify Exam Summary Elements
        hero_title = exam_view.locator(".summary-hero-title").inner_text()
        print(f"✓ Hero Title: {hero_title}")

        tree_cards = exam_view.locator(".summary-tree-card")
        tree_count = tree_cards.count()
        print(f"✓ Tree Cards Count: {tree_count}")
        if tree_count != 3:
            raise AssertionError(f"Expected 3 tree cards, found {tree_count}")

        master_card = exam_view.locator("#summaryMasterCard")
        if not master_card.is_visible():
            raise AssertionError("Master card #summaryMasterCard is NOT visible!")
        master_items = master_card.locator("li").count()
        print(f"✓ Master Card Items Count: {master_items}")
        if master_items < 10:
            raise AssertionError(f"Expected at least 10 master items, found {master_items}")

        topic_cards = exam_view.locator(".summary-topic-card")
        topic_count = topic_cards.count()
        print(f"✓ Topic Cards Count: {topic_count}")
        if topic_count != 9:
            raise AssertionError(f"Expected 9 topic cards, found {topic_count}")

        tables = exam_view.locator(".exam-table-responsive table")
        table_count = tables.count()
        print(f"✓ Responsive Tables Count: {table_count}")

        # 6. Verify zero <pre><code> inside tree cards
        code_blocks = exam_view.locator(".summary-tree-card pre")
        if code_blocks.count() > 0:
            raise AssertionError(f"Found {code_blocks.count()} <pre> blocks inside tree cards!")
        print("✓ Zero <pre> blocks inside tree cards verified.")

        # 7. Check for raw LaTeX in exam view
        exam_text = exam_view.inner_text()
        if "$\\leftarrow$" in exam_text or "\\text{" in exam_text or "\\propto" in exam_text:
            raise AssertionError("Raw LaTeX delimiters detected in rendered text!")
        print("✓ Zero raw LaTeX delimiters in rendered text verified.")

        # 8. Test View Swap Back to Detailed
        print("Clicking #btnTabDetailed ...")
        btn_detailed.click()
        page.wait_for_timeout(600)

        if not detailed_view.is_visible():
            raise AssertionError("Detailed view should be VISIBLE after clicking #btnTabDetailed!")
        if exam_view.is_visible():
            raise AssertionError("Exam view should be HIDDEN after clicking #btnTabDetailed!")
        print("✓ View Swap back to Detailed Mode SUCCESSFUL.")

        # 9. Test return button inside exam view
        btn_summary.click()
        page.wait_for_timeout(600)
        return_btn = exam_view.locator(".btn-return-detailed").first
        return_btn.click()
        page.wait_for_timeout(600)
        if not detailed_view.is_visible():
            raise AssertionError("Detailed view should be VISIBLE after return button click!")
        print("✓ In-card Return button SUCCESSFUL.")

        if errors:
            print(f"Encountered page errors: {errors}")
        else:
            print("✓ Zero console errors detected.")

        browser.close()
        print("\nALL VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    run()
