import React from "react";
import {
  DropDownIcon,
  EmptyValueTag,
  FirstPlaceIcon,
  getShortAddr,
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

const TableStyled = styled(Box)<{ height: number | undefined | string }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    height: ${({ height }) => height}px;
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
  const [rank, setRank] = React.useState<API_DATA<R> | undefined>(undefined);
  const [rankTableData, setRankTableData] = React.useState<R[]>([]);
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [showLoading, setShowLoading] = React.useState(true);
  const searchParams = new URLSearchParams(search);
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

  React.useEffect(() => {
    if (searchValue !== "" && rank?.data?.length) {
      setRankTableData((state) =>
        rank?.data?.filter((item: any) => {
          if (searchValue.startsWith("0x")) {
            const regx = new RegExp(searchValue.toLowerCase(), "ig");
            return regx.test(item?.address);
          } else {
            const regx = new RegExp(searchValue.toLowerCase(), "ig");
            return regx.test(item?.address) || regx.test(item?.accountId);
          }
        })
      );
    } else if (rank?.data?.length) {
      setRankTableData([...rank?.data]);
    } else {
      setRankTableData([]);
    }
  }, [rank?.data, searchValue]);

  const defaultArgs: any = {
    columnMode: column.length
      ? column.map((item, index) => ({
          key: item.key,
          name: item.label,
          width: "auto",
          headerCellClass:
            index == 0
              ? "textAlignLeft"
              : column.length == index + 1
              ? "textAlignRight"
              : `textAlignCenter`,
          cellClass:
            index == 0
              ? "textAlignLeft"
              : column.length == index + 1
              ? "rdg-cell-value textAlignRight"
              : "rdg-cell-value textAlignCenter",
          formatter: ({ row }: any) => {
            if (/address/gi.test(item.key.toLowerCase())) {
              return getShortAddr(row[item.key]);
            } else if (/rank/gi.test(item.key.toLowerCase())) {
              const value = row.rank;
              const formattedValue =
                value === "1" ? (
                  <FirstPlaceIcon style={{ marginTop: 8 }} fontSize={"large"} />
                ) : value === "2" ? (
                  <SecondPlaceIcon
                    style={{ marginTop: 8 }}
                    fontSize={"large"}
                  />
                ) : value === "3" ? (
                  <ThirdPlaceIcon style={{ marginTop: 8 }} fontSize={"large"} />
                ) : (
                  <Box paddingLeft={1}>{value}</Box>
                );
              return <Box className="rdg-cell-value">{formattedValue}</Box>;
            } else {
              return row[item.key];
            }
          },
        }))
      : [],
    generateRows: (rawData: R) => rawData,
    generateColumns: ({ columnsRaw }: any) => columnsRaw,
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
        setRank(() => {
          return { ...json } as API_DATA<R>;
        });
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
        <TableStyled
          minHeight={120}
          height={
            (((rankTableData && rankTableData?.length) ?? 0) + 1) *
            RowConfig.rowHeight
          }
        >
          {rank?.data?.length ? (
            <Table
              className={"scrollable"}
              {...{
                ...defaultArgs,
                rawData: rankTableData,
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
      </WrapperStyled>
    </Box>
  );
};
