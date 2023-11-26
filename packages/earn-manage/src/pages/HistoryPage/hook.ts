import { LoopringAPI, useAccount, useTokenMap } from '@loopring-web/core'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'

import { getValuePrecisionThousand } from '@loopring-web/common-resources'
import { useGetProduct } from '../AssetPage/hook'
export enum RecordIndex {
  Transactions = 'Transactions',
  DualInvestment = 'DualInvestment',
}
const useGetUseTransaction = ({ filter }: any) => {
  const { tokenMap, addressIndex } = useTokenMap()
  const { account } = useAccount()

  const [page, setPage] = React.useState(1)

  const [rowData, setRowData] = React.useState([])
  const [total, setTotals] = React.useState(0)
  const [isLoading, setLoading] = React.useState(false)
  const getList = async ({
    limit = 50,
    investmentStatuses = [
      sdk.Layer1DualOrderStatus.DUAL_ORDER_CANCELLED,
      sdk.Layer1DualOrderStatus.DUAL_ORDER_SUBMITTED,
      sdk.Layer1DualOrderStatus.DUAL_ORDER_CONFIRMED,
      sdk.Layer1DualOrderStatus.DUAL_ORDER_FILLED,
      sdk.Layer1DualOrderStatus.DUAL_ORDER_PARTIAL_FILLED,
      sdk.Layer1DualOrderStatus.DUAL_ORDER_CANCELLED,
      sdk.Layer1DualOrderStatus.DUAL_ORDER_REJECTED,
    ],
  }: any) => {
    setLoading(true)
    const response = await LoopringAPI.coworkerAPI?.getUserTransactions({
      user: account.accAddress,
      // start?: number;
      // end?: number;
      // dualTypes:dualTypes.join(',') ,
      investmentStatuses: investmentStatuses.join(','),
      // settlementStatuses?: string;
      // fromId?: number;
      offset: page - 1,
      limit,
    })
    setPage(page)
    if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
    } else {
      setTotals(response?.totalNum)
      setRowData(() => {
        return response.transactions.map((item) => {
          const investToken = item.dualType == sdk.DUAL_TYPE.DUAL_BASE ? item.base : item.quote
          const investAmount = item.amount
          return {
            ...item,
            product:
              (item.dualType == sdk.DUAL_TYPE.DUAL_BASE ? `Sell High ` : `Buy Low `) +
              `${item.base}/${item.quote}`,
            targetPrice: item?.product?.strike?.toString(),
            investAmountStr: getValuePrecisionThousand(
              sdk.toBig(investAmount).div('1e' + tokenMap[investToken]?.decimals),
              tokenMap[investToken]?.precision,
              tokenMap[investToken]?.precision,
            ),
            investToken,
            toBeSettledAmount: getValuePrecisionThousand(
              sdk.toBig(item.desireAmountS).div('1e' + tokenMap[investToken]?.decimals),
              tokenMap[investToken]?.precision,
              tokenMap[investToken]?.precision,
            ),
            supplliedAmount: getValuePrecisionThousand(
              sdk.toBig(investAmount).div('1e' + tokenMap[investToken]?.decimals),
              tokenMap[investToken]?.precision,
              tokenMap[investToken]?.precision,
            ),
            supplliedToken: item?.toBeSettledToken,
            receivedAmount: getValuePrecisionThousand(
              sdk.toBig(investAmount).div('1e' + tokenMap[investToken]?.decimals),
              tokenMap[investToken]?.precision,
              tokenMap[investToken]?.precision,
            ),
            receivedToken: investToken,
            settlementTime: item.timeOrigin?.settlementTime,
          }
        })
      })
    }

    setLoading(false)
  }
  return { rowData, total, getList, isLoading, page }
}

const useGetTransaction = ({ filter }: any) => {
  const { tokenMap, addressIndex } = useTokenMap()
  const { account } = useAccount()

  const [page, setPage] = React.useState(1)

  const [rowData, setRowData] = React.useState([])
  const [total, setTotals] = React.useState(0)
  const [isLoading, setLoading] = React.useState(false)
  const getList = async ({
    txTypes = [sdk.TransactionType.DEPOSIT, sdk.TransactionType.ONCHAIN_WITHDRAWAL],
    limit = 50,
    page = 1,
  }: any) => {
    setLoading(true)
    const response = await LoopringAPI.coworkerAPI?.getTransactions({
      user: account.accAddress,
      limit,
      offset: page - 1,
      txTypes,
    })
    setPage(page)
    if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
    } else {
      setTotals(response?.totalNum)
      setRowData(() => {
        return (
          response?.transactions?.map((item) => {
            const tokenInfo = tokenMap[addressIndex[item.tokenAddress?.toLowerCase()]]
            return {
              ...item,
              symbol: tokenInfo.symbol,
              amount: getValuePrecisionThousand(
                sdk.toBig(item.amount).div('1e' + tokenInfo.decimals),
                tokenMap[tokenInfo.symbol]?.precision,
                tokenMap[tokenInfo.symbol]?.precision,
              ),
            }
          }) ?? []
        )
      })
    }

    setLoading(false)
  }
  return { rowData, total, getList, isLoading, page }
}
export const useData = () => {
  const {
    rowData: txRowData,
    total: txTotal,
    getList: getTxRowData,
    isLoading: txLoading,
    page: pageTxPage,
  } = useGetTransaction({})
  // const {
  //   rowData: product,
  //   total: productTotal,
  //   getList: getProduct,
  //   isLoading: productLoading,
  //   page: productPage,
  // } = useGetUseTransaction({})
  const {
    rowData: product,
    total: productTotal,
    getList: getProduct,
    isLoading: productLoading,
    page: productPage,
  } = useGetProduct({})

  return {
    product,
    productTotal,
    getProduct,
    productPage,
    productLoading,
    getTxRowData,
    txRowData,
    txLoading,
    pageTxPage,
    txTotal,
    // txRowData,
    // getTxRowData,
  }
}
