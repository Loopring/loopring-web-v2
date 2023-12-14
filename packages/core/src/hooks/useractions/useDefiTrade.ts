import React from 'react'
import {
  DeFiWrapProps,
  ToastType,
  useOpenModals,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  CustomErrorWithCode,
  DEFI_CONFIG,
  LEVERAGE_ETH_CONFIG,
  DeFiCalcData,
  DeFiChgType,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  MapChainId,
  MarketType,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  TradeBtnStatus,
  TradeDefi,
} from '@loopring-web/common-resources'

import _ from 'lodash'

import * as sdk from '@loopring-web/loopring-sdk'

import {
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  useAccount,
  useSystem,
  useTokenMap,
  walletLayer2Service,
  makeWalletLayer2,
  useSubmitBtn,
  useWalletLayer2Socket,
  useDefiMap,
  useTradeDefi,
} from '../../index'
import { useTranslation } from 'react-i18next'

export const useDefiTrade = <T extends IBData<I>, I, ACD extends DeFiCalcData<T>>({
  isJoin = true,
  isLeverageETH = false,
  market,
  setToastOpen,
  setServerUpdate,
  setConfirmShowNoBalance,
  confirmShowLimitBalance,
  setConfirmShowLimitBalance,
}: {
  market: string
  isJoin: boolean
  isLeverageETH: boolean
  setServerUpdate: (state: any) => void
  setConfirmShowLimitBalance: (state: boolean) => void
  setConfirmShowNoBalance: (state: boolean) => void
  confirmShowLimitBalance: boolean
  setToastOpen: (props: { open: boolean; content: JSX.Element | string; type: ToastType }) => void
}) => {
  const { t } = useTranslation(['common'])
  const refreshRef = React.createRef()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const { marketMap, marketLeverageMap, updateDefiSyncMap } = useDefiMap()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isStoB, setIsStoB] = React.useState(true)

  const { tokenMap } = useTokenMap()
  const { account } = useAccount()
  // const { status: walletLayer2Status } = useWalletLayer2();
  const { exchangeInfo, allowTrade } = useSystem()
  const { updateTradeDefi, resetTradeDefi } = useTradeDefi()
  const { setShowSupport, setShowTradeIsFrozen, setShowETHStakingApr } = useOpenModals()

  const { toggle } = useToggle()
  const [{ coinSellSymbol, coinBuySymbol }, setSymbol] = React.useState(() => {
    if (isJoin) {
      const [, coinBuySymbol, coinSellSymbol] = market.match(/(\w+)-(\w+)/i) ?? []
      return { coinBuySymbol, coinSellSymbol }
    } else {
      const [, coinSellSymbol, coinBuySymbol] = market.match(/(\w+)-(\w+)/i) ?? []
      return { coinBuySymbol, coinSellSymbol }
    }
  })

  const getFee = React.useCallback(
    async (
      requestType: sdk.OffchainFeeReqType.DEFI_JOIN | sdk.OffchainFeeReqType.DEFI_EXIT,
    ): Promise<{ fee: string; feeRaw: string } | undefined> => {
      if (
        LoopringAPI.userAPI &&
        coinSellSymbol &&
        account.readyState === AccountStatus.ACTIVATED &&
        tokenMap
      ) {
        const feeToken: sdk.TokenInfo = tokenMap[coinBuySymbol]

        const request: sdk.GetOffchainFeeAmtRequest = {
          accountId: account.accountId,
          requestType,
          market,
        }

        const { fees } = await LoopringAPI.userAPI.getOffchainFeeAmt(request, account.apiKey)

        const feeRaw = fees[coinBuySymbol] ? fees[coinBuySymbol].fee : '0'
        const fee = sdk
          .toBig(feeRaw)
          .div('1e' + feeToken.decimals)
          .toString()

        myLog('new fee:', fee.toString())
        return {
          fee: fee,
          feeRaw: feeRaw,
          // fees,
        }
      }
    },
    [
      coinSellSymbol,
      account.readyState,
      account.accountId,
      account.apiKey,
      tokenMap,
      coinBuySymbol,
      market,
    ],
  )

  const handleOnchange = _.debounce(
    ({
      tradeData,
      type,
      _tradeDefi = {},
    }: {
      type: DeFiChgType
      tradeData: T
      _tradeDefi?: Partial<TradeDefi<T>>
    }) => {
      const marketInfo = (isLeverageETH ? marketLeverageMap : marketMap)[market]
      let calcValue, feeRaw, fee
      let newTradeDefi = {
        ...store.getState()._router_tradeDefi.tradeDefi,
        ..._tradeDefi,
      }
      let _deFiCalcData: DeFiCalcData<T> = newTradeDefi.deFiCalcData as unknown as DeFiCalcData<T>
      if (
        tradeData &&
        newTradeDefi.defiBalances &&
        coinBuySymbol &&
        newTradeDefi?.defiBalances[coinBuySymbol]
      ) {
        const inputValue =
          type === DeFiChgType.coinSell
            ? {
                sellAmount: tradeData?.tradeValue?.toString() ?? '0',
              }
            : {
                buyAmount: tradeData?.tradeValue?.toString() ?? '0',
              }
        const buyTokenBalanceVol: string = newTradeDefi?.defiBalances[coinBuySymbol] ?? ''
        calcValue = sdk.calcDefi({
          isJoin,
          isInputSell: type === DeFiChgType.coinSell,
          ...inputValue,
          maxFeeBips: (isLeverageETH ? marketLeverageMap : marketMap)[market]?.extra?.maxFeeBips,
          defaultFee: newTradeDefi.defaultFee,
          marketInfo,
          tokenSell: tokenMap[coinSellSymbol],
          tokenBuy: tokenMap[coinBuySymbol],
          buyTokenBalanceVol,
          withdrawFeeBips: (isLeverageETH ? marketLeverageMap : marketMap)[market]?.extra
            ?.withdrawFeeBips,
        })

        const sellAmount =
          tradeData?.tradeValue === undefined
            ? undefined
            : getValuePrecisionThousand(
                sdk.toBig(calcValue?.sellVol ?? 0).div('1e' + tokenMap[coinSellSymbol]?.decimals),
                tokenMap[coinSellSymbol].precision,
                tokenMap[coinSellSymbol].precision,
                tokenMap[coinSellSymbol].precision,
                false,
                { floor: false },
              ).replaceAll(sdk.SEP, '')
        const buyAmount =
          tradeData?.tradeValue === undefined
            ? undefined
            : getValuePrecisionThousand(
                sdk.toBig(calcValue?.buyVol ?? 0).div('1e' + tokenMap[coinBuySymbol]?.decimals),
                tokenMap[coinBuySymbol].precision,
                tokenMap[coinBuySymbol].precision,
                tokenMap[coinBuySymbol].precision,
                true,
                { floor: true },
              ).replaceAll(sdk.SEP, '')
        if (sdk.toBig(newTradeDefi.defaultFee).gt(0)) {
          feeRaw = isNaN(calcValue.feeVol) ? '0' : calcValue.feeVol
          fee = sdk
            .toBig(feeRaw)
            .div('1e' + tokenMap[coinBuySymbol].decimals)
            .toString()
        } else {
          feeRaw = '0'
          fee = '0'
        }

        // @ts-ignore
        _deFiCalcData = {
          ..._deFiCalcData,
          fee,
          coinSell:
            type === DeFiChgType.coinSell
              ? tradeData
              : { ..._deFiCalcData?.coinSell, tradeValue: sellAmount },
          coinBuy:
            type === DeFiChgType.coinBuy
              ? tradeData
              : { ..._deFiCalcData?.coinBuy, tradeValue: buyAmount },
        }
      }
      updateTradeDefi({
        market: newTradeDefi.market !== market ? (market as MarketType) : undefined,
        ...newTradeDefi,
        type: marketInfo.type,
        ...calcValue,
        feeRaw,
        fee,
        deFiCalcData: {
          ..._deFiCalcData,
        },
        lastInput: type,
      })
    },
    globalSetup.wait,
  )
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const account = store.getState().account
    const tradeDefi = store.getState()._router_tradeDefi.tradeDefi

    if (account.readyState === AccountStatus.ACTIVATED) {
      const sellExceed = sdk
        .toBig(tradeDefi.deFiCalcData?.coinSell?.tradeValue ?? 0)
        .gt(tradeDefi.deFiCalcData?.coinSell?.balance ?? 0)
      if (
        tradeDefi?.sellVol === undefined ||
        sdk.toBig(tradeDefi?.sellVol).lte(0) ||
        tradeDefi?.buyVol === undefined ||
        sdk.toBig(tradeDefi?.buyVol).lte(0) ||
        tradeDefi?.maxFeeBips === undefined ||
        tradeDefi?.maxFeeBips === 0
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: 'labelEnterAmount',
        }
      } else if (sdk.toBig(tradeDefi?.fee ?? 0).lte(0)) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelFeeCalculating`,
        }
      } else if (
        sdk
          .toBig(tradeDefi?.sellVol)
          .minus(tradeDefi?.miniSellVol ?? 0)
          .lt(0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDefiMin| ${getValuePrecisionThousand(
            sdk.toBig(tradeDefi?.miniSellVol ?? 0).div('1e' + tokenMap[coinSellSymbol]?.decimals),
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            tokenMap[coinSellSymbol].precision,
            false,
            { floor: false, isAbbreviate: true },
          )} ${coinSellSymbol}`,
        }
      } else if (sellExceed) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDefiNoEnough| ${coinSellSymbol}`,
        }
      } else {
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' } // label: ''}
      }
    }
    return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
  }, [market, tokenMap, coinSellSymbol])

  const resetDefault = React.useCallback(
    async (clearTrade: boolean = false, { defaultFee }: { defaultFee?: any }) => {
      let walletMap: any = {}
      const tradeDefi = store.getState()._router_tradeDefi.tradeDefi
      const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i) ?? []
      const { marketLeverageMap, marketMap } = store.getState().invest.defiMap
      const marketInfo = isLeverageETH ? marketLeverageMap[market] : marketMap[market]
      let deFiCalcDataInit: Partial<DeFiCalcData<any>> = {
        ...tradeDefi.deFiCalcData,
        coinSell: {
          belong: coinSellSymbol,
          balance: undefined,
          tradeValue:
            tradeDefi.deFiCalcData?.coinSell?.belong === coinSellSymbol
              ? tradeDefi.deFiCalcData?.coinSell?.tradeValue
              : undefined,
        },
        coinBuy: {
          belong: coinBuySymbol,
          balance: undefined,
          tradeValue:
            tradeDefi.deFiCalcData?.coinBuy?.belong === coinBuySymbol
              ? tradeDefi.deFiCalcData?.coinBuy?.tradeValue
              : undefined,
        },
      }

      if (account.readyState === AccountStatus.ACTIVATED) {
        if (clearTrade) {
          walletLayer2Service.sendUserUpdate()
        }
        walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap ?? {}

        deFiCalcDataInit.coinSell.balance = walletMap[coinSellSymbol]?.count
        deFiCalcDataInit.coinBuy.balance = walletMap[coinBuySymbol]?.count
      }

      myLog(
        'resetDefault defi clearTrade',
        deFiCalcDataInit.coinSell,
        tradeDefi.deFiCalcData?.coinSell?.tradeValue,
        clearTrade,
        defaultFee,
      )
      if (
        tradeDefi.market !== market ||
        clearTrade ||
        tradeDefi.deFiCalcData?.coinSell?.tradeValue === undefined
      ) {
        deFiCalcDataInit.coinSell.tradeValue = undefined
        deFiCalcDataInit.coinBuy.tradeValue = undefined
        const [AtoB, BtoA] = marketInfo
          ? isJoin
            ? [marketInfo.depositPrice, marketInfo.withdrawPrice]
            : [marketInfo.withdrawPrice, marketInfo.depositPrice]
          : ['0', '0']
        updateTradeDefi({
          market: tradeDefi.market !== market ? (market as MarketType) : undefined,
          type: marketInfo.type,
          isStoB,
          sellVol: '0',
          buyVol: '0',
          sellToken: tokenMap[coinSellSymbol],
          buyToken: tokenMap[coinBuySymbol],
          deFiCalcData: {
            ...deFiCalcDataInit,
            AtoB,
            BtoA,
            fee: '',
            // : undefined, //feeInfo?.fee?.toString() ?? '',
          } as DeFiCalcData<T>,
          defiBalances: {
            [baseSymbol]: marketInfo?.baseVolume ?? '',
            [quoteSymbol]: marketInfo?.quoteVolume ?? '',
          } as any,
          defaultFee: defaultFee?.feeRaw,
          depositPrice: marketInfo?.depositPrice ?? '0',
          withdrawPrice: marketInfo?.withdrawPrice ?? '0',
          withdrawFeeBips: marketInfo?.extra?.withdrawFeeBips,
        })
        myLog('resetDefault defi clearTrade', deFiCalcDataInit, marketInfo)
      } else {
        const type = tradeDefi.lastInput ?? DeFiChgType.coinSell
        const _tradeDefi = {
          defiBalances: {
            [baseSymbol]: marketInfo?.baseVolume ?? '',
            [quoteSymbol]: marketInfo?.quoteVolume ?? '',
          } as any,
          defaultFee: defaultFee?.feeRaw,
          depositPrice: marketInfo?.depositPrice ?? '0',
          withdrawPrice: marketInfo?.withdrawPrice ?? '0',
        }
        const tradeData = {
          ...deFiCalcDataInit[type],
          tradeValue: tradeDefi.deFiCalcData[type]?.tradeValue ?? undefined,
        }
        handleOnchange({ tradeData, type, _tradeDefi })
      }

      setIsLoading(false)
    },
    [
      account.readyState,
      coinBuySymbol,
      coinSellSymbol,
      handleOnchange,
      isJoin,
      isStoB,
      market,
      tokenMap,
      updateTradeDefi,
    ],
  )

  const should15sRefresh = _.debounce(async (clearTrade: boolean = false) => {
    myLog('should15sRefresh', market, clearTrade)
    if (market && LoopringAPI.defiAPI) {
      // updateDepth()
      // getDefiMap();
      if (clearTrade) {
        setIsLoading(true)
      }
      Promise.all([
        LoopringAPI.defiAPI?.getDefiMarkets({
          defiType: (isLeverageETH ? LEVERAGE_ETH_CONFIG : DEFI_CONFIG).products[network].join(','),
        }),
        account.readyState === AccountStatus.ACTIVATED
          ? getFee(isJoin ? sdk.OffchainFeeReqType.DEFI_JOIN : sdk.OffchainFeeReqType.DEFI_EXIT)
          : Promise.resolve(undefined),
      ]).then(([defiMapInfo, _feeInfo]) => {
        if ((defiMapInfo as sdk.RESULT_INFO).code || (defiMapInfo as sdk.RESULT_INFO).message) {
          setServerUpdate(true)
        } else {
          let status: any = defiMapInfo.markets[market]?.status ?? 0
          status = ('00000000' + status.toString(2)).split('')
          if (!(isJoin ? status[status.length - 2] === '1' : status[status.length - 4] === '1')) {
            setServerUpdate(true)
          } else {
            updateDefiSyncMap({
              defiMap: {
                marketMap: defiMapInfo.markets,
                marketCoins: defiMapInfo.tokenArr,
                marketArray: defiMapInfo.marketArr,
              },
            })
          }
        }
        resetDefault(clearTrade, { defaultFee: _feeInfo })
      })
      // if (account.readyState === AccountStatus.ACTIVATED) {
      //   resetDefault(clearTrade, {})
      // }
    }
  }, globalSetup.wait)

  const walletLayer2Callback = React.useCallback(async () => {
    const tradeDefi = store.getState()._router_tradeDefi.tradeDefi
    const type = tradeDefi.lastInput ?? DeFiChgType.coinSell
    let tradeValue: any = undefined

    let deFiCalcDataInit: Partial<DeFiCalcData<any>> = {
      coinSell: {
        belong: coinSellSymbol,
        balance: undefined,
      },
      coinBuy: {
        belong: coinBuySymbol,
        balance: undefined,
      },
      ...(tradeDefi?.deFiCalcData ?? {}),
    }
    if (tradeDefi.deFiCalcData) {
      tradeValue = tradeDefi?.deFiCalcData[type]?.tradeValue ?? undefined
    }
    if (deFiCalcDataInit[type]?.belong) {
      let walletMap: any
      if (account.readyState === AccountStatus.ACTIVATED) {
        walletMap = makeWalletLayer2({ needFilterZero: true }).walletMap
        deFiCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: walletMap[coinSellSymbol]?.count,
        }
        deFiCalcDataInit.coinBuy = {
          belong: coinBuySymbol,
          balance: walletMap[coinBuySymbol]?.count,
        }
      } else {
        deFiCalcDataInit.coinSell = {
          belong: coinSellSymbol,
          balance: undefined,
        }
        deFiCalcDataInit.coinBuy = {
          belong: coinBuySymbol,
          balance: undefined,
        }
      }
      const tradeData = {
        ...deFiCalcDataInit[type],
        tradeValue,
      }
      myLog('resetDefault Defi walletLayer2Callback', tradeData)
      handleOnchange({ tradeData, type })
    }
  }, [account.readyState, coinBuySymbol, coinSellSymbol, handleOnchange])

  useWalletLayer2Socket({ walletLayer2Callback })
  const sendRequest = React.useCallback(async () => {
    const tradeDefi = store.getState()._router_tradeDefi.tradeDefi
    try {
      setIsLoading(true)
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        tradeDefi.sellToken?.symbol &&
        tradeDefi.maxFeeBips &&
        exchangeInfo
      ) {
        const req: sdk.GetNextStorageIdRequest = {
          accountId: account.accountId,
          sellTokenId: tradeDefi.sellToken?.tokenId ?? 0,
        }
        const storageId = await LoopringAPI.userAPI.getNextStorageId(req, account.apiKey)
        let fee = tradeDefi.feeRaw
        let maxFeeBips = tradeDefi.maxFeeBips <= 5 ? 5 : tradeDefi.maxFeeBips
        const request: sdk.DefiOrderRequest = {
          exchange: exchangeInfo.exchangeAddress,
          storageId: storageId.orderId,
          accountId: account.accountId,
          sellToken: {
            tokenId: tradeDefi.sellToken?.tokenId ?? 0,
            volume: tradeDefi.sellVol,
          },
          buyToken: {
            tokenId: tradeDefi.buyToken?.tokenId ?? 0,
            volume: tradeDefi.buyVol,
          },
          validUntil: getTimestampDaysLater(DAYS),
          maxFeeBips: maxFeeBips,
          fillAmountBOrS: false,
          action: isJoin ? sdk.DefiAction.Deposit : sdk.DefiAction.Withdraw,
          fee: fee,
          type: tradeDefi.type,
          taker: '',
          eddsaSignature: '',
          // taker:
          // new BN(ethUtil.toBuffer(request.taker)).toString(),
        }
        myLog('DefiTrade request:', request)
        const response = await LoopringAPI.defiAPI.orderDefi(
          request,
          account.eddsaKey.sk,
          account.apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
          throw new CustomErrorWithCode(errorItem)
        } else {
          setToastOpen({
            open: true,
            type: ToastType.success,
            content: t('labelInvestSuccess', {
              type: isJoin ? t('labelInvestDefDeposit') : t('labelInvestDefWithdraw'),
              symbol: coinBuySymbol,
            }),
          })
        }
      } else {
        throw new Error('api not ready')
      }
    } catch (reason) {
      setToastOpen({
        open: true,
        type: ToastType.error,
        content:
          t('labelInvestFailed') + (reason as CustomErrorWithCode)?.messageKey ??
          ` error: ${t((reason as CustomErrorWithCode)?.messageKey)}`,
      })
    } finally {
      setConfirmShowLimitBalance(false)
      should15sRefresh(true)
    }
  }, [
    account.accountId,
    account.apiKey,
    account.eddsaKey.sk,
    coinBuySymbol,
    exchangeInfo,
    isJoin,
    setToastOpen,
    should15sRefresh,
    t,
  ])

  const handleSubmit = React.useCallback(async () => {
    const tradeDefi = store.getState()._router_tradeDefi.tradeDefi
    // const marketInfo = defiMarketMap[market];

    if (
      (account.readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        account.eddsaKey?.sk,
      tradeDefi.buyVol)
    ) {
      const [, tokenBase] = market.match(/(\w+)-(\w+)/i) ?? []

      if (allowTrade && !allowTrade.defiInvest.enable) {
        setShowSupport({ isShow: true })
      } else if (toggle && !toggle[`${tokenBase}Invest`].enable) {
        setShowTradeIsFrozen({ isShow: true, type: 'DefiInvest' })
      } else {
        sendRequest()
      }
    } else {
      return false
    }
  }, [
    market,
    account.readyState,
    account.eddsaKey?.sk,
    tokenMap,
    exchangeInfo,
    sendRequest,
    setToastOpen,
    t,
  ])
  const onSubmitBtnClick = React.useCallback(async () => {
    const tradeDefi = store.getState()._router_tradeDefi.tradeDefi
    if (
      tradeDefi?.maxSellVol &&
      tradeDefi?.sellVol &&
      sdk.toBig(tradeDefi.sellVol).gte(tradeDefi?.maxSellVol)
    ) {
      if (
        sdk
          .toBig(tradeDefi?.maxSellVol ?? 0)
          .minus(tradeDefi.miniSellVol ?? 0)
          .toString()
          .startsWith('-')
      ) {
        setConfirmShowNoBalance(true)
      } else {
        setConfirmShowLimitBalance(true)
        const type = DeFiChgType.coinSell
        const tradeValue = getValuePrecisionThousand(
          sdk.toBig(tradeDefi?.maxSellVol).div('1e' + tokenMap[coinSellSymbol]?.decimals),
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          false,
          { floor: true },
        ).replaceAll(sdk.SEP, '')
        // @ts-ignore
        const oldTrade = (tradeDefi?.deFiCalcData[type] ?? {}) as unknown as T
        handleOnchange({
          tradeData: {
            ...oldTrade,
            tradeValue,
          },
          type,
        })
        // handleOnchange()
      }
    } else {
      handleSubmit()
    }
  }, [tokenMap, coinSellSymbol, handleOnchange, handleSubmit])
  const {
    btnStatus,
    onBtnClick,
    btnLabel: tradeMarketI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading,
    submitCallback: onSubmitBtnClick,
  })
  React.useEffect(() => {
    if (
      market &&
      market !== '' &&
      // walletLayer2Status === SagaStatus.UNSET &&
      isJoin !== undefined
    ) {
      setSymbol(() => {
        if (isJoin) {
          const [, coinBuySymbol, coinSellSymbol] = market.match(/(\w+)-(\w+)/i) ?? []
          return { coinBuySymbol, coinSellSymbol }
        } else {
          const [, coinSellSymbol, coinBuySymbol] = market.match(/(\w+)-(\w+)/i) ?? []
          return { coinBuySymbol, coinSellSymbol }
        }
      })
      if (refreshRef.current) {
        // @ts-ignore
        refreshRef.current.firstElementChild.click()
        should15sRefresh(true)
        myLog('should15sRefresh refreshRef.current click only', market)
      } else {
        should15sRefresh(true)
      }
    }
    return () => {
      myLog('should15sRefresh cancel', market)
      resetTradeDefi()
      should15sRefresh.cancel()
      handleOnchange.cancel()
    }
  }, [isJoin, market])

  const deFiWrapProps = React.useMemo(() => {
    const tradeDefi = store.getState()._router_tradeDefi.tradeDefi
    return {
      isStoB,
      refreshRef,
      onConfirm: sendRequest,
      disabled:
        !tradeDefi.deFiCalcData?.AtoB ||
        (account.readyState === AccountStatus.ACTIVATED && !tradeDefi?.feeRaw),
      btnInfo: {
        label: tradeMarketI18nKey,
        params: {},
      },
      isLoading,
      switchStobEvent: (_isStoB: boolean | ((prevState: boolean) => boolean)) => {
        setIsStoB(_isStoB)
      },
      onRefreshData: should15sRefresh,
      onSubmitClick: onBtnClick as () => void,
      onChangeEvent: handleOnchange,
      tokenAProps: {},
      tokenBProps: {},
      deFiCalcData: {
        ...tradeDefi.deFiCalcData,
      },
      maxBuyVol: tradeDefi.defiBalances ? tradeDefi.defiBalances[coinBuySymbol] : undefined,
      maxSellVol: tradeDefi.maxSellVol,
      confirmShowLimitBalance,
      tokenSell: tokenMap[coinSellSymbol],
      tokenBuy: tokenMap[coinBuySymbol],
      btnStatus,
      accStatus: account.readyState,
      withdrawFeeBips: tradeDefi.maxFeeBips,
      apr: (isLeverageETH ? marketLeverageMap : marketMap)[market]?.apy,
      onAprDetail: () => {
        setShowETHStakingApr({
          isShow: true,
          symbol: market,
          info: (isLeverageETH ? marketLeverageMap : marketMap)[market],
        })
      },
    }
  }, [
    isStoB,
    refreshRef,
    sendRequest,
    account.readyState,
    tradeMarketI18nKey,
    isLoading,
    should15sRefresh,
    onBtnClick,
    handleOnchange,
    confirmShowLimitBalance,
    tokenMap,
    coinSellSymbol,
    coinBuySymbol,
    btnStatus,
  ]) // as ForceWithdrawProps<any, any>;
  return {
    deFiWrapProps: deFiWrapProps as unknown as DeFiWrapProps<T, I, ACD>,
  }
}
