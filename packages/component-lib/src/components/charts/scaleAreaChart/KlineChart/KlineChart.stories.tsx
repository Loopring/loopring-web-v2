// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { ScaleAreaChart } from '../ScaleAreaChart'
import { ChartType } from '../../index';
import { withTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { testKlineData } from './data'

const Styled = styled.div`
  flex: 1;
  color: #fff;
  width: 100%;
  height: 100%;
`

// @ts-ignore


const formatDateData = testKlineData.map(d => ({
    ...d,
    date: new Date(d.date)
}))

export const Kline = withTranslation()(() => {
    return (
        <>
            <Styled>
                <ScaleAreaChart
                    type={ChartType.Kline}
                    data={formatDateData}
                    // yAxisDomainPercent={0.2}
                    // handleMove={(props) => {
                    // 	console.log(props)
                    // }}
                    // riseColor="red"
                />
                {/* <DayilyStockChart data={[]} /> */}
            </Styled>
        </>
    )
}) as Story

export default {
    title: 'Charts',
    component: Kline,
    argTypes: {},
} as Meta
