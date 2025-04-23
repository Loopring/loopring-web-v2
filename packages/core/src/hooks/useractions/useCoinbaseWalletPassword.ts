import { AccountStep, useOpenModals, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { useUpdateAccount } from './useUpdateAccount'
import { decryptAESMd5, encryptAESMd5, isSameEVMAddress } from '../../utils'
import { useCoinbaseSmartWalletPersist } from '../../stores/localStore/coinbaseSmartWalletPersist'
import { LoopringAPI } from '../../api_wrapper'
import { accountServices } from '../../services'
import { useAccount } from '../../stores'
import { DUAL_RETRY_STATUS, LABEL_INVESTMENT_STATUS, SETTLEMENT_STATUS, VaultAccountStatus } from '@loopring-web/loopring-sdk'
import { AccountStatus } from '@loopring-web/common-resources'

export const useCoinbaseWalletPassword = () => {
  const { t } = useTranslation('common')
  const { modals: {isShowAccount, isShowActiveAccount}, setShowAccount, setShowResetAccount, setShowActiveAccount } = useOpenModals()
  const { goUpdateAccountCoinbaseWallet } = useUpdateAccount()
  const { data } = useCoinbaseSmartWalletPersist()
  const { defaultNetwork } = useSettings()
  const { account } = useAccount()

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
        goUpdateAccountCoinbaseWallet({ password, feeInfo: isShowAccount?.info?.feeInfo,isReset: isShowAccount?.info?.isReset })
      },
      onClickBack: () => {
        setShowAccount({
          step: AccountStep.Coinbase_Smart_Wallet_Password_Intro,
          isShow: true,
        })
      },
    },
    inputProps: {
      t,
      inputDisabled: !(
        !!data?.eddsaKey.sk &&
        data.chainId === defaultNetwork &&
        isSameEVMAddress(data.wallet, account?.accAddress) &&
        data.nonce === account?.nonce
      ),
      onClickConfirm: async (password: string) => {
        if (!data || !data?.eddsaKey.sk) return
        const sk = decryptAESMd5(password, data?.eddsaKey.sk)
        const accountInfoRealTime = await LoopringAPI.exchangeAPI?.getAccount({
          owner: data.wallet,
        })

        LoopringAPI.userAPI
          ?.getUserApiKey(
            {
              accountId: accountInfoRealTime!.accInfo.accountId,
            },
            sk,
          )
          .then((res) => {
            accountServices.sendAccountSigned({
              apiKey: res.apiKey,
              eddsaKey: { ...data.eddsaKey, sk },
              isInCounterFactualStatus: false,
              isContract: true,
              accountId: accountInfoRealTime!.accInfo.accountId,
            })
            setShowAccount({
              isShow: false,
            })
          })
          .catch((e) => {
            accountServices.sendCheckAccount(data.wallet)
          })
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
    },
    forgetPasswordConfirmProps: {
      t,
      onClickConfirm: () => {
        setShowAccount({
          step: AccountStep.Coinbase_Smart_Wallet_Password_Forget_Password,
          isShow: true,
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
      onClickConfirm: () => {
        setShowAccount({
          isShow: false,
        })
        setShowActiveAccount({
          isShow: true,
          info: { isReset: true },
        })
      },
    },
  }
}
