import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { Box, Grid } from '@mui/material'
import { FilterMarketPanel } from './FilterMarketsPanel'

const Style = styled.div`
  background: var(--color-global-bg);

  height: 100%;
  flex: 1;
`
const FilterMarketPanelWrap = () => {
  return <FilterMarketPanel />
}

const Template: Story<any> = () => {
  return (
    <Style>
      <MemoryRouter initialEntries={['/']}>
        <Box>
          <h4>Panel</h4>
          <Grid container spacing={2} alignContent={'center'} justifyContent={'space-around'}>
            <FilterMarketPanelWrap />
          </Grid>
        </Box>
      </MemoryRouter>
    </Style>
  )
}

export default {
  title: 'components/Panel',
  component: FilterMarketPanel,
  argTypes: {},
} as Meta

export const PanelsStory = Template.bind({})
