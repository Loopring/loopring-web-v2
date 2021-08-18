import React from "react";
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next";

import { 
    setShowDeposit, 
    setShowResetAccount, 
    setShowTransfer, 
    setShowWithdraw, } from '@loopring-web/component-lib'
import { AccountStatus } from '@loopring-web/common-resources'

import { useAccount } from 'stores/account'

export function useModals() {
    const dispatch = useDispatch()
    const {account: {readyState}} = useAccount()
    const {t} = useTranslation('common')
    const showDeposit = React.useCallback((isShow: boolean, defaultProps?: any) => {

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
    const showTransfer = React.useCallback((isShow: boolean, defaultProps?: any) => dispatch(setShowTransfer({
        isShow,
        props: {...defaultProps}
    })), [dispatch])
    const showWithdraw = React.useCallback((isShow: boolean, defaultProps?: any) => dispatch(setShowWithdraw({
        isShow,
        props: {...defaultProps}
    })), [dispatch])
    const showResetAccount = React.useCallback((isShow: boolean, defaultProps?: any) => dispatch(setShowResetAccount({
        isShow,
        props: {...defaultProps}
    })), [dispatch])

    return {
        showDeposit,
        showTransfer,
        showWithdraw,
        // ShowResetAccount,
    }
}