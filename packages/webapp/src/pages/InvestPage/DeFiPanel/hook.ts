import { useDefiMap, useDefiTrade, useToast } from "@loopring-web/core";
import React from "react";
import { MarketType } from "@loopring-web/common-resources";
export const useDeFiHook = () => {
  // const [toastOpen, setToastOpen] =
  //   React.useState<{ open?: boolean; type: any; content: string } | undefined>(
  //     undefined
  //   );
  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { marketArray } = useDefiMap();
  const { deFiWrapProps, confirmShow, setConfirmShow } = useDefiTrade({
    isJoin: true,
    setToastOpen: setToastOpen as any,
    market: marketArray[1] as MarketType,
  });
  return { deFiWrapProps, toastOpen, closeToast, confirmShow, setConfirmShow };
};
