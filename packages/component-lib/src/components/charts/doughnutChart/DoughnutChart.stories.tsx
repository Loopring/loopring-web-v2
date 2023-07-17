// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from '@storybook/react/types-6-0'
import { DoughnutChart } from './DoughnutChart'
import { withTranslation } from 'react-i18next'
import styled from '@emotion/styled'

const Styled = styled.div`
  flex: 1;

  width: 500px;
  height: 300px;
`

// @ts-ignore
const data = [
  {
    name: 'LP Token',
    value: 12898.0,
  },
  {
    name: 'LRC',
    value: 12898.5,
  },
  {
    name: 'ETH',
    value: 36547.0,
  },
  {
    name: 'DOT',
    value: 23898.09,
  },
  {
    name: 'BTC',
    value: 3489,
  },
  {
    name: 'CRV',
    value: 180.09,
  },
]

export const Doughnut = withTranslation()(() => {
  return (
    <>
      <Styled>
        <DoughnutChart data={data} />
      </Styled>
    </>
  )
}) as Story

export default {
  title: 'Charts/Doughnut',
  component: Doughnut,
  argTypes: {},
} as Meta
