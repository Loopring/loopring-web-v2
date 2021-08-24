import { useDispatch, useSelector } from 'react-redux'
import { ModalState, ModalStatePlayLoad, Transaction } from './interface';
import {
    setShowAccount,
    setShowAmm,
    setShowConnect,
    setShowDeposit,
    setShowResetAccount,
    setShowSwap,
    setShowTransfer,
    setShowWithdraw
} from './reducer';

import React from 'react';

export const useOpenModals = () => {
    const dispatch = useDispatch();
    return {
        modals: useSelector((state: any) => state.modals) as ModalState,
        setShowTransfer: React.useCallback((state: ModalStatePlayLoad & Transaction) => dispatch(setShowTransfer(state)), [dispatch]),
        setShowDeposit: React.useCallback((state: ModalStatePlayLoad & Transaction ) => dispatch(setShowDeposit(state)), [dispatch]),
        setShowWithdraw: React.useCallback((state: ModalStatePlayLoad & Transaction) => dispatch(setShowWithdraw(state)), [dispatch]),
        setShowResetAccount: React.useCallback((state: ModalStatePlayLoad ) => dispatch(setShowResetAccount(state)), [dispatch]),
        setShowAmm: React.useCallback((state: ModalStatePlayLoad ) => dispatch(setShowAmm(state)), [dispatch]),
        setShowSwap: React.useCallback((state: ModalStatePlayLoad ) => dispatch(setShowSwap(state)), [dispatch]),
        setShowAccount: React.useCallback((state: ModalStatePlayLoad & { step?: number }) => dispatch(setShowAccount(state)), [dispatch]),
        setShowConnect: React.useCallback((state: ModalStatePlayLoad & { step?: number }) => dispatch(setShowConnect(state)), [dispatch]),
    }

}
