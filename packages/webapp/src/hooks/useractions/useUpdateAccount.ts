import React from 'react'

import { updateAccountStatus, useAccount } from 'stores/account'
import { myLog } from '@loopring-web/common-resources'
import {
    AccountStep,
    useOpenModals,
} from '@loopring-web/component-lib'

import { updateAccountFromServer } from 'services/account/activateAccount'

import { ActionResult, ActionResultCode, REFRESH_RATE, } from 'defs/common_defs'

import { useWalletInfo } from 'stores/localStore/walletInfo'

import { LoopringAPI } from 'api_wrapper'

import { accountServices } from '../../services/account/accountServices'

import store from 'stores'

import { ConnectorError, sleep } from 'loopring-sdk'

import { checkErrorInfo } from 'hooks/useractions/utils'

export function useUpdateAccout() {

    const {walletInfo, updateDepositHashWrapper, checkHWAddr,} = useWalletInfo()

    const { setShowAccount, } = useOpenModals()

    const {
        account,
    } = useAccount();

    const goUpdateAccount = React.useCallback(async (isFirstTime: boolean = true) => {

        if (!account.accAddress) {
            myLog('account.accAddress is nil')
            return
        }

        setShowAccount({isShow: true, step: AccountStep.UpdateAccount_Approve_WaitForAuth});

        let isHWAddr = checkHWAddr(account.accAddress)

        isHWAddr = !isFirstTime ? !isHWAddr : isHWAddr

        myLog('goUpdateAccount.... isFirstTime:', isFirstTime, ' isHWAddr:', isHWAddr)

        const updateAccAndCheck = async () => {
            const result: ActionResult = await updateAccountFromServer({isHWAddr})

            switch (result.code) {
                case ActionResultCode.NoError:

                    const eddsaKey = result?.data?.eddsaKey
                    myLog(' after NoError:', eddsaKey)
                    await sleep(REFRESH_RATE)

                    if (LoopringAPI.userAPI && LoopringAPI.exchangeAPI && eddsaKey) {

                        const {accInfo, error} = await LoopringAPI.exchangeAPI.getAccount({owner: account.accAddress})

                        if (!error && accInfo) {

                            const {apiKey} = (await LoopringAPI.userAPI.getUserApiKey({
                                accountId: accInfo.accountId
                            }, eddsaKey.sk))

                            myLog('After connect >>, get apiKey', apiKey)

                            if (!isFirstTime && isHWAddr) {
                                updateDepositHashWrapper({wallet: account.accAddress, isHWAddr,})
                            }

                            accountServices.sendAccountSigned(accInfo.accountId, apiKey, eddsaKey)

                        }

                    }

                    setShowAccount({isShow: false})
                    break
                case ActionResultCode.GetAccError:
                case ActionResultCode.GenEddsaKeyError:
                case ActionResultCode.UpdateAccoutError:


                    const eddsaKey2 = result?.data?.eddsaKey

                    if (eddsaKey2) {
                        myLog('UpdateAccoutError:', eddsaKey2)
                        store.dispatch(updateAccountStatus({eddsaKey: eddsaKey2,}))
                    }

                    const errMsg = checkErrorInfo(result?.data?.errorInfo, isFirstTime)

                    myLog('----------UpdateAccoutError errMsg:', errMsg)

                    switch (errMsg) {
                        case ConnectorError.NOT_SUPPORT_ERROR:
                            myLog(' 00000---- got NOT_SUPPORT_ERROR')
                            setShowAccount({isShow: true, step: AccountStep.UpdateAccount_First_Method_Denied})
                            return
                        case ConnectorError.USER_DENIED:
                            myLog(' 11111---- got USER_DENIED')
                            setShowAccount({isShow: true, step: AccountStep.UpdateAccount_User_Denied})
                            return
                        default:
                            myLog(' 11111---- got UpdateAccount_Success')
                            setShowAccount({isShow: true, step: AccountStep.UpdateAccount_Success})
                            accountServices.sendCheckAccount(account.accAddress)
                            break
                    }
                    break
                default:
                    break
            }

        }

        updateAccAndCheck()

    }, [account, setShowAccount, walletInfo])

    return {
        goUpdateAccount,
    }
}
