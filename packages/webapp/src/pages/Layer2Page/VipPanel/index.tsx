import styled from "@emotion/styled";
import { Box, Grid, Link, Typography, LinearProgress } from "@mui/material";
import React from "react";
import { Trans, WithTranslation, withTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useAccount } from "stores/account";
import { LoopringAPI } from "../../../api_wrapper";
import {
  myLog,
  SoursURL,
  getValuePrecisionThousand,
} from "@loopring-web/common-resources";
import { VipPanel as VipView } from "@loopring-web/component-lib";
import { useGetVIPInfo } from "./hooks";

const StylePaper = styled(Grid)`
  width: 100%;
  //height: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

const feeRate = {
  vip1: {
    eth: 75,
    lrc: 25000,
  },
  vip2: {
    eth: 750,
    lrc: 50000,
  },
  vip3: {
    eth: 3750,
    lrc: 125000,
  },
  vip4: {
    eth: 7500,
    lrc: 250000,
  },
};

const rawData = [
  {
    level: "VIP 0",
    tradeVolume: "< 75 ETH",
    rule: "or",
    balance: ">= 0 LRC",
    maker: "-0.02%",
    taker: "0.3%",
  },
  {
    level: "VIP 1",
    tradeVolume: ">= 75 ETH",
    rule: "or",
    balance: ">= 25,000 LRC",
    maker: "-0.02%",
    taker: "0.25%",
  },
  {
    level: "VIP 2",
    tradeVolume: ">= 750 ETH",
    rule: "and",
    balance: ">= 50,000 LRC",
    maker: "-0.02%",
    taker: "0.2%",
  },
  {
    level: "VIP 3",
    tradeVolume: ">= 3750 ETH",
    rule: "and",
    balance: ">= 125,000 LRC",
    maker: "-0.02%",
    taker: "0.15%",
  },
  {
    level: "VIP 4",
    tradeVolume: ">= 7500 ETH",
    rule: "and",
    balance: ">= 250,000 LRC",
    maker: "-0.02%",
    taker: "0.1%",
  },
];

export const VipPanel = withTranslation(["common", "layout"])(
  ({ t }: WithTranslation) => {
    const {
      account: { level },
    } = useAccount();
    const history = useHistory();
    const [vipTable, setVipTable] = React.useState<string[][]>([]);
    const {
      getUserTradeAmount,
      tradeAmountInfo,
      userVIPInfo,
      getUserVIPInfo,
      userAssets,
      getUserAssets,
    } = useGetVIPInfo();

    const getVIPLevel = React.useCallback(() => {
      if (userVIPInfo && userVIPInfo.vipInfo && userVIPInfo.vipInfo.vipTag) {
        if (userVIPInfo.vipInfo.vipTag === "spam") {
          return "vip_0";
        }
        return userVIPInfo.vipInfo.vipTag;
      }
      return "vip_0";
    }, [userVIPInfo]);

    const getNextVIPlevel = React.useCallback(() => {
      if (getVIPLevel() === "super_vip" || getVIPLevel() === "vip_4") {
        return getVIPLevel();
      }
      let [_, number] = getVIPLevel()
        .toUpperCase()
        .replace("_", ",")
        .split(",");
      return `${++number}`;
    }, [getVIPLevel]);

    const getViewTableLevel = React.useCallback(() => {
      if (!getVIPLevel()) {
        return 0;
      }
      if (getVIPLevel() === "super_vip" || getVIPLevel() === "vip_4") {
        return 4;
      }
      let [_, number] = getVIPLevel()
        .toUpperCase()
        .replace("_", ",")
        .split(",");
      return number;
    }, [getVIPLevel]);

    const getCurrentETHTradeAmount = React.useCallback(() => {
      if (tradeAmountInfo && !!tradeAmountInfo.raw_data.data.length) {
        const sum: number[] = tradeAmountInfo.raw_data.data.map((o: any) =>
          Number(o.ethValue)
        );
        return sum.reduce((prev, next) => prev + next, 0).toFixed(7);
      }
      return 0;
    }, [tradeAmountInfo]);

    const getCurrentBalanceLRC = React.useCallback(() => {
      if (userAssets && userAssets.length) {
        return Number(userAssets[userAssets.length - 1].lrcValue).toFixed(3);
      }
      return 0;
    }, [userAssets]);

    // const [vipTable, setVipTable] = React.useState<string[][]>(vipDefault);
    const [userFee, setUserFee] = React.useState<{
      maker: string;
      taker: string;
    }>({
      maker: "0",
      taker: "0.0025%",
    });

    React.useEffect(() => {
      getUserTradeAmount();
      getUserVIPInfo();
      getUserAssets();
    }, [getUserTradeAmount, getUserVIPInfo, getUserAssets]);

    const isVIP4 = getVIPLevel() === "vip_4";
    const isSVIP = getVIPLevel() === "super_vip";

    const getNextLevelAmount = React.useCallback(
      (type: "lrc" | "eth", currLevel: number) => {
        const isLrc = type === "lrc";
        const amount = Math.round(
          feeRate[`vip${currLevel}`][type] -
            (isLrc
              ? Number(getCurrentBalanceLRC())
              : Number(getCurrentETHTradeAmount()))
        );
        return amount < 0 ? 0 : amount;
      },
      [getCurrentBalanceLRC, getCurrentETHTradeAmount]
    );

    const getImagePath = React.useMemo(() => {
      const path =
        SoursURL +
        `images/vips/${getVIPLevel().toUpperCase().replace("_", "")}`;
      return (
        <img
          alt="VIP"
          style={{
            verticalAlign: "text-bottom",
            width: "32px",
            height: "16px",
          }}
          src={`${path}.webp`}
          // srcSet={`${path}.webp 1x, ${path}.png 1x`}
        />
      );
      // <>
      //     <picture>
      //     <source srcSet={path+'.webp'} type="image/webp"/>
      //     <source srcSet={path+'.png'} />
      //     <img alt="VIP" style={{verticalAlign: 'text-bottom', width: '32px', height: '16px'}}
      //          src={'https://static.loopring.io/assets/images/vips/VIP4.png'}/>
      // </picture>
      //
      // </>
    }, [getVIPLevel]);
    const result = React.useCallback(async () => {
      if (LoopringAPI.exchangeAPI) {
        const {
          // orderbookTradingFeesStablecoin,
          orderbookTradingFees,
          // ammTradingFees,
          // otherFees,
        } = await LoopringAPI.exchangeAPI.getExchangeFeeInfo();
        const _level =
          level === "super_vip" ? "vip_4" : level === "" ? "default" : level;
        if (orderbookTradingFees[_level]) {
          setUserFee({
            maker:
              (orderbookTradingFees[_level].makerRate / 10000).toString() + "%",
            taker:
              (orderbookTradingFees[_level].takerRate / 10000).toString() + "%",
          });
        }

        // orderbookTradingFeesStablecoin: VipFeeRateInfoMap;
        // orderbookTradingFees: VipFeeRateInfoMap;
        // ammTradingFees: VipFeeRateInfoMap;
        // otherFees: {
        //     [key: string]: string;
        // };
        // raw_data: any;
        // raw_data.
        //setVipTable(raw_data)
      }

      // setUserFee(userFee)
    }, [setVipTable, level]);
    React.useEffect(() => {
      result();
    }, []);

    const handleTradeLinkClick = React.useCallback(() => {
      if (history) {
        history.push("/trade/lite/LRC-ETH");
      }
    }, [history]);

    const getTradeVolETH = React.useCallback(() => {
      if (isSVIP) {
        return 0;
      }
      if (isVIP4) {
        return 100;
      }
      const rate =
        (Number(getCurrentETHTradeAmount()) /
          feeRate[`vip${getNextVIPlevel()}`]["eth"]) *
        100;
      return rate > 100 ? 100 : rate;
    }, [isVIP4, isSVIP, getCurrentETHTradeAmount, getNextVIPlevel]);

    const getBalanceLRC = React.useCallback(() => {
      if (isSVIP) {
        return 0;
      }
      if (isVIP4) {
        return 100;
      }
      const rate =
        (Number(getCurrentBalanceLRC()) /
          feeRate[`vip${getNextVIPlevel()}`]["lrc"]) *
        100;
      return rate > 100 ? 100 : rate;
    }, [getCurrentBalanceLRC, getNextVIPlevel, isSVIP, isVIP4]);

    const getCurrVIPLevel = React.useCallback(
      (direction: "left" | "right") => {
        const isLeft = direction === "left";
        const isRight = direction === "right";
        if (
          getVIPLevel() !== "super_vip" &&
          getVIPLevel() !== "vip_4" &&
          isLeft
        ) {
          return getVIPLevel().toUpperCase().replace("_", " ");
        }
        if (
          getVIPLevel() !== "super_vip" &&
          getVIPLevel() !== "vip_4" &&
          isRight
        ) {
          let [vip, number] = getVIPLevel()
            .toUpperCase()
            .replace("_", ",")
            .split(",");
          return `${vip} ${++number}`;
        }
        if (isSVIP && direction === "left") {
          return "Super VIP";
        }
        if (isSVIP && direction === "right") {
          return "";
        }
        if (isVIP4) {
          return direction === "left" ? "VIP 3" : "VIP 4";
        }
        return "";
      },
      [isSVIP, isVIP4, getVIPLevel]
    );

    return (
      <>
        <StylePaper
          flex={1}
          container
          className={"MuiPaper-elevation2"}
          padding={4}
          marginBottom={1}
        >
          <Grid item xs={12}>
            <Typography
              variant={"h5"}
              component={"h2"}
              marginY={1}
              display={"flex"}
              flexDirection={"column"}
            >
              <Typography
                component={"div"}
                flexDirection={"row"}
                display={"flex"}
                alignSelf={"flex-start"}
              >
                <Typography
                  component={"p"}
                  variant={"h4"}
                  color={"text.primary"}
                  paddingRight={1}
                >
                  {t("labelTradeFeeLevel")}
                </Typography>

                {/*{getImagePath}*/}
                {/*<VipStyled component={'span'} variant={'body2'} > {'VIP 1'} </VipStyled>*/}
                <Typography
                  variant={"body1"}
                  component={"span"}
                  display={"flex"}
                  flexDirection={"row"}
                  alignItems={"center"}
                >
                  <Typography component={"span"} variant={"body1"}>
                    {level && userVIPInfo && userVIPInfo.vipInfo.vipTag
                      ? getImagePath
                      : ""}
                  </Typography>
                </Typography>
              </Typography>
              <Typography
                variant={"h5"}
                component={"p"}
                color={"var(--color-text-secondary)"}
                marginTop={2}
              >
                {isVIP4
                  ? "Congratulations you have reached the highest level"
                  : isSVIP
                  ? "Congratulations! You are already a super VIP, enjoying the highest discount privileges, and will not be affected by balance and trading volume."
                  : `Upgrade to VIP ${getNextVIPlevel()} by either trading ${getValuePrecisionThousand(
                      getNextLevelAmount("eth", getNextVIPlevel())
                    )} ETH on our spot exchange and/or increase your LRC holdings by ${getValuePrecisionThousand(
                      getNextLevelAmount("lrc", getNextVIPlevel())
                    )} LRC`}
              </Typography>
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Grid container marginY={2.5}>
              <Grid item xs={6}>
                <Typography
                  fontWeight={400}
                  variant={"h6"}
                  component={"p"}
                  color={"var(--color-text-secondary)"}
                >
                  Spot Trading Volume (30d in ETH)
                </Typography>
                <Typography variant={"h4"} component={"p"} marginTop={0.5}>
                  Currently{" "}
                  {getValuePrecisionThousand(getCurrentETHTradeAmount())} ETH
                </Typography>
                <Box width={"90%"} marginY={1.5}>
                  <LinearProgress
                    variant="determinate"
                    value={getTradeVolETH()}
                  />
                  <Box
                    marginTop={1}
                    display={"flex"}
                    justifyContent={"space-between"}
                  >
                    <Typography
                      fontWeight={400}
                      color={
                        isVIP4
                          ? "var(--color-text-secondary)"
                          : "var(--color-star)"
                      }
                    >
                      {getCurrVIPLevel("left")}
                    </Typography>
                    <Typography
                      fontWeight={400}
                      color={
                        isSVIP || isVIP4
                          ? "var(--color-star)"
                          : "var(--color-text-secondary)"
                      }
                    >
                      {getCurrVIPLevel("right")}
                    </Typography>
                  </Box>
                </Box>
                <Link
                  variant={"body1"}
                  onClick={handleTradeLinkClick}
                  style={{
                    textDecoration: "underline",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Trade Spot
                </Link>
              </Grid>
              <Grid item xs={6}>
                <Typography
                  fontWeight={400}
                  variant={"h6"}
                  component={"p"}
                  color={"var(--color-text-secondary)"}
                >
                  LRC Balance
                </Typography>
                <Typography variant={"h4"} component={"span"} marginY={0.5}>
                  Currently {getValuePrecisionThousand(getCurrentBalanceLRC())}{" "}
                  LRC
                </Typography>
                <Box width={"90%"} marginY={1.5}>
                  <LinearProgress
                    variant="determinate"
                    value={getBalanceLRC()}
                  />
                  <Box
                    marginTop={1}
                    display={"flex"}
                    justifyContent={"space-between"}
                  >
                    <Typography
                      fontWeight={400}
                      color={
                        isVIP4
                          ? "var(--color-text-secondary)"
                          : "var(--color-star)"
                      }
                    >
                      {getCurrVIPLevel("left")}
                    </Typography>
                    <Typography
                      fontWeight={400}
                      color={
                        isSVIP || isVIP4
                          ? "var(--color-star)"
                          : "var(--color-text-secondary)"
                      }
                    >
                      {getCurrVIPLevel("right")}
                    </Typography>
                  </Box>
                </Box>
                <Link
                  variant={"body1"}
                  onClick={handleTradeLinkClick}
                  style={{
                    textDecoration: "underline",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Buy LRC
                </Link>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Typography
              variant={"h6"}
              component={"p"}
              fontWeight={400}
              color={"var(--color-text-secondary)"}
            >
              The cumulative 30-day trading volume ( in ETH ) and 24-hour LRC
              balance are updated at 0:00 (UTC+0) each day. After the update,
              you can access the corresponding fee discount in the table below.
            </Typography>
          </Grid>
          {/* <Grid item xs={6} justifyContent={'flex-end'} display={'flex'}>
                <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} justifyContent={'flex-end'} marginRight={6}>
                    <Typography component={'h5'} variant={'h5'} color={'text.secondary'}>{t('labelMaker')}</Typography>
                    <Typography component={'p'} variant={'h3'} color={'text.primary'} marginTop={1/2}>{userFee.maker}</Typography>
                </Box>
            </Grid>
            <Grid item xs={6} justifyContent={'flex-start'} display={'flex'} >
                <Box display={'flex'} flexDirection={'column'} alignItems={'flex-start'} marginLeft={6} >
                    <Typography component={'h5'} variant={'h5'}
                                color={'text.secondary'}> {t('labelTaker')}  </Typography>
                    <Typography component={'p'} variant={'h3'} color={'text.primary'}  marginTop={1/2}>{userFee.taker}</Typography>
                </Box>
            </Grid> */}
        </StylePaper>

        <StylePaper
          container
          className={"MuiPaper-elevation2"}
          marginTop={1}
          padding={4}
          marginBottom={2}
        >
          <Grid item xs={12}>
            {/* <Trans i18nKey={''}>
                    <Typography component={'p'} variant={'body1'} color={'text.secondary'}>Loopring Exchange charges
                        different fees for each type of service. Each service has a base fee and a proportional fee. For
                        proportional fees, there is also a minimum proportional fee setting for each service. The actual
                        fee calculation formula is: basic fee + max (minimum proportional fee, proportional fee *
                        amount).</Typography>
                    <br/>
                    <Typography component={'p'} variant={'body1'} color={'text.secondary'}>The basic fee and the minimum
                        proportional fee are the same for all users. VIPs enjoy different proportional fee
                        discounts.</Typography>
                </Trans> */}
            {/* <Box marginTop={2} flex={1}> */}
            <Typography
              component={"h3"}
              variant={"h4"}
              color={"text.secondary"}
            >
              Fee List
            </Typography>
            <Box marginTop={3} flex={1}>
              <VipView rawData={rawData} currentLevel={getViewTableLevel()} />
            </Box>

            {/* <Typography component={'h6'} variant={'h1'} padding={3} textAlign={'center'}>
                        Coming soon
                    </Typography> */}
            {/* </Box> */}
          </Grid>
        </StylePaper>
      </>
    );
  }
);
