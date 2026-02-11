import { VALIDATION } from './constants';

// Email validation
export const isValidEmail = (email) => {
  return VALIDATION.EMAIL_REGEX.test(email);
};

// Password validation
export const isValidPassword = (password) => {
  return password.length >= VALIDATION.PASSWORD_MIN_LENGTH;
};

// Required field validation
export const isRequired = (value) => {
  return value !== null && value !== undefined && value.trim() !== '';
};

// Min length validation
export const minLength = (value, min) => {
  return value.length >= min;
};

// Max length validation
export const maxLength = (value, max) => {
  return value.length <= max;
};

// Number validation
export const isNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Phone number validation (basic)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

// URL validation
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Match validation (for password confirmation)
export const isMatch = (value1, value2) => {
  return value1 === value2;
};

// Form validation helper
export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const fieldRules = rules[field];
    const value = values[field];

    if (fieldRules.required && !isRequired(value)) {
      errors[field] = fieldRules.required;
      return;
    }

    if (fieldRules.email && !isValidEmail(value)) {
      errors[field] = fieldRules.email;
      return;
    }

    if (fieldRules.minLength && !minLength(value, fieldRules.minLength.value)) {
      errors[field] = fieldRules.minLength.message;
      return;
    }

    if (fieldRules.maxLength && !maxLength(value, fieldRules.maxLength.value)) {
      errors[field] = fieldRules.maxLength.message;
      return;
    }

    if (fieldRules.match && !isMatch(value, values[fieldRules.match.field])) {
      errors[field] = fieldRules.match.message;
      return;
    }
  });

  return errors;
};

export default {
  isValidEmail,
  isValidPassword,
  isRequired,
  minLength,
  maxLength,
  isNumber,
  isValidPhone,
  isValidUrl,
  isMatch,
  validateForm,
};
