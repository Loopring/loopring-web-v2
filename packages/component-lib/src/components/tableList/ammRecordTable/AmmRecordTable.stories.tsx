import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { AmmRecordRow as Row, AmmRecordTable, AmmTradeType } from './index'
import { coinMap } from '../../../static'
import { CoinInfo } from '@loopring-web/common-resources'
import moment from 'moment'

const Style = styled.div`
  flex: 1;
  height: 100%;
  flex: 1;
`

const rawData: Row<any>[] = [
  {
    type: AmmTradeType.add,
    coinA: coinMap['ETH'] as CoinInfo<any>,
    coinB: coinMap['LRC'] as CoinInfo<any>,
    totalDollar: 12,
    amountA: 122,
    amountB: 231,
    time: moment().add(-1, 'days').toDate().getTime(),
  },
  {
    type: AmmTradeType.remove,
    coinA: coinMap['ETH'] as CoinInfo<any>,
    coinB: coinMap['LRC'] as CoinInfo<any>,
    totalDollar: 12,
    amountA: 122,
    amountB: 231,
    time: moment().add(-100, 'days').toDate().getTime(),
  },
  {
    type: AmmTradeType.swap,
    coinA: coinMap['ETH'] as CoinInfo<any>,
    coinB: coinMap['LRC'] as CoinInfo<any>,
    totalDollar: 12,
    amountA: 122,
    amountB: 231,
    time: moment().add(-15, 'days').toDate().getTime(),
  },
  {
    type: AmmTradeType.swap,
    coinA: coinMap['ETH'] as CoinInfo<any>,
    coinB: coinMap['LRC'] as CoinInfo<any>,
    totalDollar: 12,
    amountA: 122,
    amountB: 231,
    time: moment().add(-3, 'hours').toDate().getTime(),
  },
  {
    type: AmmTradeType.swap,
    coinA: coinMap['ETH'] as CoinInfo<any>,
    coinB: coinMap['LRC'] as CoinInfo<any>,
    totalDollar: 12,
    amountA: 122,
    amountB: 231,
    time: moment().add(-75, 'second').toDate().getTime(),
  },
]

export const Template: Story<any> = (args: any) => {
  return (
    <>
      <Style>
        <MemoryRouter initialEntries={['/']}>
          <AmmRecordTable {...args} />
        </MemoryRouter>
      </Style>
    </>
  )
}

Template.bind({})

Template.args = {
  rawData: rawData,
  pagination: {
    pageSize: 5,
  },
}

export default {
  title: 'components/TableList/AmmRecordTable',
  component: AmmRecordTable,
  argTypes: {},
} as Meta
