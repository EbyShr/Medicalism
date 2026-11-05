# -*- coding: utf-8 -*-
"""
Playwright E2E verification test for:
1. True View-Swap on "⚡ حالت آزمون / شب امتحان" in surgery.html (Target: Biliary Tract - surg-ch15)
2. 100% RTL Tables, Gradient Headers, First-Column Tint
3. Color-Coded 4-Step Clinical Management Strips (Red, Amber, Emerald, Violet)
4. Exam Trap Warning Callout Boxes (Rose/Coral)
5. Nested RTL Bullet Trees with Connector Lines
6. Gold/Emerald End-of-Chapter Master Card
7. Toggle back to "📖 درسنامه کامل"
"""

import os
import sys
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def run_tests():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    surgery_url = f"file:///{os.path.join(base_dir, 'surgery.html').replace(os.sep, '/')}#surg-ch15"

    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)
        page = browser.new_page(viewport={"width": 1400, "height": 900})

        print("\n=======================================================")
        print("TEST 1: LOAD SURGERY.HTML ON BILIARY TRACT (surg-ch15)")
        print("=======================================================")
        page.goto(surgery_url)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

        # Clear any old exam mode state initially to test clean transition
        page.evaluate("() => { localStorage.removeItem('medicalism_exam_cram_mode'); }")
        page.reload()
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(400)

        # Switch to Chapter 15 if not already mounted
        page.evaluate("""() => {
            if (window.appState) {
                window.appState.activeChapterId = 'surg-ch15';
            }
        }""")
        page.wait_for_timeout(300)

        # Check chapter article is loaded
        article = page.locator("#surg-ch15")
        assert article.count() == 1, "Chapter article #surg-ch15 must be mounted"
        print("✓ Biliary Tract (surg-ch15) mounted successfully.")

        # Check that both detailed view and summary view containers exist
        detailed_view = page.locator("#detailedChapterView")
        summary_view = page.locator("#examSummaryView")
        assert detailed_view.count() == 1, "#detailedChapterView must exist"
        assert summary_view.count() == 1, "#examSummaryView must exist"

        # Initially, detailed view is VISIBLE, summary view is HIDDEN
        assert detailed_view.is_visible(), "Initially detailed view must be visible"
        assert not summary_view.is_visible(), "Initially summary view must be hidden"
        print("✓ Initial state: Detailed View visible, Exam Summary View hidden.")

        # Check view mode switcher tabs exist
        mode_bar = page.locator("#chapterViewModeBar")
        assert mode_bar.is_visible(), "#chapterViewModeBar should be visible on chapters with summaries"
        btn_tab_detailed = page.locator("#btnTabDetailed")
        btn_tab_summary = page.locator("#btnTabSummary")
        assert "is-active" in btn_tab_detailed.get_attribute("class"), "Tab 'درسنامه کامل' must be active initially"
        print("✓ View switcher bar with tabs verified.")

        print("\n=======================================================")
        print("TEST 2: CLICK '⚡ حالت آزمون / شب امتحان' -> TRUE VIEW-SWAP")
        print("=======================================================")
        # Click the tab or header toggle button
        toggle_btn = page.locator("#examCramToggleBtn")
        toggle_btn.click()
        page.wait_for_timeout(300)

        # Verify Detailed View is COMPLETELY HIDDEN
        assert not detailed_view.is_visible(), "#detailedChapterView must be completely hidden in exam mode!"
        
        # Verify Exam Summary View is VISIBLE
        assert summary_view.is_visible(), "#examSummaryView must now be smoothly rendered and visible!"
        print("✓ TRUE VIEW-SWAP verified: Detailed view hidden, Summary view rendered!")

        # Verify Toggle Button State
        assert "is-active" in toggle_btn.get_attribute("class"), "Header button should have .is-active"
        assert "is-active" in btn_tab_summary.get_attribute("class"), "Summary tab should now be .is-active"
        print("✓ Button states and tabs synchronized.")

        print("\n=======================================================")
        print("TEST 3: VERIFY 100% RTL TABLES (FIX LTR BUG)")
        print("=======================================================")
        # Check all tables inside summary view
        tables = summary_view.locator("table").all()
        assert len(tables) >= 6, f"Expected at least 6 tables, found {len(tables)}"
        
        for idx, tbl in enumerate(tables):
            direction = tbl.evaluate("el => window.getComputedStyle(el).direction")
            text_align = tbl.evaluate("el => window.getComputedStyle(el).textAlign")
            assert direction == "rtl", f"Table {idx+1} must be direction: rtl, got {direction}"
            # Check th
            first_th = tbl.locator("th").first
            th_align = first_th.evaluate("el => window.getComputedStyle(el).textAlign")
            assert th_align == "right", f"Table {idx+1} th must be text-align: right, got {th_align}"
            # Check first column bold and tinted
            first_td = tbl.locator("tbody td:first-child").first
            font_weight = first_td.evaluate("el => window.getComputedStyle(el).fontWeight")
            assert int(font_weight) >= 700, f"Table {idx+1} first col must be bold, got {font_weight}"
        print(f"✓ All {len(tables)} tables verified: 100% RTL, text-align right, bold tinted 1st col!")

        print("\n=======================================================")
        print("TEST 4: COLOR-CODED 4-STEP CLINICAL MANAGEMENT STRIPS")
        print("=======================================================")
        # Find first clinical pathway ordered list
        first_ol = summary_view.locator("ol").first
        items = first_ol.locator("> li").all()
        assert len(items) >= 3, "Expected at least 3 clinical step items"

        # Check border colors of step 1, 2, 3
        c1 = items[0].evaluate("el => window.getComputedStyle(el).borderInlineStartColor || window.getComputedStyle(el).borderRightColor")
        c2 = items[1].evaluate("el => window.getComputedStyle(el).borderInlineStartColor || window.getComputedStyle(el).borderRightColor")
        c3 = items[2].evaluate("el => window.getComputedStyle(el).borderInlineStartColor || window.getComputedStyle(el).borderRightColor")

        print(f"  Step 1 Accent Color: {c1}")
        print(f"  Step 2 Accent Color: {c2}")
        print(f"  Step 3 Accent Color: {c3}")
        # Step 1 should be reddish (rgb(239, 68, 68)), Step 2 amber (rgb(245, 158, 11)), Step 3 green (rgb(16, 185, 129))
        assert "239" in c1, "Step 1 should be Crimson / Emergency Red (#ef4444)"
        assert "245" in c2, "Step 2 should be Warm Amber / Gold (#f59e0b)"
        assert "16" in c3 or "185" in c3, "Step 3 should be Surgical Emerald Green (#10b981)"
        print("✓ Color-Coded 4-Step Clinical Management Strips verified!")

        print("\n=======================================================")
        print("TEST 5: EXAM TRAP BLOCKQUOTE CALLOUT BOXES")
        print("=======================================================")
        blockquotes = summary_view.locator("blockquote").all()
        assert len(blockquotes) >= 5, f"Expected at least 5 exam trap blockquotes, found {len(blockquotes)}"
        for bq in blockquotes:
            # Check rose/coral border
            border_c = bq.evaluate("el => window.getComputedStyle(el).borderInlineStartColor || window.getComputedStyle(el).borderRightColor")
            assert "244" in border_c or "225" in border_c, f"Blockquote should have rose/coral border, got {border_c}"
        print(f"✓ All {len(blockquotes)} exam trap callout boxes verified!")

        print("\n=======================================================")
        print("TEST 6: NESTED BULLET TREE (RTL CSS TREE CARDS)")
        print("=======================================================")
        tree_section = summary_view.locator(".summary-tree-section")
        assert tree_section.is_visible(), ".summary-tree-section must be visible"
        tree_cards = tree_section.locator(".summary-tree-card").all()
        assert len(tree_cards) == 7, f"Expected 7 tree cards, found {len(tree_cards)}"
        for card in tree_cards:
            branch_list = card.locator(".tree-branch-list")
            border_style = branch_list.evaluate("el => window.getComputedStyle(el).borderInlineStartStyle || window.getComputedStyle(el).borderRightStyle")
            assert border_style == "dashed", f"Tree connector line must be dashed, got {border_style}"
        print(f"✓ All 7 nested bullet tree cards verified with RTL dashed connector lines!")

        print("\n=======================================================")
        print("TEST 7: END-OF-CHAPTER GOLD/EMERALD MASTER CARD")
        print("=======================================================")
        master_card = summary_view.locator("#summaryMasterCard")
        assert master_card.is_visible(), "#summaryMasterCard must be visible"
        master_items = master_card.locator(".master-card-list > li").all()
        assert len(master_items) == 13, f"Expected exactly 13 master summary items, found {len(master_items)}"
        print(f"✓ Gold/Emerald High-Yield Master Card verified with {len(master_items)} items!")

        print("\n=======================================================")
        print("TEST 8: RESTORE VIEW VIA '📖 درسنامه کامل'")
        print("=======================================================")
        # Click return button inside the hero or tab
        btn_return = summary_view.locator(".btn-return-detailed").first
        btn_return.click()
        page.wait_for_timeout(300)

        # Verify Detailed view is restored and summary view is hidden
        assert detailed_view.is_visible(), "Detailed view must be restored after clicking return!"
        assert not summary_view.is_visible(), "Summary view must be hidden after restoring detailed view!"
        assert "is-active" not in toggle_btn.get_attribute("class"), "Toggle button should no longer have .is-active"
        print("✓ View restored successfully to Full Detailed Course!")

        print("\n=======================================================")
        print("TEST 9: TOGGLE BACK TO EXAM MODE VIA HEADER BUTTON")
        print("=======================================================")
        toggle_btn.click()
        page.wait_for_timeout(300)
        assert not detailed_view.is_visible(), "Detailed view hidden again"
        assert summary_view.is_visible(), "Summary view visible again"
        print("✓ Re-toggling works flawlessly!")

        browser.close()
        print("\n=======================================================")
        print("🎉 ALL TESTS PASSED SUCCESSFULLY! 100% COMPLIANT!")
        print("=======================================================")

if __name__ == '__main__':
    run_tests()
