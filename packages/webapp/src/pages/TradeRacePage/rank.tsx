import React from "react";
import {
  DropDownIcon,
  EmptyValueTag,
  FirstPlaceIcon,
  getShortAddr,
  myLog,
  RowConfig,
  SecondPlaceIcon,
  SoursURL,
  ThirdPlaceIcon,
} from "@loopring-web/common-resources";
import { Box, MenuItem, Typography } from "@mui/material";
import {
  InputSearch,
  Table,
  TablePaddingX,
  TextField,
  TradeRaceTableConfig,
  useSettings,
} from "@loopring-web/component-lib";
import styled from "@emotion/styled";
import { useHistory, useLocation } from "react-router-dom";
import { useSystem } from "@loopring-web/core";
import {
  Activity_URL,
  API_DATA,
  EventAPI,
  EventAPIExtender,
} from "./interface";
import { useTranslation } from "react-i18next";
import _ from "lodash";

const WrapperStyled = styled(Box)`
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

const TableStyled = styled(Table)`
  &.rdg {
    height: ${(props: any) => {
      if (props.currentheight && props.currentheight > 350) {
        return props.currentheight + "px";
      } else {
        return "100%";
      }
    }};
    width: 100%;
  }
` as any;
// ${({ theme }) =>
// TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
// const TableStyled = styled(Box)<{ height: number | undefined | string }>`
//   display: flex;
//   flex-direction: column;
//   flex: 1;
//
//   .rdg {
//     height: ${({ height }) => height}px;
//     height: auto;
//
//     .rdgCellCenter {
//       height: 100%;
//       // display: flex;
//       justify-content: center;
//       align-items: center;
//     }
//     .textAlignRight {
//       text-align: right;
//     }
//     .textAlignCenter {
//       text-align: center;
//     }
//     .textAlignLeft {
//       text-align: left;
//     }
//   }
//
// ` as typeof Box;

export const RankRaw = <R extends object>({
  column,
  version,
  filters = [],
}: EventAPI & Partial<EventAPIExtender>) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { isMobile } = useSettings();
  const { chainId, baseURL } = useSystem();
  const { search, pathname } = useLocation();
  const searchParams = new URLSearchParams(search);
  const [rank, setRank] = React.useState<API_DATA<R> | undefined>(undefined);
  const [rankTableData, setRankTableData] = React.useState<R[]>([]);
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [showLoading, setShowLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<string>(
    searchParams.get("selected") ?? filters[0]
  );
  const onChange = (event: React.ChangeEvent<{ value: string }>) => {
    if (event.target.value) {
      // setFilter((state) => ({ ...state, value: event.target.value } as any));
      setSelected(event.target.value);
      searchParams.set("selected", event.target.value);
      history.push(pathname + "?" + searchParams.toString());
    }
  };
  const resetRankTable = React.useCallback(
    (data) => {
      // const data = rank?.data.map((item) => {
      //   return item;
      // });
      setRankTableData((state) => {
        if (searchValue !== "" && data.length) {
          return data.filter((item: any) => {
            if (searchValue.startsWith("0x")) {
              const regx = new RegExp(searchValue.toLowerCase(), "ig");
              return regx.test(item?.address);
            } else {
              const regx = new RegExp(searchValue.toLowerCase(), "ig");
              return regx.test(item?.address) || regx.test(item?.accountId);
            }
          });
        } else if (data.length) {
          return [...data];
        } else {
          return [];
        }
        setShowLoading(false);
      });
    },
    [searchValue]
  );

  // React.useEffect(() => {
  //  if()
  // }, [searchValue]);

  const getTableValues = _.debounce(async () => {
    const l2account =
      searchParams.get("l2account") || searchParams.get("owner");
    const _selected = filters?.find((item) => selected === item);
    const url = `${baseURL}/${Activity_URL}?${
      _selected ? `&selected=${_selected}` : ""
    }${
      l2account && l2account !== "undefined" && l2account !== "null"
        ? `&l2account=${l2account}`
        : ""
    }&version=${version}`;

    const result = await fetch(url).then((response) => response.json());

    setRank(
      result
        ? {
            selected: "",
            owner: {
              rank: "",
              accountId: "",
              address: "",
              usdtValue: "",
            },
            ...result,
          }
        : undefined
    );

    resetRankTable(result.data);
    return;
  }, 100);

  React.useEffect(() => {
    getTableValues();
    return () => {
      getTableValues.cancel();
    };
  }, [selected]);
  // myLog("result.data", rankTableData);
  return (
    <Box
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      maxWidth={1200}
      width={"100%"}
      paddingX={isMobile ? 1 : 3}
    >
      <WrapperStyled flex={1} padding={isMobile ? 1 : 3}>
        <Box
          alignSelf={"flex-end"}
          marginY={2}
          display={"flex"}
          justifyContent={"space-between"}
          width={"100%"}
        >
          {!!filters?.length && (
            <StyledTextFiled
              id={"trading-race-filter"}
              select
              style={{ width: 150, textAlign: "left" }}
              value={selected}
              onChange={onChange}
              inputProps={{ IconComponent: DropDownIcon }}
            >
              {filters.map((item, index) => (
                <MenuItem key={item + index} value={item}>
                  {item}
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
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          flexDirection={isMobile ? "column" : "row"}
        >
          <Typography variant={"h5"}>
            {t("labelTradeRaceYourRanking")}:{" "}
            {rank?.owner?.rank || EmptyValueTag}
          </Typography>
        </Box>
        <Box minHeight={120} width={"100%"}>
          {rank?.data?.length ? (
            <TradeRaceTableConfig
              column={column}
              rawData={rankTableData}
              showloading={showLoading}
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
        </Box>
      </WrapperStyled>
    </Box>
  );
};
