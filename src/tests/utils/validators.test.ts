import { describe, it, expect } from 'vitest';
import {
  validateUsername,
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateBio,
  validateSignupForm,
} from '@/lib/utils/validators';

describe('validateUsername', () => {
  it('accepts valid lowercase usernames', () => {
    expect(validateUsername('moviebuff').valid).toBe(true);
    expect(validateUsername('movie.buff').valid).toBe(true);
    expect(validateUsername('movie_buff').valid).toBe(true);
    expect(validateUsername('abc').valid).toBe(true);
    expect(validateUsername('user123').valid).toBe(true);
    expect(validateUsername('a.b_c').valid).toBe(true);
  });

  it('rejects empty or blank', () => {
    expect(validateUsername('').valid).toBe(false);
    expect(validateUsername('   ').valid).toBe(false);
  });

  it('rejects too short (< 3 chars)', () => {
    expect(validateUsername('ab').valid).toBe(false);
  });

  it('rejects too long (> 20 chars)', () => {
    expect(validateUsername('a'.repeat(21)).valid).toBe(false);
  });

  it('rejects special characters, spaces, and dashes', () => {
    expect(validateUsername('user name').valid).toBe(false);
    expect(validateUsername('user-name').valid).toBe(false); // dashes NOT allowed
    expect(validateUsername('user@name').valid).toBe(false);
    expect(validateUsername('user!name').valid).toBe(false);
  });

  it('auto-lowercases uppercase input (trimmed.toLowerCase is called)', () => {
    // The validator lowercases internally, so UPPER input should pass if otherwise valid
    expect(validateUsername('MovieBuff').valid).toBe(true);
  });
});

describe('validateDisplayName', () => {
  it('accepts valid display names', () => {
    expect(validateDisplayName('John Doe').valid).toBe(true);
    expect(validateDisplayName('Movie Fan 🎬').valid).toBe(true);
  });

  it('rejects empty string', () => {
    expect(validateDisplayName('').valid).toBe(false);
    expect(validateDisplayName('  ').valid).toBe(false);
  });

  it('rejects over 50 characters', () => {
    expect(validateDisplayName('a'.repeat(51)).valid).toBe(false);
  });

  it('accepts exactly 50 characters', () => {
    expect(validateDisplayName('a'.repeat(50)).valid).toBe(true);
  });
});

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com').valid).toBe(true);
    expect(validateEmail('user+tag@mail.org').valid).toBe(true);
  });

  it('rejects empty', () => {
    expect(validateEmail('').valid).toBe(false);
  });

  it('rejects malformed emails', () => {
    expect(validateEmail('notanemail').valid).toBe(false);
    expect(validateEmail('missing@').valid).toBe(false);
    expect(validateEmail('@domain.com').valid).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts strong passwords', () => {
    expect(validatePassword('Password1').valid).toBe(true);
    expect(validatePassword('SuperSecret99').valid).toBe(true);
    expect(validatePassword('Abc12345').valid).toBe(true);
  });

  it('rejects empty password', () => {
    expect(validatePassword('').valid).toBe(false);
  });

  it('rejects password under 8 characters', () => {
    expect(validatePassword('Pass1').valid).toBe(false);
  });

  it('rejects password without uppercase', () => {
    expect(validatePassword('password1').valid).toBe(false);
  });

  it('rejects password without a number', () => {
    expect(validatePassword('PasswordABC').valid).toBe(false);
  });
});

describe('validateBio', () => {
  it('accepts empty bio', () => {
    expect(validateBio('').valid).toBe(true);
  });

  it('accepts bio within 280 chars', () => {
    expect(validateBio('Hello world').valid).toBe(true);
  });

  it('rejects bio over 280 chars', () => {
    expect(validateBio('a'.repeat(281)).valid).toBe(false);
  });
});

describe('validateSignupForm', () => {
  const validData = {
    username: 'john_doe',
    displayName: 'John Doe',
    email: 'john@example.com',
    password: 'Password1',
  };

  it('returns valid for correct data', () => {
    const result = validateSignupForm(validData);
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('returns all errors for all-empty input', () => {
    const result = validateSignupForm({ username: '', displayName: '', email: '', password: '' });
    expect(result.valid).toBe(false);
    expect(result.errors.username).toBeTruthy();
    expect(result.errors.displayName).toBeTruthy();
    expect(result.errors.email).toBeTruthy();
    expect(result.errors.password).toBeTruthy();
  });

  it('returns specific error for bad password only', () => {
    const result = validateSignupForm({ ...validData, password: 'weak' });
    expect(result.valid).toBe(false);
    expect(result.errors.password).toBeTruthy();
    expect(result.errors.email).toBeUndefined();
  });

  it('returns specific error for bad username only', () => {
    const result = validateSignupForm({ ...validData, username: 'x!' });
    expect(result.valid).toBe(false);
    expect(result.errors.username).toBeTruthy();
    expect(result.errors.password).toBeUndefined();
  });
});
