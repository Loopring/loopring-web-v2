import React from 'react';
import * as _ from 'lodash';
import { globalSetup, SagaStatus } from '@loopring-web/common-resources';
import { useWalletLayer1 } from '../../stores/walletLayer1';
import { walletService } from './walletService';
import { useWalletLayer2 } from '../../stores/walletLayer2';

export const useWalletHook=({throttleWait = globalSetup.throttleWait,walletLayer2Callback,walletLayer1Callback}:{
    throttleWait?:number,
    walletLayer2Callback?:()=>void,
    walletLayer1Callback?:()=>void,
})=>{
    const { updateWalletLayer1,status:walletLayer1Status, } = useWalletLayer1();
    const { updateWalletLayer2,status:walletLayer2Status, } = useWalletLayer2();
    const subject = React.useMemo(() => walletService.onSocket(), []);

    const socketUpdate = React.useCallback(_.throttle(()=>{
        updateWalletLayer1()
        updateWalletLayer2();
    },throttleWait),[updateWalletLayer1,updateWalletLayer2]);
    React.useEffect(() => {
        const subscription = subject.subscribe((balance) => {
            if (balance) {
                //socketUpdateBalance(balance)
                socketUpdate();
            }
        });
        return () => subscription.unsubscribe();
    }, [subject]);
    React.useEffect(() => {
        if (walletLayer2Callback && walletLayer2Status === SagaStatus.UNSET) {
                walletLayer2Callback()
        }
    }, [walletLayer2Status])
    React.useEffect(() => {
        if (walletLayer1Callback && walletLayer1Status === SagaStatus.UNSET) {
            walletLayer1Callback()
        }
    }, [walletLayer1Status])
}