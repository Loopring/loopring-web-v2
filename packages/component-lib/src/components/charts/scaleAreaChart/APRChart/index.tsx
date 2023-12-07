import React from 'react'
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from '@loopring-web/recharts'
import moment from 'moment'
import { getAprRenderData } from '../data'
import { Box, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { DAT_STRING_FORMAT, DAT_STRING_FORMAT_S } from '@loopring-web/common-resources'
import { ChartType } from '../../constant'
import { IndicatorProps } from '../KlineChart'
import * as sdk from '@loopring-web/loopring-sdk'
import { useTheme } from '@emotion/react'
// import { getValuePrecisionThousand, myLog } from '@loopring-web/common-resources';

const DEFAULT_YAXIS_DOMAIN = 0.01

const TooltipStyled = styled(Box)`
  background: var(--color-pop-bg);
  border: 1px solid var(--color-border);
  border-radius: ${({ theme }) => theme.unit * 0.25}px;
  padding: ${({ theme }) => theme.unit * 2}px ${({ theme }) => theme.unit * 2}px;

  > div:last-of-type {
    color: var(--color-text-secondary);
  }
`

const TrendAprChart = ({
  type,
  data,
  yAxisDomainPercent = DEFAULT_YAXIS_DOMAIN,
  handleMove,
  showTooltip = true,
  showArea = true,
  showXAxis = false,
}: // isHeadTailCompare = false,
// isDailyTrend = false,
// handleMoveOut = undefined,
{
  type: ChartType
  data: { apy: string; createdAt: number }[]
  indicator?: IndicatorProps
  interval?: sdk.TradingInterval
  handleMove?: (props: any) => void
  yAxisDomainPercent?: number
  riseColor?: 'green' | 'red'
  showTooltip?: boolean
  showArea?: boolean
  showXAxis?: boolean
}) => {
  const theme = useTheme()
  const renderData = getAprRenderData(type, data)
  const trendColor = theme.colorBase.primary
  // current chart xAxis index
  const [currentIndex, setCurrentIndex] = React.useState(-1)

  const hasData = data && Array.isArray(data) && !!data.length

  const handleMousemove = React.useCallback(
    (props: any) => {
      if (!hasData) return
      const { activeTooltipIndex } = props
      // avoid duplicated event
      const isUpdate = activeTooltipIndex !== currentIndex
      if (Number.isFinite(activeTooltipIndex) && isUpdate) {
        setCurrentIndex(activeTooltipIndex)
        if (handleMove) {
          handleMove(renderData[activeTooltipIndex])
        }
      }
    },
    [renderData, handleMove, currentIndex, hasData],
  )

  const renderTooltipContent = React.useCallback(
    (props: any) => {
      if (!hasData) return
      if (!props.payload || !props.payload.length || !props.payload[0].payload.createdAt)
        return <span></span>
      const { createdAt, apy } = props.payload[0].payload
      // const index = data.findIndex((o: any) => o.createdAt === createdAt)
      return (
        <TooltipStyled>
          <Typography display={'inline-flex'} variant={'body1'}>
            <Typography component={'span'} variant={'inherit'} color={'textSecondary'}>
              Apr:
            </Typography>
            <Typography component={'span'} variant={'inherit'} color={'textPrimary'}>
              &nbsp;{`+${apy}`} %
            </Typography>
          </Typography>
          <Typography component={'div'} variant={'body2'} color={'var(--color-text-third)'}>
            {moment(createdAt).format(DAT_STRING_FORMAT)}
          </Typography>
        </TooltipStyled>
      )
    },
    [hasData, data],
  )

  const customTick = ({ x, y, payload }: any) => {
    if (!renderData || !renderData.length) {
      return <span></span>
    }
    return (
      <g transform={`translate(${x}, ${y})`}>
        <text x={0} y={0} dy={16} fontSize={12} textAnchor='end' fill={theme.colorBase.textThird}>
          {moment(payload.value).format(DAT_STRING_FORMAT_S)}
        </text>
      </g>
    )
  }

  const getDynamicYAxisDomain = React.useCallback(() => {
    const valueList = renderData.map((o) => Number(o.apy))
    const min = Math.min(...valueList)
    const max = Math.max(...valueList)
    if (min / max < 0.1) {
      return [(dataMin: number) => dataMin * 0.1, (dataMax: number) => dataMax * 2.5]
    }
    if (min / max < 0.5) {
      return [(dataMin: number) => dataMin * 0.5, (dataMax: number) => dataMax * 1.2]
    }
    return [
      (dataMin: number) => dataMin * (1 - yAxisDomainPercent),
      (dataMax: number) => dataMax * (1 + yAxisDomainPercent),
    ]
  }, [renderData, yAxisDomainPercent])

  // const customYAxisTick = (value: any) => {
  //     const formattedValue = getValuePrecisionThousand((Number.isFinite(value) ? value : Number(value || 0)).toFixed(2), undefined, undefined, 2)
  //     return formattedValue ?? '0.00'
  // }

  return (
    <ResponsiveContainer debounce={100} width={'99%'}>
      <ComposedChart
        margin={{ left: 5, right: 16 }}
        data={renderData}
        onMouseMove={showTooltip && handleMousemove}
        // onMouseLeave={showTooltip && handleMouseLeave}
      >
        <defs>
          <linearGradient id='colorUv' x1='0' y1='0' x2='0' y2='1'>
            {/* <stop offset="5%" stopColor="rgba(1, 187, 168, 0.4)" stopOpacity={0.8}/> */}
            <stop offset='5%' stopColor={trendColor} stopOpacity={0.4} />
            <stop offset='90%' stopColor={trendColor} stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis
          reversed={true}
          hide={!showXAxis}
          dataKey={'createdAt'}
          interval={30}
          axisLine={true}
          tickLine={true}
          tick={customTick}
          stroke={theme.colorBase.textThird}
        />
        <YAxis
          dataKey='apy'
          orientation={'right'}
          hide={false}
          axisLine={true}
          tickLine={true}
          width={1}
          label={{
            value: 'APR %',
            fontSize: 12,
            fill: theme.colorBase.textThird,
            position: 'insideTopRight',
          }}
          tick={{ fill: theme.colorBase.textThird, fontSize: 12, left: -5 }}
          // tickFormatter={(value, index) => (index == 0 ? '' : value + '%')}
          domain={[0, 'auto']}
          /* tickFormatter={convertValue} */
          stroke={theme.colorBase.textThird}
        />
        {hasData && showTooltip && (
          <Tooltip
            cursor={{ stroke: '#808080', strokeDasharray: '5 5' }}
            //  cursor={<CustomCursor/>}
            position={{ y: 50 }}
            content={(props) => renderTooltipContent(props)}
          />
        )}
        <Line
          type='monotone'
          strokeLinecap='round'
          strokeWidth={2}
          dataKey='apy'
          stroke={trendColor}
          dot={false}
          legendType='none'
          isAnimationActive={false}
        />

        {showArea && (
          <Area
            type='monotone'
            dataKey='apy'
            stroke='false'
            strokeWidth={2}
            fillOpacity={1}
            fill='url(#colorUv)'
            isAnimationActive={false}
          />
        )}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export default TrendAprChart
