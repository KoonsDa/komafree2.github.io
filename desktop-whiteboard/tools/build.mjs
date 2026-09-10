import {build} from 'esbuild';
import {mkdir, copyFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {sharedSource} from './shared-source.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(new URL('../dist/', import.meta.url), {recursive: true});
const shared = await sharedSource();
await build({absWorkingDir: root, entryPoints: ['overlay/overlay.js', 'toolbar/toolbar.js'],
  bundle: true, outdir: 'dist', entryNames: '[dir]/[name]', format: 'esm', platform: 'browser',
  target: 'chrome140', sourcemap: false,
  plugins: [{name: 'existing-web-client', setup(api) {
    api.onResolve({filter: /^quest-shared$/}, () => ({path: 'quest-shared', namespace: 'shared'}));
    api.onLoad({filter: /.*/, namespace: 'shared'}, () => ({contents: shared, loader: 'js'}));
  }}]});
for (const folder of ['overlay', 'toolbar']) {
  for (const file of ['index.html', `${folder}.css`]) {
    await copyFile(new URL(`../${folder}/${file}`, import.meta.url), new URL(`../dist/${folder}/${file}`, import.meta.url));
  }
}
console.log('Built overlay + classroom control; reused existing web group transaction and public config.');
