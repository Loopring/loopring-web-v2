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
  { short: 'g', long: 'guardianAddress' },
  { short: 't', long: 'token' },
  { short: 'to', long: 'to' },
  { short: 'nm', long: 'newMasterCopy' },
  { short: 'm', long: 'masterCopy' },
  { short: 'c', long: 'data' },
  { short: 'gs', long: 'newGuardians' },
  { short: 'no', long: 'newOwner' },
  { short: 'a', long: 'value' },
]

const compressCallData = (hexString: String) => {
  const hex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
  const length = hex.length;
  var compressedData = '';
  var zeroCount = 0;
  for (var i = 0; i < length; i += 2) {
      const byteStr = hex.slice(i, i + 2);
      const byteValue = parseInt(byteStr, 16)
      if (byteValue === 0) {
          zeroCount++;
      } else {
          if (zeroCount > 0) {
              compressedData += "00";
              compressedData += zeroCount.toString(16).padStart(2, '0');;
              zeroCount = 0;
          }
          compressedData += byteValue.toString(16).padStart(2, '0');
      }
  }
  
  if (zeroCount > 0) {
      compressedData += "00"
      compressedData += zeroCount.toString(16).padStart(2, '0');
  }
  return compressedData
}


function decompressCallData(compressedHexString: string) {
  let decompressedData = [] as number[];
  let length = compressedHexString.length;

  for (let i = 0; i < length; i += 2) {
      let byteStr = compressedHexString.substring(i, i + 2);
      if (byteStr === "00") {
          if (i + 2 < length) {
              let zeroCount = parseInt(compressedHexString.substring(i + 2, i + 4), 16);
              for (let j = 0; j < zeroCount; j++) {
                  decompressedData.push(0);
              }
              i += 2;
          }
      } else {
          decompressedData.push(parseInt(byteStr, 16));
      }
  }

  let result = '';
  for (let b of decompressedData) {
      result += b.toString(16).padStart(2, '0');
  }

  return '0x' + result;
}

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
    e: mapKeys(mapped.e, (_, key) => {
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

export const encodeData = (data: any) => {
  const {e,...rest} = JSONKeyMapLongToShort(data)
  return 'MetaTxWa:' + JSON.stringify(rest)
} 

export const decodeData = (str: string) => {
  if (str.startsWith('MetaTxWa:')) {
    const obj = JSONKeyMapShortToLong(JSON.parse(str.slice(9)))
    if (obj.extra.data) {
      return {
        ...obj,
        extra: {
          ...obj.extra,
          data: decompressCallData(obj.extra.data) 
        }
      }
    } else {
      return obj
    }
  } else {
    return undefined
  }
}
