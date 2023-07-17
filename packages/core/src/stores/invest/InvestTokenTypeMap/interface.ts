import { InvestDetail, InvestItem, InvestMapType, StateBase } from '@loopring-web/common-resources'

//labelInvestType
export const labelI18n = 'labelInvestType_'

export type InvestTokenTypeMap = {
  [key: string]: {
    [key in InvestMapType]?: InvestItem
  } & { detail: InvestDetail }
}

export type InvestTokenTypeMapStates = {
  investTokenTypeMap: InvestTokenTypeMap
} & StateBase
