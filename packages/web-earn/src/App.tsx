import RouterView from './routers'
import { GlobalStyles } from '@mui/material'
import { css, Theme, useTheme } from '@emotion/react'
import { globalCss } from '@loopring-web/common-resources'
import { setLanguage } from '@loopring-web/component-lib'
import { useInit } from './hook'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { HashRouter as Router, useLocation } from 'react-router-dom'
import { LoopringAPI, store, useAccount, useChargeFees } from '@loopring-web/core'
import { utils } from 'ethers'
import { useWeb3ModalAccount } from '@web3modal/ethers5/react'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
const App = () => {
  const theme: Theme = useTheme()
  const {
    i18n: { language },
  } = useTranslation()
  const storeLan = store.getState().settings.language

  React.useEffect(() => {
    if (storeLan !== language) {
      store.dispatch(setLanguage(language))
    }
  }, [storeLan, language])

  React.useEffect(() => {
    if (window.location.protocol !== 'https:') {
      console.log('Current PROTOCOL::', window.location.protocol)
      window.location.replace(
        `https:${window.location.href.substring(window.location.protocol.length)}`,
      )
    }
    // const {address}=useWeb3ModalAccount()
    const {account}=useAccount()
    useChargeFees({
      
    })

    setTimeout(async () => {
      const network = 'SEPOLIA'
      LoopringAPI.rabbitWithdrawAPI?.setBaseUrl('https://uat2.loopring.io')
      const config = await LoopringAPI.rabbitWithdrawAPI!.getConfig()
      const configiJSON = JSON.parse(config.config)
      const agents = await LoopringAPI.rabbitWithdrawAPI?.getNetworkWithdrawalAgents({
        tokenId: 1,
        amount: utils.parseEther('0.01').toString(),
        network,
      })
      
      const agentId =configiJSON.networkL2AgentAccountIds[network]
      const agentAddr =configiJSON.networkL2AgentAddresses[network]
      const exchange =configiJSON.networkExchanges[network]
      LoopringAPI.rabbitWithdrawAPI?.submitRabitWithdraw({
        fromNetwork: network,
        toNetwork: network,
        toAddress: account.accAddress,
        transfer: {
          exchange: exchange,
          payerId: account.accountId,
          payerAddr: agentAddr,
          payeeId: agentId,
          payeeAddr: account.accAddress,
          token: {
            tokenId: number;
            volume: string;
          };
          maxFee: {
            tokenId: number;
            volume: string;
          };
          storageId: number;
          validUntil: number;
          counterFactualInfo?: CounterFactualInfo;
          eddsaSignature?: string;
          ecdsaSignature?: string;
          hashApproved?: string;
          memo?: string;
          clientId?: string;
          payPayeeUpdateAccount?: boolean;
        }; 
      })
      

      debugger
    }, 5000);
  }, [])

  const { state } = useInit()

  return (
    <>
      <GlobalStyles
        styles={css`
          ${globalCss({ theme })};

          body {
            ${
              theme.mode === 'dark'
                ? `
            color: ${theme.colorBase.textPrimary};
          `
                : ``
            }


          }

          body:before {
            ${
              theme.mode === 'dark'
                ? `
            background: var(--color-global-bg);
       `
                : ''
            }
          }
        }`}
      />

      <Router>
        <ScrollToTop />
        <RouterView state={state} />
      </Router>
    </>
  )
}
const h = new Headers()
export default App
