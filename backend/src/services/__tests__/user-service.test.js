'use strict';

process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'todolist_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.JWT_SECRET = 'test_jwt_secret_at_least_32_chars_long';
process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_at_least_32chars';

jest.mock('../../repositories/user-repository');
jest.mock('../../utils/password');

const { userRepository } = require('../../repositories/user-repository');
const { comparePassword, hashPassword } = require('../../utils/password');
const { userService } = require('../user-service');
const { ErrorCode } = require('../../constants/error-codes');

beforeEach(() => {
  jest.clearAllMocks();
});

function makeUser(overrides = {}) {
  return {
    userId: 'user-1',
    email: 'user@example.com',
    password: 'hashedpw',
    name: 'Original Name',
    provider: 'local',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('userService.updateProfile', () => {
  it('throws 404 NOT_FOUND when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(userService.updateProfile('user-1', { name: 'New Name' }))
      .rejects.toMatchObject({ code: ErrorCode.NOT_FOUND, statusCode: 404 });
  });

  it('throws 400 INVALID_INPUT when newPassword is provided without currentPassword', async () => {
    userRepository.findById.mockResolvedValue(makeUser());

    await expect(userService.updateProfile('user-1', { newPassword: 'newpw123' }))
      .rejects.toMatchObject({ code: ErrorCode.INVALID_INPUT, statusCode: 400 });
  });

  it('throws 401 UNAUTHORIZED when currentPassword is wrong', async () => {
    userRepository.findById.mockResolvedValue(makeUser());
    comparePassword.mockResolvedValue(false);

    await expect(userService.updateProfile('user-1', {
      currentPassword: 'wrongpw',
      newPassword: 'newpw123',
    })).rejects.toMatchObject({ code: ErrorCode.UNAUTHORIZED, statusCode: 401 });
  });

  it('updates name successfully and returns user without password', async () => {
    const user = makeUser();
    userRepository.findById
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce({ ...user, name: 'New Name' });
    userRepository.updateName.mockResolvedValue({ ...user, name: 'New Name' });

    const result = await userService.updateProfile('user-1', { name: 'New Name' });

    expect(userRepository.updateName).toHaveBeenCalledWith('user-1', 'New Name');
    expect(result).not.toHaveProperty('password');
    expect(result.name).toBe('New Name');
  });

  it('updates password successfully when currentPassword is correct', async () => {
    const user = makeUser();
    userRepository.findById
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce(user);
    comparePassword.mockResolvedValue(true);
    hashPassword.mockResolvedValue('newhashedpw');
    userRepository.updatePassword.mockResolvedValue();

    const result = await userService.updateProfile('user-1', {
      currentPassword: 'currentpw',
      newPassword: 'newpw123',
    });

    expect(comparePassword).toHaveBeenCalledWith('currentpw', 'hashedpw');
    expect(hashPassword).toHaveBeenCalledWith('newpw123');
    expect(userRepository.updatePassword).toHaveBeenCalledWith('user-1', 'newhashedpw');
    expect(result).not.toHaveProperty('password');
  });

  it('updates both name and password when both provided with correct currentPassword', async () => {
    const user = makeUser();
    userRepository.findById
      .mockResolvedValueOnce(user)
      .mockResolvedValueOnce({ ...user, name: 'New Name' });
    comparePassword.mockResolvedValue(true);
    hashPassword.mockResolvedValue('newhashedpw');
    userRepository.updateName.mockResolvedValue();
    userRepository.updatePassword.mockResolvedValue();

    const result = await userService.updateProfile('user-1', {
      name: 'New Name',
      currentPassword: 'currentpw',
      newPassword: 'newpw123',
    });

    expect(userRepository.updateName).toHaveBeenCalledWith('user-1', 'New Name');
    expect(userRepository.updatePassword).toHaveBeenCalledWith('user-1', 'newhashedpw');
    expect(result).not.toHaveProperty('password');
  });
});
