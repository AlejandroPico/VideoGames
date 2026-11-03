# Super Nintendo

Primera máquina disponible de VideoGames. El adaptador React y el puente con el motor viven en esta carpeta. La distribución fijada de EmulatorJS y bsnes está en `vendor/emulatorjs/`; `scripts/prepare-assets.mjs` la copia al sitio estático sin descargar nada durante la compilación.

- Motor: bsnes, compilación EmulatorJS 2.0.3 del 25 de julio de 2026, sin hilos, con variantes WebGL 1 y 2.
- Interfaz: EmulatorJS 4.3.0-pre, commit `5a65bde5d3b47c75f22e90453c3c14c469411589`.
- Preparación en `Setup.tsx`: juego o carpeta de ROM del dispositivo, lista local alfabética con búsqueda, controles automáticos/teclado y mando/táctil y sonido. SNES no requiere BIOS externa ni directorio para iniciar. El guardado no disponible se indica antes de jugar. La selección de ROM permanece solo en memoria; se conservan únicamente preferencias de control y sonido.
- Archivos: `.sfc` y `.smc`, entre 32 KiB y 16 MiB. Se aceptan cabeceras de copiador de 512 bytes. No se incluye catálogo de juegos ni se suben las ROM a servidores.
- Teclado: flechas, Z/X para B/A, A/S para Y/X, Q/W para L/R, Mayús/Intro para Select/Start, Escape para pausa.
- Mandos: Gamepad API; asignación por posición física estándar. Hasta dos jugadores. Los dispositivos sin mapeo estándar dependen del navegador y adaptador utilizado.
- Táctil: controles de EmulatorJS. L3 + R3 abre la pausa de la aplicación; Start conserva su función dentro del juego.
- Partidas: esta primera versión no ofrece guardado persistente ni estados instantáneos. El núcleo upstream tiene limitaciones en su interfaz de SRAM y un error de serialización. No exponer funciones de guardado hasta disponer de una integración probada.
- Pausa al ocultar la pestaña, abrir ayuda/herramientas o perder el foco hacia otra aplicación. No se reanuda automáticamente.
- Aislamiento: iframe local, origen validado en ambos lados del puente, sin CDNs en ejecución. El CSP del iframe bloquea conexiones externas.

Las pruebas usan una ROM mínima escrita para este proyecto, generada con `scripts/create-test-rom.mjs` dentro de `.qa/`. No contiene código ni recursos de Nintendo y no se distribuye en la web.

Consulta `THIRD-PARTY.md` para licencias, fuentes y huellas de los binarios.
