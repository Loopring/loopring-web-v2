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

    const ShowDeposit = useCallback((isShow: boolean, defaultProps?: any)=>{
        const isNoAccount = store.getState().account.status === AccountStatus.NOACCOUNT

        console.log('isNoAccount: ', isNoAccount, t('depositTitleAndActive'))
        const action = {
            isShow,
            props: {
                title: isNoAccount ? t('depositTitleAndActive') : t('depositTitle'),
                description: 'depositAndActiveDescription',
                ...defaultProps
            },
        }
        dispatch(setShowDeposit(action))
    }, [dispatch, t])
    const ShowTransfer = useCallback((isShow: boolean, defaultProps?: any) => dispatch(setShowTransfer({isShow, props: {...defaultProps}})), [dispatch])
    const ShowWithdraw = useCallback((isShow: boolean, defaultProps?: any) => dispatch(setShowWithdraw({isShow, props: {...defaultProps}})), [dispatch])
    const ShowResetAccount = useCallback((isShow: boolean, defaultProps?: any) => dispatch(setShowResetAccount({isShow, props: {...defaultProps}})), [dispatch])

    return {
        ShowDeposit,
        ShowTransfer,
        ShowWithdraw,
        ShowResetAccount,
    }
}