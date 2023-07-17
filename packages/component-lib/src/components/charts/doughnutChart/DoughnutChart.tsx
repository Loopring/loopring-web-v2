import React from 'react'
import styled from '@emotion/styled'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector } from '@loopring-web/recharts'

const colors = ['#00BBA8', '#ED9526', '#1C60FF', '#FFCA28', '#63992D', '#FF5677']

const StyledLegendItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 170px;
  // margin-bottom: ${({ theme }) => theme.unit}px;
  color: ${({ theme }) => `${theme.colorBase.textPrimary}`};
  font-size: 1.4rem;
  padding: ${({ theme }) => theme.unit / 1.5}px;
  border-radius: ${({ theme }) => theme.unit / 2}px;

  & > span:first-of-type {
    display: flex;
    align-items: center;

    & > div:first-of-type {
      margin-right: ${({ theme }) => theme.unit / 2}px;
    }
  }
`

const UlStyled = styled.ul`
  margin-top: ${({ theme }) => theme.unit}px;
  margin-right: ${({ theme }) => theme.unit * 2}px;
` as any

const LiWrapperStyled = styled.li`
  background-color: ${({ theme, active }: any) => {
    return active ? theme.colorBase.fieldOpacity : 'inherit'
  }};
` as any

const renderActiveShape = ({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
}: any) => (
  <g>
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 5}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      // cornerRadius={2}
    />
  </g>
)

export interface DoughnutChartProps {
  data?: {
    name: string
    value: number
  }[]
}

export const DoughnutChart = ({ data }: DoughnutChartProps) => {
  const [activeIndex, setActiveIndex] = React.useState(undefined)

  const onPieEnter = React.useCallback((_: any, index: any) => {
    setActiveIndex(index)
  }, [])

  const onPieLeave = React.useCallback(() => {
    setActiveIndex(undefined)
  }, [])

  const getRenderLegend = React.useCallback(
    ({ payload }: any) => (
      <UlStyled>
        {payload.map((entry: any, index: number) => {
          const {
            color,
            value,
            payload: { value: amount },
          } = entry
          const StyledColoredRect = styled.div`
            width: 1.2rem;
            height: 1.2rem;
            background-color: ${color};
          `
          return (
            <LiWrapperStyled active={index === activeIndex} key={`item-${index}`}>
              <StyledLegendItem>
                <span>
                  <StyledColoredRect />
                  {value}
                </span>
                <span>{(amount * 100).toFixed(2)}%</span>
              </StyledLegendItem>
            </LiWrapperStyled>
          )
        })}
      </UlStyled>
    ),
    [activeIndex],
  )

  const getFormattedData = React.useCallback(() => {
    if (!data || !data.length) return []
    if (data.length < 7) return data
    data.sort((a, b) => b.value - a.value)
    const others = data.slice(5, data.length).reduce((a, b) => ({
      name: 'Others',
      value: a.value + b.value,
    }))
    const result = data.slice(0, 5).concat([others])
    return result
  }, [data])
  const formattedData = getFormattedData()
  const paddingAngle =
    formattedData.filter((item) => {
      return item.value
    }).length > 1
      ? 5
      : 0
  return (
    <ResponsiveContainer debounce={1}>
      <PieChart>
        <Pie
          dataKey={'value'}
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={formattedData}
          cx={'40%'}
          // cy={200}
          innerRadius={54}
          outerRadius={70}
          fill='#8884d8'
          stroke='none'
          radius={5}
          paddingAngle={paddingAngle}
          minAngle={2}
          animationEasing={'ease-in-out'}
          animationDuration={1000}
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
        >
          {formattedData.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index]} />
          ))}
        </Pie>
        {/* <Tooltip
                    formatter={(value: any, name: any) => ([`$${value}`, `${name}`])}
                    contentStyle={{
                        backgroundColor: 'var(--color-pop-bg)',
                        border: 'none'
                    }}
                    itemStyle={{
                        color: '#FFFFFF'
                    }}
                /> */}
        <Legend layout='vertical' align='right' verticalAlign='middle' content={getRenderLegend} />
      </PieChart>
    </ResponsiveContainer>
  )
}
