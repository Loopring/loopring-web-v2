import { useDispatch, useSelector } from 'react-redux'
import { reset, socketUpdateBalance, statusUnset, updateWalletLayer2 } from './reducer';
import { WalletLayer2States } from './interface';
import { myLog } from 'utils/log_tools';
import _ from 'lodash'
import React from 'react';
import { UPDATE_ACC_DELAY } from 'defs/common_defs';
import * as loopring_defs from 'loopring-sdk';

export function useWalletLayer2(): WalletLayer2States & {
    delayAndUpdateWalletLayer2: () => Promise<void>,
    updateWalletLayer2: () => void,
    socketUpdateBalance: (balance:{[key:string ]:loopring_defs.UserBalanceInfo}) => void,
    statusUnset: () => void,
    resetLayer2: () => void,
} {
    const walletLayer2: WalletLayer2States = useSelector((state: any) => state.walletLayer2)
    const dispatch = useDispatch();

    return {
        ...walletLayer2,
        resetLayer2: React.useCallback(() => {
            dispatch(reset(undefined))
        }, [dispatch]),
        statusUnset: React.useCallback(() => dispatch(statusUnset(undefined)), [dispatch]),
        updateWalletLayer2: React.useCallback(() => dispatch(updateWalletLayer2(undefined)), [dispatch]),
        socketUpdateBalance: React.useCallback((balance:{[key:string ]:loopring_defs.UserBalanceInfo})=> dispatch(socketUpdateBalance(balance)), [dispatch]),
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
