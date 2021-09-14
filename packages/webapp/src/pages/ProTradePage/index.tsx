import { withTranslation } from 'react-i18next';

import React, { useMemo } from 'react';
import GridLayout from 'react-grid-layout';

import { usePro } from './hookPro';
import { useTheme } from '@emotion/react';
import { Box, Container, styled } from '@mui/material';
import { layoutConfigs } from '@loopring-web/common-resources';
import { ChartView, MarketView, OrderTableView, SpotView, Toolbar, WalletInfo } from './panel'
import { AlertImpact, ConfirmImpact, Toast } from '@loopring-web/component-lib';
import { LAYOUT, TOAST_TIME } from '../../defs/common_defs';

const BoxStyle = styled(Box)`
    background:var(--color-box);
`



export const OrderbookPage = withTranslation('common')( ()=>{
    const { market,
        toastOpen,
        closeToast,
        swapFunc,
        alertOpen,
        confirmOpen,
        tradeCalcData,
        pageTradeLite, } = usePro();
    const { unit } = useTheme();
    const ViewList = {
        toolbar:React.useMemo(()=><Toolbar market={market as any}/>,[market]),
        walletInfo: React.useMemo(()=><WalletInfo tradeCalcData={tradeCalcData} market={market as any}/>,[tradeCalcData,market]),
        spot: React.useMemo(()=><SpotView/>,[]),
        market: React.useMemo(()=><MarketView/>,[]),
        chart:  React.useMemo(()=><ChartView/>,[]),
        orderTable:   React.useMemo(()=><OrderTableView/>,[])
    }

    return <>
        <Toast alertText={toastOpen?.content ?? ''} severity={toastOpen?.type ?? 'success'}
               open={toastOpen?.open ?? false}
               autoHideDuration={TOAST_TIME} onClose={closeToast}/>
        <AlertImpact handleClose={swapFunc} open={alertOpen} value={pageTradeLite?.priceImpactObj?.value as any}/>
        <ConfirmImpact handleClose={swapFunc} open={confirmOpen} value={pageTradeLite?.priceImpactObj?.value as any}/>
        {market?
        <Box display={'block'} margin={'0 auto'} width={1280} >
            <GridLayout layout={layoutConfigs[0].layout}
            className="layout" cols={24} rowHeight={unit/2} width={1280} margin={[unit/2,unit/2]}>
            {layoutConfigs[0].layout.map((value,index)=>{
                return <BoxStyle key={value.i}
                            data-grid={{...value}}
                            component={'section'}>
                    {ViewList[value.i]}
                </BoxStyle>
            })}
        </GridLayout>
        </Box>
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