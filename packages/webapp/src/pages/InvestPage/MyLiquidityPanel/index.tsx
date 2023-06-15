import styled from "@emotion/styled";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  Modal,
  Typography,
} from "@mui/material";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import {
  AmmPanelType,
  AssetsTable,
  DefiStakingTable,
  DualAssetTable,
  DualDetail,
  EmptyDefault,
  ModalCloseButton,
  MyPoolTable,
  SwitchPanelStyled,
  useOpenModals,
  useSettings,
  useToggle,
} from "@loopring-web/component-lib";
import {
  CheckBoxIcon,
  CheckedIcon,
  CLAIM_TYPE,
  CurrencyToTag,
  DualViewBase,
  EmptyValueTag,
  FailedIcon,
  getValuePrecisionThousand,
  myLog,
  PriceTag,
  RowInvestConfig,
  STAKING_INVEST_LIMIT,
  TokenType,
  TRADE_TYPE,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { AmmPoolActivityRule, LoopringMap } from "@loopring-web/loopring-sdk";
import { useOverview } from "./hook";
import {
  TableWrapStyled,
  useAccount,
  useAmmActivityMap,
  useDualMap,
  useModalData,
  useStakeRedeemClick,
  useSystem,
  useTokenMap,
  useTokenPrices,
  volumeToCount,
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
    isHideTotal,
    /* ammActivityMap, */ ...rest
  }: WithTranslation & {
    isHideTotal?: boolean;
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>> | undefined;
  }) => {
    let match: any = useRouteMatch("/invest/balance/:type");
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);

    const ammPoolRef = React.useRef(null);
    const stackingRef = React.useRef(null);
    const dualRef = React.useRef(null);
    const sideStakeRef = React.useRef(null);

    const { updateClaimData } = useModalData();
    const { setShowClaimWithdraw } = useOpenModals();

    const { ammActivityMap } = useAmmActivityMap();
    const { forexMap } = useSystem();
    const { tokenMap, disableWithdrawList, idIndex } = useTokenMap();
    const { tokenPrices } = useTokenPrices();
    const { redeemItemClick } = useStakeRedeemClick();
    const { marketMap: dualMarketMap } = useDualMap();
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
      dualOnInvestAsset,
      getDualTxList,
      pagination,
      showDetail,
      showLoading: dualLoading,
      open: dualOpen,
      detail: dualDetail,
      setOpen: setDualOpen,
      getDetail,
      refresh,
      setShowRefreshError,
      showRefreshError,
      refreshErrorInfo,
    } = useDualAsset();
    const {
      summaryMyInvest,
      myPoolRow,
      showLoading,
      filter,
      tableHeight,
      handleFilterChange,
      stakingList,
      getStakingList,
      stakeShowLoading,
      stakingTotal,
      // totalStaked,
      totalStakedRewards,
      totalLastDayPendingRewards,
      totalClaimableRewards,
      stakedSymbol,
    } = useOverview({
      ammActivityMap,
      dualOnInvestAsset,
      hideSmallBalances,
      // dualList,
    });
    myLog("summaryMyInvest", summaryMyInvest, forexMap[currency]);

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
          case "sideStake":
            // @ts-ignore
            window.scrollTo(0, sideStakeRef?.current?.offsetTop);
        }
      }
      if (searchParams?.get("refreshStake")) {
        getStakingList({});
      }
    }, [match?.params?.type, searchParams?.get("refreshStake")]);

    React.useEffect(() => {
      if (account.accountId) {
        getDualTxList({});
      }
    }, [account.accountId]);

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
    const lidoAssets = assetsRawData.filter((o) => {
      return (
        o.token.type !== TokenType.single &&
        o.token.type !== TokenType.lp &&
        (hideSmallBalances ? !o.smallBalance : true)
      );
    });
    const totalClaimableRewardsAmount =
      totalClaimableRewards && totalClaimableRewards !== "0"
        ? getValuePrecisionThousand(
            sdk
              .toBig(totalClaimableRewards ?? 0)
              .div("1e" + tokenMap[stakedSymbol].decimals),
            tokenMap[stakedSymbol].precision,
            tokenMap[stakedSymbol].precision,
            tokenMap[stakedSymbol].precision,
            false,
            { floor: true, isAbbreviate: true }
          )
        : "0";

    // const stakingList: sdk.STACKING_SUMMARY[] = [];
    return (
      <Box
        display={"flex"}
        flex={1}
        position={"relative"}
        flexDirection={"column"}
      >
        <Box
          position={"absolute"}
          display={"flex"}
          alignItems={"center"}
          sx={
            isHideTotal && !isMobile
              ? {
                  right: 2 * theme.unit,
                  top: -42,
                  zIndex: 99,
                }
              : {
                  right: 2 * theme.unit,
                  top: 2 * theme.unit,
                  zIndex: 99,
                }
          }
        >
          <FormControlLabel
            sx={{
              marginRight: 2,
              paddingRight: 0,
              fontSize: isMobile
                ? theme.fontDefault.body2
                : theme.fontDefault.body1,
            }}
            control={
              <Checkbox
                checked={hideSmallBalances}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color="default"
                onChange={(event) => {
                  setHideSmallBalances(event.target.checked);
                }}
              />
            }
            label={t("labelHideSmallBalances", { ns: "tables" })}
          />
          <Link
            variant={"body1"}
            target="_self"
            rel="noopener noreferrer"
            //?tokenSymbol=${market}
            onClick={() => history.push(`/l2assets/history/ammRecords`)}
            // href={"./#/layer2/history/ammRecords"}
          >
            {t("labelTransactionsLink")}
          </Link>
        </Box>
        <StyleWrapper
          container
          className={"MuiPaper-elevation2"}
          paddingY={3}
          paddingX={4}
          margin={0}
          display={isHideTotal ? "none" : "flex"}
        >
          <Grid container spacing={2} alignItems={"flex-end"}>
            <Grid item display={"flex"} flexDirection={"column"} sm={6} md={5}>
              <Typography variant={fontSize.title} color={"textSecondary"}>
                {t("labelTotalPositionValue")}
              </Typography>
              <Typography variant={fontSize.count} marginTop={1}>
                {summaryMyInvest?.investDollar
                  ? PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      sdk
                        .toBig(summaryMyInvest.investDollar)
                        .times(forexMap[currency] ?? 0),
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
            {/*<Grid item display={"flex"} flexDirection={"column"} sm={3} md={4}>*/}
            {/*  <Typography*/}
            {/*    variant={fontSize.title2}*/}
            {/*    component={"h3"}*/}
            {/*    fontFamily={"Roboto"}*/}
            {/*    color={"textSecondary"}*/}
            {/*  >*/}
            {/*    {t("labelFeeRewards")}*/}
            {/*  </Typography>*/}
            {/*  <Typography*/}
            {/*    variant={fontSize.count2}*/}
            {/*    marginTop={1}*/}
            {/*    fontFamily={"Roboto"}*/}
            {/*  >*/}
            {/*    {summaryMyInvest?.feeDollar*/}
            {/*      ? PriceTag[CurrencyToTag[currency]] +*/}
            {/*        getValuePrecisionThousand(*/}
            {/*          (summaryMyInvest.feeDollar || 0) **/}
            {/*            (forexMap[currency] ?? 0),*/}
            {/*          undefined,*/}
            {/*          undefined,*/}
            {/*          2,*/}
            {/*          true,*/}
            {/*          { isFait: true, floor: true }*/}
            {/*        )*/}
            {/*      : EmptyValueTag}*/}
            {/*  </Typography>*/}
            {/*</Grid>*/}
          </Grid>
        </StyleWrapper>
        <Box marginBottom={3} flex={1}>
          {!(myPoolRow?.length > 0) &&
          !(lidoAssets?.length > 0) &&
          !(stakingList?.length > 0) &&
          !(dualList?.length > 0) ? (
            <TableWrapStyled
              flex={1}
              marginTop={isHideTotal ? 1 : 2}
              height={"100%"}
              display={"flex"}
              width={"100%"}
            >
              <EmptyDefault
                sx={{ flex: 1 }}
                message={() => {
                  return (
                    <Trans i18nKey="labelNoInvestContent">
                      You have no investment assets, invest AMM, ETH Stacking,
                      DUAL earn your rewards
                    </Trans>
                  );
                }}
              />
            </TableWrapStyled>
          ) : (
            <>
              {!!(myPoolRow?.length > 0) && (
                <TableWrapStyled
                  ref={ammPoolRef}
                  className={`table-divide-short MuiPaper-elevation2`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
                >
                  <Grid
                    item
                    xs={12}
                    display={"flex"}
                    flexDirection={"column"}
                    flex={1}
                  >
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
                      totalDollar={summaryMyInvest.ammPoolDollar}
                      tableHeight={tableHeight}
                      filter={filter}
                      handleFilterChange={handleFilterChange}
                      hideSmallBalances={hideSmallBalances}
                      allowTrade={allowTrade}
                      rawData={myPoolRow}
                      showFilter={true}
                      account={account}
                      showloading={showLoading}
                      currency={currency}
                      tokenMap={tokenMap as any}
                      idIndex={idIndex}
                      tokenPrices={tokenPrices as any}
                      handleWithdraw={(row) => {
                        const pair = `${row.ammDetail.coinAInfo.simpleName}-${row.ammDetail.coinBInfo.simpleName}`;
                        setShowAmm({
                          isShow: true,
                          type: AmmPanelType.Exit,
                          symbol: pair,
                        });
                      }}
                      handleDeposit={(row) => {
                        const pair = `${row.ammDetail.coinAInfo.simpleName}-${row.ammDetail.coinBInfo.simpleName}`;
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
              )}
              {!!(stakingList?.length > 0) && (
                <TableWrapStyled
                  ref={sideStakeRef}
                  className={`table-divide-short MuiPaper-elevation2 min-height`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
                >
                  <Grid container>
                    <Grid item xs={6}>
                      <Typography variant={"h5"} marginBottom={2} marginX={3}>
                        {t("labelInvestType_LRCSTAKE")}
                      </Typography>
                      {summaryMyInvest?.stakeLRCDollar !== undefined ? (
                        <Typography component={"h4"} variant={"h3"} marginX={3}>
                          {summaryMyInvest?.stakeLRCDollar
                            ? PriceTag[CurrencyToTag[currency]] +
                              getValuePrecisionThousand(
                                sdk
                                  .toBig(summaryMyInvest?.stakeLRCDollar)
                                  .times(forexMap[currency] ?? 0),
                                undefined,
                                undefined,
                                2,
                                true,
                                { isFait: true, floor: true }
                              )
                            : EmptyValueTag}
                        </Typography>
                      ) : (
                        ""
                      )}
                    </Grid>
                    <Grid
                      item
                      xs={3}
                      justifyContent={"space-evenly"}
                      flexDirection={"column"}
                      alignItems={"flex-end"}
                      display={"flex "}
                    >
                      <Typography
                        variant={"body1"}
                        marginBottom={1}
                        marginX={3}
                        component={"span"}
                      >
                        {t("labelStakingCumulativeEarnings")}
                      </Typography>
                      <Typography
                        variant={"body1"}
                        marginBottom={1}
                        marginX={3}
                        component={"span"}
                      >
                        {totalStakedRewards && totalStakedRewards !== "0"
                          ? getValuePrecisionThousand(
                              sdk
                                .toBig(totalStakedRewards ?? 0)
                                .div("1e" + tokenMap[stakedSymbol].decimals),
                              tokenMap[stakedSymbol].precision,
                              tokenMap[stakedSymbol].precision,
                              tokenMap[stakedSymbol].precision,
                              false,
                              { floor: true, isAbbreviate: true }
                            ) +
                            " " +
                            stakedSymbol
                          : EmptyValueTag}
                      </Typography>
                    </Grid>

                    <Grid
                      item
                      xs={3}
                      justifyContent={"space-evenly"}
                      flexDirection={"column"}
                      alignItems={"flex-end"}
                      display={"flex"}
                    >
                      <Typography
                        variant={"body1"}
                        marginBottom={1}
                        marginX={3}
                        component={"span"}
                      >
                        {t("labelStakingClaimableEarnings")}
                      </Typography>
                      <Box
                        marginBottom={1}
                        marginX={3}
                        display={"flex"}
                        flexDirection={"row"}
                        alignItems={"center"}
                      >
                        {totalClaimableRewardsAmount &&
                        totalClaimableRewardsAmount !== "0" ? (
                          <>
                            <Typography
                              component={"span"}
                              display={"inline-flex"}
                              paddingRight={2}
                            >
                              {totalClaimableRewardsAmount + " " + stakedSymbol}
                            </Typography>
                            <Button
                              variant={"contained"}
                              size={"small"}
                              onClick={() => {
                                updateClaimData({
                                  belong: stakedSymbol,
                                  tradeValue: volumeToCount(
                                    stakedSymbol,
                                    totalClaimableRewards
                                  ),
                                  balance: volumeToCount(
                                    stakedSymbol,
                                    totalClaimableRewards
                                  ),
                                  volume: totalClaimableRewards,
                                  tradeType: TRADE_TYPE.TOKEN,
                                  claimType: CLAIM_TYPE.lrcStaking,
                                });
                                setShowClaimWithdraw({
                                  isShow: true,
                                  claimType: CLAIM_TYPE.lrcStaking,
                                });
                              }}
                            >
                              {t("labelClaimBtn")}
                            </Button>
                          </>
                        ) : (
                          EmptyValueTag
                        )}
                      </Box>
                    </Grid>
                  </Grid>

                  <DefiStakingTable
                    {...{
                      rawData: stakingList,
                      pagination: {
                        pageSize: STAKING_INVEST_LIMIT,
                        total: stakingTotal,
                      },
                      idIndex,
                      tokenMap,
                      redeemItemClick,
                      geDefiSideStakingList: getStakingList,
                      showloading: stakeShowLoading,
                      ...rest,
                    }}
                  />
                </TableWrapStyled>
              )}
              {!!(lidoAssets?.length > 0) && (
                <TableWrapStyled
                  ref={stackingRef}
                  className={`table-divide-short MuiPaper-elevation2 ${
                    lidoAssets?.length > 0 ? "min-height" : ""
                  }`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
                >
                  <Grid item xs={12}>
                    <Typography variant={"h5"} marginBottom={1} marginX={3}>
                      {t("labelInvestType_STAKE")}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    display={"flex"}
                    flexDirection={"column"}
                    flex={1}
                    marginX={0}
                  >
                    {summaryMyInvest?.stakeETHDollar !== undefined ? (
                      <Typography component={"h4"} variant={"h3"} marginX={3}>
                        {summaryMyInvest?.stakeETHDollar
                          ? PriceTag[CurrencyToTag[currency]] +
                            getValuePrecisionThousand(
                              sdk
                                .toBig(summaryMyInvest?.stakeETHDollar)
                                .times(forexMap[currency] ?? 0),
                              undefined,
                              undefined,
                              2,
                              true,
                              { isFait: true, floor: true }
                            )
                          : EmptyValueTag}
                      </Typography>
                    ) : (
                      ""
                    )}
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
              )}
              {!!(dualList?.length > 0) && (
                <TableWrapStyled
                  ref={dualRef}
                  className={`table-divide-short MuiPaper-elevation2 min-height`}
                  marginTop={2}
                  paddingY={2}
                  paddingX={0}
                  flex={1}
                >
                  <Grid item xs={12}>
                    <Typography variant={"h5"} marginBottom={1} marginX={3}>
                      {t("labelInvestType_DUAL")}
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    display={"flex"}
                    flexDirection={"column"}
                    flex={1}
                    margin={0}
                  >
                    {summaryMyInvest?.dualStakeDollar !== undefined ? (
                      <Typography component={"h4"} variant={"h3"} marginX={3}>
                        {summaryMyInvest?.dualStakeDollar
                          ? PriceTag[CurrencyToTag[currency]] +
                            getValuePrecisionThousand(
                              sdk
                                .toBig(summaryMyInvest?.dualStakeDollar)
                                .times(forexMap[currency] ?? 0),
                              undefined,
                              undefined,
                              2,
                              true,
                              { isFait: true, floor: true }
                            )
                          : EmptyValueTag}
                      </Typography>
                    ) : (
                      ""
                    )}
                    <DualAssetTable
                      rawData={dualList}
                      getDetail={getDetail}
                      idIndex={idIndex}
                      dualMarketMap={dualMarketMap}
                      tokenMap={tokenMap}
                      showloading={dualLoading}
                      pagination={pagination}
                      getDualAssetList={getDualTxList}
                      showDetail={showDetail}
                      refresh={refresh}
                    />
                    <Modal
                      open={dualOpen}
                      onClose={(_e: any) => setDualOpen(false)}
                      aria-labelledby="modal-modal-title"
                      aria-describedby="modal-modal-description"
                    >
                      <SwitchPanelStyled width={"var(--modal-width)"}>
                        <ModalCloseButton
                          onClose={(_e: any) => setDualOpen(false)}
                          t={t}
                        />
                        {dualDetail && (
                          <Box
                            flex={1}
                            paddingY={2}
                            width={"100%"}
                            display={"flex"}
                            flexDirection={"column"}
                          >
                            <Typography
                              variant={isMobile ? "h5" : "h4"}
                              marginTop={-4}
                              textAlign={"center"}
                              paddingBottom={2}
                            >
                              {t("labelDuaInvestmentDetails", { ns: "common" })}
                            </Typography>
                            <DualDetail
                              isOrder={true}
                              dualViewInfo={
                                dualDetail.dualViewInfo as DualViewBase
                              }
                              currentPrice={
                                dualDetail.dualViewInfo.currentPrice
                              }
                              tokenMap={tokenMap}
                              lessEarnTokenSymbol={
                                dualDetail.lessEarnTokenSymbol
                              }
                              greaterEarnTokenSymbol={
                                dualDetail.greaterEarnTokenSymbol
                              }
                              lessEarnView={dualDetail.lessEarnView}
                              greaterEarnView={dualDetail.greaterEarnView}
                            />
                          </Box>
                        )}
                      </SwitchPanelStyled>
                    </Modal>
                  </Grid>
                </TableWrapStyled>
              )}
            </>
          )}
        </Box>
        <Modal
          open={showRefreshError}
          onClose={(_e: any) => setShowRefreshError(false)}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <SwitchPanelStyled width={"var(--modal-width)"}>
            <ModalCloseButton
              onClose={(_e: any) => setShowRefreshError(false)}
              t={t}
            />
            <Box marginTop={9}>
              <FailedIcon color={"error"} style={{ width: 60, height: 60 }} />
            </Box>

            <Typography marginTop={1} variant={"h5"}>
              {t("labelInvestDualRefreshErrorTitle")}
            </Typography>
            <Typography marginTop={5} marginBottom={22}>
              {t("labelInvestDualRefreshError", {
                token1: refreshErrorInfo[0],
                token2: refreshErrorInfo[1],
              })}
            </Typography>
          </SwitchPanelStyled>
        </Modal>
      </Box>
    );
  }
);

export default MyLiquidity;
