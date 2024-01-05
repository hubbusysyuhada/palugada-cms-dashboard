export default (n: number, maxLenght = 2) => {
  return String(n).padStart(maxLenght, '0');
}