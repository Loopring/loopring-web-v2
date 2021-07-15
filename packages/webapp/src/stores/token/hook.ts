import { useDispatch, useSelector } from 'react-redux'
import { tokenMapSlice } from './reducer';
import { TokenMapStates } from './interface';

export function useTokenMap<R extends {[key:string]:any}>(): TokenMapStates<R> & {
    updateTokenMap:()=>void,
    statusUnset:()=>void,
} {
    const tokenMap:TokenMapStates<R> = useSelector((state: any) => state.tokenMap)
    const dispatch = useDispatch();
    const updateTokenMap = () => {
        dispatch(tokenMapSlice.actions.getTokenMap(undefined))
    }
    const statusUnset = ()=>{
        dispatch(tokenMapSlice.actions.statusUnset(undefined))
    }
    return {
        ...tokenMap,
        statusUnset,
        updateTokenMap,
    }

}
