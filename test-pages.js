const { chromium } = require('playwright');

async function testPages() {
  console.log('Starting browser tests...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test 1: Kiểm tra trang Opponents
    console.log('\n--- Testing Opponents Page ---');
    await page.goto('http://localhost:9001/opponents');
    await page.waitForTimeout(2000);

    // Kiểm tra API call
    const opponentsRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/opponents')) {
        opponentsRequests.push(request);
      }
    });

    // Reload để bắt requests
    await page.reload();
    await page.waitForTimeout(2000);

    console.log(`Opponents API calls: ${opponentsRequests.length}`);
    console.log('Opponents API URLs:', opponentsRequests.map(r => r.url()));

    // Kiểm tra nội dung trang
    const opponentsContent = await page.content();
    const hasOpponentsData = opponentsContent.includes('Đăng tin tìm đối');
    console.log(`Opponents page has content: ${hasOpponentsData}`);

    // Test 2: Kiểm tra trang Admin Dashboard (biểu đồ doanh thu)
    console.log('\n--- Testing Admin Dashboard Page ---');

    // Login to admin first
    await page.goto('http://localhost:9001/admin');
    await page.waitForTimeout(2000);

    console.log('Checking login form elements...');
    const usernameInput = await page.$('input[placeholder="Username"]');
    const passwordInput = await page.$('input[placeholder="Password"]');

    if (usernameInput && passwordInput) {
      console.log('Login form found, attempting to login');
      await usernameInput.fill('admin');
      await passwordInput.fill('admin');

      const loginButton = await page.$('button[type="submit"]');
      if (loginButton) {
        await loginButton.click();
        await page.waitForTimeout(3000);
      } else {
        console.log('Login button not found');
      }
    } else {
      console.log('Login form elements not found, checking current URL');
    }

    // Check if login successful
    const currentUrl = page.url();
    if (currentUrl.includes('/admin') && !currentUrl.includes('/login')) {
      console.log('Admin login successful');

      // Check dashboard API calls
      const dashboardRequests = [];
      page.on('request', request => {
        if (request.url().includes('/api/dashboard')) {
          dashboardRequests.push(request);
        }
      });

      // Go to dashboard
      await page.goto('http://localhost:9001/admin');
      await page.waitForTimeout(2000);

      console.log(`Dashboard API calls: ${dashboardRequests.length}`);
      console.log('Dashboard API URLs:', dashboardRequests.map(r => r.url()));

      // Check for chart elements
      const hasCharts = await page.$$eval('svg', (svgs) => svgs.length > 0);
      console.log(`Dashboard has charts: ${hasCharts}`);
    } else {
      console.log('Admin login failed');
    }

    // Test 3: Kiểm tra trang Field Management (quản lý đặt sân)
    console.log('\n--- Testing Field Management Page ---');
    await page.goto('http://localhost:9001/admin/fields');
    await page.waitForTimeout(2000);

    // Check field management API calls
    const fieldRequests = [];
    const fieldResponses = [];

    page.on('request', request => {
      if (request.url().includes('/api/fields') || request.url().includes('/api/field-management')) {
        fieldRequests.push(request);
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/fields')) {
        try {
          const responseBody = await response.json();
          fieldResponses.push({
            url: response.url(),
            status: response.status(),
            body: responseBody
          });
        } catch (e) {
          console.log(`Error parsing response from ${response.url()}: ${e.message}`);
        }
      }
    });

    // Reload to capture requests
    await page.reload();
    await page.waitForTimeout(2000);

    console.log(`Field Management API calls: ${fieldRequests.length}`);
    console.log('Field Management API URLs:', fieldRequests.map(r => r.url()));

    // Log API responses
    console.log('Field Management API Responses:', JSON.stringify(fieldResponses, null, 2));

    // Check if fields are displayed
    const hasFields = await page.$$eval('button[role="tab"]', (buttons) => buttons.length > 0);
    console.log(`Field Management has fields: ${hasFields}`);

    // Check DOM structure
    const fieldManagementContent = await page.content();
    const hasTabsList = fieldManagementContent.includes('tabs-list');
    console.log(`Field Management has tabs-list: ${hasTabsList}`);

    // Take screenshot for debugging
    await page.screenshot({ path: 'field-management.png' });

    // Check console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    console.log('\n--- Console Errors ---');
    console.log(consoleErrors);

  } catch (error) {
    console.error('Test error:', error);
  } finally {
    await browser.close();
    console.log('\nTests completed');
  }
}

testPages();
