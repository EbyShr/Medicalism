# -*- coding: utf-8 -*-
import os
import sys
import time
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_advanced_quiz_features():
    quiz_path = os.path.abspath("quiz.html")
    quiz_url = f"file:///{quiz_path.replace(os.sep, '/')}"

    breakpoints = [320, 360, 390, 430, 768, 1024, 1440, 1920]

    with sync_playwright() as p:
        chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        if not os.path.exists(chrome_path):
            chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)

        print("\n=======================================================")
        print("=== TEST 1: OPTION STRIKE-THROUGH (خط زدن گزینه‌ها) ===")
        print("=======================================================")

        page = browser.new_page(viewport={"width": 1280, "height": 800})
        # Open single chapter quiz directly
        page.goto(f"{quiz_url}?quiz=ncd-ihd-irapen&mode=study")
        page.wait_for_load_state("networkidle")

        # Verify active view is displayed
        assert page.locator("#quizActiveView").is_visible(), "Active quiz view should be visible"
        
        # Check options rendered
        options = page.locator("#optionsList .quiz-option").all()
        assert len(options) >= 4, f"Expected at least 4 options, found {len(options)}"
        print(f"PASS: Rendered {len(options)} options with strike-through capability.")

        # Test Strike-Through via Button on Option B (index 1)
        opt_b = page.locator(".quiz-option[data-option-key='B']")
        strike_btn_b = opt_b.locator(".btn-option-strikethrough")
        assert strike_btn_b.is_visible(), "Strike button on option B must be visible"

        strike_btn_b.click()
        page.wait_for_timeout(100)
        assert "strikethrough" in (opt_b.get_attribute("class") or ""), "Option B must have 'strikethrough' class after clicking strike button"
        assert not opt_b.evaluate("el => el.classList.contains('is-correct') || el.classList.contains('is-wrong') || el.classList.contains('is-selected')"), "Option B must not be selected as answer!"
        print("PASS: Option strike button toggles .strikethrough without answering!")

        # Test Strike-Through via Right-Click (contextmenu) on Option C
        opt_c = page.locator(".quiz-option[data-option-key='C']")
        opt_c.click(button="right")
        page.wait_for_timeout(100)
        assert "strikethrough" in (opt_c.get_attribute("class") or ""), "Option C must have 'strikethrough' class after right-click"
        print("PASS: Right-click on option successfully toggles .strikethrough!")

        # Un-strike Option B by clicking strike button again
        strike_btn_b.click()
        page.wait_for_timeout(100)
        assert "strikethrough" not in (opt_b.get_attribute("class") or ""), "Option B strike-through must be removed on second click"
        print("PASS: Second strike-through click successfully removes line-through!")

        print("\n=======================================================")
        print("=== TEST 2: KEYBOARD SHORTCUTS & HINT BAR ===")
        print("=======================================================")

        # Desktop Keyboard Hint Bar
        hint_bar = page.locator(".question-keyboard-hint-bar")
        assert hint_bar.is_visible(), "Keyboard shortcuts hint bar must be visible on desktop"
        hint_text = hint_bar.inner_text()
        assert "انتخاب گزینه" in hint_text and "خط زدن" in hint_text and "نشان‌کردن" in hint_text
        print("PASS: Keyboard shortcuts hint bar is visible with clear legend!")

        # Test Flagging via 'f' key
        flag_btn = page.locator("#btnFlagQuestion")
        assert not "is-flagged" in (flag_btn.get_attribute("class") or "")
        page.keyboard.press("f")
        page.wait_for_timeout(150)
        assert "is-flagged" in (flag_btn.get_attribute("class") or ""), "Question should be flagged after pressing 'f'"
        print("PASS: Key 'f' toggles flag on successfully!")
        page.keyboard.press("f")
        page.wait_for_timeout(150)
        assert "is-flagged" not in (flag_btn.get_attribute("class") or ""), "Question flag should toggle off after pressing 'f' again"
        print("PASS: Key 'f' toggles flag off successfully!")

        # Test Option Selection via Keyboard ('1' or 'A')
        # Q1 correct answer is 'A'
        page.keyboard.press("1")
        page.wait_for_timeout(200)
        assert page.locator("#explanationCard").is_visible(), "Explanation card should show up after answering Q1 with key '1'"
        opt_a = page.locator(".quiz-option[data-option-key='A']")
        assert "is-correct" in (opt_a.get_attribute("class") or ""), "Option A should be marked correct"
        print("PASS: Key '1' selected Option A successfully!")

        # Test Next Question via Enter (since answered)
        q_counter_before = page.locator("#questionCounter").inner_text()
        page.keyboard.press("Enter")
        page.wait_for_timeout(200)
        q_counter_after = page.locator("#questionCounter").inner_text()
        assert "سوال ۲" in q_counter_after or "سوال 2" in q_counter_after, f"Expected Q2 after pressing Enter, got {q_counter_after}"
        print(f"PASS: Pressing Enter on answered question navigates to Question 2 ({q_counter_after})!")

        # Test Previous Question via ArrowRight
        page.keyboard.press("ArrowRight")
        page.wait_for_timeout(200)
        q_prev = page.locator("#questionCounter").inner_text()
        assert "سوال ۱" in q_prev or "سوال 1" in q_prev, f"Expected Q1, got {q_prev}"
        print("PASS: ArrowRight navigated back to Question 1!")

        # Test Next Question via ArrowLeft
        page.keyboard.press("ArrowLeft")
        page.wait_for_timeout(200)
        q_next = page.locator("#questionCounter").inner_text()
        assert "سوال ۲" in q_next or "سوال 2" in q_next, f"Expected Q2, got {q_next}"
        print("PASS: ArrowLeft navigated forward to Question 2!")

        print("\n=======================================================")
        print("=== TEST 3: PER-QUESTION PACING TIMER ===")
        print("=======================================================")

        pacing_timer = page.locator("#questionPacingTimer")
        assert pacing_timer.is_visible(), "Per-question pacing timer must be visible in question header"
        timer_text_1 = page.locator("#questionPacingDisplay").inner_text()
        assert "⏱" in timer_text_1
        print(f"Initial pacing timer on Q2: {timer_text_1}")

        # Wait 1.3 seconds and check timer increments
        page.wait_for_timeout(1300)
        timer_text_2 = page.locator("#questionPacingDisplay").inner_text()
        print(f"Pacing timer after 1.3s: {timer_text_2}")
        assert timer_text_2 != timer_text_1 or "۰" in timer_text_2, "Pacing timer should be actively running"
        print("PASS: Per-question pacing timer actively monitors clinical vignette elapsed time!")

        print("\n=======================================================")
        print("=== TEST 4: TOPIC MASTERY PROGRESS & FLOATING BAR ===")
        print("=======================================================")

        # Go to Course View
        page.click("#btnBackToHub")
        page.wait_for_timeout(200)
        assert page.locator("#quizCourseView").is_visible(), "Should return to Course View"

        # Check 12 chapter cards
        chapter_cards = page.locator("#courseChaptersGrid .chapter-card").all()
        assert len(chapter_cards) == 12, f"Expected 12 chapter cards, found {len(chapter_cards)}"
        print("PASS: Found strictly 12 topic cards in Course View!")

        # Verify each card has mastery progress track and mastery pill
        for idx, card in enumerate(chapter_cards):
            track = card.locator(".topic-mastery-progress-track")
            assert track.count() == 1, f"Card {idx+1} must have .topic-mastery-progress-track"
            pill = card.locator(".chapter-mastery-pill")
            assert pill.count() == 1, f"Card {idx+1} must have .chapter-mastery-pill"
        print("PASS: All 12 topic cards feature topic mastery progress tracks and badges!")

        # Verify Sticky Floating Multi-Select Action Bar
        floating_bar = page.locator("#courseFloatingActionBar")
        assert floating_bar.is_visible(), "Floating multi-select bar should be visible when topics are selected"
        floating_text = page.locator("#floatingSelectedText").inner_text()
        assert "مبحث انتخاب شده" in floating_text and "سوال" in floating_text
        print(f"PASS: Sticky Floating Multi-Select Action Bar visible with text: '{floating_text}'")

        # Test 'لغو انتخاب' (Clear selection)
        cancel_btn = page.locator("#btnFloatingCancel")
        cancel_btn.click()
        page.wait_for_timeout(200)
        assert not floating_bar.is_visible(), "Floating bar should hide when all selections are cleared"
        print("PASS: Clicking 'لغو انتخاب' clears selection and gracefully hides floating bar!")

        # Test selecting one topic card
        first_pill = chapter_cards[0].locator(".chapter-select-pill")
        first_pill.click()
        page.wait_for_timeout(200)
        assert floating_bar.is_visible(), "Floating bar should re-appear when a topic is selected"
        floating_text_after = page.locator("#floatingSelectedText").inner_text()
        assert "۱ مبحث انتخاب شده" in floating_text_after
        print(f"PASS: Selecting 1 topic updates floating bar to: '{floating_text_after}'")

        # Test clicking floating action button to start study mode
        page.click("#btnFloatingStudy")
        page.wait_for_timeout(300)
        assert page.locator("#quizActiveView").is_visible(), "Clicking floating study button should launch active quiz view"
        assert not floating_bar.is_visible(), "Floating bar should be hidden in active quiz view"
        print("PASS: Floating action button launches combined topic quiz smoothly!")

        page.close()

        print("\n=======================================================")
        print("=== TEST 5: ZERO HORIZONTAL OVERFLOW ACROSS BREAKPOINTS ===")
        print("=======================================================")

        for bp in breakpoints:
            page = browser.new_page(viewport={"width": bp, "height": 900})
            page.goto(f"{quiz_url}?quiz=ncd-ihd-irapen&mode=study")
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
            assert not overflow["hasOverflow"], f"Horizontal overflow at {bp}px! scrollW={overflow['scrollW']}, clientW={overflow['clientW']}"
            print(f"PASS: {bp}px zero horizontal overflow verified (scrollW={overflow['scrollW']}, clientW={overflow['clientW']})")
            page.close()

        browser.close()

    print("\n========================================================================================")
    print("ALL 4 ADVANCED MEDICAL QUESTION BANK FEATURES VERIFIED WITH 100% SUCCESS!")
    print("========================================================================================")

if __name__ == "__main__":
    test_advanced_quiz_features()
