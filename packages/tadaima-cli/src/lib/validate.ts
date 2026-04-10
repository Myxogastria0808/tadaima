import validate from 'validate-npm-package-name';

export const isCurrentWorkingDirectory = (value: string): boolean => {
  return ['.', './', './.'].includes(value);
};

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

export const isValidPlatform = (value: string): boolean => {
  return ['arch', 'nixos', 'nix'].includes(value);
};

