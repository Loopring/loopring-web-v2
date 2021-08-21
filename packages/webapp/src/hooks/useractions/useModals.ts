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
    const showDeposit = React.useCallback((isShow: boolean) => dispatch(setShowDeposit({
        isShow
    })), [dispatch])
    const showTransfer = React.useCallback((isShow: boolean) => dispatch(setShowTransfer({
        isShow
    })), [dispatch])
    const showWithdraw = React.useCallback((isShow: boolean) => dispatch(setShowWithdraw({
        isShow
    })), [dispatch])
    const showResetAccount = React.useCallback((isShow: boolean) => dispatch(setShowResetAccount({
        isShow
    })), [dispatch])

    return {
        showDeposit,
        showTransfer,
        showWithdraw,
        // ShowResetAccount,
    }
}