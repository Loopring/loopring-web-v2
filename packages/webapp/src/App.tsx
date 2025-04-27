import RouterView from './routers'
import { GlobalStyles } from '@mui/material'
import { css, Theme, useTheme } from '@emotion/react'
import { globalCss } from '@loopring-web/common-resources'
import { AccountStep, setLanguage, useOpenModals } from '@loopring-web/component-lib'
import { useInit } from './hook'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { HashRouter as Router, useLocation } from 'react-router-dom'
import { store } from '@loopring-web/core'

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
  }, [])
  // const { setShowAccount } = useOpenModals()
  React.useEffect(() => {
    // setTimeout(() => {
    //   store.dispatch(coinbaseSmartWalletPersist.persistStoreCoinbaseSmartWalletData(
    //     // {
    //     //   data: 
    //     {
    //         eddsaKey: {
    //           keyPair: [Object],
    //           formatedPx: '0x0e5e06035cbc0a11222ba2c0435ae918f570682e85c3779bf42ecd3419af026d',
    //           formatedPy: '0x16d6cd0984b99d76a861a77dcc6e2e4f142bb2983a5833bccdd61f4a80eb69c5',
    //           sk: 'U2FsdGVkX1+j+r3cbW3s5LF3x5Wq/DBnmhSVxE4c4wDtrrHruwNJPuaBVIY75dPHxkHMNhWahaf1AByb9C1wvkX3MSfTH3GmjEq9Q0cl0Rz66kvIMSl1mIEwqL8rBOWT'
    //         },
    //         wallet: '0x87b39640Fd704E87daA5bA65D0ae4e2B70f7767d',
    //         nonce: 7,
    //         chainId: 11155111,
    //         updateAccountData: {
    //           updateAccountNotFinished: true,
    //           json: '{"request":{"owner":"0x75e87ee8decb1d552c58d79561c1d9d657a88940","accountId":10514,"publicKey":{"x":"0x0e5e06035cbc0a11222ba2c0435ae918f570682e85c3779bf42ecd3419af026d","y":"0x16d6cd0984b99d76a861a77dcc6e2e4f142bb2983a5833bccdd61f4a80eb69c5"},"exchange":"0xD55d5CBC973373E7A5333Fd4F8901fcFE79a41F1","validUntil":1748338061,"nonce":3,"maxFee":{"tokenId":0,"volume":"529000000000000"},"hashApproved":"0x6318c2596f83ab070acda1384e53c431849fd8c4b5bbf4b33513194250f31a81","ecdsaSignature":"0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c00000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000001700000000000000000000000000000000000000000000000000000000000000018c390f51cb3eb1764a00c35221e266eb10d04a58cf8168a80b608cb7947e1d2b5d5bb7d52b424d0b5ab4c7b0f262f75fa48acf1898f2c0d50daa5daaac1a33090000000000000000000000000000000000000000000000000000000000000025f198086b2db17256731bc456673b96bcef23f51d1fbacdd7c4379ef65465572f1d00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008a7b2274797065223a22776562617574686e2e676574222c226368616c6c656e6765223a226f616a7536572d7741486d434d5266526f3467414e556e45666f5558787769486b4c4d567a634261766973222c226f726967696e223a2268747470733a2f2f6b6579732e636f696e626173652e636f6d222c2263726f73734f726967696e223a66616c73657d00000000000000000000000000000000000000000000"},"eddsaKey":{"keyPair":{"publicKeyX":"6498505005378904033672399200320611852093982651951092416864698537127183319661","publicKeyY":"10330403055312626980801448761011245189420954466642879450917408627846223194565","secretKey":"176050408239915207867784572341801554035271079749182103875818858384739218311"},"formatedPx":"0x0e5e06035cbc0a11222ba2c0435ae918f570682e85c3779bf42ecd3419af026d","formatedPy":"0x16d6cd0984b99d76a861a77dcc6e2e4f142bb2983a5833bccdd61f4a80eb69c5","sk":"0x63a418921c5c563e094928a8dfd3f7dde148ca4a8b5f470265b0397ae73387"}}'
    //         }
    //       }
    //     // }
    //   ))
      
    //   // setShowAccount({
    //   //   step: AccountStep.Coinbase_Smart_Wallet_Password_Forget_Password_Confirm,
    //   //   isShow: true
    //   // })  
    // }, 5 * 1000);
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
