/**
 * Validation utilities for CLI input.
 * @module validate
 */
import validate from 'validate-npm-package-name';

/**
 * Checks if the given value represents the current working directory.
 *
 * @param value - The string to check
 * @returns `true` if the value is `.`, `./`, or `./.`
 */
export const isCurrentWorkingDirectory = (value: string): boolean => {
  return ['.', './', './.'].includes(value);
};

/**
 * Validates a project name against npm package naming rules.
 * Current working directory indicators (`.`, `./`, `./.`) are always valid.
 *
 * @param value - The project name to validate
 * @returns `true` if valid, or an error message string if invalid
 */
export const isValidProjectName = (value: string): true | string => {
  if (isCurrentWorkingDirectory(value)) return true;

  const result = validate(value);
  if (result.validForNewPackages) return true;

  if (result.errors) {
    return `Invalid project name: ${result.errors.join(', ')}`;
  } else {
    return 'Invalid project name';
  }
};

/**
 * Checks if the given value is a valid platform identifier.
 *
 * @param value - The platform string to validate
 * @returns `true` if the value is `arch`, `nixos`, or `nix`
 */
export const isValidPlatform = (value: string): boolean => {
  return ['arch', 'nixos', 'nix'].includes(value);
};

