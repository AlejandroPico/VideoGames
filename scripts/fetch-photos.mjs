// Rebuild the factual catalogue and download reusable product photography.
// Node.js 22+. Wikimedia Commons source, author and licence travel with each image.
import { mkdir, writeFile, readFile, access } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const seeds = [
// id | name | maker | year | kind | bits | cpu | media | article | engine | history
['odyssey','Magnavox Odyssey','Magnavox',1972,'Sobremesa','Circuitos discretos','Sin microprocesador','Tarjetas de circuitos','Magnavox Odyssey','Investigación','Primera videoconsola doméstica comercial. Sus tarjetas modificaban circuitos y se acompañaban de láminas para la pantalla.'],
['channel-f','Fairchild Channel F','Fairchild',1976,'Sobremesa','8 bits','Fairchild F8','Cartucho','Fairchild Channel F','FreeChaF','Una de las primeras consolas con juegos en cartuchos programables e intercambiables.'],
['atari-2600','Atari 2600','Atari',1977,'Sobremesa','8 bits','MOS 6507','Cartucho','Atari 2600','Stella','El Video Computer System popularizó el cartucho doméstico y el mando de palanca de un solo botón.'],
['studio-ii','RCA Studio II','RCA',1977,'Sobremesa','8 bits','RCA CDP1802','Cartucho','RCA Studio II','MAME','Consola monocroma con dos teclados numéricos integrados en la carcasa.'],
['astrocade','Bally Astrocade','Bally',1978,'Sobremesa','8 bits','Zilog Z80','Cartucho','Bally Astrocade','MAME','Sistema doméstico con mandos que combinaban palanca, gatillo y control giratorio.'],
['videopac','Philips Videopac','Philips / Magnavox',1978,'Sobremesa','8 bits','Intel 8048','Cartucho','Magnavox Odyssey 2','O2EM','Conocida como Odyssey² en otros mercados, incorporaba un teclado de membrana para juegos y aplicaciones.'],
['apf-mp1000','APF MP1000','APF',1978,'Sobremesa','8 bits','Motorola 6800','Cartucho','APF-MP1000','MAME','Consola de cartuchos que podía ampliarse con el sistema de ordenador Imagination Machine.'],
['vc-4000','Interton VC 4000','Interton',1978,'Sobremesa','8 bits','Signetics 2650','Cartucho','Interton Video Computer 4000','MAME','Consola alemana con dos mandos de palanca y teclado numérico.'],
['intellivision','Intellivision','Mattel',1979,'Sobremesa','16 bits','General Instrument CP1610','Cartucho','Intellivision','FreeIntv','Sus mandos de disco y teclado numérico permitían utilizar plantillas específicas para cada juego.'],
['microvision','Microvision','Milton Bradley',1979,'Portátil','Variable','Procesador en el cartucho','Cartucho','Microvision','MAME','Portátil con pantalla LCD y cartuchos que incluían parte de la electrónica necesaria para cada juego.'],
['atari-800','Atari 800','Atari',1979,'Ordenador','8 bits','MOS 6502','Cartucho, cinta y disco','Atari 8-bit computers','Atari800','Parte de la familia de ordenadores Atari de ocho bits, con hardware especializado para imagen y sonido.'],
['game-watch','Game & Watch','Nintendo',1980,'Portátil','4 bits','Familia Sharp SM5xx','Juego integrado','Game & Watch','MAME / GW','Colección de máquinas LCD dedicadas a un juego, con reloj y alarma. Cada modelo necesita su propia adaptación.'],
['vic-20','Commodore VIC-20','Commodore',1980,'Ordenador','8 bits','MOS 6502','Cartucho y cinta','VIC-20','VICE','Ordenador doméstico compacto con teclado integrado y salida a televisor.'],
['zx81','Sinclair ZX81','Sinclair',1981,'Ordenador','8 bits','Zilog Z80','Cinta','ZX81','EightyOne','Ordenador de bajo coste con teclado de membrana y gráficos monocromos.'],
['bbc-micro','BBC Micro','Acorn',1981,'Ordenador','8 bits','MOS 6502','Cinta y disco','BBC Micro','jsbeeb','Desarrollado para el proyecto de alfabetización informática de la BBC y utilizado en numerosos centros educativos.'],
['cassette-vision','Cassette Vision','Epoch',1981,'Sobremesa','Variable','Procesador en el cartucho','Cartucho','Cassette Vision','PD777','Sistema japonés cuyos cartuchos incorporaban componentes esenciales de cada juego.'],
['spectrum','ZX Spectrum','Sinclair',1982,'Ordenador','8 bits','Zilog Z80','Cinta y disco según modelo','ZX Spectrum','JSSpeccy 3','El Spectrum fue una de las grandes plataformas domésticas de ocho bits en España y el Reino Unido.'],
['commodore-64','Commodore 64','Commodore',1982,'Ordenador','8 bits','MOS 6510','Cinta, disco y cartucho','Commodore 64','VICE','Su chip de sonido SID y sus gráficos dedicados marcaron una extensa biblioteca de juegos y demos.'],
['colecovision','ColecoVision','Coleco',1982,'Sobremesa','8 bits','Zilog Z80','Cartucho','ColecoVision','Gearcoleco','Consola doméstica conocida por sus conversiones de recreativa y sus mandos con teclado numérico.'],
['atari-5200','Atari 5200','Atari',1982,'Sobremesa','8 bits','MOS 6502 personalizado','Cartucho','Atari 5200','a5200','Su hardware estaba relacionado con los ordenadores Atari de ocho bits e incorporaba mandos analógicos.'],
['vectrex','Vectrex','GCE / Milton Bradley',1982,'Sobremesa','8 bits','Motorola 6809','Cartucho','Vectrex','vecx','Integraba un monitor vectorial propio y utilizaba láminas de color para ambientar los juegos.'],
['arcadia-2001','Arcadia 2001','Emerson',1982,'Sobremesa','8 bits','Signetics 2650','Cartucho','Arcadia 2001','MAME','Consola compacta de cartuchos comercializada también mediante diversas variantes regionales.'],
['nes','Nintendo Entertainment System','Nintendo',1983,'Sobremesa','8 bits','Ricoh 2A03 / 2A07','Cartucho','Nintendo Entertainment System','FCEUmm / Nestopia','Nació como Family Computer en Japón y llegó a otros mercados con la denominación Nintendo Entertainment System.'],
['sg-1000','Sega SG-1000','Sega',1983,'Sobremesa','8 bits','Zilog Z80','Cartucho y tarjeta','SG-1000','Genesis Plus GX','Primera consola doméstica de Sega; compartió época con el ordenador SC-3000.'],
['msx','MSX','Estándar MSX',1983,'Ordenador','8 bits','Zilog Z80','Cartucho, cinta y disco','MSX','WebMSX','Estándar de ordenadores domésticos adoptado por varios fabricantes, con una importante biblioteca de juegos.'],
['cpc','Amstrad CPC','Amstrad',1984,'Ordenador','8 bits','Zilog Z80','Cinta y disco','Amstrad CPC','Caprice32','Familia de ordenadores que se vendía con monitor y unidad de cinta o disco integrada, según modelo.'],
['super-cassette-vision','Super Cassette Vision','Epoch',1984,'Sobremesa','8 bits','NEC µPD7801','Cartucho','Super Cassette Vision','EmuSCV','Sucesora de Cassette Vision, con una arquitectura renovada y gráficos basados en sprites.'],
['atari-7800','Atari 7800','Atari',1984,'Sobremesa','8 bits','Atari SALLY','Cartucho','Atari 7800','ProSystem','Compatible con numerosos cartuchos de Atari 2600 y equipada con el chip gráfico MARIA.'],
['master-system','Sega Master System','Sega',1985,'Sobremesa','8 bits','Zilog Z80','Cartucho y tarjeta según modelo','Master System','SMS Plus / Genesis Plus GX','La familia Mark III y Master System amplió la oferta doméstica de Sega durante la era de ocho bits.'],
['amiga','Commodore Amiga','Commodore',1985,'Ordenador','16/32 bits','Motorola 68000 y posteriores','Disquete y disco duro','Amiga','PUAE','Plataforma multimedia con chips dedicados a gráficos, sonido y transferencia de datos.'],
['atari-st','Atari ST','Atari',1985,'Ordenador','16/32 bits','Motorola 68000','Disquete y disco duro','Atari ST','Hatari','Familia de ordenadores con interfaz gráfica y puertos MIDI integrados, utilizada para juegos y música.'],
['pc-engine','PC Engine','NEC / Hudson Soft',1987,'Sobremesa','8/16 bits','HuC6280','HuCard','PC Engine','Beetle PCE Fast','Consola compacta con tarjetas HuCard y hardware gráfico de dieciséis bits; conocida como TurboGrafx-16 en Norteamérica.'],
['x68000','Sharp X68000','Sharp',1987,'Ordenador','16/32 bits','Motorola 68000','Disquete','X68000','PX68k','Ordenador japonés que destacó por sus conversiones de recreativa y su hardware audiovisual.'],
['mega-drive','Sega Mega Drive','Sega',1988,'Sobremesa','16 bits','Motorola 68000 + Zilog Z80','Cartucho','Sega Genesis','Genesis Plus GX / PicoDrive','Conocida como Genesis en Norteamérica, fue la principal consola de Sega durante la generación de dieciséis bits.'],
['pc-engine-cd','PC Engine CD-ROM²','NEC / Hudson Soft',1988,'Sobremesa','8/16 bits','HuC6280','CD-ROM y HuCard','TurboGrafx-CD','Beetle PCE','Ampliación de CD-ROM para PC Engine que permitió incorporar música y voces grabadas en disco.'],
['game-boy','Game Boy','Nintendo',1989,'Portátil','8 bits','Sharp LR35902','Cartucho','Game Boy','Gambatte / SameBoy','Portátil monocroma de cartuchos con cruceta, dos botones de acción y una larga autonomía con pilas.'],
['lynx','Atari Lynx','Atari',1989,'Portátil','8/16 bits','MOS 65SC02','Tarjeta','Atari Lynx','Handy','Una de las primeras portátiles de pantalla en color, con controles adaptables a jugadores zurdos.'],
['supergrafx','PC Engine SuperGrafx','NEC',1989,'Sobremesa','8/16 bits','HuC6280','HuCard','PC Engine SuperGrafx','Beetle PCE','Variante ampliada de PC Engine con más recursos gráficos y un reducido catálogo exclusivo.'],
['snes','Super Nintendo','Nintendo',1990,'Sobremesa','16 bits','Ricoh 5A22','Cartucho','Super Nintendo Entertainment System','bsnes','Sucesora de NES, presentada en Japón como Super Famicom. El Modo 7 y su sonido de ocho canales definieron muchos de sus juegos.'],
['neo-geo','Neo Geo AES','SNK',1990,'Sobremesa','16 bits','Motorola 68000 + Zilog Z80','Cartucho','Neo Geo (system)','Geolith / FinalBurn Neo','Trasladó al hogar la plataforma de las recreativas Neo Geo MVS mediante grandes cartuchos.'],
['game-gear','Sega Game Gear','Sega',1990,'Portátil','8 bits','Zilog Z80','Cartucho','Game Gear','Genesis Plus GX / SMS Plus','Portátil en color de Sega con arquitectura relacionada con Master System.'],
['turboexpress','PC Engine GT','NEC',1990,'Portátil','8/16 bits','HuC6280','HuCard','TurboExpress','Beetle PCE','Versión portátil de PC Engine, conocida como TurboExpress fuera de Japón, que utiliza las mismas HuCard.'],
['gx4000','Amstrad GX4000','Amstrad',1990,'Sobremesa','8 bits','Zilog Z80','Cartucho','Amstrad GX4000','Motor CPC Plus por verificar','Consola basada en la tecnología de los ordenadores CPC Plus y orientada a juegos en cartucho.'],
['mega-cd','Sega Mega-CD','Sega',1991,'Sobremesa','16 bits','Motorola 68000 adicional','CD-ROM','Sega CD','Genesis Plus GX / PicoDrive','Accesorio para Mega Drive que añadió juegos en CD-ROM y capacidades audiovisuales adicionales.'],
['cdi','Philips CD-i','Philips',1991,'Sobremesa','16 bits','Familia Philips 68070','CD-i','Philips CD-i','SAME CDi','Plataforma multimedia de discos ópticos que combinó aplicaciones educativas, vídeo y videojuegos.'],
['supervision','Watara Supervision','Watara',1992,'Portátil','8 bits','65C02','Cartucho','Watara Supervision','Potator','Portátil monocroma de cartuchos que compitió en el segmento de bajo coste.'],
['mega-duck','Mega Duck','Welback / Timlex / Creatronic',1993,'Portátil','8 bits','Compatible LR35902','Cartucho','Mega Duck','SameDuck','Portátil monocroma de cartuchos comercializada también bajo el nombre Cougar Boy.'],
['3do','3DO Interactive Multiplayer','The 3DO Company',1993,'Sobremesa','32 bits','ARM60','CD-ROM','3DO Interactive Multiplayer','Opera','Estándar de consola multimedia fabricado por compañías como Panasonic y GoldStar.'],
['jaguar','Atari Jaguar','Atari',1993,'Sobremesa','Arquitectura mixta','Tom, Jerry y Motorola 68000','Cartucho','Atari Jaguar','Virtual Jaguar','Última gran consola doméstica de Atari, con varios procesadores y una arquitectura poco convencional.'],
['amiga-cd32','Amiga CD32','Commodore',1993,'Sobremesa','32 bits','Motorola 68EC020','CD-ROM','Amiga CD32','PUAE','Consola de CD-ROM basada en el chipset AGA y la tecnología del Amiga 1200.'],
['fm-towns-marty','FM Towns Marty','Fujitsu',1993,'Sobremesa','32 bits','AMD 386SX','CD-ROM y disquete','FM Towns Marty','Motor FM Towns por verificar','Consola japonesa derivada de los ordenadores FM Towns, con lector de CD y unidad de disquete.'],
['playstation','PlayStation','Sony',1994,'Sobremesa','32 bits','MIPS R3000A compatible','CD-ROM','PlayStation (console)','PCSX ReARMed','Primera consola de Sony, con juegos en CD y una extensa biblioteca centrada en gráficos tridimensionales.'],
['saturn','Sega Saturn','Sega',1994,'Sobremesa','32 bits','Dos Hitachi SH-2','CD-ROM','Sega Saturn','Yabause','Consola de Sega con una arquitectura de varios procesadores y un catálogo destacado en juegos bidimensionales y recreativas.'],
['32x','Sega 32X','Sega',1994,'Sobremesa','32 bits','Dos Hitachi SH-2','Cartucho','32X','PicoDrive','Ampliación que se conecta a la ranura de Mega Drive para ejecutar cartuchos específicos de 32X.'],
['neo-geo-cd','Neo Geo CD','SNK',1994,'Sobremesa','16 bits','Motorola 68000 + Zilog Z80','CD-ROM','Neo Geo CD','NeoCD','Versión de Neo Geo con soporte óptico, concebida para reducir el precio de los juegos frente al cartucho.'],
['pc-fx','NEC PC-FX','NEC',1994,'Sobremesa','32 bits','NEC V810','CD-ROM','PC-FX','Beetle PC-FX','Consola japonesa de CD-ROM que puso el acento en vídeo y animación bidimensional.'],
['virtual-boy','Nintendo Virtual Boy','Nintendo',1995,'Portátil','32 bits','NEC V810','Cartucho','Virtual Boy','Beetle VB','Sistema de sobremesa portátil con visor estereoscópico y gráficos en rojo sobre negro.'],
['nomad','Sega Nomad','Sega',1995,'Portátil','16 bits','Motorola 68000 + Zilog Z80','Cartucho Mega Drive','Genesis Nomad','Motor de Mega Drive','Versión portátil de Mega Drive comercializada en Norteamérica, compatible con sus cartuchos.'],
['nintendo-64','Nintendo 64','Nintendo',1996,'Sobremesa','64 bits','NEC VR4300','Cartucho','Nintendo 64','Mupen64Plus-Next','Consola de cartuchos diseñada para gráficos tridimensionales y partidas locales de hasta cuatro mandos.'],
['gamecom','Tiger game.com','Tiger Electronics',1997,'Portátil','8 bits','Sharp SM8521','Cartucho','Game.com','MAME','Portátil con pantalla táctil monocroma y funciones de agenda, además de juegos en cartucho.'],
['game-boy-color','Game Boy Color','Nintendo',1998,'Portátil','8 bits','Sharp LR35902','Cartucho','Game Boy Color','Gambatte / SameBoy','Añadió color a la familia Game Boy manteniendo compatibilidad con buena parte del catálogo anterior.'],
['neo-geo-pocket','Neo Geo Pocket','SNK',1998,'Portátil','16 bits','Toshiba TLCS-900H','Cartucho','Neo Geo Pocket','Beetle NeoPop / RACE','Portátil monocroma de SNK con una pequeña palanca de control característica.'],
['dreamcast','Sega Dreamcast','Sega',1998,'Sobremesa','32 bits','Hitachi SH-4','GD-ROM','Dreamcast','Flycast','Última consola doméstica de Sega, con funciones de red y tarjetas de memoria VMU con pantalla propia.'],
['neo-geo-pocket-color','Neo Geo Pocket Color','SNK',1999,'Portátil','16 bits','Toshiba TLCS-900H','Cartucho','Neo Geo Pocket Color','Beetle NeoPop / RACE','Revisión en color de la portátil de SNK, conocida por sus adaptaciones de lucha y juegos de estrategia.'],
['wonderswan','Bandai WonderSwan','Bandai',1999,'Portátil','16 bits','NEC V30MZ','Cartucho','WonderSwan','Beetle WonderSwan','Portátil japonesa diseñada para jugar tanto en orientación horizontal como vertical.'],
['playstation-2','PlayStation 2','Sony',2000,'Sobremesa','128 bits · denominación comercial','Emotion Engine','DVD-ROM y CD-ROM','PlayStation 2','Play!.js','Sucesora de PlayStation con lector DVD, mandos DualShock 2 y compatibilidad con numerosos juegos de la consola anterior.'],
['wonderswan-color','WonderSwan Color','Bandai',2000,'Portátil','16 bits','NEC V30MZ','Cartucho','WonderSwan Color','Beetle WonderSwan','Evolución en color de WonderSwan que mantuvo su disposición de controles para dos orientaciones de pantalla.'],
['game-boy-advance','Game Boy Advance','Nintendo',2001,'Portátil','32 bits','ARM7TDMI','Cartucho','Game Boy Advance','mGBA','Renovó la familia Game Boy con una pantalla panorámica y arquitectura de treinta y dos bits.'],
['pokemon-mini','Pokémon Mini','Nintendo',2001,'Portátil','8 bits','Epson S1C88','Cartucho','Pokémon Mini','PokeMini','Pequeña consola dedicada a juegos de Pokémon, con vibración, reloj y sensor de movimiento.'],
['gamecube','Nintendo GameCube','Nintendo',2001,'Sobremesa','32 bits','IBM Gekko','Disco óptico de 8 cm','GameCube','Dolphin','Consola doméstica con cuatro puertos de mando y juegos en discos ópticos pequeños.'],
['xbox','Xbox','Microsoft',2001,'Sobremesa','32 bits','Intel Pentium III personalizado','DVD-ROM','Xbox (console)','xemu','Primera consola de Microsoft, con disco duro y conexión Ethernet integrados.'],
['ngage','Nokia N-Gage','Nokia',2003,'Portátil','32 bits','ARM920T','Tarjeta MMC','N-Gage (device)','EKA2L1','Dispositivo Symbian que combinó teléfono móvil y juegos distribuidos en tarjetas de memoria.'],
['nintendo-ds','Nintendo DS','Nintendo',2004,'Portátil','32 bits','ARM9 + ARM7','Tarjeta DS','Nintendo DS','melonDS / DeSmuME','Portátil de dos pantallas, una de ellas táctil, con micrófono y comunicación inalámbrica.'],
['psp','Sony PSP','Sony',2004,'Portátil','32 bits','MIPS Allegrex','UMD y Memory Stick','PlayStation Portable','PPSSPP','Primera portátil de Sony, con pantalla panorámica, discos UMD y reproducción multimedia.'],
['xbox-360','Xbox 360','Microsoft',2005,'Sobremesa','64 bits','IBM Xenon','DVD-ROM','Xbox 360','Xenia','Segunda consola de Microsoft, con tres núcleos de CPU y servicios de juego en línea integrados.'],
['wii','Nintendo Wii','Nintendo',2006,'Sobremesa','32 bits','IBM Broadway','Disco óptico','Wii','Dolphin','Su mando inalámbrico con detección de movimiento amplió las formas de interacción con los juegos domésticos.'],
['playstation-3','PlayStation 3','Sony',2006,'Sobremesa','64 bits','Cell Broadband Engine','Blu-ray Disc','PlayStation 3','RPCS3','Consola de Sony con procesador Cell, lector Blu-ray y almacenamiento interno.'],
['dsi','Nintendo DSi','Nintendo',2008,'Portátil','32 bits','ARM9 + ARM7','Tarjeta DS y tarjeta SD','Nintendo DSi','melonDS','Revisión de Nintendo DS con cámaras, almacenamiento interno y un catálogo descargable propio.'],
['nintendo-3ds','Nintendo 3DS','Nintendo',2011,'Portátil','32 bits','Familia ARM11','Tarjeta 3DS y tarjeta SD','Nintendo 3DS','Azahar','Portátil con pantalla superior estereoscópica sin gafas y compatibilidad con juegos de Nintendo DS.'],
['ps-vita','PlayStation Vita','Sony',2011,'Portátil','32 bits','ARM Cortex-A9','Tarjeta PS Vita','PlayStation Vita','Vita3K','Segunda portátil de Sony, con dos palancas analógicas, pantalla táctil y panel táctil trasero.'],
['wii-u','Nintendo Wii U','Nintendo',2012,'Sobremesa','32 bits','IBM Espresso','Disco óptico','Wii U','Cemu','Consola doméstica acompañada de un GamePad con pantalla táctil que permite juego asimétrico.'],
['playstation-4','PlayStation 4','Sony',2013,'Sobremesa','64 bits','AMD Jaguar x86-64','Blu-ray Disc','PlayStation 4','shadPS4','Consola de Sony basada en arquitectura AMD x86-64 y acompañada del mando DualShock 4.'],
['xbox-one','Xbox One','Microsoft',2013,'Sobremesa','64 bits','AMD Jaguar x86-64','Blu-ray Disc','Xbox One','Por evaluar','Tercera familia doméstica de Microsoft, con arquitectura x86-64 y funciones de entretenimiento conectadas.'],
['switch','Nintendo Switch','Nintendo',2017,'Portátil','64 bits','NVIDIA Tegra personalizado','Tarjeta de juego y microSD','Nintendo Switch','Por evaluar','Sistema híbrido que alterna juego portátil y conexión a un televisor mediante una base.'],
['playstation-5','PlayStation 5','Sony',2020,'Sobremesa','64 bits','AMD Zen 2','Blu-ray UHD según modelo','PlayStation 5','Por evaluar','Consola de Sony con almacenamiento SSD y mando DualSense con respuesta háptica y gatillos adaptativos.'],
['xbox-series','Xbox Series X / S','Microsoft',2020,'Sobremesa','64 bits','AMD Zen 2','Disco o distribución digital según modelo','Xbox Series X and Series S','Por evaluar','Familia formada por dos modelos con distintas prestaciones gráficas y opciones de soporte físico.'],
['switch-2','Nintendo Switch 2','Nintendo',2025,'Portátil','64 bits','NVIDIA personalizado','Tarjeta de juego y microSD Express','Nintendo Switch 2','Por evaluar','Segunda generación del sistema híbrido de Nintendo, con mandos Joy-Con 2 y pantalla de mayor tamaño.'],
];

const UA = 'VideoGamesCatalog/1.0 (https://github.com/AlejandroPico/VideoGames; reusable product photographs)';
// Keep researched machines documented without publishing an unsuitable regional photo.
const excludedFromCatalogue = new Map([
  ['super-cassette-vision', 'Pendiente de una fotografía reutilizable que identifique inequívocamente la variante francesa Yeno. La fotografía de museo disponible contiene varias máquinas y no permite certificar la identificación regional. La preferencia del proyecto es mostrar la versión europea cuando existe.'],
]);
const clean = value => String(value ?? '').replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();
async function get(url, binary = false) {
  let last;
  for (let n=0;n<4;n++) {
    try {
      const res = await fetch(url, {headers:{'User-Agent':UA}, signal:AbortSignal.timeout(45000)});
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return binary ? Buffer.from(await res.arrayBuffer()) : await res.json();
    } catch(e) { last=e; await new Promise(r=>setTimeout(r, 1000*(n+1))); }
  }
  throw last;
}
async function wiki(query, host='en.wikipedia.org') {
  return get(`https://${host}/w/api.php?${new URLSearchParams({action:'query',format:'json',...query})}`);
}
if(process.argv.includes('--category')) {
  const categories=process.argv.slice(process.argv.indexOf('--category')+1);
  for(const category of categories) {
    const d=await wiki({list:'categorymembers',cmtitle:'Category:'+category,cmlimit:'500'},'commons.wikimedia.org');
    console.log(category,JSON.stringify(d.query.categorymembers.map(p=>p.title)));
  }
  process.exit(0);
}
if(process.argv.includes('--inspect')) {
  const names=process.argv.slice(process.argv.indexOf('--inspect')+1);
  const d=await wiki({titles:names.map(n=>'File:'+n).join('|'),prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'640'},'commons.wikimedia.org');
  for(const p of Object.values(d.query.pages)) {
    const i=p.imageinfo?.[0],m=i?.extmetadata??{};
    console.log(JSON.stringify({file:p.title,description:clean(m.ImageDescription?.value),categories:clean(m.Categories?.value),author:clean(m.Artist?.value),license:clean(m.LicenseShortName?.value),url:i?.thumburl}));
  }
  process.exit(0);
}
if(process.argv.includes('--search')) {
  const queries=process.argv.slice(process.argv.indexOf('--search')+1);
  for(const q of queries.length?queries:['Nintendo Switch 2 console','Sharp X68000 computer','PC Engine CD ROM2','Nintendo Game Watch Ball']) {
    const d=await wiki({list:'search',srnamespace:'6',srlimit:'15',srsearch:q+' -logo -icon'},'commons.wikimedia.org');
    console.log(q, JSON.stringify(d.query.search.map(p=>p.title)));
  }
  process.exit(0);
}
await mkdir(path.join(root,'public/machines'),{recursive:true});
await mkdir(path.join(root,'src'),{recursive:true});
await mkdir(path.join(root,'docs'),{recursive:true});
const manifestPath = path.join(root,'public/machines/photos.json');
let previous={};
try { previous=JSON.parse(await readFile(manifestPath,'utf8')); } catch {}
const imageTitles={};
for(let i=0;i<seeds.length;i+=15) {
  const part=seeds.slice(i,i+15);
  const data=await wiki({titles:part.map(s=>s[8]).join('|'),prop:'pageimages',piprop:'name',redirects:'1'});
  const pages=Object.values(data.query.pages);
  for(const seed of part) {
    let title=seed[8];
    for(const red of data.query.redirects??[])if(red.from===title)title=red.to;
    imageTitles[seed[0]]=pages.find(p=>p.title===title)?.pageimage;
  }
}
const overrides={
  'snes':'Wikipedia SNES PAL.png',
  'channel-f':'Saba Video Play.jpg',
  'nes':'Wikipedia NES PAL.jpg',
  'mega-drive':'Sega-Mega-Drive-EU-Mk1-wController-FL.jpg',
  'master-system':'Sega Master System II Power Base (black, with original control pad) - three-quarter view.jpg',
  'atari-7800':'Atari-7800-wControl-Pad-L.jpg',
  'nintendo-64':'Wikipedia N64 PAL.jpg',
  'gamecube':'Wikipedia GAMECUBE PAL.jpg',
  'dreamcast':'Dreamcast PAL Set.jpg',
  'mega-cd':'Sega Mega-CD II (PAL).jpg',
  '32x':'Mega Drive II (PAL) + Mega-CD II (PAL) + 32X (PAL).png',
  'turboexpress':'PC Engine GT.jpg',
  'super-cassette-vision':'Super-Cassette-Vision-Console-L.jpg',
  'saturn':'Saturn sega.jpg',
  'playstation-2':'Sony PlayStation 2 SCPH-39004 (PAL-EUR) - front view.jpg',
  'ps-vita':'Sony PlayStation Vita PCH-1004 (EUR) - front view.jpg',
  'studio-ii':'RCA-Studio-II-FL.jpg',
  'game-watch':'Game-and-watch-ball.png',
  'pc-engine':'PC-Engine-Console-Set.jpg',
  'pc-engine-cd':'NEC CD-Rom 2 Unit.jpg',
  'x68000':'Sharp X68000 XVI.jpg',
  'supergrafx':'SuperGrafx-Console-Set.jpg',
  'gx4000':'Amstrad-GX4000-Console-Set.jpg',
  'mega-duck':'Mega duck cougar boy and games Lighter Sharper.jpg',
  'jaguar':'Atari-Jaguar-Console-Set.jpg',
  'playstation':'PSX-Console-wController.jpg',
  'dreamcast':'Dreamcast PAL Set.jpg',
  'wonderswan':'WonderSwan-Black-Left.jpg',
  'neo-geo-pocket-color':'Neo-Geo-Pocket-Color-Blue-Left.jpg',
  'xbox-360':'Xbox-360-Pro-wController.jpg',
  'switch':'Nintendo-Switch-Console-Docked-wJoyConRB.jpg',
  'switch-2':'Nintendo Switch 2 console in handheld mode.png',
  'xbox-series':'Xbox Series X 2.jpg',
  'cdi':'CD-i-910-Console-Set.jpg',
};
Object.assign(imageTitles,overrides);
const photos={};
for(const seed of seeds) {
  const id=seed[0];
  if(excludedFromCatalogue.has(id))continue;
  if(previous[id] && !process.argv.includes('--refresh') && (!overrides[id] || previous[id].file===overrides[id])) {
    try {await access(path.join(root,'public',previous[id].image));photos[id]=previous[id];console.log(`cached ${id}`);continue;}catch{}
  }
  let filename=imageTitles[id];
  let data=filename?await wiki({titles:`File:${filename}`,prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'640'},'commons.wikimedia.org'):null;
  let page=data?Object.values(data.query.pages)[0]:null;
  if(!page?.imageinfo || /logo|icon|\.svg$/i.test(filename)) {
    const result=await wiki({generator:'search',gsrsearch:`${seed[1]} -logo -icon`,gsrnamespace:'6',gsrlimit:'12',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'640'},'commons.wikimedia.org');
    const candidates=Object.values(result.query?.pages??{}).filter(p=>p.imageinfo&&/\.(png|jpe?g)$/i.test(p.title)&&!/logo|icon|back|rear|internal|bottom/i.test(p.title));
    page=candidates.find(p=>/Evan.Amos/i.test(p.imageinfo[0].extmetadata?.Artist?.value??''))??candidates[0];
    filename=page?.title?.slice(5);
    console.log(`SEARCH ${id}: ${filename}`);
  }
  if(!page?.imageinfo)throw new Error(`No reusable photograph found: ${id}`);
  const info=page.imageinfo[0], meta=info.extmetadata??{};
  const licence=clean(meta.LicenseShortName?.value);
  if(!licence||/fair.use|non.free|copyrighted/i.test(licence))throw new Error(`Unacceptable licence: ${id} ${licence}`);
  const ext=/\.png$/i.test(filename)?'png':'jpg';
  const image=`machines/${id}.${ext}`;
  const url=(info.thumburl??info.url).split('?')[0];
  const content=await get(url,true);
  if(content.length<1000)throw new Error(`Image too small: ${id}`);
  await writeFile(path.join(root,'public',image),content);
  photos[id]={image,photoSource:info.descriptionurl,photoAuthor:clean(meta.Artist?.value),photoLicense:licence,file:filename,download:url,licenseUrl:meta.LicenseUrl?.value??'',description:clean(meta.ImageDescription?.value)};
  await writeFile(manifestPath,JSON.stringify({...previous,...photos},null,2)+'\n');
  console.log(`${id}: ${filename} (${licence}, ${content.length} bytes)`);
}
const europeanPhotos = new Set(['channel-f','nes','atari-7800','master-system','mega-drive','snes','mega-cd','32x','nintendo-64','dreamcast','playstation-2','gamecube','ps-vita']);
const regionalNotes = {
  'channel-f':'Fotografía de SABA Videoplay, variante comercial europea de la familia Channel F.',
  'master-system':'Fotografía del modelo Master System II europeo; la ficha reúne la familia Master System.',
  'snes':'Modelo PAL europeo de Super Nintendo, con los cuatro colores del mando europeo. El año de la ficha corresponde al lanzamiento original japonés de la familia.',
  'mega-cd':'Modelo Mega-CD II PAL europeo junto a Mega Drive II; la ficha agrupa la familia Mega-CD.',
  '32x':'32X PAL europeo montado sobre Mega Drive II y Mega-CD II PAL europeos.',
  'playstation-2':'Modelo SCPH-39004 PAL-EUR. El año corresponde al lanzamiento original de la familia PlayStation 2.',
  'ps-vita':'Modelo PCH-1004 EUR, identificado expresamente por la fuente fotográfica.',
  'super-cassette-vision':'Excepción fotográfica pendiente: se conserva una fotografía clara del modelo japonés. Existió una variante francesa comercializada por Yeno, pero todavía no se ha localizado una fotografía reutilizable de producto que la identifique inequívocamente.',
  'saturn':'Carcasa negra del modelo 2, diseño utilizado en Europa. La región eléctrica de la unidad de la fotografía no se puede comprobar sin ver su etiqueta.',
  'pc-engine':'Modelo japonés original. La distribución europea de PC Engine incluyó importaciones y adaptaciones locales; no se utiliza la TurboGrafx-16 norteamericana.',
  'pc-engine-cd':'Unidad japonesa CD-ROM². No se utiliza el conjunto TurboGrafx-CD norteamericano.',
  'supergrafx':'Modelo japonés original. Su presencia europea se debió principalmente a importación especializada.',
  'turboexpress':'PC Engine GT japonesa; no tuvo una versión europea oficial. Se evita la variante norteamericana TurboExpress.',
  'studio-ii':'Modelo estadounidense de RCA Studio II. Hubo sistemas compatibles de otras marcas en Europa, pero no una edición europea del modelo RCA fotografiado.',
  'astrocade':'Modelo estadounidense; Bally Astrocade no tuvo una edición europea oficial.',
  'apf-mp1000':'Modelo estadounidense; APF MP1000 no tuvo una edición europea oficial.',
  'cassette-vision':'Modelo japonés original; Cassette Vision no tuvo una edición europea oficial.',
  'sg-1000':'Modelo japonés original. SG-1000 tuvo distribución en algunos mercados de Asia y Oceanía, sin una edición europea equivalente.',
  'x68000':'Ordenador japonés, fotografiado en su revisión XVI; no tuvo una edición europea oficial.',
  'fm-towns-marty':'Modelo japonés; FM Towns Marty no tuvo una edición europea oficial.',
  'pc-fx':'Modelo japonés; PC-FX no tuvo una edición europea oficial.',
  'virtual-boy':'Modelo norteamericano. Virtual Boy se comercializó en Japón y Norteamérica y no tuvo una edición europea oficial.',
  'nomad':'Modelo norteamericano; Sega Nomad no tuvo una edición europea oficial.',
  'neo-geo-pocket':'Modelo monocromo japonés; su sucesora Neo Geo Pocket Color sí tuvo distribución europea.',
  'wonderswan':'Modelo japonés; WonderSwan no tuvo una edición europea oficial.',
  'wonderswan-color':'Modelo japonés; WonderSwan Color no tuvo una edición europea oficial.',
};
const japanesePhotos=new Set(['cassette-vision','super-cassette-vision','sg-1000','pc-engine','pc-engine-cd','x68000','supergrafx','turboexpress','fm-towns-marty','pc-fx','neo-geo-pocket','wonderswan','wonderswan-color']);
const americanPhotos=new Set(['studio-ii','astrocade','apf-mp1000','virtual-boy','nomad']);
for(const seed of seeds) {
  const id=seed[0];
  if(excludedFromCatalogue.has(id))continue;
  photos[id].photoRegion=europeanPhotos.has(id)?'Europa':japanesePhotos.has(id)?'Japón':americanPhotos.has(id)?'Norteamérica':'Diseño internacional compartido';
  photos[id].regionNote=regionalNotes[id]??(europeanPhotos.has(id)?'Variante PAL o europea identificada en la fuente fotográfica.':'El exterior fotografiado corresponde al diseño internacional utilizado también en Europa. La fotografía no certifica la región eléctrica de la unidad.');
}
const records=seeds.filter(s=>!excludedFromCatalogue.has(s[0])).map(s=>({id:s[0],name:s[1],maker:s[2],year:s[3],kind:s[4],bits:s[5],cpu:s[6],media:s[7],history:s[10],...photos[s[0]],ready:s[0]==='snes',engine:s[9]})).sort((a,b)=>a.year-b.year||a.name.localeCompare(b.name,'es'));
const type=`export type Machine = {\n  id: string; name: string; maker: string; year: number;\n  kind: 'Sobremesa' | 'Portátil' | 'Ordenador'; bits: string; cpu: string; media: string;\n  history: string; image: string; photoSource: string; photoAuthor: string; photoLicense: string;\n  photoRegion: string; regionNote: string;\n  ready: boolean; engine: string;\n};\n\n`;
await writeFile(path.join(root,'src/catalog.ts'),type+'export const machines: Machine[] = '+JSON.stringify(records.map(({file,download,licenseUrl,description,...m})=>m),null,2)+';\n');
let credits='# Créditos fotográficos\n\nLas imágenes son fotografías de los dispositivos reales, no fotografías oficiales de sus fabricantes. Se distribuyen con la licencia indicada en cada fuente. Los nombres y marcas identifican sus respectivos productos.\n\nLa selección prioriza las variantes europeas cuando su diseño regional es identificable. Para los diseños exteriores compartidos no se atribuye una región eléctrica que la foto no demuestra. Los modelos sin edición europea se identifican expresamente; los años del catálogo corresponden al primer lanzamiento mundial de la familia, no al de la revisión fotografiada.\n\n';
for(const m of records) {
  credits+=`## ${m.name}\n\n- Archivo local: \`public/${m.image}\`\n- Fotografía: [${m.file}](${m.photoSource})\n- Autor: ${m.photoAuthor}\n- Licencia: ${m.photoLicense}${m.licenseUrl?` · ${m.licenseUrl}`:''}\n- Región de la fotografía: ${m.photoRegion}\n- Nota regional: ${m.regionNote}\n- Adaptación: miniatura generada por Wikimedia Commons; sin modificaciones por VideoGames.\n\n`;
  const dir=path.join(root,'Machines',m.id);await mkdir(dir,{recursive:true});
  const readme=`# ${m.name}\n\n${m.history}\n\n- Fabricante: ${m.maker}\n- Primer lanzamiento mundial de la familia: ${m.year}\n- Tipo: ${m.kind}\n- Arquitectura: ${m.bits}\n- Procesador: ${m.cpu}\n- Soporte: ${m.media}\n- Motor candidato: ${m.engine}\n- Estado: ${m.ready?'Emulación integrada.':'Ficha de catálogo; emulación pendiente de implementación y validación.'}\n- Región de la fotografía: ${m.photoRegion}\n- Nota regional: ${m.regionNote}\n\nLa fotografía y sus créditos se encuentran en el catálogo compartido y en \`docs/PHOTO-CREDITS.md\`. Esta carpeta reserva la implementación específica de la máquina. No contiene juegos ni firmware propietario.\n`;
  // Preserve the implementation owner's SNES documentation.
  if(m.id!=='snes')await writeFile(path.join(dir,'README.md'),readme);
}
for(const [id,reason] of excludedFromCatalogue) {
  const seed=seeds.find(s=>s[0]===id);
  const dir=path.join(root,'Machines',id);await mkdir(dir,{recursive:true});
  await writeFile(path.join(dir,'README.md'),`# ${seed[1]}\n\n${seed[10]}\n\n- Fabricante: ${seed[2]}\n- Primer lanzamiento mundial: ${seed[3]}\n- Motor candidato: ${seed[9]}\n- Estado: documentación conservada; ficha excluida de la primera versión pública.\n\n## Motivo\n\n${reason}\n\nLa ficha podrá incorporarse cuando se disponga de una fotografía europea verificable. No contiene juegos ni firmware propietario.\n`);
  credits+=`## Ficha documentada fuera del catálogo: ${seed[1]}\n\n${reason}\n\n`;
}
await writeFile(path.join(root,'docs/PHOTO-CREDITS.md'),credits);
await writeFile(manifestPath,JSON.stringify(photos,null,2)+'\n');
console.log(`Catalogue ready: ${records.length} machines, ${records.filter(m=>m.ready).length} emulator.`);
