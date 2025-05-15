import {
  store,
  useAccount,
  useSubmitBtn,
  useTokenMap,
  useVaultLayer2,
  useVaultMap,
  VaultLayer2States,
} from '@loopring-web/core'
import React from 'react'
import {
  L1L2_NAME_DEFINED,
  MapChainId,
  RouterPath,
  SagaStatus,
  TradeBtnStatus,
  VaultKey,
  VaultLoanType,
} from '@loopring-web/common-resources'
import { useOpenModals, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import * as sdk from '@loopring-web/loopring-sdk'
import { useConfirmation } from '../../../stores/localStore/confirmation'
import { useHistory } from 'react-router'

export type VaultAccountInfoStatus = VaultLayer2States & {
  joinBtnStatus: TradeBtnStatus
  joinBtnLabel: string
  onJoinPop: (props: any) => void
  swapBtnStatus: TradeBtnStatus
  swapBtnLabel: string
  onSwapPop: (props: any & { symbol: string, isSell?: boolean }) => void
  redeemBtnStatus: TradeBtnStatus
  onRedeemPop: (props: any) => void
  redeemBtnLabel: string
  borrowBtnStatus: TradeBtnStatus
  onBorrowPop: (props: any) => void
  borrowBtnLabel: string
  repayBtnStatus: TradeBtnStatus
  onRepayPop: (props: any) => void
  repayBtnLabel: string
  vaultAccountInfoStatus: SagaStatus
  onGoToSwap: ({ symbol, isSell }: { symbol?: string; isSell?: boolean }) => void
  // isShowFeathure:  vaultAccountInfo?.accountStatus
}
export const useVaultAccountInfo = () => {
  const {
    vaultAccountInfo,
    status: vaultAccountInfoStatus,
    updateVaultLayer2,
    tokenFactors,
    collateralTokens,
    maxLeverage,
    activeInfo,
  } = useVaultLayer2()
  const { erc20Map } = useVaultMap()
  const { idIndex } = useTokenMap()

  const {
    setShowVaultJoin,
    setShowVaultSwap,
    setShowVaultExit,
    setShowVaultLoan,
    setShowConfirmedVault,
  } = useOpenModals()

  const { t } = useTranslation()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const {
    confirmation: { confirmedOpenVaultPosition },
  } = useConfirmation()

  const availableJoinCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const { vaultAccountInfo } = store.getState().vaultLayer2
    switch (vaultAccountInfo?.accountStatus) {
      // @ts-ignore
      case sdk.VaultAccountStatus.IN_REDEEM: //sdk.VaultAccountStatus.IN_REDEEM:
        return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: `labelVaultREDEEMPendingBtn|` }
      // @ts-ignore
      case sdk.VaultAccountStatus.IN_STAKING: //sdk.VaultAccountStatus.IN_STAKING:
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: `labelVaultAddBtn|` }
      case sdk.VaultAccountStatus.FREE: // sdk.VaultAccountStatus.FREE:
      default:
        if (activeInfo?.hash) {
          return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: `labelVaultJoinBtn|` }
        }
        return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: `labelVaultJoinBtn|` }
    }
  }, [vaultAccountInfoStatus, activeInfo])
  const {
    btnStatus: joinBtnStatus,
    onBtnClick: onJoinPop,
    btnLabel: joinBtnLabel,
  } = useSubmitBtn({
    availableTradeCheck: availableJoinCheck,
    isLoading: false,
    submitCallback: async () => {
      const { vaultAccountInfo } = store.getState().vaultLayer2
      switch (vaultAccountInfo?.accountStatus) {
        // @ts-ignore
        case sdk.VaultAccountStatus.IN_REDEEM: // sdk.VaultAccountStatus.IN_REDEEM:
          break
        // @ts-ignore
        case sdk.VaultAccountStatus.IN_STAKING: //sdk.VaultAccountStatus.IN_STAKING:
          setShowVaultJoin({ isShow: true, info: { isActiveAccount: false } })
          break
        // @ts-ignore
        case sdk.VaultAccountStatus.FREE: //sdk.VaultAccountStatus.FREE
        default: {
          if (!confirmedOpenVaultPosition) {
            setShowConfirmedVault({ isShow: true })  
          } else {
            history.push(`${RouterPath.vault}/${VaultKey.VAULT_DASHBOARD}`)
            setShowVaultJoin({ isShow: true, info: { isActiveAccount: true } })
            setShowConfirmedVault({ isShow: false })  
          }
        }
      }
    },
  })
  const availableSwapCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const { vaultAccountInfo } = store.getState().vaultLayer2
    if (vaultAccountInfoStatus === SagaStatus.UNSET && vaultAccountInfo) {
      // setIsLoading(false)
      switch (vaultAccountInfo?.accountStatus) {
        case sdk.VaultAccountStatus.IN_STAKING: //sdk.VaultAccountStatus.IN_STAKING:
          return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: `labelVaultTradeBtn|` }

        default:
          return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: `labelVaultTradeBtn|` }
      }
    } else {
      // setIsLoading(true)
      return { tradeBtnStatus: TradeBtnStatus.LOADING, label: `abelVaultTradeBtn|` }
    }
  }, [vaultAccountInfoStatus])
  const {
    btnStatus: swapBtnStatus,
    onBtnClick: onSwapPop,
    btnLabel: swapBtnLabel,
  } = useSubmitBtn({
    availableTradeCheck: availableSwapCheck,
    isLoading: false,
    submitCallback: async ({ symbol, isSell }: { symbol?: string, isSell?: boolean }) => {
      
      updateVaultLayer2({})
      const { vaultAccountInfo } = store.getState().vaultLayer2
      switch (vaultAccountInfo?.accountStatus) {
        case sdk.VaultAccountStatus.IN_STAKING:
          setShowVaultSwap({
            isShow: true,
            symbol: symbol ?? 'ETH',
            isSell
          })
          break
      }
    },
  })

  const availableRedeemCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const { vaultAccountInfo } = store.getState().vaultLayer2
    if (vaultAccountInfoStatus === SagaStatus.UNSET && vaultAccountInfo) {
      // setIsLoading(false)
      switch (vaultAccountInfo?.accountStatus) {
        case sdk.VaultAccountStatus.IN_STAKING: //sdk.VaultAccountStatus.IN_STAKING:
          return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: `labelVaultRedeemBtn|` }

        default:
          return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: `labelVaultRedeemBtn|` }
      }
    } else {
      // setIsLoading(true)
      return { tradeBtnStatus: TradeBtnStatus.LOADING, label: `abelVaultRedeemBtn|` }
    }
  }, [vaultAccountInfoStatus])

  const {
    btnStatus: redeemBtnStatus,
    onBtnClick: onRedeemPop,
    btnLabel: redeemBtnLabel,
  } = useSubmitBtn({
    availableTradeCheck: availableRedeemCheck,
    isLoading: false,
    submitCallback: async (key?: string) => {
      const { vaultAccountInfo } = store.getState().vaultLayer2
      switch (vaultAccountInfo?.accountStatus) {
        case sdk.VaultAccountStatus.IN_STAKING: //sdk.VaultAccountStatus.IN_STAKING:
          setShowVaultExit({ isShow: true, symbol: key ?? '' })
          break
      }
    },
  })

  const availableBorrowCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const { vaultAccountInfo } = store.getState().vaultLayer2
    if (vaultAccountInfoStatus === SagaStatus.UNSET && vaultAccountInfo) {
      // setIsLoading(false)
      switch (vaultAccountInfo?.accountStatus) {
        case sdk.VaultAccountStatus.IN_STAKING: //sdk.VaultAccountStatus.IN_STAKING:
          return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: `labelVaultBorrowBtn|` }

        default:
          return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: `labelVaultBorrowBtn|` }
      }
    } else {
      // setIsLoading(true)
      return { tradeBtnStatus: TradeBtnStatus.LOADING, label: `abelVaultBorrowBtn|` }
    }
  }, [vaultAccountInfoStatus])
  const {
    btnStatus: borrowBtnStatus,
    onBtnClick: onBorrowPop,
    btnLabel: borrowBtnLabel,
  } = useSubmitBtn({
    availableTradeCheck: availableBorrowCheck,
    isLoading: false,
    submitCallback: async ({symbol}: {isShow: boolean,symbol: string}) => {
      const { vaultAccountInfo } = store.getState().vaultLayer2
      switch (vaultAccountInfo?.accountStatus) {
        case sdk.VaultAccountStatus.IN_STAKING: //sdk.VaultAccountStatus.IN_STAKING:
          setShowVaultLoan({ isShow: true, info: {symbol: symbol ?? ''}, type: VaultLoanType.Borrow })
          break
      }
    },
  })

  const availableRepayCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string
  } => {
    const { vaultAccountInfo } = store.getState().vaultLayer2
    if (vaultAccountInfoStatus === SagaStatus.UNSET && vaultAccountInfo) {
      // setIsLoading(false)
      switch (vaultAccountInfo?.accountStatus) {
        case sdk.VaultAccountStatus.IN_STAKING: //sdk.VaultAccountStatus.IN_STAKING:
          return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: `labelVaultRepayBtn|` }

        default:
          return { tradeBtnStatus: TradeBtnStatus.DISABLED, label: `labelVaultRepayBtn|` }
      }
    } else {
      // setIsLoading(true)
      return { tradeBtnStatus: TradeBtnStatus.LOADING, label: `abelVaultRepayBtn|` }
    }
  }, [vaultAccountInfoStatus])
  const {
    btnStatus: repayBtnStatus,
    onBtnClick: onRepayPop,
    btnLabel: repayBtnLabel,
  } = useSubmitBtn({
    availableTradeCheck: availableRepayCheck,
    isLoading: false,
    submitCallback: async (key?: string) => {
      const { vaultAccountInfo } = store.getState().vaultLayer2
      switch (vaultAccountInfo?.accountStatus) {
        case sdk.VaultAccountStatus.IN_STAKING: //sdk.VaultAccountStatus.IN_STAKING:
          setShowVaultLoan({ isShow: true, symbol: key ?? '', type: VaultLoanType.Repay })
          break
      }
    },
  })
  const history = useHistory()

  const onGoToSwap = ({ symbol, isSell }: { symbol?: string; isSell?: boolean }) => {
    const searchParams = new URLSearchParams()
    symbol !== undefined && searchParams.append('symbol', symbol)
    isSell !== undefined && searchParams.append('isSell', isSell ? 'true' : 'false')
    
    history.push(RouterPath.vault + '/' + VaultKey.VAULT_TRADE + `?${searchParams.toString()}`)
  }

  const label = React.useCallback((btnLabel) => {
    const key = btnLabel.split('|')
    return t(key[0], {
      arg: key[1],
      // symbol: tradeCalcProData.coinBase,
      layer2: L1L2_NAME_DEFINED[network].layer2,
      loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    })
  }, [])
  const { account } = useAccount()
  React.useEffect(() => {
    if (account.apiKey) updateVaultLayer2({})
  }, [account.apiKey])

  return {
    joinBtnStatus,
    joinBtnLabel: label(joinBtnLabel),
    onJoinPop,
    vaultAccountInfo,
    swapBtnStatus,
    swapBtnLabel: label(swapBtnLabel),
    onSwapPop,
    redeemBtnStatus,
    onRedeemPop,
    redeemBtnLabel: label(redeemBtnLabel),
    borrowBtnStatus,
    onBorrowPop,
    borrowBtnLabel: label(borrowBtnLabel),
    repayBtnStatus,
    onRepayPop,
    repayBtnLabel: label(repayBtnLabel),
    vaultAccountInfoStatus,
    tokenFactors,
    maxLeverage,
    collateralTokens,
    onGoToSwap,
  } as VaultAccountInfoStatus
}
