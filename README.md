# VideoGames

Consolas y ordenadores de distintas épocas, con emulación local en el navegador. Un proyecto de Alejandro Pico en la familia visual de Games y ElectroGames.

## Primera versión

- Catálogo cronológico con fotografías de producto, presentación, historia y especificaciones por máquina.
- Super Nintendo es la primera máquina con emulación disponible, mediante bsnes y una interfaz propia sobre EmulatorJS.
- Búsqueda y filtros combinables por tipo, fabricante, década y disponibilidad. Las fichas pendientes conservan el color.
- Temas día, tarde, noche y automático, con los iconos de Games. Favicon, Acerca de, portfolio, repositorio e instalación como aplicación.
- Preparación en la ficha de cada consola: selección de un juego o una carpeta de `.sfc`/`.smc`, biblioteca local alfabética con búsqueda, modo de control, detección de mando, sonido y requisitos reales. Ninguna ROM se envía a un servidor. Los requisitos de futuras máquinas se implementan en su propia carpeta.
- Cruceta o stick para navegar por los menús; botón inferior para aceptar y derecho para volver. En juego, Escape o L3+R3 abren la pausa.
- Partidas en memoria durante la sesión. La primera versión no ofrece persistencia ni exportación de partidas.

No se distribuyen juegos, BIOS ni claves. Las fotografías son imágenes reutilizables de Wikimedia Commons, con crédito en cada ficha y en [PHOTO-CREDITS](docs/PHOTO-CREDITS.md); no se presentan como fotografías oficiales. Se priorizan las variantes europeas conforme a las instrucciones del proyecto.

## Desarrollo

```sh
npm ci
npm run dev
npm test
npm run build
npm run check:pwa
npm run preview
```

Node 24. La compilación no descarga motores ni fotografías: están fijados en el repositorio. GitHub Actions ejecuta las pruebas, compila y publica `dist/` en GitHub Pages con base `/VideoGames/`. Configuración de Pages: **GitHub Actions**.

## Estructura

```text
Machines/<id>/             Datos y documentación específica de cada máquina
Machines/snes/             Reproductor React, archivos, puente, motor y fuentes
src/                      Catálogo, interfaz común, filtros y navegación con mando
public/machines/          Fotografías y atribuciones
scripts/                  Preparación de recursos, PWA y diagnóstico
tests/                    Disponibilidad, filtros, validación de archivos y mando
```

Los recursos de ejecución de SNES se copian a `public/machines/snes/runtime/` durante la preparación y a `dist/` al compilar. Las fuentes de `Machines/` son la referencia; no editar las copias generadas.

## Límites y validación

- Las demás fichas son presentaciones históricas, no emuladores funcionales. El filtro de disponibilidad permite ocultarlas.
- La compatibilidad y velocidad dependen del juego, navegador y dispositivo. No se garantiza todo el catálogo SNES ni todos los chips especiales.
- Los estados instantáneos del núcleo bsnes web consultado tienen una incompatibilidad de serialización. Esta versión no los expone y tampoco anuncia guardado del cartucho, pues la interfaz de SRAM de este núcleo requiere otra integración. Los atajos de estados también están desactivados.
- La detección de un mando depende del navegador y del adaptador. Mandos sin mapeo estándar pueden requerir otra configuración del sistema. Las verificaciones automatizadas utilizan un mando simulado; no sustituyen una prueba con cada modelo físico.
- La aplicación puede trabajar sin conexión cuando su descarga inicial está completada; el navegador puede eliminar almacenamiento local según sus políticas. Cerrar el juego termina la partida de esta primera versión.
- `scripts/create-test-rom.mjs` genera un programa SNES original de diagnóstico en `.qa/`, excluido de la web. Permite verificar vídeo y entrada sin usar juegos comerciales.

Código de la interfaz bajo GPLv3. Créditos y acceso a fuentes de los motores en [THIRD-PARTY](THIRD-PARTY.md).
