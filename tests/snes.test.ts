import { describe,it,expect } from 'vitest';
import { validateRom } from '../Machines/snes/files';
import { padAction } from '../src/shared/gamepad';
describe('Archivos locales de SNES',()=>{
  it('acepta ROM con y sin cabecera de copiador y rechaza archivos ajenos',()=>{
    expect(validateRom({name:'juego.sfc',size:1024*1024})).toBeNull();
    expect(validateRom({name:'juego.SMC',size:1024*1024+512})).toBeNull();
    expect(validateRom({name:'disco.iso',size:1024*1024})).not.toBeNull();
    expect(validateRom({name:'juego.sfc',size:3})).not.toBeNull();
    expect(validateRom({name:'juego.sfc',size:32*1024*1024})).not.toBeNull();
  });

});
describe('Navegación con mando',()=>{
  const pad=(pressed:number[]=[],axes=[0,0])=>({buttons:Array.from({length:17},(_,i)=>({pressed:pressed.includes(i),touched:false,value:pressed.includes(i)?1:0})),axes});
  it('lee cruceta, stick, aceptar y volver; el menú requiere ambos sticks',()=>{
    expect(padAction(pad([12]))).toBe('up');expect(padAction(pad([],[.8,0]))).toBe('right');
    expect(padAction(pad([0]))).toBe('accept');expect(padAction(pad([1]))).toBe('back');
    expect(padAction(pad([9]))).toBeNull();expect(padAction(pad([10,11]))).toBe('menu');
    expect(padAction(pad([],[.2,-.2]))).toBeNull();
  });
});
