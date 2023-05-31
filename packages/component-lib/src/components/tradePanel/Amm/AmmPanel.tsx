import { AmmChgData, AmmDepositWrap, AmmWithdrawWrap } from "../components";
import { Box, BoxProps, Tab, Tabs, Toolbar } from "@mui/material";
import {
  AmmExitData,
  AmmInData,
  AmmJoinData,
  IBData,
} from "@loopring-web/common-resources";
import { WithTranslation, withTranslation } from "react-i18next";
import React from "react";
import { CountDownIcon } from "../components/tool/Refresh";
import styled from "@emotion/styled";
import { boxLiner, toolBarPanel } from "../../styled";
import { AmmPanelType, AmmProps } from "./Interface";
import { useSettings } from "../../../stores";

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
    <Tabs value={value} onChange={handleChange} aria-label="Amm Method Tab">
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
    // onAmmAddChangeEvent,
    // onRemoveChangeEvent,
    handleError,
    height,
    width,
    anchors,
    propsLPExtends,
    propsAExtends,
    propsBExtends,
    ammType,
    handleTabChange,
    // coinAPrecision,
    // coinBPrecision,
    ...rest
  }: AmmProps<T, TW, I, ACD, C> & WithTranslation) => {
    const _onChangeAddEvent = React.useCallback(
      async ({ tradeData, type }: AmmChgData<T>) => {
        handleAmmAddChangeEvent(tradeData, type);
        // if (typeof onAmmAddChangeEvent == "function") {
        //   onAmmAddChangeEvent({ tradeData, type } as AmmChgData<T>);
        // }
      },
      [handleAmmAddChangeEvent]
    );

    const _onChangeRemoveEvent = React.useCallback(
      async ({
        tradeData,
      }: // type,
      // percentage
      { tradeData: TW } & { type: "lp"; percentage?: number }) => {
        handleAmmRemoveChangeEvent(tradeData);
        // if (typeof onRemoveChangeEvent == "function") {
        //   onRemoveChangeEvent({ tradeData, type } as AmmWithdrawChgData<TW>);
        // }
      },
      [handleAmmRemoveChangeEvent]
    );

    // const panelList: Pick<
    //   PanelContent<"ammJoin" | "ammExit">,
    //   "key" | "element"
    // >[] = [
    //   {
    //     key: "ammJoin",
    //     element: React.useMemo(
    //       () => (
    //
    //       ),
    //       [
    //         t,
    //         rest,
    //         anchors,
    //         disableDeposit,
    //         ammDepositBtnStatus,
    //         ammDepositBtnI18nKey,
    //         ammCalcDataDeposit,
    //         // onAmmAddClick,
    //         handleError,
    //         // _onChangeAddEvent,
    //         ammDepositData,
    //         tokenDepositAProps,
    //         tokenDepositBProps,
    //       ]
    //     ),
    //   },
    //   {
    //     key: "ammExit",
    //     element: React.useMemo(
    //       () => (
    //
    //       ),
    //       [
    //         t,
    //         rest,
    //         anchors,
    //         disableWithdraw,
    //         ammWithdrawBtnStatus,
    //         ammWithdrawBtnI18nKey,
    //         ammCalcDataWithDraw,
    //         // onAmmRemoveClick,
    //         // handleError,
    //         // _onChangeRemoveEvent,
    //         ammWithdrawData,
    //         tokenWithDrawAProps,
    //         tokenWithDrawBProps,
    //       ]
    //     ),
    //   },
    // ];
    // const theme = useTheme();
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
              {...{
                t,
                value: ammType,
                handleChange: (_e: any, value: any) => handleTabChange(value),
                ...rest,
              }}
            />
          </Box>
          <Box alignSelf={"center"}>
            <CountDownIcon onRefreshData={onRefreshData} ref={refreshRef} />
          </Box>
        </Toolbar>

        <Box flex={1} className={"trade-panel"}>
          {ammType === AmmPanelType.Join && (
            <Box
              display={"flex"}
              justifyContent={"space-evenly"}
              alignItems={"stretch"}
              height={"100%"}
              padding={5 / 2}
              // key={panelList[0].key}
            >
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
                  propsAExtends,
                  propsBExtends,
                }}
              />
              {/*{panelList[0].element}*/}
            </Box>
          )}
          {ammType === AmmPanelType.Exit && (
            <Box
              display={"flex"}
              justifyContent={"space-evenly"}
              alignItems={"stretch"}
              height={"100%"}
              padding={5 / 2}
            >
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
                  propsLPExtends,
                  selectedPercentage: -1,
                  onRemoveChangeEvent: _onChangeRemoveEvent,
                  ammData: ammWithdrawData,
                  tokenAProps: { ...tokenWithDrawAProps },
                  tokenBProps: { ...tokenWithDrawBProps },
                }}
              />
            </Box>
          )}

          {/*<SwipeableViewsStyled*/}
          {/*  axis={theme.direction === "rtl" ? "x-reverse" : "x"}*/}
          {/*  index={ammType}*/}
          {/*  {...{*/}
          {/*    _height: "auto",*/}
          {/*    _width: "auto",*/}
          {/*  }}*/}
          {/*>*/}
          {/*  {panelList.map((panel, index) => {*/}
          {/*    return (*/}
          {/*      <Grid*/}
          {/*        item*/}
          {/*        justifyContent={"space-evenly"}*/}
          {/*        alignItems={"stretch"}*/}
          {/*        height={"100%"}*/}
          {/*        key={index}*/}
          {/*      >*/}
          {/*        {panel.element}*/}
          {/*      </Grid>*/}
          {/*    );*/}
          {/*  })}*/}
          {/*</SwipeableViewsStyled>*/}
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
) => JSX.Element;;
