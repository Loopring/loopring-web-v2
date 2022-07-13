import { StateBase } from "@loopring-web/common-resources";

export const enum InvestMapType {
  AMM = "AMM",
  DEFI = "DEFI",
}
export const enum InvestDuration {
  Flexible = "Flexible",
  Duration = "Duration",
}

//labelInvestType
export const labelI18n = "labelInvestType_";
export type InvestItem = {
  type: InvestMapType;
  i18nKey: `labelInvestType_${InvestMapType}`;
  apr: [start: number, end: number];
  durationType: InvestDuration;
  duration: string;
};
export type InvestTokenTypeMap = {
  [key: string]: { [key in InvestMapType]?: InvestItem };
};

export type InvestTokenTypeMapStates = {
  investTokenTypeMap: InvestTokenTypeMap;
} & StateBase;
