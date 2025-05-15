/**
 * Date Utility Functions
 * 
 * This file contains utility functions for working with dates.
 */

/**
 * Format a date string to a human-readable format
 * @param dateString - Date string in ISO format
 * @param includeTime - Whether to include time in the output
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, includeTime = false): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format a time string (HH:MM:SS) to a human-readable format (HH:MM AM/PM)
 * @param timeString - Time string in HH:MM:SS format
 * @returns Formatted time string
 */
export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  
  // Handle full ISO date strings
  if (timeString.includes('T')) {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  // Handle HH:MM:SS format
  const [hours, minutes] = timeString.split(':');
  const hoursNum = parseInt(hours, 10);
  const period = hoursNum >= 12 ? 'PM' : 'AM';
  const hours12 = hoursNum % 12 || 12;
  
  return `${hours12}:${minutes} ${period}`;
};

/**
 * Get the day of the week for a date
 * @param dateString - Date string in ISO format
 * @returns Day of the week (e.g., "Monday")
 */
export const getDayOfWeek = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return '';
  }
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
};

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param dateString - Date string in ISO format
 * @returns True if the date is a weekend, false otherwise
 */
export const isWeekend = (dateString: string): boolean => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return false;
  }
  
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

/**
 * Get the current date in ISO format (YYYY-MM-DD)
 * @returns Current date in ISO format
 */
export const getCurrentDate = (): string => {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

/**
 * Get a date in the future or past
 * @param days - Number of days to add (positive) or subtract (negative)
 * @returns Date in ISO format
 */
export const getRelativeDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Format a price in VND
 * @param price - Price in VND
 * @returns Formatted price string
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Calculate the duration between two time strings
 * @param startTime - Start time in HH:MM:SS format
 * @param endTime - End time in HH:MM:SS format
 * @returns Duration in hours
 */
export const calculateDuration = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;
  
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;
  
  const durationMinutes = endTotalMinutes - startTotalMinutes;
  return durationMinutes / 60;
};
