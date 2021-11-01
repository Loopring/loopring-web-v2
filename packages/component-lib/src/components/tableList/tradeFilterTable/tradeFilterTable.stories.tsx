import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react/types-6-0'
import { withTranslation } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { FloatTag } from '@loopring-web/common-resources'
import { TradeFilterTable } from './TradeFilterTable';
import { Currency } from '@loopring-web/loopring-sdk';

const Style = styled.div`
  background: var(--color-global-bg);
  
  height: 100%;
  flex: 1
`

const rawData: any = [{
    sellData: "ETH",
    buyData: "LRC",
    volume: 1924342,
    price: 1231,
    priceYuan: 1231231,
    priceDollar: 12312312,
    change24: '+24%',
    showTag: Currency.usd,
    floatTag: FloatTag.decrease
},
    {
        sellData: "ETH",
        buyData: "LRC",
        volume: 1924342,
        price: 1231,
        priceYuan: 1231231,
        priceDollar: 12312312,
        change24: '+24%',
        showTag: Currency.usd,
        floatTag: FloatTag.decrease
    },
    {
        sellData: "ETH",
        buyData: "LRC",
        volume: 1924342,
        price: 1231,
        priceYuan: 1231231,
        priceDollar: 12312312,
        change24: '+24%',
        showTag: Currency.usd,
        floatTag: FloatTag.decrease
    },
    {
        sellData: "ETH",
        buyData: "LRC",
        volume: 1924342,
        price: 1231,
        priceYuan: 1231231,
        priceDollar: 12312312,
        change24: '+24%',
        showTag: Currency.usd,
        floatTag: FloatTag.increase
    },
    {
        sellData: "ETH",
        buyData: "LRC",
        volume: 1924342,
        price: 1231,
        priceYuan: 1231231,
        priceDollar: 12312312,
        change24: '+24%',
        showTag: Currency.usd,
        floatTag: FloatTag.increase
    },
    {
        sellData: "ETH",
        buyData: "LRC",
        volume: 1924342,
        price: 1231,
        priceYuan: 1231231,
        priceDollar: 12312312,
        change24: '+24%',
        showTag: Currency.usd,
        floatTag: FloatTag.increase
    }
]

const Template: Story<any> = withTranslation()((args: any) => {
    return (
        <>
            <Style>
                <MemoryRouter initialEntries={['/']}>
                    <TradeFilterTable {...args} />
                </MemoryRouter>
            </Style>
        </>
    )
}) as Story<any>
//@ts-ignore
export const Trade = Template.bind({})

Trade.args = {
    rawData: rawData,
    pagination: {
        pageSize: 5
    }
}

export default {
    title: 'components/TradeFilter',
    component: TradeFilterTable,
    argTypes: {},
} as Meta
