import React from 'react'
import { DeFiWrapProps, ToastType, useOpenModals, useToggle } from '@loopring-web/component-lib'
import {
  AccountStatus,
  CustomErrorWithCode,
  DeFiCalcData,
  DeFiChgType,
  getValuePrecisionThousand,
  globalSetup,
  IBData,
  MarketType,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  TradeBtnStatus,
  TradeDefi,
} from '@loopring-web/common-resources'

import {
  makeWalletLayer2,
  useDefiMap,
  useSubmitBtn,
  useWalletLayer2Socket,
} from '@loopring-web/core'
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
} from '../../index'
import { useTranslation } from 'react-i18next'
import { useTradeLeverageETH } from '../../stores/router/tradeLeverageETH'
import BigNumber from 'bignumber.js'

export const useLeverageETHTrade = <T extends IBData<I>, I, ACD extends DeFiCalcData<T>>({
  isJoin = true,
  market,
  setToastOpen,
  setServerUpdate,
  setConfirmShowNoBalance,
  confirmShowLimitBalance,
  setConfirmShowLimitBalance,
}: {
  market: string
  isJoin: boolean
  setServerUpdate: (state: any) => void
  setConfirmShowLimitBalance: (state: boolean) => void
  setConfirmShowNoBalance: (state: boolean) => void
  confirmShowLimitBalance: boolean
  setToastOpen: (props: { open: boolean; content: JSX.Element | string; type: ToastType }) => void
}) => {
  const { t } = useTranslation(['common'])
  const refreshRef = React.createRef()
  // const match: any = useRouteMatch("/invest/:defi?/:market?/:isJoin?");

  const {
    marketLeverageMap: defiMarketMap,
    // status: defiMarketStatus,
  } = useDefiMap()
  const [isLoading, setIsLoading] = React.useState(false)
  const [isStoB, setIsStoB] = React.useState(true)

  const { tokenMap } = useTokenMap()
  const { account } = useAccount()
  // const { status: walletLayer2Status } = useWalletLayer2();
  const { exchangeInfo, allowTrade } = useSystem()
  const { tradeLeverageETH, updateTradeLeverageETH, resetTradeLeverageETH } = useTradeLeverageETH()
  const { setShowSupport, setShowTradeIsFrozen } = useOpenModals()
  console.log('deFiWrapProps', tradeLeverageETH)

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
      const marketInfo = defiMarketMap[market]
      const tradeLeverageETH = store.getState()._router_tradeLeverageETH.tradeLeverageETH
      let _deFiCalcData: DeFiCalcData<T> =
        tradeLeverageETH.deFiCalcData as unknown as DeFiCalcData<T>
      let calcValue

      let _oldTradeDefi = {
        ...store.getState()._router_tradeLeverageETH.tradeLeverageETH,
        ..._tradeDefi,
      }
      //_.cloneDeep({ ...tradeDefi, ..._tradeDefi });
      myLog('defi handleOnchange', _oldTradeDefi.defiBalances, _oldTradeDefi)

      if (
        tradeData &&
        _oldTradeDefi.defiBalances &&
        coinBuySymbol &&
        _oldTradeDefi?.defiBalances[coinBuySymbol]
      ) {
        const inputValue =
          type === DeFiChgType.coinSell
            ? {
                sellAmount: tradeData?.tradeValue?.toString() ?? '0',
              }
            : {
                buyAmount: tradeData?.tradeValue?.toString() ?? '0',
              }
        const buyTokenBalanceVol: string = _oldTradeDefi?.defiBalances[coinBuySymbol] ?? ''

        calcValue = sdk.calcDefi({
          isJoin,
          isInputSell: type === DeFiChgType.coinSell,
          ...inputValue,
          feeVol: _oldTradeDefi.feeRaw,
          marketInfo,
          tokenSell: tokenMap[coinSellSymbol],
          tokenBuy: tokenMap[coinBuySymbol],
          buyTokenBalanceVol,
        })

        // const dustToken = tokenBuy;

        // const minVolBuy = BigNumber.max(
        //   fm.toBig(feeVol).times(2),
        //   dustToken.orderAmounts.dust
        // );

        // const miniSellVol = BigNumber.max(
        //   minVolBuy.div(sellPrice),
        //   tokenSell.orderAmounts.dust
        // );

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

        // @ts-ignore
        _deFiCalcData = {
          ..._deFiCalcData,
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

      updateTradeLeverageETH({
        market: _oldTradeDefi.market !== market ? (market as MarketType) : undefined,
        ..._oldTradeDefi,
        type: marketInfo.type,
        ...calcValue,
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
    const tradeLeverageETH = store.getState()._router_tradeLeverageETH.tradeLeverageETH

    if (account.readyState === AccountStatus.ACTIVATED) {
      const sellExceed = sdk
        .toBig(tradeLeverageETH.deFiCalcData?.coinSell?.tradeValue ?? 0)
        .gt(tradeLeverageETH.deFiCalcData?.coinSell?.balance ?? 0)
      myLog(
        'sellExceed',
        sellExceed,
        'sellVol',
        tradeLeverageETH.sellVol,
        'buyVol',
        tradeLeverageETH.buyVol,
        'feeRaw',
        tradeLeverageETH.feeRaw,
        'buy market balance',
        //@ts-ignore
        defiMarketMap && defiMarketMap[market]?.baseVolume,
      )
      if (
        tradeLeverageETH?.sellVol === undefined ||
        sdk.toBig(tradeLeverageETH?.sellVol).lte(0) ||
        tradeLeverageETH?.buyVol === undefined ||
        sdk.toBig(tradeLeverageETH?.buyVol).lte(0) ||
        tradeLeverageETH?.maxFeeBips === undefined ||
        tradeLeverageETH?.maxFeeBips === 0
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: 'labelEnterAmount',
        }
      } else if (
        sdk
          .toBig(tradeLeverageETH?.sellVol)
          .minus(tradeLeverageETH?.miniSellVol ?? 0)
          .lt(0)
      ) {
        return {
          tradeBtnStatus: TradeBtnStatus.DISABLED,
          label: `labelDefiMin| ${getValuePrecisionThousand(
            sdk
              .toBig(tradeLeverageETH?.miniSellVol ?? 0)
              .div('1e' + tokenMap[coinSellSymbol]?.decimals),
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
  }, [defiMarketMap, market, tradeLeverageETH.deFiCalcData, tokenMap, coinSellSymbol])

  const resetDefault = React.useCallback(
    async (clearTrade: boolean = false, feeInfo: undefined | { fee: any; feeRaw: any }) => {
      let walletMap: any = {}
      const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i) ?? []
      const defiMarketMap = store.getState().invest.defiMap?.marketLeverageMap
      const marketInfo = defiMarketMap[market]
      let deFiCalcDataInit: Partial<DeFiCalcData<any>> = {
        ...tradeLeverageETH.deFiCalcData,
        coinSell: {
          belong: coinSellSymbol,
          balance: undefined,
          tradeValue:
            tradeLeverageETH.deFiCalcData?.coinSell?.belong === coinSellSymbol
              ? tradeLeverageETH.deFiCalcData?.coinSell?.tradeValue
              : undefined,
        },
        coinBuy: {
          belong: coinBuySymbol,
          balance: undefined,
          tradeValue:
            tradeLeverageETH.deFiCalcData?.coinBuy?.belong === coinBuySymbol
              ? tradeLeverageETH.deFiCalcData?.coinBuy?.tradeValue
              : undefined,
        },
      }

      let _feeInfo = feeInfo
        ? feeInfo
        : {
            fee: tradeLeverageETH.fee,
            feeRaw: tradeLeverageETH.feeRaw,
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
        tradeLeverageETH.deFiCalcData?.coinSell?.tradeValue,
        clearTrade,
        feeInfo,
      )
      if (
        tradeLeverageETH.market !== market ||
        clearTrade ||
        tradeLeverageETH.deFiCalcData?.coinSell?.tradeValue === undefined
      ) {
        deFiCalcDataInit.coinSell.tradeValue = undefined
        deFiCalcDataInit.coinBuy.tradeValue = undefined
        const [AtoB, BtoA] = marketInfo
          ? isJoin
            ? [marketInfo.depositPrice, marketInfo.withdrawPrice]
            : [marketInfo.withdrawPrice, marketInfo.depositPrice]
          : ['0', '0']

        updateTradeLeverageETH({
          market: tradeLeverageETH.market !== market ? (market as MarketType) : undefined,
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
            fee: feeInfo?.fee?.toString() ?? '',
          } as DeFiCalcData<T>,
          defiBalances: {
            [baseSymbol]: marketInfo?.baseVolume ?? '',
            [quoteSymbol]: marketInfo?.quoteVolume ?? '',
          } as any,
          fee: _feeInfo?.fee.toString(),
          feeRaw: _feeInfo?.feeRaw.toString(),
          depositPrice: marketInfo?.depositPrice ?? '0',
          withdrawPrice: marketInfo?.withdrawPrice ?? '0',
          withdrawFeeBips: marketInfo?.extra.withdrawFeeBips,
        })
        myLog('resetDefault defi clearTrade', deFiCalcDataInit, marketInfo)
      } else {
        const type = tradeLeverageETH.lastInput ?? DeFiChgType.coinSell
        const _tradeDefi = {
          defiBalances: {
            [baseSymbol]: marketInfo?.baseVolume ?? '',
            [quoteSymbol]: marketInfo?.quoteVolume ?? '',
          } as any,
          fee: _feeInfo?.fee.toString(),
          feeRaw: _feeInfo?.feeRaw.toString(),
          depositPrice: marketInfo?.depositPrice ?? '0',
          withdrawPrice: marketInfo?.withdrawPrice ?? '0',
        }
        const tradeData = {
          ...deFiCalcDataInit[type],
          tradeValue: tradeLeverageETH.deFiCalcData[type]?.tradeValue ?? undefined,
        }
        handleOnchange({ tradeData, type, _tradeDefi })
      }

      setIsLoading(false)
    },
    [
      account.readyState,
      coinBuySymbol,
      coinSellSymbol,
      defiMarketMap,
      handleOnchange,
      isJoin,
      isStoB,
      market,
      tokenMap,
      tradeLeverageETH.deFiCalcData,
      tradeLeverageETH.fee,
      tradeLeverageETH.feeRaw,
      tradeLeverageETH.lastInput,
      tradeLeverageETH.market,
      updateTradeLeverageETH,
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
        LoopringAPI.defiAPI?.getDefiMarkets({}),
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
          }
        }
        resetDefault(clearTrade, {
          fee: tradeLeverageETH.fee,
          feeRaw: tradeLeverageETH.feeRaw,
          ..._feeInfo,
        })
      })
      if (account.readyState === AccountStatus.ACTIVATED) {
        resetDefault(clearTrade, undefined)
      }
    }
  }, globalSetup.wait)

  const walletLayer2Callback = React.useCallback(async () => {
    const type = tradeLeverageETH.lastInput ?? DeFiChgType.coinSell
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
      ...(tradeLeverageETH?.deFiCalcData ?? {}),
    }
    if (tradeLeverageETH.deFiCalcData) {
      tradeValue = tradeLeverageETH?.deFiCalcData[type]?.tradeValue ?? undefined
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
  }, [
    account.readyState,
    coinBuySymbol,
    coinSellSymbol,
    handleOnchange,
    tradeLeverageETH.deFiCalcData,
    tradeLeverageETH.lastInput,
  ])

  useWalletLayer2Socket({ walletLayer2Callback })
  const sendRequest = React.useCallback(async () => {
    try {
      setIsLoading(true)
      if (
        LoopringAPI.userAPI &&
        LoopringAPI.defiAPI &&
        tradeLeverageETH.sellToken?.symbol &&
        tradeLeverageETH.maxFeeBips &&
        exchangeInfo
      ) {
        const req: sdk.GetNextStorageIdRequest = {
          accountId: account.accountId,
          sellTokenId: tradeLeverageETH.sellToken?.tokenId ?? 0,
        }
        const storageId = await LoopringAPI.userAPI.getNextStorageId(req, account.apiKey)
        let maxFeeBips
        let fee
        if (isJoin) {
          fee = tradeLeverageETH.feeRaw
          maxFeeBips = tradeLeverageETH.maxFeeBips <= 5 ? 5 : tradeLeverageETH.maxFeeBips
        } else {
          const feeBip = Number(
            sdk
              .toBig(tradeLeverageETH.feeRaw)
              .times('10000')
              .div(tradeLeverageETH.buyVol)
              .toFixed(0, BigNumber.ROUND_CEIL),
          )
          maxFeeBips = sdk
            .toBig(tradeLeverageETH.withdrawFeeBips ?? 0)
            .plus(feeBip)
            .toNumber()
          fee = sdk
            .toBig(tradeLeverageETH.withdrawFeeBips ?? 0)
            .times(tradeLeverageETH.buyVol)
            .div('10000')
            .plus(tradeLeverageETH.feeRaw)
            .toString()
        }
        const request: sdk.DefiOrderRequest = {
          exchange: exchangeInfo.exchangeAddress,
          storageId: storageId.orderId,
          accountId: account.accountId,
          sellToken: {
            tokenId: tradeLeverageETH.sellToken?.tokenId ?? 0,
            volume: tradeLeverageETH.sellVol,
          },
          buyToken: {
            tokenId: tradeLeverageETH.buyToken?.tokenId ?? 0,
            volume: tradeLeverageETH.buyVol,
          },
          validUntil: getTimestampDaysLater(DAYS),
          maxFeeBips: maxFeeBips,
          fillAmountBOrS: false,
          action: isJoin ? sdk.DefiAction.Deposit : sdk.DefiAction.Withdraw,
          fee: fee,
          type: tradeLeverageETH.type,
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
    tradeLeverageETH.buyToken?.tokenId,
    tradeLeverageETH.buyVol,
    tradeLeverageETH.feeRaw,
    tradeLeverageETH.maxFeeBips,
    tradeLeverageETH.sellToken?.symbol,
    tradeLeverageETH.sellToken?.tokenId,
    tradeLeverageETH.sellVol,
    tradeLeverageETH.type,
  ])

  const handleSubmit = React.useCallback(async () => {
    const { tradeLeverageETH } = store.getState()._router_tradeLeverageETH
    // const marketInfo = defiMarketMap[market];

    if (
      (account.readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        account.eddsaKey?.sk,
      tradeLeverageETH.buyVol)
    ) {
      if (allowTrade && !allowTrade.defiInvest.enable) {
        setShowSupport({ isShow: true })
      } else if (toggle && !toggle.leverageETHInvest.enable) {
        setShowTradeIsFrozen({ isShow: true, type: 'leverageETHInvest' })
      } else {
        sendRequest()
      }
    } else {
      return false
    }
  }, [
    market,
    defiMarketMap,
    account.readyState,
    account.eddsaKey?.sk,
    tokenMap,
    exchangeInfo,
    sendRequest,
    setToastOpen,
    t,
  ])
  const onSubmitBtnClick = React.useCallback(async () => {
    const tradeLeverageETH = store.getState()._router_tradeLeverageETH.tradeLeverageETH
    if (
      tradeLeverageETH?.maxSellVol &&
      tradeLeverageETH?.sellVol &&
      sdk.toBig(tradeLeverageETH.sellVol).gte(tradeLeverageETH?.maxSellVol)
    ) {
      if (
        sdk
          .toBig(tradeLeverageETH?.maxSellVol ?? 0)
          .minus(tradeLeverageETH.miniSellVol ?? 0)
          .toString()
          .startsWith('-')
      ) {
        setConfirmShowNoBalance(true)
      } else {
        setConfirmShowLimitBalance(true)
        const type = DeFiChgType.coinSell
        const tradeValue = getValuePrecisionThousand(
          sdk.toBig(tradeLeverageETH?.maxSellVol).div('1e' + tokenMap[coinSellSymbol]?.decimals),
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          tokenMap[coinSellSymbol].precision,
          false,
          { floor: true },
        ).replaceAll(sdk.SEP, '')
        // @ts-ignore
        const oldTrade = (tradeLeverageETH?.deFiCalcData[type] ?? {}) as unknown as T
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
      resetTradeLeverageETH()
      should15sRefresh.cancel()
      handleOnchange.cancel()
    }
  }, [isJoin, market])
  myLog('isLoading', isLoading)
  const extraWithdrawFee = sdk
    .toBig(tradeLeverageETH.withdrawFeeBips ?? 0)
    .times(tradeLeverageETH.buyVol)
    .div('10000')
    .div('1e' + tradeLeverageETH.sellToken.decimals)
    .toString()
  const deFiWrapProps = React.useMemo(() => {
    return {
      isStoB,
      refreshRef,
      onConfirm: sendRequest,
      disabled:
        !tradeLeverageETH.deFiCalcData?.AtoB ||
        (account.readyState === AccountStatus.ACTIVATED && !tradeLeverageETH?.feeRaw),
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
        ...tradeLeverageETH.deFiCalcData,
      },
      maxBuyVol: tradeLeverageETH.defiBalances
        ? tradeLeverageETH.defiBalances[coinBuySymbol]
        : undefined,
      maxSellVol: tradeLeverageETH.maxSellVol,
      confirmShowLimitBalance,
      tokenSell: tokenMap[coinSellSymbol],
      tokenBuy: tokenMap[coinBuySymbol],
      btnStatus,
      accStatus: account.readyState,
      extraWithdrawFee: extraWithdrawFee,
    }
  }, [
    isStoB,
    refreshRef,
    sendRequest,
    tradeLeverageETH.defiBalances,
    tradeLeverageETH.deFiCalcData,
    tradeLeverageETH?.feeRaw,
    tradeLeverageETH.maxSellVol,
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
    extraWithdrawFee,
  ]) // as ForceWithdrawProps<any, any>;
  return {
    deFiWrapProps: deFiWrapProps as unknown as DeFiWrapProps<T, I, ACD>,
    // confirmShowNoBalance,
    // setConfirmShowNoBalance,
    // serverUpdate,
    // setServerUpdate,
  }
}
