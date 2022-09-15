import styled from "@emotion/styled";
import { Grid, Link, Typography } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
  AmmPanelType,
  AssetsTable,
  DualAssetTable,
  MyPoolTable,
  TokenType,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import {
  CurrencyToTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  PriceTag,
  RowInvestConfig,
} from "@loopring-web/common-resources";

import { AmmPoolActivityRule, LoopringMap } from "@loopring-web/loopring-sdk";
import { useOverview } from "./hook";
import {
  useSystem,
  useAmmActivityMap,
  useAccount,
  TableWrapStyled,
  useTokenMap,
} from "@loopring-web/core";
import { useTheme } from "@emotion/react";
import { useGetAssets } from "../../AssetPage/AssetPanel/hook";
import { useDualAsset } from "../../AssetPage/HistoryPanel/useDualAsset";
import React from "react";
const StyleWrapper = styled(Grid)`
  position: relative;
  width: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
` as typeof Grid;

const MyLiquidity: any = withTranslation("common")(
  <R extends { [key: string]: any }, I extends { [key: string]: any }>({
    t,
    /* ammActivityMap, */ ...rest
  }: WithTranslation & {
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined;
  }) => {
    let match: any = useRouteMatch("/invest/balance/:type");
    const ammPoolRef = React.useRef(null);
    const stackingRef = React.useRef(null);
    const dualRef = React.useRef(null);

    const { ammActivityMap } = useAmmActivityMap();
    const { forexMap } = useSystem();
    const { tokenMap, disableWithdrawList, idIndex } = useTokenMap();
    const {
      assetsRawData,
      onSend,
      onReceive,
      allowTrade,
      getTokenRelatedMarketArray,
    } = useGetAssets();
    const { account } = useAccount();
    const history = useHistory();
    const { currency, hideSmallBalances, setHideSmallBalances } = useSettings();
    const { setShowAmm } = useOpenModals();
    const {
      dualList,
      getDualTxList,
      pagination,
      showLoading: dualLoading,
    } = useDualAsset();

    React.useEffect(() => {
      if (match?.params?.type) {
        switch (match?.params?.type) {
          case "dual":
            // @ts-ignore
            window.scrollTo(0, dualRef?.current?.offsetTop);
            break;
          case "stack":
            // @ts-ignore
            window.scrollTo(0, stackingRef?.current?.offsetTop);
            break;
          case "amm":
            // @ts-ignore
            window.scrollTo(0, ammPoolRef?.current?.offsetTop);
            break;
        }
      }
    }, [match?.params?.type]);

    React.useEffect(() => {
      getDualTxList({});
    }, []);
    const { summaryMyInvest, myPoolRow, showLoading } = useOverview({
      ammActivityMap,
    });

    const theme = useTheme();
    const { isMobile } = useSettings();
    const fontSize: any = isMobile
      ? {
          title: "body1",
          count: "h5",
          title2: "body1",
          count2: "h5",
        }
      : {
          title: "body1",
          count: "h1",
          title2: "body1",
          count2: "h5",
        };
    const lidoAssets = assetsRawData.filter(
      (o) => o.token.type !== TokenType.single && o.token.type !== TokenType.lp
    );
    return (
      <>
        <StyleWrapper
          container
          className={"MuiPaper-elevation2"}
          paddingY={3}
          paddingX={4}
          margin={0}
          display={"flex"}
          position={"relative"}
        >
          <Grid container spacing={2} alignItems={"flex-end"}>
            <Grid item display={"flex"} flexDirection={"column"} sm={6} md={5}>
              <Typography variant={fontSize.title} color={"textSecondary"}>
                {t("labelTotalPositionValue")}
              </Typography>
              <Typography
                variant={fontSize.count}
                marginTop={1}
                fontFamily={"Roboto"}
              >
                {summaryMyInvest?.investDollar
                  ? PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      (summaryMyInvest.investDollar || 0) *
                        (forexMap[currency] ?? 0),
                      undefined,
                      undefined,
                      2,
                      true,
                      { isFait: true, floor: true }
                    )
                  : EmptyValueTag}
              </Typography>
            </Grid>
            {/*<Grid item marginRight={6}>*/}
            {/*  <Divider orientation={"vertical"} />*/}
            {/*</Grid>*/}
            <Grid item display={"flex"} flexDirection={"column"} sm={3} md={4}>
              <Typography
                variant={fontSize.title2}
                component={"h3"}
                fontFamily={"Roboto"}
                color={"textSecondary"}
              >
                {t("labelFeeRewards")}
              </Typography>
              <Typography
                variant={fontSize.count2}
                marginTop={1}
                fontFamily={"Roboto"}
              >
                {summaryMyInvest?.feeDollar
                  ? PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      (summaryMyInvest.feeDollar || 0) *
                        (forexMap[currency] ?? 0),
                      undefined,
                      undefined,
                      2,
                      true,
                      { isFait: true, floor: true }
                    )
                  : EmptyValueTag}
              </Typography>
            </Grid>
          </Grid>
          <Link
            position={"absolute"}
            variant={"body1"}
            sx={{
              right: 2 * theme.unit,
              top: 2 * theme.unit,
            }}
            target="_self"
            rel="noopener noreferrer"
            //?tokenSymbol=${market}
            onClick={() => history.push(`/l2assets/history/ammRecords`)}
            // href={"./#/layer2/history/ammRecords"}
          >
            {t("labelTransactionsLink")}
          </Link>
        </StyleWrapper>
        <TableWrapStyled
          ref={ammPoolRef}
          className={`table-divide-short MuiPaper-elevation2`}
          marginTop={2}
          paddingY={2}
          paddingX={0}
          flex={1}
        >
          <Grid item xs={12} display={"flex"} flexDirection={"column"} flex={1}>
            <MyPoolTable
              forexMap={forexMap as any}
              title={
                <Typography
                  variant={"h5"}
                  marginBottom={isMobile ? 3 : 0}
                  // paddingLeft={3}
                >
                  {t("labelMyAmm")}
                </Typography>
              }
              hideSmallBalances={hideSmallBalances}
              setHideSmallBalances={setHideSmallBalances}
              allowTrade={allowTrade}
              rawData={myPoolRow}
              showFilter={true}
              account={account}
              pagination={{ pageSize: 10 }}
              showloading={showLoading}
              currency={currency}
              tokenMap={tokenMap as any}
              handleWithdraw={(row) => {
                const pair = `${row.ammDetail.coinAInfo.name}-${row.ammDetail.coinBInfo.name}`;
                setShowAmm({
                  isShow: true,
                  type: AmmPanelType.Exit,
                  symbol: pair,
                });
              }}
              handleDeposit={(row) => {
                const pair = `${row.ammDetail.coinAInfo.name}-${row.ammDetail.coinBInfo.name}`;
                setShowAmm({
                  isShow: true,
                  type: AmmPanelType.Join,
                  symbol: pair,
                });
              }}
              rowConfig={RowInvestConfig}
            />
          </Grid>
        </TableWrapStyled>
        <TableWrapStyled
          ref={stackingRef}
          className={`table-divide-short MuiPaper-elevation2 ${
            lidoAssets?.length > 0 ? "min-height" : ""
          }`}
          marginTop={2}
          marginBottom={3}
          paddingY={2}
          paddingX={0}
          flex={1}
        >
          <Grid item xs={12}>
            <Typography variant={"h5"} marginBottom={1} marginX={3}>
              {t("labelInvestType_STAKE")}
            </Typography>
          </Grid>
          <Grid item xs={12} display={"flex"} flexDirection={"column"} flex={1}>
            <AssetsTable
              {...{
                disableWithdrawList,
                rawData: lidoAssets,
                showFilter: false,
                allowTrade,
                onSend,
                onReceive,
                getMarketArrayListCallback: getTokenRelatedMarketArray,
                rowConfig: RowInvestConfig,
                forexMap: forexMap as any,
                isInvest: true,
                ...rest,
              }}
            />
          </Grid>
        </TableWrapStyled>
        <TableWrapStyled
          ref={dualRef}
          className={`table-divide-short MuiPaper-elevation2 ${
            lidoAssets?.length > 0 ? "min-height" : ""
          }`}
          marginTop={2}
          marginBottom={3}
          paddingY={2}
          paddingX={0}
          flex={1}
        >
          <Grid item xs={12}>
            <Typography variant={"h5"} marginBottom={1} marginX={3}>
              {t("labelInvestType_DUAL")}
            </Typography>
          </Grid>
          <Grid item xs={12} display={"flex"} flexDirection={"column"} flex={1}>
            <DualAssetTable
              rawData={dualList}
              idIndex={idIndex}
              tokenMap={tokenMap}
              showloading={dualLoading}
              pagination={pagination}
              getDualAssetList={getDualTxList}
            />
          </Grid>
        </TableWrapStyled>
      </>
    );
  }
);

export default MyLiquidity;
