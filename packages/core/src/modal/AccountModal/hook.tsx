/* eslint-disable react/jsx-pascal-case */
import {
  AccountStep,
  AddAsset,
  AddAssetItem,
  Button,
  CheckActiveStatus,
  ClaimWithdraw_Denied,
  ClaimWithdraw_Failed,
  ClaimWithdraw_First_Method_Denied,
  ClaimWithdraw_In_Progress,
  ClaimWithdraw_Submit,
  ClaimWithdraw_WaitForAuth,
  ContinuousBanxaOrder,
  CreateAccount_Approve_Denied,
  CreateAccount_Approve_Submit,
  CreateAccount_Approve_WaitForAuth,
  CreateAccount_Denied,
  CreateAccount_Failed,
  CreateAccount_Submit,
  CreateAccount_WaitForAuth,
  Deposit_Approve_Denied,
  Deposit_Approve_WaitForAuth,
  Deposit_Denied,
  Deposit_Failed,
  Deposit_Sign_WaitForRefer,
  Deposit_Submit,
  Deposit_WaitForAuth,
  DepositProps,
  Dual_Failed,
  Dual_Success,
  Staking_Failed,
  Staking_Success,
  ExportAccount_Approve_WaitForAuth,
  ExportAccount_Failed,
  ExportAccount_Success,
  ExportAccount_User_Denied,
  ForceWithdraw_Denied,
  ForceWithdraw_Failed,
  ForceWithdraw_First_Method_Denied,
  ForceWithdraw_In_Progress,
  ForceWithdraw_Submit,
  ForceWithdraw_WaitForAuth,
  HadAccount,
  NFTDeploy_Denied,
  NFTDeploy_Failed,
  NFTDeploy_First_Method_Denied,
  NFTDeploy_In_Progress,
  NFTDeploy_Submit,
  NFTDeploy_WaitForAuth,
  NFTDeposit_Approve_Denied,
  NFTDeposit_Approve_WaitForAuth,
  NFTDeposit_Denied,
  NFTDeposit_Failed,
  NFTDeposit_Submit,
  NFTDeposit_WaitForAuth,
  NFTMint_Denied,
  NFTMint_Failed,
  NFTMint_First_Method_Denied,
  NFTMint_In_Progress,
  NFTMint_Success,
  NFTMint_WaitForAuth,
  NFTTransfer_Failed,
  NFTTransfer_First_Method_Denied,
  NFTTransfer_In_Progress,
  NFTTransfer_Success,
  NFTTransfer_User_Denied,
  NFTTransfer_WaitForAuth,
  NFTWithdraw_Failed,
  NFTWithdraw_First_Method_Denied,
  NFTWithdraw_In_Progress,
  NFTWithdraw_Success,
  NFTWithdraw_User_Denied,
  NFTWithdraw_WaitForAuth,
  NoAccount,
  QRAddressPanel,
  RedPacketOpen_Claim_Failed,
  RedPacketOpen_Claim_In_Progress,
  RedPacketOpen_Failed,
  RedPacketOpen_In_Progress,
  RedPacketSend_Claim_Success,
  RedPacketSend_Failed,
  RedPacketSend_First_Method_Denied,
  RedPacketSend_In_Progress,
  RedPacketSend_Success,
  RedPacketSend_User_Denied,
  RedPacketSend_WaitForAuth,
  SendAsset,
  SendAssetItem,
  SendNFTAsset,
  ThirdPanelReturn,
  Transfer_banxa_confirm,
  Transfer_Failed,
  Transfer_First_Method_Denied,
  Transfer_In_Progress,
  Transfer_Success,
  Transfer_User_Denied,
  Transfer_WaitForAuth,
  UnlockAccount_Failed,
  UnlockAccount_Success,
  UnlockAccount_User_Denied,
  UnlockAccount_WaitForAuth,
  UpdateAccount,
  UpdateAccount_Approve_WaitForAuth,
  UpdateAccount_Failed,
  UpdateAccount_First_Method_Denied,
  UpdateAccount_Success,
  UpdateAccount_User_Denied,
  useOpenModals,
  VendorMenu,
  Withdraw_Failed,
  Withdraw_First_Method_Denied,
  Withdraw_In_Progress,
  Withdraw_Success,
  Withdraw_User_Denied,
  Withdraw_WaitForAuth,
  Staking_Redeem_Success,
  Staking_Redeem_Failed,
  BtradeSwap_Settled,
  BtradeSwap_Delivering,
  BtradeSwap_Failed,
  BtradeSwap_Pending,
  AMM_Pending,
  useSettings,
  TOASTOPEN,
  setShowGlobalToast,
  SendFromContact,
  NFTBurn_Failed,
  NFTBurn_First_Method_Denied,
  NFTBurn_In_Progress,
  NFTBurn_Success,
  NFTBurn_User_Denied,
  NFTBurn_WaitForAuth,
	// NFTBurn_Failed,
	// NFTBurn_First_Method_Denied,
	// NFTBurn_In_Progress,
	// NFTBurn_Success,
	// NFTBurn_User_Denied,
	// NFTBurn_WaitForAuth,
  // SendFromContact,
  VaultTrade_Success,
  VaultTrade_Failed,
  VaultTrade_In_Progress,
  VaultJoin_Success,
  VaultJoin_Failed,
  VaultJoin_In_Progress,
  VaultRedeem_Success,
  VaultRedeem_Failed,
  VaultRedeem_In_Progress,
  VaultBorrow_Success,
  VaultBorrow_Failed,
  VaultBorrow_In_Progress,
  VaultRepay_Success,
  VaultRepay_Failed,
  VaultRepay_In_Progress,
} from '@loopring-web/component-lib'
import { ConnectProviders, connectProvides, walletServices } from '@loopring-web/web3-provider'

import React, { useState } from 'react'
import {
  Account,
  AccountStatus,
  AddAssetList,
  AddAssetListMap,
  AssetsRawDataItem,
  Bridge,
  copyToClipBoard,
  FeeInfo,
  InvestRouter,
  InvestType,
  L1L2_NAME_DEFINED,
  MapChainId,
  NFTSubRouter,
  NFTWholeINFO,
  RouterPath,
  SendAssetList,
  SendAssetListMap,
  SendNFTAssetList,
  TradeTypes,
  VendorProviders,
} from '@loopring-web/common-resources'
import {
  banxaService,
  depositServices,
  goActiveAccount,
  LAST_STEP,
  lockAccount,
  mintService,
  offFaitService,
  onchainHashInfo,
  OrderENDReason,
  store,
  unlockAccount,
  useAccount,
  useActiveAccount,
  useCheckActiveStatus,
  useCollectionAdvanceMeta,
  useContacts,
  useCreateRedPacket,
  useExportAccount,
  useForceWithdraw,
	useModalData,
	useNFTBurn,
  useNFTDeploy,
  useNFTMintAdvance,
  useNFTTransfer,
  useNFTWithdraw,
  useNotify,
  useRampTransPost,
  useRedPacketScanQrcodeSuccess,
  useReset,
  useStakeTradeExit,
  useSystem,
  useTransfer,
  useVendor,
  useWalletLayer2,
  useWithdraw,
} from '@loopring-web/core'
import * as sdk from '@loopring-web/loopring-sdk'
import { useHistory } from 'react-router-dom'
import { ImportRedPacket } from './components/QRCodeScanner'
import { useClaimConfirm } from '../../hooks/useractions/useClaimConfirm'
import { useContactAdd } from '../../hooks/useractions/useContactAdd'

export function useAccountModalForUI({
  t,
  assetsRawData,
  isLayer1Only = false,
  depositProps,
  isWebEarn,
  ...rest
}: {
  t: any
  etherscanBaseUrl: string
  isLayer1Only?: boolean
  depositProps: DepositProps<any, any>
  account: Account
  assetsRawData: AssetsRawDataItem[]
  isWebEarn?: boolean
  // onClose?: any;
}) {
  const { chainInfos, updateDepositHash, clearDepositHash } = onchainHashInfo.useOnChainInfo()

  const { updateWalletLayer2 } = useWalletLayer2()
  const { processRequestRampTransfer } = useRampTransPost()
  const { campaignTagConfig } = useNotify().notifyMap ?? {}
  const history = useHistory()
  const {
    modals: { isShowAccount },
    setShowConnect,
    setShowAccount,
    setShowDeposit,
    setShowTransfer,
    setShowWithdraw,
    setShowResetAccount,
    setShowActiveAccount,
    setShowNFTTransfer,
    setShowNFTWithdraw,
  } = useOpenModals()
  rest = { ...rest, ...isShowAccount.info }
  const {
    nftDepositValue,
    nftTransferValue,
    nftWithdrawValue,
    nftDeployValue,
    transferValue,
    withdrawValue,
    resetTransferData,
    resetWithdrawData,
    resetDepositData,
    forceWithdrawValue,
    claimValue,
  } = useModalData()

  const { chainId, allowTrade, app } = useSystem()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const { account, addressShort, shouldShow, setShouldShow } = useAccount()
  const redPacketScanQrcodeSuccessProps = useRedPacketScanQrcodeSuccess()

  const { exportAccountAlertText, exportAccountToastOpen, setExportAccountToastOpen } =
    useExportAccount()

  const { retryBtn: nftMintAdvanceRetryBtn } = useNFTMintAdvance()
  const { retryBtn: creatRedPacketRetryBtn } = useCreateRedPacket({
    assetsRawData,
    isShow: false,
  })
  // const [toastOpen, setToastOpen] = React.useState<TOASTOPEN>({
  //   open: false,
  //   content: '',
  //   type: ToastType.info,
  // })

  const { collectionAdvanceProps } = useCollectionAdvanceMeta({
    setCollectionToastOpen: (info: TOASTOPEN) => {
      setShowGlobalToast({ isShow: info.open, info: { ...info } })
    },
  })
  const { vendorListBuy, banxaRef } = useVendor()
  // const { nftMintProps } = useNFTMint();
  const { withdrawProps } = useWithdraw()
  const { transferProps } = useTransfer()
  const { nftWithdrawProps } = useNFTWithdraw()
  const { nftTransferProps } = useNFTTransfer()
	const { nftBurnProps } = useNFTBurn()
  const { nftDeployProps } = useNFTDeploy()
  const { contactAddProps } = useContactAdd()
  const { stakeWrapProps } = useStakeTradeExit({
    setToastOpen: (info: TOASTOPEN) => setShowGlobalToast({ isShow: info.open, info: { ...info } }),
  })
  const { retryBtn: forceWithdrawRetry } = useForceWithdraw()
  const { claimProps, retryBtn: claimRetryBtn } = useClaimConfirm()
  const { resetProps } = useReset()
  const { activeAccountProps, activeAccountCheckFeeIsEnough } = useActiveAccount()
  const [tryCheckL2BalanceTimes, setTryCheckL2BalanceTimes] = React.useState(5)

  // const { nftDepositProps } = useNFTDeposit();
  const { exportAccountProps } = useExportAccount()

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
          // setShowAccount({ isShow: true, step: AccountStep.HadAccount })
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
        },
      }
    },
    [setShouldShow, setShowAccount],
  )
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1)
  const clearDeposit = React.useCallback(() => {
    clearDepositHash(account.accAddress)
  }, [clearDepositHash, account])

  const updateDepositStatus = React.useCallback(async () => {
    const chainInfos = store.getState().localStore.chainHashInfos[chainId]
    const { accAddress } = account
    clearTimeout(nodeTimer.current as NodeJS.Timeout)
    if (
      chainInfos &&
      chainInfos.depositHashes &&
      chainInfos.depositHashes[accAddress] &&
      connectProvides
    ) {
      const depositList = chainInfos.depositHashes[accAddress]
      let flag = false
      depositList.forEach((txInfo) => {
        if (txInfo.status === 'pending' && connectProvides?.usedWeb3?.eth?.getTransactionReceipt) {
          connectProvides.usedWeb3.eth.getTransactionReceipt(txInfo.hash).then((result) => {
            if (result) {
              updateDepositHash(txInfo.hash, accAddress, result.status ? 'success' : 'failed')
            }
          })
          flag = true
        }
      })
      if (flag) {
        setTryCheckL2BalanceTimes(20)
        let wait = 60000
        if (
          account.readyState &&
          [AccountStatus.DEPOSITING, AccountStatus.NOT_ACTIVE].includes(
            // @ts-ignore
            account?.readyState,
          )
        ) {
          wait = 30000
        }
        nodeTimer.current = setTimeout(() => {
          updateDepositStatus()
        }, wait)
        updateWalletLayer2()
      } else {
        setTryCheckL2BalanceTimes((state) => {
          if (state > 0) {
            updateWalletLayer2()
            nodeTimer.current = setTimeout(() => {
              updateDepositStatus()
            }, 10000)
          }
          return state - 1
        })
      }
    }
  }, [account, chainId, updateDepositHash, updateWalletLayer2, nodeTimer, tryCheckL2BalanceTimes])
  React.useEffect(() => {
    if (chainInfos?.depositHashes && chainInfos?.depositHashes[account.accAddress]) {
      updateDepositStatus()
    }
    return () => {
      clearTimeout(nodeTimer.current as NodeJS.Timeout)
    }
  }, [account.accAddress, chainInfos?.depositHashes])
  const { setShowLayerSwapNotice, setShowAnotherNetworkNotice } = useOpenModals()

  const disbaleList = account.isInCounterFactualStatus ? [AddAssetList.FromMyL1.key] : undefined

  const addAssetList: AddAssetItem[] = React.useMemo(
    () =>
      AddAssetListMap[network].map((item: string) => {
        switch (item) {
          case AddAssetList.BuyWithCard.key:
            return {
              ...AddAssetList.BuyWithCard,
              handleSelect: () => {
                setShowAccount({ isShow: true, step: AccountStep.PayWithCard })
              },
            }
          case AddAssetList.FromMyL1.key:
            return {
              ...AddAssetList.FromMyL1,
              handleSelect: () => {
                setShowAccount({
                  isShow: false,
                  info: { lastFailed: undefined },
                })
                if (isShowAccount?.info?.symbol) {
                  resetDepositData()
                }
                setShowDeposit({
                  isShow: true,
                  symbol: isShowAccount?.info?.symbol,
                })
              },
            }
          case AddAssetList.FromOtherL1.key:
            return {
              ...AddAssetList.FromOtherL1,
              handleSelect: () => {
                let dex = 'labelAddAssetTitleBridgeDes'
                if (
                  account.readyState &&
                  [
                    AccountStatus.DEPOSITING,
                    AccountStatus.NOT_ACTIVE,
                    AccountStatus.NO_ACCOUNT,
                  ].includes(
                    // @ts-ignore
                    account?.readyState,
                  )
                ) {
                  dex = 'labelAddAssetTitleBridgeDesActive'
                }
                setShowAccount({
                  isShow: true,
                  step: AccountStep.ThirdPanelReturn,
                  info: {
                    title: t('labelAddAssetTitleBridge', {
                      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
                    }),
                    description: t(dex, {
                      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
                    }),
                  },
                })

                window.open(
                  Bridge +
                    `?l2account=${account.accAddress}&token=${
                      isShowAccount?.info?.symbol ?? ''
                    }&__trace_isSharedBy=loopringExchange`,
                )
                window.opener = null
              },
            }
          case AddAssetList.FromOtherL2.key:
            return {
              ...AddAssetList.FromOtherL2,
              handleSelect: () => {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.QRCode,
                  info: { backTo: AccountStep.AddAssetGateway },
                })
              },
            }
          case AddAssetList.FromExchange.key:
            return {
              ...AddAssetList.FromExchange,
              handleSelect: () => {
                let dex = 'labelAddAssetTitleExchangeDes'
                if (
                  account.readyState &&
                  [
                    AccountStatus.DEPOSITING,
                    AccountStatus.NOT_ACTIVE,
                    AccountStatus.NO_ACCOUNT,
                  ].includes(
                    // @ts-ignore
                    account?.readyState,
                  )
                ) {
                  dex = 'labelAddAssetTitleExchangeDesActive'
                }
                setShowAccount({
                  isShow: true,
                  step: AccountStep.ThirdPanelReturn,
                  info: {
                    title: t('labelAddAssetTitleExchange'),
                    description: t(dex, {
                      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
                    }),
                  },
                })
                setShowLayerSwapNotice({ isShow: true })
              },
            }
          case AddAssetList.FromAnotherNet.key:
            return {
              ...AddAssetList.FromAnotherNet,
              handleSelect: () => {
                let dex = 'labelAddAssetTitleAnotherNetDes'
                if (
                  account.readyState &&
                  [
                    AccountStatus.DEPOSITING,
                    AccountStatus.NOT_ACTIVE,
                    AccountStatus.NO_ACCOUNT,
                  ].includes(
                    // @ts-ignore
                    account?.readyState,
                  )
                ) {
                  dex = 'labelAddAssetTitleAnotherNetDesActive'
                }
                setShowAccount({
                  isShow: true,
                  step: AccountStep.ThirdPanelReturn,
                  info: {
                    title: t('labelFromAnotherNet'),
                    description: t(dex, {
                      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                      loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
                    }),
                  },
                })
                setShowAnotherNetworkNotice({
                  isShow: true,
                  info: { url: 'https://www.orbiter.finance/?source=Ethereum&dest=Loopring' },
                })
              },
            }
        }

        // .
      }),
    [
      network,
      account.accAddress,
      isShowAccount?.info?.symbol,
      setShowAccount,
      setShowDeposit,
      setShowLayerSwapNotice,
    ],
  )
  const sendAssetList: SendAssetItem[] = React.useMemo(
    () =>
      SendAssetListMap[network].map((item: string) => {
        switch (item) {
          case SendAssetList.SendAssetToL2.key:
            return {
              ...SendAssetList.SendAssetToL2,
              handleSelect: () => {
                setShowAccount({
                  isShow: false,
                  info: { lastFailed: undefined },
                })
                if (isShowAccount?.info?.symbol) {
                  resetTransferData()
                }
                setShowTransfer({
                  isShow: true,
                  symbol: isShowAccount?.info?.symbol,
                })
              },
            }
          case SendAssetList.SendAssetToMyL1.key:
            return {
              ...SendAssetList.SendAssetToMyL1,
              handleSelect: () => {
                setShowAccount({
                  isShow: false,
                  info: { lastFailed: undefined },
                })
                if (isShowAccount?.info?.symbol) {
                  resetWithdrawData()
                }
                setShowWithdraw({
                  isShow: true,
                  info: { isToMyself: true },
                  symbol: isShowAccount?.info?.symbol,
                })
              },
            }
          case SendAssetList.SendAssetToOtherL1.key:
            return {
              ...SendAssetList.SendAssetToOtherL1,
              handleSelect: () => {
                setShowAccount({
                  isShow: false,
                  info: { lastFailed: undefined },
                })
                if (isShowAccount?.info?.symbol) {
                  resetWithdrawData()
                }
                setShowWithdraw({
                  isShow: true,
                  info: { isToMyself: false },
                  symbol: isShowAccount?.info?.symbol,
                })
              },
            }
          case SendAssetList.SendAssetToAnotherNet.key:
            return {
              ...SendAssetList.SendAssetToAnotherNet,
              handleSelect: () => {
                setShowAccount({
                  isShow: false,
                })
                setShowAnotherNetworkNotice({
                  isShow: true,
                  info: { url: 'https://www.orbiter.finance/?source=Loopring&dest=Ethereum' },
                })
                // window.open('https://www.orbiter.finance/?source=Loopring&dest=Ethereum')
                // window.opener = null
              },
            }
        }
      }),
    [network, isShowAccount?.info?.symbol, setShowAccount, setShowTransfer, setShowWithdraw],
  )
  const sendNFTAssetList: SendAssetItem[] = React.useMemo(
    () => [
      {
        ...SendNFTAssetList.SendAssetToL2,
        handleSelect: (_e) => {
          setShowAccount({ isShow: false })
          setShowNFTTransfer({
            isShow: true,
          })
        },
      },
      {
        ...SendNFTAssetList.SendAssetToMyL1,
        handleSelect: () => {
          setShowAccount({ isShow: false })
          setShowNFTWithdraw({
            isShow: true,
            info: { isToMyself: true, lastFailed: undefined },
          })
        },
      },
      {
        ...SendNFTAssetList.SendAssetToOtherL1,
        handleSelect: () => {
          setShowAccount({
            isShow: false,
          })
          setShowNFTWithdraw({
            isShow: true,
            info: { isToMyself: false, lastFailed: undefined },
          })
        },
      },
    ],
    [setShowAccount, setShowNFTTransfer, setShowNFTWithdraw],
  )
  const onBackReceive = React.useCallback(() => {
    setShowAccount({
      isShow: true,
      step: AccountStep.AddAssetGateway,
      info: { ...isShowAccount?.info },
    })
  }, [isShowAccount?.info, setShowAccount])
  const onBackSend = React.useCallback(() => {
    setShowAccount({
      isShow: true,
      step: AccountStep.SendAssetGateway,
      info: { ...isShowAccount?.info },
    })
  }, [isShowAccount?.info, setShowAccount])

  const { checkActiveStatusProps } = useCheckActiveStatus<FeeInfo>({
    setToastOpen: (info: TOASTOPEN) => setShowGlobalToast({ isShow: info.open, info: { ...info } }),
    onDisconnect,
    isDepositing: !!chainInfos?.depositHashes[account?.accAddress]?.length,
    chargeFeeTokenList: activeAccountProps.chargeFeeTokenList as FeeInfo[],
    checkFeeIsEnough: activeAccountCheckFeeIsEnough,
    isFeeNotEnough: activeAccountProps.isFeeNotEnough,
  })
  const isEarn = app === 'earn'

  const accountList = React.useMemo(() => {
    // const isShowAccount?.info.
    return Object.values({
      [AccountStep.ContinuousBanxaOrder]: {
        view: (
          <ContinuousBanxaOrder
            title={t('labelBanxaTitleCreateAgain')}
            btnInfo={{
              isLoading: isShowAccount?.info?.isBanxaLaunchLoading,
              callback: () => {
                setShouldShow(false)
                setShowAccount({ isShow: false })
              },
              btnTxt: t('labelBanxaContinuous'),
            }}
            orderId={isShowAccount?.info?.orderId}
            chainId={chainId as any}
            btnInfo2={{
              isLoading: isShowAccount?.info?.isBanxaLaunchLoading,
              callback: () => {
                setShowAccount({ isShow: false })
                offFaitService.offRampCancel({
                  data: {
                    product: VendorProviders.Banxa,
                    orderId: isShowAccount?.info?.orderId,
                  },
                })
                banxaService.banxaStart(true)
              },
              btnTxt: t('labelBanxaCreate'),
            }}
          />
        ),
        height: 'auto',
        onClose: () => {
          banxaService.banxaEnd({
            reason: OrderENDReason.UserCancel,
            data: { resource: 'on close' },
          })
        },
      },
      [AccountStep.ThirdPanelReturn]: {
        view: (
          <ThirdPanelReturn
            title={isShowAccount?.info?.title ?? ''}
            description={isShowAccount?.info?.description}
            btnInfo={{
              ...closeBtnInfo(),
              btnTxt: isShowAccount?.info?.btnTxt ?? t('labelIKnow2'),
            }}
          />
        ),
        height: 'auto',
      },
      [AccountStep.CheckingActive]: {
        view: (
          <CheckActiveStatus
            {...{
              ...checkActiveStatusProps,
              updateDepositHash,
              chainInfos,
              clearDepositHash: clearDeposit,
              ...account,
              etherscanUrl: rest.etherscanBaseUrl,
            }}
          />
        ),
        height: 'auto',
      },
      [AccountStep.AddAssetGateway]: {
        height: 'auto',
        view: (
          <AddAsset
            symbol={isShowAccount?.info?.symbol}
            addAssetList={addAssetList}
            allowTrade={allowTrade}
            isNewAccount={depositProps.isNewAccount}
            disbaleList={disbaleList}
          />
        ),
      },
      [AccountStep.SendAssetGateway]: {
        view: (
          <SendAsset
            isToL1={isShowAccount?.info?.isToL1}
            symbol={isShowAccount?.info?.symbol}
            sendAssetList={sendAssetList}
            allowTrade={allowTrade}
          />
        ),
      },
      [AccountStep.SendAssetFromContact]: {
        view: (
          <SendFromContact
            {...(isShowAccount?.info as any)}
               />
        ),
      },
      [AccountStep.SendNFTGateway]: {
        view: (
          <SendNFTAsset
            nftData={{ ...isShowAccount?.info } as Partial<NFTWholeINFO>}
            sendAssetList={sendNFTAssetList}
            allowTrade={allowTrade}
            isNotAllowToL1={account.isContract1XAddress}
          />
        ),
      },
      [AccountStep.PayWithCard]: {
        view: (
          <VendorMenu
            vendorList={vendorListBuy}
            banxaRef={banxaRef}
            type={TradeTypes.Buy}
            vendorForce={undefined}
            campaignTagConfig={campaignTagConfig}
          />
        ),
        onBack: onBackReceive,
      },
      [AccountStep.NoAccount]: {
        view: (
          <NoAccount
            {...{
              goActiveAccount,
              chainInfos,
              // isSupport,
              noButton: isLayer1Only,
              onClose: (_e: any) => {
                setShouldShow(false)
                setShowAccount({ isShow: false })
              },
              updateDepositHash,
              clearDepositHash: clearDeposit,
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
        height: isLayer1Only ? 'auto' : null,
      },
      [AccountStep.HadAccount]: {
        view: (
          <HadAccount
            {...{
              ...account,
              clearDepositHash: clearDeposit,
              chainInfos,
              noButton: isLayer1Only,
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
              hideVIPlevel: isWebEarn ? true : false,
            }}
          />
        ),
        onQRClick,
        height: isLayer1Only ? 'auto' : null,
      },
      [AccountStep.QRCodeScanner]: {
        view: <ImportRedPacket {...redPacketScanQrcodeSuccessProps} />,
        onBack: () => {
          setShowAccount({ isShow: false })
        },
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
      [AccountStep.Deposit_Sign_WaitForRefer]: {
        view: (
          <Deposit_Sign_WaitForRefer
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
            title={isEarn ? 'labelDeposit' : 'labelL1toL2'}
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
            title={isEarn ? 'labelDeposit' : 'labelL1toL2'}
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
            title={isEarn ? 'labelDeposit' : 'labelL1toL2'}
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
            title={isEarn ? 'labelDeposit' : 'labelL1toL2'}
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
            title={isEarn ? 'labelDeposit' : 'labelL1toL2'}
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
            title={isEarn ? 'labelDeposit' : 'labelL1toL2'}
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
                  loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
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
            title={isEarn ? 'labelDeposit' : 'labelL1toL2'}
          />
        ),
      },
      [AccountStep.NFTDeposit_Approve_WaitForAuth]: {
        view: (
          <NFTDeposit_Approve_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTDeposit_Approve_Denied]: {
        view: (
          <NFTDeposit_Approve_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                depositServices.depositNFT()
                // setShowAccount({ isShow: false });
              },
            }}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },

      [AccountStep.NFTDeposit_WaitForAuth]: {
        view: (
          <NFTDeposit_WaitForAuth
            symbol={nftDepositValue.name}
            value={nftDepositValue.tradeValue}
            chainInfos={chainInfos}
            updateDepositHash={updateDepositHash}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },
      [AccountStep.NFTDeposit_Denied]: {
        view: (
          <NFTDeposit_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                depositServices.depositNFT()
              },
            }}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },
      [AccountStep.NFTDeposit_Failed]: {
        view: (
          <NFTDeposit_Failed
            btnInfo={closeBtnInfo({
              closeExtend: () => {
                setShowAccount({
                  ...isShowAccount,
                  isShow: false,
                  info: {
                    ...isShowAccount.info,
                    lastFailed: LAST_STEP.nftDeposit,
                  },
                })
              },
            })}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },
      [AccountStep.NFTDeposit_Submit]: {
        view: (
          <NFTDeposit_Submit
            btnInfo={{
              btnTxt: 'labelDoAgain',
              param: {
                method: t('labelDepositNFTL1', {
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                  l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                  ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                  loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
                }),
              },
              callback: () => {
                setShowAccount({ isShow: false })
                history.push(`${RouterPath.nft}/${NFTSubRouter.depositNFT}`)
              },
            }}
            {...{
              ...rest,
              account,
              ...nftDepositValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTMint_WaitForAuth]: {
        view: (
          <NFTMint_WaitForAuth
            symbol={isShowAccount.info?.name}
            value={isShowAccount.info?.value}
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
      [AccountStep.NFTMint_Denied]: {
        view: (
          <NFTMint_Denied
            symbol={isShowAccount.info?.name}
            value={isShowAccount.info?.value}
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                if (isShowAccount.info?.isAdvanceMint) {
                  nftMintAdvanceRetryBtn()
                } else {
                  mintService.goMintConfirm()
                }
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
      [AccountStep.NFTMint_First_Method_Denied]: {
        view: (
          <NFTMint_First_Method_Denied
            btnInfo={{
              btnTxt: 'labelTryAnother',
              callback: () => {
                if (isShowAccount.info?.isAdvanceMint) {
                  nftMintAdvanceRetryBtn(true)
                } else {
                  mintService.goMintConfirm(true)
                }
              },
            }}
            symbol={isShowAccount.info?.name}
            value={isShowAccount.info?.value}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTMint_In_Progress]: {
        view: (
          <NFTMint_In_Progress
            symbol={isShowAccount.info?.name}
            value={isShowAccount.info?.value}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTMint_Failed]: {
        view: (
          <NFTMint_Failed
            btnInfo={closeBtnInfo()}
            symbol={isShowAccount.info?.name}
            value={isShowAccount.info?.value}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },
      [AccountStep.NFTMint_Success]: {
        view: (
          <NFTMint_Success
            // btnInfo={closeBtnInfo}
            btnInfo={{
              btnTxt: 'labelDoAgain',
              param: { method: t('labelMintNFT') },
              callback: () => {
                setShowAccount({ isShow: false })
                if (isShowAccount.info?.lastStep === LAST_STEP.nftMint) {
                  history.push(
                    `${RouterPath.nft}/${NFTSubRouter.mintNFT}/${isShowAccount.info?.collection?.contractAddress}`,
                  )
                } else {
                  history.push(`${RouterPath.nft}/${NFTSubRouter.mintNFTAdvance}`)
                }
              },
            }}
            symbol={isShowAccount.info?.name}
            value={isShowAccount.info?.value}
            {...{
              t,
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: 'Txn Hash',
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
            }}
          />
        ),
      },

      [AccountStep.RedPacketSend_WaitForAuth]: {
        view: (
          <RedPacketSend_WaitForAuth
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

      [AccountStep.RedPacketSend_First_Method_Denied]: {
        view: (
          <RedPacketSend_First_Method_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                creatRedPacketRetryBtn(true)
              },
            }}
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },

      [AccountStep.RedPacketSend_In_Progress]: {
        view: (
          <RedPacketSend_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },

      [AccountStep.RedPacketSend_User_Denied]: {
        view: (
          <RedPacketSend_User_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                creatRedPacketRetryBtn()
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

      [AccountStep.RedPacketSend_Failed]: {
        view: (
          <RedPacketSend_Failed
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              info: {
                ...isShowAccount.info,
                lastFailed: LAST_STEP.redPacketSend,
              },
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },

      [AccountStep.RedPacketSend_Success]: {
        view: (
          <RedPacketSend_Success
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              info: {
                ...isShowAccount.info,
              },
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },

      [AccountStep.RedPacketOpen_In_Progress]: {
        view: (
          <RedPacketOpen_In_Progress
            btnInfo={undefined}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },

      [AccountStep.RedPacketOpen_Failed]: {
        view: (
          <RedPacketOpen_Failed
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },

      [AccountStep.RedPacketOpen_Claim_In_Progress]: {
        view: (
          <RedPacketOpen_Claim_In_Progress
            btnInfo={closeBtnInfo()}
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

      [AccountStep.RedPacketSend_Claim_Success]: {
        view: (
          <RedPacketSend_Claim_Success
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },
      [AccountStep.RedPacketOpen_Claim_Failed]: {
        view: (
          <RedPacketOpen_Claim_Failed
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },

      [AccountStep.NFTDeploy_WaitForAuth]: {
        view: (
          <NFTDeploy_WaitForAuth
            symbol={nftDeployValue.name}
            value={nftDeployValue.tradeValue}
            chainInfos={chainInfos}
            updateDepositHash={updateDepositHash}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },
      [AccountStep.NFTDeploy_Denied]: {
        view: (
          <NFTDeploy_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                nftDeployProps.onNFTDeployClick(nftDeployValue as any)
              },
            }}
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },
      [AccountStep.NFTDeploy_First_Method_Denied]: {
        view: (
          <NFTDeploy_First_Method_Denied
            btnInfo={{
              btnTxt: 'labelTryAnother',
              callback: () => {
                nftDeployProps.onNFTDeployClick(nftDeployValue as any, false)
              },
            }}
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTDeploy_In_Progress]: {
        view: (
          <NFTDeploy_In_Progress
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTDeploy_Failed]: {
        view: (
          <NFTDeploy_Failed
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },
      [AccountStep.NFTDeploy_Submit]: {
        view: (
          <NFTDeploy_Submit
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              ...nftDeployValue,
              t,
            }}
          />
        ),
        onBack: () => {
          setShowAccount({ isShow: false })
        },
      },

      [AccountStep.ForceWithdraw_WaitForAuth]: {
        view: (
          <ForceWithdraw_WaitForAuth
            symbol={forceWithdrawValue.belong}
            value={forceWithdrawValue.tradeValue}
            chainInfos={chainInfos}
            updateDepositHash={updateDepositHash}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              ...forceWithdrawValue,
              t,
            }}
          />
        ),
        // onBack: () => {
        //   setShowAccount({ isShow: false });
        // },
      },
      [AccountStep.ForceWithdraw_Denied]: {
        view: (
          <ForceWithdraw_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                forceWithdrawRetry()
              },
            }}
            {...{
              ...rest,
              account,
              ...forceWithdrawValue,
              t,
            }}
          />
        ),
        // onBack: () => {
        //   setShowAccount({ isShow: false });
        // },
      },
      [AccountStep.ForceWithdraw_First_Method_Denied]: {
        view: (
          <ForceWithdraw_First_Method_Denied
            btnInfo={{
              btnTxt: 'labelTryAnother',
              callback: () => {
                // setShowAccount({ isShow: false });
                forceWithdrawRetry(true)
              },
            }}
            {...{
              ...rest,
              account,
              ...forceWithdrawValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.ForceWithdraw_In_Progress]: {
        view: (
          <ForceWithdraw_In_Progress
            {...{
              ...rest,
              account,
              ...forceWithdrawValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.ForceWithdraw_Failed]: {
        view: (
          <ForceWithdraw_Failed
            btnInfo={closeBtnInfo({
              closeExtend: () => {
                setShowAccount({
                  ...isShowAccount,
                  isShow: false,
                  info: {
                    ...isShowAccount.info,
                    lastFailed: LAST_STEP.forceWithdraw,
                  },
                })
              },
            })}
            {...{
              ...rest,
              account,
              ...forceWithdrawValue,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        // onBack: () => {
        //   setShowAccount({ isShow: false });
        // },
      },
      [AccountStep.ForceWithdraw_Submit]: {
        view: (
          <ForceWithdraw_Submit
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              ...forceWithdrawValue,
              t,
            }}
          />
        ),
      },

      // ClaimWithdraw
      [AccountStep.ClaimWithdraw_WaitForAuth]: {
        view: (
          <ClaimWithdraw_WaitForAuth
            symbol={claimValue?.belong}
            value={claimValue?.tradeValue}
            chainInfos={chainInfos}
            // updateDepositHash={updateDepositHash}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              ...claimValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.ClaimWithdraw_Denied]: {
        view: (
          <ClaimWithdraw_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                claimRetryBtn()
              },
            }}
            {...{
              ...rest,
              account,
              ...claimValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.ClaimWithdraw_First_Method_Denied]: {
        view: (
          <ClaimWithdraw_First_Method_Denied
            btnInfo={{
              btnTxt: 'labelTryAnother',
              callback: () => {
                claimRetryBtn(true)
              },
            }}
            {...{
              ...rest,
              account,
              ...claimValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.ClaimWithdraw_In_Progress]: {
        view: (
          <ClaimWithdraw_In_Progress
            {...{
              ...rest,
              account,
              ...claimValue,
              t,
            }}
          />
        ),
      },
      [AccountStep.ClaimWithdraw_Failed]: {
        view: (
          <ClaimWithdraw_Failed
            btnInfo={closeBtnInfo({
              closeExtend: () => {
                setShowAccount({
                  ...isShowAccount,
                  isShow: false,
                  info: {
                    ...isShowAccount.info,
                    lastFailed: LAST_STEP.claim,
                  },
                })
              },
            })}
            {...{
              ...rest,
              account,
              ...claimValue,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },
      [AccountStep.ClaimWithdraw_Submit]: {
        view: (
          <ClaimWithdraw_Submit
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              ...claimValue,
              t,
            }}
          />
        ),
      },

      // transfer
      [AccountStep.Transfer_WaitForAuth]: {
        view: (
          <Transfer_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_First_Method_Denied]: {
        view: (
          <Transfer_First_Method_Denied
            btnInfo={{
              btnTxt: 'labelTryAnother',
              callback: () => {
                transferProps.onTransferClick(transferValue as any, false)
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
      [AccountStep.Transfer_User_Denied]: {
        view: (
          <Transfer_User_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                transferProps.onTransferClick(transferValue as any)
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
      [AccountStep.Transfer_In_Progress]: {
        view: (
          <Transfer_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_Success]: {
        view: (
          <Transfer_Success
            btnInfo={{
              btnTxt: 'labelDoAgain',
              param: {
                method: t('labelL2ToL2Method', {
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                  l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                  symbol: isShowAccount?.info?.symbol,
                }),
              },
              callback: () => {
                setShowAccount({ isShow: false })
                setShowTransfer({
                  isShow: true,
                  symbol: isShowAccount?.info?.symbol,
                })
              },
            }}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: 'Txn Hash',
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_Failed]: {
        view: (
          <Transfer_Failed
            btnInfo={closeBtnInfo({
              closeExtend: () => {
                setShowAccount({
                  ...isShowAccount,
                  isShow: false,
                  info: {
                    ...isShowAccount.info,
                    lastFailed: LAST_STEP.transfer,
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
      },
      [AccountStep.Transfer_RAMP_WaitForAuth]: {
        view: (
          <Transfer_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_RAMP_First_Method_Denied]: {
        view: (
          <Transfer_First_Method_Denied
            btnInfo={{
              btnTxt: 'labelTryAnother',
              callback: () => {
                const { __request__ } = store.getState()._router_modalData.transferRampValue
                if (__request__) {
                  processRequestRampTransfer(__request__, false)
                } else {
                  setShowAccount({
                    isShow: true,
                    step: AccountStep.Transfer_RAMP_Failed,
                  })
                }
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
      [AccountStep.Transfer_RAMP_User_Denied]: {
        view: (
          <Transfer_User_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                const { __request__ } = store.getState()._router_modalData.transferRampValue
                if (__request__) {
                  processRequestRampTransfer(__request__, true)
                } else {
                  setShowAccount({
                    isShow: true,
                    step: AccountStep.Transfer_RAMP_Failed,
                  })
                }
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
      [AccountStep.Transfer_RAMP_In_Progress]: {
        view: (
          <Transfer_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_RAMP_Success]: {
        view: (
          <Transfer_Success
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: 'Txn Hash',
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_RAMP_Failed]: {
        view: (
          <Transfer_Failed
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },

      // transferBanxa
      [AccountStep.Transfer_BANXA_WaitForAuth]: {
        view: (
          <Transfer_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_BANXA_First_Method_Denied]: {
        view: (
          <Transfer_First_Method_Denied
            btnInfo={{
              btnTxt: 'labelTryAnother',
              callback: () => {
                const { __request__ } = store.getState()._router_modalData.transferBanxaValue
                if (__request__) {
                  processRequestRampTransfer(__request__, false)
                } else {
                  setShowAccount({
                    isShow: true,
                    step: AccountStep.Transfer_RAMP_Failed,
                  })
                }
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
      [AccountStep.Transfer_BANXA_User_Denied]: {
        view: (
          <Transfer_User_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                const { __request__ } = store.getState()._router_modalData.transferBanxaValue
                if (__request__) {
                  processRequestRampTransfer(__request__, true)
                } else {
                  setShowAccount({
                    isShow: true,
                    step: AccountStep.Transfer_RAMP_Failed,
                  })
                }
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
      [AccountStep.Transfer_BANXA_In_Progress]: {
        view: (
          <Transfer_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_BANXA_Success]: {
        view: (
          <Transfer_Success
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: 'Txn Hash',
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_BANXA_Confirm]: {
        view: (
          <Transfer_banxa_confirm
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              info: { ...isShowAccount?.info },
              link: isShowAccount?.info?.hash
                ? {
                    name: 'Banxa Status',
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.Transfer_BANXA_Failed]: {
        view: (
          <Transfer_Failed
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTBurn_WaitForAuth]: {
        view: (
          <NFTBurn_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTBurn_First_Method_Denied]: {
        view: (
          <NFTBurn_First_Method_Denied
            btnInfo={{
              btnTxt: 'labelTryAnother',
              callback: () => {
                nftTransferProps.onTransferClick(nftTransferValue as any, false)
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
      [AccountStep.NFTBurn_User_Denied]: {
        view: (
          <NFTBurn_User_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                nftTransferProps.onTransferClick(nftTransferValue as any)
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
      [AccountStep.NFTBurn_In_Progress]: {
        view: (
          <NFTBurn_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTBurn_Success]: {
        view: (
          <NFTBurn_Success
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: 'Txn Hash',
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTBurn_Failed]: {
        view: (
          <NFTBurn_Failed
            btnInfo={closeBtnInfo({
              closeExtend: () => {
                setShowAccount({
                  ...isShowAccount,
                  isShow: false,
                  info: {
                    ...isShowAccount.info,
                    lastFailed: LAST_STEP.nftTransfer,
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
      },


      // withdraw
      [AccountStep.Withdraw_WaitForAuth]: {
        view: (
          <Withdraw_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Withdraw_First_Method_Denied]: {
        view: (
          <Withdraw_First_Method_Denied
            btnInfo={{
              btnTxt: 'labelTryAnother',
              callback: () => {
                withdrawProps.onWithdrawClick(withdrawValue as any, false)
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
      [AccountStep.Withdraw_User_Denied]: {
        view: (
          <Withdraw_User_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                withdrawProps.onWithdrawClick(withdrawValue as any)
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
      [AccountStep.Withdraw_In_Progress]: {
        view: (
          <Withdraw_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Withdraw_Success]: {
        view: (
          <Withdraw_Success
            btnInfo={{
              btnTxt: 'labelDoAgain',
              param: {
                method: t('labelL2ToL1Method', {
                  symbol: isShowAccount?.info?.symbol,
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                  l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                  ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                  loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
                }),
              },
              callback: () => {
                setShowAccount({ isShow: false })
                setShowWithdraw({
                  isShow: true,
                  info: {
                    isToMyself: isShowAccount?.info?.isToMyself ?? false,
                    symbol: isShowAccount?.info?.symbol,
                  },
                  symbol: isShowAccount?.info?.symbol,
                })
              },
            }}
            {...{
              ...rest,
              account,
              symbol: isShowAccount?.info?.symbol,
              // value:isShowAccount?.info?.value,
              link: isShowAccount?.info?.hash
                ? {
                    name: 'Txn Hash',
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.Withdraw_Failed]: {
        view: (
          <Withdraw_Failed
            btnInfo={closeBtnInfo({
              closeExtend: () => {
                setShowAccount({
                  ...isShowAccount,
                  isShow: false,
                  info: {
                    ...isShowAccount.info,
                    lastFailed: LAST_STEP.withdraw,
                  },
                })
              },
            })}
            {...{
              ...rest,
              symbol: isShowAccount?.info?.symbol,
              // value:isShowAccount?.info?.value,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },

      // transfer
      [AccountStep.NFTTransfer_WaitForAuth]: {
        view: (
          <NFTTransfer_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTTransfer_First_Method_Denied]: {
        view: (
          <NFTTransfer_First_Method_Denied
            btnInfo={{
              btnTxt: 'labelTryAnother',
              callback: () => {
                nftTransferProps.onTransferClick(nftTransferValue as any, false)
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
      [AccountStep.NFTTransfer_User_Denied]: {
        view: (
          <NFTTransfer_User_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                nftTransferProps.onTransferClick(nftTransferValue as any)
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
      [AccountStep.NFTTransfer_In_Progress]: {
        view: (
          <NFTTransfer_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTTransfer_Success]: {
        view: (
          <NFTTransfer_Success
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: 'Txn Hash',
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTTransfer_Failed]: {
        view: (
          <NFTTransfer_Failed
            btnInfo={closeBtnInfo({
              closeExtend: () => {
                setShowAccount({
                  ...isShowAccount,
                  isShow: false,
                  info: {
                    ...isShowAccount.info,
                    lastFailed: LAST_STEP.nftTransfer,
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
      },
			//Burn

      // withdraw
      [AccountStep.NFTWithdraw_WaitForAuth]: {
        view: (
          <NFTWithdraw_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTWithdraw_First_Method_Denied]: {
        view: (
          <NFTWithdraw_First_Method_Denied
            btnInfo={{
              btnTxt: 'labelTryAnother',
              callback: () => {
                nftWithdrawProps.onWithdrawClick(nftWithdrawValue as any, false)
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
      [AccountStep.NFTWithdraw_User_Denied]: {
        view: (
          <NFTWithdraw_User_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                nftWithdrawProps.onWithdrawClick(nftWithdrawValue as any)
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
      [AccountStep.NFTWithdraw_In_Progress]: {
        view: (
          <NFTWithdraw_In_Progress
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTWithdraw_Success]: {
        view: (
          <NFTWithdraw_Success
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: 'Txn Hash',
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.NFTWithdraw_Failed]: {
        view: (
          <NFTWithdraw_Failed
            btnInfo={closeBtnInfo({
              closeExtend: () => {
                setShowAccount({
                  ...isShowAccount,
                  isShow: false,
                  info: {
                    ...isShowAccount.info,
                    lastFailed: LAST_STEP.nftWithdraw,
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
      },

      //create account

      [AccountStep.CreateAccount_Approve_WaitForAuth]: {
        view: (
          <CreateAccount_Approve_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Approve_Denied]: {
        view: (
          <CreateAccount_Approve_Denied
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Approve_Submit]: {
        view: (
          <CreateAccount_Approve_Submit
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_WaitForAuth]: {
        view: (
          <CreateAccount_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Denied]: {
        view: (
          <CreateAccount_Denied
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Failed]: {
        view: (
          <CreateAccount_Failed
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },
      [AccountStep.CreateAccount_Submit]: {
        view: (
          <CreateAccount_Submit
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },

      [AccountStep.UnlockAccount_WaitForAuth]: {
        view: (
          <UnlockAccount_WaitForAuth
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.UnlockAccount_User_Denied]: {
        view: (
          <UnlockAccount_User_Denied
            btnInfo={{
              btnTxt: 'labelRetry',
              callback: () => {
                unlockAccount()
                setShowAccount({
                  isShow: true,
                  step: AccountStep.UnlockAccount_WaitForAuth,
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
      [AccountStep.UnlockAccount_Success]: {
        view: (
          <UnlockAccount_Success
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.UnlockAccount_Failed]: {
        view: (
          <UnlockAccount_Failed
            btnInfo={closeBtnInfo()}
            resetAccount={() => {
              if (walletServices)
                if (isShowAccount.info && isShowAccount.info.walletType) {
                  const walletType = isShowAccount.info.walletType as sdk.WalletType
                  if (walletType.isContract || walletType.isInCounterFactualStatus) {
                    return
                  }
                }
              setShowAccount({ isShow: false })
              setShowActiveAccount({
                isShow: true,
                info: { isReset: true, confirmationType: 'lockedReset' },
              })
            }}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              walletType: isShowAccount?.info?.walletType,
              t,
            }}
          />
        ),
      },

      [AccountStep.ResetAccount_Approve_WaitForAuth]: {
        view: (
          <UpdateAccount_Approve_WaitForAuth
            patch={{ isReset: true }}
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.ResetAccount_First_Method_Denied]: {
        view: (
          <UpdateAccount_First_Method_Denied
            patch={{ isReset: true }}
            btnInfo={{
              btnTxt: t('labelTryAnother'),
              callback: (_e?: any) => {
                activeAccountProps.onResetClick({
                  isReset: true,
                  isNotFirstTime: false,
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
        onBack: () => {
          setShowAccount({ isShow: false })
          setShowResetAccount({ isShow: true })
        },
      },
      [AccountStep.ResetAccount_User_Denied]: {
        view: (
          <UpdateAccount_User_Denied
            patch={{ isReset: true }}
            btnInfo={{
              btnTxt: t('labelRetry'),
              callback: (_e?: any) => {
                activeAccountProps.onResetClick({
                  isReset: true,
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
      [AccountStep.ResetAccount_Success]: {
        view: (
          <UpdateAccount_Success
            patch={{ isReset: true }}
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: 'Txn Hash',
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.ResetAccount_Failed]: {
        view: (
          <UpdateAccount_Failed
            patch={{ isReset: true }}
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },

      //update account
      [AccountStep.UpdateAccount]: {
        view: (
          <UpdateAccount
            {...{
              ...account,
              clearDepositHash: clearDeposit,
              chainInfos,
              etherscanUrl: rest.etherscanBaseUrl,
              onSwitch,
              onCopy,
              onViewQRCode,
              onDisconnect,
              addressShort,
            }}
            goUpdateAccount={() => {
              setShowAccount({ isShow: false })
              setShowActiveAccount({ isShow: true })
              // goUpdateAccount({});
            }}
            {...{ ...rest, account, t }}
          />
        ),
        onQRClick,
      },
      [AccountStep.UpdateAccount_Approve_WaitForAuth]: {
        view: (
          <UpdateAccount_Approve_WaitForAuth
            providerName={account.connectName as ConnectProviders}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount_First_Method_Denied]: {
        view: (
          <UpdateAccount_First_Method_Denied
            btnInfo={{
              btnTxt: t('labelTryAnother'),
              callback: (_e?: any) => {
                activeAccountProps.onResetClick({ isNotFirstTime: true })
                // goUpdateAccount({ isFirstTime: false });
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
          setShowAccount({ isShow: true, step: AccountStep.CheckingActive })
          // backToUpdateAccountBtnInfo.callback();
        },
      },
      [AccountStep.UpdateAccount_User_Denied]: {
        view: (
          <UpdateAccount_User_Denied
            btnInfo={{
              btnTxt: t('labelRetry'),
              callback: (_e?: any) => {
                activeAccountProps.onResetClick({})
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
      [AccountStep.UpdateAccount_Success]: {
        view: (
          <UpdateAccount_Success
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              link: isShowAccount?.info?.hash
                ? {
                    name: 'Txn Hash',
                    url: isShowAccount?.info?.hash,
                  }
                : undefined,
              t,
            }}
          />
        ),
      },
      [AccountStep.UpdateAccount_Failed]: {
        view: (
          <UpdateAccount_Failed
            btnInfo={{
              btnTxt: 'labelClose',
              callback: () => {
                setShouldShow(false)
                setShowActiveAccount({ isShow: true })
              },
            }}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },

      [AccountStep.ExportAccount_Approve_WaitForAuth]: {
        view: (
          <ExportAccount_Approve_WaitForAuth
            patch={{ isReset: true }}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.ExportAccount_User_Denied]: {
        view: (
          <ExportAccount_User_Denied
            patch={{ isReset: true }}
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.ExportAccount_Success]: {
        view: (
          <ExportAccount_Success
            patch={{ isReset: true }}
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.ExportAccount_Failed]: {
        view: (
          <ExportAccount_Failed
            patch={{ isReset: true }}
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },
      [AccountStep.Dual_Success]: {
        view: (
          <Dual_Success
            btnInfo={{
              btnTxt: 'labelDualPanelClose',
              callback: (_e: any) => {
                if (isWebEarn) {
                  setShowAccount({ isShow: false })
                  history.push('/l2assets/assets/Invests')
                } else {
                  setShowAccount({ isShow: false })
                  history.push(`${RouterPath.invest}/${InvestRouter[InvestType.MyBalance]}`)
                }
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
      [AccountStep.Dual_Failed]: {
        view: (
          <Dual_Failed
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },
      [AccountStep.Staking_Redeem_Failed]: {
        view: (
          <Staking_Redeem_Failed
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              info: isShowAccount?.info,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },
      [AccountStep.Staking_Redeem_Success]: {
        view: (
          <Staking_Redeem_Success
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              info: isShowAccount?.info ?? {},
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Staking_Success]: {
        view: (
          <Staking_Success
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              info: isShowAccount?.info ?? {},
              account,
              t,
            }}
          />
        ),
      },
      [AccountStep.Staking_Failed]: {
        view: (
          <Staking_Failed
            btnInfo={closeBtnInfo()}
            {...{
              ...rest,
              account,
              info: isShowAccount?.info,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
      },
      [AccountStep.BtradeSwap_Delivering]: {
        view: (
          <BtradeSwap_Delivering
            btnInfo={undefined}
            {...{
              ...rest,
              account,
              info: isShowAccount?.info,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        height: 'auto',
      },
      [AccountStep.BtradeSwap_Pending]: {
        view: (
          <BtradeSwap_Pending
            btnInfo={undefined}
            {...{
              ...rest,
              account,
              info: isShowAccount?.info,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        height: 'auto',
      },

      [AccountStep.BtradeSwap_Settled]: {
        view: (
          <BtradeSwap_Settled
            btnInfo={undefined}
            {...{
              ...rest,
              account,
              info: isShowAccount?.info,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        height: 'auto',
      },
      [AccountStep.BtradeSwap_Failed]: {
        view: (
          <BtradeSwap_Failed
            btnInfo={undefined}
            {...{
              ...rest,
              account,
              info: isShowAccount?.info,
              error: isShowAccount.error,
              t,
            }}
          />
        ),
        height: 'auto',
      },
      [AccountStep.AMM_Pending]: {
        view: (
          <AMM_Pending
            btnInfo={undefined}
            {...{
              ...rest,
              t,
            }}
          />
        ),
        height: 'auto',
      },
      [AccountStep.VaultTrade_Success]: {
        view: (
          <VaultTrade_Success btnInfo={undefined} {...{ info: isShowAccount?.info, t, ...rest }} />
        ),
      },
      [AccountStep.VaultTrade_Failed]: {
        view: (
          <VaultTrade_Failed
            btnInfo={undefined}
            {...{
              t,
              info: isShowAccount?.info,
              symbol: isShowAccount?.info?.symbol,
              value: isShowAccount?.info?.value,
              error: isShowAccount.error,
              ...rest,
            }}
          />
        ),
      },
      [AccountStep.VaultTrade_In_Progress]: {
        view: (
          <VaultTrade_In_Progress
            btnInfo={undefined}
            {...{ info: isShowAccount?.info, t, ...rest }}
          />
        ),
      },
      [AccountStep.VaultJoin_Success]: {
        view: (
          <VaultJoin_Success btnInfo={undefined} {...{ info: isShowAccount?.info, t, ...rest }} />
        ),
      },
      [AccountStep.VaultJoin_Failed]: {
        view: (
          <VaultJoin_Failed
            btnInfo={undefined}
            {...{
              info: isShowAccount?.info,
              symbol: isShowAccount?.info?.symbol,
              value: isShowAccount?.info?.value,
              error: isShowAccount.error,
              t,
              ...rest,
            }}
          />
        ),
      },
      [AccountStep.VaultJoin_In_Progress]: {
        view: (
          <VaultJoin_In_Progress
            btnInfo={undefined}
            {...{ info: isShowAccount?.info, t, ...rest }}
          />
        ),
      },
      [AccountStep.VaultRedeem_Success]: {
        view: (
          <VaultRedeem_Success btnInfo={undefined} {...{ info: isShowAccount?.info, t, ...rest }} />
        ),
      },
      [AccountStep.VaultRedeem_Failed]: {
        view: (
          <VaultRedeem_Failed
            btnInfo={undefined}
            {...{
              info: isShowAccount?.info,
              symbol: isShowAccount?.info?.symbol,
              value: isShowAccount?.info?.value,
              error: isShowAccount.error,
              t,
              ...rest,
            }}
          />
        ),
      },
      [AccountStep.VaultRedeem_In_Progress]: {
        view: (
          <VaultRedeem_In_Progress
            btnInfo={undefined}
            {...{ info: isShowAccount?.info, t, ...rest }}
          />
        ),
      },
      [AccountStep.VaultBorrow_Success]: {
        view: (
          <VaultBorrow_Success btnInfo={undefined} {...{ info: isShowAccount?.info, t, ...rest }} />
        ),
      },
      [AccountStep.VaultBorrow_Failed]: {
        view: (
          <VaultBorrow_Failed btnInfo={undefined} {...{ info: isShowAccount?.info, t, ...rest }} />
        ),
      },
      [AccountStep.VaultBorrow_In_Progress]: {
        view: (
          <VaultBorrow_In_Progress
            btnInfo={undefined}
            {...{ info: isShowAccount?.info, t, ...rest }}
          />
        ),
      },
      [AccountStep.VaultRepay_Success]: {
        view: (
          <VaultRepay_Success btnInfo={undefined} {...{ info: isShowAccount?.info, t, ...rest }} />
        ),
      },
      [AccountStep.VaultRepay_Failed]: {
        view: (
          <VaultRepay_Failed btnInfo={undefined} {...{ info: isShowAccount?.info, t, ...rest }} />
        ),
      },
      [AccountStep.VaultRepay_In_Progress]: {
        view: (
          <VaultRepay_In_Progress
            btnInfo={undefined}
            {...{ info: isShowAccount?.info, t, ...rest }}
          />
        ),
      },
    })
  }, [
    activeAccountProps,
    resetProps,
    checkActiveStatusProps,
    account,
    isShowAccount.info,
    isShowAccount.error,
    addAssetList,
    allowTrade,
    depositProps.isNewAccount,
    depositProps.isAllowInputToAddress,
    depositProps.tradeData.belong,
    depositProps.tradeData.tradeValue,
    sendAssetList,
    sendNFTAssetList,
    vendorListBuy,
    campaignTagConfig,
    onBackReceive,
    chainInfos,
    isLayer1Only,
    updateDepositHash,
    clearDeposit,
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
    nftDepositValue,
    nftDeployValue,
    setShowAccount,
    setShowDeposit,
    creatRedPacketRetryBtn,
    nftMintAdvanceRetryBtn,
    nftDeployProps,
    forceWithdrawRetry,
    transferProps,
    transferValue,
    processRequestRampTransfer,
    withdrawProps,
    withdrawValue,
    nftTransferProps,
    nftTransferValue,
    nftWithdrawProps,
    nftWithdrawValue,
    setShowActiveAccount,
    disbaleList,
  ])

  const currentModal = accountList[isShowAccount.step]

  return {
    nftDeployProps,
    nftTransferProps,
    nftWithdrawProps,
    transferProps,
    withdrawProps,
		nftBurnProps,
    claimProps,
    depositProps,
    resetProps,
    collectionAdvanceProps,
    sideStackRedeemProps: stakeWrapProps,
    activeAccountProps,
    exportAccountProps,
    exportAccountAlertText,
    exportAccountToastOpen,
    setExportAccountToastOpen,
    copyToastOpen,
    setCopyToastOpen,
    openQRCode,
    setOpenQRCode,
    isShowAccount,
    account,
    closeBtnInfo,
    accountList,
    currentModal,
    onBackReceive,
    onBackSend,
    contactAddProps
	}
}
