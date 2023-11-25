import {
  LoopringAPI,
  store,
  useAccount,
  useSystem,
  useTokenMap,
  useWalletLayer1,
} from '@loopring-web/core'
import React from 'react'
import {
  AccountStatus,
  getValuePrecisionThousand,
  SagaStatus,
} from '@loopring-web/common-resources'
import * as configDefault from '../../config/dualConfig.json'
import { makeWalletInContract, makeWalletL1 } from '../../hooks'
import * as sdk from '@loopring-web/loopring-sdk'

export enum ProductsIndex {
  delivering = 'delivering',
  progress = 'progress',
}

export enum TxAction {
  deposit = 'deposit',
  withdraw = 'withdraw',
  settle = 'settle',
}

export const useShowModal = () => {
  const init = {
    isShowDeposit: { isShow: false, info: undefined },
    isShowWithdraw: { isShow: false, info: undefined },
    isShowSettle: { isShow: false, info: undefined },
    lastStep: undefined,
  }
  const [modal, setShow] = React.useState<{
    isShowDeposit: { isShow: boolean; info?: any }
    isShowWithdraw: { isShow: boolean; info?: any }
    isShowSettle: { isShow: boolean; info?: any }
    lastStep: TxAction | undefined
  }>({
    isShowDeposit: { isShow: false, info: undefined },
    isShowWithdraw: { isShow: false, info: undefined },
    isShowSettle: { isShow: false, info: undefined },
    lastStep: undefined,
  })
  const setShowDeposit = ({ isShow, info }: { isShow: boolean; info?: any }) => {
    setShow((state) => {
      return {
        ...init,
        isShowDeposit: { isShow, info },
        lastStep: TxAction.deposit,
      }
    })
  }
  const setShowWithdraw = ({ isShow, info }: { isShow: boolean; info?: any }) => {
    setShow((state) => {
      return {
        ...init,
        isShowWithdraw: { isShow, info },
        lastStep: TxAction.withdraw,
      }
    })
  }
  const setShowSettle = ({ isShow, info }: { isShow: boolean; info?: any }) => {
    setShow((state) => {
      return {
        ...init,
        isShowWithdraw: { isShow, info },
        lastStep: TxAction.settle,
      }
    })
  }
  return {
    modal,
    setShowDeposit,
    setShowWithdraw,
    setShowSettle,
  }
}

const useContactProd = ({ filter }: any) => {
  const { tokenMap, addressIndex } = useTokenMap()

  const [rowData, setRowData] = React.useState([])
  const [isLoading, setLoading] = React.useState(false)
  const getList = async ({}) => {
    setLoading(true)
    //TODO getLIST from Contact
    const list = []
    setRowData(() => {
      //TODO
      return list?.map((item) => {
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

    setLoading(false)
  }
  return { rowData, getList, isLoading }
}

const useGetProduct = ({ filter, limit = 50 }: any) => {
  const [rowData, setRowData] = React.useState([])
  const [total, setTotals] = React.useState(0)
  const [isLoading, setLoading] = React.useState(false)
  const { tokenMap } = useTokenMap()
  const getList = async ({
    page = 1,
    investmentStatuses = [sdk.Layer1DualInvestmentStatus.DUAL_SETTLED],
  }: {
    investmentStatuses?: sdk.Layer1DualInvestmentStatus[]
    page?: number
  }) => {
    setLoading(true)
    const response = await LoopringAPI.coworkerAPI?.getProducts({
      limit: 50,
      offset: page - 1,
      investmentStatuses,
    })
    if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
    } else {
      setTotals(response.totalNum)

      setRowData(() => {
        const indexes = response.indexes
        return response.products.map((item) => {
          const index = indexes?.find(
            (_item) => item.base === _item.base && item.quote == _item.quote,
          )
          return {
            ...item,
            product: (item.investedBase ? `Sell High ` : `Buy Low `) + `${item.base}/${item.quote}`,
            targetPrice: item.strike,
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
  return { rowData, total, getList, isLoading }
}

export const useData = () => {
  const { account, status: accountStatus } = useAccount()
  const { tokenMap, addressIndex } = useTokenMap()
  const { forexMap } = useSystem()
  const { walletLayer1 } = useWalletLayer1()
  const [{ assetData, assetTotal }, setAsset] = React.useState({
    assetData: configDefault?.tokenList?.reduce((prev, item) => {
      prev.push({
        symbol: tokenMap[item?.toUpperCase()?.toString()].symbol,
        amount: '0',
        value: '0',
      })
      return prev
    }, [] as { symbol: string; amount: string; value: string }[]),
    assetTotal: 0,
  })

  const [{ protocolData, protocolTotal }, setProtocolData] = React.useState({
    protocolData: configDefault?.tokenList?.reduce((prev, item) => {
      prev.push({
        symbol: tokenMap[item?.toUpperCase()?.toString()].symbol,
        amount: '0',
        value: '0',
      })
      return prev
    }, [] as { symbol: string; amount: string; value: string }[]),
    protocolTotal: 0,
  })

  const {
    rowData: product,
    total: productTotal,
    getList: getProduct,
    isLoading: productLoading,
  } = useGetProduct({})
  const { getList: getDeliver, rowData: delivering } = useContactProd({})
  const { getList: getProgress, rowData: progress } = useContactProd({})

  // const { rowData: product, total: productTotal, getList: getProduct } = useGetProduct({})

  // const =dualManageConfig

  const { setShowDeposit, setShowSettle, setShowWithdraw, modal } = useShowModal()
  // dualManageConfig.tokenList
  const deposit = (symbol) => {}
  const withdraw = (symbol) => {}
  const settle = (symbol) => {}
  const getL1Balance = async () => {
    const walletL1 = makeWalletL1()
    setAsset((_) => {
      const assetData = configDefault?.tokenList?.reduce((prev, item) => {
        let assetTotal = sdk.toBig(0)
        const walletItem = walletL1[item?.toUpperCase()]
        if (walletItem) {
          const value = sdk.toBig(walletItem.count).times(forexMap[item?.toUpperCase()]).toString()
          prev.push({
            symbol: tokenMap[item?.toUpperCase()?.toString()].symbol,
            amount: walletItem.count.toString(),
            value,
          })
          assetTotal.plus(value)
        } else {
          prev.push({
            symbol: tokenMap[item?.toUpperCase()?.toString()].symbol,
            amount: '0',
            value: '0',
          })
        }
        return prev
      }, [] as { symbol: string; amount: string; value: string }[])
      return {
        assetData,
        assetTotal: assetTotal.toString(),
      }
    })
  }
  const getL1ContractBalance = () => {
    //TODO
    const walletContract = makeWalletInContract()
    setProtocolData((_) => {
      const protocolData = configDefault?.tokenList?.reduce((prev, item) => {
        let protocolTotal = sdk.toBig(0)
        const walletItem = walletContract[item?.toUpperCase()]
        if (walletItem) {
          const value = sdk.toBig(walletItem.count).times(forexMap[item?.toUpperCase()]).toString()
          prev.push({
            symbol: tokenMap[item?.toUpperCase()?.toString()].symbol,
            amount: walletItem.count.toString(),
            value,
          })
          protocolTotal.plus(value)
        } else {
          prev.push({
            symbol: tokenMap[item?.toUpperCase()?.toString()].symbol,
            amount: '0',
            value: '0',
          })
        }
        return prev
      }, [] as { symbol: string; amount: string; value: string }[])
      return {
        protocolData,
        protocoltTotal: assetTotal.toString(),
      }
    })
  }
  React.useEffect(() => {
    // getProgress({ txTypes: [sdk.TransactionType.DEPOSIT] })
    getProduct({ page: 1, investmentStatuses: [sdk.Layer1DualInvestmentStatus.DUAL_SETTLED] })
  }, [])
  React.useEffect(() => {
    const account = store.getState().account
    if (accountStatus === SagaStatus.UNSET && account.readyState !== AccountStatus.UN_CONNECT) {
      getL1Balance()
      getL1ContractBalance()
      getDeliver({})
      getProgress({})
    }
  }, [accountStatus])
  return {
    protocolData,
    protocolTotal,
    assetData,
    assetTotal,
    delivering,
    progress,
    setShowDeposit,
    setShowSettle,
    setShowWithdraw,
    modal,
    deposit,
    withdraw,
    settle,
    getProduct,
    products: {
      list: product,
      total: productTotal,
      productLoading,
      // [ProductsIndex.progress]: {
      //   list: [] as any,
      //   total: 10000,
      // },
      // [ProductsIndex.delivering]: {
      //   list: [] as any,
      //   total: 10000,
      // },
    },
  }
}
