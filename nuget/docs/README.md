# VNS Multi Language Textbox

A property editor for the Umbraco 18 backoffice that stores a text for each of the site's languages in one property. It shows a text box (or a text area) per language, and can make the mandatory languages required.

## Installation

Use the package manager [nuget](https://nuget.org) to install.

```bash
dotnet add package VNS.MultiLanguageTextbox
```

Restart the site and hard refresh the backoffice. Then create a data type with the property editor **Multi Language Textbox**.

The browser gets the package's files at the URL `/App_Plugins/VNS.MultiLanguageTextbox/...`. On disk, they are not copied into the site's project: in development they are served from the NuGet package cache. `dotnet publish` copies them into the publish folder, at `<publish folder>/wwwroot/App_Plugins/VNS.MultiLanguageTextbox/`, as with all static web assets. When the package is removed, a publish into a folder that is not cleaned leaves them there: delete `wwwroot/App_Plugins/VNS.MultiLanguageTextbox` (and `VNS.MultiLanguageTextbox.dll` from 18.0.0 and earlier) from the publish folder. The package has no assembly, so nothing else is left. A site that had the files copied into `wwwroot/App_Plugins/VNS.MultiLanguageTextbox` by hand must delete that folder before installing the package.

## Settings

- **Use text area**: a text area instead of a text box
- **Make mandatory language(s) required**: the mandatory languages must have a text, when the property itself is not mandatory

The source code is at [github.com/schlagerdk/VNS.Umbraco.PropertyEditors](https://github.com/schlagerdk/VNS.Umbraco.PropertyEditors).

## Requirements

- Umbraco 18.3.0 or newer 18.x, .NET 10

## License

MIT, see `LICENSE.md`.
