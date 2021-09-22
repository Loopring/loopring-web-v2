import { withTranslation } from 'react-i18next';

import React from 'react';
import { Layouts, Responsive, WidthProvider } from 'react-grid-layout';

import { usePro } from './hookPro';
import { useTheme } from '@emotion/react';
import { Box, IconButton } from '@mui/material';
import { BreakPoint, DragIcon, layoutConfigs, myLog, ResizeIcon } from '@loopring-web/common-resources';
import { ChartView, MarketView, OrderTableView, SpotView, Toolbar, WalletInfo } from './panel'
import { boxLiner } from '@loopring-web/component-lib';
import styled from '@emotion/styled/';
import { usePageTradePro } from '../../stores/router';

const MARKET_ROW_LENGTH: number = 8;
const MARKET_ROW_LENGTH_LG: number = 11;


const BoxStyle = styled(Box)`
  --tab-header: 44px;
  background: var(--color-box);

  &.spot {
    ${({theme}: any) => boxLiner({theme})}
  }

  .MuiTabs-root {
    min-height: var(--tab-header);

    .MuiTab-root {
      min-height: var(--tab-header);
      padding: ${({theme}) => theme.unit}px;
    }
  }
`
const ResponsiveGridLayout = WidthProvider(Responsive);

type Config = {
    currentBreakpoint: BreakPoint,
    mounted: boolean,
    layouts: Layouts,
    compactType: 'vertical' | 'horizontal' | null | undefined
}
export const OrderbookPage = withTranslation('common')(() => {
    const { pageTradePro:depthLevel } = usePageTradePro();
    const {market,handleOnMarketChange} = usePro();
    const {unit} = useTheme();
    const [rowLength, setRowLength] = React.useState<number>(MARKET_ROW_LENGTH);

    const [configLayout, setConfigLayout] = React.useState<Config>({
            compactType: "vertical",
            currentBreakpoint: BreakPoint.xlg,
            mounted: false,
            layouts: layoutConfigs[ 0 ].layouts
        }
    )

    const ViewList = {
        toolbar: React.useMemo(() => <Toolbar market={market as any} handleOnMarketChange={handleOnMarketChange}/>, [market,handleOnMarketChange]),
        walletInfo: React.useMemo(() => <WalletInfo market={market as any}/>, [market]),
        spot: React.useMemo(() => <SpotView market={market as any} />, [market]),
        market: React.useMemo(() =><>{depthLevel && <MarketView market={market as any} rowLength={rowLength} breakpoint={configLayout.currentBreakpoint}/>}</>
            , [market,rowLength,configLayout.currentBreakpoint,depthLevel]),
        market2: React.useMemo(() => <>{[BreakPoint.lg,BreakPoint.xlg].includes(configLayout.currentBreakpoint) && <MarketView market={market as any} rowLength={rowLength} breakpoint={configLayout.currentBreakpoint}/>}</>
            , [market,rowLength,configLayout.currentBreakpoint,depthLevel]),    //<MarketView market={market as any}/>, [market])
        chart: React.useMemo(() => <ChartView/>, []),
        orderTable: React.useMemo(() => <OrderTableView/>, [])
    }
    const onRestDepthTableLength = React.useCallback((h:number) => {
        myLog('market',h )
        const i = Math.floor(((h - 58) * unit) / 40)
        if(i <= 40){
            setRowLength(MARKET_ROW_LENGTH + i)
        } else{
            setRowLength(48)
        }

    }, [])
    const onBreakpointChange = React.useCallback((breakpoint: BreakPoint) => {
        setConfigLayout((state:Config) => {
            return {
                ...state,
                currentBreakpoint: breakpoint
            }
        })
        const layout = configLayout.layouts[breakpoint]
        if(layout){
            onRestDepthTableLength(layout.find(i => i.i === 'market')?.h as number)
        }

        // this.setState({
        //     currentBreakpoint: breakpoint
        // });
        // setConfigLayout
    }, [configLayout]);

    const  onResize  = React.useCallback((layout, oldLayoutItem, layoutItem) => {
        if(layoutItem.i === 'market'){
            onRestDepthTableLength(layoutItem.h)
        }

        // this.setState({ layouts });
    }, [setRowLength])


    return <Box display={'block'} margin={'0 auto'} width={'100%'} position={'relative'} >
                {market  ?  <ResponsiveGridLayout
                    className="layout"
                    {...{...configLayout}}
                    onBreakpointChange={onBreakpointChange}
                    onResizeStop={onResize}
                    resizeHandle={<IconButton size={'medium'} style={{position: 'absolute', zIndex: 78, right: 0, bottom: 0}} className={'resize-holder'}>
                        <ResizeIcon style={{marginRight:`-${unit}px`,marginBottom:`-${unit}px`}}/></IconButton>}
                    draggableHandle={'.drag-holder'}
                    breakpoints={layoutConfigs[ 0 ].breakpoints}
                    cols={layoutConfigs[ 0 ].cols}
                    rowHeight={unit / 2}
                    margin={[unit / 2, unit / 2]}>
                    {configLayout.layouts[ configLayout.currentBreakpoint ].map((layout) => {
                        return <BoxStyle key={layout.i} overflow={'hidden'} className={layout.i}
                                         data-grid={{...layout}}
                                         component={'section'} position={'relative'}>
                            {ViewList[ layout.i ]}
                            <IconButton size={'medium'} style={{position: 'absolute', zIndex: 78, right: 0, top: 0}}
                                        className={'drag-holder'}><DragIcon style={{marginRight:`-${unit}px`,marginTop:''}}/></IconButton>
                        </BoxStyle>
                    })}

                </ResponsiveGridLayout> : <>'loading'</>}
            </Box>

})


// function O(props) {
//     const children = React.useMemo(() => {
//         return new Array(props.count).fill(undefined).map((val, idx) => {
//             return <div key={idx} data-grid={{x: idx, y: 1, w: 1, h: 1}} />;
//         });
//     }, [props.count]);
//     return <ReactGridLayout cols={12}>{children}</ReactGridLayout>;
// }