import { AccountStep, useOpenModals, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { useUpdateAccount } from './useUpdateAccount'
import { decryptAESMd5, isSameEVMAddress, offchainFeeInfoToFeeInfo } from '../../utils'
import { useCoinbaseSmartWalletPersist } from '../../stores/localStore/coinbaseSmartWalletPersist'
import { LoopringAPI } from '../../api_wrapper'
import { accountServices } from '../../services'
import { useAccount, useTokenMap, useWalletLayer2 } from '../../stores'
import { DUAL_RETRY_STATUS, LABEL_INVESTMENT_STATUS, OffchainFeeReqType, SETTLEMENT_STATUS, VaultAccountStatus } from '@loopring-web/loopring-sdk'
import { useEffect, useState } from 'react'
import { keys } from 'lodash'
import { BigNumber} from 'ethers'


export const useCoinbaseWalletPassword = () => {
  const { t } = useTranslation('common')
  const { modals: {isShowAccount, isShowActiveAccount}, setShowAccount, setShowResetAccount, setShowActiveAccount } = useOpenModals()
  const { goUpdateAccountCoinbaseWallet } = useUpdateAccount()
  const { data } = useCoinbaseSmartWalletPersist()
  const { defaultNetwork } = useSettings()
  const { account } = useAccount()
  const {tokenMap} = useTokenMap()
  const {walletLayer2} = useWalletLayer2()
  const foundPersistData = data?.find(
    (item) => item.chainId === defaultNetwork && isSameEVMAddress(item.wallet, account?.accAddress),
  )
  const [showPasswordMismatchError, setShowPasswordMismatchError] = useState(false)
  useEffect(() => {
    setShowPasswordMismatchError(false)
  }, [isShowAccount.step, isShowAccount.isShow])
  return {
    introProps: {
      t,
      onClickConfirm: () => {
        setShowAccount({
          step: AccountStep.Coinbase_Smart_Wallet_Password_Set,
          isShow: true,
          info: isShowAccount?.info
        })
      },
    },
    setProps: {
      t,
      onClickConfirm: (password: string) => {
        setShowAccount({
          step: AccountStep.Coinbase_Smart_Wallet_Password_Set_Confirm,
          isShow: true,
          info: {
            ...isShowAccount?.info,
            password
          }
        })
      },
      onClickBack: () => {
        setShowAccount({
          step: AccountStep.Coinbase_Smart_Wallet_Password_Intro,
          isShow: true,
        })
      },
    },
    setConfirmProps: {
      t,
      onClickProceed: () => {
        goUpdateAccountCoinbaseWallet({
          password: isShowAccount?.info?.password,
          feeInfo: isShowAccount?.info?.feeInfo,
          isReset: isShowAccount?.info?.isReset,
        })
      },
    },
    setProcessingProps: {
      step: isShowAccount?.info?.step,
      showResumeUpdateAccount: isShowAccount?.info?.showResumeUpdateAccount
    },
    setErrorProps: {
      t,
      onClickConfirm: () => {
        setShowAccount({
          isShow: false
        })
      },
    },
    inputProps: {
      t,
      inputDisabled: !(
        foundPersistData &&
        foundPersistData.eddsaKey.sk &&
        foundPersistData.nonce === account?.nonce
      ),
      onClickConfirm: async (password: string) => {
        if (!foundPersistData || !foundPersistData?.eddsaKey.sk) return
        try {
          const sk = decryptAESMd5(password, foundPersistData.eddsaKey.sk)
          const accountInfoRealTime = await LoopringAPI.exchangeAPI?.getAccount({
            owner: foundPersistData.wallet,
          })
          setShowPasswordMismatchError(false)
          const res = await LoopringAPI.userAPI!
            .getUserApiKey(
              {
                accountId: accountInfoRealTime!.accInfo.accountId,
              },
              sk,
            )
            
          accountServices.sendAccountSigned({
            apiKey: res.apiKey,
            eddsaKey: { ...foundPersistData!.eddsaKey, sk },
            isInCounterFactualStatus: false,
            accountId: accountInfoRealTime!.accInfo.accountId,
          })
          setShowAccount({
            isShow: false,
          })
        } catch (e) {
          setShowPasswordMismatchError(true)
          accountServices.sendCheckAccount(foundPersistData!.wallet)
        }
      },
      onClickForgetPassword: async () => {
        const [hasDualInvest, hasVault] = await Promise.all([
          LoopringAPI.defiAPI?.getDualTransactions(
            {
              accountId: account.accountId,
              settlementStatuses: SETTLEMENT_STATUS.UNSETTLED,
              investmentStatuses: [
                LABEL_INVESTMENT_STATUS.CANCELLED,
                LABEL_INVESTMENT_STATUS.SUCCESS,
                LABEL_INVESTMENT_STATUS.PROCESSED,
                LABEL_INVESTMENT_STATUS.PROCESSING,
              ].join(','),
              retryStatuses: [DUAL_RETRY_STATUS.RETRYING],
            } as any,
             "",
          ).then(res => res.totalNum && res.totalNum > 0),
          LoopringAPI.vaultAPI?.getVaultInfoAndBalance(
            {
              accountId: account.accountId,
              },
             "",
          ).then(res => {
            return res.accountStatus === VaultAccountStatus.IN_STAKING
          })
        ])
        const hasPortalOrDual = hasDualInvest || hasVault
        if (hasPortalOrDual) {
          setShowAccount({
            step: AccountStep.Coinbase_Smart_Wallet_Password_Forget_Password_Confirm,
            isShow: true,
          })
        } else {
          setShowAccount({
            step: AccountStep.Coinbase_Smart_Wallet_Password_Forget_Password,
            isShow: true,
          })
        }
      },
      onInputPassword: () => {
        setShowPasswordMismatchError(false)
      },
      showPasswordMismatchError
    },
    
    forgetPasswordConfirmProps: {
      t,
      onClickConfirm: () => {
        setShowAccount({
          isShow: false,
        })
      },
      onClickBack: () => {
        setShowAccount({
          step: AccountStep.Coinbase_Smart_Wallet_Password_Input,
          isShow: true,
        })
      },
    },
    forgetPasswordProps: {
      t,
      onClickConfirm: async () => {
        setShowAccount({
          isShow: false,
        })
        

        const feeInfoRes = await LoopringAPI.userAPI?.getOffchainFeeAmt({
          accountId: account.accountId,
          requestType: OffchainFeeReqType.UPDATE_ACCOUNT,
        }, '')
        
        const foundFeeKey = keys(feeInfoRes?.fees).find((key) => {
          const bal = BigNumber.from(walletLayer2?.[key].total || 0).sub(walletLayer2?.[key].locked || 0)
          return feeInfoRes?.fees?.[key]?.fee && bal.gte(feeInfoRes?.fees?.[key]?.fee) 
        })
        
        if (foundFeeKey && walletLayer2) {
          const foundFeeInfo = feeInfoRes?.fees[foundFeeKey]
          const mapped = offchainFeeInfoToFeeInfo(foundFeeInfo!, tokenMap, walletLayer2)
          setShowAccount({
            step: AccountStep.Coinbase_Smart_Wallet_Password_Set,
            isShow: true,
            info: {
              feeInfo: mapped,
            }
          })

        }
        
      },
    },
  }
}
