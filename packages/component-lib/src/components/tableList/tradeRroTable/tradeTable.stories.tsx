import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react/types-6-0'
import { withTranslation } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { RawDataTradeItem, TradePro, } from './index'
import { TradeTypes } from '@loopring-web/common-resources';

const Style = styled.div`
	
	flex: 1;
	height: 100%;
	flex: 1;
`

const rawData: RawDataTradeItem[] = [
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'LRC',
                value: 2333
            },
            to: {
                key: 'ETH',
                value: 1.05
            },
            volume:1111
        },
        price: {
            key: 'ETH',
            value: 1785.65
        },
        fee: {
            key: 'LRC',
            value: 2.55
        },
        time: 0
    },
    {
        side: TradeTypes.Sell,
        amount: {
            from: {
                key: 'BTC',
                value: 0.59
            },
            to: {
                key: 'ETH',
                value: 25.73
            },
            volume:1111
        },
        price: {
            key: 'ETH',
            value: 1785.65
        },
        fee: {
            key: 'LRC',
            value: 2.55
        },
        time: 3
    },
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'LRC',
                value: 2333
            },
            to: {
                key: 'ETH',
                value: 1.05
            },
            volume:1111
        },
        price: {
            key: 'ETH',
            value: 1785.65
        },
        fee: {
            key: 'LRC',
            value: 2.55
        },
        time: 0
    },
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'LRC',
                value: 2333
            },
            to: {
                key: 'ETH',
                value: 1.05
            },
            volume:1111
        },
        price: {
            key: 'ETH',
            value: 1785.65
        },
        fee: {
            key: 'LRC',
            value: 2.55
        },
        time: 0
    },
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'LRC',
                value: 2333
            },
            to: {
                key: 'ETH',
                value: 1.05
            },
            volume:1111
        },
        price: {
            key: 'ETH',
            value: 1785.65
        },
        fee: {
            key: 'LRC',
            value: 2.55
        },
        time: 0
    },
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'LRC',
                value: 2333
            },
            to: {
                key: 'ETH',
                value: 1.05
            },
            volume:1111
        },
        price: {
            key: 'ETH',
            value: 1785.65
        },
        fee: {
            key: 'LRC',
            value: 2.55
        },
        time: 0
    },
    {
        side: TradeTypes.Buy,
        amount: {
            from: {
                key: 'LRC',
                value: 2333
            },
            to: {
                key: 'ETH',
                value: 1.05
            },
            volume:1111
        },
        price: {
            key: 'ETH',
            value: 1785.65
        },
        fee: {
            key: 'LRC',
            value: 2.55
        },
        time: 0
    },
]

const Template: Story<any> = withTranslation()((args: any) => {
    return (
        <>
            <Style>
                <MemoryRouter initialEntries={['/']}>
                    <TradePro {...args} />
                </MemoryRouter>
            </Style>
        </>
    )
}) as Story<any>

// @ts-ignore
export const Trade = Template.bind({})

Trade.args = {
    rawData: rawData,
    pagination: {
        pageSize: 5
    },
    showFilter: true
}

export default {
    title: 'components/TableList/TradePro',
    component: TradePro,
    argTypes: {},
} as Meta
