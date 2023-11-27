import React from 'react'
import {
  AccountStatus,
  AmmJoinData,
  getValuePrecisionThousand,
  IBData,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { ToastType, useOpenModals, useToggle } from '@loopring-web/component-lib'
import {
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  makeCache,
  store,
  useAccount,
  useAmmMap,
  usePageAmmPool,
  useSubmitBtn,
  useSystem,
  useTokenMap,
  useUserRewards,
  useWalletLayer2Socket,
  walletLayer2Service,
} from '../../index'
import * as sdk from '@loopring-web/loopring-sdk'

import { useTranslation } from 'react-i18next'

import _ from 'lodash'

// ----------calc hook -------

export const useAmmJoin = ({
  updateJoinFee,
  setToastOpen,
  market,
  refreshRef,
}: // ammCalcDefault,
// ammDataDefault,
{
  market: string
  updateJoinFee: () => Promise<void>
  setToastOpen: any
  refreshRef: React.Ref<any>
  // ammCalcDefault: Partial<AmmInData<any>>;
  // ammDataDefault: Partial<AmmJoinData<IBData<string>, string>>;
}) => {
  const {
    ammJoin: { request, ammCalcData, ammData },
    updatePageAmmJoin,
  } = usePageAmmPool()
  const [[maxCoinA, maxCoinB], setMaxLp] = React.useState<[any, any]>([Infinity, Infinity])
  const { getUserRewards } = useUserRewards()
  const { t } = useTranslation(['common', 'error'])
  const [isLoading, setIsLoading] = React.useState(false)
  const { tokenMap, idIndex, marketMap } = useTokenMap()
  const { allowTrade } = useSystem()
  const { ammMap } = useAmmMap()
  const ammInfo = ammMap['AMM-' + market]

  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals()
  const {
    toggle: { joinAmm },
  } = useToggle()
  const { account } = useAccount()

  const [baseMinAmt, setBaseMinAmt] = React.useState<any>()
  const [quoteMinAmt, setQuoteMinAmt] = React.useState<any>()

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      const { ammData } = store.getState()._router_pageAmmPool.ammJoin
      const times = 10
      const validAmt1 = ammData?.coinA?.tradeValue
        ? ammData?.coinA?.tradeValue >= times * baseMinAmt
        : false
      const validAmt2 = ammData?.coinB?.tradeValue
        ? ammData?.coinB?.tradeValue >= times * quoteMinAmt
        : false

      myLog('btnLabelActiveCheck ammJOin validAmt1:', validAmt1, ' validAmt2:', validAmt2)

      if (isLoading || !(ammInfo !== undefined && ammInfo?.market)) {
        return { tradeBtnStatus: TradeBtnStatus.LOADING, label: '' }
      } else {
        if (account.readyState === AccountStatus.ACTIVATED) {
          if (
            ammData === undefined ||
            ammData?.coinA.tradeValue === undefined ||
            ammData?.coinB.tradeValue === undefined ||
            ammData.coinA.tradeValue === 0 ||
            ammData.coinB.tradeValue === 0
          ) {
            return {
              tradeBtnStatus: TradeBtnStatus.DISABLED,
              label: 'labelEnterAmount',
            }
          } else if (sdk.toBig(ammData.coinA.tradeValue).gt(ammData.coinA.balance)) {
            return {
              tradeBtnStatus: TradeBtnStatus.DISABLED,
              label: `labelAMMNoEnough|${ammData.coinA.belong}`,
            }
          } else if (sdk.toBig(ammData.coinB.tradeValue).gt(ammData.coinB.balance)) {
            return {
              tradeBtnStatus: TradeBtnStatus.DISABLED,
              label: `labelAMMNoEnough|${ammData.coinB.belong}`,
            }
          } else if (!validAmt1 || !validAmt2) {
            const tokenA = tokenMap[ammInfo.coinA ?? '']
            const tokenB = tokenMap[ammInfo.coinB ?? '']
            const viewBaseMintAmt = getValuePrecisionThousand(
              times * baseMinAmt,
              tokenA?.precisionForOrder ?? 4,
              tokenA?.precisionForOrder ?? 4,
              tokenA?.precisionForOrder ?? 2,
              false,
              { floor: false, isAbbreviate: true },
            )
            const viewQuoteMintAmt = getValuePrecisionThousand(
              times * quoteMinAmt,
              tokenB?.precisionForOrder ?? 4,
              tokenB?.precisionForOrder ?? 4,
              tokenB?.precisionForOrder ?? 2,
              false,
              { floor: false, isAbbreviate: true },
            )
            return {
              tradeBtnStatus: TradeBtnStatus.DISABLED,
              label: `labelLimitMin| ${viewBaseMintAmt} ${ammData?.coinA.belong}  ${t(
                'labelAmmMinAnd',
              )} ${viewQuoteMintAmt} ${ammData?.coinB.belong}`,
            }
          } else if (
            !Number.isFinite(maxCoinA) &&
            !Number.isFinite(maxCoinB) &&
            (sdk.toBig(ammData.coinA.tradeValue).gt(maxCoinA) ||
              sdk.toBig(ammData.coinB.tradeValue).gt(maxCoinB))
          ) {
            return {
              tradeBtnStatus: TradeBtnStatus.DISABLED,
              label: `labelAMMMax| ${t('labelAMMMaxAND', {
                coinA: `${maxCoinA} ${ammData.coinA.belong}`,
                coinB: `${maxCoinB} ${ammData.coinB.belong}`,
              })}`,
            }
          }
          return {
            tradeBtnStatus: TradeBtnStatus.AVAILABLE,
            label: '',
          }
        }
      }
      return {
        tradeBtnStatus: TradeBtnStatus.AVAILABLE,
        label: '',
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
  }, [account.readyState, ammMap, ammInfo, isLoading, baseMinAmt, quoteMinAmt, maxCoinA, maxCoinB])

  const onAmmClick = React.useCallback(
    async function (props) {
      setIsLoading(true)
      if (!allowTrade.order.enable) {
        setShowSupport({ isShow: true })
        setIsLoading(false)
      } else if (ammInfo?.joinDisable) {
        setShowTradeIsFrozen({
          isShow: true,
          messageKey: 'labelNoticeForMarketFrozen',
          type: t('labelAmmJoin') + ` ${ammInfo?.__rawConfig__.name}`,
        })
        setIsLoading(false)
      } else if (!joinAmm.enable) {
        setShowTradeIsFrozen({
          isShow: true,
          type: t('labelAmmJoin') + ` ${ammInfo?.__rawConfig__.name}`,
        })
        setIsLoading(false)
      } else {
        if (!LoopringAPI.ammpoolAPI || !LoopringAPI.userAPI || !request || !account?.eddsaKey?.sk) {
          myLog('onAmmJoin ammpoolAPI:', LoopringAPI.ammpoolAPI, 'joinRequest:', request)

          setToastOpen({
            open: true,
            type: ToastType.success,
            content: t('labelJoinAmmFailed'),
          })
          setIsLoading(false)
          walletLayer2Service.sendUserUpdate()
          return
        }

        const patch: sdk.AmmPoolRequestPatch = {
          chainId: store.getState().system.chainId as sdk.ChainId,
          ammName: ammInfo?.__rawConfig__.name ?? '',
          poolAddress: ammInfo?.address ?? '',
          eddsaKey: account.eddsaKey.sk,
        }

        let req = _.cloneDeep(request)

        try {
          const request0: sdk.GetNextStorageIdRequest = {
            accountId: account.accountId,
            sellTokenId: req.joinTokens.pooled[0].tokenId as number,
          }
          const storageId0 = await LoopringAPI.userAPI.getNextStorageId(request0, account.apiKey)

          const request_1: sdk.GetNextStorageIdRequest = {
            accountId: account.accountId,
            sellTokenId: req.joinTokens.pooled[1].tokenId as number,
          }
          const storageId1 = await LoopringAPI.userAPI.getNextStorageId(request_1, account.apiKey)

          req.storageIds = [storageId0.offchainId, storageId1.offchainId]

          req.validUntil = getTimestampDaysLater(DAYS)
          if (ammInfo?.domainSeparator) {
            req.domainSeparator = ammInfo?.domainSeparator
          }

          myLog('join ammpool req:', req)
          let response
          if (store.getState().system.chainId === 5 && /CLRC-USDT/gi.test(ammInfo.name)) {
            console.log('Test case for new amm join, please do not submit request', req)
          } else {
            response = await LoopringAPI.ammpoolAPI.joinAmmPool(req, patch, account.apiKey)
          }

          myLog('join ammpool response:', response)

          updatePageAmmJoin({
            ammData: {
              ...ammData,
              ...{
                coinA: { ...ammData.coinA, tradeValue: 0 },
                coinB: { ...ammData.coinB, tradeValue: 0 },
              },
            },
          })

          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
            setToastOpen({
              open: true,
              type: ToastType.error,
              content:
                t('labelJoinAmmFailed') +
                ' error: ' +
                (errorItem
                  ? t(errorItem.messageKey, { ns: 'error' })
                  : (response as sdk.RESULT_INFO).message),
            })
          } else {
            setToastOpen({
              open: true,
              type: ToastType.success,
              content: t('labelJoinAmmSuccess'),
            })
          }
        } catch (reason: any) {
          sdk.dumpError400(reason)
          setToastOpen({
            open: true,
            type: ToastType.error,
            content: t('labelJoinAmmFailed'),
          })
        } finally {
          setIsLoading(false)
          walletLayer2Service.sendUserUpdate()
          getUserRewards()
          // @ts-ignore
          refreshRef?.current?.firstElementChild.click()
        }

        if (props.__cache__) {
          makeCache(props.__cache__)
        }
      }
    },
    [request, ammData, account, t, allowTrade],
  )
  const { btnStatus, onBtnClick, btnLabel } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback: onAmmClick,
  })

  const handleAmmPoolEvent = React.useCallback(
    (data: AmmJoinData<IBData<any>>, type: 'coinA' | 'coinB') => {
      if (!data || !tokenMap || !data.coinA.belong || !data.coinB.belong) {
        myLog('handleJoin return ', data)
        return
      }
      const {
        ammJoin: { ammCalcData },
      } = store.getState()._router_pageAmmPool
      const { ammMap } = store.getState().amm.ammMap
      const ammInfo = ammMap['AMM-' + market]
      const { slippage } = data

      const slippageReal = sdk.toBig(slippage).div(100).toString()

      const isAtoB = type === 'coinA'
      const tokenCoinA = tokenMap[ammInfo.coinA]
      const tokenCoinB = tokenMap[ammInfo.coinB]

      const rawA = data.coinA.tradeValue ? data.coinA.tradeValue.toString() : '0'
      const rawB = data.coinB.tradeValue ? data.coinB.tradeValue.toString() : '0'
      const rawVal = isAtoB ? rawA : rawB
      const rawValMatchForRawVal = isAtoB ? rawB : rawA
      const lpToken = tokenMap['LP-' + ammInfo.market]

      const ammPoolSnapshot: any = {
        poolName: ammInfo.name,
        poolAddress: ammInfo.address,
        pooled: [
          {
            tokenId: tokenCoinA.tokenId,
            volume: ammInfo.tokens.pooled[0],
          },
          {
            tokenId: tokenCoinB.tokenId,
            volume: ammInfo.tokens.pooled[1],
          },
        ], //[ammInfo., TokenVolumeV3];
        lp: {
          tokenId: lpToken.tokenId,
          volume: ammInfo.tokens?.lp as any,
        },
        risky: false,
      }
      const { request } = sdk.makeJoinAmmPoolRequest(
        rawVal,
        isAtoB,
        slippageReal,
        account.accAddress,
        ammCalcData?.fees,
        ammPoolSnapshot,
        tokenMap as any,
        idIndex as any,
        0,
        0,
        rawValMatchForRawVal,
      )

      const newData = _.cloneDeep(data)

      if (ammInfo.tokens?.lp && sdk.toBig(ammInfo.tokens?.lp ?? 0).gt(0)) {
        if (isAtoB) {
          newData.coinB.tradeValue =
            rawA !== '0'
              ? (sdk
                  .toBig(request.joinTokens.pooled[1].volume)
                  .div('1e' + tokenCoinB.decimals)
                  .toFixed(marketMap[ammInfo.market].precisionForPrice) as any)
              : undefined
        } else {
          newData.coinA.tradeValue =
            rawB !== '0'
              ? (sdk
                  .toBig(request.joinTokens.pooled[0].volume)
                  .div('1e' + tokenCoinA.decimals)
                  .toFixed(marketMap[ammInfo.market].precisionForPrice) as any)
              : undefined
        }
      }

      if (ammCalcData?.fee) {
        const { request: maxResult } = sdk.makeJoinAmmPoolRequest(
          sdk.toBig(data.coinB.balance).minus(ammCalcData?.fee).toString(),
          false,
          slippageReal,
          account.accAddress,
          ammCalcData?.fees,
          ammPoolSnapshot,
          tokenMap as any,
          idIndex as any,
          0,
          0,
          undefined,
        )
        if (ammInfo.tokens?.lp && sdk.toBig(ammInfo.tokens?.lp ?? 0).gt(0)) {
          setMaxLp([
            sdk
              .toBig(maxResult.joinTokens.pooled[0].volume)
              .div('1e' + tokenCoinA.decimals)
              .toFixed(marketMap[ammInfo.market].precisionForPrice),
            sdk
              .toBig(maxResult.joinTokens.pooled[1].volume)
              .div('1e' + tokenCoinB.decimals)
              .toFixed(marketMap[ammInfo.market].precisionForPrice),
          ])
        }
      }

      myLog('raw request:', request)

      updatePageAmmJoin({
        request,
        ammData: {
          coinA: newData.coinA as IBData<string>,
          coinB: newData.coinB as IBData<string>,
          coinLP: ammData.coinLP,
          slippage,
        },
      })
    },
    [market],
  )

  const walletLayer2Callback = React.useCallback(async () => {
    updateJoinFee()
    const account = store.getState().account
    if (ammInfo?.market && account.readyState === AccountStatus.ACTIVATED) {
      const baseT = tokenMap[ammInfo.coinA]
      const quoteT = tokenMap[ammInfo.coinB]
      setBaseMinAmt(
        baseT
          ? sdk
              .toBig(baseT.orderAmounts.minimum)
              .div('1e' + baseT.decimals)
              .toNumber()
          : undefined,
      )
      setQuoteMinAmt(
        quoteT
          ? sdk
              .toBig(quoteT.orderAmounts.minimum)
              .div('1e' + quoteT.decimals)
              .toNumber()
          : undefined,
      )
    }
  }, [])

  useWalletLayer2Socket({ walletLayer2Callback })

  return {
    ammCalcData,
    ammData,
    handleAmmPoolEvent,
    btnStatus,
    onAmmClick: onBtnClick,
    btnI18nKey: btnLabel,
    updatePageAmmJoin,
    propsAExtends: {
      coinPrecision: tokenMap[ammInfo.coinA].precision,
    },
    propsBExtends: {
      coinPrecision: tokenMap[ammInfo.coinB].precision,
    },
  }
}
