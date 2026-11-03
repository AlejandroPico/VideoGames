# Licencias, versiones y fuentes

La interfaz VideoGames deriva de la familia Games/ElectroGames de Alejandro Pico, distribuida bajo GPLv3. Se conserva la licencia completa en `LICENSE`. Las fotografías tienen sus propias licencias, detalladas en `docs/PHOTO-CREDITS.md` y `public/machines/photos.json`.

## Emulación de Super Nintendo

Los archivos que se ejecutan se distribuyen localmente en `Machines/snes/vendor/emulatorjs/`. No se consulta un CDN para cargar el motor.

| Componente | Versión / fuente | Licencia |
| --- | --- | --- |
| EmulatorJS | 4.3.0-pre, commit `5a65bde5d3b47c75f22e90453c3c14c469411589` | GPLv3 |
| bsnes | byuu y colaboradores, fuente EmulatorJS/bsnes-libretro | GPLv3 o posterior |
| RetroArch y adaptador de compilación | EmulatorJS/RetroArch, compilación de núcleo 2.0.3 | GPLv3 y avisos de sus dependencias |
| Adaptador VideoGames | `Machines/snes/Player.tsx`, `bridge.js`, `host.*`, `files.ts` | GPLv3 |

Código fuente de EmulatorJS en formato preferido para modificación: `Machines/snes/vendor/emulatorjs/src/`, junto con su CSS y licencia íntegra. Fuente original: [commit fijado de EmulatorJS](https://github.com/EmulatorJS/EmulatorJS/tree/5a65bde5d3b47c75f22e90453c3c14c469411589).

Fuentes del núcleo y herramientas, conservadas para descarga junto a la distribución en [Machines/snes/sources](https://github.com/AlejandroPico/VideoGames/tree/main/Machines/snes/sources):

- `bsnes-libretro-4b344745.tar.gz`: [bsnes-libretro, commit 4b344745e3878e7c0675a60c624582935524b8f7](https://github.com/EmulatorJS/bsnes-libretro/tree/4b344745e3878e7c0675a60c624582935524b8f7).
- `RetroArch-d907a125.tar.gz`: [RetroArch, commit d907a125ee76e02a21d89003c140fd0b72886e90](https://github.com/EmulatorJS/RetroArch/tree/d907a125ee76e02a21d89003c140fd0b72886e90).
- `build-7f4d2d73.tar.gz`: [herramientas de compilación, commit 7f4d2d7354d7b25766bf5229f8a5c4b121515a68](https://github.com/EmulatorJS/build/tree/7f4d2d7354d7b25766bf5229f8a5c4b121515a68).

Estas son las revisiones de las ramas originales anteriores al informe de compilación del núcleo: 25 de julio de 2026, 16:44:36 UTC. El informe upstream y los metadatos `build.json`/`core.json` están conservados; upstream no incorpora los SHA de todos sus repositorios al binario. Las herramientas upstream describen el entorno Emscripten y los pasos de construcción. Los archivos de fuentes son de acceso público, sin coste adicional.

Los dos archivos de núcleo son los originales de la distribución EmulatorJS consultada, sin modificación:

| Archivo | SHA-256 |
| --- | --- |
| `bsnes-wasm.data` | `c9f92df3b3ebd7379e5cd4c9b8c109d7405da91b57f59263835869da5573a064` |
| `bsnes-legacy-wasm.data` | `46546ac5060d3558fc92d4d01e6798a53e2789d6c5d109755d92905d33f43d99` |

Licencia bsnes: `Machines/snes/vendor/BSNES-LICENSE.txt`, además de `license.txt` dentro de cada archivo del núcleo. Las fuentes de libco y sus avisos forman parte del archivo bsnes.

El adaptador local extiende EmulatorJS sin modificar sus fuentes: desactiva consultas de actualización, personaliza la interfaz, añade el stick izquierdo como cruceta y limita las funciones expuestas a las verificadas. No se ofrecen estados instantáneos porque la compilación web de bsnes presenta un error de serialización. Tampoco se ofrecen red, trucos ni descarga de ROM. La política de contenido del iframe bloquea conexiones externas.

## Dependencias de interfaz

- React y React DOM: MIT, [fuentes y licencia](https://github.com/facebook/react).
- Lucide: ISC, [fuentes y licencia](https://github.com/lucide-icons/lucide).
- Vite y herramientas de compilación conservan sus licencias en sus paquetes y lockfile.
- Las dependencias incluidas por EmulatorJS (como nipplejs, Socket.IO y descompresores) conservan sus encabezados y avisos originales. Su utilización no cambia sus licencias.

Los nombres y marcas de las máquinas pertenecen a sus titulares. El proyecto no está afiliado a Nintendo, Sony, Sega, Microsoft ni a los demás fabricantes.
