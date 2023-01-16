import styled from "@emotion/styled";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  Modal,
  Typography,
} from "@mui/material";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { useHistory, useRouteMatch } from "react-router-dom";
import {
  AmmPanelType,
  AssetsTable,
  DualAssetTable,
  DualDetail,
  EmptyDefault,
  ModalCloseButton,
  MyPoolTable,
  SwitchPanelStyled,
  TokenType,
  useOpenModals,
  useSettings,
} from "@loopring-web/component-lib";
import {
  CheckBoxIcon,
  CheckedIcon,
  CurrencyToTag,
  DualViewBase,
  EmptyValueTag,
  FailedIcon,
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
  useDualMap,
  store,
  useTokenPrices,
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
    const ammPoolRef = React.useRef(null);
    const stackingRef = React.useRef(null);
    const dualRef = React.useRef(null);
    const { ammActivityMap } = useAmmActivityMap();
    const { forexMap } = useSystem();
    const { tokenMap, disableWithdrawList, idIndex } = useTokenMap();
    const { tokenPrices } = useTokenPrices();

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
      open,
      detail,
      setOpen,
      getDetail,
      refresh,
      setShowRefreshError,
      showRefreshError,
      refreshErrorInfo
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
      if (account.accountId) {
        getDualTxList({});
      }
    }, [account.accountId]);
    const {
      summaryMyInvest,
      myPoolRow,
      showLoading,
      filter,
      tableHeight,
      handleFilterChange,
    } = useOverview({
      ammActivityMap,
      dualOnInvestAsset,
      hideSmallBalances,
      // dualList,
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
    const lidoAssets = assetsRawData.filter((o) => {
      return (
        o.token.type !== TokenType.single &&
        o.token.type !== TokenType.lp &&
        (hideSmallBalances ? !o.smallBalance : true)
      );
    });
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
            isHideTotal
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
                  >
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
                  >
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
                      open={open}
                      onClose={(_e: any) => setOpen(false)}
                      aria-labelledby="modal-modal-title"
                      aria-describedby="modal-modal-description"
                    >
                      <SwitchPanelStyled width={"var(--modal-width)"}>
                        <ModalCloseButton
                          onClose={(_e: any) => setOpen(false)}
                          t={t}
                        />
                        {detail && (
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
                              dualViewInfo={detail.dualViewInfo as DualViewBase}
                              currentPrice={detail.dualViewInfo.currentPrice}
                              tokenMap={tokenMap}
                              lessEarnTokenSymbol={detail.lessEarnTokenSymbol}
                              greaterEarnTokenSymbol={
                                detail.greaterEarnTokenSymbol
                              }
                              lessEarnView={detail.lessEarnView}
                              greaterEarnView={detail.greaterEarnView}
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
            <Box marginTop={9} >
              <FailedIcon color={"error"} style={{ width: 60, height: 60 }} />
            </Box>

            <Typography marginTop={1} variant={"h5"}>{t("labelInvestDualRefreshErrorTitle")}</Typography>
            <Typography marginTop={5} marginBottom={22}>{t("labelInvestDualRefreshError", {
              token1: refreshErrorInfo[0],
              token2: refreshErrorInfo[1]
            })}</Typography>
          </SwitchPanelStyled>
        </Modal>
      </Box>
    );
  }
);

export default MyLiquidity;
