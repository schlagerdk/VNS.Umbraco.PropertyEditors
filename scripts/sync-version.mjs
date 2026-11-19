// package.json holds the version. This writes it to the NuGet package (nuget/VNS.MultiLanguageTextbox.csproj) and to
// the Umbraco package manifest, both its version and the ?v= on the editor's code, so browsers fetch a new version's
// code.
//
//   node scripts/sync-version.mjs            writes the version in package.json to the others
//   node scripts/sync-version.mjs 18.0.1     sets 18.0.1 in package.json (and package-lock.json) first
//
// Versions follow Umbraco's: 18.0.0, and a fourth number for a fix of the package for the same Umbraco (18.0.0.1).
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const packageJsonPath = path.join(root, 'package.json');
const packageLockPath = path.join(root, 'package-lock.json');
const csprojPath = path.join(root, 'nuget', 'VNS.MultiLanguageTextbox.csproj');
const umbracoPackageJsonPath = path.join(
  root,
  'nuget',
  'wwwroot',
  'App_Plugins',
  'VNS.MultiLanguageTextbox',
  'umbraco-package.json'
);
const versionPattern = /^\d+\.\d+\.\d+(\.\d+)?$/;

const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const writeJson = (file, json, indent) => writeFile(file, JSON.stringify(json, null, indent) + '\n', 'utf8');

const packageJson = await readJson(packageJsonPath);
const requested = process.argv[2];

if (requested !== undefined) {
  if (!versionPattern.test(requested)) {
    throw new Error(`"${requested}" is not a version such as 18.0.1 or 18.0.1.2`);
  }
  packageJson.version = requested;
  await writeJson(packageJsonPath, packageJson, '\t');

  const packageLock = await readJson(packageLockPath);
  packageLock.version = requested;
  if (packageLock.packages?.['']) {
    packageLock.packages[''].version = requested;
  }
  await writeJson(packageLockPath, packageLock, 2);
}

const { version } = packageJson;

if (!version || !versionPattern.test(version)) {
  throw new Error(`package.json has no valid version (found "${version}")`);
}

const withVersion = (url) => url.replace(/\?v=[^&]*$/, '') + `?v=${version}`;

const umbracoPackageJson = await readJson(umbracoPackageJsonPath);
umbracoPackageJson.version = version;
for (const extension of umbracoPackageJson.extensions ?? []) {
  // "js" is an extension's code; "element" is a property editor UI's code
  for (const key of ['js', 'element']) {
    if (typeof extension[key] === 'string') {
      extension[key] = withVersion(extension[key]);
    }
  }
}
await writeJson(umbracoPackageJsonPath, umbracoPackageJson, '\t');

const csproj = await readFile(csprojPath, 'utf8');
if (!/<Version>[^<]*<\/Version>/.test(csproj)) {
  throw new Error('nuget/VNS.MultiLanguageTextbox.csproj is missing a <Version>');
}
await writeFile(csprojPath, csproj.replace(/<Version>[^<]*<\/Version>/, `<Version>${version}</Version>`), 'utf8');

console.log(`Version ${version}: package.json, umbraco-package.json and the NuGet package`);
