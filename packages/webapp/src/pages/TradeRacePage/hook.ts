import React from "react";
import { LoopringAPI } from "api_wrapper";
import { useAccount } from "stores/account";
import { GameRankInfo } from "@loopring-web/loopring-sdk";
import { volumeToCount, getTokenNameFromTokenId } from "hooks/help";
import { getValuePrecisionThousand } from "@loopring-web/common-resources";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EventData } from "./interface";

const url_path = "https://static.loopring.io/events";
enum languageMap {
  en_US = "en",
}
export const useTradeRace = () => {
  const {
    account: { apiKey, accAddress },
  } = useAccount();
  const { i18n } = useTranslation();
  const [currPairRankData, setCurrPairRankData] = React.useState<
    GameRankInfo[]
  >([]);
  const [currPairUserRank, setCurrPairUserRank] = React.useState<GameRankInfo>({
    address: "",
    volume: "",
    rank: 0,
    rewards: [],
  });
  const match: any = useRouteMatch("/race-event/:path");
  const [eventData, setEventData] = React.useState<EventData>();
  const history = useHistory();

  const getAmmGameRank = React.useCallback(async (market: string) => {
    if (LoopringAPI && LoopringAPI.ammpoolAPI) {
      const [coinBase, coinQuote] = market.split("-");
      const { userRankList } = await LoopringAPI.ammpoolAPI.getAmmPoolGameRank({
        ammPoolMarket: market,
      });
      const formattedUserRankList = userRankList.map((o) => ({
        ...o,
        tradeVolume: getValuePrecisionThousand(
          volumeToCount(coinQuote, o.volume)
        ),
        profit: getValuePrecisionThousand(
          volumeToCount(
            getTokenNameFromTokenId(Number(o.rewards[0].tokenId)),
            o.rewards[0].volume
          )
        ),
      }));
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
              owner: accAddress,
            },
            apiKey
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
    [accAddress, apiKey]
  );
  React.useEffect(() => {
    if (match?.params.path) {
      try {
        // follow /2021/01/2021-01-01.en.json

        const [year, month, day] = match?.params.path.split("-");
        if (year && month && day) {
          fetch(
            url_path +
              `/${year}/${month}/${year}-${month}-${day}.${
                languageMap[i18n.language]
              }.json`
          )
            .then((response) => {
              if (response.ok) {
                return response.json();
              } else {
                history.push("/race-event");
              }
            })
            .then((input) => {
              setEventData(input as EventData);
            })
            .catch((e) => {
              history.push("/race-event");
            });
        } else {
          history.push("/race-event");
        }
      } catch (e: any) {
        history.push("/race-event");
      }
    }
  }, []);

  return {
    eventData,
    history,
    currPairUserRank,
    currPairRankData,
    getAmmGameRank,
    getAmmGameUserRank,
  };
};
