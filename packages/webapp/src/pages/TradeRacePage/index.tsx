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
import { useTradeRace } from "./hook";
import { useAmmPool } from "../LiquidityPage/hook";
import { useAmmMiningUI } from "../MiningPage/hook";
import { DropDownIcon, CURRENT_EVENT_DATE } from "@loopring-web/common-resources";
import { LoadingBlock } from "../LoadingPage";
import { useTheme } from "@emotion/react";
import moment from "moment";

const LayoutStyled = styled(Box)`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const TableWrapperStyled = styled(Box)`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 80%;
  max-width: 1200px;
  min-height: 650px;
  background-color: var(--color-box);
  border-radius: 0.4rem;
  margin-bottom: 2rem;
  padding: ${({ theme }: any) => theme.unit * 4}px;
`;

const ProjectWrapperStyled = styled(Box)`
  width: 80%;
  max-width: 1200px;
`;

const SelectWrapperStyled = styled(Box)`
  position: absolute;
  top: 3.2rem;
  right: 3.2rem;
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

export const TradeRacePage = withTranslation("common")(
  ({ t, i18n }: WithTranslation) => {
    const { search } = useLocation();
    const [currMarketPair, setCurrMarketPair] = React.useState("");
    const theme = useTheme();
    const { ammActivityMap } = useAmmPool();
    const {
      currPairUserRank,
      currPairRankData,
      getAmmGameRank,
      getAmmGameUserRank,
      eventData,
      history,
    } = useTradeRace();
    const { volume, rank } = currPairUserRank || {};
    const { ammActivityViewMap } = useAmmMiningUI({ ammActivityMap });
    const filteredAmmViewMap = ammActivityViewMap
      .filter((o) => o.activity.ruleType === "SWAP_VOLUME_RANKING")
      .map((o) => `${o.coinAInfo.simpleName}-${o.coinBInfo.simpleName}`);

    const handleMarketPairChange = React.useCallback(
      (e: React.ChangeEvent<{ value: string }>) => {
        setCurrMarketPair(e.target.value);
        getAmmGameRank(e.target.value);
        getAmmGameUserRank(e.target.value);
        history.push(`/race-event/${CURRENT_EVENT_DATE}?pair=${e.target.value}`)
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
    return (
      <>
        {eventData ? (
          <LayoutStyled marginY={4}>
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
              dangerouslySetInnerHTML={{ __html: eventData.subTitle }}
            ></Typography>

            <Typography
              marginTop={4}
              marginBottom={2}
              variant={"h5"}
              textAlign={"center"}
            >
              {eventData.duration.prev}
              <Typography
                component={"time"}
                paddingX={1}
                variant={"h5"}
                dateTime={eventData.duration.startDate}
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
                dateTime={eventData.duration.endDate}
              >
                {endDate}
              </Typography>
              ({eventData.duration.timeZone})
              {/*Activity Period: 2021/12/23 0:00 AM to 2021/12/30 0:00 AM (UTC)*/}
            </Typography>
            <TableWrapperStyled>
              <SelectWrapperStyled textAlign={"right"}>
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
              </SelectWrapperStyled>
              <Typography
                variant={"h2"}
                textAlign={"center"}
                marginTop={1}
                marginBottom={0}
              >
                · {t("labelTradeRaceRanking")} ·
              </Typography>
              <Box
                lineHeight={"24px"}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Typography fontSize={16} marginRight={2}>
                  {t("labelTradeRaceYourVolume")}: {volume || "--"}
                </Typography>
                <Typography fontSize={16}>
                  {t("labelTradeRaceYourRanking")}: {rank || "--"}
                </Typography>
                <Button
                  style={{ fontSize: 16 }}
                  variant={"text"}
                  onClick={() => history.push(`/trade/lite/${currMarketPair}`)}
                >
                  {t("labelTradeRaceGoTrading")} &gt;&gt;
                </Button>
              </Box>
              <TradeRaceTable {...{ t, rawData: currPairRankData }} />
            </TableWrapperStyled>
            <ProjectWrapperStyled>
              <Typography marginBottom={1} variant={"h4"}>
                {t("labelTradeRaceRewards")}
              </Typography>
              <Box width={"50%"} minWidth={600}>
                <TradeRacePanel rawData={eventData.rewards} />
              </Box>
            </ProjectWrapperStyled>
            <ProjectWrapperStyled marginTop={2}>
              <Typography marginBottom={2} variant={"h4"}>
                {t("labelTradeRaceRules")}
              </Typography>
              <ol
                style={{
                  listStyle: "dismal",
                  fontSize: theme.fontDefault.body1,
                  marginLeft: theme.unit * 2,
                }}
              >
                {eventData.rules.map((item, index) => (
                  <li key={index}>
                    <Typography
                      whiteSpace={"pre-line"}
                      component={"p"}
                      variant={"body1"}
                      marginBottom={2}
                      paddingLeft={1}
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  </li>
                ))}
              </ol>
            </ProjectWrapperStyled>
          </LayoutStyled>
        ) : (
          <LoadingBlock />
        )}
      </>
    );
  }
);
