/**
 * CLI argument parsing and validation.
 * @module args
 */
import { parseArgs } from 'node:util';
import type { PlatformType } from './types';
import { isValidProjectName, isValidPlatform } from './validate';

/** Parsed and validated CLI arguments. */
export type ArgsType = {
  projectName?: string;
  platform?: PlatformType;
};

const HELP = `
Usage: create-tadaima [directory] [options]

Options:
  -p, --platform <platform>  Target platform (arch, nixos, nix)
  -h, --help                 Display this help message

Examples:
  create-tadaima
  create-tadaima my-greeter
  create-tadaima my-greeter --platform nixos
  create-tadaima .
`;

/**
 * Parses and validates CLI arguments.
 * Exits the process on `--help`/`-h` or invalid input.
 *
 * @returns Parsed arguments with optional `projectName` and `platform`
 */
export const getArgs = (): ArgsType => {
  // Parse command-line arguments
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      platform: { type: 'string', short: 'p' },
      help: { type: 'boolean', short: 'h' },
    },
  });

  // Handle help flag
  if (values.help) {
    console.info(HELP);
    process.exit(0);
  }

  // Only one positional argument is allowed for the project name
  if (positionals.length > 1) {
    console.error('Too many positional arguments. Only one is allowed for the project name.');
    process.exit(1);
  }

  // Extract project name and platform from parsed arguments
  const projectName = positionals[0];
  const platform = values.platform;

  // Validate project name if provided
  if (projectName) {
    const check = isValidProjectName(projectName);
    if (check !== true) {
      console.error(`${check}`);
      process.exit(1);
    }
  }

  // Validate platform if provided
  if (platform && !isValidPlatform(platform)) {
    console.error(`Invalid platform: ${platform} (expected: arch, nixos, nix)`);
    process.exit(1);
  }

  return {
    projectName,
    platform: platform as PlatformType | undefined,
  };
};
