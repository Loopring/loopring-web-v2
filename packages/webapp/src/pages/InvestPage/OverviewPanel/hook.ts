import { useInvestTokenTypeMap } from "@loopring-web/core";
import {
  DepartmentRow,
  InvestColumnKey,
  RowInvest,
} from "@loopring-web/component-lib";
import {
  InvestMapType,
  InvestOpenType,
  myLog,
  SagaStatus,
} from "@loopring-web/common-resources";
import React from "react";

export function useOverview<R extends RowInvest>() {
  const { investTokenTypeMap, status: investTokenTypeMapStatus } =
    useInvestTokenTypeMap();
  const [filterValue, setFilterValue] = React.useState("");

  const [rawData, setRawData] = React.useState<R[]>([]);
  const [filteredData, setFilteredData] = React.useState<R[]>(rawData);

  const sortMethod = React.useCallback(
    (_sortedRows, sortColumn, direction) => {
      let _rawData = [...filteredData];
      switch (sortColumn) {
        case InvestColumnKey.TYPE:
          // TODO:
          _rawData = filteredData.sort((a, b) => {
            const valueA = a.token.symbol;
            const valueB = b.token.symbol;
            return valueB.localeCompare(valueA);
          });
          break;
        case InvestColumnKey.APR:
          _rawData = filteredData.sort((a, b) => {
            // myLog("a.apr[1]", a.apr[1]);
            return Number(b.apr[1] ?? 0) - Number(a.apr[1] ?? 0);
          });
          break;
        default:
          break;
      }
      // resetTableData(_rawData)
      return _rawData;
    },
    [filteredData]
  );
  const getFilteredData = React.useCallback(
    (value: string) => {
      setFilterValue(value);
      if (value) {
        const _rawData = [...rawData];
        setFilteredData(_rawData);
      } else {
        // debugger;
        setFilteredData(rawData);
      }
    },
    [rawData]
  );

  React.useEffect(() => {
    if (investTokenTypeMapStatus === SagaStatus.UNSET) {
      const rawData = Object.keys(investTokenTypeMap).reduce(
        (prev, key, index) => {
          let item = {
            ...investTokenTypeMap[key].detail,
            i18nKey: "" as any,
            children: [],
            isExpanded: false,
            type: InvestMapType.Token,
          } as unknown as R;
          const children = InvestOpenType.reduce((prev, type) => {
            if (investTokenTypeMap[key][type]) {
              let _row: any = investTokenTypeMap[key][type];
              _row = { ..._row, token: item.token };
              prev.push(_row as DepartmentRow);
            }
            return prev;
          }, [] as DepartmentRow[]);
          item.children = children;

          prev.push(item);
          // return investTokenTypeMap[key]
          // myLog("rawData", prev);
          return prev;
        },
        [] as R[]
      );
      setRawData(rawData);
      setFilteredData(rawData);
    }
    // getFilteredData("");
  }, [investTokenTypeMapStatus]);
  // myLog("rawData", filteredData);
  return {
    filteredData,
    sortMethod,
    filterValue,
    getFilteredData,
    // rawData,
    //
    // // tableHeight,
    // showFilter,
    // showLoading,
    // sortMethod,
    // hideSmallBalances,
    // setHideSmallBalances,
  };
}
