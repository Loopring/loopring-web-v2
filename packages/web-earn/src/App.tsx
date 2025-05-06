import RouterView from './routers'
import { GlobalStyles } from '@mui/material'
import { css, Theme, useTheme } from '@emotion/react'
import { globalCss } from '@loopring-web/common-resources'
import { setLanguage } from '@loopring-web/component-lib'
import { useInit } from './hook'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { HashRouter as Router, useLocation } from 'react-router-dom'
import { LoopringAPI, store } from '@loopring-web/core'
import { useAppKitProvider } from '@reown/appkit/react'
import { providers, utils } from 'ethers'

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

  const {walletProvider} = useAppKitProvider('eip155')

  React.useEffect(() => {
    if (window.location.protocol !== 'https:') {
      console.log('Current PROTOCOL::', window.location.protocol)
      window.location.replace(
        `https:${window.location.href.substring(window.location.protocol.length)}`,
      )
    }

    setTimeout(() => {
      if (!walletProvider) return
      const account = store.getState().account
      return

      // LoopringAPI?.userAPI?.submitEncryptedEcdsaKey({
      //   accountId: account.accountId,
      //   eddsaEncryptedPrivateKey: 'aaaaa',
      //   nonce: 1
      // }, account.eddsaKey.sk, account.apiKey)
      // .then(x => {
      //   debugger
      // })
      // .catch(x => {
      //   debugger
      // })

      const validUntilInMs = Math.floor((Date.now() + 1000 * 60 * 10) * 1000)

      const messageToSign = `
      |No EDDSA key file detected in your environment.
      |Please sign the message to retrieve the encrypted EDDSA file from the Loopring server, allowing you to avoid resetting your account.
      |Note: This request will expire after ${validUntilInMs}.`.trim().replace(/^\s*\|/mg, '');
      const hash = utils.hashMessage(messageToSign)
      console.log('asdjaks hash', messageToSign, hash)
      
      const provider = new providers.Web3Provider(walletProvider as any)
      
       provider.getSigner().signMessage(messageToSign).then(x => {
        
        return LoopringAPI?.userAPI?.getEncryptedEcdsaKey({
          owner: account.accAddress,
          validUntilInMs,
          ecdsaSig: x,
        })
       })
      .then(x => {
        
        const a = x?.data?.encryptedEddsaPrivateKey
        debugger
      })
      .catch(x => {
        debugger
      })
      
    }, 5 * 1000);


    
  }, [walletProvider])

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
