import { useCallback, useState, useEffect } from 'react'
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, } from 'recharts'
import moment from 'moment'
import { ScaleAreaChartProps } from '../ScaleAreaChart'
import { getRenderData } from '../data'
import { Box, Typography } from '@material-ui/core'
import styled from '@emotion/styled'
import { useSettings } from '@loopring-web/component-lib/src/stores'

const DEFAULT_YAXIS_DOMAIN = 0.1
const UP_COLOR = '#00BBA8'
const DOWN_COLOR = '#fb3838'

const TooltipStyled = styled(Box)`
    background: rgba(255, 255, 255, 0.1);
    border-radius: ${({theme}) => theme.unit}px;
    padding: ${({theme}) => theme.unit * 2}px ${({theme}) => theme.unit * 3}px;

    >div: last-of-type {
        color: ${({theme}) => theme.colorBase.textSecondary}
    }
`

const TrendChart = ({
                        type,
                        data,
                        yAxisDomainPercent = DEFAULT_YAXIS_DOMAIN,
                        handleMove,
                        riseColor = 'green',
                        showTooltip = true,
                        showArea = true,
                        extraInfo,
                    }: ScaleAreaChartProps) => {
    const userSettings = useSettings()
    const upColor = userSettings ? userSettings.upColor: 'green'
    const renderData = getRenderData(type, data)
    const [priceTrend, setPriceTrend] = useState<'up' | 'down'>(renderData[renderData.length - 1]?.sign === 1 ? 'up' : 'down')
    // current chart xAxis index
    const [currentIndex, setCurrentIndex] = useState(-1)
    
    const trendColor =
        upColor === 'green'
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
        const {timeStamp, close} = props.payload[ 0 ].payload
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
    }, [hasData, extraInfo])

    const handleMouseLeave = useCallback(() => {
        setPriceTrend(renderData[renderData.length - 1]?.sign === 1 ? 'up' : 'down')
    }, [renderData])

    useEffect(() => {
        if (!!renderData.length) {
            setPriceTrend(renderData[renderData.length - 1].sign === 1
                ? 'up'
                : 'down')
        }
    }, [renderData])

    return (
        <ResponsiveContainer debounce={1} width={'99%'}>
            <ComposedChart data={renderData} onMouseMove={showTooltip && handleMousemove} onMouseLeave={handleMouseLeave}>
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
                    hide={true}
                    dataKey="time" /* tickFormatter={convertDate} */
                />
                <YAxis
                    hide={true}
                    domain={[
                        (dataMin: number) => dataMin * (1 - yAxisDomainPercent),
                        (dataMax: number) => dataMax * (1 + yAxisDomainPercent),
                    ]} /* tickFormatter={convertValue} */
                />
                {hasData && showTooltip && (
                    <Tooltip
                        position={{y: 50}}
                        content={(props) => renderTooltipContent(props)}
                    />
                )}
                <Line
                    type="monotone"
                    strokeLinecap="round"
                    strokeWidth={2}
                    dataKey="close"
                    stroke={trendColor}
                    dot={false}
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
