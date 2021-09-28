import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react/types-6-0'
import { MemoryRouter } from 'react-router-dom'
import { PoolsRow, PoolsTable } from './index'
import { coinMap } from '../../../static';
import { CoinInfo, FloatTag } from '@loopring-web/common-resources';

const Style = styled.div`
  
  flex: 1;
  height: 100%;
  flex: 1;
`

const rawData: PoolsRow<any>[] = [
    {
        coinAInfo: coinMap[ 'ETH' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        amountDollar: 12,
        amountYuan: 194.89,
        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'USDT' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'USDC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        // currency:Currency.usd,
        amountDollar: 17764.89,
        amountYuan: 194.89,
        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'USDT' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        // currency:Currency.usd,
        amountDollar: 19774.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'DPR' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        // currency:Currency.usd,
        amountDollar: 497764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'ETH' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        // currency:Currency.usd,
        amountDollar: 196764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'USDT' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'USDC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        // currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'USDT' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        // currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'DPR' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        // currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'ETH' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        // currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'USDT' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'USDC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        //currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'USDT' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        //currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'DPR' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        //currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'ETH' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        //currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'USDT' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'USDC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        //currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'USDT' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        //currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'DPR' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        //currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'ETH' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        //currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'USDT' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'USDC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        //currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'USDT' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        //currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
    {
        coinAInfo: coinMap[ 'DPR' ] as CoinInfo<any>,
        coinBInfo: coinMap[ 'LRC' ] as CoinInfo<any>,
        tradeFloat: {
            change: 1000,
            timeUnit: '24h',
            priceYuan: 100,
            priceDollar: 1.23123,
            floatTag: FloatTag.increase,
            reward: 12312,
        },
        APR: 56,
        //currency:Currency.usd,
        amountDollar: 197764.89,
        amountYuan: 194.89,

        totalLPToken: 12132131,
        totalA: 0.002,
        totalB: 12344,

        isNew: true,
        isActivity: false,
    },
]

export const PoolTable: Story<any> = (args: any) => {
    return (
        <>
            <Style>
                <MemoryRouter initialEntries={['/']}>
                    <PoolsTable {...args} />
                </MemoryRouter>
            </Style>
        </>
    )
}

PoolTable.bind({})

PoolTable.args = {
    rawData: rawData,
    pagination: {
        pageSize: 5
    }
}

export default {
    title: 'components/TableList',
    component: PoolsTable,
    argTypes: {},
} as Meta
