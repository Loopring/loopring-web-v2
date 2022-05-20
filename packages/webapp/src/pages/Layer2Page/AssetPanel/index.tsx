import { useDeepCompareEffect } from "react-use";
import { WithTranslation, withTranslation } from "react-i18next";
import ReactEcharts from "echarts-for-react";
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  PriceTag,
} from "@loopring-web/common-resources";
import { Box, Typography } from "@mui/material";
import styled from "@emotion/styled";
import moment from "moment";
import {
  AssetsTable,
  AssetTitle,
  DoughnutChart,
  useSettings,
} from "@loopring-web/component-lib";

import { store, useTokenPrices, useTokenMap } from "@loopring-web/core";
import { StylePaper } from "pages/styled";
import { useGetAssets } from "./hook";
import { Currency } from "@loopring-web/loopring-sdk";
import React from "react";

const StyledChartWrapper = styled(Box)`
  height: 225px;

  > section {
    //position: relative;
    //width: calc(50% - 6px);
    //height: 100%;
    background: var(--color-box);
    border-radius: ${({ theme }) => theme.unit}px;
    padding: ${({ theme }) => theme.unit * 2.5}px
      ${({ theme }) => theme.unit * 3}px;
  }
  .recharts-pie {
    @media only screen and (max-width: 768px) {
      transform: scale(0.9) translate(10px, 10px);
    }
  }
`;
const StyleTitlePaper = styled(Box)`
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

const ChartWrapper = styled(Box)`
  background-image: url("https://static.loopring.io/assets/images/${({
    dark,
  }: any) => (dark === "true" ? "noDataDark" : "noDataLight")}.png");
  background-repeat: no-repeat;
` as any;

// const StyledBtnGroupWrapper = styled(Box)`
//     position: absolute;
//     z-index: 10;
//     right: ${({theme}) => theme.unit * 3}px;
//     bottom: ${({theme}) => theme.unit * 2.5}px;
// `
//
// const toggleData = [
//     // {value: '24 H', key: '24 H'},
//     {value: 'week', key: '1 W'},
//     {value: 'all', key: 'ALL'},
// ]

export type ITokenInfoItem = {
  token: string;
  detail: {
    price: string;
    symbol: string;
    updatedAt: number;
  };
};

export type TrendDataItem = {
  timeStamp: number;
  close: number;
};

const AssetPanel = withTranslation("common")(
  ({ t, ...rest }: WithTranslation) => {
    const container = React.useRef(null);
    const { disableWithdrawList } = useTokenMap();

    const { isMobile } = useSettings();
    const { tokenPrices } = useTokenPrices();
    const { upColor } = useSettings();

    const {
      marketArray,
      assetsRawData,
      userAssets,
      assetTitleProps,
      // onShowTransfer,
      // onShowWithdraw,
      // onShowDeposit,
      onSend,
      onReceive,
      total,
      forex,
      hideLpToken,
      hideSmallBalances,
      allowTrade,
      setHideLpToken,
      setHideSmallBalances,
      isThemeDark,
      currency,
    } = useGetAssets();

    const { walletLayer2 } = store.getState().walletLayer2;

    const [currAssetsEth, setCurrAssetsEth] = React.useState(0);

    const percentList = assetsRawData.map((o) => ({
      ...o,
      value: o.tokenValueDollar && total ? o.tokenValueDollar / total : 0,
    }));

    useDeepCompareEffect(() => {
      if (!!userAssets.length) {
        setCurrAssetsEth(userAssets[userAssets.length - 1].close);
      }
    }, [userAssets]);

    const lpTotalData = percentList
      .filter((o) => o.token.value.split("-")[0] === "LP")
      .reduce(
        (prev, next) => ({
          name: "LP-Token",
          value: prev.value + next.value,
        }),
        {
          name: "LP-Token",
          value: 0,
        }
      );

    const formattedDoughnutData =
      percentList.filter((o) => o.token.value.split("-")[0] === "LP").length > 0
        ? [
            ...percentList.filter((o) => o.token.value.split("-")[0] !== "LP"),
            lpTotalData,
          ]
        : percentList;

    const getCurrAssetsEth = React.useCallback(() => {
      if (currAssetsEth) {
        return getValuePrecisionThousand(
          (Number.isFinite(currAssetsEth)
            ? currAssetsEth
            : Number(currAssetsEth || 0)
          ).toFixed(7),
          undefined,
          undefined,
          7,
          true,
          { floor: true }
        );
      }
      return 0;
    }, [currAssetsEth]);

    const getTokenRelatedMarketArray = React.useCallback(
      (token: string) => {
        if (!marketArray) return [];
        return marketArray.filter((market) => {
          const [coinA, coinB] = market.split("-");
          return token === coinA || token === coinB;
        });
      },
      [marketArray]
    );

    const ethFaitPriceDollar = tokenPrices ? tokenPrices["ETH"] : 0;
    const ethFaitPriceYuan = ethFaitPriceDollar * forex;
    const currAssetsEthDollar = getValuePrecisionThousand(
      (ethFaitPriceDollar || 0) * (currAssetsEth || 0),
      undefined,
      undefined,
      undefined,
      false,
      { isFait: true, floor: true }
    );
    const currAssetsEthYuan = getValuePrecisionThousand(
      (ethFaitPriceYuan || 0) * (currAssetsEth || 0),
      undefined,
      undefined,
      undefined,
      false,
      { isFait: true, floor: true }
    );

    const getSign = React.useCallback(
      (close: string, dataIndex: number) => {
        let sign;
        const closeLastDay = dataIndex !== 0 && userAssets[dataIndex - 1].close;
        sign =
          dataIndex > 0 && closeLastDay ? (closeLastDay < close ? 1 : -1) : 1;
        return sign;
      },
      [userAssets]
    );

    const getAssetsTrendChartOption = React.useCallback(() => {
      const option = {
        grid: { top: 8, right: 8, bottom: 24, left: 0 },
        xAxis: {
          show: false,
          type: "category",
          // data: userAssets.map(o => moment(o.timeStamp).format('MMM DD')),
          data: userAssets.map((o) => o.timeStamp),
          // axisLabel: {
          //     interval: 7,
          //     align: 'left',
          // }
        },
        yAxis: {
          type: "value",
          show: false,
        },
        series: [
          {
            data: userAssets.map((o) => o.close),
            type: "line",
            smooth: true,
            showSymbol: false,
          },
        ],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          backgroundColor: "var(--color-pop-bg)",
          borderColor: "var(--color-border)",
          textStyle: {
            color: "var(--color-text-primary)",
            fontFamily: "Roboto",
          },
          padding: 16,
          formatter: (params: any) => {
            const { name, data, dataIndex } = params[0];
            const change =
              dataIndex === 0
                ? EmptyValueTag
                : (
                    ((data - userAssets[dataIndex - 1].close) /
                      userAssets[dataIndex - 1].close) *
                    100
                  ).toFixed(2);
            const sign = getSign(data, dataIndex);
            const renderColor =
              sign !== 1
                ? upColor === "green"
                  ? "var(--color-error)"
                  : "var(--color-success)"
                : upColor === "green"
                ? "var(--color-success)"
                : "var(--color-error)";
            let renderHtml = `<div>
                        <div>${moment(name).format("YYYY-MM-DD")}</div>
                        <div>
                            <span>${Number(data).toFixed(8)} ETH</span>
                            <span style="color: ${renderColor}">${
              Number(change || 0) > 0 ? `+${change}` : change
            } %</span>
                        </div>
                    </div>`;
            return renderHtml;
          },
        },
      };
      return option;
    }, [userAssets, getSign, upColor]);

    return (
      <>
        {!isMobile && (
          <StyleTitlePaper
            paddingX={3}
            paddingY={5 / 2}
            className={"MuiPaper-elevation2"}
          >
            <AssetTitle
              {...{
                t,
                ...rest,
                ...assetTitleProps,
              }}
            />
          </StyleTitlePaper>
        )}

        {/*<div className="title">{t('labelAssetsTitle')}</div>*/}

        <StyledChartWrapper
          flexDirection={"row"}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"stretch"}
          marginTop={2}
        >
          <Box
            flex={1}
            component={"section"}
            className={"MuiPaper-elevation2"}
            marginRight={isMobile ? 0 : 2}
            display={"flex"}
            flexDirection={"column"}
          >
            <Typography
              component="span"
              color="textSecondary"
              variant="body1"
              display={"flex"}
              justifyContent={"space-between"}
            >
              <Typography component={"span"}>
                {t("labelAssetsDistribution")}
              </Typography>
            </Typography>
            <Box flex={1} marginLeft={isMobile ? 2 : 0}>
              <DoughnutChart data={walletLayer2 ? formattedDoughnutData : []} />
            </Box>
          </Box>
          {!isMobile && (
            <Box
              display={"flex"}
              flexDirection={"column"}
              flex={1}
              component={"section"}
              className={"MuiPaper-elevation2"}
            >
              <Typography
                component="span"
                color="textSecondary"
                variant="body1"
              >
                {t("labelTotalAssets")}
              </Typography>
              <Box display={"flex"} alignItems={"center"}>
                <Typography component={"span"} variant={"h5"}>
                  {getCurrAssetsEth()} ETH
                </Typography>
                <Typography
                  component={"span"}
                  variant={"body2"}
                  color={"var(--color-text-third)"}
                >
                  &nbsp;&#8776;&nbsp;
                  {currency === Currency.usd
                    ? PriceTag.Dollar + currAssetsEthDollar
                    : PriceTag.Yuan + currAssetsEthYuan}
                </Typography>
              </Box>
              {!!userAssets.length ? (
                <ReactEcharts
                  notMerge={true}
                  lazyUpdate={true}
                  option={getAssetsTrendChartOption()}
                />
              ) : (
                <ChartWrapper
                  marginTop={2}
                  dark={isThemeDark ? "true" : "false"}
                  flex={1}
                  component={"div"}
                />
              )}
            </Box>
          )}
        </StyledChartWrapper>
        <StylePaper
          marginTop={2}
          ref={container}
          className={"MuiPaper-elevation2"}
        >
          <Box className="tableWrapper table-divide-short">
            <AssetsTable
              {...{
                rawData: assetsRawData,
                disableWithdrawList,
                showFilter: true,
                allowTrade,
                onSend,
                onReceive,
                getMarketArrayListCallback: getTokenRelatedMarketArray,
                hideLpToken,
                hideSmallBalances,
                setHideLpToken,
                setHideSmallBalances,
                ...rest,
              }}
            />
          </Box>
        </StylePaper>
      </>
    );
  }
);

export default AssetPanel;
