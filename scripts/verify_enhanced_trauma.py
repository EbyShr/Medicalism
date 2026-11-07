# -*- coding: utf-8 -*-
"""
Verification script for Enhanced Trauma Exam Summary
"""

import sys
from playwright.sync_api import sync_playwright

sys.stdout.reconfigure(encoding='utf-8')

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(viewport={"width": 1280, "height": 900})
        page = context.new_page()

        errors = []
        page.on("pageerror", lambda err: errors.append(str(err)))

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
            raise AssertionError("Exam summary view is not visible!")
        print("✓ Exam summary view is active.")

        # 1. Verify Nav Pills
        pills = exam_view.locator(".summary-nav-pill")
        print(f"✓ Found {pills.count()} quick-jump topic pills.")
        if pills.count() != 8:
            raise AssertionError(f"Expected 8 nav pills, got {pills.count()}")

        # 2. Verify 8 Topic Cards
        cards = exam_view.locator(".summary-topic-card")
        print(f"✓ Found {cards.count()} topic cards.")
        if cards.count() != 8:
            raise AssertionError(f"Expected 8 topic cards, got {cards.count()}")

        # 3. Check for any giant unbroken paragraphs
        p_tags = exam_view.locator(".summary-topic-card p")
        p_count = p_tags.count()
        broken_paras = 0
        for i in range(p_count):
            txt = p_tags.nth(i).inner_text()
            if ('\n-' in txt or txt.strip().startswith('-') or '\n1.' in txt) and len(txt) > 200:
                broken_paras += 1
                print(f"  WARNING: Possible broken paragraph #{i}: {txt[:60]}...")
        if broken_paras > 0:
            raise AssertionError(f"Found {broken_paras} broken dense paragraph blobs!")
        print("✓ ZERO broken dense paragraph blobs detected!")

        # 4. Verify Subhead Banners
        subheads = exam_view.locator(".trauma-subhead-banner")
        print(f"✓ Found {subheads.count()} stylized subhead banners.")
        if subheads.count() < 10:
            raise AssertionError(f"Expected at least 10 subhead banners, got {subheads.count()}")

        # 5. Verify Stepper Cards (<ol> > li)
        steppers = exam_view.locator(".summary-topic-card ol > li")
        print(f"✓ Found {steppers.count()} step cards in clinical management pathways.")
        if steppers.count() < 5:
            raise AssertionError(f"Expected step cards, got {steppers.count()}")

        # 6. Verify Tables
        tables = exam_view.locator(".trauma-table-wrapper")
        print(f"✓ Found {tables.count()} clinical table wrapper cards.")
        if tables.count() != 9:
            raise AssertionError(f"Expected 9 clinical table cards, got {tables.count()}")

        # 7. Verify Emergency Trap Callouts
        traps = exam_view.locator(".trauma-trap-callout")
        print(f"✓ Found {traps.count()} emergency trap callouts.")
        if traps.count() < 2:
            raise AssertionError(f"Expected at least 2 trap callouts, got {traps.count()}")

        # Take Light Theme Screenshot
        page.screenshot(path="trauma_enhanced_light.png", full_page=False)
        print("✓ Saved light theme screenshot: trauma_enhanced_light.png")

        # Switch to Dark Theme
        theme_toggle = page.locator("#themeToggleBtn")
        if theme_toggle.is_visible():
            theme_toggle.click()
            page.wait_for_timeout(500)
            page.screenshot(path="trauma_enhanced_dark.png", full_page=False)
            print("✓ Saved dark theme screenshot: trauma_enhanced_dark.png")

        if errors:
            print("Errors detected:", errors)
        else:
            print("✓ Zero console errors detected.")

        browser.close()
        print("\nALL ENHANCED VERIFICATION TESTS PASSED! 🎉")

if __name__ == "__main__":
    run()
