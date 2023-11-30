import * as sdk from '@loopring-web/loopring-sdk'
import {
  InvestAssetRouter,
  MapChainId,
  RecordTabIndex,
  RouterPath,
  SDK_ERROR_MAP_TO_UI,
} from '@loopring-web/common-resources'
import { useHistory } from 'react-router-dom'
import React from 'react'
import { LoopringAPI } from '../../api_wrapper'
import { TOASTOPEN, ToastType, useSettings } from '@loopring-web/component-lib'
import { useAccount, useNotify } from '../../stores'
import { useTranslation } from 'react-i18next'

export const useNotificationFunc = <R extends sdk.UserNotification>({
  setToastOpen,
}: {
  setToastOpen?: (state: TOASTOPEN) => void
}) => {
  const { account } = useAccount()
  const { t } = useTranslation()
  const { defaultNetwork } = useSettings()
  const { getUserNotify } = useNotify()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const networkWallet: sdk.NetworkWallet = [
    sdk.NetworkWallet.ETHEREUM,
    sdk.NetworkWallet.GOERLI,
  ].includes(network as sdk.NetworkWallet)
    ? sdk.NetworkWallet.ETHEREUM
    : sdk.NetworkWallet[network]
  const onReadClick = React.useCallback(
    async (_index: number, item: R) => {
      try {
        const response = await LoopringAPI.userAPI?.submitNotificationReadOne(
          {
            id: item.id,
            accountId: account.accountId,
          },
          account?.eddsaKey?.sk,
          account.apiKey,
        )
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          throw response
        } else {
        }
      } catch (error) {
        let errorItem
        if (typeof (error as sdk.RESULT_INFO)?.code === 'number') {
          errorItem = SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO)?.code ?? 700001]
        } else {
          errorItem = SDK_ERROR_MAP_TO_UI[700012]
        }
        setToastOpen &&
          setToastOpen({
            open: true,
            type: ToastType.error,
            content: 'error : ' + errorItem ? t(errorItem.messageKey) : (error as any)?.message,
          })
      }
      getUserNotify()
    },
    [account.accAddress],
  )
  // setShowLoading(true)
  const onReadAllClick = React.useCallback(async () => {
    try {
      const response = await LoopringAPI.userAPI?.submitNotificationReadAll(
        {
          network: networkWallet,
          accountId: account.accountId,
        },
        account?.eddsaKey?.sk,
        account.apiKey,
      )
      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        throw response
      } else {
      }
      getUserNotify()
    } catch (error) {
      let errorItem
      if (typeof (error as sdk.RESULT_INFO)?.code === 'number') {
        errorItem = SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO)?.code ?? 700001]
      } else {
        errorItem = SDK_ERROR_MAP_TO_UI[700012]
      }
      setToastOpen &&
        setToastOpen({
          open: true,
          type: ToastType.error,
          content: 'error : ' + errorItem ? t(errorItem.messageKey) : (error as any)?.message,
        })
    }
  }, [account.accAddress])

  const onClearAllClick = React.useCallback(async () => {
    try {
      const response = await LoopringAPI.userAPI?.submitNotificationClear(
        {
          network: networkWallet,
          accountId: account.accountId,
        },
        account?.eddsaKey?.sk,
        account.apiKey,
      )
      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        throw response
      } else {
      }
      getUserNotify()
    } catch (error) {
      let errorItem
      if (typeof (error as sdk.RESULT_INFO)?.code === 'number') {
        errorItem = SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO)?.code ?? 700001]
      } else {
        errorItem = SDK_ERROR_MAP_TO_UI[700012]
      }
      setToastOpen &&
        setToastOpen({
          open: true,
          type: ToastType.error,
          content: 'error : ' + errorItem ? t(errorItem.messageKey) : (error as any)?.message,
        })
    }
  }, [account.accAddress])
  return {
    onReadClick,
    onReadAllClick,
    onClearAllClick,
  }
}
export const useNotification = <R extends sdk.UserNotification>({
  onReadClick,
  index,
  ...rest
}: R & {
  index: number
  onReadClick: (index: number, rest: any) => void
}) => {
  const history = useHistory()
  const { messageType } = rest
  let ele: any = {
    i18nKey: '',
    active: undefined,
  }
  //TODO:
  ele.redirectionContext =
    '0x1f78ba3b8bfe37dd4e05825a30e35f18e8503fbe3b50ec058a5681877b7fe892-1698915653481'
  switch (messageType) {
    case sdk.NotificationMessageType.L1_CREATED:
      ele.i18nKey = 'labelActiveL1successfulNote' //Active L1 Account successful
      ele.active = undefined
      break
    case sdk.NotificationMessageType.L2_CREATED:
      ele.i18nKey = 'labelActiveL2successfulNote' //Active L2 Account successful
      ele.active = undefined
      break
    case 12: //sdk.NotificationMessageType.L1_CREATING:
      ele.i18nKey = 'labelActivatingL1AccountNote' //Active L2 Account successful
      ele.active = undefined
      break
    case sdk.NotificationMessageType.L1_RECEIVE:
      ele.i18nKey = 'labelL1ReceiveNote'
      ele.active = undefined
      break
    case sdk.NotificationMessageType.L1_SEND:
      ele.i18nKey = 'labelL1SendNote'
      ele.active = undefined
      break
    case sdk.NotificationMessageType.L2_RECEIVE:
      ele.i18nKey = 'labelL2ReceiveNote'
      ele.active = () => {
        onReadClick(index, rest)
        history.push(`${RouterPath.l2records}/${RecordTabIndex.Transactions}`)
      }
      break
    case sdk.NotificationMessageType.L2_SEND:
      ele.i18nKey = 'labelL2SendNote'
      ele.active = undefined
      ele.active = () => {
        onReadClick(index, rest)
        history.push(`${RouterPath.l2records}/${RecordTabIndex.Transactions}`)
      }
      break
    case sdk.NotificationMessageType.DEPOSIT:
      ele.i18nKey = 'labelL2DepositNote'
      ele.active = () => {
        onReadClick(index, rest)
        history.push(`${RouterPath.l2records}/${RecordTabIndex.Transactions}`)
      }
      break
    case sdk.NotificationMessageType.WITHDRAW:
      ele.i18nKey = 'labelL2WithdrawNote'
      ele.active = () => {
        onReadClick(index, rest)
        history.push(`${RouterPath.l2records}/${RecordTabIndex.Transactions}`)
      }
      break
    case sdk.NotificationMessageType.DUAL_SETTLED:
      ele.i18nKey = 'labelL2DualNote'
      ele.active = () => {
        onReadClick(index, rest)
        history.push(
          `${RouterPath.l2records}/${RecordTabIndex.DualRecords}?hash=${ele.redirectionContext}&show=detail`,
        )
      }
      break
    case sdk.NotificationMessageType.DUAL_RECURES_ORDER_SWAP:
      ele.i18nKey = 'labelL2DualNote'
      ele.active = () => {
        onReadClick(index, rest)
        history.push(
          `${RouterPath.l2records}/${RecordTabIndex.DualRecords}?hash=${ele.redirectionContext}&show=detail`,
        )
      }
      break
    case sdk.NotificationMessageType.DUAL_RECURES_RETRY_FAILED:
      ele.i18nKey = 'labelL2DualNote'
      ele.active = () => {
        onReadClick(index, rest)
        history.push(
          `${RouterPath.l2records}/${RecordTabIndex.DualRecords}?hash=${ele.redirectionContext}&show=detail`,
        )
      }
      break
    case sdk.NotificationMessageType.DUAL_RECURES_RETRY_SUCCESS:
      ele.i18nKey = 'labelL2DualNote'
      ele.active = () => {
        onReadClick(index, rest)
        history.push(
          `${RouterPath.investBalance}/${InvestAssetRouter.DUAL}?hash=${ele.redirectionContext}&show=detail`,
        )
        showDetail()
      }
      break
    //TODO
    case 54:
      ele.i18nKey = 'labelL2DualNote'
      ele.active = () => {
        onReadClick(index, rest)
        history.push(
          `${RouterPath.investBalance}/${InvestAssetRouter.DUAL}?hash=${ele.redirectionContext}&show=detail`,
        )
      }
      break
    default:
      ele.i18nKey = 'labelNotificationLabel'
      ele.active = () => {
        onReadClick(index, rest)
        history.push(
          `${RouterPath.investBalance}/${InvestAssetRouter.DUAL}?hash=${ele.redirectionContext}&show=detail`,
        )
      }

      break
  }
  return ele
}
