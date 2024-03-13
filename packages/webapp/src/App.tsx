import RouterView from './routers'
import { GlobalStyles } from '@mui/material'
import { css, Theme, useTheme } from '@emotion/react'
import { globalCss, SagaStatus } from '@loopring-web/common-resources'
import { setDefaultNetwork, setLanguage } from '@loopring-web/component-lib'
import { useInit } from './hook'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { HashRouter as Router, useLocation } from 'react-router-dom'
import { checkAccount, store, useAccount, useSystem, web3Modal } from '@loopring-web/core'
import { ConnectProviders, connectProvides, walletServices } from '@loopring-web/web3-provider'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { updateSystem } from '@loopring-web/core/src/stores/system/reducer'
import { updateAccountStatus } from '@loopring-web/core/src/stores/account/reducer'
import { providers } from 'ethers'
import { useDispatch } from 'react-redux'
import Web3 from "web3";


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
  const { status } = useSystem()
  const { address, chainId } = useWeb3ModalAccount()
  const { resetAccount } = useAccount()
  const dispatch = useDispatch()

  React.useEffect(() => {
    ;(async () => {
      if (address) {
        dispatch(
          updateAccountStatus({
            connectName: ConnectProviders.MetaMask
          })
        )
        const { defaultNetwork } = store.getState().settings
        if (chainId !== defaultNetwork || status === SagaStatus.PENDING) {
          store.dispatch(updateSystem({ 
            chainId,
          }))
          store.dispatch(setDefaultNetwork(chainId))
        }
        checkAccount(address, chainId)
      } else {
        walletServices.sendDisconnect('', 'customer click disconnect')
        resetAccount()
      }
    })()
  }, [address, walletProvider, status, chainId])
  
  React.useEffect(() => {
    const provider = web3Modal.getWalletProvider()
    connectProvides.usedProvide = new providers.Web3Provider(provider as any)
    // @ts-ignore
    connectProvides.usedWeb3 = new Web3(provider as any)
    web3Modal.subscribeProvider(async (pro) => {
      connectProvides.usedProvide = new providers.Web3Provider(pro.provider as any)
      // @ts-ignore
      connectProvides.usedWeb3 = new Web3(pro.provider as any)
    })
  }, [])

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
