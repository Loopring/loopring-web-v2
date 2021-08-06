import React from "react";
import { useDispatch } from "react-redux"

import { setShowDeposit, setShowResetAccount, setShowTransfer, setShowWithdraw, } from '@loopring-web/component-lib'
import { useTranslation } from "react-i18next";
import { useAccount } from '../stores/account';
import { AccountStatus } from '@loopring-web/common-resources';

export function useModals() {

    const dispatch = useDispatch()
    const {account: {readyState}} = useAccount()
    const {t} = useTranslation('common')

    const ShowDeposit = React.useCallback((isShow: boolean, defaultProps?: any) => {

        const isNoAccount = readyState === AccountStatus.NO_ACCOUNT

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
    }, [dispatch, t, readyState])
    const ShowTransfer = React.useCallback((isShow: boolean, defaultProps?: any) => dispatch(setShowTransfer({
        isShow,
        props: {...defaultProps}
    })), [dispatch])
    const ShowWithdraw = React.useCallback((isShow: boolean, defaultProps?: any) => dispatch(setShowWithdraw({
        isShow,
        props: {...defaultProps}
    })), [dispatch])
    const ShowResetAccount = React.useCallback((isShow: boolean, defaultProps?: any) => dispatch(setShowResetAccount({
        isShow,
        props: {...defaultProps}
    })), [dispatch])

    return {
        ShowDeposit,
        ShowTransfer,
        ShowWithdraw,
        ShowResetAccount,
    }
}