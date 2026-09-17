/**
 * Form validation helpers for GAVEL.
 * Each function returns null if valid, or a descriptive error string.
 */

/**
 * @param {string} value
 * @returns {string|null}
 */
export function validateRequired(value, fieldName = 'This field') {
  if (!value || String(value).trim() === '') {
    return `${fieldName} is required.`;
  }
  return null;
}

/**
 * @param {string} email
 * @returns {string|null}
 */
export function validateEmail(email) {
  if (!email || String(email).trim() === '') return 'Email is required.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(String(email).trim())) return 'Please enter a valid email address.';
  return null;
}

/**
 * Password must be at least 8 characters, contain one uppercase,
 * one lowercase, one digit, and one special character.
 * @param {string} password
 * @returns {string|null}
 */
export function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
  if (!/\d/.test(password)) return 'Password must contain at least one number.';
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

/**
 * Confirm password matches.
 * @param {string} password
 * @param {string} confirmPassword
 * @returns {string|null}
 */
export function validatePasswordConfirm(password, confirmPassword) {
  if (!confirmPassword) return 'Please confirm your password.';
  if (password !== confirmPassword) return 'Passwords do not match.';
  return null;
}

/**
 * Validate a GAVEL Case Hash ID.
 * Backend format: GAV-YY-XXXXXX (e.g. GAV-26-8A3F9)
 * The live backend accepts only its canonical GAV-YY-XXXXXX format.
 * @param {string} hashId
 * @returns {string|null}
 */
export function validateCaseHashId(hashId) {
  if (!hashId || String(hashId).trim() === '') return 'Case Hash ID is required.';
  const normalized = String(hashId).trim().toUpperCase();
  // Backend canonical format
  const backendFormat = /^GAV-\d{2}-[A-Z0-9]+$/;
  if (!backendFormat.test(normalized)) {
    return 'Please enter a valid Case Hash ID (e.g. GAV-26-8A3F9).';
  }
  return null;
}

/**
 * Validate a Nigerian phone number (loosely: 10–14 digits, optional +234 prefix).
 * @param {string} phone
 * @returns {string|null}
 */
export function validatePhone(phone) {
  if (!phone) return null; // Phone is typically optional
  const re = /^(\+234|0)[789]\d{9}$/;
  if (!re.test(String(phone).replace(/\s/g, ''))) {
    return 'Please enter a valid Nigerian phone number (e.g. 08012345678).';
  }
  return null;
}

/**
 * Run multiple validators against the same value.
 * Returns the first error encountered, or null.
 * @param {string} value
 * @param {Array<(v: string) => string|null>} validators
 * @returns {string|null}
 */
export function runValidators(value, validators) {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return null;
}
