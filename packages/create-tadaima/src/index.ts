/**
 * create-tadaima — Scaffold a tadaima greeter project.
 *
 * @packageDocumentation
 */
export { getArgs } from './lib/args';
export type { ArgsType } from './lib/args';
export { generateTemplate } from './lib/generator';
export { getPrompts } from './lib/prompts';
export type { ProjectConfigType } from './lib/prompts';
export type { PlatformType } from './lib/types';
export { isCurrentWorkingDirectory, isValidProjectName, isValidPlatform } from './lib/validate';
