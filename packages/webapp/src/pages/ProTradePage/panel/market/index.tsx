import { WithTranslation, withTranslation } from 'react-i18next';
import { DepthBlock, DepthTitle, DepthType, ToggleButtonGroup, useSettings } from '@loopring-web/component-lib';
import {
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
import { Box, MenuItem, Tab, Tabs, TextField, Typography } from '@mui/material';
import React from 'react';
import { usePageTradePro } from 'stores/router';
import { useTokenMap } from 'stores/token';
import { useTokenPrices } from 'stores/tokenPrices';
import { useSystem } from 'stores/system';
import styled from '@emotion/styled/';


enum TabIndex {
    orderbook = 'orderbook',
    trades = 'trades'
}

const Precision = {
    1: 0.1,
    2: 0.01,
    3: 0.001,
    4: 0.0001,
    5: 0.00001,
    6: 0.000001,
    7: 0.0000001,
    8: 0.00000001,
    9: 0.000000001,
    10: 0.0000000001,
    11: 0.00000000001,
    12: 0.000000000001
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
                                                         t, market, ...rest
                                                     }: {
    market: MarketType,
    rowLength:number
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
    const [level, setLevel] = React.useState<string>('0.01');
    const [depthType, setDepthType] = React.useState<DepthShowType>(DepthShowType.half);
    const handleOnDepthTypeChange = React.useCallback((event: React.MouseEvent<HTMLElement> | any, newValue) => {
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
    }, [depth, depthType, rowLength])
    const middlePrice = React.useMemo(() => {

        const {close} = tickerMap ? tickerMap[ market ] : {close: undefined};
        let up: 'up' | 'down' | '' = '';
        let priceColor = '';
        let value = '';
        if (close && depth && depth.mid_price) {
            if (depth.mid_price === close) {
                priceColor = '';
                up = '';
            } else if (depth.mid_price > close) {
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

        return <Typography color={'var(--color-text-third)'} variant={'body2'} component={'p'} display={'inline-flex'}
                           textAlign={'center'} alignItems={'center'}>
            {close ? <>
                    <Typography lineHeight={1} color={priceColor} component={'span'} paddingRight={1} alignItems={'center'}
                                display={'inline-flex'}> {close}
                        {up && < UpIcon fontSize={'small'} htmlColor={priceColor} style={{
                            transform: (priceColor === 'up' ? '' : 'rotate(-180deg)')}}/> }
                    </Typography> {value}
                </>
                : EmptyValueTag
            }

        </Typography>
    }, [tickerMap, depth?.mid_price])
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
    const precisionListPrice = React.useMemo(() => {
        const precisionForPrice = marketMap[ market ].precisionForPrice;
        const orderbookAggLevels = marketMap[ market ].orderbookAggLevels;
        let list: { value: string }[] = [];
        for (let i = 0; i < orderbookAggLevels; i++) {
            list.push({value: Precision[ precisionForPrice - i ]})
        }


        return list

    }, [market])


    React.useEffect(() => {
        rebuildList()
    }, [depth, level, depthType, rowLength])
    return <>
        <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'} height={'100%'}>
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
                               alignItems={'stretch'} justifyContent={'space-between'}>
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
                        {precisionListPrice.map(({value}) => <MenuItem key={value}
                                                                              value={value}>{value}</MenuItem>)}

                    </TextField>
                </MarketToolbar>

                {depth && tickerMap && tokenMap && marketMap && market == pageTradePro.market ?
                    <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'} paddingX={2}>
                        <Box paddingTop={1 / 2}><DepthTitle marketInfo={marketMap[ market ]}/></Box>
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