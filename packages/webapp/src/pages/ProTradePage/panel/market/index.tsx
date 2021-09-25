import { WithTranslation, withTranslation } from 'react-i18next';
import {
    DepthBlock,
    DepthTitle,
    DepthType,
    ToggleButtonGroup,
    TradePro,
    useSettings
} from '@loopring-web/component-lib';
import {
    BreakPoint,
    Currency,
    depth2ViewData,
    DepthFIcon,
    DepthHIcon,
    DepthViewData,
    DropDownIcon,
    EmptyValueTag,
    getValuePrecisionThousand,
    LoadingIcon,
    MarketType,
    PriceTag,
    UpColor,
    UpIcon
} from '@loopring-web/common-resources';
import { Box, Divider, MenuItem, Tab, Tabs, TextField, Typography } from '@mui/material';
import React from 'react';
import { usePageTradePro } from 'stores/router';
import { useTokenMap } from 'stores/token';
import { useTokenPrices } from 'stores/tokenPrices';
import { useSystem } from 'stores/system';
import styled from '@emotion/styled/';


export enum TabMarketIndex {
    Orderbook = 'Orderbook',
    Trades = 'Trades'
}


enum DepthShowType {
    asks = 'asks',
    half = 'half',
    bids = 'bids'
}

const MarketToolbar = styled(Box)`
  &.pro .MuiToggleButtonGroup-root {

    .MuiToggleButton-root.MuiToggleButton-sizeSmall,
    .MuiToggleButton-root.MuiToggleButton-sizeSmall.Mui-selected {
      //&:not(:first-of-type), &:not(:last-child) {
      //  border:0;
      //}
      height: 24px;
      width: 24px;
      padding: 0;
      border: 0;
      background: var(--opacity) !important;

      :hover {
        border: 0;

        svg {
          path {
            fill: var(--color-text-button-Select)
          }
        }
      }
    }

    .MuiToggleButton-root.MuiToggleButton-sizeSmall.Mui-selected {
      svg {
        path {
          fill: var(--color-text-button-Select)
        }
      }

    }
  }

  //.MuiToggleButton-root.MuiToggleButton-sizeSmall.Mui-selected{
  //  depthType === DepthShowType.bids ?  :
  //}  


` as typeof Box


export const MarketView = withTranslation('common')(({
                                                         rowLength,
                                                         tableLength,
                                                         breakpoint,
                                                         main,
                                                         t, market, ...rest
                                                     }: {
    market: MarketType;
    main: keyof typeof TabMarketIndex;
    breakpoint: BreakPoint;
    rowLength: number;
    tableLength: number;
} & WithTranslation) => {
    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
    const [tabIndex, setTabIndex] = React.useState<TabMarketIndex>(main as TabMarketIndex);
    const {pageTradePro, updatePageTradePro} = usePageTradePro();
    // myLog('tableLength',tableLength)
    // const {tickerMap, depth, precisionLevels, market: _market, depthLevel} = pageTradePro;
    const {marketMap, tokenMap} = useTokenMap();
    const {upColor, currency} = useSettings();
    const {tokenPrices} = useTokenPrices();
    // @ts-ignore
    const quotePrice = tokenPrices[ quoteSymbol ];
    const {forex} = useSystem();

    const [depthViewData, setDepthViewData] = React.useState<{ asks: DepthViewData[], bids: DepthViewData[] }>({
        asks: [],
        bids: []
    });
    const [level, setLevel] = React.useState<number>(pageTradePro.depthLevel ?? marketMap[ market ].precisionForPrice);
    const [depthType, setDepthType] = React.useState<DepthShowType>(DepthShowType.half);
    const handleOnDepthTypeChange = React.useCallback((event: React.MouseEvent<HTMLElement> | any, newValue) => {
        setDepthType(newValue);
        //TODO: change table
        rebuildList()
    }, [level])

    const handleOnLevelChange = React.useCallback((event: React.ChangeEvent<{ value: string }>) => {
        setLevel(Number(event.target?.value));
        updatePageTradePro({market, depthLevel: Number(event.target?.value)})
        //TODO: change table
        // rebuildList()
    }, [market])
    React.useEffect(() => {
        if ([BreakPoint.lg, BreakPoint.xlg].includes(breakpoint)) {
            setTabIndex(main as TabMarketIndex)
        }
    }, [breakpoint])
    const rebuildList = React.useCallback(() => {
        const depth = pageTradePro.depth;
        if (depth && (depth.bids.length || depth.asks.length)) {
            const baseDecimal = tokenMap[ baseSymbol ]?.decimals;
            const quoteDecimal = tokenMap[ baseSymbol ]?.decimals;
            const precisionForPrice = marketMap[ market ].precisionForPrice;
            let [countAsk, countBid] = [rowLength, rowLength]
            if (depthType === DepthShowType.bids) {
                [countAsk, countBid] = [0, rowLength * 2]
            } else if (depthType === DepthShowType.asks) {
                [countAsk, countBid] = [rowLength * 2, 0]
            } else {
            }
            const viewData = depth2ViewData({depth, countAsk, countBid, baseDecimal, quoteDecimal, precisionForPrice})
            setDepthViewData(viewData);
        }
    }, [pageTradePro, depthType, rowLength])
    const middlePrice = React.useMemo(() => {
        const {ticker, depth} = pageTradePro;
        let close: number| string | undefined = undefined;
        let up: 'up' | 'down' | '' = '';
        let priceColor = '';
        let value = '';
        if (ticker && depth && depth.mid_price && depth.symbol === market) {
            close = ticker.close? ticker.close:depth?.mid_price
            if (depth.mid_price === close) {
                priceColor = '';
                up = '';
            } else if (depth.mid_price < close) {
                priceColor = (upColor == UpColor.green ? 'var(--color-success)' : 'var(--color-error)');
                up = 'up'
            } else {
                up = 'down'
                priceColor = (upColor == UpColor.green ? 'var(--color-error)' : 'var(--color-success)');
            }
            value = currency === Currency.dollar ? '\u2248 ' + PriceTag.Dollar
                + getValuePrecisionThousand(close * quotePrice, undefined, undefined, undefined, true, {isFait: true})
                : '\u2248 ' + PriceTag.Yuan
                + getValuePrecisionThousand(close * quotePrice / forex, undefined, undefined, undefined, true, {isFait: true})

        }
        close = (close ? close.toFixed(marketMap[ market ].precisionForPrice) : undefined)
        return <Typography color={'var(--color-text-third)'} variant={'body2'} component={'p'} display={'inline-flex'}
                           textAlign={'center'} alignItems={'center'} onClick={(event:any) => {
            priceClick(event,close  as any)
        }}>
            {close ? <>
                    <Typography lineHeight={1} color={priceColor} component={'span'} paddingRight={1} alignItems={'center'}
                                display={'inline-flex'}> {close}
                        {up && < UpIcon fontSize={'small'} htmlColor={priceColor} style={{
                            transform: (priceColor === 'up' ? '' : 'rotate(-180deg)')
                        }}/>}
                    </Typography> {value}
                </>
                : EmptyValueTag
            }

        </Typography>
    }, [pageTradePro, market])
    const toggleData = React.useMemo(() => {
        return [
            {
                value: DepthShowType.half,
                JSX: <DepthHIcon fontSize={'large'}
                                 bo={'var(--color-border)'}
                                 l={'var(--color-border)'} a={'var(--color-error)'} b={'var(--color-success)'}/>,
                key: DepthShowType.half,
            },
            {
                value: DepthShowType.bids,
                JSX: <DepthFIcon fontSize={'large'}
                                 bo={'var(--color-border)'}
                                 l={'var(--color-border)'} a={'var(--color-success)'} b={''}/>,
                key: DepthShowType.bids,
            },
            {
                value: DepthShowType.asks,
                JSX: <DepthFIcon fontSize={'large'}
                                 bo={'var(--color-border)'}
                                 l={'var(--color-border)'} a={'var(--color-error)'} b={''}/>,
                key: DepthShowType.asks,
            }]
    }, [depthType])
    const tradeProTable = React.useMemo(() => {
        // myLog('tableLength',tableLength)

        return <>{pageTradePro.tradeArray ?
            <TradePro
                // rowHeight={MarketRowHeight}
                // headerRowHeight={20}
                marketInfo={marketMap[ market ]}
                rawData={pageTradePro.tradeArray ? pageTradePro.tradeArray.slice(0, tableLength) : []}
                // tokenMap={tokenMap}
                precision={marketMap[ market ].precisionForPrice}
                currentheight={tableLength * 20 + 20}/>
            : <Box flex={1} height={'100%'} display={'flex'} alignItems={'center'}
                   justifyContent={'center'}><LoadingIcon/></Box>}
        </>
    }, [tableLength, market, pageTradePro.tradeArray])

    const priceClick = React.useCallback((event, price) => {
        updatePageTradePro({market, defaultPrice: price})
    }, [updatePageTradePro, market])
    React.useEffect(() => {
        if (pageTradePro.depth?.symbol === market && rowLength) {
            rebuildList()
        }
    }, [pageTradePro.depth, depthType, rowLength])
    return <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'} height={'100%'}>
        <Box component={'header'} width={'100%'} paddingX={2}>


            {[BreakPoint.lg, BreakPoint.xlg].includes(breakpoint) ?
                // <Tabs value={tabIndex}>
                //     <Tab value={tabIndex} labelProl={t(`labelPro${tabIndex}`)}/>
                <Typography variant={'body1'} lineHeight={'44px'}>{t(`labelPro${tabIndex}`)}</Typography>
                // </Tabs>
                : <Tabs value={tabIndex} onChange={(_e, value) => {
                    setTabIndex(value)
                }}>
                    <Tab key={TabMarketIndex.Orderbook} value={TabMarketIndex.Orderbook}
                         label={t(`labelPro${TabMarketIndex.Orderbook}`)}/>
                    <Tab key={TabMarketIndex.Trades} value={TabMarketIndex.Trades}
                         label={t(`labelPro${TabMarketIndex.Trades}`)}/>
                </Tabs>
            }
            {/*<Tab key={TabMarketIndex.Orderbook} value={TabMarketIndex.Orderbook} label={t(`labelPro${TabMarketIndex.Orderbook}`)}/>*/}
            {/*<Tab key={TabMarketIndex.Trades} value={TabMarketIndex.Trades} label={t(`labelPro${TabMarketIndex.Trades}`)}/>*/}

        </Box>
        <Divider style={{marginTop: '-1px'}}/>
        {tabIndex === TabMarketIndex.Orderbook ? <Box className={'depthPanel'} flex={1} paddingY={1}>
                <MarketToolbar component={'header'} className={'pro'} width={'100%'} display={'flex'} paddingX={2}
                               alignItems={'stretch'} justifyContent={'space-between'} height={24}>
                    <ToggleButtonGroup exclusive {...{
                        ...rest,
                        t,
                        tgItemJSXs: toggleData,
                        value: depthType,
                        size: 'small'
                    }} onChange={handleOnDepthTypeChange}/>
                    <TextField
                        id="outlined-select-level"
                        select
                        size={'small'}
                        value={level}
                        onChange={handleOnLevelChange}
                        inputProps={{IconComponent: DropDownIcon}}
                    >
                        {pageTradePro.precisionLevels && pageTradePro.precisionLevels.map(({value, label}) => <MenuItem
                            key={value}
                            value={value}>{label}</MenuItem>)}

                    </TextField>
                </MarketToolbar>

                {pageTradePro.ticker && pageTradePro.depth?.symbol === pageTradePro.market ?
                    <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'} paddingX={2}>
                        <Box paddingTop={1 / 2}><DepthTitle marketInfo={marketMap[ market ]}/></Box>
                        <DepthBlock onClick={priceClick}
                                    marketInfo={marketMap[ market ]}
                                    type={DepthType.ask}
                                    depths={depthViewData.asks}
                            // showTitle={true}
                        />
                        <Box display={'flex'} flexDirection={'column'}
                             alignItems={'center'}
                             height={24} style={{cursor: 'pointer'}}
                        >
                            {middlePrice}
                        </Box>
                        <DepthBlock onClick={priceClick} marketInfo={marketMap[ market ]}
                                    type={DepthType.bid} depths={depthViewData.bids}
                            // showTitle={false}
                        />
                    </Box>
                    : <Box flex={1} height={'100%'} display={'flex'} alignItems={'center'}
                           justifyContent={'center'}><LoadingIcon/></Box>
                }
            </Box>
            : <Box className={'tradePanel'} flex={1} paddingY={1}>
                {tradeProTable}
            </Box>
        }


    </Box>

})