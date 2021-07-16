import React from 'react'
import styled from '@emotion/styled'

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';

const colors = [
    "#00BBA8",
    "#ED9526",
    "#1C60FF",
    "#FFCA28",
    "#63992D",
    "#FF5677",
];

const StyledLegendItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 170px;
    margin-bottom: 8px;
    color: ${({theme}) => `${theme.colorBase.textPrimary}`};
    font-size: 14px;

    &>span:first-of-type {
        display: flex;

        &>div:first-of-type {
            margin-right: 4px;
        }
    }
`

const renderActiveShape = ({
                               cx,
                               cy,
                               innerRadius,
                               outerRadius,
                               startAngle,
                               endAngle,
                               fill
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
);

export interface DoughnutChartProps {
    data?: {
        name: string;
        value: number;
    }[]
}

const renderLegend = ({payload}: any) => (
    <ul style={{marginRight: 26}}>
        {payload.map((entry: any, index: number) => {
            const {color, value, payload: {value: amount}} = entry
            const StyledColoredRect = styled.div`
                width: 12px;
                height: 12px;
                background-color: ${color}
            `
            return (
                <li key={`item-${index}`}>
                    <StyledLegendItem>
                        <span><StyledColoredRect/>{value}</span>
                        <span>${amount.toFixed(2)}</span>
                    </StyledLegendItem>
                </li>
            )
        })}
    </ul>
);

export const DoughnutChart = ({data}: DoughnutChartProps) => {
    const [activeIndex, setActiveIndex] = React.useState(undefined)

    const onPieEnter = React.useCallback((_, index) => {
        setActiveIndex(index)
    }, [])

    const onPieLeave = React.useCallback(() => {
        setActiveIndex(undefined)
    }, [])

    const getFormattedData = React.useCallback(() => {
        if (!data || !data.length) return []
        if (data.length < 7) return data
        data.sort((a, b) => b.value - a.value)
        const others = data.slice(5, data.length).reduce((a, b) => ({
            name: 'Others',
            value: a.value + b.value
        }))
        const result = data.slice(0, 5).concat([others])
        return result
    }, [data])

    return (
        <ResponsiveContainer debounce={1} width={'99%'}>
            <PieChart>
                <Pie
                    dataKey={'value'}
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={data}
                    cx={'30%'}
                    // cy={200}
                    innerRadius={45}
                    outerRadius={55}
                    fill="#8884d8"
                    stroke="none"
                    radius={5}
                    paddingAngle={5}
                    minAngle={2}
                    animationEasing={'ease-in-out'}
                    animationDuration={1000}
                    onMouseEnter={onPieEnter}
                    onMouseLeave={onPieLeave}
                >
                    {getFormattedData().map((entry, index) => (
                        <Cell key={entry.name} fill={colors[ index ]}/>
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: any, name: any) => ([`$${value}`, `${name}`])}
                    contentStyle={{
                        backgroundColor: 'rgba(0,0,0,.44)',
                        border: 'none'
                    }}
                    itemStyle={{
                        color: '#FFFFFF'
                    }}
                />
                <Legend layout="vertical" align="right" verticalAlign="middle" content={renderLegend}/>
            </PieChart>
        </ResponsiveContainer>
    );
}
