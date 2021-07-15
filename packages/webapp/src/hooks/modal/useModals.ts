import { useCallback } from "react";
import { useDispatch } from "react-redux"

import {
    setShowDeposit,
    setShowResetAccount,
    setShowTransfer,
    setShowWithdraw,
} from '@loopring-web/component-lib'
import { useTranslation } from "react-i18next";
import store from 'stores'
import { AccountStatus } from "state_machine/account_machine_spec";

export function useModals() {

    const dispatch = useDispatch()

    const { t } = useTranslation('common')

    const ShowDeposit = useCallback((isShow: boolean)=>{
        const isNoAccount = store.getState().account.status === AccountStatus.NOACCOUNT

        console.log('isNoAccount: ', isNoAccount, t('depositTitleAndActive'))
        const action = {
            isShow,
            props: {
                title: isNoAccount ? t('depositTitleAndActive') : t('depositTitle'),
                description: 'depositAndActiveDescription'
            }
        }
        dispatch(setShowDeposit(action))
    }, [dispatch, t])
    const ShowTransfer = useCallback((isShow: boolean)=>dispatch(setShowTransfer({isShow})), [dispatch])
    const ShowWithdraw = useCallback((isShow: boolean)=>dispatch(setShowWithdraw({isShow})), [dispatch])
    const ShowResetAccount = useCallback((isShow: boolean)=>dispatch(setShowResetAccount({isShow})), [dispatch])

    return {
        ShowDeposit,
        ShowTransfer,
        ShowWithdraw,
        ShowResetAccount,
    }
}