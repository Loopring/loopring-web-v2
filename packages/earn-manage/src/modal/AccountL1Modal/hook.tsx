/* eslint-disable react/jsx-pascal-case */
import {
  AccountStep,
  Button,
  BasicPanel,
  HadAccount,
  NoAccount,
  QRAddressPanel,
  useOpenModals,
  useSettings,
  IconType,
} from '@loopring-web/component-lib'
import { walletServices } from '@loopring-web/web3-provider'

import React, { useState } from 'react'
import {
  Account,
  AccountStatus,
  AssetsRawDataItem,
  copyToClipBoard,
  MapChainId,
} from '@loopring-web/common-resources'
import {
  goActiveAccount,
  lockAccount,
  onchainHashInfo,
  unlockAccount,
  useAccount,
  useSystem,
  useToast,
} from '@loopring-web/core'
import { AccountStepExtends } from './interface'

export function useAccountModalForL1UI({
  t,
  assetsRawData,
  ...rest
}: {
  t: any
  etherscanBaseUrl: string
  account: Account
  assetsRawData: AssetsRawDataItem[]
  // onClose?: any;
}) {
  const { chainInfos, updateDepositHash } = onchainHashInfo.useOnChainInfo()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const {
    modals: { isShowAccount },
    setShowConnect,
    setShowAccount,
  } = useOpenModals()
  rest = { ...rest, ...isShowAccount.info }

  const { allowTrade } = useSystem()

  const { account, addressShort, shouldShow, setShouldShow } = useAccount()

  const { toastOpen, setToastOpen, closeToast } = useToast()

  const [openQRCode, setOpenQRCode] = useState(false)

  const [copyToastOpen, setCopyToastOpen] = useState(false)

  const onSwitch = React.useCallback(() => {
    setShowAccount({ isShow: false })
    setShouldShow(true)
    setShowConnect({ isShow: shouldShow ?? false })
  }, [setShowAccount, setShouldShow, setShowConnect, shouldShow])

  const onCopy = React.useCallback(async () => {
    copyToClipBoard(account.accAddress)
    setCopyToastOpen(true)
  }, [account, setCopyToastOpen])

  const onViewQRCode = React.useCallback(() => {
    setOpenQRCode(true)
  }, [setOpenQRCode])

  const onDisconnect = React.useCallback(async () => {
    walletServices.sendDisconnect('', 'customer click disconnect')
    setShowAccount({ isShow: false })
  }, [setShowAccount])

  const onQRClick = React.useCallback(() => {
    setShowAccount({ isShow: true, step: AccountStep.QRCode })
  }, [setShowAccount])

  const unlockBtn = React.useMemo(() => {
    return (
      <Button
        variant={'contained'}
        fullWidth
        size={'medium'}
        onClick={() => {
          setShouldShow(true)
          unlockAccount()
        }}
      >
        {t('labelUnLockLayer2')}
      </Button>
    )
  }, [t, setShouldShow])

  const lockBtn = React.useMemo(() => {
    return (
      <Button
        variant={'contained'}
        fullWidth
        size={'medium'}
        onClick={() => {
          lockAccount()
        }}
      >
        {t('labelLockLayer2')}
      </Button>
    )
  }, [t])

  const onQRBack = React.useCallback(() => {
    if (Number.isInteger(isShowAccount.info?.backTo)) {
      setShowAccount({ isShow: true, step: isShowAccount.info?.backTo })
    } else {
      switch (account.readyState) {
        case AccountStatus.NO_ACCOUNT:
        case AccountStatus.DEPOSITING:
          setShowAccount({ isShow: true, step: AccountStep.NoAccount })
          break
        case AccountStatus.LOCKED:
        case AccountStatus.ACTIVATED:
          setShowAccount({ isShow: true, step: AccountStep.HadAccount })
          break
        default:
          setShowAccount({ isShow: false })
      }
    }
  }, [account.readyState, isShowAccount, setShowAccount])

  const closeBtnInfo = React.useCallback(
    (props?: { closeExtend?: (e?: any) => void }) => {
      return {
        btnTxt: 'labelClose',
        callback: (e: any) => {
          setShouldShow(false)
          setShowAccount({ isShow: false })
          if (props?.closeExtend) {
            props?.closeExtend(e)
          }
          // if (onClose) {
          //   onClose(e);
          // }
        },
      }
    },
    [setShouldShow, setShowAccount],
  )

  const accountList = React.useMemo(() => {
    // const isShowAccount?.info.
    return Object.values({
      [AccountStep.NoAccount]: {
        view: (
          <NoAccount
            {...{
              goActiveAccount,
              chainInfos,
              // isSupport,
              noButton: true,
              onClose: (_e: any) => {
                setShouldShow(false)
                setShowAccount({ isShow: false })
              },
              clearDepositHash: () => undefined,
              updateDepositHash,
              ...account,
              etherscanUrl: rest.etherscanBaseUrl,
              onSwitch,
              onCopy,
              onViewQRCode,
              onDisconnect,
              addressShort,
            }}
          />
        ),
        onQRClick,
        height: 'auto',
      },
      [AccountStep.QRCode]: {
        view: (
          <QRAddressPanel
            {...{
              ...rest,
              account,
              btnInfo: {
                ...closeBtnInfo(),
                btnTxt: isShowAccount?.info?.btnTxt ?? t('labelIKnow2'),
              } as any,
              ...account,
              isNewAccount: false,
              isForL2Send: isShowAccount.info?.backTo === AccountStep.AddAssetGateway,
              etherscanUrl: rest.etherscanBaseUrl,
              t,
            }}
          />
        ),
        onBack: onQRBack,
        noClose: true,
        height: 'auto',
      },
      [AccountStep.HadAccount]: {
        view: (
          <HadAccount
            {...{
              ...account,
              clearDepositHash: () => undefined,
              chainInfos,
              noButton: true,
              onSwitch,
              onCopy,
              onClose: (_e: any) => {
                setShouldShow(false)
                setShowAccount({ isShow: false })
              },
              etherscanUrl: rest.etherscanBaseUrl,
              onViewQRCode,
              onDisconnect,
              addressShort,
              etherscanLink: rest.etherscanBaseUrl + 'address/' + account.accAddress,
              mainBtn: account.readyState === AccountStatus.ACTIVATED ? lockBtn : unlockBtn,
            }}
          />
        ),
        onQRClick,
        height: 'auto',
      },
      [AccountStepExtends.Deposit_Processing]: {
        view: <BasicPanel title={'Deposit_Processing'} iconType={IconType.PendingIcon} />,
      },
      [AccountStepExtends.Deposit_sign]: {
        view: <BasicPanel title={'Deposit_sign'} iconType={IconType.SubmitIcon} />,
      },
      [AccountStepExtends.Deposit_failed]: {
        view: <BasicPanel title={'Deposit_failed'} iconType={IconType.FailedIcon} />,
      },
      [AccountStepExtends.withdraw_Processing]: {
        view: <BasicPanel title={'withdraw_Processing'} iconType={IconType.PendingIcon} />,
      },
      [AccountStepExtends.withdraw_sign]: {
        view: <BasicPanel title={'withdraw_sign'} iconType={IconType.SubmitIcon} />,
      },
      [AccountStepExtends.withdraw_failed]: {
        view: <BasicPanel title={'withdraw_failed'} iconType={IconType.FailedIcon} />,
      },
    })
  }, [
    network,
    account,
    isShowAccount.info,
    isShowAccount.error,
    allowTrade,
    chainInfos,
    updateDepositHash,
    rest,
    onSwitch,
    onCopy,
    onViewQRCode,
    onDisconnect,
    addressShort,
    onQRClick,
    lockBtn,
    unlockBtn,
    t,
    onQRBack,
    closeBtnInfo,
    setShowAccount,
  ])

  const currentModal = accountList[isShowAccount.step]

  return {
    copyToastOpen,
    setCopyToastOpen,
    setToastOpen,
    openQRCode,
    setOpenQRCode,
    isShowAccount,
    account,
    closeBtnInfo,
    accountList,
    currentModal,
    toastOpen,
    closeToast,
    // checkActiveStatusProps,
    // dualToastOpen,
  }
}
