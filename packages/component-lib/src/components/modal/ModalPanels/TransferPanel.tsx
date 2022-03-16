import { WithTranslation, withTranslation } from "react-i18next";
import { SwitchPanel, SwitchPanelProps } from "../../basic-lib";
import { IBData } from "@loopring-web/common-resources";
import React from "react";
import { TransferProps } from "../../tradePanel";
import {
  TradeMenuList,
  TransferWrap,
  useBasicTrade,
} from "../../tradePanel/components";

export const TransferPanel = withTranslation("common", { withRef: true })(
  <T extends IBData<I>, I>({
    // tradeData,
    // disabled,
    // coinMap,
    // walletMap,
    // handleError,

    // walletMap,
    // coinMap,
    isThumb = true,
    type = "TOKEN",
    chargeFeeTokenList,
    onTransferClick,
    transferBtnStatus,
    assetsData,
    addrStatus,
    isAddressCheckLoading,
    ...rest
  }: TransferProps<T, I> & WithTranslation & { assetsData: any[] }) => {
    const { onChangeEvent, index, switchData } = useBasicTrade({
      ...rest,
      type,
    });

    const props: SwitchPanelProps<string> = {
      index: index, // show default show
      panelList: [
        {
          key: "trade",
          element: React.useMemo(
            () => (
              <TransferWrap<T, I, any>
                key={"transfer"}
                {...{
                  ...rest,
                  type,
                  chargeFeeTokenList: chargeFeeTokenList || [],
                  tradeData: switchData.tradeData,
                  onChangeEvent,
                  isThumb,
                  disabled: !!rest.disabled,
                  onTransferClick,
                  transferBtnStatus,
                  assetsData,
                  addrStatus,
                  isAddressCheckLoading,
                }}
              />
            ),
            [
              rest,
              type,
              chargeFeeTokenList,
              switchData.tradeData,
              onChangeEvent,
              isThumb,
              onTransferClick,
              transferBtnStatus,
              assetsData,
              addrStatus,
              isAddressCheckLoading,
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
                        //oinMap
                      }}
                    />
                  ),
                  [switchData, rest, onChangeEvent]
                ),
                toolBarItem: undefined,
                // toolBarItem: toolBarItemBack
              },
            ]
          : []
      ),
    };
    return <SwitchPanel {...{ ...rest, ...props }} />;
  }
) as <T, I>(
  props: TransferProps<T, I> & React.RefAttributes<any>
) => JSX.Element;
