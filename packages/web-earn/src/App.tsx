import RouterView from './routers'
import { GlobalStyles } from '@mui/material'
import { css, Theme, useTheme } from '@emotion/react'
import { globalCss, MapChainId } from '@loopring-web/common-resources'
import { setLanguage, useSettings } from '@loopring-web/component-lib'
import { useInit } from './hook'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { HashRouter as Router, useLocation } from 'react-router-dom'
import { DAYS, getTimestampDaysLater, LoopringAPI, store, useAccount, web3Modal } from '@loopring-web/core'
import { ethers, Signer, utils } from 'ethers'
import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/ethers5/react'
import { ConnectorNames, creatEdDSASigHasH, get_EddsaSig_Transfer, getEcDSASig, GetEcDSASigType, getTransferTypedData, LOOPRING_URLs, OffchainFeeReqType, sortObjDictionary } from '@loopring-web/loopring-sdk'
import { symbol } from 'prop-types'
import Web3 from 'web3'
import { _TypedDataEncoder } from '@ethersproject/hash'
import { arrayify } from '@ethersproject/bytes'
import { TypedDataEncoder } from '@ethersproject/hash/lib/typed-data'
import { toUtf8Bytes } from '@ethersproject/strings'
import { recoverAddress } from '@ethersproject/transactions'

const ScrollToTop = () => {
  const { pathname } = useLocation()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

const signFastWithdrawTypedData = (args: {
  signer: ethers.providers.JsonRpcSigner
  chainId: number
  exchangeAddress: string
  data: Record<string, any>
}) => {
  const { signer, chainId, exchangeAddress } = args
  const domain = {
    name: 'Loopring Protocol',
    version: '3.6.0',
    chainId: chainId,
    verifyingContract: exchangeAddress,
  }
  // const types = {
  //   Token: [
  //     { name: 'tokenId', type: 'uint16' },
  //     { name: 'volume', type: 'uint96' },
  //   ],
  //   Transfer: [
  //     { name: 'payerId', type: 'uint32' },
  //     { name: 'payeeId', type: 'uint32' },
  //     { name: 'token', type: 'Token' },
  //     { name: 'maxFee', type: 'Token' },
  //     { name: 'validUntil', type: 'uint32' },
  //     { name: 'storageId', type: 'uint32' },
  //   ],
  //   RabbitWithdraw: [
  //     { name: 'transfer', type: 'Transfer' },
  //     { name: 'fromChainId', type: 'uint32' },
  //     { name: 'toChainId', type: 'uint32' },
  //     { name: 'withdrawToAddr', type: 'address' },
  //   ],
  // }
  const types = {
    // Token: [
    //   { name: 'tokenId', type: 'uint16' },
    //   { name: 'volume', type: 'uint96' },
    // ],
    // Transfer: [
    //   { name: 'payerId', type: 'uint32' },
    //   { name: 'payeeId', type: 'uint32' },
    //   { name: 'token', type: 'Token' },
    //   { name: 'maxFee', type: 'Token' },
    //   { name: 'validUntil', type: 'uint32' },
    //   { name: 'storageId', type: 'uint32' },
    // ],
    RabbitWithdraw: [
      {type: 'uint32', name: 'payerId'},
      {type: 'address', name: 'payerAddr'},
      {type: 'uint32', name: 'payeeId'},
      {type: 'address', name: 'payeeAddr'},
      {type: 'uint16', name: 'tokenID'},
      {type: 'uint96', name: 'amount'},
      {type: 'uint16', name: 'feeTokenID'},
      {type: 'uint96', name: 'maxFee'},
      {type: 'uint32', name: 'validUntil'},
      {type: 'uint32', name: 'storageID'},
      // {type: 'uint32', name: 'fromChainId'},
      // {type: 'uint32', name: 'toChainId'},
      {type: 'string', name: 'fromNetwork'},
      {type: 'string', name: 'toNetwork'},
      {type: 'address', name: 'withdrawToAddr'}

    ],
  }
  // ethers.utils
  console.log('EIP712 DOMAIN', _TypedDataEncoder.hashDomain(domain))
  
  console.log('EIP712 TYPEHASH', ethers.utils.keccak256(ethers.utils.toUtf8Bytes(_TypedDataEncoder.from(types).encodeType('RabbitWithdraw'))))
  console.log('EIP712 DOMAIN', domain)
  console.log('EIP712 types', types)
  console.log('EIP712 DATA', args.data)
  console.log('EIP712 hash', _TypedDataEncoder.hash(domain, types, args.data))
  return signer._signTypedData(domain, types, args.data)
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
      if (!walletProvider || !defaultNetwork || !account.accAddress || !account.accountId) return
      // return
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
      const baseURL = 'https://uat2.loopring.io'
      LoopringAPI.rabbitWithdrawAPI?.setBaseUrl(baseURL)
      LoopringAPI.userAPI?.setBaseUrl(baseURL)
      const feeInfo = await LoopringAPI.userAPI?.getUserCrossChainFee({
        receiveFeeNetwork: network,
        calFeeNetwork: network,
        requestType: OffchainFeeReqType.RABBIT_OFFCHAIN_WITHDRAWAL,
        tokenSymbol: token.symbol,
        amount: token.amount,
      }, account.apiKey)
      const fee = feeInfo?.fees.find(item => item.token === feeToken.symbol)!
      debugger
      
      const config = await LoopringAPI.rabbitWithdrawAPI!.getConfig()
      const configiJSON = JSON.parse(config.config)
      const agents = await LoopringAPI.rabbitWithdrawAPI?.getNetworkWithdrawalAgents({
        tokenId: 1,
        amount: utils.parseEther('0.01').toString(),
        network,
      })
      const storageId =await LoopringAPI.userAPI?.getNextStorageId(
        {
          accountId: account.accountId,
          sellTokenId: token.tokenId,
        },
        account.apiKey,
      );
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
          payerAddr: account.accAddress,
          payeeId: agentId,
          payeeAddr: agentAddr,
          token: {
            tokenId: token.tokenId,
            volume: token.amount
          },
          maxFee: {
            // @ts-ignore
            tokenId: fee.tokenId,
            volume: utils.parseEther('0.1').toString(),
          },
          storageId: storageId!.offchainId,
          validUntil: getTimestampDaysLater(DAYS),
        }
      }
      // const request = {"fromNetwork":"SEPOLIA","toAddress":"0xb4a0c11e4d0d434bb4e9a133e5a6b7b058530e22","toNetwork":"SEPOLIA","transfer":{"exchange":"0xD55d5CBC973373E7A5333Fd4F8901fcFE79a41F1","payerId":10008,"payerAddr":"0xb4a0c11e4d0d434bb4e9a133e5a6b7b058530e22","payeeId":10005,"payeeAddr":"0xe920D55f542da622a2Bcc0c416a1bc1523917977","token":{"tokenId":0,"volume":"10000000000000000"},"maxFee":{"tokenId":0,"volume":"16890000000000000"},"storageId":81,"validUntil":1737621766}}
      
      // const request = {"ecdsaSignature":"0xf3df1956d240419655ec25505c89acf5c51fdba22b21d3a1c3c13787159b0a2f65c94735c8b17e1e72fe75c16c822d862f7b5b23619669a0a8280c55a0147d451b","fromNetwork":"SEPOLIA","toAddress":"0xb4a0c11e4d0d434bb4e9a133e5a6b7b058530e22","toNetwork":"SEPOLIA","transfer":{"exchange":"0xD55d5CBC973373E7A5333Fd4F8901fcFE79a41F1","payerId":10008,"payerAddr":"0xe920D55f542da622a2Bcc0c416a1bc1523917977","payeeId":10005,"payeeAddr":"0xb4a0c11e4d0d434bb4e9a133e5a6b7b058530e22","token":{"tokenId":0,"volume":"10000000000000000"},"maxFee":{"tokenId":0,"volume":"77100000000000000"},"storageId":81,"validUntil":1736683514,"ecdsaSignature":"0xf3df1956d240419655ec25505c89acf5c51fdba22b21d3a1c3c13787159b0a2f65c94735c8b17e1e72fe75c16c822d862f7b5b23619669a0a8280c55a0147d451b"}}
      const mapRequestToTypedData = (request: Record<string, any>) => {
        const mapChainNameToId = (name: string) => {
        if (name.toLowerCase() === 'sepolia') {
          return 11155111
        } else {
          throw 'not handled'
        }}
        return {
          // fromChainId: mapChainNameToId(request['fromNetwork']),
          // toChainId: mapChainNameToId(request['toNetwork']),
          fromNetwork: request['fromNetwork'],
          toNetwork: request['toNetwork'],
          withdrawToAddr: request['toAddress'],
          payerId: request['transfer']['payerId'],
          payerAddr: request['transfer']['payerAddr'],
          payeeId: request['transfer']['payeeId'],
          payeeAddr: request['transfer']['payeeAddr'],
          tokenID: request['transfer']['token']['tokenId'],
          amount: request['transfer']['token']['volume'],
          feeTokenID: request['transfer']['maxFee']['tokenId'],
          maxFee: request['transfer']['maxFee']['volume'],
          validUntil: request['transfer']['validUntil'],
          storageID: request['transfer']['storageId'],
        } as Record<string, any>
      }
      
      
      
      const transfer = request.transfer
      const typedData = getTransferTypedData(transfer, defaultNetwork)
      delete typedData.types.EIP712Domain
      // const hash = _TypedDataEncoder.hash(
      //   typedData.domain,
      //   typedData.types as any,
      //   typedData.message,
      // )
       
      // console.log('hahs', hash)
      // console.log('walletProvider', walletProvider,new Web3(walletProvider as any))
      // walletProvider.sendAsync
      
      const provider = new ethers.providers.Web3Provider(walletProvider as any)

      const signature = await signFastWithdrawTypedData({
        signer: provider.getSigner(),
        chainId: defaultNetwork,
        exchangeAddress: exchange,
        data: mapRequestToTypedData(request),
      })
      debugger
      const eddsaSignature = get_EddsaSig_Transfer(request.transfer, account.eddsaKey.sk).result
      debugger
      
      
      // await new ethers.providers.Web3Provider(walletProvider as any).send('eth_requestAccounts', [])
      // await walletProvider.sendAsync!({
      //   method: 'eth_requestAccounts',
      // });]

      // const transfer_sig = await provider.getSigner()._signTypedData(typedData.domain, typedData.types as any, typedData.message)
      // const requestWithTransferSig = {
      //   ...request,
      //   transfer: {
      //     ...request.transfer,
      //     ecdsaSignature: transfer_sig,
      //   },
      // }
      // const {hash, hashRaw} = creatEdDSASigHasH({
      //   method: 'POST',
      //   basePath: baseURL,
      //   api_url: LOOPRING_URLs.POST_RABBIT_WITHDRAW,
      //   requestInfo: sortObjDictionary( 
      //     request
      //   ),
      // })
      // const sig = await provider.getSigner().signMessage(arrayify(hashRaw))
      
    // const result = await getEcDSASig(
    //   new Web3(walletProvider as any),
    //   typedData,
    //   transfer.payerAddr,
    //   GetEcDSASigType.HasDataStruct,
    //   defaultNetwork,
    //   account.accountId,
    //   '',
    //   ConnectorNames.Unknown,
    //   undefined,
    // ).then(x => {
    //   
    // })
    // .catch(x => {
    //   
    // })
      const ecdsaSig = signature
  
      LoopringAPI.rabbitWithdrawAPI?.submitRabitWithdraw({
        ...request,
        transfer: {
          ...request.transfer,
          eddsaSignature,
        }
      }, ecdsaSig).then(x => {
        
      })
      .catch(x => {
        
      })
      

      
    }, 5000);
  }, [walletProvider, defaultNetwork, account.accAddress, account.accountId])

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
