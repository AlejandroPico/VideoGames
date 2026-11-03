import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const manifest=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));
assert.equal(manifest.scope,'/VideoGames/');assert.equal(manifest.start_url,'/VideoGames/');
const sw=await readFile('dist/sw.js','utf8');assert(sw.includes('videogames-offline-'));assert(!sw.includes('electrogames-offline-'));
for(const path of ['favicon.svg','icons/icon-192.png','icons/icon-512.png','machines/snes/runtime/host.html','machines/snes/runtime/bridge.js','machines/snes/runtime/vendor/emulatorjs/cores/bsnes-wasm.data','machines/snes/runtime/vendor/emulatorjs/cores/bsnes-legacy-wasm.data'])await access(`dist/${path}`);
const bridge=await readFile('dist/machines/snes/runtime/bridge.js','utf8');assert(bridge.includes("system:'bsnes'"));assert(bridge.includes('event.origin!==location.origin'));
assert(!(await readFile('dist/index.html','utf8')).includes('/Electrogames/'));
console.log('PWA, ámbito y motor SNES verificados.');
