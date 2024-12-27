import { WithTranslation, withTranslation } from 'react-i18next'
import {
  DepositProps,
  Modal,
  ModalAccount,
  ModalPanel,
  ModalQRCode,
  Toast,
  ToastType,
  useOpenModals,
  ETHStakingDetail,
  AccountStep,
} from '@loopring-web/component-lib'
import { useStakingAprTrend, useSystem } from '@loopring-web/core'
import { useAccountModalForUI } from './hook'
import {
  Account,
  AssetsRawDataItem,
  SendAssetList,
  TOAST_TIME,
} from '@loopring-web/common-resources'

export const ModalAccountInfo = withTranslation('common')(
  ({
    // onClose,
    etherscanBaseUrl,
    open,
    assetsRawData,
    isLayer1Only,
    depositProps,
    hideDepositWithdrawBack,
    isWebEarn,
    t,
    ...rest
  }: {
    open: boolean
    isLayer1Only?: boolean
    account: Account
    depositProps: DepositProps<any, any>
    etherscanBaseUrl: string
    assetsRawData: AssetsRawDataItem[]
    hideDepositWithdrawBack?: boolean
    isWebEarn?: boolean
  } & WithTranslation) => {
    const { baseURL } = useSystem()
    const {
      modals: { isShowAccount, isShowGlobalToast, isShowETHStakingApr },
      setShowAccount,
      setShowDeposit,
      setShowTransfer,
      setShowWithdraw,
      setShowGlobalToast,
      setShowETHStakingApr,
    } = useOpenModals()
    const stakingAprProps = useStakingAprTrend()
    const {
      exportAccountAlertText,
      exportAccountToastOpen,
      setExportAccountToastOpen,
      setCopyToastOpen,
      setOpenQRCode,
      account,
      collectionAdvanceProps,
      nftBurnProps,
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
      contactAddProps,
      transferToTaikoProps,
      // toastOpen,
      // closeToast,
    } = useAccountModalForUI({
      t,
      assetsRawData,
      depositProps,
      etherscanBaseUrl,
      isLayer1Only,
      isWebEarn,
      ...rest,
    })

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
          alertText={
            isShowGlobalToast?.info?.messageKey
              ? t(isShowGlobalToast?.info?.messageKey, { ns: ['error', 'common'] })
              : isShowGlobalToast?.info?.content ?? ''
          }
          severity={isShowGlobalToast?.info?.type ?? ToastType.success}
          open={isShowGlobalToast?.isShow ?? false}
          autoHideDuration={TOAST_TIME}
          onClose={() =>
            setShowGlobalToast({
              isShow: false,
              info: {
                content: '',
                messageKey: '',
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
                setShowAccount({
                  isShow: true,
                  step: AccountStep.SendAssetFromContact,
                  info: {
                    ...transferProps.contact,
                    isENSWrong: false,
                    select: SendAssetList.SendAssetToL2.key,
                  },
                })
              } else {
                setShowTransfer({ isShow: false })
                onBackSend()
              }
            },
          }}
          contactAddProps={contactAddProps}
          withdrawProps={{
            ...withdrawProps,
            onBack: hideDepositWithdrawBack
              ? undefined
              : () => {
                  if (withdrawProps.isFromContact) {
                    setShowWithdraw({ isShow: false })
                    setShowAccount({
                      isShow: true,
                      step: AccountStep.SendAssetFromContact,
                      info: {
                        ...withdrawProps.contact,
                        isENSWrong: false,
                        select: SendAssetList.SendAssetToOtherL1.key,
                      },
                    })
                  } else {
                    setShowWithdraw({ isShow: false })
                    onBackSend()
                  }
                },
          }}
          depositProps={{
            ...depositProps,
            onBack: hideDepositWithdrawBack
              ? undefined
              : () => {
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
          nftBurnProps={nftBurnProps}
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
          transferToTaikoProps={transferToTaikoProps}
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
        <Modal
          open={isShowETHStakingApr.isShow}
          onClose={() => setShowETHStakingApr({ ...isShowETHStakingApr, isShow: false })}
          content={<ETHStakingDetail symbol={isShowETHStakingApr.symbol} {...stakingAprProps} />}
        />
      </>
    )
  },
)
