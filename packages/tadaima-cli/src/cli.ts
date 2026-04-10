import { intro, outro, spinner } from '@clack/prompts';
import { getArgs } from './lib/args';
import { getPrompts } from './lib/prompts';
import { generateTemplate } from './lib/generator';

const main = async () => {
  // Parse command-line arguments
  const args = getArgs();

  // Start the CLI introduction //
  intro('create-tadaima');

  // Prompt the user for any missing information
  const config = await getPrompts(args);

  // Generate the project template based on the provided configuration
  const s = spinner();
  s.start('Generating project...');
  try {
    const targetDir = await generateTemplate(config);
    s.stop('Project generated.');
    outro(`Created ${config.projectName} at ${targetDir}`);
  } catch (err) {
    s.stop('Failed.');
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error('Unknown error occurred.');
    }
    process.exit(1);
  }
  // Finish the CLI introduction //
};

main();

