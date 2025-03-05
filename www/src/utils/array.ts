// Will ensure index is within the bounds of given length
// Accepts negative numbers
export function normalizeIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}
