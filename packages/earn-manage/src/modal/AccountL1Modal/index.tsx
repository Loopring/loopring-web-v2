import { WithTranslation, withTranslation } from 'react-i18next'
import {
  ModalAccount,
  ModalQRCode,
  Toast,
  ToastType,
  useOpenModals,
} from '@loopring-web/component-lib'
import { useAccountModalForL1UI } from './hook'
import { Account, AssetsRawDataItem, TOAST_TIME } from '@loopring-web/common-resources'

export const ModalAccountL1Info = withTranslation('common')(
  ({
    // onClose,
    etherscanBaseUrl,
    open,
    assetsRawData,
    t,
    ...rest
  }: {
    open: boolean
    account: Account
    etherscanBaseUrl: string
    assetsRawData: AssetsRawDataItem[]
  } & WithTranslation) => {
    // const { isMobile } = useSettings();
    const {
      modals: { isShowAccount },
      setShowAccount,
    } = useOpenModals()
    const {
      setCopyToastOpen,
      setOpenQRCode,
      account,
      copyToastOpen,
      openQRCode,
      accountList,
      currentModal,
      toastOpen,
      closeToast,
    } = useAccountModalForL1UI({
      t,
      assetsRawData,
      etherscanBaseUrl,
      ...rest,
    })

    return (
      <>
        <Toast
          alertText={toastOpen?.content ?? ''}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
        />
        <Toast
          alertText={toastOpen?.content ?? ''}
          severity={toastOpen?.type ?? ToastType.success}
          open={toastOpen?.open ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={closeToast}
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
            // currentModal?.onClose && currentModal?.onClose();
          }}
          panelList={accountList}
          onBack={currentModal?.onBack}
          onQRClick={currentModal?.onQRClick}
          step={isShowAccount.step}
          etherscanBaseUrl={etherscanBaseUrl}
          isLayer2Only={true}
        />
      </>
    )
  },
)
