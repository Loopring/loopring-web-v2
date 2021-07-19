import React from 'react'
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
        margin-right: ${({theme}) => theme.unit * 3}px;
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
    const [candlestickList, setCandlestickList] = React.useState<CandlestickItem[]>([])
    const getCandlestick = React.useCallback(async (market: string) => {
      if (LoopringAPI.exchangeAPI) {
        const res = await LoopringAPI.exchangeAPI.getMixCandlestick({
          market: market,
          interval: TradingInterval.d1,
          // start?: number;
          // end?: number;
          limit: 30
        })
        if (res && res.candlesticks && !!res.candlesticks.length) {
          const data = res.candlesticks.map(o => ({
            close: o.close,
            timeStamp: o.timestamp
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

    let history = useHistory()

    const handleRowClick = React.useCallback((row: QuoteTableRawDataItem) => {
      const { coinA, coinB } = row.pair
      const tradePair = `${coinA}-${coinB}`
      history.push({
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
              const chartData = candlestickList.find(o => o.market === market)?.data
              return (
                <Grid key={index} item xs={3} >
                    <MarketBlock {...{...item, chartData: chartData ? chartData : [], ...rest}}></MarketBlock>
                </Grid>
              )
            } 
            )}



        </RowStyled>
        <TableWrapStyled container marginY={3}  paddingBottom={2} flex={1}>
            <Grid item xs={12} display={'flex'}>
                <QuoteTable onVisibleRowsChange={onVisibleRowsChange} onRowClick={(index, row, col) => 
                  handleRowClick(row)
                } rawData={tickList} {...{ ...rest }} />
            </Grid>
        </TableWrapStyled>
    </Box>


})

export default QuotePage
