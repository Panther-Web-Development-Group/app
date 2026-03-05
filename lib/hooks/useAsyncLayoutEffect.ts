import { 
  useLayoutEffect
} from "react"

type AsyncLayoutEffect = () => Promise<void | (() => void)>

export const useAsyncLayoutEffect = (effect: AsyncLayoutEffect, deps: any[]): void => {
  useLayoutEffect(() => {
    let unsubscribe: void | (() => void)

    const execute = async () => {
      try {
        const result = await effect()
        if (typeof result === "function") unsubscribe = result
      } catch (error) {
        console.error(error)
      }
    }
    
    execute()

    return () => unsubscribe?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}