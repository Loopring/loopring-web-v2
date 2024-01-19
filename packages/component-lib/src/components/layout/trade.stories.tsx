import styled from '@emotion/styled'
import { Meta, Story } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { Box, Container, GlobalStyles, Toolbar } from '@mui/material'

import { css, Theme, useTheme } from '@emotion/react'
import { Header } from '../header'
import { globalCss, headerMenuData, headerToolBarData } from '@loopring-web/common-resources'

import { account, tradeCalcData } from '../../static'
import { SwapPanel, SwapProps } from '../tradePanel'
import React from 'react'

const Style = styled.div``
const TradeWrap = () => {
  let tradeData: any = {
    sell: { belong: undefined },
    buy: { belong: undefined },
  }
  const WrapSwapPanel = () => {
    let swapProps: SwapProps<any, any, any> = {
      campaignTagConfig: {
        SWAP: [],
        ORDERBOOK: [],
        MARKET: [],
        AMM: [],
        FIAT: [],
      } as any,
      refreshRef: React.createRef(),
      tradeData,
      // swapTradeData: tradeData,
      tradeCalcData,
      onSwapClick: () => {
        console.log('Swap button click')
      },
      handleSwapPanelEvent: async (data: any, switchType: any) => {
        console.log(data, switchType)
      },
    }

    return <SwapPanel<any, any, any> {...swapProps}> </SwapPanel>
  }
  return (
    <>
      <Header
        account={account}
        headerMenuData={headerMenuData}
        headerToolBarData={headerToolBarData}
        selected={'markets'}
        allowTrade={{
          register: {
            enable: false,
            reason: undefined,
          },
          order: {
            enable: false,
            reason: undefined,
          },
          joinAmm: {
            enable: false,
            reason: undefined,
          },
          dAppTrade: {
            enable: false,
            reason: undefined,
          },
          raw_data: {
            enable: false,
            reason: undefined,
          },
        }}
        isMobile={false}
        chainId={1}
      />
      <Toolbar />
      <Container maxWidth='lg'>
        {/*style={{height: '100%' }}*/}
        <Box flex={1} display={'flex'} alignItems={'stretch'} flexDirection='row' marginTop={4}>
          <Box flex={1} marginLeft={4} height={500} />
          <Box display={'flex'}>
            <WrapSwapPanel />
          </Box>
        </Box>
      </Container>

      {/*<Footer></Footer>*/}
    </>
  )
}

const Template: Story<any> = () => {
  const theme: Theme = useTheme()
  return (
    <>
      <GlobalStyles
        styles={css`
          ${globalCss({ theme })};

          body:before {
            ${
              theme.mode === 'dark'
                ? ` 
                        background: var(--color-global-bg);
                   `
                : ''
            }
          }
        }
        `}
      />
      <Style>
        {' '}
        <MemoryRouter initialEntries={['/']}>
          <TradeWrap />
        </MemoryRouter>
      </Style>{' '}
    </>
  )
}

export default {
  title: 'components/Layout/Trade',
  component: TradeWrap,
  argTypes: {},
} as Meta

export const TradeStory = Template.bind({})
// SwitchPanel.args = {}
