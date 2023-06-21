import { Box, BoxProps, Divider, Grid, Typography } from '@mui/material'
import {
  ChartType,
  floatTag,
  PopoverPure,
  ScaleAreaChart,
  StyledProps,
  useSettings,
  AmmPairDetail,
  CoinIcons,
  LoadingBlock,
  ToastType,
  EmptyDefault,
} from '@loopring-web/component-lib'
import {
  AmmHistoryItem,
  CurrencyToTag,
  CustomError,
  EmptyValueTag,
  FloatTag,
  getValuePrecisionThousand,
  myLog,
  PriceTag,
  SDK_ERROR_MAP_TO_UI,
  SoursURL,
  TokenType,
  UIERROR_CODE,
  UpColor,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import { useAmmMap, useSystem, useTicker, useTokenMap, useUserRewards } from '../../../stores'
import { BoxWrapperStyled } from './ammPanel'
import { bindHover, bindPopper } from 'material-ui-popup-state'
import { usePopupState } from 'material-ui-popup-state/hooks'
import styled from '@emotion/styled'
import React from 'react'
import { LoopringAPI } from '../../../api_wrapper'
import { TradingInterval } from '@loopring-web/loopring-sdk'
import * as sdk from '@loopring-web/loopring-sdk'
import moment from 'moment'
import _ from 'lodash'

const BoxStyle = styled(Box)<StyledProps & BoxProps>`
  ${({ theme, custom }) => floatTag({ theme, custom })};
` as (props: StyledProps & BoxProps) => JSX.Element

export const ChartAndInfoPanel = ({
  setToastOpen,
  market,
}: // myAmm,
{
  market: string
  setToastOpen: (props: { open: boolean; content: JSX.Element | string; type: ToastType }) => void
}) => {
  const { t } = useTranslation('common')
  const { ammMap } = useAmmMap()
  const { tokenMap } = useTokenMap()
  const { tickerMap } = useTicker()
  const ammInfo = ammMap['AMM-' + market]
  const { myAmmLPMap } = useUserRewards()
  const [pairHistory, setPairHistory] = React.useState<AmmHistoryItem[] | undefined>([])
  const getPairList = React.useCallback(async () => {
    if (LoopringAPI.exchangeAPI) {
      try {
        const response = await LoopringAPI.exchangeAPI.getMixCandlestick({
          market,
          interval: TradingInterval.d1,
          limit: 30,
        })
        if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
          // myLog("getMixCandlestick", response);
          throw new CustomError(
            // @ts-ignore
            SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? UIERROR_CODE.UNKNOWN],
          )
        }
        const formattedPairHistory = response.candlesticks
          .map((o) => ({
            ...o,
            timeStamp: o.timestamp,
            date: moment(o.timestamp).format('MMM DD'),
          }))
          .sort((a, b) => a.timeStamp - b.timeStamp)
        setPairHistory(formattedPairHistory)
      } catch (error: any) {
        setPairHistory(undefined)
        setToastOpen({
          open: true,
          type: ToastType.error,
          content: t('labelAMMChartFailed') + error?.message,
        })
        myLog('getMixCandlestick', 'timeout', error)
      }
    }
  }, [market])
  const myAmm = myAmmLPMap && myAmmLPMap[market ?? '']

  const popState = usePopupState({
    variant: 'popover',
    popupId: `popup-My-LP`,
  })
  const { upColor, coinJson, currency } = useSettings()
  const { forexMap } = useSystem()
  const precisionA = tokenMap[ammInfo?.coinA ?? '']?.precision
  const precisionB = tokenMap[ammInfo?.coinB ?? '']?.precision
  const ticker = tickerMap[market]
  const { balanceAStr, balanceBStr, balanceU: myBalanceDollar } = myAmm ?? {}
  const tradeFloatType =
    ticker?.changeU === 0 || !ticker?.changeU
      ? FloatTag.none
      : ticker.changeU < 0
      ? FloatTag.decrease
      : FloatTag.increase
  React.useEffect(() => {
    const timer = _.delay(getPairList, 0)
    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <BoxStyle
      custom={{ chg: upColor as UpColor }}
      flex={1}
      marginTop={3}
      display={'flex'}
      flexDirection={'column'}
    >
      {ammInfo.market ? (
        <>
          <Box
            width={'100%'}
            // height={"60%"}
            height={'calc(var(--swap-box-height) - 262px)'}
            maxHeight={420}
          >
            {pairHistory?.length ? (
              <ScaleAreaChart
                type={ChartType.Trend}
                data={pairHistory}
                quoteSymbol={ammInfo.coinB}
                showXAxis
              />
            ) : pairHistory == undefined || pairHistory?.length == 0 ? (
              <Box
                flex={1}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'center'}
                height={'90%'}
              >
                <EmptyDefault
                  message={() => {
                    return t('labelAMMChartFailed')
                  }}
                />
              </Box>
            ) : (
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
            )}
          </Box>
          <BoxWrapperStyled
            container
            className={'MuiPaper-elevation2'}
            display={'flex'}
            alignItems={'center'}
            margin={2}
            width={'auto'}
            spacing={2}
          >
            <Grid
              item
              // paddingLeft={2}
              // paddingY={3}
              xs={12}
              md={6}
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <Box>
                <Box
                  display={'flex'}
                  flexDirection={'column'}
                  alignItems={'flex-start'}
                  justifyContent={'center'}
                  className={'float-chart float-group'}
                >
                  <Typography
                    variant={'h5'}
                    component={'span'}
                    className={`float-tag float-${tradeFloatType}`}
                  >
                    {ticker?.change === 0 || typeof ticker?.change === 'undefined'
                      ? EmptyValueTag
                      : (tradeFloatType === FloatTag.increase ? '+' : '') +
                        getValuePrecisionThousand(ticker?.change, 2, 2, 2, true) +
                        '%'}
                  </Typography>
                </Box>
                <Typography
                  component={'span'}
                  display={'flex'}
                  flexDirection={'row'}
                  justifyContent={'flex-start'}
                  alignItems={'center'}
                  style={{ textTransform: 'capitalize' }}
                  color={'textPrimary'}
                  marginTop={1}
                >
                  <Box
                    component={'span'}
                    className={'logo-icon'}
                    display={'flex'}
                    height={'var(--list-menu-coin-size)'}
                    width={'var(--list-menu-coin-size)'}
                    alignItems={'center'}
                    justifyContent={'center'}
                  >
                    <CoinIcons type={TokenType.single} tokenIcon={[coinJson[ammInfo.coinA]]} />
                  </Box>
                  <Typography marginLeft={1 / 2} justifyContent={'center'} display={'flex'}>
                    <Typography
                      component={'span'}
                      alignSelf={'right'}
                      variant={'h5'}
                      height={24}
                      lineHeight={'24px'}
                    >
                      {getValuePrecisionThousand(ammInfo.totalA, precisionA, precisionA)}
                    </Typography>
                    <Typography
                      component={'span'}
                      variant={'h5'}
                      marginLeft={1}
                      alignSelf={'right'}
                      height={24}
                      lineHeight={'24px'}
                    >
                      {ammInfo.coinA}
                    </Typography>
                  </Typography>
                </Typography>
                <Typography
                  component={'span'}
                  display={'flex'}
                  flexDirection={'row'}
                  justifyContent={'flex-start'}
                  alignItems={'center'}
                  marginTop={1}
                  style={{ textTransform: 'capitalize' }}
                >
                  <Box
                    component={'span'}
                    className={'logo-icon'}
                    display={'flex'}
                    height={'var(--list-menu-coin-size)'}
                    width={'var(--list-menu-coin-size)'}
                    alignItems={'center'}
                    justifyContent={'center'}
                  >
                    <CoinIcons type={TokenType.single} tokenIcon={[coinJson[ammInfo.coinB]]} />
                  </Box>
                  <Typography marginLeft={1 / 2} justifyContent={'center'} display={'flex'}>
                    <Typography
                      variant={'h5'}
                      component={'span'}
                      alignSelf={'right'}
                      height={24}
                      lineHeight={'24px'}
                    >
                      {getValuePrecisionThousand(ammInfo.totalB, precisionB, precisionB)}
                    </Typography>
                    <Typography
                      variant={'h5'}
                      component={'span'}
                      marginLeft={1}
                      alignSelf={'right'}
                      height={24}
                      lineHeight={'24px'}
                    >
                      {ammInfo.coinB}
                    </Typography>
                  </Typography>
                </Typography>
              </Box>
              <Divider className={'divider-item'} orientation={'vertical'} />
            </Grid>

            <Grid item paddingX={2} paddingY={3} xs={12} md={6}>
              <Typography
                display={'inline-flex'}
                component={'p'}
                marginTop={1}
                justifyContent={'space-between'}
                width={'100%'}
              >
                <Typography
                  component={'span'}
                  color={'var(--color-text-third)'}
                  display={'flex'}
                  title={'Total Volume Locked'}
                >
                  {t('labelTVL')}
                </Typography>
                <Typography variant={'body1'} component={'span'}>
                  {typeof ammInfo.amountU === 'undefined'
                    ? EmptyValueTag
                    : PriceTag[CurrencyToTag[currency]] +
                      getValuePrecisionThousand(
                        sdk.toBig(ammInfo.amountU ?? 0).times(forexMap[currency] ?? 0),
                        undefined,
                        undefined,
                        2,
                        true,
                        { isFait: true, floor: true, isAbbreviate: true },
                      )}
                </Typography>
              </Typography>

              <Typography
                display={'inline-flex'}
                component={'p'}
                marginTop={1}
                justifyContent={'space-between'}
                width={'100%'}
              >
                <Typography component={'span'} color={'var(--color-text-third)'} display={'flex'}>
                  {t('label24Volume')}
                </Typography>
                <Typography variant={'body1'} component={'span'}>
                  {ticker?.priceU
                    ? PriceTag[CurrencyToTag[currency]] +
                      getValuePrecisionThousand(
                        sdk.toBig(ticker?.priceU ?? 0).times(forexMap[currency] ?? 0),
                        undefined,
                        undefined,
                        undefined,
                        true,
                        {
                          isFait: true,
                          floor: false,
                          isAbbreviate: true,
                          abbreviate: 6,
                        },
                      )
                    : EmptyValueTag}
                </Typography>
              </Typography>

              <Typography
                display={'inline-flex'}
                component={'p'}
                marginTop={1}
                justifyContent={'space-between'}
                width={'100%'}
              >
                <Typography component={'span'} color={'var(--color-text-third)'} display={'flex'}>
                  {t('labelAPR')}
                </Typography>
                <Typography variant={'body1'} component={'span'}>
                  {ammInfo.APR
                    ? getValuePrecisionThousand(ammInfo.APR, 2, 2, undefined, true) + '%'
                    : EmptyValueTag}
                </Typography>
              </Typography>

              <Typography
                display={'inline-flex'}
                component={'p'}
                marginTop={1}
                justifyContent={'space-between'}
                width={'100%'}
              >
                <Typography component={'span'} color={'var(--color-text-third)'} display={'flex'}>
                  {t('labelMe')}
                </Typography>
                {typeof myBalanceDollar === 'undefined' ? (
                  <Typography component={'span'}>{EmptyValueTag}</Typography>
                ) : (
                  <Typography
                    component={'span'}
                    {...bindHover(popState)}
                    style={{
                      cursor: 'pointer',
                      textDecoration: 'underline dotted',
                    }}
                  >
                    {PriceTag[CurrencyToTag[currency]] +
                      getValuePrecisionThousand(
                        (myBalanceDollar || 0) * (forexMap[currency] ?? 0),
                        undefined,
                        undefined,
                        2,
                        true,
                        { isFait: true, floor: true },
                      )}
                  </Typography>
                )}
                <PopoverPure
                  className={'arrow-top-center'}
                  {...bindPopper(popState)}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                  }}
                >
                  <AmmPairDetail
                    coinA={ammInfo.coinA}
                    coinB={ammInfo.coinB}
                    balanceA={balanceAStr}
                    balanceB={balanceBStr}
                  />
                </PopoverPure>
              </Typography>
            </Grid>
          </BoxWrapperStyled>
        </>
      ) : (
        <LoadingBlock />
      )}
    </BoxStyle>
  )
}
