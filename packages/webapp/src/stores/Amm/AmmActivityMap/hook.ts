import { useDispatch, useSelector } from 'react-redux'
import { AmmActivityMapStates } from './interface';
import { ammActivityMapSlice } from './reducer';

export function useAmmActivityMap(): AmmActivityMapStates & {
    updateAmmActivityMap:()=> void,
    statusUnset:()=> void,
} {
    const ammActivityMap:AmmActivityMapStates = useSelector((state: any) => state.amm.ammActivityMap)
    const dispatch = useDispatch();
    const updateAmmActivityMap = () => {
        dispatch(ammActivityMapSlice.actions.getAmmActivityMap(undefined))
    }
    const statusUnset = ()=>{
        dispatch(ammActivityMapSlice.actions.statusUnset(undefined))
    }
    return {
        ...ammActivityMap,
        statusUnset,
        updateAmmActivityMap
    }

}
