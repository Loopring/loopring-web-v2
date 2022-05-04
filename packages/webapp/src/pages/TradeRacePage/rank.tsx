import { useTranslation } from "react-i18next";
import React from "react";
import { LoopringAPI } from "../../api_wrapper";
import { getTokenNameFromTokenId, volumeToCount } from "../../hooks/help";
import {
  // AccountStatus,
  DropDownIcon,
  getShortAddr,
  getValuePrecisionThousand,
  MarketType,
  RowConfig,
  SoursURL,
} from "@loopring-web/common-resources";
import { Box, Link, MenuItem, Typography } from "@mui/material";
import {
  Column,
  InputSearch,
  Table,
  TablePaddingX,
  TextField,
  TradeRaceTable,
  useSettings,
} from "@loopring-web/component-lib";
import styled from "@emotion/styled";
import * as sdk from "@loopring-web/loopring-sdk";
import { useHistory, useLocation, useRouteMatch } from "react-router-dom";
import { useSystem } from "stores/system";
import { ChainId } from "@loopring-web/loopring-sdk";
import { EventAPI } from "./interface";
import store from "stores";

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
  activityRule: sdk.AmmPoolActivityRule;
  handleMarketPairChange: (event: React.ChangeEvent<{ value: string }>) => void;
  pair: MarketType | "";
}) => {
  const { t } = useTranslation();
  const { search } = useLocation();
  const { isMobile } = useSettings();
  const searchParams = new URLSearchParams(search);
  const account = {
    owner: searchParams.get("owner") ?? "",
    accountId: searchParams.get("accountId"),
  };
  const history = useHistory();
  const [rewardToken, setRewardToken] = React.useState("");
  const [currPairUserRank, setCurrPairUserRank] =
    React.useState<sdk.GameRankInfo>({
      address: "",
      volume: "",
      rank: 0,
      rewards: [],
    });
  const [volumeToken, setVolumeToken] = React.useState<string>(() => {
    if (pair && !!pair) {
      // @ts-ignore
      const [, , coinQuote] = pair?.replace("AMM-", "").match(/(\w+)-(\w+)/i);
      return coinQuote;
    }
    return "";
  });
  const [currPairRankData, setCurrPairRankData] = React.useState<
    sdk.GameRankInfo[]
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
      if (LoopringAPI && LoopringAPI.globalAPI && !!account.owner) {
        const { userRank } = await LoopringAPI.globalAPI.getAmmPoolGameUserRank(
          {
            ammPoolMarket: market,
            owner: account.owner,
          }
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
    [account.owner]
  );
  React.useEffect(() => {
    if (pair) {
      getAmmGameRank(pair);
    }
  }, [getAmmGameRank, pair]);
  React.useEffect(() => {
    if (pair && account.owner) {
      getAmmGameUserRank(pair);
    }
  }, [account.owner, pair]);

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
            variant={isMobile ? "h4" : "h2"}
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
          <Box
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            flexDirection={isMobile ? "column" : "row"}
          >
            <Typography variant={"h5"} marginRight={2}>
              {t("labelTradeRaceYourVolume")} ({volumeToken}):
              {currPairUserRank.volume
                ? getValuePrecisionThousand(
                    volumeToCount(volumeToken, currPairUserRank.volume)
                  )
                : "--"}
            </Typography>
            <Typography variant={"h5"}>
              {t("labelTradeRaceYourRanking")}: {currPairUserRank.rank || "--"}
            </Typography>
            <Link
              variant={"h5"}
              target="_blank"
              rel="noopener noreferrer"
              href={`/trade/lite/${pair}`}
            >
              {t("labelTradeRaceGoTrading")} &gt;&gt;
            </Link>
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
const TableStyled = styled(Box)<{ height: number | undefined | string }>`
  display: flex;
  flex-direction: column;
  .rdg {
    height: auto;
  }
  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as typeof Box;

export const RankRaw = <R extends any>(props: EventAPI) => {
  const [rank, setRank] = React.useState<R[]>([]);
  const [rankView, setRankView] = React.useState<R[]>([]);
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [showLoading, setShowLoading] = React.useState(true);
  const { params } = useRouteMatch();
  const [filter, setFilter] = React.useState<
    | {
        value: string;
        key: string;
        list: Array<{ label: string; value: string }>;
      }
    | undefined
  >(() => {
    let value,
      list = [];
    if (props.params && props.params.key) {
      list = props.params.values.map((item) => {
        try {
          const state = store.getState();
          return { label: item.label, value: eval(item.value) };
        } catch (error) {
          console.log("eval error", error);
          return { label: item.label, value: item.value };
        }
      });
      value = list[0].value;
      if (params) {
        value =
          list.find(
            (item) => props.params && item.label == params[props.params.key]
          )?.value ?? value;
      }
      return {
        value,
        list,
        key: props.params.key,
      };
    } else {
      return undefined;
    }
  });
  const { chainId } = useSystem();

  React.useEffect(() => {
    if (searchValue !== "" && rank.length) {
      setRankView((state) =>
        rank.filter((item: any) => {
          if (searchValue.startsWith("0x")) {
            const regx = new RegExp(searchValue.toLowerCase(), "ig");
            return regx.test(item?.address);
          } else {
            const regx = new RegExp(searchValue.toLowerCase(), "ig");
            return regx.test(item?.address) || regx.test(item?.accountId);
          }
        })
      );
    } else if (rank.length) {
      setRankView(rank);
    }
  }, [rank, searchValue]);
  const onChange = (event: React.ChangeEvent<{ value: string }>) => {
    if (event.target.value) {
      setFilter((state) => ({ ...state, value: event.target.value } as any));
    }
  };

  const defaultArgs: any = {
    columnMode: props.column.length
      ? props.column.map((item, index) => ({
          key: item.key,
          name: item.label,
          width: "auto",
          headerCellClass:
            props.column.length == index + 1
              ? "textAlignRight"
              : `textAlignCenter`,
          cellClass:
            props.column.length == index + 1
              ? "rdg-cell-value textAlignRight"
              : "rdg-cell-value textAlignCenter",
          formatter: ({ row, column }: any) => {
            if (column.key.toLowerCase() === "address") {
              return getShortAddr(row[column.key]);
            } else {
              return row[column.key];
            }
          },
        }))
      : [],
    generateRows: (rawData: R) => rawData,
    generateColumns: ({ columnsRaw }: any) =>
      [
        {
          key: "No.",
          name: "No.",
          width: "auto",
          headerCellClass: `textAlignCenter`,
          cellClass: "rdg-cell-value textAlignCenter",
          formatter: ({ row, column, rowIdx }: any) => {
            return rowIdx + 1;
            // if (column.key.toLowerCase() === "address") {
            //   return getShortAddr(row[column.key]);
            // } else {
            //   return row[column.key];
            // }
          },
        },
        ...columnsRaw,
      ] as Column<any, unknown>[],
  };
  React.useEffect(() => {
    getTableValues();
  }, [filter?.value]);
  const getTableValues = React.useCallback(async () => {
    const url =
      props.url.replace(
        "api.loopring.network",
        chainId === ChainId.MAINNET
          ? "api.loopring.network"
          : "uat2.loopring.io"
      ) + (filter && filter.key ? `?${filter.key}=${filter.value}` : "");
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        setRank(json.data as any[]);
        setShowLoading(false);
      })
      .catch(() => {
        return [];
      });
  }, [chainId, filter, props]);

  return (
    <Box
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      maxWidth={1200}
      width={"100%"}
      paddingX={3}
    >
      {/*<BoxSelect>*/}
      {/* */}
      {/*</BoxSelect>*/}
      <Box
        alignSelf={"flex-end"}
        marginY={2}
        display={"flex"}
        justifyContent={"space-between"}
        width={"100%"}
      >
        {filter && (
          <StyledTextFiled
            id={"trading-race-filter"}
            select
            style={{ width: 150, textAlign: "left" }}
            value={filter.value}
            onChange={onChange}
            inputProps={{ IconComponent: DropDownIcon }}
          >
            {filter.list.map((item, index) => (
              <MenuItem key={item.value + index} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </StyledTextFiled>
        )}
        <InputSearch
          value={searchValue}
          onChange={(value: any) => {
            // setSearchValue(value)
            setSearchValue(value);
          }}
        />
      </Box>
      <TableStyled height={(rankView.length + 1) * RowConfig.rowHeight}>
        {rank.length ? (
          <Table
            className={"scrollable"}
            {...{
              ...defaultArgs,
              ...props,
              rawData: rankView,
              showloading: showLoading,
            }}
          />
        ) : (
          <Box
            flex={1}
            height={"100%"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"center"}
          >
            <img
              className="loading-gif"
              alt={"loading"}
              width="60"
              src={`${SoursURL}images/loading-line.gif`}
            />
          </Box>
        )}
      </TableStyled>
    </Box>
  );
};
