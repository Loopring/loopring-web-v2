import * as sdk from '@loopring-web/loopring-sdk'
import React from 'react'
import { useGetSet } from 'react-use'

import {
  AccountStatus,
  CustomErrorWithCode,
  EmptyValueTag,
  getValuePrecisionThousand,
  MapChainId,
  MarketType,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  SUBMIT_PANEL_AUTO_CLOSE,
  SUBMIT_PANEL_CHECK,
  TOAST_TIME,
  UIERROR_CODE,
  VaultSwapStep,
} from '@loopring-web/common-resources'
import {
  AccountStep,
  ToastType,
  useOpenModals,
  useSettings,
  useToggle,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'

import BigNumberJS from 'bignumber.js'
import {
  btradeOrderbookService,
  DAYS,
  getTimestampDaysLater,
  isNumberStr,
  l2CommonService,
  LoopringAPI,
  MAPFEEBIPS,
  numberFormat,
  numberFormatThousandthPlace,
  onchainHashInfo,
  // reCalcStoB,
  store,
  tryFn,
  useAccount,
  useL2CommonSocket,
  useSocket,
  useSystem,
  useToast,
  useTokenMap,
  useVaultAccountInfo,
  useVaultLayer2,
  useVaultMap,
  VaultBorrowTradeData,
  vaultSwapDependAsync,
  toPercent,
  strNumDecimalPlacesLessThan,
  NETWORKEXTEND,
} from '@loopring-web/core'
import { merge } from 'rxjs'
import Decimal from 'decimal.js'
import { calcMarinLevel, marginLevelType } from '@loopring-web/core/src/hooks/useractions/vault/utils'
import { utils, BigNumber } from 'ethers'
import _ from 'lodash'
import { closePosition } from './useVaultDashBoard'
import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'

const tWrap = (t: any, label: string) => {
  const [theLable, ...rest] = label.split('|')
  const obj = _.fromPairs(rest.map((value, index) => [index === 0 ? 'arg' : 'arg' + index, value]))
  return t(theLable, obj)
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
      minReceived:
        output?.amountBSlipped?.minReceived !== 'NaN'
          ? output?.amountBSlipped?.minReceived
          : undefined,
      minReceivedVal:
        output?.amountBSlipped?.minReceivedVal !== 'NaN'
          ? output?.amountBSlipped?.minReceivedVal
          : undefined,
    },
  }
}

export type VaultTradeTradeData = VaultBorrowTradeData & { borrowAvailable: string }

const repayIfNeeded = async (symbol) => {
  const {
    vaultLayer2: { vaultLayer2 },
    invest: {
      vaultMap: {
        tokenMap
      },
    },
    system: { exchangeInfo, chainId },
    account
  } = store.getState()
  const asset = vaultLayer2?.[symbol]
  const shouldRepay = new Decimal(asset?.borrowed ?? '0').gt('0') && new Decimal(asset?.total ?? '0').gt('0')
  if (!shouldRepay) return
  const tokenInfo = tokenMap[symbol]
  const [{ broker }, { offchainId }] = await Promise.all([
    LoopringAPI.userAPI!.getAvailableBroker({
      type: 4,
    }),
    LoopringAPI.userAPI!.getNextStorageId(
      {
        accountId: account.accountId,
        sellTokenId: tokenInfo.vaultTokenId,
      },
      account.apiKey,
    ),
  ])
  const request = {
    exchange: exchangeInfo!.exchangeAddress,
    payerAddr: account.accAddress,
    payerId: account.accountId,
    payeeId: 0,
    payeeAddr: broker,
    storageId: offchainId,
    token: {
      tokenId: tokenInfo.vaultTokenId,
      volume: asset!.borrowed,
    },
    maxFee: {
      tokenId: tokenInfo.vaultTokenId,
      volume: '0',
    },
    validUntil: getTimestampDaysLater(DAYS),
    memo: '',
  }

  return await LoopringAPI.vaultAPI?.submitVaultRepay(
    {
    
      request: request,
      web3: connectProvides.usedWeb3 as any,
      chainId: chainId === NETWORKEXTEND.NONETWORK ? sdk.ChainId.MAINNET : chainId,
      walletType: (ConnectProviders[account.connectName] ??
        account.connectName) as unknown as sdk.ConnectorNames,
      eddsaKey: account.eddsaKey.sk,
      apiKey: account.apiKey,
    },
    {
      accountId: account.accountId,
      counterFactualInfo: account.eddsaKey.counterFactualInfo,
    },
    '1'
  )


  
}
export const useVaultSwap = () => {
  const borrowHash = React.useRef<null | { hash: string; timer?: any }>(null)
  const refreshRef = React.useRef()
  const mainViewRef = React.useRef<HTMLDivElement>(null)
  const timerRef = React.useRef<NodeJS.Timeout | null>(null)

  const { tokenMap: originTokenMap } = useTokenMap()
  const { account } = useAccount()
  const {
    tokenMap,
    marketMap,
    marketArray,
    getVaultMap,
    tokenPrices: vaultTokenPrices,
  } = useVaultMap()
  const {
    setShowSupport,
    setShowTradeIsFrozen,
    modals: { isShowVaultSwap },
    setShowAccount,
    setShowVaultSwap,
    setShowVaultExit,
    setShowGlobalToast,
    setShowVaultCloseConfirm,
  } = useOpenModals()
  const {
    toggle: { VaultInvest },
  } = useToggle()

  const { t } = useTranslation(['common', 'error'])

  const { exchangeInfo, allowTrade } = useSystem()
  const { updateVaultLayer2, vaultLayer2 } = useVaultLayer2()
  const { sendSocketTopic, socketEnd } = useSocket()
  const subjectBtradeOrderbook = React.useMemo(() => btradeOrderbookService.onSocket(), [])

  const { toastOpen, setToastOpen, closeToast } = useToast()
  const { coinJson, swapSecondConfirmation, setSwapSecondConfirmation, slippage, setSlippage } =
    useSettings()

  const { chainInfos, updateVaultBorrowHash } = onchainHashInfo.useOnChainInfo()
  const { vaultAccountInfo, maxLeverage } = useVaultAccountInfo()

  const initLocalState = {
    hideOther: false,
    isLongOrShort: undefined as 'long' | 'short' | undefined,
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
      borrowAmount: '10',
    } as {
      status: 'borrowing' | 'swapping' | 'init'
      borrowAmount?: string
    },
    maxBorrowableSellToken: undefined as string | undefined,
    depth: undefined as sdk.DepthData | undefined,
    slideValue: 0,
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

    const { depth } = await vaultSwapDependAsync({
      market: marketMap[market]?.vaultMarket as MarketType,
      tokenMap,
    })
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

  const setIsSwapLoading = (loading: boolean) => {
    setLocalState((state) => ({
      ...state,
      isSwapLoading: loading,
    }))
  }
  const setShowSmallTradePrompt = (showSmallTradePrompt: {
    show: boolean
    estimatedFee: string | undefined
    minimumConverted: string | undefined
    feePercentage: string | undefined
  }) => {
    setLocalState((state) => ({
      ...state,
      showSmallTradePrompt,
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
  const isLongOrShort = localState.isLongOrShort 
    ? localState.isLongOrShort
    : isShowVaultSwap.isSell
      ? 'short'
      : 'long'
  const selectedTokenSymbol = getSelectedTokenSymbol()
  const selectedVTokenSymbol = 'LV' + selectedTokenSymbol
  const selectedVTokenInfo = tokenMap ? tokenMap[selectedVTokenSymbol] : undefined

  const LVUSDTInfo = tokenMap ? tokenMap['LVUSDT'] : undefined
  const USDTInfo = originTokenMap ? originTokenMap['USDT'] : undefined
  const sellToken = isLongOrShort === 'long' ? LVUSDTInfo : selectedVTokenInfo
  const sellTokenOriginSymbol =
    isLongOrShort === 'long' ? 'USDT' : selectedVTokenSymbol.slice(2)
  const buyToken = isLongOrShort === 'long' ? selectedVTokenInfo : LVUSDTInfo
  const buyTokenOriginSymbol =
    isLongOrShort === 'long' ? selectedVTokenSymbol.slice(2) : 'USDT'

  const market: MarketType = `${selectedVTokenSymbol}-LVUSDT`
  const marketInfo = marketMap ? marketMap[market] : undefined

  const smallTradePromptAmtBN = sellToken
    ? isLongOrShort === 'long'
      ? marketInfo?.minTradePromptAmount?.quote
      : marketInfo?.minTradePromptAmount?.base
    : undefined
  console.log('smallTradePromptAmtBN', smallTradePromptAmtBN)
  const smallAmtFeeBips = marketInfo?.upSlippageFeeBips as unknown as number

  const sellTokenAsset = sellToken && vaultLayer2 ? vaultLayer2[sellToken.symbol] : undefined

  const borrowAble = localState.maxBorrowableSellToken
    ? localState.maxBorrowableSellToken
    : undefined
  
  const userMaxSellValueWithoutBorrow =
    sellToken
      ? numberFormat(
          utils.formatUnits(
            BigNumber.from(sellTokenAsset?.total ?? 0),
            sellToken?.decimals,
          ),
          {
            fixed: sellToken.vaultTokenAmounts.qtyStepScale,
            removeTrailingZero: true,
            fixedRound: Decimal.ROUND_FLOOR,
          },
        )
      : undefined
      
  const userMaxSellValue =
    sellToken
      ? numberFormat(
          utils.formatUnits(
            BigNumber.from(sellTokenAsset?.total ?? 0).add(
              utils.parseUnits(borrowAble ?? '0', sellToken?.decimals),
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

  const slippageReal = slippage ? (slippage === 'N' ? 0.1 : slippage) : 0.1
  const maxAmountCalcDexOutput =
    sellToken && buyToken && localState.depth && marketInfo
      ? calcDexWrap<sdk.VaultMarket>({
          info: marketInfo as sdk.VaultMarket,
          input: userMaxSellValue ?? '0',
          sell: sellToken.symbol,
          buy: buyToken.symbol,
          isAtoB: isLongOrShort === 'long',
          marketArr: marketArray,
          tokenMap,
          marketMap: marketMap as any,
          depth: localState.depth,
          feeBips: (marketInfo.feeBips ?? MAPFEEBIPS).toString(),
          slipBips: slippageReal.toString(),
        })
      : undefined
  const maxAmountWithoutBorrowCalcDexOutput =
    sellToken && buyToken && localState.depth && marketInfo
      ? calcDexWrap<sdk.VaultMarket>({
          info: marketInfo as sdk.VaultMarket,
          input: userMaxSellValueWithoutBorrow ?? '0',
          sell: sellToken.symbol,
          buy: buyToken.symbol,
          isAtoB: isLongOrShort === 'long',
          marketArr: marketArray,
          tokenMap,
          marketMap: marketMap as any,
          depth: localState.depth,
          feeBips: (marketInfo.feeBips ?? MAPFEEBIPS).toString(),
          slipBips: slippageReal.toString(),
        })
      : undefined

  const userMaxTradeValue =
    isLongOrShort === 'short' ? userMaxSellValue : maxAmountCalcDexOutput?.amountB
  const userMaxTradeValueWithoutBorrow =
    isLongOrShort === 'short'
      ? userMaxSellValueWithoutBorrow
      : maxAmountWithoutBorrowCalcDexOutput?.amountB

  const preCalcDexOutput =
    sellToken && buyToken && localState.depth && marketInfo
      ? calcDexWrap<sdk.VaultMarket>({
          info: marketInfo as sdk.VaultMarket,
          input: localState.amount ?? '0',
          sell: sellToken.symbol,
          buy: buyToken.symbol,
          isAtoB: isLongOrShort === 'short',
          marketArr: marketArray,
          tokenMap,
          marketMap: marketMap as any,
          depth: localState.depth,
          feeBips: (marketInfo.feeBips ?? MAPFEEBIPS).toString(),
          slipBips: slippageReal.toString(),
        })
      : undefined

  const sellAmountEstimate =
    preCalcDexOutput?.amountS && sellToken
      ? numberFormat(preCalcDexOutput?.amountS, { fixed: sellToken.decimals })
      : undefined
  const sellAmountEstimateBN =
    sellToken && sellAmountEstimate && sellAmountEstimate !== 'NaN'
      ? utils.parseUnits(sellAmountEstimate, sellToken.decimals)
      : undefined

  const maxFeeBips =
    sellAmountEstimateBN && smallTradePromptAmtBN && sellAmountEstimateBN.lt(smallTradePromptAmtBN)
      ? smallAmtFeeBips
      : marketInfo?.feeBips ?? MAPFEEBIPS

  const calcDexOutput =
    sellToken && buyToken && localState.depth && marketInfo
      ? calcDexWrap<sdk.VaultMarket>({
          info: marketInfo as sdk.VaultMarket,
          input: localState.amount ?? '0',
          sell: sellToken.symbol,
          buy: buyToken.symbol,
          isAtoB: isLongOrShort === 'short',
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
            fixed: 6,
            removeTrailingZero: true,
          })} ${selectedTokenSymbol}`
        : `1 ${selectedTokenSymbol} ≈ ${numberFormat(localState.depth!.mid_price.toString(), {
            fixed: marketInfo!.precisionForPrice,
            removeTrailingZero: true,
          })} USDT`
    },
    (e) => {
      return EmptyValueTag
    },
  )

  const sellAmount =
    calcDexOutput?.amountS && calcDexOutput.amountS !== 'NaN' && sellToken
      ? numberFormat(calcDexOutput?.amountS, { fixed: sellToken.decimals })
      : undefined
  const sellAmountBN =
    sellToken && sellAmount ? utils.parseUnits(sellAmount, sellToken.decimals) : undefined

  const buyAmount =
    calcDexOutput?.amountB && calcDexOutput.amountB !== 'NaN' && buyToken
      ? numberFormat(calcDexOutput?.amountB, { fixed: buyToken.decimals })
      : undefined
  const buyAmountBN =
    buyToken && buyAmount ? utils.parseUnits(buyAmount, buyToken.decimals) : undefined

  const amounInUSDT = isLongOrShort === 'long' ? sellAmount : buyAmount

  const borrowRequired =
    sellToken && sellAmountBN
      ? sellAmountBN.gt(
          sellTokenAsset?.total && sellTokenAsset?.total !== 'NaN' ? sellTokenAsset?.total : 0,
        )
      : false

  const moreToBeBorrowedBN =
    sellToken && borrowRequired && sellAmountBN
      ? sellAmountBN
          .sub(sellTokenAsset?.total ?? 0)
          .div(
            utils.parseUnits('1', sellToken.decimals - sellToken.vaultTokenAmounts?.qtyStepScale),
          )
          .mul(
            utils.parseUnits('1', sellToken.decimals - sellToken.vaultTokenAmounts?.qtyStepScale),
          )
      : undefined

  const moreToBeBorrowed = moreToBeBorrowedBN
    ? utils.formatUnits(moreToBeBorrowedBN, sellToken?.decimals)
    : undefined

  const feeAmountBN = calcDexOutput?.amountBSlipped?.minReceived
    ? BigNumber.from(calcDexOutput?.amountBSlipped?.minReceived ?? 0)
        .mul(maxFeeBips)
        .div(10000)
    : undefined
  const feeAmount =
    feeAmountBN && buyToken ? utils.formatUnits(feeAmountBN, buyToken.decimals) : undefined
  const totalSellQuota = tryFn(
    () => {
      const value =
        isLongOrShort === 'long'
          ? new Decimal(
              utils.formatUnits(localState.depth!.asks_volTotal, LVUSDTInfo!.decimals),
            ).div(localState.depth!.mid_price)
          : new Decimal(
              utils.formatUnits(localState.depth!.bids_amtTotal, selectedVTokenInfo!.decimals),
            )
      return value.mul('0.99').toString()
    },
    () => undefined,
  )
  const totalTradeQuota = tryFn(
    () => {
      const value = new Decimal(
              utils.formatUnits(localState.depth!.bids_amtTotal, selectedVTokenInfo!.decimals),
            )
      return value.mul('0.99').toString()
    },
    () => undefined,
  )

  const maxSellValue = Decimal.min(userMaxSellValue ?? '0', totalSellQuota ?? '0').toString()
  const maxTradeValue = Decimal.min(userMaxTradeValue ?? '0', totalTradeQuota ?? '0').toString()

  const tradeMinAmt = tryFn(
    () => {
      const quoteMinAmtInfo = utils.formatUnits(
        marketInfo!.minTradeAmount.base,
        selectedVTokenInfo!.decimals,
      )
      const sellDust = utils.formatUnits(
        selectedVTokenInfo!.orderAmounts.dust,
        selectedVTokenInfo!.decimals,
      )
      return BigNumberJS.max(sellDust, quoteMinAmtInfo).toString()
    },
    () => undefined,
  )
  const tradeBtnStatus = (() => {
    if ((!tokenMap || !vaultTokenPrices) && sellToken) {
      return {
        label: undefined,
        disabled: true,
      }
    }
    if (!sellToken || !buyToken || !tradeMinAmt || !sellAmount) {
      return {
        label: undefined,
        disabled: true,
      }
    }
    const { account } = store.getState()
    const sellTokenSymbol = sellToken.symbol

    const tradeValue = localState.amount ?? '0'
    const sellExceed = maxTradeValue ? new Decimal(maxTradeValue).lt(tradeValue ?? 0) : false
    const amtValid = !!(
      tradeValue &&
      tradeMinAmt &&
      sdk.toBig(tradeValue).gte(tradeMinAmt) &&
      !sellExceed
    )

    const notEnough = userMaxTradeValue ? sdk.toBig(userMaxTradeValue).lt(tradeValue) : true

    if (localState.isSwapLoading || localState.swapStatus.status !== 'init') {
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
          const maxOrderSize = maxTradeValue + ' ' + sellTokenSymbol
          return {
            label: maxTradeValue ? `labelLimitMax| ${maxOrderSize}` : `labelVaultTradeInsufficient`,
            disabled: true,
          }
        } else if (
          borrowRequired &&
          localState.swapStatus.status === 'init' &&
          moreToBeBorrowedBN &&
          BigNumber.from(sellToken.vaultTokenAmounts?.minLoanAmount).gt(moreToBeBorrowedBN)
        ) {
          return {
            label: `labelTradeVaultMiniBorrow|${
              getValuePrecisionThousand(
                utils.formatUnits(sellToken.vaultTokenAmounts?.minLoanAmount, sellToken.decimals),
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
                  BigNumber.from(sellToken.vaultTokenAmounts?.minLoanAmount).add(
                    sellTokenAsset?.total ?? 0,
                  ),
                  sellToken.decimals,
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
            const minOrderSize =
              selectedVTokenInfo &&
              getValuePrecisionThousand(
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
          return {
            label: undefined,
            disabled: false,
          }
        }
      } else {
        return {
          label: undefined,
          disabled: false,
        }
      }
    }
  })()
  const myPositions = (() => {
    return _.keys(vaultLayer2)
      .map((symbol) => {
        const asset = vaultLayer2 ? vaultLayer2[symbol] : undefined
        const tokenInfo = tokenMap[symbol]
        if (!asset || !tokenInfo) return undefined
        const position = new Decimal(utils.formatUnits(asset.netAsset, tokenInfo.decimals))
        if (
          symbol === 'LVUSDT' ||
          position.isZero() ||
          (localState.hideOther && symbol !== selectedVTokenSymbol)
        )
          return undefined

        return {
          tokenSymbol: symbol.slice(2),
          longOrShort: position.isPos() ? 'long' : 'short',
          marginLevel: vaultAccountInfo?.marginLevel
            ? numberFormat(vaultAccountInfo.marginLevel, { fixed: 2 })
            : EmptyValueTag,
          leverage: vaultAccountInfo?.leverage + 'x',
          amount: numberFormat(position.abs().toString(), { fixed: tokenInfo.precision, removeTrailingZero: true }),
          // onClickLeverage: () => {},
          onClickTrade: () => {
            mainViewRef.current?.scrollTo(0, 0)
            setLocalState({
              ...localState,
              selectedToken: symbol.slice(2),
              amount: '',
              slideValue: 0,
            })
          },
          onClickClose: () => {
            setShowVaultCloseConfirm({ isShow: true, symbol: symbol })
            // closePosition(symbol)
            // .then(response2 => {
            //   if (response2?.operation.status === sdk.VaultOperationStatus.VAULT_STATUS_FAILED) {
            //     throw new Error('failed')
            //   }
            //   setShowGlobalToast({
            //     isShow: true,
            //     info: {
            //       content: 'Closed position successfully',
            //       type: ToastType.success
            //     }
            //   })
            // }).catch((e) => {
            //   setShowGlobalToast({
            //     isShow: true,
            //     info: {
            //       content: 'Close position failed',
            //       type: ToastType.error
            //     }
            //   })
            // }).finally(() => {
            //   updateVaultLayer2({})
            // })
            // setShowVaultCloseConfirm({
            //   isShow:true,
            //   symbol: symbol,
            // })
            // todo close position
          },
        }
      })
      .filter((item) => {
        return item !== undefined
      })
  })()

  const restartTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(() => {
      refreshRef.current && (refreshRef.current as any).firstElementChild.click()
    }, 10 * 1000)
    console.log('restartTimer', refreshRef.current)
    refreshRef.current && (refreshRef.current as any).firstElementChild.click()
  }
  const clearData = () => {
    setLocalState(initLocalState)
  }

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
        setLocalState((state) => ({
          ...state,
          swapStatus: {
            status: 'init',
          },
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
          swapStatus: { status: 'init' },
          isSwapLoading: false,
        }
      })

      // repay if needed
      setTimeout(() => {
        repayIfNeeded(selectedVTokenSymbol).then(() => {
          updateVaultLayer2({})
        })
      }, 500)
    }
  }
  const borrowSubmit = async () => {
    const { account } = store.getState()

    setLocalState((state) => ({
      ...state,
      swapStatus: {
        status: 'borrowing',
        borrowAmount: moreToBeBorrowed,
      },
      isSwapLoading: true,
    }))

    try {
      if (exchangeInfo && sellAmountBN && sellToken && moreToBeBorrowedBN) {
        const vaultBorrowRequest: sdk.VaultBorrowRequest = {
          accountId: account.accountId,
          token: {
            tokenId: sellToken.vaultTokenId as unknown as number,
            volume: moreToBeBorrowedBN.toString(),
          },
          timestamp: Date.now(),
        }
        let response = await LoopringAPI.vaultAPI?.submitVaultBorrow(
          {
            request: vaultBorrowRequest,
            privateKey: account.eddsaKey?.sk,
            apiKey: account.apiKey,
          },
          '1',
        )
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
                      borrowAmount: moreToBeBorrowed,
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
          swapStatus: { status: 'init' },
          isSwapLoading: false,
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
            { fixed: buyToken!.precision, removeTrailingZero: true },
          )
        },
        () => '0',
      )
      setShowSmallTradePrompt({
        show: true,
        feePercentage: maxFeeBips ? new Decimal(maxFeeBips).div('100').toFixed(2) : '',
        estimatedFee: feeAmount + ' ' + buyTokenOriginSymbol,
        minimumConverted: minimumConverted + ' ' + buyTokenOriginSymbol,
      })
      return
    }

    if (borrowRequired) {
      borrowSubmit()
    } else {
      swapSubmit()
    }
  }

  const vaultLayer2Callback = () => {
    if (store.getState().account.readyState !== AccountStatus.ACTIVATED) {
      clearData()
    }
  }

  React.useEffect(() => {
    if (isShowVaultSwap.isShow && refreshRef.current) {
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
  }, [isShowVaultSwap?.isShow, refreshRef.current])
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
          depth: { ...btradeOrderbookMap[item.wsMarket], symbol: localState.depth.symbol },
        })
        myLog('useVaultSwap: depth', btradeOrderbookMap[item.wsMarket])
      }
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [market])

  

  

  useL2CommonSocket({ vaultLayer2Callback })

  
  

  const vaultSwapModalProps = {
    onClickCloseAll: () => {
      setShowVaultExit({ isShow: true })
    },
    mainViewRef,
    open: isShowVaultSwap.isShow,
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
        // debugger
        if (customSlippage && customSlippage !== 'N') {
          setSlippage(customSlippage)
        } else {
          setSlippage(slippage)
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
    isLongOrShort: isLongOrShort,
    onClickBalance: () => {
      userMaxTradeValueWithoutBorrow &&
        setLocalState({
          ...localState,
          amount: numberFormat(userMaxTradeValueWithoutBorrow, {
            fixed: selectedVTokenInfo!.vaultTokenAmounts.qtyStepScale,
            removeTrailingZero: true,
            fixedRound: Decimal.ROUND_FLOOR,
          }),
        })
    },
    onClickMax: () => {
      maxTradeValue &&
        setLocalState({
          ...localState,
          amount: numberFormat(maxTradeValue, {
            fixed: selectedVTokenInfo?.vaultTokenAmounts.qtyStepScale,
            fixedRound: Decimal.ROUND_FLOOR,
            removeTrailingZero: true,
          }),
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
        if (new Decimal(userMaxSellValueWithoutBorrow!).lessThanOrEqualTo('0'))
          return '0 ' + sellTokenOriginSymbol
        return (
          numberFormatThousandthPlace(userMaxSellValueWithoutBorrow!, {
            fixed: sellToken!.vaultTokenAmounts.qtyStepScale,
            removeTrailingZero: true,
            fixedRound: Decimal.ROUND_FLOOR,
          }) +
          ' ' +
          sellTokenOriginSymbol
        )
      },
      () => {
        return EmptyValueTag + ' ' + sellTokenOriginSymbol
      },
    ),
    token: {
      symbol: selectedTokenSymbol,
      coinJSON: coinJson[selectedTokenSymbol],
    },
    onInputAmount: (amount: string) => {
      if (
        amount &&
        (!isNumberStr(amount) ||
          !selectedVTokenInfo ||
          !strNumDecimalPlacesLessThan(
            amount,
            selectedVTokenInfo.vaultTokenAmounts.qtyStepScale + 1,
          ))
      )
        return
      setLocalState({
        ...localState,
        slideValue: 0,
        amount,
      })
    },
    inputPlaceholder: tradeMinAmt
      ? `Min ${numberFormat(tradeMinAmt, {
          fixed: selectedVTokenInfo?.vaultTokenAmounts.qtyStepScale,
          removeTrailingZero: true,
          fixedRound: Decimal.ROUND_CEIL,
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
    amounInUSDT: amounInUSDT
      ? numberFormatThousandthPlace(amounInUSDT, {
          fixed: LVUSDTInfo?.vaultTokenAmounts.qtyStepScale,
          removeTrailingZero: true,
        }) + ' USDT'
      : EmptyValueTag + ' USDT',
    maxTradeValue: tryFn(
      () => {
        return (
          numberFormatThousandthPlace(maxSellValue, {
            fixed: sellToken?.vaultTokenAmounts.qtyStepScale,
            fixedRound: Decimal.ROUND_FLOOR,
            removeTrailingZero: true,
          }) +
          ' ' +
          sellTokenOriginSymbol
        )
      },
      () => EmptyValueTag + ' ' + sellTokenOriginSymbol,
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
    moreToBeBorrowed: tryFn(
      () => {
        return (
          numberFormatThousandthPlace(moreToBeBorrowed!, {
            fixed: sellToken!.vaultTokenAmounts.qtyStepScale,
            fixedRound: Decimal.ROUND_CEIL,
            removeTrailingZero: true,
          }) +
          ' ' +
          sellTokenOriginSymbol
        )
      },
      () => EmptyValueTag,
    ),
    totalQuota: tryFn(
      () =>
        numberFormatThousandthPlace(totalSellQuota!, {
          fixed: sellToken?.vaultTokenAmounts.qtyStepScale,
          fixedRound: Decimal.ROUND_FLOOR,
          removeTrailingZero: true,
        }) +
        ' ' +
        sellTokenOriginSymbol,
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
      label: tradeBtnStatus.label ? tWrap(t, tradeBtnStatus.label) : undefined,
      loading: localState.isSwapLoading,
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
        slideValue: 0,
        amount: ''
      })
      restartTimer()
    },
    myPositions,
    leverageSelection: {
      value: vaultAccountInfo?.leverage,
      onChange: async (value: string) => {
        await LoopringAPI.vaultAPI
          ?.submitLeverage(
            {
              request: {
                accountId: account.accountId.toString(),
                leverage: value,
              },
              apiKey: account.apiKey,
            },
            '1',
          )
          .finally(() => {
            refreshData()
          })
      },
      items: maxLeverage
        ? _.range(1, Number(maxLeverage) + 1).map((leverage: number) => ({
            label: `${leverage}x`,
            value: leverage.toString(),
          }))
        : [],
    },
    positionTypeSelection: {
      value: 'cross',
      onChange: () => {},
      items: [
        {
          label: 'Cross Position',
          value: 'cross',
          tooltipTitle:
            'All positions within this account share a single health factor, determined by the real-time prices of your collateral, holdings, and debts. If the health factor falls below the liquidation threshold, all positions under this account are subject to liquidation.',
        },
      ],
    },
    ratioSlider: {
      currentRatio: localState.slideValue,
      onClickRatio: (no: number) => {
        if (!maxTradeValue || new Decimal(maxTradeValue).eq('0')) return
        setLocalState((state) => {
          return {
            ...state,
            amount: new Decimal(maxTradeValue)
              .mul(new Decimal(no))
              .toDecimalPlaces(selectedVTokenInfo?.vaultTokenAmounts.qtyStepScale)
              .toString(),
            slideValue: no,
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
        tokenMap
          ? _.keys(tokenMap)
              .map((symbol) => {
                const asset = vaultLayer2 ? vaultLayer2[symbol] : undefined
                const tokenInfo = tokenMap[symbol]
                return tokenInfo
                  ? {
                      symbol: symbol.slice(2),
                      amount: numberFormatThousandthPlace(
                        utils.formatUnits(asset?.total ?? '0', tokenInfo.decimals),
                        { fixed: tokenInfo.precision, removeTrailingZero: true },
                      ),
                      coinJSON: coinJson[symbol.slice(2)],
                      onClick: () => {
                        setLocalState({
                          ...localState,
                          showTokenSelection: false,
                          selectedToken: symbol === 'LVUSDT' ? 'ETH' : symbol.slice(2),
                          tokenSelectionInput: '',
                          amount: '',
                          slideValue: 0,
                          depth: undefined,
                        })
                        setTimeout(() => {
                          restartTimer()  
                        }, 100);
                      },
                    }
                  : undefined
              })
              .filter(
                (item) =>
                  item !== undefined &&
                  !['USDT', 'LRTAIKO'].includes(item?.symbol) &&
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
          amount: '',

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
  console.log('useVaultSwap output', isShowVaultSwap, localState, vaultSwapModalProps, {
    tokenMap,
    vaultLayer2,
    marketMap,
  })
  return {
    vaultSwapModalProps,
    smallOrderAlertProps,
    toastProps,
  }
}
