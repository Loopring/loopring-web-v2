import { Avatar, Box, Typography } from "@mui/material";
import React from "react";

import {
  EmptyValueTag,
  getValuePrecisionThousand,
  myLog,
  SoursURL,
} from "@loopring-web/common-resources";
import { CoinSource, useSettings } from "../../stores";
import { AvatarCoin } from "../basic-lib";
import { WithTranslation, withTranslation } from "react-i18next";
import styled from "@emotion/styled";

export const AmmPairDetail = ({
  coinA,
  coinB,
  balanceA,
  balanceB,
  precisionA,
  precisionB,
}: {
  coinA: string;
  coinB: string;
  balanceA: string;
  balanceB: string;
  precisionA: number;
  precisionB: number;
}) => {
  const { coinJson } = useSettings();
  const coinAIcon: CoinSource = coinJson[coinA] ?? {};
  const coinBIcon: CoinSource = coinJson[coinB] ?? {};
  return (
    <Box padding={1.5} paddingLeft={1}>
      <Typography
        component={"span"}
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        style={{ textTransform: "capitalize" }}
        color={"textPrimary"}
      >
        <Box
          component={"span"}
          className={"logo-icon"}
          display={"flex"}
          height={"var(--list-menu-coin-size)"}
          width={"var(--list-menu-coin-size)"}
          alignItems={"center"}
          justifyContent={"flex-start"}
        >
          {coinAIcon ? (
            <AvatarCoin
              imgx={coinAIcon.x}
              imgy={coinAIcon.y}
              imgheight={coinAIcon.h}
              imgwidth={coinAIcon.w}
              size={20}
              variant="circular"
              style={{ marginTop: 2 }}
              alt={coinA as string}
              src={
                "data:image/svg+xml;utf8," +
                '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
              }
            />
          ) : (
            <Avatar
              variant="circular"
              alt={coinA as string}
              style={{
                height: "var(--list-menu-coin-size))",
                width: "var(--list-menu-coin-size)",
              }}
              src={SoursURL + "images/icon-default.png"}
            />
          )}
          <Typography
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            marginLeft={1 / 2}
            height={20}
            lineHeight={"20px"}
          >
            {coinA}
          </Typography>
        </Box>

        <Typography
          component={"span"}
          color={"var(--color-text-primary)"}
          variant={"body2"}
          height={20}
          marginLeft={10}
          lineHeight={"20px"}
        >
          {getValuePrecisionThousand(balanceA, precisionA, precisionA)}
        </Typography>
      </Typography>
      <Typography
        component={"span"}
        display={"flex"}
        flexDirection={"row"}
        justifyContent={"space-between"}
        alignItems={"center"}
        marginTop={1 / 2}
        style={{ textTransform: "capitalize" }}
      >
        <Box
          component={"span"}
          className={"logo-icon"}
          display={"flex"}
          height={"var(--list-menu-coin-size)"}
          width={"var(--list-menu-coin-size)"}
          alignItems={"center"}
          justifyContent={"flex-start"}
        >
          {coinBIcon ? (
            <AvatarCoin
              style={{ marginTop: 2 }}
              imgx={coinBIcon.x}
              imgy={coinBIcon.y}
              imgheight={coinBIcon.h}
              imgwidth={coinBIcon.w}
              size={20}
              variant="circular"
              alt={coinB}
              src={
                "data:image/svg+xml;utf8," +
                '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
              }
            />
          ) : (
            <Avatar
              variant="circular"
              alt={coinB}
              style={{
                height: "var(--list-menu-coin-size)",
                width: "var(--list-menu-coin-size)",
              }}
              src={SoursURL + "images/icon-default.png"}
            />
          )}
          <Typography
            variant={"body2"}
            color={"var(--color-text-primary)"}
            component={"span"}
            marginRight={5}
            marginLeft={1 / 2}
            alignSelf={"right"}
            height={20}
            lineHeight={"20px"}
          >
            {coinB}
          </Typography>
        </Box>

        <Typography
          variant={"body2"}
          color={"var(--color-text-primary)"}
          component={"span"}
          height={20}
          marginLeft={10}
          lineHeight={"20px"}
        >
          {getValuePrecisionThousand(balanceB, precisionB, precisionB)}
        </Typography>
      </Typography>
    </Box>
  );
};

export const AmmAPRDetail = withTranslation("tables")(
  ({
    self = 0,
    event = 0,
    fee = 0,
    t,
  }: {
    self?: number;
    event?: number;
    fee?: number;
  } & WithTranslation) => {
    return (
      <Box padding={1.5} paddingLeft={1}>
        <Typography
          component={"span"}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          style={{ textTransform: "capitalize" }}
          color={"textPrimary"}
        >
          <Typography
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            marginLeft={1 / 2}
            height={20}
            lineHeight={"20px"}
          >
            {t("labelAprPool")}
          </Typography>

          <Typography
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            height={20}
            marginLeft={10}
            lineHeight={"20px"}
          >
            {self === 0 || typeof self === "undefined"
              ? EmptyValueTag
              : getValuePrecisionThousand(self, 2, 2, 2, true) + "%"}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          style={{ textTransform: "capitalize" }}
          color={"textPrimary"}
        >
          <Typography
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            marginLeft={1 / 2}
            height={20}
            lineHeight={"20px"}
          >
            {t("labelAprFee")}
          </Typography>
          <Typography
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            height={20}
            marginLeft={10}
            lineHeight={"20px"}
          >
            {fee === 0 || typeof fee === "undefined"
              ? EmptyValueTag
              : getValuePrecisionThousand(fee, 2, 2, 2, true) + "%"}
          </Typography>
        </Typography>
        <Typography
          component={"span"}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          style={{ textTransform: "capitalize" }}
          color={"textPrimary"}
        >
          <Typography
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            marginLeft={1 / 2}
            height={20}
            lineHeight={"20px"}
          >
            {t("labelAprEvent")}
          </Typography>

          <Typography
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            height={20}
            marginLeft={10}
            lineHeight={"20px"}
          >
            {event === 0 || typeof event === "undefined"
              ? EmptyValueTag
              : getValuePrecisionThousand(event, 2, 2, 2, true) + "%"}
          </Typography>
        </Typography>
      </Box>
    );
  }
) as (props: { self?: number; event?: number; fee?: number }) => JSX.Element;

const TypographyStyle = styled(Typography)`
  .rewardItem:not(:last-child) {
    &:after {
      display: inline-flex;
      content: "+";
      padding: 0 ${({ theme }) => theme.unit + "px"};
    }
  }
` as typeof Typography;
type AmmPairDetailProps = {
  feeA: number | undefined;
  feeB: number | undefined;
  rewards: Array<{ tokenSymbol: string; amount: number | undefined }>;
  extraRewards: Array<{ tokenSymbol: string; amount: number | undefined }>;
  tokenMap: { [key: string]: any };
  coinA: string;
  coinB: string;
};
export const AmmRewardsDetail = withTranslation("tables")(
  ({
    feeA,
    feeB,
    rewards,
    extraRewards,
    tokenMap,
    coinA,
    coinB,
    t,
  }: AmmPairDetailProps & WithTranslation) => {
    // labelRewardFee
    // labelRewardReward
    // labelRewardExtra
    myLog("coinB", coinB);
    return (
      <Box padding={1.5} paddingLeft={1}>
        <Typography
          component={"span"}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          style={{ textTransform: "capitalize" }}
          color={"textPrimary"}
        >
          <Typography
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            marginLeft={1 / 2}
            height={20}
            lineHeight={"20px"}
          >
            {t("labelRewardFee")}
          </Typography>

          <TypographyStyle
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            height={20}
            marginLeft={10}
            lineHeight={"20px"}
          >
            <Typography component={"span"} className={"rewardItem"}>
              {(feeA
                ? getValuePrecisionThousand(
                    feeA,
                    tokenMap[coinA].precision,
                    tokenMap[coinA].precision,
                    tokenMap[coinA].precision,
                    true
                  )
                : EmptyValueTag) + ` ${coinA}`}
            </Typography>
            <Typography component={"span"} className={"rewardItem"}>
              {(feeB
                ? getValuePrecisionThousand(
                    feeB,
                    tokenMap[coinB].precision,
                    tokenMap[coinB].precision,
                    tokenMap[coinB].precision,
                    true
                  )
                : EmptyValueTag) + ` ${coinB}`}
            </Typography>
          </TypographyStyle>
        </Typography>
        <Typography
          component={"span"}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          style={{ textTransform: "capitalize" }}
          color={"textPrimary"}
        >
          <Typography
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            marginLeft={1 / 2}
            height={20}
            lineHeight={"20px"}
          >
            {t("labelRewardReward")}
          </Typography>
          <TypographyStyle
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            height={20}
            marginLeft={10}
            lineHeight={"20px"}
          >
            {rewards.length ? (
              <>
                {rewards.map((item: any, index: number) => {
                  return (
                    <React.Fragment key={item.id + index}>
                      {item?.amount ? (
                        <Typography component={"span"} className={"rewardItem"}>
                          {getValuePrecisionThousand(
                            item.amount,
                            tokenMap[item.symbol].precision,
                            tokenMap[item.symbol].precision,
                            tokenMap[item.symbol].precision,
                            true
                          )` ${coinA}`}{" "}
                        </Typography>
                      ) : (
                        <></>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              EmptyValueTag
            )}
          </TypographyStyle>
        </Typography>
        <Typography
          component={"span"}
          display={"flex"}
          flexDirection={"row"}
          justifyContent={"space-between"}
          alignItems={"center"}
          style={{ textTransform: "capitalize" }}
          color={"textPrimary"}
        >
          <Typography
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            marginLeft={1 / 2}
            height={20}
            lineHeight={"20px"}
          >
            {t("labelRewardExtra")}
          </Typography>

          <TypographyStyle
            component={"span"}
            color={"var(--color-text-primary)"}
            variant={"body2"}
            height={20}
            marginLeft={10}
            lineHeight={"20px"}
          >
            {extraRewards.length ? (
              <>
                {extraRewards.map((item: any, index: number) => {
                  return (
                    <React.Fragment key={item.id + index}>
                      {item?.amount ? (
                        <Typography component={"span"} className={"rewardItem"}>
                          {getValuePrecisionThousand(
                            item.amount,
                            tokenMap[item.symbol].precision,
                            tokenMap[item.symbol].precision,
                            tokenMap[item.symbol].precision,
                            true
                          )` ${coinA}`}{" "}
                        </Typography>
                      ) : (
                        <></>
                      )}
                    </React.Fragment>
                  );
                })}
              </>
            ) : (
              EmptyValueTag
            )}
          </TypographyStyle>
        </Typography>
      </Box>
    );
  }
) as (props: AmmPairDetailProps) => JSX.Element;
