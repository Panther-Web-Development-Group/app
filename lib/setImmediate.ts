export type SetImmediateCallback = () => void

export const setImmediate = (callback: SetImmediateCallback) => setTimeout(callback, 0)