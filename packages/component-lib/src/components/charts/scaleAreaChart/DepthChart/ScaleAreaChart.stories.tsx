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
const testDepthData = {
  bidsPrices: [1.5, 1.55, 1.56, 1.57, 1.58, 1.59, 1.6, 1.61, 1.62, 1.63],
  bidsAmtTotals: [310, 290, 280, 280, 180, 170, 160, 160, 150, 70],
  asksPrices: [1.5, 1.52, 1.53, 1.54, 1.55, 1.56, 1.57, 1.58, 1.59, 1.6],
  asksAmtTotals: [60, 80, 80, 100, 120, 130, 140, 140, 150, 200],
}

export const Depth = withTranslation()(() => {
  return (
    <>
      <Styled>
        <ScaleAreaChart
          type={ChartType.Depth}
          data={testDepthData}
          yAxisDomainPercent={0.2}
          handleMove={(props) => {
            console.log(props)
          }}
          // riseColor="red"
        />
      </Styled>
    </>
  )
}) as Story

export default {
  title: 'Charts/Depth',
  component: Depth,
  argTypes: {},
} as Meta
