import { useDispatch, useSelector } from 'react-redux'
import { walletLayer2Slice } from './reducer';
import { WalletLayer2States } from './interface';
import { sleep } from 'loopring-sdk';
import { myLog } from 'utils/log_tools';
import _ from 'lodash'

export function useWalletLayer2(): WalletLayer2States & {
    delayAndUpdateWalletLayer2: () => Promise<void>,
    updateWalletLayer2:()=> void,
    statusUnset:()=> void,
    resetLayer2:()=>void,
} {
    const walletLayer2:WalletLayer2States = useSelector((state: any) => state.walletLayer2)
    const dispatch = useDispatch();

    const delayAndUpdateWalletLayer2 = async() => {
        myLog('try to delayAndUpdateWalletLayer2 111')
        _.delay(() => {
            updateWalletLayer2()
        }, 3000)
    }

    const updateWalletLayer2 = () => {
        dispatch(walletLayer2Slice.actions.updateWalletLayer2(undefined))
    }
    const statusUnset = ()=>{
        dispatch(walletLayer2Slice.actions.statusUnset(undefined))
    }
    const resetLayer2 = ()=>{
        dispatch(walletLayer2Slice.actions.reset(undefined))
    }
    return {
        ...walletLayer2,
        resetLayer2,
        statusUnset,
        delayAndUpdateWalletLayer2,
        updateWalletLayer2
    }

}
