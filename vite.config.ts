import { defineConfig } from 'vite';

const editorName = process.env.EDITOR_NAME;
const editorEntry = process.env.EDITOR_ENTRY;

if (!editorName || !editorEntry) {
  throw new Error('EDITOR_NAME and EDITOR_ENTRY must be provided when building a property editor.');
}

export default defineConfig({
  build: {
    lib: {
      entry: editorEntry,
      formats: ["es"],
      fileName: "umbraco-package",
    },
    outDir: `App_Plugins/VNS.Umbraco.PropertyEditors/${editorName}`,
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: `/App_Plugins/VNS.Umbraco.PropertyEditors/${editorName}/`,
});
