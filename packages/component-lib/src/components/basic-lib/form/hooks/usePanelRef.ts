import React from 'react'

export function usePanelRef<T extends HTMLInputElement>({
  callback,
}: {
  callback?: (prorps: { current: any }) => void
}) {
  const ref = React.useRef<T>(null)
  React.useEffect(() => {
    if (ref.current) {
      callback && callback({ current: ref.current })
    }
  }, [])
  return ref
}

// {
//     const ref = React.useRef<T>(null);
//     React.useEffect(() => {
//
//         callback && callback({current: ref.current});
//         return ref
//     }, [height, width, callback]);
//     return ref;
// }
