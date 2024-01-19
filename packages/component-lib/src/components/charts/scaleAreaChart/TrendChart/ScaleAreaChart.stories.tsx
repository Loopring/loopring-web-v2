// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react'
import { ScaleAreaChart } from '../ScaleAreaChart'
import { ChartType } from '../../index'
import { withTranslation } from 'react-i18next'
import styled from '@emotion/styled'

const Styled = styled.div`
  flex: 1;

  width: 1000px;
  height: 500px;
`

// @ts-ignore
const testTrendData: any = [
  {
    timeStamp: 150,
    // low: Math.random() + 1,
    // high: Math.random() + 6,
    // open: Math.random() + 3,
    close: Math.random() + 4,
    // volume: (Math.random() + 4) * 1500,
  },
  {
    timeStamp: 160,
    // low: Math.random() + 1,
    // high: Math.random() + 6,
    // open: Math.random() + 3,
    close: Math.random() + 4,
    // volume: (Math.random() + 4) * 1500,
  },
  {
    timeStamp: 170,
    // low: Math.random() + 1,
    // high: Math.random() + 6,
    // open: Math.random() + 3,
    close: Math.random() + 4,
    // volume: (Math.random() + 4) * 1500,
  },
  {
    timeStamp: 180,
    // low: Math.random() + 1,
    // high: Math.random() + 6,
    // open: Math.random() + 3,
    close: Math.random() + 4,
    // volume: (Math.random() + 4) * 1500,
  },
  {
    timeStamp: 190,
    // low: Math.random() + 1,
    // high: Math.random() + 6,
    // open: Math.random() + 3,
    close: Math.random() + 4,
    // volume: (Math.random() + 4) * 1500,
  },
  {
    timeStamp: 200,
    // low: Math.random() + 1,
    // high: Math.random() + 6,
    // open: Math.random() + 3,
    close: Math.random() + 4,
    // volume: (Math.random() + 4) * 1500,
  },
  {
    timeStamp: 210,
    // low: Math.random() + 1,
    // high: Math.random() + 6,
    // open: Math.random() + 3,
    close: Math.random() + 4,
    // volume: (Math.random() + 4) * 1500,
  },
  {
    timeStamp: 220,
    // low: Math.random() + 1,
    // high: Math.random() + 6,
    // open: Math.random() + 3,
    close: Math.random() + 4,
    // volume: (Math.random() + 4) * 1500,
  },
  {
    timeStamp: 230,
    // low: Math.random() + 1,
    // high: Math.random() + 6,
    // open: Math.random() + 3,
    close: Math.random() + 4,
    // volume: (Math.random() + 4) * 1500,
  },
  {
    timeStamp: 240,
    // low: Math.random() + 1,
    // high: Math.random() + 6,
    // open: Math.random() + 3,
    close: Math.random() + 4,
    // volume: (Math.random() + 4) * 1500,
  },
]

export const Trend = withTranslation()(() => {
  return (
    <>
      <Styled>
        <ScaleAreaChart
          type={ChartType.Trend}
          data={testTrendData}
          yAxisDomainPercent={0.2}
          handleMove={(props) => {
            console.log(props)
          }}
          // showTooltip={false}
          // riseColor="red"
          // showArea={false}
        />
      </Styled>
    </>
  )
}) as Story

export default {
  title: 'Charts/Trend',
  component: Trend,
  argTypes: {},
} as Meta
