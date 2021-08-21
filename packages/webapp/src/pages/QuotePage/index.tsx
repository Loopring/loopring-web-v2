import React, { useCallback, useEffect } from 'react'
import styled from '@emotion/styled/macro'

import { MarketBlock, QuoteTable, TablePaddingX, QuoteTableRawDataItem, InputSearch, MarketBlockProps } from '@loopring-web/component-lib'
import { OutlinedInputProps } from '@material-ui/core/OutlinedInput/OutlinedInput';
import { WithTranslation, withTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import * as _ from 'lodash'
// import { FloatTag } from '@loopring-web/common-resources'
import { Box, Grid, Tabs, Tab, Divider, OutlinedInput, InputAdornment } from '@material-ui/core'
import { SearchIcon } from '@loopring-web/common-resources'
import { useQuote, useCandlestickList } from './hook'
import { LoopringAPI } from 'api_wrapper'
import { TradingInterval } from 'loopring-sdk/dist'
import { TableWrapStyled } from 'pages/styled'
import { useFavoriteMarket } from 'stores/localStore/favoriteMarket'
import { AmmPoolActivityRule } from 'loopring-sdk'

const RowStyled = styled(Grid)`
      & .MuiGrid-root:not(:last-of-type) > div{
        margin-right: ${({theme}) => theme.unit * 2}px;
      }
` as typeof Grid

const SearchWrapperStyled = styled(Box)`
      position: absolute;
      top: 0.9rem;
      right: ${({theme}) => theme.unit * 2}px;
    `

const TabsWrapperStyled = styled(Box)`
      position: relative;
      padding: 0.8rem 0.8rem 0 1rem;
`

export type CandlestickItem = {
  market: string;
  data: {
    close: number;
    timeStamp: number;
  }[]
}

export enum TableFilterParams {
  all = 'all',
  favourite = 'favourite',
  ranking = 'ranking'
}

const QuotePage = withTranslation('common')((rest: WithTranslation) => {
    const [candlestickList, setCandlestickList] = React.useState<any[]>([])
    const [ammPoolBalances, setAmmPoolBalances] = React.useState<any[]>([])
    const [tableTabValue, setTableTabValue] = React.useState('all')
    const [filteredData, setFilteredData] = React.useState<QuoteTableRawDataItem[]>([])
    const [searchValue, setSearchValue] = React.useState<string>('')
    const [swapRankingList, setSwapRankingList] = React.useState<AmmPoolActivityRule[]>([])
    const [tableHeight, setTableHeight] = React.useState(0);

    const { favoriteMarket, removeMarket, addMarket } = useFavoriteMarket()
    const { t } = rest

    const getSwapRankingList = React.useCallback(async () => {
      if (LoopringAPI.ammpoolAPI) {
        const res = await LoopringAPI.ammpoolAPI.getAmmPoolActivityRules()
        if (res && res.groupByRuleType && res.groupByRuleType.SWAP_VOLUME_RANKING && !!res.groupByRuleType.SWAP_VOLUME_RANKING.length) {
          setSwapRankingList(res.groupByRuleType.SWAP_VOLUME_RANKING)
        }
      }
    }, [])

    const getCandlestick = React.useCallback(async (market: string) => {
      if (LoopringAPI.exchangeAPI) {
        const res = await LoopringAPI.exchangeAPI.getMixCandlestick({
          market: market,
          interval: TradingInterval.d1,
          // start?: number;
          // end?: number;
          limit: 30,
        })
        if (res && res.candlesticks && !!res.candlesticks.length) {
          // const data = res.candlesticks.map(o => ({
          //   close: o.close,
          //   timeStamp: o.timestamp
          // }))
          // setCandlestickList(prev => [...prev, {
          //   market: market,
          //   data: data
          // }])
          const data = res.candlesticks.map(o => ({
            timeStamp: o.timestamp,
            low: o.low,
            high: o.high,
            open: o.open,
            close: o.close,
            volume: o.baseVol,
            sign: o.close < o.open ? -1 : 1,
          }))
          setCandlestickList(prev => [...prev, {
            market: market,
            data: data
          }])
        }
      }
    }, [])

    const { recommendations, tickList /* onVisibleRowsChange */ } = useQuote()

    const getCurrentHeight = React.useCallback(() => {
      const height = window.innerHeight
      const tableHeight = height - 64 - 117 - 56 - 120 - 20
      setTableHeight(tableHeight)
    }, [])

    React.useEffect(() => {
      getCurrentHeight()
      window.addEventListener('resize', getCurrentHeight)
      return () => {
        window.removeEventListener('resize', getCurrentHeight)
      }
    }, [getCurrentHeight]);

    React.useEffect(() => {
      const list = recommendations.map(item => {
        const market = `${item.coinAInfo.simpleName}-${item.coinBInfo.simpleName}`
        return market
      })
      if (!!list.length) {
        getCandlestick(list[0])
        getCandlestick(list[1])
        getCandlestick(list[2])
        getCandlestick(list[3])
      }
    }, [recommendations, getCandlestick])

    const getAmmPoolBalances = useCallback(async () => {
      if (LoopringAPI.ammpoolAPI) {
        const ammRes = await LoopringAPI.ammpoolAPI?.getAmmPoolBalances()
        const fomattedRes = ammRes.raw_data.map((o: any) => ({
          ...o,
          poolName: o.poolName.replace('AMM-', '')
        }))
        setAmmPoolBalances(fomattedRes)
      }
    }, [])

    React.useEffect(() => {
      getAmmPoolBalances()
    }, [getAmmPoolBalances])

    React.useEffect(() => {
      getSwapRankingList()
    }, [getSwapRankingList])

    let history = useHistory()

    // prevent amm risky pair
    const getFilteredTickList = useCallback(() => {
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

    useEffect(() => {
      const data = getFilteredTickList()
      setFilteredData(data)
    }, [getFilteredTickList])

    const handleTableFilterChange = useCallback(({type = TableFilterParams.all, keyword = '' }: {
      type?: TableFilterParams;
      keyword?: string;
    }) => {
      let data =  _.cloneDeep(tickList)
      if (type === TableFilterParams.favourite) {
        data = data.filter((o: any) => {
          const pair = `${o.pair.coinA}-${o.pair.coinB}`
          return favoriteMarket?.includes(pair)
        })
      }
      if (type === TableFilterParams.ranking) {
        data = data.filter((o: any) => {
          const pair = `${o.pair.coinA}-${o.pair.coinB}`
          return swapRankingList.find(o => o.market === pair)
        })
      }
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
      setFilteredData(data)
    }, [getFilteredTickList, favoriteMarket, swapRankingList, tickList])

    const handleRowClick = useCallback((row: QuoteTableRawDataItem) => {
      const { coinA, coinB } = row.pair
      const tradePair = `${coinA}-${coinB}`
      history && history.push({
        pathname: `/trading/lite/${tradePair}`
      })
    }, [history])

    const handleTabChange = useCallback((_event: any, newValue: string) => {
      setTableTabValue(newValue)
      handleTableFilterChange({
        type: newValue === 'favourite' ? TableFilterParams.favourite : newValue === 'tradeRanking' ? TableFilterParams.ranking : TableFilterParams.all,
        keyword: searchValue
      })
    }, [handleTableFilterChange, searchValue])
    
    const handleSearchChange = React.useCallback((value) => {
      setSearchValue(value)
      const type = tableTabValue === 'favourite' ? TableFilterParams.favourite : tableTabValue === 'tradeRanking' ? TableFilterParams.ranking : TableFilterParams.all
      handleTableFilterChange({keyword: value, type: type})
    }, [handleTableFilterChange, tableTabValue])

    const formattedRecommendations = recommendations.map(item => {
      const market = `${item.coinAInfo.simpleName}-${item.coinBInfo.simpleName}`
      return ({
        ...item,
        market,
        chartData: candlestickList.find(o => o.market === market)?.data.sort((a: any, b: any) => a.timeStamp - b.timeStamp)
      })
    })

    // const handleRecommendationJump = React.useCallback((market: string) => {
    //   if (!market) {
    //     return
    //   }
    //   history && history.push({
    //     pathname: `/trading/lite/${market}`
    //   })
    // }, [history])
    const handleRecommendBoxClick = React.useCallback((recommendation: any) => {
      if (recommendation && recommendation.market) {
        history && history.push({
          pathname: `/trading/lite/${recommendation.market}`
        })
      }
    }, [history])

    return <Box display={'flex'} flexDirection={'column'} flex={1} >

        <RowStyled container >

            {/* {recommendations.map((item,index)=> <Grid key={item.coinAInfo+item.coinBInfo+index} item xs={3} >
                    <MarketBlock {...{...item, ...rest}}></MarketBlock>
                </Grid>
            )} */}
            {/* {recommendations.map((item,index)=> {
              const market = `${item.coinAInfo.simpleName}-${item.coinBInfo.simpleName}`
              const chartData = candlestickList.find(o => o.market === market)?.data.sort((a: any, b: any) => a.timeStamp - b.timeStamp)
              return (
                <Grid key={index} item xs={3} onClick={() => {
                  history && history.push({
                    pathname: `/trading/lite/${market}`
                  })
                }}>
                    <MarketBlock {...{...item, chartData: chartData ? chartData : [], ...rest}}></MarketBlock>
                </Grid>
              )
            } 
            )} */}
            <Grid item xs={3} onClick={() => handleRecommendBoxClick(formattedRecommendations[0])}>
                <MarketBlock {...{...formattedRecommendations[0], chartData: formattedRecommendations[0] ? formattedRecommendations[0].chartData : [], ...rest}}></MarketBlock>
            </Grid>
            <Grid item xs={3} onClick={() => handleRecommendBoxClick(formattedRecommendations[1])}>
                <MarketBlock {...{...formattedRecommendations[1], chartData: formattedRecommendations[1] ? formattedRecommendations[1].chartData : [], ...rest}}></MarketBlock>
            </Grid>
            <Grid item xs={3} onClick={() => handleRecommendBoxClick(formattedRecommendations[2])}>
                <MarketBlock {...{...formattedRecommendations[2], chartData: formattedRecommendations[2] ? formattedRecommendations[2].chartData : [], ...rest}}></MarketBlock>
            </Grid>
            <Grid item xs={3} onClick={() => handleRecommendBoxClick(formattedRecommendations[3])}>
                <MarketBlock {...{...formattedRecommendations[3], chartData: formattedRecommendations[3] ? formattedRecommendations[3].chartData : [], ...rest}}></MarketBlock>
            </Grid>

        </RowStyled>
        <TableWrapStyled container marginY={3}  paddingBottom={2} flex={1} className={'MuiPaper-elevation2'}>
            <Grid item xs={12}>
                <TabsWrapperStyled>
                  <Tabs
                      value={tableTabValue}
                      onChange={handleTabChange}
                      aria-label="disabled tabs example"
                  >
                      <Tab label={t('labelQuotePageFavourite')} value="favourite"/>
                      <Tab label={t('labelAll')} value="all"/>
                      <Tab label={t('labelQuotePageTradeRanking')} value="tradeRanking"/>
                  </Tabs>
                  <SearchWrapperStyled>
                    <InputSearch value={searchValue} onChange={handleSearchChange} />
                  </SearchWrapperStyled>
                </TabsWrapperStyled>
                <Divider />
                <QuoteTable /* onVisibleRowsChange={onVisibleRowsChange} */ 
                  onRowClick={(index, row, col) => handleRowClick(row)} 
                  rawData={filteredData}
                  favoriteMarket={favoriteMarket}
                  addFavoriteMarket={addMarket}
                  removeFavoriteMarket={removeMarket}
                  currentHeight={tableHeight}
                  {...{ showLoading: tickList && !tickList.length, ...rest }} />
            </Grid>
        </TableWrapStyled>
    </Box>


})

export default QuotePage
