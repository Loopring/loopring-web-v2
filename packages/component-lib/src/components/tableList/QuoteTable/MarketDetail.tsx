import { ChartType, ScaleAreaChart } from '../../charts'
import React from 'react'
import { Grid, Link } from '@mui/material'
import { AmmHistoryItem } from '@loopring-web/common-resources'
enum TradingInterval {
  hr1 = '1hr',
  d1 = '1d',
  w1 = '1w',
  m1 = '1m',
}
const TimeMarketIntervalData = [
  {
    id: TradingInterval.hr1,
    i18nKey: 'labelProTime1h',
  },
  {
    id: TradingInterval.d1,
    i18nKey: 'labelProTime1d',
  },
  {
    id: TradingInterval.w1,
    i18nKey: 'labelProTime1w',
  },
  {
    id: TradingInterval.m1,
    i18nKey: 'labelProTime1m',
  },
]

export const MarketDetail = ({ trends, isShow }: { trends: any; isShow: boolean }) => {
  const { t } = useTranslation()
  const [data, setData] = React.useState([])
  const [timeInterval, setTimeInterval] = React.useState(TradingInterval.hr1)
  const [trends, settTrends] = React.useState<AmmHistoryItem[] | undefined>([])

  const handleTimeIntervalChange = React.useCallback((timeInterval: TradingInterval) => {
    settTrends()
    setTimeInterval(timeInterval)
  }, [])

  const a = ''
  React.useEffect(() => {
    if (isShow) {
      handleTimeIntervalChange(TradingInterval.hr1)
    }
  }, [isShow])
  return (
    <>
      <ScaleAreaChart type={ChartType.Trend} data={trends} quoteSymbol={'USDT'} showXAxis />
      <Grid container spacing={1} marginRight={1} minWidth={296}>
        {TimeMarketIntervalData.map((item) => {
          const { id, i18nKey } = item
          const isSelected = id === timeInterval
          return (
            <Grid key={id} item>
              <Link
                marginTop={1}
                variant={'body2'}
                color={isSelected ? 'var(--color-text-primary)' : 'var(--color-text-third)'}
                onClick={() => handleTimeIntervalChange(id)}
              >
                {t(i18nKey)}
              </Link>
            </Grid>
          )
        })}
      </Grid>
    </>
  )
}
