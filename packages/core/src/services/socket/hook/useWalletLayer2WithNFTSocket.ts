import React from 'react'
import * as _ from 'lodash'
import { globalSetup, SagaStatus } from '@loopring-web/common-resources'
import { useWalletLayer1 } from '../../../stores/walletLayer1'
import { useWalletLayer2 } from '../../../stores/walletLayer2'
import { useWalletLayer2NFT } from '../../../stores/walletLayer2NFT'
import { store, useModalData, useNFTListDeep, walletLayer2Service } from '../../../index'
import { useOpenModals } from '@loopring-web/component-lib'

export const useWalletLayer2WithNFTSocket = ({
  throttleWait = globalSetup.throttleWait,
  walletLayer2Callback,
  walletLayer1Callback,
}: {
  throttleWait?: number
  walletLayer2Callback?: () => void
  walletLayer1Callback?: () => void
}) => {
  const {
    setShowNFTDetail,
    modals: {
      isShowNFTDetail: { isShow: isShowDetail, ...restDetail },
    },
  } = useOpenModals()
  const { nftListReduce } = useNFTListDeep()
  const { updateNFTTransferData, updateNFTWithdrawData } = useModalData()
  const { updateWalletLayer1, status: walletLayer1Status } = useWalletLayer1()
  const { updateWalletLayer2, status: walletLayer2Status } = useWalletLayer2()
  const {
    walletLayer2NFT,
    updateWalletLayer2NFT,
    status: walletLayer2NFTStatus,
  } = useWalletLayer2NFT()
  const subject = React.useMemo(() => walletLayer2Service.onSocket(), [])

  const socketUpdate = React.useCallback(
    _.throttle(({ walletLayer1Status, walletLayer2Status, nftDatas }) => {
      if (walletLayer1Status !== SagaStatus.PENDING) {
        updateWalletLayer1()
      }
      if (walletLayer2Status !== SagaStatus.PENDING) {
        updateWalletLayer2()
      }
      if (walletLayer2NFTStatus !== SagaStatus.PENDING && nftDatas) {
        updateWalletLayer2NFT({
          page: 1,
          nftDatas: nftDatas?.join(','),
          collectionContractAddress: undefined,
          collectionId: undefined,
        })
      }
    }, throttleWait),
    [],
  )
  const _socketUpdate = ({ walletLayer2Status, walletLayer1Status, nftDatas }: any) => {
    socketUpdate({ walletLayer2Status, walletLayer1Status, nftDatas })
  }

  // const  _socketUpdate = React.useCallback(socketUpdate({updateWalletLayer1,updateWalletLayer2,walletLayer1Status,walletLayer2Status}),[]);
  React.useEffect(() => {
    const subscription = subject.subscribe((props: { nftDatas: string[] } | undefined) => {
      const walletLayer2Status = store.getState().walletLayer2.status
      const walletLayer1Status = store.getState().walletLayer1.status
      _socketUpdate({
        walletLayer2Status,
        walletLayer1Status,
        nftDatas: props?.nftDatas,
      })
    })
    return () => subscription.unsubscribe()
  }, [subject])

  const walletLayer2NFTCallback = React.useCallback(async () => {
    if (isShowDetail) {
      const _walletLayer2NFT = nftListReduce(walletLayer2NFT)
      const item = _walletLayer2NFT.find((item: any) => {
        return item.nftData === restDetail?.nftData
      })
      if (item) {
        const nftEle = { ...restDetail, ...item }
        setShowNFTDetail({
          isShow: isShowDetail,
          ...nftEle,
        })
        updateNFTWithdrawData({ ...nftEle })
        updateNFTTransferData({ ...nftEle })
      }
    }
  }, [])
  React.useEffect(() => {
    if (walletLayer2Status === SagaStatus.UNSET && walletLayer2NFTStatus === SagaStatus.UNSET) {
      walletLayer2NFTCallback()
      walletLayer2Callback && walletLayer2Callback()
    }
  }, [walletLayer2Status, walletLayer2NFTStatus])
  React.useEffect(() => {
    if (walletLayer1Callback && walletLayer1Status === SagaStatus.UNSET) {
      walletLayer1Callback()
    }
  }, [walletLayer1Status])
}
