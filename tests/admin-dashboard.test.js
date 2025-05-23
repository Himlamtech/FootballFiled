// @ts-check
const { test, expect } = require('@playwright/test');

// Model - Data and business logic
class DashboardModel {
  constructor() {
    this.apiUrl = 'http://localhost:9002/api';
    this.dashboardStats = null;
    this.bookingTrend = null;
    this.pieChartData = null;
  }

  async fetchDashboardStats() {
    try {
      const response = await fetch(`${this.apiUrl}/dashboard/stats`);
      this.dashboardStats = await response.json();
      console.log('API Dashboard Stats:', this.dashboardStats);
      return this.dashboardStats;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return null;
    }
  }

  async fetchBookingTrend() {
    try {
      const response = await fetch(`${this.apiUrl}/dashboard/chart/booking-trend`);
      this.bookingTrend = await response.json();
      return this.bookingTrend;
    } catch (error) {
      console.error('Error fetching booking trend:', error);
      return null;
    }
  }

  async fetchPieChartData() {
    try {
      // Get current year data
      const currentYear = new Date().getFullYear();
      const response = await fetch(`${this.apiUrl}/dashboard/chart?period=year&date=${currentYear}-01-01`);
      this.pieChartData = await response.json();
      return this.pieChartData;
    } catch (error) {
      console.error('Error fetching pie chart data:', error);
      return null;
    }
  }

  getTotalBookings() {
    return this.dashboardStats?.totalBookings || 0;
  }

  getTotalIncome() {
    return this.dashboardStats?.totalIncome || 0;
  }
}

// Page - UI interactions
class DashboardPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.url = 'http://localhost:9001/admin/dashboard';

    // Selectors
    this.totalBookingsSelector = 'text="Đặt sân"';
    this.totalIncomeSelector = 'text="Doanh thu"';
    this.bookingValueSelector = 'text="Đặt sân" >> xpath=../h3';
    this.incomeValueSelector = 'text="Doanh thu" >> xpath=../h3';
    this.loadingIndicator = '.animate-spin';
    this.pieChartSelector = 'text="Phân bố doanh thu"';
    this.loginButton = 'button:has-text("Đăng nhập")';
    this.usernameInput = 'input[name="username"]';
    this.passwordInput = 'input[name="password"]';
  }

  async navigate() {
    await this.page.goto(this.url);
  }

  async loginIfNeeded(username = 'admin', password = 'admin') {
    // If we're on the login page, log in
    if (await this.page.url().includes('/admin/login')) {
      console.log('On login page, logging in...');
      await this.page.fill(this.usernameInput, username);
      await this.page.fill(this.passwordInput, password);
      await this.page.click(this.loginButton);

      // Wait for navigation to dashboard
      await this.page.waitForURL('**/admin/dashboard', { timeout: 10000 })
        .catch(e => console.log('Navigation timeout:', e.message));
    }

    // Wait for loading to complete
    await this.page.waitForSelector(this.loadingIndicator, { state: 'hidden', timeout: 5000 })
      .catch(() => console.log('Loading indicator not found or didn\'t disappear'));
  }

  async getDisplayedBookingCount() {
    try {
      await this.page.waitForSelector(this.bookingValueSelector, { timeout: 5000 });
      const element = await this.page.locator(this.bookingValueSelector);
      const text = await element.textContent();
      console.log('UI Booking Count Text:', text);
      return text ? parseInt(text.trim(), 10) : 0;
    } catch (error) {
      console.error('Error getting booking count:', error);
      return -1;
    }
  }

  async getDisplayedIncome() {
    try {
      await this.page.waitForSelector(this.incomeValueSelector, { timeout: 5000 });
      const element = await this.page.locator(this.incomeValueSelector);
      const text = await element.textContent();
      console.log('UI Income Text:', text);

      // Extract numeric value from formatted string (e.g., "5.34tr đ" -> 5340000)
      if (!text) return 0;

      const trimmed = text.trim();
      if (trimmed.includes('tr')) {
        // Handle "tr" format (trillion VND)
        const value = parseFloat(trimmed.replace('tr đ', '').trim());
        return value * 1000000; // Convert to actual value
      } else {
        // Handle regular format
        return parseFloat(trimmed.replace(/[^\d.-]/g, ''));
      }
    } catch (error) {
      console.error('Error getting income:', error);
      return -1;
    }
  }

  async checkPieChartData() {
    try {
      // Check if pie chart exists
      await this.page.waitForSelector(this.pieChartSelector, { timeout: 5000 });

      // Get the pie chart data from the DOM
      // This is a simplified check - we're just verifying the chart exists
      const pieChartExists = await this.page.isVisible(this.pieChartSelector);

      // Check for hardcoded values in the pie chart
      // Look at the source code in the browser console
      const pieChartSource = await this.page.evaluate(() => {
        // Find the pie chart component
        const pieChartElement = document.querySelector('.recharts-wrapper');
        return pieChartElement ? pieChartElement.outerHTML : null;
      });

      return {
        exists: pieChartExists,
        source: pieChartSource
      };
    } catch (error) {
      console.error('Error checking pie chart:', error);
      return { exists: false, source: null };
    }
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `./screenshots/${name}.png` });
  }
}

// Controller - Test logic
class DashboardController {
  /**
   * @param {DashboardPage} page
   * @param {DashboardModel} model
   */
  constructor(page, model) {
    this.page = page;
    this.model = model;
  }

  async verifyDashboardData() {
    // Get API data
    const apiData = await this.model.fetchDashboardStats();

    // Get UI data
    const uiBookingCount = await this.page.getDisplayedBookingCount();
    const uiIncome = await this.page.getDisplayedIncome();

    // Get API data
    const apiBookingCount = this.model.getTotalBookings();
    const apiIncome = this.model.getTotalIncome();

    // Check pie chart
    const pieChartInfo = await this.page.checkPieChartData();

    return {
      uiBookingCount,
      uiIncome,
      apiBookingCount,
      apiIncome,
      pieChartInfo,
      bookingCountMatches: uiBookingCount === apiBookingCount,
      incomeMatches: Math.abs(uiIncome - apiIncome) < 1000, // Allow small rounding differences
      incomeMatchesBookingCount: uiIncome === uiBookingCount
    };
  }
}

// Tests
test.describe('Admin Dashboard Tests', () => {
  let dashboardPage;
  let dashboardModel;
  let dashboardController;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    dashboardModel = new DashboardModel();
    dashboardController = new DashboardController(dashboardPage, dashboardModel);
  });

  test('should display correct booking count and income from API', async ({ page }) => {
    // First, directly check the API response
    const apiStats = await dashboardModel.fetchDashboardStats();
    console.log('API Stats:', apiStats);

    // Navigate to dashboard
    await dashboardPage.navigate();

    // Check if we need to login
    await dashboardPage.loginIfNeeded();

    // Take screenshot for visual verification
    await dashboardPage.takeScreenshot('admin-dashboard');

    // Verify dashboard data
    const result = await dashboardController.verifyDashboardData();

    // Log results for debugging
    console.log('Dashboard verification results:', result);

    // Assertions
    expect(result.bookingCountMatches,
      `UI booking count (${result.uiBookingCount}) should match API booking count (${result.apiBookingCount})`
    ).toBeTruthy();

    expect(result.incomeMatches,
      `UI income (${result.uiIncome}) should match API income (${result.apiIncome})`
    ).toBeTruthy();

    expect(result.incomeMatchesBookingCount,
      `UI income (${result.uiIncome}) should not match booking count (${result.uiBookingCount})`
    ).toBeFalsy();
  });
});
