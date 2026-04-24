# VNS.Umbraco.PropertyEditors

A shared Umbraco 14+ backoffice package for custom property editors.

> Compatibility: Umbraco 14, 15, 16, 17+

## Overview

This project is structured to host multiple property editors side by side.
Each editor lives in its own folder and is built/deployed independently.

## Project Structure

```text
src/
├── PropertyEditors/
│   └── VNS.MultiLanguageTextbox/
│       ├── umbraco-package.json
│       └── vns-multilanguagetextbox.element.ts

App_Plugins/
└── VNS.Umbraco.PropertyEditors/
  └── VNS.MultiLanguageTextbox/
    ├── umbraco-package.json
    └── umbraco-package.js

dist/
└── VNS.MultiLanguageTextbox/
  ├── umbraco-package.json
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

- `App_Plugins/VNS.Umbraco.PropertyEditors/VNS.MultiLanguageTextbox/`
- `dist/VNS.MultiLanguageTextbox/`

## How Property Editors Are Registered

- Each editor has its own `umbraco-package.json` in `src/PropertyEditors/<EditorFolder>/`.
- Build copies each editor's package files to `App_Plugins/VNS.Umbraco.PropertyEditors/<EditorFolder>/`.
- The same files are copied to `dist/<EditorFolder>/` for release packaging.

## Add A New Property Editor

1. Create a new folder under `src/PropertyEditors/<EditorName>/`.
2. Add an editor entry file ending in `.element.ts`.
3. Add an `umbraco-package.json` in that folder.
5. Make sure aliases follow:
   - `VNS.Umbraco.PropertyEditors.PropertyEditor.<EditorName>.Ui`
   - `VNS.Umbraco.PropertyEditors.PropertyEditor.<EditorName>`
6. Run `npm run build`.

## Existing Editor

### MultiLanguageTextbox

- Folder:
  `VNS.MultiLanguageTextbox`

- UI alias:
  `VNS.Umbraco.PropertyEditors.PropertyEditor.MultiLanguageTextbox.Ui`
- Schema alias:
  `VNS.Umbraco.PropertyEditors.PropertyEditor.MultiLanguageTextbox`

## License

MIT
