import { LoopringAPI, useTokenMap } from '@loopring-web/core'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
export enum RecordIndex {
  Transactions = 'Transactions',
  DualInvestment = 'DualInvestment',
}
const useGetTransaction = ({ filter }: any) => {
  const { tokenMap, addressIndex } = useTokenMap()

  const [rowData, setRowData] = React.useState([])
  const [total, setTotals] = React.useState(0)
  const [isLoading, setLoading] = React.useState(false)
  const getList = async ({ txTypes = [sdk.TransactionType.DEPOSIT] }) => {
    setLoading(true)
    const value = await LoopringAPI.coworkerAPI?.getTransactions({
      txTypes,
      limit: 50,
    })
    if (value.totalNum) {
      setTotals(value?.totalNum)
      setRowData(() => {
        return value?.transactions?.map((item) => {
          const tokenInfo = tokenMap[addressIndex[item.tokenAddress]]
          return {
            symbol: tokenInfo.symbol,
            amount: sdk
              .toBig(item.amount)
              .div('1e' + tokenInfo.decimals)
              .toString(),
          }
        })
      })
    }

    setLoading(false)
  }
  return { rowData, total, getList, isLoading }
}
export const useData = () => {
  const { tokenMap } = useTokenMap()
  const { rowData: delivering, getList: getDelivering } = useGetTransaction({})
  return {}
}
