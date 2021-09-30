import { withTranslation } from 'react-i18next';

import React from 'react';
import { Layout, Layouts, Responsive, WidthProvider } from 'react-grid-layout';

import { usePro } from './hookPro';
import { useTheme } from '@emotion/react';
import { Box, IconButton } from '@mui/material';
import { BreakPoint, DragIcon, layoutConfigs, LoadingIcon, myLog, ResizeIcon } from '@loopring-web/common-resources';
import { ChartView, MarketView, OrderTableView, SpotView, TabMarketIndex, Toolbar, WalletInfo } from './panel'
import { boxLiner, useSettings } from '@loopring-web/component-lib';
import styled from '@emotion/styled/';
import { usePageTradePro } from '../../stores/router';
import store from '../../stores';

const MARKET_ROW_LENGTH: number = 8;
const MARKET_ROW_LENGTH_LG: number = 11;

const MARKET_TRADES_LENGTH: number = 19;
const MARKET_TRADES_LENGTH_LG: number = 24;
export const HeaderHeight = 44;


const BoxStyle = styled(Box)`
  --tab-header: ${HeaderHeight}px;
  background: var(--color-box);

  &.spot {
    ${({theme}: any) => boxLiner({theme})}
  }

  .MuiTabs-root {
    min-height: var(--tab-header);

    .MuiTab-root.MuiTab-fullWidth, .MuiTab-root {
      font-size: ${({theme}) => theme.fontDefault.body1};
      min-height: var(--tab-header);
      padding: ${({theme}) => theme.unit}px;

      &:after {
        margin: 0;
      }
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
const initBreakPoint = (): BreakPoint => {
    if (window.innerWidth >= layoutConfigs[ 0 ].breakpoints[ BreakPoint.xlg ]) {
        return BreakPoint.xlg
    } else if (window.innerWidth >= layoutConfigs[ 0 ].breakpoints[ BreakPoint.lg ]) {
        return BreakPoint.lg
    } else if (window.innerWidth >= layoutConfigs[ 0 ].breakpoints[ BreakPoint.md ]) {
        return BreakPoint.md
    } else if (window.innerWidth >= layoutConfigs[ 0 ].breakpoints[ BreakPoint.sm ]) {
        return BreakPoint.sm
    } else if (window.innerWidth >= layoutConfigs[ 0 ].breakpoints[ BreakPoint.xs ]) {
        return BreakPoint.xs
    } else if (window.innerWidth >= layoutConfigs[ 0 ].breakpoints[ BreakPoint.xxs ]) {
        return BreakPoint.xxs
    } else {
        return BreakPoint.md
    }
};
export const OrderbookPage = withTranslation('common')(() => {
    const {pageTradePro: {depthLevel, depth, depthForCalc},} = usePageTradePro();
    const {market, handleOnMarketChange, resetTradeCalcData} = usePro();
    const {unit} = useTheme();
    const {proLayout, setLayouts} = useSettings();

    const [rowLength, setRowLength] = React.useState<number>(MARKET_ROW_LENGTH);
    const [tradeTableLengths, setTradeTableLengths] = React.useState<{ market: number, market2: number }>({
        market: MARKET_TRADES_LENGTH,
        market2: MARKET_TRADES_LENGTH
    });

    const [configLayout, setConfigLayout] = React.useState<Config>({
            compactType: "vertical",
            currentBreakpoint: initBreakPoint(),
            mounted: false,
            layouts: proLayout ?? layoutConfigs[ 0 ].layouts,
        }
    )
    const sportMemo =  React.useMemo(() => {
        return <>{
            depthForCalc ? <SpotView
                market={market as any}
                resetTradeCalcData={resetTradeCalcData}
            /> :<Box flex={1} height={'100%'} display={'flex'} alignItems={'center'}
                                                             justifyContent={'center'}><LoadingIcon/></Box>
        }</>
    }, [market, depthForCalc])



    const onRestDepthTableLength = React.useCallback((h: number) => {
        if (h) {
            // myLog('market',h )
            const i = Math.floor(((h - 58) * unit) / 40)
            if (i <= 40) {
                setRowLength(MARKET_ROW_LENGTH + i)
            } else {
                setRowLength(48)
            }
        }


    }, [])
    const onRestMarketTableLength = React.useCallback((layout: Layout | undefined) => {
        if (layout && layout.h) {
            const h = layout.h
            const i = Math.floor(((h - 58) * unit) / 20)
            // myLog('onRestMarketTableLength',layout.i)
            setTradeTableLengths((state) => {
                if (i <= 30) {  //32
                    return {
                        ...state,
                        [ layout.i ]: MARKET_TRADES_LENGTH + i
                    }
                } else {
                    return {
                        ...state,
                        [ layout.i ]: MARKET_TRADES_LENGTH + 30
                    }
                }
            })
            // } else{
            //     setRowLength(40)
            // }
        }


    }, []);
    const doItemReset = React.useCallback((layout:Layout[])=>{

        onRestDepthTableLength(layout.find(i => i.i === 'market')?.h as number)
        const lys = layout.filter(i => /market/.test(i.i));
        lys.forEach((layout) => {
            onRestMarketTableLength(layout)
        })

    },[onRestMarketTableLength,onRestDepthTableLength])
    const onBreakpointChange = React.useCallback((breakpoint: BreakPoint) => {
        setConfigLayout((state: Config) => {
            return {
                ...state,
                currentBreakpoint: breakpoint
            }
        })
        const layout = configLayout.layouts[ breakpoint ]
        if (layout) {
            doItemReset(layout)
        }

        // this.setState({
        //     currentBreakpoint: breakpoint
        // });
        // setConfigLayout
    }, [configLayout,doItemReset]);


    const onResize = React.useCallback((layout, oldLayoutItem, layoutItem) => {
        if (layoutItem.i === 'market') {
            onRestDepthTableLength(layoutItem.h)
            onRestMarketTableLength(layoutItem)
        }
        if (layoutItem.i === 'market2') {
            onRestMarketTableLength(layoutItem)
        }
        setConfigLayout((state: Config) => {
            return {
                ...state,
                layouts: {
                    ...state.layouts,
                    [ configLayout.currentBreakpoint ]: layout
                },
            }
        })
        setLayouts({
            ...proLayout,
            [ configLayout.currentBreakpoint ]: layout
        })

    }, [setRowLength,doItemReset])
    const handleLayoutChange = React.useCallback((currentLayout: Layout[], allLayouts?: Layouts, layouts?: Layouts) => {
        if (layouts) {
            setLayouts(layouts)
        } else {
            setLayouts({
                ...proLayout,
                [ configLayout.currentBreakpoint ]: currentLayout
            })
        }
        // myLog(currentLayout)
        //
        // setConfigLayout((state: Config) => {
        //     return {
        //         ...state,
        //         layouts: proLayout ?? state.layouts
        //     }
        // })
        // if (layouts && layouts[configLayout.currentBreakpoint]) {
        //     doItemReset(layouts[configLayout.currentBreakpoint])
        // }
    }, [proLayout,setConfigLayout,setLayouts])
    const ViewList = {
        toolbar: React.useMemo(() => <Toolbar market={market as any}
                                              handleLayoutChange={handleLayoutChange}
                                              handleOnMarketChange={handleOnMarketChange}/>, [market, handleLayoutChange,handleOnMarketChange]),
        walletInfo: React.useMemo(() => <WalletInfo market={market as any}/>, [market]),
        spot: sportMemo,
        market: React.useMemo(() => <>{depthLevel
            && <MarketView market={market as any}
                           rowLength={rowLength}
                           tableLength={tradeTableLengths.market}
                           main={TabMarketIndex.Orderbook}
                           breakpoint={configLayout.currentBreakpoint}/>}</>
            , [market, rowLength, configLayout.currentBreakpoint, depthLevel, tradeTableLengths.market]),
        market2: React.useMemo(() => <>{[BreakPoint.lg, BreakPoint.xlg].includes(configLayout.currentBreakpoint)
            && <MarketView market={market as any}
                           main={TabMarketIndex.Trades}
                           tableLength={tradeTableLengths.market2}
                           rowLength={0}
                           breakpoint={configLayout.currentBreakpoint}/>}</>
            , [market, rowLength, configLayout.currentBreakpoint, depthLevel, tradeTableLengths.market2]),    //<MarketView market={market as any}/>, [market])
        chart: React.useMemo(() => <ChartView market={market} rowLength={rowLength}/>, [market, rowLength]),
        orderTable: React.useMemo(() => <OrderTableView market={market}/>, [market])
    }
    return <Box display={'block'} margin={'0 auto'} width={'100%'} position={'relative'}>
        {market ? <ResponsiveGridLayout
            className="layout"
            {...{...configLayout}}
            onBreakpointChange={onBreakpointChange}
            onLayoutChange={handleLayoutChange}
            onResizeStop={onResize}
            // onLayoutChange={()=>{}}
            resizeHandle={<IconButton size={'medium'} style={{position: 'absolute', zIndex: 78, right: 0, bottom: 0}}
                                      className={'resize-holder'}>
                <ResizeIcon style={{marginRight: `-${unit}px`, marginBottom: `-${unit}px`}}/></IconButton>}
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
                                className={'drag-holder'}><DragIcon style={{marginRight: `-${unit}px`, marginTop: ''}}/></IconButton>
                </BoxStyle>
            })}

        </ResponsiveGridLayout> :<Box flex={1} height={'100%'} display={'flex'} alignItems={'center'}
                                      justifyContent={'center'}><LoadingIcon/></Box>}
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