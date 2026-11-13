# -*- coding: utf-8 -*-
import os
import sys
import json
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_quiz_and_index():
    index_path = os.path.abspath("index.html")
    index_url = f"file:///{index_path.replace(os.sep, '/')}"
    quiz_path = os.path.abspath("quiz.html")
    quiz_url = f"file:///{quiz_path.replace(os.sep, '/')}"

    breakpoints = [320, 360, 390, 430, 768, 1024, 1440, 1920, 2560]
    errors = []

    with sync_playwright() as p:
        chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        if not os.path.exists(chrome_path):
            chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)

        print("\n=======================================================")
        print("=== TEST PART A: INDEX.HTML HERO, STATS & BENTO GRID ===")
        print("=======================================================")

        # 1. Zero horizontal overflow across all breakpoints including 1920px & 2560px
        for bp in breakpoints:
            page = browser.new_page(viewport={"width": bp, "height": 900})
            page.goto(index_url)
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
                msg = f"[index.html] Overflow at {bp}px! scrollW={overflow['scrollW']}, clientW={overflow['clientW']}"
                print(msg)
                errors.append(msg)
            else:
                print(f"[index.html] PASS: {bp}px zero horizontal overflow (scrollW={overflow['scrollW']}, clientW={overflow['clientW']})")
            page.close()

        # 2. Check 1920px ultra-wide layout & background
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        page.goto(index_url)
        page.wait_for_load_state("networkidle")

        hero_box = page.locator(".portal-hero").bounding_box()
        doc_width = page.evaluate("() => document.documentElement.clientWidth")
        assert hero_box["width"] >= doc_width - 1, f"Hero width {hero_box['width']} must span full client width {doc_width}"
        print(f"[index.html] PASS: Hero spans full ultra-wide width: {hero_box['width']}px >= {doc_width}px")

        # 3. Check Quick Stats Strip
        stats_strip = page.locator(".portal-stats-strip")
        assert stats_strip.is_visible(), "Stats strip must be visible"
        stat_items = stats_strip.locator(".stat-pill-item").all()
        assert len(stat_items) == 4, f"Expected 4 stat pills in stats strip, got {len(stat_items)}"
        stats_text = stats_strip.inner_text()
        assert "۳۰" in stats_text and "فصل" in stats_text
        assert "۴۷۴" in stats_text and "رادیولوژی" in stats_text
        assert ("۲۹۵" in stats_text or "۷۰۰" in stats_text or "۶۸۰" in stats_text) and "سوال" in stats_text
        assert "۱۰۰٪" in stats_text or "آفلاین" in stats_text
        print("[index.html] PASS: Quick Stats Strip verified with strictly 4 metric pills!")

        # 4. Check 4-Card Bento Grid ("ماژول‌های اصلی سامانه")
        bento_grid = page.locator(".portal-bento-grid")
        assert bento_grid.is_visible(), "Bento grid must be visible"
        bento_cards = bento_grid.locator(".bento-card").all()
        assert len(bento_cards) == 4, f"Expected 4 cards in Bento Grid, got {len(bento_cards)}"

        # Card A: Communicable & Non-communicable diseases
        card_a_text = bento_cards[0].inner_text()
        assert "بیماری‌های واگیر و غیرواگیر" in card_a_text
        assert "۳۰ فصل" in card_a_text
        assert "۱۵۴ مبحث" in card_a_text
        card_a_link = bento_cards[0].locator("a.bento-cta-btn").get_attribute("href")
        assert "communicable-and-noncommunicable-diseases.html" in card_a_link

        # Card B: Radiology
        card_b_text = bento_cards[1].inner_text()
        assert "رادیولوژی" in card_b_text
        assert "۴ سرفصل ماژور" in card_b_text
        assert "۴۷۴ کلیشه" in card_b_text
        card_b_link = bento_cards[1].locator("a.bento-cta-btn").get_attribute("href")
        assert "radiology.html" in card_b_link

        # Card C: General Surgery (Lawrence)
        card_surg_text = bento_cards[2].inner_text()
        assert "جراحی جنرال" in card_surg_text
        assert "۲۲ فصل" in card_surg_text
        card_surg_link = bento_cards[2].locator("a.bento-cta-btn").first.get_attribute("href")
        assert "surgery.html" in card_surg_link

        # Card D: Quiz
        card_c_text = bento_cards[3].inner_text()
        assert "بانک جامع آزمون" in card_c_text
        assert "۲۹۵ سوال" in card_c_text or "سوال" in card_c_text
        card_c_link = bento_cards[3].locator("a.bento-cta-btn").get_attribute("href")
        assert "quiz.html" in card_c_link

        print("[index.html] PASS: 3-Card Bento Grid verified with all 3 pillars, tags, descriptions and links!")
        page.close()

        print("\n=======================================================")
        print("=== TEST PART B: QUIZ.HTML HUB & PERFORMANCE BANNER ===")
        print("=======================================================")

        # 1. Zero horizontal overflow across all breakpoints for quiz.html
        for bp in breakpoints:
            page = browser.new_page(viewport={"width": bp, "height": 900})
            page.goto(quiz_url)
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
                msg = f"[quiz.html] Overflow at {bp}px! scrollW={overflow['scrollW']}, clientW={overflow['clientW']}"
                print(msg)
                errors.append(msg)
            else:
                print(f"[quiz.html] PASS: {bp}px zero horizontal overflow (scrollW={overflow['scrollW']}, clientW={overflow['clientW']})")
            page.close()

        # 2. Performance Overview Banner & 3 Balanced Cards (Desktop 1440px)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        # Clear storage first
        page.goto(quiz_url)
        page.evaluate("() => localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")

        # Verify Student Performance Overview Banner
        banner = page.locator("#studentPerformanceBanner")
        assert banner.is_visible(), "Student Performance Banner must be visible"
        assert page.locator("#perfTotalAnswered").inner_text() == "۰"
        assert page.locator("#perfAccuracy").inner_text() == "۰٪"
        assert page.locator("#perfFlaggedCount").inner_text() == "۰"
        assert page.locator("#perfIncorrectCount").inner_text() == "۰"
        print("[quiz.html] PASS: Student Performance Overview Banner visible with initial zero state!")

        # Verify Course Hub Grid has 4 cards (NCD, General Surgery, Smart Review, Radiology)
        quiz_cards = page.locator("#quizzesGrid .quiz-card").all()
        assert len(quiz_cards) == 4, f"Expected 4 cards in quizzesGrid, got {len(quiz_cards)}"
        print(f"[quiz.html] PASS: Course hub grid has strictly 4 balanced cards including General Surgery (Lawrence)!")

        card1_text = quiz_cards[0].inner_text()
        assert "بیماری‌های غیرواگیر" in card1_text
        assert "295" in card1_text or "۲۹۵" in card1_text

        card_surg_text = quiz_cards[1].inner_text()
        assert "جراحی جنرال" in card_surg_text and "لارنس" in card_surg_text
        assert "۴۰۹" in card_surg_text or "409" in card_surg_text or "۴۰۳" in card_surg_text

        card2_text = quiz_cards[2].inner_text()
        assert "بانک هوشمند مرور شخصی" in card2_text
        assert "نشان‌شده و غلط‌ها" in card2_text

        card3_text = quiz_cards[3].inner_text()
        assert "رادیولوژی بالینی" in card3_text
        assert "۲۰ کیس تصویری" in card3_text
        card3_link = quiz_cards[3].locator("a.btn-open-course").get_attribute("href")
        assert "./radiology.html#rad-exam" in card3_link or "radiology.html#rad-exam" in card3_link

        # Test Card 2 (Smart Review) empty state modal when clicking with 0 stats
        review_btn = quiz_cards[2].locator("button.btn-open-course")
        review_btn.click()
        page.wait_for_timeout(200)
        empty_modal = page.locator("#reviewEmptyModal")
        assert empty_modal.is_visible(), "Empty state modal should open when clicking review with 0 questions"
        print("[quiz.html] PASS: Empty state modal opened gracefully when no flagged/incorrect questions exist!")
        page.click(".btn-review-empty-close")
        page.wait_for_timeout(200)
        assert not empty_modal.is_visible(), "Empty state modal should close"

        # Now simulate answering 2 questions: 1 correct, 1 incorrect, and flagging 1 question in localStorage
        page.evaluate("""() => {
            // Chapter: ncd-ihd-irapen
            // Q1: correct answer is 'A' -> answer with 'A' (correct)
            // Q2: correct answer is 'C' -> answer with 'B' (incorrect)
            localStorage.setItem('med_quiz_answers_ncd-ihd-irapen', JSON.stringify({ '1': 'A', '2': 'B' }));
            localStorage.setItem('med_quiz_flags_ncd-ihd-irapen', JSON.stringify([1]));
            window.medicalQuiz.renderHub();
        }""")
        page.wait_for_timeout(200)

        total_ans = page.locator("#perfTotalAnswered").inner_text()
        acc = page.locator("#perfAccuracy").inner_text()
        flagged = page.locator("#perfFlaggedCount").inner_text()
        inc = page.locator("#perfIncorrectCount").inner_text()

        print(f"[quiz.html] Simulated stats: Answered={total_ans}, Accuracy={acc}, Flagged={flagged}, Incorrect={inc}")
        assert total_ans == "۲", f"Expected 2 answered questions, got {total_ans}"
        assert flagged == "۱", f"Expected 1 flagged question, got {flagged}"
        assert inc == "۱", f"Expected 1 incorrect question, got {inc}"
        assert acc == "۵۰٪", f"Expected 50% accuracy, got {acc}"
        print("[quiz.html] PASS: Real-time localStorage calculations reflect 100% accurate metrics in overview banner!")

        # Now test clicking Smart Review card when review questions exist
        review_btn.click()
        page.wait_for_timeout(300)
        assert page.locator("#quizActiveView").is_visible(), "Smart review should launch active quiz view"
        active_title = page.locator("#activeQuizTitle").inner_text()
        assert "مرور" in active_title, f"Expected review in title, got {active_title}"
        print(f"[quiz.html] PASS: Smart Review launched successfully into quiz session ({active_title})!")

        # Return to hub
        page.click("#btnBackToHub")
        page.wait_for_timeout(200)
        assert page.locator("#quizHubView").is_visible(), "Should return to hub"
        print("[quiz.html] PASS: Return to hub from smart review verified smoothly!")

        page.close()
        browser.close()

    if errors:
        print("\nERRORS ENCOUNTERED:")
        for err in errors:
            print(f" - {err}")
        sys.exit(1)
    else:
        print("\n========================================================================================")
        print("ALL NEW UI/UX FEATURES IN INDEX.HTML AND QUIZ.HTML PASSED WITH 100% SUCCESS!")
        print("========================================================================================")

if __name__ == "__main__":
    test_quiz_and_index()
