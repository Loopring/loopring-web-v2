import { useDispatch, useSelector } from 'react-redux'
import { AmmMapStates } from './interface';
import { ammMapSlice } from './reducer';

export const useAmmMap = <R extends {[key:string]:any},I extends {[key:string]:any}>(): AmmMapStates<R,I> & {
    updateAmmMap:()=> void,
    statusUnset:()=> void,
} => {
    const ammMap:AmmMapStates<R,I>= useSelector((state: any) => state.amm.ammMap)
    const dispatch = useDispatch();
    const updateAmmMap = () => {
        dispatch(ammMapSlice.actions.getAmmMap(undefined))
    }
    const statusUnset = ()=>{
        dispatch(ammMapSlice.actions.statusUnset(undefined))
    }
    return {
        ...ammMap,
        statusUnset,
        updateAmmMap
    }
}
