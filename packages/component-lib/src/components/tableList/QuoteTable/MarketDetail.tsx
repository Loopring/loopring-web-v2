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
import { Trans, useTranslation } from 'react-i18next'
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
  etherscanBaseUrl,
  isLoading,
  timeIntervalData = TimeMarketIntervalData,
}: {
  tokenInfo
  isLoading: boolean
  trends: any
  isShow: boolean
  forexMap: ForexMap
  etherscanBaseUrl: string
  timeIntervalData: typeof TimeMarketIntervalData
}) => {
  const { t } = useTranslation()
  const { coinJson, currency, upColor } = useSettings()
  // const [data, setData] = React.useState([])
  const [timeInterval, setTimeInterval] = React.useState(TradingInterval.hr1)
  const [trend, setTrend] = React.useState<AmmHistoryItem[] | undefined>([])
  const handleTimeIntervalChange = React.useCallback(
    (timeInterval: TradingInterval) => {
      setTimeInterval(timeInterval)
      if (trends?.length) {
        setTrend(trends[TimeMarketIntervalDataIndex[timeInterval]])
      }
    },
    [trends],
  )
  const priceCall = React.useCallback(
    (price: any) => {
      const priceStr = sdk.toBig(price ?? 0).times(forexMap[currency])
      return getValuePrecisionThousand(priceStr, 5, 4, 2, false, { isFait: true, floor: true })
    },
    [forexMap, currency],
  )

  React.useEffect(() => {
    if (isShow && !isLoading) {
      handleTimeIntervalChange(TradingInterval.hr1)
    }
  }, [isShow, isLoading])
  return tokenInfo?.symbol ? (
    <>
      <Box
        component={'header'}
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'space-between'}
        width={'100%'}
      >
        <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
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
              {tokenInfo.symbol}
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
        </Box>
        <Typography
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'space-between'}
          alignItems={'flex-end'}
        >
          <Typography component={'span'} display={'inline-flex'}>
            {PriceTag[CurrencyToTag[currency]] + priceCall(tokenInfo.price)}
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
        sx={{
          minHeight: '300px',
        }}
        // minHeight={420}
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
        display={'flex'}
        flexDirection={'column'}
        alignItems={'stretch'}
        justifyContent={'space-between'}
        width={'100%'}
        marginTop={2}
        paddingX={2}
        paddingTop={1}
        borderRadius={1 / 2}
        sx={{
          background: 'var(--field-opacity)',
        }}
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
                getValuePrecisionThousand(tokenInfo.volume24H, 2, 2, 2, false, {
                  isAbbreviate: false,
                  abbreviate: 6,
                })
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
      <Box
        display={'flex'}
        flexDirection={'column'}
        alignItems={'stretch'}
        justifyContent={'space-between'}
        width={'100%'}
        marginTop={2}
        paddingX={2}
        paddingTop={1}
        borderRadius={1 / 2}
        sx={{
          background: 'var(--field-opacity)',
        }}
      >
        <Typography component={'p'} variant={'h5'}>
          {t('labelTokenInfo')}
        </Typography>
        <Typography
          component={'p'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {t('labelMarketCap')}
          </Typography>
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-primary)'}>
            {tokenInfo.marketCap
              ? PriceTag[CurrencyToTag[currency]] +
                getValuePrecisionThousand(tokenInfo.marketCap, 2, 2, 2, false, {
                  isAbbreviate: false,
                  abbreviate: 6,
                })
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
            {t('labelTokenSupply')}
          </Typography>
          <QuoteTableChangedCell value={tokenInfo.percentChange24H} upColor={upColor}>
            {tokenInfo.totalSupply !== 'undefined' ? tokenInfo.totalSupply : EmptyValueTag}
          </QuoteTableChangedCell>
        </Typography>
        <Typography
          component={'p'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          alignItems={'center'}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {t('labelTokenContractAddress')}
          </Typography>
          <Link
            width={'60%'}
            display={'inline-flex'}
            sx={{ wordBreak: 'break-all' }}
            paddingLeft={1}
            rel='noopener noreferrer'
            href={`${etherscanBaseUrl}address/${tokenInfo.tokenAddress}`}
            target={'_top'}
            justifyContent={'flex-end'}
          >
            {tokenInfo.tokenAddress ? tokenInfo.tokenAddress : EmptyValueTag}
          </Link>
        </Typography>
        <Typography
          component={'p'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
        >
          <Typography variant={'body1'} component={'span'} color={'var(--color-text-secondary)'}>
            {t('labelTokenWebsite')}
          </Typography>
          <Link
            paddingLeft={2}
            width={'60%'}
            display={'inline-flex'}
            sx={{ wordBreak: 'break-all' }}
            rel='noopener noreferrer'
            component={'a'}
            href={tokenInfo.website}
            target={'_top'}
            justifyContent={'flex-end'}
          >
            {tokenInfo.website}
          </Link>
        </Typography>
      </Box>
      <Box
        display={'flex'}
        flexDirection={'column'}
        alignItems={'stretch'}
        justifyContent={'space-between'}
        width={'100%'}
        marginTop={2}
        paddingX={2}
        paddingTop={1}
        borderRadius={1 / 2}
        sx={{
          background: 'var(--field-opacity)',
        }}
      >
        <Typography component={'p'} variant={'h5'}>
          {t('labelTokenIntroduce')}
        </Typography>
        {tokenInfo.type == TokenType.vault ? (
          <Typography
            component={'p'}
            display={'inline-flex'}
            justifyContent={'space-between'}
            marginTop={2}
          >
            <Trans
              i18nKey={'labelTokenVaultDes'}
              tOptions={{
                symbol: tokenInfo.erc20Symbol,
                vSymbol: tokenInfo.symbol,
              }}
            >
              {tokenInfo.symbol} is a token backed 1:1 with {tokenInfo.erc20Symbol}, bringing
              greater liquidity to Loopring DEX.
            </Trans>
          </Typography>
        ) : (
          <></>
        )}
        <Typography
          component={'p'}
          display={'inline-flex'}
          justifyContent={'space-between'}
          marginTop={2}
          whiteSpace={'pre-line'}
        >
          {tokenInfo.description}
        </Typography>
      </Box>
    </>
  ) : (
    <></>
  )
}
