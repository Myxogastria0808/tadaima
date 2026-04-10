import { text, select, cancel, group } from '@clack/prompts';
import type { PlatformType } from './types';
import type { ArgsType } from './args';
import { isValidProjectName } from './validate';

export type ProjectConfigType = {
  projectName: string;
  platform: PlatformType;
};

export const getPrompts = async (args: ArgsType): Promise<ProjectConfigType> => {
  const project = await group(
    {
      projectName: async () => {
        // If the project name is provided as a command-line argument, use it directly
        if (args.projectName) return args.projectName;
        // Otherwise, prompt the user for the project name with validation
        return text({
          message: 'Project name:',
          placeholder: 'my-greeter',
          defaultValue: 'my-greeter',
          validate: (value) => {
            // Ensure that the project name is not empty and is valid according to npm package naming rules
            if (!value) return 'Project name is required.';
            // Validate the project name using the isValidProjectName function
            const check = isValidProjectName(value);
            if (check !== true) return check;
          },
        });
      },
      platform: async () => {
        // If the platform is provided as a command-line argument, use it directly
        if (args.platform) return args.platform;
        // Otherwise, prompt the user to select a platform from the options
        return select<PlatformType>({
          message: 'Platform:',
          options: [
            { label: 'Arch Linux', value: 'arch' },
            { label: 'NixOS', value: 'nixos' },
            { label: 'Nix (other distro)', value: 'nix' },
          ],
        });
      },
    },
    {
      // Handle cancellation of the prompt
      onCancel() {
        cancel('Cancelled.');
        process.exit(0);
      },
    }
  );

  return project satisfies ProjectConfigType;
};

