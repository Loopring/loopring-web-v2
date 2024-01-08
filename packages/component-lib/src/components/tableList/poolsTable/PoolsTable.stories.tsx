import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { PoolRow, PoolsTable } from './index'
import { coinMap } from '../../../static'
import { CoinInfo, FloatTag } from '@loopring-web/common-resources'

const Style = styled.div`
  flex: 1;
  height: 100%;
  flex: 1;
`

const rawData: PoolRow<any>[] = [
  {
    coinA: 'ETH',
    coinB: 'LRC',
    address: '',
    market: 'ETH-LRC',
    coinAInfo: coinMap['ETH'] as CoinInfo<any>,
    coinBInfo: coinMap['LRC'] as CoinInfo<any>,
    amountU: 12,
    totalLPToken: 12132131,
    totalA: 0.002,
    totalB: 12344,
    tradeFloat: {
      change: 1000,
      timeUnit: '24h',
      priceU: 1.23123,
      floatTag: FloatTag.increase,
      reward: 12312,
    },
    APR: 56,
    isNew: true,
    isActivity: false,
  },
  {
    coinA: 'ETH',
    coinB: 'LRC',
    address: '',
    market: 'ETH-LRC',
    coinAInfo: coinMap['ETH'] as CoinInfo<any>,
    coinBInfo: coinMap['LRC'] as CoinInfo<any>,
    amountU: 12,
    totalLPToken: 12132131,
    totalA: 0.002,
    totalB: 12344,
    tradeFloat: {
      change: 1000,
      timeUnit: '24h',
      priceU: 1.23123,
      floatTag: FloatTag.increase,
      reward: 12312,
    },
    APR: 56,
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
    pageSize: 5,
  },
}

export default {
  title: 'components/TableList',
  component: PoolsTable,
  argTypes: {},
} as Meta
