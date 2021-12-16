import React from 'react';
import { TFunction, withTranslation } from 'react-i18next';
import * as _ from 'lodash'
import {
    CoinInfo,
    DropDownIcon, EmptyValueTag,
    getValuePrecisionThousand, layoutConfigs,
    MarketType,
    PriceTag,
    SagaStatus,
    UpIcon
} from '@loopring-web/common-resources';
import { Button, MarketBlockProps, useSettings, PopoverPure, QuoteTable, InputSearch, QuoteTableRawDataItem } from '@loopring-web/component-lib';
import { useTicker } from 'stores/ticker';
import { useTokenMap } from 'stores/token';
import { Box, Grid, MenuItem, TextField, Typography, ClickAwayListener, Tabs, Tab, Container, Divider } from '@mui/material';
import { usePopupState, bindPopper } from 'material-ui-popup-state/hooks';
import { bindTrigger } from 'material-ui-popup-state/es';
import { usePageTradePro } from 'stores/router';
import { volumeToCount } from 'hooks/help'
import styled from '@emotion/styled'
import { Currency } from '@loopring-web/loopring-sdk';
import { Layout, Layouts } from 'react-grid-layout';
import { useTokenPrices } from 'stores/tokenPrices';
import { useSystem } from 'stores/system';
import { useFavoriteMarket } from 'stores/localStore/favoriteMarket'
import { useAmmActivityMap } from 'stores/Amm/AmmActivityMap'
import { TableProWrapStyled } from 'pages/styled'
import { useQuote } from 'pages/QuotePage/hook'
import { useToolbar } from './hook'

const PriceTitleStyled = styled(Typography)`
  color: var(--color-text-third);
  font-size: 1.2rem;
`

const PriceValueStyled = styled(Typography)`
  font-size: 1.2rem;
`

const InputSearchWrapperStyled = styled(Box)`
    padding: ${({theme}) => theme.unit * 2}px;
    padding-bottom: 0;
`

export enum TableFilterParams {
    all = 'all',
    favourite = 'favourite',
    ranking = 'ranking'
}

export const Toolbar = withTranslation('common')(<C extends { [ key: string ]: any }>({
                                                                                          market,
                                                                                          handleLayoutChange,
                                                                                          handleOnMarketChange,
                                                                                          // ,marketTicker
                                                                                          t,
                                                                                      }: {
    t: TFunction<"translation">,
    market: MarketType,
    handleLayoutChange: (currentLayout: Layout[], allLayouts?: Layouts, layouts?: Layouts) => void,

    handleOnMarketChange: (newMarket: MarketType) => void,
    // marketTicker:  MarketBlockProps<C>
}) => {
    //@ts-ignore
    const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
    const {coinMap, marketArray, marketMap, tokenMap} = useTokenMap();
    const {tickerMap, status: tickerStatus} = useTicker();
    const {favoriteMarket, removeMarket, addMarket} = useFavoriteMarket()
    const { ammPoolBalances } = useToolbar()
    const {tickList} = useQuote()
    const { ammActivityMap } = useAmmActivityMap()
    const tradeRaceList = (ammActivityMap?.SWAP_VOLUME_RANKING?.InProgress || []).map(o => o.market)
    const [filteredData, setFilteredData] = React.useState<QuoteTableRawDataItem[]>([])
    const [searchValue, setSearchValue] = React.useState<string>('')
    const [tableTabValue, setTableTabValue] = React.useState('all')
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
    const [marketTicker,setMarketTicker] = React.useState<MarketBlockProps<C> & any | undefined>({
        coinAInfo: coinMap[ coinA ] as CoinInfo<C>,
        coinBInfo: coinMap[ coinB ] as CoinInfo<C>,
        tradeFloat: tickerMap[market],
        // base,
        // quote,
        // isRise,
        // baseVol,
        // basePriceDollar,
        // basePriceYuan
    });
    // const {pageTradePro: {ticker}} = usePageTradePro()
    const {currency} = useSettings()
    const {forex} = useSystem()
    const {tokenPrices} = useTokenPrices()

    // const {
    //     change,
    //     close,
    //     floatTag,
    //     high,
    //     low,
    //     volume: quoteVol,
    //     // priceDollar,
    //     // priceYuan,
    //     __rawTicker__,
    // } = tickerMap[] || {} as any
    // const base = __rawTicker__?.base
    // const quote = __rawTicker__?.quote
    // const baseVol = volumeToCount(base, __rawTicker__?.base_token_volume || 0)
    // const isRise = floatTag === 'increase'
    const isUSD = currency === Currency.usd
    // const basePriceDollar = tokenPrices ? tokenPrices[base] : 0
    // const basePriceYuan = basePriceDollar * forex

    const getMarketPrecision = React.useCallback((market: string) => {
        if (marketMap) {
            return marketMap[ market ]?.precisionForPrice
        }
        return undefined
    }, [marketMap])

    const getTokenPrecision = React.useCallback((token: string) => {
        if (tokenMap) {
            return tokenMap[ token ]?.precision
        }
        return undefined
    }, [tokenMap])
    // const {pageTradePro,updatePageTradePro} = usePageTradePro()
    React.useEffect(() => {
        if (tickerStatus === SagaStatus.UNSET) {
            setDefaultData();
        }
    }, [tickerStatus,market]);
    const setDefaultData = React.useCallback(() => {
        if (coinMap && tickerMap && tickerMap[ market ] && tickerMap[ market ].__rawTicker__) {

            // const [, coinA, coinB] = market.match(/(\w+)-(\w+)/i);
            const ticker = tickerMap[ market ]
            const base:string =  ticker.__rawTicker__?.base??'';
            const quote:string =  ticker.__rawTicker__?.quote??'';
            const baseVol = volumeToCount(base, ticker.__rawTicker__?.base_token_volume || 0)
            const quoteVol = volumeToCount(quote, ticker.__rawTicker__?.quote_token_volume || 0)
            const isRise = ticker.floatTag === 'increase'
            const basePriceDollar = tokenPrices ? tokenPrices[base] : 0
            const basePriceYuan = basePriceDollar * forex
            setMarketTicker((state: any)=>{
                return {
                    ...state,
                    tradeFloat: ticker,
                    base,
                    quote,
                    isRise,
                    baseVol,
                    quoteVol,
                    basePriceDollar,
                    basePriceYuan
                }
            })
        }

    }, [tickerMap, market])
    // const _handleOnMarketChange = React.useCallback((event: React.ChangeEvent<{ value: string }>) => {
    //     handleOnMarketChange(event.target.value as MarketType)
    // }, [])

    // prevent amm risky pair
    const getFilteredTickList = React.useCallback(() => {
        if (!!ammPoolBalances.length && tickList && !!tickList.length) {
            return tickList.filter((o: any) => {
                const pair = `${o.pair.coinA}-${o.pair.coinB}`
                if (ammPoolBalances.find(o => o.poolName === pair)) {
                    return !ammPoolBalances.find(o => o.poolName === pair).risky
                }
                return true
            })
        }
        return []
    }, [tickList, ammPoolBalances])

    const resetTableData = React.useCallback((tableData)=>{
        setFilteredData(tableData)
        // setTableHeight(RowConfig.rowHeaderHeight + tableData.length * RowConfig.rowHeight )
    },[setFilteredData])

    React.useEffect(() => {
        const data = getFilteredTickList()
        resetTableData(data)
    }, [getFilteredTickList, resetTableData])

    const handleTableFilterChange = React.useCallback(({type = TableFilterParams.all, keyword = ''}: {
        type?: TableFilterParams;
        keyword?: string;
    }) => {
        let data = _.cloneDeep(tickList)
        if (type === TableFilterParams.favourite) {
            data = data.filter((o: any) => {
                const pair = `${o.pair.coinA}-${o.pair.coinB}`
                return favoriteMarket?.includes(pair)
            })
        }
        // if (type === TableFilterParams.ranking) {
        //     data = data.filter((o: any) => {
        //         const pair = `${o.pair.coinA}-${o.pair.coinB}`
        //         return swapRankingList.find(o => o.market === pair)
        //     })
        // }
        data = data.filter((o: any) => {
            const formattedKeyword = keyword?.toLocaleLowerCase()
            const coinA = o.pair.coinA.toLowerCase()
            const coinB = o.pair.coinB.toLowerCase()
            if (keyword === '') {
                return true
            }
            return coinA?.includes(formattedKeyword) || coinB?.includes(formattedKeyword)
        })
        if (type === TableFilterParams.all && !keyword) {
            data = getFilteredTickList()
        }
        resetTableData(data)
    }, [tickList, resetTableData, favoriteMarket, getFilteredTickList])

    const handleTabChange = React.useCallback((_event: any, newValue: string) => {
        setTableTabValue(newValue)
        handleTableFilterChange({
            type: newValue === 'favourite' ? TableFilterParams.favourite : newValue === 'tradeRanking' ? TableFilterParams.ranking : TableFilterParams.all,
            keyword: searchValue
        })
    }, [handleTableFilterChange, searchValue])

    const handleSearchChange = React.useCallback((value) => {
        setSearchValue(value)
    }, [])

    // update list when searchValue change
    React.useEffect(() => {
        const type = tableTabValue === 'favourite' ? TableFilterParams.favourite : tableTabValue === 'tradeRanking' ? TableFilterParams.ranking : TableFilterParams.all
        handleTableFilterChange({keyword: searchValue, type: type})
    }, [searchValue, handleSearchChange, tableTabValue, handleTableFilterChange])

    const popState = usePopupState({variant: 'popover', popupId: `popup-pro-toolbar-markets`})

    // const MakretChosenStyled = styled(Box)`
    //     width: auto;
    //     cursor: pointer;
    // `

    const handleClickAway = React.useCallback(() => {
        popState.setOpen(false)
        setIsDropdownOpen(false)
        setSearchValue('')
    }, [popState])

    return <Box display={'flex'} alignItems={'center'} height={'100%'} paddingX={2} justifyContent={'space-between'}>
        <Box alignItems={'center'} display={'flex'}>
            {/* <TextField
                id="outlined-select-level"
                select
                size={'small'}
                style={{width: '190px'}}
                value={market}
                onChange={_handleOnMarketChange}
                inputProps={{IconComponent: DropDownIcon}}
            >
                {marketArray && !!marketArray.length && (marketArray.slice().sort((a, b) => a.localeCompare(b))).map((item) =>
                    <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </TextField> */}
            <Box display={'flex'} alignItems={'center'} fontSize={'1.6rem'} {...bindTrigger(popState)} onClick={(e: any) => {
                    bindTrigger(popState).onClick(e);
                    setIsDropdownOpen(true);
                    if (tableTabValue === 'favourite') {
                        handleTabChange(_, 'favourite');
                    }
                }} width={'min-content'} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {market}
                    <DropDownIcon htmlColor={'var(--color-text-third)'} style={{ marginBottom: 2, transform: isDropdownOpen ? 'rotate(0.5turn)' : 'rotate(0)' }} />
            </Box>
                
            <PopoverPure
                className={'arrow-center no-arrow'}
                {...bindPopper(popState)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}>
                <ClickAwayListener onClickAway={handleClickAway}>
                    <Box>
                        <InputSearchWrapperStyled>
                            <InputSearch fullWidth value={searchValue} onChange={handleSearchChange} />
                        </InputSearchWrapperStyled>
                        <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
                            <Tabs
                                value={tableTabValue}
                                onChange={handleTabChange}
                                aria-label="disabled tabs example"
                            >
                                <Tab label={t('labelQuotePageFavourite')} value="favourite"/>
                                <Tab label={t('labelAll')} value="all"/>
                                {/* <Tab label={t('labelQuotePageTradeRanking')} value="tradeRanking"/> */}
                            </Tabs>
                        </Box>
                        <Divider style={{marginTop:'-1px'}}/>
                        <TableProWrapStyled width={'580px'}>
                            <QuoteTable
                                isPro
                                rawData={filteredData}
                                favoriteMarket={favoriteMarket}
                                addFavoriteMarket={addMarket}
                                removeFavoriteMarket={removeMarket}
                                tradeRaceList={tradeRaceList}
                                onRowClick={(_:any, row:any) => {
                                    handleOnMarketChange(`${row.pair.coinA}-${row.pair.coinB}` as MarketType);
                                    popState.setOpen(false);
                                    setIsDropdownOpen(false);
                                    setSearchValue('');
                                }}
                            />
                        </TableProWrapStyled>
                    </Box>
                </ClickAwayListener>
            </PopoverPure>
            <Grid container spacing={3} marginLeft={0} display={'flex'} alignItems={'center'}>
                <Grid item>
                    <Typography fontWeight={500}
                                color={!marketTicker?.tradeFloat?.close ? 'var(--color-text-primary)' : marketTicker.isRise ? 'var(--color-success)' : 'var(--color-error)'}>
                        {marketTicker?.tradeFloat?.close ?? EmptyValueTag}</Typography>
                    <PriceValueStyled>{isUSD ? PriceTag.Dollar : PriceTag.Yuan}{getValuePrecisionThousand((isUSD ? marketTicker.basePriceDollar : marketTicker.basePriceYuan), undefined, undefined, undefined, true, {isFait: true})}</PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hChange')}</PriceTitleStyled>
                    <PriceValueStyled color={marketTicker.isRise ? 'var(--color-success)' : 'var(--color-error)'}>
                        {`${marketTicker.isRise ? '+' : ''} ${getValuePrecisionThousand(marketTicker?.tradeFloat?.change, undefined, undefined, 2, true)}%`}
                    </PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hHigh')}</PriceTitleStyled>
                    <PriceValueStyled>{getValuePrecisionThousand(marketTicker?.tradeFloat?.high, undefined, undefined, getMarketPrecision(market), true, {isPrice: true})}</PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hLow')}</PriceTitleStyled>
                    <PriceValueStyled>{getValuePrecisionThousand(marketTicker?.tradeFloat?.low, undefined, undefined, getMarketPrecision(market), true, {isPrice: true})}</PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hBaseVol', {symbol: marketTicker.base})}</PriceTitleStyled>
                    <PriceValueStyled>{getValuePrecisionThousand(marketTicker.baseVol, undefined, undefined, getTokenPrecision(marketTicker.base), true, {isPrice: true})}</PriceValueStyled>
                </Grid>
                <Grid item>
                    <PriceTitleStyled>{t('labelProToolbar24hQuoteVol', {symbol: marketTicker.quote})}</PriceTitleStyled>
                    <PriceValueStyled>{getValuePrecisionThousand(marketTicker.quoteVol, undefined, undefined, getTokenPrecision(marketTicker.quote), true, {isPrice: true})}</PriceValueStyled>
                </Grid>
            </Grid>
        </Box>
        <Box>
            <Button onClick={() => {
                handleLayoutChange([], undefined, layoutConfigs[ 0 ].layouts)

            }}>{t('labelResetLayout')}</Button>
        </Box>
    </Box>

})
