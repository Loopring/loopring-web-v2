import RouterView from './routers'
import { GlobalStyles } from '@mui/material'
import { css, Theme, useTheme } from '@emotion/react'
import { globalCss, SagaStatus } from '@loopring-web/common-resources'
import { setDefaultNetwork, setLanguage } from '@loopring-web/component-lib'
import { useInit } from './hook'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { HashRouter as Router, useLocation } from 'react-router-dom'
import { checkAccount, store, useAccount, useSystem } from '@loopring-web/core'
import { walletServices } from '@loopring-web/web3-provider'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { ChainId } from '@loopring-web/loopring-sdk'
import { updateSystem } from '@loopring-web/core/src/stores/system/reducer'

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
  const { walletProvider } = useWeb3ModalProvider()
  const {status} = useSystem()
  const { address } = useWeb3ModalAccount()
  const { resetAccount } = useAccount()

  React.useEffect(() => {
    ;(async () => {
      if (address) {

        let chainId: ChainId = 5
        // let chainId: ChainId = 
        // walletProvider ? Number(await new Web3(walletProvider as any).eth.getChainId())
        // : ChainId.MAINNET
        // if (!AvaiableNetwork.includes(chainId.toString())) {
        //   chainId = ChainId.MAINNET
        // }
        const { defaultNetwork } = store.getState().settings
        if (chainId !== defaultNetwork || status === SagaStatus.PENDING) {
          store.dispatch(updateSystem({ chainId }))
          store.dispatch(setDefaultNetwork(chainId))
        }
        checkAccount(address, chainId)
      } else {
        walletServices.sendDisconnect('', 'customer click disconnect')
        resetAccount()
      }
    })()
  }, [address, walletProvider, status])


  
  React.useEffect(() => {
    if (window.location.protocol !== 'https:') {
      console.log('Current PROTOCOL::', window.location.protocol)
      window.location.replace(
        `https:${window.location.href.substring(window.location.protocol.length)}`,
      )
    }
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
