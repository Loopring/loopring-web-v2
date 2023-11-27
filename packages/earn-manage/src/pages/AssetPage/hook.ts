import { store, useAccount, useTokenMap, useTokenPrices } from '@loopring-web/core'
import React from 'react'
import { AccountStatus, MapChainId, SagaStatus } from '@loopring-web/common-resources'
import * as configDefault from '../../config/dualConfig.json'
import { makeWalletInContract, makeWalletL1 } from '../../hooks'
import * as sdk from '@loopring-web/loopring-sdk'
import { useOpenModals, useSettings, WalletConnectStep } from '@loopring-web/component-lib'
import { useGetProduct } from '../HistoryPage/hook'

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
        isShowSettle: { isShow, info },
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
        const tokenInfo = tokenMap[addressIndex[item?.tokenAddress?.toLowerCase()]]
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

export const useData = () => {
  const { account, status: accountStatus } = useAccount()
  const { tokenMap, addressIndex } = useTokenMap()
  const { tokenPrices } = useTokenPrices()
  const { setShowConnect } = useOpenModals()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const [{ assetData, assetTotal }, setAsset] = React.useState({
    assetData: configDefault[network]?.tokenList?.reduce((prev, item) => {
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
    protocolData: configDefault[network]?.tokenList?.reduce((prev, item) => {
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
    page: productPage,
  } = useGetProduct({})
  const { getList: getDeliver, rowData: delivering } = useContactProd({})
  const { getList: getProgress, rowData: progress } = useContactProd({})

  // const =dualManageConfig

  const { setShowDeposit, setShowSettle, setShowWithdraw, modal } = useShowModal()
  // dualManageConfig.tokenList
  const deposit = (symbol) => {
    if (account.readyState === AccountStatus.UN_CONNECT) {
      setShowConnect({ isShow: true, step: WalletConnectStep.Provider })
    } else {
      setShowDeposit({ isShow: true, info: { symbol } })
    }
  }
  const withdraw = (symbol) => {
    if (account.readyState === AccountStatus.UN_CONNECT) {
      setShowConnect({ isShow: true, step: WalletConnectStep.Provider })
    } else {
      setShowWithdraw({ isShow: true, info: { symbol } })
    }
  }
  const settle = (symbol) => {
    if (account.readyState === AccountStatus.UN_CONNECT) {
      setShowConnect({ isShow: true, step: WalletConnectStep.Provider })
    } else {
      setShowSettle({ isShow: true, info: { symbol } })
    }
  }
  const getL1Balance = async () => {
    const walletL1 = makeWalletL1()
    setAsset((_) => {
      const assetData = configDefault[network]?.tokenList?.reduce((prev, item) => {
        let assetTotal = sdk.toBig(0)
        const walletItem = walletL1[item?.toUpperCase()]
        if (walletItem) {
          const value = sdk
            .toBig(walletItem.count)
            .times(tokenPrices[item?.toUpperCase()])
            .toString()
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
      const protocolData = configDefault[network]?.tokenList?.reduce((prev, item) => {
        let protocolTotal = sdk.toBig(0)
        const walletItem = walletContract[item?.toUpperCase()]
        if (walletItem) {
          const value = sdk
            .toBig(walletItem.count)
            .times(tokenPrices[item?.toUpperCase()])
            .toString()
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
    const account = store.getState().account
    if (accountStatus === SagaStatus.UNSET && account.readyState !== AccountStatus.UN_CONNECT) {
      getL1Balance()
      getL1ContractBalance()
      getDeliver({})
      getProgress({})
    }
  }, [accountStatus, account.readyState])
  return {
    protocolData,
    protocolTotal,
    assetData,
    assetTotal,
    delivering: [] as any[],
    progress: [] as any[],
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
      page: productPage,
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
