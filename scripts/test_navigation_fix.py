import sys
from playwright.sync_api import sync_playwright

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

def test_nav():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)
        page = browser.new_page()
        messages = []
        errors = []
        page.on('console', lambda msg: messages.append(f'{msg.type}: {msg.text}'))
        page.on('pageerror', lambda err: errors.append(str(err)))
        
        page.goto('http://localhost:8000/index.html')
        page.wait_for_load_state('networkidle')
        
        print('Console messages:', messages)
        print('Page errors:', errors)
        assert len(errors) == 0, f'Unexpected page errors: {errors}'
        
        # 1. Test Dropdown
        dd_btn = page.locator('#coursesDropdownBtn')
        dd_menu = page.locator('#coursesDropdownMenu')
        assert dd_btn.is_visible(), 'Dropdown button must be visible'
        assert not dd_menu.is_visible(), 'Dropdown menu must initially be hidden'
        
        dd_btn.click()
        page.wait_for_timeout(200)
        assert dd_menu.is_visible(), 'Dropdown menu must be visible after click'
        print('PASS: Dropdown button opens menu smoothly!')
        
        # Click dropdown item for Surgery
        surg_dropdown_item = dd_menu.locator('a[href="./surgery.html"]')
        assert surg_dropdown_item.is_visible(), 'Surgery link in dropdown must be visible'
        with page.expect_navigation():
            surg_dropdown_item.click()
        assert 'surgery.html' in page.url, f'Expected navigation to surgery.html, got {page.url}'
        print('PASS: Navigated to surgery.html via navbar dropdown item!')
        
        # Go back to index
        page.goto('http://localhost:8000/index.html')
        page.wait_for_load_state('networkidle')

        # Click dropdown item for Communicable Diseases
        dd_btn = page.locator('#coursesDropdownBtn')
        dd_btn.click()
        page.wait_for_timeout(200)
        comm_dropdown_item = page.locator('#coursesDropdownMenu a[href="./communicable-and-noncommunicable-diseases.html"]')
        assert comm_dropdown_item.is_visible(), 'Communicable link in dropdown must be visible'
        with page.expect_navigation():
            comm_dropdown_item.click()
        assert 'communicable-and-noncommunicable-diseases.html' in page.url
        print('PASS: Navigated to communicable diseases via navbar dropdown item!')

        # 2. Test Bento CTA Button clicks
        page.goto('http://localhost:8000/index.html')
        page.wait_for_load_state('networkidle')
        with page.expect_navigation():
            page.locator('.bento-cta-surg').click()
        assert 'surgery.html' in page.url
        print('PASS: Navigated to surgery.html via bento-cta-surg button!')

        page.goto('http://localhost:8000/index.html')
        page.wait_for_load_state('networkidle')
        with page.expect_navigation():
            page.locator('.bento-cta-comm').click()
        assert 'communicable-and-noncommunicable-diseases.html' in page.url
        print('PASS: Navigated to communicable diseases via bento-cta-comm button!')

        # 3. Test Clicking Bento Card Surface directly (title/body)
        page.goto('http://localhost:8000/index.html')
        page.wait_for_load_state('networkidle')
        with page.expect_navigation():
            page.locator('.bento-card-surg .bento-card-title').click()
        assert 'surgery.html' in page.url
        print('PASS: Navigated to surgery.html by clicking card title!')

        page.goto('http://localhost:8000/index.html')
        page.wait_for_load_state('networkidle')
        with page.expect_navigation():
            page.locator('.bento-card-comm .bento-card-title').click()
        assert 'communicable-and-noncommunicable-diseases.html' in page.url
        print('PASS: Navigated to communicable diseases by clicking card title!')

        # 4. Test Mobile Viewport (375px)
        page.set_viewport_size({"width": 375, "height": 812})
        page.goto('http://localhost:8000/index.html')
        page.wait_for_load_state('networkidle')
        dd_btn = page.locator('#coursesDropdownBtn')
        dd_btn.click()
        page.wait_for_timeout(200)
        assert page.locator('#coursesDropdownMenu').is_visible(), 'Dropdown must open on mobile viewport'
        print('PASS: Dropdown verified functional on mobile (375px)!')

        browser.close()

    print('\nALL NAVIGATION AND BUTTON TESTS PASSED 100%!')

if __name__ == '__main__':
    test_nav()
