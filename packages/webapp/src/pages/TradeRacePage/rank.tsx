import { useTranslation } from "react-i18next";
import React from "react";
import { LoopringAPI } from "../../api_wrapper";
import { getTokenNameFromTokenId, volumeToCount } from "../../hooks/help";
import {
  AccountStatus,
  AMMMarketType,
  DropDownIcon,
  getValuePrecisionThousand,
  MarketType,
} from "@loopring-web/common-resources";
import { Box, Button, MenuItem, Typography } from "@mui/material";
import { TextField, TradeRaceTable } from "@loopring-web/component-lib";
import styled from "@emotion/styled";
import { useAccount } from "../../stores/account";
import { AmmPoolActivityRule, GameRankInfo } from "@loopring-web/loopring-sdk";
import { useHistory, useLocation } from "react-router-dom";

const TableWrapperStyled = styled(Box)`
  background-color: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`;
const BoxSelect = styled(Box)`
  position: absolute;
  text-align: right;
  top: ${({ theme }) => 3 * theme.unit}px;
  right: ${({ theme }) => 3 * theme.unit}px;
  @media only screen and (max-width: 720px) {
    position: initial;
    text-align: center;
  }
`;

const StyledTextFiled = styled(TextField)`
  &.MuiTextField-root {
    max-width: initial;
  }

  .MuiInputBase-root {
    width: initial;
    max-width: initial;
  }
`;
export const Rank = ({
  activityRule,
  handleMarketPairChange,
  pair = "",
}: {
  activityRule: AmmPoolActivityRule;
  handleMarketPairChange: (event: React.ChangeEvent<{ value: string }>) => void;
  pair: MarketType | "";
}) => {
  const { t } = useTranslation();
  const { account } = useAccount();
  const history = useHistory();
  const [rewardToken, setRewardToken] = React.useState("");
  const [currPairUserRank, setCurrPairUserRank] = React.useState<GameRankInfo>({
    address: "",
    volume: "",
    rank: 0,
    rewards: [],
  });
  const [volumeToken, setVolumeToken] = React.useState<string>(() => {
    if (pair && pair !== "") {
      // @ts-ignore
      const [, , coinQuote] = pair?.replace("AMM-", "").match(/(\w+)-(\w+)/i);
      return coinQuote;
    }
    return "";
  });
  const [currPairRankData, setCurrPairRankData] = React.useState<
    GameRankInfo[]
  >([]);

  const getAmmGameRank = React.useCallback(async (market: MarketType) => {
    if (LoopringAPI && LoopringAPI.ammpoolAPI && market) {
      const [, , coinQuote] = market.replace("AMM-", "").match(/(\w+)-(\w+)/i);
      const { userRankList, totalRewards } =
        await LoopringAPI.ammpoolAPI.getAmmPoolGameRank({
          ammPoolMarket: market,
        });
      const profitToken = getTokenNameFromTokenId(
        Number(totalRewards[0].tokenId)
      );
      const formattedUserRankList = userRankList.map((o) => ({
        ...o,
        tradeVolume: getValuePrecisionThousand(
          volumeToCount(coinQuote, o.volume)
        ),
        profit: getValuePrecisionThousand(
          volumeToCount(profitToken, o.rewards[0].volume)
        ),
      }));
      setVolumeToken(coinQuote);
      setRewardToken(profitToken);
      setCurrPairRankData(formattedUserRankList);
    }
  }, []);

  const getAmmGameUserRank = React.useCallback(
    async (market: string) => {
      if (LoopringAPI && LoopringAPI.ammpoolAPI) {
        const { userRank } =
          await LoopringAPI.ammpoolAPI.getAmmPoolGameUserRank(
            {
              ammPoolMarket: market,
              owner: account.accAddress,
            },
            account.apiKey
          );
        setCurrPairUserRank(
          userRank || {
            address: "",
            volume: "",
            rank: 0,
            rewards: [],
          }
        );
      }
    },
    [account.accAddress, account.apiKey]
  );
  React.useEffect(() => {
    if (pair) {
      getAmmGameRank(pair);
    }
  }, [pair]);
  React.useEffect(() => {
    if (pair && account.readyState === AccountStatus.ACTIVATED) {
      getAmmGameUserRank(pair);
    }
  }, [pair, account.readyState]);

  return (
    <>
      <Box
        maxWidth={1200}
        width={"100%"}
        paddingX={3}
        marginX={"auto"}
        alignSelf={"self-start"}
      >
        <TableWrapperStyled paddingY={3} position={"relative"}>
          <Typography
            variant={"h2"}
            color={"var(--color-text-secondary)"}
            textAlign={"center"}
            marginBottom={1}
          >
            · {t("labelTradeRaceRanking")} ·
          </Typography>
          <BoxSelect>
            <StyledTextFiled
              id={"trading-race-market-pair"}
              select
              style={{ width: 150, textAlign: "left" }}
              value={pair}
              onChange={(event: React.ChangeEvent<{ value: string }>) => {
                handleMarketPairChange(event);
              }}
              inputProps={{ IconComponent: DropDownIcon }}
            >
              {Reflect.ownKeys(activityRule).map((market, index) => (
                <MenuItem
                  key={market.toString() + index}
                  value={market.toString()}
                >
                  {market}
                </MenuItem>
              ))}
            </StyledTextFiled>
          </BoxSelect>
          <Box display={"flex"} justifyContent={"center"} alignItems={"center"}>
            <Typography fontSize={16} marginRight={2}>
              {t("labelTradeRaceYourVolume")} ({volumeToken}):
              {currPairUserRank.volume
                ? getValuePrecisionThousand(
                    volumeToCount(volumeToken, currPairUserRank.volume)
                  )
                : "--"}
            </Typography>
            <Typography fontSize={16}>
              {t("labelTradeRaceYourRanking")}: {currPairUserRank.rank || "--"}
            </Typography>
            <Button
              style={{ fontSize: 16 }}
              variant={"text"}
              onClick={() => history.push(`/trade/lite/${pair}`)}
            >
              {t("labelTradeRaceGoTrading")} &gt;&gt;
            </Button>
          </Box>
          <TradeRaceTable
            {...{
              t,
              rawData: currPairRankData,
              volumeToken,
              rewardToken,
            }}
          />
        </TableWrapperStyled>
      </Box>
    </>
  );
};

// export const RankEvent = ({
//   event_awardRules,
// }: {
//   event_awardRules: {
//     project: string;
//     pair: string;
//     reward: {
//       count: number;
//       token: string;
//     };
//   };
// }) => {
//   return (
//     <>
//       <Box
//         maxWidth={1200}
//         width={"100%"}
//         paddingX={3}
//         marginX={"auto"}
//         alignSelf={"self-start"}
//       >
//         <TableWrapperStyled paddingY={3} position={"relative"}>
//           <Typography
//             variant={"h2"}
//             color={"var(--color-text-secondary)"}
//             textAlign={"center"}
//             marginBottom={1}
//           >
//             · {t("labelTradeRaceRanking")} ·
//           </Typography>
//           <BoxSelect>
//             <StyledTextFiled
//               id={"trading-race-market-pair"}
//               select
//               style={{ width: 150, textAlign: "left" }}
//               value={pair}
//               onChange={(event: React.ChangeEvent<{ value: string }>) => {
//                 handleMarketPairChange(event);
//               }}
//               inputProps={{ IconComponent: DropDownIcon }}
//             >
//               {Reflect.ownKeys(activityRule).map((market, index) => (
//                 <MenuItem
//                   key={market.toString() + index}
//                   value={market.toString()}
//                 >
//                   {market}
//                 </MenuItem>
//               ))}
//             </StyledTextFiled>
//           </BoxSelect>
//           <Box display={"flex"} justifyContent={"center"} alignItems={"center"}>
//             <Typography fontSize={16} marginRight={2}>
//               {t("labelTradeRaceYourVolume")} ({volumeToken}):
//               {currPairUserRank.volume
//                 ? getValuePrecisionThousand(
//                     volumeToCount(volumeToken, currPairUserRank.volume)
//                   )
//                 : "--"}
//             </Typography>
//             <Typography fontSize={16}>
//               {t("labelTradeRaceYourRanking")}: {currPairUserRank.rank || "--"}
//             </Typography>
//             <Button
//               style={{ fontSize: 16 }}
//               variant={"text"}
//               onClick={() => history.push(`/trade/lite/${pair}`)}
//             >
//               {t("labelTradeRaceGoTrading")} &gt;&gt;
//             </Button>
//           </Box>
//           <TradeRaceTable
//             {...{
//               t,
//               rawData: currPairRankData,
//               volumeToken,
//               rewardToken,
//             }}
//           />
//         </TableWrapperStyled>
//       </Box>
//     </>
//   );
// };
