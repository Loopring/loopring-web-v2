import {
  useDefiMap,
  useDefiTrade,
  useDualMap,
  useToast,
} from "@loopring-web/core";
import {
  getValuePrecisionThousand,
  MarketType,
  myLog,
} from "@loopring-web/common-resources";

export const useDualHook = ({
  isJoin,
  market,
}: {
  market: MarketType;
  isJoin: boolean;
}) => {
  const { toastOpen, setToastOpen, closeToast } = useToast();
  const { marketArray } = useDualMap();
  myLog("isJoin", isJoin, "market", market);

  // const {
  //   dualWrapProps,
  //   confirmShowNoBalance,
  //   setConfirmShowNoBalance,
  //   serverUpdate,
  //   setServerUpdate,
  // } = useDefiTrade({
  //   isJoin,
  //   setToastOpen: setToastOpen as any,
  //   market: market ? market : marketArray[0], // marketArray[1] as MarketType,
  // });

  return {
    dualWrapProps: undefined,
    toastOpen,
    closeToast,
    // confirmShowNoBalance,
    // setConfirmShowNoBalance,
    // serverUpdate,
    // setServerUpdate,
  };
};
