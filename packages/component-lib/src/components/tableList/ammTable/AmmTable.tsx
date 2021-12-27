import React from "react";
import { Box, Typography } from "@mui/material";
import styled from "@emotion/styled";
import { TFunction, withTranslation, WithTranslation } from "react-i18next";
import moment from "moment";
import { Column, Table } from "../../basic-lib/tables";
import { TablePagination } from "../../basic-lib";
import { TableFilterStyled, TablePaddingX } from "../../styled";
import { Filter, FilterTradeTypes } from "./components/Filter";
import {
  getValuePrecisionThousand,
  TableType,
} from "@loopring-web/common-resources";
import { useSettings } from "../../../stores";
import { useDeepCompareEffect } from "react-use";
import { Row } from "../poolsTable/Interface";
import { AmmSideTypes } from "./interface";
import { Currency } from "@loopring-web/loopring-sdk";

// interface Row {
//     side: TradeTypes;
//     amount: {
//         from: {
//             key: string;
//             value: number;
//         },
//         to: {
//             key: string;
//             value: number
//         }
//     };
//     price: number;
//     fee: number;
//     time: number;
//     cellExpend?: {
//         value: string
//         children: []
//         isExpanded: boolean
//     };
//     children?: Row[];
//     isExpanded?: boolean;
//     formatter?: any;
// }

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
  rawData: RawDataAmmItem[];
  pagination?: {
    pageSize: number;
  };
  showFilter?: boolean;
};

// enum TableType {
//     filter = 'filter',
//     page = 'page'
// }

const TableStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;

  .rdg {
    --template-columns: 300px auto auto auto !important;
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
` as typeof Box;

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
  // {
  //     key: 'amount',
  //     name: t('labelAmmAmount'),
  //     formatter: ({row}) => {
  //         const {from, to} = row[ 'amount' ]
  //         return (
  //             <div className="rdg-cell-value">
  //                 {`${from.value} ${from.key} + ${to.value} ${to.key}`}
  //             </div>
  //         )
  //     }
  // },
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
      return (
        <Box className="rdg-cell-value textAlignRight">
          {renderValue}
          {/*{currency === Currency.usd ?*/}
          {/*    PriceTag.Dollar + getThousandFormattedNumbers(priceDollar)*/}
          {/*    : PriceTag.Yuan + getThousandFormattedNumbers(priceYuan)}*/}
        </Box>
      );
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

export const AmmTable = withTranslation("tables")(
  (props: WithTranslation & AmmTableProps) => {
    const { t, pagination, showFilter, rawData } = props;
    const [filterType, setFilterType] = React.useState(
      FilterTradeTypes.allTypes
    );
    const [filterDate, setFilterDate] = React.useState<Date | null>(null);
    const [page, setPage] = React.useState(1);
    const [totalData, setTotalData] = React.useState<RawDataAmmItem[]>(rawData);
    const [filterPair, setFilterPair] = React.useState("all");

    const { currency } = useSettings();
    const defaultArgs: any = {
      columnMode: getColumnModeAssets(t, currency).filter((o) => !o.hidden),
      generateRows: (rawData: any) => rawData,
      generateColumns: ({ columnsRaw }: any) =>
        columnsRaw as Column<Row<any>, unknown>[],
      style: {
        backgroundColor: ({ colorBase }: any) => `${colorBase.box}`,
      },
    };

    useDeepCompareEffect(() => {
      setTotalData(rawData);
    }, [rawData]);

    const pageSize = pagination ? pagination.pageSize : 10;

    const getRenderData = React.useCallback(
      () =>
        pagination
          ? totalData.slice((page - 1) * pageSize, page * pageSize)
          : totalData,
      [page, pageSize, pagination, totalData]
    );

    const updateData = React.useCallback(
      ({
        TableType,
        currFilterType = filterType,
        currFilterDate = filterDate,
        currFilterPair = filterPair,
      }) => {
        let resultData = rawData ? rawData : [];
        if (currFilterType !== FilterTradeTypes.allTypes) {
          resultData = resultData.filter((o) => o.side === currFilterType);
        }
        if (currFilterDate) {
          resultData = resultData.filter((o) => {
            const chosenDate = Number(moment(currFilterDate).format("x"));
            return chosenDate < o.time;
          });
        }
        if (currFilterPair !== "all") {
          resultData = resultData.filter((o) => {
            const pair = `${o.amount.from.key} - ${o.amount.to.key}`;
            return pair === currFilterPair;
          });
        }
        if (TableType === "filter") {
          setPage(1);
        }
        setTotalData(resultData);
      },
      [rawData, filterDate, filterType, filterPair]
    );

    const setFilterItems = React.useCallback(({ type, date, pair }) => {
      setFilterType(type);
      setFilterDate(date);
      setFilterPair(pair);
    }, []);

    const handleFilterChange = React.useCallback(
      ({ type = filterType, date = filterDate, pair = filterPair }) => {
        setFilterItems({ type, date, pair });
        updateData({
          TableType: TableType.filter,
          currFilterType: type,
          currFilterDate: date,
        });
      },
      [updateData, setFilterItems, filterType, filterDate, filterPair]
    );

    const handlePageChange = React.useCallback(
      (page: number) => {
        setPage(page);
        updateData({ TableType: TableType.page, currPage: page });
      },
      [updateData]
    );

    const handleReset = React.useCallback(() => {
      handleFilterChange({
        type: FilterTradeTypes.allTypes,
        date: null,
        pair: "all",
      });
    }, [handleFilterChange]);

    return (
      <TableStyled>
        {showFilter && (
          <TableFilterStyled>
            <Filter
              rawData={rawData}
              handleFilterChange={handleFilterChange}
              filterType={filterType}
              filterDate={filterDate}
              filterPair={filterPair}
              handleReset={handleReset}
            />
          </TableFilterStyled>
        )}
        <Table {...{ ...defaultArgs, ...props, rawData: getRenderData() }} />
        {pagination && (
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={totalData.length}
            onPageChange={handlePageChange}
          />
        )}
      </TableStyled>
    );
  }
);
