import React from 'react'

import { FeeInfo, MapChainId, myLog, UIERROR_CODE } from '@loopring-web/common-resources'
import { AccountStep, setShowAccount as _setShowAccount, useOpenModals, useSettings } from '@loopring-web/component-lib'

import { activateAccount, useAccount, LoopringAPI, accountServices, activateAccountSmartWallet, updateAccountRecursively, isCoinbaseSmartWallet, encryptAESMd5, isSameEVMAddress, withRetry, getAndSaveEncryptedSKFromServer } from '../../index'

import * as sdk from '@loopring-web/loopring-sdk'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import { useLocation } from 'react-router-dom';
import { coinbaseSmartWalletPersist, store } from '../../stores'
import { persistStoreCoinbaseSmartWalletData } from 'stores/localStore/coinbaseSmartWalletPersist'


const handleError = (e: any, isReset: boolean) => {
  const setShowAccount = (args: any) => store.dispatch(_setShowAccount(args))
  if (e.message === 'submitEncryptedEcdsaKey failed') {
    setShowAccount({
      isShow: true,
      step: AccountStep.Coinbase_Smart_Wallet_Password_Set_Error,
    })
    return
  }
  const error = LoopringAPI?.exchangeAPI?.genErr(e as any) ?? {
    code: UIERROR_CODE.DATA_NOT_READY,
  }
  const code = sdk.checkErrorInfo(error, true)
  myLog('unlock', error, e, code)
  switch (code) {
    case sdk.ConnectorError.NOT_SUPPORT_ERROR:
      myLog('activateAccount UpdateAccount: NOT_SUPPORT_ERROR')
      setShowAccount({
        isShow: true,
        step: isReset
          ? AccountStep.ResetAccount_First_Method_Denied
          : AccountStep.UpdateAccount_First_Method_Denied,
      })
      break
    case sdk.ConnectorError.USER_DENIED:
    case sdk.ConnectorError.USER_DENIED_2:
      myLog('activateAccount: USER_DENIED')
      setShowAccount({
        isShow: true,
        step: isReset
          ? AccountStep.ResetAccount_User_Denied
          : AccountStep.UpdateAccount_User_Denied,
      })
      break
    default:
      setShowAccount({
        isShow: true,
        step: isReset ? AccountStep.ResetAccount_Failed : AccountStep.UpdateAccount_Failed,
        error: {
          ...((e as any) ?? {}),
          ...error,
          code: (e as any)?.code ?? UIERROR_CODE.UNKNOWN,
        },
      })
      break
  }
  throw error
}

export const goUpdateAccountCoinbaseWalletBackupKeyOnlyFn = async ({
  isReset = false,
  backupKeyJSON,
}: {
  isFirstTime?: boolean
  isReset?: boolean
  feeInfo?: FeeInfo
  backupKeyJSON: string
}) => {
  const {
    settings: { defaultNetwork },
    account: { accAddress },
  } = store.getState()
  const setShowAccount = (args: any) => store.dispatch(_setShowAccount(args))
  const { eddsaKey, request } = JSON.parse(backupKeyJSON)
  try {
    setShowAccount({
      isShow: true,
      step: AccountStep.Coinbase_Smart_Wallet_Password_Set_Processing,
      info: {
        step: 'updatingAccount',
        showResumeUpdateAccount: true,
      },
    })

    const [{ apiKey }, { walletType }] = await Promise.all([
      LoopringAPI?.userAPI?.getUserApiKey(
        {
          accountId: request.accountId,
        },
        eddsaKey.sk,
      ),
      LoopringAPI?.walletAPI?.getWalletType({
        wallet: accAddress,
        network: MapChainId[defaultNetwork] as sdk.NetworkWallet,
      }),
    ]).then((response) => {
      if ((response[0] as sdk.RESULT_INFO)?.code) {
        throw response[0]
      }
      return response as any
    })

    await withRetry(
      () =>
        LoopringAPI!.userAPI!.submitEncryptedEcdsaKey(request, eddsaKey.sk, apiKey).then((res) => {
          if (res.code) {
            throw res
          }
          return res
        }),
      3,
      1000,
    )()
    .catch((e) => {
      throw new Error('submitEncryptedEcdsaKey failed')
    })
    const foundData = store.getState().localStore.coinbaseSmartWalletPersist.data!.find((item) => item.chainId === defaultNetwork && isSameEVMAddress(item.wallet, accAddress))!
    store.dispatch(
      coinbaseSmartWalletPersist.persistStoreCoinbaseSmartWalletData({
        ...foundData,
        eddsaKeyBackup: {
          backupNotFinished: false,
          json: ''
        }
      })
    )

    accountServices.sendAccountSigned({
      apiKey,
      eddsaKey,
      isInCounterFactualStatus: walletType?.isInCounterFactualStatus,
      isContract: walletType?.isContract,
    })

    setShowAccount({
      isShow: true,
      step: AccountStep.Coinbase_Smart_Wallet_Password_Set_Processing,
      info: {
        step: 'completed',
        showResumeUpdateAccount: true,
      },
    })

    await sdk.sleep(2 * 1000)

    setShowAccount({ isShow: false })
  } catch (e) {
    handleError(e, isReset)
  }
}

export const goUpdateAccountCoinbaseWalletUpdateAccountFn = async ({
  isFirstTime = false,
  isReset = false,
  feeInfo,
  updateAccountJSON,
}: {
  isFirstTime?: boolean
  isReset?: boolean
  feeInfo?: FeeInfo
  updateAccountJSON: string
}) => {
  const {
    settings: { defaultNetwork },
  } = store.getState()
  const setShowAccount = (args: any) => store.dispatch(_setShowAccount(args))
  const { eddsaKey, request } = JSON.parse(updateAccountJSON)
  try {
    setShowAccount({
        isShow: true,
        step: AccountStep.Coinbase_Smart_Wallet_Password_Set_Processing,
        info: {
          step: 'updatingAccount',
        showResumeUpdateAccount: true,
      },
    })

    await updateAccountRecursively({
      request,
      eddsaKey: { eddsaKey },
    })

    const foundData = store.getState().localStore.coinbaseSmartWalletPersist.data!.find((item) => item.chainId === defaultNetwork && isSameEVMAddress(item.wallet, request.owner))!
    const submitEncryptedEcdsaKeyReq = {
      accountId: request.accountId,
      eddsaEncryptedPrivateKey: foundData.eddsaKey.sk,
      nonce: request.nonce + 1,
    }
    const backupKeyJSON = JSON.stringify({
      request: submitEncryptedEcdsaKeyReq,
      eddsaKey: eddsaKey
    })
    store.dispatch(
      coinbaseSmartWalletPersist.persistStoreCoinbaseSmartWalletData({
        ...foundData,
        nonce: request.nonce + 1,
        updateAccountData: {
          updateAccountNotFinished: false,
          json: '',
        },
        eddsaKeyBackup: {
          backupNotFinished: true,
          json: backupKeyJSON
        }
      }),
    )

    await goUpdateAccountCoinbaseWalletBackupKeyOnlyFn({
      isReset,
      backupKeyJSON,
    })
  } catch (e) {
    handleError(e, isReset)
  }
}


const checkBeforeGoUpdateAccount = async () => {
  const {
    account: { accAddress, nonce, accountId },
    settings: { defaultNetwork },
    localStore: { coinbaseSmartWalletPersist },
    system: { exchangeInfo },
  } = store.getState()
  if (!exchangeInfo) {
    return false
  }
  console.log('checkBeforeGoUpdateAccount', 'start')
  if (await isCoinbaseSmartWallet(accAddress, defaultNetwork)) {
    console.log('checkBeforeGoUpdateAccount', 'isCoinbaseSmartWallet')
    const foundPersistData = coinbaseSmartWalletPersist?.data.find(
      (item) =>
        item.chainId === defaultNetwork &&
        isSameEVMAddress(item.wallet, accAddress) &&
        item.nonce === nonce,
    )
    if (
      foundPersistData &&
      !!foundPersistData.eddsaKeyBackup?.backupNotFinished &&
      foundPersistData.eddsaKeyBackup?.json
    ) {
      console.log('checkBeforeGoUpdateAccount', 'isCoinbaseSmartWallet', 'backupNotFinished')
      goUpdateAccountCoinbaseWalletBackupKeyOnlyFn({
        isReset: false,
        backupKeyJSON: foundPersistData.eddsaKeyBackup?.json!,
      })
    } else if (
      foundPersistData &&
      !!foundPersistData.updateAccountData?.updateAccountNotFinished &&
      foundPersistData.updateAccountData?.json
    ) {
      console.log('checkBeforeGoUpdateAccount', 'isCoinbaseSmartWallet', 'updateAccountNotFinished')
      goUpdateAccountCoinbaseWalletUpdateAccountFn({
        isReset: false,
        updateAccountJSON: foundPersistData.updateAccountData?.json!,
      })
    } else {
      console.log('checkBeforeGoUpdateAccount', 'isCoinbaseSmartWallet', 'else')
      store.dispatch(
        _setShowAccount({
          isShow: true,
          step: AccountStep.Coinbase_Smart_Wallet_Password_Input,
        }),
      )
    }
    return false
  }
  console.log('checkBeforeGoUpdateAccount', 'not coinbaseSmartWallet')
  return true
}

export function useUpdateAccount() {
  const { updateHW, checkHWAddr } = useWalletInfo()
  const { setShowAccount } = useOpenModals()
  const { account } = useAccount()
  const { search } = useLocation()
  const { referralCode, setReferralCode, defaultNetwork } = useSettings()
  const { persistStoreCoinbaseSmartWalletData } = coinbaseSmartWalletPersist.useCoinbaseSmartWalletPersist()


  const goUpdateAccount = React.useCallback(
    async ({
      isFirstTime = false,
      isReset = false,
      feeInfo,
    }: {
      isFirstTime?: boolean
      isReset?: boolean
      feeInfo?: FeeInfo
    }) => {
      const shouldContinue = await checkBeforeGoUpdateAccount()
      if (!shouldContinue) {
        return
      }

      setShowAccount({
        isShow: true,
        step: isReset
          ? AccountStep.ResetAccount_Approve_WaitForAuth
          : AccountStep.UpdateAccount_Approve_WaitForAuth,
      })

      const isHWAddr = !isFirstTime ? true : checkHWAddr(account.accAddress)

      myLog(
        'goUpdateAccount: isFirstTime:',
        isFirstTime,
        ' isReset:',
        isReset,
        ' isHWAddr:',
        isHWAddr,
      )
      let walletType, apiKey
      try {
        const { eddsaKey, accInfo } = await activateAccount({
          isHWAddr,
          feeInfo,
          isReset,
          referral: referralCode,
        })
        if (!isFirstTime && isHWAddr) {
          updateHW({ wallet: account.accAddress, isHWAddr })
        }
        if (LoopringAPI.userAPI && LoopringAPI.walletAPI && accInfo && accInfo?.accountId !== -1) {
          ;[{ apiKey }, { walletType }] = await Promise.all([
            LoopringAPI.userAPI.getUserApiKey(
              {
                accountId: accInfo.accountId,
              },
              eddsaKey.sk,
            ),
            LoopringAPI.walletAPI.getWalletType({
              wallet: account.accAddress,
              network: MapChainId[defaultNetwork] as sdk.NetworkWallet
            }),
          ])
            .then((response) => {
              if ((response[0] as sdk.RESULT_INFO)?.code) {
                throw response[0]
              }
              return response as any
            })
            .catch((error) => {
              throw error
            })
          accountServices.sendAccountSigned({
            apiKey,
            eddsaKey,
            isInCounterFactualStatus: walletType?.isInCounterFactualStatus,
            isContract: walletType?.isContract,
          })
          setShowAccount({
            isShow: true,
            step: isReset ? AccountStep.ResetAccount_Success : AccountStep.UpdateAccount_Success,
          })
          await sdk.sleep(1000)
          setShowAccount({ isShow: false })
        } else {
          throw { code: UIERROR_CODE.DATA_NOT_READY }
        }
      } catch (e) {
        handleError(e, isReset)
      }
      setReferralCode('')
    },
    [account.accAddress, search, checkHWAddr, setShowAccount, updateHW, referralCode],
  )

  const goUpdateAccountCoinbaseWallet = React.useCallback(
    async ({
      isFirstTime = false,
      isReset = false,
      feeInfo,
      password,
    }: {
      password: string
      isFirstTime?: boolean
      isReset?: boolean
      feeInfo?: FeeInfo
    }) => {      
      try {
        
        setShowAccount({
          isShow: true,
          step: AccountStep.Coinbase_Smart_Wallet_Password_Set_Processing,
          info: {
            step: 'keyGenerating',
            showResumeUpdateAccount: false
          }
        })
        
        const { eddsaKey, request, approveFn } = await activateAccountSmartWallet({
          feeInfo,
          isReset,
          referral: referralCode,
        })
        setShowAccount({
          isShow: true,
          step: AccountStep.Coinbase_Smart_Wallet_Password_Set_Processing,
          info: {
            step: 'blockConfirming',
            showResumeUpdateAccount: false
          }
        })
        await approveFn()
        const encryptedSk = encryptAESMd5(password, eddsaKey.sk)
        const updateAccountJSON = JSON.stringify({
          request, 
          eddsaKey
        })
        persistStoreCoinbaseSmartWalletData({
          eddsaKey: {
            ...eddsaKey,
            sk: encryptedSk
          },
          wallet: request.owner,
          nonce: request.nonce,
          chainId: defaultNetwork,
          updateAccountData: {
            updateAccountNotFinished: true,
            json: updateAccountJSON
          },
          eddsaKeyBackup: {
            backupNotFinished: true,
            json: ''
          }
        })

        await goUpdateAccountCoinbaseWalletUpdateAccountFn({
          isFirstTime,
          isReset,
          feeInfo,
          updateAccountJSON,
        })
      } catch (e) {
        handleError(e, isReset)
      }
      setReferralCode('')
    },
    [account.accAddress, search, checkHWAddr, setShowAccount, updateHW, referralCode],
  )

  return {
    goUpdateAccount,
    goUpdateAccountCoinbaseWallet,
  }
}
