import {
  LoopringAPI,
  makeDualOrderedItem,
  useAccount,
  useDualMap,
  useTokenMap,
} from '@loopring-web/core'
import React from 'react'
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  SDK_ERROR_MAP_TO_UI,
} from '@loopring-web/common-resources'
import { DualDetailType, RawDataDualAssetItem, ToastType } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'
import { DUAL_TYPE } from '@loopring-web/loopring-sdk'
import BigNumber from 'bignumber.js'
import _ from 'lodash'

export const Limit = 15

export const useDualAsset = <R extends RawDataDualAssetItem>(
  setToastOpen?: (props: any) => void,
) => {
  const { t } = useTranslation(['error'])

  const {
    account: { accountId, apiKey },
  } = useAccount()
  const { tokenMap, idIndex } = useTokenMap()
  const { marketMap: dualMarketMap, marketArray } = useDualMap()
  const [dualList, setDualList] = React.useState<R[]>([])
  const [dualOnInvestAsset, setDualOnInvestAsset] = React.useState<any>(undefined)
  const [pagination, setDualPagination] = React.useState<{
    pageSize: number
    total: number
  }>({
    pageSize: Limit,
    total: 0,
  })
  const [showLoading, setShowLoading] = React.useState(true)
  const [open, setOpen] = React.useState<boolean>(false)
  const [detail, setDetail] = React.useState<DualDetailType | undefined>(undefined)
  const [showRefreshError, setShowRefreshError] = React.useState<boolean>(false)
  const [refreshErrorInfo, setRefreshErrorInfo] = React.useState<[string, string]>(['', ''])

  const getDetail = (item: R, index?: number) => {
    const {
      sellSymbol,
      buySymbol,
      settleRatio,
      strike,
      __raw__: {
        order: {
          dualType,
          tokenInfoOrigin: { base, currency: quote, amountIn, market },
          // timeOrigin: { settlementTime },
        },
      },
    } = item
    const currentPrice = _.cloneDeep(item.currentPrice)
    if (index) {
      currentPrice.currentPrice = index
    }
    let lessEarnTokenSymbol, greaterEarnTokenSymbol, lessEarnVol, greaterEarnVol
    const sellAmount = sdk.toBig(amountIn ? amountIn : 0).div('1e' + tokenMap[sellSymbol].decimals)
    if (dualType === sdk.DUAL_TYPE.DUAL_BASE) {
      lessEarnTokenSymbol = sellSymbol
      greaterEarnTokenSymbol = buySymbol
      lessEarnVol = sdk.toBig(settleRatio).plus(1).times(amountIn) //dualViewInfo.strike);
      greaterEarnVol = sdk
        .toBig(
          sdk
            .toBig(settleRatio)
            .plus(1)
            .times(sellAmount ? sellAmount : 0)
            .times(strike)
            .toFixed(tokenMap[buySymbol].precision, BigNumber.ROUND_CEIL),
        )
        .times('1e' + tokenMap[buySymbol].decimals)
    } else {
      lessEarnTokenSymbol = buySymbol
      greaterEarnTokenSymbol = sellSymbol
      lessEarnVol = sdk
        .toBig(
          sdk
            .toBig(settleRatio)
            .plus(1)
            .times(sellAmount ? sellAmount : 0)
            // .times(1 + info.ratio)
            .div(strike)
            .toFixed(tokenMap[buySymbol].precision, BigNumber.ROUND_CEIL),
        )
        .times('1e' + tokenMap[buySymbol].decimals)

      // sellVol.times(1 + info.ratio).div(dualViewInfo.strike); //.times(1 + dualViewInfo.settleRatio);
      greaterEarnVol = sdk.toBig(settleRatio).plus(1).times(amountIn)
    }
    const lessEarnView = amountIn
      ? getValuePrecisionThousand(
          sdk.toBig(lessEarnVol).div('1e' + tokenMap[lessEarnTokenSymbol].decimals),
          tokenMap[lessEarnTokenSymbol].precision,
          tokenMap[lessEarnTokenSymbol].precision,
          tokenMap[lessEarnTokenSymbol].precision,
          false,
          { floor: true },
        )
      : EmptyValueTag
    const greaterEarnView = amountIn
      ? getValuePrecisionThousand(
          sdk.toBig(greaterEarnVol).div('1e' + tokenMap[greaterEarnTokenSymbol].decimals),
          tokenMap[greaterEarnTokenSymbol].precision,
          tokenMap[greaterEarnTokenSymbol].precision,
          tokenMap[greaterEarnTokenSymbol].precision,
          false,
          { floor: true },
        )
      : EmptyValueTag

    const amount = getValuePrecisionThousand(
      sellAmount,
      tokenMap[sellSymbol].precision,
      tokenMap[sellSymbol].precision,
      tokenMap[sellSymbol].precision,
      false,
    )
    return {
      dualViewInfo: {
        ...item,
        amount: amount + ' ' + sellSymbol,
        currentPrice,
      },
      lessEarnTokenSymbol,
      greaterEarnTokenSymbol,
      lessEarnView,
      greaterEarnView,
      currentPrice,
    } as DualDetailType
  }
  const showDetail = async (item: R) => {
    const {
      __raw__: {
        order: {
          tokenInfoOrigin: { base, market },
        },
      },
    } = item
    const {
      dualPrice: { index },
    } = await LoopringAPI.defiAPI?.getDualIndex({
      baseSymbol: base,
      quoteSymbol: dualMarketMap[market].quoteAlias,
    })
    if (index) {
      setDetail(getDetail(item, index))
      setOpen(true)
    }
  }
  const refresh = async (item: R) => {
    const hash = item.__raw__.order.hash
    setShowLoading(true)
    if (LoopringAPI.defiAPI && accountId && apiKey && marketArray?.length) {
      const [response, responseTotal] = await Promise.all([
        LoopringAPI.defiAPI.getDualTransactions(
          {
            accountId,
            hashes: hash,
          } as any,
          apiKey,
        ),
        LoopringAPI.defiAPI.getDualUserLocked(
          {
            accountId: accountId,
            lockTag: [DUAL_TYPE.DUAL_BASE, DUAL_TYPE.DUAL_CURRENCY],
            //@ts-ignore
            status: 'LOCKED',
          },
          apiKey,
        ),
      ])
      if ((responseTotal as sdk.RESULT_INFO).code || (responseTotal as sdk.RESULT_INFO).message) {
        setDualOnInvestAsset(undefined)
      } else {
        setDualOnInvestAsset(responseTotal.lockRecord)
      }
      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
        if (setToastOpen) {
          setToastOpen({
            open: true,
            type: ToastType.error,
            content:
              'error : ' + errorItem
                ? t(errorItem.messageKey)
                : (response as sdk.RESULT_INFO).message,
          })
        }
      } else {
        // @ts-ignore
        let item = (response as any)?.userDualTxs[0] as sdk.UserDualTxsHistory
        const [, , coinA, coinB] =
          (item.tokenInfoOrigin.market ?? 'dual-').match(/(dual-)?(\w+)-(\w+)/i) ?? []

        let [sellTokenSymbol, buyTokenSymbol] =
          item.dualType == DUAL_TYPE.DUAL_BASE
            ? [
                coinA ?? idIndex[item.tokenInfoOrigin.tokenIn],
                coinB ?? idIndex[item.tokenInfoOrigin.tokenOut],
              ]
            : [
                coinB ?? idIndex[item.tokenInfoOrigin.tokenIn],
                coinA ?? idIndex[item.tokenInfoOrigin.tokenOut],
              ]
        const format = makeDualOrderedItem(
          item,
          sellTokenSymbol,
          buyTokenSymbol,
          0,
          dualMarketMap[item.tokenInfoOrigin.market],
        )

        const amount = getValuePrecisionThousand(
          sdk.toBig(item.tokenInfoOrigin.amountIn).div('1e' + tokenMap[sellTokenSymbol].decimals),
          tokenMap[sellTokenSymbol].precision,
          tokenMap[sellTokenSymbol].precision,
          tokenMap[sellTokenSymbol].precision,
          true,
        )
        const refreshedRecord = {
          ...format,
          amount,
        } as R
        if (
          refreshedRecord.__raw__.order.investmentStatus === sdk.LABEL_INVESTMENT_STATUS.CANCELLED
        ) {
          const newDualList = dualList.filter((x) => {
            return x.__raw__.order.id !== refreshedRecord.__raw__.order.id
          })
          // newDualList
          setDualList(newDualList)
          setRefreshErrorInfo([refreshedRecord.buySymbol, refreshedRecord.sellSymbol])
          setShowRefreshError(true)
          setShowLoading(false)
        } else {
          const newDualList = dualList.map((x) => {
            return x.__raw__.order.id === refreshedRecord.__raw__.order.id ? refreshedRecord : x
          })
          setDualList(newDualList)
          setShowLoading(false)
        }
      }
    }
    setShowLoading(false)
  }
  const getDualTxList = React.useCallback(
    async ({ start, end, offset, limit = Limit }: any) => {
      setShowLoading(true)
      if (LoopringAPI.defiAPI && accountId && apiKey && marketArray?.length) {
        const [response, responseTotal] = await Promise.all([
          LoopringAPI.defiAPI.getDualTransactions(
            {
              // dualTypes: sdk.DUAL_TYPE,
              accountId,
              settlementStatuses: sdk.SETTLEMENT_STATUS.UNSETTLED,
              offset,
              limit,
              start,
              end,
              investmentStatuses: [
                sdk.LABEL_INVESTMENT_STATUS.FAILED,
                sdk.LABEL_INVESTMENT_STATUS.PROCESSED,
                sdk.LABEL_INVESTMENT_STATUS.PROCESSING,
              ].join(','),
            } as any,
            apiKey,
          ),
          LoopringAPI.defiAPI.getDualUserLocked(
            {
              accountId: accountId,
              lockTag: [DUAL_TYPE.DUAL_BASE, DUAL_TYPE.DUAL_CURRENCY],
              //@ts-ignore
              status: 'LOCKED',
            },
            apiKey,
          ),
        ])
        if ((responseTotal as sdk.RESULT_INFO).code || (responseTotal as sdk.RESULT_INFO).message) {
          setDualOnInvestAsset(undefined)
        } else {
          setDualOnInvestAsset(responseTotal.lockRecord)
        }
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
          if (setToastOpen) {
            setToastOpen({
              open: true,
              type: ToastType.error,
              content:
                'error : ' + errorItem
                  ? t(errorItem.messageKey)
                  : (response as sdk.RESULT_INFO).message,
            })
          }
        } else {
          // @ts-ignore
          let result = (response as any)?.userDualTxs.reduce(
            (prev: RawDataDualAssetItem[], item: sdk.UserDualTxsHistory) => {
              const [, , coinA, coinB] =
                (item.tokenInfoOrigin.market ?? 'dual-').match(/(dual-)?(\w+)-(\w+)/i) ?? []

              let [sellTokenSymbol, buyTokenSymbol] =
                item.dualType == DUAL_TYPE.DUAL_BASE
                  ? [
                      coinA ?? idIndex[item.tokenInfoOrigin.tokenIn],
                      coinB ?? idIndex[item.tokenInfoOrigin.tokenOut],
                    ]
                  : [
                      coinB ?? idIndex[item.tokenInfoOrigin.tokenIn],
                      coinA ?? idIndex[item.tokenInfoOrigin.tokenOut],
                    ]
              const format = makeDualOrderedItem(
                item,
                sellTokenSymbol,
                buyTokenSymbol,
                0,
                dualMarketMap[item.tokenInfoOrigin.market],
              )

              const amount = getValuePrecisionThousand(
                sdk
                  .toBig(item.tokenInfoOrigin.amountIn)
                  .div('1e' + tokenMap[sellTokenSymbol].decimals),
                tokenMap[sellTokenSymbol].precision,
                tokenMap[sellTokenSymbol].precision,
                tokenMap[sellTokenSymbol].precision,
                true,
              )
              prev.push({
                ...format,
                amount,
              })
              return prev
            },
            [] as RawDataDualAssetItem[],
          )
          const filteredResult = (result as R[]).filter(
            (x) => x.__raw__.order.investmentStatus !== sdk.LABEL_INVESTMENT_STATUS.CANCELLED,
          )

          setDualList(filteredResult)
          setShowLoading(false)
          setDualPagination({
            pageSize: limit,
            total: (response as any).totalNum,
          })
        }
      }
      setShowLoading(false)
    },
    [accountId, apiKey, setToastOpen, t, dualMarketMap],
  )

  return {
    // page,
    getDetail,
    showDetail,
    dualList,
    showLoading,
    getDualTxList,
    pagination,
    open,
    detail,
    setOpen,
    dualOnInvestAsset,
    refresh,
    setShowRefreshError,
    showRefreshError,
    refreshErrorInfo,
    // updateTickersUI,
  }
}
