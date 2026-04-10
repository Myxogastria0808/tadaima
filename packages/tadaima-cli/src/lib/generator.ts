/**
 * Template generation logic.
 * Copies common and platform-specific template files to the target directory,
 * replacing `{{projectName}}` placeholders.
 * @module generator
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import type { ProjectConfigType } from './prompts';
import { isCurrentWorkingDirectory } from './validate';

/**
 * Recursively copies a directory, replacing `{{projectName}}` in file contents.
 *
 * @param src - Source directory path
 * @param target - Target directory path
 * @param projectName - Project name to substitute into templates
 */
const copyDir = async (src: string, target: string, projectName: string): Promise<void> => {
  // Read the contents of the src directory, including file types
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    // Construct the absolute paths for the source and target entries
    const srcPath = path.join(src, entry.name);
    const targetPath = path.join(target, entry.name);

    if (entry.isDirectory()) {
      // If the entry is a directory, create the corresponding target directory and recursively copy its contents
      await fs.mkdir(targetPath, { recursive: true });
      // Recursively copy the contents of the directory
      await copyDir(srcPath, targetPath, projectName);
    } else {
      // If the entry is a file, read its content, replace placeholders, and write it to the target path
      const content = await fs.readFile(srcPath, 'utf-8');
      // Replace all occurrences of '{{projectName}}' with the actual project name in the file content
      // e.g. package.json etc.
      await fs.writeFile(targetPath, content.replaceAll('{{projectName}}', projectName));
    }
  }
};

/**
 * Generates a tadaima greeter project from templates.
 * Copies common files and platform-specific files to the target directory.
 * When a cwd indicator (`.`, `./`, `./.`) is given as project name,
 * the directory basename is used for `{{projectName}}` substitution.
 *
 * @param config - Project configuration (project name and platform)
 * @returns Absolute path to the generated project directory
 * @throws If the target directory is not empty or an unknown error occurs
 */
export const generateTemplate = async (config: ProjectConfigType): Promise<string> => {
  const templatesDir = path.resolve(import.meta.dirname, '..', 'templates');
  const targetDir = path.resolve(process.cwd(), config.projectName);
  // Use directory basename as project name when cwd is specified (e.g. ".")
  const projectName = isCurrentWorkingDirectory(config.projectName) ? path.basename(targetDir) : config.projectName;

  // Check if target directory already exists and is non-empty
  try {
    // Read the contents of the target directory
    const entries = await fs.readdir(targetDir);
    if (entries.length > 0) {
      throw new Error(`Directory "${targetDir}" is not empty.`);
    }
  } catch (error) {
    if (error instanceof Error) {
      // ENOENT means the directory does not exist — this is expected
      if (!('code' in error && error.code === 'ENOENT')) {
        throw new Error(error.message);
      }
    } else {
      throw new Error('Unknown error occurred.');
    }
  }

  // Create target directory
  await fs.mkdir(targetDir, { recursive: true });

  // Copy common files
  await copyDir(path.join(templatesDir, 'common'), targetDir, projectName);
  // Copy platform-specific files
  await copyDir(path.join(templatesDir, config.platform), targetDir, projectName);

  return targetDir;
};

