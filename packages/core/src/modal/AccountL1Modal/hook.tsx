/* eslint-disable react/jsx-pascal-case */
import {
  AccountStep,
  Button,
  Deposit_Approve_Denied,
  Deposit_Approve_WaitForAuth,
  Deposit_Denied,
  Deposit_Failed,
  Deposit_Sign_WaitForRefer,
  Deposit_Submit,
  Deposit_WaitForAuth,
  DepositProps,
  HadAccount,
  NoAccount,
  QRAddressPanel,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import { ConnectProviders, walletServices } from '@loopring-web/web3-provider'

import React, { useState } from 'react'
import {
  Account,
  AccountStatus,
  AssetsRawDataItem,
  copyToClipBoard,
  L1L2_NAME_DEFINED,
  MapChainId,
} from '@loopring-web/common-resources'
import {
  depositServices,
  goActiveAccount,
  LAST_STEP,
  lockAccount,
  onchainHashInfo,
  unlockAccount,
  useAccount,
  useNotify,
  useRampTransPost,
  useSystem,
  useToast,
} from '@loopring-web/core'

export function useAccountModalForL1UI({
  t,
  assetsRawData,
  depositProps,
  ...rest
}: {
  t: any
  etherscanBaseUrl: string
  depositProps: DepositProps<any, any>
  account: Account
  assetsRawData: AssetsRawDataItem[]
  // onClose?: any;
}) {
  const { chainInfos, updateDepositHash } = onchainHashInfo.useOnChainInfo()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const { processRequestRampTransfer } = useRampTransPost()
  const { campaignTagConfig } = useNotify().notifyMap ?? {}
  const {
    modals: { isShowAccount },
    setShowConnect,
    setShowAccount,
    setShowDeposit,
  } = useOpenModals()
  rest = { ...rest, ...isShowAccount.info }

  const { allowTrade } = useSystem()

  const { account, addressShort, shouldShow, setShouldShow } = useAccount()

  const { toastOpen, setToastOpen, closeToast } = useToast()
  // const { nftDepositProps } = useNFTDeposit();

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
              isNewAccount: depositProps.isNewAccount,
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
      [AccountStep.Deposit_Sign_WaitForRefer]: {
        view: (
          <Deposit_Sign_WaitForRefer
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Deposit_Approve_WaitForAuth]: {
        view: (
          <Deposit_Approve_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Deposit_Approve_Denied]: {
        view: (
          <Deposit_Approve_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                depositServices.depositERC20()
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },
      [AccountStep.Deposit_WaitForAuth]: {
        view: (
          <Deposit_WaitForAuth
            symbol={depositProps.tradeData.belong}
            value={depositProps.tradeData.tradeValue}
            chainInfos={chainInfos}
            updateDepositHash={updateDepositHash}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },
      [AccountStep.Deposit_Denied]: {
        view: (
          <Deposit_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                depositServices.depositERC20()
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },
      [AccountStep.Deposit_Failed]: {
        view: (
          <Deposit_Failed
            btnInfo={closeBtnInfo({
              closeExtend: () => {
                setShowAccount({
                  ...isShowAccount,
                  isShow: false,
                  info: {
                    ...isShowAccount.info,
                    lastFailed: LAST_STEP.deposit,
                  },
                })
              },
            })}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        onBack: !depositProps.isAllowInputToAddress
          ? () => {
              setShowAccount({ isShow: false })
              setShowDeposit({ isShow: true })
            }
          : undefined,
      },
      [AccountStep.Deposit_Submit]: {
        view: (
          <Deposit_Submit
            btnInfo={{
              btnTxt: 'labelDoAgain',
              param: {
                method: t('labelDepositL1', {
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                  l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                  ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                }),
              },
              callback: () => {
                setShowAccount({ isShow: false })
                setShowDeposit({
                  isShow: true,
                  symbol: (rest as any)?.symbol ?? isShowAccount?.info?.symbol ?? 'LRC',
                })
              },
            }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
    })
  }, [
    network,
    account,
    isShowAccount.info,
    isShowAccount.error,
    allowTrade,
    depositProps.isNewAccount,
    depositProps.isAllowInputToAddress,
    depositProps.tradeData.belong,
    depositProps.tradeData.tradeValue,
    campaignTagConfig,
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
    setShowDeposit,

    processRequestRampTransfer,
  ])

  const currentModal = accountList[isShowAccount.step]

  return {
    depositProps,
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
