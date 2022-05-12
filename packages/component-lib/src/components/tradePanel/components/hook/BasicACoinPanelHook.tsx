import { IBData, MintTradeNFT } from "@loopring-web/common-resources";
import { BasicACoinTradeHookProps } from "../Interface";
import React from "react";
import { SwitchData } from "../../Interface";
import { useDeepCompareEffect } from "react-use";
import { ToolBarItemBack } from "../tool";
import { debounceTime, Subject } from "rxjs";
export const useBasicTrade = <
  T extends Partial<IBData<I> & MintTradeNFT<I> & { [key: string]: any }>,
  I
>({
  tradeData,
  handlePanelEvent,
  walletMap = {},
  coinMap,
  type = "TOKEN",
  ...rest
}: BasicACoinTradeHookProps<T, I>) => {
  tradeData = tradeData ? tradeData : ({} as T);
  // data used on trade input btn click to menu list and back to the input data transfer
  const [switchData, setSwitchData] = React.useState<SwitchData<T>>({
    to: "button",
    tradeData,
  } as SwitchData<T>);
  // index is switch panel index number 1 is btn view
  const [index, setIndex] = React.useState(0);
  useDeepCompareEffect(() => {
    if (tradeData !== switchData.tradeData) {
      setSwitchData({ ...switchData, tradeData: tradeData });
    }
  }, [tradeData]);

  const panelEventSubject = new Subject<
    { _index: 0 | 1; switchData: SwitchData<T> } | undefined
  >();

  const onChangeEvent = (_index: 0 | 1, { to, tradeData }: SwitchData<T>) => {
    panelEventSubject.next({ _index: _index, switchData: { to, tradeData } });
  };
  const panelEventNext = React.useCallback(
    async ({
      _index,
      switchData: { to, tradeData: newTradeData },
    }: {
      _index: 0 | 1;
      switchData: SwitchData<T>;
    }) => {
      if (handlePanelEvent) {
        await handlePanelEvent(
          { to, tradeData: newTradeData },
          `To${to}` as any
        );
      }
      if (typeof rest.onChangeEvent == "function") {
        setSwitchData(
          rest.onChangeEvent(_index, { to, tradeData: newTradeData })
        );
      } else {
        const _newTradeData = {
          ...tradeData,
          ...newTradeData,
        };
        if (to === "menu") {
          setSwitchData({ tradeData: _newTradeData, to });
        } else if (to === "button" && type === "TOKEN") {
          const count = _newTradeData.belong
            ? walletMap[_newTradeData.belong]?.count
            : 0;
          setSwitchData({
            tradeData: { ..._newTradeData, balance: count },
            to,
          });
        } else if (to === "button" && type === "NFT") {
          const count = _newTradeData.nftBalance;
          setSwitchData({
            tradeData: { ..._newTradeData, balance: count },
            to,
          });
        }
      }
      if (_index !== index) {
        setIndex(_index);
      }
    },
    [handlePanelEvent, tradeData, walletMap, coinMap, rest, index]
  );

  React.useEffect(() => {
    panelEventSubject.pipe(debounceTime(200)).subscribe((result) => {
      if (result) {
        panelEventNext(result);
      }
    });
    return () => {
      panelEventSubject.unsubscribe();
    };
  }, [panelEventSubject]);

  const toolBarItemBack = React.useMemo(
    () => (
      <ToolBarItemBack onChangeEvent={onChangeEvent} tradeData={tradeData} />
    ),
    [tradeData, onChangeEvent]
  );
  return {
    //toolbar UI
    toolBarItemBack,
    //Data, panel and function
    onChangeEvent,
    index,
    switchData,
  };
};
