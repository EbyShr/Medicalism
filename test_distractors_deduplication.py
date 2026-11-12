# -*- coding: utf-8 -*-
"""
Verification script for distractor de-duplication:
Ensures ONLY the modern vibrant Card 2 (🔍 ۲. کالبدشکافی سایر گزینه‌ها و دام‌های امتحانی)
is rendered and the legacy duplicate gray box (Distractors Correction) is completely removed.
"""

import os
import sys
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def test_distractor_deduplication():
    chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not os.path.exists(chrome_path):
        chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})
        page.goto("http://localhost:8000/quiz.html")
        page.wait_for_load_state("networkidle")

        print("\n--- 1. Testing Study Mode in General Surgery ---")
        # Enter Surgery Course
        page.locator('.quiz-card-surgery button.btn-open-course').click()
        page.wait_for_timeout(300)
        
        # Start Chapter 10 in Study Mode
        page.locator('#courseChaptersGrid .chapter-card').first.locator('button.btn-mode-study').click()
        page.wait_for_timeout(300)

        # Click an option
        page.locator('#optionsList .quiz-option').first.click()
        page.wait_for_timeout(300)

        assert page.locator('#explanationCard').is_visible(), "Explanation card should be visible"
        assert page.locator('.exp-card-distractors').is_visible(), "Modern Card 2 should be visible"
        
        # Legacy box must NOT be visible
        assert not page.locator('.distractors-container').is_visible(), "Legacy distractors container must be hidden"
        
        inner_html = page.locator('#explanationCard').inner_html()
        assert "Distractors Correction" not in inner_html, "Legacy Distractors Correction text must not appear"
        assert "علت رد و نکته تستی" not in inner_html, "Legacy distractor title must not appear"
        print("PASS: General Surgery renders ONLY modern Card 2 without legacy duplicate box!")

        print("\n--- 2. Testing Study Mode in NCD Course ---")
        # Go back to course view then hub
        page.evaluate("() => window.medicalQuiz.returnToCourseView()")
        page.wait_for_timeout(200)
        page.evaluate("() => window.medicalQuiz.returnToHub()")
        page.wait_for_timeout(200)

        # Enter NCD Course
        page.locator('#quizzesGrid .quiz-card').first.locator('button.btn-open-course').click()
        page.wait_for_timeout(300)

        # Start first NCD chapter in Study Mode
        page.locator('#courseChaptersGrid .chapter-card').first.locator('button.btn-mode-study').click()
        page.wait_for_timeout(300)

        # Click an option
        page.locator('#optionsList .quiz-option').first.click()
        page.wait_for_timeout(300)

        assert page.locator('#explanationCard').is_visible(), "Explanation card should be visible"
        assert page.locator('.exp-card-distractors').is_visible(), "Modern Card 2 should be visible"
        assert not page.locator('.distractors-container').is_visible(), "Legacy distractors container must be hidden"
        
        inner_html_ncd = page.locator('#explanationCard').inner_html()
        assert "Distractors Correction" not in inner_html_ncd, "Legacy Distractors Correction text must not appear in NCD"
        assert "علت رد و نکته تستی" not in inner_html_ncd, "Legacy distractor title must not appear in NCD"
        print("PASS: NCD Course renders ONLY modern Card 2 without legacy duplicate box!")

        browser.close()
        print("\n=======================================================")
        print("ALL DISTRACTOR DEDUPLICATION TESTS PASSED 100%!")
        print("=======================================================")

if __name__ == '__main__':
    test_distractor_deduplication()
