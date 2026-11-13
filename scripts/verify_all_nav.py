from playwright.sync_api import sync_playwright

chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=chrome_path, headless=True)
        page = browser.new_page(viewport={'width': 1280, 'height': 800})
        
        # 1. Test clicking 'ورود به درسنامه جراحی' button directly
        page.goto('http://localhost:8000/index.html')
        with page.expect_navigation():
            page.locator('.bento-cta-surg').click()
        print('1. CTA Surg click navigated to:', page.url)
        assert 'surgery.html' in page.url

        # 2. Test clicking 'ورود به درسنامه بیماری‌ها' button directly
        page.goto('http://localhost:8000/index.html')
        with page.expect_navigation():
            page.locator('.bento-cta-comm').click()
        print('2. CTA Comm click navigated to:', page.url)
        assert 'communicable-and-noncommunicable-diseases.html' in page.url

        # 3. Test clicking 'ورود به اطلس رادیولوژی' button directly
        page.goto('http://localhost:8000/index.html')
        with page.expect_navigation():
            page.locator('.bento-cta-rad').click()
        print('3. CTA Rad click navigated to:', page.url)
        assert 'radiology.html' in page.url

        # 4. Test clicking the dropdown button and then dropdown items
        page.goto('http://localhost:8000/index.html')
        page.locator('#coursesDropdownBtn').click()
        page.wait_for_timeout(200)
        with page.expect_navigation():
            page.locator('#coursesDropdownMenu a[href*="surgery.html"]').click()
        print('4. Dropdown Surg item click navigated to:', page.url)
        assert 'surgery.html' in page.url

        page.goto('http://localhost:8000/index.html')
        page.locator('#coursesDropdownBtn').click()
        page.wait_for_timeout(200)
        with page.expect_navigation():
            page.locator('#coursesDropdownMenu a[href*="communicable"]').click()
        print('5. Dropdown Comm item click navigated to:', page.url)
        assert 'communicable-and-noncommunicable-diseases.html' in page.url

        # 6. Test clicking on card bodies (card surface click)
        page.goto('http://localhost:8000/index.html')
        with page.expect_navigation():
            page.locator('.bento-card-surg').click()
        print('6. Card Surg surface click navigated to:', page.url)
        assert 'surgery.html' in page.url

        page.goto('http://localhost:8000/index.html')
        with page.expect_navigation():
            page.locator('.bento-card-comm').click()
        print('7. Card Comm surface click navigated to:', page.url)
        assert 'communicable-and-noncommunicable-diseases.html' in page.url

        browser.close()
    print('\nALL NAVIGATION PATHS VERIFIED AND WORKING 100%!')

if __name__ == '__main__':
    run()
