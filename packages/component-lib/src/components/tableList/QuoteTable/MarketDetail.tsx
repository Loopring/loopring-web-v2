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
import { QuoteTableChangedCell } from './QuoteTable'

enum TradingInterval {
  hr1 = 'hr1',
  d1 = 'd1',
  w1 = 'w1',
  m1 = 'm1',
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
enum TimeMarketIntervalDataIndex {
  hr1,
  d1,
  w1,
  m1,
}

export const MarketDetail = ({
  tokenInfo,
  trends,
  isShow,
  forexMap,
  timeIntervalData = TimeMarketIntervalData,
}: {
  tokenInfo: sdk.TokenInfo
  trends: any
  isShow: boolean
  forexMap: ForexMap
  timeIntervalData: typeof TimeMarketIntervalData
}) => {
  const { t } = useTranslation()
  const { coinJson, currency, upColor } = useSettings()
  // const [data, setData] = React.useState([])
  const [timeInterval, setTimeInterval] = React.useState(TradingInterval.hr1)
  const [trend, setTrend] = React.useState<AmmHistoryItem[] | undefined>([])
  const makeTenderData = React.useCallback(() => {
    setTrend(trends[TimeMarketIntervalDataIndex[timeInterval]])
  }, [timeInterval, trends])
  const handleTimeIntervalChange = React.useCallback((timeInterval: TradingInterval) => {
    setTimeInterval(timeInterval)
  }, [])

  React.useEffect(() => {
    if (isShow) {
      handleTimeIntervalChange(TradingInterval.hr1)
    }
    if (trends?.length) {
      makeTenderData()
    }
  }, [isShow, trends?.length])
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
            <QuoteTableChangedCell value={tokenInfo.percentChange24H} upColor={upColor}>
              {typeof tokenInfo.percentChange24H !== 'undefined'
                ? (sdk.toBig(tokenInfo.percentChange24H).gt(0) ? '+' : '') +
                  getValuePrecisionThousand(tokenInfo.percentChange24H, 2, 2, 2, true) +
                  '%'
                : EmptyValueTag}
            </QuoteTableChangedCell>
          </Typography>
        </Box>
        <Box
          width={'100%'}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          // height={"60%"}
          height={'calc(var(--swap-box-height) - 262px)'}
          maxHeight={420}
        >
          {!trend?.length ? (
            <img
              className='loading-gif'
              alt={'loading'}
              width='36'
              src={`${SoursURL}images/loading-line.gif`}
            />
          ) : (
            <ScaleAreaChart type={ChartType.Trend} data={trend} quoteSymbol={'USDT'} showXAxis />
          )}
        </Box>
        <Grid container spacing={1} marginRight={1} minWidth={296} justifyContent={'center'}>
          {timeIntervalData.map((item) => {
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
            <QuoteTableChangedCell value={tokenInfo.percentChange24H} upColor={upColor}>
              {typeof tokenInfo.percentChange24H !== 'undefined'
                ? (sdk.toBig(tokenInfo.percentChange24H).gt(0) ? '+' : '') +
                  getValuePrecisionThousand(tokenInfo.percentChange24H, 2, 2, 2, true) +
                  '%'
                : EmptyValueTag}
            </QuoteTableChangedCell>
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

            <QuoteTableChangedCell value={tokenInfo.percentChange7D} upColor={upColor}>
              {typeof tokenInfo.percentChange7D !== 'undefined'
                ? (sdk.toBig(tokenInfo.percentChange7D).gt(0) ? '+' : '') +
                  getValuePrecisionThousand(tokenInfo.percentChange7D, 2, 2, 2, true) +
                  '%'
                : EmptyValueTag}
            </QuoteTableChangedCell>
          </Typography>
        </Box>
      </>
    )
  )
}
