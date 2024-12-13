import RouterView from './routers'
import { GlobalStyles } from '@mui/material'
import { css, Theme, useTheme } from '@emotion/react'
import { globalCss } from '@loopring-web/common-resources'
import { setLanguage, useSettings } from '@loopring-web/component-lib'
import { useInit } from './hook'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { HashRouter as Router, useLocation } from 'react-router-dom'
import { DAYS, getTimestampDaysLater, LoopringAPI, store, useAccount } from '@loopring-web/core'
import { utils } from 'ethers'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { ConnectorNames, getEcDSASig, GetEcDSASigType, getTransferTypedData, OffchainFeeReqType } from '@loopring-web/loopring-sdk'
import { symbol } from 'prop-types'
import Web3 from 'web3'

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
  const {account}=useAccount()
  const {defaultNetwork}=useSettings()
  const {walletProvider}=useWeb3ModalProvider()

  React.useEffect(() => {
    if (window.location.protocol !== 'https:') {
      console.log('Current PROTOCOL::', window.location.protocol)
      window.location.replace(
        `https:${window.location.href.substring(window.location.protocol.length)}`,
      )
    }
    // const {address}=useWeb3ModalAccount()
    

    setTimeout(async () => {
      const token={
        amount: utils.parseEther('0.01').toString(),
        tokenId: 0,
        symbol: 'ETH',
      }
      const feeToken={
        tokenId: 0,
        symbol: 'ETH',
      }
      const network = 'SEPOLIA'
      LoopringAPI.rabbitWithdrawAPI?.setBaseUrl('https://uat2.loopring.io')
      LoopringAPI.userAPI?.setBaseUrl('https://uat2.loopring.io')
      const feeInfo = await LoopringAPI.userAPI?.getOffchainFeeAmt({
        accountId: account.accountId,
        requestType: OffchainFeeReqType.RABBIT_OFFCHAIN_WITHDRAWAL,
        tokenSymbol: token.symbol,
        amount: token.amount,
      }, account.apiKey)
      const fee = feeInfo!.fees[feeToken.symbol]
      debugger
      
      
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

      const request = {
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
            tokenId: token.tokenId,
            volume: token.amount
          },
          maxFee: {
            // @ts-ignore
            tokenId: fee.tokenId,
            volume: fee.fee,
          },
          storageId: storageId!.offchainId,
          validUntil: getTimestampDaysLater(DAYS),
          // counterFactualInfo?: CounterFactualInfo;
          // eddsaSignature?: string;
          // ecdsaSignature?: string;
          // hashApproved?: string;
          // memo?: string;
          // clientId?: string;
          // payPayeeUpdateAccount?: boolean;
        }
      }
      const transfer = request.transfer
      const typedData = getTransferTypedData(transfer, defaultNetwork)
    const result = await getEcDSASig(
      new Web3(walletProvider as any),
      typedData,
      transfer.payerAddr,
      GetEcDSASigType.HasDataStruct,
      defaultNetwork,
      account.accountId,
      '',
      ConnectorNames.Unknown,
      undefined,
    )
    const ecdsaSig = result.ecdsaSig
  
      LoopringAPI.rabbitWithdrawAPI?.submitRabitWithdraw({
        ...request,
        transfer: {
          ...transfer,
          ecdsaSignature: ecdsaSig,
        }
      }).then(x => {
        debugger
      })
      .catch(x => {
        debugger
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
