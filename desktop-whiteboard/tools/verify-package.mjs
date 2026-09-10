import asar from '@electron/asar';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {normalize} from 'node:path';
const archive=fileURLToPath(new URL('../dist/portable/win-unpacked/resources/app.asar',import.meta.url));
const names=asar.listPackage(archive).map(x=>x.replaceAll('\\','/').replace(/^\//,''));
const allowed=['control-bounds.cjs','dist','dist/overlay','dist/overlay/index.html','dist/overlay/overlay.css',
  'dist/overlay/overlay.js','dist/toolbar','dist/toolbar/index.html','dist/toolbar/toolbar.css','dist/toolbar/toolbar.js',
  'main.cjs','package.json','preload.cjs','windows.cjs','display-selection.cjs'];
assert.deepEqual(names.sort(),allowed.sort());
for(const name of names.filter(x=>/\.(js|cjs|json|html|css)$/.test(x))) {
  const source=asar.extractFile(archive,normalize(name)).toString();
  assert(!/BEGIN (?:RSA |EC )?PRIVATE KEY/.test(source));
  assert(!/"type"\s*:\s*"service_account"/.test(source));
}
console.log('PASS package allowlist: only runtime code/assets/public config; no user data, env, credentials files, or tests');
