import { describe, test, expect } from 'vitest';
import { isCurrentWorkingDirectory, isValidProjectName, isValidPlatform } from '../src/lib/validate';

describe('isCurrentWorkingDirectory', () => {
  test.concurrent('returns true for "."', () => {
    expect(isCurrentWorkingDirectory('.')).toBe(true);
  });

  test.concurrent('returns true for "./"', () => {
    expect(isCurrentWorkingDirectory('./')).toBe(true);
  });

  test.concurrent('returns true for "./."', () => {
    expect(isCurrentWorkingDirectory('./.')).toBe(true);
  });

  test.concurrent('returns false for regular names', () => {
    expect(isCurrentWorkingDirectory('my-greeter')).toBe(false);
  });

  test.concurrent('returns false for empty string', () => {
    expect(isCurrentWorkingDirectory('')).toBe(false);
  });
});

describe('isValidProjectName', () => {
  test.concurrent('returns true for valid npm package names', () => {
    expect(isValidProjectName('my-greeter')).toBe(true);
    expect(isValidProjectName('greeter')).toBe(true);
    expect(isValidProjectName('my-cool-greeter')).toBe(true);
  });

  test.concurrent('returns true for cwd indicators', () => {
    expect(isValidProjectName('.')).toBe(true);
    expect(isValidProjectName('./')).toBe(true);
  });

  test.concurrent('returns error string for uppercase names', () => {
    expect(isValidProjectName('MyGreeter')).not.toBe(true);
  });

  test.concurrent('returns error string for names with spaces', () => {
    expect(isValidProjectName('my greeter')).not.toBe(true);
  });

  test.concurrent('returns error string for names with special characters', () => {
    expect(isValidProjectName('my!greeter')).not.toBe(true);
  });

  test.concurrent('returns error string for empty string', () => {
    expect(isValidProjectName('')).not.toBe(true);
  });
});

describe('isValidPlatform', () => {
  test.concurrent('returns true for valid platforms', () => {
    expect(isValidPlatform('arch')).toBe(true);
    expect(isValidPlatform('nixos')).toBe(true);
    expect(isValidPlatform('nix')).toBe(true);
  });

  test.concurrent('returns false for invalid platforms', () => {
    expect(isValidPlatform('ubuntu')).toBe(false);
    expect(isValidPlatform('windows')).toBe(false);
    expect(isValidPlatform('')).toBe(false);
  });
});
