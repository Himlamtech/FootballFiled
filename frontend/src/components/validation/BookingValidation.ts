
interface ValidationResult {
  isValid: boolean;
  message?: string;
}

// Hàm kiểm tra tên
export const validateName = (name: string): ValidationResult => {
  if (!name.trim()) {
    return {
      isValid: false,
      message: "Vui lòng nhập họ tên"
    };
  }
  
  if (name.trim().length < 3) {
    return {
      isValid: false,
      message: "Họ tên phải có ít nhất 3 ký tự"
    };
  }
  
  return { isValid: true };
};

// Hàm kiểm tra số điện thoại
export const validatePhone = (phone: string): ValidationResult => {
  // Xóa khoảng trắng và dấu gạch ngang
  const phoneNumber = phone.replace(/\s+|-/g, "");
  
  // Kiểm tra số điện thoại Việt Nam
  // Chấp nhận cả +84 và 0 ở đầu
  const vnPhoneRegex = /^(?:\+84|84|0)(?:\d{9}|\d{10})$/;
  
  if (!phoneNumber) {
    return {
      isValid: false,
      message: "Vui lòng nhập số điện thoại"
    };
  }
  
  if (!vnPhoneRegex.test(phoneNumber)) {
    return {
      isValid: false,
      message: "Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (+84, 84 hoặc 0)"
    };
  }
  
  return { isValid: true };
};

// Hàm kiểm tra email
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return {
      isValid: false,
      message: "Vui lòng nhập email"
    };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: "Email không hợp lệ"
    };
  }
  
  return { isValid: true };
};

// Hàm chuẩn hóa số điện thoại sang dạng +84
export const formatPhoneNumber = (phone: string): string => {
  // Xóa khoảng trắng và dấu gạch ngang
  const phoneNumber = phone.replace(/\s+|-/g, "");
  
  // Nếu bắt đầu bằng 0, đổi thành +84
  if (phoneNumber.startsWith('0')) {
    return '+84' + phoneNumber.substring(1);
  }
  
  // Nếu bắt đầu bằng 84 nhưng không có +, thêm + vào
  if (phoneNumber.startsWith('84') && !phoneNumber.startsWith('+84')) {
    return '+' + phoneNumber;
  }
  
  // Nếu đã là định dạng +84, giữ nguyên
  return phoneNumber;
};

// Hàm kiểm tra toàn bộ thông tin
export const validateBookingInfo = (name: string, phone: string, email: string): ValidationResult => {
  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    return nameValidation;
  }
  
  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.isValid) {
    return phoneValidation;
  }
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return emailValidation;
  }
  
  return { isValid: true };
};
