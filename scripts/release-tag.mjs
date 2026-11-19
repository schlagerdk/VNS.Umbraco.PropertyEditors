// Tags the current commit v<version>, with the version from package.json, so the git tag, the GitHub release and the
// NuGet package have the same version. Only when everything is committed, the versions agree and the tag is new.
// It does not push: git push origin master v<version> does.
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const { version } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const csproj = await readFile(path.join(root, 'nuget', 'VNS.MultiLanguageTextbox.csproj'), 'utf8');
const umbracoPackageJson = JSON.parse(
  await readFile(
    path.join(root, 'nuget', 'wwwroot', 'App_Plugins', 'VNS.MultiLanguageTextbox', 'umbraco-package.json'),
    'utf8'
  )
);
const nugetVersion = csproj.match(/<Version>([^<]*)<\/Version>/)?.[1];

if (nugetVersion !== version || umbracoPackageJson.version !== version) {
  fail(
    `The versions differ: package.json ${version}, NuGet ${nugetVersion}, umbraco-package.json ${umbracoPackageJson.version}. ` +
      'Run npm run version:sync and commit.'
  );
}
if (git('status', '--porcelain') !== '') {
  fail('Commit everything first: the tag must be the commit the package is built from.');
}
const tag = `v${version}`;
if (git('tag', '--list', tag) !== '') {
  fail(`${tag} already exists. Set a new version with npm run version:set <version>.`);
}

git('tag', '-a', tag, '-m', `release: ${tag}`);
console.log(`Tagged ${tag}. Push it with: git push origin master ${tag}`);
