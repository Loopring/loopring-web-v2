import React from 'react'
import { bindTrigger } from 'material-ui-popup-state/es'
import { bindPopper, usePopupState } from 'material-ui-popup-state/hooks'
import { withTranslation, WithTranslation } from 'react-i18next'
import {
  Box,
  Checkbox,
  ClickAwayListener,
  Divider,
  Grid,
  MenuItem,
  Typography,
} from '@mui/material'
import { ChartType, PopoverPure, ScaleAreaChart, SubIndicator } from '@loopring-web/component-lib'
import {
  depth2ViewData,
  DepthViewData,
  KLineFeaturesIcon,
  MarketType,
} from '@loopring-web/common-resources'
import styled from '@emotion/styled'
import { usePageTradePro, useTokenMap } from '@loopring-web/core'

import { useKlineChart } from './hook'
import { chartFearturesList, SubIndicatorList, timeIntervalData } from './klineConfig'
import { cloneDeepWith } from 'lodash'
import * as sdk from '@loopring-web/loopring-sdk'

const ChartItemStyled = styled(Typography)`
  //font-size: 1.2em;
  cursor: pointer;
  margin-top: 1px;
`

export const ChartView = withTranslation('common')(
  ({
    market,
    rowLength,
    t,
    i18n,
    isShowDepth = true,
    ...rest
  }: {
    market?: MarketType
    rowLength: number
    isShowDepth?: boolean
  } & WithTranslation) => {
    const { candlestickViewData, timeInterval, handleTimeIntervalChange } = useKlineChart(market)
    const [subChart, setSubChart] = React.useState(SubIndicator.VOLUME)
    const [chosenIndicators, setChosenIndicators] = React.useState<string[]>(
      chartFearturesList.map((o) => o.id),
    )
    const [chosenChart, setChosenChart] = React.useState(
      !isShowDepth ? ChartType.Kline : ChartType.Kline,
    )

    const [depthViewData, setDepthViewData] = React.useState<{
      asks: DepthViewData[]
      bids: DepthViewData[]
    }>({
      asks: [],
      bids: [],
    })

    // @ts-ignore
    const [, baseSymbol, quoteSymbol] = market.match(/(\w+)-(\w+)/i)

    const { pageTradePro } = usePageTradePro()
    const { marketMap, tokenMap } = useTokenMap()

    const isKline = chosenChart === ChartType.Kline
    const precisionForPrice = marketMap[market || '']?.precisionForPrice

    const rebuildList = React.useCallback(() => {
      const depth = pageTradePro.depth
      if (depth && (depth.bids.length || depth.asks.length)) {
        const baseDecimal = tokenMap[baseSymbol]?.decimals
        const quoteDecimal = tokenMap[baseSymbol]?.decimals
        // const precisionForPrice = marketMap[ (market || '') ]?.precisionForPrice;
        //@ts-ignore
        const basePrecision = tokenMap[baseSymbol].precisionForOrder
        let [countAsk, countBid] = [rowLength, rowLength]
        // if (depthType === DepthShowType.bids) {
        //     [countAsk, countBid] = [0, rowLength * 2]
        // } else if (depthType === DepthShowType.asks) {
        //     [countAsk, countBid] = [rowLength * 2, 0]
        // } else {
        // }
        const viewData = depth2ViewData({
          depth,
          countAsk: countAsk,
          countBid: countBid,
          baseDecimal,
          quoteDecimal,
          precisionForPrice,
          basePrecision,
        })
        setDepthViewData(viewData)
      }
    }, [pageTradePro.depth, tokenMap, baseSymbol, rowLength, precisionForPrice])

    React.useEffect(() => {
      rebuildList()
    }, [rebuildList, pageTradePro.depth, tokenMap, baseSymbol, marketMap, market, rowLength])

    const getTrendData = React.useCallback(() => {
      const originalData = cloneDeepWith(depthViewData)
      const formattedData = {
        bidsPrices: originalData.bids.map((o) => o.price).reverse(),
        bidsAmtTotals: originalData.bids
          .map((o) => Number(o.amtTotalForShow.replaceAll(sdk.SEP, '')))
          .reverse(),
        asksPrices: originalData.asks.map((o) => o.price).reverse(),
        asksAmtTotals: originalData.asks
          .map((o) => Number(o.amtTotalForShow.replaceAll(sdk.SEP, '')))
          .reverse(),
      }
      return formattedData
    }, [depthViewData])

    const handleSubChartFeatureClick = React.useCallback((sub: SubIndicator) => {
      setSubChart(sub)
    }, [])

    const handleChartTypeChange = React.useCallback((chartType: ChartType) => {
      setChosenChart(chartType)
    }, [])

    const popState = usePopupState({
      variant: 'popover',
      popupId: `popup-pro-kline-features`,
    })

    return (
      <>
        <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'} height={'100%'}>
          <Box component={'header'} width={'100%'} paddingX={2}>
            <Typography variant={'body1'} lineHeight={'44px'}>
              {t(`labelProChartTitle`)}
            </Typography>
          </Box>
          <Divider style={{ marginTop: '-1px' }} />
          <Box
            width={'100%'}
            height={'36px'}
            paddingX={1}
            paddingY={1}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Box display={'flex'} alignItems={'center'} style={{ overflowX: 'auto' }}>
              {isKline && (
                <Grid container spacing={1} marginRight={1} minWidth={296}>
                  {timeIntervalData.map((item) => {
                    const { id, i18nKey } = item
                    const isSelected = id === timeInterval
                    return (
                      <Grid key={id} item>
                        <ChartItemStyled
                          variant={'body2'}
                          color={
                            isSelected ? 'var(--color-text-primary)' : 'var(--color-text-third)'
                          }
                          onClick={() => handleTimeIntervalChange(id)}
                        >
                          {t(i18nKey)}
                        </ChartItemStyled>
                      </Grid>
                    )
                  })}
                  <Grid item>
                    <KLineFeaturesIcon
                      {...bindTrigger(popState)}
                      onClick={(e: any) => {
                        bindTrigger(popState).onClick(e)
                      }}
                      style={{ cursor: 'pointer', marginTop: 2 }}
                      htmlColor={'var(--color-text-third)'}
                    />

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
                      }}
                    >
                      <ClickAwayListener onClickAway={() => popState.setOpen(false)}>
                        <Box>
                          {chartFearturesList.map((o) => (
                            <MenuItem key={o.id} value={o.label}>
                              <Box
                                width={'9rem'}
                                display={'flex'}
                                justifyContent={'space-between'}
                                alignItems={'center'}
                              >
                                <Typography>{o.label}</Typography>
                                <Checkbox
                                  checked={chosenIndicators.includes(o.id)}
                                  onChange={(
                                    event: React.ChangeEvent<HTMLInputElement>,
                                    checked: boolean,
                                  ) =>
                                    checked
                                      ? setChosenIndicators((prev) => [...prev, o.id])
                                      : setChosenIndicators((prev) =>
                                          prev.filter((indicator) => indicator !== o.id),
                                        )
                                  }
                                />
                              </Box>
                            </MenuItem>
                          ))}
                        </Box>
                      </ClickAwayListener>
                    </PopoverPure>
                  </Grid>
                </Grid>
              )}
            </Box>
            {isShowDepth ? (
              <Box style={{ overflowX: 'auto' }}>
                <Grid container spacing={2} minWidth={160}>
                  <Grid item onClick={() => handleChartTypeChange(ChartType.Kline)}>
                    <ChartItemStyled
                      style={{ fontSize: 14 }}
                      color={isKline ? 'var(--color-text-primary)' : 'var(--color-text-third)'}
                    >
                      {t('labelProChartTradingView')}
                    </ChartItemStyled>
                  </Grid>
                  <Grid item onClick={() => handleChartTypeChange(ChartType.Depth)}>
                    <ChartItemStyled
                      style={{ fontSize: 14 }}
                      color={!isKline ? 'var(--color-text-primary)' : 'var(--color-text-third)'}
                    >
                      {t('labelProChartDepth')}
                    </ChartItemStyled>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <></>
            )}
          </Box>
          <Divider style={{ marginTop: '-1px' }} />
          <Box flex={1} width={'100%'}>
            <ScaleAreaChart
              type={isKline ? ChartType.Kline : ChartType.Depth}
              data={isKline ? candlestickViewData : getTrendData()}
              interval={isKline ? timeInterval : undefined}
              marketPrecision={precisionForPrice}
              indicator={
                isKline
                  ? {
                      mainIndicators: chartFearturesList
                        .filter((o) => chosenIndicators.includes(o.id))
                        .map((item) => ({
                          indicator: item.id,
                          params: item.params,
                        })),
                      subIndicator: [
                        {
                          indicator: subChart,
                          params:
                            subChart === SubIndicator.SAR
                              ? {
                                  accelerationFactor: 0.02,
                                  maxAccelerationFactor: 0.2,
                                }
                              : {},
                        },
                      ],
                    }
                  : undefined
              }
            />
          </Box>
          {isKline && (
            <>
              <Divider style={{ marginTop: '-1px' }} />
              <Box
                width={'100%'}
                height={'36px'}
                paddingX={1}
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <Grid container spacing={1}>
                  {SubIndicatorList.map((o) => {
                    const isSelected = o.id === subChart
                    return (
                      <Grid key={o.id} item>
                        <ChartItemStyled
                          color={
                            isSelected ? 'var(--color-text-primary)' : 'var(--color-text-third)'
                          }
                          onClick={() => handleSubChartFeatureClick(o.id)}
                        >
                          {o.id}
                        </ChartItemStyled>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            </>
          )}
        </Box>
      </>
    )
  },
)
