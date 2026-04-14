// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: 'tadaima',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/Myxogastria0808/tadaima',
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Introduction', slug: 'getting-started/introduction' },
            { label: 'NixOS', slug: 'getting-started/nixos' },
            { label: 'Nix (non-NixOS)', slug: 'getting-started/nix' },
            { label: 'Arch Linux', slug: 'getting-started/arch' },
          ],
        },
        {
          label: 'Guide',
          items: [
            { label: 'Usage', slug: 'guide/usage' },
            {
              label: 'API Docs (@myxogastria0808/tadaima)',
              link: 'https://myxogastria0808.github.io/tadaima/tadaima/',
              attrs: { target: '_blank' },
            },
            {
              label: 'API Docs (@myxogastria0808/create-tadaima)',
              link: 'https://myxogastria0808.github.io/tadaima/create-tadaima/',
              attrs: { target: '_blank' },
            },
          ],
        },
        {
          label: 'Examples',
          items: [
            { label: 'NixOS', slug: 'guide/examples/nixos' },
            { label: 'Nix (non-NixOS)', slug: 'guide/examples/nix' },
            { label: 'Arch Linux', slug: 'guide/examples/arch' },
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
});
