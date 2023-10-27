import { ChartType, ScaleAreaChart } from '../../charts'
import React from 'react'
import { Box, Grid, Link, Typography } from '@mui/material'
import {
  AmmHistoryItem,
  CurrencyToTag,
  EmptyValueTag,
  ForexMap,
  getValuePrecisionThousand,
  PriceTag,
  SoursURL,
  SvgSize,
  TokenType,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import { CoinIcons } from '../assetsTable'
import * as sdk from '@loopring-web/loopring-sdk'
import { useSettings } from '../../../stores'

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

export const MarketDetail = ({
  tokenInfo,
  trends,
  isShow,
  forexMap,
}: {
  tokenInfo: sdk.TokenInfo
  trends: any
  isShow: boolean
  forexMap: ForexMap
}) => {
  const { t } = useTranslation()
  const { coinJson, currency } = useSettings()
  // const [data, setData] = React.useState([])
  const [timeInterval, setTimeInterval] = React.useState(TradingInterval.hr1)
  const [trend, settTrend] = React.useState<AmmHistoryItem[] | undefined>([])

  const handleTimeIntervalChange = React.useCallback((timeInterval: TradingInterval) => {
    settTrend([])
    setTimeInterval(timeInterval)
  }, [])

  const a = ''
  React.useEffect(() => {
    if (isShow) {
      handleTimeIntervalChange(TradingInterval.hr1)
    }
  }, [isShow])
  return (
    tokenInfo?.symbol && (
      <>
        <Box
          component={'header'}
          display={'flex'}
          flexDirection={'row'}
          justifyContent={'space-between'}
          width={'100%'}
        >
          <Typography display={'flex'} flexDirection={'row'} alignItems={'center'}>
            <Typography
              component={'span'}
              display={'inline-flex'}
              width={
                tokenInfo.type == TokenType.vault
                  ? (SvgSize.svgSizeHuge * 3) / 2
                  : SvgSize.svgSizeHuge
              }
            >
              {/* eslint-disable-next-line react/jsx-no-undef */}
              <CoinIcons
                type={tokenInfo.type as any}
                size={SvgSize.svgSizeHuge}
                tokenIcon={[
                  coinJson[
                    tokenInfo.type == TokenType.vault ? tokenInfo?.erc20Symbol : tokenInfo.symbol
                  ],
                ]}
              />
            </Typography>
            <Typography component={'span'} flexDirection={'column'} display={'flex'}>
              <Typography
                variant={'h4'}
                component={'span'}
                color={'var(--color-primary)'}
                display={'inline-flex'}
              >
                {tokenInfo.type == TokenType.vault ? tokenInfo?.erc20Symbol : tokenInfo.symbol}
              </Typography>
              <Typography
                component={'span'}
                display={'inline-flex'}
                variant={'body1'}
                color={'textPrimary'}
              >
                {tokenInfo.name}
              </Typography>
            </Typography>
          </Typography>
          <Typography
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'space-between'}
            alignItems={'flex-end'}
          >
            <Typography component={'span'} display={'inline-flex'}>
              {tokenInfo.price
                ? PriceTag[CurrencyToTag[currency]] +
                  getValuePrecisionThousand(
                    tokenInfo.price * (forexMap[currency] ?? 0),
                    undefined,
                    undefined,
                    2,
                    true,
                    {
                      isFait: true,
                    },
                  )
                : EmptyValueTag}
            </Typography>
            <Typography component={'span'} flexDirection={'column'} display={'flex'}>
              {tokenInfo.percentChange24H + '%'}
            </Typography>
          </Typography>
        </Box>
        {!trend?.length ? (
          <Box
            flex={1}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            height={'90%'}
          >
            <img
              className='loading-gif'
              alt={'loading'}
              width='36'
              src={`${SoursURL}images/loading-line.gif`}
            />
          </Box>
        ) : (
          <ScaleAreaChart type={ChartType.Trend} data={trend} quoteSymbol={'USDT'} showXAxis />
        )}
        <Grid container spacing={1} marginRight={1} minWidth={296}>
          {TimeMarketIntervalData.map((item) => {
            const { id, i18nKey } = item
            return (
              <Grid key={id} item>
                <Link
                  marginTop={1}
                  variant={'body2'}
                  style={{
                    color:
                      id === timeInterval ? 'var(--color-text-primary)' : 'var(--color-text-third)',
                  }}
                  onClick={() => handleTimeIntervalChange(id)}
                >
                  {t(i18nKey)}
                </Link>
              </Grid>
            )
          })}
        </Grid>
        <Box
          flex={1}
          flexDirection={'column'}
          display={'flex'}
          alignItems={'stretch'}
          width={'100%'}
          marginTop={2}
          padding={1}
          sx={{ background: 'var(--color-box-enhance)' }}
        >
          <Typography component={'p'} variant={'h5'}>
            {t('labelStats')}
          </Typography>
          <Typography
            component={'p'}
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
          >
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('label24Volume')}
            </Typography>
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
              {tokenInfo.volume24H
                ? PriceTag[CurrencyToTag[currency]] +
                  getValuePrecisionThousand(
                    tokenInfo.volume24H,
                    tokenInfo.precision,
                    tokenInfo.precision,
                    tokenInfo.precision,
                    false,
                    { isAbbreviate: true, abbreviate: 6 },
                  )
                : EmptyValueTag}
            </Typography>
          </Typography>
          <Typography
            component={'p'}
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
          >
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('label24PriceChange')}
            </Typography>
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
              {tokenInfo.percentChange24H + '%'}
            </Typography>
          </Typography>

          <Typography
            component={'p'}
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
          >
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
              {t('label7dPriceChange')}
            </Typography>
            <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
              {tokenInfo.percentChange7D + '%'}
            </Typography>
          </Typography>
        </Box>
      </>
    )
  )
}
