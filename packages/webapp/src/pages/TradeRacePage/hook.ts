import React from "react";
import { LoopringAPI } from "api_wrapper";
import { useAccount } from "stores/account";
import { GameRankInfo } from "@loopring-web/loopring-sdk";
import { getTokenNameFromTokenId, volumeToCount } from "hooks/help";
import { getValuePrecisionThousand, myLog } from "@loopring-web/common-resources";
import { useHistory, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EventData } from "./interface";
import { setInterval } from "timers";

const url_path = "https://static.loopring.io/events";

enum languageMap {
  en_US = "en",
}

export enum EVENT_STATUS {
  EVENT_START = "labelTradeRaceStart",
  EVENT_READY = "labelTradeRaceReady",
  EVENT_END = "labelTradeRaceEnd",
}

export const useTradeRace = () => {
  const {
    account: { apiKey, accAddress },
  } = useAccount();
  const { i18n } = useTranslation();
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const [currPairRankData, setCurrPairRankData] = React.useState<
    GameRankInfo[]
  >([]);
  const [rewardToken, setRewardToken] = React.useState("");
  const [currPairUserRank, setCurrPairUserRank] = React.useState<GameRankInfo>({
    address: "",
    volume: "",
    rank: 0,
    rewards: [],
  });
  const match: any = useRouteMatch("/race-event/:path");
  const [eventData, setEventData] = React.useState<EventData>();
  const [eventStatus, setEventStatus] = React.useState<
    EVENT_STATUS | undefined
  >();
  const [countDown, setCountDown] = React.useState<{
    days: undefined | string;
    hours: undefined | string;
    seconds: undefined | string;
    minutes: undefined | string;
  }>();

  const history = useHistory();
  // const now = Date.now();
  const getAmmGameRank = React.useCallback(async (market: string) => {
    if (LoopringAPI && LoopringAPI.ammpoolAPI) {
      const [, coinQuote] = market.split("-");
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
            .then((input: EventData) => {
              setEventData(input);
              if (input.duration.startDate > Date.now()) {
                setEventStatus(EVENT_STATUS.EVENT_READY);
              } else if (input.duration.endDate > Date.now()) {
                setEventStatus(EVENT_STATUS.EVENT_START);
              } else {
                setEventStatus(EVENT_STATUS.EVENT_END);
              }
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
  const calculateTimeLeft = React.useCallback(() => {
    if (eventData && eventStatus) {
      if (eventStatus === EVENT_STATUS.EVENT_READY) {
        let difference = +new Date(eventData.duration.startDate) - Date.now();

        setCountDown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString(),
          hours: (
            "0" + Math.floor((difference / (1000 * 60 * 60)) % 24).toString()
          ).slice(-2),
          minutes: (
            "0" + Math.floor((difference / 1000 / 60) % 60).toString()
          ).slice(-2),
          seconds: (
            "0" + Math.floor((difference / 1000) % 60).toString()
          ).slice(-2),
        });
      } else if (eventStatus === EVENT_STATUS.EVENT_START) {
        let difference = +new Date(eventData.duration.endDate) - Date.now();
        setCountDown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString(),
          hours: (
            "0" + Math.floor((difference / (1000 * 60 * 60)) % 24).toString()
          ).slice(-2),
          minutes: (
            "0" + Math.floor((difference / 1000 / 60) % 60).toString()
          ).slice(-2),
          seconds: (
            "0" + Math.floor((difference / 1000) % 60).toString()
          ).slice(-2),
        });
      }
    }
  }, [eventData, eventStatus]);
  React.useEffect(() => {
    if (eventStatus) {
      if (nodeTimer.current !== -1) {
        clearInterval(nodeTimer.current as NodeJS.Timeout);
      }
      nodeTimer.current = setInterval(calculateTimeLeft, 1000);
    }
    return () => {
      if (nodeTimer.current !== -1) {
        clearInterval(nodeTimer.current as NodeJS.Timeout);
      }
    };
  }, [eventStatus]);
  return {
    eventData,
    history,
    countDown,
    currPairUserRank,
    currPairRankData,
    rewardToken,
    getAmmGameRank,
    getAmmGameUserRank,
    eventStatus,
  };
};
