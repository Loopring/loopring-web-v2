// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { ScaleAreaChart } from '../ScaleAreaChart'
import { ChartType } from '../../index'
import { withTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { testKlineData } from './data'
import { MainIndicator, SubIndicator } from '.'
import { TradingInterval } from '@loopring-web/loopring-sdk'

const Styled = styled.div`
  flex: 1;

  width: 100%;
  height: 100%;
`

const formatDateData = testKlineData.map((d) => ({
  ...d,
  date: new Date(d.date),
}))

export const Kline = withTranslation()(() => {
  return (
    <>
      <Styled>
        <ScaleAreaChart
          type={ChartType.Kline}
          data={formatDateData}
          interval={TradingInterval.d1}
          indicator={{
            mainIndicators: [
              { indicator: MainIndicator.MA, params: { period: 5 } },
              { indicator: MainIndicator.MA, params: { period: 10 } },
              { indicator: MainIndicator.BOLL },
            ],
            subIndicator: [
              { indicator: SubIndicator.VOLUME },
              { indicator: SubIndicator.MACD },
              {
                indicator: SubIndicator.SAR,
                params: {
                  accelerationFactor: 0.02,
                  maxAccelerationFactor: 0.2,
                },
              },
              { indicator: SubIndicator.RSI },
            ],
          }}
        />
      </Styled>
    </>
  )
}) as Story

export default {
  title: 'Charts/KineDay',
  component: Kline,
  argTypes: {},
} as Meta
