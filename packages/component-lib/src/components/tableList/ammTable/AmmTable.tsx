import React from "react";
import { Box, BoxProps, Link, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { TFunction, withTranslation, WithTranslation } from "react-i18next";
import moment from "moment";
import { Column, Table, TablePagination } from "../../basic-lib";
import { TableFilterStyled, TablePaddingX } from "../../styled";
import { Filter, FilterTradeTypes } from "./components/Filter";
import {
  getValuePrecisionThousand,
  globalSetup,
  myLog,
  UNIX_TIMESTAMP_FORMAT,
} from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";
import { AmmSideTypes } from "./interface";
import { Currency } from "@loopring-web/loopring-sdk";
import { DateRange } from "@mui/lab";
import _ from "lodash";
import { useLocation } from "react-router-dom";

export type RawDataAmmItem = {
  side: AmmSideTypes;
  amount: {
    from: {
      key: string;
      value?: string;
    };
    to: {
      key: string;
      value?: string;
    };
  };
  lpTokenAmount?: string;
  fee: {
    key: string;
    value?: string;
  };
  time: number;
};

export type AmmTableProps = {
  getAmmpoolList: (props: any) => void;
  rawData: RawDataAmmItem[];
  filterPairs: string[];
  showloading: boolean;
  pagination?: {
    pageSize: number;
    total: number;
  };
  showFilter?: boolean;
};

// enum TableType {
//     filter = 'filter',
//     page = 'page'
// }

const TableStyled = styled(Box)<BoxProps & { isMobile?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    ${({ isMobile }) =>
      !isMobile
        ? `--template-columns: 300px auto auto auto !important;`
        : `--template-columns: 78% 22% !important;`}

    .rdg-row .rdg-cell:first-of-type {
      display: flex;
      align-items: center;
    }
    .rdg-cell.action {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .textAlignRight {
      text-align: right;
    }
  }

  ${({ theme }) =>
    TablePaddingX({ pLeft: theme.unit * 3, pRight: theme.unit * 3 })}
` as (props: { isMobile?: boolean } & BoxProps) => JSX.Element;

const StyledSideCell: any = styled(Typography)`
  color: ${(props: any) => {
    const {
      value,
      theme: { colorBase },
    } = props;
    return value === AmmSideTypes.Join ? colorBase.success : colorBase.error;
  }};
`;

const getColumnModeAssets = (
  t: TFunction,
  _currency: Currency
): Column<RawDataAmmItem, unknown>[] => [
  {
    key: "side",
    name: t("labelAmmSide"),
    formatter: ({ row }) => {
      const tradeType =
        row["side"] === AmmSideTypes.Join
          ? t("labelAmmJoin")
          : t("labelAmmExit");
      const { from, to } = row["amount"];
      const renderFromValue = getValuePrecisionThousand(
        from.value,
        undefined,
        undefined,
        undefined,
        false,
        { isTrade: true }
      );
      const renderToValue = getValuePrecisionThousand(
        to.value,
        undefined,
        undefined,
        undefined,
        false,
        { isTrade: true }
      );
      return (
        <>
          <StyledSideCell value={row["side"]}>{tradeType}</StyledSideCell>
          <Typography marginLeft={1 / 2}>
            {`${renderFromValue} ${from.key} + ${renderToValue} ${to.key}`}
          </Typography>
        </>
      );
    },
  },
  {
    key: "lpTokenAmount",
    name: t("labelAmmLpTokenAmount"),
    headerCellClass: "textAlignRight",
    formatter: ({ row }) => {
      const amount = row["lpTokenAmount"];
      const renderValue =
        row["side"] === AmmSideTypes.Join
          ? `+${getValuePrecisionThousand(
              amount,
              undefined,
              undefined,
              undefined,
              false,
              { isTrade: true }
            )}`
          : `-${getValuePrecisionThousand(
              amount,
              undefined,
              undefined,
              undefined,
              false,
              { isTrade: true }
            )}`;
      return <Box className="rdg-cell-value textAlignRight">{renderValue}</Box>;
    },
  },
  {
    key: "fee",
    name: t("labelAmmFee"),
    headerCellClass: "textAlignRight",
    formatter: ({ row }) => {
      const { key, value } = row["fee"];
      return (
        <Box className="rdg-cell-value textAlignRight">
          {`${getValuePrecisionThousand(
            value,
            undefined,
            undefined,
            undefined,
            false,
            { isTrade: true, floor: false }
          )} ${key}`}
        </Box>
      );
    },
  },
  {
    key: "time",
    name: t("labelAmmRecordTime"),
    headerCellClass: "textAlignRight",
    // minWidth: 400,
    formatter: ({ row }) => {
      const time = moment(new Date(row["time"]), "YYYYMMDDHHMM").fromNow();
      return <Box className="rdg-cell-value textAlignRight">{time}</Box>;
    },
  },
];

const getColumnModeMobileAssets = (
  t: TFunction,
  _currency: Currency
): Column<RawDataAmmItem, unknown>[] => [
  {
    key: "side",
    name: (
      <Typography
        height={"100%"}
        display={"flex"}
        justifyContent={"space-between"}
        variant={"inherit"}
        color={"inherit"}
        alignItems={"center"}
      >
        <span>{t("labelAmmSide")}</span>
        <span>{t("labelAmmLpTokenAmount") + "/" + t("labelAmmFee")}</span>
      </Typography>
    ),
    formatter: ({ row }) => {
      const tradeType =
        row["side"] === AmmSideTypes.Join
          ? t("labelAmmJoin")
          : t("labelAmmExit");
      const { from, to } = row["amount"];
      const renderFromValue = getValuePrecisionThousand(
        from.value,
        undefined,
        undefined,
        undefined,
        false,
        { isTrade: true }
      );
      const renderToValue = getValuePrecisionThousand(
        to.value,
        undefined,
        undefined,
        undefined,
        false,
        { isTrade: true }
      );
      const { key, value } = row.fee;

      return (
        <Box
          height={"100%"}
          width={"100%"}
          display={"flex"}
          flexDirection={"row"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <StyledSideCell component={"span"} value={row.side} variant={"body1"}>
            {tradeType}
          </StyledSideCell>
          <Typography
            component={"span"}
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-around"}
            alignSelf={"stretch"}
            alignItems={"flex-end"}
          >
            <Typography marginLeft={1 / 2}>
              {`${renderFromValue} ${from.key} + ${renderToValue} ${to.key}`}
            </Typography>
            <Typography
              variant={"body2"}
              component={"span"}
              color={"textSecondary"}
            >
              {`Fee: ${getValuePrecisionThousand(
                value,
                undefined,
                undefined,
                undefined,
                false,
                { isTrade: true, floor: false }
              )} ${key}`}
            </Typography>
          </Typography>
        </Box>
      );
    },
  },
  {
    key: "lpTokenAmmTime",
    name: t("labelAmmTime"),
    headerCellClass: "textAlignRight",
    formatter: ({ row }) => {
      // const amount = row["lpTokenAmount"];
      // const renderValue =
      //   row["side"] === AmmSideTypes.Join
      //     ? `+${getValuePrecisionThousand(
      //         amount,
      //         undefined,
      //         undefined,
      //         undefined,
      //         false,
      //         { isTrade: true }
      //       )}`
      //     : `-${getValuePrecisionThousand(
      //         amount,
      //         undefined,
      //         undefined,
      //         undefined,
      //         false,
      //         { isTrade: true }
      //       )}`;
      const time = moment(new Date(row["time"]), "YYYYMMDDHHMM").fromNow();

      return (
        <Box
          height={"100%"}
          width={"100%"}
          display={"flex"}
          flexDirection={"column"}
          alignItems={"flex-end"}
          justifyContent={"center"}
        >
          <Typography component={"span"} variant={"body2"}>
            {time}
          </Typography>
        </Box>
      );
    },
  },
];

export const AmmTable = withTranslation("tables")(
  (props: WithTranslation & AmmTableProps) => {
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const { t, pagination, showFilter, rawData, filterPairs, getAmmpoolList } =
      props;
    const [isDropDown, setIsDropDown] = React.useState(true);

    const [page, setPage] = React.useState(1);
    // const [filterPair, setFilterPair] = React.useState("all");

    const [filterItems, setFilterItems] = React.useState<{
      filterType: FilterTradeTypes;
      filterDate: DateRange<Date | null>;
      filterPair: string;
    }>({
      filterType: FilterTradeTypes.allTypes,
      filterDate: [null, null],
      filterPair: "all",
    });
    const { currency, isMobile } = useSettings();
    const defaultArgs: any = {
      columnMode: isMobile
        ? getColumnModeMobileAssets(t, currency)
        : getColumnModeAssets(t, currency),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) => columnsRaw,
      style: {
        backgroundColor: ({ colorBase }: any) => `${colorBase.box}`,
      },
    };

    const updateData = _.debounce(
      async ({
        page = 1,
        type = FilterTradeTypes.allTypes,
        date = [null, null],
        pair,
      }: any) => {
        const start = date
          ? date[0] && Number(moment(date[0]).format(UNIX_TIMESTAMP_FORMAT))
          : undefined;
        const end = date
          ? date[1] && Number(moment(date[1]).format(UNIX_TIMESTAMP_FORMAT))
          : undefined;

        await getAmmpoolList({
          tokenSymbol: pair,
          txTypes: type !== FilterTradeTypes.allTypes ? type : "",
          start,
          end,
          offset: (page - 1) * (pagination?.pageSize ?? 10),
          limit: pagination?.pageSize ?? 10,
        });
      },
      globalSetup.wait
    );

    const handleFilterChange = React.useCallback(
      ({ type, date, pair }) => {
        let filters = {
          filterType: type ? type : filterItems.filterType,
          filterDate: date ? date : filterItems.filterDate,
          filterPair: pair ? pair : filterItems.filterPair,
        };
        setFilterItems(filters);
        updateData({
          type: filters.filterType,
          date: filters.filterDate,
          pair: filters.filterPair,
          page: 1,
        });
      },
      [
        filterItems.filterDate,
        filterItems.filterPair,
        filterItems.filterType,
        updateData,
      ]
    );

    const handlePageChange = React.useCallback(
      ({ page = 1, type, date, pair }: any) => {
        setPage(page);
        myLog("AmmTable page,", page);
        updateData({ page, type, date, pair });
      },
      [updateData]
    );

    const handleReset = React.useCallback(() => {
      setFilterItems({
        filterType: FilterTradeTypes.allTypes,
        filterDate: [null, null],
        filterPair: "",
      });
      updateData({
        page: 1,
        type: FilterTradeTypes.allTypes,
        date: [null, null],
        pair: "",
      });
    }, [updateData]);

    React.useEffect(() => {
      let filters: any = {};
      updateData.cancel();
      if (searchParams.get("pair")) {
        filters.pair = searchParams.get("pair");
      }
      handleFilterChange(filters);
      return () => {
        updateData.cancel();
      };
    }, [pagination?.pageSize]);

    return (
      <TableStyled isMobile={isMobile}>
        {showFilter &&
          (isMobile && isDropDown ? (
            <Link
              variant={"body1"}
              display={"inline-flex"}
              width={"100%"}
              justifyContent={"flex-end"}
              paddingRight={2}
              onClick={() => setIsDropDown(false)}
            >
              {t("labelShowFilter")}
            </Link>
          ) : (
            <TableFilterStyled>
              <Filter
                filterPairs={filterPairs}
                filterPair={filterItems.filterPair}
                filterType={filterItems.filterType}
                filterDate={filterItems.filterDate}
                handleFilterChange={handleFilterChange}
                handleReset={handleReset}
              />
            </TableFilterStyled>
          ))}
        <Table {...{ ...defaultArgs, ...props, rawData }} />
        {!!(pagination && pagination.total) && (
          <TablePagination
            page={page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={(page) => handlePageChange({ page })}
          />
        )}
      </TableStyled>
    );
  }
);
