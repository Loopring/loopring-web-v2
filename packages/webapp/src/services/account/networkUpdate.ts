import { goErrorNetWork } from './lockAccount';
import store from '../../stores';
import { updateAccountStatus } from '../../stores/account';
import { updateSystem } from '../../stores/system';


export const networkUpdate =  ({chainId}:any):boolean=>{
    const _chainId = store.getState().system.chainId;
    if (chainId == 'unknown') {
        store.dispatch(updateAccountStatus({wrongChain: true, _chainId:chainId}));
        goErrorNetWork();
        return false;
    } else if (chainId !== _chainId && _chainId !== 'unknown' && chainId !== 'unknown') {
        store.dispatch(updateAccountStatus({_chainId:chainId}));
        store.dispatch(updateSystem({chainId}));
        window.location.reload();
        return true;
    }else{
        store.dispatch(updateAccountStatus({wrongChain: false, _chainId:chainId}));
        return true;
    }
}
