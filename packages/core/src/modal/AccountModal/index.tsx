import { WithTranslation, withTranslation } from 'react-i18next'
import {
  DepositProps,
  ModalAccount,
  ModalPanel,
  ModalQRCode,
  Toast,
  ToastType,
  useOpenModals,
} from '@loopring-web/component-lib'
import { useSystem } from '@loopring-web/core'
import { useAccountModalForUI } from './hook'
import { Account, AssetsRawDataItem, TOAST_TIME, myLog } from '@loopring-web/common-resources'

export const ModalAccountInfo = withTranslation('common')(
  ({
    // onClose,
    etherscanBaseUrl,
    open,
    assetsRawData,
    isLayer1Only,
    depositProps,
    t,
    ...rest
  }: {
    open: boolean
    isLayer1Only?: boolean
    account: Account
    depositProps: DepositProps<any, any>
    etherscanBaseUrl: string
    assetsRawData: AssetsRawDataItem[]
  } & WithTranslation) => {
    const { baseURL } = useSystem()
    const {
      modals: { isShowAccount, isShowGlobalToast },
      setShowAccount,
      setShowDeposit,
      setShowTransfer,
      setShowWithdraw,
      setShowGlobalToast,
    } = useOpenModals()
    const {
      exportAccountAlertText,
      exportAccountToastOpen,
      setExportAccountToastOpen,
      setCopyToastOpen,
      setOpenQRCode,
      account,
      collectionAdvanceProps,
      transferProps,
      withdrawProps,
      nftTransferProps,
      nftWithdrawProps,
      nftDeployProps,
      resetProps,
      claimProps,
      activeAccountProps,
      exportAccountProps,
      // dualTradeProps,
      sideStackRedeemProps,
      
      copyToastOpen,
      openQRCode,
      accountList,
      currentModal,
      onBackReceive,
      onBackSend,
      // toastOpen,
      // closeToast,
      feeSelectProps

    } = useAccountModalForUI({
      t,
      assetsRawData,
      depositProps,
      etherscanBaseUrl,
      isLayer1Only,
      ...rest,
    })
    // const closeToast = React.useCallback(() => {
    //   setToastOpen({
    //     open: false,
    //     content: '',
    //     type: ToastType.info,
    //   })
    // }, [setToastOpen])

    return (
      <>
        <Toast
          alertText={exportAccountAlertText as string}
          open={exportAccountToastOpen}
          autoHideDuration={TOAST_TIME}
          onClose={() => {
            setExportAccountToastOpen(false)
          }}
          severity={ToastType.success}
        />
        <Toast
          alertText={isShowGlobalToast?.info?.content ?? ''}
          severity={isShowGlobalToast?.info?.type ?? ToastType.success}
          open={isShowGlobalToast?.isShow ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={() =>
            setShowGlobalToast({
              isShow: false,
              info: {
                content: '',
                type: ToastType.info,
              },
            })
          }
        />

        <ModalPanel
          baseURL={baseURL}
          transferProps={{
            ...transferProps,
            onBack: () => {
              if (transferProps.isFromContact) {
                setShowTransfer({ isShow: false })
              } else {
                setShowTransfer({ isShow: false })
                onBackSend()
              }
            },
          }}
          withdrawProps={{
            ...withdrawProps,
            onBack: () => {
              if (withdrawProps.isFromContact) {
                setShowWithdraw({ isShow: false })
              } else {
                setShowWithdraw({ isShow: false })
                onBackSend()
              }
            },
          }}
          depositProps={{
            ...depositProps,
            onBack: () => {
              setShowDeposit({ isShow: false })
              onBackReceive()
            },
          }}
          collectionAdvanceProps={collectionAdvanceProps as any}
          nftTransferProps={
            {
              ...nftTransferProps,
            } as any
          }
          nftWithdrawProps={nftWithdrawProps as any}
          nftDeployProps={nftDeployProps as any}
          claimProps={claimProps as any}
          resetProps={resetProps as any}
          activeAccountProps={activeAccountProps as any}
          exportAccountProps={exportAccountProps}
          assetsData={assetsRawData}
          setExportAccountToastOpen={setExportAccountToastOpen}
          account={account}
          sideStackRedeemProps={sideStackRedeemProps as any}
          feeSelectProps={feeSelectProps}
          {...{ _height: 'var(--modal-height)', _width: 'var(--modal-width)' }}
        />
        <Toast
          alertText={t('labelCopyAddClip')}
          open={copyToastOpen}
          autoHideDuration={TOAST_TIME}
          onClose={() => {
            setCopyToastOpen(false)
          }}
          severity={ToastType.success}
        />
        <ModalQRCode
          open={openQRCode}
          onClose={() => setOpenQRCode(false)}
          title={'ETH Address'}
          description={account?.accAddress}
          url={account?.accAddress}
        />
        <ModalAccount
          open={isShowAccount.isShow}
          onClose={() => {
            setShowAccount({ isShow: false })
            currentModal?.onClose && currentModal?.onClose()
          }}
          panelList={accountList}
          onBack={currentModal?.onBack}
          onQRClick={currentModal?.onQRClick}
          step={isShowAccount.step}
          etherscanBaseUrl={etherscanBaseUrl}
          isLayer2Only={isLayer1Only}
        />
      </>
    )
  },
)
