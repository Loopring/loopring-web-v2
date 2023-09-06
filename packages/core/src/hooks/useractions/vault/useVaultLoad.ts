import {
  AccountStep,
  useOpenModals,
  VaultBorrowWrapProps,
  VaultLoadType,
  VaultRepayWrapProps,
} from '@loopring-web/component-lib'
import {
  store,
  useAccount,
  useSystem,
  useTradeVault,
  useVaultLayer2,
  useVaultMap,
} from '../../../stores'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import { TradeBtnStatus } from '@loopring-web/common-resources'
import { LoopringAPI } from '../../../api_wrapper'
import { ConnectProvidersSignMap, connectProvides } from '@loopring-web/web3-provider'
import { walletLayer2Service } from '../../../services'

import { useSubmitBtn } from '../../common'

export const useVaultBorrow = <T, I, B, C>(): Partial<VaultBorrowWrapProps<T, I, B, C>> => {
  const { setShowAccount, setShowVaultBorrow } = useOpenModals()
  const { account } = useAccount()
  const { exchangeInfo, allowTrade } = useSystem()

  const { tokenMap, idIndex, marketMap, coinMap, marketArray, marketCoins, getVaultMap } =
    useVaultMap()
  const { vaultAccountInfo, status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  const { vaultBorrowData, updateVaultBorrow, resetVaultBorrow } = useTradeVault()
  const { exchangeInfo, allowTrade } = useSystem()
  const [tradeData, setTradeData] = React.useState<T | undefined>(undefined)

  const availableTradeCheck = React.useCallback(() => {
    const vaultAccountInfoSymbol =
      idIndex[vaultAccountInfo?.collateralInfo?.collateralTokenId ?? ''] ?? ''
    const vaultBorrowData = store.getState()._router_tradeVault.vaultBorrowData
    if (!vaultBorrowData?.amount && sdk.toBig(vaultBorrowData?.amount ?? 0).lte(0)) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' }
    } else if (vaultAccountInfoSymbol) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'labelVaultBorrowMax' }
    } else if (sdk.toBig(vaultBorrowData.amount).lte(vaultBorrowData.minAmount)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultBorrowMini|${vaultBorrowData.minShowVal} ${vaultBorrowData.belong}`,
      }
    } else if (sdk.toBig(vaultBorrowData.tradeValue ?? 0).gte(vaultBorrowData.balance ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultBorrowNotEnough ${vaultBorrowData.belong}`,
      }
    } else if (sdk.toBig(vaultBorrowData.amount ?? 0).gte(vaultBorrowData.maxAmount ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultBorrowMax|${vaultBorrowData.maxShowVal} ${vaultBorrowData.belong}`,
      }
    } else if (sdk.toBig(vaultBorrowData.amount ?? 0).gte(vaultBorrowData.maxAmount ?? 0)) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'labelVaultBorrowMax' }
    } else {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
    }
  }, [
    vaultAccountInfoStatus,
    tokenMap,
    vaultBorrowData,
    vaultBorrowData.tradeValue,
    vaultBorrowData.balance,
    vaultBorrowData.amount,
    vaultBorrowData.maxAmount,
    vaultBorrowData.minAmount,
    vaultBorrowData.belong,
  ])
  const processRequest = async (request?: sdk.VaultLoadRequest) => {
    const vaultBorrowData = store.getState()._router_tradeVault.vaultBorrowData
    try {
      if (request || vaultBorrowData.request) {
        let response = LoopringAPI.vaultAPI?.submitVaultLoad({
          // @ts-ignore
          request: request ?? vaultBorrowData.request,
          eddsaKey: account.eddsaKey.sk,
          apiKey: account.apiKey,
          web3: connectProvides.usedWeb3 as any,
          chainId: chainId === 'unknown' ? 1 : chainId,
          walletType: (ConnectProvidersSignMap[account.connectName] ??
            account.connectName) as unknown as sdk.ConnectorNames,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }
        walletLayer2Service.sendUserUpdate()
        sdk.sleep(1000).then(() => updateVaultLayer2())

        setShowAccount({
          isShow: true,
          step: AccountStep.VaultBorrow_Success,
          info: {
            title: t('labelVaultBorrowTitle'),
          },
        })
        setShowVaultBorrow({
          isShow: false,
        })
      } else {
        throw 'no data'
      }
    } catch (e) {
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultRedeem_Failed,
        info: {
          title: t('labelVaultBorrowTitle'),
        },
      })
    }
  }

  const submitCallback = async () => {
    try {
      if (
        vaultBorrowData &&
        exchangeInfo &&
        vaultBorrowData.belong &&
        LoopringAPI.vaultAPI &&
        LoopringAPI.userAPI &&
        vaultAccountInfo &&
        sdk.toBig(vaultBorrowData.amount).gte(vaultBorrowData.minAmount ?? 0) &&
        sdk.toBig(vaultBorrowData.amount).lte(vaultBorrowData.maxAmount ?? 0)
      ) {
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultBorrow_In_Progress,
          info: {
            title: t('labelVaultBorrowTitle'),
          },
        })

        const vaultBorrowRequest: sdk.VaultLoadRequest = {}

        updateVaultBorrow({
          ...vaultBorrowData,
          __request__: vaultBorrowRequest,
          request: vaultBorrowRequest,
        })
        processRequest(vaultBorrowRequest)
      }
    } catch (e) {
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultBorrow_Failed,
        error: {
          ...(e as any),
        },
      })
      //TODO: catch
    }
  }

  const {
    btnStatus,
    onBtnClick,
    btnLabel,
    // btnStyle: tradeLimitBtnStyle,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading: false,
    submitCallback,
  })

  return {
    vaultBorrowBtnStatus: btnStatus,
    vaultBorrowBtnI18nKey: btnLabel,
    onVaultBorrowClick: onBtnClick,
    tradeData,
    vaultBorrowData,
  }
}

export const useVaultRepay = <T, I, B, C>(): Partial<VaultRepayWrapProps<T, I, B, C>> => {
  const { setShowAccount } = useOpenModals()
  const { vaultAccountInfo, status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  const { account } = useAccount()
  const { tokenMap, idIndex, marketMap, coinMap, marketArray, marketCoins, getVaultMap } =
    useVaultMap()
  const [tradeData, setTradeData] = React.useState<T | undefined>(undefined)

  const { vaultRepayData, updateVaultRepay, resetVaultRepay } = useTradeVault()
  const { exchangeInfo, allowTrade } = useSystem()
  const availableTradeCheck = React.useCallback(() => {
    const vaultAccountInfoSymbol =
      idIndex[vaultAccountInfo?.collateralInfo?.collateralTokenId ?? ''] ?? ''
    const vaultRepayData = store.getState()._router_tradeVault.vaultRepayData
    if (!vaultRepayData?.amount && sdk.toBig(vaultRepayData?.amount ?? 0).lte(0)) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' }
    } else if (vaultAccountInfoSymbol && vaultRepayData.belong !== vaultAccountInfoSymbol) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'labelVaultRepayMax' }
    } else if (sdk.toBig(vaultRepayData.amount).lte(vaultRepayData.minAmount)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultRepayMini|${vaultRepayData.minShowVal} ${vaultRepayData.belong}`,
      }
    } else if (sdk.toBig(vaultRepayData.tradeValue ?? 0).gte(vaultRepayData.balance ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultRepayNotEnough ${vaultRepayData.belong}`,
      }
    } else if (sdk.toBig(vaultRepayData.amount ?? 0).gte(vaultRepayData.maxAmount ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultRepayMax|${vaultRepayData.maxShowVal} ${vaultRepayData.belong}`,
      }
    } else if (sdk.toBig(vaultRepayData.amount ?? 0).gte(vaultRepayData.maxAmount ?? 0)) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: 'labelVaultRepayMax' }
    } else {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
    }
  }, [
    vaultAccountInfoStatus,
    tokenMap,
    vaultRepayData,
    vaultRepayData.tradeValue,
    vaultRepayData.balance,
    vaultRepayData.amount,
    vaultRepayData.maxAmount,
    vaultRepayData.minAmount,
    vaultRepayData.belong,
  ])
  const processRequest = async (request?: sdk.VaultRepayRequest) => {
    // const { apiKey, connectName, eddsaKey } = account
    const vaultRepayData = store.getState()._router_tradeVault.vaultRepayData
    try {
      if (request || vaultRepayData.request) {
        let response = LoopringAPI.vaultAPI?.submitVaultRepay({
          // @ts-ignore
          request: request ?? vaultRepayData.request,
          eddsaKey: account.eddsaKey.sk,
          apiKey: account.apiKey,
          web3: connectProvides.usedWeb3 as any,
          chainId: chainId === 'unknown' ? 1 : chainId,
          walletType: (ConnectProvidersSignMap[account.connectName] ??
            account.connectName) as unknown as sdk.ConnectorNames,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }
        walletLayer2Service.sendUserUpdate()
        sdk.sleep(1000).then(() => updateVaultLayer2())

        setShowAccount({
          isShow: true,
          step: AccountStep.VaultRepay_Success,
          info: {
            title: t('labelVaultRepayTitle'),
          },
        })
        setShowVaultRepay({
          isShow: false,
        })
      } else {
        throw 'no data'
      }
    } catch (e) {
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultRedeem_Failed,
        info: {
          title: t('labelVaultRepayTitle'),
        },
      })
    }
  }

  const submitCallback = async () => {
    try {
      if (
        vaultRepayData &&
        exchangeInfo &&
        vaultRepayData.belong &&
        LoopringAPI.vaultAPI &&
        LoopringAPI.userAPI &&
        vaultAccountInfo &&
        sdk.toBig(vaultRepayData.amount).gte(vaultRepayData.minAmount ?? 0) &&
        sdk.toBig(vaultRepayData.amount).lte(vaultRepayData.maxAmount ?? 0)
      ) {
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultRepay_In_Progress,
          info: {
            title: t('labelVaultRepayTitle'),
          },
        })
        //
        // const amount = sdk
        //   .toBig(vaultRepayData.amount)
        const vaultRepayRequest: sdk.VaultRepayRequest = {}
        //   exchange: exchangeInfo.exchangeAddress,
        //   accountId: account.accountId,
        //   storageId: storageId.orderId,
        //   sellToken: {
        //     tokenId: tokenMap[vaultRepayData.belong].tokenId,
        //     amount: amount.toString(),
        //   },
        //   buyToken: {
        //     //@ts-ignore
        //     tokenId: avaiableNFT.tokenId,
        //     //@ts-ignore
        //     nftData: avaiableNFT.nftData,
        //     amount: '1',
        //   },
        //   allOrNone: false,
        //   fillAmountBOrS: true,
        //   validUntil: getTimestampDaysLater(DAYS),
        //   maxFeeBips: 100,
        // }
        updateVaultRepay({
          ...vaultRepayData,
          __request__: vaultRepayRequest,
          request: vaultRepayRequest,
        })
        processRequest(vaultRepayRequest)
      }
    } catch (e) {
      setShowAccount({
        isShow: true,
        step: AccountStep.VaultRepay_Failed,
        error: {
          ...(e as any),
        },
      })
      //TODO: catch
    }
  }

  const {
    btnStatus,
    onBtnClick,
    btnLabel,
    // btnStyle: tradeLimitBtnStyle,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading: false,
    submitCallback,
  })
  return {
    vaultRepayBtnStatus: btnStatus,
    vaultRepayBtnI18nKey: btnLabel,
    onVaultRepayClick: onBtnClick,
    tradeData,
    vaultRepayData,
  }
}

export const useVaultLoad = () => {
  const {
    modals: {
      istShowVaultLoad: { type, isShow },
    },
  } = useOpenModals()
  const [vaultLoadType, setVaultLoadType] = React.useState(type ?? VaultLoadType.Borrow)
  const handleTabChange = (index: VaultLoadType) => {
    setVaultLoadType(index)
  }
  React.useEffect(() => {
    if (isShow) {
      setVaultLoadType(() => {
        return store.getState().modals?.istShowVaultLoad?.type ?? VaultLoadType.Borrow
      })
      // const withdrawValue =
    }
  }, [isShow])
  return {
    vaultRepayProps: useVaultRepay(),
    vaultBorrowProps: useVaultBorrow(),
    vaultLoadType,
    handleTabChange,
  }
}
