import { defineConfig } from 'vite';

const editorName = process.env.EDITOR_NAME;
const editorEntry = process.env.EDITOR_ENTRY;

if (!editorName || !editorEntry) {
  throw new Error('EDITOR_NAME and EDITOR_ENTRY must be provided when building a property editor.');
}

const fileName = editorName.toLowerCase().replace(/\./g, '-');

export default defineConfig({
  build: {
    lib: {
      entry: editorEntry,
      formats: ["es"],
      fileName: fileName,
    },
    outDir: `App_Plugins/${editorName}`,
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: `/App_Plugins/${editorName}/`,
});
