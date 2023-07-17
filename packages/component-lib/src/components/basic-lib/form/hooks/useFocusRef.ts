import React from 'react'

export function useFocusRef<T extends HTMLInputElement>({
  value,
  shouldFocusOn,
  callback,
}: {
  value?: any
  shouldFocusOn?: boolean | undefined
  // ref: React.RefObject<T>,
  callback?: (prorps: { current: any }) => void
}) {
  const ref = React.useRef<T>(null)
  React.useEffect(() => {
    if (shouldFocusOn) {
      ref?.current?.focus()
    }
    callback && callback({ current: ref.current })
  }, [value, shouldFocusOn])
  return ref
}
