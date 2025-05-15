/**
 * Format Utility Functions
 * 
 * This file contains utility functions for formatting data.
 */

/**
 * Format a price in VND
 * @param price - Price in VND
 * @returns Formatted price string
 */
export const formatCurrency = (price: number): string => {
  if (price === undefined || price === null) return '';
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Format a booking status
 * @param status - Booking status
 * @returns Formatted status with appropriate color class
 */
export const formatBookingStatus = (status: string): { label: string; color: string } => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return { label: 'Pending', color: 'text-yellow-500 bg-yellow-100' };
    case 'confirmed':
      return { label: 'Confirmed', color: 'text-green-500 bg-green-100' };
    case 'cancelled':
      return { label: 'Cancelled', color: 'text-red-500 bg-red-100' };
    case 'completed':
      return { label: 'Completed', color: 'text-blue-500 bg-blue-100' };
    default:
      return { label: status || 'Unknown', color: 'text-gray-500 bg-gray-100' };
  }
};

/**
 * Format a payment status
 * @param status - Payment status
 * @returns Formatted status with appropriate color class
 */
export const formatPaymentStatus = (status: string): { label: string; color: string } => {
  switch (status?.toLowerCase()) {
    case 'unpaid':
      return { label: 'Unpaid', color: 'text-yellow-500 bg-yellow-100' };
    case 'paid':
      return { label: 'Paid', color: 'text-green-500 bg-green-100' };
    case 'refunded':
      return { label: 'Refunded', color: 'text-blue-500 bg-blue-100' };
    default:
      return { label: status || 'Unknown', color: 'text-gray-500 bg-gray-100' };
  }
};

/**
 * Format a feedback status
 * @param status - Feedback status
 * @returns Formatted status with appropriate color class
 */
export const formatFeedbackStatus = (status: string): { label: string; color: string } => {
  switch (status?.toLowerCase()) {
    case 'unread':
      return { label: 'Unread', color: 'text-yellow-500 bg-yellow-100' };
    case 'read':
      return { label: 'Read', color: 'text-blue-500 bg-blue-100' };
    case 'responded':
      return { label: 'Responded', color: 'text-green-500 bg-green-100' };
    default:
      return { label: status || 'Unknown', color: 'text-gray-500 bg-gray-100' };
  }
};

/**
 * Format an opponent status
 * @param status - Opponent status
 * @returns Formatted status with appropriate color class
 */
export const formatOpponentStatus = (status: string): { label: string; color: string } => {
  switch (status?.toLowerCase()) {
    case 'open':
      return { label: 'Open', color: 'text-green-500 bg-green-100' };
    case 'matched':
      return { label: 'Matched', color: 'text-blue-500 bg-blue-100' };
    case 'closed':
      return { label: 'Closed', color: 'text-gray-500 bg-gray-100' };
    default:
      return { label: status || 'Unknown', color: 'text-gray-500 bg-gray-100' };
  }
};

/**
 * Format a skill level
 * @param level - Skill level
 * @returns Formatted skill level with appropriate color class
 */
export const formatSkillLevel = (level: string): { label: string; color: string } => {
  switch (level?.toLowerCase()) {
    case 'beginner':
      return { label: 'Beginner', color: 'text-green-500 bg-green-100' };
    case 'intermediate':
      return { label: 'Intermediate', color: 'text-yellow-500 bg-yellow-100' };
    case 'advanced':
      return { label: 'Advanced', color: 'text-red-500 bg-red-100' };
    default:
      return { label: level || 'Unknown', color: 'text-gray-500 bg-gray-100' };
  }
};

/**
 * Truncate a string to a specified length
 * @param str - String to truncate
 * @param length - Maximum length
 * @returns Truncated string
 */
export const truncateString = (str: string, length: number): string => {
  if (!str) return '';
  
  if (str.length <= length) return str;
  
  return `${str.substring(0, length)}...`;
};

/**
 * Format a phone number
 * @param phone - Phone number
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Format Vietnamese phone numbers
  if (phone.startsWith('0') && phone.length === 10) {
    return `${phone.substring(0, 4)} ${phone.substring(4, 7)} ${phone.substring(7)}`;
  }
  
  return phone;
};
