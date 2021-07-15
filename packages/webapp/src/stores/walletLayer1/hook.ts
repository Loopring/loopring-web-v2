import { useDispatch, useSelector } from 'react-redux'
import { walletLayer1Slice } from './reducer';
import { WalletLayer1States } from './interface';

export function useWalletLayer1(): WalletLayer1States & {
    updateWalletLayer1:()=> void,
    statusUnset:()=> void,
    resetLayer1:()=>void,
} {
    const walletLayer1:WalletLayer1States = useSelector((state: any) => state.walletLayer1)
    const dispatch = useDispatch();
    const updateWalletLayer1 = () => {
        dispatch(walletLayer1Slice.actions.updateWalletLayer1(undefined))
    }
    const statusUnset = ()=>{
        dispatch(walletLayer1Slice.actions.statusUnset(undefined))
    }
    const resetLayer1 = ()=>{
        dispatch(walletLayer1Slice.actions.reset(undefined))
    }
    return {
        ...walletLayer1,
        resetLayer1,
        statusUnset,
        updateWalletLayer1
    }

}
