import { useDispatch, useSelector } from 'react-redux'
import {  AmmTradesStates } from './interface';
import { ammTradesSlice } from './reducer';

export function useAmmTrades(): AmmTradesStates & {
    updateAmmTrades:()=> void,
    statusUnset:()=> void
} {
    const ammTrades:AmmTradesStates = useSelector((state: any) => state.amm.ammTrades)
    const dispatch = useDispatch();
    const updateAmmTrades = () => {
        dispatch(ammTradesSlice.actions.getAmmTrades(undefined))
    }
    const statusUnset = ()=>{
        dispatch(ammTradesSlice.actions.statusUnset(undefined))
    }
    return {
        ...ammTrades,
        statusUnset,
        updateAmmTrades
    }

}
