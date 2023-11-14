import {
  LoopringAPI,
  makeDualOrderedItem,
  makeDualViewItem,
  store,
  useAccount,
  useDualEdit,
  useDualMap,
  useTokenMap,
  useTradeDual,
} from '@loopring-web/core'
import React from 'react'
import {
  CompleteIcon,
  DualViewInfo,
  EmptyValueTag,
  getValuePrecisionThousand,
  myLog,
  SDK_ERROR_MAP_TO_UI,
  WaitingIcon,
  WarningIcon,
} from '@loopring-web/common-resources'
import {
  DualDetailType,
  LABEL_INVESTMENT_STATUS_MAP,
  RawDataDualAssetItem,
  ToastType,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'
import { DUAL_TYPE, LABEL_INVESTMENT_STATUS } from '@loopring-web/loopring-sdk'
import BigNumber from 'bignumber.js'
import _ from 'lodash'
import { Tooltip, Typography } from '@mui/material'

export const Limit = 15

export const useDualAsset = <R extends RawDataDualAssetItem>(
  setToastOpen?: (props: any) => void,
) => {
  const { t } = useTranslation(['common', 'error'])
  const {
    account: { accountId, apiKey },
  } = useAccount()
  const { updateEditDual } = useTradeDual()
  const { tokenMap, idIndex } = useTokenMap()
  const { marketMap: dualMarketMap } = useDualMap()
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
    let {
      sellSymbol,
      buySymbol,
      settleRatio,
      __raw__: {
        order: {
          strike,
          settlementStatus,
          tokenInfoOrigin: { amountIn, tokenOut, amountOut },
          dualReinvestInfo,
          timeOrigin: { expireTime },
          investmentStatus,
          dualType,
          deliveryPrice,
        },
      },
    } = item
    let icon: any = undefined,
      status = ''
    let content = ''
    const currentPrice = _.cloneDeep(item.currentPrice)
    if (index) {
      currentPrice.currentPrice = index
    }
    let lessEarnTokenSymbol, greaterEarnTokenSymbol, lessEarnVol, greaterEarnVol
    const sellAmount = sdk.toBig(amountIn ? amountIn : 0).div('1e' + tokenMap[sellSymbol].decimals)
    const side =
      settlementStatus === sdk.SETTLEMENT_STATUS.PAID
        ? t(LABEL_INVESTMENT_STATUS_MAP.INVESTMENT_RECEIVED)
        : Date.now() - expireTime >= 0 &&
          investmentStatus !== LABEL_INVESTMENT_STATUS.CANCELLED &&
          investmentStatus !== LABEL_INVESTMENT_STATUS.FAILED
        ? t(LABEL_INVESTMENT_STATUS_MAP.DELIVERING)
        : t(LABEL_INVESTMENT_STATUS_MAP.INVESTMENT_SUBSCRIBE)
    const statusColor =
      settlementStatus === sdk.SETTLEMENT_STATUS.PAID
        ? 'var(--color-tag)'
        : Date.now() - expireTime >= 0 &&
          investmentStatus !== LABEL_INVESTMENT_STATUS.CANCELLED &&
          investmentStatus !== LABEL_INVESTMENT_STATUS.FAILED
        ? 'var(--color-warning)'
        : 'var(--color-text-primary)'
    let outSymbol: string | undefined = undefined,
      outAmount

    if (
      (settlementStatus === sdk.SETTLEMENT_STATUS.PAID ||
        (Date.now() - expireTime >= 0 &&
          investmentStatus !== LABEL_INVESTMENT_STATUS.CANCELLED &&
          investmentStatus !== LABEL_INVESTMENT_STATUS.FAILED)) &&
      tokenOut !== undefined &&
      tokenOut &&
      tokenOut != 0
    ) {
      outSymbol = tokenMap[idIndex[tokenOut]].symbol
      outAmount = getValuePrecisionThousand(
        sdk.toBig(amountOut ? amountOut : 0).div('1e' + tokenMap[outSymbol].decimals),
        tokenMap[outSymbol].precision,
        tokenMap[outSymbol].precision,
        tokenMap[outSymbol].precision,
        false,
      )
    }
    if (dualType === sdk.DUAL_TYPE.DUAL_BASE) {
      lessEarnTokenSymbol = sellSymbol
      greaterEarnTokenSymbol = buySymbol
      lessEarnVol = sdk.toBig(settleRatio).plus(1).times(amountIn) //dualViewInfo.strike);
      greaterEarnVol = sdk
        .toBig(
          sdk
            .toBig(sellAmount ? sellAmount : 0)
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
            .toBig(sellAmount ? sellAmount : 0)
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
    switch (dualReinvestInfo.retryStatus) {
      case sdk.DUAL_RETRY_STATUS.RETRY_SUCCESS:
        icon = <CompleteIcon color={'success'} sx={{ paddingLeft: 1 / 2 }} />
        status = 'labelDualRetryStatusSuccess'
        content = 'labelDualRetrySuccess'
        break
      case sdk.DUAL_RETRY_STATUS.RETRY_FAILED:
        icon = <WarningIcon color={'error'} sx={{ paddingLeft: 1 / 2 }} />
        status = 'labelDualRetryStatusError'
        content = 'labelDualRetryFailed'
        break
      case sdk.DUAL_RETRY_STATUS.NO_RETRY:
        if (dualReinvestInfo?.isRecursive) {
          content = 'labelDualAssetReInvestEnable'
        } else if (
          investmentStatus !== LABEL_INVESTMENT_STATUS.CANCELLED &&
          investmentStatus !== LABEL_INVESTMENT_STATUS.FAILED &&
          Date.now() - expireTime >= 0 &&
          (dualType == sdk.DUAL_TYPE.DUAL_BASE
            ? sdk.toBig(deliveryPrice).gte(strike)
            : sdk.toBig(strike).gte(deliveryPrice))
        ) {
          icon = <WaitingIcon color={'primary'} sx={{ paddingLeft: 1 / 2 }} />
          status = 'labelDualRetryStatusTerminated'
          content = 'labelDualRetryTerminated'
        } else {
          content = 'labelDualAssetReInvestDisable'
        }
        break
      case sdk.DUAL_RETRY_STATUS.RETRYING:
        icon = <WaitingIcon color={'primary'} sx={{ paddingLeft: 1 / 2 }} />
        status = 'labelDualRetryStatusRetrying'
        content = 'labelDualRetryPending'
        break
      default:
        content = dualReinvestInfo?.isRecursive
          ? 'labelDualAssetReInvestEnable'
          : 'labelDualAssetReInvestDisable'
    }
    return {
      dualViewInfo: {
        ...item?.__raw__?.order,
        ...item,
        quote: item?.__raw__?.order?.tokenInfoOrigin?.quote,
        amount: amount + ' ' + sellSymbol,
        currentPrice,
        __raw__: item.__raw__,
        outSymbol,
        outAmount,
        side,
        status: settlementStatus,
        statusColor,
        maxDuration: dualReinvestInfo.maxDuration,
        autoIcon: icon,
        autoStatus: status,
        autoContent: t(content),
        newStrike: dualReinvestInfo.newStrike,
        deliveryPrice:
          Date.now() - expireTime >= 0
            ? deliveryPrice
              ? getValuePrecisionThousand(
                  deliveryPrice,
                  tokenMap[currentPrice.quote]?.precision,
                  tokenMap[currentPrice.quote]?.precision,
                  tokenMap[currentPrice.quote]?.precision,
                  true,
                  { isFait: true },
                )
              : EmptyValueTag
            : undefined,
      },

      lessEarnTokenSymbol,
      greaterEarnTokenSymbol,
      lessEarnView,
      greaterEarnView,
      currentPrice,
      __raw__: item.__raw__,
    } as DualDetailType
  }

  const refresh = async (item: R) => {
    const hash = item.__raw__.order.hash
    const currentPrice = item.currentPrice
    setShowLoading(true)
    const { marketArray, marketMap: dualMarketMap } = store.getState().invest.dualMap
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
          item.dualType === DUAL_TYPE.DUAL_BASE
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
          currentPrice?.currentPrice ?? 0,
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
          setDualList((state) => {
            return state?.filter((x) => {
              return x.__raw__.order.id !== refreshedRecord.__raw__.order.id
            })
          })
          setRefreshErrorInfo([refreshedRecord.buySymbol, refreshedRecord.sellSymbol])
          setShowRefreshError(true)
          setShowLoading(false)
        } else {
          setDualList((state) => {
            return state.map((x) => {
              return x.__raw__.order.id === refreshedRecord.__raw__.order.id
                ? {
                    ...refreshedRecord,
                    __raw__: {
                      ...x.__raw__,
                      ...refreshedRecord.__raw__,
                    },
                  }
                : x
            })
          })
          setShowLoading(false)
        }
      }
    }
    setShowLoading(false)
  }

  const {
    editDualTrade,
    editDualBtnInfo,
    editDualBtnStatus,
    dualToastOpen,
    closeDualToast,
    // setDualTradeData,
    handleOnchange,
    onEditDualClick,
  } = useDualEdit({
    refresh: (item, dontCloseModal: boolean) => {
      refresh(item as any)
      !dontCloseModal && setOpen(false)
    },
  })
  const showDetail = async (item: R) => {
    const {
      __raw__: { index },
    } = item
    if (index) {
      const _item = getDetail(item, index?.index)
      setDetail(_item)
      const tradeData = {
        isRenew: _item?.__raw__?.order?.dualReinvestInfo?.isRecursive,
        renewDuration: _item?.__raw__?.order?.dualReinvestInfo?.maxDuration / 86400000,
        renewTargetPrice: _item?.__raw__?.order.dualReinvestInfo.newStrike,
      }
      updateEditDual({
        ...(_item as any),
        tradeData,
      })
      if (_item?.__raw__?.order?.dualReinvestInfo?.isRecursive) {
        getProduct(_item)
        handleOnchange({
          tradeData,
        })
      }
      setOpen(true)
    }
  }

  const getDualTxList = React.useCallback(
    async ({ start, end, offset, limit = Limit }: any) => {
      setShowLoading(true)
      const { marketArray, marketMap: dualMarketMap } = store.getState().invest.dualMap
      if (LoopringAPI.defiAPI && accountId && apiKey && marketArray?.length) {
        const [response, responseTotal] = await Promise.all([
          LoopringAPI.defiAPI.getDualTransactions(
            {
              accountId,
              settlementStatuses: [sdk.SETTLEMENT_STATUS.UNSETTLED, sdk.SETTLEMENT_STATUS.SETTLED],
              offset,
              limit,
              start,
              end,
              investmentStatuses: [
                // sdk.LABEL_INVESTMENT_STATUS.FAILED,
                sdk.LABEL_INVESTMENT_STATUS.CANCELLED,
                sdk.LABEL_INVESTMENT_STATUS.SUCCESS,
                sdk.LABEL_INVESTMENT_STATUS.PROCESSED,
                sdk.LABEL_INVESTMENT_STATUS.PROCESSING,
              ].join(','),
              retryStatuses: [sdk.DUAL_RETRY_STATUS.RETRYING],
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
          const indexes = response.indexes
          let result = (response as any)?.userDualTxs.reduce(
            (prev: RawDataDualAssetItem[], item: sdk.UserDualTxsHistory) => {
              const [, , coinA, coinB] =
                (item.tokenInfoOrigin.market ?? 'dual-').match(/(dual-)?(\w+)-(\w+)/i) ?? []
              // [] =  item.tokenInfoOrigin.market
              const findIndex = indexes?.find((_item) => {
                return (
                  _item.base === item.tokenInfoOrigin.base &&
                  _item.quote === item.tokenInfoOrigin.quote
                )
              })
              let [sellTokenSymbol, buyTokenSymbol] =
                item.dualType === DUAL_TYPE.DUAL_BASE
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
                findIndex?.index ?? 0,
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

              const currentPrice = {
                base: item.tokenInfoOrigin.base,
                quote: item.tokenInfoOrigin.quote,
                currentPrice: findIndex?.index,
                precisionForPrice: dualMarketMap[item.tokenInfoOrigin.market]?.precisionForPrice,
                quoteUnit: item.tokenInfoOrigin.quote,
              }
              prev.push({
                ...format,
                amount,
                currentPrice,
                __raw__: {
                  ...format.__raw__,
                  currentPrice,
                  index: findIndex,
                },
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
    [accountId, apiKey, setToastOpen, t, dualMarketMap, idIndex, tokenMap],
  )
  const [dualProducts, setDualProducts] = React.useState<DualViewInfo[]>([])
  // TODO:
  const getProduct = async (detail) => {
    if (detail && detail.dualViewInfo) {
      const { marketMap: dualMarketMap } = store.getState().invest.dualMap
      const market =
        detail.dualViewInfo.dualType === sdk.DUAL_TYPE.DUAL_BASE
          ? detail.dualViewInfo.sellSymbol + '-' + detail.dualViewInfo.buySymbol
          : detail.dualViewInfo.buySymbol + '-' + detail.dualViewInfo.sellSymbol
      const dualMarket = dualMarketMap[`DUAL-${market}`]
      const { dualType } = detail.dualViewInfo
      const currency = dualMarket.currency
      const baseSymbol = idIndex[dualMarket.baseTokenId]
      const quoteSymbol = dualMarket.quoteAlias ?? idIndex[dualMarket.quoteTokenId]
      const response = await LoopringAPI.defiAPI?.getDualInfos({
        baseSymbol,
        quoteSymbol,
        currency: currency ?? '',
        dualType,
        startTime: Date.now() + 1000 * 60 * 60,
        timeSpan: 1000 * 60 * 60 * 24 * 9,
        limit: 50,
      })

      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        setDualProducts([])
      } else {
        const {
          dualInfo: { infos, index },
          raw_data: { rules },
        } = response as any
        const rule = rules[0]
        const rawData = infos.map((item: sdk.DualProductAndPrice) => {
          return makeDualViewItem(item, index, rule, baseSymbol, quoteSymbol, dualMarket)
        })
        myLog('setDualProducts', rawData)
        setDualProducts(rawData)
      }
    } else {
      setDualProducts([])
    }
  }
  const cancelReInvest = React.useCallback((item) => {
    updateEditDual({
      ...item,
      dualViewInfo: item,
      tradeData: {
        isRenew: false,
      },
    })
    sdk.sleep(0).then(() => {
      onEditDualClick()
    })
  }, [])
  return {
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
    cancelReInvest,
    dualProducts,
    getProduct,
    // onEdit,
    dualToastOpen,
    closeDualToast,
    editDualTrade,
    editDualBtnInfo,
    editDualBtnStatus,
    handleOnchange,
    onEditDualClick,
  }
}
