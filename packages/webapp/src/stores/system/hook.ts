import { useDispatch, useSelector } from 'react-redux'
import { systemSlice } from './reducer';
import { System, SystemStatus } from './interface';

export function useSystem(): SystemStatus & {
    updateSystem:(system:Partial<System< {[key:string]:any}>>)=>void,
    statusUnset:()=>void,
} {
    const system:SystemStatus = useSelector((state: any) => state.system)
    const dispatch = useDispatch();
    const updateSystem = (system:Partial<System<{[key:string]:any}>>) => {
        dispatch(systemSlice.actions.updateSystem(system))
    }
    const statusUnset = ()=>{
        dispatch(systemSlice.actions.statusUnset(undefined))
    }
    return {
        ...system,
        statusUnset,
        updateSystem,
    }

}
