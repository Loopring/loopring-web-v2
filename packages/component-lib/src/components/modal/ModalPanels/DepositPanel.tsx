import { DepositProps } from "../../tradePanel/Interface";
import { withTranslation, WithTranslation } from "react-i18next";
import { CoinInfo, CoinMap, IBData } from "@loopring-web/common-resources";
import { SwitchPanel, SwitchPanelProps } from "../../basic-lib";
import {
  DepositWrap,
  TradeMenuList,
  useBasicTrade,
} from "../../tradePanel/components";
import React from "react";
import { cloneDeep } from "lodash";

export const DepositPanel = withTranslation("common", { withRef: true })(
  <T extends IBData<I>, I>({
    type = "TOKEN",
    onDepositClick,
    depositBtnStatus,
    walletMap,
    coinMap,
    addressDefault,
    allowTrade,
    ...rest
  }: DepositProps<T, I> & WithTranslation) => {
    const {
      // toolBarItemBack,
      onChangeEvent,
      index,
      switchData,
    } = useBasicTrade({ ...rest, type, walletMap, coinMap });

    const getFilteredWalletMap = React.useCallback(() => {
      if (walletMap) {
        const clonedWalletMap = cloneDeep(walletMap);
        Object.values(clonedWalletMap).forEach((o: any) => {
          if (o.belong && o.count && Number(o.count) === 0) {
            delete clonedWalletMap[o.belong];
          }
        });
        return clonedWalletMap;
      }
      return {};
    }, [walletMap]);

    const getFilteredCoinMap: any = React.useCallback(() => {
      if (coinMap && getFilteredWalletMap()) {
        const clonedCoinMap = cloneDeep(coinMap);
        const remainList = {};
        Object.keys(getFilteredWalletMap()).forEach((token) => {
          if (clonedCoinMap[token]) {
            remainList[token] = clonedCoinMap[token];
          }
        });
        return remainList;
      }
      return {};
    }, [coinMap, getFilteredWalletMap]);

    const props: SwitchPanelProps<"tradeMenuList" | "trade"> = {
      index: index, // show default show
      panelList: [
        {
          key: "trade",
          element: React.useMemo(
            () => (
              <DepositWrap<T, I>
                key={"transfer"}
                {...{
                  ...rest,
                  type,
                  tradeData: switchData.tradeData,
                  onChangeEvent,
                  disabled: !!rest.disabled,
                  onDepositClick,
                  depositBtnStatus,
                  walletMap,
                  coinMap,
                  addressDefault,
                  allowTrade,
                }}
              />
            ),
            [
              rest,
              switchData.tradeData,
              onChangeEvent,
              onDepositClick,
              depositBtnStatus,
              walletMap,
              coinMap,
              addressDefault,
              allowTrade,
            ]
          ),
          toolBarItem: undefined,
        },
        {
          key: "tradeMenuList",
          element: React.useMemo(
            () => (
              <TradeMenuList
                {...{
                  nonZero: false,
                  sorted: true,
                  ...rest,
                  onChangeEvent,
                  //rest.walletMap,
                  selected: switchData.tradeData.belong,
                  tradeData: switchData.tradeData,
                  walletMap: getFilteredWalletMap(),
                  coinMap: getFilteredCoinMap() as CoinMap<I, CoinInfo<I>>,
                  //oinMap
                }}
              />
            ),
            [
              rest,
              onChangeEvent,
              switchData.tradeData,
              getFilteredWalletMap,
              getFilteredCoinMap,
            ]
          ),
          toolBarItem: undefined,
          // toolBarItem: toolBarItemBack
        },
      ],
    };
    return <SwitchPanel {...{ ...rest, ...props }} />;
  }
) as <T, I>(
  props: DepositProps<T, I> & React.RefAttributes<any>
) => JSX.Element;

// export const TransferModal = withTranslation()
