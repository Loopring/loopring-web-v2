import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react/types-6-0'
import { withTranslation } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { QuoteTable, QuoteTableRawDataItem } from './QuoteTable'
import { OrderHistoryTable } from './orderHistoryTable'
import { RawDataTransactionItem, TransactionTable } from './transactionsTable'
import { OrderHistoryRawDataItem } from './orderHistoryTable/OrderHistoryTable'
import { TradeStatus, TradeTypes } from '@loopring-web/common-resources'
import { TradeRaceTable } from './index'

const Style = styled.div`
  flex: 1;
  height: 100%;
  flex: 1;
`

// type RawDataItem = (string | number | number[] | string[])[] | {}

const rawDatacoinBPrice: QuoteTableRawDataItem[] = [
  {
    pair: {
      coinA: 'LRC',
      coinB: 'BUSD',
    },
    close: 12.4,
    floatTag: 'decrease',
    change: 8.12,
    high: 123.34,
    low: 23.41,
    volume: 21759000,
    changeU: 21759000,
    closeU: 21759000,
    coinApriceU: 21759000,
    precision: 3,
    priceU: 3,
    reward: 3,
    rewardToken: '3',
    timeUnit: '24h',
    open: 100,
    __rawTicker__: {} as any,
  },
]

const rawDataOrderHistory: OrderHistoryRawDataItem[] = [
  {
    market: 'ETH-LRC',
    side: TradeTypes.Sell,
    amount: {
      from: { key: 'ETH', value: 1231 },
      to: { key: 'ETH', value: 1231 },
    },
    average: '12',
    // filledAmount: OrderPair;
    price: {
      key: 'ETH',
      value: 1231,
    },
    time: 1223,
    status: TradeStatus.Expired,
    hash: 'xxxxxxxxxxx',
    orderId: 'xxxxxx',
    __raw__: {} as any,
  },
  {
    market: 'ETH-LRC',
    side: TradeTypes.Sell,
    amount: {
      from: { key: 'ETH', value: 1231 },
      to: { key: 'ETH', value: 1231 },
    },
    average: '12',
    // filledAmount: OrderPair;
    price: {
      key: 'ETH',
      value: 1231,
    },
    time: 1223,
    status: TradeStatus.Expired,
    hash: 'xxxxxxxxxxx',
    orderId: 'xxxxxx',
    __raw__: {} as any,
  },
  {
    market: 'ETH-LRC',
    side: TradeTypes.Sell,
    amount: {
      from: { key: 'ETH', value: 1231 },
      to: { key: 'ETH', value: 1231 },
    },
    average: '12',
    // filledAmount: OrderPair;
    price: {
      key: 'ETH',
      value: 1231,
    },
    time: 1223,
    status: TradeStatus.Expired,
    hash: 'xxxxxxxxxxx',
    orderId: 'xxxxxx',
    __raw__: {} as any,
  },
  {
    market: 'ETH-LRC',
    side: TradeTypes.Sell,
    amount: {
      from: { key: 'ETH', value: 1231 },
      to: { key: 'ETH', value: 1231 },
    },
    average: '12',
    // filledAmount: OrderPair;
    price: {
      key: 'ETH',
      value: 1231,
    },
    time: 1223,
    status: TradeStatus.Expired,
    hash: 'xxxxxxxxxxx',
    orderId: 'xxxxxx',
    __raw__: {} as any,
  },
]

const rawDataTransaction: RawDataTransactionItem[] = []
const rawRank: any[] = [
  {
    rank: 1,
    address: '0x...1',
    xxx: 'xxx',
  },
  {
    rank: 2,
    address: '0x...1',
    xxx: 'xxx',
  },
  {
    rank: 3,
    address: '0x...1',
    xxx: 'xxx',
  },
  {
    rank: 4,
    address: '0x...1',
    xxx: 'xxx',
  },
]

const Template: Story<any> = withTranslation()((args: any) => {
  const { type } = args
  return (
    <>
      <Style>
        <MemoryRouter initialEntries={['/']}>
          {type === 'coinBPrice' ? (
            <QuoteTable {...args} />
          ) : type === 'orderHistory' ? (
            <OrderHistoryTable {...args} />
          ) : type === 'rank' ? (
            <TradeRaceTable {...args} />
          ) : (
            <TransactionTable {...args} />
          )}
        </MemoryRouter>
      </Style>
    </>
  )
}) as Story<any>

// @ts-ignore
export const OrderHistory = Template.bind({})
// @ts-ignore
export const Quote = Template.bind({})
// @ts-ignore
export const Transaction = Template.bind({})
// @ts-ignore
export const TradeRace = Template.bind({})

Quote.args = {
  rawData: rawDatacoinBPrice,
  type: 'coinBPrice',
  onVisibleRowsChange: (data: any) => {
    console.log(data)
  },
}

OrderHistory.args = {
  rawData: rawDataOrderHistory,
  type: 'orderHistory',
  showFilter: true,
  // pagination: {
  //     pageSize: 5
  // }
}

Transaction.args = {
  rawData: rawDataTransaction,
  type: 'transaction',
  pagination: {
    pageSize: 5,
  },
  showFilter: true,
}
TradeRace.args = {
  rawData: rawRank,
  type: 'rank',
  column: [
    {
      key: 'rank',
      label: 'rank',
    },
    {
      key: 'address',
      label: 'address',
    },
    {
      key: 'xxx',
      label: 'xxx',
    },
  ],
}
export default {
  title: 'components/TableList',
  component: QuoteTable,
  argTypes: {},
} as Meta
