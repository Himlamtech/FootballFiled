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

    // 3. Kiểm tra hiển thị danh sách đối thủ
    console.log('\n3. Kiểm tra hiển thị danh sách đối thủ...');

    // Đợi cho spinner hoặc nội dung tải xong
    await page.waitForSelector('.space-y-4, .text-center.py-8, .animate-spin', { timeout: 5000 }).catch(() => {});

    // Đợi thêm một chút để đảm bảo dữ liệu đã được tải
    await page.waitForTimeout(2000);

    // Kiểm tra xem có đang hiển thị spinner loading không
    const isLoading = await page.$('.animate-spin');
    if (isLoading) {
      console.log('⚠️ Trang vẫn đang tải dữ liệu (hiển thị spinner)');
      await page.waitForTimeout(3000); // Đợi thêm thời gian
    }

    // Kiểm tra xem có danh sách đối thủ hay không - thử nhiều selector khác nhau
    let hasTeamList = false;

    // Thử các selector khác nhau để tìm danh sách đội
    const selectors = [
      '.card',
      '.space-y-4 .card',
      'h3',
      '.hover\\:shadow-md',
      'button:has-text("Liên hệ")'
    ];

    for (const selector of selectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`Tìm thấy ${elements.length} phần tử với selector: ${selector}`);
        hasTeamList = true;
        break;
      }
    }

    const noTeamsMessage = await page.$('.text-center.py-8');

    if (hasTeamList) {
      console.log(`✅ Trang hiển thị danh sách đội bóng`);

      // Thử lấy tên đội đầu tiên bằng JavaScript
      try {
        const firstTeamName = await page.evaluate(() => {
          const headings = document.querySelectorAll('h3');
          return headings.length > 0 ? headings[0].textContent : 'Không tìm thấy tên đội';
        });
        console.log(`Tên đội đầu tiên: ${firstTeamName}`);
      } catch (error) {
        console.log('❌ Không thể lấy tên đội đầu tiên:', error.message);
      }
    } else if (noTeamsMessage) {
      try {
        const message = await page.evaluate(() => {
          const element = document.querySelector('.text-center.py-8');
          return element ? element.textContent : 'Không tìm thấy thông báo';
        });
        console.log(`✅ Hiển thị thông báo: "${message}"`);
      } catch (error) {
        console.log('❌ Không thể lấy nội dung thông báo:', error.message);
      }
    } else {
      console.log('❌ Không hiển thị danh sách đội bóng hoặc thông báo');

      // Chụp ảnh để kiểm tra
      await page.screenshot({ path: 'opponents-list-issue.png' });
      console.log('Đã chụp ảnh vấn đề: opponents-list-issue.png');
    }

    // 4. Kiểm tra chức năng lọc theo trình độ
    console.log('\n4. Kiểm tra chức năng lọc theo trình độ...');

    // Lọc theo trình độ "Thấp"
    await page.click('text="Thấp"');
    await page.waitForTimeout(1000);

    // Kiểm tra kết quả lọc
    const lowLevelTeams = await page.$$eval('.space-y-4 .card', teams => teams.length);
    console.log(`Số đội sau khi lọc theo trình độ "Thấp": ${lowLevelTeams}`);

    // Lọc theo trình độ "Trung bình"
    await page.click('text="Trung bình"');
    await page.waitForTimeout(1000);

    // Kiểm tra kết quả lọc
    const mediumLevelTeams = await page.$$eval('.space-y-4 .card', teams => teams.length);
    console.log(`Số đội sau khi lọc theo trình độ "Trung bình": ${mediumLevelTeams}`);

    // Lọc theo "Tất cả"
    await page.click('text="Tất cả"');
    await page.waitForTimeout(1000);

    // Kiểm tra kết quả lọc
    const allTeams = await page.$$eval('.space-y-4 .card', teams => teams.length);
    console.log(`Số đội sau khi lọc theo "Tất cả": ${allTeams}`);

    if (allTeams >= lowLevelTeams && allTeams >= mediumLevelTeams) {
      console.log('✅ Chức năng lọc theo trình độ hoạt động đúng');
    } else {
      console.log('❌ Chức năng lọc theo trình độ không hoạt động đúng');
    }

    // 5. Kiểm tra chức năng đăng tin tìm đối
    console.log('\n5. Kiểm tra chức năng đăng tin tìm đối...');

    // Chụp ảnh trước khi click
    await page.screenshot({ path: 'opponents-before-dialog.png' });

    // Click vào nút "Đăng tin mới"
    try {
      await page.click('button:has-text("Đăng tin mới")');
      console.log('✅ Đã click vào nút "Đăng tin mới"');
    } catch (error) {
      console.log('❌ Không thể click vào nút "Đăng tin mới":', error.message);

      // Thử cách khác
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const text = await button.textContent();
        if (text.includes('Đăng tin mới')) {
          await button.click();
          console.log('✅ Đã click vào nút "Đăng tin mới" (phương pháp thay thế)');
          break;
        }
      }
    }

    // Đợi dialog hiển thị
    await page.waitForSelector('div[role="dialog"]', { timeout: 5000 }).catch(() => {
      console.log('❌ Dialog không hiển thị sau khi click nút "Đăng tin mới"');
    });

    // Chụp ảnh dialog
    await page.screenshot({ path: 'opponents-dialog.png' });
    console.log('Đã chụp ảnh dialog: opponents-dialog.png');

    // Kiểm tra xem dialog có hiển thị không
    const dialogVisible = await page.$('div[role="dialog"]');
    if (!dialogVisible) {
      console.log('❌ Dialog không hiển thị, bỏ qua phần điền form');
      return;
    }

    // Điền thông tin vào form
    try {
      await page.fill('input[placeholder="Nhập tên đội bóng"]', 'Đội Test Playwright');
      console.log('✅ Đã điền tên đội bóng');

      // Tìm và chọn các dropdown
      const selects = await page.$$('select');
      if (selects.length >= 2) {
        await selects[0].selectOption('Trung bình');
        console.log('✅ Đã chọn trình độ');

        await selects[1].selectOption('7');
        console.log('✅ Đã chọn số người/đội');
      } else {
        console.log(`❌ Không tìm thấy đủ dropdown (chỉ tìm thấy ${selects.length})`);
      }

      await page.fill('input[placeholder="Nhập địa điểm"]', 'Sân vận động Mỹ Đình');
      console.log('✅ Đã điền địa điểm');

      await page.fill('input[placeholder="VD: 18:00 - 19:30"]', '19:00 - 20:30');
      console.log('✅ Đã điền thời gian');

      await page.fill('input[placeholder="Số điện thoại"]', '0987654321');
      console.log('✅ Đã điền số điện thoại');

      await page.fill('textarea', 'Đội bóng test tạo bởi Playwright');
      console.log('✅ Đã điền mô tả');
    } catch (error) {
      console.log('❌ Lỗi khi điền form:', error.message);
    }

    // Chụp ảnh form đã điền
    await page.screenshot({ path: 'opponents-form.png' });
    console.log('Đã chụp ảnh form đăng tin: opponents-form.png');

    // Theo dõi network requests
    let postRequestDetected = false;
    let postRequestUrl = '';
    let postRequestData = {};

    page.on('request', request => {
      if (request.url().includes('/api/opponents') && request.method() === 'POST') {
        postRequestDetected = true;
        postRequestUrl = request.url();
        try {
          postRequestData = request.postDataJSON();
        } catch (e) {
          postRequestData = { error: 'Không thể parse dữ liệu POST' };
        }
      }
    });

    // Click nút "Đăng tin" - sử dụng JavaScript để click trực tiếp
    try {
      // Chụp ảnh trước khi click
      await page.screenshot({ path: 'opponents-before-click.png' });

      // Tìm nút bằng nhiều cách
      const dialogFooterButtons = await page.$$('footer button, [role="dialog"] footer button, .dialog-footer button');
      if (dialogFooterButtons.length > 0) {
        console.log(`Tìm thấy ${dialogFooterButtons.length} nút trong footer của dialog`);
        await dialogFooterButtons[0].click();
        console.log('✅ Đã click nút trong footer của dialog');
      } else {
        // Sử dụng JavaScript để click nút
        const clicked = await page.evaluate(() => {
          // Tìm tất cả các nút trong dialog
          const buttons = Array.from(document.querySelectorAll('div[role="dialog"] button'));
          // Tìm nút có text "Đăng tin"
          const submitButton = buttons.find(button => button.textContent.includes('Đăng tin'));
          if (submitButton) {
            submitButton.click();
            return true;
          }
          return false;
        });

        if (clicked) {
          console.log('✅ Đã click nút "Đăng tin" bằng JavaScript');
        } else {
          console.log('❌ Không tìm thấy nút "Đăng tin" bằng JavaScript');
        }
      }
    } catch (error) {
      console.log('❌ Lỗi khi click nút "Đăng tin":', error.message);
    }

    // Đợi một chút để request được gửi
    await page.waitForTimeout(3000);

    if (postRequestDetected) {
      console.log('✅ Đã gửi request POST đến:', postRequestUrl);
      console.log('Dữ liệu gửi đi:', postRequestData);

      // Đợi thông báo thành công hoặc lỗi
      await page.waitForSelector('[role="status"]', { timeout: 5000 }).catch(() => {});
      const toastMessage = await page.textContent('[role="status"]').catch(() => '');

      if (toastMessage) {
        console.log(`Thông báo: ${toastMessage}`);
        if (toastMessage.includes('thành công')) {
          console.log('✅ Đăng tin thành công');
        } else {
          console.log('❌ Đăng tin không thành công');
        }
      } else {
        console.log('❌ Không hiển thị thông báo sau khi đăng tin');
      }
    } else {
      console.log('❌ Không phát hiện request POST đến /api/opponents');
    }

    // Đóng dialog nếu vẫn mở
    const dialogStillOpen = await page.$('div[role="dialog"]');
    if (dialogStillOpen) {
      try {
        await page.click('button[aria-label="Close"]');
        console.log('Đã đóng dialog');
      } catch (error) {
        console.log('Không thể đóng dialog:', error.message);
      }
    }

    // Đợi trang tải lại
    await page.waitForTimeout(2000);

    // Kiểm tra xem đội mới có được thêm vào danh sách không
    try {
      const cards = await page.$$('.card');
      let newTeamAdded = false;

      for (const card of cards) {
        const teamName = await card.$eval('h3', el => el.textContent);
        if (teamName.includes('Đội Test Playwright')) {
          newTeamAdded = true;
          break;
        }
      }

      if (newTeamAdded) {
        console.log('✅ Đội mới đã được thêm vào danh sách');
      } else {
        console.log('❌ Đội mới chưa được thêm vào danh sách');
      }
    } catch (error) {
      console.log('❌ Lỗi khi kiểm tra đội mới:', error.message);
    }

    // 6. Kiểm tra chức năng phân trang (nếu có)
    console.log('\n6. Kiểm tra chức năng phân trang...');

    const hasPagination = await page.$('.pagination');
    if (hasPagination) {
      console.log('Trang có chức năng phân trang');

      // Đếm số trang
      const pageCount = await page.$$eval('button[size="sm"]', buttons =>
        buttons.filter(btn => !isNaN(parseInt(btn.textContent.trim()))).length
      );
      console.log(`Số trang: ${pageCount}`);

      if (pageCount > 1) {
        // Click vào trang 2
        await page.click('button:has-text("2")');
        await page.waitForTimeout(1000);

        // Kiểm tra xem danh sách đã thay đổi chưa
        const page2Teams = await page.$$eval('.space-y-4 .card', teams => teams.length);
        console.log(`Số đội ở trang 2: ${page2Teams}`);

        console.log('✅ Chức năng phân trang hoạt động');
      } else {
        console.log('Chỉ có 1 trang, không thể kiểm tra chức năng phân trang');
      }
    } else {
      console.log('Trang không có chức năng phân trang hoặc số lượng đội không đủ để phân trang');
    }

    console.log('\n✅ Hoàn thành kiểm tra trang Opponents');

  } catch (error) {
    console.error('❌ Lỗi trong quá trình kiểm tra:', error);
  } finally {
    // Chụp ảnh màn hình cuối cùng
    await page.screenshot({ path: 'opponents-final.png', fullPage: true });
    console.log('Đã chụp ảnh màn hình cuối: opponents-final.png');

    // Đóng trình duyệt
    await browser.close();
    console.log('Đã đóng trình duyệt');
  }
}

// Chạy test
testOpponentsPage();
