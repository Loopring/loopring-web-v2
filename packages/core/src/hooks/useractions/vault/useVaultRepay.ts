import {
  getValuePrecisionThousand,
  IBData,
  TradeBtnStatus,
  VaultRepayData,
} from '@loopring-web/common-resources'
import { AccountStep, SwitchData, useOpenModals } from '@loopring-web/component-lib'
import {
  store,
  useAccount,
  useSystem,
  useTradeVault,
  useVaultLayer2,
  useVaultMap,
} from '../../../stores'
import { useTranslation } from 'react-i18next'
import React from 'react'
import * as sdk from '@loopring-web/loopring-sdk'
import { makeVaultRepay } from '../../help'
import { LoopringAPI } from '../../../api_wrapper'
import { walletLayer2Service } from '../../../services'
import { useSubmitBtn } from '../../common'
import BigNumber from 'bignumber.js'

export const useVaultRepay = <T extends IBData<I>, V extends VaultRepayData<T>, I>() => {
  // const { setShowAccount } = useOpenModals()
  const {
    modals: { istShowVaultLoad },
    setShowAccount,
    setShowVaultLoad,
  } = useOpenModals()
  const { vaultAccountInfo, status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  const { account } = useAccount()
  const { tokenMap: vaultTokenMap, idIndex: vaultIdIndex, coinMap: vaultCoinMap } = useVaultMap()
  const { t } = useTranslation()
  const { vaultRepayData, updateVaultRepay, resetVaultRepay } = useTradeVault()
  const { exchangeInfo, forexMap } = useSystem()
  const [isLoading, setIsLoading] = React.useState(false)
  const [walletMap, setWalletMap] = React.useState(() => {
    return makeVaultRepay({ needFilterZero: true }).vaultAvaiable2Map
  })
  const [tradeData, setTradeData] = React.useState<T | undefined>(undefined)

  const calcSupportData = (tradeData: T) => {
    let supportData = {}
    if (tradeData?.belong) {
      const vaultToken = vaultTokenMap[tradeData.belong as any]
      const borrowToken = vaultTokenMap[tradeData.belong]
      const orderAmounts = borrowToken.orderAmounts
      const minRepayVol = BigNumber.max(orderAmounts.dust, orderAmounts?.minimum)
      const minRepayAmt = minRepayVol.div('1e' + borrowToken.decimals)
      const tradeVaule = tradeData.tradeValue

      supportData = {
        maxRepayAmount: tradeData.balance,
        maxRepayStr: getValuePrecisionThousand(
          tradeData.balance,
          // sdk.toBig(vaultToken.btradeAmount).div('1e' + vaultToken.decimals),
          vaultToken.precision,
          vaultToken.precision,
          undefined,
        ),
        minRepayAmount: minRepayAmt,
        minRepayStr: getValuePrecisionThousand(
          minRepayAmt,
          // sdk.toBig(vaultToken.btradeAmount).div('1e' + vaultToken.decimals),
          vaultToken.precision,
          vaultToken.precision,
          undefined,
        ),
        maxRepayVol: sdk
          .toBig(tradeData.balance)
          .times('1e' + vaultToken.decimals)
          .toString(),
        minRepayVol: minRepayVol.toString(),
        repayVol: sdk
          .toBig(tradeVaule ?? 0)
          .times('1e' + borrowToken.decimals)
          .toString(),
        repayAmtStr: getValuePrecisionThousand(
          tradeVaule ?? 0,
          borrowToken.precision,
          borrowToken.precision,
          undefined,
        ),
        repayAmt: tradeVaule ?? 0,
        coinInfoMap: vaultCoinMap,
      }
    }
    return {
      ...supportData,
    }
  }
  // useVaultSocket()
  const initData = () => {
    let vaultRepayData: any = {}
    let initSymbol = vaultIdIndex[vaultAccountInfo?.collateralInfo?.collateralTokenId ?? ''] ?? ''
    const walletMap = makeVaultRepay({ needFilterZero: true }).vaultAvaiable2Map ?? {}
    setWalletMap(walletMap)

    let walletInfo
    walletInfo = {
      belong: initSymbol,
      balance: walletMap[initSymbol.toString()]?.count ?? 0,
      tradeValue: undefined,
    }
    vaultRepayData = {
      ...vaultRepayData,
      walletMap,
      coinMap: vaultCoinMap,
    }

    setTradeData({
      ...walletInfo,
    })

    updateVaultRepay({
      ...walletInfo,
      ...vaultRepayData,
      ...calcSupportData(walletInfo),
    })
  }
  React.useEffect(() => {
    if (istShowVaultLoad.isShow) {
      initData()
    } else {
      resetVaultRepay()
    }
  }, [istShowVaultLoad.isShow])
  const availableTradeCheck = React.useCallback(() => {
    const vaultRepayData = store.getState()._router_tradeVault.vaultRepayData
    if (
      !vaultRepayData?.tradeValue ||
      !vaultRepayData?.belong ||
      sdk.toBig(vaultRepayData?.tradeValue ?? 0).lte(0)
    ) {
      return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' }
    } else if (sdk.toBig(vaultRepayData?.tradeValue ?? 0).lte(vaultRepayData.minRepayAmount)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultBorrowMini|${vaultRepayData.minRepayStr} ${vaultRepayData.belong}`,
      }
    } else if (sdk.toBig(vaultRepayData.tradeValue ?? 0).gte(vaultRepayData.balance ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultBorrowNotEnough|${vaultRepayData.belong}`,
      }
    } else if (sdk.toBig(vaultRepayData.tradeValue ?? 0).gte(vaultRepayData.maxRepayAmount ?? 0)) {
      return {
        tradeBtnStatus: TradeBtnStatus.DISABLED,
        label: `labelVaultBorrowMax|${vaultRepayData.maxRepayStr} ${vaultRepayData.belong}`,
      }
    } else {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
    }
  }, [
    vaultAccountInfoStatus,
    vaultTokenMap,
    vaultRepayData,
    vaultRepayData.belong,
    vaultRepayData.tradeValue,
    vaultRepayData.balance,
    vaultRepayData.maxRepayAmount,
    vaultRepayData.minRepayAmount,
  ])
  const handlePanelEvent = React.useCallback(
    async (data: SwitchData<T>) => {
      let vaultRepayData = store.getState()._router_tradeVault.vaultRepayData
      return new Promise<void>((res: any) => {
        if (data.to === 'button') {
          const walletMap = makeVaultRepay({ needFilterZero: true }).vaultAvaiable2Map ?? {}
          setWalletMap(walletMap)
          if (walletMap && data?.tradeData?.belong) {
            let walletInfo: any = walletMap[data?.tradeData?.belong as string]
            walletInfo = {
              ...walletInfo,
              balance: walletInfo ? walletInfo.count : 0,
              tradeValue: data.tradeData?.tradeValue,
            }
            vaultRepayData = {
              ...vaultRepayData,
              ...walletInfo,
              ...calcSupportData(walletInfo),
              walletMap,
              tradeData: walletInfo,
            }
            updateVaultRepay({
              ...vaultRepayData,
            })
          } else {
            updateVaultRepay({
              belong: undefined,
              tradeValue: undefined,
              balance: undefined,
            })
          }
        }
        res()
      })
    },
    [tradeData, account.readyState],
  )

  const processRequest = async (request?: sdk.VaultRepayRequest) => {
    const account = store.getState().account
    const vaultRepayData = store.getState()._router_tradeVault.vaultRepayData
    try {
      if (request || vaultRepayData.request) {
        let response = LoopringAPI.vaultAPI?.submitVaultRepay({
          // @ts-ignore
          request: request ?? vaultRepayData.request,
          // @ts-ignore
          privateKey: account?.eddsaKey?.sk,
          apiKey: account.apiKey,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }
        walletLayer2Service.sendUserUpdate()
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultRepay_In_Progress,
          info: {
            title: t('labelVaultRepayTitle'),
          },
        })
        sdk.sleep(1000).then(() => updateVaultLayer2({}))
        //TODO c
        setShowAccount({
          isShow: true,
          step: AccountStep.VaultRepay_Success,
          // TODO:
          info: {
            usdValue: 0,
            usdDebt: 0,
            usdEquity: 0,
            forexMap,
            title: t('labelVaultRepayTitle'),
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
          title: t('labelVaultRepayTitle'),
        },
      })
    }
  }

  const submitCallback = async () => {
    const vaultRepayData = store.getState()._router_tradeVault.vaultRepayData

    try {
      if (
        vaultRepayData &&
        exchangeInfo &&
        vaultRepayData.belong &&
        LoopringAPI.vaultAPI &&
        LoopringAPI.userAPI &&
        vaultAccountInfo &&
        sdk.toBig(vaultRepayData?.repayVol).gte(vaultRepayData.minRepayVol ?? 0) &&
        sdk.toBig(vaultRepayData?.maxRepayAmount).lte(vaultRepayData.maxRepayVol ?? 0)
      ) {
        setIsLoading(true)
        const vaultRepayRequest: sdk.VaultRepayRequest = {
          accountId: account.accountId,
          token: {
            tokenId: vaultTokenMap[vaultRepayData.belong].vaultTokenId as unknown as number,
            volume: vaultRepayData.repayVol,
          },
          timestamp: Date.now(),
        }
        updateVaultRepay({
          ...vaultRepayData,
          request: vaultRepayRequest,
        })
        processRequest(vaultRepayRequest)
      }
    } catch (e) {
      setIsLoading(false)
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
    isLoading,
    submitCallback,
  })
  return {
    handlePanelEvent,
    vaultRepayBtnStatus: btnStatus,
    vaultRepayBtnI18nKey: btnLabel,
    onVaultRepayClick: onBtnClick,
    walletMap: walletMap as unknown as any,
    coinMap: vaultCoinMap,
    tradeData: vaultRepayData.tradeData,
    vaultRepayData: vaultRepayData as unknown as V,
  }
}
