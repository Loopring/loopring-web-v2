import { useDeepCompareEffect } from "react-use";
import { WithTranslation, withTranslation } from "react-i18next";

import { Box } from "@mui/material";
import styled from "@emotion/styled";
import {
  AssetsTable,
  AssetTitle,
  useSettings,
} from "@loopring-web/component-lib";

import {
  useTokenPrices,
  useTokenMap,
  StylePaper,
  useSystem,
} from "@loopring-web/core";
import { useGetAssets } from "./hook";
import React from "react";

const StyleTitlePaper = styled(Box)`
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

const AssetPanel = withTranslation("common")(
  ({ t, ...rest }: WithTranslation) => {
    const container = React.useRef(null);
    const { disableWithdrawList } = useTokenMap();
    const { forexMap } = useSystem();
    const { isMobile } = useSettings();

    const {
      marketArray,
      assetsRawData,
      // userAssets,
      assetTitleProps,
      // onShowTransfer,
      // onShowWithdraw,
      // onShowDeposit,
      getTokenRelatedMarketArray,
      onSend,
      onReceive,
      // total,
      hideInvestToken,
      hideSmallBalances,
      allowTrade,
      setHideLpToken,
      setHideSmallBalances,
    } = useGetAssets();

    // const { walletLayer2 } = store.getState().walletLayer2;

    // const [currAssetsEth, setCurrAssetsEth] = React.useState(0);

    // const percentList = assetsRawData.map((o) => ({
    //   ...o,
    //   value: o.tokenValueDollar && total ? o.tokenValueDollar / total : 0,
    // }));

    // useDeepCompareEffect(() => {
    //   if (!!userAssets.length) {
    //     setCurrAssetsEth(userAssets[userAssets.length - 1].close);
    //   }
    // }, [userAssets]);

    // const lpTotalData = percentList
    //   .filter((o) => o.token.value.split("-")[0] === "LP")
    //   .reduce(
    //     (prev, next) => ({
    //       name: "LP-Token",
    //       value: prev.value + next.value,
    //     }),
    //     {
    //       name: "LP-Token",
    //       value: 0,
    //     }
    //   );

    // const formattedDoughnutData =
    //   percentList.filter((o) => o.token.value.split("-")[0] === "LP").length > 0
    //     ? [
    //         ...percentList.filter((o) => o.token.value.split("-")[0] !== "LP"),
    //         lpTotalData,
    //       ]
    //     : percentList;
    //
    // const getCurrAssetsEth = React.useCallback(() => {
    //   if (currAssetsEth) {
    //     return getValuePrecisionThousand(
    //       (Number.isFinite(currAssetsEth)
    //         ? currAssetsEth
    //         : Number(currAssetsEth || 0)
    //       ).toFixed(7),
    //       undefined,
    //       undefined,
    //       7,
    //       true,
    //       { floor: true }
    //     );
    //   }
    //   return 0;
    // }, [currAssetsEth]);

    // const ethFaitPriceDollar = tokenPrices ? tokenPrices["ETH"] : 0;
    // const currAssetsEthDollar = getValuePrecisionThousand(
    //   (ethFaitPriceDollar || 0) * (currAssetsEth || 0),
    //   undefined,
    //   undefined,
    //   undefined,
    //   false,
    //   { isFait: true, floor: true }
    // );

    // const getSign = React.useCallback(
    //   (close: string, dataIndex: number) => {
    //     let sign;
    //     const closeLastDay = dataIndex !== 0 && userAssets[dataIndex - 1].close;
    //     sign =
    //       dataIndex > 0 && closeLastDay ? (closeLastDay < close ? 1 : -1) : 1;
    //     return sign;
    //   },
    //   [userAssets]
    // );

    // const getAssetsTrendChartOption = React.useCallback(() => {
    //   const option = {
    //     grid: { top: 8, right: 8, bottom: 24, left: 0 },
    //     xAxis: {
    //       show: false,
    //       type: "category",
    //       // data: userAssets.map(o => moment(o.timeStamp).format('MMM DD')),
    //       data: userAssets.map((o) => o.timeStamp),
    //       // axisLabel: {
    //       //     interval: 7,
    //       //     align: 'left',
    //       // }
    //     },
    //     yAxis: {
    //       type: "value",
    //       show: false,
    //     },
    //     series: [
    //       {
    //         data: userAssets.map((o) => o.close),
    //         type: "line",
    //         smooth: true,
    //         showSymbol: false,
    //       },
    //     ],
    //     tooltip: {
    //       trigger: "axis",
    //       axisPointer: {
    //         type: "shadow",
    //       },
    //       backgroundColor: "var(--color-pop-bg)",
    //       borderColor: "var(--color-border)",
    //       textStyle: {
    //         color: "var(--color-text-primary)",
    //         fontFamily: "Roboto",
    //       },
    //       padding: 16,
    //       formatter: (params: any) => {
    //         const { name, data, dataIndex } = params[0];
    //         const change =
    //           dataIndex === 0
    //             ? EmptyValueTag
    //             : (
    //                 ((data - userAssets[dataIndex - 1].close) /
    //                   userAssets[dataIndex - 1].close) *
    //                 100
    //               ).toFixed(2);
    //         const sign = getSign(data, dataIndex);
    //         const renderColor =
    //           sign !== 1
    //             ? upColor === "green"
    //               ? "var(--color-error)"
    //               : "var(--color-success)"
    //             : upColor === "green"
    //             ? "var(--color-success)"
    //             : "var(--color-error)";
    //         let renderHtml = `<div>
    //                     <div>${moment(name).format("YYYY-MM-DD")}</div>
    //                     <div>
    //                         <span>${Number(data).toFixed(8)} ETH</span>
    //                         <span style="color: ${renderColor}">${
    //           Number(change || 0) > 0 ? `+${change}` : change
    //         } %</span>
    //                     </div>
    //                 </div>`;
    //         return renderHtml;
    //       },
    //     },
    //   };
    //   return option;
    // }, [userAssets, getSign, upColor]);

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
                hideInvestToken,
                forexMap: forexMap as any,
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
