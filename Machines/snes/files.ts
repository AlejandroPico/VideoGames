export const MAX_ROM_SIZE=16*1024*1024;
export function validateRom(file:Pick<File,'name'|'size'>) {
  if(!/\.(sfc|smc)$/i.test(file.name))return 'Selecciona una ROM de Super Nintendo en formato .sfc o .smc.';
  if(file.size<32768||file.size>MAX_ROM_SIZE)return 'El archivo debe ocupar entre 32 KB y 16 MB.';
  if(file.size%1024!==0&&file.size%1024!==512)return 'El tamaño del archivo no corresponde a una ROM SNES.';
  return null;
}
