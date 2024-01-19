import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react'
import { withTranslation } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { TradePro } from './index'
import { RawDataTradeItem } from '../tradeTable'
import * as sdk from '@loopring-web/loopring-sdk'

const Style = styled.div`
  flex: 1;
  height: 100%;
  flex: 1;
`

const rawData: RawDataTradeItem[] = [
  {
    role: sdk.OrderMakerType.maker,
    amount: {
      from: {
        key: 'LRC',
        value: 2333,
      },
      to: {
        key: 'ETH',
        value: 1.05,
      },
      volume: 1111,
    },
    price: {
      key: 'ETH',
      value: 1785.65,
    },
    fee: {
      key: 'LRC',
      value: 2.55,
    },
    time: 0,
    __raw__: {},
  },
  {
    role: sdk.OrderMakerType.maker,
    amount: {
      from: {
        key: 'LRC',
        value: 2333,
      },
      to: {
        key: 'ETH',
        value: 1.05,
      },
      volume: 1111,
    },
    price: {
      key: 'ETH',
      value: 1785.65,
    },
    fee: {
      key: 'LRC',
      value: 2.55,
    },
    time: 0,
    __raw__: {},
  },
  {
    role: sdk.OrderMakerType.maker,
    amount: {
      from: {
        key: 'LRC',
        value: 2333,
      },
      to: {
        key: 'ETH',
        value: 1.05,
      },
      volume: 1111,
    },
    price: {
      key: 'ETH',
      value: 1785.65,
    },
    fee: {
      key: 'LRC',
      value: 2.55,
    },
    time: 0,
    __raw__: {},
  },
  {
    role: sdk.OrderMakerType.maker,
    amount: {
      from: {
        key: 'LRC',
        value: 2333,
      },
      to: {
        key: 'ETH',
        value: 1.05,
      },
      volume: 1111,
    },
    price: {
      key: 'ETH',
      value: 1785.65,
    },
    fee: {
      key: 'LRC',
      value: 2.55,
    },
    time: 0,
    __raw__: {},
  },
  {
    role: sdk.OrderMakerType.maker,
    amount: {
      from: {
        key: 'LRC',
        value: 2333,
      },
      to: {
        key: 'ETH',
        value: 1.05,
      },
      volume: 1111,
    },
    price: {
      key: 'ETH',
      value: 1785.65,
    },
    fee: {
      key: 'LRC',
      value: 2.55,
    },
    time: 0,
    __raw__: {},
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
    pageSize: 5,
  },
  showFilter: true,
}

export default {
  title: 'components/TableList/TradePro',
  component: TradePro,
  argTypes: {},
} as Meta
