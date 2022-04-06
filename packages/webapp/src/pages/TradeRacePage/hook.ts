import React from "react";
import { AmmPoolActivityRule } from "@loopring-web/loopring-sdk";
import { languageMap, myLog } from "@loopring-web/common-resources";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { EventData } from "./interface";
import { setInterval } from "timers";
import { useAmmActivityMap } from "../../stores/Amm/AmmActivityMap";
import moment from "moment";

const url_path = "https://static.loopring.io/events";

export enum EVENT_STATUS {
  EVENT_START = "labelTradeRaceStart",
  EVENT_READY = "labelTradeRaceReady",
  EVENT_END = "labelTradeRaceEnd",
}

export const useTradeRace = () => {
  const match: any = useRouteMatch("/race-event/:path");
  const { search, pathname } = useLocation();
  const searchParams = new URLSearchParams(search);
  const history = useHistory();
  const { activityDateMap } = useAmmActivityMap();
  const { i18n } = useTranslation();
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const [eventData, setEventData] = React.useState<EventData>();
  const [eventStatus, setEventStatus] =
    React.useState<EVENT_STATUS | undefined>();
  const [activityRule, setActivityRule] =
    React.useState<
      | AmmPoolActivityRule
      | undefined
      | {
          event_awardRules: {
            project: string;
            pair: string;
            reward: {
              count: number;
              token: string;
            };
          }[];
        }
    >();

  const [currMarketPair, setCurrMarketPair] = React.useState(
    () => searchParams.get("pair") ?? ""
  );
  const [duration, setDuration] =
    React.useState<
      | {
          startDate?: string;
          endDate?: string;
        }
      | undefined
    >();
  const [countDown, setCountDown] =
    React.useState<{
      days: undefined | string;
      hours: undefined | string;
      seconds: undefined | string;
      minutes: undefined | string;
    }>();
  const handleMarketPairChange = React.useCallback(
    (e: React.ChangeEvent<{ value: string }>) => {
      setCurrMarketPair(e.target.value);
      searchParams.set("pair", e.target.value);
      history.push(pathname + "?" + searchParams.toString());
    },
    []
  );

  React.useEffect(() => {
    if (match?.params.path && Reflect.ownKeys(activityDateMap).length) {
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
                history.replace("/race-event" + `?${searchParams.toString()}`);
              }
            })
            .then((input: EventData) => {
              let eventData: EventData;
              if (searchParams.get("type")) {
                eventData = input[searchParams.get("type") as string];
              } else {
                eventData = input;
              }
              myLog("useTradeRace eventData", eventData);

              if (
                eventData &&
                searchParams.get("type") &&
                [
                  "AMM_MINING",
                  "SWAP_VOLUME_RANKING",
                  "ORDERBOOK_MINING",
                ].includes(searchParams.get("type") ?? "") &&
                activityDateMap[eventData.duration.startDate]
              ) {
                setEventData(eventData);
                const activityRule =
                  activityDateMap[eventData.duration.startDate][
                    searchParams.get("type") as string
                  ];
                setActivityRule(activityRule);
                if (Reflect.ownKeys(activityRule).length) {
                  const rule: AmmPoolActivityRule =
                    activityRule[Reflect.ownKeys(activityRule)[0]];
                  setDuration(() => ({
                    startDate: moment(rule.rangeFrom).format(
                      `YYYY-MM-DD HH:mm:ss`
                    ),
                    endDate: moment(rule.rangeTo).format(`YYYY-MM-DD HH:mm:ss`),
                  }));
                  if (rule.rangeFrom > Date.now()) {
                    setEventStatus(EVENT_STATUS.EVENT_READY);
                  } else if (rule.rangeTo > Date.now()) {
                    setEventStatus(EVENT_STATUS.EVENT_START);
                  } else {
                    setEventStatus(EVENT_STATUS.EVENT_END);
                  }

                  if (!currMarketPair) {
                    setCurrMarketPair(
                      Reflect.ownKeys(activityRule)[0] as string
                    );
                  }
                }
              } else if (eventData && searchParams.get("type")) {
                setEventData(eventData);
                setDuration((duration) => ({
                  ...duration,
                  startDate:
                    moment
                      .utc(eventData.duration.startDate)
                      .format(`YYYY-MM-DD HH:mm:ss`) + "(UTC)",
                  endDate: eventData.duration.endDate
                    ? moment
                        .utc(eventData.duration.endDate)
                        .format(`YYYY-MM-DD HH:mm:ss`) + "(UTC)"
                    : undefined,
                }));
                // const activityRule =
                //   activityDateMap[eventData.duration.startDate][
                //     searchParams.get("type") as string
                //   ];
                setActivityRule({ event_awardRules: eventData.rewards });
                if (eventData.duration.startDate > Date.now()) {
                  setEventStatus(EVENT_STATUS.EVENT_READY);
                }
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
  }, [activityDateMap]);

  const scrollToRule = (event: React.MouseEvent<HTMLElement>) => {
    const anchor = (
      (event.target as HTMLElement).ownerDocument || document
    ).querySelector("#event-rule");

    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const calculateTimeLeft = React.useCallback(() => {
    if (activityRule && Reflect.ownKeys(activityRule).length && eventStatus) {
      const rule: AmmPoolActivityRule =
        activityRule[Reflect.ownKeys(activityRule)[0]];
      if (eventStatus === EVENT_STATUS.EVENT_READY) {
        let difference = +new Date(rule.rangeFrom) - Date.now();

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
        let difference = +new Date(rule.rangeTo) - Date.now();
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
  }, [activityRule, eventStatus]);
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
    currMarketPair,
    filteredAmmViewMap: [],
    countDown,
    handleMarketPairChange,
    searchParams,
    duration,
    scrollToRule,
    activityRule,
    eventStatus,
  };
};
