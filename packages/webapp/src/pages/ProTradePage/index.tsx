import { withTranslation } from 'react-i18next';

import React, { useMemo } from 'react';
import GridLayout from 'react-grid-layout';

import { usePro } from './hookPro';
import { useTheme } from '@emotion/react';
import { Box } from '@mui/material';
import { layoutConfigs } from '@loopring-web/common-resources';
import { ChartView, MarketView, OrderTableView, SpotView, Toolbar, WalletInfo } from './panel'





const OrderbookPage = withTranslation('common')( ()=>{
    const { market,marketTicker} = usePro()
    const { unit} = useTheme()
    const ViewList = {
        toolbar:React.useMemo(()=><Toolbar market={market as any} marketTicker={marketTicker as any}/>,[market,marketTicker]),
        walletInfo: React.useMemo(()=><WalletInfo/>,[]),
        spot: React.useMemo(()=><SpotView/>,[]),
        market: React.useMemo(()=><MarketView/>,[]),
        chart:  React.useMemo(()=><ChartView/>,[]),
        orderTable:   React.useMemo(()=><OrderTableView/>,[])
    }


    return <>{market?
        <GridLayout layout={layoutConfigs[0].layout}
            className="layout" cols={24} rowHeight={unit/2} width={1280} margin={[unit/2,unit/2]}>
            {layoutConfigs[0].layout.map((value,index)=>{
                return <Box key={value.i}
                            data-grid={{...value}}
                            component={'section'}>
                    {ViewList[value.i]}
                </Box>
            })}
        </GridLayout>
    :<>'loading'</>}</>
})



// function O(props) {
//     const children = React.useMemo(() => {
//         return new Array(props.count).fill(undefined).map((val, idx) => {
//             return <div key={idx} data-grid={{x: idx, y: 1, w: 1, h: 1}} />;
//         });
//     }, [props.count]);
//     return <ReactGridLayout cols={12}>{children}</ReactGridLayout>;
// }