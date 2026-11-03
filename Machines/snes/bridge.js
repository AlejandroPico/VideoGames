import EmulatorJS from './vendor/emulatorjs/src/emulator.js';
// This adapter targets the pinned EmulatorJS commit in THIRD-PARTY.md.
const channel='videogames:snes';
const notify=(type,extra={})=>parent.postMessage({channel,type,...extra},location.origin);
let emulator,loaded=false;
const controls={0:{value:'z',value2:'BUTTON_1'},1:{value:'a',value2:'BUTTON_3'},2:{value:'shift',value2:'SELECT'},3:{value:'enter',value2:'START'},4:{value:'up arrow',value2:'DPAD_UP'},5:{value:'down arrow',value2:'DPAD_DOWN'},6:{value:'left arrow',value2:'DPAD_LEFT'},7:{value:'right arrow',value2:'DPAD_RIGHT'},8:{value:'x',value2:'BUTTON_2'},9:{value:'s',value2:'BUTTON_4'},10:{value:'q',value2:'LEFT_TOP_SHOULDER'},11:{value:'w',value2:'RIGHT_TOP_SHOULDER'}};
for(let i=24;i<30;i++)controls[i]={value:'',value2:''};
class LocalEmulator extends EmulatorJS {
  checkForUpdates() {} // Local, pinned distribution; no outbound update requests.
  getBaseFileName() { return this.config.gameName || 'snes'; }
  gamepadEvent(event) {
    if(this.paused)return;
    super.gamepadEvent(event);
    if(!this.started||event.type!=='axischanged'||!['LEFT_STICK_X','LEFT_STICK_Y'].includes(event.axis))return;
    const selected=this.getGamepadSelectionValue(event.gamepadIndex);
    const player=this.frontend.gamepadSelection.indexOf(selected);
    if(player<0||player>1)return;
    const negative=event.axis==='LEFT_STICK_X'?6:4,positive=negative+1;
    this.gameManager.simulateInput(player,negative,event.value<-.55?1:0);
    this.gameManager.simulateInput(player,positive,event.value>.55?1:0);
  }
}
window.addEventListener('error',()=>notify('error'));
window.addEventListener('unhandledrejection',()=>notify('error'));
window.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();notify('toggle-pause');}});
window.addEventListener('pagehide',()=>{try{emulator?.gameManager?.saveSaveFiles();}catch{}});
window.addEventListener('message',async event=>{
  if(event.origin!==location.origin||event.source!==parent||event.data?.channel!==channel)return;
  const data=event.data;
  try{
    if(data.action==='load'&&!loaded){
      if(!(data.file instanceof Blob)||data.file.size>16*1024*1024)return;
      loaded=true;
      const localFile=new File([data.file],`vg-snes-${data.identity}.sfc`,{type:'application/octet-stream'});
      const language=await (await fetch('./vendor/emulatorjs/localization/es.json')).json();
      emulator=new LocalEmulator('#game',{
        system:'bsnes',controlScheme:'snes',gameUrl:localFile,gameName:`vg-snes-${data.identity}`,
        dataPath:new URL('./vendor/emulatorjs/',location.href).href,language:'es',langJson:language,
        color:'#276899',backgroundColor:'#101318',startOnLoad:true,volume:data.muted?0:0.65,
        defaultControllers:{0:controls,1:Object.fromEntries(Object.entries(controls).map(([key,value])=>[key,{...value,value:''}]))},threads:false,
        browserMode:data.inputMode==='touch'?1:data.inputMode==='controller'?2:undefined,
        defaultOptions:{'shader':'disabled','webgl2Enabled':'enabled','virtual-gamepad':data.inputMode==='controller'?'disabled':'enabled'},
        buttonOpts:{playPause:false,restart:false,mute:false,settings:false,fullscreen:false,saveState:false,loadState:false,screenRecord:false,gamepad:false,cheat:false,volume:false,saveSavFiles:false,loadSavFiles:false,quickSave:false,quickLoad:false,screenshot:false,cacheManager:false,exitEmulation:false,netplay:false,contextMenu:false},
        cacheConfig:{enabled:false,cacheMaxSizeMB:64,cacheMaxAgeMins:60},disableLocalStorage:true,disableAutoUnload:true,askBeforeExit:false
      });
      emulator.on('start',()=>notify('started'));
      const originalError=emulator.startGameError.bind(emulator);
      emulator.startGameError=(...args)=>{originalError(...args);notify('error');};
      return;
    }
    if(!emulator?.started)return;
    if(data.action==='pause'){emulator.pause();emulator.stopAllAutofire();for(let p=0;p<4;p++)for(let i=0;i<12;i++)emulator.gameManager.simulateInput(p,i,0);emulator.gameManager.saveSaveFiles();}
    if(data.action==='resume'){emulator.play();window.focus();emulator.frontend.elements.parent.focus();}
    if(data.action==='restart')emulator.gameManager.restart();
    if(data.action==='mute')emulator.setVolume(data.muted?0:0.65);

  }catch(error){console.error(error);if(data.action==='load')notify('error');else notify('notice',{message:'No se ha podido completar esta operación.'});}
});
notify('ready');
