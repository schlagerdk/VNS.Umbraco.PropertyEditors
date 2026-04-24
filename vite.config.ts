import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: "src/umbraco-package.ts",
      formats: ["es"],
      fileName: "umbraco-package",
    },
    outDir: "App_Plugins/VNS.Umbraco.PropertyEditors/dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/VNS.Umbraco.PropertyEditors/",
});
