import { 
  useEffect
} from "react"

type AsyncEffect = () => Promise<void | (() => void)>

export const useAsyncEffect = (effect: AsyncEffect, deps: any[]): void => {
  useEffect(() => {
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