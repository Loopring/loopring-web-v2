import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  boxLiner,
  ModalBackButton,
  ModalCloseButton,
  SwitchPanelStyled,
  // TradeTitle,
  useOpenModals,
} from "@loopring-web/component-lib";
import {
  CurrencyToTag,
  getValuePrecisionThousand,
  PriceTag,
} from "@loopring-web/common-resources";
import { Box, Link, Modal as MuiModal } from "@mui/material";
import styled from "@emotion/styled";
import { makeTickView, useSystem } from "../../index";
import { AmmPanelView } from "./components/ammPanel";
import { useAmmPool, useCoinPair } from "./hooks";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@emotion/react";
import { ChartAndInfoPanel } from "./components/chartAndInfo";
import { AmmRecordPanel } from "./components/ammRecordPanel";

//**************useAmmPool****** page code ************************//
// background: var(--color-box);
// border-radius: ${({ theme }) => theme.unit}px;
// padding: ${({ theme }) => theme.unit * 2}px;
// width: var(--swap-box-width);
// box-sizing: border-box;
const BoxStyle = styled(Box)`
  .rdg {
    background: var(--color-box);
    border-bottom-left-radius: ${({ theme }) => theme.unit}px;
    border-bottom-right-radius: ${({ theme }) => theme.unit}px;
  }
`;
const BoxLinear = styled(SwitchPanelStyled)`
  && {
    ${({ theme }) => boxLiner({ theme })};
    .trade-panel {
      background: initial;
      .react-swipeable-view-container > div {
        height: initial;
      }
    }
    @media only screen and (max-height: 680px) {
      height: 100vh;
      overflow: scroll;
    }
    @media only screen and (max-width: 768px) {
      height: 86%;
      overflow: scroll;
    }
  }
`;

export const ModalCoinPairPanel = withTranslation("common")(
  ({ t, ...rest }: WithTranslation) => {
    const {
      modals: {
        isShowAmm: { isShow, symbol, type },
      },
      setShowAmm,
    } = useOpenModals();
    const { forexMap } = useSystem();
    const theme = useTheme();

    const {
      ammMarketArray,
      myAmmMarketArray,
      ammUserTotal,
      isMyAmmLoading,
      isRecentLoading,
      getUserAmmPoolTxs,
      setPageSize,
      pageSize,
      getRecentAmmPoolTxs,
      // activityInProgressRules,
      isMobile,
      tokenPrices,
      currency,
      coinJson,
    } = useAmmPool();
    const {
      tradeFloat,
      snapShotData,
      pair,
      coinPairInfo,
      walletMap,
      pairHistory,
      stob,
      btos,
      tickerMap,
      myAmm,
    } = useCoinPair({
      selectedMarket: symbol?.replace("AMM-", "") ?? "LRC-ETH",
    });
    // const { account } = useAccount();
    const [panelIndex, setPanelIndex] = React.useState<0 | 1>(0);

    const realMarket = `${pair.coinAInfo?.simpleName}-${pair.coinBInfo?.simpleName}`;
    const _tickerMap = tickerMap[realMarket]?.__rawTicker__;
    const tickerFloat = makeTickView(_tickerMap ? _tickerMap : {});
    const coinAIcon: any = coinJson[coinPairInfo.myCoinA?.simpleName];
    const coinBIcon: any = coinJson[coinPairInfo.myCoinB?.simpleName];
    // const precisionA = coinPairInfo["precisionA"] || undefined;
    // const precisionB = coinPairInfo["precisionB"] || undefined;

    const priceCoinADollar =
      pair.coinAInfo?.simpleName && tokenPrices
        ? tokenPrices[pair.coinAInfo?.simpleName]
        : 0;

    const render24hVolume =
      PriceTag[CurrencyToTag[currency]] +
      getValuePrecisionThousand(
        (tickerFloat?.volume || 0) *
          priceCoinADollar *
          (forexMap[currency] ?? 0),
        undefined,
        undefined,
        undefined,
        true,
        { isFait: true, floor: false, isAbbreviate: true, abbreviate: 6 }
      );
    React.useEffect(() => {
      if (isShow) {
        setPanelIndex(0);
      }
    }, [isShow]);
    return (
      <MuiModal
        // open={true}
        open={isShow}
        onClose={() => {
          setShowAmm({ isShow: false });
        }}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <BoxLinear
          width={"80%"}
          minWidth={isMobile ? "initial" : 720}
          maxWidth={isMobile ? "initial" : 1000}
          position={"relative"}
          style={{ alignItems: "stretch" }}
        >
          <Box display={"flex"} width={"100%"} flexDirection={"column"}>
            {panelIndex === 1 ? (
              <ModalBackButton
                marginTop={"-27px"}
                marginLeft={1}
                onBack={() => {
                  setPanelIndex(0);
                }}
                {...rest}
              />
            ) : (
              <>
                {isMobile && (
                  <Link
                    position={"absolute"}
                    variant={"body1"}
                    sx={{
                      left: 2 * theme.unit,
                      top: 2 * theme.unit,
                      zIndex: 999,
                    }}
                    onClick={() => {
                      setPanelIndex(1);
                    }}
                  >
                    {t("labelAMMTransactionsLink")}
                  </Link>
                )}
              </>
            )}
            <ModalCloseButton
              onClose={() => {
                setShowAmm({ isShow: false });
              }}
              t={t}
              {...rest}
            />
          </Box>

          <SwipeableViews
            animateTransitions={false}
            axis={theme.direction === "rtl" ? "x-reverse" : "x"}
            index={panelIndex}
          >
            <Box
              flex={1}
              flexDirection={!isMobile ? "row" : "column"}
              alignItems={!isMobile ? "flex-start" : "center"}
              position={"relative"}
              display={"flex"}
            >
              {!isMobile && (
                <Link
                  position={"absolute"}
                  variant={"body1"}
                  sx={{
                    right: 2 * theme.unit,
                    top: 2 * theme.unit,
                    zIndex: 999,
                  }}
                  onClick={() => {
                    setPanelIndex(1);
                  }}
                >
                  {t("labelAMMTransactionsLink")}
                </Link>
              )}
              <Box marginBottom={2} width={isMobile ? "100%" : "initial"}>
                <AmmPanelView
                  pair={pair}
                  stob={stob}
                  btos={btos}
                  ammType={type}
                  getRecentAmmPoolTxs={getRecentAmmPoolTxs}
                  walletMap={walletMap}
                  snapShotData={snapShotData}
                />
              </Box>
              <ChartAndInfoPanel
                pairHistory={pairHistory}
                pair={pair}
                forexMap={forexMap}
                tradeFloat={tradeFloat}
                myAmm={myAmm}
                currency={currency}
                coinAIcon={coinAIcon}
                coinBIcon={coinBIcon}
                coinPairInfo={coinPairInfo}
                render24hVolume={render24hVolume}
              />
            </Box>
            <BoxStyle
              display={"flex"}
              overflow={"scroll"}
              flex={1}
              height={"100%"}
            >
              <AmmRecordPanel
                ammMarketArray={ammMarketArray}
                pageSize={pageSize}
                setPageSize={setPageSize}
                getUserAmmPoolTxs={getUserAmmPoolTxs}
                isMyAmmLoading={isMyAmmLoading}
                ammUserTotal={ammUserTotal}
                isRecentLoading={isRecentLoading}
                myAmmMarketArray={myAmmMarketArray}
              />
            </BoxStyle>
          </SwipeableViews>
        </BoxLinear>
      </MuiModal>
    );
  }
);
