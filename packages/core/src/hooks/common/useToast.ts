import React from "react";
import { TOASTOPEN, TOSTOBJECT } from "@loopring-web/component-lib";

export const useToast = (): TOSTOBJECT => {
  const [toastOpen, setToastOpen] =
    React.useState<TOASTOPEN | undefined>(undefined);

  const closeToast = React.useCallback(() => {
    setToastOpen(undefined);
  }, [setToastOpen]);

  return {
    toastOpen,
    setToastOpen,
    closeToast,
  };
};
