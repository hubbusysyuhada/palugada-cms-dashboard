export function debounce(callback: () => void, timeout = 2000) {
  let timer: NodeJS.Timeout;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(callback, timeout);
  }
}