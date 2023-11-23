import { useTokenMap } from '@loopring-web/core'
export enum RecordIndex {
  Transactions = 'Transactions',
  DualInvestment = 'DualInvestment',
}
export const useData = () => {
  const { tokenMap } = useTokenMap()

  return {}
}
