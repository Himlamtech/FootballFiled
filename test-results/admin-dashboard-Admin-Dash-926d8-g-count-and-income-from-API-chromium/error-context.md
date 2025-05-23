# Test info

- Name: Admin Dashboard Tests >> should display correct booking count and income from API
- Location: /media/Project/PTITProject/FootballField/tests/admin-dashboard.test.js:222:3

# Error details

```
Error: UI booking count (-1) should match API booking count (18)

expect(received).toBeTruthy()

Received: false
    at /media/Project/PTITProject/FootballField/tests/admin-dashboard.test.js:245:7
```

# Page snapshot

```yaml
- region "Notifications (F8)":
  - list
- heading "404" [level=1]
- paragraph: Không tìm thấy trang
- paragraph: Trang bạn đang tìm không tồn tại hoặc đã được chuyển sang địa chỉ khác.
- link "Quay lại trang chủ":
  - /url: /
  - button "Quay lại trang chủ"
```

# Test source

```ts
  145 |       // This is a simplified check - we're just verifying the chart exists
  146 |       const pieChartExists = await this.page.isVisible(this.pieChartSelector);
  147 |
  148 |       // Check for hardcoded values in the pie chart
  149 |       // Look at the source code in the browser console
  150 |       const pieChartSource = await this.page.evaluate(() => {
  151 |         // Find the pie chart component
  152 |         const pieChartElement = document.querySelector('.recharts-wrapper');
  153 |         return pieChartElement ? pieChartElement.outerHTML : null;
  154 |       });
  155 |
  156 |       return {
  157 |         exists: pieChartExists,
  158 |         source: pieChartSource
  159 |       };
  160 |     } catch (error) {
  161 |       console.error('Error checking pie chart:', error);
  162 |       return { exists: false, source: null };
  163 |     }
  164 |   }
  165 |
  166 |   async takeScreenshot(name) {
  167 |     await this.page.screenshot({ path: `./screenshots/${name}.png` });
  168 |   }
  169 | }
  170 |
  171 | // Controller - Test logic
  172 | class DashboardController {
  173 |   /**
  174 |    * @param {DashboardPage} page
  175 |    * @param {DashboardModel} model
  176 |    */
  177 |   constructor(page, model) {
  178 |     this.page = page;
  179 |     this.model = model;
  180 |   }
  181 |
  182 |   async verifyDashboardData() {
  183 |     // Get API data
  184 |     const apiData = await this.model.fetchDashboardStats();
  185 |
  186 |     // Get UI data
  187 |     const uiBookingCount = await this.page.getDisplayedBookingCount();
  188 |     const uiIncome = await this.page.getDisplayedIncome();
  189 |
  190 |     // Get API data
  191 |     const apiBookingCount = this.model.getTotalBookings();
  192 |     const apiIncome = this.model.getTotalIncome();
  193 |
  194 |     // Check pie chart
  195 |     const pieChartInfo = await this.page.checkPieChartData();
  196 |
  197 |     return {
  198 |       uiBookingCount,
  199 |       uiIncome,
  200 |       apiBookingCount,
  201 |       apiIncome,
  202 |       pieChartInfo,
  203 |       bookingCountMatches: uiBookingCount === apiBookingCount,
  204 |       incomeMatches: Math.abs(uiIncome - apiIncome) < 1000, // Allow small rounding differences
  205 |       incomeMatchesBookingCount: uiIncome === uiBookingCount
  206 |     };
  207 |   }
  208 | }
  209 |
  210 | // Tests
  211 | test.describe('Admin Dashboard Tests', () => {
  212 |   let dashboardPage;
  213 |   let dashboardModel;
  214 |   let dashboardController;
  215 |
  216 |   test.beforeEach(async ({ page }) => {
  217 |     dashboardPage = new DashboardPage(page);
  218 |     dashboardModel = new DashboardModel();
  219 |     dashboardController = new DashboardController(dashboardPage, dashboardModel);
  220 |   });
  221 |
  222 |   test('should display correct booking count and income from API', async ({ page }) => {
  223 |     // First, directly check the API response
  224 |     const apiStats = await dashboardModel.fetchDashboardStats();
  225 |     console.log('API Stats:', apiStats);
  226 |
  227 |     // Navigate to dashboard
  228 |     await dashboardPage.navigate();
  229 |
  230 |     // Check if we need to login
  231 |     await dashboardPage.loginIfNeeded();
  232 |
  233 |     // Take screenshot for visual verification
  234 |     await dashboardPage.takeScreenshot('admin-dashboard');
  235 |
  236 |     // Verify dashboard data
  237 |     const result = await dashboardController.verifyDashboardData();
  238 |
  239 |     // Log results for debugging
  240 |     console.log('Dashboard verification results:', result);
  241 |
  242 |     // Assertions
  243 |     expect(result.bookingCountMatches,
  244 |       `UI booking count (${result.uiBookingCount}) should match API booking count (${result.apiBookingCount})`
> 245 |     ).toBeTruthy();
      |       ^ Error: UI booking count (-1) should match API booking count (18)
  246 |
  247 |     expect(result.incomeMatches,
  248 |       `UI income (${result.uiIncome}) should match API income (${result.apiIncome})`
  249 |     ).toBeTruthy();
  250 |
  251 |     expect(result.incomeMatchesBookingCount,
  252 |       `UI income (${result.uiIncome}) should not match booking count (${result.uiBookingCount})`
  253 |     ).toBeFalsy();
  254 |   });
  255 | });
  256 |
```