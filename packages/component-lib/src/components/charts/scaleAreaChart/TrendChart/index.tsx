import { useCallback, useState } from 'react'
import { useDeepCompareEffect } from 'react-use';
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, } from '@loopring-web/recharts'
import moment from 'moment'
import { ScaleAreaChartProps } from '../ScaleAreaChart'
import { getRenderData } from '../data'
import { Box, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { useSettings } from '@loopring-web/component-lib/src/stores'
import { getValuePrecisionThousand, myLog } from '@loopring-web/common-resources';

const DEFAULT_YAXIS_DOMAIN = 0.05
const UP_COLOR = '#00BBA8'
const DOWN_COLOR = '#fb3838'
const DAILY_TREND_COLOR = '#4169ff'

const TooltipStyled = styled(Box)`
  background: var(--color-pop-bg);
  border: 1px solid var(--color-border);
  border-radius: ${({theme}) => theme.unit * 0.25}px;
  padding: ${({theme}) => theme.unit * 2}px ${({theme}) => theme.unit * 2}px;

  > div:last-of-type {
    color: var(--color-text-secondary)
  }
`
// const CustomCursor = (props:any) => {
//     return <Cross {...props} />;
// };
const TrendChart = ({
                        type,
                        data,
                        yAxisDomainPercent = DEFAULT_YAXIS_DOMAIN,
                        handleMove,
                        showTooltip = true,
                        showArea = true,
                        extraInfo,
                        showXAxis = false,
                        isHeadTailCompare = false,
                        isDailyTrend = false,
                        handleMoveOut = undefined,
                    }: ScaleAreaChartProps) => {
    const userSettings = useSettings()
    const upColor = userSettings ? userSettings.upColor : 'green'
    const renderData = getRenderData(type, data)
    const [priceTrend, setPriceTrend] = useState<'up' | 'down'>(renderData[ renderData.length - 1 ]?.sign === 1 ? 'up' : 'down')
    // current chart xAxis index
    const [currentIndex, setCurrentIndex] = useState(-1)

    const trendColor = upColor === 'green'
            ? priceTrend === 'up'
                ? UP_COLOR
                : DOWN_COLOR
            : priceTrend === 'up'
                ? DOWN_COLOR
                : UP_COLOR
    const hasData = data && Array.isArray(data) && !!data.length

    const handleMousemove = useCallback(
        (props: any) => {
            if (!hasData) return
            const {activeTooltipIndex} = props

            // avoid duplicated event
            const isUpdate = activeTooltipIndex !== currentIndex
            if (Number.isFinite(activeTooltipIndex) && isUpdate) {
                setCurrentIndex(activeTooltipIndex)
                if (
                    renderData[ activeTooltipIndex ] &&
                    renderData[ activeTooltipIndex ].sign
                ) {
                    setPriceTrend(
                        renderData[ activeTooltipIndex ].sign === 1
                            ? 'up'
                            : 'down'
                    )
                }
                if (handleMove) {
                    handleMove(renderData[ activeTooltipIndex ])
                }
            }
        },
        [renderData, handleMove, currentIndex, hasData]
    )

    const renderTooltipContent = useCallback((props: any) => {
        if (!hasData) return
        if (
            !props.payload ||
            !props.payload.length ||
            !props.payload[ 0 ].payload.timeStamp
        )
            return <span></span>
        const {timeStamp, close, sign} = props.payload[ 0 ].payload
        if (isDailyTrend) {
            const index = data.findIndex((o: any) => o.timeStamp === timeStamp)
            const change = index === 0 ? '--' : (((close - data[index - 1].close) / data[index - 1].close) * 100).toFixed(2)
            return (
                <TooltipStyled>
                    {/* {extraInfo && (
                        <Typography component={'div'} fontSize={16}>{`${close} ${extraInfo}`}</Typography>
                    )} */}
                    <Typography component={'div'} variant={'body1'}>
                        {moment(timeStamp).format('MMM DD [UTC]Z')}
                    </Typography>
                    <Box display={'flex'} >
                        <Typography component={'span'} variant={'body1'}>
                            Change: 
                        </Typography>
                        <Typography color={sign !== 1 
                            ? upColor === 'green' 
                                ? DOWN_COLOR 
                                : UP_COLOR 
                            : upColor === 'green' 
                                ? UP_COLOR
                                : DOWN_COLOR }>&nbsp;{change} %</Typography>
                    </Box>
                </TooltipStyled>
            )
        } else {
            return (
                <TooltipStyled>
                    {extraInfo && (
                        <Typography component={'div'} fontSize={16}>{`${close} ${extraInfo}`}</Typography>
                    )}
                    <Typography component={'div'} fontSize={12}>
                        {moment(timeStamp).format('HH:mm MMM DD [UTC]Z')}
                    </Typography>
                </TooltipStyled>
            )
        }
    }, [hasData, extraInfo])

    const handleMouseLeave = useCallback(() => {
        if (handleMoveOut) {
            handleMoveOut()
        }
        setPriceTrend(renderData[ renderData.length - 1 ]?.sign === 1 ? 'up' : 'down')
    }, [renderData, handleMoveOut])

    useDeepCompareEffect(() => {
        if (!isHeadTailCompare && renderData && !!renderData.length) {
            setPriceTrend(renderData[ renderData.length - 1 ].sign === 1
                ? 'up'
                : 'down')
        }
        if (isHeadTailCompare) {
            const isUp = (renderData[0]?.close || 0) < (renderData[ renderData.length - 1 ]?.close || 0)
            setPriceTrend(isUp ? 'up' : 'down')
        }
    }, [renderData])

    const customTick = ({x, y, payload}: any) => {
        if (!renderData || !renderData.length) {
            return <span></span>
        }
        return (
            <g transform={`translate(${x}, ${y})`}>
                <text x={0} y={0} dy={16} fontSize={12} textAnchor="start" fill="#A1A7BB">
                    {payload.value}
                </text>
            </g>
        )
    }

    const customYAxisTick = (value: any) => {
        const formattedValue = getValuePrecisionThousand(value)
        return formattedValue ?? '0.00'
    }

    return (
        <ResponsiveContainer debounce={100} width={'99%'}>
            <ComposedChart margin={{ left: -20, right: 10 }} data={renderData} onMouseMove={showTooltip && handleMousemove}
                        onMouseLeave={showTooltip && handleMouseLeave}>
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        {/* <stop offset="5%" stopColor="rgba(1, 187, 168, 0.4)" stopOpacity={0.8}/> */}
                        <stop
                            offset="5%"
                            stopColor={trendColor}
                            stopOpacity={0.3}
                        />
                        <stop
                            offset="90%"
                            stopColor={trendColor}
                            stopOpacity={0}
                        />
                    </linearGradient>
                </defs>
                <XAxis
                    hide={!showXAxis && !isDailyTrend}
                    dataKey="timeStamp" /* tickFormatter={convertDate} */
                    interval={isDailyTrend ? 10 : 8}
                    axisLine={isDailyTrend}
                    tickLine={isDailyTrend}
                    tick={customTick}
                />
                <YAxis
                    hide={!isDailyTrend}
                    tickFormatter={isDailyTrend ? customYAxisTick : undefined}
                    domain={[
                        (dataMin: number) => dataMin * (1 - yAxisDomainPercent),
                        (dataMax: number) => dataMax * (1 + yAxisDomainPercent),
                    ]} /* tickFormatter={convertValue} */
                />
                {hasData && showTooltip && (
                    <Tooltip
                        cursor={{stroke: '#808080', strokeDasharray: '5 5'}}
                        //  cursor={<CustomCursor/>}
                        position={{y: 50}}
                        content={(props) => renderTooltipContent(props)}
                    />
                )}
                <Line
                    type="monotone"
                    strokeLinecap="round"
                    strokeWidth={2}
                    dataKey="close"
                    stroke={isDailyTrend ? DAILY_TREND_COLOR : trendColor}
                    dot={isDailyTrend}
                    legendType="none"
                    isAnimationActive={false}
                />
                {showArea && (
                    <Area
                        type="monotone"
                        dataKey="close"
                        stroke="false"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorUv)"
                        isAnimationActive={false}
                    />
                )}
            </ComposedChart>
        </ResponsiveContainer>
    )
}

export default TrendChart
