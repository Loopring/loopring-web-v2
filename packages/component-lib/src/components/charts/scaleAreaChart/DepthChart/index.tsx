import React, { useCallback, useState } from 'react'
import { getDepthData } from '../data'
import { Box, Typography } from '@mui/material'
import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from '@loopring-web/recharts'
import { getValuePrecisionThousand } from '@loopring-web/common-resources'
import styled from '@emotion/styled'
import { withTranslation, WithTranslation } from 'react-i18next'

const ASKS_COLOR = '#FF5677'
const BIDS_COLOR = '#00BBA8'
const YAXIS_DOMAIN = 0.1

const TooltipStyled = styled(Box)`
  background: var(--color-pop-bg);
  border: 1px solid var(--color-border);
  border-radius: ${({ theme }) => theme.unit * 0.25}px;
  padding: ${({ theme }) => theme.unit * 2}px ${({ theme }) => theme.unit * 2}px;

  > div:last-of-type {
    color: var(--color-text-secondary);
  }
`

export interface DepthData {
  // timeStamp: number
  bidsPrices: any[]
  bidsAmtTotals: any[]
  asksPrices: any[]
  asksAmtTotals: any[]
}

export interface DepthProps {
  data?: DepthData
  handleMove?: (props: { type: 'asks' | 'bids'; price: number; amount: number }) => void
  yAxisDomainPercent?: number
  colorBase: any
  marketPrecision?: number
}

const DepthChart = withTranslation('common')(
  ({
    data,
    handleMove,
    yAxisDomainPercent = YAXIS_DOMAIN,
    marketPrecision = 2,
    t,
  }: DepthProps & WithTranslation) => {
    const [currentIndex, setCurrentIndex] = useState(-1)

    const asksColor = ASKS_COLOR
    const bidsColor = BIDS_COLOR

    const hasData = data

    const renderTooltipContent = useCallback(
      (props: any) => {
        // no data
        if (!hasData) return ''
        if (props.payload && !!props.payload.length && props.payload[0].payload) {
          const { payload } = props.payload[0]
          const { price } = payload
          if (payload.bids || payload.asks) {
            return (
              <TooltipStyled>
                <Typography>
                  {t('labelProOrderPrice')}: {formatAxisTicker(price, true)}
                </Typography>
                <Typography>
                  {t('labelProOrderTotalAmount')}:{' '}
                  {getValuePrecisionThousand(
                    payload.bids || payload.asks,
                    undefined,
                    undefined,
                    marketPrecision,
                    false,
                  )}
                </Typography>
              </TooltipStyled>
            )
          }
          // if (payload.asks) {
          //     return (
          //         <TooltipStyled>
          //             <Typography>price: {price}</Typography>
          //             <Typography>amount: {payload.asks}</Typography>
          //         </TooltipStyled>
          //     )
          // }
        }
        return <span></span>
      },
      [hasData, t],
    )

    const handleMousemove = useCallback(
      (props: any) => {
        // no data
        if (!hasData) return
        const { activeTooltipIndex } = props
        // avoid duplicated event
        const isUpdate = activeTooltipIndex !== currentIndex
        if (Number.isFinite(activeTooltipIndex) && isUpdate) {
          setCurrentIndex(activeTooltipIndex)
          // const {payload, name} = props.activePayload[ 0 ]
          const payload = props.activePayload ? props.activePayload[0].payload : undefined
          const name = props.activePayload ? props.activePayload[0].name : undefined
          if (handleMove && props.activePayload) {
            handleMove({
              price: payload.price,
              type: name,
              amount: payload.bids || payload.asks,
            })
          }
        }
      },
      [handleMove, currentIndex, hasData],
    )

    const formattedData = getDepthData(data)

    const formatAxisTicker = React.useCallback(
      (value: any, addZeros: boolean) => {
        // myLog(getValuePrecisionThousand(value, undefined, undefined, marketPrecision, false))
        return getValuePrecisionThousand(value, undefined, undefined, marketPrecision, addZeros)
      },
      [marketPrecision],
    )

    return (
      <ResponsiveContainer width={'99%'}>
        <ComposedChart data={formattedData} onMouseMove={handleMousemove}>
          <defs>
            <linearGradient id='colorAsks' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={asksColor} stopOpacity={1} />
              <stop offset='98%' stopColor={asksColor} stopOpacity={0} />
            </linearGradient>
            <linearGradient id='colorBids' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor={bidsColor} stopOpacity={1} />
              <stop offset='98%' stopColor={bidsColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey='price'
            // hide={true}
            type='category'
            tickFormatter={(value) => formatAxisTicker(value, true)}
            allowDuplicatedCategory
          />
          <YAxis
            // hide={true}
            orientation={'right'}
            tickFormatter={(value) => formatAxisTicker(value, false)}
            domain={[
              (dataMin: number) => dataMin * (1 - yAxisDomainPercent),
              (dataMax: number) => dataMax * (1 + yAxisDomainPercent),
            ]}
          />
          {hasData && (
            <Tooltip
              cursor={{ stroke: '#808080', strokeDasharray: '5 5' }}
              //  cursor={<CustomCursor/>}
              position={{ y: 50 }}
              content={(props) => renderTooltipContent(props)}
            />
          )}
          <Line
            type='step'
            dataKey='asks'
            stroke={asksColor}
            dot={false}
            animationDuration={500}
            isAnimationActive={false}
          />
          <Line
            type='step'
            dataKey='bids'
            stroke={bidsColor}
            dot={false}
            animationDuration={500}
            isAnimationActive={false}
          />
          <Area
            type='step'
            dataKey='asks'
            stroke='false'
            fill='url(#colorAsks)'
            animationDuration={500}
            isAnimationActive={false}
          />
          <Area
            type='step'
            dataKey='bids'
            stroke='false'
            fill='url(#colorBids)'
            animationDuration={500}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    )
  },
)

export default DepthChart
