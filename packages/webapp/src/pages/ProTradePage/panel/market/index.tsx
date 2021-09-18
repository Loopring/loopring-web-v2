import { WithTranslation, withTranslation } from 'react-i18next';
import { DepthBlock, DepthTitle, DepthType, ToggleButtonGroup, useSettings } from '@loopring-web/component-lib';
import {
    Currency,
    depth2ViewData,
    DepthFIcon,
    DepthHIcon,
    DepthViewData,
    EmptyValueTag,
    getValuePrecisionThousand,
    LoadingIcon,
    MarketType,
    PriceTag
} from '@loopring-web/common-resources';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import React from 'react';
import { usePageTradePro } from 'stores/router';
import { useTokenMap } from 'stores/token';
import { useTokenPrices } from 'stores/tokenPrices';
import { useSystem } from 'stores/system';
import styled from '@emotion/styled/';

const ROW_LENGTH: number = 8;

enum TabIndex {
    orderbook = 'orderbook',
    trades = 'trades'
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
        svg{
          path{
            fill: var(--color-text-button-Select)
          }
        }
      }
    }
    .MuiToggleButton-root.MuiToggleButton-sizeSmall.Mui-selected {
      svg{
        path{
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
                                                         t, market, ...rest
                                                     }: {
    market: MarketType,
    // marketTicker:  MarketBlockProps<C>
} & WithTranslation) => {
    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i);
    const [tabIndex, setTabIndex] = React.useState<TabIndex>(TabIndex.orderbook);
    const {pageTradePro} = usePageTradePro();

    const {tickerMap, depth} = pageTradePro;
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
    const [rowLength, setRowLength] = React.useState<number>(ROW_LENGTH);
    const [level, setLevel] = React.useState<string>('0.01');
    const [depthType, setDepthType] = React.useState<DepthShowType>(DepthShowType.half);
    const handleOnDepthTypeChange = React.useCallback((event: React.MouseEvent<HTMLElement> | any, newValue) => {
        debugger
        setDepthType(newValue);
        //TODO: change table
        rebuildList()
    }, [level])

    const handleOnLevelChange = React.useCallback((event: React.ChangeEvent<{ value: string }>) => {

        setLevel(event.target?.value);
        //TODO: change table
        // rebuildList()
    }, [])
    const rebuildList = React.useCallback(() => {

        if (depth) {
            const baseDecimal = tokenMap[ baseSymbol ]?.decimals;
            const quoteDecimal = tokenMap[ baseSymbol ]?.decimals;
            const precisionForPrice = marketMap[ market ].precisionForPrice;
            let [countAsk,countBid] = [rowLength,rowLength]
            if(depthType === DepthShowType.bids) {
                [countAsk,countBid] = [0,rowLength*2]
            }else if (depthType === DepthShowType.asks){
                [countAsk,countBid] = [rowLength*2,0]
            }else{}
            const viewData = depth2ViewData({depth,countAsk,countBid , baseDecimal, quoteDecimal, precisionForPrice})
            setDepthViewData(viewData);
        }
    }, [depth, depthType, rowLength])
    const middlePrice = React.useMemo(() => {

        const {close} = tickerMap ? tickerMap[ market ] : {close: undefined};
        let priceColor = '';
        let value = '';
        if (close && depth && depth.mid_price) {
            if (depth.mid_price === close) {
                priceColor = '';
            } else if (depth.mid_price > close) {
                priceColor = 'var(--color-success)'
            } else {
                priceColor = 'var(--color-error)'
            }
            value = currency === Currency.dollar ? '\u2248 ' + PriceTag.Dollar
                + getValuePrecisionThousand(close * quotePrice, undefined, undefined, undefined, true, {isFait: true})
                : '\u2248 ' + PriceTag.Yuan
                + getValuePrecisionThousand(close * quotePrice / forex, undefined, undefined, undefined, true, {isFait: true})

        }

        return <Typography color={'var(--color-text-third)'} variant={'body2'} component={'p'} display={'inline-flex'}
                           textAlign={'center'} alignItems={'center'}>
            {close ? <>
                    <Typography color={priceColor} component={'span'} paddingRight={1}> {close} </Typography> {value}
                </>
                : EmptyValueTag
            }

        </Typography>
    }, [tickerMap])
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
    React.useEffect(() => {
        rebuildList()
    }, [depth, level, depthType, rowLength])
    return <>
        <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'}>
            <Box component={'header'} width={'100%'}>
                <Tabs variant={'fullWidth'} value={tabIndex} onChange={(_e, value) => {
                    setTabIndex(value)
                }}>
                    <Tab key={TabIndex.orderbook} value={TabIndex.orderbook} label={t('labelProLimit')}/>
                    {/*<Tab value={TabIndex.market} label={t('labelProMarket')}/>*/}
                </Tabs>
            </Box>
            <Box className={'depthPane;'} flex={1} paddingY={1}>
                <MarketToolbar component={'header'} className={'pro'} width={'100%'} display={'flex'} paddingX={2}
                               alignItems={'stretch'}>
                    <ToggleButtonGroup exclusive {...{
                        ...rest,
                        t,
                        tgItemJSXs: toggleData,
                        value: depthType,
                        size: 'small'
                    }}
                                       onChange={handleOnDepthTypeChange}/>
                    {/*<TextField*/}
                    {/*    id="outlined-select-level"*/}
                    {/*    select*/}
                    {/*    label="level"*/}
                    {/*    value={level}*/}
                    {/*    onChange={handleOnLevelChange}*/}
                    {/*    inputProps={{IconComponent: DropDownIcon}}*/}
                    {/*> {[].map(({label, value}) => <MenuItem key={value} value={value}>{t(label)}</MenuItem>)}*/}
                    {/*</TextField>*/}
                </MarketToolbar>
                {depth && tickerMap && tokenMap && marketMap && market == pageTradePro.market ?
                    <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'} paddingX={2}>
                       <Box paddingTop={1/2}><DepthTitle marketInfo={marketMap[ market ]}/></Box>
                        <DepthBlock marketInfo={marketMap[ market ]}
                                    type={DepthType.ask}
                                    depths={depthViewData.asks}
                                    // showTitle={true}
                        />
                        <Box paddingY={1 / 2} display={'flex'} flexDirection={'column'} alignItems={'center'}>
                            {middlePrice}
                        </Box>
                        <DepthBlock marketInfo={marketMap[ market ]}
                                    type={DepthType.bid} depths={depthViewData.bids}
                                    // showTitle={false}
                        />
                    </Box>
                    : <Box flex={1} height={'100%'} display={'flex'} alignItems={'center'}
                           justifyContent={'center'}><LoadingIcon/></Box>
                }
            </Box>


        </Box>

    </>
})