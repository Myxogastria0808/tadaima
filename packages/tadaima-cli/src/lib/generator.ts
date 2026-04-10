import fs from 'node:fs/promises';
import path from 'node:path';
import type { ProjectConfigType } from './prompts';

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

export const generateTemplate = async (config: ProjectConfigType): Promise<string> => {
  const templatesDir = path.resolve(import.meta.dirname, '..', 'templates');
  // Define the absolute path to the target directory based on the current working directory and the project name
  const targetDir = path.resolve(process.cwd(), config.projectName);

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
  await copyDir(path.join(templatesDir, 'common'), targetDir, config.projectName);
  // Copy platform-specific files
  await copyDir(path.join(templatesDir, config.platform), targetDir, config.projectName);

  return targetDir;
};

