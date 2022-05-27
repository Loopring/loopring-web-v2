import { WithTranslation, withTranslation } from "react-i18next";
import {
  ModalBackButton,
  SwitchPanel,
  SwitchPanelProps,
} from "../../basic-lib";
import { IBData } from "@loopring-web/common-resources";
import React from "react";
import { TransferProps } from "../../tradePanel";
import {
  TradeMenuList,
  TransferWrap,
  useBasicTrade,
} from "../../tradePanel/components";
import { TransferConfirm } from "../../tradePanel/components/TransferConfirm";

export const TransferPanel = withTranslation(["common", "error"], {
  withRef: true,
})(
  <T extends IBData<I>, I>({
    walletMap = {},
    coinMap = {},
    isThumb = true,
    type = "TOKEN",
    chargeFeeTokenList,
    onTransferClick,
    transferBtnStatus,
    assetsData,
    addrStatus,
    isAddressCheckLoading,
    onBack,
    ...rest
  }: TransferProps<T, I> & WithTranslation & { assetsData: any[] }) => {
    const { onChangeEvent, index, switchData } = useBasicTrade({
      ...rest,
      walletMap,
      coinMap,
      type,
    });
    const [panelIndex, setPanelIndex] = React.useState(index + 1);
    const handleConfirm = (index: number) => {
      setPanelIndex(index);
    };
    // const hanleConfirm = () => {};
    React.useEffect(() => {
      setPanelIndex(index + 1);
    }, [index]);

    const props: SwitchPanelProps<string> = {
      index: panelIndex, // show default show
      panelList: [
        {
          key: "confirm",
          element: React.useMemo(
            () => (
              // @ts-ignore
              <TransferConfirm
                {...{
                  ...rest,
                  onTransferClick,
                  type,
                  tradeData: switchData.tradeData,
                  isThumb,
                  handleConfirm,
                }}
              />
            ),
            [rest, onTransferClick, type, switchData.tradeData, isThumb]
          ),
          toolBarItem: React.useMemo(
            () => (
              <>
                {onBack ? (
                  <ModalBackButton
                    marginTop={0}
                    marginLeft={-2}
                    onBack={() => {
                      setPanelIndex(1);
                    }}
                    {...rest}
                  />
                ) : (
                  <></>
                )}
              </>
            ),
            [onBack]
          ),
        },
        {
          key: "trade",
          element: React.useMemo(
            () => (
              // @ts-ignore
              <TransferWrap
                key={"trade"}
                {...{
                  ...rest,
                  type,
                  walletMap,
                  coinMap,
                  chargeFeeTokenList: chargeFeeTokenList || [],
                  tradeData: switchData.tradeData,
                  onChangeEvent,
                  isThumb,
                  disabled: !!rest.disabled,
                  handleConfirm,
                  // onTransferClick,
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
          toolBarItem: React.useMemo(
            () => (
              <>
                {onBack ? (
                  <ModalBackButton
                    marginTop={0}
                    marginLeft={-2}
                    onBack={() => {
                      onBack();
                    }}
                    {...rest}
                  />
                ) : (
                  <></>
                )}
              </>
            ),
            [onBack]
          ),
        },
      ].concat(
        type === "TOKEN"
          ? ([
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
                        walletMap,
                        coinMap,
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
            ] as any)
          : []
      ),
    };
    return <SwitchPanel {...{ ...rest, ...props }} />;
  }
) as <T, I>(
  props: TransferProps<T, I> & React.RefAttributes<any>
) => JSX.Element;
