import type { Machine } from './catalog';
export type Filters = { kinds: string[]; makers: string[]; onlyReady: boolean; decade: string };
export const emptyFilters: Filters = {kinds:[], makers:[], onlyReady:false, decade:''};
const normalize = (v:string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export function filterMachines(items:Machine[], filters:Filters, query:string) {
  const words=normalize(query).trim().split(/\s+/).filter(Boolean);
  return items.filter(m => (!filters.onlyReady || m.ready)
    && (!filters.kinds.length || filters.kinds.includes(m.kind))
    && (!filters.makers.length || filters.makers.includes(m.maker))
    && (!filters.decade || Math.floor(m.year/10)*10===Number(filters.decade))
    && words.every(w=>normalize(`${m.name} ${m.id} ${m.maker} ${m.year} ${m.kind}`).includes(w)));
}
