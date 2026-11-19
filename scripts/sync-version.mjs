// Writes the version from package.json to the NuGet package (nuget/VNS.MultiLanguageTextbox.csproj) and to the
// Umbraco package manifest, both its version and the ?v= on the editor's code, so browsers fetch a new version's code.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const packageJsonPath = path.join(root, 'package.json');
const csprojPath = path.join(root, 'nuget', 'VNS.MultiLanguageTextbox.csproj');
const umbracoPackageJsonPath = path.join(
  root,
  'nuget',
  'wwwroot',
  'App_Plugins',
  'VNS.MultiLanguageTextbox',
  'umbraco-package.json'
);

const { version } = JSON.parse(await readFile(packageJsonPath, 'utf8'));

if (!version) {
  throw new Error('package.json is missing a version field');
}

const withVersion = (url) => url.replace(/\?v=[^&]*$/, '') + `?v=${version}`;

const umbracoPackageJson = JSON.parse(await readFile(umbracoPackageJsonPath, 'utf8'));
umbracoPackageJson.version = version;
for (const extension of umbracoPackageJson.extensions ?? []) {
  // "js" is an extension's code; "element" is a property editor UI's code
  for (const key of ['js', 'element']) {
    if (typeof extension[key] === 'string') {
      extension[key] = withVersion(extension[key]);
    }
  }
}
await writeFile(umbracoPackageJsonPath, JSON.stringify(umbracoPackageJson, null, '\t') + '\n', 'utf8');

const csproj = await readFile(csprojPath, 'utf8');
if (!/<Version>[^<]*<\/Version>/.test(csproj)) {
  throw new Error('nuget/VNS.MultiLanguageTextbox.csproj is missing a <Version>');
}
await writeFile(csprojPath, csproj.replace(/<Version>[^<]*<\/Version>/, `<Version>${version}</Version>`), 'utf8');

console.log(`Synced version ${version} to the umbraco-package.json and the NuGet package`);
