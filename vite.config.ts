import { defineConfig } from 'vite';

// Builds the property editor into the NuGet package's static web assets (nuget/wwwroot/App_Plugins/<name>/), which
// the site serves from /App_Plugins/<name>/. The umbraco-package.json in that folder is kept in git, not built.
const editorName = 'VNS.MultiLanguageTextbox';
const fileName = editorName.toLowerCase().replace(/\./g, '-');

export default defineConfig({
  build: {
    lib: {
      entry: `src/PropertyEditors/${editorName}/${fileName}.element.ts`,
      formats: ['es'],
      fileName: fileName,
    },
    outDir: `nuget/wwwroot/App_Plugins/${editorName}`,
    // Keep umbraco-package.json: npm run clean removes the old build output
    emptyOutDir: false,
    sourcemap: false,
    rollupOptions: {
      external: [/^@umbraco/],
    },
  },
  base: `/App_Plugins/${editorName}/`,
});
