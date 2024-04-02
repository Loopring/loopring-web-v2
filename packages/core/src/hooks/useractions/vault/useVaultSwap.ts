import * as sdk from '@loopring-web/loopring-sdk'
import React from 'react'

import {
  AccountStatus,
  CoinMap,
  CustomErrorWithCode,
  defaultBlockTradeSlipage,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  MapChainId,
  MarketType,
  myLog,
  SagaStatus,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_AUTO_CLOSE,
  SUBMIT_PANEL_CHECK,
  TradeBtnStatus,
  UIERROR_CODE,
  VaultSwapStep,
  VaultTradeCalcData,
  WalletMap,
} from '@loopring-web/common-resources'
import {
  AccountStep,
  SwapData,
  SwapTradeData,
  SwapType,
  ToastType,
  useOpenModals,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'

import BigNumber from 'bignumber.js'
import {
  btradeOrderbookService,
  calcSupportBorrowData,
  DAYS,
  getTimestampDaysLater,
  l2CommonService,
  LoopringAPI,
  makeVaultAvaiable2,
  makeVaultLayer2,
  MAPFEEBIPS,
  marketInitCheck,
  onchainHashInfo,
  reCalcStoB,
  store,
  updateVaultTrade,
  useAccount,
  useL2CommonSocket,
  usePairMatch,
  useSocket,
  useSubmitBtn,
  useSystem,
  useToast,
  useTokenMap,
  useTokenPrices,
  useTradeVault,
  useVaultLayer2,
  useVaultMap,
  VaultBorrowTradeData,
  VaultMapStates,
  vaultSwapDependAsync,
} from '@loopring-web/core'
import { merge } from 'rxjs'
const makeVaultSell = (sellSymbol: string) => {
  const {
    tokenMap: { idIndex: erc20IdIndex },
    invest: {
      vaultMap: { tokenMap: vaultTokenMap },
    },
    vaultLayer2: { vaultLayer2 },
  } = store.getState()
  if (sellSymbol) {
    const vaultAvaiable2Map = makeVaultAvaiable2({}).vaultAvaiable2Map
    const sellToken = vaultTokenMap[sellSymbol]
    const orderAmounts = sellToken.orderAmounts
    const totalQuote = sdk.toBig(orderAmounts.maximum ?? 0).div('1e' + sellToken.decimals)
    const vaultAsset = (vaultLayer2 && vaultLayer2[sellSymbol]) ?? 0
    const countBig = sdk.toBig(vaultAsset?.l2balance ?? 0).minus(vaultAsset?.locked ?? 0)
    const count = sdk
      .toBig(countBig)
      .div('1e' + sellToken.decimals)
      .toFixed(sellToken?.vaultTokenAmounts?.qtyStepScale, BigNumber.ROUND_DOWN)
    const borrowAvailable = sdk
      .toBig(
        BigNumber.min(totalQuote, (vaultAvaiable2Map && vaultAvaiable2Map[sellSymbol]?.count) ?? 0),
      )
      .toFixed(sellToken?.vaultTokenAmounts?.qtyStepScale, BigNumber.ROUND_DOWN)
    const balance = sdk
      .toBig(count ?? 0)
      .plus(borrowAvailable)
      .toString()
    return {
      borrowAvailable,
      count,
      countBig,
      balance,
      erc20Symbol: erc20IdIndex[sellToken.tokenId],
    }
  } else {
    return {}
  }
}
const useVaultTradeSocket = () => {
  const { tradeVault, updateTradeVault } = useTradeVault()
  const { sendSocketTopic, socketEnd } = useSocket()
  const subjectBtradeOrderbook = React.useMemo(() => btradeOrderbookService.onSocket(), [])
  // const _debonceCall = _.debounce(() => upateAPICall(), globalSetup.wait)

  React.useEffect(() => {
    const {
      account: { accAddress },
      _router_tradeVault: { tradeVault },
      settings: { defaultNetwork },
      invest: {
        vaultMap: { marketMap },
      },
    } = store.getState()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const networkWallet: sdk.NetworkWallet = [
      sdk.NetworkWallet.ETHEREUM,
      sdk.NetworkWallet.GOERLI,
    ].includes(network as sdk.NetworkWallet)
      ? sdk.NetworkWallet.ETHEREUM
      : sdk.NetworkWallet[network]
    const item = marketMap[tradeVault?.market]
    if (tradeVault?.depth?.symbol && item?.wsMarket) {
      sendSocketTopic({
        [sdk.WsTopicType.btradedepth]: {
          showOverlap: false,
          markets: [item.wsMarket],
          level: 0,
          count: 50,
          snapshot: false,
        },
        [sdk.WsTopicType.l2Common]: {
          address: accAddress,
          network: networkWallet,
        },
      })
    } else {
      socketEnd()
    }
    return () => {
      socketEnd()
    }
  }, [tradeVault?.depth?.symbol])
  React.useEffect(() => {
    const subscription = merge(subjectBtradeOrderbook).subscribe(({ btradeOrderbookMap }) => {
      const {
        _router_tradeVault: { tradeVault },
        invest: {
          vaultMap: { marketMap },
        },
      } = store.getState()
      const item = marketMap[tradeVault.market]
      if (
        item &&
        btradeOrderbookMap &&
        item?.wsMarket &&
        btradeOrderbookMap[item.wsMarket] &&
        tradeVault?.depth?.symbol &&
        item.wsMarket === btradeOrderbookMap[item.wsMarket]?.symbol
      ) {
        updateTradeVault({
          market: item.market,
          depth: { ...btradeOrderbookMap[item.wsMarket], symbol: tradeVault.depth.symbol },
          ...item,
        })
        myLog('useVaultSwap: depth', btradeOrderbookMap[item.wsMarket])
        // debonceCall()
      }
    })
    return () => subscription.unsubscribe()
  }, [tradeVault.market])
}
export type VaultTradeTradeData = VaultBorrowTradeData & { borrowAvailable: string }
export const useVaultSwap = <
  T extends SwapTradeData<X>,
  C extends { [key: string]: any },
  CAD extends VaultTradeCalcData<T>,
  X extends VaultTradeTradeData,
>({
  path,
}: {
  path: string
}) => {
  const borrowHash = React.useRef<null | { hash: string; timer?: any }>(null)
  const { idIndex: erc20IdIndex } = useTokenMap()
  const { account } = useAccount()
  const { tokenMap, marketMap, coinMap, marketArray, marketCoins, getVaultMap } = useVaultMap()
  const { tokenPrices } = useTokenPrices()
  const {
    setShowSupport,
    setShowTradeIsFrozen,
    modals: { isShowVaultSwap },
    setShowAccount,
    setShowVaultSwap,
    setShowGlobalToast,
  } = useOpenModals()
  const { chainInfos, updateVaultBorrowHash } = onchainHashInfo.useOnChainInfo()
  const { vaultAccountInfo } = useVaultLayer2()
  // //High: No not Move!!!!!!
  //@ts-ignore
  const { realMarket } = usePairMatch({
    path,
    //@ts-ignore
    coinA: isShowVaultSwap?.symbol ?? marketArray[0]?.match(/(\w+)-(\w+)/i)[1] ?? '#null',
    coinB: '#null',
    marketArray,
    tokenMap,
  })
  const { t } = useTranslation(['common', 'error'])
  const [isSwapLoading, _setIsSwapLoading] = React.useState(false)
  const setIsSwapLoading = (args) => {
    myLog('setIsSwapLoading', args)
    _setIsSwapLoading(args)
  }
  myLog('setIsSwapLoading isSwapLoading', isSwapLoading)
  

  const refreshRef = React.createRef()
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { isMobile } = useSettings()

  const {
    toggle: { VaultInvest },
  } = useToggle()

  /** loaded from loading **/
  const { exchangeInfo, allowTrade } = useSystem()

  const { status: vaultLayerStatus } = useVaultLayer2()
  const [tradeData, setTradeData] = React.useState<T | undefined>(undefined)
  const [tradeCalcData, setTradeCalcData] = React.useState<Partial<CAD>>({
    lockedNotification: true,
    isVault: true,
    coinInfoMap: marketCoins?.reduce((prev: any, item: string ) => {
      return {
        ...prev,
        [item]: {
          ...(coinMap && coinMap[item]),
          erc20Symbol: item.slice(2),
          belongAlice: item.slice(2),
        },
      }
    }, {} as CoinMap<C>),
  } as any)

  /** redux storage **/
  const {
    tradeVault,
    updateTradeVault,
    __SUBMIT_LOCK_TIMER__,
    __TOAST_AUTO_CLOSE_TIMER__,
    __DAYS__,
    resetTradeVault,
  } = useTradeVault()
  const result = marketArray && marketArray[0] && marketArray[0].match(/([\w,#]+)-([\w,#]+)/i)

  const resetMarket = (_market: MarketType, type: 'sell' | 'buy') => {
    const { tradePair } = marketInitCheck({
      market: _market,
      type,
      defaultValue: marketArray[0],
      marketArray,
      marketMap,
      tokenMap,
      coinMap,
      defaultA: result && result[1],
      defaultB: result && result[2],
    })
    // @ts-ignore
    const [_, sellToken, buyToken] = (tradePair ?? '').match(/(\w+)-(\w+)/i)
    let { market } = sdk.getExistedMarket(marketArray, sellToken, buyToken)
    setIsMarketStatus((state) => {
      return {
        tradePair,
        market,
        isMarketInit: state?.market !== market,
      }
    })
    if (coinMap && tokenMap && marketMap && tokenMap && marketArray) {
      // @ts-ignore
      const [, coinA, coinB] = tradePair.match(/([\w,#]+)-([\w,#]+)/i)
      let walletMap: WalletMap<any> | undefined
      if (account.readyState === AccountStatus.ACTIVATED && vaultLayerStatus === SagaStatus.UNSET) {
        if (!Object.keys(tradeCalcData?.walletMap ?? {}).length) {
          walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map
        }
        walletMap = tradeCalcData?.walletMap as WalletMap<any>
      }

      const tradeDataTmp: any = {
        sell: {
          belong: coinA,
          tradeValue: undefined,
          ...makeVaultSell(coinA),
        },
        buy: {
          belong: coinB,
          tradeValue: undefined,
          ...makeVaultSell(coinB),
        },
      }

      const sellCoinInfoMap = tokenMap[coinB]?.tradePairs?.reduce(
        (prev: any, item: string ) => {
          return { ...prev, [item]: {
            ...coinMap[item],
            erc20Symbol: item.slice(2),
            belongAlice: item.slice(2),
          }}
        },
        {} as CoinMap<C>,
      )

      const buyCoinInfoMap = tokenMap[coinA]?.tradePairs?.reduce(
        (prev: any, item: string | number) => {
          return { ...prev, [item]: coinMap[item] }
        },
        {} as CoinMap<C>,
      )
      let _tradeCalcData = {},
        showHasBorrow = false
      setTradeCalcData((state) => {
        _tradeCalcData = {
          ...state,
          walletMap,
          coinSell: coinA,
          coinBuy: coinB,
          belongSellAlice: tokenMap[coinA].symbol.slice(2),
          belongBuyAlice: tokenMap[coinB].symbol.slice(2),
          sellPrecision: tokenMap[coinA as string]?.precision,
          buyPrecision: tokenMap[coinB as string]?.precision,
          sellCoinInfoMap,
          buyCoinInfoMap,
          StoB: undefined,
          BtoS: undefined,
          fee: undefined,
          tradeCost: undefined,
          lockedNotification: true,
          volumeSell: undefined,
          volumeBuy: undefined,
          sellMinAmtStr: undefined,
          sellMaxL2AmtStr: undefined,
          sellMaxAmtStr: undefined,
          totalQuota: undefined,
          l1Pool: undefined,
          l2Pool: undefined,
          step: VaultSwapStep.Edit,
          borrowStr: 0,
          borrowVol: 0,
          showHasBorrow,
          isRequiredBorrow: undefined,
        }
        return _tradeCalcData
      })
      setTradeData((state) => {
        return {
          ...state,
          ...tradeDataTmp,
        }
      })
      // searchParams.set('market', _market)
      // history.replace(pathname + '?' + searchParams.toString())
      updateTradeVault({
        market,
        tradePair,
        tradeCalcData: _tradeCalcData,
        isRequiredBorrow: false,
      })
    }
  }
  const [{ market, isMarketInit }, setIsMarketStatus] = React.useState<{
    market: MarketType | undefined
    tradePair?: MarketType
    isMarketInit?: boolean
  }>({ market: undefined })
  React.useEffect(() => {
    if (isShowVaultSwap.isShow) {
      resetMarket(`${isShowVaultSwap?.symbol ?? '#null'}-#null`, 'sell')
    } else {
      resetTradeVault()
      setIsSwapLoading(false)
      if (market) {
        resetMarket(market as any, 'sell')
      }
      setIsMarketStatus({ market: undefined })
      if (borrowHash?.current?.hash) {
        updateVaultBorrowHash(borrowHash?.current?.hash, account.accAddress)
      }
      setToastOpen({ open: false, content: '', type: ToastType.info, step: '' })
    }
    return () => {
      if (borrowHash?.current?.hash) {
        updateVaultBorrowHash(borrowHash?.current?.hash, account.accAddress)
      }
      if (borrowHash.current?.timer) {
        clearTimeout(borrowHash.current?.timer)
        setIsSwapLoading(false)
        borrowHash.current = null
      }
    }
  }, [isShowVaultSwap?.isShow])
  const startLoopHashCheck = () => {
    const { account } = store.getState()
    if (borrowHash.current?.timer) {
      clearTimeout(borrowHash.current?.timer)
    }
    if (borrowHash?.current?.hash) {
      LoopringAPI?.vaultAPI
        .getVaultGetOperationByHash(
          {
            accountId: account.accountId?.toString(),
            hash: borrowHash?.current?.hash,
          },
          account.apiKey,
        )
        .then(({ operation }) => {
          if (sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED == operation?.status) {
            clearTimeout(borrowHash.current?.timer)
            borrowHash.current = null
            l2CommonService.sendUserUpdate()
            // setIsSwapLoading(false)
            setTradeCalcData((state) => {
              return {
                ...state,
                step: VaultSwapStep.Swap,
              }
            })
          } else if (sdk.VaultOperationStatus.VAULT_STATUS_FAILED == operation?.status) {
            clearTimeout(borrowHash.current?.timer)
            borrowHash.current = null
            l2CommonService.sendUserUpdate()
            setIsSwapLoading(false)
            handleSwapPanelEvent(
              {
                type: 'sell',
                tradeData: {
                  ...tradeData,
                  sell: {
                    ...tradeData?.sell,
                    tradeValue: tradeData?.sell?.count,
                  },
                },
              },
              SwapType.SELL_SELECTED,
            )
            setTradeCalcData((state) => {
              return {
                ...state,
                step: VaultSwapStep.Edit,
              }
            })
            setToastOpen({
              open: true,
              type: ToastType.error,
              content: t('labelVaultBorrowFailed'),
              step: VaultSwapStep.Borrow,
            })
          } else {
            borrowHash.current = {
              hash: operation.hash,
              timer: setTimeout(() => {
                startLoopHashCheck()
              }, SUBMIT_PANEL_CHECK),
            }
          }
        })
    } else {
      borrowHash.current = null
    }
  }

  React.useEffect(() => {
    if (tradeCalcData.step == VaultSwapStep.Swap) {
      const {
        _router_tradeVault: {
          tradeVault: { tradeCalcData },
        },
      } = store.getState()
      if (tradeCalcData?.coinSell && tradeCalcData?.volumeSell) {
        const { countBig } = makeVaultSell(tradeCalcData.coinSell)
        if (sdk.toBig(countBig ?? 0).gte(tradeCalcData.volumeSell ?? 0)) {
          myLog(
            `VaultSwapStep.Swaping ${tradeCalcData?.coinSell}`,
            countBig.toString(),
            tradeCalcData.volumeSell.toString(),
          )
          setTradeCalcData((state) => {
            const newState = {
              ...state,
              step: VaultSwapStep.Swaping,
            }
            updateVaultTrade({
              ...newState,
            })
            sendRequest()
            return {
              ...newState,
            }
          })
        }
      }
    }
  }, [tradeCalcData.step, vaultLayerStatus])

  const clearData = () => {
    let _tradeCalcData: any = {}
    setTradeData((state) => {
      return {
        ...state,
        sell: { ...state?.sell, tradeValue: undefined },
        buy: { ...state?.buy, tradeValue: undefined },
      } as T
    })

    setTradeCalcData((state) => {
      _tradeCalcData = {
        ...(state ?? {}),
        maxFeeBips: undefined,
        lockedNotification: true,
        volumeSell: undefined,
        volumeBuy: undefined,
      }
      return _tradeCalcData
    })
    updateTradeVault({
      market,
      maxFeeBips: 0,
      tradeCalcData: {
        ..._tradeCalcData,
      },
    })
  }

  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string | undefined
  } => {
    if (!tokenMap && !tokenPrices && tradeData?.sell) {
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.DISABLED,
      }
    }
    const {
      _router_tradeVault: {
        tradeVault: {
          tradeCalcData: { supportBorrowData, ...tradeCalcData },
          sellMinAmtInfo,
          sellMaxAmtInfo: _sellMaxAmtInfo,
          isRequiredBorrow,
        },
      },
      account,
    } = store.getState()
    const sellToken = tokenMap[tradeData?.sell.belong as string]
    const buyToken = tokenMap[tradeData?.buy.belong as string]
    const belongSellAlice = sellToken?.symbol.slice(2)
    if (!sellToken || !buyToken || !tradeCalcData || !supportBorrowData) {
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.DISABLED,
      }
    }
    const { minBorrowAmount, minBorrowVol } = supportBorrowData ?? {}
    const { borrowAvailable, count, tradeValue } = tradeData?.sell as X
    const borrowVol = tradeCalcData.borrowVol
    let validAmt = !!(tradeValue && sellMinAmtInfo && sdk.toBig(tradeValue).gte(sellMinAmtInfo))
    let sellMaxAmtInfo = BigNumber.min(
      sdk.toBig(count ?? 0).plus(borrowAvailable ?? 0),
      _sellMaxAmtInfo ?? 0,
    ).toString()
    const notEnough = sdk
      .toBig(count ?? 0)
      .plus(borrowAvailable ?? 0)
      .lt(tradeData?.sell?.tradeValue ?? 0)

    const sellExceed = sellMaxAmtInfo ? sdk.toBig(sellMaxAmtInfo).lt(tradeValue ?? 0) : false

    if (sellExceed) {
      validAmt = false
    }

    if (isSwapLoading || !!isMarketInit || tradeCalcData?.step !== VaultSwapStep.Edit) {
      return {
        label: undefined,
        tradeBtnStatus: TradeBtnStatus.LOADING,
      }
    } else {
      if (account.readyState === AccountStatus.ACTIVATED) {
        if (!tradeCalcData || !tradeCalcData.volumeSell || !tradeCalcData.volumeBuy) {
          return {
            label: 'labelEnterAmount',
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          }
        } else if (notEnough) {
          return {
            label: 'labelVaultBorrowNotEnough',
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          }
        } else if (sellExceed) {
          const maxOrderSize = tradeCalcData.sellMaxAmtStr + ' ' + belongSellAlice
          return {
            label: tradeCalcData?.sellMaxAmtStr
              ? `labelLimitMax| ${maxOrderSize}`
              : `labelVaultTradeInsufficient`,
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          }
        } else if (
          isRequiredBorrow &&
          tradeCalcData?.step == VaultSwapStep.Edit &&
          sdk.toBig(minBorrowVol).gt(borrowVol)
        ) {
          return {
            label: `labelTradeVaultMiniBorrow|${
              getValuePrecisionThousand(
                sdk.toBig(minBorrowAmount ?? 0), //.div("1e" + sellToken.decimals),
                sellToken.vaultTokenAmounts?.qtyStepScale,
                sellToken.vaultTokenAmounts?.qtyStepScale,
                sellToken.vaultTokenAmounts?.qtyStepScale,
                false,
                { floor: false, isAbbreviate: true },
              ) +
              ' ' +
              belongSellAlice
            }|${
              getValuePrecisionThousand(
                sdk
                  .toBig(minBorrowAmount)
                  .plus(count ?? 0)
                  .toString(), //.div("1e" + sellToken.decimals),
                sellToken.vaultTokenAmounts?.qtyStepScale,
                sellToken.vaultTokenAmounts?.qtyStepScale,
                sellToken.vaultTokenAmounts?.qtyStepScale,
                false,
                { floor: false, isAbbreviate: true },
              ) +
              ' ' +
              belongSellAlice
            }`,
            tradeBtnStatus: TradeBtnStatus.DISABLED,
          }
        } else if (!validAmt) {
          const sellSymbol = tradeData?.sell.belong
          if (sellMinAmtInfo === undefined || !sellSymbol || sellMinAmtInfo === 'NaN') {
            return {
              label: 'labelEnterAmount',
              tradeBtnStatus: TradeBtnStatus.DISABLED,
            }
          } else {
            const sellToken = tokenMap[sellSymbol]
            const minOrderSize = getValuePrecisionThousand(
              sdk.toBig(sellMinAmtInfo ?? 0), //.div("1e" + sellToken.decimals),
              sellToken.vaultTokenAmounts?.qtyStepScale,
              sellToken.vaultTokenAmounts?.qtyStepScale,
              sellToken.vaultTokenAmounts?.qtyStepScale,
              false,
              { floor: false, isAbbreviate: true },
            )
            if (isNaN(Number(minOrderSize))) {
              return {
                label: `labelLimitMin| ${EmptyValueTag + ' ' + belongSellAlice}`,
                tradeBtnStatus: TradeBtnStatus.DISABLED,
              }
            } else {
              return {
                label: `labelLimitMin| ${minOrderSize + ' ' + belongSellAlice}`,
                tradeBtnStatus: TradeBtnStatus.DISABLED,
              }
            }
          }
        } else {
          return {
            label: undefined,
            tradeBtnStatus: TradeBtnStatus.AVAILABLE,
          }
        }
      } else {
        return {
          label: undefined,
          tradeBtnStatus: TradeBtnStatus.AVAILABLE,
        }
      }
    }
  }, [
    account,
    tokenMap,
    tradeData?.sell.belong,
    tradeData?.buy.belong,
    tradeVault.maxFeeBips,
    tradeData?.sell.tradeValue,
    tradeData?.buy.tradeValue,
    tradeData?.sell.count,
    tradeData?.sell.balance,
    tradeData?.sell.borrowAvailable,
    tradeCalcData?.step,
    tradeCalcData?.supportBorrowData?.maxBorrowVol,
    tradeCalcData?.isRequiredBorrow,
    isSwapLoading,
    isMarketInit,
  ])
  const sendRequest = React.useCallback(async () => {
    setIsSwapLoading(true)
    const {
      tradeCalcData,
      sellToken: _sellToken,
      buyToken: _buyToken,
      depth,
    } = store.getState()._router_tradeVault.tradeVault
    const account = store.getState().account

    try {
      if (
        account.readyState == AccountStatus.ACTIVATED &&
        _sellToken &&
        _buyToken &&
        tokenMap &&
        exchangeInfo &&
        tradeCalcData &&
        tradeCalcData?.volumeSell &&
        tradeCalcData?.volumeBuy &&
        tradeCalcData.maxFeeBips &&
        LoopringAPI.userAPI &&
        LoopringAPI.vaultAPI
      ) {
        const sellToken = tokenMap[_sellToken]
        const buyToken = tokenMap[_buyToken]
        const storageId = await LoopringAPI.userAPI.getNextStorageId(
          {
            accountId: account.accountId,
            sellTokenId: sellToken?.vaultTokenId ?? 0,
          },
          account.apiKey,
        )
        const request: sdk.VaultOrderRequest = {
          exchange: exchangeInfo.exchangeAddress,
          storageId: storageId.orderId,
          accountId: account.accountId,
          sellToken: {
            tokenId: sellToken?.vaultTokenId ?? 0,
            volume: sdk.toBig(tradeCalcData.volumeSell).toFixed(0),
          },
          buyToken: {
            tokenId: buyToken?.vaultTokenId ?? 0,
            volume: sdk.toBig(tradeCalcData.volumeBuy).toFixed(0),
          },
          validUntil: getTimestampDaysLater(DAYS),
          maxFeeBips: tradeCalcData.maxFeeBips,
          fillAmountBOrS: false,
          allOrNone: false,
          eddsaSignature: '',
          clientOrderId: '',
          orderType: sdk.OrderTypeResp.TakerOnly,
          fastMode: false,
        }
        myLog('useVaultSwap: submitOrder request', request)
        const priceToken = tradeCalcData.isReverse ? sellToken : buyToken
        const item = {
          fromSymbol: sellToken.symbol,
          fromAmount: sdk.toBig(tradeCalcData.volumeSell).div('1e' + sellToken.decimals),
          settledFromAmount: undefined,
          toSymbol: buyToken.symbol,
          feeAmount: tradeCalcData.fee,
          settledToAmount: undefined,
        }

        let info: any = {
          sellToken: sellToken.symbol.slice(2),
          buyToken: buyToken.symbol.slice(2),
          sellVToken: sellToken.symbol,
          buyVToken: buyToken.symbol,
          sellStr: getValuePrecisionThousand(
            sdk.toBig(tradeCalcData.volumeSell).div('1e' + sellToken.decimals),
            sellToken.vaultTokenAmounts?.qtyStepScale,
            sellToken.vaultTokenAmounts?.qtyStepScale,
            sellToken.vaultTokenAmounts?.qtyStepScale,
            false,
            { floor: false },
          ),
          buyStr: getValuePrecisionThousand(
            sdk.toBig(tradeCalcData.volumeBuy).div('1e' + buyToken.decimals),
            buyToken.precision,
            buyToken.precision,
            buyToken.precision,
            false,
            { floor: false },
          ),
          price: getValuePrecisionThousand(
            depth?.mid_price,
            priceToken.precision,
            priceToken.precision,
            priceToken.precision,
            false,
            { floor: false },
          ),
          sellFStr: undefined,
          buyFStr: undefined,
          convertStr: tradeCalcData.isReverse ? tradeCalcData.BtoS : tradeCalcData.StoB,
          feeStr: tradeCalcData?.fee,
          time: Date.now(),
          fromSymbol: sellToken.symbol,
          toSymbol: buyToken.symbol,
          placedAmount:
            tokenMap && item.fromSymbol && sellToken.symbol.slice(2) && item.fromAmount && sdk.toBig(item.fromAmount).gt(0)
              ? `${getValuePrecisionThousand(
                  sdk.toBig(item.fromAmount),
                  undefined,
                  undefined,
                  tokenMap[item.fromSymbol].precision,
                  true,
                  { isAbbreviate: true },
                )} ${sellToken.symbol.slice(2)}`
              : EmptyValueTag,
          executedAmount:
            tokenMap &&
            item.fromSymbol &&
            sellToken.symbol.slice(2) &&
            item.settledFromAmount &&
            sdk.toBig(item.settledFromAmount).gt(0)
              ? `${getValuePrecisionThousand(
                  sdk.toBig(item.settledFromAmount),
                  undefined,
                  undefined,
                  tokenMap[item.fromSymbol].precision,
                  true,
                  { isAbbreviate: true },
                )} ${sellToken.symbol.slice(2)}`
              : EmptyValueTag,
          executedRate:
            tokenMap &&
            item.fromSymbol &&
            item.settledFromAmount &&
            item.fromAmount &&
            sdk.toBig(item.fromAmount).gt(0)
              ? `${sdk
                  .toBig(item.settledFromAmount)
                  .div(item.fromAmount)
                  .multipliedBy('100')
                  .toFixed(2)}%`
              : EmptyValueTag,
          convertedAmount:
            tokenMap &&
            item.toSymbol &&
            buyToken.symbol.slice(2) &&
            item.settledToAmount &&
            sdk.toBig(item.settledToAmount).gt(0)
              ? `${getValuePrecisionThousand(
                  sdk.toBig(item.settledToAmount),
                  undefined,
                  undefined,
                  tokenMap[item.toSymbol].precision,
                  true,
                  { isAbbreviate: true },
                )} ${buyToken.symbol.slice(2)}`
              : EmptyValueTag,
          settledAmount:
            tokenMap &&
            item.toSymbol &&
            item.settledToAmount &&
            item.feeAmount &&
            sdk.toBig(item.settledToAmount).gt(0)
              ? `${getValuePrecisionThousand(
                  sdk.toBig(item.settledToAmount).minus(item.feeAmount),
                  undefined,
                  undefined,
                  tokenMap[item.toSymbol].precision,
                  true,
                  { isAbbreviate: true },
                )} ${item.toSymbol}`
              : EmptyValueTag,

        }

        setShowAccount({
          isShow: true,
          step: AccountStep.VaultTrade_In_Progress,
          info: {
            percentage: undefined,
            status: t('labelPending'),
            ...info,
          },
        })
        const response = await LoopringAPI.vaultAPI.submitVaultOrder({
          request,
          privateKey: account.eddsaKey.sk,
          apiKey: account.apiKey,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw new CustomErrorWithCode({
            code: (response as sdk.RESULT_INFO).code,
            message: (response as sdk.RESULT_INFO).message,
            ...SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? UIERROR_CODE.UNKNOWN],
          })
        } else {
          clearData()
          setShowVaultSwap({ isShow: false })
          l2CommonService.sendUserUpdate()
          await sdk.sleep(SUBMIT_PANEL_CHECK)
          if (refreshRef.current) {
            // @ts-ignore
            refreshRef.current.firstElementChild.click()
          }
          const response2: { hash: string } | any =
            await LoopringAPI.vaultAPI.getVaultGetOperationByHash(
              {
                accountId: account.accountId as any,
                // @ts-ignore
                hash: response.hash,
              },
              account.apiKey,
            )
          let status = '',
            sellFStr = undefined,
            buyFStr = undefined
          if (
            response2?.raw_data?.operation?.status == sdk.VaultOperationStatus.VAULT_STATUS_FAILED
          ) {
            throw sdk.VaultOperationStatus.VAULT_STATUS_FAILED
          } else if (
            [sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED].includes(
              response2?.raw_data?.operation?.status,
            )
          ) {
            status = 'labelSuccessfully'
            sellFStr = getValuePrecisionThousand(
              sdk.toBig(response2?.raw_data.order.fillAmountS).div('1e' + sellToken.decimals),
              sellToken.vaultTokenAmounts?.qtyStepScale,
              sellToken.vaultTokenAmounts?.qtyStepScale,
              sellToken.vaultTokenAmounts?.qtyStepScale,
              false,
              { floor: false },
            )
            buyFStr = getValuePrecisionThousand(
              sdk.toBig(response2?.raw_data.order.fillAmountB).div('1e' + buyToken.decimals),
              buyToken.precision,
              buyToken.precision,
              buyToken.precision,
              false,
              { floor: false },
            )
          } else {
            status = 'labelPending'
          }

          setShowAccount({
            isShow: store.getState().modals.isShowAccount.isShow,
            step:
              status == 'labelSuccessfully'
                ? AccountStep.VaultTrade_Success
                : AccountStep.VaultTrade_In_Progress,
            info: {
              ...info,
              sellFStr,
              buyFStr,
              price: response2?.raw_data.order.price,
              percentage: sdk
                .toBig(response2?.raw_data?.order?.fillAmountS ?? 0)
                .div(response2?.raw_data?.order?.amountS ?? 1)
                .times(100)
                .toFixed(2),
              status: t(status),
            },
          })
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
          l2CommonService.sendUserUpdate()
          setTradeCalcData((state) => {
            return {
              ...state,
              step: VaultSwapStep.Edit,
            }
          })
          if (
            store.getState().modals.isShowAccount.isShow &&
            [AccountStep.VaultTrade_Success, AccountStep.VaultTrade_In_Progress].includes(
              store.getState().modals.isShowAccount.step,
            )
          ) {
            setShowAccount({ isShow: false })
          }
        }
      } else {
        throw new Error('api not ready')
      }
    } catch (error: any) {
      if ([102024, 102025, 114001, 114002].includes(error?.code || 0)) {
      } else {
        sdk.dumpError400(error)
      }
      setShowAccount({
        isShow: false,
      })
      setToastOpen({
        open: true,
        type: ToastType.error,
        content: t('labelVaultTradeFailed') + ' ' + t(error.messageKey, { ns: 'error' }),
        step: VaultSwapStep.Swap,
      })
    }
    setTradeCalcData((state) => {
      return {
        ...state,
        step: VaultSwapStep.Edit,
      }
    })
    setIsSwapLoading(false)
  }, [
    tradeVault,
    tradeData,
    tokenMap,
    exchangeInfo,
    __SUBMIT_LOCK_TIMER__,
    setToastOpen,
    t,
    __DAYS__,
    market,
    __TOAST_AUTO_CLOSE_TIMER__,
    updateTradeVault,
  ])
  const [borrowedAmount, setBorrowedAmount] = React.useState(undefined as string | undefined)
  const vaultBorrowSubmit = async () => {
    const {
      account,
      _router_tradeVault: {
        tradeVault: { tradeCalcData, sellToken: _sellToken, buyToken: _buyToken },
      },
      vaultLayer2: { vaultLayer2 },
    } = store.getState()
    // const erc20Symbol = erc20IdIndex[tokenMap[_sellToken]?.tokenId]
    setIsSwapLoading(true)
    setTradeCalcData((state) => {
      return {
        ...state,
        step: VaultSwapStep.Borrow,
      }
    })
    const vaultToken = tokenMap[_sellToken?.toString()]
    try {
      if (
        exchangeInfo &&
        tradeCalcData &&
        tradeCalcData?.volumeSell &&
        LoopringAPI.vaultAPI &&
        LoopringAPI.userAPI &&
        _sellToken &&
        vaultToken &&
        vaultLayer2
      ) {
        const vaultAsset = (vaultLayer2 && vaultLayer2[_sellToken]) ?? 0
        const countBig = sdk.toBig(vaultAsset?.l2balance ?? 0).minus(vaultAsset?.locked ?? 0)
        const borrowVol = sdk
          .toBig(
            sdk
              .toBig(tradeCalcData?.volumeSell)
              .minus(countBig ?? 0)
              .div('1e' + vaultToken.decimals)
              .toFixed(vaultToken.vaultTokenAmounts.qtyStepScale, BigNumber.ROUND_CEIL),
          )
          .times('1e' + vaultToken.decimals)
        const vaultBorrowRequest: sdk.VaultBorrowRequest = {
          accountId: account.accountId,
          token: {
            tokenId: vaultToken.vaultTokenId as unknown as number,
            volume: borrowVol.toString(),
          },
          timestamp: Date.now(),
        }
        borrowHash.current = null
        setBorrowedAmount(tradeCalcData.borrowStr)
        let response = await LoopringAPI.vaultAPI.submitVaultBorrow({
          request: vaultBorrowRequest,
          privateKey: account.eddsaKey?.sk,
          apiKey: account.apiKey,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }
        borrowHash.current = { hash: (response as any).hash }
        startLoopHashCheck()
      }
    } catch (e) {
      handleSwapPanelEvent(
        {
          type: 'sell',
          tradeData: {
            ...tradeData,
            sell: {
              ...tradeData?.sell,
              tradeValue: tradeData?.sell?.count,
            },
          },
        },
        SwapType.SELL_SELECTED,
      )
      setTradeCalcData((state) => {
        return {
          ...state,
          step: VaultSwapStep.Edit,
        }
      })
      borrowHash.current = null
      const code =
        (e as any)?.message === sdk.VaultOperationStatus.VAULT_STATUS_FAILED
          ? UIERROR_CODE.ERROR_ORDER_FAILED
          : (e as sdk.RESULT_INFO)?.code ?? UIERROR_CODE.UNKNOWN
      const error = new CustomErrorWithCode({
        code,
        message: (e as sdk.RESULT_INFO)?.message,
        ...SDK_ERROR_MAP_TO_UI[code],
      })
      setToastOpen({
        open: true,
        type: ToastType.error,
        content: t('labelVaultBorrowFailed') + ' ' + t(error.messageKey, { ns: 'error' }),
        step: VaultSwapStep.Borrow,
      })
      setIsSwapLoading(false)
    }
  }

  /*** Btn related function ***/
  const vaultSwapSubmit = React.useCallback(async () => {
    if (!allowTrade?.order?.enable) {
      setShowSupport({ isShow: true })
      setIsSwapLoading(false)
      return
    } else if ((market && !marketMap[market]?.enabled) || !VaultInvest.enable) {
      setShowTradeIsFrozen({
        isShow: true,
        type: 'Vault',
      })
      setIsSwapLoading(false)
      return
    } else if (tradeCalcData.isRequiredBorrow) {
      vaultBorrowSubmit()
    } else {
      sendRequest()
    }
  }, [market, marketMap, VaultInvest, tradeCalcData.isRequiredBorrow])

  // vaultBorrowSubmit

  // processRequest(vaultBorrowRequest)

  const {
    btnStatus,
    onBtnClick: onSwapClick,
    btnLabel: swapBtnI18nKey,
  } = useSubmitBtn({
    availableTradeCheck,
    isLoading: !!isMarketInit,
    submitCallback: vaultSwapSubmit,
  })

  const should15sRefresh = React.useCallback(() => {
    myLog('useVaultSwap: should15sRefresh', market)
    if (market) {
      getVaultMap()
      callPairDetailInfoAPIs()
      if (chainInfos.vaultBorrowHashes && chainInfos.vaultBorrowHashes[account.accAddress]?.length) {
        chainInfos.vaultBorrowHashes[account.accAddress].forEach(({ hash }) => {
          const { account } = store.getState()
          LoopringAPI?.vaultAPI
            .getVaultGetOperationByHash(
              {
                accountId: account.accountId?.toString(),
                hash,
              },
              account.apiKey,
            )
            .then(({ operation }) => {
              if (
                [
                  sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED,
                  sdk.VaultOperationStatus.VAULT_STATUS_FAILED,
                ].includes(operation.status)
              ) {
                updateVaultBorrowHash(
                  operation.hash,
                  account.accAddress,
                  sdk.VaultOperationStatus.VAULT_STATUS_FAILED ? 'failed' : 'success',
                )
              }
            })
        })
      }
    }
  }, [market])

  React.useEffect(() => {
    const {
      depth,
      // tradeCalcData,
      sellToken: _sellToken,
      buyToken: _buyToken,
    } = store.getState()._router_tradeVault.tradeVault
    const {
      marketMap
    } = store.getState().invest.vaultMap as VaultMapStates

    if (depth && market && marketMap[market].vaultMarket === depth.symbol) {
      refreshWhenDepthUp()
      setIsMarketStatus((state) => {
        return {
          ...state,
          isMarketInit: false,
        }
      })
    }
  }, [tradeVault.depth, account.readyState, market])

  const vaultLayer2Callback = React.useCallback(async () => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      refreshWhenDepthUp()
    } else {
      if (tradeCalcData.coinSell && tradeCalcData.coinBuy) {
        setTradeData((state) => {
          return {
            ...state,
            sell: { belong: tradeCalcData.coinSell },
            buy: { belong: tradeCalcData.coinBuy },
          } as T
        })
      }
      updateTradeVault({
        market: market as MarketType,
        maxFeeBips: 0,
        totalFee: 0,
        tradeCalcData: {},
      })

      setTradeCalcData((state) => {
        return {
          ...state,
          walletMap: {},
          minimumReceived: undefined,
          priceImpact: undefined,
          fee: undefined,
        }
      })
    }
  }, [tradeData, market, tradeCalcData, marketArray, account.readyState])
  useVaultTradeSocket()
  useL2CommonSocket({ vaultLayer2Callback })

  /*** user Action function ***/
  //High: effect by wallet state update
  const handleSwapPanelEvent = async (
    swapData: SwapData<SwapTradeData<IBData<C>>>,
    swapType: any,
  ): Promise<void> => {
    const { tradeData: _tradeData } = swapData
    myLog('useVaultSwap: resetSwap', swapType, _tradeData)
    const depth = store.getState()._router_tradeVault.tradeVault.depth
    setToastOpen({ open: false, content: '', type: ToastType.info, step: '' })
    switch (swapType) {
      case SwapType.SEll_CLICK:
      case SwapType.BUY_CLICK:
        return
      case SwapType.SELL_SELECTED:
        myLog(_tradeData)
        if (_tradeData?.sell.belong !== tradeData?.sell.belong) {
          resetMarket(
            `${_tradeData?.sell?.belong ?? `#null`}-${_tradeData?.buy?.belong ?? `#null`}`,
            'sell',
          )
        } else {
          reCalculateDataWhenValueChange(
            _tradeData,
            `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`,
            'sell',
          )
        }
        break
      case SwapType.BUY_SELECTED:
        if (_tradeData?.buy.belong !== tradeData?.buy.belong) {
          resetMarket(
            `${_tradeData?.sell?.belong ?? `#null`}-${_tradeData?.buy?.belong ?? `#null`}`,
            'buy',
          )
        } else {
          reCalculateDataWhenValueChange(
            _tradeData,
            `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`,
            'buy',
          )
        }
        break
      case SwapType.EXCHANGE_CLICK:
        let StoB, BtoS
        if (depth && depth.mid_price) {
          const pr1 = sdk.toBig(1).div(depth.mid_price).toString()
          const pr2 = depth.mid_price
          ;[StoB, BtoS] =
            market === `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`
              ? [pr1, pr2]
              : [pr2, pr1]
        }
        const sellPrecision = tokenMap[tradeCalcData.coinBuy as string].precision
        const buyPrecision = tokenMap[tradeCalcData.coinSell as string].precision
        const reserveInfo = sdk.getReserveInfo(tradeCalcData.coinSell as string, tradeCalcData.coinBuy as string, marketArray, tokenMap, marketMap as any)
        const _tradeCalcData = {
          ...tradeCalcData,
          coinSell: tradeCalcData.coinBuy,
          coinBuy: tradeCalcData.coinSell,
          belongSellAlice: tradeCalcData.coinSell?.slice(2),
          belongBuyAlice: tradeCalcData.coinBuy?.slice(2),
          sellPrecision,
          buyPrecision,
          sellCoinInfoMap: tradeCalcData.buyCoinInfoMap,
          buyCoinInfoMap: tradeCalcData.sellCoinInfoMap,
          StoB: getValuePrecisionThousand(
            StoB,
            undefined,
            reserveInfo?.isReverse ? 6 : marketMap[market!].precisionForPrice,
            reserveInfo?.isReverse ? 6 : marketMap[market!].precisionForPrice,
            true,
          ),
          BtoS: getValuePrecisionThousand(
            BtoS,
            undefined,
            !reserveInfo?.isReverse ? 6 : marketMap[market!].precisionForPrice,
            !reserveInfo?.isReverse ? 6 : marketMap[market!].precisionForPrice,
            true,
          ),
        }

        myLog(
          'useVaultSwap:Exchange,tradeCalcData,_tradeCalcData',
          tradeData,
          tradeCalcData,
          _tradeCalcData,
        )
        callPairDetailInfoAPIs()
        updateTradeVault({
          market,
          tradePair: `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`,
          tradeCalcData: _tradeCalcData,
        })
        setTradeCalcData(_tradeCalcData)
        // @ts-ignore
        setTradeData((state) => {
          return {
            ...(state ?? {}),
            sell: {
              belong: _tradeCalcData.coinSell,
              tradeValue: undefined,
              ...makeVaultSell(_tradeCalcData?.coinSell?.toString() ?? ''),
            },
            buy: {
              belong: _tradeCalcData.coinBuy,
              tradeValue: undefined,
              ...makeVaultSell(_tradeCalcData?.coinBuy?.toString() ?? ''),
            },
          }
        })
        break
      default:
        // resetTradeCalcData(undefined, market);
        break
    }
  }

  React.useEffect(() => {
    if (market) {
      //@ts-ignore
      if (refreshRef.current) {
        // @ts-ignore
        refreshRef.current.firstElementChild.click()
        should15sRefresh()
      }
    }
  }, [market])

  const callPairDetailInfoAPIs = React.useCallback(async () => {
    if (market && LoopringAPI.defiAPI && marketMap && marketMap[market]) {
      try {
        const { depth } = await vaultSwapDependAsync({
          market: marketMap[market]?.vaultMarket as MarketType,
          tokenMap,
        })
        updateTradeVault({
          // @ts-ignore
          market,
          depth,
          ...marketMap[market],
        })
        myLog('useVaultSwap:', market, depth?.symbol)
      } catch (error: any) {
        myLog('useVaultSwap:', error, 'go to LRC-ETH')
        setShowGlobalToast({
          isShow: true,
          info: { content: 'error: resetMarket', type: ToastType.error },
        })
        resetMarket(market, 'sell')
      }
    }
  }, [market, marketMap])
  const reCalculateDataWhenValueChange = React.useCallback(
    (_tradeData, _tradePair?, type?) => {
      const {
        account,
        _router_tradeVault: {
          tradeVault: { depth, tradePair, tradeCalcData },
        },
      } = store.getState()
      let vaultAvaiable2Map = makeVaultAvaiable2({}).vaultAvaiable2Map
      myLog('useVaultSwap:reCalculateDataWhenValueChange', tradeData, _tradePair, type)
      if (
        depth &&
        market &&
        marketMap[market] &&
        marketMap[market]?.enabled !== 'isFormLocal' &&
        market &&
        _tradePair === tradePair &&
        _tradeData?.sell
      ) {
        const sellToken = tokenMap[_tradeData?.sell.belong as string]
        const buyToken = tokenMap[_tradeData?.buy.belong as string]
        const sellBuyStr = `${sellToken.symbol}-${buyToken.symbol}`
        const isAtoB = type === 'sell'
        let input: any = isAtoB ? _tradeData.sell.tradeValue : _tradeData.buy.tradeValue
        input = input === undefined || isNaN(Number(input)) ? 0 : Number(input)
        let totalFee: any = undefined
        let stob: string | undefined = undefined
        let btos: string | undefined = undefined
        let minimumReceived: any
        let minimumConverted: string | undefined = undefined
        let sellMinAmtInfo: any = undefined
        let sellMaxAmtInfo: any = undefined
        let sellMaxL2AmtInfo: any = undefined
        let totalFeeRaw: any = undefined
        let totalQuote: any = undefined
        let showHasBorrow: boolean = false
        let isRequiredBorrow: boolean = false
        let borrowVol = sdk.toBig(0)
        const info = marketMap[market] as sdk.VaultMarket
        let maxFeeBips = info.feeBips ?? MAPFEEBIPS

        let slippage = sdk
          .toBig(
            _tradeData.slippage && !isNaN(_tradeData.slippage)
              ? _tradeData.slippage
              : defaultBlockTradeSlipage,
          )
          .times(100)
          .toString()
        const { minAmount, l2Amount } = info

        const calcDexOutput = sdk.calcDex<sdk.VaultMarket>({
          info,
          input:
            tradeCalcData?.step != VaultSwapStep.Edit
              ? _tradeData?.sell?.tradeValue ?? 0
              : input.toString(),
          sell: sellToken.symbol,
          buy: buyToken.symbol,
          isAtoB: tradeCalcData?.step != VaultSwapStep.Edit ? true : isAtoB,
          marketArr: marketArray,
          tokenMap,
          marketMap: marketMap as any,
          depth,
          feeBips: maxFeeBips.toString(),
          slipBips: slippage,
        })

        const supportBorrowData = calcSupportBorrowData({
          belong: sellToken.symbol,
          ...((vaultAvaiable2Map && vaultAvaiable2Map[sellToken.symbol]) ?? {}),
          tradeValue: undefined,
          erc20Symbol: erc20IdIndex[tokenMap[sellToken.symbol].tokenId],
        } as unknown as VaultBorrowTradeData)
        const amountVol = tokenMap[sellToken?.symbol]?.vaultTokenAmounts?.maxAmount
        if (chainInfos.vaultBorrowHashes && chainInfos.vaultBorrowHashes[account.accAddress]?.length) {
          showHasBorrow = true
        }
        const { countBig, ...vaultSellRest } = makeVaultSell(sellToken.symbol)
        _tradeData.sell = {
          ..._tradeData.sell,
          ...vaultSellRest,
        }
        if (amountVol && l2Amount) {
          const sellDeepStr =
            sdk
              .toBig(sellBuyStr == market ? depth.bids_amtTotal : depth.asks_volTotal)
              .div('1e' + sellToken.decimals)
              .times(0.99)
              .toString() ?? '0'

          totalQuote = sellDeepStr
            ? getValuePrecisionThousand(
                BigNumber.min(sellDeepStr),
                sellToken.vaultTokenAmounts?.qtyStepScale,
                sellToken.vaultTokenAmounts?.qtyStepScale,
                undefined,
                false,
                { isAbbreviate: true },
              )
            : EmptyValueTag
          sellMaxAmtInfo = BigNumber.min(sellDeepStr, _tradeData.sell.balance ?? 0)
        }
        sellMinAmtInfo = BigNumber.max(
          sellToken.orderAmounts.dust,
          sellBuyStr == market ? minAmount.base : minAmount.quote,
        )
          .div('1e' + sellToken.decimals)
          .toString()

        if (calcDexOutput) {
          totalFeeRaw = sdk
            .toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0)
            .div(10000)
            .times(maxFeeBips)
          totalFee = totalFeeRaw.gt(0)
            ? getValuePrecisionThousand(
                sdk
                  .toBig(totalFeeRaw)
                  .div('1e' + buyToken.decimals)
                  .toString(),
                buyToken.precision,
                buyToken.precision,
                undefined,
              )
            : 0
          minimumReceived = sdk.toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0).gt(0)
            ? getValuePrecisionThousand(
                sdk
                  .toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0)
                  .minus(totalFeeRaw ?? 0)
                  .div('1e' + buyToken.decimals)
                  .toString(),
                buyToken.precision,
                buyToken.precision,
                undefined,
              )
            : 0
          minimumConverted = calcDexOutput?.amountB
            ? getValuePrecisionThousand(
                sdk
                  .toBig(calcDexOutput?.amountB)
                  .times(sdk.toBig(1).minus(sdk.toBig(slippage).div('10000')))
                  .toString(),
                buyToken.precision,
                buyToken.precision,
                undefined,
              )
            : undefined
          _tradeData[isAtoB ? 'buy' : 'sell'].tradeValue =
            !_tradeData[isAtoB ? 'sell' : 'buy'].tradeValue &&
            _tradeData[isAtoB ? 'sell' : 'buy'].tradeValue != '0'
              ? (undefined as any)
              : getValuePrecisionThousand(
                  calcDexOutput[`amount${isAtoB ? 'B' : 'S'}`],
                  isAtoB ? buyToken.precision : sellToken.vaultTokenAmounts?.qtyStepScale,
                  isAtoB ? buyToken.precision : sellToken.vaultTokenAmounts?.qtyStepScale,
                  isAtoB ? buyToken.precision : sellToken.vaultTokenAmounts?.qtyStepScale,
                ).replaceAll(sdk.SEP, '')
          let result = reCalcStoB({
            market,
            tradeData: _tradeData as SwapTradeData<IBData<unknown>>,
            tradePair: tradePair as any,
            marketMap,
            tokenMap,
            noGetValuePrecisionThousand: true
          })
          stob = result?.stob
          btos = result?.btos
        } else {
          minimumReceived = undefined
        }
        borrowVol = sdk
          .toBig(
            sdk
              .toBig(calcDexOutput?.sellVol ?? 0)
              .minus(countBig ?? 0)
              .div('1e' + sellToken.decimals)
              .toFixed(sellToken.vaultTokenAmounts?.qtyStepScale, BigNumber.ROUND_CEIL),
          )
          .times('1e' + sellToken.decimals)
        isRequiredBorrow = borrowVol.gt(0) ? true : false
        let _tradeCalcData: any = {
          minimumReceived,
          maxFeeBips,
          volumeSell: calcDexOutput?.sellVol as any,
          volumeBuy: calcDexOutput?.amountBSlipped?.minReceived,
          fee: totalFee,
          slippage: sdk.toBig(slippage).div(100).toString(),
          isReverse: calcDexOutput?.isReverse,
          lastStepAt: type,
          sellMinAmtStr: getValuePrecisionThousand(
            sdk.toBig(sellMinAmtInfo ?? 0),
            sellToken.vaultTokenAmounts?.qtyStepScale,
            sellToken.vaultTokenAmounts?.qtyStepScale,
            sellToken.vaultTokenAmounts?.qtyStepScale,
            false,
          ),
          sellMaxL2AmtStr: getValuePrecisionThousand(
            sdk.toBig(sellMaxL2AmtInfo ?? 0),
            sellToken.vaultTokenAmounts?.qtyStepScale,
            sellToken.vaultTokenAmounts?.qtyStepScale,
            sellToken.vaultTokenAmounts?.qtyStepScale,
            false,
            { isAbbreviate: true },
          ),
          sellMaxAmtStr: undefined,
          totalQuota: totalQuote,
          // l1Pool: poolToVol,
          l2Pool: getValuePrecisionThousand(
            sdk
              .toBig((sellBuyStr == market ? l2Amount.quote : l2Amount.base) ?? 0)
              .div('1e' + buyToken.decimals),
            buyToken.precision,
            buyToken.precision,
            undefined,
            false,
          ),
          belongSellAlice: sellToken.symbol.slice(2),
          belongBuyAlice: buyToken.symbol.slice(2),
          minimumConverted,
          supportBorrowData,
          showHasBorrow,
        }
        let _edit = {}

        setTradeData((state) => ({
          ...state,
          ..._tradeData,
          sell: {
            ...state?.sell,
            ..._tradeData?.sell,
            ...makeVaultSell(state?.sell?.belong ?? ''),
          },
        }))
        setTradeCalcData((state) => {
          const [mid_price, _mid_price_convert] = calcDexOutput
            ? [
                depth.mid_price,
                1 / depth.mid_price,  
              ]
            : [undefined, undefined]

          stob = stob
            ? stob
            : calcDexOutput
            ? calcDexOutput.isReverse
              ? _mid_price_convert!.toString()
              : mid_price!.toString()
            : state.StoB
            ? state.StoB
            : undefined

          btos = btos
            ? btos
            : calcDexOutput
            ? calcDexOutput.isReverse
              ? mid_price!.toString()
              : _mid_price_convert!.toString()
            : state?.BtoS
            ? state?.BtoS
            : undefined
  

          if ([VaultSwapStep.Edit, '', undefined].includes(state.step)) {
            _edit = {
              step: VaultSwapStep.Edit,
              isRequiredBorrow,
              borrowVol: borrowVol?.gt(0) ? borrowVol.toString() : 0,
              borrowStr: getValuePrecisionThousand(
                borrowVol?.gt(0) ? borrowVol.div('1e' + sellToken.decimals) : 0,
                sellToken.vaultTokenAmounts?.qtyStepScale,
                sellToken.vaultTokenAmounts?.qtyStepScale,
                sellToken.vaultTokenAmounts?.qtyStepScale,
                false,
                { isAbbreviate: true },
              ),
            }
          }

          _tradeCalcData = {
            ...state,
            ..._tradeCalcData,
            ..._edit,
            StoB: getValuePrecisionThousand(
              stob?.replaceAll(sdk.SEP, '') ?? 0,
              undefined,
              calcDexOutput?.isReverse ? 6 : marketMap[market].precisionForPrice,
              calcDexOutput?.isReverse ? 6 : marketMap[market].precisionForPrice,
              true
            ),
            BtoS: getValuePrecisionThousand(
              btos?.replaceAll(sdk.SEP, '') ?? 0,
              undefined,
              !calcDexOutput?.isReverse ? 6 : marketMap[market].precisionForPrice,
              !calcDexOutput?.isReverse ? 6 : marketMap[market].precisionForPrice,
              true
            ),
            lastStepAt: type,
          }
          updateTradeVault({
            info: info,
            market: market as any,
            totalFee: totalFee,
            totalFeeRaw: totalFeeRaw?.toString(),
            lastStepAt: type,
            sellMinAmtInfo: sellMinAmtInfo as any,
            sellMaxL2AmtInfo: sellMaxL2AmtInfo as any,
            sellMaxAmtInfo: sellMaxAmtInfo as any,
            tradeCalcData: _tradeCalcData,
            isRequiredBorrow,
            maxFeeBips,
          })
          return _tradeCalcData
        })
      }
    },
    [account.readyState, tradeVault, tradeCalcData, tradeData, coinMap, tokenMap, marketArray],
  )
  const refreshWhenDepthUp = React.useCallback(() => {
    const { depth, lastStepAt, tradePair, market } = tradeVault

    if (
      (depth && depth.symbol === market) ||
      (tradeData &&
        lastStepAt &&
        tradeCalcData.coinSell === tradeData['sell'].belong &&
        tradeCalcData.coinBuy === tradeData['buy'].belong &&
        tradeData[lastStepAt].tradeValue &&
        tradeData[lastStepAt].tradeValue !== 0)
    ) {
      reCalculateDataWhenValueChange(tradeData, tradePair, lastStepAt)
    } else if (
      depth &&
      tradeCalcData.coinSell &&
      tradeCalcData.coinBuy &&
      (`${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}` === market ||
        `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` === market)
    ) {
      const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map

      const result = reCalcStoB({
        market,
        tradeData: tradeData as any,
        tradePair: tradePair as any,
        marketMap,
        tokenMap,
        noGetValuePrecisionThousand: true
      })
      const buyToken = tokenMap[tradeCalcData.coinBuy]
      const sellToken = tokenMap[tradeCalcData.coinSell]

      let _tradeCalcData: any = {}
      setTradeCalcData((state) => {
        const pr1 = sdk.toBig(1).div(depth.mid_price).toString()
        const pr2 = depth.mid_price
        const [StoB, BtoS] =
          market === `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` ? [pr1, pr2] : [pr2, pr1]
        const reserveInfo = sdk.getReserveInfo(sellToken.symbol, buyToken.symbol, marketArray, tokenMap, marketMap as any)
        _tradeCalcData = {
          ...state,
          ...tradeCalcData,
          StoB: getValuePrecisionThousand(
            (result ? result?.stob : StoB.toString())?.replaceAll(sdk.SEP, ''),
            undefined,
            reserveInfo?.isReverse ? 6 : marketMap[market].precisionForPrice,
            reserveInfo?.isReverse ? 6 : marketMap[market].precisionForPrice,
            true,
          ),
          BtoS: getValuePrecisionThousand(
            (result ? result?.btos : BtoS.toString())?.replaceAll(sdk.SEP, ''),
            undefined,
            !reserveInfo?.isReverse ? 6 : marketMap[market].precisionForPrice,
            !reserveInfo?.isReverse ? 6 : marketMap[market].precisionForPrice,
            true,
          ),
        }
        return {
          ..._tradeCalcData,
          walletMap,
        }
      })
      reCalculateDataWhenValueChange(
        {
          sell: {
            belong: tradeCalcData.coinSell,
            ...makeVaultSell(tradeCalcData.coinSell),
          },
          buy: { belong: tradeCalcData.coinBuy },
        },
        `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`,
        'sell',
      )

      updateTradeVault({ market, tradeCalcData: _tradeCalcData })
    }
  }, [market, tradeVault, tradeData, tradeCalcData, setTradeCalcData])
  // myLog('vaultLayer2 swapBtnStatus', btnStatus)
  return {
    isMarketInit,
    toastOpen,
    closeToast,
    tradeCalcData,
    tradeData,
    onSwapClick,
    swapBtnI18nKey,
    swapBtnStatus: btnStatus,
    handleSwapPanelEvent,
    should15sRefresh,
    refreshRef,
    tradeVault,
    vaultAccountInfo,
    isSwapLoading,
    market,
    isMobile,
    setToastOpen,
    disabled: false,
    // vaultBorrowSubmit,
    // vaultSwapSubmit,
    cancelBorrow: (shouldClose = false) => {
      if (borrowHash?.current?.hash && account) {
        updateVaultBorrowHash(borrowHash?.current?.hash, account.accAddress)
      }
      setIsSwapLoading(false)
      resetMarket(market as any, 'sell')
      if (shouldClose) {
        setShowVaultSwap({ isShow: false })
      }
    },
    borrowedAmount
  }
}
