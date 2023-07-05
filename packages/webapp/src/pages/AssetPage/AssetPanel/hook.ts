import React from 'react'
import {
  LoopringAPI,
  makeWalletLayer2,
  store,
  useAccount,
  useBtnStatus,
  useDefiMap,
  useSocket,
  useSystem,
  useTokenMap,
  useTokenPrices,
  useWalletLayer2,
  useWalletLayer2Socket,
  volumeToCountAsBigNumber,
} from '@loopring-web/core'
import {
  AccountStep,
  AssetTitleProps,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import {
  AccountStatus,
  AssetsRawDataItem,
  CurrencyToTag,
  EmptyValueTag,
  getValuePrecisionThousand,
  myLog,
  PriceTag,
  SagaStatus,
  TokenType,
  TradeBtnStatus,
  YEAR_DAY_FORMAT,
} from '@loopring-web/common-resources'

import * as sdk from '@loopring-web/loopring-sdk'
import { WsTopicType } from '@loopring-web/loopring-sdk'

import BigNumber from 'bignumber.js'
import moment from 'moment'

export type AssetPanelProps<R = AssetsRawDataItem> = {
  assetsRawData: R[]
  account: any
  hideL2Assets: any
  onSend: any
  onReceive: any
  marketArray: any
  userAssets: any
  getUserAssets: any
  hideInvestToken: any
  allowTrade: any
  setHideL2Assets: (value: boolean) => void
  setHideLpToken: any
  setHideSmallBalances: any
  themeMode: any
  getTokenRelatedMarketArray: any
  hideSmallBalances: any
  assetBtnStatus: TradeBtnStatus
  onTokenLockHold: (item: R) => void
  tokenLockDetail:
    | undefined
    | {
    list: any[]
    row: any
  }
}
export const useGetAssets = (): AssetPanelProps & {
  assetTitleProps: any
  assetTitleMobileExtendProps: any
} => {
  const [assetsMap, setAssetsMap] = React.useState<{ [ key: string ]: any }>({})
  const [assetsRawData, setAssetsRawData] = React.useState<AssetsRawDataItem[]>([])

  const [userAssets, setUserAssets] = React.useState<any[]>([])
  // const [formattedData, setFormattedData] = React.useState<{name: string; value: number}[]>([])
  const { account } = useAccount()
  const { sendSocketTopic, socketEnd } = useSocket()
  const { allowTrade, forexMap } = useSystem()
  const { tokenPrices, status: tokenPriceStatus } = useTokenPrices()
  const { ammMap } = store.getState().amm.ammMap
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

  const { marketArray, tokenMap } = useTokenMap()
  const { marketCoins: defiCoinArray } = useDefiMap()

  React.useEffect(() => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      sendSocketTopic({ [ WsTopicType.account ]: true })
      myLog('setLoadingBtn setLoadingBtn', assetBtnStatus)
      setLoadingBtn()
    } else {
      socketEnd()
    }
    return () => {
      socketEnd()
    }
  }, [account.readyState])

  React.useEffect(() => {
    if (walletL2Status === SagaStatus.DONE || assetsRawData.length) {
      // myLog("setLoadingBtn enableBtn");
      enableBtn()
    }
  }, [walletL2Status, assetsRawData])

  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(false)
    const assetsKeyList = walletMap && walletMap.walletMap ? Object.keys(walletMap.walletMap) : []
    const assetsDetailList =
      walletMap && walletMap.walletMap ? Object.values(walletMap.walletMap) : []
    let map: { [ key: string ]: any } = {}

    assetsKeyList.forEach(
      (key, index) =>
        (map[ key ] = {
          token: key,
          detail: assetsDetailList[ index ],
        }),
    )
    setAssetsMap(map)
  }, [])
  useWalletLayer2Socket({ walletLayer2Callback })

  const tokenPriceList = tokenPrices
    ? Object.entries(tokenPrices).map((o) => ({
      token: o[ 0 ],
      detail: o[ 1 ],
    }))
    : []

  const getUserAssets = React.useCallback(async () => {
    if (LoopringAPI && LoopringAPI.userAPI && tokenMap) {
      const { accAddress } = account
      const response = await LoopringAPI.userAPI.getUserVIPAssets<any[]>({
        address: accAddress,
        assetTypes: 'DEX',
      })
      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        myLog((response as sdk.RESULT_INFO).message)
      } else if (response.vipAsset && response.vipAsset.length) {
        const ethValueList = response.vipAsset.map((o: any) => ({
          timeStamp: moment(o.createdAt).format(YEAR_DAY_FORMAT),
          close: o.ethValue,
        }))
        setUserAssets(ethValueList)
        return
      }
    }
    setUserAssets([])
  }, [account, tokenMap])
  const getTokenRelatedMarketArray = React.useCallback(
    (token: string) => {
      if (!marketArray) return []
      return marketArray.filter((market) => {
        const [coinA, coinB] = market.split('-')
        return token === coinA || token === coinB
      })
    },
    [marketArray],
  )
  const getAssetsRawData = React.useCallback(() => {
    if (
      tokenMap &&
      !!Object.keys(tokenMap).length &&
      !!Object.keys(assetsMap).length &&
      !!tokenPriceList.length
    ) {
      const tokenKeys = Object.keys(tokenMap)
      let data: any[] = []
      tokenKeys.forEach((key, _index) => {
        let item = undefined
        const isDefi = [...(defiCoinArray ? defiCoinArray : [])].includes(key)
        if (assetsMap[ key ]) {
          const tokenInfo = assetsMap[ key ]
          const isLpToken = tokenInfo.token.split('-')[ 0 ] === 'LP'
          let tokenValueDollar = 0
          const withdrawAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail.pending.withdraw,
          )
          const depositAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail.pending.deposit,
          )
          const totalAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail?.total,
          )
            ?.plus(depositAmount || 0)
            .plus(withdrawAmount || 0)
          if (!isLpToken) {
            const tokenPriceUSDT =
              tokenInfo.token === 'DAI'
                ? 1
                : Number(
                tokenPriceList.find((o) => o.token === tokenInfo.token)
                  ? tokenPriceList.find((o) => o.token === tokenInfo.token)?.detail
                  : 0,
              ) / Number(tokenPriceList.find((o) => o.token === 'USDT')?.detail)
            const rawData = (totalAmount as BigNumber).times(tokenPriceUSDT)
            tokenValueDollar = rawData?.toNumber() || 0
          } else {
            const price = tokenPrices?.[ tokenInfo.token ] || 0
            if (totalAmount && price) {
              tokenValueDollar = totalAmount.times(price).toNumber()
            }
          }
          const isSmallBalance = tokenValueDollar < 1
          const lockedAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail.locked,
          )
          const frozenAmount = lockedAmount?.plus(withdrawAmount || 0).plus(depositAmount || 0)
          item = {
            token: {
              type: isDefi
                ? TokenType.defi
                : tokenInfo.token.split('-')[ 0 ] === 'LP'
                  ? TokenType.lp
                  : TokenType.single,
              value: tokenInfo.token,
            },
            // amount: getThousandFormattedNumbers(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total as string)) || EmptyValueTag,
            amount: totalAmount?.toNumber() || EmptyValueTag,
            // available: getThousandFormattedNumbers(Number(tokenInfo.detail?.count)) || EmptyValueTag,
            available: Number(tokenInfo.detail?.count) || EmptyValueTag,
            // locked: String(volumeToCountAsBigNumber(tokenInfo.token, tokenInfo.detail?.detail.locked)) || EmptyValueTag,
            locked: String(frozenAmount) || EmptyValueTag,
            smallBalance: isSmallBalance,
            tokenValueDollar,
            name: tokenInfo.token,
          }
        } else {
          item = {
            token: {
              type: isDefi
                ? TokenType.defi
                : key.split('-')[ 0 ] === 'LP'
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
          }
        }
        if (item) {
          data.push(item)
        }
      })
      data.sort((a, b) => {
        const deltaDollar = b.tokenValueDollar - a.tokenValueDollar
        const deltaAmount =
          (b.amount && Number(b.amount) ? Number(b.amount) : 0) -
          (a.amount && Number(a.amount) ? Number(a.amount) : 0)
        const deltaName = b.token.value < a.token.value ? 1 : -1
        return deltaDollar !== 0 ? deltaDollar : deltaAmount !== 0 ? deltaAmount : deltaName
      })
      const dataWithPrecision = data.map((o) => {
        const token = o.token.value
        let precision = 0

        if (token.split('-').length === 3) {
          const rawList = token.split('-')
          rawList.splice(0, 1, 'AMM')
          const ammToken = rawList.join('-')
          precision = ammMap ? ammMap[ ammToken ]?.precisions?.amount : 0
        } else {
          precision = tokenMap[ o.token.value ].precision
        }
        return {
          ...o,
          precision: precision,
        }
      })
      setAssetsRawData(dataWithPrecision)
    }
  }, [ammMap, assetsMap, tokenMap, tokenPriceList, tokenPrices])

  const onReceive = React.useCallback(
    (token?: any) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.AddAssetGateway,
        info: { symbol: token },
      })
    },
    [setShowAccount],
  )
  const onSend = React.useCallback(
    (token?: any, isToL1?: boolean) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.SendAssetGateway,
        info: { symbol: token, isToL1 },
      })
    },
    [setShowAccount],
  )
  React.useEffect(() => {
    if (
      tokenPriceStatus === SagaStatus.UNSET ||
      (!assetsRawData.length && Reflect.ownKeys(assetsMap ?? {}).length)
    ) {
      getAssetsRawData()
    }
  }, [tokenPriceStatus, assetsMap])
  React.useEffect(() => {
    getUserAssets()

    return () => {
    }
  }, [])
  const assetTitleProps: AssetTitleProps = {
    setHideL2Assets,
    assetInfo: {
      totalAsset: assetsRawData
        .map((o) => o.tokenValueDollar * (forexMap[currency] ?? 0))
        .reduce((prev, next) => {
          return prev + next
        }, 0),
      priceTag: PriceTag[ CurrencyToTag[ currency ] ],
    },
    accountId: account.accountId,
    hideL2Assets,
    onShowReceive: () => {
      setShowAccount({ isShow: true, step: AccountStep.AddAssetGateway })
    },
    onShowSend: () => {
      setShowAccount({ isShow: true, step: AccountStep.SendAssetGateway })
    },
  } as any
  const assetTitleMobileExtendProps = {
    btnShowNFTDepositStatus: TradeBtnStatus.AVAILABLE,
    btnShowNFTMINTStatus: TradeBtnStatus.AVAILABLE,
  }
  const [tokenLockDetail, setTokenLockDetail] = React.useState<| undefined
    | {
    list: any[]
    row: any
  }>(undefined)
  return {
    assetTitleProps,
    assetTitleMobileExtendProps,
    assetsRawData,
    assetBtnStatus,
    account,
    hideL2Assets,
    onSend,
    onReceive,
    marketArray,
    userAssets,
    getUserAssets,
    hideInvestToken,
    allowTrade,
    setHideL2Assets,
    setHideLpToken,
    setHideSmallBalances,
    themeMode,
    onTokenLockHold: async (_item) => {
      setTokenLockDetail(undefined)
      const account = store.getState().account
      if (LoopringAPI.userAPI && account.accountId) {
        const response = await LoopringAPI.userAPI.getUserLockSummary(
          {
            accountId: account.accountId,
            tokenId: tokenMap[ _item.name ].tokenId,
            // @ts-ignore
            lockTags: [
              sdk.LOCK_TYPE.DUAL_CURRENCY,
              sdk.LOCK_TYPE.DUAL_BASE,
              sdk.LOCK_TYPE.BTRADE,
              sdk.LOCK_TYPE.L2STAKING,
              sdk.LOCK_TYPE.STOP_LIMIT,
            ].join(','),
          },
          account.apiKey,
        )

        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        } else {
          setTokenLockDetail({
            list: response.lockRecord.map((item) => {
              const amount = sdk
                .toBig(item.amount)
                .div('1e' + tokenMap[ _item.name ].decimals)
                .toString()
              return {
                key: `label${item.lockTag}`,
                value: getValuePrecisionThousand(
                  amount,
                  tokenMap[ _item.name ].precision,
                  tokenMap[ _item.name ].precision,
                  undefined,
                ),
              }
            }),
            row: _item,
          })
        }
      }
    },
    tokenLockDetail,
    getTokenRelatedMarketArray,
    hideSmallBalances,
  }
}
