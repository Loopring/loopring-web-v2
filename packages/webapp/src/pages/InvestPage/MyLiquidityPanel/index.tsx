import React from "react";
import styled from "@emotion/styled";
import { Grid, Link, Typography } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import {
  AmmPanelType,
  MyPoolTable,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  PriceTag,
} from "@loopring-web/common-resources";

import {
  AmmPoolActivityRule,
  Currency,
  LoopringMap,
} from "@loopring-web/loopring-sdk";
import { useOverview } from "./hook";
import {
  useSystem,
  useAmmActivityMap,
  useAccount,
  TableWrapStyled,
} from "@loopring-web/core";
import { useTheme } from "@emotion/react";
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
    const { ammActivityMap } = useAmmActivityMap();
    const { forex, allowTrade } = useSystem();
    const { account } = useAccount();
    const history = useHistory();
    const { currency, hideSmallBalances, setHideSmallBalances } = useSettings();
    const { setShowAmm } = useOpenModals();
    // const JumpToLiqudity = React.useCallback(
    //   (pair, type) => {
    //     // if (history) {
    //     //   history.push(`/liquidity/pools/coinPair/${pair}?type=${type}`);
    //     // }
    //   },
    //   [history]
    // );

    const { summaryReward, myPoolRow, showLoading } = useOverview({
      ammActivityMap,
    });
    const totalValueDollar = myPoolRow
      .map((o: any) => {
        return o.totalAmmValueDollar as number;
      })
      .reduce((a, b) => a + b, 0);
    const totalRewardDollar = myPoolRow
      .map((o) => o.feeDollar)
      .reduce((a, b) => (a || 0) + (b || 0), 0);

    const renderPositionValueDollar =
      PriceTag.Dollar +
      getValuePrecisionThousand(
        totalValueDollar,
        undefined,
        undefined,
        undefined,
        true,
        {
          isFait: true,
          floor: true,
        }
      );
    const renderPositionValueYuan =
      PriceTag.Yuan +
      getValuePrecisionThousand(
        totalValueDollar * (forex || 6.5),
        undefined,
        undefined,
        undefined,
        true,
        {
          isFait: true,
          floor: true,
        }
      );
    const renderRewardsDollar =
      PriceTag.Dollar +
      getValuePrecisionThousand(
        totalRewardDollar || 0,
        undefined,
        undefined,
        undefined,
        true,
        {
          isFait: true,
          floor: true,
        }
      );
    const renderRewardsYuan =
      PriceTag.Yuan +
      getValuePrecisionThousand(
        (totalRewardDollar || 0) * (forex || 6.5),
        undefined,
        undefined,
        undefined,
        true,
        {
          isFait: true,
          floor: true,
        }
      );
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
                {summaryReward === undefined
                  ? EmptyValueTag
                  : currency === Currency.usd
                  ? renderPositionValueDollar
                  : renderPositionValueYuan}
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
                {summaryReward === undefined
                  ? EmptyValueTag
                  : currency === Currency.usd
                  ? renderRewardsDollar
                  : renderRewardsYuan}
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
            href={"./#/layer2/history/ammRecords"}
          >
            {t("labelTransactionsLink")}
          </Link>
        </StyleWrapper>
        <TableWrapStyled
          className={"table-divide-short MuiPaper-elevation2"}
          marginY={2}
          paddingY={2}
          paddingX={0}
          flex={1}
        >
          <Grid item xs={12} display={"flex"} flexDirection={"column"} flex={1}>
            <MyPoolTable
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
              handlePageChange={() => {}}
            />
          </Grid>
        </TableWrapStyled>
      </>
    );
  }
);

export default MyLiquidity;
