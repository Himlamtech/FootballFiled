const { chromium } = require('playwright');

async function testAdminFieldsPage() {
  console.log('Bắt đầu kiểm tra trang Admin Fields...');

  // Khởi động trình duyệt
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100 // Làm chậm các thao tác để dễ quan sát
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Truy cập trang Admin
    console.log('1. Truy cập trang Admin...');
    await page.goto('http://localhost:9001/admin');
    await page.waitForLoadState('networkidle');

    // Kiểm tra URL sau khi truy cập
    const currentUrl = page.url();
    if (currentUrl.includes('/admin')) {
      console.log('✅ Truy cập trang Admin thành công');
    } else {
      console.log('❌ Truy cập trang Admin thất bại');
      throw new Error('Truy cập trang Admin thất bại');
    }

    // 2. Truy cập trực tiếp trang Fields
    console.log('\n2. Truy cập trực tiếp trang Fields...');
    await page.goto('http://localhost:9001/admin/fields');
    await page.waitForLoadState('networkidle');

    // Kiểm tra URL
    if (page.url().includes('/admin/fields')) {
      console.log('✅ Đã truy cập trang Fields thành công');
    } else {
      console.log('❌ Không thể truy cập trang Fields');
      throw new Error('Không thể truy cập trang Fields');
    }

    // 3. Kiểm tra API calls
    console.log('\n3. Kiểm tra API calls...');
    const fieldsRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/fields')) {
        fieldsRequests.push(request);
      }
    });

    // Reload để bắt requests
    await page.reload();
    await page.waitForLoadState('networkidle');

    console.log(`Số lượng API calls đến /api/fields: ${fieldsRequests.length}`);
    if (fieldsRequests.length > 0) {
      console.log('✅ API calls đến /api/fields hoạt động');
      console.log('URLs:', fieldsRequests.map(r => r.url()));
    } else {
      console.log('❌ Không có API calls đến /api/fields');
    }

    // 4. Kiểm tra hiển thị danh sách sân
    console.log('\n4. Kiểm tra hiển thị danh sách sân...');

    // Đợi cho danh sách sân hiển thị
    await page.waitForSelector('button[role="tab"]');

    // Đếm số lượng sân
    const fieldCount = await page.$$eval('button[role="tab"]', tabs => tabs.length);
    console.log(`Số lượng sân: ${fieldCount}`);

    if (fieldCount > 0) {
      console.log('✅ Hiển thị danh sách sân');

      // Lấy tên sân đầu tiên
      const firstFieldName = await page.textContent('button[role="tab"]:first-child');
      console.log(`Tên sân đầu tiên: ${firstFieldName}`);
    } else {
      console.log('❌ Không hiển thị danh sách sân');
    }

    // 5. Kiểm tra các nút chức năng
    console.log('\n5. Kiểm tra các nút chức năng...');

    // Kiểm tra các nút chức năng
    const hasDateButton = await page.$('button:has-text("15/05/2025")');
    const hasDeleteButton = await page.$('button:has-text("Xóa đặt sân")');
    const hasEditButton = await page.$('button:has-text("Chỉnh sửa hàng loạt")');

    if (hasDateButton && hasDeleteButton && hasEditButton) {
      console.log('✅ Các nút chức năng hiển thị đầy đủ');
    } else {
      console.log('❌ Các nút chức năng không hiển thị đầy đủ');
    }

    // Chụp ảnh trang Fields
    await page.screenshot({ path: 'admin-fields.png', fullPage: true });
    console.log('Đã chụp ảnh trang Fields: admin-fields.png');

    console.log('\n✅ Hoàn thành kiểm tra trang Admin Fields');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình kiểm tra:', error);
  } finally {
    // Đóng trình duyệt
    await browser.close();
    console.log('Đã đóng trình duyệt');
  }
}

// Chạy test
testAdminFieldsPage();
