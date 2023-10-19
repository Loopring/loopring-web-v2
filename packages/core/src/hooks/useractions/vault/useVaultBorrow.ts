import {
  getValuePrecisionThousand,
  IBData,
  TradeBtnStatus,
  VaultBorrowData,
} from '@loopring-web/common-resources'
import {
  AccountStep,
  SwitchData,
  useOpenModals,
  VaultBorrowProps,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import {
  store,
  useSystem,
  useTokenMap,
  useTradeVault,
  useVaultLayer2,
  useVaultMap,
} from '../../../stores'
import React from 'react'
import { makeVaultAvaiable2 } from '../../help'
import * as sdk from '@loopring-web/loopring-sdk'
import { LoopringAPI } from '../../../api_wrapper'
import { walletLayer2Service } from '../../../services'
import { useSubmitBtn } from '../../common'
import BigNumber from 'bignumber.js'

export const useVaultBorrow = <
  T extends IBData<I> & { erc20Symbol: string },
  V extends VaultBorrowData<T>,
  I,
>(): Partial<VaultBorrowProps<T, V, I>> => {
  const { t } = useTranslation()
  const {
    modals: { istShowVaultLoad },
    setShowAccount,
    setShowVaultLoad,
  } = useOpenModals()
  const { exchangeInfo } = useSystem()
  const { idIndex } = useTokenMap()

  const { tokenMap: vaultTokenMap, coinMap: vaultCoinMap, marketCoins } = useVaultMap()

  const calcSupportData = (tradeData: T) => {
    let supportData: any = {
      maxBorrowAmount: undefined,
      maxBorrowStr: undefined,
      minBorrowAmount: undefined,
      minBorrowStr: undefined,
      maxBorrowVol: undefined,
      minBorrowVol: undefined,
      maxQuote: undefined,
      borrowVol: undefined,
      borrowAmt: undefined,
      totalQuote: undefined,
    }
    if (tradeData.belong) {
      const borrowToken = vaultTokenMap[tradeData.belong]
      const orderAmounts = borrowToken.orderAmounts
      const minBorrowVol = BigNumber.max(orderAmounts.dust, orderAmounts?.minimum)
      const minBorrowAmt = minBorrowVol.div('1e' + borrowToken.decimals)
      //no decimal vaule
      const totalQuote = sdk.toBig(orderAmounts.maximum ?? 0).div('1e' + borrowToken.decimals)
      const maxBorrowAmt = BigNumber.max(totalQuote, tradeData.balance)

      const maxBorrowVol = maxBorrowAmt.times('1e' + borrowToken.decimals)
      const tradeVaule = tradeData.tradeValue
      supportData = {
        maxBorrowAmount: maxBorrowAmt?.toString(),
        maxBorrowStr: getValuePrecisionThousand(
          maxBorrowAmt ?? 0,
          borrowToken.precision,
          borrowToken.precision,
          undefined,
        ),
        minBorrowAmount: minBorrowAmt?.toString(),
        minBorrowStr: getValuePrecisionThousand(
          minBorrowAmt ?? 0,
          borrowToken.precision,
          borrowToken.precision,
          undefined,
        ),
        maxBorrowVol: maxBorrowVol.toString(),
        minBorrowVol: minBorrowVol.toString(),
        maxQuote: orderAmounts.maximum,
        borrowVol: sdk
          .toBig(tradeVaule ?? 0)
          .times('1e' + borrowToken.decimals)
          .toString(),
        borrowAmt: tradeVaule ?? 0,
        totalQuote: totalQuote.toString(),
      }
    }
    return {
      ...supportData,
    }
  }
  const { vaultAccountInfo, status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  const { vaultBorrowData, updateVaultBorrow, resetVaultBorrow } = useTradeVault()
  const [tradeData, setTradeData] = React.useState<T | undefined>(undefined)
  const initData = () => {
    let vaultBorrowData: any = {}
    let initSymbol = marketCoins[0]
    if (istShowVaultLoad.info?.symbol) {
      initSymbol = istShowVaultLoad.info?.symbol
    }
    let { vaultAvaiable2Map } = makeVaultAvaiable2({})
    vaultBorrowData = {
      ...vaultBorrowData,
      vaultAvaiable2Map,
      coinMap: vaultCoinMap,
    }
    let walletInfo
    walletInfo = {
      belong: initSymbol,
      balance: (vaultAvaiable2Map && vaultAvaiable2Map[initSymbol.toString()]?.count) ?? 0,
      tradeValue: undefined,
      erc20Symbol: idIndex[vaultTokenMap[initSymbol].tokenId],
    }
    vaultBorrowData = {
      ...vaultBorrowData,
      walletInfo,
      tradeData: walletInfo,
    }

    setTradeData({
      ...walletInfo,
    })

    updateVaultBorrow({
      ...walletInfo,
      ...vaultBorrowData,
      ...calcSupportData(walletInfo),
    })
  }
  React.useEffect(() => {
    if (istShowVaultLoad.isShow) {
      initData()
    } else {
      resetVaultBorrow()
    }
  }, [istShowVaultLoad.isShow])

  const handlePanelEvent = React.useCallback(async (data: SwitchData<T>) => {
    let vaultBorrowData = store.getState()._router_tradeVault.vaultBorrowData
    return new Promise<void>((res: any) => {
      if (data.to === 'button') {
        let { vaultAvaiable2Map } = makeVaultAvaiable2({})
        if (vaultAvaiable2Map && data?.tradeData?.belong) {
          let walletInfo: any = vaultAvaiable2Map[data?.tradeData?.belong as string]
          walletInfo = {
            ...walletInfo,
            balance: walletInfo ? walletInfo.count : 0,
            tradeValue: data.tradeData?.tradeValue,
          }
          vaultBorrowData = {
            ...vaultBorrowData,
            ...walletInfo,
            ...calcSupportData(walletInfo),
          }
          updateVaultBorrow({
            ...vaultBorrowData,
          })
        } else {
          updateVaultBorrow({
            belong: undefined,
            tradeValue: undefined,
            balance: undefined,
          })
        }
      }
      res()
    })
  }, [])

  const availableTradeCheck = React.useCallback(() => {
    // const vaultAccountInfoSymbol =
    //     vaultIdIndex[vaultAccountInfo?.collateralInfo?.collateralTokenId ?? ''] ?? ''
    const vaultBorrowData = store.getState()._router_tradeVault.vaultBorrowData
    if (!vaultBorrowData?.amount && sdk.toBig(vaultBorrowData?.amount ?? 0).lte(0)) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' }
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
    vaultTokenMap,
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
    const account = store.getState().account
    try {
      if (request || (vaultBorrowData.request && account)) {
        let response = LoopringAPI.vaultAPI?.submitVaultLoad({
          // @ts-ignore
          request: request ?? vaultBorrowData.request,
          privateKey: account?.eddsaKey?.sk,
          apiKey: account.apiKey,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }
        walletLayer2Service.sendUserUpdate()
        sdk.sleep(1000).then(() => updateVaultLayer2({}))

        setShowAccount({
          isShow: true,
          step: AccountStep.VaultBorrow_Success,
          info: {
            title: t('labelVaultBorrowTitle'),
          },
        })
        setShowVaultLoad({
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
    const vaultBorrowData = store.getState()._router_tradeVault.vaultBorrowData
    const account = store.getState().account
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

        const vaultBorrowRequest: sdk.VaultLoadRequest = {
          accountId: account.accountId,
          token: {
            tokenId: vaultTokenMap[vaultBorrowData.belong].vaultTokenId as unknown as number,
            volume: vaultBorrowData.volume,
          },
          timestamp: Date.now(),
        }

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
    handlePanelEvent,
    vaultBorrowBtnStatus: btnStatus,
    vaultBorrowBtnI18nKey: btnLabel,
    onVaultBorrowClick: onBtnClick,
    tradeData,
    vaultBorrowData,
  }
}
