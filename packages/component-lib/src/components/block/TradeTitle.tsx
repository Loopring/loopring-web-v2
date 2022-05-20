import { WithTranslation } from "react-i18next";
import {
  Account,
  AmmRankIcon,
  AvatarCoinStyled,
  CoinInfo,
  EmptyValueTag,
  FloatTag,
  getValuePrecisionThousand,
  PriceTag,
  SoursURL,
  TradeFloat,
  TrophyIcon,
  UpColor,
} from "@loopring-web/common-resources";
import { Box, Grid } from "@mui/material";
import { Avatar, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { baseTitleCss, useSettings } from "../../index";
import { NewTagIcon } from "../basic-lib";
import {
  AmmPoolInProgressActivityRule,
  Currency,
  LoopringMap,
} from "@loopring-web/loopring-sdk";
import { useHistory } from "react-router-dom";

type StyledProps = {
  custom: { chg: UpColor };
};
const TradeTitleStyled = styled(Box)<StyledProps>`
  ${({ theme, custom }) => baseTitleCss({ theme, custom })}
` as (props: StyledProps) => JSX.Element;

export const TradeTitle = <I extends object>({
  baseShow,
  account,
  quoteShow,
  coinAInfo,
  coinBInfo,
  // t,
  tradeFloat = {
    volume: 0,
    change: 0,
    timeUnit: "24h",
    priceYuan: 0,
    priceDollar: 0,
    floatTag: FloatTag.none,
    close: 0,
  },
  isNew,
  activityInProgressRules,
}: WithTranslation & {
  account: Account;
  baseShow: string;
  quoteShow: string;
  coinAInfo: CoinInfo<I>;
  coinBInfo: CoinInfo<I>;
  tradeFloat: TradeFloat;
  isNew: boolean;
  activityInProgressRules: LoopringMap<AmmPoolInProgressActivityRule>;
}) => {
  const { coinJson } = useSettings();
  const history = useHistory();

  const sellCoinIcon: any = coinJson[coinAInfo?.simpleName];
  const buyCoinIcon: any = coinJson[coinBInfo?.simpleName];

  const tradeFloatType =
    tradeFloat?.changeDollar === 0
      ? FloatTag.none
      : tradeFloat && tradeFloat.changeDollar && tradeFloat.changeDollar < 0
      ? FloatTag.decrease
      : FloatTag.increase;
  const { currency, upColor } = useSettings();
  const close: any = tradeFloat.close;

  const value =
    currency === Currency.usd
      ? "\u2248 " +
        PriceTag.Dollar +
        getValuePrecisionThousand(
          tradeFloat && tradeFloat.closeDollar ? tradeFloat.closeDollar : 0,
          undefined,
          undefined,
          undefined,
          true,
          { isFait: true }
        )
      : "\u2248 " +
        PriceTag.Yuan +
        getValuePrecisionThousand(
          tradeFloat && tradeFloat.closeYuan ? tradeFloat.closeYuan : 0,
          undefined,
          undefined,
          undefined,
          true,
          { isFait: true }
        );

  const pair = `${coinAInfo?.simpleName}-${coinBInfo?.simpleName}`;
  const change =
    tradeFloat?.change &&
    tradeFloat.change.toFixed &&
    !Number.isNaN(tradeFloat?.change)
      ? tradeFloat.change.toFixed(2) + "%"
      : "0.00%";
  return (
    // @ts-ignore
    <TradeTitleStyled custom={{ chg: upColor }}>
      {coinBInfo && coinAInfo ? (
        <Grid container height={72}>
          <Grid item xs={12} height={28}>
            <Box
              display={"flex"}
              flexDirection={"row"}
              justifyContent={"flex-start"}
              alignItems={"center"}
            >
              <Box
                className={"logo-icon"}
                display={"flex"}
                height={"var(--chart-title-coin-size)"}
                position={"relative"}
                zIndex={20}
                width={"var(--chart-title-coin-size)"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                {sellCoinIcon ? (
                  <AvatarCoinStyled
                    imgx={sellCoinIcon.x}
                    imgy={sellCoinIcon.y}
                    imgheight={sellCoinIcon.height}
                    imgwidth={sellCoinIcon.width}
                    size={28}
                    variant="circular"
                    alt={coinAInfo?.simpleName as string}
                    // src={sellData?.icon}
                    src={
                      "data:image/svg+xml;utf8," +
                      '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                    }
                  />
                ) : (
                  <Avatar
                    variant="circular"
                    alt={coinAInfo?.simpleName as string}
                    style={{
                      height: "var(--chart-title-coin-size)",
                      width: "var(--chart-title-coin-size)",
                    }}
                    // src={sellData?.icon}
                    src={SoursURL + "images/icon-default.png"}
                  />
                )}
              </Box>

              <Box
                className={"logo-icon"}
                display={"flex"}
                height={"var(--chart-title-coin-size)"}
                position={"relative"}
                zIndex={18}
                left={-8}
                width={"var(--chart-title-coin-size)"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                {buyCoinIcon ? (
                  <AvatarCoinStyled
                    imgx={buyCoinIcon.x}
                    imgy={buyCoinIcon.y}
                    imgheight={buyCoinIcon.height}
                    imgwidth={buyCoinIcon.width}
                    size={28}
                    variant="circular"
                    alt={coinBInfo?.simpleName as string}
                    // src={sellData?.icon}
                    src={
                      "data:image/svg+xml;utf8," +
                      '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                    }
                  />
                ) : (
                  <Avatar
                    variant="circular"
                    alt={coinBInfo?.simpleName as string}
                    style={{
                      height: "var(--chart-title-coin-size)",
                      width: "var(--chart-title-coin-size)",
                    }}
                    // src={sellData?.icon}
                    src={SoursURL + "images/icon-default.png"}
                  />
                )}
              </Box>
              <Typography variant={"h4"} component={"h3"} paddingRight={1}>
                <Typography
                  component={"span"}
                  title={"sell"}
                  className={"next-coin"}
                >
                  {baseShow}
                </Typography>
                <Typography component={"i"}>/</Typography>
                <Typography component={"span"} title={"buy"}>
                  {quoteShow}
                </Typography>
              </Typography>

              {activityInProgressRules &&
                activityInProgressRules[pair] &&
                activityInProgressRules[pair].ruleType.map(
                  (ruleType, index) => (
                    <Box
                      key={ruleType.toString() + index}
                      style={{ cursor: "pointer", paddingTop: 4 }}
                      onClick={(event) => {
                        event.stopPropagation();
                        const date = new Date(
                          activityInProgressRules[pair].rangeFrom
                        );
                        const year = date.getFullYear();
                        const month = (
                          "0" + (date.getMonth() + 1).toString()
                        ).slice(-2);
                        const day = ("0" + date.getDate().toString()).slice(-2);
                        const current_event_date = `${year}-${month}-${day}`;

                        history.push(
                          `/race-event/${current_event_date}?pair=${pair}&type=${ruleType}&owner=${account?.accAddress}`
                        );
                      }}
                    >
                      <TrophyIcon />
                    </Box>
                  )
                )}
              {activityInProgressRules &&
                activityInProgressRules[`AMM-${pair}`] && (
                  <Box
                    style={{ cursor: "pointer", paddingTop: 4 }}
                    onClick={(event) => {
                      event.stopPropagation();
                      const date = new Date(
                        activityInProgressRules[`AMM-${pair}`].rangeFrom
                      );
                      const year = date.getFullYear();
                      const month = (
                        "0" + (date.getMonth() + 1).toString()
                      ).slice(-2);
                      const day = ("0" + date.getDate().toString()).slice(-2);
                      const current_event_date = `${year}-${month}-${day}`;

                      history.push(
                        `/race-event/${current_event_date}?pair=${pair}&type=${
                          activityInProgressRules[`AMM-${pair}`].ruleType[0]
                        }&owner=${account?.accAddress}`
                      );
                    }}
                  >
                    <AmmRankIcon />
                  </Box>
                )}
              {isNew ? <NewTagIcon /> : undefined}
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            height={36}
            display={"flex"}
            flexDirection={"row"}
            justifyContent={"flex-start"}
            alignItems={"center"}
            className={"float-group"}
            marginTop={1}
          >
            <Typography variant={"h1"}>
              {close == "NaN" ? EmptyValueTag : close} {quoteShow}
            </Typography>
            <Box
              display={"flex"}
              flexDirection={"column"}
              alignItems={"flex-start"}
              justifyContent={"center"}
              className={"float-chart"}
            >
              <Typography
                variant={"body2"}
                component={"span"}
                className={"chart-change"}
              ></Typography>
              <Typography
                variant={"h5"}
                component={"span"}
                display={"flex"}
                alignItems={"flex-end"}
              >
                <Typography variant={"h5"} component={"span"}>
                  {value}
                </Typography>
                <Typography
                  variant={"h5"}
                  component={"span"}
                  className={`float-tag float-${tradeFloatType}`}
                >
                  （{tradeFloatType === FloatTag.increase ? "+" : ""}
                  {change}）
                </Typography>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <></>
      )}
    </TradeTitleStyled>
  );
};
