import React from 'react';
import { useAmmActivityMap } from '../../stores/Amm/AmmActivityMap';

import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk';
import { useAccount } from '../../stores/account/hook';
import { useUserRewards } from '../../stores/userRewards';
import { useAmmMap } from '../../stores/Amm/AmmMap';
import { SagaStatus } from '@loopring-web/common-resources';

export const useAmmPool = <R extends {[key:string]:any},I extends {[key:string]:any}>()=>{
    const {ammActivityMap,status:ammActivityMapStatus}  = useAmmActivityMap()
    const {account,status:accountStatus} = useAccount();
    const {ammMap,getAmmMap} = useAmmMap();
    const [_ammActivityMap,setAmmActivityMap] = React.useState<LoopringMap<LoopringMap<AmmPoolActivityRule[]>>|undefined>(ammActivityMap)
    // init AmmMap at begin
    React.useEffect(() => {
        if (!ammMap || Object.keys(ammMap).length === 0) {
            getAmmMap();
        }
    }, []);

    React.useEffect(() => {
        if(ammActivityMapStatus === SagaStatus.UNSET){
            setAmmActivityMap(ammActivityMap)
        }
    }, [ammActivityMapStatus])

    return {
        ammActivityMap:_ammActivityMap
    }

}

