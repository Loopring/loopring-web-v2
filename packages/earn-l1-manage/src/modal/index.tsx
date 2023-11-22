import { AlertNotSupport, useOpenModals } from '@loopring-web/component-lib'
import { ModalAccountL1Info } from './AccountL1Modal'
import { withTranslation, WithTranslation } from 'react-i18next'
import { useSystem, useAccountModal, useAccount, ModalWalletConnectPanel } from '@loopring-web/core'
import React from 'react'
import { AssetsRawDataItem } from '@loopring-web/common-resources'

export const ModalGroup = withTranslation('common')(
  ({
    isLayer1Only,
    onWalletConnectPanelClose,
    assetsRawData,
    ...rest
  }: WithTranslation & {
    isLayer1Only?: boolean
    assetsRawData: AssetsRawDataItem[]
    onWalletConnectPanelClose?: (event: MouseEvent) => void
  }) => {
    const { etherscanBaseUrl } = useSystem()
    const {
      modals: {},
    } = useOpenModals()
    useAccountModal()

    const {
      modals: { isShowAccount, isShowConnect, isShowSupport },
      setShowSupport,
    } = useOpenModals()
    const { account } = useAccount()

    return (
      <>
        <AlertNotSupport
          open={isShowSupport.isShow}
          handleClose={() => {
            setShowSupport({ isShow: false })
          }}
        />
        {/*<ModalRedPacketPanel etherscanBaseUrl={etherscanBaseUrl} />*/}
        <ModalWalletConnectPanel
          {...{
            ...rest,
            open: isShowConnect.isShow,
            onClose: onWalletConnectPanelClose,
          }}
        />

        <ModalAccountL1Info
          {...{
            ...rest,
            assetsRawData,
            etherscanBaseUrl,
            account,
            open: isShowAccount.isShow,
          }}
        />
      </>
    )
  },
)
