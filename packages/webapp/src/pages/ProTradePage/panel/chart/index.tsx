import React from 'react'
import { bindTrigger } from 'material-ui-popup-state/es';
import { usePopupState, bindPopper } from 'material-ui-popup-state/hooks';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Divider, Box, Typography, Grid, MenuItem, Checkbox, ClickAwayListener } from '@mui/material'
import { ScaleAreaChart, ChartType, testKlineData, MainIndicator, SubIndicator, PopoverPure } from '@loopring-web/component-lib'
import { BreakPoint, KLineFeaturesIcon } from '@loopring-web/common-resources'
import styled from '@emotion/styled'
import { TradingInterval } from 'loopring-sdk'
import { useKlineChart } from './hook';
import { timeIntervalData, SubIndicatorList, chartFearturesList } from './klineConfig'

const ChartWrapperStyled = styled(Box)`
    flex: 1;
    width: 100%;
    // height: 100%;
`

const ChartItemStyled = styled(Typography)`
    cursor: pointer;
`

const formatDateData = testKlineData.map(d => ({
    ...d,
    date: new Date(d.date)
}))

export const ChartView = withTranslation('common')(({market, breakpoint, t, i18n, ...rest}: 
    {
        market: string | undefined;
        breakpoint: BreakPoint;
    } & WithTranslation) => {

    const { candlestickViewData, genCandlestickData } = useKlineChart(market)
    const [timeInterval, setTimeInterval] = React.useState(TradingInterval.d1)
    const [subChart, setSubChart] = React.useState(SubIndicator.VOLUME)
    const [chosenIndicators, setChosenIndicators] = React.useState<string[]>(chartFearturesList.map(o => o.id))

    const handleTimeIntervalChange = React.useCallback((timeInterval: TradingInterval) => {
        setTimeInterval(timeInterval)
        genCandlestickData({market, timeInterval})
    }, [genCandlestickData, market])

    const handleSubChartFeatureClick = React.useCallback((sub: SubIndicator) => {
        setSubChart(sub)
    }, [])

    const popState = usePopupState({variant: 'popover', popupId: `popup-pro-kline-features`})

    return <>
        <Box display={'flex'} flexDirection={'column'} alignItems={'stretch'} height={'100%'}>
            <Box component={'header'} width={'100%'} paddingX={2}>
                <Typography variant={'body1'} lineHeight={'44px'}>{t(`labelProChartTitle`)}</Typography>
            </Box>
            <Divider style={{marginTop: '-1px'}}/>
            <Box width={'100%'} height={'36px'} paddingX={1} paddingY={1} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                <Box display={'flex'} alignItems={'center'}>
                    <Grid container spacing={1} marginRight={1}>
                        {timeIntervalData.map(item => {
                            const { id, i18nKey } = item
                            const isSelected = id === timeInterval
                            return (
                                <Grid key={id} item>
                                    <ChartItemStyled
                                        color={isSelected ? 'var(--color-text-primary)' : 'var(--color-text-third)'}
                                        onClick={() => handleTimeIntervalChange(id)}
                                    >
                                        {t(i18nKey)}
                                    </ChartItemStyled>
                                </Grid>
                            )
                        })}
                        <Grid item>
                            <KLineFeaturesIcon {...bindTrigger(popState)} onClick={(e: any) => {
                                bindTrigger(popState).onClick(e);
                            }} style={{ cursor: 'pointer', marginTop: 2 }} htmlColor={'var(--color-text-third)'} />
                            
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
                                }}>
                                <ClickAwayListener onClickAway={() => popState.setOpen(false)}>
                                    <Box>
                                        {chartFearturesList.map((o) => (
                                            <MenuItem key={o.id} value={o.label}>
                                                <Box width={'9rem'} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                                    <Typography>{o.label}</Typography>
                                                    <Checkbox
                                                        checked={chosenIndicators.includes(o.id)}
                                                        onChange={(event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => checked
                                                            ? setChosenIndicators(prev => [...prev, o.id])
                                                            : setChosenIndicators(prev => prev.filter(indicator => indicator !== o.id))
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
                </Box>
                <Box>
                    
                </Box>
            </Box>
            <Divider style={{marginTop: '-1px'}}/>
            <ChartWrapperStyled>
                <ScaleAreaChart
                    type={ChartType.Kline}
                    data={candlestickViewData}
                    interval={timeInterval}
                    indicator={
                        {
                            mainIndicators: chartFearturesList.filter(o => chosenIndicators.includes(o.id)).map(item => ({
                                indicator: item.id,
                                params: item.params,
                            })),
                            subIndicator: [{ indicator: subChart, params: subChart === SubIndicator.SAR ? { accelerationFactor: 0.02, maxAccelerationFactor: 0.2 } : {} }]
                        }
                    }
                />
            </ChartWrapperStyled>
            <Divider style={{marginTop: '-1px'}}/>
            <Box width={'100%'} height={'36px'} paddingX={1} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                <Grid container spacing={1}>
                    {SubIndicatorList.map(o => {
                        const isSelected = o.id === subChart
                        return (
                            <Grid key={o.id} item>
                                <ChartItemStyled
                                    color={isSelected ? 'var(--color-text-primary)' : 'var(--color-text-third)'}
                                    onClick={() => handleSubChartFeatureClick(o.id)}
                                >
                                    {o.id}
                                </ChartItemStyled>
                            </Grid>
                        )
                    })}
                </Grid>
            </Box>
        </Box>
    </>
})
