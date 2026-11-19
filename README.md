# VNS.Umbraco.PropertyEditors

Custom property editors for the Umbraco 18 backoffice. Today it holds one editor, **VNS.MultiLanguageTextbox**, shipped as the NuGet package `VNS.MultiLanguageTextbox`.

> Compatibility: Umbraco 18, .NET 10

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

## Versioning Strategy

The versions follow Umbraco's, as in VNS.Harbor: `18.0.0` is for Umbraco 18.0.0 and newer. A fourth number (`18.0.0.1`) is a fix of the package for the same Umbraco. The NuGet package allows Umbraco `[18.0.0, 19.0.0)`. Umbraco 17 is no longer supported.

There is one version: the one in `package.json`. The NuGet package, the Umbraco package manifest (shown under Packages in the backoffice) and the git tag always have the same one.

```bash
npm run version:set 18.0.1   # sets the version and writes it everywhere
npm run version:sync         # writes the version in package.json everywhere (every build does this)
```

It is written to:

1. `nuget/VNS.MultiLanguageTextbox.csproj` (`<Version>`)
2. `nuget/wwwroot/App_Plugins/VNS.MultiLanguageTextbox/umbraco-package.json` (`version`, and `?v=<version>` on the editor's code so browsers fetch the new code)

`npm version` can't make a fourth number, so use `npm run version:set`. `dotnet pack` refuses to make a package when the three differ, also when it is run without npm. `npm run release:tag` tags the commit `v<version>`.

## Release Flow

1. Set the version:

```bash
npm run version:set 18.0.1
```

2. Build and pack:

```bash
npm run release:check
```

3. Commit, tag and push:

```bash
git add .
git commit -m "release: v18.0.1"
npm run release:tag          # tags v18.0.1; refuses if anything is uncommitted, the versions differ or the tag exists
git push origin master v18.0.1
```

4. Create a GitHub release from the tag, and push the package to nuget.org:

```bash
dotnet nuget push nuget/artifacts/VNS.MultiLanguageTextbox.18.0.1.nupkg --source https://api.nuget.org/v3/index.json --api-key <key>
```

## Add A New Property Editor

The NuGet package holds one editor. A new editor gets its own package in the same way: a folder in `src/PropertyEditors/<Name>/`, and its own `nuget/<Name>.csproj` with `wwwroot/App_Plugins/<Name>/umbraco-package.json`. Its aliases follow `<Name>.PropertyEditorUi` and `<Name>.PropertyEditorSchema`.

## License

MIT
