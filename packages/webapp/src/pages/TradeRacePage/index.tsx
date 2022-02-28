import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { Box, Fab, Link, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { ScrollTop, TradeRacePanel } from "@loopring-web/component-lib";
import { EVENT_STATUS, useTradeRace } from "./hook";
import {
  EmptyValueTag,
  GoTopIcon,
  MarketType,
} from "@loopring-web/common-resources";
import { LoadingBlock } from "../LoadingPage";
//@ts-ignore
// import cssStyle from "./snow.css";
import { RuleType } from "@loopring-web/loopring-sdk";
import { Rank } from "./rank";

const LayoutStyled = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  ol {
    list-style: dismal;
    font-size: ${({ theme }) => theme.fontDefault.body1};
    margin-left: ${({ theme }) => theme.unit * 2}px;

    li {
      color: var(--color-text-secondary);
    }

    li ::marker {
      content: counter(list-item) " )";
      color: var(--color-text-secondary);
    }
  }

  .hours,
  .minutes {
    position: relative;

    span:after {
      display: block;
      content: ":";
      position: absolute;
      right: -8px;
      top: 0;
    }
  }
`;
// ${cssStyle}

export const TradeRacePage = withTranslation("common")(
  ({ t }: WithTranslation) => {
    const {
      activityRule,
      searchParams,
      eventData,
      countDown,
      eventStatus,
      scrollToRule,
      currMarketPair,
      duration,
      handleMarketPairChange,
    } = useTradeRace();
    /*remove: holiday only end*/
    const flakes = 160;
    const flake = React.useMemo(() => {
      return <div className={"flake"} />;
    }, []);
    const anchorRef = React.useRef();
    const snows = new Array(flakes).fill(flake, 0, flakes);
    return (
      <>
        <ScrollTop>
          <Fab color="primary" size={"large"} aria-label="scroll back to top">
            <GoTopIcon htmlColor={"var(--color-text-button)"} />
          </Fab>
        </ScrollTop>
        {eventData ? (
          <LayoutStyled marginY={4}>
            <div className={"snow"}>
              {snows.map((item, index) => (
                <React.Fragment key={index}>{item}</React.Fragment>
              ))}
            </div>
            {/*remove: holiday only end*/}
            <Typography
              marginY={1}
              component={"h1"}
              variant={"h1"}
              whiteSpace={"pre-line"}
              textAlign={"center"}
              dangerouslySetInnerHTML={{ __html: eventData.eventTitle }}
            />

            <Typography
              component={"h2"}
              variant={"h2"}
              whiteSpace={"pre-line"}
              textAlign={"center"}
              marginBottom={4}
              dangerouslySetInnerHTML={{ __html: eventData.subTitle }}
            />

            {eventStatus && (
              <Box
                component={"section"}
                paddingX={3}
                marginBottom={4}
                textAlign={"center"}
              >
                <Typography
                  component={"h2"}
                  variant={"h4"}
                  marginBottom={2}
                  color={"var(--color-text-secondary)"}
                >
                  {t(eventStatus)}
                </Typography>
                {eventStatus !== EVENT_STATUS.EVENT_END && (
                  <Box
                    display={"flex"}
                    flexDirection={"row"}
                    alignItems={"center"}
                  >
                    <Box
                      className={"day"}
                      display={"flex"}
                      flexDirection={"column"}
                      minWidth={86}
                      alignItems={"center"}
                      marginRight={2}
                    >
                      <Typography
                        variant={"h2"}
                        component={"span"}
                        color={"var(--color-text-primary)"}
                      >
                        {countDown?.days}
                      </Typography>
                      <Typography
                        variant={"h4"}
                        color={"var(--color-text-secondary)"}
                        marginTop={1}
                        style={{ textTransform: "uppercase" }}
                      >
                        {t("labelDay")}
                      </Typography>
                    </Box>
                    <Box
                      className={"hours"}
                      display={"flex"}
                      minWidth={86}
                      flexDirection={"column"}
                      alignItems={"center"}
                      marginRight={2}
                    >
                      <Typography
                        variant={"h2"}
                        component={"span"}
                        color={"var(--color-text-primary)"}
                      >
                        {countDown?.hours}
                      </Typography>
                      <Typography
                        variant={"h4"}
                        color={"var(--color-text-secondary)"}
                        marginTop={1}
                        style={{ textTransform: "uppercase" }}
                      >
                        {t("labelHours")}
                      </Typography>
                    </Box>
                    <Box
                      className={"minutes"}
                      display={"flex"}
                      minWidth={86}
                      flexDirection={"column"}
                      alignItems={"center"}
                      marginRight={2}
                    >
                      <Typography
                        variant={"h2"}
                        component={"span"}
                        color={"var(--color-text-primary)"}
                      >
                        {countDown?.minutes}
                      </Typography>
                      <Typography
                        variant={"h4"}
                        color={"var(--color-text-secondary)"}
                        marginTop={1}
                        style={{ textTransform: "uppercase" }}
                      >
                        {t("labelMinutes")}
                      </Typography>
                    </Box>
                    <Box
                      className={"secondary"}
                      display={"flex"}
                      minWidth={86}
                      flexDirection={"column"}
                      alignItems={"center"}
                      marginRight={2}
                    >
                      <Typography
                        variant={"h2"}
                        component={"span"}
                        color={"var(--color-text-primary)"}
                      >
                        {countDown?.seconds}
                      </Typography>
                      <Typography
                        variant={"h4"}
                        color={"var(--color-text-secondary)"}
                        marginTop={1}
                        style={{ textTransform: "uppercase" }}
                      >
                        {t("labelSeconds")}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
            {duration && (
              <Typography marginBottom={2} paddingX={3} variant={"body1"}>
                {eventData?.duration?.prev}
                <Typography
                  component={"time"}
                  paddingX={1}
                  variant={"h5"}
                  dateTime={duration.startDate}
                >
                  {duration.startDate}
                </Typography>
                <Typography component={"span"} variant={"h5"}>
                  {eventData?.duration?.middle}
                </Typography>
                <Typography
                  component={"time"}
                  paddingX={1}
                  variant={"h5"}
                  dateTime={duration.endDate}
                >
                  {duration.endDate ? duration.endDate : EmptyValueTag}
                </Typography>
                {eventData?.duration?.end}
                <Typography marginLeft={1} component={"span"}>
                  <Link onClick={(e) => scrollToRule(e)}>
                    {t("labelTradeReadRule")}
                  </Link>
                </Typography>
              </Typography>
            )}
            {activityRule &&
              searchParams.get("type") &&
              [
                RuleType.SWAP_VOLUME_RANKING,
                RuleType.ORDERBOOK_MINING,
              ].includes(searchParams.get("type") as RuleType) &&
              eventStatus &&
              [EVENT_STATUS.EVENT_START, EVENT_STATUS.EVENT_END].includes(
                eventStatus
              ) &&
              !searchParams.has("rule") && (
                <Rank
                  handleMarketPairChange={handleMarketPairChange}
                  activityRule={activityRule}
                  pair={currMarketPair as MarketType}
                />
              )}

            <Box
              ref={anchorRef}
              maxWidth={1200}
              width={"100%"}
              paddingX={3}
              marginX={"auto"}
              alignSelf={"self-start"}
              marginTop={3}
            >
              <Typography
                marginBottom={1}
                variant={"h4"}
                color={"var(--color-text-secondary)"}
              >
                {t("labelTradeRaceRewards")}
              </Typography>
              <TradeRacePanel rawData={eventData.rewards} />
            </Box>
            <Box
              maxWidth={1200}
              width={"100%"}
              paddingX={3}
              marginTop={3}
              id={"event-rule"}
            >
              <Box>
                <Typography
                  marginBottom={2}
                  variant={"h4"}
                  color={"var(--color-text-secondary)"}
                >
                  {t("labelTradeRaceRules")}
                </Typography>
                <ol>
                  {eventData.rules.map((item, index) => (
                    <li key={index}>
                      <Typography
                        whiteSpace={"pre-line"}
                        color={"inherit"}
                        component={"p"}
                        variant={"body1"}
                        marginBottom={2}
                        paddingLeft={1}
                        dangerouslySetInnerHTML={{ __html: item }}
                      />
                    </li>
                  ))}
                </ol>
              </Box>
            </Box>
          </LayoutStyled>
        ) : (
          <LoadingBlock />
        )}
      </>
    );
  }
);
