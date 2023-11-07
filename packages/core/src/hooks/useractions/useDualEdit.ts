import React from 'react'
import { DualDetailType, ToastType, useOpenModals } from '@loopring-web/component-lib'
import {
  AccountStatus,
  CustomErrorWithCode,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_AUTO_CLOSE,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import BigNumber from 'bignumber.js'

import {
  DAYS,
  getTimestampDaysLater,
  useSubmitBtn,
  useToast,
  useTokenMap,
  useTradeDual,
} from '@loopring-web/core'

import * as sdk from '@loopring-web/loopring-sdk'

import { LoopringAPI, store, useAccount, useSystem } from '../../index'
import { useTranslation } from 'react-i18next'

export const useDualEdit = <
  T extends {
    isRenew: boolean
    renewTargetPrice?: string
    renewDuration?: number
  },
  R extends DualDetailType,
>({
  refresh,
}: {
  refresh?: (item: R) => void
}) => {
  const { exchangeInfo } = useSystem()
  const { setShowAccount } = useOpenModals()
  const { t } = useTranslation()
  const { account } = useAccount()
  const { setShowDual } = useOpenModals()
  const {
    editDual: { dualViewInfo },
    updateEditDual,
    resetEditDual,
  } = useTradeDual()

  const { toastOpen, setToastOpen, closeToast } = useToast()
  const [isLoading, setIsLoading] = React.useState(false)
  const { tokenMap, idIndex } = useTokenMap()
  const [tradeData, setTradeData] = React.useState<T>({
    // @ts-ignore
    isRenew: dualViewInfo?.__raw__?.order?.dualReinvestInfo?.isRecursive ?? false,
    renewDuration: dualViewInfo?.__raw__?.order?.dualReinvestInfo?.maxDuration / 86400000,
    renewTargetPrice: dualViewInfo?.__raw__?.order.dualReinvestInfo.newStrike,
  } as T)
  React.useEffect(() => {
    const { dualViewInfo } = store.getState()._router_tradeDual.editDual
    setTradeData({
      // @ts-ignore
      isRenew: dualViewInfo?.__raw__?.order?.dualReinvestInfo?.isRecursive ?? false,
      renewDuration: dualViewInfo?.__raw__?.order?.dualReinvestInfo?.maxDuration / 86400000,
      renewTargetPrice: dualViewInfo?.__raw__?.order.dualReinvestInfo.newStrike,
    })
  }, [dualViewInfo?.__raw__?.order?.hash])

  const handleOnchange = ({ tradeData }: { tradeData: T }) => {
    setTradeData(tradeData)
    const editDual = store.getState()._router_tradeDual.editDual
    updateEditDual({
      ...editDual,
      tradeData,
    })
  }

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const account = store.getState().account
    const { maxDuration, newStrike } = dualViewInfo?.__raw__?.order?.dualReinvestInfo ?? {}
    if (account.readyState === AccountStatus.ACTIVATED && tradeData) {
      if (!tradeData.isRenew) {
        return {
          tradeBtnStatus: TradeBtnStatus.AVAILABLE,
          label: 'labelTurnOffDualAutoInvest',
        }
      } else if (
        tradeData.isRenew &&
        tradeData.renewDuration &&
        tradeData.renewTargetPrice &&
        (tradeData.renewDuration !== (maxDuration ?? 0) / 86400000 ||
          !sdk.toBig(tradeData.renewTargetPrice).eq(newStrike))
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.AVAILABLE,
          label: '',
        }
      } else {
        return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: '' } // label: ''}
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
  }, [dualViewInfo, tradeData.isRenew, tradeData.renewDuration, tradeData.renewTargetPrice])

  const onSubmitBtnClick = React.useCallback(async () => {
    const editDual = store.getState()._router_tradeDual.editDual
    let { tradeData: _tradeData } = editDual
    _tradeData = { ..._tradeData, ...tradeData }
    const tradeDual = editDual?.dualViewInfo?.__raw__?.order
    const dualViewInfo = editDual?.dualViewInfo
    try {
      setIsLoading(true)
      if (LoopringAPI.userAPI && LoopringAPI.defiAPI && tradeDual && dualViewInfo && exchangeInfo) {
        let request: any = {
          currentDualHash: tradeDual.hash,
          isRecursive: tradeDual.dualReinvestInfo.isRecursive,
          maxDuration: tradeDual.dualReinvestInfo.maxDuration,
          newStrike: tradeDual.dualReinvestInfo.newStrike,
          accountId: account.accountId,
        }
        if (!_tradeData.isRenew) {
          request.isRecursive = false
        } else {
          request.isRecursive = true
          request.maxDuration = tradeDual.dualReinvestInfo.maxDuration
          if (
            _tradeData.renewDuration &&
            _tradeData.renewDuration !== (request.maxDuration ?? 0) / 86400000
          ) {
            request.maxDuration = Number(_tradeData.renewDuration) * 86400000
          }
          if (
            _tradeData.renewTargetPrice &&
            tradeDual?.tokenInfoOrigin?.storageId !== undefined &&
            !sdk.toBig(_tradeData.renewTargetPrice).eq(tradeDual.dualReinvestInfo.newStrike)
          ) {
            const req: sdk.GetNextStorageIdRequest = {
              accountId: account.accountId,
              sellTokenId: tradeDual.tokenInfoOrigin.tokenIn ?? 0,
            }
            const storageId = await LoopringAPI.userAPI.getNextStorageId(req, account.apiKey)
            request.newStrike = _tradeData.renewTargetPrice
            const [, , base, quote] =
              (tradeDual.tokenInfoOrigin.market ?? 'dual-').match(/(dual-)?(\w+)-(\w+)/i) ?? []
            const buyToken =
              tradeDual.dualType === sdk.DUAL_TYPE.DUAL_BASE ? tokenMap[quote] : tokenMap[base] //tokenMap[idIndex[tradeDual.tokenInfoOrigin.tokenOut]]
            const sellToken = tokenMap[idIndex[tradeDual.tokenInfoOrigin.tokenIn]]

            request.newOrder = {
              exchange: exchangeInfo.exchangeAddress,
              storageId: storageId.orderId,
              accountId: account.accountId,
              sellToken: {
                tokenId: tradeDual.tokenInfoOrigin.tokenIn, //tradeDual.tokenInfoOrigin.tokenIn ?? 0,
                volume: tradeDual.tokenInfoOrigin.amountIn,
              },
              buyToken: {
                tokenId: buyToken.tokenId,
                //tradeDual.tokenInfoOrigin.tokenOut ?? 0,
                ...(tradeDual.dualType === sdk.DUAL_TYPE.DUAL_BASE
                  ? {
                      volume: sdk
                        .toBig(
                          sdk
                            .toBig(tradeDual.tokenInfoOrigin.amountIn)
                            .div('1e' + sellToken.decimals)
                            .times(request.newStrike)
                            .toFixed(buyToken.precision, BigNumber.ROUND_CEIL),
                        )
                        .times('1e' + buyToken.decimals)
                        .toString(),
                    }
                  : {
                      volume: sdk
                        .toBig(
                          sdk
                            .toBig(
                              sdk
                                .toBig(tradeDual.tokenInfoOrigin.amountIn)
                                .div('1e' + sellToken.decimals),
                            )
                            .div(request.newStrike)
                            .toFixed(buyToken.precision, BigNumber.ROUND_CEIL),
                        )
                        .times('1e' + buyToken.decimals)
                        .toFixed(0, BigNumber.ROUND_FLOOR),
                    }),
              },
              validUntil: getTimestampDaysLater(DAYS * 12),
              maxFeeBips: 5,
              fillAmountBOrS: false,
              fee: tradeDual.feeVol ?? '0',
              baseProfit: tradeDual.dualReinvestInfo.profit,
              settleRatio: tradeDual?.settleRatio?.toString()?.replaceAll(sdk.SEP, ''),
              expireTime: tradeDual.expireTime,
            }
          }
        }
        myLog('DualTrade request:', request)
        const response = await LoopringAPI.defiAPI.editDual(
          request,
          account.eddsaKey.sk,
          account.apiKey,
        )

        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = /DUAL_PRODUCT_STOPPED/gi.test(
            (response as sdk.RESULT_INFO).message ?? '',
          )
            ? SDK_ERROR_MAP_TO_UI[115003]
            : SDK_ERROR_MAP_TO_UI[700001]
          throw new CustomErrorWithCode({
            ...response,
            ...errorItem,
          } as any)
        } else {
          setShowDual({ isShow: false, dualInfo: undefined })
          setToastOpen({
            open: true,
            type: ToastType.success,
            content: t('labelDualEditSuccess'),
          })
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          // if (
          //   store.getState().modals.isShowAccount.isShow &&
          //   store.getState().modals.isShowAccount.step == AccountStep.Dual_Success
          // ) {
          //   setShowAccount({ isShow: false })
          // }
        }
        refresh &&
          refresh({
            ...dualViewInfo,
            __raw__: {
              order: {
                ...dualViewInfo.__raw__.order,
                dualReinvestInfo: {
                  ...dualViewInfo?.__raw__?.dualReinvestInfo,
                  newStrike: request.newStrike,
                  maxDuration: request.maxDuration,
                  isRecursive: request.isRecursive,
                },
              },
            },
          } as any)
      } else {
        throw new Error('api not ready')
      }
    } catch (reason) {
      if (!_tradeData.isRenew) {
        resetEditDual()
      }
      setToastOpen({
        open: true,
        type: ToastType.error,
        content: t('labelDualEditFailed'),
      })
    }
    setIsLoading(false)
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    exchangeInfo,
    setShowAccount,
    setShowDual,
    tradeData.isRenew,
    tradeData.renewDuration,
    tradeData.renewTargetPrice,
  ])

  const {
    btnStatus,
    onBtnClick,
    btnLabel: tradeMarketI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback: onSubmitBtnClick,
  })

  return {
    editDualTrade: tradeData,
    editDualBtnInfo: {
      label: tradeMarketI18nKey,
      params: {},
    },
    onEditDualClick: onBtnClick,
    handleOnchange,
    editDualBtnStatus: btnStatus,
    dualToastOpen: toastOpen,
    closeDualToast: closeToast,
    setDualTradeData: setTradeData,
  }
}
