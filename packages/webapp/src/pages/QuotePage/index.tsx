import React, { useCallback } from 'react'
import styled from '@emotion/styled/macro'

import { MarketBlock, QuoteTable, TablePaddingX, QuoteTableRawDataItem } from '@loopring-web/component-lib'

import { WithTranslation, withTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
// import { FloatTag } from '@loopring-web/common-resources'
import { Box, Grid } from '@material-ui/core'
import { useQuote, useCandlestickList } from './hook'
import { LoopringAPI } from 'stores/apis/api'
import { TradingInterval } from 'loopring-sdk/dist'
import { TableWrapStyled } from 'pages/styled'

const  RowStyled = styled(Grid)`
      & .MuiGrid-root:not(:last-of-type) > div{
        margin-right: ${({theme}) => theme.unit * 2}px;
      }
` as typeof Grid


export type CandlestickItem = {
  market: string;
  data: {
    close: number;
    timeStamp: number;
  }[]
}

const QuotePage = withTranslation('common')((rest: WithTranslation) => {
    const [candlestickList, setCandlestickList] = React.useState<any[]>([])
    const [ammPoolBalances, setAmmPoolBalances] = React.useState<any[]>([])

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

    const { recommendations, tickList, onVisibleRowsChange } = useQuote()

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

    let history = useHistory()

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

    const handleRowClick = useCallback((row: QuoteTableRawDataItem) => {
      const { coinA, coinB } = row.pair
      const tradePair = `${coinA}-${coinB}`
      history && history.push({
        pathname: `/trading/lite/${tradePair}`
      })
    }, [history])

    return <Box display={'flex'} flexDirection={'column'} flex={1} >

        <RowStyled container >

            {/* {recommendations.map((item,index)=> <Grid key={item.coinAInfo+item.coinBInfo+index} item xs={3} >
                    <MarketBlock {...{...item, ...rest}}></MarketBlock>
                </Grid>
            )} */}
            {recommendations.map((item,index)=> {
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
            )}



        </RowStyled>
        <TableWrapStyled container marginY={3}  paddingBottom={2} flex={1}>
            <Grid item xs={12} display={'flex'}>
                <QuoteTable /* onVisibleRowsChange={onVisibleRowsChange} */ onRowClick={(index, row, col) => 
                  handleRowClick(row)
                } rawData={getFilteredTickList()} {...{ showLoading: tickList && !tickList.length, ...rest }} />
            </Grid>
        </TableWrapStyled>
    </Box>


})

export default QuotePage
