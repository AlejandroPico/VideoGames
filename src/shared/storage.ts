export function read(key: string, fallback = ""): string {
  try {
    return localStorage.getItem(`videogames:v1:${key}`) ?? fallback;
  } catch {
    return fallback;
  }
}
export function write(key: string, value: string) {
  try {
    localStorage.setItem(`videogames:v1:${key}`, value);
  } catch {
    /* Playing remains possible without storage. */
  }
}
export function record(id: string, score: number) {
  const best = Math.max(Number(read(`best:${id}`, "0")) || 0, score);
  write(`best:${id}`, String(best));
  return best;
}
