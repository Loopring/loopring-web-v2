import styled from "@emotion/styled";
import { Box, Grid, Link, Typography, LinearProgress } from "@mui/material";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { LoopringAPI, useAccount } from "@loopring-web/core";
import {
  SoursURL,
  getValuePrecisionThousand,
} from "@loopring-web/common-resources";
import { useSettings, VipPanel as VipView } from "@loopring-web/component-lib";
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
    const { isMobile } = useSettings();
    const [setVipTable] = React.useState<string[][]>([]);
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
    }, [level]);

    const getNextVIPlevel = React.useCallback(() => {
      const level = getVIPLevel();
      if (level === "super_vip" || level === "vip_4") {
        return level;
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
        SoursURL + `images/vips/${level.toUpperCase().replace("_", "")}`;
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
    }, [level]);
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
      }
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
          padding={isMobile ? "" : 4}
          margin={0}
          marginBottom={1}
          marginTop={isMobile ? 1 : 0}
          spacing={2}
        >
          <Grid item xs={12}>
            <Typography
              variant={isMobile ? "body1" : "h5"}
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
                  variant={isMobile ? "h5" : "h4"}
                  color={"text.primary"}
                  paddingRight={1}
                >
                  {t("labelTradeFeeLevel")}
                </Typography>
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
                variant={isMobile ? "body1" : "h5"}
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
          <Grid item xs={12} md={6}>
            <Typography
              fontWeight={400}
              variant={"h6"}
              color={"var(--color-text-secondary)"}
            >
              {t("labelSpotTrading")}
            </Typography>
            <Typography
              display={"inline-flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              width={"100%"}
              paddingRight={2}
            >
              <Typography variant={isMobile ? "h5" : "h4"} marginTop={0.5}>
                {t("labelCurrentlyLevel", {
                  value: getValuePrecisionThousand(getCurrentETHTradeAmount()),
                  token: "ETH",
                })}
              </Typography>
              {isMobile && (
                <Link
                  variant={"body1"}
                  onClick={handleTradeLinkClick}
                  style={{
                    textDecoration: "underline",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {t("labelTradeSpot")}
                </Link>
              )}
            </Typography>
            <Box width={"100%"} paddingRight={2} marginY={1.5}>
              <LinearProgress variant="determinate" value={getTradeVolETH()} />
              <Box
                marginTop={1}
                display={"flex"}
                justifyContent={"space-between"}
              >
                <Typography
                  fontWeight={400}
                  color={
                    isVIP4 ? "var(--color-text-secondary)" : "var(--color-star)"
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
            {!isMobile && (
              <Link
                variant={"body1"}
                onClick={handleTradeLinkClick}
                style={{
                  textDecoration: "underline",
                  color: "var(--color-text-secondary)",
                }}
              >
                {t("labelTradeSpot")}
              </Link>
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              fontWeight={400}
              variant={"h6"}
              color={"var(--color-text-secondary)"}
            >
              {t("labelLRCBalance")}
            </Typography>
            <Typography
              display={"inline-flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              width={"100%"}
              paddingRight={2}
            >
              <Typography variant={isMobile ? "h5" : "h4"} marginTop={0.5}>
                {t("labelCurrentlyLevel", {
                  value: getValuePrecisionThousand(getCurrentBalanceLRC()),
                  token: "LRC",
                })}
              </Typography>
              {isMobile && (
                <Link
                  variant={"body1"}
                  onClick={handleTradeLinkClick}
                  style={{
                    textDecoration: "underline",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {t("labelBuyToken", { token: "LRC" })}
                </Link>
              )}
            </Typography>
            <Box width={"100%"} paddingRight={2} marginY={1.5}>
              <LinearProgress variant="determinate" value={getBalanceLRC()} />
              <Box
                marginTop={1}
                display={"flex"}
                justifyContent={"space-between"}
              >
                <Typography
                  fontWeight={400}
                  color={
                    isVIP4 ? "var(--color-text-secondary)" : "var(--color-star)"
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
            {!isMobile && (
              <Link
                variant={"body1"}
                onClick={handleTradeLinkClick}
                style={{
                  textDecoration: "underline",
                  color: "var(--color-text-secondary)",
                }}
              >
                {t("labelBuyToken", { token: "LRC" })}
              </Link>
            )}
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
        </StylePaper>
        {isMobile ? (
          <Typography variant={"body1"} paddingY={2} textAlign={"center"}>
            For details, please view on desktop.
          </Typography>
        ) : (
          <StylePaper
            container
            className={"MuiPaper-elevation2"}
            marginTop={1}
            padding={4}
            marginBottom={2}
          >
            <Grid item xs={12}>
              <Typography
                component={"h3"}
                variant={isMobile ? "h5" : "h4"}
                color={"text.secondary"}
              >
                Fee List
              </Typography>
              <Box marginTop={3} flex={1}>
                <VipView rawData={rawData} currentLevel={getViewTableLevel()} />
              </Box>
            </Grid>
          </StylePaper>
        )}
      </>
    );
  }
);
