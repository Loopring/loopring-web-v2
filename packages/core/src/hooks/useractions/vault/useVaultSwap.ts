import * as sdk from '@loopring-web/loopring-sdk'
import React, { useRef } from 'react'
import { useGetSet } from 'react-use'


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
  TOAST_TIME,
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

import BigNumberJS from 'bignumber.js'
import {
  btradeOrderbookService,
  calcSupportBorrowData,
  DAYS,
  getTimestampDaysLater,
  isNumberStr,
  l2CommonService,
  LoopringAPI,
  makeVaultAvaiable2,
  makeVaultLayer2,
  MAPFEEBIPS,
  marketInitCheck,
  numberFormat,
  numberFormatThousandthPlace,
  onchainHashInfo,
  // reCalcStoB,
  store,
  tryFn,
  updateVaultTrade,
  useAccount,
  useL2CommonSocket,
  usePairMatch,
  useSocket,
  useSubmitBtn,
  useSystem,
  useToast,
  useTokenMap,
  useTradeVault,
  useVaultAccountInfo,
  useVaultLayer2,
  useVaultMap,
  VaultBorrowTradeData,
  VaultMapStates,
  vaultSwapDependAsync,
  TradeVault,
  toPercent,
  strNumDecimalPlacesLessThan
} from '@loopring-web/core'
import { merge } from 'rxjs'
import Decimal from 'decimal.js'
import { calcMarinLevel, marginLevelType } from './utils'
import { utils, BigNumber } from 'ethers'
import _ from 'lodash'


const reCalcStoB = ({
  sellTradeValue,
  buyTradeValue,
  isLongOrShort
}: {
  sellTradeValue: string
  buyTradeValue: string
  isLongOrShort: 'long' | 'short'
}): { stob: string; btos: string } | undefined => {
  if (sellTradeValue && buyTradeValue && !(new Decimal(sellTradeValue).eq('0'))) {
    const sellBig = sdk.toBig(sellTradeValue)
    const buyBig = sdk.toBig(buyTradeValue)
    let stob, btos

    if (isLongOrShort === 'long') {
      stob = buyBig.div(sellBig).toString()
      btos = sellBig.div(buyBig).toString()
    } else {
      stob = buyBig.div(sellBig).toString()
      btos = sellBig.div(buyBig).toString()
    }
    return { stob, btos }
  } else {
    return undefined
  }
}

// const makeVaultSell = (sellSymbol: string) => {
//   const {
//     tokenMap: { idIndex: erc20IdIndex },
//     invest: {
//       vaultMap: { tokenMap: vaultTokenMap },
//     },
//     vaultLayer2: { vaultLayer2 },
//   } = store.getState()
//   if (sellSymbol) {
//     const vaultAvaiable2Map = makeVaultAvaiable2({}).vaultAvaiable2Map
//     const sellToken = vaultTokenMap[sellSymbol]
//     const orderAmounts = sellToken.orderAmounts
//     const totalQuote = sdk.toBig(orderAmounts.maximum ?? 0).div('1e' + sellToken.decimals)
//     const vaultAsset = (vaultLayer2 && vaultLayer2[sellSymbol]) ?? 0
//     const countBig = sdk.toBig(vaultAsset?.l2balance ?? 0).minus(vaultAsset?.locked ?? 0)
//     const count = sdk
//       .toBig(countBig)
//       .div('1e' + sellToken.decimals)
//       .toFixed(sellToken?.vaultTokenAmounts?.qtyStepScale, BigNumberJS.ROUND_DOWN)
//     const borrowAvailable = sdk
//       .toBig(
//         BigNumberJS.min(totalQuote, (vaultAvaiable2Map && vaultAvaiable2Map[sellSymbol]?.count) ?? 0),
//       )
//       .toFixed(sellToken?.vaultTokenAmounts?.qtyStepScale, BigNumberJS.ROUND_DOWN)
//     return {
//       borrowAvailable,
//       count,
//       countBig,
//       erc20Symbol: erc20IdIndex[sellToken.tokenId],
//     }
//   } else {
//     return {}
//   }
// }
// const useVaultTradeSocket = () => {
  
// }
const tWrap = (t: any, label: string) => {
  const [theLable, ...rest] = label.split('|')
  const obj = _.fromPairs(
    rest.map((value, index) => [index === 0 ? 'arg' : 'arg' + index, value])
  )
  return t(
    theLable,
    obj
  )
}

const calcDexWrap = <R>(input: {
    info: R
    input: string
    sell: string
    buy: string
    isAtoB: boolean
    marketArr: string[]
    tokenMap: sdk.LoopringMap<sdk.TokenInfo>
    marketMap: sdk.LoopringMap<sdk.MarketInfo>
    depth: sdk.DepthData
    feeBips: string
    slipBips: string
}) => {
  const output = sdk.calcDex<R>(input)

  return {
    ...output,
    amountB: output?.amountB !== 'NaN' ? output?.amountB : undefined,
    feeBips: output?.feeBips !== 'NaN' ? output?.feeBips : undefined,
    amountS: output?.amountS !== 'NaN' ? output?.amountS : undefined,
    sellVol: output?.amountS !== 'NaN' ? output?.amountS : undefined,
    buyVol: output?.amountB !== 'NaN' ? output?.amountB : undefined,
    amountBSlipped: {
      minReceived: output?.amountBSlipped?.minReceived !== 'NaN' ? output?.amountBSlipped?.minReceived : undefined,
      minReceivedVal: output?.amountBSlipped?.minReceivedVal !== 'NaN' ? output?.amountBSlipped?.minReceivedVal : undefined,
    }

  }
}

export type VaultTradeTradeData = VaultBorrowTradeData & { borrowAvailable: string }
export const useVaultSwap = () => {
  const borrowHash = React.useRef<null | { hash: string; timer?: any }>(null)
  const refreshRef = React.useRef()
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)
  
  const { idIndex: originTokenIdIndex, tokenMap: originTokenMap } = useTokenMap()
  const { account } = useAccount()
  const { tokenMap, marketMap, coinMap, marketArray, marketCoins, getVaultMap, tokenPrices: vaultTokenPrices } = useVaultMap()
  const {
    setShowSupport,
    setShowTradeIsFrozen,
    modals: { isShowVaultSwap },
    setShowAccount,
    setShowVaultSwap,
    setShowGlobalToast,
  } = useOpenModals()
  const {
    toggle: { VaultInvest },
  } = useToggle()

  const { t } = useTranslation(['common', 'error'])

  const { exchangeInfo, allowTrade } = useSystem()
  const { updateVaultLayer2, status: vaultLayerStatus, vaultLayer2 } = useVaultLayer2()
  const { sendSocketTopic, socketEnd } = useSocket()
  const subjectBtradeOrderbook = React.useMemo(() => btradeOrderbookService.onSocket(), [])

  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { isMobile, coinJson, swapSecondConfirmation, setSwapSecondConfirmation, slippage, setSlippage } =
    useSettings()
  
  const { chainInfos, updateVaultBorrowHash } = onchainHashInfo.useOnChainInfo()
  const {vaultAccountInfo} = useVaultAccountInfo()
  
  // const initTradeVault = {
  //   market: undefined,
  //   tradePair: undefined,
  //   tradeCalcData: {
  //     isVault: true,
  //   },
  //   maxFeeBips: MAPFEEBIPS,
  // } as Partial<TradeVault>
  const initLocalState = {
    hideOther: false,
    isLongOrShort: 'long' as 'long' | 'short',
    showTokenSelection: false,
    amount: '',
    selectedToken: undefined as string | undefined,
    isSwapRatioReversed: false,
    borrowedAmount: undefined as string | undefined,
    tokenSelectionInput: '',
    showSetting: false,
    isSwapLoading: false,
    showSmallTradePrompt: {
      show: false,
      estimatedFee: undefined as string | undefined,
      minimumConverted: undefined as string | undefined,
      feePercentage: undefined as string | undefined,
    },
    swapStatus: {
      status: 'init',
      borrowAmount: '10'
    } as {
      status: 'borrowing' | 'swapping' | 'init' 
      borrowAmount?: string
    },
    maxBorrowableSellToken: undefined as string | undefined,
    depth: undefined as sdk.DepthData | undefined
  }
  const [getLocalState, setLocalState] = useGetSet(initLocalState)

  const refreshData = async () => {
    const {
      account,
      settings: { defaultNetwork },
      invest: {
        vaultMap: { marketMap },
      },
    } = store.getState()
    const market: MarketType = `LV${getSelectedTokenSymbol()}-LVUSDT`
    const { depth } = await vaultSwapDependAsync({
      market: marketMap[market]?.vaultMarket as MarketType,
      tokenMap,
    })
    myLog('useVaultSwap: refreshData', market)

    if (!market || !sellToken || !buyToken) return

    getVaultMap()
    updateVaultLayer2({})

    if (chainInfos.vaultBorrowHashes && chainInfos.vaultBorrowHashes[account.accAddress]?.length) {
      chainInfos.vaultBorrowHashes[account.accAddress].forEach(({ hash }) => {
        LoopringAPI?.vaultAPI
          ?.getVaultGetOperationByHash(
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
                operation.status === sdk.VaultOperationStatus.VAULT_STATUS_FAILED
                  ? 'failed'
                  : 'success',
              )
            }
          })
      })
    }

    // handle depth
    setLocalState((state) => ({
      ...state,
      depth,
    }))
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const networkWallet: sdk.NetworkWallet = [
      sdk.NetworkWallet.ETHEREUM,
      sdk.NetworkWallet.GOERLI,
      sdk.NetworkWallet.SEPOLIA,
    ].includes(network as sdk.NetworkWallet)
      ? sdk.NetworkWallet.ETHEREUM
      : sdk.NetworkWallet[network]
    const item = marketMap[market]
    if (depth?.symbol && item?.wsMarket) {
      sendSocketTopic({
        [sdk.WsTopicType.btradedepth]: {
          showOverlap: false,
          markets: [item.wsMarket],
          level: 0,
          count: 50,
          snapshot: false,
        },
        [sdk.WsTopicType.l2Common]: {
          address: account.accAddress,
          network: networkWallet,
        },
      })
    } else {
      socketEnd()
    }

    LoopringAPI.vaultAPI
      ?.getMaxBorrowable(
        {
          accountId: account.accountId,
          symbol: sellToken.symbol.slice(2),
        },
        account.apiKey,
        '1',
      )
      .then((maxBorrowable) => {
        const tokenPrice = vaultTokenPrices[sellToken.symbol]
        const maxBorrowableOfSellToken = numberFormat(
          new Decimal(maxBorrowable!.maxBorrowableOfUsdt).div(tokenPrice).toString(),
          {
            fixed: sellToken.vaultTokenAmounts.qtyStepScale,
            removeTrailingZero: true,
            fixedRound: Decimal.ROUND_FLOOR,
          },
        )
        setLocalState((state) => ({
          ...state,
          maxBorrowableSellToken: maxBorrowableOfSellToken,
        }))
      })
    
    
  }
  
  
  const localState = getLocalState()
  const showSmallTradePrompt = localState.showSmallTradePrompt


  // const resetTradeVault = () => {
  //   setLocalState(state => ({
  //     ...state,
  //     tradeVault: initTradeVault
  //   }))
  // }
  const setIsSwapLoading = (loading: boolean) => {
    setLocalState(state => ({
      ...state,
      isSwapLoading: loading
    }))
  }
  const setShowSmallTradePrompt = (showSmallTradePrompt: {
    show: boolean,
    estimatedFee: string | undefined,
    minimumConverted: string | undefined,
    feePercentage: string | undefined,
  }) => {
    setLocalState(state => ({
      ...state,
      showSmallTradePrompt
    }))
  }

  const getSelectedTokenSymbol = () => {
    const localState = getLocalState()
    return localState.selectedToken
      ? localState.selectedToken
      : isShowVaultSwap.symbol
      ? isShowVaultSwap.symbol
      : 'ETH'
  }
  const selectedTokenSymbol = getSelectedTokenSymbol()
  const selectedVTokenSymbol = 'LV' + selectedTokenSymbol
  const selectedVTokenInfo = tokenMap 
    ? tokenMap[selectedVTokenSymbol]
    : undefined
  
  const LVUSDTInfo = tokenMap 
    ? tokenMap['LVUSDT']
    : undefined
  const USDTInfo = originTokenMap 
    ? originTokenMap['USDT']
    : undefined
  const sellToken = localState.isLongOrShort === 'long'
    ? LVUSDTInfo
    : selectedVTokenInfo
  const sellTokenOriginSymbol = localState.isLongOrShort === 'long'
    ? 'USDT'
    :  selectedVTokenSymbol.slice(2)
  const buyToken = localState.isLongOrShort === 'long'
    ? selectedVTokenInfo
    : LVUSDTInfo
  const buyTokenOriginSymbol = localState.isLongOrShort === 'long'
    ? selectedVTokenSymbol.slice(2)
    : 'USDT'

  
  const market: MarketType = `${selectedVTokenSymbol}-LVUSDT`
  const marketInfo = marketMap[market]

  const smallTradePromptAmtBN = sellToken
    ? localState.isLongOrShort === 'long'
      ? marketInfo.minTradePromptAmount.base
      : marketInfo.minTradePromptAmount.quote
    : undefined
  const smallAmtFeeBips = marketInfo.upSlippageFeeBips as unknown as number;
  
    
 
  
  
  

  const sellTokenAsset = sellToken && vaultLayer2
    ? vaultLayer2[sellToken.symbol]
    : undefined
  
  const borrowAble = localState.maxBorrowableSellToken ? localState.maxBorrowableSellToken : undefined
  const userMaxSellValue = sellToken && sellTokenAsset?.total && borrowAble
    ? numberFormat(
        utils.formatUnits(
          BigNumber.from(sellTokenAsset.total ?? 0).add(
            utils.parseUnits(borrowAble, sellToken?.decimals),
          ),
          sellToken?.decimals,
        ),
        {
          fixed: sellToken.vaultTokenAmounts.qtyStepScale,
          removeTrailingZero: true,
          fixedRound: Decimal.ROUND_FLOOR,
        },
      )
    : undefined

  const slippageReal = slippage === 'N' 
    ? 0.1
    : slippage
  const maxAmountCalcDexOutput =
    sellToken && buyToken && localState.depth
      ? calcDexWrap<sdk.VaultMarket>({
          info: marketInfo as sdk.VaultMarket,
          input: userMaxSellValue ?? '0',
          sell: sellToken.symbol,
          buy: buyToken.symbol,
          isAtoB: localState.isLongOrShort === 'long',
          marketArr: marketArray,
          tokenMap,
          marketMap: marketMap as any,
          depth: localState.depth,
          feeBips: (marketInfo.feeBips ?? MAPFEEBIPS).toString(),
          slipBips: slippageReal.toString(),
        })
      : undefined

  const userMaxBuyValue = maxAmountCalcDexOutput?.amountB
  const userMaxTradeValue = localState.isLongOrShort === 'short' 
    ? userMaxSellValue
    : userMaxBuyValue
  console.log('shdjahsdjsah', userMaxSellValue, maxAmountCalcDexOutput, userMaxTradeValue)
  // sellToken && sellTokenAsset?.total && borrowAble
  //   ? numberFormat(
  //       utils.formatUnits(
  //         BigNumber.from(sellTokenAsset.total ?? 0).add(
  //           utils.parseUnits(borrowAble, sellToken?.decimals),
  //         ),
  //         sellToken?.decimals,
  //       ),
  //       {
  //         fixed: sellToken.vaultTokenAmounts.qtyStepScale,
  //         removeTrailingZero: true,
  //         fixedRound: Decimal.ROUND_FLOOR,
  //       },
  //     )
  //   : undefined

  

  const preCalcDexOutput =
    sellToken && buyToken && localState.depth
      ? calcDexWrap<sdk.VaultMarket>({
          info: marketInfo as sdk.VaultMarket,
          input: localState.amount ?? '0',
          sell: sellToken.symbol,
          buy: buyToken.symbol,
          isAtoB: localState.isLongOrShort === 'short',
          marketArr: marketArray,
          tokenMap,
          marketMap: marketMap as any,
          depth: localState.depth,
          feeBips: (marketInfo.feeBips ?? MAPFEEBIPS).toString(),
          slipBips: slippageReal.toString(),
        })
      : undefined
  

  const sellAmountEstimate = (preCalcDexOutput?.amountS && sellToken) ? numberFormat(preCalcDexOutput?.amountS, { fixed: sellToken.decimals }) : undefined
  const sellAmountEstimateBN = (sellToken && sellAmountEstimate && sellAmountEstimate !== 'NaN') 
    ? utils.parseUnits(sellAmountEstimate, sellToken.decimals) 
    : undefined

  const maxFeeBips =
    sellAmountEstimateBN && smallTradePromptAmtBN && sellAmountEstimateBN.lt(smallTradePromptAmtBN)
      ? smallAmtFeeBips
      : marketInfo.feeBips ?? MAPFEEBIPS

  const calcDexOutput =
    sellToken && buyToken && localState.depth
      ? calcDexWrap<sdk.VaultMarket>({
          info: marketInfo as sdk.VaultMarket,
          input: localState.amount ?? '0',
          sell: sellToken.symbol,
          buy: buyToken.symbol,
          isAtoB: localState.isLongOrShort === 'short',
          marketArr: marketArray,
          tokenMap,
          marketMap: marketMap as any,
          depth: localState.depth,
          feeBips: maxFeeBips.toString(),
          slipBips: slippageReal.toString(),
        })
      : undefined
  
  
  const swapRatio = tryFn(
    () => {
      return localState.isSwapRatioReversed
        ? `1 USDT ≈ ${numberFormat(new Decimal(1).div(localState.depth!.mid_price).toString(), {
            fixed: selectedVTokenInfo!.precision,
            removeTrailingZero: true,
          })} ${selectedTokenSymbol}`
        : `1 ${selectedTokenSymbol} ≈ ${numberFormat(localState.depth!.mid_price, {
            fixed: USDTInfo!.precision,
            removeTrailingZero: true,
          })} USDT`
    },
    (e) => {
      console.log('asdhjasjdhjs', e)
      return EmptyValueTag
    },
  )
 

  const sellAmount = (calcDexOutput?.amountS && calcDexOutput.amountS !== 'NaN' && sellToken) ? numberFormat(calcDexOutput?.amountS, { fixed: sellToken.decimals }) : undefined
  const sellAmountBN = (sellToken && sellAmount) 
    ? utils.parseUnits(sellAmount, sellToken.decimals) 
    : undefined
  
  const buyAmount = (calcDexOutput?.amountB && calcDexOutput.amountB !== 'NaN' && buyToken) ? numberFormat(calcDexOutput?.amountB, { fixed: buyToken.decimals }) : undefined
  const buyAmountBN =
    buyToken && buyAmount ? utils.parseUnits(buyAmount, buyToken.decimals) : undefined

  const borrowRequired =
    sellToken && sellTokenAsset && sellAmountBN
      ? sellAmountBN.gt(sellTokenAsset?.total && sellTokenAsset?.total !== 'NaN' ? sellTokenAsset?.total : 0)
      : false
  
  const moreToBeBorrowedBN =
    sellToken && sellTokenAsset && borrowRequired && sellAmountBN
      ? sellAmountBN
          .sub(sellTokenAsset?.total ?? 0)
          .div(utils.parseUnits('1', sellToken.decimals - sellToken.vaultTokenAmounts?.qtyStepScale))
          .mul(utils.parseUnits('1', sellToken.decimals - sellToken.vaultTokenAmounts?.qtyStepScale))
          .add(utils.parseUnits('1', sellToken.decimals - sellToken.vaultTokenAmounts?.qtyStepScale))
      : undefined
  const moreToBeBorrowed = moreToBeBorrowedBN ? utils.formatUnits(moreToBeBorrowedBN, sellToken?.decimals) : undefined
  
  console.log('asdhsajka', borrowRequired, sellAmountBN?.toString(), sellTokenAsset?.total, moreToBeBorrowedBN?.toString(), moreToBeBorrowed)

  const feeAmountBN = calcDexOutput?.amountBSlipped?.minReceived 
    ? BigNumber.from(calcDexOutput?.amountBSlipped?.minReceived ?? 0)
      .mul(maxFeeBips)
      .div(10000)
    : undefined
  const feeAmount = (feeAmountBN  && buyToken) 
    ? utils.formatUnits(feeAmountBN, buyToken.decimals) 
    : undefined
  // const totalQuotaBN = localState.depth
  //   ? BigNumber.from(
  //       localState.isLongOrShort === 'long'
  //         ? localState.depth.asks_volTotal
  //         : localState.depth.bids_amtTotal,
  //     )
  //       .mul(99)
  //       .div(100)
  //   : BigNumber.from(0)
  // const totalQuota =
  //   selectedVTokenInfo ? utils.formatUnits(totalQuotaBN, selectedVTokenInfo.decimals) : '0'
  const totalQuota = tryFn(
    () => {
      const value =
        localState.isLongOrShort === 'long'
          ? new Decimal(utils.formatUnits(localState.depth!.asks_volTotal, LVUSDTInfo!.decimals)).div(
              localState.depth!.mid_price,
            )
          : new Decimal(utils.formatUnits(localState.depth!.bids_amtTotal, selectedVTokenInfo!.decimals))
      return value.mul('0.99').toString()
    },
    () => undefined,
  )
  // const totalQuota =
  //   selectedVTokenInfo ? utils.formatUnits(totalQuotaBN, selectedVTokenInfo.decimals) : '0'

  const maxTradeValue = Decimal.min(userMaxTradeValue ?? '0', totalQuota ?? '0').toString()
  
  // Decimal.min(userMaxTradeValue ?? '0', totalQuota).toString()



  const sellMinAmt = tryFn(
    () => {

      if (localState.isLongOrShort === 'short') {
        
        const baseTokenPrice =
          vaultTokenPrices && sellToken ? vaultTokenPrices[sellToken!.symbol] : undefined
        const quoteMinAmtInfo = utils.formatUnits(
          marketInfo!.minTradeAmount.quote,
          buyToken!.decimals,
        )
        const sellDust = utils.formatUnits(sellToken!.orderAmounts.dust, sellToken!.decimals)
        return BigNumberJS.max(
          sellDust,
          baseTokenPrice
            ? new BigNumberJS(quoteMinAmtInfo)
                .div(baseTokenPrice)
                .times(10000)
                .div(new BigNumberJS(10000).minus(slippage))
                .toString()
            : '0',
        ).toString()
      } else {
        const quoteMinAmtInfo = utils.formatUnits(
          marketInfo!.minTradeAmount.quote,
          sellToken!.decimals,
        )
        const sellDust = utils.formatUnits(sellToken!.orderAmounts.dust, sellToken!.decimals)
        return BigNumberJS.max(sellDust, quoteMinAmtInfo).toString()
      }
    },
    () => undefined,
  )
  const tradeMinAmt = tryFn(
    () => {


      const quoteMinAmtInfo = utils.formatUnits(
        marketInfo!.minTradeAmount.base,
        selectedVTokenInfo!.decimals,
      )
      const sellDust = utils.formatUnits(selectedVTokenInfo!.orderAmounts.dust, selectedVTokenInfo!.decimals)
      return BigNumberJS.max(sellDust, quoteMinAmtInfo).toString()

      // if (localState.isLongOrShort === 'short') {
        
      //   const baseTokenPrice =
      //     vaultTokenPrices && sellToken ? vaultTokenPrices[sellToken!.symbol] : undefined
      //   const quoteMinAmtInfo = utils.formatUnits(
      //     marketInfo!.minTradeAmount.quote,
      //     buyToken!.decimals,
      //   )
      //   const sellDust = utils.formatUnits(sellToken!.orderAmounts.dust, sellToken!.decimals)
      //   return BigNumberJS.max(
      //     sellDust,
      //     baseTokenPrice
      //       ? new BigNumberJS(quoteMinAmtInfo)
      //           .div(baseTokenPrice)
      //           .times(10000)
      //           .div(new BigNumberJS(10000).minus(slippage))
      //           .toString()
      //       : '0',
      //   ).toString()
      // } else {
      //   const quoteMinAmtInfo = utils.formatUnits(
      //     marketInfo!.minTradeAmount.quote,
      //     sellToken!.decimals,
      //   )
      //   const sellDust = utils.formatUnits(sellToken!.orderAmounts.dust, sellToken!.decimals)
      //   return BigNumberJS.max(sellDust, quoteMinAmtInfo).toString()
      // }
    },
    () => undefined,
  )
  console.log('tradeBtnStatus tradeMinAmt',tradeMinAmt)
  const sellMinAmtBN = (sellMinAmt && sellMinAmt !== 'NaN' && sellToken) ? utils.parseUnits(sellMinAmt, sellToken.decimals) : undefined

  
  

  

  // vaultAccountInfo?.marginLevel

  



  // const { vaultAccountInfo } = useVaultLayer2()
  // //High: No not Move!!!!!
  //@ts-ignore
  // const { realMarket } = usePairMatch({
  //   path,
  //   //@ts-ignore
  //   coinA: isShowVaultSwap?.symbol ?? marketArray[0]?.match(/(\w+)-(\w+)/i)[1] ?? '#null',
  //   coinB: '#null',
  //   marketArray,
  //   tokenMap,
  // })

  

  
  

  

  













  /** loaded from loading **/
  
  // const [tradeData, setTradeData] = React.useState<T | undefined>(undefined)
  // const [tradeCalcData, setTradeCalcData] = React.useState<Partial<CAD>>({
  //   lockedNotification: true,
  //   isVault: true,
  //   coinInfoMap: marketCoins?.reduce((prev: any, item: string ) => {
  //     return {
  //       ...prev,
  //       [item]: {
  //         ...(coinMap && coinMap[item]),
  //         erc20Symbol: item.slice(2),
  //         belongAlice: item.slice(2),
  //       },
  //     }
  //   }, {} as CoinMap<C>),
  // } as any)

  // const result = marketArray && marketArray[0] && marketArray[0].match(/([\w,#]+)-([\w,#]+)/i)

  // const resetMarket = () => {
  //   const localState = getLocalState()
  //   const type: 'sell' | 'buy' = localState.isLongOrShort === 'long' ? 'buy' : 'sell'

  //   const selectedTokenSymbol = localState.selectedToken 
  //   ? localState.selectedToken
  //   : isShowVaultSwap.symbol ? isShowVaultSwap.symbol : 'ETH'
  //   const selectedVTokenSymbol = 'LV' + selectedTokenSymbol
  //   const _market = `${selectedVTokenSymbol}-LVUSDT`
  //   const { tradePair } = marketInitCheck({
  //     market: _market,
  //     type,
  //     defaultValue: marketArray[0],
  //     marketArray,
  //     marketMap,
  //     tokenMap,
  //     coinMap,
  //     defaultA: result && result[1],
  //     defaultB: result && result[2],
  //   })
  //   // @ts-ignore
  //   const [_, sellTokenSymbol, buyTokenSymbol] = (tradePair ?? '').match(/(\w+)-(\w+)/i)
  //   let { market } = sdk.getExistedMarket(marketArray, sellTokenSymbol, buyTokenSymbol)
  //   // updateTradeVault({
  //   //   market,
  //   //   tradePair,
  //   //   isRequiredBorrow: false,
  //   // })
  //   if (coinMap && tokenMap && marketMap && tokenMap && marketArray) {
  //     // @ts-ignore
  //     // const [, coinA, coinB] = tradePair.match(/([\w,#]+)-([\w,#]+)/i)
  //     // let walletMap: WalletMap<any> | undefined
  //     // if (account.readyState === AccountStatus.ACTIVATED && vaultLayerStatus === SagaStatus.UNSET) {
  //     //   if (!Object.keys(tradeCalcData?.walletMap ?? {}).length) {
  //     //     walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map
  //     //   }
  //     //   walletMap = tradeCalcData?.walletMap as WalletMap<any>
  //     // }
  //     // const walletMap = account.readyState === AccountStatus.ACTIVATED && vaultLayerStatus === SagaStatus.UNSET 
  //     //   ? tradeCalcData?.walletMap as WalletMap<any>
  //     //   : undefined

  //     // const tradeDataTmp: any = {
  //     //   sell: {
  //     //     belong: coinA,
  //     //     tradeValue: undefined,
  //     //     ...makeVaultSell(coinA),
  //     //   },
  //     //   buy: {
  //     //     belong: coinB,
  //     //     tradeValue: undefined,
  //     //     ...makeVaultSell(coinB),
  //     //   },
  //     // }

  //     // const sellCoinInfoMap = tokenMap[coinB]?.tradePairs?.reduce(
  //     //   (prev: any, item: string ) => {
  //     //     return { ...prev, [item]: {
  //     //       ...coinMap[item],
  //     //       erc20Symbol: item.slice(2),
  //     //       belongAlice: item.slice(2),
  //     //     }}
  //     //   },
  //     //   {} as CoinMap<C>,
  //     // )

  //     // const buyCoinInfoMap = tokenMap[coinA]?.tradePairs?.reduce(
  //     //   (prev: any, item: string) => {
  //     //     return { ...prev, [item]: {
  //     //       ...coinMap[item],
  //     //       erc20Symbol: item.slice(2),
  //     //       belongAlice: item.slice(2),
  //     //     }}
  //     //   },
  //     //   {} as CoinMap<C>,
  //     // )
  //     // let _tradeCalcData = {},
  //       // showHasBorrow = false
  //     // setTradeCalcData((state) => {
  //     //   _tradeCalcData = {
  //     //     ...state,
  //     //     walletMap,
  //     //     coinSell: coinA,
  //     //     coinBuy: coinB,
  //     //     belongSellAlice: tokenMap[coinA].symbol.slice(2),
  //     //     belongBuyAlice: tokenMap[coinB].symbol.slice(2),
  //     //     sellPrecision: tokenMap[coinA as string]?.precision,
  //     //     buyPrecision: tokenMap[coinB as string]?.precision,
  //     //     sellCoinInfoMap,
  //     //     buyCoinInfoMap,
  //     //     StoB: undefined,
  //     //     BtoS: undefined,
  //     //     fee: undefined,
  //     //     tradeCost: undefined,
  //     //     lockedNotification: true,
  //     //     volumeSell: undefined,
  //     //     volumeBuy: undefined,
  //     //     sellMinAmtStr: undefined,
  //     //     sellMaxL2AmtStr: undefined,
  //     //     sellMaxAmtStr: undefined,
  //     //     totalQuota: undefined,
  //     //     l1Pool: undefined,
  //     //     l2Pool: undefined,
  //     //     step: VaultSwapStep.Edit,
  //     //     borrowStr: 0,
  //     //     borrowVol: 0,
  //     //     showHasBorrow,
  //     //     isRequiredBorrow: undefined,
  //     //   }
  //     //   return _tradeCalcData
  //     // })
  //     // setTradeData((state) => {
  //     //   return {
  //     //     ...state,
  //     //     ...tradeDataTmp,
  //     //   }
  //     // })
  //     // searchParams.set('market', _market)
  //     // history.replace(pathname + '?' + searchParams.toString())
  //     // updateTradeVault({
  //     //   market,
  //     //   tradePair,
  //     //   isRequiredBorrow: false,
  //     // })
  //   }
  // }
  // const [{ market }, setIsMarketStatus] = React.useState<{
  //   market: MarketType | undefined
  // }>({ market: undefined })

  const restartTimer = () => {
    console.log('restartTimer')
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(() => {
      refreshRef.current && (refreshRef.current as any).firstElementChild.click()
      // refreshData()
    }, 10 * 1000)
    refreshRef.current && (refreshRef.current as any).firstElementChild.click()
    // refreshData()
  }

  React.useEffect(() => {
    if (isShowVaultSwap.isShow || true) {
      restartTimer()
    } else {
      timerRef.current && clearInterval(timerRef.current)
      clearData()
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
  React.useEffect(() => {
    const subscription = merge(subjectBtradeOrderbook).subscribe(({ btradeOrderbookMap }) => {
      const localState = getLocalState()
      const {
        invest: {
          vaultMap: { marketMap },
        },
      } = store.getState()
      const item = marketMap && marketMap[market]
      if (
        item &&
        btradeOrderbookMap &&
        item?.wsMarket &&
        btradeOrderbookMap[item.wsMarket] &&
        localState.depth?.symbol &&
        item.wsMarket === btradeOrderbookMap[item.wsMarket]?.symbol
      ) {
        setLocalState({
          ...localState,
          depth: { ...btradeOrderbookMap[item.wsMarket], symbol: localState.depth.symbol }
        })
        myLog('useVaultSwap: depth', btradeOrderbookMap[item.wsMarket])
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [market])
  
  // React.useEffect(() => {
  //   const {
  //     depth,
  //   } = getLocalState().tradeVault
  //   const {
  //     marketMap
  //   } = store.getState().invest.vaultMap as VaultMapStates

  //   if (depth && market && marketMap[market].vaultMarket === depth.symbol) {
  //     // todo, handle depth change
  //     // refreshWhenDepthUp()
  //   }
  // }, [tradeVault.depth, account.readyState, market])

  // React.useEffect(() => {
  //   if (market) {
  //     if (timerRef.current) {
  //       clearInterval(timerRef.current)
  //     }    
  //     timerRef.current = setInterval(() => {
  //       refreshRef.current && (refreshRef.current as any).firstElementChild.click()
  //     }, 10 * 1000)
  //     refreshRef.current && (refreshRef.current as any).firstElementChild.click()  
  //     refreshData()
  //   }
  // }, [market])
  // React.useEffect(() => {
  //   // if (tradeCalcData.step == VaultSwapStep.Swap) {
  //   //   const {
  //   //     _router_tradeVault: {
  //   //       tradeVault: { tradeCalcData },
  //   //     },
  //   //   } = store.getState()
  //   //   if (tradeCalcData?.coinSell && tradeCalcData?.volumeSell) {
  //   //     const { countBig } = makeVaultSell(tradeCalcData.coinSell)
  //   //     if (sdk.toBig(countBig ?? 0).gte(tradeCalcData.volumeSell ?? 0)) {
  //   //       myLog(
  //   //         `VaultSwapStep.Swaping ${tradeCalcData?.coinSell}`,
  //   //         countBig.toString(),
  //   //         tradeCalcData.volumeSell.toString(),
  //   //       )
  //   //       setTradeCalcData((state) => {
  //   //         const newState = {
  //   //           ...state,
  //   //           step: VaultSwapStep.Swaping,
  //   //         }
  //   //         updateVaultTrade({
  //   //           ...newState,
  //   //         })
  //   //         sendRequest()
  //   //         return {
  //   //           ...newState,
  //   //         }
  //   //       })
  //   //     }
  //   //   }
  //   // }
  // }, [tradeCalcData.step, vaultLayerStatus])

  const clearData = () => {
    setLocalState(initLocalState)
    // let _tradeCalcData: any = {}
    // setTradeData((state) => {
    //   return {
    //     ...state,
    //     sell: { ...state?.sell, tradeValue: undefined },
    //     buy: { ...state?.buy, tradeValue: undefined },
    //   } as T
    // })

    // setTradeCalcData((state) => {
    //   _tradeCalcData = {
    //     ...(state ?? {}),
    //     maxFeeBips: undefined,
    //     lockedNotification: true,
    //     volumeSell: undefined,
    //     volumeBuy: undefined,
    //   }
    //   return _tradeCalcData
    // })
    // updateTradeVault({
    //   market,
    //   maxFeeBips: 0,
    //   tradeCalcData: {
    //     ..._tradeCalcData,
    //   },
    // })
  }

  const tradeBtnStatus = (() => {
    if ((!tokenMap || !vaultTokenPrices) && sellToken) {
      console.log('tradeBtnStatus', 1)
      return {
        label: undefined,
        disabled: true,
      }
    }
    if (!sellToken || !buyToken || !tradeMinAmt || !sellAmount) {
      console.log('tradeBtnStatus', 2)
      return {
        label: undefined,
        disabled: true,
      }
    }
    const {
      account,
    } = store.getState()
    
    const sellTokenSymbol = sellToken.symbol
    // const sellMinAmt = utils.formatUnits(sellMinAmtBN, sellToken.decimals)
    // const tradeMinAmt = localState.isLongOrShort === 'long'
    //   ?
    //   : 


    const isRequiredBorrow = BigNumber.from(sellAmountBN)
      .gt(sellTokenAsset?.total ?? '0')

    // const borrowVol = isRequiredBorrow
    //   ? BigNumber.from(sellAmountBN)
    //       .sub(sellTokenAsset?.total ?? '0')
    //       .div(utils.parseUnits('1', sellToken.vaultTokenAmounts.qtyStepScale))
    //       .mul(utils.parseUnits('1', sellToken.vaultTokenAmounts.qtyStepScale))
    //       .toString()
    //   : '0'

    const tradeValue = localState.amount ?? '0'
    const sellExceed = maxTradeValue ? new Decimal(maxTradeValue).lt(tradeValue ?? 0) : false
    const amtValid = !!(tradeValue && tradeMinAmt && sdk.toBig(tradeValue).gte(tradeMinAmt) && !sellExceed)

    const notEnough = userMaxTradeValue
      ? sdk.toBig(userMaxTradeValue).lt(tradeValue)
      : true

    if (localState.isSwapLoading || localState.swapStatus.status !== 'init') {
      console.log('tradeBtnStatus', 3)
      return {
        label: undefined,
        disabled: true,
      }
    } else {
      if (account.readyState === AccountStatus.ACTIVATED) {
        if (!sellAmountBN || !buyAmountBN || !sellAmountBN.gt('0') || !buyAmountBN.gt('0')) {
          return {
            label: 'labelEnterAmount',
            disabled: true,
          }
        } else if (notEnough) {
          return {
            label: 'labelVaultBorrowNotEnough',
            disabled: true,
          }
        } else if (sellExceed) {
          console.log('tradeBtnStatus sellExceed')
          const maxOrderSize = maxTradeValue + ' ' + sellTokenSymbol
          return {
            label: maxTradeValue
              ? `labelLimitMax| ${maxOrderSize}`
              : `labelVaultTradeInsufficient`,
            disabled: true,
          }
        } else if (
          isRequiredBorrow &&
          localState.swapStatus.status === 'init' && 
          moreToBeBorrowedBN &&
          BigNumber.from(sellToken.vaultTokenAmounts?.minLoanAmount).gt(moreToBeBorrowedBN)
        ) {
          return {
            label: `labelTradeVaultMiniBorrow|${
              getValuePrecisionThousand(
                utils.formatUnits(
                  sellToken.vaultTokenAmounts?.minLoanAmount,
                  sellToken.decimals
                ),
                sellToken.vaultTokenAmounts?.qtyStepScale,
                sellToken.vaultTokenAmounts?.qtyStepScale,
                sellToken.vaultTokenAmounts?.qtyStepScale,
                false,
                { floor: false, isAbbreviate: true },
              ) +
              ' ' +
              sellTokenSymbol
            }|${
              getValuePrecisionThousand(
                utils.formatUnits(
                  BigNumber.from(sellToken.vaultTokenAmounts?.minLoanAmount).add(sellTokenAsset?.total ?? 0),
                  sellToken.decimals
                ),
                sellToken.vaultTokenAmounts?.qtyStepScale,
                sellToken.vaultTokenAmounts?.qtyStepScale,
                sellToken.vaultTokenAmounts?.qtyStepScale,
                false,
                { floor: false, isAbbreviate: true },
              ) +
              ' ' +
              sellTokenSymbol
            }`,
            disabled: true,
          }
        } else if (!amtValid) {
          // const sellSymbol = tradeData?.sell.belong
          if (tradeMinAmt === undefined || tradeMinAmt === 'NaN') {
            return {
              label: 'labelEnterAmount',
              disabled: true,
            }
          } else {
            const minOrderSize = selectedVTokenInfo && getValuePrecisionThousand(
              sdk.toBig(tradeMinAmt ?? 0), //.div("1e" + sellToken.decimals),
              selectedVTokenInfo.vaultTokenAmounts?.qtyStepScale,
              selectedVTokenInfo.vaultTokenAmounts?.qtyStepScale,
              selectedVTokenInfo.vaultTokenAmounts?.qtyStepScale,
              false,
              { floor: false, isAbbreviate: true },
            )
            if (isNaN(Number(minOrderSize))) {
              return {
                label: `labelLimitMin| ${EmptyValueTag + ' ' + selectedTokenSymbol}`,
                disabled: true,
              }
            } else {
              return {
                label: `labelLimitMin| ${minOrderSize + ' ' + selectedTokenSymbol}`,
                disabled: true,
              }
            }
          }
        } else {
          console.log('tradeBtnStatus', 4)
          return {
            label: undefined,
            disabled: false,
          }
        }
      } else {
        console.log('tradeBtnStatus', 5)
        return {
          label: undefined,
          disabled: false,
        }
      }
    }
  })()
  console.log('tradeBtnStatus', tradeBtnStatus)

  // const availableTradeCheck = React.useCallback((): {
  //   tradeBtnStatus: TradeBtnStatus
  //   label: string | undefined
  // } => {
  //   if (!tokenMap || !vaultTokenPrices && tradeData?.sell) {
  //     return {
  //       label: undefined,
  //       tradeBtnStatus: TradeBtnStatus.DISABLED,
  //     }
  //   }
  //   const {
  //     _router_tradeVault: {
  //       tradeVault: {
  //         tradeCalcData: { supportBorrowData, ...tradeCalcData },
  //         sellMinAmtInfo,
  //         sellMaxAmtInfo: _sellMaxAmtInfo,
  //         isRequiredBorrow,
  //       },
  //     },
  //     account,
  //   } = store.getState()
  //   const sellToken = tokenMap[tradeData?.sell.belong as string]
  //   const buyToken = tokenMap[tradeData?.buy.belong as string]
  //   const belongSellAlice = sellToken?.symbol.slice(2)
  //   if (!sellToken || !buyToken || !tradeCalcData || !supportBorrowData) {
  //     return {
  //       label: undefined,
  //       tradeBtnStatus: TradeBtnStatus.DISABLED,
  //     }
  //   }
  //   const { minBorrowAmount, minBorrowVol } = supportBorrowData ?? {}
  //   const { borrowAvailable, count, tradeValue } = tradeData?.sell as X
  //   const borrowVol = tradeCalcData.borrowVol
  //   let validAmt = !!(tradeValue && sellMinAmtInfo && sdk.toBig(tradeValue).gte(sellMinAmtInfo))
  //   let sellMaxAmtInfo = BigNumber.min(
  //     tradeData?.sell.balance?.toString() ?? '0',
  //     _sellMaxAmtInfo ?? 0,
  //   ).toString()
  //   const notEnough = tradeData?.sell.balance
  //     ? sdk.toBig(tradeData?.sell.balance).lt(tradeData?.sell?.tradeValue ?? 0)
  //     : true

  //   const sellExceed = sellMaxAmtInfo ? new Decimal(sellMaxAmtInfo).lt(tradeValue ?? 0) : false
    
  //   if (sellExceed) {
  //     validAmt = false
  //   }

  //   if (isSwapLoading || !!isMarketInit || tradeCalcData?.step !== VaultSwapStep.Edit) {
  //     return {
  //       label: undefined,
  //       tradeBtnStatus: TradeBtnStatus.LOADING,
  //     }
  //   } else {
  //     if (account.readyState === AccountStatus.ACTIVATED) {
  //       if (!tradeCalcData || !tradeCalcData.volumeSell || !tradeCalcData.volumeBuy) {
  //         return {
  //           label: 'labelEnterAmount',
  //           tradeBtnStatus: TradeBtnStatus.DISABLED,
  //         }
  //       } else if (notEnough) {
  //         return {
  //           label: 'labelVaultBorrowNotEnough',
  //           tradeBtnStatus: TradeBtnStatus.DISABLED,
  //         }
  //       } else if (sellExceed) {
  //         const maxOrderSize = tradeCalcData.sellMaxAmtStr + ' ' + belongSellAlice
  //         return {
  //           label: tradeCalcData?.sellMaxAmtStr
  //             ? `labelLimitMax| ${maxOrderSize}`
  //             : `labelVaultTradeInsufficient`,
  //           tradeBtnStatus: TradeBtnStatus.DISABLED,
  //         }
  //       } else if (
  //         isRequiredBorrow &&
  //         tradeCalcData?.step == VaultSwapStep.Edit &&
  //         sdk.toBig(minBorrowVol).gt(borrowVol)
  //       ) {
  //         return {
  //           label: `labelTradeVaultMiniBorrow|${
  //             getValuePrecisionThousand(
  //               sdk.toBig(minBorrowAmount ?? 0), //.div("1e" + sellToken.decimals),
  //               sellToken.vaultTokenAmounts?.qtyStepScale,
  //               sellToken.vaultTokenAmounts?.qtyStepScale,
  //               sellToken.vaultTokenAmounts?.qtyStepScale,
  //               false,
  //               { floor: false, isAbbreviate: true },
  //             ) +
  //             ' ' +
  //             belongSellAlice
  //           }|${
  //             getValuePrecisionThousand(
  //               sdk
  //                 .toBig(minBorrowAmount)
  //                 .plus(count ?? 0)
  //                 .toString(), //.div("1e" + sellToken.decimals),
  //               sellToken.vaultTokenAmounts?.qtyStepScale,
  //               sellToken.vaultTokenAmounts?.qtyStepScale,
  //               sellToken.vaultTokenAmounts?.qtyStepScale,
  //               false,
  //               { floor: false, isAbbreviate: true },
  //             ) +
  //             ' ' +
  //             belongSellAlice
  //           }`,
  //           tradeBtnStatus: TradeBtnStatus.DISABLED,
  //         }
  //       } else if (!validAmt) {
  //         const sellSymbol = tradeData?.sell.belong
  //         if (sellMinAmtInfo === undefined || !sellSymbol || sellMinAmtInfo === 'NaN') {
  //           return {
  //             label: 'labelEnterAmount',
  //             tradeBtnStatus: TradeBtnStatus.DISABLED,
  //           }
  //         } else {
  //           const sellToken = tokenMap[sellSymbol]
  //           const minOrderSize = getValuePrecisionThousand(
  //             sdk.toBig(sellMinAmtInfo ?? 0), //.div("1e" + sellToken.decimals),
  //             sellToken.vaultTokenAmounts?.qtyStepScale,
  //             sellToken.vaultTokenAmounts?.qtyStepScale,
  //             sellToken.vaultTokenAmounts?.qtyStepScale,
  //             false,
  //             { floor: false, isAbbreviate: true },
  //           )
  //           if (isNaN(Number(minOrderSize))) {
  //             return {
  //               label: `labelLimitMin| ${EmptyValueTag + ' ' + belongSellAlice}`,
  //               tradeBtnStatus: TradeBtnStatus.DISABLED,
  //             }
  //           } else {
  //             return {
  //               label: `labelLimitMin| ${minOrderSize + ' ' + belongSellAlice}`,
  //               tradeBtnStatus: TradeBtnStatus.DISABLED,
  //             }
  //           }
  //         }
  //       } else {
  //         return {
  //           label: undefined,
  //           tradeBtnStatus: TradeBtnStatus.AVAILABLE,
  //         }
  //       }
  //     } else {
  //       return {
  //         label: undefined,
  //         tradeBtnStatus: TradeBtnStatus.AVAILABLE,
  //       }
  //     }
  //   }
  // }, [
  //   account,
  //   tokenMap,
  //   tradeData?.sell.belong,
  //   tradeData?.buy.belong,
  //   tradeVault.maxFeeBips,
  //   tradeData?.sell.tradeValue,
  //   tradeData?.buy.tradeValue,
  //   tradeData?.sell.count,
  //   tradeData?.sell.balance,
  //   tradeData?.sell.borrowAvailable,
  //   tradeCalcData?.step,
  //   tradeCalcData?.supportBorrowData?.maxBorrowVol,
  //   tradeCalcData?.isRequiredBorrow,
  //   isSwapLoading,
  //   isMarketInit,
  // ])
  const swapSubmit = async () => {
    const { depth } = localState
    const account = store.getState().account
    setIsSwapLoading(true)
    try {
      const ok =
        account.readyState === AccountStatus.ACTIVATED &&
        sellToken &&
        buyToken &&
        exchangeInfo &&
        selectedVTokenInfo &&
        sellAmountBN &&
        buyAmountBN
      if (!ok) {
        throw new Error('invalid data')
      }

      const storageId = await LoopringAPI.userAPI?.getNextStorageId(
        {
          accountId: account.accountId,
          sellTokenId: sellToken?.vaultTokenId ?? 0,
        },
        account.apiKey,
      )
      const request: sdk.VaultOrderRequest = {
        exchange: exchangeInfo.exchangeAddress,
        storageId: storageId!.orderId,
        accountId: account.accountId,
        sellToken: {
          tokenId: sellToken?.vaultTokenId ?? 0,
          volume: sellAmountBN.toString(),
        },
        buyToken: {
          tokenId: buyToken?.vaultTokenId ?? 0,
          volume: buyAmountBN.toString(),
        },
        validUntil: getTimestampDaysLater(DAYS),
        maxFeeBips: maxFeeBips,
        fillAmountBOrS: false,
        allOrNone: false,
        eddsaSignature: '',
        clientOrderId: '',
        orderType: sdk.OrderTypeResp.TakerOnly,
        fastMode: false,
      }
      myLog('useVaultSwap: submitOrder request', request)
      // const selectedVTokenInfo = 'selectedVTokenInfo'
      const item = {
        fromSymbol: sellToken.symbol,
        fromAmount: utils.formatUnits(sellAmountBN, sellToken.decimals),
        settledFromAmount: undefined,
        toSymbol: buyToken.symbol,
        feeAmount: feeAmount,
        settledToAmount: undefined,
      }
      const info: any = {
        sellToken: sellToken.symbol.slice(2),
        buyToken: buyToken.symbol.slice(2),
        sellVToken: sellToken.symbol,
        buyVToken: buyToken.symbol,
        sellStr: getValuePrecisionThousand(
          utils.formatUnits(sellAmountBN, sellToken.decimals),
          sellToken.vaultTokenAmounts?.qtyStepScale,
          sellToken.vaultTokenAmounts?.qtyStepScale,
          sellToken.vaultTokenAmounts?.qtyStepScale,
          false,
          { floor: false },
        ),
        buyStr: getValuePrecisionThousand(
          utils.formatUnits(buyAmountBN, buyToken.decimals),
          buyToken.precision,
          buyToken.precision,
          buyToken.precision,
          false,
          { floor: false },
        ),
        price: getValuePrecisionThousand(
          depth?.mid_price,
          selectedVTokenInfo.precision,
          selectedVTokenInfo.precision,
          selectedVTokenInfo.precision,
          false,
          { floor: false },
        ),
        sellFStr: undefined,
        buyFStr: undefined,
        convertStr: swapRatio,
        feeStr: undefined,
        time: Date.now(),
        fromSymbol: sellToken.symbol,
        toSymbol: buyToken.symbol,
        placedAmount:
          tokenMap &&
          item.fromSymbol &&
          sellToken.symbol.slice(2) &&
          item.fromAmount &&
          sdk.toBig(item.fromAmount).gt(0)
            ? `${getValuePrecisionThousand(
                sdk.toBig(item.fromAmount),
                undefined,
                undefined,
                tokenMap[item.fromSymbol].precision,
                false,
                { isAbbreviate: true },
              )} ${sellToken.symbol.slice(2)}`
            : EmptyValueTag,
        executedAmount: EmptyValueTag,
        executedRate: EmptyValueTag,
        convertedAmount: EmptyValueTag,
        settledAmount: EmptyValueTag,
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
      const response1 = await LoopringAPI.vaultAPI?.submitVaultOrder(
        {
          request,
          privateKey: account.eddsaKey.sk,
          apiKey: account.apiKey,
        },
        '1',
      )
      if ((response1 as sdk.RESULT_INFO).code || (response1 as sdk.RESULT_INFO).message) {
        throw new CustomErrorWithCode({
          code: (response1 as sdk.RESULT_INFO).code,
          message: (response1 as sdk.RESULT_INFO).message,
          ...SDK_ERROR_MAP_TO_UI[(response1 as sdk.RESULT_INFO)?.code ?? UIERROR_CODE.UNKNOWN],
        })
      } else {
        setLocalState(state => ({
          ...state,
          swapStatus: {
            status: 'init',
          }
        }))
        setShowVaultSwap({ isShow: false })
        l2CommonService.sendUserUpdate()
        await sdk.sleep(SUBMIT_PANEL_CHECK)
        if (refreshRef.current) {
          // @ts-ignore
          refreshRef.current.firstElementChild.click()
        }
        const response2: { hash: string } | any =
          await LoopringAPI.vaultAPI?.getVaultGetOperationByHash(
            {
              accountId: account.accountId as any,
              // @ts-ignore
              hash: response1.hash,
            },
            account.apiKey,
            '1',
          )
        const item = {
          fromSymbol: sellToken.symbol,
          fromAmount: sdk.toBig(response2.order.amountS).div('1e' + sellToken.decimals),
          settledFromAmount: sdk.toBig(response2.order.fillAmountS).div('1e' + sellToken.decimals),
          toSymbol: buyToken.symbol,
          settledToAmount: sdk.toBig(response2.order.fillAmountB).div('1e' + buyToken.decimals),
          feeAmount: sdk.toBig(response2.order.fee).div('1e' + buyToken.decimals),
        }
        const info: any = {
          sellToken: sellToken.symbol.slice(2),
          buyToken: buyToken.symbol.slice(2),
          sellFStr: getValuePrecisionThousand(
            item.settledFromAmount,
            sellToken.vaultTokenAmounts?.qtyStepScale,
            sellToken.vaultTokenAmounts?.qtyStepScale,
            sellToken.vaultTokenAmounts?.qtyStepScale,
            false,
            { floor: false },
          ),
          buyFStr: getValuePrecisionThousand(
            item.settledToAmount,
            buyToken.precision,
            buyToken.precision,
            buyToken.precision,
            false,
            { floor: false },
          ),
          price: getValuePrecisionThousand(
            depth?.mid_price,
            selectedVTokenInfo.precision,
            selectedVTokenInfo.precision,
            selectedVTokenInfo.precision,
            false,
            { floor: false },
          ),
          convertStr: swapRatio,
          feeStr: feeAmount,
          time: Date.now(),
          fromSymbol: sellToken.symbol,
          toSymbol: buyToken.symbol,
          placedAmount:
            tokenMap && item.fromSymbol && item.fromAmount && sdk.toBig(item.fromAmount).gt(0)
              ? `${getValuePrecisionThousand(
                  sdk.toBig(item.fromAmount),
                  undefined,
                  undefined,
                  tokenMap[item.fromSymbol].precision,
                  false,
                  { isAbbreviate: true },
                )} ${item.fromSymbol.slice(2)}`
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
                  false,
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
                  false,
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
                  false,
                  { isAbbreviate: true },
                )} ${item.toSymbol}`
              : EmptyValueTag,
        }
        if (
          response2?.raw_data?.operation?.status === sdk.VaultOperationStatus.VAULT_STATUS_FAILED
        ) {
          setShowAccount({
            isShow: store.getState().modals.isShowAccount.isShow,
            step: AccountStep.VaultTrade_Failed,
            info: {
              ...info,
              price: response2?.raw_data.order.price,
              percentage: '',
              status: t('labelFailed'),
            },
          })
          return
        }
        const status = [sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED].includes(
          response2?.raw_data?.operation?.status,
        )
          ? 'labelSuccessfully'
          : 'labelPending'

        setShowAccount({
          isShow: store.getState().modals.isShowAccount.isShow,
          step:
            status === 'labelSuccessfully'
              ? AccountStep.VaultTrade_Success
              : AccountStep.VaultTrade_In_Progress,
          info: {
            price: response2?.raw_data.order.price,
            percentage: sdk
              .toBig(response2?.raw_data?.order?.fillAmountS ?? 0)
              .div(response2?.raw_data?.order?.amountS ?? 1)
              .times(100)
              .toFixed(2),
            status: t(status),
            ...info,
          },
        })
        await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE)
        l2CommonService.sendUserUpdate()
        if (
          store.getState().modals.isShowAccount.isShow &&
          [AccountStep.VaultTrade_Success, AccountStep.VaultTrade_In_Progress].includes(
            store.getState().modals.isShowAccount.step,
          )
        ) {
          setShowAccount({ isShow: false })
        }
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
    } finally {
      setLocalState((state) => {
        return {
          ...state,
          swapStatus: {status: 'init'},
          isSwapLoading: false,
        }
      })
    }
    
  }
  const borrowSubmit = async () => {
    const {
      account,
    } = store.getState()


    setLocalState((state) => ({
      ...state,
      swapStatus: {
        status: 'borrowing',
        borrowAmount: moreToBeBorrowed
      },
      isSwapLoading: true,
    }))
    // setTradeCalcData((state) => {
    //   return {
    //     ...state,
    //     step: VaultSwapStep.Borrow,
    //   }
    // })

    try {
      if (
        exchangeInfo &&
        sellAmountBN &&
        sellToken &&
        moreToBeBorrowedBN
      ) {

        // const borrowAmountBN = BigNumber.from(sellAmountBN)
        //   .sub(sellTokenAsset?.total ?? '0')
        //   .div(utils.parseUnits('1', sellToken.decimals - sellToken.vaultTokenAmounts.qtyStepScale))
        //   .mul(utils.parseUnits('1', sellToken.decimals - sellToken.vaultTokenAmounts.qtyStepScale))
        


        const vaultBorrowRequest: sdk.VaultBorrowRequest = {
          accountId: account.accountId,
          token: {
            tokenId: sellToken.vaultTokenId as unknown as number,
            volume: moreToBeBorrowedBN.toString(),
          },
          timestamp: Date.now(),
        }
        let response = await LoopringAPI.vaultAPI?.submitVaultBorrow({
          request: vaultBorrowRequest,
          privateKey: account.eddsaKey?.sk,
          apiKey: account.apiKey,
        }, '1')
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        }


        const recursiveCheckBorrow = async (hash: string) => {
          const { account } = store.getState()
          return LoopringAPI.vaultAPI
            ?.getVaultGetOperationByHash(
              {
                accountId: account.accountId?.toString(),
                hash: hash,
              },
              account.apiKey,
            )
            .then(({ operation }) => {
              if (sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED === operation?.status) {
                l2CommonService.sendUserUpdate()
                setLocalState((state) => {
                  return {
                    ...state,
                    swapStatus: {
                      status: 'swapping',
                      borrowAmount: moreToBeBorrowed
                    },
                  }
                })
              } else if (sdk.VaultOperationStatus.VAULT_STATUS_FAILED === operation?.status) {
                l2CommonService.sendUserUpdate()
                throw operation
              } else {
                return sdk.sleep(SUBMIT_PANEL_CHECK).then(() => {
                  return recursiveCheckBorrow(hash)
                })
              }
            })
        }
        // borrowHash.current = { hash: (response as any).hash }
        await recursiveCheckBorrow((response as any).hash)
        return swapSubmit()
      }
    } catch (e) {
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
      setLocalState((state) => {
        return {
          ...state,
          swapStatus: {status: 'init'},
          isSwapLoading: false
        }
      })
    }
  }


  const onClickTradeBtn = async () => {
    if (!allowTrade?.order?.enable) {
      setShowSupport({ isShow: true })
      setIsSwapLoading(false)
      return
    }
    if ((market && !marketMap[market]?.enabled) || !VaultInvest.enable) {
      setShowTradeIsFrozen({
        isShow: true,
        type: 'Vault',
      })
      setIsSwapLoading(false)
      return
    }

    if (
      smallTradePromptAmtBN &&
      sellAmountBN &&
      BigNumber.from(smallTradePromptAmtBN).gt(sellAmountBN) &&
      !showSmallTradePrompt.show
    ) {
      const minimumConverted = tryFn(
        () => {
          return numberFormatThousandthPlace(
            sdk
              .toBig(calcDexOutput!.amountB!)
              .times(sdk.toBig(1).minus(sdk.toBig(slippageReal).div('10000')))
              .toString(),
              {fixed: buyToken!.precision, removeTrailingZero: true}
          )
        },
        () => '0',
      ) 
      setShowSmallTradePrompt({
        show: true,
        feePercentage: maxFeeBips
          ? new Decimal(maxFeeBips).div('100').toFixed(2)
          : '',
        estimatedFee: feeAmount + ' ' + buyTokenOriginSymbol,
        minimumConverted:
          minimumConverted + ' ' + buyTokenOriginSymbol,
      })
      return
    }
    // if (showSmallTradePrompt.show) {
    //   setShowSmallTradePrompt({
    //     show: false,
    //     feePercentage: undefined,
    //     estimatedFee: undefined,
    //     minimumConverted: undefined,
    //   })
    // }

    if (borrowRequired) {
      borrowSubmit()
    } else {
      swapSubmit()
    }
  }

  // const {
  //   btnStatus,
  //   onBtnClick: onSwapClick,
  //   btnLabel: swapBtnI18nKey,
  // } = useSubmitBtn({
  //   availableTradeCheck,
  //   isLoading: !!isMarketInit,
  //   submitCallback: vaultSwapSubmit,
  // })
  
  // const refreshData = async () => {
  //   myLog('useVaultSwap: refreshData', market)
  //   if (market) {
  //     getVaultMap()
  //     callPairDetailInfoAPIs()
  //     updateVaultLayer2({})
      
  //     if (chainInfos.vaultBorrowHashes && chainInfos.vaultBorrowHashes[account.accAddress]?.length) {
  //       chainInfos.vaultBorrowHashes[account.accAddress].forEach(({ hash }) => {
  //         const { account } = store.getState()
  //         LoopringAPI?.vaultAPI
  //           .getVaultGetOperationByHash(
  //             {
  //               accountId: account.accountId?.toString(),
  //               hash,
  //             },
  //             account.apiKey,
  //           )
  //           .then(({ operation }) => {
  //             if (
  //               [
  //                 sdk.VaultOperationStatus.VAULT_STATUS_SUCCEED,
  //                 sdk.VaultOperationStatus.VAULT_STATUS_FAILED,
  //               ].includes(operation.status)
  //             ) {
  //               updateVaultBorrowHash(
  //                 operation.hash,
  //                 account.accAddress,
  //                 sdk.VaultOperationStatus.VAULT_STATUS_FAILED ? 'failed' : 'success',
  //               )
  //             }
  //           })
  //       })
  //     }

  //     // update balance
  //     const sellToken = store.getState()._router_tradeVault.tradeVault.sellToken
  //     const buyToken = store.getState()._router_tradeVault.tradeVault.buyToken
  //     const depth = store.getState()._router_tradeVault.tradeVault.depth
  //     const sellTokenInfo = tokenMap[sellToken]
  //     const maxBorrowable = await LoopringAPI.vaultAPI?.getMaxBorrowable(
  //       {
  //         accountId: account.accountId,
  //         symbol: sellTokenInfo.symbol.slice(2),
  //       },
  //       account.apiKey,
  //       '1',
  //     )
  //     const tokenPrice = vaultTokenPrices[sellTokenInfo.symbol]
  //     const vaultMade = makeVaultSell(sellToken)

  //     const balance = numberFormat(
  //       new Decimal(maxBorrowable!.maxBorrowableOfUsdt).div(tokenPrice).add(vaultMade.count ?? '0').toString(),
  //       {
  //         fixed: sellTokenInfo.vaultTokenAmounts.qtyStepScale,
  //         removeTrailingZero: true,
  //         fixedRound: Decimal.ROUND_FLOOR
  //       },
  //     )
  //     setTradeData((prevState) => {
  //       if (!prevState) return prevState;
  //       return {
  //         ...prevState,
  //         sell: {
  //           ...prevState.sell,
  //           ...vaultMade,
  //           ...{ balance: balance },
  //         },
  //       }
  //     })
  //     const sellBuyStr = `${sellToken}-${buyToken}`
  //     const sellDeepStr = depth ?
  //           sdk
  //             .toBig(sellBuyStr == market ? depth.bids_amtTotal : depth.asks_volTotal)
  //             .div('1e' + sellTokenInfo.decimals)
  //             .times(0.99)
  //             .toString() : '0'
  //     const sellMaxAmtInfo = BigNumber.min(sellDeepStr, balance ?? 0)
  //     updateTradeVault({
  //       sellMaxAmtInfo: sellMaxAmtInfo as any
  //     })
  //   }
  // }

  

  

  const vaultLayer2Callback = React.useCallback(async () => {
    if (account.readyState !== AccountStatus.ACTIVATED) {
      clearData()
    } 
  }, [account.readyState, clearData])


  useL2CommonSocket({ vaultLayer2Callback })



  // const { tradeVault, updateTradeVault } = useTradeVault()
  
  
  // const _debonceCall = _.debounce(() => upateAPICall(), globalSetup.wait)

  // React.useEffect(() => {
  //   const {
  //     account: { accAddress },
  //     _router_tradeVault: { tradeVault },
  //     settings: { defaultNetwork },
  //     invest: {
  //       vaultMap: { marketMap },
  //     },
  //   } = store.getState()
  //   const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  //   const networkWallet: sdk.NetworkWallet = [
  //     sdk.NetworkWallet.ETHEREUM,
  //     sdk.NetworkWallet.GOERLI,
  //     sdk.NetworkWallet.SEPOLIA,
  //   ].includes(network as sdk.NetworkWallet)
  //     ? sdk.NetworkWallet.ETHEREUM
  //     : sdk.NetworkWallet[network]
  //   const item = marketMap[tradeVault?.market]
  //   if (tradeVault?.depth?.symbol && item?.wsMarket) {
  //     sendSocketTopic({
  //       [sdk.WsTopicType.btradedepth]: {
  //         showOverlap: false,
  //         markets: [item.wsMarket],
  //         level: 0,
  //         count: 50,
  //         snapshot: false,
  //       },
  //       [sdk.WsTopicType.l2Common]: {
  //         address: accAddress,
  //         network: networkWallet,
  //       },
  //     })
  //   } else {
  //     socketEnd()
  //   }
  //   return () => {
  //     socketEnd()
  //   }
  // }, [localState.depth?.symbol])
  // React.useEffect(() => {
  //   const subscription = merge(subjectBtradeOrderbook).subscribe(({ btradeOrderbookMap }) => {
  //     const {
  //       _router_tradeVault: { tradeVault },
  //       invest: {
  //         vaultMap: { marketMap },
  //       },
  //     } = store.getState()
  //     const item = marketMap && marketMap[tradeVault.market]
  //     if (
  //       item &&
  //       btradeOrderbookMap &&
  //       item?.wsMarket &&
  //       btradeOrderbookMap[item.wsMarket] &&
  //       tradeVault?.depth?.symbol &&
  //       item.wsMarket === btradeOrderbookMap[item.wsMarket]?.symbol
  //     ) {
  //       updateTradeVault({
  //         market: item.market,
  //         depth: { ...btradeOrderbookMap[item.wsMarket], symbol: tradeVault.depth.symbol },
  //         ...item,
  //       })
  //       myLog('useVaultSwap: depth', btradeOrderbookMap[item.wsMarket])
  //       // debonceCall()
  //     }
  //   })
  //   return () => subscription.unsubscribe()
  // }, [tradeVault.market])

  /*** user Action function ***/
  //High: effect by wallet state update
  // const handleSwapPanelEvent = async (
  //   swapData: SwapData<SwapTradeData<IBData<C>>>,
  //   swapType: any,
  // ): Promise<void> => {
  //   const { tradeData: _tradeData } = swapData
  //   myLog('useVaultSwap: resetSwap', swapType, _tradeData)
  //   const depth = store.getState()._router_tradeVault.tradeVault.depth
  //   setToastOpen({ open: false, content: '', type: ToastType.info, step: '' })
  //   switch (swapType) {
  //     case SwapType.SEll_CLICK:
  //     case SwapType.BUY_CLICK:
  //       return
  //     case SwapType.SELL_SELECTED:
  //       myLog(_tradeData)
  //       if (_tradeData?.sell.belong !== tradeData?.sell.belong) {
  //         resetMarket()
  //       } else {
  //         // reCalculateDataWhenValueChange(
  //         //   _tradeData,
  //         //   `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`,
  //         //   'sell',
  //         // )
  //       }
  //       break
  //     case SwapType.BUY_SELECTED:
  //       if (_tradeData?.buy.belong !== tradeData?.buy.belong) {
  //         resetMarket()
  //       } else {
  //         reCalculateDataWhenValueChange(
  //           _tradeData,
  //           `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`,
  //           'buy',
  //         )
  //       }
  //       break
  //     case SwapType.EXCHANGE_CLICK:
  //       let StoB, BtoS
  //       if (depth && depth.mid_price) {
  //         const pr1 = sdk.toBig(1).div(depth.mid_price).toString()
  //         const pr2 = depth.mid_price
  //         ;[StoB, BtoS] =
  //           market === `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`
  //             ? [pr1, pr2]
  //             : [pr2, pr1]
  //       }
  //       const sellPrecision = tokenMap[tradeCalcData.coinBuy as string].precision
  //       const buyPrecision = tokenMap[tradeCalcData.coinSell as string].precision
  //       const reserveInfo = sdk.getReserveInfo(tradeCalcData.coinSell as string, tradeCalcData.coinBuy as string, marketArray, tokenMap, marketMap as any)
  //       const _tradeCalcData = {
  //         ...tradeCalcData,
  //         coinSell: tradeCalcData.coinBuy,
  //         coinBuy: tradeCalcData.coinSell,
  //         belongSellAlice: tradeCalcData.coinSell?.slice(2),
  //         belongBuyAlice: tradeCalcData.coinBuy?.slice(2),
  //         sellPrecision,
  //         buyPrecision,
  //         sellCoinInfoMap: tradeCalcData.buyCoinInfoMap,
  //         buyCoinInfoMap: tradeCalcData.sellCoinInfoMap,
  //         StoB: getValuePrecisionThousand(
  //           StoB,
  //           undefined,
  //           reserveInfo?.isReverse ? 6 : marketMap[market!].precisionForPrice,
  //           reserveInfo?.isReverse ? 6 : marketMap[market!].precisionForPrice,
  //           true,
  //         ),
  //         BtoS: getValuePrecisionThousand(
  //           BtoS,
  //           undefined,
  //           !reserveInfo?.isReverse ? 6 : marketMap[market!].precisionForPrice,
  //           !reserveInfo?.isReverse ? 6 : marketMap[market!].precisionForPrice,
  //           true,
  //         ),
  //       }

  //       myLog(
  //         'useVaultSwap:Exchange,tradeCalcData,_tradeCalcData',
  //         tradeData,
  //         tradeCalcData,
  //         _tradeCalcData,
  //       )
  //       callPairDetailInfoAPIs()
  //       updateTradeVault({
  //         market,
  //         tradePair: `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}`,
  //         tradeCalcData: _tradeCalcData,
  //       })
  //       setTradeCalcData(_tradeCalcData)
  //       // @ts-ignore
  //       setTradeData((state) => {
  //         return {
  //           ...(state ?? {}),
  //           sell: {
  //             belong: _tradeCalcData.coinSell,
  //             tradeValue: undefined,
  //             ...makeVaultSell(_tradeCalcData?.coinSell?.toString() ?? ''),
  //           },
  //           buy: {
  //             belong: _tradeCalcData.coinBuy,
  //             tradeValue: undefined,
  //             ...makeVaultSell(_tradeCalcData?.coinBuy?.toString() ?? ''),
  //           },
  //         }
  //       })
  //       refreshData()
  //       break
  //     default:
  //       // resetTradeCalcData(undefined, market);
  //       break
  //   }
  // }
  
  
  

  // const callPairDetailInfoAPIs = async () => {
  //   if (market && LoopringAPI.defiAPI && marketMap && marketMap[market]) {
  //     try {
  //       const { depth } = await vaultSwapDependAsync({
  //         market: marketMap[market]?.vaultMarket as MarketType,
  //         tokenMap,
  //       })
  //       updateTradeVault({
  //         // @ts-ignore
  //         market,
  //         depth,
  //         ...marketMap[market],
  //       })
  //       myLog('useVaultSwap:', market, depth?.symbol)
  //     } catch (error: any) {
  //       myLog('useVaultSwap:', error, 'go to LRC-ETH')
  //       setShowGlobalToast({
  //         isShow: true,
  //         info: { content: 'error: resetMarket', type: ToastType.error },
  //       })
  //       resetMarket(market, 'sell')
  //     }
  //   }
  // }
  
  // const reCalculateDataWhenValueChange = React.useCallback(
  //   (_tradeData, _tradePair?, type?) => {
  //     const {
  //       account,
  //       _router_tradeVault: {
  //         tradeVault: { depth, tradePair, tradeCalcData },
  //       },
  //     } = store.getState()
  //     let vaultAvaiable2Map = makeVaultAvaiable2({}).vaultAvaiable2Map
  //     myLog('useVaultSwap:reCalculateDataWhenValueChange', tradeData, _tradePair, type)
  //     if (
  //       depth &&
  //       market &&
  //       marketMap[market] &&
  //       marketMap[market]?.enabled !== 'isFormLocal' &&
  //       market &&
  //       _tradePair === tradePair &&
  //       _tradeData?.sell
  //     ) {
  //       const sellToken = tokenMap[_tradeData?.sell.belong as string]
  //       const buyToken = tokenMap[_tradeData?.buy.belong as string]
  //       const sellBuyStr = `${sellToken.symbol}-${buyToken.symbol}`
  //       const isAtoB = type === 'sell'
  //       let input: any = isAtoB ? _tradeData.sell.tradeValue : _tradeData.buy.tradeValue
  //       input = input === undefined || isNaN(Number(input)) ? 0 : Number(input)
  //       let totalFee: any = undefined
  //       let stob: string | undefined = undefined
  //       let btos: string | undefined = undefined
  //       let minimumReceived: any
  //       let minimumConverted: string | undefined = undefined
  //       let sellMinAmtInfo: any = undefined
  //       let smallTradePromptAmt: string | undefined = undefined
  //       let upSlippageFeeBips: number | undefined = undefined
  //       let sellMaxAmtInfo: any = undefined
  //       let sellMaxL2AmtInfo: any = undefined
  //       let totalFeeRaw: any = undefined
  //       let totalQuote: any = undefined
  //       let showHasBorrow: boolean = false
  //       let isRequiredBorrow: boolean = false
  //       let borrowVol = sdk.toBig(0)
  //       const info = marketMap[market] as sdk.VaultMarket
  //       const { l2Amount, minTradeAmount, minTradePromptAmount } = info
  //       smallTradePromptAmt = new BigNumber(sellBuyStr == market ? minTradePromptAmount.base : minTradePromptAmount.quote)
  //         .div('1e' + sellToken.decimals)
  //         .toString()
      
  //       upSlippageFeeBips = info.upSlippageFeeBips as unknown as number;
  //       let maxFeeBips =
  //         (tradeData?.sell.tradeValue &&
  //         new Decimal(smallTradePromptAmt).gt(tradeData?.sell.tradeValue)
  //           ? upSlippageFeeBips
  //           : info.feeBips) ?? MAPFEEBIPS

  //       let slippage = sdk
  //         .toBig(
  //           _tradeData.slippage && !isNaN(_tradeData.slippage)
  //             ? _tradeData.slippage
  //             : defaultBlockTradeSlipage,
  //         )
  //         .times(100)
  //         .toString()
  //       const calcDexOutput = sdk.calcDex<sdk.VaultMarket>({
  //         info,
  //         input:
  //           tradeCalcData?.step != VaultSwapStep.Edit
  //             ? _tradeData?.sell?.tradeValue ?? 0
  //             : input.toString(),
  //         sell: sellToken.symbol,
  //         buy: buyToken.symbol,
  //         isAtoB: tradeCalcData?.step != VaultSwapStep.Edit ? true : isAtoB,
  //         marketArr: marketArray,
  //         tokenMap,
  //         marketMap: marketMap as any,
  //         depth,
  //         feeBips: maxFeeBips.toString(),
  //         slipBips: slippage,
  //       })

  //       const supportBorrowData = calcSupportBorrowData({
  //         belong: sellToken.symbol,
  //         ...((vaultAvaiable2Map && vaultAvaiable2Map[sellToken.symbol]) ?? {}),
  //         tradeValue: undefined,
  //         erc20Symbol: originTokenIdIndex[tokenMap[sellToken.symbol].tokenId],
  //       } as unknown as VaultBorrowTradeData)
  //       const amountVol = tokenMap[sellToken?.symbol]?.vaultTokenAmounts?.maxAmount
  //       if (chainInfos.vaultBorrowHashes && chainInfos.vaultBorrowHashes[account.accAddress]?.length) {
  //         showHasBorrow = true
  //       }
  //       const { countBig, ...vaultSellRest } = makeVaultSell(sellToken.symbol)
  //       _tradeData.sell = {
  //         ..._tradeData.sell,
  //         ...vaultSellRest,
  //       }
  //       if (amountVol && l2Amount) {
  //         const sellDeepStr =
  //           sdk
  //             .toBig(sellBuyStr == market ? depth.bids_amtTotal : depth.asks_volTotal)
  //             .div('1e' + sellToken.decimals)
  //             .times(0.99)
  //             .toString() ?? '0'

  //         totalQuote = sellDeepStr
  //           ? getValuePrecisionThousand(
  //               BigNumber.min(sellDeepStr),
  //               sellToken.vaultTokenAmounts?.qtyStepScale,
  //               sellToken.vaultTokenAmounts?.qtyStepScale,
  //               undefined,
  //               false,
  //               { isAbbreviate: true },
  //             )
  //           : EmptyValueTag
  //         sellMaxAmtInfo = BigNumber.min(sellDeepStr, _tradeData.sell.balance ?? 0)
  //       }
        
  //       if (sellBuyStr == market) {
  //         const baseTokenPrice = vaultTokenPrices
  //           ? vaultTokenPrices[tradeData?.sell.belong as string]
  //           : undefined
  //         const quoteMinAmtInfo = utils.formatUnits(minTradeAmount.quote, buyToken.decimals)
  //         const sellDust = utils.formatUnits(sellToken.orderAmounts.dust, sellToken.decimals)
          
  //         sellMinAmtInfo = BigNumberJS.max(
  //           sellDust,
  //           baseTokenPrice ? new BigNumberJS(quoteMinAmtInfo)
  //             .div(baseTokenPrice)
  //             .times(10000)
  //             .div(new BigNumberJS(10000).minus(slippage))
  //             .toString() : '0',
  //         ).toString()
  //       } else {
  //         const quoteMinAmtInfo = utils.formatUnits(
  //           minTradeAmount.quote,
  //           sellToken.decimals
  //         )
  //         const sellDust = utils.formatUnits(sellToken.orderAmounts.dust, sellToken.decimals)
  //         sellMinAmtInfo = BigNumberJS.max(
  //           sellDust,
  //           quoteMinAmtInfo,
  //         ).toString()
  //       }

  //       if (calcDexOutput) {
  //         totalFeeRaw = sdk
  //           .toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0)
  //           .div(10000)
  //           .times(maxFeeBips)
  //         totalFee = totalFeeRaw.gt(0)
  //           ? getValuePrecisionThousand(
  //               sdk
  //                 .toBig(totalFeeRaw)
  //                 .div('1e' + buyToken.decimals)
  //                 .toString(),
  //               buyToken.precision,
  //               undefined,
  //               buyToken.precision,
  //             )
  //           : 0
  //         minimumReceived = sdk.toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0).gt(0)
  //           ? getValuePrecisionThousand(
  //               sdk
  //                 .toBig(calcDexOutput?.amountBSlipped?.minReceived ?? 0)
  //                 .minus(totalFeeRaw ?? 0)
  //                 .div('1e' + buyToken.decimals)
  //                 .toString(),
  //               buyToken.precision,
  //               undefined,
  //               buyToken.precision,
  //             )
  //           : 0
  //         minimumConverted = calcDexOutput?.amountB
  //           ? getValuePrecisionThousand(
  //               sdk
  //                 .toBig(calcDexOutput?.amountB)
  //                 .times(sdk.toBig(1).minus(sdk.toBig(slippage).div('10000')))
  //                 .toString(),
  //               buyToken.precision,
  //               undefined,
  //               buyToken.precision,
  //             )
  //           : undefined
  //         _tradeData[isAtoB ? 'buy' : 'sell'].tradeValue =
  //           !_tradeData[isAtoB ? 'sell' : 'buy'].tradeValue &&
  //           _tradeData[isAtoB ? 'sell' : 'buy'].tradeValue != '0'
  //             ? (undefined as any)
  //             : getValuePrecisionThousand(
  //                 calcDexOutput[`amount${isAtoB ? 'B' : 'S'}`],
  //                 isAtoB ? buyToken.precision : sellToken.vaultTokenAmounts?.qtyStepScale,
  //                 isAtoB ? buyToken.precision : sellToken.vaultTokenAmounts?.qtyStepScale,
  //                 isAtoB ? buyToken.precision : sellToken.vaultTokenAmounts?.qtyStepScale,
  //               ).replaceAll(sdk.SEP, '')
  //         let result = reCalcStoB({
  //           market,
  //           tradeData: _tradeData as SwapTradeData<IBData<unknown>>,
  //           tradePair: tradePair as any,
  //           marketMap,
  //           tokenMap,
  //           noGetValuePrecisionThousand: true
  //         })
  //         stob = result?.stob
  //         btos = result?.btos
  //       } else {
  //         minimumReceived = undefined
  //       }
  //       borrowVol = sdk
  //         .toBig(
  //           sdk
  //             .toBig(calcDexOutput?.sellVol ?? 0)
  //             .minus(countBig ?? 0)
  //             .div('1e' + sellToken.decimals)
  //             .toFixed(sellToken.vaultTokenAmounts?.qtyStepScale, BigNumber.ROUND_CEIL),
  //         )
  //         .times('1e' + sellToken.decimals)
  //       isRequiredBorrow = borrowVol.gt(0) ? true : false
  //       let _tradeCalcData: any = {
  //         minimumReceived,
  //         maxFeeBips,
  //         volumeSell: calcDexOutput?.sellVol as any,
  //         volumeBuy: calcDexOutput?.amountBSlipped?.minReceived,
  //         fee: totalFee,
  //         slippage: sdk.toBig(slippage).div(100).toString(),
  //         isReverse: calcDexOutput?.isReverse,
  //         lastStepAt: type,
  //         sellMinAmtStr: numberFormat(
  //           sellMinAmtInfo ?? '0',
  //           { fixed: sellToken.vaultTokenAmounts?.qtyStepScale, removeTrailingZero: true, fixedRound: Decimal.ROUND_CEIL}
  //         ),
  //         sellMaxL2AmtStr: getValuePrecisionThousand(
  //           sdk.toBig(sellMaxL2AmtInfo ?? 0),
  //           sellToken.vaultTokenAmounts?.qtyStepScale,
  //           sellToken.vaultTokenAmounts?.qtyStepScale,
  //           sellToken.vaultTokenAmounts?.qtyStepScale,
  //           false,
  //           { isAbbreviate: true },
  //         ),
  //         sellMaxAmtStr: undefined,
  //         totalQuota: totalQuote,
  //         // l1Pool: poolToVol,
  //         l2Pool: getValuePrecisionThousand(
  //           sdk
  //             .toBig((sellBuyStr == market ? l2Amount.quote : l2Amount.base) ?? 0)
  //             .div('1e' + buyToken.decimals),
  //           buyToken.precision,
  //           buyToken.precision,
  //           undefined,
  //           false,
  //         ),
  //         belongSellAlice: sellToken.symbol.slice(2),
  //         belongBuyAlice: buyToken.symbol.slice(2),
  //         minimumConverted,
  //         supportBorrowData,
  //         showHasBorrow,
  //         hourlyRateInPercent: sdk.toFixed(sdk.toNumber(sellToken.interestRate) * 100, 6, false),
  //         yearlyRateInPercent: sdk.toFixed(sdk.toNumber(sellToken.interestRate) * 100 * 24 * 365, 2, false)
  //       }
  //       let _edit = {}

  //       setTradeData((state) => ({
  //         ...state,
  //         ..._tradeData,
  //         sell: {
  //           ...state?.sell,
  //           ..._tradeData?.sell,
  //           ...makeVaultSell(state?.sell?.belong ?? ''),
  //         },
  //       }))
  //       setTradeCalcData((state) => {
  //         const [mid_price, _mid_price_convert] = calcDexOutput
  //           ? [
  //               depth.mid_price,
  //               1 / depth.mid_price,  
  //             ]
  //           : [undefined, undefined]

  //         stob = stob
  //           ? stob
  //           : calcDexOutput
  //           ? calcDexOutput.isReverse
  //             ? _mid_price_convert!.toString()
  //             : mid_price!.toString()
  //           : state.StoB
  //           ? state.StoB
  //           : undefined

  //         btos = btos
  //           ? btos
  //           : calcDexOutput
  //           ? calcDexOutput.isReverse
  //             ? mid_price!.toString()
  //             : _mid_price_convert!.toString()
  //           : state?.BtoS
  //           ? state?.BtoS
  //           : undefined
  

  //         if ([VaultSwapStep.Edit, '', undefined].includes(state.step)) {
  //           _edit = {
  //             step: VaultSwapStep.Edit,
  //             isRequiredBorrow,
  //             borrowVol: borrowVol?.gt(0) ? borrowVol.toString() : 0,
  //             borrowStr: getValuePrecisionThousand(
  //               borrowVol?.gt(0) ? borrowVol.div('1e' + sellToken.decimals) : 0,
  //               sellToken.vaultTokenAmounts?.qtyStepScale,
  //               sellToken.vaultTokenAmounts?.qtyStepScale,
  //               sellToken.vaultTokenAmounts?.qtyStepScale,
  //               false,
  //               { isAbbreviate: true },
  //             ),
  //           }
  //         }

  //         _tradeCalcData = {
  //           ...state,
  //           ..._tradeCalcData,
  //           ..._edit,
  //           StoB: getValuePrecisionThousand(
  //             stob?.replaceAll(sdk.SEP, '') ?? 0,
  //             undefined,
  //             calcDexOutput?.isReverse ? 6 : marketMap[market].precisionForPrice,
  //             calcDexOutput?.isReverse ? 6 : marketMap[market].precisionForPrice,
  //             true
  //           ),
  //           BtoS: getValuePrecisionThousand(
  //             btos?.replaceAll(sdk.SEP, '') ?? 0,
  //             undefined,
  //             !calcDexOutput?.isReverse ? 6 : marketMap[market].precisionForPrice,
  //             !calcDexOutput?.isReverse ? 6 : marketMap[market].precisionForPrice,
  //             true
  //           ),
  //           lastStepAt: type,
  //         }
  //         updateTradeVault({
  //           info: info,
  //           market: market as any,
  //           totalFee: totalFee,
  //           totalFeeRaw: totalFeeRaw?.toString(),
  //           lastStepAt: type,
  //           sellMinAmtInfo: sellMinAmtInfo as any,
  //           smallTradePromptAmt,
  //           upSlippageFeeBips: upSlippageFeeBips.toString(),
  //           sellMaxL2AmtInfo: sellMaxL2AmtInfo as any,
  //           sellMaxAmtInfo: sellMaxAmtInfo as any,
  //           tradeCalcData: _tradeCalcData,
  //           isRequiredBorrow,
  //           maxFeeBips,
  //         })
  //         return _tradeCalcData
  //       })
  //     }
  //   },
  //   [account.readyState, tradeVault, tradeCalcData, tradeData, coinMap, tokenMap, marketArray],
  // )
  // const refreshWhenDepthUp = React.useCallback(() => {
  //   const { depth, lastStepAt, tradePair, market } = getLocalState().tradeVault 
    
  //   if (
  //     (depth && depth.symbol === market) ||
  //     (tradeData &&
  //       lastStepAt &&
  //       tradeCalcData.coinSell === tradeData['sell'].belong &&
  //       tradeCalcData.coinBuy === tradeData['buy'].belong)
  //   ) {
  //     reCalculateDataWhenValueChange(tradeData, tradePair, lastStepAt)
  //   } 
  //   // else if (
  //   //   depth &&
  //   //   tradeCalcData.coinSell &&
  //   //   tradeCalcData.coinBuy &&
  //   //   (`${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}` === market ||
  //   //     `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` === market)
  //   // ) {
  //   //   const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map

  //   //   const result = reCalcStoB({
  //   //     market,
  //   //     tradeData: tradeData as any,
  //   //     tradePair: tradePair as any,
  //   //     marketMap,
  //   //     tokenMap,
  //   //     noGetValuePrecisionThousand: true
  //   //   })
  //   //   const buyToken = tokenMap[tradeCalcData.coinBuy]
  //   //   const sellToken = tokenMap[tradeCalcData.coinSell]

  //   //   let _tradeCalcData: any = {}
  //   //   setTradeCalcData((state) => {
  //   //     const pr1 = sdk.toBig(1).div(depth.mid_price).toString()
  //   //     const pr2 = depth.mid_price
  //   //     const [StoB, BtoS] =
  //   //       market === `${tradeCalcData.coinBuy}-${tradeCalcData.coinSell}` ? [pr1, pr2] : [pr2, pr1]
  //   //     const reserveInfo = sdk.getReserveInfo(sellToken.symbol, buyToken.symbol, marketArray, tokenMap, marketMap as any)
  //   //     _tradeCalcData = {
  //   //       ...state,
  //   //       ...tradeCalcData,
  //   //       StoB: getValuePrecisionThousand(
  //   //         (result ? result?.stob : StoB.toString())?.replaceAll(sdk.SEP, ''),
  //   //         undefined,
  //   //         reserveInfo?.isReverse ? 6 : marketMap[market].precisionForPrice,
  //   //         reserveInfo?.isReverse ? 6 : marketMap[market].precisionForPrice,
  //   //         true,
  //   //       ),
  //   //       BtoS: getValuePrecisionThousand(
  //   //         (result ? result?.btos : BtoS.toString())?.replaceAll(sdk.SEP, ''),
  //   //         undefined,
  //   //         !reserveInfo?.isReverse ? 6 : marketMap[market].precisionForPrice,
  //   //         !reserveInfo?.isReverse ? 6 : marketMap[market].precisionForPrice,
  //   //         true,
  //   //       ),
  //   //     }
  //   //     return {
  //   //       ..._tradeCalcData,
  //   //       walletMap,
  //   //     }
  //   //   })
  //   //   reCalculateDataWhenValueChange(
  //   //     {
  //   //       sell: {
  //   //         belong: tradeCalcData.coinSell,
  //   //         ...makeVaultSell(tradeCalcData.coinSell),
  //   //       },
  //   //       buy: { belong: tradeCalcData.coinBuy },
  //   //     },
  //   //     `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`,
  //   //     'sell',
  //   //   )

  //   //   updateTradeVault({ market })
  //   // }
  // }, [market, tradeVault, tradeData, tradeCalcData, setTradeCalcData])
  












  
  


  const vaultSwapModalProps = {
    open: true, // todo
    // open: isShowVaultSwap.isShow,
    hideOther: localState.hideOther,
    onClickHideOther: () => {
      setLocalState({
        ...localState,
        hideOther: !localState.hideOther,
      })
    },
    onClose: () => {
      setShowVaultSwap({ isShow: false })
    },
    setting: {
      hideLeverage: true,
      onClickSettingLeverage: () => {},
      leverage: 1,
      onSwitchChange: () => {
        setSwapSecondConfirmation(!swapSecondConfirmation)
      },
      secondConfirmationChecked: swapSecondConfirmation,
      settingPopoverOpen: localState.showSetting,
      onCloseSettingPopover: () => {
        setLocalState({
          ...localState,
          showSetting: false,
        })
      },
      onClickSettingBtn: () => {
        setLocalState({
          ...localState,
          showSetting: !localState.showSetting,
        })
      },
      slippageList: ['0.1', '0.5', '1', `slippage:${slippage}`],
      currentSlippage: slippage,
      onSlippageChange: (slippage, customSlippage) => {
        if (customSlippage === 'N') {
          setSlippage(slippage)
        } else {
          setSlippage(customSlippage)
        }
      },
    },
    countdown: {
      countDownSeconds: 10,
      onRefreshData: () => {
        refreshData()
      },
      ref: refreshRef,
    },
    isLongOrShort: localState.isLongOrShort,
    onClickBalance: () => {
      userMaxTradeValue &&
        setLocalState({
          ...localState,
          amount: userMaxTradeValue,
        })
    },
    onClickToken: () => {
      setLocalState({
        ...localState,
        showTokenSelection: true,
      })
    },
    balance: tryFn(
      () => {
        if (new Decimal(userMaxTradeValue!).lessThanOrEqualTo('0'))
          return EmptyValueTag + ' ' + selectedTokenSymbol
        return (
          numberFormatThousandthPlace(userMaxTradeValue!, {
            fixed: selectedVTokenInfo!.vaultTokenAmounts.qtyStepScale,
            removeTrailingZero: true,
            fixedRound: Decimal.ROUND_FLOOR,
          }) +
          ' ' +
          selectedTokenSymbol
        )
      },
      (e) => {
        return EmptyValueTag + ' ' + selectedTokenSymbol
      },
    ),
    token: {
      symbol: selectedTokenSymbol,
      coinJSON: coinJson[selectedTokenSymbol],
    },
    onInputAmount: (amount: string) => {
      console.log('asdasdasawewe',selectedVTokenInfo.vaultTokenAmounts.qtyStepScale,strNumDecimalPlacesLessThan(amount, selectedVTokenInfo.vaultTokenAmounts.qtyStepScale),)
      if (
        amount &&
        (!isNumberStr(amount) ||
          !selectedVTokenInfo ||
          !strNumDecimalPlacesLessThan(amount, selectedVTokenInfo.vaultTokenAmounts.qtyStepScale + 1))
      )
        return
      setLocalState({
        ...localState,
        amount,
      })
    },
    inputPlaceholder: tradeMinAmt
      ? `Min ${numberFormat(tradeMinAmt, {
          fixed: selectedVTokenInfo?.vaultTokenAmounts.qtyStepScale,
          removeTrailingZero: true,
        })}`
      : '0.00',
    amountInput: localState.amount,
    inputAlert: {
      show: tradeBtnStatus.label !== undefined || localState.swapStatus.status !== 'init',
      type:
        tradeBtnStatus.label !== undefined
          ? 'error'
          : localState.swapStatus.status === 'borrowing'
          ? 'warning'
          : localState.swapStatus.status === 'swapping'
          ? 'success'
          : undefined,
      message: tryFn(
        () => {
          if (tradeBtnStatus.label) return tWrap(t, tradeBtnStatus.label)
          if (localState.swapStatus.status === 'borrowing') {
            return (
              localState.swapStatus.borrowAmount &&
              sellToken &&
              `Borrowing ${numberFormatThousandthPlace(localState.swapStatus.borrowAmount!, {
                fixed: sellToken.vaultTokenAmounts.qtyStepScale,
                removeTrailingZero: true,
              })} ${sellTokenOriginSymbol}`
            )
          } else if (localState.swapStatus.status === 'swapping') {
            return (
              localState.swapStatus.borrowAmount &&
              sellToken &&
              `Borrowed ${numberFormatThousandthPlace(localState.swapStatus.borrowAmount!, {
                fixed: sellToken.vaultTokenAmounts.qtyStepScale,
                removeTrailingZero: true,
              })} ${sellTokenOriginSymbol}`
            )
          }
        },
        () => '',
      ),
      icon:
        localState.swapStatus.status === 'borrowing'
          ? 'wait'
          : localState.swapStatus.status === 'swapping'
          ? 'completed'
          : undefined,
    },
    swapRatio,
    onClickReverse: () => {
      setLocalState({
        ...localState,
        isSwapRatioReversed: !localState.isSwapRatioReversed,
      })
    },
    maxTradeValue: tryFn(
      () => {
        return (
          numberFormatThousandthPlace(maxTradeValue, {
            fixed: selectedVTokenInfo?.vaultTokenAmounts.qtyStepScale,
            fixedRound: Decimal.ROUND_FLOOR,
            removeTrailingZero: true,
          }) +
          ' ' +
          selectedTokenSymbol
        )
      },
      () => EmptyValueTag,
    ),
    borrowed: tryFn(
      () => {
        if (new Decimal(sellTokenAsset!.borrowed).lessThanOrEqualTo(0)) return EmptyValueTag
        return (
          numberFormatThousandthPlace(
            utils.formatUnits(sellTokenAsset!.borrowed!, sellToken?.decimals),
            {
              fixed: sellToken!.precision,
              fixedRound: Decimal.ROUND_FLOOR,
              removeTrailingZero: true,
            },
          ) +
          ' ' +
          sellTokenOriginSymbol
        )
      },
      () => EmptyValueTag,
    ),
    totalQuota: tryFn(
      () =>
        numberFormatThousandthPlace(totalQuota!, {
          fixed: selectedVTokenInfo?.vaultTokenAmounts.qtyStepScale,
          fixedRound: Decimal.ROUND_FLOOR,
          removeTrailingZero: true,
        }) +
        ' ' +
        selectedTokenSymbol,
      () => EmptyValueTag,
    ),
    marginLevelChange: tryFn(
      () => {
        if (moreToBeBorrowed && new Decimal(moreToBeBorrowed).greaterThan('0')) {
          const moreToBorrowInUSD =
            moreToBeBorrowed && new Decimal(moreToBeBorrowed).greaterThan('0')
              ? new Decimal(moreToBeBorrowed).mul(vaultTokenPrices[sellToken!.symbol!]).toString()
              : undefined
          var nextMarginLevel = calcMarinLevel(
            vaultAccountInfo!.totalCollateralOfUsdt,
            vaultAccountInfo!.totalDebtOfUsdt,
            vaultAccountInfo!.totalBalanceOfUsdt,
            moreToBorrowInUSD!,
            '0',
          )
        }
        console.log('asdhjjkas', moreToBeBorrowed, nextMarginLevel)

        return {
          from: {
            marginLevel: vaultAccountInfo!.marginLevel,
            type: marginLevelType(vaultAccountInfo!.marginLevel),
          },
          to: nextMarginLevel
            ? {
                marginLevel: nextMarginLevel,
                type: marginLevelType(nextMarginLevel!),
              }
            : undefined,
        }
      },
      () => undefined,
    ),
    tradeBtn: {
      disabled: tradeBtnStatus.disabled,
      onClick: () => {
        onClickTradeBtn()
      },
      label: tradeBtnStatus.label ? t(tradeBtnStatus.label) : undefined,
      loading: localState.isSwapLoading
    },
    hourlyInterestRate:
      sellTokenAsset?.borrowed && new Decimal(sellTokenAsset.borrowed).gt(0) && sellToken
        ? toPercent(sellToken.interestRate, 7)
        : EmptyValueTag,
    tradingFee: tryFn(
      () => {
        if (new Decimal(feeAmount!).lessThanOrEqualTo('0')) {
          return EmptyValueTag + ' ' + buyTokenOriginSymbol
        }
        return (
          numberFormatThousandthPlace(feeAmount!, {
            fixed: buyToken!.precision,
            removeTrailingZero: true,
          }) +
          ' ' +
          buyTokenOriginSymbol
        )
      },
      () => EmptyValueTag + ' ' + buyTokenOriginSymbol,
    ),
    slippageTolerance: `${slippageReal}%`,
    onClickLongShort: (v: 'long' | 'short') => {
      setLocalState({
        ...localState,
        isLongOrShort: v,
        maxBorrowableSellToken: undefined,
      })
      restartTimer()
    },
    myPositions: [
      {
        tokenSymbol: 'ETH',
        longOrShort: 'short',
        marginLevel: '10',
        leverage: '5x',
        amount: '10',
        marketPrice: '3000',
        onClickLeverage: () => {},
        onClickTrade: () => {},
        onClickClose: () => {},
      },
      {
        tokenSymbol: 'LRC',
        longOrShort: 'long',
        marginLevel: '10',
        leverage: '1x',
        amount: '10',
        marketPrice: '3000',
        onClickLeverage: () => {},
        onClickTrade: () => {},
        onClickClose: () => {},
      },
    ],
    leverageSelection: {
      value: '1x',
      onChange: (value: string) => {},
      items: [
        {
          label: '1x',
          value: '1x',
        },
        {
          label: '2x',
          value: '2x',
        },
        {
          label: '3x',
          value: '3x',
        },
        {
          label: '5x',
          value: '5x',
        },
        {
          label: '10x',
          value: '10x',
        },
        {
          label: '20x',
          value: '20x',
        },
      ],
    },
    positionTypeSelection: {
      value: 'cross',
      onChange: (value: string) => {},
      items: [
        {
          label: 'Cross Position',
          value: 'cross',
        },
      ],
    },
    ratioSlider: {
      currentRatio: tryFn(
        () => new Decimal(localState.amount).div(maxTradeValue).toDecimalPlaces(2).toNumber(),
        () => 0,
      ),
      onClickRatio: (no: number) => {
        setLocalState((state) => {
          return {
            ...state,
            amount: new Decimal(maxTradeValue)
              .mul(new Decimal(no))
              .toDecimalPlaces(selectedVTokenInfo?.vaultTokenAmounts.qtyStepScale)
              .toString(),
          }
        })
      },
    },

    tokenSelection: {
      show: localState.showTokenSelection,
      search: localState.tokenSelectionInput,
      onClickCancel: () => {
        setLocalState({
          ...localState,
          showTokenSelection: false,
          tokenSelectionInput: '',
        })
      },
      tokens:
        vaultLayer2 && tokenMap
          ? _.keys(vaultLayer2)
              .map((symbol) => {
                const asset = vaultLayer2[symbol]
                const tokenInfo = tokenMap[symbol]
                return tokenInfo
                  ? {
                      symbol: symbol.slice(2),
                      amount: numberFormatThousandthPlace(
                        utils.formatUnits(asset.total, tokenInfo.decimals),
                        { fixed: tokenInfo.precision, removeTrailingZero: true },
                      ),
                      coinJSON: coinJson[symbol.slice(2)],
                      onClick: () => {
                        setLocalState({
                          ...localState,
                          showTokenSelection: false,
                          selectedToken: symbol.slice(2),
                          tokenSelectionInput: '',
                        })
                        restartTimer()
                      },
                    }
                  : undefined
              })
              .filter(
                (item) =>
                  item !== undefined &&
                  (!localState.tokenSelectionInput ||
                    item.symbol
                      .toLowerCase()
                      .includes(localState.tokenSelectionInput.toLowerCase())),
              )
          : [],
      onInputSearch: (v: string) => {
        setLocalState({
          ...localState,
          tokenSelectionInput: v,
          amount: ''
        })
      },
    },
  }

  const smallOrderAlertProps = {
    open: showSmallTradePrompt.show,
    handleClose: () => {
      setShowSmallTradePrompt({
        show: false,
        estimatedFee: undefined,
        minimumConverted: undefined,
        feePercentage: undefined,
      })
    },
    handleConfirm: () => {
      setShowSmallTradePrompt({
        show: false,
        estimatedFee: undefined,
        minimumConverted: undefined,
        feePercentage: undefined,
      })
      if (borrowRequired) {
        borrowSubmit()
      } else {
        swapSubmit()
      }
    },
    estimatedFee: showSmallTradePrompt.estimatedFee ?? '',
    feePercentage: showSmallTradePrompt.feePercentage ?? '',
    minimumReceived: showSmallTradePrompt.minimumConverted ?? '',
  }

  const toastProps = {
    alertText: toastOpen?.content ?? '',
    open: toastOpen?.open ?? false,
    autoHideDuration: TOAST_TIME,
    onClose: closeToast,
    severity: toastOpen?.type,
  }
  console.log('useVaultSwap output', localState, vaultSwapModalProps, {tokenMap,vaultLayer2, marketMap})
  return {
    vaultSwapModalProps,
    smallOrderAlertProps,
    toastProps
  }
  // return {
  //   // isMarketInit,
  //   // toastOpen,
  //   // closeToast,
  //   // tradeCalcData: {
  //   //   ...tradeCalcData,
  //   //   // marginLevelChange:
  //   //   //   vaultAccountInfo && nextMarginLevel && tradeCalcData.borrowStr
  //   //   //     ? {
  //   //   //         from: {
  //   //   //           marginLevel: vaultAccountInfo.marginLevel,
  //   //   //           type: marginLevelType(vaultAccountInfo.marginLevel),
  //   //   //         },
  //   //   //         to: {
  //   //   //           marginLevel: nextMarginLevel,
  //   //   //           type: marginLevelType(nextMarginLevel),
  //   //   //         },
  //   //   //       }
  //   //   //     : undefined,
  //   // },
  //   // tradeData,
  //   // // onSwapClick,
  //   // // swapBtnI18nKey,
  //   // // swapBtnStatus: btnStatus,
  //   // // handleSwapPanelEvent,
  //   // refreshData2: refreshData,
  //   // refreshRef,
  //   // tradeVault,
  //   // vaultAccountInfo,
  //   // // isSwapLoading,
  //   // market,
  //   // isMobile,
  //   // setToastOpen,
  //   // disabled: false,
  //   // // vaultBorrowSubmit,
  //   // // vaultSwapSubmit,
  //   // cancelBorrow: (shouldClose = false) => {
  //   //   if (borrowHash?.current?.hash && account) {
  //   //     updateVaultBorrowHash(borrowHash?.current?.hash, account.accAddress)
  //   //   }
  //   //   setIsSwapLoading(false)
  //   //   resetMarket()
  //   //   if (shouldClose) {
  //   //     setShowVaultSwap({ isShow: false })
  //   //   }
  //   // },
  //   // // borrowedAmount,
  //   // // marginLevelChange:
  //   // //   vaultAccountInfo && nextMarginLevel && tradeCalcData.borrowStr
  //   // //     ? {
  //   // //         from: {
  //   // //           marginLevel: vaultAccountInfo.marginLevel,
  //   // //           type: marginLevelType(vaultAccountInfo.marginLevel),
  //   // //         },
  //   // //         to: {
  //   // //           marginLevel: nextMarginLevel,
  //   // //           type: marginLevelType(nextMarginLevel),
  //   // //         },
  //   // //       }
  //   // //     : undefined,
  //   // showSmallTradePrompt,
  //   // setShowSmallTradePrompt,
  //   // hideLeverage: (vaultAccountInfo as any)?.accountType === 0,
  // }
}
