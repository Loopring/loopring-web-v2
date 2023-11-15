import {
  LoopringAPI,
  notificationService,
  useAccount,
  useNotificationFunc,
  useNotify,
} from '@loopring-web/core'
import React from 'react'
import { MapChainId, SDK_ERROR_MAP_TO_UI } from '@loopring-web/common-resources'
import * as sdk from '@loopring-web/loopring-sdk'
import { ToastType, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'

export const useNotification = <R extends sdk.UserNotification>({
  setToastOpen,
  page,
  pageSize,
}: {
  setToastOpen: (state: any) => void
  page: number
  pageSize: number
  // pageSize: number
}) => {
  const { t } = useTranslation()

  const { myNotifyMap, getUserNotify } = useNotify()
  const [rawData, setRawData] = React.useState<R[]>([])
  const [total, setTotal] = React.useState<number>(0)
  const [showLoading, setShowLoading] = React.useState(false)
  const { account } = useAccount()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const networkWallet: sdk.NetworkWallet = [
    sdk.NetworkWallet.ETHEREUM,
    sdk.NetworkWallet.GOERLI,
  ].includes(network as sdk.NetworkWallet)
    ? sdk.NetworkWallet.ETHEREUM
    : sdk.NetworkWallet[network]

  const { onReadClick, onReadAllClick, onClearAllClick } = useNotificationFunc({ setToastOpen })
  const getNotification = React.useCallback(
    async ({ offset = 0, limit = 20, filter }: any) => {
      setShowLoading(true)
      try {
        if (account.accAddress && LoopringAPI.userAPI) {
          const response = await LoopringAPI.userAPI?.getNotificationAll(
            {
              accountId: account.accountId,
              offset,
              limit,
              network: networkWallet,
              notRead: filter?.notRead ?? false,
            },
            account.apiKey,
          )
          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response
          } else {
            const { totalNum, notifications } = response
            if (!filter?.notRead && myNotifyMap.total! == totalNum) {
              getUserNotify()
            }
            setTotal(totalNum)
            setRawData(notifications as R[])
          }
        }
      } catch (error) {
        let errorItem
        if (typeof (error as sdk.RESULT_INFO)?.code === 'number') {
          errorItem = SDK_ERROR_MAP_TO_UI[(error as sdk.RESULT_INFO)?.code ?? 700001]
        } else {
          errorItem = SDK_ERROR_MAP_TO_UI[700012]
        }
        setToastOpen({
          open: true,
          type: ToastType.error,
          content: 'error : ' + errorItem ? t(errorItem.messageKey) : (error as any)?.message,
        })
      }
      setShowLoading(false)
    },
    [account.accAddress],
  )
  return {
    showLoading,
    getNotification,
    rawData,
    total,
    unReads: myNotifyMap.unReads,
    onReadClick: (index: number, item: R) => {
      setShowLoading(true)
      onReadClick(index, item).finally(() => {
        rawData[index].read = true
        setShowLoading(false)
      })
    },
    onReadAllClick: async () => {
      setShowLoading(true)
      await onReadAllClick()
      setShowLoading(false)
    },
    onClearAllClick: async () => {
      setShowLoading(true)
      await onClearAllClick()
      setShowLoading(false)
    },
  }
}
