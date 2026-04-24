# VNS.Umbraco.PropertyEditors

A shared Umbraco 14+ backoffice package for custom property editors.

> Compatibility: Umbraco 14, 15, 16, 17+

## Overview

This project is structured to host multiple property editors side by side.
Each editor lives in its own folder, while all manifests are collected in one place and exported from a single bundle entry.

## Project Structure

```text
src/
├── PropertyEditors/
│   └── MultiLanguageTextbox/
│       └── vns-multilanguagetextbox-property-editor-ui.element.ts
├── manifests.ts
└── umbraco-package.ts

App_Plugins/
└── VNS.Umbraco.PropertyEditors/
    ├── umbraco-package.json
    └── dist/
        └── umbraco-package.js
```

## Installation

1. Copy `App_Plugins/VNS.Umbraco.PropertyEditors` into your Umbraco site's `wwwroot/App_Plugins/`.
2. Restart the Umbraco application.

## Development

```bash
npm install
npm run watch
```

Build once:

```bash
npm run build
```

The build output is written to:

- `App_Plugins/VNS.Umbraco.PropertyEditors/dist/umbraco-package.js`

## How Property Editors Are Registered

- `src/PropertyEditors/...` contains the editor UI elements.
- `src/manifests.ts` imports editor elements and exports all manifest objects.
- `src/umbraco-package.ts` exports `manifests` as extensions bundle content.
- `App_Plugins/VNS.Umbraco.PropertyEditors/umbraco-package.json` registers the bundle in Umbraco.

## Add A New Property Editor

1. Create a new folder under `src/PropertyEditors/<EditorName>/`.
2. Add the editor element TypeScript file(s).
3. Import the new element file in `src/manifests.ts`.
4. Add the new `propertyEditorUi` and `propertyEditorSchema` manifest objects in `src/manifests.ts`.
5. Make sure aliases follow:
   - `VNS.Umbraco.PropertyEditors.PropertyEditor.<EditorName>.Ui`
   - `VNS.Umbraco.PropertyEditors.PropertyEditor.<EditorName>`
6. Run `npm run build`.

## Existing Editor

### MultiLanguageTextbox

- UI alias:
  `VNS.Umbraco.PropertyEditors.PropertyEditor.MultiLanguageTextbox.Ui`
- Schema alias:
  `VNS.Umbraco.PropertyEditors.PropertyEditor.MultiLanguageTextbox`

## License

MIT
