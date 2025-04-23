import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

import packageJson from "./package.json";

const dependencies = Object.keys({
  ...packageJson.dependencies,
  ...packageJson.devDependencies
});

const noExternal = dependencies;

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal
  }
});
