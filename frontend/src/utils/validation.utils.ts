/**
 * Validation Utility Functions
 * 
 * This file contains utility functions for form validation.
 */

/**
 * Validate an email address
 * @param email - Email address to validate
 * @returns True if the email is valid, false otherwise
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate a phone number (Vietnamese format)
 * @param phone - Phone number to validate
 * @returns True if the phone number is valid, false otherwise
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Vietnamese phone number format: 10 digits, starting with 0
  const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
  return phoneRegex.test(phone);
};

/**
 * Validate a password
 * @param password - Password to validate
 * @returns True if the password is valid, false otherwise
 */
export const isValidPassword = (password: string): boolean => {
  if (!password) return false;
  
  // Password must be at least 6 characters
  return password.length >= 6;
};

/**
 * Validate a name
 * @param name - Name to validate
 * @returns True if the name is valid, false otherwise
 */
export const isValidName = (name: string): boolean => {
  if (!name) return false;
  
  // Name must be at least 3 characters
  return name.trim().length >= 3;
};

/**
 * Validate a date
 * @param date - Date to validate (YYYY-MM-DD)
 * @returns True if the date is valid, false otherwise
 */
export const isValidDate = (date: string): boolean => {
  if (!date) return false;
  
  // Check if the date is in the correct format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  // Check if the date is valid
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

/**
 * Validate a future date
 * @param date - Date to validate (YYYY-MM-DD)
 * @returns True if the date is valid and in the future, false otherwise
 */
export const isValidFutureDate = (date: string): boolean => {
  if (!isValidDate(date)) return false;
  
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return dateObj >= today;
};

/**
 * Validate a price
 * @param price - Price to validate
 * @returns True if the price is valid, false otherwise
 */
export const isValidPrice = (price: number): boolean => {
  if (price === undefined || price === null) return false;
  
  // Price must be a positive number
  return price > 0;
};

/**
 * Validate a required field
 * @param value - Value to validate
 * @returns True if the value is not empty, false otherwise
 */
export const isRequired = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  return true;
};

/**
 * Validate a number
 * @param value - Value to validate
 * @returns True if the value is a valid number, false otherwise
 */
export const isValidNumber = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  
  if (typeof value === 'number') {
    return !isNaN(value);
  }
  
  if (typeof value === 'string') {
    return !isNaN(Number(value));
  }
  
  return false;
};

/**
 * Validate a positive number
 * @param value - Value to validate
 * @returns True if the value is a valid positive number, false otherwise
 */
export const isValidPositiveNumber = (value: any): boolean => {
  if (!isValidNumber(value)) return false;
  
  return Number(value) > 0;
};

/**
 * Validate a non-negative number
 * @param value - Value to validate
 * @returns True if the value is a valid non-negative number, false otherwise
 */
export const isValidNonNegativeNumber = (value: any): boolean => {
  if (!isValidNumber(value)) return false;
  
  return Number(value) >= 0;
};
