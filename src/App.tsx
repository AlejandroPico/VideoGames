import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, Sun, Sunset, Moon, Info, X, Play, Gamepad2, ArrowUpRight } from 'lucide-react';
import { machines, type Machine } from './catalog';
import { emptyFilters, filterMachines, type Filters } from './filter';
import AutoThemeIcon from './shared/AutoThemeIcon';
import About, { useInstallation } from './shared/About';
import { read, write } from './shared/storage';
import { moveFocus, useGamepad, type MenuAction } from './shared/gamepad';
import SnesSetup from '../Machines/snes/Setup';
import { defaultSnesOptions,type SnesOptions } from '../Machines/snes/config';
const SnesPlayer=lazy(()=>import('../Machines/snes/Player'));
const base=import.meta.env.BASE_URL;
const getRoute=()=>location.hash.slice(1).split('/').filter(Boolean);
function loadFilters():Filters {
  try { const f=JSON.parse(read('filters','{}'));return {kinds:Array.isArray(f.kinds)?f.kinds:[],makers:Array.isArray(f.makers)?f.makers:[],onlyReady:f.onlyReady===true,decade:typeof f.decade==='string'?f.decade:''}; } catch{return emptyFilters;}
}
function Photo({machine,large=false}:{machine:Machine;large?:boolean}) {
  return <img src={`${base}${machine.image}`} alt={machine.name} loading={large?'eager':'lazy'} decoding="async" width="640" height="480" />;
}
function Presentation({machine:m,setup}:{machine:Machine;setup?:ReactNode}) {
  return <article className="machine-presentation">
    <figure className="machine-photo"><Photo machine={m} large /><figcaption><a href={m.photoSource} target="_blank" rel="noreferrer">{m.photoAuthor} · {m.photoLicense}<ArrowUpRight size={12}/></a></figcaption></figure>
    <section className="machine-description">
      <p className="machine-maker">{m.maker} · {m.kind}</p><h1 tabIndex={-1}>{m.name}</h1>
      <p className="machine-history">{m.history}</p>
      <dl className="specifications"><div><dt>Primer lanzamiento</dt><dd>{m.year}</dd></div><div><dt>Arquitectura</dt><dd>{m.bits}</dd></div><div><dt>Procesador</dt><dd>{m.cpu}</dd></div><div><dt>Soporte</dt><dd>{m.media}</dd></div></dl>
      {m.ready?setup:<div className="pending-emulation"><span className="status-dot"/><span>Emulación pendiente de incorporar</span></div>}
    </section>
  </article>;
}
export default function App(){
  const installation=useInstallation();
  const [route,setRoute]=useState(getRoute),[query,setQuery]=useState(''),[filters,setFilters]=useState<Filters>(loadFilters),[panel,setPanel]=useState<'search'|'filter'|'theme'|null>(null),[about,setAbout]=useState(false),[theme,setTheme]=useState(()=>read('theme','day')),[paused,setPaused]=useState(true);
  const [snesFile,setSnesFile]=useState<File|null>(null),[snesLibrary,setSnesLibrary]=useState<File[]>([]),[snesOptions,setSnesOptions]=useState<SnesOptions>(()=>{try{const o=JSON.parse(read('snes:options','{}'));return {inputMode:['auto','touch','controller'].includes(o.inputMode)?o.inputMode:'auto',sound:o.sound!==false};}catch{return defaultSnesOptions;}});
  const machine=machines.find(m=>m.id===route[1]), playing=!!machine?.ready&&route[2]==='play'&&!!snesFile;
  const filtered=filterMachines(machines,filters,query), main=useRef<HTMLElement>(null);
  const activeCount=filters.kinds.length+filters.makers.length+(filters.onlyReady?1:0)+(filters.decade?1:0);
  function pause(){window.dispatchEvent(new Event('videogames:pause'));}
  function navigate(action:MenuAction){
    if(action==='menu'){if(playing)window.dispatchEvent(new Event('videogames:toggle-pause'));return;}
    if(playing&&!paused)return;
    if(action==='back'){if(about)setAbout(false);else if(panel)setPanel(null);else if(playing)location.hash=`machine/${machine!.id}`;else if(machine)location.hash='';return;}
    const target=document.activeElement as HTMLElement;
    if(target instanceof HTMLSelectElement&&(action==='left'||action==='right')){
      target.selectedIndex=Math.max(0,Math.min(target.options.length-1,target.selectedIndex+(action==='right'?1:-1)));
      target.dispatchEvent(new Event('change',{bubbles:true}));return;
    }
    if(['up','down','left','right'].includes(action)){moveFocus(action as 'up');return;}
    if(action==='accept'){
      if(!target||target===document.body){(document.querySelector('.game-tile') as HTMLElement)?.focus();return;}
      if(target.matches('input[type=checkbox]'))target.click();else if(!target.matches('input,select'))target.click();
    }
  }
  const pads=useGamepad(navigate);
  useEffect(()=>{const change=()=>{setRoute(getRoute());setPanel(null);setPaused(true);};window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
  useEffect(()=>{if(machine?.ready&&route[2]==='play'&&!snesFile)location.replace(`#machine/${machine.id}`);},[machine,route[2],snesFile]);
  useEffect(()=>{document.documentElement.dataset.view=playing?'player':machine?'machine':'catalog';document.title=machine?`${machine.name} · VideoGames`:'VideoGames';if(machine)main.current?.querySelector<HTMLElement>('h1')?.focus();},[machine,playing]);
  useEffect(()=>{write('filters',JSON.stringify(filters));},[filters]);
  useEffect(()=>{write('snes:options',JSON.stringify(snesOptions));},[snesOptions]);
  useEffect(()=>{function update(){const hour=new Date().getHours();document.documentElement.dataset.theme=theme==='auto'?(hour<7||hour>=21?'night':hour>=18?'afternoon':'day'):theme;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());}update();write('theme',theme);const timer=setInterval(update,60000);return()=>clearInterval(timer);},[theme]);
  useEffect(()=>{if(panel||about)pause();},[panel,about,paused]);
  useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key!=='Escape')return;if(about)setAbout(false);else if(panel)setPanel(null);else if(playing)window.dispatchEvent(new Event('videogames:toggle-pause'));};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[about,panel,playing]);
  useEffect(()=>{if(!panel)return;const close=(e:PointerEvent)=>{if(!(e.target as Element).closest('.site-header'))setPanel(null);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[panel]);
  const toggle=(name:typeof panel)=>setPanel(p=>p===name?null:name);
  const select=(field:'makers'|'kinds',value:string)=>setFilters(f=>({...f,[field]:f[field].includes(value)?f[field].filter(v=>v!==value):[...f[field],value]}));
  const clear=()=>{setFilters(emptyFilters);setQuery('');};
  return <>
    <a className="skip-link" href="#content" onClick={e=>{e.preventDefault();main.current?.focus();}}>Ir al contenido</a>
    <header className="site-header">
      {machine&&<a className="icon back" href={playing?`#machine/${machine.id}`:'#'} aria-label={playing?'Volver a la consola':'Volver a la colección'}><ArrowLeft size={20}/></a>}
      <a className="brand" href="#" aria-label="VideoGames, inicio"><img src={`${base}favicon.svg?v=0.1.0`} alt=""/><span>VideoGames</span></a>
      {playing&&<span className="header-game-title">{machine!.name}</span>}
      <nav aria-label="Herramientas">
        {pads.length>0&&<span className="controller-indicator" title={pads.join(', ')} aria-label={`${pads.length} mandos conectados`}><Gamepad2 size={17}/><span>{pads.length}</span></span>}
        {<><button className={`icon ${query||panel==='search'?'active':''}`} aria-label="Buscar máquinas" aria-expanded={panel==='search'} onClick={()=>toggle('search')}><Search size={21}/></button><button className={`icon ${activeCount||panel==='filter'?'active':''}`} aria-label="Ajustes y filtros" aria-expanded={panel==='filter'} onClick={()=>toggle('filter')}><SlidersHorizontal size={21}/>{activeCount>0&&<span className="filter-badge">{activeCount}</span>}</button></>}
        <button className="icon" aria-label="Cambiar iluminación" aria-expanded={panel==='theme'} onClick={()=>toggle('theme')}>{theme==='auto'?<AutoThemeIcon size={21}/>:theme==='night'?<Moon size={21}/>:theme==='afternoon'?<Sunset size={21}/>:<Sun size={21}/>}</button>
        <button className="icon" aria-label="Acerca de VideoGames" onClick={()=>{setPanel(null);setAbout(true);}}><Info size={21}/></button>
      </nav>
      {panel&&<section className="popover" aria-label={panel==='filter'?'Ajustes y filtros':panel==='search'?'Búsqueda':'Iluminación'}><div className="popover-heading"><strong>{panel==='filter'?'Ajustes y filtros':panel==='search'?'Buscar máquinas':'Iluminación'}</strong><button className="icon" aria-label="Cerrar panel" onClick={()=>setPanel(null)}><X size={17}/></button></div>
        {panel==='search'?<form onSubmit={e=>{e.preventDefault();if(machine)location.hash='';setPanel(null);}}><label className="search-box"><Search size={17}/><input type="search" autoFocus aria-label="Nombre, fabricante o año" placeholder="Buscar…" value={query} onChange={e=>setQuery(e.target.value)}/></label>{machine&&<button className="primary full" type="submit">Ver resultados</button>}</form>:panel==='filter'?<>
          <label className="availability-filter"><input type="checkbox" checked={filters.onlyReady} onChange={e=>setFilters(f=>({...f,onlyReady:e.target.checked}))}/><span>Solo máquinas con emulación disponible</span></label>
          <fieldset><legend>Tipo</legend><div className="category-options">{['Sobremesa','Portátil','Ordenador'].map(kind=><label key={kind}><input type="checkbox" checked={filters.kinds.includes(kind)} onChange={()=>select('kinds',kind)}/><span>{kind}</span></label>)}</div></fieldset>
          <label className="decade-filter">Época<select aria-label="Época" value={filters.decade} onChange={e=>setFilters(f=>({...f,decade:e.target.value}))}><option value="">Todas</option>{Array.from(new Set(machines.map(m=>Math.floor(m.year/10)*10))).map(y=><option value={y} key={y}>{y}–{y+9}</option>)}</select></label>
          <fieldset><legend>Fabricante</legend><div className="category-options makers">{Array.from(new Set(machines.map(m=>m.maker))).sort().map(maker=><label key={maker}><input type="checkbox" checked={filters.makers.includes(maker)} onChange={()=>select('makers',maker)}/><span>{maker}</span></label>)}</div></fieldset>
          <div className="filter-actions"><button className="secondary" onClick={clear} disabled={!activeCount&&!query}>Limpiar</button><button className="primary" onClick={()=>{if(machine)location.hash='';setPanel(null);}}>Aplicar</button></div>
        </>:<><div className="theme-options">{[{id:'day',name:'Día',Icon:Sun},{id:'afternoon',name:'Tarde',Icon:Sunset},{id:'night',name:'Noche',Icon:Moon},{id:'auto',name:'Automático',Icon:AutoThemeIcon}].map(t=><button key={t.id} className={theme===t.id?'selected':''} aria-pressed={theme===t.id} onClick={()=>setTheme(t.id)}><t.Icon size={17}/>{t.name}</button>)}</div><p className="small">El modo automático sigue la hora local.</p></>}
      </section>}
    </header>
    <main ref={main} id="content" tabIndex={-1}>
      {machine?(playing?<Suspense fallback={<div className="empty-state">Cargando emulador…</div>}><SnesPlayer onPause={setPaused} initialFile={snesFile!} options={snesOptions}/></Suspense>:<Presentation machine={machine} setup={machine.id==='snes'?<SnesSetup file={snesFile} library={snesLibrary} onLibrary={setSnesLibrary} options={snesOptions} pads={pads} onFile={setSnesFile} onOptions={setSnesOptions} onStart={()=>{location.hash='machine/snes/play';}}/>:null}/>):route.length>0?<div className="empty-state"><h1>Máquina no encontrada</h1><a className="primary" href="#">Volver a la colección</a></div>:<div className="collection">
        {(activeCount>0||query)&&<div className="active-filters"><span>{filtered.length} máquinas{query?` · «${query}»`:''}{filters.onlyReady?' · Emulación disponible':''}</span><button onClick={clear}>Limpiar<X size={13}/></button></div>}
        <div className="game-grid" aria-label="Colección de máquinas, por año de lanzamiento">{filtered.map((m,i)=><a className="game-tile" key={m.id} href={`#machine/${m.id}`} aria-label={`${m.name}, ${m.year}${m.ready?', emulación disponible':''}`} title={m.name}><div className="tile-art"><img src={`${base}${m.image}`} alt="" loading={i<12?'eager':'lazy'} decoding="async" width="640" height="480"/></div><span className="tile-title">{m.name}</span><span className="tile-year">{m.year}</span><span className="tile-category">{m.kind}</span></a>)}</div>
        {!filtered.length&&<div className="empty-state"><h1>No hay máquinas con esos filtros</h1><button onClick={clear}>Limpiar filtros</button></div>}
      </div>}
    </main>
    {about&&<About installation={installation} close={()=>setAbout(false)}/>}
  </>;
}
