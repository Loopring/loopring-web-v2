import { useDispatch, useSelector } from 'react-redux'
import { reset, statusUnset, updateWalletLayer2 } from './reducer';
import { WalletLayer2States } from './interface';
import { myLog } from 'utils/log_tools';
import _ from 'lodash'
import React from 'react';
import { TOAST_TIME, UPDATE_ACC_DELAY } from 'defs/common_defs';

export function useWalletLayer2(): WalletLayer2States & {
    delayAndUpdateWalletLayer2: () => Promise<void>,
    updateWalletLayer2: () => void,
    statusUnset: () => void,
    resetLayer2: () => void,
} {
    const walletLayer2: WalletLayer2States = useSelector((state: any) => state.walletLayer2)
    const dispatch = useDispatch();

    // const updateWalletLayer2 = () => {
    //     dispatch(walletLayer2Slice.actions.updateWalletLayer2(undefined))
    // }
    // const statusUnset = ()=>{
    //     dispatch(walletLayer2Slice.actions.statusUnset(undefined))
    // }
    // const resetLayer2 = ()=>{
    //     dispatch(walletLayer2Slice.actions.reset(undefined))
    // }
    return {
        ...walletLayer2,
        resetLayer2: React.useCallback(() => {
            myLog('resetLayer2 resetLayer2 resetLayer2')
            dispatch(reset(undefined))
        }, [dispatch]),
        statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
        updateWalletLayer2: React.useCallback(() => dispatch(updateWalletLayer2(undefined)), [dispatch]),
        delayAndUpdateWalletLayer2: React.useCallback(async () => {
            myLog('try to delayAndUpdateWalletLayer2!' + new Date().getTime())
            _.delay(() => {
                dispatch(updateWalletLayer2(undefined))
                myLog('try to delayAndUpdateWalletLayer2 updated!' + new Date().getTime())
                return Promise.resolve()
            }, UPDATE_ACC_DELAY);
        }, [dispatch]),
    }

}
