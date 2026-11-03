import { useRef,useState } from 'react';
import { FolderOpen,Play,Gamepad2,Folder,X,Search } from 'lucide-react';
import { validateRom } from './files';
import type { SnesOptions } from './config';
export default function Setup({file,library,options,pads,onFile,onLibrary,onOptions,onStart}:{
  file:File|null;library:File[];options:SnesOptions;pads:string[];onFile:(file:File)=>void;onLibrary:(files:File[])=>void;
  onOptions:(options:SnesOptions)=>void;onStart:()=>void;
}) {
  const input=useRef<HTMLInputElement>(null),folder=useRef<HTMLInputElement>(null),[error,setError]=useState(''),[query,setQuery]=useState('');
  function select(next:File){const invalid=validateRom(next);if(invalid){setError(invalid);return;}setError('');onFile(next);}
  function selectFolder(files:FileList){
    const compatible=Array.from(files).filter(f=>!validateRom(f)).sort((a,b)=>a.name.localeCompare(b.name,'es',{numeric:true,sensitivity:'base'}));
    if(!compatible.length){setError('No hay juegos .sfc o .smc compatibles en esta carpeta.');return;}
    setError('');setQuery('');onLibrary(compatible);onFile(compatible[0]);
  }
  const visible=library.filter(f=>f.name.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es')));
  return <fieldset className="machine-setup">
    <legend>Preparación</legend>
    <div className="setup-field"><span id="rom-label">Juego de Super Nintendo</span>
      <div className="setup-file"><button onClick={()=>input.current?.click()}><FolderOpen size={16}/>{file?'Cambiar juego':'Elegir juego'}</button><button onClick={()=>folder.current?.click()}><Folder size={16}/>Elegir carpeta</button></div>
      <span className="setup-filename selected-rom" title={file?.name}>{file?`${file.name} · ${(file.size/1024).toLocaleString('es-ES',{maximumFractionDigits:0})} KB`:'.sfc o .smc'}</span>
      <input ref={input} className="file-input" type="file" accept=".sfc,.smc" aria-label="Seleccionar ROM de Super Nintendo" onChange={event=>{const next=event.target.files?.[0];if(next)select(next);event.target.value='';}}/>
      <input ref={folder} className="file-input" type="file" multiple {...{webkitdirectory:''}} aria-label="Seleccionar carpeta de juegos de Super Nintendo" onChange={event=>{if(event.target.files)selectFolder(event.target.files);event.target.value='';}}/>
      {error&&<p className="setup-error" role="alert">{error}</p>}
    </div>
    {library.length>0&&<section className="local-library" aria-label="Juegos de la carpeta seleccionada"><div className="library-heading"><span>{library[0].webkitRelativePath.split('/')[0]||'Carpeta local'} · {library.length} juegos</span><button className="icon" aria-label="Cerrar carpeta" onClick={()=>onLibrary([])}><X size={14}/></button></div><label className="library-search"><Search size={14}/><input type="search" aria-label="Buscar juego en la carpeta" placeholder="Buscar juego…" value={query} onChange={e=>setQuery(e.target.value)}/></label><div className="library-list">{visible.map((entry,index)=><button key={`${entry.webkitRelativePath}:${entry.name}:${index}`} className={file===entry?'selected':''} aria-pressed={file===entry} onClick={()=>select(entry)} title={entry.webkitRelativePath||entry.name}>{entry.name.replace(/\.(sfc|smc)$/i,'')}</button>)}{!visible.length&&<p>No hay juegos con ese nombre.</p>}</div><p className="setup-note">Lista local en orden alfabético. La carpeta se utiliza durante esta sesión.</p></section>}
    <label className="setup-field setup-select"><span>Controles</span><select aria-label="Controles de Super Nintendo" value={options.inputMode} onChange={e=>onOptions({...options,inputMode:e.target.value as SnesOptions['inputMode']})}><option value="auto">Automáticos</option><option value="controller">Teclado y mando</option><option value="touch">Pantalla táctil</option></select></label>
    <div className="setup-controller" role="status"><Gamepad2 size={16}/><span>{pads.length?`${pads.length} mando${pads.length===1?'':'s'} conectado${pads.length===1?'':'s'}`:'Conecta un mando y pulsa un botón para detectarlo.'}</span></div>
    <label className="setup-sound"><input type="checkbox" checked={options.sound} onChange={e=>onOptions({...options,sound:e.target.checked})}/>Sonido</label>
    <dl className="setup-requirements"><div><dt>BIOS</dt><dd>No necesita un archivo adicional.</dd></div><div><dt>Partidas</dt><dd>Guardado pendiente de incorporar.</dd></div></dl>
    <button className="primary start-emulation" disabled={!file||!!error} onClick={onStart}><Play size={17}/>Iniciar emulación</button>
    <p className="setup-note">El juego permanece en tu dispositivo. Esta primera versión no conserva partidas al cerrar.</p>
  </fieldset>;
}
