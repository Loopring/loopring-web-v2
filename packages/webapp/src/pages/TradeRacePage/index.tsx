import React from "react";
import { withTranslation, WithTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Box, Button, MenuItem, Typography } from "@mui/material";
import styled from "@emotion/styled";
import {
  TextField,
  TradeRacePanel,
  TradeRaceTable,
} from "@loopring-web/component-lib";
import { EVENT_STATUS, useTradeRace } from "./hook";
import { useAmmPool } from "../LiquidityPage/hook";
import { useAmmMiningUI } from "../MiningPage/hook";
import {
  CURRENT_EVENT_DATE,
  DropDownIcon,
  getValuePrecisionThousand,
} from "@loopring-web/common-resources";
import { LoadingBlock } from "../LoadingPage";
//@ts-ignore
import cssStyle from "./snow.css";
import moment from "moment";
import { volumeToCount } from "../../hooks/help";

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
  //
  ${cssStyle}
`;

const TableWrapperStyled = styled(Box)`
  background-color: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
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

export const TradeRacePage = withTranslation("common")(
  ({ t }: WithTranslation) => {
    const { search } = useLocation();
    const [currMarketPair, setCurrMarketPair] = React.useState("");
    const volumeToken = currMarketPair ? currMarketPair.split("-")[1] : "";
    const { ammActivityMap } = useAmmPool();
    const {
      eventData,
      history,
      countDown,
      currPairUserRank,
      currPairRankData,
      rewardToken,
      getAmmGameRank,
      getAmmGameUserRank,
      eventStatus,
    } = useTradeRace();
    const { volume, rank } = currPairUserRank || {};
    const userVolume = volume
      ? getValuePrecisionThousand(volumeToCount(volumeToken, volume))
      : "--";
    const { ammActivityViewMap } = useAmmMiningUI({ ammActivityMap });
    const filteredAmmViewMap = ammActivityViewMap
      .filter((o) => o.activity.ruleType === "SWAP_VOLUME_RANKING")
      .map((o) => `${o.coinAInfo.simpleName}-${o.coinBInfo.simpleName}`);

    const handleMarketPairChange = React.useCallback(
      (e: React.ChangeEvent<{ value: string }>) => {
        setCurrMarketPair(e.target.value);
        getAmmGameRank(e.target.value);
        getAmmGameUserRank(e.target.value);
        history.push(
          `/race-event/${CURRENT_EVENT_DATE}?pair=${e.target.value}`
        );
      },
      [setCurrMarketPair, getAmmGameUserRank, getAmmGameRank, history]
    );

    React.useEffect(() => {
      if (!currMarketPair && !!filteredAmmViewMap.length && !search) {
        setCurrMarketPair(filteredAmmViewMap[0]);
        getAmmGameUserRank(filteredAmmViewMap[0]);
        getAmmGameRank(filteredAmmViewMap[0]);
      }
    }, [
      currMarketPair,
      filteredAmmViewMap,
      getAmmGameUserRank,
      getAmmGameRank,
      search,
    ]);

    React.useEffect(() => {
      if (search) {
        const [_, pair] = search.split("=");
        setCurrMarketPair(pair);
        getAmmGameUserRank(pair);
        getAmmGameRank(pair);
      }
    }, [getAmmGameRank, getAmmGameUserRank, search]);
    const startDate = eventData
      ? moment.utc(eventData?.duration.startDate).format(`YYYY-MM-DD HH:mm:ss`)
      : "";
    const endDate = eventData
      ? moment.utc(eventData?.duration.endDate).format(`YYYY-MM-DD HH:mm:ss`)
      : "";
    /*remove: holiday only end*/
    const flakes = 160;
    const flake = React.useMemo(() => {
      return <div className={"flake"} />;
    }, []);
    const snows = new Array(flakes).fill(flake, 0, flakes);
    return (
      <>
        {eventData ? (
          <LayoutStyled marginY={4}>
            <div className={"snow"}>{snows.map((item) => item)}</div>
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
            <Typography marginBottom={2} paddingX={3} variant={"h5"}>
              {eventData.duration.prev}
              <Typography
                component={"time"}
                paddingX={1}
                variant={"h5"}
                dateTime={eventData.duration.startDate.toString()}
              >
                {startDate}
              </Typography>
              <Typography component={"span"} variant={"h5"}>
                {eventData.duration.to}
              </Typography>
              <Typography
                component={"time"}
                paddingX={1}
                variant={"h5"}
                dateTime={eventData.duration.endDate.toString()}
              >
                {endDate}
              </Typography>
              ({eventData.duration.timeZone})
            </Typography>

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
                    value={currMarketPair}
                    onChange={(event: React.ChangeEvent<{ value: string }>) => {
                      handleMarketPairChange(event);
                    }}
                    inputProps={{ IconComponent: DropDownIcon }}
                  >
                    {filteredAmmViewMap.map((market) => (
                      <MenuItem key={market} value={market}>
                        {market}
                      </MenuItem>
                    ))}
                  </StyledTextFiled>
                </BoxSelect>
                <Box
                  lineHeight={"24px"}
                  display={"flex"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Typography fontSize={16} marginRight={2}>
                    {t("labelTradeRaceYourVolume")} ({volumeToken}): {userVolume}
                  </Typography>
                  <Typography fontSize={16}>
                    {t("labelTradeRaceYourRanking")}: {rank || "--"}
                  </Typography>
                  <Button
                    style={{ fontSize: 16 }}
                    variant={"text"}
                    onClick={() =>
                      history.push(`/trade/lite/${currMarketPair}`)
                    }
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
            <Box
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
            <Box maxWidth={1200} width={"100%"} paddingX={3} marginTop={3}>
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
