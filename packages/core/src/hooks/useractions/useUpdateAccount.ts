import React from 'react'

import { FeeInfo, MapChainId, myLog, UIERROR_CODE } from '@loopring-web/common-resources'
import { AccountStep, setShowAccount as _setShowAccount, useOpenModals, useSettings } from '@loopring-web/component-lib'

import { activateAccount, useAccount, LoopringAPI, accountServices, activateAccountSmartWallet, updateAccountRecursively, isCoinbaseSmartWallet, encryptAESMd5 } from '../../index'

import * as sdk from '@loopring-web/loopring-sdk'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import { useLocation } from 'react-router-dom';
import { coinbaseSmartWalletPersist, store } from '../../stores'
import { persistStoreCoinbaseSmartWalletData } from 'stores/localStore/coinbaseSmartWalletPersist'

export const goUpdateAccountCoinbaseWalletUpdateAccountOnlyFn = async ({
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
    store.dispatch(
      coinbaseSmartWalletPersist.persistStoreCoinbaseSmartWalletData({
        ...store.getState().localStore.coinbaseSmartWalletPersist.data!,
        updateAccountData: {
          updateAccountNotFinished: false,
          json: '',
        },
      }),
    )

    const [{ apiKey }, { walletType }] = await Promise.all([
      LoopringAPI?.userAPI?.getUserApiKey(
        {
          accountId: request.accountId,
        },
        eddsaKey.sk,
      ),
      LoopringAPI?.walletAPI?.getWalletType({
        wallet: request.owner,
        network: MapChainId[defaultNetwork] as sdk.NetworkWallet,
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
      step: AccountStep.Coinbase_Smart_Wallet_Password_Set_Processing,
      info: {
        step: 'completed',
        showResumeUpdateAccount: true,
      },
    })
    
    await sdk.sleep(2 * 1000)
    
    setShowAccount({ isShow: false })
  } catch (e) {
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
      const result = await isCoinbaseSmartWallet(account.accAddress, defaultNetwork as sdk.ChainId)
      if (result) {
        setShowAccount({
          step: AccountStep.Coinbase_Smart_Wallet_Password_Intro,
          isShow: true,
          info: {
            feeInfo,
            isReset
          }
        })
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
      setReferralCode('')
    },
    [account.accAddress, search, checkHWAddr, setShowAccount, updateHW, referralCode],
  )

  const goUpdateAccountCoinbaseWallet = React.useCallback(
    async ({
      isFirstTime = false,
      isReset = false,
      feeInfo,
      password
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
        
        persistStoreCoinbaseSmartWalletData({
          eddsaKey: {
            ...eddsaKey,
            sk: encryptAESMd5(password, eddsaKey.sk)
          },
          wallet: request.owner,
          nonce: request.nonce + 1,
          chainId: defaultNetwork,
          updateAccountData: {
            updateAccountNotFinished: true,
            json: JSON.stringify({
              request, 
              eddsaKey
            })
          }
        })

        if (!LoopringAPI.userAPI || !LoopringAPI.walletAPI) {
          throw { code: UIERROR_CODE.DATA_NOT_READY }
        }
        
        setShowAccount({
          isShow: true,
          step: AccountStep.Coinbase_Smart_Wallet_Password_Set_Processing,
          info: {
            step: 'updatingAccount',
            showResumeUpdateAccount: false
          }
        })

        await updateAccountRecursively({
          request, 
          eddsaKey: { eddsaKey }
        })

        persistStoreCoinbaseSmartWalletData({
          ...store.getState().localStore.coinbaseSmartWalletPersist.data!,
          updateAccountData: {
            updateAccountNotFinished: false,
            json: ''
          }
        })

        const [{ apiKey }, { walletType }] = await Promise.all([
          LoopringAPI.userAPI.getUserApiKey(
              {
                accountId: request.accountId,
              },
              eddsaKey.sk,
            ),
            LoopringAPI.walletAPI.getWalletType({
              wallet: request.owner,
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
            step: AccountStep.Coinbase_Smart_Wallet_Password_Set_Processing,
            info: {
              step: 'completed',
              showResumeUpdateAccount: false
            }
          })
          await sdk.sleep(2 * 1000)
          setShowAccount({ isShow: false })
      } catch (e) {
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
      setReferralCode('')
    },
    [account.accAddress, search, checkHWAddr, setShowAccount, updateHW, referralCode],
  )
  
  const goUpdateAccountCoinbaseWalletUpdateAccountOnly = React.useCallback(
    async ({
      isReset = false,
      updateAccountJSON
    }: {
      isReset?: boolean
      updateAccountJSON: string
    }) => {      
      goUpdateAccountCoinbaseWalletUpdateAccountOnlyFn({
        isReset,
        updateAccountJSON
      })
      setReferralCode('')
    },
    [account.accAddress, search, checkHWAddr, setShowAccount, updateHW, referralCode],
  )

  return {
    goUpdateAccount,
    goUpdateAccountCoinbaseWallet,
    goUpdateAccountCoinbaseWalletUpdateAccountOnly
  }
}
