import { useEffect, useRef, useState } from 'react';
import { Upload, Play, Pause, RotateCcw, Maximize, Gamepad2, Volume2, VolumeX, HelpCircle, X } from 'lucide-react';
import Modal from '../../src/shared/Modal';
import { validateRom } from './files';
type Phase='empty'|'loading'|'running'|'paused'|'error';
export default function Player({onPause}:{onPause:(paused:boolean)=>void}) {
  const [phase,setPhase]=useState<Phase>('empty'),[filename,setFilename]=useState(''),[message,setMessage]=useState(''),[help,setHelp]=useState(false),[muted,setMuted]=useState(false),[session,setSession]=useState(0);
  const phaseRef=useRef(phase);phaseRef.current=phase;
  const frame=useRef<HTMLIFrameElement>(null),area=useRef<HTMLDivElement>(null),romInput=useRef<HTMLInputElement>(null),file=useRef<File|null>(null),hash=useRef<Uint8Array>(new Uint8Array()),timeout=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
  const running=phase==='running'||phase==='paused';
  function send(action:string,payload:Record<string,unknown>={}){frame.current?.contentWindow?.postMessage({channel:'videogames:snes',action,...payload},location.origin);}
  function pause(){if(phaseRef.current==='running'){send('pause');setPhase('paused');onPause(true);}}
  function resume(){if(phaseRef.current==='paused'){send('resume');setPhase('running');onPause(false);frame.current?.focus();}}
  function togglePause(){if(phaseRef.current==='running')pause();else if(phaseRef.current==='paused')resume();}
  function fail(text:string){clearTimeout(timeout.current);setMessage(text);setPhase('error');onPause(true);}
  async function openFile(next:File){
    const invalid=validateRom(next);if(invalid){setMessage(invalid);return;}
    pause();setMessage('');file.current=next;setFilename(next.name);setPhase('loading');onPause(true);
    try{hash.current=new Uint8Array(await crypto.subtle.digest('SHA-256',await next.arrayBuffer()));setSession(s=>s+1);}catch{fail('No se ha podido leer el juego. Vuelve a seleccionar el archivo.');}
  }
  function fullscreen(){if(document.fullscreenElement)void document.exitFullscreen();else void area.current?.requestFullscreen().catch(()=>setMessage('Este navegador no permite pantalla completa.'));}
  useEffect(()=>{
    const receive=(event:MessageEvent)=>{
      if(event.origin!==location.origin||event.source!==frame.current?.contentWindow||event.data?.channel!=='videogames:snes')return;
      const data=event.data;
      if(data.type==='ready'&&file.current){send('load',{file:file.current,identity:Array.from(hash.current).map(v=>v.toString(16).padStart(2,'0')).join(''),muted});clearTimeout(timeout.current);timeout.current=setTimeout(()=>fail('El emulador no ha podido iniciar este archivo. Comprueba que sea una ROM compatible de Super Nintendo.'),60000);}
      if(data.type==='started'){clearTimeout(timeout.current);setPhase('running');onPause(false);frame.current?.focus();}
      if(data.type==='error')fail('No se ha podido iniciar el emulador. Vuelve a abrir el juego o prueba otro navegador actualizado.');
      if(data.type==='pause')pause();
      if(data.type==='toggle-pause')togglePause();
      if(data.type==='notice')setMessage(String(data.message));
    };
    const visibility=()=>{if(document.hidden)pause();};
    const blur=()=>{setTimeout(()=>{if(!document.hasFocus())pause();},0);};
    window.addEventListener('message',receive);window.addEventListener('videogames:pause',pause);window.addEventListener('videogames:toggle-pause',togglePause);document.addEventListener('visibilitychange',visibility);window.addEventListener('blur',blur);
    return()=>{window.removeEventListener('message',receive);window.removeEventListener('videogames:pause',pause);window.removeEventListener('videogames:toggle-pause',togglePause);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('blur',blur);};
  },[filename,muted]);
  useEffect(()=>()=>{clearTimeout(timeout.current);},[]);
  useEffect(()=>{if(phase==='paused')area.current?.querySelector<HTMLButtonElement>('.resume-button')?.focus();},[phase]);
  return <div className="player-page">
    <div className="player-toolbar" aria-label="Controles de emulación">
      <button onClick={()=>{pause();romInput.current?.click();}}><Upload size={16}/><span>Abrir juego</span></button>
      <span className="rom-name" title={filename}>{filename||'Super Nintendo'}</span>
      <div className="player-tools">
        <button className="icon" aria-label={phase==='paused'?'Reanudar':'Pausar'} disabled={!running} onClick={togglePause}>{phase==='paused'?<Play size={18}/>:<Pause size={18}/>}</button>
        <button className="icon" aria-label="Reiniciar juego" disabled={!running} onClick={()=>{send('restart');setMessage('Juego reiniciado.');}}><RotateCcw size={17}/></button>
        <button className="icon" aria-label={muted?'Activar sonido':'Silenciar'} disabled={!running} onClick={()=>{setMuted(v=>!v);send('mute',{muted:!muted});}}>{muted?<VolumeX size={17}/>:<Volume2 size={17}/>}</button>
        <button className="icon" aria-label="Pantalla completa" onClick={fullscreen}><Maximize size={17}/></button>
        <button className="icon" aria-label="Controles y ayuda" onClick={()=>{pause();setHelp(true);}}><HelpCircle size={17}/></button>
      </div>
    </div>
    <input ref={romInput} className="file-input" type="file" accept=".sfc,.smc" aria-label="Seleccionar ROM de Super Nintendo" onChange={e=>{const f=e.target.files?.[0];if(f)void openFile(f);e.target.value='';}}/>
    <div ref={area} className="player-surface" onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)void openFile(f);}}>
      {file.current&&session>0&&phase!=='error'&&<iframe key={session} ref={frame} title="Emulador de Super Nintendo" src={`${import.meta.env.BASE_URL}machines/snes/runtime/host.html`} allow="autoplay; gamepad; fullscreen"/>}
      {(phase==='empty'||phase==='error')&&<div className="player-welcome"><Gamepad2 size={45} strokeWidth={1}/><h1>Super Nintendo</h1><p>{phase==='error'?message:'Selecciona un juego de tu dispositivo o arrástralo aquí.'}</p><button className="primary" onClick={()=>romInput.current?.click()}><Upload size={17}/>{phase==='error'?'Abrir otro juego':'Abrir juego'}</button><span className="file-formats">.sfc · .smc</span><p className="local-note">El archivo se ejecuta en este dispositivo y no se envía a ningún servidor. Esta primera versión no conserva partidas al cerrar el juego.</p></div>}
      {phase==='loading'&&<div className="player-overlay"><span className="loader"/><p>Preparando Super Nintendo…</p></div>}
      {phase==='paused'&&<div className="player-overlay pause-overlay"><Pause size={32} strokeWidth={1}/><h2>En pausa</h2><button className="primary resume-button" onClick={resume}><Play size={17}/>Reanudar</button><button onClick={()=>{setHelp(true);}}>Controles</button></div>}
    </div>
    <div className="player-status" role="status"><span>{phase==='loading'?'Cargando…':message&&phase!=='error'?message:phase==='running'?'En ejecución':phase==='paused'?'En pausa':'ROM local · sin juegos incluidos'}</span><span className="menu-hint">Esc · Menú <span> / </span> L3 + R3</span></div>
    {help&&<Modal title="Controles de Super Nintendo" close={()=>setHelp(false)}><p>Conecta un mando por USB o Bluetooth y pulsa un botón para que el navegador lo reconozca. Los mandos Xbox, PlayStation y Switch dependen del soporte del navegador y del sistema.</p><table className="controls-table"><thead><tr><th>SNES</th><th>Teclado</th><th>Mando estándar</th></tr></thead><tbody>{[['Cruceta','Flechas','Cruceta / stick izquierdo'],['B / A','Z / X','Botón inferior / derecho'],['Y / X','A / S','Botón izquierdo / superior'],['L / R','Q / W','LB / RB · L1 / R1'],['Select / Start','Mayús / Intro','Select / Start'],['Menú','Esc','L3 + R3']].map(row=><tr key={row[0]}>{row.map(cell=><td key={cell}>{cell}</td>)}</tr>)}</tbody></table><p>En el catálogo: cruceta o stick para moverte, botón inferior para abrir y botón derecho para volver. En pantallas táctiles aparecen los controles de juego.</p><p>Esta primera versión mantiene la partida mientras el juego está abierto. El guardado persistente y los estados instantáneos están pendientes de una integración fiable del motor.</p><button onClick={()=>setHelp(false)}><X size={15}/>Cerrar</button></Modal>}
  </div>;
}
