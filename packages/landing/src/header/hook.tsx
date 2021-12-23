import React from "react";

import {
  ButtonComponentsMap,
  headerMenuData,
  headerToolBarData as initHeaderToolBarData,
} from "@loopring-web/common-resources";
import { useNotify } from "@loopring-web/webapp/src/stores/notify";

export const useHeader = () => {
  const headerToolBarData = React.useMemo(() => {
    return initHeaderToolBarData.filter((ele) => {
      return ele.buttonComponent !== ButtonComponentsMap.WalletConnect;
    });
  }, [initHeaderToolBarData]);
  const { notifyMap } = useNotify();

  return {
    headerToolBarData,
    headerMenuData,
    notifyMap,
  };
};
