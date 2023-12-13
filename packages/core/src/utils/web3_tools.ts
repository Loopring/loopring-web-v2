import { Contract } from '@ethersproject/contracts'
import { AddressZero } from '@ethersproject/constants'
import { BigNumber } from '@ethersproject/bignumber'

import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'

import * as sdk from '@loopring-web/loopring-sdk'

import { utils } from 'ethers'
import { connectProvides } from '@loopring-web/web3-provider'
import { AddressError, myLog, isAddress } from '@loopring-web/common-resources'
import { LoopringAPI } from '../api_wrapper'

export function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(
    provider,
    typeof provider.chainId === 'number'
      ? provider.chainId
      : typeof provider.chainId === 'string'
      ? parseInt(provider.chainId)
      : 'any',
  )
  library.pollingInterval = 15000

  return library
}

export function transactionChecker(web3: any, address: string) {
  const account = address.toLowerCase()

  const subscription = web3.eth.subscribe('pendingTransactions', (err: any, _res: any) => {
    if (err) {
      console.error(err)
    }
  })

  return function watchTransactions() {
    console.log('Watch Transactions...')
    subscription.on('data', (txHash: any) => {
      setTimeout(async () => {
        try {
          let tx = await web3.eth.getTransaction(txHash)
          if (tx.to && tx.to.toLowerCase() === account) {
            const value = web3.utils.fromWei(tx.value, 'ether')
            if (value > 0) {
              console.log('watchTransactions value:', value)
            }
          }
        } catch (err) {
          console.error(err)
        }
      }, 60 * 1000)
    })
  }
}

// returns the checksummed address if the address is valid, otherwise returns false

const ETHERSCAN_PREFIXES: { [key: number]: string } = {
  1: '',
  5: 'goerli.',
}

export function getEtherscanLink(
  chainId: sdk.ChainId,
  data: string,
  type: 'transaction' | 'token' | 'address' | 'block',
): string {
  const prefix = `https://${ETHERSCAN_PREFIXES[chainId] || ETHERSCAN_PREFIXES[1]}etherscan.io`

  switch (type) {
    case 'transaction': {
      return `${prefix}/tx/${data}`
    }
    case 'token': {
      return `${prefix}/token/${data}`
    }
    case 'block': {
      return `${prefix}/block/${data}`
    }
    case 'address':
    default: {
      return `${prefix}/address/${data}`
    }
  }
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  const parsed = isAddress(address)
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
}

// add 10%
export function calculateGasMargin(value: BigNumber): BigNumber {
  return value.mul(BigNumber.from(10000).add(BigNumber.from(1000))).div(BigNumber.from(10000))
}

// account is not optional
export function getSigner(library: Web3Provider, account: string): JsonRpcSigner {
  return library.getSigner(account).connectUnchecked()
}

// account is optional
export function getProviderOrSigner(
  library: Web3Provider,
  account?: string,
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library
}

// account is optional
export function getContract(
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string,
): Contract {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  return new Contract(address, ABI, getProviderOrSigner(library, account) as any)
}

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export async function isContract(web3: any, address: string) {
  try {
    const code = await web3.eth.getCode(address)
    return code && code.length > 2
  } catch (error: any) {
    myLog(error)
  }
}

export interface AddrCheckResult {
  realAddr: string
  addressErr: AddressError
  isContract?: boolean
  ens: string
}

export async function checkAddr(address: any, web3?: any): Promise<AddrCheckResult> {
  if (!web3) {
    web3 = connectProvides.usedWeb3
  }

  let realAddr = ''

  let addressErr: AddressError = AddressError.NoError
  let isContract: undefined | boolean,
    response: any,
    ens = ''
  if (address) {
    try {
      if (/^\d{5,8}$/g.test(address) && Number(address) > 10000 && LoopringAPI.exchangeAPI) {
        const {
          accInfo: { owner },
        } = await LoopringAPI.exchangeAPI.getAccount({
          //@ts-ignore
          accountId: address,
        })
        realAddr = owner
      } else {
        utils.getAddress(address)
        realAddr = address
      }
      addressErr = AddressError.NoError
    } catch (reason: any) {
      if (web3) {
        addressErr = AddressError.NoError
        realAddr = await web3.eth?.ens?.getAddress(address).catch((_e: any) => {
          addressErr = AddressError.InvalidAddr
          return ''
        })
      } else {
        realAddr = ''
        addressErr = AddressError.ENSResolveFailed
      }
    }
    if (realAddr && web3) {
      ;[isContract, response, ens] = await Promise.all([
        sdk.isContract(web3, realAddr),
        LoopringAPI.exchangeAPI.getAccount({
          owner: realAddr,
        }),
        web3?.currentProvider?.lookupAddress(realAddr),
      ])
      if (
        isContract &&
        ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
      ) {
        addressErr = AddressError.IsNotLoopringContract
      }
    }
  } else {
    addressErr = AddressError.EmptyAddr
  }
  return {
    realAddr,
    addressErr,
    isContract,
    ens,
  }
}
