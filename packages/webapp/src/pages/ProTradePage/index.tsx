import { withTranslation } from 'react-i18next';

import React from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';

import { usePro } from './hookPro';
import { useTheme } from '@emotion/react';
import { Box } from '@mui/material';
import { layoutConfigs } from '@loopring-web/common-resources';
import { ChartView, MarketView, OrderTableView, SpotView, Toolbar, WalletInfo } from './panel'
import {  boxLiner } from '@loopring-web/component-lib';
import styled from '@emotion/styled/';


const BoxStyle = styled(Box)`
  --tab-header: 44px;
  background: var(--color-box);
  &.spot{
    ${({theme}:any) => boxLiner({theme})}
  }
  .MuiTabs-root{
    min-height: var(--tab-header);
    .MuiTab-root{
       min-height: var(--tab-header);
       padding: ${({theme}) => theme.unit }px;
     }
  }
`
const ResponsiveGridLayout = WidthProvider(Responsive);


export const OrderbookPage = withTranslation('common')(() => {
    // const { pageTradePro } = usePageTradePro();
    const { market } = usePro();
    const {unit} = useTheme();
    const ViewList = {
        toolbar: React.useMemo(() => <Toolbar market={market as any}/>, [market]),
        walletInfo: React.useMemo(() => <WalletInfo market={market as any}/>, [ market]),
        spot: React.useMemo(() => <SpotView market={market as any}/>, [market]),
        market: React.useMemo(() => <MarketView market={market as any}/>, [market]),
        market2: React.useMemo(() => <></>,[]),    //<MarketView market={market as any}/>, [market])
        chart: React.useMemo(() => <ChartView/>, []),
        orderTable: React.useMemo(() => <OrderTableView/>, [])
    }

    return <>
        {market ?
            <Box display={'block'} margin={'0 auto'} width={'100%'}>
                <ResponsiveGridLayout
                    draggableHandle={'drag-holder'}
                    layouts={layoutConfigs[ 0 ].layouts}
                    className="layout"
                    breakpoints={layoutConfigs[ 0 ].breakpoints}
                    cols={layoutConfigs[ 0 ].cols}
                    rowHeight={unit / 2} margin={[unit / 2, unit / 2]}>
                    {layoutConfigs[ 0 ].layouts[ 'xlg' ].map((value, index) => {
                        return <BoxStyle key={value.i} className={value.i}
                                         data-grid={{...value}}
                                         component={'section'}>
                            {ViewList[ value.i ]}
                        </BoxStyle>
                    })}
                </ResponsiveGridLayout>
            </Box>
            : <>'loading'</>}</>
})


// function O(props) {
//     const children = React.useMemo(() => {
//         return new Array(props.count).fill(undefined).map((val, idx) => {
//             return <div key={idx} data-grid={{x: idx, y: 1, w: 1, h: 1}} />;
//         });
//     }, [props.count]);
//     return <ReactGridLayout cols={12}>{children}</ReactGridLayout>;
// }