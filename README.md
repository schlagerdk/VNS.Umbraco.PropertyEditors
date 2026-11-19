# VNS.Umbraco.PropertyEditors

Custom property editors for the Umbraco 17 backoffice. Today it holds one editor, **VNS.MultiLanguageTextbox**, shipped as the NuGet package `VNS.MultiLanguageTextbox`.

> Compatibility: Umbraco 17, .NET 10

## Installation

Install the NuGet package in the Umbraco site:

```bash
dotnet add package VNS.MultiLanguageTextbox
```

Restart Umbraco and hard refresh the backoffice.

The package is a Razor Class Library: its files are served from `/App_Plugins/VNS.MultiLanguageTextbox` as static web assets and are never copied into the site's `wwwroot`. Removing the package (`dotnet remove package VNS.MultiLanguageTextbox` and a rebuild) removes them too.

### Moving from a copied App_Plugins folder

Sites that had `App_Plugins/VNS.MultiLanguageTextbox` copied into `wwwroot` by hand must delete that folder before installing the package. Otherwise the build fails because the same file exists both in the site and in the package. The error is `Microsoft.NET.Sdk.StaticWebAssets.targets: error : InvalidOperationException: Sequence contains more than one element`.

The data types and the content keep working: the aliases are the same.

## Development

```bash
npm install
npm run build   # src/PropertyEditors/VNS.MultiLanguageTextbox -> nuget/wwwroot/App_Plugins/VNS.MultiLanguageTextbox/
npm run watch   # the same, rebuilt on every change
npm run pack    # build + dotnet pack -> nuget/artifacts/VNS.MultiLanguageTextbox.<version>.nupkg
```

The built `vns-multilanguagetextbox.js` is committed, so the package can be packed without building the frontend first.

To try a local package in a site, add `nuget/artifacts` as a package source in the site's `nuget.config`.

In VS Code, the tasks **npm build**, **Debug**, **Release** and **Pack Nuget** (`.vscode/tasks.json`) do the same.

## Project Structure

```text
src/PropertyEditors/
└── VNS.MultiLanguageTextbox/
    └── vns-multilanguagetextbox.element.ts   TypeScript source
nuget/                                        The NuGet package VNS.MultiLanguageTextbox
├── VNS.MultiLanguageTextbox.csproj
├── VNS.MultiLanguageTextbox.sln
├── docs/                                     README.md, LICENSE.md and icon.png packed in the .nupkg
└── wwwroot/App_Plugins/VNS.MultiLanguageTextbox/
    ├── umbraco-package.json                  Umbraco package manifest (kept in git, not built)
    └── vns-multilanguagetextbox.js           Build output from src/
scripts/sync-version.mjs
```

## The Editor

### MultiLanguageTextbox

- Property editor UI alias: `VNS.MultiLanguageTextbox.PropertyEditorUi`
- Property editor schema alias: `VNS.MultiLanguageTextbox.PropertyEditorSchema`
- Settings:
  - `useTextArea`: use a text area instead of a text box
  - `isMandatoryLanguageRequired`: make the mandatory languages required, when the property is not mandatory

## Versioning

There is one version, set in `package.json`. The NuGet package, the Umbraco package manifest and the git tag always have the same version, so a release on GitHub matches the package on nuget.org. The NuGet package allows Umbraco `[17.0.0, 18.0.0)`.

Never set the version in the `.csproj` or the `umbraco-package.json` by hand: `npm run build` (and so `npm run pack` and the VS Code tasks) first runs `npm run version:sync`, which writes the version from `package.json` to:

1. `nuget/VNS.MultiLanguageTextbox.csproj` (`<Version>`)
2. `nuget/wwwroot/App_Plugins/VNS.MultiLanguageTextbox/umbraco-package.json` (`version`, and `?v=<version>` on the editor's code so browsers fetch the new code)

To set a new version:

```bash
npm run version:patch   # 2.0.0 -> 2.0.1
npm run version:minor   # 2.0.0 -> 2.1.0
npm run version:major   # 2.0.0 -> 3.0.0
```

## Release Flow

1. Set the new version with `npm run version:patch` (or `minor`/`major`).
2. Build and pack:

```bash
npm run release:check
```

3. Commit, and tag with the version from `package.json`:

```bash
VERSION=$(node -p "require('./package.json').version")
git add .
git commit -m "release: v$VERSION"
git tag "v$VERSION"
git push origin master "v$VERSION"
```

4. Push the same version to nuget.org:

```bash
dotnet nuget push "nuget/artifacts/VNS.MultiLanguageTextbox.$VERSION.nupkg" --source https://api.nuget.org/v3/index.json --api-key <key>
```

## Add A New Property Editor

The NuGet package holds one editor. A new editor gets its own package in the same way: a folder in `src/PropertyEditors/<Name>/`, and its own `nuget/<Name>.csproj` with `wwwroot/App_Plugins/<Name>/umbraco-package.json`. Its aliases follow `<Name>.PropertyEditorUi` and `<Name>.PropertyEditorSchema`.

## License

MIT
