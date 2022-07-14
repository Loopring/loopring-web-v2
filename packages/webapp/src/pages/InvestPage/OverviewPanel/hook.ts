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
    (_sortedRows, sortColumn) => {
      let _rawData: R[] = filteredData;
      switch (sortColumn) {
        case InvestColumnKey.TYPE:
          //TODO:
          // _rawData = filteredData.sort((a, b) => {
          //   const valueA = a.coinAInfo.simpleName;
          //   const valueB = b.coinAInfo.simpleName;
          //   return valueB.localeCompare(valueA);
          // });
          break;
        case InvestColumnKey.APR:
          //TODO:
          // _rawData = filteredData.sort((a, b) => {
          //   const valueA = a.APR || 0;
          //   const valueB = b.APR || 0;
          //   if (valueA && valueB) {
          //     return valueB - valueA;
          //   }
          //   if (valueA && !valueB) {
          //     return -1;
          //   }
          //   if (!valueA && valueB) {
          //     return 1;
          //   }
          //   return 0;
          // });
          break;
        case InvestColumnKey.DURATION:
          //TODO:
          // _rawData = filteredData.sort((a, b) => {
          //   const valueA = a.amountDollar;
          //   const valueB = b.amountDollar;
          //   if (valueA && valueB) {
          //     return valueB - valueA;
          //   }
          //   if (valueA && !valueB) {
          //     return -1;
          //   }
          //   if (!valueA && valueB) {
          //     return 1;
          //   }
          //   return 0;
          // });
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
        // const _rawData = rawData.filter((o) => {
        //   const coinA = o.coinAInfo.name.toLowerCase();
        //   const coinB = o.coinBInfo.name.toLowerCase();
        //   const formattedValue = value.toLowerCase();
        //   return (
        //     coinA.includes(formattedValue) || coinB.includes(formattedValue)
        //   );
        // });
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
