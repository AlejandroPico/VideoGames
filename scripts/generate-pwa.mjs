import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
async function files(dir) {
  const list = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) list.push(...(await files(p)));
    else list.push(p);
  }
  return list;
}
const list = (await files("dist")).filter((p) => !p.endsWith("sw.js")).sort(),
  hash = createHash("sha256");
for (const p of list) hash.update(await readFile(p));
const version = hash.digest("hex").slice(0, 16),
  assets = list.map((p) => "./" + p.replaceAll("\\", "/").slice(5));
await writeFile(
  "dist/sw.js",
  `const CACHE="videogames-offline-${version}";
const ASSETS=${JSON.stringify(assets)};const ROOT=new URL('./',self.location.href).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS.map(p=>new URL(p,ROOT).href)).then(()=>self.skipWaiting()))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('videogames-offline-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(ROOT))return;
if(request.mode==='navigate'){event.respondWith(fetch(request).catch(()=>caches.open(CACHE).then(cache=>cache.match(new URL('index.html',ROOT).href))));return;}
event.respondWith(caches.open(CACHE).then(async cache=>(await cache.match(request))||fetch(request)));});
`,
);
console.log("Offline assets:", assets.length, "version:", version);
