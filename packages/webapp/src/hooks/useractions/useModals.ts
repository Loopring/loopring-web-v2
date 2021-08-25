import React from "react";
import { useDispatch } from "react-redux"
import { useTranslation } from "react-i18next";

import {
    ModalStatePlayLoad,
    setShowDeposit,
    setShowResetAccount,
    setShowTransfer,
    setShowWithdraw, Transaction,
} from '@loopring-web/component-lib'

import { useAccount } from 'stores/account'

export function useModals() {
    const dispatch = useDispatch()
    const {account: {readyState}} = useAccount()
    const {t} = useTranslation('common')
    const showDeposit = React.useCallback(({isShow,symbol}:ModalStatePlayLoad & Transaction) => dispatch(setShowDeposit({
        isShow,symbol
    })), [dispatch])
    const showTransfer = React.useCallback(({isShow,symbol}: ModalStatePlayLoad & Transaction) => dispatch(setShowTransfer({
        isShow,symbol
    })), [dispatch])
    const showWithdraw = React.useCallback(({isShow,symbol}: ModalStatePlayLoad & Transaction) => dispatch(setShowWithdraw({
        isShow,symbol
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