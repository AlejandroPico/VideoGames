import { describe,it,expect } from 'vitest';
import { accessSync } from 'node:fs';
import { machines } from '../src/catalog';
import { filterMachines,emptyFilters } from '../src/filter';
describe('Catálogo y disponibilidad',()=>{
  it('solo ofrece emulación para SNES y todas las fotos existen',()=>{
    expect(machines.filter(m=>m.ready).map(m=>m.id)).toEqual(['snes']);
    expect(new Set(machines.map(m=>m.id)).size).toBe(machines.length);
    for(const m of machines){accessSync(`public/${m.image}`);accessSync(`Machines/${m.id}/README.md`);expect(m.photoSource).toMatch(/^https:\/\/commons.wikimedia.org\//);expect(m.history.length).toBeGreaterThan(30);}
    expect(machines.map(m=>m.year)).toEqual(machines.map(m=>m.year).sort((a,b)=>a-b));
  });
  it('combina disponibilidad, fabricante, tipo y búsqueda sin acentos',()=>{
    expect(filterMachines(machines,{...emptyFilters,onlyReady:true},'').map(m=>m.id)).toEqual(['snes']);
    expect(filterMachines(machines,{...emptyFilters,kinds:['Portátil']},'portatil').every(m=>m.kind==='Portátil')).toBe(true);
    expect(filterMachines(machines,{...emptyFilters,makers:['Nintendo'],decade:'1990'},'super').some(m=>m.id==='snes')).toBe(true);
    expect(filterMachines(machines,{...emptyFilters,onlyReady:true,kinds:['Ordenador']},'')).toHaveLength(0);
  });
});
