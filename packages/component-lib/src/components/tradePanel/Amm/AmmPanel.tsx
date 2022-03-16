import { PanelContent, SwipeableViewsStyled } from "../../basic-lib";
import {
  AmmChgData,
  AmmDepositWrap,
  AmmWithdrawChgData,
  AmmWithdrawWrap,
} from "../components";
import { BoxProps, Grid, Tab, Tabs, Toolbar } from "@mui/material";
import { useLocation } from "react-router-dom";
import qs from "query-string";
import {
  AmmJoinData,
  AmmInData,
  AmmExitData,
  IBData,
} from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";
import React, { useEffect } from "react";
import { useDeepCompareEffect } from "react-use";
import { Box } from "@mui/material";
import { useTheme } from "@emotion/react";
import { CountDownIcon } from "../components/tool/Refresh";
import styled from "@emotion/styled";
import { boxLiner, toolBarPanel } from "../../styled";
import { AmmPanelType, AmmProps } from "./Interface";
import { useSettings } from "../../../stores";

// ${
//         typeof _height === "string"
//           ? _height
//           : typeof _height === "number"
//           ? _height + "px"
//           : `var(--swap-box-height)`
//       };
const WrapStyle = styled(Box)<
  BoxProps & {
    _height?: number | string;
    _width?: number | string;
    isMobile: boolean;
  }
>`
  ${({ _width, isMobile }) =>
    isMobile
      ? `width:100%;height:auto;`
      : `       
      width: ${
        typeof _width === "string"
          ? _width
          : typeof _width === "number"
          ? _width + "px"
          : `var(--swap-box-width)`
      };
      height: auto;`}
  ${({ theme }) => boxLiner({ theme })}
  ${({ theme }) => toolBarPanel({ theme })}
  border-radius: ${({ theme }) => theme.unit}px;
  .trade-panel .coinInput-wrap {
    background: var(--field-opacity);
  }
  .MuiToolbar-root {
    //padding-left:0;
    justify-content: space-between;
    padding: 0 ${({ theme }) => (theme.unit * 5) / 2}px;
  }
` as (
  props: BoxProps & {
    _height?: number | string;
    _width?: number | string;
    isMobile: boolean;
  }
) => JSX.Element;

const TabPanelBtn = ({ t, value, handleChange }: WithTranslation & any) => {
  return (
    <Tabs
      value={value}
      onChange={handleChange}
      aria-label="disabled tabs example"
    >
      <Tab label={t("labelLiquidityDeposit")} value={0} />
      <Tab label={t("labelLiquidityWithdraw")} value={1} />
    </Tabs>
  );
};

export const AmmPanel = withTranslation("common", { withRef: true })(
  <
    T extends AmmJoinData<C extends IBData<I> ? C : IBData<I>>,
    TW extends AmmExitData<C extends IBData<I> ? C : IBData<I>>,
    I,
    ACD extends AmmInData<I>,
    C = IBData<I>
  >({
    t,
    tabSelected = AmmPanelType.Join,
    ammDepositData,
    ammWithdrawData,
    disableDeposit,
    disableWithdraw,
    handleAmmAddChangeEvent,
    handleAmmRemoveChangeEvent,
    ammCalcDataDeposit,
    ammCalcDataWithDraw,
    tokenDepositAProps,
    tokenDepositBProps,
    tokenWithDrawAProps,
    tokenWithDrawBProps,
    ammDepositBtnStatus,
    ammWithdrawBtnStatus,
    ammDepositBtnI18nKey,
    ammWithdrawBtnI18nKey,
    onRefreshData,
    refreshRef,
    onAmmAddClick,
    onAmmRemoveClick,
    onAmmAddChangeEvent,
    onRemoveChangeEvent,
    handleError,
    height,
    width,
    anchors,
    accStatus,
    coinAPrecision,
    coinBPrecision,
    ...rest
  }: AmmProps<T, TW, I, ACD, C> & WithTranslation) => {
    const [index, setIndex] = React.useState(tabSelected);
    const [ammChgDepositData, setAmmChgDepositData] = React.useState<
      AmmChgData<T>
    >({
      tradeData: ammDepositData,
      type: "coinA",
    });

    const [ammChgWithdrawData, setAmmChgWithdrawData] = React.useState<
      AmmWithdrawChgData<TW>
    >({
      tradeData: ammWithdrawData,
      type: "lp",
    });
    let routerLocation = useLocation();

    useEffect(() => {
      if (routerLocation) {
        const search = routerLocation?.search;
        const customType = qs.parse(search)?.type;
        const index =
          customType === "remove" ? AmmPanelType.Exit : AmmPanelType.Join;
        setIndex(index);
      }
    }, [routerLocation]);
    //
    useDeepCompareEffect(() => {
      if (ammDepositData !== ammChgDepositData.tradeData) {
        setAmmChgDepositData({
          ...ammChgDepositData,
          tradeData: ammDepositData,
        });
      }
      if (ammWithdrawData !== ammChgWithdrawData.tradeData) {
        setAmmChgWithdrawData({
          ...ammChgWithdrawData,
          tradeData: ammWithdrawData,
        });
      }
    }, [ammDepositData, ammWithdrawData]);

    const _onChangeAddEvent = React.useCallback(
      async ({ tradeData, type }: AmmChgData<T>) => {
        await handleAmmAddChangeEvent(tradeData, type);
        if (typeof onAmmAddChangeEvent == "function") {
          setAmmChgDepositData(
            onAmmAddChangeEvent({ tradeData, type } as AmmChgData<T>)
          );
        } else {
          setAmmChgDepositData({ tradeData, type });
        }
      },
      [handleAmmAddChangeEvent, onAmmAddChangeEvent]
    );

    const _onChangeRemoveEvent = React.useCallback(
      async ({
        tradeData,
        type,
      }: // percentage
      { tradeData: TW } & { type: "lp"; percentage?: number }) => {
        await handleAmmRemoveChangeEvent(tradeData);
        if (typeof onRemoveChangeEvent == "function") {
          setAmmChgWithdrawData(
            onRemoveChangeEvent({
              tradeData,
              type: "lp",
            } as AmmWithdrawChgData<TW>)
          );
        } else {
          setAmmChgWithdrawData({ tradeData, type });
        }
      },
      [handleAmmRemoveChangeEvent, onRemoveChangeEvent]
    );

    const handleTabChange = React.useCallback(
      (_event: any, newValue: any) => {
        if (index !== newValue) {
          setIndex(newValue);
        }
      },
      [index]
    );

    const panelList: Pick<
      PanelContent<"ammJoin" | "ammExit">,
      "key" | "element"
    >[] = [
      {
        key: "ammJoin",
        element: React.useMemo(
          () => (
            <AmmDepositWrap<T, I, ACD, C>
              key={"ammJoin"}
              {...{
                t,
                ...rest,
                anchors,
                disableDeposit,
                ammDepositBtnStatus,
                ammDepositBtnI18nKey,
                ammCalcData: ammCalcDataDeposit,
                onAmmAddClick,
                handleError,
                onAddChangeEvent: _onChangeAddEvent,
                ammData: ammDepositData,
                tokenAProps: { ...tokenDepositAProps },
                tokenBProps: { ...tokenDepositBProps },
                accStatus,
                coinAPrecision,
                coinBPrecision,
              }}
            />
          ),
          [
            rest,
            ammChgDepositData,
            tokenDepositAProps,
            tokenDepositBProps,
            anchors,
            disableDeposit,
            ammDepositBtnStatus,
            ammDepositBtnI18nKey,
            ammCalcDataDeposit,
            accStatus,
            onAmmAddClick,
            handleError,
          ]
        ),
      },
      {
        key: "ammExit",
        element: React.useMemo(
          () => (
            <AmmWithdrawWrap<TW, I, ACD, C>
              key={"ammExit"}
              {...{
                t,
                ...rest,
                anchors,
                disableWithdraw,
                ammWithdrawBtnStatus,
                ammWithdrawBtnI18nKey,
                ammCalcData: ammCalcDataWithDraw,
                onAmmRemoveClick,
                handleError,
                selectedPercentage: -1,
                onRemoveChangeEvent: _onChangeRemoveEvent,
                ammData: ammWithdrawData,
                tokenAProps: { ...tokenWithDrawAProps },
                tokenBProps: { ...tokenWithDrawBProps },
              }}
            />
          ),
          [
            rest,
            ammChgWithdrawData,
            tokenWithDrawAProps,
            tokenWithDrawBProps,
            anchors,
            disableWithdraw,
            ammWithdrawBtnStatus,
            ammWithdrawBtnI18nKey,
            ammCalcDataWithDraw,
            onAmmRemoveClick,
            handleError,
          ]
        ),
      },
    ];
    const theme = useTheme();
    const { isMobile } = useSettings();

    return (
      <WrapStyle
        display={"flex"}
        className={"trade-panel container"}
        isMobile={isMobile}
        paddingTop={"var(--toolbar-row-padding)"}
        paddingBottom={3}
        flexDirection={"column"}
        flexWrap={"nowrap"}
      >
        <Toolbar className={"large"} variant={"regular"}>
          <Box
            alignSelf={"center"}
            justifyContent={"flex-start"}
            display={"flex"}
            marginLeft={-2}
          >
            <TabPanelBtn
              {...{ t, value: index, handleChange: handleTabChange, ...rest }}
            />
          </Box>
          <Box alignSelf={"center"}>
            <CountDownIcon onRefreshData={onRefreshData} ref={refreshRef} />
          </Box>
        </Toolbar>

        <Box flex={1} className={"trade-panel"}>
          <SwipeableViewsStyled
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={index}
            {...{
              _height: "auto",
              _width: "auto",
            }}
          >
            {panelList.map((panel, index) => {
              return (
                <Grid
                  item
                  justifyContent={"space-evenly"}
                  alignItems={"stretch"}
                  height={"100%"}
                  key={index}
                >
                  {panel.element}
                </Grid>
              );
            })}
          </SwipeableViewsStyled>
        </Box>
      </WrapStyle>
    );
  }
) as <
  T extends AmmJoinData<C extends IBData<I> ? C : IBData<I>>,
  TW extends AmmExitData<C extends IBData<I> ? C : IBData<I>>,
  I,
  ACD extends AmmInData<I>,
  C = IBData<I>
>(
  props: AmmProps<T, TW, I, ACD, C> & React.RefAttributes<any>
) => JSX.Element;
