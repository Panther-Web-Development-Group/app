export const randomInt = (min: number, max: number, inclusive: boolean = false): number => {
  const range = max - min + (inclusive ? 1 : 0)
  if (range <= 0) throw new Error("Range must be greater than 0")
  return Math.floor(Math.random() * range) + min
}