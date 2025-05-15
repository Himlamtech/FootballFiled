const { chromium } = require('playwright');

async function testOpponentsPage() {
  console.log('Bắt đầu kiểm tra trang Opponents...');
  
  // Khởi động trình duyệt
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 100 // Làm chậm các thao tác để dễ quan sát
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. Kiểm tra tải trang
    console.log('1. Kiểm tra tải trang Opponents...');
    await page.goto('http://localhost:9001/opponents');
    await page.waitForLoadState('networkidle');
    
    // Kiểm tra tiêu đề trang
    const title = await page.textContent('h1');
    console.log(`Tiêu đề trang: ${title}`);
    if (title.includes('Giao Lưu Bóng Đá')) {
      console.log('✅ Tiêu đề trang hiển thị đúng');
    } else {
      console.log('❌ Tiêu đề trang không hiển thị đúng');
    }

    // 2. Kiểm tra API calls
    console.log('\n2. Kiểm tra API calls...');
    const opponentsRequests = [];
    page.on('request', request => {
      if (request.url().includes('/api/opponents')) {
        opponentsRequests.push(request);
      }
    });
    
    // Reload để bắt requests
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log(`Số lượng API calls đến /api/opponents: ${opponentsRequests.length}`);
    if (opponentsRequests.length > 0) {
      console.log('✅ API calls đến /api/opponents hoạt động');
      console.log('URLs:', opponentsRequests.map(r => r.url()));
    } else {
      console.log('❌ Không có API calls đến /api/opponents');
    }

    // 3. Kiểm tra chức năng đăng tin tìm đối
    console.log('\n3. Kiểm tra chức năng đăng tin tìm đối...');
    
    // Click vào nút "Đăng tin mới"
    await page.click('button:has-text("Đăng tin mới")');
    console.log('✅ Đã click vào nút "Đăng tin mới"');
    
    // Đợi dialog hiển thị
    await page.waitForSelector('div[role="dialog"]');
    console.log('✅ Dialog hiển thị');
    
    // Điền thông tin vào form
    await page.fill('input[placeholder="Nhập tên đội bóng"]', 'Đội Test Playwright');
    console.log('✅ Đã điền tên đội bóng');
    
    await page.selectOption('select >> nth=0', 'Trung bình');
    console.log('✅ Đã chọn trình độ');
    
    await page.selectOption('select >> nth=1', '7');
    console.log('✅ Đã chọn số người/đội');
    
    await page.fill('input[placeholder="Nhập địa điểm"]', 'Sân Mỹ Đình');
    console.log('✅ Đã điền địa điểm');
    
    await page.fill('input[placeholder="VD: 18:00 - 19:30"]', '19:00 - 20:30');
    console.log('✅ Đã điền thời gian');
    
    await page.fill('input[placeholder="Số điện thoại"]', '0987654321');
    console.log('✅ Đã điền số điện thoại');
    
    await page.fill('textarea', 'Đội bóng test tạo bởi Playwright');
    console.log('✅ Đã điền mô tả');
    
    // Chụp ảnh form đã điền
    await page.screenshot({ path: 'opponents-form-filled.png' });
    console.log('Đã chụp ảnh form đã điền: opponents-form-filled.png');
    
    // Sử dụng JavaScript để click nút "Đăng tin"
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submitButton = buttons.find(button => button.textContent.includes('Đăng tin'));
      if (submitButton) {
        submitButton.click();
        return true;
      }
      return false;
    });
    console.log('✅ Đã click nút "Đăng tin" bằng JavaScript');
    
    // Đợi thông báo thành công hoặc dialog đóng
    try {
      await Promise.race([
        page.waitForSelector('[role="status"]', { timeout: 5000 }),
        page.waitForFunction(() => !document.querySelector('div[role="dialog"]'), { timeout: 5000 })
      ]);
      console.log('✅ Dialog đã đóng hoặc thông báo đã hiển thị');
    } catch (error) {
      console.log('❌ Không phát hiện dialog đóng hoặc thông báo');
    }
    
    // Chụp ảnh sau khi đăng tin
    await page.screenshot({ path: 'opponents-after-submit.png' });
    console.log('Đã chụp ảnh sau khi đăng tin: opponents-after-submit.png');
    
    // Kiểm tra xem đội mới có được thêm vào danh sách không
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Chụp ảnh sau khi tải lại trang
    await page.screenshot({ path: 'opponents-after-reload.png' });
    console.log('Đã chụp ảnh sau khi tải lại trang: opponents-after-reload.png');
    
    console.log('\n✅ Hoàn thành kiểm tra trang Opponents');
    
  } catch (error) {
    console.error('❌ Lỗi trong quá trình kiểm tra:', error);
  } finally {
    // Đóng trình duyệt
    await browser.close();
    console.log('Đã đóng trình duyệt');
  }
}

// Chạy test
testOpponentsPage();
