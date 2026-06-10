/**
 * Shared form validation helpers — used on both client and server side.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Username: 3–20 chars, alphanumeric + underscores, no spaces */
export function validateUsername(value: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: 'Username is required.' };
  }
  const trimmed = value.trim();
  if (trimmed.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters.' };
  }
  if (trimmed.length > 20) {
    return { valid: false, error: 'Username must be 20 characters or less.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, and underscores.' };
  }
  return { valid: true };
}

/** Display name: 1–50 chars */
export function validateDisplayName(value: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: 'Display name is required.' };
  }
  if (value.trim().length > 50) {
    return { valid: false, error: 'Display name must be 50 characters or less.' };
  }
  return { valid: true };
}

/** Email: basic format check */
export function validateEmail(value: string): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: 'Email is required.' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  return { valid: true };
}

/**
 * Password: min 8 chars, at least 1 uppercase, 1 number.
 */
export function validatePassword(value: string): ValidationResult {
  if (!value) {
    return { valid: false, error: 'Password is required.' };
  }
  if (value.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters.' };
  }
  if (!/[A-Z]/.test(value)) {
    return { valid: false, error: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[0-9]/.test(value)) {
    return { valid: false, error: 'Password must contain at least one number.' };
  }
  return { valid: true };
}

/** Bio: optional, max 280 chars */
export function validateBio(value: string): ValidationResult {
  if (value && value.length > 280) {
    return { valid: false, error: 'Bio must be 280 characters or less.' };
  }
  return { valid: true };
}

export interface SignupFormErrors {
  username?: string;
  displayName?: string;
  email?: string;
  password?: string;
  [key: string]: string | undefined;
}

export function validateSignupForm(data: {
  username: string;
  displayName: string;
  email: string;
  password: string;
}): { valid: boolean; errors: SignupFormErrors } {
  const errors: SignupFormErrors = {};

  const usernameResult = validateUsername(data.username);
  if (!usernameResult.valid) errors.username = usernameResult.error;

  const displayNameResult = validateDisplayName(data.displayName);
  if (!displayNameResult.valid) errors.displayName = displayNameResult.error;

  const emailResult = validateEmail(data.email);
  if (!emailResult.valid) errors.email = emailResult.error;

  const passwordResult = validatePassword(data.password);
  if (!passwordResult.valid) errors.password = passwordResult.error;

  return { valid: Object.keys(errors).length === 0, errors };
}
