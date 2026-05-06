import { describe, it, expect } from 'vitest';
import { AppError } from './errorHandler.js';

describe('AppError', () => {
  it('creates an error with the correct message and status code', () => {
    const error = new AppError('Bir hata oluştu', 404);
    expect(error.message).toBe('Bir hata oluştu');
    expect(error.statusCode).toBe(404);
    expect(error.isOperational).toBe(true);
  });

  it('is instance of Error', () => {
    const error = new AppError('test', 400);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('captures stack trace', () => {
    const error = new AppError('test', 500);
    expect(error.stack).toBeTruthy();
  });
});
