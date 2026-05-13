'use strict';

const { hashPassword, comparePassword } = require('../password');

describe('hashPassword', () => {
  it('returns a bcrypt hash string starting with $2b$', async () => {
    const hash = await hashPassword('mySecret123');
    expect(typeof hash).toBe('string');
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  it('returns a different hash each call (salted)', async () => {
    const hash1 = await hashPassword('samePassword');
    const hash2 = await hashPassword('samePassword');
    expect(hash1).not.toBe(hash2);
  });

  it('produces a hash of expected length (60 chars)', async () => {
    const hash = await hashPassword('anyPassword');
    expect(hash.length).toBe(60);
  });
});

describe('comparePassword', () => {
  it('returns true for the correct password', async () => {
    const plain = 'correctPassword';
    const hash = await hashPassword(plain);
    const result = await comparePassword(plain, hash);
    expect(result).toBe(true);
  });

  it('returns false for a wrong password', async () => {
    const hash = await hashPassword('correctPassword');
    const result = await comparePassword('wrongPassword', hash);
    expect(result).toBe(false);
  });

  it('returns false for an empty string against a hashed password', async () => {
    const hash = await hashPassword('somePassword');
    const result = await comparePassword('', hash);
    expect(result).toBe(false);
  });
});
