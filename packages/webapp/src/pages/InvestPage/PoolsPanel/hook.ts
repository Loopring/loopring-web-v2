import React from "react";
import { SagaStatus } from "@loopring-web/common-resources";

import { store, useAmmMap, useSystem } from "@loopring-web/core";

import { useLocation } from "react-router-dom";
import {
  AccountStep,
  AmmPanelType,
  PoolRow,
  useOpenModals,
} from "@loopring-web/component-lib";
import { useTranslation } from "react-i18next";
import _ from "lodash";

// type Row<R> = AmmDetail<R> & { tradeFloat: TradeFloat };

export function useAmmMapUI<
  R extends PoolRow<any>,
  I extends { [key: string]: any }
>() {
  const location = useLocation();
  const { t } = useTranslation();
  const {
    setShowAmm,
    setShowTradeIsFrozen,
    setShowAccount,
    // modals: { isShowAmm, isShowTradeIsFrozen },
  } = useOpenModals();
  const searchParams = new URLSearchParams(location.search);
  const [showLoading, setShowLoading] = React.useState(true);
  const [filteredData, setFilteredData] = React.useState<R[]>([]);
  // const { status: tokenMapStatus } = useTokenMap();
  const { status: ammStatus } = useAmmMap();
  const { allowTrade } = useSystem();
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const nodePopTimer = React.useRef<NodeJS.Timeout | -1>(-1);

  const getFilteredData = (_value?: string) => {
    const value = _value ? _value : searchParams.get("search");
    if (nodeTimer.current !== -1) {
      clearTimeout(nodeTimer.current as NodeJS.Timeout);
    }
    setShowLoading(false);
    const { ammArrayEnable } = store.getState().amm.ammMap;
    let rawData = _.cloneDeep(ammArrayEnable) as unknown as R[];
    if (value && value.trim() !== "") {
      rawData = ammArrayEnable.reduce((prev, ammInfo) => {
        if (
          value &&
          ([ammInfo.coinA].includes(value.toUpperCase()) ||
            [ammInfo.coinB].includes(value.toUpperCase()))
        ) {
          prev.push({
            ...ammInfo,
          } as unknown as R);
        }
        return prev;
      }, [] as R[]);
    }

    setFilteredData(rawData);

    nodeTimer.current = setTimeout(() => {
      getFilteredData();
    }, 60000);
  };

  const handleWithdraw = React.useCallback((row: R) => {
    setShowAccount({ isShow: true, step: AccountStep.AMM_Pending });
    if (nodePopTimer.current !== -1) {
      clearTimeout(nodePopTimer.current as NodeJS.Timeout);
    }
    nodePopTimer.current = _.delay(() => {
      setShowAmm({
        isShow: true,
        type: AmmPanelType.Exit,
        symbol: row.market,
      });
    }, 10) as any;
  }, []);
  const handleDeposit = React.useCallback((row: R) => {
    if (allowTrade.joinAmm) {
      setShowAccount({ isShow: true, step: AccountStep.AMM_Pending });

      nodePopTimer.current = _.delay(() => {
        setShowAmm({
          isShow: true,
          type: AmmPanelType.Join,
          symbol: row.market,
        });
      }, 10) as any;
    } else {
      setShowTradeIsFrozen({
        isShow: true,
        type: t("labelAmmJoin") + ` ${row?.market}`,
      });
    }
  }, []);
  React.useEffect(() => {
    if (ammStatus === SagaStatus.UNSET) {
      getFilteredData();
    }
    return () => {
      clearTimeout(nodeTimer.current as NodeJS.Timeout);
      clearTimeout(nodePopTimer.current as NodeJS.Timeout);
    };
  }, [ammStatus]);

  return {
    rawData: filteredData,
    filterValue: searchParams.get("search") ?? "",
    showLoading,
    getFilteredData,
    handleWithdraw,
    handleDeposit,
  };
}
