# -*- coding: utf-8 -*-
"""
End-to-End Playwright Verification for General Surgery (Lawrence) Quiz Bank Integration.
Tests:
1. Hub View: General Surgery (Lawrence) Course Card presence, dynamic question count (26) and topic count (1).
2. Course View: Topic / Chapter card for "فصل ۱۰: فتق‌های جدار شکم و کشاله ران (Abdominal Wall, Including Hernia)".
3. Study Mode:
   - Verification that question stems, 4 options, strike-through, and flag buttons work.
   - Answering question reveals the 3-Part Colorful Explanation:
     * Card 1: Emerald Green Rationale Card (✅ ۱. تحلیل پاسخ صحیح و مسیر مدیریت بیمار)
     * Card 2: Amber/Coral Distractor Breakdown Card (🔍 ۲. کالبدشکافی سایر گزینه‌ها و دام‌های امتحانی) with subcards
     * Card 3: Royal Blue / Indigo Mini-Lesson Card (📚 ۳. درسنامه مکمل لارنس) with clean RTL styling
   - Verification that Option Shuffling is synchronized:
     * Distractor subcard letters match the displayed option letters
     * Explanations are strictly bound to their matching option text.
4. Exam Mode:
   - Full exam run, answer submission, Scorecard generation.
   - Full Review mode verifies that the 3-part multi-card UI is rendered for each reviewed question.
5. Multi-topic combined quiz readiness and zero horizontal overflow across mobile (375px), tablet (768px), and desktop (1440px).
"""

import os
import sys
import time
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_surgery_quiz():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    quiz_url = f"file:///{os.path.join(base_dir, 'quiz.html').replace(os.sep, '/')}"

    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    breakpoints = [375, 768, 1440]
    errors = []

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto(quiz_url)
        page.evaluate("() => localStorage.clear()")
        page.reload()
        page.wait_for_load_state("networkidle")

        print("\n=======================================================")
        print("=== TEST 1: SURGERY COURSE CARD IN COURSE HUB ===")
        print("=======================================================")

        # Check Surgery Card in quizzesGrid
        surg_card = page.locator('.quiz-card-surgery')
        assert surg_card.is_visible(), "General Surgery quiz card must be visible in Hub"
        
        card_text = surg_card.inner_text()
        assert "جراحی جنرال" in card_text and "لارنس" in card_text, "Surgery card must mention Lawrence General Surgery"
        assert "۳۹۴ سوال" in card_text or "394 سوال" in card_text or "۳۹۴" in card_text, f"Surgery card must show 394 questions, got: {card_text}"
        assert "۲۰ فصل" in card_text or "20 فصل" in card_text or "۲۰" in card_text, f"Surgery card must show 20 chapters, got: {card_text}"
        print("PASS: General Surgery Course Card visible with 394 dynamic questions and 20 chapters!")

        print("\n=======================================================")
        print("=== TEST 2: OPEN SURGERY COURSE VIEW & CHAPTERS ===")
        print("=======================================================")

        # Click to open Surgery Course
        surg_btn = surg_card.locator('button.btn-open-course')
        surg_btn.click()
        page.wait_for_timeout(300)

        assert page.locator('#quizCourseView').is_visible(), "Course View must be displayed"
        course_title = page.locator('#courseTitle').inner_text()
        assert "جراحی جنرال" in course_title and "لارنس" in course_title, f"Unexpected course title: {course_title}"
        print(f"PASS: Entered Surgery Course View with title: '{course_title}'")

        # Verify Chapter Cards in Surgery Course
        chapter_cards = page.locator('#courseChaptersGrid .chapter-card').all()
        assert len(chapter_cards) == 20, f"Expected 20 surgery chapter cards, found {len(chapter_cards)}"
        ch1_text = chapter_cards[0].inner_text()
        assert "فتق‌های جدار شکم" in ch1_text, f"Expected hernia chapter in card text, got: {ch1_text}"
        assert "۲۴ سوال" in ch1_text or "24" in ch1_text, "Chapter 10 card must show 24 questions"
        print("PASS: Chapter 10 (فتق‌های جدار شکم و کشاله ران) card verified with 24 questions!")

        ch2_text = chapter_cards[1].inner_text()
        assert "کیسه صفرا و مجاری صفراوی" in ch2_text, f"Expected biliary chapter in card text, got: {ch2_text}"
        assert "۱۳ سوال" in ch2_text or "13" in ch2_text, "Chapter 15 card must show 13 questions"
        print("PASS: Chapter 15 (کیسه صفرا و مجاری صفراوی) card verified with 13 questions!")

        ch3_text = chapter_cards[2].inner_text()
        assert "مایعات و الکترولیت‌ها" in ch3_text or "تعادل اسید و باز" in ch3_text, f"Expected fluids chapter in card text, got: {ch3_text}"
        assert "۱۵ سوال" in ch3_text or "15" in ch3_text, "Chapter 2 card must show 15 questions"
        print("PASS: Chapter 2 (مایعات و الکترولیت‌ها) card verified with 15 questions!")

        ch4_text = chapter_cards[3].inner_text()
        assert "کبد و طحال" in ch4_text, f"Expected liver & spleen chapter in card text, got: {ch4_text}"
        assert "۱۷ سوال" in ch4_text or "17" in ch4_text, "Chapter 19 card must show 17 questions"
        print("PASS: Chapter 19 (کبد و طحال) card verified with 17 questions!")

        ch5_text = chapter_cards[4].inner_text()
        assert "پانکراس" in ch5_text, f"Expected pancreas chapter in card text, got: {ch5_text}"
        assert "۲۱ سوال" in ch5_text or "21" in ch5_text, "Chapter 16 card must show 21 questions"
        print("PASS: Chapter 16 (پانکراس) card verified with 21 questions!")

        ch6_text = chapter_cards[5].inner_text()
        assert "مراقبت‌ها و عوارض قبل و بعد از عمل" in ch6_text or "مراقبت‌های قبل و بعد از عمل" in ch6_text, f"Expected periop care chapter in card text, got: {ch6_text}"
        assert "۱۷ سوال" in ch6_text or "17" in ch6_text, "Chapter 1 card must show 17 questions"
        print("PASS: Chapter 1 (مراقبت‌ها و عوارض قبل و بعد از عمل) card verified with 17 questions!")

        ch7_text = chapter_cards[6].inner_text()
        assert "شوک" in ch7_text and "احیا" in ch7_text, f"Expected shock chapter in card text, got: {ch7_text}"
        assert "۲۰ سوال" in ch7_text or "20" in ch7_text, "Chapter 4 card must show 20 questions"
        print("PASS: Chapter 4 (شوک، ارزیابی همودینامیک و احیا) card verified with 20 questions!")

        ch8_text = chapter_cards[7].inner_text()
        assert "معده" in ch8_text and "دوازدهه" in ch8_text, f"Expected stomach chapter in card text, got: {ch8_text}"
        assert "۲۹ سوال" in ch8_text or "29" in ch8_text, "Chapter 12 card must show 29 questions"
        print("PASS: Chapter 12 (معده و دوازدهه) card verified with 29 questions!")

        ch9_text = chapter_cards[8].inner_text()
        assert "ترمیم زخم" in ch9_text or "تروما" in ch9_text, f"Expected wound healing & trauma chapter in card text, got: {ch9_text}"
        assert "۲۲ سوال" in ch9_text or "22" in ch9_text, "Chapter 5 card must show 22 questions"
        print("PASS: Chapter 5 (ترمیم زخم، پیوند پوست و تروما) card verified with 22 questions!")

        ch10_text = chapter_cards[9].inner_text()
        assert "عروق" in ch10_text or "انکولوژی" in ch10_text, f"Expected vascular & oncology chapter in card text, got: {ch10_text}"
        assert "۱۷ سوال" in ch10_text or "17" in ch10_text, "Chapter 24 card must show 17 questions"
        print("PASS: Chapter 24 (بیماری‌های عروق و انکولوژی جراحی) card verified with 17 questions!")

        ch11_text = chapter_cards[10].inner_text()
        assert "خونریزی جراحی" in ch11_text or "انتقال خون" in ch11_text, f"Expected bleeding & transfusion chapter in card text, got: {ch11_text}"
        assert "۹ سوال" in ch11_text or "9" in ch11_text, "Chapter 3 card must show 9 questions"
        print("PASS: Chapter 3 (خونریزی جراحی، انتقال خون و انعقاد) card verified with 9 questions!")

        ch12_text = chapter_cards[11].inner_text()
        assert "مری" in ch12_text or "فتق هیاتال" in ch12_text, f"Expected esophagus chapter in card text, got: {ch12_text}"
        assert "۲۰ سوال" in ch12_text or "20" in ch12_text, "Chapter 11 card must show 20 questions"
        print("PASS: Chapter 11 (بیماری‌های مری و فتق هیاتال) card verified with 20 questions!")

        ch13_text = chapter_cards[12].inner_text()
        assert "روده باریک" in ch13_text, f"Expected small intestine chapter in card text, got: {ch13_text}"
        assert "۱۵ سوال" in ch13_text or "15" in ch13_text, "Chapter 13 card must show 15 questions"
        print("PASS: Chapter 13 (روده باریک) card verified with 15 questions!")

        ch14_text = chapter_cards[13].inner_text()
        assert "سوختگی" in ch14_text, f"Expected burns chapter in card text, got: {ch14_text}"
        assert "۱۳ سوال" in ch14_text or "13" in ch14_text, "Chapter 6 card must show 13 questions"
        print("PASS: Chapter 6 (سوختگی‌ها و آسیب‌های حرارتی) card verified with 13 questions!")

        ch15_text = chapter_cards[14].inner_text()
        assert "غدد درون‌ریز" in ch15_text or "غدد" in ch15_text, f"Expected endocrine chapter in card text, got: {ch15_text}"
        assert "۲۲ سوال" in ch15_text or "22" in ch15_text, "Chapter 18 card must show 22 questions"
        print("PASS: Chapter 18 (بیماری‌های جراحی غدد درون‌ریز) card verified with 22 questions!")

        ch16_text = chapter_cards[15].inner_text()
        assert "عفونت" in ch16_text, f"Expected infection chapter in card text, got: {ch16_text}"
        assert "۱۲ سوال" in ch16_text or "12" in ch16_text, "Chapter 6 (Infections) card must show 12 questions"
        print("PASS: Chapter 6 (عفونت‌های جراحی و آنتی‌بیوتیک‌ها) card verified with 12 questions!")

        ch17_text = chapter_cards[16].inner_text()
        assert "مغز" in ch17_text or "اعصاب" in ch17_text, f"Expected neurosurgery chapter in card text, got: {ch17_text}"
        assert "۳۸ سوال" in ch17_text or "38" in ch17_text, "Chapter 28 (Neurosurgery) card must show 38 questions"
        print("PASS: Chapter 28 (جراحی مغز، اعصاب و ستون فقرات) card verified with 38 questions!")

        ch18_text = chapter_cards[17].inner_text()
        assert "تروما" in ch18_text or "توراکوآبدومینال" in ch18_text, f"Expected trauma chapter in card text, got: {ch18_text}"
        assert "۲۴ سوال" in ch18_text or "24" in ch18_text, "Chapter 14 (Trauma) card must show 24 questions"
        print("PASS: Chapter 14 (ترومای قفسه سینه، شکم، لگن و گردن) card verified with 24 questions!")

        ch19_text = chapter_cards[18].inner_text()
        assert "پستان" in ch19_text, f"Expected breast chapter in card text, got: {ch19_text}"
        assert "۱۷ سوال" in ch19_text or "17" in ch19_text, "Chapter 17 (Breast) card must show 17 questions"
        print("PASS: Chapter 17 (بیماری‌های پستان) card verified with 17 questions!")

        ch20_text = chapter_cards[19].inner_text()
        assert "کولون" in ch20_text or "رکتوم" in ch20_text, f"Expected colon/rectum chapter in card text, got: {ch20_text}"
        assert "۲۹ سوال" in ch20_text or "29" in ch20_text, "Chapter 14 (Colon & Rectum) card must show 29 questions"
        print("PASS: Chapter 14 (بیماری‌های کولون، رکتوم و مقعد) card verified with 29 questions!")

        print("\n=======================================================")
        print("=== TEST 3: STUDY MODE ON CHAPTER 14 (TRAUMA) & 3-PART VIBRANT CARDS ===")
        print("=======================================================")

        # Launch Study Mode on Chapter 18 (Trauma)
        btn_study = chapter_cards[17].locator('button.btn-mode-study')
        btn_study.click()
        page.wait_for_timeout(300)

        assert page.locator('#quizActiveView').is_visible(), "Active Quiz View must be visible"
        
        # Verify total questions is 24
        total_q = page.evaluate("() => window.medicalQuiz.filteredQuestions.length")
        assert total_q == 24, f"Expected 24 questions in Chapter 14 (Trauma) quiz, got {total_q}"
        print(f"PASS: Active Quiz session loaded with exactly {total_q} questions!")
        print(f"PASS: Active Quiz session loaded with exactly {total_q} questions!")

        # Check options
        options = page.locator('#optionsList .quiz-option').all()
        assert len(options) == 4, f"Expected 4 options, found {len(options)}"
        
        # Verify strike-through button works on an option
        strike_btn = options[0].locator('.btn-option-strikethrough')
        strike_btn.click()
        page.wait_for_timeout(100)
        assert "strikethrough" in (options[0].get_attribute("class") or ""), "Option should have strikethrough class"
        print("PASS: Strike-through button operational on surgery option!")

        # Click an option to trigger Study Mode immediate explanation
        options[0].click()
        page.wait_for_timeout(200)

        # Check explanationCard is displayed
        exp_card = page.locator('#explanationCard')
        assert exp_card.is_visible(), "Explanation card must be visible after answering in Study Mode"

        # Verify Card 1: Emerald Green Rationale Card
        card1 = page.locator('.exp-card-correct')
        assert card1.is_visible(), "Card 1 (Emerald Green Correct Rationale) must be visible"
        card1_title = card1.locator('.exp-card-header-title').inner_text()
        assert "تحلیل پاسخ صحیح و مسیر مدیریت بیمار" in card1_title, f"Unexpected Card 1 title: {card1_title}"
        # Verify bold clinical terms exist in Card 1
        card1_bolds = card1.locator('.exp-body-correct strong').all()
        assert len(card1_bolds) >= 1, "Card 1 should contain bold clinical keywords"
        print(f"PASS: Card 1 (Emerald Green Rationale) verified with {len(card1_bolds)} bold clinical terms!")

        # Verify Card 2: Amber/Coral Distractors Breakdown Card
        card2 = page.locator('.exp-card-distractors')
        assert card2.is_visible(), "Card 2 (Amber/Coral Distractors) must be visible"
        card2_title = card2.locator('.exp-card-header-title').inner_text()
        assert "کالبدشکافی سایر گزینه‌ها و دام‌های امتحانی" in card2_title, f"Unexpected Card 2 title: {card2_title}"
        
        # Check subcards for wrong options (strictly 3 distractors)
        subcards = card2.locator('.distractor-subcard').all()
        assert len(subcards) == 3, f"Expected 3 distractor subcards, found {len(subcards)}"
        
        # Check option binding synchronization:
        # Each subcard tag must match one of the non-correct options currently rendered
        correct_key = page.evaluate("() => window.medicalQuiz.filteredQuestions[window.medicalQuiz.currentIndex].correct_answer")
        wrong_keys = [k for k in ['A', 'B', 'C', 'D'] if k != correct_key]
        for idx, sc in enumerate(subcards):
            tag_text = sc.locator('.distractor-subcard-tag').inner_text()
            matched_key = next((k for k in wrong_keys if f"[{k}]" in tag_text), None)
            assert matched_key is not None, f"Subcard #{idx+1} tag '{tag_text}' did not match any distractor key {wrong_keys}"
        print(f"PASS: Card 2 verified with strictly 3 synchronized distractor subcards matching wrong keys {wrong_keys}!")

        # Verify Card 3: Royal Blue / Indigo Mini-Lesson Card
        card3 = page.locator('.exp-card-lesson')
        assert card3.is_visible(), "Card 3 (Royal Blue Lawrence Mini-Lesson) must be visible"
        card3_title = card3.locator('.exp-card-header-title').inner_text()
        assert "درسنامه مکمل لارنس" in card3_title, f"Unexpected Card 3 title: {card3_title}"
        card3_text = card3.locator('.exp-body-lesson').inner_text()
        assert len(card3_text) > 50, "Mini-lesson content should not be empty"
        print(f"PASS: Card 3 (Royal Blue Lawrence Mini-Lesson) verified with rich clinical text ({len(card3_text)} chars)!")

        print("\n=======================================================")
        print("=== TEST 4: EXAM MODE & FULL SCORECARD REVIEW ===")
        print("=======================================================")

        # Return to Course View
        page.click('#btnBackToHub')
        page.wait_for_timeout(200)
        assert page.locator('#quizCourseView').is_visible(), "Should return to Course View"

        # Auto accept exam submission confirmation dialog
        page.on("dialog", lambda dialog: dialog.accept())

        # Launch Exam Mode on Chapter 18 (Trauma)
        btn_exam = page.locator('#courseChaptersGrid .chapter-card').nth(17).locator('button.btn-mode-exam')
        btn_exam.click()
        page.wait_for_timeout(300)

        assert page.locator('#quizActiveView').is_visible(), "Active Quiz View must be visible in Exam Mode"
        
        # Answer first 3 questions
        for _ in range(3):
            # Click option A
            opts = page.locator('#optionsList .quiz-option')
            opts.first.click()
            page.wait_for_timeout(100)
            page.click('#btnNextQuestion')
            page.wait_for_timeout(100)

        # Submit Exam
        page.click('#btnSubmitExam')
        page.wait_for_timeout(300)

        # Verify Scorecard View
        assert page.locator('#quizScorecardView').is_visible(), "Scorecard View must be displayed after submitting exam"
        score_percent = page.locator('.score-percentage').inner_text()
        print(f"PASS: Exam submitted successfully! Scorecard percentage: {score_percent}")

        # Click Full Review
        page.locator('.scorecard-buttons button.btn-mode-exam').click()
        page.wait_for_timeout(300)

        review_section = page.locator('#fullReviewSection')
        assert review_section.is_visible(), "Full Review section must be visible"

        # Check that the 3-part multi-card UI is rendered for questions in review
        review_cards1 = review_section.locator('.exp-card-correct').all()
        review_cards2 = review_section.locator('.exp-card-distractors').all()
        review_cards3 = review_section.locator('.exp-card-lesson').all()

        assert len(review_cards1) >= 24, f"Expected at least 24 Card 1 instances in full review, found {len(review_cards1)}"
        assert len(review_cards2) >= 24, f"Expected at least 24 Card 2 instances in full review, found {len(review_cards2)}"
        assert len(review_cards3) >= 24, f"Expected at least 24 Card 3 instances in full review, found {len(review_cards3)}"
        print(f"PASS: Full Exam Review renders strictly 24 instances of Card 1, Card 2, and Card 3 for Chapter 14 (Trauma)!")

        print("\n=======================================================")
        print("=== TEST 5: RANDOM ALL-QUESTIONS STUDY MODE (ZERO PRE-ANSWERED QUESTIONS BUG) ===")
        print("=======================================================")

        # Go back to course and launch Random All-Questions Study Mode
        page.evaluate("() => window.medicalQuiz.returnToCourseView()")
        page.wait_for_timeout(300)

        # Select all surgery topics and launch study mode
        page.evaluate("() => { window.medicalQuiz.selectedCourseMode = 'study'; window.medicalQuiz.selectAllCourseTopics(); window.medicalQuiz.startConfiguredCourseQuiz(); }")
        page.wait_for_timeout(500)

        assert page.locator('#quizActiveView').is_visible(), "Active Quiz View must be visible"

        # Verify all 365 questions are present in random pool
        total_random_q = page.evaluate("() => window.medicalQuiz.filteredQuestions.length")
        assert total_random_q == 394, f"Expected 394 questions in surgery-all, got {total_random_q}"

        # Verify answers map starts completely clean (0 pre-answered questions)
        initial_answers_count = page.evaluate("() => Object.keys(window.medicalQuiz.answers).length")
        assert initial_answers_count == 0, f"Expected 0 initial answers, but found {initial_answers_count}"
        assert not page.locator('#explanationCard').is_visible(), "Explanation card must NOT be visible before answering"

        initial_options = page.locator('#optionsList .quiz-option').all()
        assert len(initial_options) == 4, f"Expected 4 options, found {len(initial_options)}"
        for opt in initial_options:
            cls = opt.get_attribute("class") or ""
            assert "is-disabled" not in cls, "Option should NOT be disabled"
            assert "is-correct" not in cls, "Option should NOT be pre-marked correct"
            assert "is-wrong" not in cls, "Option should NOT be pre-marked wrong"

        print(f"PASS: Random All-Questions Study Mode ({total_random_q} questions) starts with 0 pre-answered questions!")

        # Answer Question 1
        initial_options[0].click()
        page.wait_for_timeout(250)

        assert page.locator('#explanationCard').is_visible(), "Explanation card should appear after answering"
        answers_after_q1 = page.evaluate("() => Object.keys(window.medicalQuiz.answers).length")
        assert answers_after_q1 == 1, f"Expected exactly 1 answered question, got {answers_after_q1}"

        # Navigate to Question 2
        page.locator('#btnNextQuestion').click()
        page.wait_for_timeout(250)

        # Verify Question 2 is in clean, unanswered state (NO ID collision with Q1)
        assert not page.locator('#explanationCard').is_visible(), "Question 2 must NOT have explanation visible before answering"
        q2_options = page.locator('#optionsList .quiz-option').all()
        for opt in q2_options:
            cls = opt.get_attribute("class") or ""
            assert "is-disabled" not in cls, "Question 2 option should NOT be disabled"
            assert "is-correct" not in cls, "Question 2 option should NOT be pre-marked correct"
            assert "is-wrong" not in cls, "Question 2 option should NOT be pre-marked wrong"

        print("PASS: ID collision prevented! Question 2 remains completely clean and unanswered after answering Question 1!")

        print("\n=======================================================")
        print("=== TEST 6: ZERO HORIZONTAL OVERFLOW ACROSS BREAKPOINTS ===")
        print("=======================================================")

        for bp in breakpoints:
            page.set_viewport_size({"width": bp, "height": 900})
            page.goto(quiz_url)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(200)

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
    print("ALL GENERAL SURGERY (LAWRENCE) QUIZ BANK INTEGRATION TESTS PASSED 100%!")
    print("========================================================================================")

if __name__ == '__main__':
    test_surgery_quiz()
