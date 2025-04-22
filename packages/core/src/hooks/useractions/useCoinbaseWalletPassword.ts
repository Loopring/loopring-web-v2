import { AccountStep, useOpenModals, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { useUpdateAccount } from './useUpdateAccount'
import { decryptAESMd5, encryptAESMd5, isSameEVMAddress } from '../../utils'
import { useCoinbaseSmartWalletPersist } from '../../stores/localStore/coinbaseSmartWalletPersist'
import { LoopringAPI } from '../../api_wrapper'
import { accountServices } from '../../services'
import { useAccount } from '../../stores'

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
        const a = isShowAccount
        // a.info.feeInfo
        debugger

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
        // const hasPortalOrDual = false // todo
        setShowAccount({
          step: AccountStep.Coinbase_Smart_Wallet_Password_Forget_Password_Confirm,
          isShow: true,
        })
        // if (hasPortalOrDual) {
        //   setShowAccount({
        //     step: AccountStep.Coinbase_Smart_Wallet_Password_Forget_Password_Confirm,
        //     isShow: true,
        //   })
        // } else {
        //   setShowAccount({
        //     step: AccountStep.Coinbase_Smart_Wallet_Password_Forget_Password,
        //     isShow: true,
        //   })
        // }
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
