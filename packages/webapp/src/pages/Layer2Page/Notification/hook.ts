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
  // const [total,setTotal]= React.useState<R[]>([])
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
          const response = await LoopringAPI.userAPI?.getNotificationAll({
            // walletAddress: accAddress,
            // network: networkWallet,
            walletAddress: account.accAddress,
            offset,
            limit,
            network: networkWallet,
            notRead: filter?.notRead ?? false,
          })
          if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
            throw response
          } else {
            //TODO
            const { totalNum, notifications } = response
            //   {
            //   totalNum: 5,
            //   notifications: [
            //     {
            //       id: 59,
            //       walletAddress: '0xadfdd447e817a5008a57c892e4430567892305fe',
            //       network: 'ETHEREUM',
            //       messageType: 4,
            //       message: 'You have received 1 USDC in your Loopring L2 wallet.',
            //       read: false,
            //       createAt: 1682075417910,
            //       redirectionContext: '',
            //     },
            //     {
            //       id: 60,
            //       walletAddress: '0xadfdd447e817a5008a57c892e4430567892305fe',
            //       network: 'ETHEREUM',
            //       messageType: 6,
            //       message: 'Your deposit to Loopring L2 succeeded.',
            //       read: false,
            //       createAt: 1682078478712,
            //       redirectionContext: '',
            //     },
            //     {
            //       id: 61,
            //       walletAddress: '0xadfdd447e817a5008a57c892e4430567892305fe',
            //       network: 'ETHEREUM',
            //       messageType: 4,
            //       message: 'You have received 25.2886 USDT in your Loopring L2 wallet.',
            //       read: false,
            //       createAt: 1682080502006,
            //       redirectionContext: '',
            //     },
            //     {
            //       id: 62,
            //       walletAddress: '0xadfdd447e817a5008a57c892e4430567892305fe',
            //       network: 'ETHEREUM',
            //       messageType: 4,
            //       message: 'You have received 0.483106 USDT in your Loopring L2 wallet.',
            //       read: false,
            //       createAt: 1682081803957,
            //       redirectionContext: '',
            //     },
            //     {
            //       id: 63,
            //       walletAddress: '0xadfdd447e817a5008a57c892e4430567892305fe',
            //       network: 'ETHEREUM',
            //       messageType: 2,
            //       message: 'You have received 94.739021912 LRC in your Ethereum L1 wallet.',
            //       read: true,
            //       createAt: 1682081861589,
            //       redirectionContext: '',
            //     },
            //   ],
            // }
            if (!filter?.notRead && myNotifyMap.total! == totalNum) {
              getUserNotify()
            }
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

  //TODO  test use
  // function doAgain() {
  //   notificationService.sendNotification({
  //     id: 62,
  //     walletAddress: '0xadfdd447e817a5008a57c892e4430567892305fe',
  //     network: 'ETHEREUM',
  //     messageType: 4,
  //     message: 'You have received 0.483106 USDT in your Loopring L2 wallet.',
  //     read: false,
  //     createAt: 1682081803957,
  //     redirectionContext: '',
  //   })
  //   setTimeout(() => {
  //     doAgain()
  //   }, 20000)
  // }
  // doAgain()
  return {
    showLoading,
    getNotification,
    rawData,
    total: myNotifyMap.total,
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