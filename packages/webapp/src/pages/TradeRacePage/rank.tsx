import React from "react";
import {
  DropDownIcon,
  FirstPlaceIcon,
  getShortAddr,
  RowConfig,
  SecondPlaceIcon,
  SoursURL,
  ThirdPlaceIcon,
} from "@loopring-web/common-resources";
import { Box, MenuItem } from "@mui/material";
import {
  Column,
  InputSearch,
  Table,
  TablePaddingX,
  TextField,
} from "@loopring-web/component-lib";
import styled from "@emotion/styled";
import { useHistory, useLocation } from "react-router-dom";
import { useSystem } from "@loopring-web/core";
import { Activity_URL, EventAPI, EventAPIExtender } from "./interface";
import { useTranslation } from "react-i18next";

const StyledTextFiled = styled(TextField)`
  &.MuiTextField-root {
    max-width: initial;
  }

  .MuiInputBase-root {
    width: initial;
    max-width: initial;
  }
`;

const TableStyled = styled(Box)<{ height: number | undefined | string }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    height: ${({ height }) => height}px;
    --template-columns: 10% 30% auto auto !important;
    height: auto;

    .rdgCellCenter {
      height: 100%;
      // display: flex;
      justify-content: center;
      align-items: center;
    }
    .textAlignRight {
      text-align: right;
    }
    .textAlignCenter {
      text-align: center;
    }
    .textAlignLeft {
      text-align: left;
    }
  }
  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as typeof Box;

export const RankRaw = <R extends any>({
  column,
  version,
  filters,
}: EventAPI & Partial<EventAPIExtender>) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { chainId, baseURL } = useSystem();
  const { search, pathname } = useLocation();
  const [rank, setRank] = React.useState<R[]>([]);
  const [rankView, setRankView] = React.useState<R[]>([]);
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [showLoading, setShowLoading] = React.useState(true);
  const searchParams = new URLSearchParams(search);
  const [selected, setSelected] = React.useState<string>(
    searchParams.get("selected") ?? ""
  );
  const onChange = (event: React.ChangeEvent<{ value: string }>) => {
    if (event.target.value) {
      // setFilter((state) => ({ ...state, value: event.target.value } as any));
      setSelected(event.target.value);
      searchParams.set("selected", event.target.value);
      history.push(pathname + "?" + searchParams.toString());
    }
  };
  // const handleFilterChange = React.useCallback(
  //   (e: React.ChangeEvent<{ value: string }>) => {
  //     history.push(pathname + "?" + searchParams.toString());
  //   },
  //   []
  // );
  // const { params } = useRouteMatch();
  // const { search, pathname } = useLocation();
  // const searchParams = new URLSearchParams(search);
  // const [selected, setSelected] = React.useState();
  // const [filter, setFilter] = React.useState<
  //   | {
  //       value: string;
  //       list: Array<{ label: string; value: string }>;
  //     }
  //   | undefined
  // >(() => {
  //   const value
  //   selected
  //     value = list[0].value;
  //     if (params) {
  //       value =
  //         list.find(
  //           (item) => props.params && item.label == params[props.params.key]
  //         )?.value ?? value;
  //     }
  //   return column.
  //   // let value,
  //   //   list = [];
  //   // if (props.params && props.params.key) {
  //   //   list = props.params.values.map((item) => {
  //   //     try {
  //   //       const state = store.getState();
  //   //       return { label: item.label, value: eval(item.value) };
  //   //     } catch (error) {
  //   //       console.log("eval error", error);
  //   //       return { label: item.label, value: item.value };
  //   //     }
  //   //   });
  //   //   value = list[0].value;
  //   //   if (params) {
  //   //     value =
  //   //       list.find(
  //   //         (item) => props.params && item.label == params[props.params.key]
  //   //       )?.value ?? value;
  //   //   }
  //   //   return {
  //   //     value,
  //   //     list,
  //   //     key: props.params.key,
  //   //   };
  //   // } else {
  //   //   return undefined;
  //   // }
  // });

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

  const defaultArgs: any = {
    columnMode: column.length
      ? column.map((item, index) => ({
          key: item.key,
          name: item.label,
          width: "auto",
          headerCellClass:
            column.length == index + 1 ? "textAlignRight" : `textAlignCenter`,
          cellClass:
            column.length == index + 1
              ? "rdg-cell-value textAlignRight"
              : "rdg-cell-value textAlignCenter",
          formatter: ({ row, column }: any) => {
            if (/address/gi.test(column.key.toLowerCase())) {
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
          key: "rank",
          name: t("labelTradeRaceRank"),
          formatter: ({ row }) => {
            const value = row["rank"];
            const formattedValue =
              value === "1" ? (
                <FirstPlaceIcon style={{ marginTop: 8 }} fontSize={"large"} />
              ) : value === "2" ? (
                <SecondPlaceIcon style={{ marginTop: 8 }} fontSize={"large"} />
              ) : value === "3" ? (
                <ThirdPlaceIcon style={{ marginTop: 8 }} fontSize={"large"} />
              ) : (
                <Box paddingLeft={1}>{value}</Box>
              );
            return <Box className="rdg-cell-value">{formattedValue}</Box>;
          },
        },
        ...columnsRaw,
      ] as Column<any, unknown>[],
  };
  React.useEffect(() => {
    getTableValues();
  }, [selected]);
  const getTableValues = React.useCallback(async () => {
    const owner = searchParams.get("owner");
    const url = `${baseURL}/${Activity_URL}?selected=${selected}&owner=${owner}&version=${version}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        setRank(json.data as any[]);
        setShowLoading(false);
      })
      .catch(() => {
        return [];
      });
  }, [chainId, selected]);

  return (
    <Box
      flex={1}
      display={"flex"}
      flexDirection={"column"}
      maxWidth={1200}
      width={"100%"}
      paddingX={3}
    >
      <Box
        alignSelf={"flex-end"}
        marginY={2}
        display={"flex"}
        justifyContent={"space-between"}
        width={"100%"}
      >
        {filters && (
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
      <TableStyled height={(rankView.length + 1) * RowConfig.rowHeight}>
        {rank.length ? (
          <Table
            className={"scrollable"}
            {...{
              ...defaultArgs,
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
