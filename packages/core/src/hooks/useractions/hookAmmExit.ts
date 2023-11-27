import React from 'react'
import {
  AccountStatus,
  AmmExitData,
  getValuePrecisionThousand,
  IBData,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_QUICK_AUTO_CLOSE,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { setShowTradeIsFrozen, ToastType, useToggle } from '@loopring-web/component-lib'
import {
  DAYS,
  getTimestampDaysLater,
  IdMap,
  LoopringAPI,
  makeCache,
  store,
  useAccount,
  useAmmMap,
  usePageAmmPool,
  useSubmitBtn,
  useTokenMap,
  useUserRewards,
  useWalletLayer2Socket,
  walletLayer2Service,
} from '../../index'
import * as sdk from '@loopring-web/loopring-sdk'
import { useTranslation } from 'react-i18next'

export const useAmmExit = ({
  market,
  // getFee,
  setToastOpen,
  setConfirmExitSmallOrder,
  updateExitFee,
  refreshRef,
}: // ammCalcDefault,
// ammDataDefault,
{
  market: string
  updateExitFee: () => Promise<void>
  // getFee: (requestType: sdk.OffchainFeeReqType.AMM_EXIT) => any;
  setToastOpen: any
  setConfirmExitSmallOrder: (props: { open: boolean; type: 'Disabled' | 'Mini' }) => void
  refreshRef: React.Ref<any>
  // ammCalcDefault: Partial<AmmExitData<any>>;
  // ammDataDefault: Partial<AmmJoinData<IBData<string>, string>>;
}) => {
  const {
    ammExit: { fees, request, ammCalcData, ammData },
    updatePageAmmExit,
  } = usePageAmmPool()
  const { t } = useTranslation(['common', ToastType.error])
  const [isLoading, setIsLoading] = React.useState(false)
  const { idIndex, tokenMap } = useTokenMap()
  const { ammMap } = useAmmMap()
  const { account } = useAccount()
  const ammInfo = ammMap['AMM-' + market]
  const {
    toggle: { exitAmm },
  } = useToggle()
  const [lpMinAmt, setLpMinAmt] = React.useState<any>(undefined)
  const lpToken = tokenMap['LP-' + ammInfo.market]

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const ammInfo = ammMap['AMM-' + market]
    if (account.readyState === AccountStatus.ACTIVATED) {
      const { ammData, fee } = store.getState()._router_pageAmmPool.ammExit
      const validAmt = ammData?.coinLP?.tradeValue
        ? sdk
            .toBig(ammData?.coinLP?.tradeValue ?? 0)
            .gte(sdk.toBig(lpMinAmt?.replaceAll(sdk.SEP, '') ?? 0))
        : false
      myLog('availableTradeCheck AMM exit validAmt: fee, lpMinAmt', fee, lpMinAmt?.toString())

      if (isLoading || !(ammInfo !== undefined && ammInfo?.market)) {
        return { tradeBtnStatus: TradeBtnStatus.LOADING, label: '' }
      } else {
        if (
          ammData === undefined ||
          ammData?.coinLP?.tradeValue === undefined ||
          ammData?.coinLP?.tradeValue === 0 ||
          fee === undefined ||
          !lpMinAmt ||
          fee === 0
        ) {
          myLog('will DISABLED! ', ammData, fee)
          return {
            tradeBtnStatus: TradeBtnStatus.DISABLED,
            label: 'labelEnterAmount',
          }
        } else if (!validAmt) {
          return {
            tradeBtnStatus: TradeBtnStatus.DISABLED,
            label: `labelLimitMin| ${lpMinAmt} ${ammData?.coinLP?.belong} `,
          }
        }
      }
      return {
        tradeBtnStatus: TradeBtnStatus.AVAILABLE,
        label: '',
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
  }, [account.readyState, ammMap, ammInfo, isLoading, lpMinAmt])
  const submitAmmExit = React.useCallback(async () => {
    setIsLoading(true)
    // updatePageAmmExitBtn({ btnStatus: TradeBtnStatus.LOADING });

    if (ammInfo?.exitDisable) {
      setShowTradeIsFrozen({
        isShow: true,
        messageKey: 'labelNoticeForMarketFrozen',
        type: t('labelAmmExit') + ` ${ammInfo?.__rawConfig__.name}`,
      })
      setIsLoading(false)
    } else if (!exitAmm.enable) {
      setShowTradeIsFrozen({
        isShow: true,
        type: t('labelAmmExit') + ` ${ammInfo?.__rawConfig__.name}`,
      })
      setIsLoading(false)
    } else {
      sendRequest()
    }
  }, [request, account, t, updatePageAmmExit])

  const onSubmitBtnClick = React.useCallback(
    async (_props) => {
      const ammExit = store.getState()._router_pageAmmPool.ammExit
      if (ammExit.ammData.coinLP.tradeValue && ammExit.volB_show) {
        // quoteValue < feeValue
        const validAmt =
          ammData?.coinLP?.tradeValue && ammExit.volB_show
            ? sdk.toBig(ammExit.volB_show).gte(ammExit.fee)
            : false
        // Lp value 15% will be charge for Fee should confirm, so for quote token is 15%*2 = 0.3
        const validMiniAmt =
          ammData?.coinLP?.tradeValue && ammExit.volB_show
            ? sdk.toBig(ammExit.volB_show * 0.3).gte(ammExit.fee)
            : false
        if (!validAmt) {
          // quoteValue < feeValue
          setConfirmExitSmallOrder({ open: true, type: 'Disabled' })
        } else if (!validMiniAmt) {
          // Lp value 15% will be charge for Fee should confirm, so for quote token is 15%*2 = 0.3
          setConfirmExitSmallOrder({ open: true, type: 'Mini' })
        } else {
          submitAmmExit()
        }
      }
    },
    [tokenMap, submitAmmExit],
  )
  const { btnStatus, onBtnClick, btnLabel } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback: onSubmitBtnClick,
  })

  const updateMiniTradeValue = React.useCallback(() => {
    const {
      ammExit: {
        fees,
        ammCalcData,
        ammData: { slippage },
      },
    } = store.getState()._router_pageAmmPool
    const ammPoolSnapshot: any = {
      poolName: ammInfo.name,
      poolAddress: ammInfo.address,
      pooled: [
        {
          tokenId: tokenMap[ammInfo.coinA].tokenId,
          volume: ammInfo.tokens.pooled[0],
        },
        {
          tokenId: tokenMap[ammInfo.coinB].tokenId,
          volume: ammInfo.tokens.pooled[1],
        },
      ], //[ammInfo., TokenVolumeV3];
      lp: {
        tokenId: tokenMap['LP-' + ammInfo.market].tokenId,
        volume: ammInfo.tokens?.lp as any,
      },
      risky: false,
    }

    if (ammCalcData && ammCalcData.lpCoin?.belong) {
      const { miniLpVal } = sdk.makeExitAmmPoolMini(
        '0',
        ammPoolSnapshot,
        tokenMap as any,
        idIndex as IdMap,
      )
      let miniFeeLpWithSlippageVal = ''

      const slippageReal = sdk
        .toBig(slippage ?? 0.1)
        .div(100)
        .toString()
      if (fees) {
        const result = sdk.makeExitAmmCoverFeeLP(
          fees,
          ammPoolSnapshot,
          tokenMap,
          idIndex,
          slippageReal,
        )
        miniFeeLpWithSlippageVal = result.miniFeeLpWithSlippageVal
      }
      setLpMinAmt(() => {
        const miniVal = sdk
          .toBig(
            sdk.toBig(miniFeeLpWithSlippageVal ?? 0).gte(miniLpVal)
              ? miniFeeLpWithSlippageVal
              : miniLpVal,
          )
          .times(1.1)
        myLog(
          'updateMiniTradeValue: miniFeeLpWithSlippage, miniLpVal, miniVal = great one * 1.1 ',
          miniFeeLpWithSlippageVal.toString(),
          miniLpVal.toString(),
          miniVal.toString(),
        )
        return getValuePrecisionThousand(
          miniVal,
          lpToken.precision,
          lpToken.precision,
          lpToken.precision,
          false,
          { floor: false },
        )
      })
    }
  }, [tokenMap, idIndex])
  React.useEffect(() => {
    // const quote: TokenVolumeV3 = ammPoolSnapshot.pooled[1];
    if (ammInfo?.market && fees && ammData.slippage) {
      myLog('updateMiniTradeValue: fees, slippage', fees, ammData.slippage, ammInfo?.totalLPToken)
      updateMiniTradeValue()
    }
  }, [ammInfo?.tokens?.pooled, fees, ammData.slippage])
  React.useEffect(() => {
    updateExitFee()
  }, [ammInfo?.tokens?.pooled])

  const handleAmmPoolEvent = React.useCallback(
    (data: AmmExitData<IBData<any>>, _type: 'coinA' | 'coinB') => {
      const ammExit = store.getState()._router_pageAmmPool.ammExit
      const ammInfo = ammMap['AMM-' + market]
      const { slippage } = data

      const slippageReal = sdk.toBig(slippage).div(100).toString()

      let newAmmData = {
        ...ammData,
        ...ammExit.ammData,
      }

      let rawVal: any = data.coinLP.tradeValue

      let ammDataPatch = {}

      if (rawVal === undefined) {
        rawVal = '0'
      }
      const ammPoolSnapshot: any = {
        poolName: ammInfo.name,
        poolAddress: ammInfo.address,
        pooled: [
          {
            tokenId: tokenMap[ammInfo.coinA].tokenId,
            volume: ammInfo.tokens.pooled[0],
          },
          {
            tokenId: tokenMap[ammInfo.coinB].tokenId,
            volume: ammInfo.tokens.pooled[1],
          },
        ], //[ammInfo., TokenVolumeV3];
        lp: {
          tokenId: tokenMap['LP-' + ammInfo.market].tokenId,
          volume: ammInfo.tokens?.lp as any,
        },
        risky: false,
      }

      if (data.coinLP.tradeValue !== undefined && ammExit.ammCalcData) {
        const { volA_show, volB_show, request } = sdk.makeExitAmmPoolRequest2(
          rawVal.toString(),
          slippageReal,
          account.accAddress,
          ammExit.ammCalcData?.fees as sdk.LoopringMap<sdk.OffchainFeeInfo>,
          ammPoolSnapshot,
          tokenMap as any,
          idIndex as IdMap,
          0,
        )

        newAmmData.coinA = { ...ammData.coinA, tradeValue: volA_show as any }
        newAmmData.coinB = { ...ammData.coinB, tradeValue: volB_show as any }
        ammDataPatch = { request, volA_show, volB_show }
        updatePageAmmExit({
          ...ammDataPatch,
          ammData: {
            ...newAmmData,
            coinLP: data.coinLP,
            slippage: data.slippage,
          },
        })
      }
    },
    [market],
  )
  const sendRequest = React.useCallback(async () => {
    const ammExit = store.getState()._router_pageAmmPool.ammExit
    try {
      if (
        LoopringAPI.ammpoolAPI &&
        LoopringAPI.userAPI &&
        ammExit.request &&
        account?.eddsaKey?.sk &&
        ammInfo?.domainSeparator
      ) {
        // let req = _.cloneDeep(request);
        const patch: sdk.AmmPoolRequestPatch = {
          chainId: store.getState().system.chainId as sdk.ChainId,
          ammName: ammInfo?.__rawConfig__.name ?? '',
          poolAddress: ammInfo?.address ?? '',
          eddsaKey: account.eddsaKey.sk,
        }
        const burnedReq: sdk.GetNextStorageIdRequest = {
          accountId: account.accountId,
          sellTokenId: ammExit.request.exitTokens.burned.tokenId as number,
        }
        const storageId0 = await LoopringAPI.userAPI.getNextStorageId(burnedReq, account.apiKey)

        myLog('exit ammpool request:', {
          ...ammExit.request,
          domainSeparator: ammInfo.domainSeparator,
          storageId: storageId0.offchainId,
          validUntil: getTimestampDaysLater(DAYS),
        })

        const response = await LoopringAPI.ammpoolAPI
          .exitAmmPool(
            {
              ...ammExit.request,
              domainSeparator: ammInfo.domainSeparator,
              storageId: storageId0.offchainId,
              validUntil: getTimestampDaysLater(DAYS),
            },
            patch,
            account.apiKey,
          )
          .finally()
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        } else {
          setToastOpen({
            open: true,
            type: ToastType.success,
            content: t('labelExitAmmSuccess'),
          })
        }

        if (ammExit.ammData?.__cache__) {
          makeCache(ammExit.ammData?.__cache__)
        }
      } else {
        throw new Error('api not ready')
      }
    } catch (error: any) {
      if (error?.message === 'api not ready') {
        setToastOpen({
          open: true,
          type: ToastType.error,
          content: t('labelExitAmmFailed'),
        })
      } else if ((error as sdk.RESULT_INFO)?.code) {
        const errorItem = SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO)?.code ?? 700001]
        if ([102024, 102025, 114001, 114002].includes((error as sdk.RESULT_INFO)?.code || 0)) {
          await updateExitFee()
        }
        setToastOpen({
          open: true,
          type: ToastType.error,
          content:
            t('labelExitAmmFailed') +
            ' error: ' +
            (errorItem
              ? t(errorItem.messageKey, { ns: ToastType.error })
              : (error as sdk.RESULT_INFO).message),
        })
      } else if (error?.message) {
        sdk.dumpError400(error)
        setToastOpen({
          open: true,
          type: ToastType.error,
          content: t('labelExitAmmFailed'),
        })
      }
    }
    updatePageAmmExit({
      ammData: {
        ...ammData,
        ...{
          coinLP: { ...ammData.coinLP, tradeValue: 0 },
        },
      },
    })

    walletLayer2Service.sendUserUpdate()
    // @ts-ignore
    refreshRef?.current?.firstElementChild.click()
    await sdk.sleep(SUBMIT_PANEL_QUICK_AUTO_CLOSE)
    setIsLoading(false)
    // await updateExitFee();
  }, [ammData, account, ammInfo])

  const walletLayer2Callback = React.useCallback(async () => {
    updateExitFee()
  }, [])

  useWalletLayer2Socket({ walletLayer2Callback })

  return {
    ammCalcData,
    ammData: ammData,
    propsLPExtends: {
      coinPrecision: tokenMap['LP-' + ammInfo.market].precision,
    },
    handleAmmPoolEvent,
    btnStatus,
    onAmmClick: onBtnClick,
    btnI18nKey: btnLabel,
    // updateExitFee,
    exitSmallOrderCloseClick: (isAgree = false) => {
      if (isAgree) {
        submitAmmExit()
      }
    },
  }
}
