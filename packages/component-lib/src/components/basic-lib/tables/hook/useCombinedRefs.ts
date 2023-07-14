import { useCallback } from 'react'

export function useCombinedRefs<T>(...refs: readonly React.Ref<T>[]) {
  return useCallback(
    (handle: T | null) => {
      for (const ref of refs) {
        if (typeof ref === 'function') {
          ref(handle)
        } else if (ref !== null) {
          // @ts-ignore
          ref.current = handle as any
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs,
  )
}
