import { AmmProps } from '@loopring-web/component-lib';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { AmmCardProps, AmmData, AmmInData, IBData } from '@loopring-web/component-lib/static-resource';
import { AmmCard } from '@loopring-web/component-lib/components/block/AmmCard';
import { Grid } from '@material-ui/core';
import { useAmmMiningUI } from './hook';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { withTranslation } from 'react-i18next';
import { AmmPoolActivityRule, LoopringMap } from 'loopring-sdk/dist/defs/loopring_defs';

type ClickHandler = {
    handleClick: (pair: string) => void
}

const AmmCardWrap = React.memo(React.forwardRef((props:AmmCardProps<{[key:string]:any}> & ClickHandler ,ref) => {
    const pair = `${props.coinAInfo.name}-${props.coinBInfo.name}`
    return props? <AmmCard ref={ref} {...props} handleClick={() => props.handleClick(pair)} /> :<></>
}));

const AmmList = <I extends {[key:string]:any}>({ammActivityViewMap}: {ammActivityViewMap: Array<AmmCardProps<I>> })=>{
    let history = useHistory();
    const jumpTo = React.useCallback((pair: string) => {
        if (history) {
            history.push(`/liquidity/pools/coinPair/${pair}`)
        }
    }, [history])
    
    return  <>{ammActivityViewMap.map((item:AmmCardProps<I>,index)=>
        <Grid item xs={12} sm={6} lg={4} key={index}>
            <AmmCardWrap handleClick={jumpTo} {...item as any} />
        </Grid>
    ) }</>
}

export const AmmMiningView =  withTranslation('common')(<T extends AmmData<C extends IBData<I> ? C : IBData<I>>, I,
    ACD extends AmmInData<I>,
    C = IBData<I>>({ammProps,t,ammActivityMap,...rest}: { ammProps:AmmProps<T ,I,ACD>,
    ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>>|undefined,   
} & any) => {
    const { ammActivityViewMap,
        ammActivityPastViewMap} = useAmmMiningUI({ammActivityMap});
    const [tabIndex,setTabIndex] = React.useState<0|1>(0);
    const handleChange = (event: any, newValue: 0|1) => {
        setTabIndex(newValue);
    }

    return <Grid container spacing={2}>
        <Grid item xs={12}>
            <Tabs value={tabIndex}
                  onChange={handleChange}
                  aria-label="tabs switch">
                <Tab label={t('labelCurrentActivities')}  />
                <Tab label={t('labelPastActivities')}  />
            </Tabs>
        </Grid>
        <AmmList ammActivityViewMap={tabIndex === 0 ? ammActivityViewMap : ammActivityPastViewMap}/>
    </Grid>
})
