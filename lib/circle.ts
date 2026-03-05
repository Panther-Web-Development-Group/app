export const circle = (value: number, min: number, max: number): number => {
  return value % (max - min + 1) + min
}