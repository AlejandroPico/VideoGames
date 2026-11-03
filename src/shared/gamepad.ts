import { useEffect, useRef, useState } from 'react';
export type MenuAction='up'|'down'|'left'|'right'|'accept'|'back'|'menu';
export function padAction(pad:Pick<Gamepad,'buttons'|'axes'>):MenuAction|null {
  const b=(n:number)=>pad.buttons[n]?.pressed;
  if(b(10)&&b(11))return 'menu';
  if(b(12)||(pad.axes[1]??0)<-.6)return 'up';
  if(b(13)||(pad.axes[1]??0)>.6)return 'down';
  if(b(14)||(pad.axes[0]??0)<-.6)return 'left';
  if(b(15)||(pad.axes[0]??0)>.6)return 'right';
  if(b(0))return 'accept';
  if(b(1))return 'back';
  return null;
}
export function moveFocus(direction:'up'|'down'|'left'|'right') {
  const scope=document.querySelector('dialog[open],[role=dialog][aria-modal=true]')||document.querySelector('.popover')||document;
  const nodes=Array.from(scope.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')).filter(n=>n.getClientRects().length>0&&getComputedStyle(n).visibility!=='hidden');
  const current=document.activeElement as HTMLElement;
  if(!nodes.includes(current)){(scope.querySelector<HTMLElement>('.game-tile')||nodes[0])?.focus();return;}
  const rect=current.getBoundingClientRect(), x=rect.x+rect.width/2, y=rect.y+rect.height/2;
  const horizontal=direction==='left'||direction==='right', sign=direction==='left'||direction==='up'?-1:1;
  const candidates=nodes.filter(n=>n!==current).map(n=>{
    const r=n.getBoundingClientRect(), dx=r.x+r.width/2-x, dy=r.y+r.height/2-y;
    return {n, primary:(horizontal?dx:dy)*sign,cross:Math.abs(horizontal?dy:dx)};
  }).filter(c=>c.primary>8).sort((a,b)=>(a.primary+a.cross*3)-(b.primary+b.cross*3));
  candidates[0]?.n.focus(); candidates[0]?.n.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
}
export function useGamepad(onAction:(action:MenuAction)=>void) {
  const handler=useRef(onAction); handler.current=onAction;
  const [pads,setPads]=useState<string[]>([]);
  useEffect(()=>{
    let frame=0, last='', repeat=0, identity='';
    function poll(now:number){
      const connected=Array.from(navigator.getGamepads?.()||[]).filter((p):p is Gamepad=>!!p&&p.connected);
      const ids=connected.map(p=>p.id), next=ids.join('|');
      if(identity!==next){identity=next;setPads(ids);}
      const action=connected.map(padAction).find(Boolean)||null;
      if(action){
        const directional=['up','down','left','right'].includes(action);
        if(action!==last||(directional&&now>=repeat)){handler.current(action);repeat=now+(action===last?160:390);}
      }
      last=action||''; frame=requestAnimationFrame(poll);
    }
    frame=requestAnimationFrame(poll);return()=>cancelAnimationFrame(frame);
  },[]);
  return pads;
}
