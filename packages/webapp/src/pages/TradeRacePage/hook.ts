import React from "react";
import { languageMap, myLog } from "@loopring-web/common-resources";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Config_INFO_URL, EventData, url_path } from "./interface";
import { setInterval } from "timers";
import { useSystem } from "@loopring-web/core";
import moment from "moment";

export enum EVENT_STATUS {
  EVENT_START = "labelTradeRaceStart",
  EVENT_READY = "labelTradeRaceReady",
  EVENT_END = "labelTradeRaceEnd",
}

export const useTradeRace = () => {
  const match: any = useRouteMatch("/race-event/:path");
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const { i18n } = useTranslation();
  const { baseURL } = useSystem();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);
  const history = useHistory();

  const [eventData, setEventData] = React.useState<EventData>();
  const [eventStatus, setEventStatus] =
    React.useState<EVENT_STATUS | undefined>();

  const [countDown, setCountDown] =
    React.useState<{
      days: undefined | string;
      hours: undefined | string;
      seconds: undefined | string;
      minutes: undefined | string;
    }>();

  React.useEffect(() => {
    if (baseURL) {
      try {
        // follow /2021/01/2021-01-01.en.json
        const [year, month, day] = match?.params.path.split("-");
        const type = searchParams.get("type");
        const path = `/${year}/${month}/`;
        if (year && month && day && type) {
          fetch(
            `${url_path}/${path}/${year}-${month}-${day}.${
              languageMap[i18n.language]
            }.json`
          )
            .then((response) => {
              if (response.ok) {
                return response.json();
              } else {
                history.replace(`/race-event?${searchParams.toString()}`);
              }
            })
            .then((input: { [key: string]: EventData }) => input[type])
            .then(async (eventData: EventData) => {
              myLog("useTradeRace eventData", eventData);
              const startUnix = moment(
                eventData.duration.startDate,
                "DD/MM/YYYY HH:mm:ss"
              ).unix();
              const endUnix = moment(
                eventData.duration.endDate,
                "DD/MM/YYYY HH:mm:ss"
              ).unix();
              if (startUnix > Date.now()) {
                setEventStatus(EVENT_STATUS.EVENT_READY);
              }
              const config = await Promise.all([
                fetch(
                  `${baseURL}/${Config_INFO_URL}?version=${eventData.api?.version}`
                ),
                fetch(`${url_path}/${path}/` + eventData.rule)
                  .then((response) => response.text())
                  .then((input) => {
                    return input;
                  })
                  .catch(() => {
                    return "";
                  }),
              ]);
              setEventData({
                ...eventData,
                duration: {
                  ...eventData.duration,
                  startDate: startUnix,
                  endDate: endUnix,
                },
                ruleMarkdown: config[1],
                api: {
                  ...eventData.api,
                  ...config[0],
                },
              });
            })
            .catch((e) => {
              throw e;
            });
        } else {
          throw "url format wrong";
        }
      } catch (e: any) {
        myLog(e?.message);
        history.push("/race-event");
      }
    }
  }, [baseURL]);

  const scrollToRule = (event: React.MouseEvent<HTMLElement>) => {
    const anchor = (
      (event.target as HTMLElement).ownerDocument || document
    ).querySelector("#event-rule");

    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

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
    // selected,
    // currMarketPair,
    filteredAmmViewMap: [],
    countDown,
    // handleFilterChange,
    searchParams,
    // onChange,
    // duration,
    scrollToRule,
    // activityRule,
    eventStatus,
  };
};
