export function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  callback: F,
  delay: number,
) {
  if (delay <= 0) {
    return callback;
  }
  let timer: NodeJS.Timeout;
  return function (...args: Parameters<F>) {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), delay);
  };
}
