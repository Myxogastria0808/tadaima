// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "tadaima",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Myxogastria0808/tadaima",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "getting-started/introduction" },
            { label: "Installation", slug: "getting-started/installation" },
          ],
        },
        {
          label: "Guide",
          items: [
            { label: "API Overview", slug: "guide/api-overview" },
            { label: "Examples", slug: "guide/examples" },
            { label: "Architecture", slug: "guide/architecture" },
          ],
        },
        {
          label: "Reference",
          autogenerate: { directory: "reference" },
        },
      ],
    }),
  ],
});
