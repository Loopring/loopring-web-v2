import React from 'react';
import { useAmmActivityMap } from '../../stores/Amm/AmmActivityMap';

import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk';
import { useAccount } from '../../stores/account/hook';
import { useUserRewards } from '../../stores/userRewards';
import { useAmmMap } from '../../stores/Amm/AmmMap';

export const useAmmPool = <R extends {[key:string]:any},I extends {[key:string]:any}>()=>{
    const AmmActivityMapState  = useAmmActivityMap()
    const {getUserRewards}  = useUserRewards()
    const {account} = useAccount();
    const {ammMap,getAmmMap} = useAmmMap();
    const [ammActivityMap,setAmmActivityMap] = React.useState<LoopringMap<LoopringMap<AmmPoolActivityRule[]>>|undefined>(AmmActivityMapState.ammActivityMap)
    // init AmmMap at begin
    React.useEffect(() => {
        if (!ammMap || Object.keys(ammMap).length === 0) {
            getAmmMap();
        }
    }, []);
    React.useEffect(() => {
        switch (AmmActivityMapState.status) {
            case "ERROR":
                AmmActivityMapState.statusUnset();
                // setState('ERROR')
                //TODO: show error at button page show error  some retry dispath again
                break;
            case "DONE":
                AmmActivityMapState.statusUnset();
                setAmmActivityMap(AmmActivityMapState.ammActivityMap)
                break;
            default:
                break;

        }
    }, [AmmActivityMapState.status])
    React.useEffect(() => {
        if(account.accountId){
            getUserRewards()
        }
    }, [account.accountId])

    return {
        ammActivityMap
    }

}

