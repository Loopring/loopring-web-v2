import styled from "@emotion/styled";
import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { WithTranslation, withTranslation } from "react-i18next";
import {
  LoopringAPI,
  useAccount,
  useSystem,
  useTokenMap,
  useTokenPrices,
} from "@loopring-web/core";
import * as sdk from "@loopring-web/loopring-sdk";
import { EmptyDefault, useSettings } from "@loopring-web/component-lib";
import {
  CurrencyToTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  PriceTag,
  YEAR_DAY_MINUTE_FORMAT,
} from "@loopring-web/common-resources";
import moment from "moment";

const StylePaper = styled(Grid)`
  //width: 100%;
  //height: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;

export const RewardPanel = withTranslation(["common", "layout"])(
  ({ t }: WithTranslation) => {
    const {
      account: { accountId, accAddress, apiKey },
    } = useAccount();
    const { currency } = useSettings();
    const { tokenMap } = useTokenMap();
    const { forexMap } = useSystem();
    const { tokenPrices } = useTokenPrices();
    const [rewards, setRewards] = React.useState<{
      referralRewards: any[] | undefined;
      refereeRewards: any[] | undefined;
      totalReferral: string | undefined;
      totalReferee: string | undefined;
    }>({
      referralRewards: [],
      refereeRewards: [],
      totalReferral: undefined,
      totalReferee: undefined,
    });
    const getUserRewards = React.useCallback(async () => {
      if (LoopringAPI && LoopringAPI.userAPI && accountId) {
        Promise.all([
          LoopringAPI.userAPI.getUserRewards(
            {
              accountId: accountId,
              rewardType: sdk.REWARD_TYPE.ReferralRewards,
            },
            apiKey
          ),
          LoopringAPI.userAPI.getUserRewards(
            {
              accountId: accountId,
              rewardType: sdk.REWARD_TYPE.RefereeRewards,
            },
            apiKey
          ),
        ]).then(([response1, response2]) => {
          let totalReferral = sdk.toBig(0);
          let totalReferee = sdk.toBig(0);
          const LRCToken = tokenMap.LRC;
          const referralRewards = (response1?.raw_data as any)?.map(
            (item: any) => {
              const LRCToken = tokenMap.LRC;
              totalReferral = totalReferral.plus(item.reward);
              const dollar = sdk
                .toBig(item.reward)
                .div("1e" + LRCToken.decimals)
                .times(tokenPrices[LRCToken.symbol]);
              return {
                lrc: getValuePrecisionThousand(
                  sdk.toBig(item.reward).div("1e" + LRCToken.decimals),
                  LRCToken.precision,
                  LRCToken.precision,
                  undefined
                ),
                dollar: dollar.toString(),
                taker: item.taker,
                accountId: item.accountId,
                startAt: item.startAt,
              };
            }
          );
          const refereeRewards = (response2?.raw_data as any)?.map(
            (item: any) => {
              totalReferee = totalReferee.plus(item.reward);
              const dollar = sdk
                .toBig(item.reward)
                .div("1e" + LRCToken.decimals)
                .times(tokenPrices[LRCToken.symbol]);
              return {
                lrc: getValuePrecisionThousand(
                  sdk.toBig(item.reward).div("1e" + LRCToken.decimals),
                  LRCToken.precision,
                  LRCToken.precision,
                  undefined
                ),
                dollar: dollar.toString(),
                taker: item.taker,
                accountId: item.accountId,
                startAt: item.startAt,
              };
            }
          );
          setRewards({
            referralRewards,
            refereeRewards,
            totalReferral: totalReferral
              .div("1e" + LRCToken.decimals)
              .toString(),
            totalReferee: totalReferee.div("1e" + LRCToken.decimals).toString(),
          });
        });
      }
    }, [accAddress, accountId, apiKey]);

    React.useEffect(() => {
      getUserRewards();
    }, []);
    return (
      <Grid container spacing={2} textAlign={"center"} marginBottom={2}>
        <Grid paddingX={2} item xs={6} flex={1}>
          <StylePaper
            padding={2}
            className={"MuiPaper-elevation2"}
            flex={1}
            minHeight={480}
          >
            <Typography component={"h4"} variant={"h4"}>
              {t("labelRefereeRewards") +
                ": " +
                (rewards?.totalReferee && rewards?.totalReferee != "0"
                  ? getValuePrecisionThousand(
                      rewards.totalReferee,
                      tokenMap.LRC.precision,
                      tokenMap.LRC.precision,
                      undefined
                    ) + " LRC"
                  : EmptyValueTag)}
            </Typography>
            {!!rewards?.refereeRewards?.length ? (
              <>
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  marginTop={2}
                  flex={1}
                  justifyContent={"space-between"}
                >
                  <Typography
                    color={"textThird"}
                    variant={"body2"}
                    width={"30%"}
                  >
                    {t("labelDate")}
                  </Typography>
                  <Typography
                    color={"textThird"}
                    variant={"body2"}
                    width={"30%"}
                  >
                    {t("labelRewardLRC")}
                  </Typography>
                  <Typography
                    color={"textThird"}
                    variant={"body2"}
                    width={"30%"}
                  >
                    {t("labelPrice")}
                  </Typography>
                </Box>
                {(rewards.refereeRewards as any[]).map((item, index) => {
                  return (
                    <Box
                      key={index.toString()}
                      display={"flex"}
                      flexDirection={"row"}
                      marginTop={2}
                      flex={1}
                      justifyContent={"space-between"}
                    >
                      <Typography width={"30%"}>
                        {moment(new Date(item.startAt)).format(
                          YEAR_DAY_MINUTE_FORMAT
                        )}{" "}
                      </Typography>
                      <Typography width={"30%"}>
                        {item.lrc + " LRC"}{" "}
                      </Typography>
                      <Typography width={"30%"}>
                        {item.dollar
                          ? PriceTag[CurrencyToTag[currency]] +
                            getValuePrecisionThousand(
                              sdk
                                .toBig(item.dollar)
                                .times(forexMap[currency] ?? 0),
                              undefined,
                              undefined,
                              2,
                              true,
                              { isFait: true, floor: true }
                            )
                          : EmptyValueTag}
                      </Typography>
                    </Box>
                  );
                })}
              </>
            ) : (
              <EmptyDefault
                sx={{ flex: 1 }}
                height={"100%"}
                message={() => (
                  <Box
                    flex={1}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    {t("labelNoContent")}
                  </Box>
                )}
              />
            )}
          </StylePaper>
        </Grid>
        <Grid
          paddingX={2}
          className={"MuiPaper-elevation2"}
          item
          xs={6}
          flex={1}
        >
          <StylePaper
            padding={2}
            className={"MuiPaper-elevation2"}
            flex={1}
            minHeight={480}
          >
            <Typography component={"h4"} variant={"h4"}>
              {t("labelReferralRewards") +
                ": " +
                (rewards?.totalReferral && rewards.totalReferral != "0"
                  ? getValuePrecisionThousand(
                      rewards.totalReferral,
                      tokenMap.LRC.precision,
                      tokenMap.LRC.precision,
                      undefined
                    ) + " LRC"
                  : EmptyValueTag)}
            </Typography>
            {!!rewards?.referralRewards?.length ? (
              <>
                <Box
                  display={"flex"}
                  flexDirection={"row"}
                  marginTop={2}
                  flex={1}
                  justifyContent={"space-between"}
                >
                  <Typography
                    color={"textThird"}
                    variant={"body2"}
                    width={"30%"}
                  >
                    {t("labelDate")}
                  </Typography>
                  <Typography
                    color={"textThird"}
                    variant={"body2"}
                    width={"30%"}
                  >
                    {t("labelRewardLRC")}
                  </Typography>
                  <Typography
                    color={"textThird"}
                    variant={"body2"}
                    width={"30%"}
                  >
                    {t("labelPrice")}
                  </Typography>
                </Box>
                {(rewards.referralRewards as any[]).map((item, index) => {
                  return (
                    <Box
                      key={index.toString()}
                      display={"flex"}
                      flexDirection={"row"}
                      marginTop={2}
                      flex={1}
                      justifyContent={"space-between"}
                    >
                      <Typography width={"30%"}>
                        {moment(new Date(item.startAt)).format(
                          YEAR_DAY_MINUTE_FORMAT
                        )}{" "}
                      </Typography>
                      <Typography width={"30%"}>
                        {item.lrc + " LRC"}{" "}
                      </Typography>
                      <Typography width={"30%"}>
                        {item.dollar
                          ? PriceTag[CurrencyToTag[currency]] +
                            getValuePrecisionThousand(
                              sdk
                                .toBig(item.dollar)
                                .times(forexMap[currency] ?? 0),
                              undefined,
                              undefined,
                              2,
                              true,
                              { isFait: true, floor: true }
                            )
                          : EmptyValueTag}
                      </Typography>
                    </Box>
                  );
                })}
              </>
            ) : (
              <EmptyDefault
                sx={{ flex: 1 }}
                height={"100%"}
                message={() => (
                  <Box
                    flex={1}
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                  >
                    {t("labelNoContent")}
                  </Box>
                )}
              />
            )}
          </StylePaper>
        </Grid>
      </Grid>
    );
  }
);
