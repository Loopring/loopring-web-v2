import { goErrorNetWork } from './lockAccount';
import store from '../../stores';
import { updateAccountStatus } from '../../stores/account';
import { updateSystem } from '../../stores/system';


export const networkUpdate =  ({chainId}:any):void=>{
    const _chainId = store.getState().system.chainId;
    if (chainId !== _chainId && _chainId !== 'unknown' && chainId !== 'unknown') {
        store.dispatch(updateAccountStatus({chainId}));
        store.dispatch(updateSystem({chainId}));
        window.location.reload();
    } else if (chainId == 'unknown') {
        store.dispatch(updateAccountStatus({wrongChain: true}));
        goErrorNetWork();
    }else{
        store.dispatch(updateAccountStatus({wrongChain: false,chainId}));
    }
}
