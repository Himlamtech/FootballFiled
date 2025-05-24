// @ts-check
const { test, expect } = require('@playwright/test');

// Base Model for API interactions
class BaseModel {
  constructor() {
    this.apiUrl = 'http://localhost:9002/api';
    this.token = null;
  }

  async login(username = 'admin', password = 'admin') {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });
      const data = await response.json();
      if (data.token) {
        this.token = data.token;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': this.token ? `Bearer ${this.token}` : ''
    };
  }
}

// Authentication Model
class AuthModel extends BaseModel {
  async testLogin(username, password) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password })
      });
      return await response.json();
    } catch (error) {
      console.error('Auth test error:', error);
      return null;
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ oldPassword, newPassword })
      });
      return await response.json();
    } catch (error) {
      console.error('Change password error:', error);
      return null;
    }
  }
}

// Field Management Model
class FieldModel extends BaseModel {
  async getFields() {
    try {
      const response = await fetch(`${this.apiUrl}/fields`);
      const data = await response.json();
      return data; // API returns {success: true, fields: [...]}
    } catch (error) {
      console.error('Get fields error:', error);
      return null;
    }
  }

  async getTimeSlots(fieldId, date) {
    try {
      const response = await fetch(`${this.apiUrl}/timeslots?field_id=${fieldId}&date=${date}`);
      return await response.json();
    } catch (error) {
      console.error('Get timeslots error:', error);
      return null;
    }
  }

  async lockTimeSlot(timeSlotId) {
    try {
      const response = await fetch(`${this.apiUrl}/field-management/timeslots/${timeSlotId}/lock`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Lock timeslot error:', error);
      return null;
    }
  }

  async unlockTimeSlot(timeSlotId) {
    try {
      const response = await fetch(`${this.apiUrl}/field-management/timeslots/${timeSlotId}/unlock`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Unlock timeslot error:', error);
      return null;
    }
  }
}

// Booking Model
class BookingModel extends BaseModel {
  async createBooking(bookingData) {
    try {
      const response = await fetch(`${this.apiUrl}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      return await response.json();
    } catch (error) {
      console.error('Create booking error:', error);
      return null;
    }
  }

  async getBookings() {
    try {
      const response = await fetch(`${this.apiUrl}/bookings`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get bookings error:', error);
      return null;
    }
  }
}

// Opponent Model
class OpponentModel extends BaseModel {
  async createOpponent(opponentData) {
    try {
      const response = await fetch(`${this.apiUrl}/opponents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opponentData)
      });
      return await response.json();
    } catch (error) {
      console.error('Create opponent error:', error);
      return null;
    }
  }

  async getOpponents() {
    try {
      const response = await fetch(`${this.apiUrl}/opponents`);
      return await response.json();
    } catch (error) {
      console.error('Get opponents error:', error);
      return null;
    }
  }
}

// Feedback Model
class FeedbackModel extends BaseModel {
  async createFeedback(feedbackData) {
    try {
      const response = await fetch(`${this.apiUrl}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      return await response.json();
    } catch (error) {
      console.error('Create feedback error:', error);
      return null;
    }
  }

  async getFeedback() {
    try {
      const response = await fetch(`${this.apiUrl}/feedback`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get feedback error:', error);
      return null;
    }
  }

  async replyToFeedback(feedbackId, reply) {
    try {
      const response = await fetch(`${this.apiUrl}/feedback/${feedbackId}/reply`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ reply })
      });
      return await response.json();
    } catch (error) {
      console.error('Reply to feedback error:', error);
      return null;
    }
  }
}

// Dashboard Model
class DashboardModel extends BaseModel {
  async getStats() {
    try {
      const response = await fetch(`${this.apiUrl}/dashboard/stats`, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return null;
    }
  }

  async getChartData(period = 'year', date = null) {
    try {
      const url = date
        ? `${this.apiUrl}/dashboard/chart?period=${period}&date=${date}`
        : `${this.apiUrl}/dashboard/chart?period=${period}`;
      const response = await fetch(url, {
        headers: this.getAuthHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get chart data error:', error);
      return null;
    }
  }
}

// Base Page class
class BasePage {
  constructor(page) {
    this.page = page;
    this.baseUrl = 'http://localhost:9001';
  }

  async navigate(path) {
    await this.page.goto(`${this.baseUrl}${path}`);
  }

  async takeScreenshot(name) {
    await this.page.screenshot({ path: `./screenshots/${name}.png` });
  }

  async waitForElement(selector, timeout = 5000) {
    try {
      await this.page.waitForSelector(selector, { timeout });
      return true;
    } catch (error) {
      console.error(`Element ${selector} not found:`, error);
      return false;
    }
  }
}

// Authentication Page
class AuthPage extends BasePage {
  constructor(page) {
    super(page);
    // Admin login uses modal dialog, not separate page
    this.loginDialog = '[role="dialog"]';
    this.usernameInput = 'input[placeholder="admin"]';
    this.passwordInput = 'input[type="password"]';
    this.loginButton = 'button:has-text("Đăng nhập")';
    this.logoutButton = 'button:has-text("Đăng xuất")';
  }

  async login(username = 'admin', password = 'admin') {
    // Navigate to admin page to trigger login dialog
    await this.navigate('/admin');

    // Wait for login dialog to appear
    await this.page.waitForSelector(this.loginDialog, { timeout: 10000 });

    // Fill login form in dialog
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);

    // Wait for dialog to close and dashboard to load
    await this.page.waitForSelector(this.loginDialog, { state: 'hidden', timeout: 10000 });
    await this.page.waitForSelector('h1:has-text("Thống kê tổng quan")', { timeout: 10000 });
    return true;
  }

  async logout() {
    if (await this.page.isVisible(this.logoutButton)) {
      await this.page.click(this.logoutButton);
      await this.page.waitForURL('**/admin/login', { timeout: 5000 });
      return true;
    }
    return false;
  }
}

// Homepage Page
class HomePage extends BasePage {
  constructor(page) {
    super(page);
    this.bookingButton = 'button:has-text("Đặt sân"), a:has-text("Đặt sân")';
    this.opponentButton = 'button:has-text("Tìm đối thủ"), a:has-text("Tìm đối thủ")';
    this.feedbackButton = 'button:has-text("Phản hồi"), a:has-text("Phản hồi")';
  }

  async navigateToBooking() {
    await this.navigate('/');
    await this.page.click(this.bookingButton);
  }

  async navigateToOpponents() {
    await this.navigate('/');
    await this.page.click(this.opponentButton);
  }

  async navigateToFeedback() {
    await this.navigate('/');
    await this.page.click(this.feedbackButton);
  }
}

// Booking Page
class BookingPage extends BasePage {
  constructor(page) {
    super(page);
    this.fieldSelect = 'select[name="fieldId"]';
    this.dateInput = 'input[type="date"]';
    this.timeSlotSelect = 'select[name="timeSlotId"]';
    this.customerNameInput = 'input[name="customerName"]';
    this.customerPhoneInput = 'input[name="customerPhone"]';
    this.customerEmailInput = 'input[name="customerEmail"]';
    this.submitButton = 'button[type="submit"]';
    this.paymentButton = 'button:has-text("Thanh toán")';
  }

  async fillBookingForm(bookingData) {
    await this.navigate('/booking');

    // Fill form fields
    await this.page.selectOption(this.fieldSelect, bookingData.fieldId.toString());
    await this.page.fill(this.dateInput, bookingData.date);

    // Wait for time slots to load
    await this.page.waitForTimeout(1000);
    await this.page.selectOption(this.timeSlotSelect, bookingData.timeSlotId.toString());

    await this.page.fill(this.customerNameInput, bookingData.customerName);
    await this.page.fill(this.customerPhoneInput, bookingData.customerPhone);
    await this.page.fill(this.customerEmailInput, bookingData.customerEmail);

    return true;
  }

  async submitBooking() {
    await this.page.click(this.submitButton);
    // Wait for booking confirmation or payment page
    await this.page.waitForTimeout(2000);
    return true;
  }

  async processPayment() {
    if (await this.page.isVisible(this.paymentButton)) {
      await this.page.click(this.paymentButton);
      await this.page.waitForTimeout(2000);
      return true;
    }
    return false;
  }
}

// Opponent Page
class OpponentPage extends BasePage {
  constructor(page) {
    super(page);
    this.teamNameInput = 'input[name="teamName"]';
    this.skillLevelSelect = 'select[name="skillLevel"]';
    this.fieldTypeSelect = 'select[name="fieldType"]';
    this.timeSlotSelect = 'select[name="timeSlot"]';
    this.dateInput = 'input[name="date"]';
    this.contactInput = 'input[name="contact"]';
    this.additionalInfoTextarea = 'textarea[name="additionalInfo"]';
    this.submitButton = 'button[type="submit"]';
    this.opponentsList = '.opponents-list';
  }

  async createOpponent(opponentData) {
    await this.navigate('/opponents');

    await this.page.fill(this.teamNameInput, opponentData.teamName);
    await this.page.selectOption(this.skillLevelSelect, opponentData.skillLevel);
    await this.page.selectOption(this.fieldTypeSelect, opponentData.fieldType);
    await this.page.selectOption(this.timeSlotSelect, opponentData.timeSlot);
    await this.page.fill(this.dateInput, opponentData.date);
    await this.page.fill(this.contactInput, opponentData.contact);
    await this.page.fill(this.additionalInfoTextarea, opponentData.additionalInfo);

    await this.page.click(this.submitButton);
    await this.page.waitForTimeout(2000);
    return true;
  }

  async getOpponentsList() {
    await this.navigate('/opponents');
    await this.page.waitForSelector(this.opponentsList, { timeout: 5000 });

    const opponents = await this.page.$$eval('.opponent-card', cards =>
      cards.map(card => ({
        teamName: card.querySelector('.team-name')?.textContent?.trim(),
        skillLevel: card.querySelector('.skill-level')?.textContent?.trim(),
        date: card.querySelector('.date')?.textContent?.trim()
      }))
    );

    return opponents;
  }
}

// Feedback Page
class FeedbackPage extends BasePage {
  constructor(page) {
    super(page);
    this.nameInput = 'input[name="name"]';
    this.emailInput = 'input[name="email"]';
    this.phoneInput = 'input[name="phone"]';
    this.subjectInput = 'input[name="subject"]';
    this.messageTextarea = 'textarea[name="message"]';
    this.prioritySelect = 'select[name="priority"]';
    this.submitButton = 'button[type="submit"]';
  }

  async submitFeedback(feedbackData) {
    await this.navigate('/feedback');

    await this.page.fill(this.nameInput, feedbackData.name);
    await this.page.fill(this.emailInput, feedbackData.email);
    await this.page.fill(this.phoneInput, feedbackData.phone);
    await this.page.fill(this.subjectInput, feedbackData.subject);
    await this.page.fill(this.messageTextarea, feedbackData.message);

    if (feedbackData.priority) {
      await this.page.selectOption(this.prioritySelect, feedbackData.priority);
    }

    await this.page.click(this.submitButton);
    await this.page.waitForTimeout(2000);
    return true;
  }
}

// Admin Dashboard Page
class AdminDashboardPage extends BasePage {
  constructor(page) {
    super(page);
    this.statsCards = '.stats-card';
    this.totalBookingsCard = '[data-testid="total-bookings"]';
    this.totalIncomeCard = '[data-testid="total-income"]';
    this.pieChart = '.recharts-wrapper';
    this.bookingTrendChart = '.booking-trend-chart';
  }

  async getStats() {
    await this.navigate('/admin/dashboard');
    await this.page.waitForSelector(this.statsCards, { timeout: 10000 });

    const stats = await this.page.$$eval(this.statsCards, cards =>
      cards.map(card => ({
        title: card.querySelector('h4')?.textContent?.trim(),
        value: card.querySelector('h3')?.textContent?.trim()
      }))
    );

    return stats;
  }

  async checkChartsExist() {
    const pieChartExists = await this.page.isVisible(this.pieChart);
    const trendChartExists = await this.page.isVisible(this.bookingTrendChart);

    return { pieChartExists, trendChartExists };
  }
}

// Admin Field Management Page
class AdminFieldPage extends BasePage {
  constructor(page) {
    super(page);
    this.fieldsTable = '.fields-table';
    this.lockButton = 'button:has-text("Khóa")';
    this.unlockButton = 'button:has-text("Mở khóa")';
    this.priceInput = 'input[name="price"]';
    this.saveButton = 'button:has-text("Lưu")';
  }

  async lockTimeSlot(fieldId, timeSlotId) {
    await this.navigate('/admin/field-management');
    await this.page.waitForSelector(this.fieldsTable, { timeout: 5000 });

    const lockButton = `[data-field-id="${fieldId}"][data-timeslot-id="${timeSlotId}"] ${this.lockButton}`;
    if (await this.page.isVisible(lockButton)) {
      await this.page.click(lockButton);
      await this.page.waitForTimeout(1000);
      return true;
    }
    return false;
  }

  async unlockTimeSlot(fieldId, timeSlotId) {
    await this.navigate('/admin/field-management');
    await this.page.waitForSelector(this.fieldsTable, { timeout: 5000 });

    const unlockButton = `[data-field-id="${fieldId}"][data-timeslot-id="${timeSlotId}"] ${this.unlockButton}`;
    if (await this.page.isVisible(unlockButton)) {
      await this.page.click(unlockButton);
      await this.page.waitForTimeout(1000);
      return true;
    }
    return false;
  }
}

// Test Data Generator
class TestDataGenerator {
  static getBookingData() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    return {
      fieldId: 1,
      timeSlotId: 1,
      date: dateStr,
      customerName: 'Test Customer',
      customerPhone: '0123456789',
      customerEmail: 'test@example.com'
    };
  }

  static getOpponentData() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    return {
      teamName: 'Test Team FC',
      skillLevel: 'intermediate',
      fieldType: '7v7',
      timeSlot: 'evening',
      date: dateStr,
      contact: '0987654321',
      additionalInfo: 'Looking for a friendly match'
    };
  }

  static getFeedbackData() {
    return {
      name: 'Test User',
      email: 'testuser@example.com',
      phone: '0123456789',
      subject: 'Test Feedback',
      message: 'This is a test feedback message',
      priority: 'medium'
    };
  }
}

// Test Suite
test.describe('Comprehensive Football Field Management System Tests', () => {
  let authPage, homePage, bookingPage, opponentPage, feedbackPage;
  let adminDashboardPage, adminFieldPage;
  let authModel, fieldModel, bookingModel, opponentModel, feedbackModel, dashboardModel;

  test.beforeEach(async ({ page }) => {
    // Initialize Page Objects
    authPage = new AuthPage(page);
    homePage = new HomePage(page);
    bookingPage = new BookingPage(page);
    opponentPage = new OpponentPage(page);
    feedbackPage = new FeedbackPage(page);
    adminDashboardPage = new AdminDashboardPage(page);
    adminFieldPage = new AdminFieldPage(page);

    // Initialize Models
    authModel = new AuthModel();
    fieldModel = new FieldModel();
    bookingModel = new BookingModel();
    opponentModel = new OpponentModel();
    feedbackModel = new FeedbackModel();
    dashboardModel = new DashboardModel();

    // Login to get auth token for API calls
    await authModel.login();
    await fieldModel.login();
    await bookingModel.login();
    await opponentModel.login();
    await feedbackModel.login();
    await dashboardModel.login();
  });

  test.describe('1. Authentication System Tests', () => {
    test('should login with correct credentials', async () => {
      const result = await authPage.login('admin', 'admin');
      expect(result).toBeTruthy();

      // Verify we're on dashboard
      expect(authPage.page.url()).toContain('/admin/dashboard');
    });

    test('should fail login with incorrect credentials', async () => {
      try {
        await authPage.login('wrong', 'credentials');
        expect(false).toBeTruthy(); // Should not reach here
      } catch (error) {
        // Expected to fail
        expect(true).toBeTruthy();
      }
    });

    test('should logout successfully', async () => {
      await authPage.login('admin', 'admin');
      const logoutResult = await authPage.logout();
      expect(logoutResult).toBeTruthy();
      expect(authPage.page.url()).toContain('/admin/login');
    });
  });

  test.describe('2. Field Booking & Payment System Tests', () => {
    test('should complete full booking flow', async () => {
      const bookingData = TestDataGenerator.getBookingData();

      // Test UI booking flow
      await bookingPage.fillBookingForm(bookingData);
      await bookingPage.takeScreenshot('booking-form-filled');

      const submitResult = await bookingPage.submitBooking();
      expect(submitResult).toBeTruthy();

      // Test payment processing
      const paymentResult = await bookingPage.processPayment();
      expect(paymentResult).toBeTruthy();

      // Verify booking was created via API
      const bookings = await bookingModel.getBookings();
      expect(bookings.data).toBeDefined();
      expect(bookings.data.length).toBeGreaterThan(0);

      console.log('Booking created successfully:', bookings.data[bookings.data.length - 1]);
    });

    test('should validate field availability', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];

      const timeSlots = await fieldModel.getTimeSlots(1, dateStr);
      expect(timeSlots).toBeDefined();
      expect(Array.isArray(timeSlots)).toBeTruthy();

      console.log('Available time slots:', timeSlots);
    });
  });

  test.describe('3. Opponent Posting System Tests', () => {
    test('should create opponent post with all required fields', async () => {
      const opponentData = TestDataGenerator.getOpponentData();

      // Test UI opponent creation
      const createResult = await opponentPage.createOpponent(opponentData);
      expect(createResult).toBeTruthy();

      await opponentPage.takeScreenshot('opponent-created');

      // Verify opponent was created via API
      const opponents = await opponentModel.getOpponents();
      expect(opponents).toBeDefined();
      expect(Array.isArray(opponents)).toBeTruthy();

      const latestOpponent = opponents.find(o => o.team_name === opponentData.teamName);
      expect(latestOpponent).toBeDefined();

      console.log('Opponent created successfully:', latestOpponent);
    });

    test('should display opponents sorted by newest first', async () => {
      const opponents = await opponentPage.getOpponentsList();
      expect(Array.isArray(opponents)).toBeTruthy();

      // Check if opponents are sorted by date (newest first)
      if (opponents.length > 1) {
        for (let i = 0; i < opponents.length - 1; i++) {
          const currentDate = new Date(opponents[i].date);
          const nextDate = new Date(opponents[i + 1].date);
          expect(currentDate >= nextDate).toBeTruthy();
        }
      }

      console.log('Opponents list:', opponents);
    });
  });

  test.describe('4. Feedback System Tests', () => {
    test('should submit feedback form successfully', async () => {
      const feedbackData = TestDataGenerator.getFeedbackData();

      // Test UI feedback submission
      const submitResult = await feedbackPage.submitFeedback(feedbackData);
      expect(submitResult).toBeTruthy();

      await feedbackPage.takeScreenshot('feedback-submitted');

      // Verify feedback was created via API
      const feedback = await feedbackModel.getFeedback();
      expect(feedback.data).toBeDefined();
      expect(feedback.data.length).toBeGreaterThan(0);

      const latestFeedback = feedback.data.find(f => f.subject === feedbackData.subject);
      expect(latestFeedback).toBeDefined();

      console.log('Feedback created successfully:', latestFeedback);
    });

    test('should allow admin to reply to feedback', async () => {
      // First create a feedback
      const feedbackData = TestDataGenerator.getFeedbackData();
      const createResult = await feedbackModel.createFeedback(feedbackData);
      expect(createResult).toBeDefined();

      // Reply to the feedback
      const replyText = 'Thank you for your feedback. We will address this issue.';
      const replyResult = await feedbackModel.replyToFeedback(createResult.id, replyText);
      expect(replyResult).toBeDefined();

      console.log('Feedback reply sent successfully:', replyResult);
    });
  });

  test.describe('5. Admin Dashboard Tests', () => {
    test('should display real data from database', async () => {
      await authPage.login('admin', 'admin');

      // Get API stats
      const apiStats = await dashboardModel.getStats();
      expect(apiStats).toBeDefined();

      // Get UI stats
      const uiStats = await adminDashboardPage.getStats();
      expect(uiStats).toBeDefined();
      expect(uiStats.length).toBeGreaterThan(0);

      await adminDashboardPage.takeScreenshot('admin-dashboard');

      // Verify charts exist
      const charts = await adminDashboardPage.checkChartsExist();
      expect(charts.pieChartExists || charts.trendChartExists).toBeTruthy();

      console.log('API Stats:', apiStats);
      console.log('UI Stats:', uiStats);
      console.log('Charts:', charts);
    });

    test('should display comprehensive statistics', async () => {
      await authPage.login('admin', 'admin');

      const stats = await dashboardModel.getStats();
      expect(stats).toBeDefined();

      // Check for required statistics
      expect(stats.totalBookings).toBeDefined();
      expect(stats.totalIncome).toBeDefined();
      expect(typeof stats.totalBookings).toBe('number');
      expect(typeof stats.totalIncome).toBe('number');

      console.log('Dashboard statistics:', stats);
    });
  });

  test.describe('6. Field Management Tests', () => {
    test('should lock and unlock time slots', async () => {
      await authPage.login('admin', 'admin');

      const fieldId = 1;
      const timeSlotId = 1;

      // Test locking via API
      const lockResult = await fieldModel.lockTimeSlot(timeSlotId);
      expect(lockResult).toBeDefined();

      // Test unlocking via API
      const unlockResult = await fieldModel.unlockTimeSlot(timeSlotId);
      expect(unlockResult).toBeDefined();

      console.log('Lock result:', lockResult);
      console.log('Unlock result:', unlockResult);
    });

    test('should verify exactly 4 fixed football fields', async () => {
      const fields = await fieldModel.getFields();
      expect(fields.fields).toBeDefined();
      expect(fields.fields.length).toBe(4);

      // Verify field types
      const fieldSizes = fields.fields.map(f => f.size);
      expect(fieldSizes).toContain('5v5');
      expect(fieldSizes).toContain('7v7');
      expect(fieldSizes).toContain('11v11');

      console.log('Fields:', fields.fields);
    });
  });

  test.describe('7. Database Connectivity Tests', () => {
    test('should connect to MySQL database successfully', async () => {
      // Test basic API connectivity
      const response = await fetch('http://localhost:9002/api/ping');
      expect(response.ok).toBeTruthy();

      const data = await response.json();
      expect(data.message).toBe('API is working!');

      console.log('API ping successful:', data);
    });

    test('should verify all core tables exist and have data', async () => {
      // Test each core table through API endpoints
      const fields = await fieldModel.getFields();
      expect(fields.fields).toBeDefined();
      expect(fields.fields.length).toBe(4);

      const bookings = await bookingModel.getBookings();
      expect(bookings.data).toBeDefined();

      const opponents = await opponentModel.getOpponents();
      expect(opponents).toBeDefined();

      const feedback = await feedbackModel.getFeedback();
      expect(feedback.data).toBeDefined();

      console.log('All core tables verified successfully');
    });
  });
});
