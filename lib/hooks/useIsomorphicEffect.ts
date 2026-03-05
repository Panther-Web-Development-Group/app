import { useEffect, useLayoutEffect } from "react"

export const useIsomorphicEffect = (effect: () => void, deps: any[]): void =>
  typeof window === "undefined" ? 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(effect, deps) : 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useLayoutEffect(effect, deps)