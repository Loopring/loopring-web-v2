import React from 'react'

import { FeeInfo, MapChainId, myLog, UIERROR_CODE } from '@loopring-web/common-resources'
import { AccountStep, useOpenModals, useSettings } from '@loopring-web/component-lib'

import { activateAccount, useAccount, LoopringAPI, accountServices } from '../../index'

import * as sdk from '@loopring-web/loopring-sdk'
import { useWalletInfo } from '../../stores/localStore/walletInfo'
import { useLocation } from 'react-router-dom'

export function useUpdateAccount() {
  const { updateHW, checkHWAddr } = useWalletInfo()
  const { setShowAccount } = useOpenModals()
  const { account } = useAccount()
  const { search } = useLocation()
  const { referralCode, setReferralCode, defaultNetwork } = useSettings()
  // const searchParams = new URLSearchParams(search);

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

  return {
    goUpdateAccount,
  }
}
