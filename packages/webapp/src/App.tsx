import RouterView from './routers'
import { GlobalStyles } from '@mui/material'
import { css, Theme, useTheme } from '@emotion/react'
import { globalCss } from '@loopring-web/common-resources'
import { setLanguage } from '@loopring-web/component-lib'
import { useInit } from './hook'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { HashRouter as Router, useLocation } from 'react-router-dom'
import { Contract, ethers, providers, utils } from "ethers";
import { store, useAccount, useSystem } from '@loopring-web/core'
import { useAppKitProvider,  } from '@reown/appkit/react'
import { generatePrivateKey, getUpdateAccountEcdsaTypedData } from '@loopring-web/loopring-sdk'
import {LoopringAPI } from '@loopring-web/core'
import { connectProvides } from '@loopring-web/web3-provider'
import { parseErc6492Signature, EIP1193Provider } from 'viem'
import { isWalletACoinbaseSmartWallet } from '@coinbase/onchainkit/wallet';
import { type PublicClient, createPublicClient, http } from 'viem';
import { mainnet ,sepolia } from 'viem/chains';

const ScrollToTop = () => {
  const { pathname } = useLocation()

  React.useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export const exchange = [
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint32",
        name: "accountID",
        type: "uint32",
      },
    ],
    name: "forceWithdraw",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint96",
        name: "amount",
        type: "uint96",
      },
      {
        internalType: "bytes",
        name: "extraData",
        type: "bytes",
      },
    ],
    name: "deposit",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "enum ExchangeData.NftType",
        name: "nftType",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "tokenAddress",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "nftId",
        type: "uint256",
      },
      {
        internalType: "uint96",
        name: "amount",
        type: "uint96",
      },
      {
        internalType: "bytes",
        name: "extraData",
        type: "bytes",
      },
    ],
    name: "depositNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "withdrawFromDepositRequest",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "owners",
        type: "address[]",
      },
      {
        internalType: "address[]",
        name: "tokens",
        type: "address[]",
      },
    ],
    name: "withdrawFromApprovedWithdrawals",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "getAmountWithdrawable",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "txHash",
        type: "bytes32",
      },
    ],
    name: "approveTransaction",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
];

const getParams = () => {
  // this.updateAccountRequest = UpdateAccountRequest.builder()
  //               .owner(WalletUtil.getCurrentWalletAddress(mContext))
  //               .exchange(DexExchangeInfoDataManager.getInstance(mContext).getExchangeAddress())
  //               .publicKey(p)
  //               .accountId(accountId)
  //               .validUntil(validUntil)
  //               .nonce(nonce.longValue())
  //               .build();

  const {account, system, settings} = store.getState()
  const chainId = settings.defaultNetwork
  return {
    owner: account.accAddress,
    accountId: account._accountIdNotActive!,
    validUntil: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    nonce: 0,
    exchange: system.exchangeInfo!.exchangeAddress,
    chainId
  }

}

const hash = (input:{
  owner: string
  accountId: number
  publicKey: string
  exchange: string
  validUntil: number
  nonce: number
  maxFee: ethers.BigNumber
  maxFeeTokenId: number
  chainId: number
}) => {
  // public byte[] getUpdateAccountHash(UpdateAccountRequest updateAccountRequest, long etherId) {
  // const publicKey = 
  // BigInteger publicKey = new EdDSAEngine().decode(new EddsaPoint(Numeric.toBigInt(updateAccountRequest.publicKey.x), Numeric.toBigInt(updateAccountRequest.publicKey.y)).compress());

  const hash = ethers.utils._TypedDataEncoder.encode({
    name: 'Loopring Protocol',
    version: '3.6.0',
    chainId: input.chainId,
    verifyingContract: input.exchange
  },
  {
    AccountUpdate: [
      { name: "owner", type: "address" },
      { name: "accountID", type: "uint32" },
      { name: "feeTokenID", type: "uint16" },
      { name: "maxFee", type: "uint96" },
      { name: "publicKey", type: "uint256" },
      { name: "validUntil", type: "uint32" },
      { name: "nonce", type: "uint32" }
    ]
  }
  , {
    owner: input.owner,
    accountId: input.accountId,
    // publicKey: input.publicKey,
    maxFee: input.maxFee,
    maxFeeTokenId: input.maxFeeTokenId,
    validUntil: input.validUntil,
    nonce: input.nonce
  }, )
  console.log('hash', hash)
  return hash

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
  const { walletProvider } = useAppKitProvider("eip155");
  const system = useSystem()
  React.useEffect(() => {
    if (!walletProvider || !system.exchangeInfo?.exchangeAddress) return
    ;(async () => {
      const provider = new providers.Web3Provider(walletProvider!);
      const params = getParams()
      const KEY_MESSAGE =
      'Sign this message to access Loopring Exchange: ' +
      `${params.exchange}` +
      ' with key nonce: ' +
      `0`
      
      const signer = await provider.getSigner();
      
      // 计算并打印 KEY_MESSAGE 的哈希值
      const messageHash = utils.hashMessage(KEY_MESSAGE);
      const signature = await signer?.signMessage(KEY_MESSAGE);
      const ddd = parseErc6492Signature(signature as any)
      const aaa = generatePrivateKey({sig: signature, counterFactualInfo: undefined, error: null})
      console.log('messageHash', messageHash, 'sig', signature);
      // const verify = utils.verifyMessage(messageHash, signature)
      
      debugger

      const yo = getUpdateAccountEcdsaTypedData({
        owner: params.owner,
        accountId: params.accountId,
        publicKey: {
          x: aaa.formatedPx, y: aaa.formatedPy
        },
        exchange: params.exchange,
        validUntil: params.validUntil,
        nonce: params.nonce,
        maxFee: {
          tokenId: 0,
          volume: utils.parseEther('0.0001').toString()
        },
      }, params.chainId)
      delete yo.types['EIP712Domain']
      const hash = utils._TypedDataEncoder.hash(yo.domain, yo.types, yo.message)
      
      const con = new Contract(system.exchangeInfo!.exchangeAddress, exchange, signer)
      LoopringAPI.userAPI?.checkUpdateAccount({
        request: {
          owner: params.owner,
          accountId: params.accountId,
          publicKey: {
            x: aaa.formatedPx, y: aaa.formatedPy
          },
          exchange: params.exchange,
          validUntil: params.validUntil,
          nonce: params.nonce,
          maxFee: {
            tokenId: 0,
            volume: utils.parseEther('0.0001').toString()
          },
          hashApproved: hash
        },
        privateKey: aaa.sk,
        chainId: params.chainId,
        walletType: 'aa' as any,
        web3: connectProvides.usedWeb3, 
        isHWAddr: true, 
      } as any)
      // const tx = await con.approveTransaction(params.owner, hash)

      console.log('asdhajsdhja',aaa, hash);
    })()
  }, [walletProvider, system.exchangeInfo?.exchangeAddress])

  React.useEffect(() => {

    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    })
    
    isWalletACoinbaseSmartWallet({
      client,
      userOp: {sender: '0x87b39640Fd704E87daA5bA65D0ae4e2B70f7767d'}
    }).then(res => {
      debugger
      console.log('res', res)
    }).catch(err => {
      debugger
      console.log('err', err)
    })
  }, [])
  


  // const account = useAccount()
  // React.useEffect(() => {

  //   account.ad
    



  // }, [])

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
