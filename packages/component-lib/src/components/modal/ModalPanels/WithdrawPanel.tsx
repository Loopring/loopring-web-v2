import { WithTranslation, withTranslation } from "react-i18next";
import { SwitchPanel, SwitchPanelProps } from "../../basic-lib";
import { WithdrawProps } from "../../tradePanel/Interface";
import { IBData } from "@loopring-web/common-resources";
import {
  TradeMenuList,
  useBasicTrade,
  WithdrawWrap,
} from "../../tradePanel/components";
import React from "react";
import { cloneDeep } from "lodash";

export const WithdrawPanel = withTranslation("common", { withRef: true })(
  <T extends IBData<I>, I>({
    type = "TOKEN",
    chargeFeeTokenList,
    onWithdrawClick,
    withdrawBtnStatus,
    assetsData,
    walletMap,
    ...rest
  }: WithdrawProps<T, I> & WithTranslation & { assetsData: any[] }) => {
    const { onChangeEvent, index, switchData } = useBasicTrade({
      ...rest,
      type,
      walletMap,
    });

    // LP token should not exist in withdraw panel for now
    const getWalletMapWithoutLP = React.useCallback(() => {
      const clonedWalletMap = cloneDeep(walletMap);
      const keyList = Object.keys(clonedWalletMap);
      keyList.forEach((key) => {
        const [first] = key.split("-");
        if (first === "LP") {
          delete clonedWalletMap[key];
        }
      });
      return clonedWalletMap;
    }, [walletMap]);
    const props: SwitchPanelProps<string> = {
      index: index, // show default show
      panelList: [
        {
          key: "trade",
          element: React.useMemo(
            () => (
              <WithdrawWrap<T, I, any>
                key={"transfer"}
                {...{
                  ...rest,
                  type,
                  chargeFeeTokenList: chargeFeeTokenList
                    ? chargeFeeTokenList
                    : [],
                  tradeData: switchData.tradeData,
                  onChangeEvent,
                  disabled: !!rest.disabled,
                  onWithdrawClick,
                  withdrawBtnStatus,
                  assetsData,
                  walletMap,
                }}
              />
            ),
            [
              onChangeEvent,
              chargeFeeTokenList,
              rest,
              switchData,
              onWithdrawClick,
              withdrawBtnStatus,
              assetsData,
              walletMap,
            ]
          ),
          toolBarItem: undefined,
        },
      ].concat(
        type === "TOKEN"
          ? [
              {
                key: "tradeMenuList",
                element: React.useMemo(
                  () => (
                    <TradeMenuList
                      {...{
                        nonZero: true,
                        sorted: true,
                        ...rest,
                        onChangeEvent,
                        //rest.walletMap,
                        selected: switchData.tradeData.belong,
                        tradeData: switchData.tradeData,
                        walletMap: getWalletMapWithoutLP(),
                        //oinMap
                      }}
                    />
                  ),
                  [switchData, rest, onChangeEvent, getWalletMapWithoutLP]
                ),
                toolBarItem: undefined,
              },
            ]
          : []
      ),
    };
    return <SwitchPanel {...{ ...rest, ...props }} />;
  }
) as <T, I>(
  props: WithdrawProps<T, I> & React.RefAttributes<any>
) => JSX.Element;
