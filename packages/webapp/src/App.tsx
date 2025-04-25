import RouterView from './routers'
import { GlobalStyles } from '@mui/material'
import { css, Theme, useTheme } from '@emotion/react'
import { AccountStatus, globalCss } from '@loopring-web/common-resources'
import { AccountStep, setLanguage, useOpenModals } from '@loopring-web/component-lib'
import { useInit } from './hook'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { HashRouter as Router, useLocation } from 'react-router-dom'
import { Contract, ethers, providers, utils } from "ethers";
import { coinbaseSmartWalletPersist, store, useAccount, useAccountModal, useSystem } from '@loopring-web/core'
import { useAppKitProvider,  } from '@reown/appkit/react'
import { ChainId, DUAL_RETRY_STATUS, generatePrivateKey, getUpdateAccountEcdsaTypedData, LABEL_INVESTMENT_STATUS, SETTLEMENT_STATUS } from '@loopring-web/loopring-sdk'
import {LoopringAPI } from '@loopring-web/core'
import { connectProvides } from '@loopring-web/web3-provider'
import { parseErc6492Signature, EIP1193Provider } from 'viem'
import { type PublicClient, createPublicClient, http } from 'viem';
import { mainnet ,sepolia } from 'viem/chains';
import { a } from 'react-spring'

// import coinbaseSmartWalletPersistSlice, { persistStoreCoinbaseSmartWalletData } from '@loopring-web/core/src/stores/coinbaseSmartWalletPersist/reducer'

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
    validUntil: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 16,
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
  const storageKey = 'dashgdhgwhegh'
  const { account, updateAccount } = useAccount()
  const { persistStoreCoinbaseSmartWalletData } = coinbaseSmartWalletPersist.useCoinbaseSmartWalletPersist()
  const { setShowAccount, setShowResetAccount }=useOpenModals()
  React.useEffect(() => {
    
    setTimeout(() => {
      // setShowResetAccount({isShow: true})
      // setShowAccount({
      //   step: AccountStep.Coinbase_Smart_Wallet_Password_Forget_Password,
      //   isShow: true
      // })  
      // const response = LoopringAPI.defiAPI?.getDualTransactions(
      //           {
      //             accountId: account.accountId,
      //             settlementStatuses: SETTLEMENT_STATUS.UNSETTLED,
      //             investmentStatuses: [
      //               LABEL_INVESTMENT_STATUS.CANCELLED,
      //               LABEL_INVESTMENT_STATUS.SUCCESS,
      //               LABEL_INVESTMENT_STATUS.PROCESSED,
      //               LABEL_INVESTMENT_STATUS.PROCESSING,
      //             ].join(','),
      //             retryStatuses: [DUAL_RETRY_STATUS.RETRYING],
      //           } as any,
      //            "",
      //         ).then(x => {
      //           debugger
      //         })
      //         .catch(x => {
      //           debugger
      //         })
      // const response2 = LoopringAPI.vaultAPI?.getVaultInfoAndBalance(
      //           {
      //             accountId: account.accountId,
      //             },
      //            "",
      //         ).then(x => {
      //           debugger
      //         })
      //         .catch(x => {
      //           debugger
      //         })
              // setHasDualInvest(response.totalNum && response.totalNum > 0)
    }, 5 * 1000);
    if (!walletProvider || !system.exchangeInfo?.exchangeAddress) return
    ;(async () => {

      const data = JSON.parse(localStorage.getItem(storageKey)!)
      const params = getParams()
      
      const type = 'setAccount' as 'approveHash' | 'updateAccount' | 'signSig' | 'updateStore' | 'nothing' | 'calcHash' | 'setRedux' | 'setAccount'
      if (type === 'approveHash') {
        const provider = new providers.Web3Provider(walletProvider!);
        const signer = await provider.getSigner();
        const con = new Contract(system.exchangeInfo!.exchangeAddress, exchange, signer)
        const tx = await con.approveTransaction(params.owner, data.request.hashApproved)
      } else if (type === 'updateAccount') {
        debugger
        LoopringAPI.userAPI?.checkUpdateAccount({
          ...data,
          walletType: 'aa' as any,
          web3: connectProvides.usedWeb3, 
        } as any)
        

        
      } else  if (type === 'signSig'){
        const KEY_MESSAGE =
          'Sign this message to access Loopring Exchange: ' +
          `${params.exchange}` +
          ' with key nonce: ' +
          `0`

        const provider = new providers.Web3Provider(walletProvider!)
        const signer = await provider.getSigner()

        // 计算并打印 KEY_MESSAGE 的哈希值
        const messageHash = utils.hashMessage(KEY_MESSAGE)
        const signature = await signer?.signMessage(KEY_MESSAGE)
        const ddd = parseErc6492Signature(signature as any)
        const aaa = generatePrivateKey({
          sig: signature,
          counterFactualInfo: undefined,
          error: null,
        })
        console.log('messageHash', messageHash, 'sig', signature)
        // const verify = utils.verifyMessage(messageHash, signature)

        debugger

        const yo = getUpdateAccountEcdsaTypedData(
          {
            owner: params.owner,
            accountId: params.accountId,
            publicKey: {
              x: aaa.formatedPx,
              y: aaa.formatedPy,
            },
            exchange: params.exchange,
            validUntil: params.validUntil,
            nonce: params.nonce,
            maxFee: {
              tokenId: 0,
              volume: utils.parseEther('0.0001').toString(),
            },
          },
          params.chainId,
        )
        delete yo.types['EIP712Domain']
        const hash = utils._TypedDataEncoder.hash(yo.domain, yo.types, yo.message)
        const eip712Sig = await signer?._signTypedData(yo.domain, yo.types, yo.message)
        localStorage.setItem(
          storageKey,
          JSON.stringify({
            request: {
              owner: params.owner,
              accountId: params.accountId,
              publicKey: {
                x: aaa.formatedPx,
                y: aaa.formatedPy,
              },
              exchange: params.exchange,
              validUntil: params.validUntil,
              nonce: params.nonce,
              maxFee: {
                tokenId: 0,
                volume: utils.parseEther('0.0001').toString(),
              },
              hashApproved: hash,
              ecdsaSignature: eip712Sig,
            },
            privateKey: aaa.sk,
            chainId: params.chainId,
            // walletType: 'aa' as any,
            // web3: connectProvides.usedWeb3,
            isHWAddr: true,
          }),
        )
      } else if (type === 'updateStore') {
        const data = JSON.parse(localStorage.getItem(storageKey)!) as any
        const apiKey = await LoopringAPI.userAPI?.getUserApiKey({
          accountId: data.request.accountId,
        }, data.privateKey)
        debugger
        updateAccount({
          accAddress: data.request.owner,
            readyState: AccountStatus.ACTIVATED,
            accountId: data.request.accountId,
            apiKey: apiKey!.apiKey,
            frozen: false,
            eddsaKey: {
              keyPair: {
                publicKeyX: data.request.publicKey.x,
                publicKeyY: data.request.publicKey.y,
              },
              sk: data.privateKey
            },
            publicKey: data.request.publicKey,
            nonce: 0,
            keyNonce: 0,
        })
        
      } else if (type === 'calcHash') {
        const typedData = getUpdateAccountEcdsaTypedData(
          {
            accountId: 10503,
            exchange: '0xD55d5CBC973373E7A5333Fd4F8901fcFE79a41F1',
            // hashApproved: '0x22e5b73a2ece38bd2d6e92e613e5fcb8dcc3d2bfb2e57d109b88ffa3d008a07b',
            maxFee: { tokenId: 0, volume: '19940000000000' },
            nonce: 1,
            owner: '0x87b39640fd704e87daa5ba65d0ae4e2b70f7767d',
            publicKey: {
              x: '0x05c2016630264ff92577413bb659754280f4b9fad16cdb8782aab9d94397e649',
              y: '0x1dafc09b7a4f40d8edc71fe56515f49eb197d25d4c33181b61912c30912cc6d5',
            },
            validUntil: 1747757200,
          },
          ChainId.SEPOLIA,
        )
        delete typedData.types['EIP712Domain']
        const hash = utils._TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.message)
        debugger
      } else if (type === 'setRedux') {
        persistStoreCoinbaseSmartWalletData({
          wallet: '0x87b39640Fd704E87daA5bA65D0ae4e2B70f7767d',
          eddsaKey: {
            sk: '0x05c2016630264ff92577413bb659754280f4b9fad16cdb8782aab9d94397e649',
            formatedPx: '0x1dafc09b7a4f40d8edc71fe56515f49eb197d25d4c33181b61912c30912cc6d5',
            formatedPy: '0x05c2016630264ff92577413bb659754280f4b9fad16cdb8782aab9d94397e649',
            keyPair: {
              publicKeyX: '0x05c2016630264ff92577413bb659754280f4b9fad16cdb8782aab9d94397e649',
              publicKeyY: '0x1dafc09b7a4f40d8edc71fe56515f49eb197d25d4c33181b61912c30912cc6d5',
              secretKey: '0x05c2016630264ff92577413bb659754280f4b9fad16cdb8782aab9d94397e649',
            },
          },
          nonce: 3
        })
        // debugger
        // store.dispatch(
        //   a
        // )
      } else if (type === 'setAccount') {
        
        
      }
      
    })()
  }, [walletProvider, system.exchangeInfo?.exchangeAddress])
  // React.useEffect(() => {
  //   if (!walletProvider || !system.exchangeInfo?.exchangeAddress) return
  //   ;(async () => {
  //     const provider = new providers.Web3Provider(walletProvider!);
  //     const params = getParams()
  //     const KEY_MESSAGE =
  //     'Sign this message to access Loopring Exchange: ' +
  //     `${params.exchange}` +
  //     ' with key nonce: ' +
  //     `0`
      
  //     const signer = await provider.getSigner();
      
  //     // 计算并打印 KEY_MESSAGE 的哈希值
  //     const messageHash = utils.hashMessage(KEY_MESSAGE);
  //     const signature = await signer?.signMessage(KEY_MESSAGE);
  //     const ddd = parseErc6492Signature(signature as any)
  //     const aaa = generatePrivateKey({sig: signature, counterFactualInfo: undefined, error: null})
  //     console.log('messageHash', messageHash, 'sig', signature);
  //     // const verify = utils.verifyMessage(messageHash, signature)
      
  //     debugger

  //     const yo = getUpdateAccountEcdsaTypedData({
  //       owner: params.owner,
  //       accountId: params.accountId,
  //       publicKey: {
  //         x: aaa.formatedPx, y: aaa.formatedPy
  //       },
  //       exchange: params.exchange,
  //       validUntil: params.validUntil,
  //       nonce: params.nonce,
  //       maxFee: {
  //         tokenId: 0,
  //         volume: utils.parseEther('0.0001').toString()
  //       },
  //     }, params.chainId)
  //     delete yo.types['EIP712Domain']
  //     const hash = utils._TypedDataEncoder.hash(yo.domain, yo.types, yo.message)
      
  //     localStorage.setItem('dashgdhgwhegh', JSON.stringify({
  //       request: {
  //         owner: params.owner,
  //         accountId: params.accountId,
  //         publicKey: {
  //           x: aaa.formatedPx, y: aaa.formatedPy
  //         },
  //         exchange: params.exchange,
  //         validUntil: params.validUntil,
  //         nonce: params.nonce,
  //         maxFee: {
  //           tokenId: 0,
  //           volume: utils.parseEther('0.0001').toString()
  //         },
  //         hashApproved: hash
  //       },
  //       privateKey: aaa.sk,
  //       chainId: params.chainId,
  //       // walletType: 'aa' as any,
  //       // web3: connectProvides.usedWeb3, 
  //       isHWAddr: true, 
  //     }))
  //     // const con = new Contract(system.exchangeInfo!.exchangeAddress, exchange, signer)
  //     // LoopringAPI.userAPI?.checkUpdateAccount({
  //     //   request: {
  //     //     owner: params.owner,
  //     //     accountId: params.accountId,
  //     //     publicKey: {
  //     //       x: aaa.formatedPx, y: aaa.formatedPy
  //     //     },
  //     //     exchange: params.exchange,
  //     //     validUntil: params.validUntil,
  //     //     nonce: params.nonce,
  //     //     maxFee: {
  //     //       tokenId: 0,
  //     //       volume: utils.parseEther('0.0001').toString()
  //     //     },
  //     //     hashApproved: hash
  //     //   },
  //     //   privateKey: aaa.sk,
  //     //   chainId: params.chainId,
  //     //   walletType: 'aa' as any,
  //     //   web3: connectProvides.usedWeb3, 
  //     //   isHWAddr: true, 
  //     // } as any)
  //     // const tx = await con.approveTransaction(params.owner, hash)
  //   })()
  // }, [walletProvider, system.exchangeInfo?.exchangeAddress])

  React.useEffect(() => {

    const client = createPublicClient({
      chain: sepolia,
      transport: http(),
    })
    
    // isWalletACoinbaseSmartWallet({
    //   client,
    //   userOp: {sender: '0x87b39640Fd704E87daA5bA65D0ae4e2B70f7767d'}
    // }).then(res => {
    //   debugger
    //   console.log('res', res)
    // }).catch(err => {
    //   debugger
    //   console.log('err', err)
    // })
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
