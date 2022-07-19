import { InvestMapType, InvestOpenType } from "@loopring-web/common-resources";
import { DepartmentRow, RowInvest } from "@loopring-web/component-lib";
import { InvestTokenTypeMap, store } from "../../stores";
import { LoopringAPI } from "../../api_wrapper";

export const makeInvestRow = <R extends RowInvest>(
  investTokenTypeMap: InvestTokenTypeMap,
  key: string
): R => {
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
  return item;
};

export const makeDefiInvestReward = async () => {
  const { apiKey, accountId } = store.getState().account;
  if (LoopringAPI.defiAPI && apiKey && accountId) {
    // @ts-ignore
    const { totalRewards } = await LoopringAPI.defiAPI.getDefiReward(
      { accountId },
      apiKey
    );
    return totalRewards ?? 0;
  }
  return "0";
};
