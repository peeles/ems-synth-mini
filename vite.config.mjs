import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
// import {nodePolyfills} from "vite-plugin-node-polyfills";

export default defineConfig({
  build: {
    outDir: "./public",
  },
  define: {
    global: 'window'
  },
  plugins: [
      // nodePolyfills({
      //   globals: {
      //     Buffer: true, // can also be 'build', 'dev', or false
      //     global: true,
      //     process: true,
      //   },
      //   protocolImports: true,
      // }),
      tailwindcss(),
      vue()
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
