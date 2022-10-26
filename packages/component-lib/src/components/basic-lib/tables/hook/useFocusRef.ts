import React from "react";

export function useFocusRef<T extends HTMLOrSVGElement>(
  isCellSelected: boolean | undefined
) {
  const ref = React.useRef<T>(null);
  React.useLayoutEffect(() => {
    if (!isCellSelected) return;
    ref.current?.focus({ preventScroll: true });
  }, [isCellSelected]);

  return ref;
}
