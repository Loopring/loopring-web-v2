import { useCallback, useRef, useEffect, useState } from "react";
import { useDeepCompareEffect } from "react-use";
import { WithTranslation, withTranslation } from "react-i18next";
import ReactEcharts from "echarts-for-react";
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  PriceTag,
} from "@loopring-web/common-resources";
import { Box, Grid, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { useHistory } from "react-router-dom";
import moment from "moment";
import {
  AssetsTable,
  AssetTitle,
  AssetTitleProps,
  DoughnutChart,
  LpTokenAction,
  useSettings,
} from "@loopring-web/component-lib";

import { useModals } from "hooks/useractions/useModals";

import store from "stores";
import { StylePaper } from "pages/styled";
import { useGetAssets } from "./hook";
import { Currency } from "@loopring-web/loopring-sdk";
import { useSystem } from "stores/system";
import { useAccount } from "stores/account";
import { useTokenPrices } from "stores/tokenPrices";
import { RampInstantSDK } from "@ramp-network/ramp-instant-sdk";

const UP_COLOR = "#00BBA8";
const DOWN_COLOR = "#fb3838";

const StyledChartWrapper = styled(Box)`
  height: 225px;

  > section {
    background: var(--color-box);
    border-radius: ${({ theme }) => theme.unit}px;
    padding: ${({ theme }) => theme.unit * 2.5}px
      ${({ theme }) => theme.unit * 3}px;
  }
`;
const StyleTitlePaper = styled(Box)`
  width: 100%;
  //height: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

const ChartWrapper = styled(Box)`
  background-image: url("https://static.loopring.io/assets/images/${({
    dark,
  }: any) => (dark === "true" ? "noDataDark" : "noDataLight")}.png");
  background-repeat: no-repeat;
` as any;

const AssetPanel = withTranslation("common")(
  ({ t, ...rest }: WithTranslation) => {
    const container = useRef(null);
    const { allowTrade, forex } = useSystem();
    const { raw_data } = allowTrade;
    const legalEnable = (raw_data as any)?.legal.enable;
    const legalShow = (raw_data as any)?.legal.show;
    const {
      account: { accountId, accAddress },
    } = useAccount();
    const { tokenPrices } = useTokenPrices();
    const { marketArray, assetsRawData, userAssets, getUserAssets } =
      useGetAssets();
    const {
      currency,
      themeMode,
      setHideL2Assets,
      setHideLpToken,
      setHideSmallBalances,
    } = useSettings();
    const { walletLayer2 } = store.getState().walletLayer2;
    const { hideL2Assets, hideLpToken, hideSmallBalances } =
      store.getState().settings;
    const [currAssetsEth, setCurrAssetsEth] = useState(0);

    const total = assetsRawData
      .map((o) => o.tokenValueDollar)
      .reduce((a, b) => a + b, 0);

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

    // get user daily eth assets
    useEffect(() => {
      getUserAssets();
    }, []);

    const getCurrAssetsEth = useCallback(() => {
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

    const getTokenRelatedMarketArray = useCallback(
      (token: string) => {
        if (!marketArray) return [];
        return marketArray.filter((market) => {
          const [coinA, coinB] = market.split("-");
          return token === coinA || token === coinB;
        });
      },
      [marketArray]
    );

    const { showDeposit, showTransfer, showWithdraw } = useModals();

    let history = useHistory();

    const { upColor } = useSettings();

    const onShowDeposit = useCallback(
      (token?: any) => {
        showDeposit({ isShow: true, symbol: token });
      },
      [showDeposit]
    );

    const onShowTransfer = useCallback(
      (token?: any) => {
        showTransfer({ isShow: true, symbol: token });
      },
      [showTransfer]
    );

    const onShowWithdraw = useCallback(
      (token?: any) => {
        showWithdraw({ isShow: true, symbol: token });
      },
      [showWithdraw]
    );

    const lpTokenJump = useCallback(
      (token: string, type: LpTokenAction) => {
        if (history) {
          history.push(`/liquidity/pools/coinPair/${token}?type=${type}`);
        }
      },
      [history]
    );

    const showRamp = useCallback(() => {
      const widget = new RampInstantSDK({
        hostAppName: "Loopring",
        hostLogoUrl: "https://ramp.network/assets/images/Logo.svg",
        // url: 'https://ri-widget-staging.web.app/', // main staging
        swapAsset: "LOOPRING_*",
        userAddress: accAddress,
        hostApiKey: "syxdszpr5q6c9vcnuz8sanr77ammsph59umop68d",
      }).show();

      if (widget && widget.domNodes) {
        (widget as any).domNodes.shadowHost.style.position = "absolute";
      }
    }, [accAddress]);

    const AssetTitleProps: AssetTitleProps = {
      assetInfo: {
        totalAsset: assetsRawData
          .map((o) =>
            currency === Currency.usd ? o.tokenValueDollar : o.tokenValueYuan
          )
          .reduce((prev, next) => {
            return prev + next;
          }, 0),
        priceTag: currency === Currency.usd ? PriceTag.Dollar : PriceTag.Yuan,
      },
      accountId,
      hideL2Assets,
      onShowDeposit,
      onShowTransfer,
      onShowWithdraw,
      setHideL2Assets,
      showRamp,
      legalEnable,
      legalShow,
    };

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

    const getSign = useCallback(
      (close: string, dataIndex: number) => {
        let sign;
        const closeLastDay = dataIndex !== 0 && userAssets[dataIndex - 1].close;
        sign =
          dataIndex > 0 && closeLastDay ? (closeLastDay < close ? 1 : -1) : 1;
        return sign;
      },
      [userAssets]
    );

    const isThemeDark = themeMode === "dark";

    const getAssetsTrendChartOption = useCallback(() => {
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
                  ? DOWN_COLOR
                  : UP_COLOR
                : upColor === "green"
                ? UP_COLOR
                : DOWN_COLOR;
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
        <StyleTitlePaper
          paddingX={3}
          paddingY={5 / 2}
          className={"MuiPaper-elevation2"}
        >
          <AssetTitle
            {...{
              t,
              ...rest,
              ...AssetTitleProps,
            }}
          />
        </StyleTitlePaper>

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
            marginRight={2}
          >
            <Typography component="span" color="textSecondary" variant="body1">
              {t("labelAssetsDistribution")}
            </Typography>
            <DoughnutChart data={walletLayer2 ? formattedDoughnutData : []} />
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            flex={1}
            component={"section"}
            className={"MuiPaper-elevation2"}
          >
            <Typography component="span" color="textSecondary" variant="body1">
              {t("labelTotalAssets")}
            </Typography>
            <Box display={"flex"} alignItems={"center"}>
              <Typography component={"span"} variant={"h5"}>
                {getCurrAssetsEth()} ETH{" "}
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
                // pagination: {
                //     pageSize: pageSize
                // },
                showFilter: true,
                allowTrade,
                onShowDeposit: onShowDeposit,
                onShowTransfer: onShowTransfer,
                onShowWithdraw: onShowWithdraw,
                onLpDeposit: lpTokenJump,
                onLpWithdraw: lpTokenJump,
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
