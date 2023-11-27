import React from 'react'
import {
  LoopringAPI,
  makeWalletLayer2,
  store,
  useAccount,
  useBtnStatus,
  useDefiMap,
  useTokenMap,
  useTokenPrices,
  useWalletLayer2,
  useWalletLayer2Socket,
  volumeToCountAsBigNumber,
  useSystem,
} from '@loopring-web/core'
import {
  AccountStep,
  AssetTitleProps,
  TransactionTradeViews,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  AssetsRawDataItem,
  CurrencyToTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  globalSetup,
  InvestAssetRouter,
  myLog,
  PriceTag,
  RecordTabIndex,
  RouterPath,
  SagaStatus,
  TabOrderIndex,
  TokenType,
  TradeBtnStatus,
} from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'
import _ from 'lodash'

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
}
export const useGetAssets = (): AssetPanelProps & {
  assetTitleProps: any
  assetTitleMobileExtendProps: any
} => {
  // const [assetsMap, setAssetsMap] = React.useState<{ [key: string]: any }>({})
  const [assetsRawData, setAssetsRawData] = React.useState<AssetsRawDataItem[]>([])
  const [totalAsset, setTotalAsset] = React.useState<string>('0')
  const { account } = useAccount()
  const { allowTrade, forexMap } = useSystem()
  const { status: tokenPriceStatus } = useTokenPrices()
  const { btnStatus: assetBtnStatus, enableBtn, setLoadingBtn } = useBtnStatus()
  const { setShowAccount } = useOpenModals()
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
    myLog('assetsRawData', 'getAssetsRawData')
    const {
      tokenPrices: { tokenPrices },
      tokenMap: { tokenMap },
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
    const { walletMap } = makeWalletLayer2({ needFilterZero: false })

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
            sdk.toBig(item.tokenValueDollar).times(forexMap[currency] ?? 0),
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
    if (account.readyState === AccountStatus.ACTIVATED) {
      // sendSocketTopic({ [WsTopicType.account]: true })
      myLog('setLoadingBtn setLoadingBtn', assetBtnStatus)
      setLoadingBtn()
    }
    return () => {
      startWorker.cancel()
    }
  }, [account.readyState])

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
  const walletLayer2Callback = React.useCallback(() => {
    startWorker()
  }, [])
  useWalletLayer2Socket({ walletLayer2Callback })
  const getTokenRelatedMarketArray = React.useCallback((token: string) => {
    const { marketArray } = store.getState().tokenMap
    if (!marketArray) return []
    return marketArray.filter((market) => {
      const [coinA, coinB] = market.split('-')
      return token === coinA || token === coinB
    })
  }, [])

  const onReceive = React.useCallback(
    (token?: any) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.AddAssetGateway,
        info: token ? { symbol: token } : undefined,
      })
    },
    [setShowAccount],
  )
  const onSend = React.useCallback(
    (token?: any, isToL1?: boolean) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.SendAssetGateway,
        info: token || isToL1 ? { symbol: token, isToL1 } : undefined,
      })
    },
    [setShowAccount],
  )

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
  } as any
  const assetTitleMobileExtendProps = {
    btnShowNFTDepositStatus: TradeBtnStatus.AVAILABLE,
    btnShowNFTMINTStatus: TradeBtnStatus.AVAILABLE,
  }

  return {
    assetTitleProps,
    assetTitleMobileExtendProps,
    assetsRawData,
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
          ].join(','),
        } as any,
        account.apiKey,
      )

      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
      } else {
        setTokenLockDetail(() => {
          // @ts-ignore
          const sum: { key: string; value: string; link: string }[] = response.lockRecord.reduce(
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
                case sdk.LOCK_TYPE.L2STAKING:
                  link = `/#${RouterPath.investBalance}/${InvestAssetRouter.STAKELRC}`
                  break
                case sdk.LOCK_TYPE.BTRADE:
                  link = `/#${RouterPath.l2records}/${RecordTabIndex.BtradeSwapRecords}`
                  break
                case sdk.LOCK_TYPE.STOP_LIMIT:
                  link = `/#${RouterPath.l2records}/${RecordTabIndex.Orders}/${TabOrderIndex.orderOpenTable}`
                  break
              }
              prev.push({
                key: `label${record.lockTag}`,
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
