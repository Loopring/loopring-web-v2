import {
  Avatar,
  Box,
  Card,
  CardActions,
  CardContent,
  Divider,
  Typography,
} from "@mui/material";
import { Button } from "../";
import React from "react";
import moment from "moment";
import { WithTranslation, withTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import {
  ACTIVITY_TYPE,
  AmmCardProps,
  AvatarCoinStyled,
  EmptyValueTag,
  getValuePrecisionThousand,
  myLog,
  PriceTag,
  SoursURL,
} from "@loopring-web/common-resources";
import { bindPopper, usePopupState } from "material-ui-popup-state/hooks";
import { PopoverPure } from "../basic-lib";
import { bindHover } from "material-ui-popup-state/es";
import { useSettings } from "../../stores";
import styled from "@emotion/styled";
import { Currency } from "@loopring-web/loopring-sdk";

export interface Reward {
  startAt: number;
  timeInterval: string;
  accountId: number;
  tokenId: number;
  market: string;
  score: number;
  amount: string;
}

const CardStyled = styled(Card)`
  min-height: ${({ theme }) => theme.unit * 61.5}px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
`;

const LabelStyled = styled(Box)`
  position: absolute;
  top: 0;
  left: 0;
  border-radius: ${({ theme }) => theme.unit}px 0;
  padding: ${({ theme }) => theme.unit / 2}px ${({ theme }) => theme.unit}px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-box);
  font-size: 1.4rem;
  background: ${({ type }: any) =>
    type === "ORDERBOOK_MINING" ? "var(--color-warning)" : "var(--color-tag)"};
` as any;

const CardActionBoxStyled = styled(Box)`
  position: relative;
`;

const BoxStyled = styled(Box)`` as typeof Box;
// const BoxBg = styled(Box)`
//   ${({theme}) => boxLiner({theme})}
//   ${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1 / 2})};
// ` as typeof Box

const DetailWrapperStyled = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.unit}px;
`;

const DividerWrapperStyled = styled(Box)``;

const ViewDetailStyled = styled(Typography)`
  &:hover {
    color: var(--color-text-primary);
  }
` as any;

export const AmmCard = withTranslation("common", { withRef: true })(
  React.memo(
    React.forwardRef(
      <T extends { [key: string]: any }>(
        {
          t,
          coinAInfo,
          coinBInfo,
          amountDollar,
          amountYuan,
          account,
          APR,
          activity: {
            duration,
            myRewards,
            rewardToken,
            isPass,
            ruleType,
            totalRewards,
            rewardTokenDollar,
            rewardTokenYuan,
            maxSpread,
          },
          handleClick,
          popoverIdx,
          totalA,
          totalB,
          precisionA,
          precisionB,
          ammRewardRecordList, //: RewardItem[]
          getLiquidityMining, //: (market: string, size?: number) => Promise<void>
          getMiningLinkList,
          setShowRewardDetail,
          setChosenCardInfo,
          ammInfo,
          ...rest
        }: AmmCardProps<T> & WithTranslation,
        ref: React.ForwardedRef<any>
      ) => {
        const isOrderbook = ruleType === "ORDERBOOK_MINING";
        const isAmm = ruleType === "AMM_MINING";
        const {
          rewardValue,
          rewardValue2,
          coinAPriceDollar,
          coinBPriceDollar,
          coinAPriceYuan,
          coinBPriceYuan,
          rewardToken2,
        } = rest;
        const { coinJson, currency } = useSettings();
        const coinAIcon: any = coinJson[coinAInfo?.simpleName] || "";
        const coinBIcon: any = coinJson[coinBInfo?.simpleName] || "";
        const pathname = `${coinAInfo?.simpleName}-${coinBInfo?.simpleName}`;
        const pair = `${coinAInfo?.simpleName} / ${coinBInfo?.simpleName}`;

        const myBalanceA = ammInfo?.balanceA;
        const myBalanceB = ammInfo?.balanceB;
        const myTotalAmmValueDollar = ammInfo?.totalAmmValueDollar;
        const myTotalAmmValueYuan = ammInfo?.totalAmmValueYuan;

        const totalAmmRewardDollar =
          PriceTag.Dollar +
          getValuePrecisionThousand(
            (rewardValue || 0) * (coinAPriceDollar || 0) +
              (rewardValue2 || 0) * (coinBPriceDollar || 0),
            undefined,
            undefined,
            2,
            true,
            { isFait: true }
          );
        const totalAmmRewardYuan =
          PriceTag.Yuan +
          getValuePrecisionThousand(
            (rewardValue || 0) * (coinAPriceYuan || 0) +
              (rewardValue2 || 0) * (coinBPriceYuan || 0),
            undefined,
            undefined,
            2,
            true,
            { isFait: true }
          );
        myLog({
          totalAmmRewardDollar,
          totalAmmRewardYuan,
          rewardValue,
          rewardValue2,
          coinAPriceDollar,
          coinBPriceDollar,
        });
        const orderbookRewardDollar =
          PriceTag.Dollar +
          getValuePrecisionThousand(
            (totalRewards || 0) * (rewardTokenDollar || 0),
            undefined,
            undefined,
            2,
            true,
            { isFait: true }
          );
        const orderbookRewardYuan =
          PriceTag.Yuan +
          getValuePrecisionThousand(
            (totalRewards || 0) * (rewardTokenYuan || 0),
            undefined,
            undefined,
            2,
            true,
            { isFait: true }
          );
        const isComing = moment(duration.from).unix() * 1000 > moment.now();

        const popLiquidityState = usePopupState({
          variant: "popover",
          popupId: `popup-totalLiquidty-${popoverIdx}`,
        });
        const popTotalRewardState = usePopupState({
          variant: "popover",
          popupId: `popup-totalReward-${popoverIdx}`,
        });
        const popMyAmmValueState = usePopupState({
          variant: "popover",
          popupId: `popup-myAmmValue-${popoverIdx}`,
        });

        const history = useHistory();

        const handleViewDetail = React.useCallback(() => {
          const date = new Date(duration.from);
          const year = date.getFullYear();
          const month = ("0" + (date.getMonth() + 1).toString()).slice(-2);
          const day = ("0" + date.getDate().toString()).slice(-2);
          const current_event_date = `${year}-${month}-${day}`;
          history.push(
            `/race-event/${current_event_date}?pair=${pathname}&type=${ACTIVITY_TYPE[ruleType]}&owner=${account?.accAddress}`
          );
        }, [history, pathname]);

        const handleMyRewardClick = React.useCallback(() => {
          getLiquidityMining(pathname, 120);
          setShowRewardDetail(true);
          setChosenCardInfo(rewardToken?.simpleName);
        }, [
          getLiquidityMining,
          pathname,
          rewardToken?.simpleName,
          setChosenCardInfo,
          setShowRewardDetail,
        ]);

        return (
          <CardStyled ref={ref}>
            <LabelStyled type={ruleType}>
              {isOrderbook ? "Orderbook" : "AMM Pool"}
            </LabelStyled>
            <CardContent style={{ paddingBottom: 0 }}>
              <BoxStyled
                display={"flex"}
                flexDirection={"row"}
                justifyContent={"space-between"}
                alignItems={"center"}
              >
                <Typography
                  variant={"h3"}
                  component={"span"}
                  color={"textPrimary"}
                  fontFamily={"Roboto"}
                >
                  {pair}
                </Typography>
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  justifyContent={"flex-start"}
                  alignItems={"center"}
                  marginRight={-1}
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
                    {coinAIcon ? (
                      <AvatarCoinStyled
                        imgx={coinAIcon.x}
                        imgy={coinAIcon.y}
                        imgheight={coinAIcon.h}
                        imgwidth={coinAIcon.w}
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
                    {coinBIcon ? (
                      <AvatarCoinStyled
                        imgx={coinBIcon.x}
                        imgy={coinBIcon.y}
                        imgheight={coinBIcon.h}
                        imgwidth={coinBIcon.w}
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
                </Box>
              </BoxStyled>
              <Typography
                display={"flex"}
                flexDirection={"column"}
                component={"span"}
                justifyContent={"center"}
                alignItems={"center"}
                marginTop={7}
              >
                {isOrderbook ? (
                  <Typography
                    component={"span"}
                    variant={"h2"}
                    fontFamily={"Roboto"}
                  >
                    {totalRewards
                      ? getValuePrecisionThousand(totalRewards) +
                        " " +
                        rewardToken?.simpleName
                      : EmptyValueTag}
                  </Typography>
                ) : (
                  <Typography
                    component={"span"}
                    variant={"h1"}
                    fontFamily={"Roboto"}
                  >
                    {getValuePrecisionThousand(APR, 2, 2, 2, true) + "%" ||
                      EmptyValueTag}
                  </Typography>
                )}
                <Typography
                  component={"span"}
                  color={"textPrimary"}
                  variant={"h6"}
                  marginTop={1}
                  style={{ textTransform: "uppercase" }}
                >
                  {isOrderbook ? t("labelMiningReward") : t("labelAPR")}
                </Typography>
              </Typography>

              <DividerWrapperStyled marginTop={3} marginBottom={2}>
                <Divider />
              </DividerWrapperStyled>

              <DetailWrapperStyled>
                <Typography
                  component={"span"}
                  color={"textSecondary"}
                  variant={"h6"}
                >
                  {t("labelMiningActiveDate")}
                </Typography>
                <Typography
                  component={"span"}
                  color={"textPrimary"}
                  variant={"h6"}
                  fontWeight={400}
                >
                  {" " + moment(duration.from).format("YYYY/MM/DD")} -{" "}
                  {moment(duration.to).format("MM/DD")}
                </Typography>
              </DetailWrapperStyled>

              {isAmm && (
                <DetailWrapperStyled>
                  <Typography
                    component={"span"}
                    color={"textSecondary"}
                    variant={"h6"}
                  >
                    {t("labelMiningLiquidity")}
                  </Typography>
                  <Typography
                    component={"span"}
                    color={"textPrimary"}
                    variant={"h6"}
                    fontWeight={400}
                  >
                    <Typography
                      {...bindHover(popLiquidityState)}
                      style={{
                        cursor: "pointer",
                        borderBottom: "1px dashed var(--color-text-primary)",
                      }}
                    >
                      {t("labelLiquidity") + " " + amountDollar === undefined
                        ? EmptyValueTag
                        : currency === Currency.usd
                        ? PriceTag.Dollar +
                          getValuePrecisionThousand(
                            amountDollar,
                            undefined,
                            undefined,
                            undefined,
                            true,
                            { isFait: true }
                          )
                        : PriceTag.Yuan +
                          getValuePrecisionThousand(
                            amountYuan,
                            undefined,
                            undefined,
                            undefined,
                            true,
                            { isFait: true }
                          )}
                      {/* <Typography
                                component={'span'} style={{ cursor: 'pointer' }}> {
                                    typeof totalAmmValueDollar === 'undefined' ? EmptyValueTag : (currency === Currency.usd ? PriceTag.Dollar + getValuePrecisionThousand(totalAmmValueDollar, undefined, undefined, undefined, true, { isFait: true, floor: true }) : PriceTag.Yuan + getValuePrecisionThousand(totalAmmValueYuan, undefined, undefined, undefined, true, { isFait: true, floor: true }))}
                            </Typography> */}
                    </Typography>
                    <PopoverPure
                      className={"arrow-top-center"}
                      {...bindPopper(popLiquidityState)}
                      anchorOrigin={{
                        vertical: "top",
                        horizontal: "center",
                      }}
                      transformOrigin={{
                        vertical: "bottom",
                        horizontal: "center",
                      }}
                    >
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
                              <AvatarCoinStyled
                                imgx={coinAIcon.x}
                                imgy={coinAIcon.y}
                                imgheight={coinAIcon.h}
                                imgwidth={coinAIcon.w}
                                size={20}
                                variant="circular"
                                style={{ marginTop: 2 }}
                                alt={coinAInfo?.simpleName as string}
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
                              {coinAInfo?.simpleName}
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
                            {getValuePrecisionThousand(
                              totalA,
                              undefined,
                              undefined,
                              precisionA,
                              false,
                              { floor: true }
                            )}
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
                              <AvatarCoinStyled
                                style={{ marginTop: 2 }}
                                imgx={coinBIcon.x}
                                imgy={coinBIcon.y}
                                imgheight={coinBIcon.h}
                                imgwidth={coinBIcon.w}
                                size={20}
                                variant="circular"
                                alt={coinBInfo?.simpleName as string}
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
                              {coinBInfo?.simpleName}
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
                            {getValuePrecisionThousand(
                              totalB,
                              undefined,
                              undefined,
                              precisionB,
                              false,
                              { floor: true }
                            )}
                          </Typography>
                        </Typography>
                      </Box>
                    </PopoverPure>
                  </Typography>
                </DetailWrapperStyled>
              )}

              {isOrderbook && (
                <DetailWrapperStyled>
                  <Typography
                    component={"span"}
                    color={"textSecondary"}
                    variant={"h6"}
                  >
                    {t("labelMiningMaxSpread")}
                  </Typography>
                  <Typography
                    component={"span"}
                    color={"textPrimary"}
                    variant={"h6"}
                    fontWeight={400}
                  >
                    {getValuePrecisionThousand(
                      maxSpread,
                      undefined,
                      undefined,
                      2,
                      true
                    )}
                    &nbsp;
                    {"%"}
                  </Typography>
                </DetailWrapperStyled>
              )}

              {!isOrderbook && (
                <DetailWrapperStyled>
                  <Typography
                    component={"span"}
                    color={"textSecondary"}
                    variant={"h6"}
                  >
                    {t("labelMiningActivityReward")}
                  </Typography>
                  {isPass ? (
                    <Typography
                      component={"span"}
                      color={"textPrimary"}
                      variant={"h6"}
                      fontWeight={400}
                    >
                      {getValuePrecisionThousand(totalRewards)}
                      &nbsp;
                      {rewardToken?.simpleName}
                    </Typography>
                  ) : (
                    <Typography
                      {...bindHover(popTotalRewardState)}
                      component={"span"}
                      color={"textPrimary"}
                      variant={"h6"}
                      fontWeight={400}
                      style={{
                        borderBottom: totalRewards
                          ? "1px dashed var(--color-text-primary)"
                          : "none",
                      }}
                    >
                      {getValuePrecisionThousand(totalRewards)}
                      &nbsp;
                      {rewardToken?.simpleName}
                    </Typography>
                  )}
                  <PopoverPure
                    className={"arrow-top-center"}
                    {...bindPopper(popTotalRewardState)}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    transformOrigin={{
                      vertical: "bottom",
                      horizontal: "center",
                    }}
                  >
                    <Box padding={1}>
                      <Typography
                        component={"span"}
                        display={"flex"}
                        flexDirection={"row"}
                        justifyContent={"space-between"}
                        alignItems={"center"}
                        style={{ textTransform: "capitalize" }}
                        color={"textPrimary"}
                      >
                        {/* <Box component={'span'} className={'logo-icon'} display={'flex'}
                                        height={'var(--list-menu-coin-size)'}
                                        width={'var(--list-menu-coin-size)'} alignItems={'center'}
                                        
                                        justifyContent={'flex-start'}>
                                        {coinAIcon ?
                                            <AvatarCoinStyled imgx={coinAIcon.x} imgy={coinAIcon.y}
                                                imgheight={coinAIcon.h}
                                                imgwidth={coinAIcon.w} size={20}
                                                variant="circular"
                                                style={{ marginTop: 2 }}
                                                alt={coinAInfo?.simpleName as string}
                                                src={'data:image/svg+xml;utf8,' + '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'} />
                                            :
                                            <Avatar variant="circular" alt={coinAInfo?.simpleName as string}
                                                style={{
                                                    height: 'var(--list-menu-coin-size))',
                                                    width: 'var(--list-menu-coin-size)'
                                                }}
                                                src={SoursURL+'images/icon-default.png'} />
                                        }
                                        <Typography component={'span'} color={'var(--color-text-primary)'} variant={'body2'} marginLeft={1 / 2}
                                            height={20}
                                            lineHeight={'20px'}>
                                            {coinAInfo?.simpleName}
                                        </Typography>
                                    </Box> */}

                        <Typography
                          component={"span"}
                          color={"var(--color-text-primary)"}
                          variant={"body2"}
                          height={20}
                          lineHeight={"20px"}
                        >
                          {isOrderbook
                            ? currency === Currency.usd
                              ? orderbookRewardDollar
                              : orderbookRewardYuan
                            : isAmm
                            ? currency === Currency.usd
                              ? totalAmmRewardDollar
                              : totalAmmRewardYuan
                            : currency === Currency.usd
                            ? orderbookRewardDollar
                            : orderbookRewardYuan}
                          {/* {getValuePrecisionThousand((isOrderbook ? totalRewards : rewardValue), undefined, undefined, precisionA, false, {floor: true})} */}
                        </Typography>
                      </Typography>
                      {rewardToken2 && (
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
                              <AvatarCoinStyled
                                style={{ marginTop: 2 }}
                                imgx={coinBIcon.x}
                                imgy={coinBIcon.y}
                                imgheight={coinBIcon.h}
                                imgwidth={coinBIcon.w}
                                size={20}
                                variant="circular"
                                alt={coinBInfo?.simpleName as string}
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
                              {coinBInfo?.simpleName}
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
                            {getValuePrecisionThousand(
                              rewardValue2,
                              undefined,
                              undefined,
                              precisionB,
                              false,
                              { floor: true }
                            )}
                            &nbsp;
                            {coinBInfo?.simpleName}
                          </Typography>
                        </Typography>
                      )}
                    </Box>
                  </PopoverPure>
                </DetailWrapperStyled>
              )}

              {isAmm && (
                <DetailWrapperStyled>
                  <Typography
                    component={"span"}
                    color={"textSecondary"}
                    variant={"h6"}
                  >
                    {t("labelMiningMyShare")}
                  </Typography>
                  {myTotalAmmValueDollar ? (
                    <Typography
                      {...bindHover(popMyAmmValueState)}
                      component={"span"}
                      color={"textPrimary"}
                      variant={"h6"}
                      fontWeight={400}
                      style={{
                        borderBottom: myTotalAmmValueDollar
                          ? "1px dashed var(--color-text-primary)"
                          : "none",
                      }}
                    >
                      {currency === Currency.usd
                        ? PriceTag.Dollar +
                          getValuePrecisionThousand(
                            myTotalAmmValueDollar,
                            undefined,
                            undefined,
                            undefined,
                            false,
                            { isFait: true, floor: true }
                          )
                        : PriceTag.Yuan +
                          getValuePrecisionThousand(
                            myTotalAmmValueYuan,
                            undefined,
                            undefined,
                            undefined,
                            false,
                            { isFait: true, floor: true }
                          )}
                    </Typography>
                  ) : (
                    <Typography>{EmptyValueTag}</Typography>
                  )}

                  <PopoverPure
                    className={"arrow-top-center"}
                    {...bindPopper(popMyAmmValueState)}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "center",
                    }}
                    transformOrigin={{
                      vertical: "bottom",
                      horizontal: "center",
                    }}
                  >
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
                            <AvatarCoinStyled
                              imgx={coinAIcon.x}
                              imgy={coinAIcon.y}
                              imgheight={coinAIcon.h}
                              imgwidth={coinAIcon.w}
                              size={20}
                              variant="circular"
                              style={{ marginTop: 2 }}
                              alt={coinAInfo?.simpleName as string}
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
                            {coinAInfo?.simpleName}
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
                          {getValuePrecisionThousand(
                            myBalanceA,
                            precisionA,
                            2,
                            undefined,
                            false,
                            { floor: true }
                          )}
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
                            <AvatarCoinStyled
                              style={{ marginTop: 2 }}
                              imgx={coinBIcon.x}
                              imgy={coinBIcon.y}
                              imgheight={coinBIcon.h}
                              imgwidth={coinBIcon.w}
                              size={20}
                              variant="circular"
                              alt={coinBInfo?.simpleName as string}
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
                            {coinBInfo?.simpleName}
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
                          {getValuePrecisionThousand(
                            myBalanceB,
                            precisionB,
                            2,
                            undefined,
                            false,
                            { floor: true }
                          )}
                        </Typography>
                      </Typography>
                    </Box>
                  </PopoverPure>
                </DetailWrapperStyled>
              )}

              <DetailWrapperStyled>
                <Typography
                  component={"span"}
                  color={"textSecondary"}
                  variant={"h6"}
                >
                  {t("labelMiningMyReward")}
                </Typography>
                <Typography
                  onClick={myRewards ? handleMyRewardClick : undefined}
                  component={"span"}
                  color={"textPrimary"}
                  variant={"h6"}
                  fontWeight={400}
                >
                  {myRewards === 0
                    ? EmptyValueTag
                    : getValuePrecisionThousand(
                        myRewards,
                        undefined,
                        undefined,
                        undefined,
                        true,
                        { isFait: true, floor: true }
                      ) + rewardToken?.simpleName}
                </Typography>
              </DetailWrapperStyled>
            </CardContent>
            <CardActions>
              <CardActionBoxStyled
                width={"100%"}
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Button
                  fullWidth
                  variant={"contained"}
                  size={"large"}
                  disabled={!!isPass || isComing}
                  color={"primary"}
                  onClick={handleClick}
                >
                  {isAmm
                    ? t(
                        isPass
                          ? "labelEndLiquidityBtn"
                          : isComing
                          ? "labelComingSoon"
                          : "labelAddLiquidityBtn"
                      )
                    : t(
                        isPass
                          ? "labelEndLiquidityBtn"
                          : "labelMiningPlaceOrderBtn"
                      )}
                </Button>
                <ViewDetailStyled
                  onClick={() => handleViewDetail()}
                  component={"a"}
                  variant={"body1"}
                  color={"var(--color-text-secondary)"}
                  marginTop={1}
                >
                  {t("labelMiningViewDetails")}
                  &nbsp;
                  {">"}
                </ViewDetailStyled>
              </CardActionBoxStyled>
            </CardActions>
          </CardStyled>
        );
      }
    )
  )
) as <T>(props: AmmCardProps<T> & React.RefAttributes<any>) => JSX.Element;
