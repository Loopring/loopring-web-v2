import { callSwitchChain, LoopringAPI } from '@loopring-web/core'
import { connectProvides } from '@loopring-web/web3-provider'
import * as sdk from '@loopring-web/loopring-sdk'
import { mapKeys } from 'lodash'

const keyMap = [
  { short: 'n', long: 'network' },
  { short: 's', long: 'sender' },
  { short: 'a', long: 'approveHash' },
  { short: 'tx', long: 'metaTxType' },
  { short: 'vu', long: 'validUntil' },
  { short: 'cv', long: 'contractVersion' },
  { short: 'gs', long: 'guardianSign' },
  { short: 'g', long: 'guardian' },
  { short: 'e', long: 'extra' },
]
const extraKeyMap = [
  { short: 'g', long: 'guardian' },
  { short: 't', long: 'token' },
  { short: 'to', long: 'to' },
  { short: 'nm', long: 'newMasterCopy' },
  { short: 'm', long: 'masterCopy' },
  { short: 'v', long: 'value' },
  { short: 'c', long: 'data' },
  { short: 'gs', long: 'newGuardians' },
  { short: 'no', long: 'newOwner' },
]

const JSONKeyMapShortToLong = (json: any) => {
  const mapped = mapKeys(json, (_, key) => {
    return keyMap.find((k) => k.short === key)!.long
  }) as any
  return {
    ...mapped,
    extra: mapKeys(mapped.extra, (_, key) => {
      return extraKeyMap.find((k) => k.short === key)!.long
    }),
  }
}

const JSONKeyMapLongToShort = (json: any) => {
  const mapped = mapKeys(json, (_, key) => {
    return keyMap.find((k) => k.long === key)!.short
  }) as any
  return {
    ...mapped,
    extra: mapKeys(mapped.extra, (_, key) => {
      return extraKeyMap.find((k) => k.long === key)!.short
    }),
  }
}

export const getHash = async (args: {
  web3: any
  guardianAddr: string
  senderAddr: string
  metaTxType: number
  networkName: sdk.NetworkWallet
  validUntil: number
  metaTxData: any
  moduleAddress: string
  isHWAddr: boolean
}) => {
  const {
    web3,
    guardianAddr,
    senderAddr,
    metaTxType,
    networkName,
    validUntil,
    moduleAddress,
    metaTxData,
    isHWAddr,
  } = args
  
  if (LoopringAPI.walletAPI && connectProvides.usedWeb3) {
    const [
      {
        // @ts-ignore
        raw_data: { data: contractTypes },
      },
      _chainId,
    ] = await Promise.all([
      LoopringAPI.walletAPI.getContractType({
        wallet: senderAddr,
        network: networkName,
      }),
      connectProvides.usedWeb3.eth.getChainId(),
    ])

    const contractType = contractTypes?.find((item) => item?.network.toUpperCase() === networkName)
    const isContract1XAddress =
      contractType && contractType.contractVersion?.startsWith('V1_') ? true : false
    return sdk.signHebaoApproveWrap({
      web3: web3,
      chainId: _chainId,
      owner: guardianAddr,
      isHWAddr: isHWAddr,
      type: metaTxType,
      // newGuardians?: any
      masterCopy: isContract1XAddress ? undefined : moduleAddress,
      wallet: senderAddr,
      validUntil: validUntil,
      forwarderModuleAddress: isContract1XAddress ? moduleAddress : undefined,
      messageData: metaTxData,
      guardian: undefined,
      walletVersion: isContract1XAddress ? 1 : 2,
    })
  }
}

export const getSignature = async (args: {
  web3: any
  guardianAddr: string
  senderAddr: string
  metaTxType: number
  networkName: sdk.NetworkWallet
  validUntil: number
  metaTxData: any
  moduleAddress: string
  isHWAddr: boolean
}) => {
  const {
    web3,
    guardianAddr,
    senderAddr,
    metaTxType,
    networkName,
    validUntil,
    moduleAddress,
    metaTxData,
    isHWAddr,
  } = args
  
  if (LoopringAPI.walletAPI && connectProvides.usedWeb3) {
    const [
      {
        // @ts-ignore
        raw_data: { data: contractTypes },
      },
      _chainId,
    ] = await Promise.all([
      LoopringAPI.walletAPI.getContractType({
        wallet: senderAddr,
        network: networkName,
      }),
      connectProvides.usedWeb3.eth.getChainId(),
    ])

    await callSwitchChain(_chainId)
    const contractType = contractTypes?.find((item) => item?.network.toUpperCase() === networkName)
    const isContract1XAddress =
      contractType && contractType.contractVersion?.startsWith('V1_') ? true : false
    return sdk.signHebaoApproveWrap({
      web3: web3,
      chainId: _chainId,
      owner: guardianAddr,
      isHWAddr: isHWAddr,
      type: metaTxType,
      // newGuardians?: any
      masterCopy: isContract1XAddress ? undefined : moduleAddress,
      wallet: senderAddr,
      validUntil: validUntil,
      forwarderModuleAddress: isContract1XAddress ? moduleAddress : undefined,
      messageData: metaTxData,
      guardian: undefined,
      walletVersion: isContract1XAddress ? 1 : 2,
    })
  }
}

export const encodeData = (data: any) => 'MetaTxWa:' + JSON.stringify(JSONKeyMapLongToShort(data))

export const decodeData = (str: string) => {
  if (str.startsWith('MetaTxWa:')) {
    return JSONKeyMapShortToLong(JSON.parse(str.slice(9)))
  } else {
    return undefined
  }
}
