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
            { label: 'API Overview', slug: 'guide/api-overview' },
            { label: 'Architecture', slug: 'guide/architecture' },
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
