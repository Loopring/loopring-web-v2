import React from 'react'
import { useCallback, useState } from 'react'
// import { ScaleAreaChartProps } from '../ScaleAreaChart'
import { getDepthData } from '../data'
import { Area, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, } from '@loopring-web/recharts'
// import { getValuePrecisionThousand, myLog } from '@loopring-web/common-resources'

const ASKS_COLOR = '#FF5677'
const BIDS_COLOR = '#00BBA8'
const YAXIS_DOMAIN = 0.1

export interface DepthData {
    // timeStamp: number
    bidsPrices: any[]
    bidsAmtTotals: any[]
    asksPrices: any[]
    asksAmtTotals: any[]
}

export interface DepthProps {
    data?: DepthData
    handleMove?: (props: {
        type: 'asks' | 'bids'
        price: number
        amount: number
    }) => void
    yAxisDomainPercent?: number
    // marketPrecision?: number
}

const DepthChart = ({
                        data,
                        handleMove,
                        yAxisDomainPercent = YAXIS_DOMAIN,
                        // marketPrecision = 2,
                    }: DepthProps) => {
    const [currentIndex, setCurrentIndex] = useState(-1)

    const asksColor = ASKS_COLOR
    const bidsColor = BIDS_COLOR

    const hasData = data && Array.isArray(data) && !!data.length

    const renderTooltipContent = useCallback((props) => {
        // no data
        if (!hasData) return ''
        if (props.payload && !!props.payload.length && props.payload[ 0 ].payload) {
            const {payload} = props.payload[ 0 ]
            const {price} = payload
            if (payload.bids) {
                return (
                    <>
                        <div>price: {price}</div>
                        <div>amount: {payload.bids}</div>
                    </>
                )
            }
            if (payload.asks) {
                return (
                    <>
                        <div>price: {price}</div>
                        <div>amount: {payload.asks}</div>
                    </>
                )
            }
        }
        return <span></span>
    }, [hasData])

    const handleMousemove = useCallback(
        (props: any) => {
            // no data
            if (!hasData) return
            const {activeTooltipIndex} = props
            // avoid duplicated event
            const isUpdate = activeTooltipIndex !== currentIndex
            if (Number.isFinite(activeTooltipIndex) && isUpdate) {
                setCurrentIndex(activeTooltipIndex)
                const {payload, name} = props.activePayload[ 0 ]
                if (handleMove) {
                    handleMove({
                        price: payload.price,
                        type: name,
                        amount: payload.bids || payload.asks,
                    })
                }
            }
        },
        [handleMove, currentIndex, hasData]
    )

    const formattedData = getDepthData(data)

    return (
        <ResponsiveContainer width={'99%'}>
            <ComposedChart data={formattedData} onMouseMove={handleMousemove}>
                <defs>
                    <linearGradient id="colorAsks" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={asksColor}
                            stopOpacity={1}
                        />
                        <stop
                            offset="98%"
                            stopColor={asksColor}
                            stopOpacity={0}
                        />
                    </linearGradient>
                    <linearGradient id="colorBids" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor={bidsColor}
                            stopOpacity={1}
                        />
                        <stop
                            offset="98%"
                            stopColor={bidsColor}
                            stopOpacity={0}
                        />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="price"
                    // hide={true}
                    type="category"
                    allowDuplicatedCategory
                />
                <YAxis
                    // hide={true}
                    orientation={'right'}
                    // tickFormatter={(value) => formatYAxisTicker(value)}
                    domain={[
                        (dataMin: number) => dataMin * (1 - yAxisDomainPercent),
                        (dataMax: number) => dataMax * (1 + yAxisDomainPercent),
                    ]}
                />
                {hasData && (
                    <Tooltip
                        position={{y: 50}}
                        content={(props) => renderTooltipContent(props)}
                    />
                )}
                <Line
                    type="step"
                    dataKey="asks"
                    stroke={asksColor}
                    dot={false}
                    animationDuration={500}
                    isAnimationActive={false}
                />
                <Line
                    type="step"
                    dataKey="bids"
                    stroke={bidsColor}
                    dot={false}
                    animationDuration={500}
                    isAnimationActive={false}
                />
                <Area
                    type="step"
                    dataKey="asks"
                    stroke="false"
                    fill="url(#colorAsks)"
                    animationDuration={500}
                    isAnimationActive={false}
                />
                <Area
                    type="step"
                    dataKey="bids"
                    stroke="false"
                    fill="url(#colorBids)"
                    animationDuration={500}
                    isAnimationActive={false}
                />
            </ComposedChart>
        </ResponsiveContainer>
    )
}

export default DepthChart
