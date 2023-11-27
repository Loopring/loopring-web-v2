import { LoopringAPI, useAccount, useTokenMap } from '@loopring-web/core'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'

import { getValuePrecisionThousand } from '@loopring-web/common-resources'
import { account } from '@loopring-web/component-lib'
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
    if (LoopringAPI.coworkerAPI) {
      setLoading(true)
      const response = await LoopringAPI.coworkerAPI.getUserTransactions({
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
  }
  return { rowData, total, getList, isLoading, page }
}
export const useGetProduct = ({ filter, limit = 50 }: any) => {
  const [rowData, setRowData] = React.useState([])
  const [total, setTotals] = React.useState(0)
  const [page, setPage] = React.useState(1)
  const [isLoading, setLoading] = React.useState(false)
  const { tokenMap } = useTokenMap()
  const getList = async ({
    page = 1,
    investmentStatuses = [sdk.Layer1DualInvestmentStatus.DUAL_SETTLED],
    filter = {},
    limit = 50,
  }: {
    investmentStatuses?: sdk.Layer1DualInvestmentStatus[]
    page?: number
    filter?: any
    limit?: number
  }) => {
    setLoading(true)
    const response = await LoopringAPI.coworkerAPI?.getProducts({
      limit,
      offset: page - 1,
      investmentStatuses,
      ...filter,
    })
    setPage(page - 1)
    if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
    } else {
      setTotals((response as any).totalNum)

      setRowData(() => {
        const indexes = (response as any).indexes
        return (response as any).products.map((item) => {
          const index = indexes?.find(
            (_item) => item.base === _item.base && item.quote == _item.quote,
          )
          return {
            ...item,
            product: (item.investedBase ? `Sell High ` : `Buy Low `) + `${item.base}/${item.quote}`,
            targetPrice: item.strike?.toString(),
            currentPrice: index?.index,
            investAmountStr: getValuePrecisionThousand(
              sdk.toBig(item.investAmount).div('1e' + tokenMap[item.investToken]?.decimals),
              tokenMap[item.investToken]?.precision,
              tokenMap[item.investToken]?.precision,
            ),
            toBeSettledAmount: getValuePrecisionThousand(
              sdk
                .toBig(item.toBeSettledAmount)
                .div('1e' + tokenMap[item.toBeSettledToken]?.decimals),
              tokenMap[item.toBeSettledToken]?.precision,
              tokenMap[item.toBeSettledToken]?.precision,
            ),
            supplliedAmount: item.isSwap
              ? getValuePrecisionThousand(
                  sdk.toBig(item.investAmount).div('1e' + tokenMap[item.investToken]?.decimals),
                  tokenMap[item.investToken]?.precision,
                  tokenMap[item.investToken]?.precision,
                )
              : getValuePrecisionThousand(
                  sdk
                    .toBig(item.toBeSettledAmount)
                    .minus(item.investAmount)
                    .div('1e' + tokenMap[item.toBeSettledToken]?.decimals),
                  tokenMap[item.toBeSettledToken]?.precision,
                  tokenMap[item.toBeSettledToken]?.precision,
                ),
            supplliedToken: item.toBeSettledToken,
            receivedAmount: item.isSwap
              ? getValuePrecisionThousand(
                  sdk.toBig(item.investAmount).div('1e' + tokenMap[item.investToken]?.decimals),
                  tokenMap[item.investToken]?.precision,
                  tokenMap[item.investToken]?.precision,
                )
              : 0,
            receivedToken: item.investToken,
            // settlementTime:
          }
        })
      })
      setLoading(false)
    }
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
    filter,
  }: any) => {
    if (LoopringAPI.coworkerAPI) {
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
  const { account } = useAccount()

  const {
    rowData: product,
    total: productTotal,
    getList: getProduct,
    isLoading: productLoading,
    page: productPage,
  } = useGetProduct({})
  // const {getList:getGetUseTransaction}= useGetUseTransaction()

  const onExport = async () => {
    if (LoopringAPI.coworkerAPI && account.accAddress) {
      const list: any[] = []
      const response = await LoopringAPI.coworkerAPI.getUserTransactions({
        user: account.accAddress,
        investmentStatuses: [
          sdk.Layer1DualOrderStatus.DUAL_ORDER_CANCELLED,
          sdk.Layer1DualOrderStatus.DUAL_ORDER_SUBMITTED,
          sdk.Layer1DualOrderStatus.DUAL_ORDER_CONFIRMED,
          sdk.Layer1DualOrderStatus.DUAL_ORDER_FILLED,
          sdk.Layer1DualOrderStatus.DUAL_ORDER_PARTIAL_FILLED,
          sdk.Layer1DualOrderStatus.DUAL_ORDER_CANCELLED,
          sdk.Layer1DualOrderStatus.DUAL_ORDER_REJECTED,
        ].join(','),
        // settlementStatuses?: string;
        // fromId?: number;
        limit: 50,
      })
      const index = Math.floor(response.totalNum / 50)
      let promise: any[] = []
      let from = 1
      list.concat(response.transactions)
      while (index >= from) {
        promise = [
          await LoopringAPI.coworkerAPI.getUserTransactions({
            user: account.accAddress,
            investmentStatuses: [
              sdk.Layer1DualOrderStatus.DUAL_ORDER_CANCELLED,
              sdk.Layer1DualOrderStatus.DUAL_ORDER_SUBMITTED,
              sdk.Layer1DualOrderStatus.DUAL_ORDER_CONFIRMED,
              sdk.Layer1DualOrderStatus.DUAL_ORDER_FILLED,
              sdk.Layer1DualOrderStatus.DUAL_ORDER_PARTIAL_FILLED,
              sdk.Layer1DualOrderStatus.DUAL_ORDER_CANCELLED,
              sdk.Layer1DualOrderStatus.DUAL_ORDER_REJECTED,
            ].join(','),
            offset: 50 * from,
            limit: 50,
          }),
        ].concat(promise)
        from++
      }
      Promise.all(promise).then((arg) => {
        arg.map(({ transactions }) => {
          list.concat(transactions)
        })
      })
    }
  }

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
    onExport,
    // txRowData,
    // getTxRowData,
  }
}
