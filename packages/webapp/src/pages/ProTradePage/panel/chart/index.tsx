import { withTranslation } from 'react-i18next';
import { ScaleAreaChart, ChartType, testKlineData, MainIndicator, SubIndicator } from '@loopring-web/component-lib'
import {  } from '../../index';
import styled from '@emotion/styled'
import { useKlineChart } from './hook';

const Styled = styled.div`
  flex: 1;
  
  width: 100%;
  height: 100%;
`

const formatDateData = testKlineData.map(d => ({
    ...d,
    date: new Date(d.date)
}))


export  const ChartView = withTranslation('common')(<C extends { [ key: string ]: any }>({market}: {market: string | undefined})=>{

    const { candlestickViewData, } = useKlineChart(market)

    return <>
     <Styled>
                <ScaleAreaChart
                    type={ChartType.Kline}
                    data={candlestickViewData}
                    indicator={
                        {
                            mainIndicators: [{indicator: MainIndicator.MA, params: {period: 5}}, 
                                {indicator: MainIndicator.MA, params: {period: 10}}, 
                                {indicator: MainIndicator.BOLL}
                            ],
                            subIndicator: [{ indicator: SubIndicator.VOLUME }, { indicator: SubIndicator.MACD }]
                        }
                    }
                />
            </Styled>
    </>
})