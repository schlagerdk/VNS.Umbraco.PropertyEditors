// Writes the version from package.json to the NuGet package (nuget/VNS.MultiLanguageTextbox.csproj) and to the
// Umbraco package manifest, both its version and the ?v= on the editor's code, so browsers fetch a new version's code.
//
// The versions follow Umbraco's: 17.0.0 is for Umbraco 17.0.0 and newer, and a fourth number (17.0.0.1) is a fix of
// the package for the same Umbraco. npm version can't make a fourth number, so this script sets the version too:
//   node scripts/sync-version.mjs            sync the version in package.json
//   node scripts/sync-version.mjs 17.3.0     set the version to 17.3.0, then sync
//   node scripts/sync-version.mjs --fix      17.0.0 -> 17.0.0.1, 17.0.0.1 -> 17.0.0.2, then sync
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
let { version } = packageJson;

if (!version) {
  throw new Error('package.json is missing a version field');
}

const arg = process.argv[2];
if (arg) {
  if (arg === '--fix') {
    const [major, minor, patch, fix = 0] = version.split('.').map(Number);
    version = `${major}.${minor}.${patch}.${fix + 1}`;
  } else {
    version = arg;
  }
  if (!versionPattern.test(version)) {
    throw new Error(`"${version}" is not a version like 17.0.0 or 17.0.0.1`);
  }
  packageJson.version = version;
  await writeJson(packageJsonPath, packageJson, '\t');

  const packageLock = await readJson(packageLockPath);
  packageLock.version = version;
  if (packageLock.packages?.['']) {
    packageLock.packages[''].version = version;
  }
  await writeJson(packageLockPath, packageLock, 2);
}

if (!versionPattern.test(version)) {
  throw new Error(`The version "${version}" in package.json is not a version like 17.0.0 or 17.0.0.1`);
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

console.log(`Synced version ${version} to the umbraco-package.json and the NuGet package`);
