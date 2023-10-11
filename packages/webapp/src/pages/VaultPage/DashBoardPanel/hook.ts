import React from 'react'
import {
  makeVaultLayer2,
  store,
  useAccount,
  useBtnStatus,
  useSystem,
  useTokenMap,
  useTokenPrices,
  useVaultLayer2,
  useWalletLayer2,
  useWalletLayer2Socket,
  volumeToCountAsBigNumber,
} from '@loopring-web/core'
import { useSettings, VaultAssetsTableProps } from '@loopring-web/component-lib'
import {
  AssetsRawDataItem,
  EmptyValueTag,
  globalSetup,
  myLog,
  SagaStatus,
  TokenType,
  TradeBtnStatus,
} from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'
import _ from 'lodash'

export const useGetVaultAssets = (): VaultAssetsTableProps & { totalAsset: string } => {
  const [assetsRawData, setAssetsRawData] = React.useState<AssetsRawDataItem[]>([])
  const [totalAsset, setTotalAsset] = React.useState<string>('0')
  const { status: accountStatus, account } = useAccount()
  const { vaultAccountInfo, status: vaultAccountInfoStatus, updateVaultLayer2 } = useVaultLayer2()
  const { allowTrade, forexMap } = useSystem()
  const { status: tokenPriceStatus } = useTokenPrices()
  const { btnStatus: assetBtnStatus, enableBtn, setLoadingBtn } = useBtnStatus()
  const {
    themeMode,
    currency,
    hideL2Assets,
    hideSmallBalances,
    setHideSmallBalances,
    setHideL2Assets,
  } = useSettings()
  const { status: walletL2Status } = useWalletLayer2()
  const { marketArray } = useTokenMap()
  const getAssetsRawData = () => {
    myLog('assetsRawData', 'getAssetsRawData')
    const {
      tokenPrices: { tokenPrices },
      tokenMap: { tokenMap },
      // amm: {
      //   ammMap: { ammMap },
      // },
    } = store.getState()
    const walletMap = makeVaultLayer2({ needFilterZero: true }).vaultLayer2Map ?? {}
    const tokenPriceList = tokenPrices
      ? Object.entries(tokenPrices).map((o) => ({
          token: o[0],
          detail: o[1],
        }))
      : []
    if (
      tokenMap &&
      !!Object.keys(tokenMap).length &&
      !!Object.keys(walletMap ?? {}).length &&
      !!tokenPriceList.length
    ) {
      let totalAssets = sdk.toBig(0)
      let data: Array<any> = Object.keys(tokenMap ?? {}).reduce((pre, key, _index) => {
        let item: any = undefined
        // tokenInfo
        if (walletMap && walletMap[key]) {
          let tokenInfo = {
            token: key,
            detail: walletMap[key],
          }
          let tokenValueDollar = sdk.toBig(0)

          const totalAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail?.total ?? 0,
          )
          // ?.plus(depositAmount || 0)
          // .plus(withdrawAmount || 0)
          // ?.plus(depositAmount || 0)
          // .plus(withdrawAmount || 0)
          const price = tokenPrices?.[tokenInfo.token] || 0
          if (totalAmount && price) {
            tokenValueDollar = totalAmount?.times(price)
          }
          const isSmallBalance = tokenValueDollar.lt(1)
          item = {
            token: {
              type: TokenType.vault,
              value: tokenInfo.token,
            },
            // amount: getThousandFormattedNumbers(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total as string)) || EmptyValueTag,
            amount: totalAmount?.toString() || EmptyValueTag,
            // available: getThousandFormattedNumbers(Number(tokenInfo.detail?.count)) || EmptyValueTag,
            available: Number(tokenInfo.detail?.count) || EmptyValueTag,
            smallBalance: isSmallBalance,
            tokenValueDollar: tokenValueDollar.toString(),
            name: tokenInfo.token,
          }
        } else {
          item = {
            token: {
              type: TokenType.vault,
              value: key,
            },
            amount: EmptyValueTag,
            available: EmptyValueTag,
            locked: 0,
            smallBalance: true,
            tokenValueDollar: 0,
            name: key,
            tokenValueYuan: 0,
          }
        }
        if (item) {
          const token = item.token.value
          let precision = tokenMap[item.token.value].precision

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

  myLog('assetsRawData')
  return {
    rawData: assetsRawData,
    hideL2Assets,
    marketArray,
    allowTrade,
    setHideL2Assets,
    setHideSmallBalances,
    themeMode,
    getTokenRelatedMarketArray,
    hideSmallBalances,
    showFilter: true,
    totalAsset,
  }
}
