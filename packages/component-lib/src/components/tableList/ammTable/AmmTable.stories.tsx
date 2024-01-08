import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react'
import { withTranslation } from 'react-i18next'
import { MemoryRouter } from 'react-router-dom'
import { AmmTable, RawDataAmmItem } from './index'
import { AmmSideTypes } from './interface'

const Style = styled.div`
  flex: 1;
  height: 100%;
  flex: 1;
`

const rawData: RawDataAmmItem[] = [
  {
    side: AmmSideTypes.Join,
    amount: {
      from: {
        key: 'LRC',
        value: '2333',
      },
      to: {
        key: 'ETH',
        value: '1.05',
      },
    },
    lpTokenAmount: '1785.65',
    fee: {
      key: 'LRC',
      value: '2.55',
    },
    time: 0,
  },
  {
    side: AmmSideTypes.Exit,
    amount: {
      from: {
        key: 'LRC',
        value: '12333',
      },
      to: {
        key: 'ETH',
        value: '1.25',
      },
    },
    lpTokenAmount: '1745.23',
    fee: {
      key: 'LRC',
      value: '21.55',
    },
    time: 0,
  },
]

const Template: Story<any> = withTranslation()((args: any) => {
  return (
    <>
      <Style>
        <MemoryRouter initialEntries={['/']}>
          <AmmTable {...args} />
        </MemoryRouter>
      </Style>
    </>
  )
}) as Story<any>

export const Amm = Template.bind({})

Amm.args = {
  rawData: rawData,
  pagination: {
    pageSize: 5,
  },
  showFilter: true,
}

export default {
  title: 'components/TableList/Amm',
  component: AmmTable,
  argTypes: {},
} as Meta
