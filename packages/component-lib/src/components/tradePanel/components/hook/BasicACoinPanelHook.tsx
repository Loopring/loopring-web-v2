import { IBData, MintTradeNFT } from "@loopring-web/common-resources";
import { BasicACoinTradeHookProps } from "../Interface";
import React from "react";
import { SwitchData } from "../../Interface";
import { useDeepCompareEffect } from "react-use";
import { ToolBarItemBack } from "../tool";
import { debounceTime, Subject } from "rxjs";

export const useBasicTrade = <T extends IBData<I> & MintTradeNFT<I>, I>({
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
    tradeData: tradeData,
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
      switchData: { to, tradeData },
    }: {
      _index: 0 | 1;
      switchData: SwitchData<T>;
    }) => {
      if (handlePanelEvent) {
        await handlePanelEvent({ to, tradeData }, `To${to}` as any);
      }
      if (typeof rest.onChangeEvent == "function") {
        setSwitchData(rest.onChangeEvent(_index, { to, tradeData }));
      } else {
        if (to === "menu") {
          setSwitchData({ tradeData, to });
        } else if (to === "button" && type === "TOKEN") {
          const count = tradeData.belong
            ? walletMap[tradeData.belong]?.count
            : 0;
          setSwitchData({ tradeData: { ...tradeData, balance: count }, to });
        } else if (to === "button" && type === "NFT") {
          const count = tradeData.nftBalance;
          setSwitchData({ tradeData: { ...tradeData, balance: count }, to });
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
