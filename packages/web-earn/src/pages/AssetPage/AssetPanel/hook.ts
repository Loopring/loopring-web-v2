import React from 'react'
import {
  fiatNumberDisplay,
  LoopringAPI,
  makeWalletLayer2,
  makeWalletLayer2NoStatus,
  networkById,
  numberStringListSum,
  store,
  useAccount,
  useBtnStatus,
  useConfig,
  useDefiMap,
  useModalData,
  useSystem,
  useTokenMap,
  useTokenPrices,
  useWalletLayer2,
  useWalletLayer2Socket,
  volumeToCountAsBigNumber,
} from '@loopring-web/core'
import {
  AssetTitleProps,
  TransactionTradeViews,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import {
  AssetsRawDataItem,
  CurrencyToTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  InvestAssetRouter,
  PriceTag,
  RecordTabIndex,
  RouterPath,
  SagaStatus,
  TabOrderIndex,
  TokenType,
  TradeBtnStatus,
  VaultKey,
} from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'
import { omitBy } from 'lodash'
import Decimal from 'decimal.js'

import _ from 'lodash'
import { parseRabbitConfig2 } from '@loopring-web/core/src/hooks/help/parseRabbitConfig'

export type AssetPanelProps<R = AssetsRawDataItem> = {
  assetsRawData: R[]
  hideL2Assets: any
  onSend: any
  onReceive: any
  marketArray: any
  hideInvestToken: any
  allowTrade: any
  setHideL2Assets: (value: boolean) => void
  setHideLpToken: any
  setHideSmallBalances: any
  themeMode: any
  getTokenRelatedMarketArray: any
  hideSmallBalances: any
  assetBtnStatus: TradeBtnStatus
  totalAvailableInCurrency: string
  totalFrozenInCurrency: string
}
export const useGetAssets = (): AssetPanelProps & {
  assetTitleProps: any
  assetTitleMobileExtendProps: any
} => {
  // const [assetsMap, setAssetsMap] = React.useState<{ [key: string]: any }>({})
  const [assetsRawData, setAssetsRawData] = React.useState<AssetsRawDataItem[]>([])
  const [totalAsset, setTotalAsset] = React.useState<string>('0')
  const { account } = useAccount()
  const { allowTrade, forexMap, chainId } = useSystem()
  const { status: tokenPriceStatus } = useTokenPrices()
  const { btnStatus: assetBtnStatus, enableBtn } = useBtnStatus()
  const {
    setShowAccount,
    setShowDeposit,
    setShowWithdraw,
    setShowBridge,
    modals: { isShowAccount },
  } = useOpenModals()
  const { resetDepositData, resetWithdrawData } = useModalData()
  const {
    themeMode,
    currency,
    hideL2Assets,
    hideInvestToken,
    hideSmallBalances,
    setHideLpToken,
    setHideSmallBalances,
    setHideL2Assets,
  } = useSettings()
  const { status: walletL2Status } = useWalletLayer2()

  const { marketArray } = useTokenMap()
  const { marketCoins: defiCoinArray } = useDefiMap()
  const getAssetsRawData = () => {
    const {
      tokenPrices: { tokenPrices },
      tokenMap: { tokenMap: tokenMapRaw },
      amm: {
        ammMap: { ammMap },
      },
    } = store.getState()
    const tokenPriceList = tokenPrices
      ? Object.entries(tokenPrices).map((o) => ({
          token: o[0],
          detail: o[1],
        }))
      : []
    const { walletMap } = makeWalletLayer2NoStatus({ needFilterZero: false })
    const tokenMap = omitBy(tokenMapRaw, (token) => token.isLpToken)
    if (
      tokenMap &&
      !!Object.keys(tokenMap).length &&
      !!Object.keys(walletMap ?? {}).length &&
      !!tokenPriceList.length
    ) {
      let totalAssets = sdk.toBig(0)
      let data: Array<any> = Object.keys(tokenMap ?? {}).reduce((pre, key, _index) => {
        let item: any = undefined
        const isDefi = [...(defiCoinArray ? defiCoinArray : [])].includes(key)
        // tokenInfo
        if (walletMap && walletMap[key]) {
          let tokenInfo = {
            token: key,
            detail: walletMap[key],
          }
          let tokenValueDollar = sdk.toBig(0)
          const withdrawAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail?.pending?.withdraw ?? 0,
          )
          const depositAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail?.pending?.deposit ?? 0,
          )

          const totalAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail?.total ?? 0,
          )
            ?.plus(depositAmount || 0)
            .plus(withdrawAmount || 0)
          // ?.plus(depositAmount || 0)
          // .plus(withdrawAmount || 0)
          const price = tokenPrices?.[tokenInfo.token] || 0
          if (totalAmount && price) {
            tokenValueDollar = totalAmount?.times(price)
          }
          const isSmallBalance = tokenValueDollar.lt(1)
          const lockedAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail?.locked ?? 0,
          )
          const frozenAmount = lockedAmount?.plus(withdrawAmount || 0).plus(depositAmount || 0)
          item = {
            token: {
              type: isDefi
                ? TokenType.defi
                : tokenInfo.token.split('-')[0] === 'LP'
                ? TokenType.lp
                : TokenType.single,
              value: tokenInfo.token,
            },
            // amount: getThousandFormattedNumbers(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total as string)) || EmptyValueTag,
            amount: totalAmount?.toString() || EmptyValueTag,
            // available: getThousandFormattedNumbers(Number(tokenInfo.detail?.count)) || EmptyValueTag,
            available: Number(tokenInfo.detail?.count) || EmptyValueTag,
            // locked: String(volumeToCountAsBigNumber(tokenInfo.token, tokenInfo.detail?.detail.locked)) || EmptyValueTag,
            locked: frozenAmount?.toString() || EmptyValueTag,
            smallBalance: isSmallBalance,
            tokenValueDollar: tokenValueDollar.toString(),
            name: tokenInfo.token,
            withdrawAmount: withdrawAmount?.toString(),
            depositAmount: depositAmount?.toString(),
          }
        } else {
          item = {
            token: {
              type: isDefi
                ? TokenType.defi
                : key.split('-')[0] === 'LP'
                ? TokenType.lp
                : TokenType.single,
              value: key,
            },
            amount: EmptyValueTag,
            available: EmptyValueTag,
            locked: 0,
            smallBalance: true,
            tokenValueDollar: 0,
            name: key,
            tokenValueYuan: 0,
            withdrawAmount: 0,
            depositAmount: 0,
          }
        }
        if (item) {
          const token = item.token.value
          let precision = 0
          if (token.split('-').length === 3 && ammMap) {
            const rawList = token.split('-')
            rawList.splice(0, 1, 'AMM')
            const ammToken = rawList.join('-')
            precision =
              ammMap[ammToken]?.precisions?.amount ?? tokenMap[item.token.value]?.precision ?? 0
          } else {
            precision = tokenMap[item.token.value].precision
          }
          pre.push({
            ...item,
            precision: precision,
          })
          totalAssets = totalAssets.plus(
            sdk.toBig(item.tokenValueDollar)
            // .times(forexMap[currency] ?? 0),
          )
          // totalAssets = totalAssets.plus(sdk.toBig(item.tokenValueDollar).times(forexMap[currency] ?? 0))
        }
        pre?.sort((a, b) => {
          const deltaDollar = b.tokenValueDollar - a.tokenValueDollar
          const deltaAmount = sdk.toBig(b.amount).minus(a.amount).toNumber()
          const deltaName = b.token.value < a.token.value ? 1 : -1
          return deltaDollar !== 0 ? deltaDollar : deltaAmount !== 0 ? deltaAmount : deltaName
        })
        return pre
      }, [] as Array<any>)
      setAssetsRawData(data)
      setTotalAsset(totalAssets.toString())
    }
  }
  const startWorker = _.debounce(getAssetsRawData, globalSetup.wait)

  React.useEffect(() => {
    if (
      tokenPriceStatus === SagaStatus.UNSET &&
      walletL2Status === SagaStatus.UNSET &&
      assetsRawData.length &&
      assetBtnStatus !== TradeBtnStatus.AVAILABLE
    ) {
      enableBtn()
    }
  }, [walletL2Status, assetsRawData, tokenPriceStatus, assetBtnStatus])
  React.useEffect(() => {
    setTotalAsset('0')
  }, [account.accAddress, chainId])
  const walletLayer2Callback = React.useCallback(() => {
    startWorker()
  }, [])
  useWalletLayer2Socket({ walletLayer2Callback })
  const getTokenRelatedMarketArray = React.useCallback((token: string) => {
    const { marketArray, marketMap } = store.getState().tokenMap
    if (!marketArray) return []
    return marketArray.filter((market) => {
      const marketInfo = marketMap?.[market]
      if (!marketInfo?.enabled) return false
      const [coinA, coinB] = market.split('-')
      return token === coinA || token === coinB
    })
  }, [])

  const onReceive = React.useCallback(
    (token?: any) => {
      setShowAccount({
        isShow: false,
        info: { lastFailed: undefined },
      })
      if (isShowAccount?.info?.symbol) {
        resetDepositData()
      }
      setShowDeposit({
        isShow: true,
        symbol: token,
      })
    },
    [setShowAccount],
  )
  const onSend = React.useCallback(
    (token?: any) => {
      setShowAccount({
        isShow: false,
        info: { lastFailed: undefined },
      })
      if (isShowAccount?.info?.symbol) {
        resetWithdrawData()
      }
      setShowWithdraw({
        isShow: true,
        symbol: token,
        info: { isToMyself: true },
      })
    },
    [setShowAccount],
  )

  const onClickBridge = React.useCallback(
    (token?: any) => {
      setShowAccount({
        isShow: false,
        info: { lastFailed: undefined },
      });
      setShowBridge({
        isShow: true,
        info: undefined
      });
    },
    [setShowAccount, setShowBridge],
  );
  const { tokenPrices } = useTokenPrices()
  const {defaultNetwork} = useSettings()
  const {fastWithdrawConfig} = useConfig()
  const {idIndex}=useTokenMap()
  const fromNetwork = networkById(defaultNetwork)
  const parsedConfig = fromNetwork 
    ? parseRabbitConfig2(fastWithdrawConfig, fromNetwork, idIndex)
    : undefined
  const hasToOtherNetwork = parsedConfig?.toOtherNetworks?.find(item => item.network !== fromNetwork)
  const isTaiko = [sdk.ChainId.TAIKO, sdk.ChainId.TAIKOHEKLA].includes(defaultNetwork )
  
  const assetTitleProps: AssetTitleProps = {
    setHideL2Assets,
    assetInfo: {
      totalAsset,
      priceTag: PriceTag[CurrencyToTag[currency]],
    },
    accountId: account.accountId,
    hideL2Assets,
    onShowReceive: onReceive,
    onShowSend: onSend,
    onClickBridge,
    showBridgeBtn: isTaiko && hasToOtherNetwork,
  } as any
  const assetTitleMobileExtendProps = {
    btnShowNFTDepositStatus: TradeBtnStatus.AVAILABLE,
    btnShowNFTMINTStatus: TradeBtnStatus.AVAILABLE,
  }
  
  
  return {
    assetTitleProps,
    assetTitleMobileExtendProps,
    assetsRawData: assetsRawData.map((asset) => {
      return isTaiko && asset.name === 'TAIKO'
        ? { ...asset, hideDepositButton: true }
        : isTaiko && asset.name === 'LRTAIKO'
        ? { ...asset, hideDepositButton: true, hideWithdrawButton: true }
        : asset
    }),
    assetBtnStatus,
    hideL2Assets,
    onSend,
    onReceive,
    marketArray,
    hideInvestToken,
    allowTrade,
    setHideL2Assets,
    setHideLpToken,
    setHideSmallBalances,
    themeMode,
    getTokenRelatedMarketArray,
    hideSmallBalances,
    totalAvailableInCurrency:
      forexMap[currency] &&
      fiatNumberDisplay(
        new Decimal(forexMap[currency])
          .mul(
            numberStringListSum(
              assetsRawData.map((asset) => {
                try {
                  return new Decimal(asset.available.toString())
                    .mul(tokenPrices[asset.name])
                    .toString()
                } catch {
                  return '0'
                }
              }),
            ),
          )
          .toString(),
        currency,
      ),
    totalFrozenInCurrency:
      forexMap[currency] &&
      fiatNumberDisplay(
        new Decimal(forexMap[currency])
          .mul(
            numberStringListSum(
              assetsRawData.map((asset) => {
                try {
                  return new Decimal(asset.locked).mul(tokenPrices[asset.name]).toString()
                } catch {
                  return '0'
                }
              }),
            ),
          )
          .toString(),
        currency,
      ),
  }
}
export const useAssetAction = () => {
  const [tokenLockDetail, setTokenLockDetail] = React.useState<
    | undefined
    | {
        list: any[]
        row: any
      }
  >(undefined)
  const onTokenLockHold = async (_item) => {
    setTokenLockDetail(undefined)
    const {
      account,
      tokenMap: { tokenMap },
    } = store.getState()
    if (LoopringAPI.userAPI && account.accountId) {
      const response = await LoopringAPI.userAPI.getUserLockSummary(
        {
          accountId: account.accountId,
          tokenId: tokenMap[_item.name].tokenId,
          // @ts-ignore
          lockTags: [
            sdk.LOCK_TYPE.DUAL_CURRENCY,
            sdk.LOCK_TYPE.DUAL_BASE,
            sdk.LOCK_TYPE.BTRADE,
            sdk.LOCK_TYPE.L2STAKING,
            sdk.LOCK_TYPE.STOP_LIMIT,
            sdk.LOCK_TYPE.VAULT_COLLATERAL,
            sdk.LOCK_TYPE.TAIKO_FARMING
          ].join(','),
        } as any,
        account.apiKey,
      )

      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
      } else {
        setTokenLockDetail(() => {

          // merge l2Staking and taikoFarming to single record
          const isL2StakingTaiko = (record) => record.lockTag === sdk.LOCK_TYPE.L2STAKING && tokenMap[_item.name].symbol === 'TAIKO'
          const isTaikoFarming = (record) => record.lockTag === sdk.LOCK_TYPE.TAIKO_FARMING
          const l2Staking = response.lockRecord.find(isL2StakingTaiko)
          const taikoFarming = response.lockRecord.find(isTaikoFarming)
          const taikoFarmingMerge = taikoFarming ? {
            ...taikoFarming,
            amount: sdk.toBig(taikoFarming.amount).plus(l2Staking ? l2Staking.amount : '0').toString()
          } : l2Staking ? {
            ...l2Staking,
            lockTag: sdk.LOCK_TYPE.TAIKO_FARMING
          } : undefined
          const lockRecord = response.lockRecord
            .filter((record) => !isL2StakingTaiko(record) && !isTaikoFarming(record))
            .concat(taikoFarmingMerge ? [taikoFarmingMerge] : [])

          const sum: { key: string; value: string; link: string }[] = lockRecord.reduce(
            // @ts-ignore
            (prev, record) => {
              const amount = sdk
                .toBig(record.amount)
                .div('1e' + tokenMap[_item.name].decimals)
                .toString()
              prev[0] = {
                ...prev[0],
                value: sdk.toBig(prev[0].value?.replaceAll(sdk.SEP, '')).minus(amount).toString(),
              }
              let link = ''
              switch (record.lockTag) {
                case sdk.LOCK_TYPE.DUAL_CURRENCY:
                  link = `/#${RouterPath.investBalance}/${InvestAssetRouter.DUAL}`
                  break
                case sdk.LOCK_TYPE.DUAL_BASE:
                  link = `/#${RouterPath.investBalance}/${InvestAssetRouter.DUAL}`
                  break
                case sdk.LOCK_TYPE.L2STAKING: {
                  if (tokenMap[_item.name].symbol === 'TAIKO') {
                    link = `/#/taiko-farming`
                  } else {
                    link = `/#${RouterPath.investBalance}/${InvestAssetRouter.STAKELRC}`
                  }
                  break
                }
                case sdk.LOCK_TYPE.BTRADE:
                  link = `/#${RouterPath.l2records}/${RecordTabIndex.BtradeSwapRecords}`
                  break
                case sdk.LOCK_TYPE.STOP_LIMIT:
                  link = `/#${RouterPath.l2records}/${RecordTabIndex.Orders}/${TabOrderIndex.orderOpenTable}`
                  break
                case sdk.LOCK_TYPE.VAULT_COLLATERAL:
                  link = `/#${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}`
                  break
                case sdk.LOCK_TYPE.TAIKO_FARMING:
                  link = `/#/taiko-farming`
                  break
              }
              const key = record.lockTag === 'L2STAKING' && _item.name === 'TAIKO'
                ? 'labelL2TaikoFarming'
                : `label${record.lockTag}`
              prev.push({
                key: key,
                value: getValuePrecisionThousand(
                  amount,
                  tokenMap[_item.name].precision,
                  tokenMap[_item.name].precision,
                  undefined,
                ),
                link,
              })
              return prev
            },
            [
              {
                key: `labelMarketOrderUnfilled`,
                value: sdk
                  .toBig(_item.locked ?? '0')
                  .minus(_item?.withdrawAmount ?? 0)
                  .minus(_item?.depositAmount ?? 0)
                  .toString(),
                link: `/#${RouterPath.l2records}/${RecordTabIndex.Orders}/${TabOrderIndex.orderOpenTable}`,
              },
              ...(sdk.toBig(_item?.depositAmount ?? 0).gt(0)
                ? [
                    {
                      key: `labelDepositPending`,
                      value: sdk.toBig(_item?.depositAmount ?? '0').toString(),
                      link: `/#${RouterPath.l2records}/${RecordTabIndex.Transactions}/?types=${TransactionTradeViews.receive}&searchValue=${_item.name}`,
                    },
                  ]
                : []),
              ...(sdk.toBig(_item?.withdrawAmount ?? 0).gt(0)
                ? [
                    {
                      key: `labelWithDrawPending`,
                      value: sdk.toBig(_item?.withdrawAmount ?? '0').toString(),
                      link: `/#${RouterPath.l2records}/${RecordTabIndex.Transactions}/?types=${TransactionTradeViews.send}&searchValue=${_item.name}`,
                    },
                  ]
                : []),
            ] as { key: string; value: string; link: string }[],
          )
          if (_item.locked && sdk.toBig(sum[0].value).gt(0)) {
            sum[0] = {
              ...sum[0],
              value: getValuePrecisionThousand(
                sum[0].value,
                tokenMap[_item.name].precision,
                tokenMap[_item.name].precision,
                undefined,
              ),
            }
          } else {
            sum.shift()
          }

          return {
            list: sum,
            row: _item,
          }
        })
      }
    }
  }
  return {
    tokenLockDetail,
    onTokenLockHold,
  }
}
