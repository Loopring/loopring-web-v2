import { SwapProps, SwapTradeData } from "../Interface";
import { withTranslation, WithTranslation } from "react-i18next";
import React, { useCallback, useState } from "react";
import { Box, Grid, Popover, Switch, Tooltip, Typography } from "@mui/material";
import { SwitchPanel, SwitchPanelProps } from "../../basic-lib";
import {
  BtradeTradeCalcData,
  defaultSlipage,
  IBData,
  Info2Icon,
  myLog,
  OrderListIcon,
  RecordTabIndex,
  SCENARIO,
  SlippageTolerance,
  SwapSettingIcon,
  SwapTradeCalcData,
  TradeCalcData,
} from "@loopring-web/common-resources";
import {
  SlippagePanel,
  SwapData,
  SwapMenuList,
  SwapTradeWrap,
} from "../components";
import { CountDownIcon } from "../components/tool/Refresh";
import { IconButtonStyled } from "../components/Styled";
import { Subject } from "rxjs";
import { useHistory } from "react-router-dom";
import { TagIconList } from "../../block";
import { useSettings } from "../../../stores";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";

const PopoverStyled = styled(Popover)`
  .MuiPaper-elevation2 {
    box-shadow: none;
    padding: 0;
    width: 250px;
  }
  .MuiBackdrop-root {
    background: transparent;
  }
`;

export const SwapPanel = withTranslation("common", { withRef: true })(
  <
    T extends IBData<I>,
    I,
    TCD extends BtradeTradeCalcData<I>,
    SCD extends SwapTradeCalcData<I>
  >({
    disabled,
    tradeCalcData,
    swapBtnStatus,
    tokenSellProps,
    tokenBuyProps,
    handleSwapPanelEvent,
    handleError,
    onSwapClick,
    toPro,
    market,
    onRefreshData,
    campaignTagConfig,
    refreshRef,
    setToastOpen,
    titleI8nKey = "swapTitle",
    scenario = SCENARIO.SWAP,
    ...rest
  }: SwapProps<T, I, TCD> & WithTranslation & {}) => {
    // useSettings()
    let history = useHistory();

    const [index, setIndex] = React.useState(0);
    const [swapData, setSwapData] = React.useState<SwapData<SwapTradeData<T>>>(
      () => {
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
            // slippage:undefined
          };
        }
        return {
          to: "button",
          type: "buy",
          tradeData: {
            ...swapTradeData,
          },
        };
      }
    );

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
        handleSwapPanelEvent &&
          handleSwapPanelEvent(
            {
              to,
              tradeData,
              type,
            },
            type === "exchange" ? "exchange" : (`${type}To${to}` as any)
          );
        myLog("hookSwap panelEventNext", slippage, swapData.tradeData);

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
      // pipe(debounceTime(200))

      panelEventSubject.subscribe((result) => {
        myLog("hookSwap panelEventSubject", panelEventSubject);
        if (result) {
          panelEventNext(result);
        }
      });
      return () => {
        // myLog("hookSwap panelEventSubject unsubscribe", panelEventSubject);

        panelEventSubject.unsubscribe();
      };
    }, [panelEventSubject]);

    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [settingPopoverOpen, setSettingPopoverOpen] = useState(false);
    const settingPopoverId = settingPopoverOpen ? "setting-popover" : undefined;
    const { slippage, swapSecondConfirmation, setSwapSecondConfirmation } =
      useSettings();
    const slippageArray = SlippageTolerance.concat(
      `slippage:${slippage}`
    ) as Array<number | string>;
    const tradeData = swapData.tradeData;

    const onSwitchChangeCallback = useCallback(() => {
      setToastOpen &&
        setToastOpen({
          open: true,
          content: rest.t("labelSwapSettingToggleSuccess", {
            onOrOff: !swapSecondConfirmation ? "on" : "off",
          }),
          type: "success",
        });
      setSwapSecondConfirmation(!swapSecondConfirmation);
    }, [swapSecondConfirmation, setSwapSecondConfirmation, setToastOpen]);
    const onSlippageChangeCallBack = React.useCallback(
      (
        slippage: number | string,
        customSlippage: number | string | undefined
      ) => {
        myLog("hookSwap slippage", slippage, swapData.tradeData);
        panelEventNext({
          _index: 0,
          swapData: {
            tradeData: {
              ...swapData.tradeData,
              ...rest?.tradeData,
              slippage: slippage,
              __cache__: {
                ...swapData.tradeData.__cache__,
                customSlippage: customSlippage,
              },
            },
            type: "sell",
            to: "button",
          },
        });
      },
      [swapData.tradeData, rest?.tradeData, onChangeEvent]
    );
    const theme = useTheme();

    const props: SwitchPanelProps<"tradeMenuList" | "trade"> = {
      index: index, // show default show
      panelList: [
        {
          key: "trade",
          element: React.useMemo(
            () => (
              <SwapTradeWrap<T, I, TCD, SCD>
                key={"trade"}
                {...{
                  ...rest,
                  swapData: {
                    ...swapData,
                    tradeData: { ...swapData.tradeData, ...rest?.tradeData },
                  },
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
                  component={"span"}
                >
                  {rest.t(titleI8nKey)}
                  <Typography
                    component={"span"}
                    paddingLeft={1}
                    display={"flex"}
                    alignItems={"center"}
                  >
                    <TagIconList
                      scenario={scenario}
                      campaignTagConfig={campaignTagConfig}
                      symbol={market as string}
                    />
                  </Typography>
                </Typography>

                <Box alignSelf={"flex-end"} display={"flex"}>
                  {!tradeCalcData.isBtrade ? (
                    <Typography
                      display={"inline-block"}
                      marginLeft={2}
                      component={"span"}
                    >
                      <IconButtonStyled
                        onClick={(e) => {
                          setSettingPopoverOpen(true);
                          setAnchorEl(e.currentTarget);
                        }}
                        sx={{ backgroundColor: "var(--field-opacity)" }}
                        className={"switch outlined"}
                        aria-label="to Transaction"
                        aria-describedby={settingPopoverId}
                        size={"large"}
                      >
                        <SwapSettingIcon htmlColor={theme.colorBase.logo} />
                      </IconButtonStyled>
                      <PopoverStyled
                        id={settingPopoverId}
                        open={settingPopoverOpen}
                        anchorEl={anchorEl}
                        onClose={() => {
                          setSettingPopoverOpen(false);
                          setAnchorEl(null);
                        }}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        sx={{ background: "transparent" }}
                      >
                        <Box paddingX={2} paddingTop={2} paddingBottom={4}>
                          <Typography marginBottom={1} component={"span"}>
                            {rest.t("labelSwapSettingTitle")}
                          </Typography>
                          <Typography
                            marginBottom={1}
                            variant={"body2"}
                            color={"var(--color-text-third)"}
                            component={"span"}
                          >
                            {rest.t("swapTolerance")}
                          </Typography>
                          <SlippagePanel
                            t={rest.t}
                            slippageList={slippageArray}
                            slippage={
                              tradeData.slippage
                                ? tradeData.slippage
                                : tradeCalcData.slippage
                                ? tradeCalcData.slippage
                                : defaultSlipage
                            }
                            handleChange={(slippage, customSlippage) => {
                              onSlippageChangeCallBack(
                                slippage,
                                customSlippage
                              );
                            }}
                          />
                          <Grid
                            container
                            justifyContent={"space-between"}
                            direction={"row"}
                            alignItems={"center"}
                            height={24}
                            marginTop={2.5}
                          >
                            <Tooltip
                              title={rest
                                .t("labelSwapSettingSecondConfirmTootip")
                                .toString()}
                              placement={"bottom"}
                            >
                              <Typography
                                component={"span"}
                                variant="body2"
                                color={"textSecondary"}
                                display={"inline-flex"}
                                alignItems={"center"}
                              >
                                <Info2Icon
                                  fontSize={"small"}
                                  color={"inherit"}
                                  sx={{ marginX: 1 / 2 }}
                                />
                                {" " + rest.t("labelSwapSettingSecondConfirm")}
                              </Typography>
                            </Tooltip>
                            <Switch
                              onChange={() => {
                                onSwitchChangeCallback();
                              }}
                              checked={swapSecondConfirmation !== false}
                            />
                          </Grid>
                        </Box>
                      </PopoverStyled>
                    </Typography>
                  ) : (
                    <></>
                  )}
                  <Typography
                    display={"inline-block"}
                    marginLeft={2}
                    component={"span"}
                  >
                    <CountDownIcon
                      onRefreshData={onRefreshData}
                      ref={refreshRef}
                    />
                  </Typography>
                  <Typography
                    display={"inline-block"}
                    marginLeft={2}
                    component={"span"}
                  >
                    <IconButtonStyled
                      onClick={() => {
                        !tradeCalcData.isBtrade
                          ? history.push(
                              `/l2assets/history/${RecordTabIndex.trades}?market=${market}`
                            )
                          : history.push(
                              `/l2assets/history/${RecordTabIndex.btradeSwapRecords}?market=${market}`
                            );
                      }}
                      sx={{ backgroundColor: "var(--field-opacity)" }}
                      className={"switch outlined"}
                      aria-label="to Transaction"
                      size={"large"}
                    >
                      <OrderListIcon
                        fill={theme.colorBase.logo}
                        fontSize={"large"}
                      />
                    </IconButtonStyled>
                  </Typography>
                </Box>
              </>
            ),
            [
              onRefreshData,
              settingPopoverOpen,
              swapSecondConfirmation,
              onSwitchChangeCallback,
              onSlippageChangeCallBack,
              tradeData,
              slippageArray,
              theme,
            ]
          ),
        },
        {
          key: "tradeMenuList",
          element: React.useMemo(
            () => (
              <SwapMenuList<T, I, TCD | SCD>
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
