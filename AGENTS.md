# VideoGames

- Conservar la familia visual exacta de Games: barra fija de 60 px, mosaico cuadrado, iconos Lucide y AutoThemeIcon, filtros compactos y temas día/tarde/noche/automático. La portada solo contiene el mosaico y, cuando corresponda, el estado de filtros; sin frases decorativas ni pie.
- Fotografías europeas cuando exista variante europea. Las máquinas exclusivas de otros mercados utilizan su modelo original con nota regional. No sustituirlas silenciosamente por versiones estadounidenses. Conservar fuentes, autores y licencias de todas las imágenes.
- Implementación específica de cada máquina en `Machines/<id>/`. Únicamente máquinas realmente integradas pueden tener `ready: true`.
- Los archivos públicos de ejecución usan minúsculas `machines/<id>/runtime/` para evitar diferencias entre Windows y Linux; la carpeta fuente `Machines` conserva la capitalización pedida.
- ROM locales: no subirlas a servidores, incluirlas en la distribución, enlazar catálogos de descargas ni añadir BIOS o claves de terceros.
- Motor fijado y alojado localmente. Mantener licencias, fuentes y huellas en `THIRD-PARTY.md`. No activar funciones del núcleo sin probarlas realmente.
- Mantener soporte de teclado, táctil, mandos y navegación con mando en los menús. Start debe conservar su función en el juego. El menú se abre con Escape o L3+R3.
- Cambios publicados en GitHub Pages con base `/VideoGames/` y navegación por fragmentos. PWA y almacenamiento de preferencias aislados de los otros proyectos del dominio.
- Antes de publicar: `npm test`, `npm run build`, `npm run check:pwa`. Usar `npm ci` y conservar el lockfile. Documentar los límites reales, incluidas las funciones no disponibles del motor.
