import { WithTranslation } from 'react-i18next'
import {
  Account,
  CAMPAIGNTAGCONFIG,
  CoinInfo,
  CurrencyToTag,
  EmptyValueTag,
  FloatTag,
  ForexMap,
  getValuePrecisionThousand,
  PriceTag,
  SCENARIO,
  SoursURL,
  Ticker,
  UpColor,
} from '@loopring-web/common-resources'
import { Avatar, Box, Grid, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { AvatarCoin, baseTitleCss, TagIconList, useSettings } from '../../index'
import { NewTagIcon } from '../basic-lib'
import { Currency } from '@loopring-web/loopring-sdk'

export type StyledProps = {
  custom: { chg: UpColor }
}
const TradeTitleStyled = styled(Box)<StyledProps>`
  ${({ theme, custom }) => baseTitleCss({ theme, custom })}
` as (props: StyledProps) => JSX.Element

export const TradeTitle = <I extends object>({
  baseShow,
  quoteShow,
  coinAInfo,
  coinBInfo,
  // t,
  ticker,
  isNew,
  forexMap,
  campaignTagConfig,
}: WithTranslation & {
  account: Account
  baseShow: string
  quoteShow: string
  coinAInfo: CoinInfo<I>
  coinBInfo: CoinInfo<I>
  ticker: Ticker
  isNew: boolean
  forexMap: ForexMap<Currency>
  campaignTagConfig: CAMPAIGNTAGCONFIG
}) => {
  const { coinJson } = useSettings()
  const sellCoinIcon: any = coinJson[coinAInfo?.simpleName]
  const buyCoinIcon: any = coinJson[coinBInfo?.simpleName]

  const tradeFloatType =
    ticker?.changeU === 0 || !ticker?.changeU
      ? FloatTag.none
      : ticker.changeU < 0
      ? FloatTag.decrease
      : FloatTag.increase
  const { currency, upColor } = useSettings()
  const close: any = ticker.close

  const value =
    '\u2248 ' +
    PriceTag[CurrencyToTag[currency]] +
    getValuePrecisionThousand(
      ticker?.closeU ? ticker?.closeU * (forexMap[currency] ?? 0) : 0,
      undefined,
      undefined,
      undefined,
      true,
      { isFait: true },
    )

  const pair = `${coinAInfo?.simpleName}-${coinBInfo?.simpleName}`
  const change = ticker?.change ? ticker?.change.toFixed(2) + '%' : '0.00%'
  return (
    // @ts-ignore
    <TradeTitleStyled custom={{ chg: upColor }}>
      {coinBInfo && coinAInfo ? (
        <Grid container height={72}>
          <Grid item xs={12} height={28}>
            <Box
              display={'flex'}
              flexDirection={'row'}
              justifyContent={'flex-start'}
              alignItems={'center'}
            >
              <Box
                className={'logo-icon'}
                display={'flex'}
                height={'var(--chart-title-coin-size)'}
                position={'relative'}
                zIndex={20}
                width={'var(--chart-title-coin-size)'}
                alignItems={'center'}
                justifyContent={'center'}
              >
                {sellCoinIcon ? (
                  <AvatarCoin
                    imgx={sellCoinIcon.x}
                    imgy={sellCoinIcon.y}
                    imgheight={sellCoinIcon.h}
                    imgwidth={sellCoinIcon.w}
                    size={28}
                    variant='circular'
                    alt={coinAInfo?.simpleName as string}
                    // src={sellData?.icon}
                    src={
                      'data:image/svg+xml;utf8,' +
                      '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                    }
                  />
                ) : (
                  <Avatar
                    variant='circular'
                    alt={coinAInfo?.simpleName as string}
                    style={{
                      height: 'var(--chart-title-coin-size)',
                      width: 'var(--chart-title-coin-size)',
                    }}
                    // src={sellData?.icon}
                    src={SoursURL + 'images/icon-default.png'}
                  />
                )}
              </Box>

              <Box
                className={'logo-icon'}
                display={'flex'}
                height={'var(--chart-title-coin-size)'}
                position={'relative'}
                zIndex={18}
                left={-8}
                width={'var(--chart-title-coin-size)'}
                alignItems={'center'}
                justifyContent={'center'}
              >
                {buyCoinIcon ? (
                  <AvatarCoin
                    imgx={buyCoinIcon.x}
                    imgy={buyCoinIcon.y}
                    imgheight={buyCoinIcon.h}
                    imgwidth={buyCoinIcon.w}
                    size={28}
                    variant='circular'
                    alt={coinBInfo?.simpleName as string}
                    // src={sellData?.icon}
                    src={
                      'data:image/svg+xml;utf8,' +
                      '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0H36V36H0V0Z"/></svg>'
                    }
                  />
                ) : (
                  <Avatar
                    variant='circular'
                    alt={coinBInfo?.simpleName as string}
                    style={{
                      height: 'var(--chart-title-coin-size)',
                      width: 'var(--chart-title-coin-size)',
                    }}
                    // src={sellData?.icon}
                    src={SoursURL + 'images/icon-default.png'}
                  />
                )}
              </Box>
              <Typography variant={'h4'} component={'h3'} paddingRight={1}>
                <Typography component={'span'} title={'sell'} className={'next-coin'}>
                  {baseShow}
                </Typography>
                <Typography component={'i'}>/</Typography>
                <Typography component={'span'} title={'buy'}>
                  {quoteShow}
                </Typography>
              </Typography>
              {campaignTagConfig && (
                <TagIconList
                  scenario={SCENARIO.MARKET}
                  campaignTagConfig={campaignTagConfig}
                  symbol={pair}
                />
              )}
              {isNew ? <NewTagIcon /> : undefined}
            </Box>
          </Grid>
          <Grid
            item
            xs={12}
            height={36}
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'flex-start'}
            alignItems={'center'}
            className={'float-group'}
            marginTop={1}
          >
            <Typography variant={'h1'}>
              {close === 'NaN' ? EmptyValueTag : close} {quoteShow}
            </Typography>
            <Box
              display={'flex'}
              flexDirection={'column'}
              alignItems={'flex-start'}
              justifyContent={'center'}
              className={'float-chart'}
            >
              <Typography
                variant={'h5'}
                component={'span'}
                display={'flex'}
                alignItems={'flex-end'}
              >
                <Typography variant={'h5'} component={'span'}>
                  {value}
                </Typography>
                <Typography
                  variant={'h5'}
                  component={'span'}
                  className={`float-tag float-${tradeFloatType}`}
                >
                  （{tradeFloatType === FloatTag.increase ? '+' : ''}
                  {change}）
                </Typography>
              </Typography>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <></>
      )}
    </TradeTitleStyled>
  )
}
