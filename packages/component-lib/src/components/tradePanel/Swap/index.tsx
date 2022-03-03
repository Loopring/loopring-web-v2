import { SwapProps, SwapTradeData } from "../Interface";
import { withTranslation, WithTranslation } from "react-i18next";
import React from "react";
import { Box, Typography } from "@mui/material";
import { SwitchPanel, SwitchPanelProps } from "../../basic-lib";
import {
  IBData,
  ProToLiteIcon,
  TradeCalcData,
} from "@loopring-web/common-resources";
import { SwapData, SwapMenuList, SwapTradeWrap } from "../components";
import { CountDownIcon } from "../components/tool/Refresh";
import * as _ from "lodash";
import { IconButtonStyled } from "../components/Styled";
import { debounceTime, Subject } from "rxjs";

export const SwapPanel = withTranslation("common", { withRef: true })(
  <T extends IBData<I>, I, TCD extends TradeCalcData<I>>({
    disabled,
    tradeCalcData,
    swapBtnStatus,
    tokenSellProps,
    tokenBuyProps,
    handleSwapPanelEvent,
    handleError,
    onSwapClick,
    toPro,
    onRefreshData,
    refreshRef,
    ...rest
  }: SwapProps<T, I, TCD> & WithTranslation) => {
    // useSettings()

    let swapTradeData: SwapTradeData<T>;
    if (tradeCalcData && tradeCalcData.coinInfoMap) {
      swapTradeData = {
        // @ts-ignore
        sell: {
          belong: tradeCalcData.coinInfoMap
            ? tradeCalcData.coinInfoMap[tradeCalcData.coinSell]?.simpleName
            : undefined,
          balance: tradeCalcData.walletMap
            ? tradeCalcData.walletMap[tradeCalcData.coinSell]?.count
            : 0,
        },
        // @ts-ignore
        buy: {
          belong: tradeCalcData.coinInfoMap
            ? tradeCalcData.coinInfoMap[tradeCalcData.coinBuy]?.simpleName
            : undefined,
          balance: tradeCalcData.walletMap
            ? tradeCalcData.walletMap[tradeCalcData.coinBuy]?.count
            : 0,
        },
        slippage: tradeCalcData.slippage,
      };
    } else {
      swapTradeData = {
        // @ts-ignore
        sell: {
          belong: undefined,
          balance: 0,
        },
        // @ts-ignore
        buy: {
          belong: undefined,
          balance: 0,
        },
      };
    }
    const [index, setIndex] = React.useState(0);
    const [swapData, setSwapData] = React.useState<SwapData<SwapTradeData<T>>>({
      to: "button",
      type: "buy",
      tradeData: {
        ...swapTradeData,
      },
    });

    React.useEffect(() => {
      if (
        rest.tradeData &&
        (rest.tradeData.sell !== swapData.tradeData.sell ||
          rest.tradeData.buy !== swapData.tradeData.buy)
      ) {
        if (!_.isEqual(rest.tradeData.sell, swapData.tradeData.sell)) {
          // myLog('swap sell useEffect',rest.tradeData.sell,swapData.tradeData.sell)
          swapData.tradeData.sell = rest.tradeData.sell;
        }
        if (!_.isEqual(rest.tradeData.buy, swapData.tradeData.buy)) {
          swapData.tradeData.buy = rest.tradeData.buy;
        }
        setSwapData(swapData);
      }
    }, [rest.tradeData, swapData]);
    const panelEventSubject = new Subject<
      { _index: 0 | 1; swapData: SwapData<SwapTradeData<T>> } | undefined
    >();

    const onChangeEvent = (
      _index: 0 | 1,
      swapData: SwapData<SwapTradeData<T>>
    ) => {
      panelEventSubject.next({ _index, swapData });
    };
    const panelEventNext = React.useCallback(
      async ({
        _index,
        swapData: { to, tradeData, type },
      }: {
        _index: 0 | 1;
        swapData: SwapData<SwapTradeData<T>>;
      }) => {
        (await handleSwapPanelEvent) &&
          handleSwapPanelEvent(
            {
              to,
              tradeData,
              type,
            },
            type === "exchange" ? "exchange" : (`${type}To${to}` as any)
          );
        if (typeof rest.onChangeEvent == "function") {
          setSwapData(rest.onChangeEvent(_index, { to, tradeData, type }));
        } else {
          if (type === "exchange") {
            const countBuy =
              tradeData.buy.belong && tradeCalcData.walletMap
                ? tradeCalcData.walletMap[tradeData.buy.belong]?.count
                : 0;
            const countSell =
              tradeData.sell.belong && tradeCalcData.walletMap
                ? tradeCalcData.walletMap[tradeData.sell.belong]?.count
                : 0;
            setSwapData({
              tradeData: {
                ...swapData.tradeData,
                sell: {
                  belong: tradeData.sell.belong,
                  balance: countSell,
                  tradeValue: 0,
                },
                buy: {
                  belong: tradeData.buy.belong,
                  balance: countBuy,
                  tradeValue: 0,
                },
              } as SwapTradeData<T>,
              to,
              type: "buy",
            });
          } else if (to === "menu") {
            setSwapData({ tradeData, to, type });
          } else if (to === "button") {
            const count =
              tradeData[type].belong && tradeCalcData.walletMap
                ? tradeCalcData.walletMap[tradeData[type].belong]?.count
                : 0;
            const _tradeData = {
              ...tradeData,
              [type]: {
                ...tradeData[type],
                balance: count ? count : 0,
              },
            };

            setSwapData({ tradeData: _tradeData, to, type });
          }
        }
        if (_index !== index) {
          setIndex(_index);
        }
      },
      [handleSwapPanelEvent, tradeCalcData, rest, index, swapData]
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

    const props: SwitchPanelProps<"tradeMenuList" | "trade"> = {
      index: index, // show default show
      panelList: [
        {
          key: "trade",
          element: React.useMemo(
            () => (
              <SwapTradeWrap<T, I, TCD>
                key={"trade"}
                {...{
                  ...rest,
                  swapData,
                  tradeCalcData,
                  onSwapClick,
                  onChangeEvent,
                  disabled,
                  swapBtnStatus,
                  tokenSellProps,
                  tokenBuyProps,
                  handleError,
                }}
              />
            ),
            [
              rest,
              swapData,
              tradeCalcData,
              onSwapClick,
              onChangeEvent,
              disabled,
              swapBtnStatus,
              tokenSellProps,
              tokenBuyProps,
              handleError,
            ]
          ),
          toolBarItem: React.useMemo(
            () => (
              <>
                <Typography
                  marginTop={1}
                  height={"100%"}
                  display={"inline-flex"}
                  variant={"h5"}
                  alignItems={"center"}
                  alignSelf={"self-start"}
                >
                  {rest.t("swapTitle")}
                </Typography>
                <Box alignSelf={"flex-end"} display={"flex"}>
                  <CountDownIcon
                    onRefreshData={onRefreshData}
                    ref={refreshRef}
                  />
                  <Typography display={"inline-block"} marginLeft={2}>
                    <IconButtonStyled
                      onClick={toPro}
                      className={"switch outlined"}
                      size={"large"}
                      aria-label="to Professional"
                    >
                      <ProToLiteIcon color={"primary"} fontSize={"large"} />
                    </IconButtonStyled>
                  </Typography>
                </Box>
              </>
            ),
            [onRefreshData]
          ),
        },
        {
          key: "tradeMenuList",
          element: React.useMemo(
            () => (
              <SwapMenuList<T, I, TCD>
                key={"tradeMenuList"}
                {...{
                  ...rest,
                  onChangeEvent,
                  tradeCalcData,
                  swapData,
                }}
              />
            ),
            [onChangeEvent, tradeCalcData, swapData, rest]
          ),
          toolBarItem: undefined,
        },
      ],
    };
    return (
      <SwitchPanel
        className={"hasLinerBg"}
        {...{ ...rest, ...props, size: "large" }}
      />
    );
  }
) as <T extends IBData<I>, I, TCD extends TradeCalcData<I>>(
  props: SwapProps<T, I, TCD> & React.RefAttributes<any>
) => JSX.Element;
