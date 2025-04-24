import {
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  EddsaKey,
  callSwitchChain,
} from '../../index'
import { ChainIdExtends, FeeInfo, myLog, UIERROR_CODE } from '@loopring-web/common-resources'
import { ConnectProviders, connectProvides } from '@loopring-web/web3-provider'
import * as sdk from '@loopring-web/loopring-sdk'
import { providers, utils, Contract } from 'ethers'

export async function activateAccount({
  isHWAddr,
  referral,
  feeInfo = {} as FeeInfo,
}: {
  isHWAddr: boolean
  feeInfo?: FeeInfo
  isReset?: boolean
  referral?: string | null
}): Promise<EddsaKey> {
  // let result: ActionResult =;
  const system = store.getState().system
  let eddsaKey: any = undefined //isReset ?  //: account.eddsaKey;
  const { tokenMap } = store.getState().tokenMap
  // const {} = store.getState().account;
  const {
    accAddress,
    connectName,
    eddsaKey: { counterFactualInfo },
  } = store.getState().account

  if (
    !system.exchangeInfo?.exchangeAddress ||
    system.chainId === ChainIdExtends.NONETWORK ||
    !LoopringAPI?.exchangeAPI ||
    !accAddress
  ) {
    throw { code: UIERROR_CODE.DATA_NOT_READY }
  }
  let accInfo
  try {
    const accountResponse = await LoopringAPI.exchangeAPI.getAccount({
      owner: accAddress,
    })
    if ((accountResponse as sdk.RESULT_INFO).code || (accountResponse as sdk.RESULT_INFO).message) {
      throw accountResponse
    } else {
      accInfo = accountResponse.accInfo
    }
  } catch (error: any) {
    throw error
  }

  let keySeed = sdk.GlobalAPI.KEY_MESSAGE.replace(
    '${exchangeAddress}',
    system.exchangeInfo.exchangeAddress,
  ).replace('${nonce}', accInfo.nonce.toString())

  if (feeInfo?.belong && feeInfo.feeRaw && connectProvides.usedWeb3) {
    const feeToken = tokenMap[feeInfo.belong]
    const tokenId = feeToken.tokenId
    const fee = feeInfo.feeRaw
    const _chainId = await connectProvides.usedWeb3.eth.getChainId()
    try {
      await callSwitchChain(_chainId)
    } catch (error: any) {
      throw error
    }
    myLog('switchChain Error')

    try {
      await callSwitchChain(_chainId)
      eddsaKey = await sdk.generateKeyPair({
        web3: connectProvides.usedWeb3 as any,
        address: accInfo.owner,
        keySeed,
        walletType: (ConnectProviders[ connectName ] ?? connectName) as unknown as sdk.ConnectorNames,
        chainId: system.chainId as any,
        counterFactualInfo: counterFactualInfo ?? undefined,
      })
    } catch (error: any) {
      throw error
    }
    myLog('generateKeyPair done')

    // @ts-ignore
    const request: sdk.UpdateAccountRequestV3 = {
      // // @ts-ignore
      // recommenderAccountId: "" as any,
      exchange: system.exchangeInfo.exchangeAddress,
      owner: accInfo.owner,
      accountId: accInfo.accountId,
      publicKey: { x: eddsaKey.formatedPx, y: eddsaKey.formatedPy },
      maxFee: {
        tokenId,
        volume: fee.toString(),
      },
      validUntil: getTimestampDaysLater(DAYS),
      keySeed,
      // @ts-ignore
      recommenderAccountId: referral ? referral : undefined,
      nonce: accInfo.nonce as number,
    }

    myLog('updateAccountFromServer req:', request)
    try {
      const response = await LoopringAPI?.userAPI?.updateAccount(
        {
          request,
          web3: connectProvides.usedWeb3,
          chainId: system.chainId as any,
          walletType: (ConnectProviders[connectName] ??
            connectName) as unknown as sdk.ConnectorNames,
          isHWAddr,
          privateKey: eddsaKey.sk,
        },
        {
          accountId: accInfo.accountId,
          counterFactualInfo: eddsaKey.counterFactualInfo,
        },
      )
      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        throw response
      } else {
        myLog('updateAccountResponse:', response)
        return {
          eddsaKey,
          accInfo,
          // code: ActionResultCode.NoError,
          // data: { eddsaKey, accInfo },
        }
      }
    } catch (error) {
      throw error
    }
  } else {
    throw { code: UIERROR_CODE.ERROR_ON_FEE_UI }
  }
}

const getSmartWalletUpdateAccount = async (
  provider: providers.Web3Provider,
  KEY_MESSAGE: string,
  accInfo: sdk.AccountInfo,
  exchangeAddr: string,
  chainId: number,
  feeInfo: FeeInfo
) => {
  const { tokenMap } = store.getState().tokenMap
  const feeToken = tokenMap[feeInfo.belong]

  const signer = await provider.getSigner()

  // 计算并打印 KEY_MESSAGE 的哈希值
  const messageHash = utils.hashMessage(KEY_MESSAGE)
  const signature = await signer?.signMessage(KEY_MESSAGE)
  const eddsaKeyInfo = sdk.generatePrivateKey({
    sig: signature,
    counterFactualInfo: undefined,
    error: null,
  })
  console.log('messageHash', messageHash, 'sig', signature)
  // const verify = utils.verifyMessage(messageHash, signature)

  

  const data = {
    owner: accInfo.owner,
    accountId: accInfo.accountId,
    publicKey: {
      x: eddsaKeyInfo.formatedPx,
      y: eddsaKeyInfo.formatedPy,
    },
    exchange: exchangeAddr,
    validUntil: getTimestampDaysLater(DAYS),
    nonce: accInfo.nonce,
    maxFee: {
      tokenId: feeToken.tokenId,
      volume: feeInfo.feeRaw!.toString(),
    },
  }

  const typedData = sdk.getUpdateAccountEcdsaTypedData(
    data,
    chainId,
  )
  console.log('adhasjdhjs', data, chainId)
  delete typedData.types['EIP712Domain']
  const hash = utils._TypedDataEncoder.hash(typedData.domain, typedData.types, typedData.message)
  console.log('hash', hash)
  const eip712Sig = await signer?._signTypedData(typedData.domain, typedData.types, typedData.message)
  return {
    hash,
    eip712Sig,
    eddsaKeyInfo,
    updateAccountRequest: data as sdk.UpdateAccountRequestV3
  }
}

const approveHash = async (
  provider: providers.Web3Provider,
  hash: string,
  exchangeAddress: string,
  owner: string,
) => {
  const signer = await provider.getSigner()
  const contract = new Contract(exchangeAddress, sdk.Contracts.exchange36Abi.exchange, signer)
  return contract.approveTransaction(owner, hash)
}

export async function activateAccountSmartWallet({
  referral,
  feeInfo = {} as FeeInfo,
}: {
  feeInfo?: FeeInfo
  isReset?: boolean
  referral?: string | null
}) {
  const system = store.getState().system
  const { accAddress } = store.getState().account

  if (
    !system.exchangeInfo?.exchangeAddress ||
    system.chainId === ChainIdExtends.NONETWORK ||
    !LoopringAPI?.exchangeAPI ||
    !accAddress
  ) {
    throw { code: UIERROR_CODE.DATA_NOT_READY }
  }
  const accInfo = await LoopringAPI.exchangeAPI
    .getAccount({
      owner: accAddress,
    })
    .then((res) => {
      if ((res as sdk.RESULT_INFO).code || (res as sdk.RESULT_INFO).message) {
        throw res
      } else {
        return res.accInfo
      }
    })

  const keySeed = sdk.GlobalAPI.KEY_MESSAGE.replace(
    '${exchangeAddress}',
    system.exchangeInfo.exchangeAddress,
  ).replace('${nonce}', accInfo.nonce.toString())

  if (!feeInfo?.belong || !feeInfo.feeRaw || !connectProvides.usedWeb3) {
    throw { code: UIERROR_CODE.ERROR_ON_FEE_UI }
  }
  const _chainId = await connectProvides.usedWeb3.eth.getChainId()
  await callSwitchChain(_chainId)
  const provider = new providers.Web3Provider(connectProvides.usedWeb3.currentProvider as any)
  const { hash, eip712Sig, eddsaKeyInfo, updateAccountRequest } = await getSmartWalletUpdateAccount(
    provider,
    keySeed,
    accInfo,
    system.exchangeInfo.exchangeAddress,
    _chainId,
    feeInfo
  )
  await approveHash(provider, hash, system.exchangeInfo.exchangeAddress, accInfo.owner)

  return {
    request: { ...updateAccountRequest, hashApproved: hash, ecdsaSignature: eip712Sig },
    eddsaKey: eddsaKeyInfo
  }
}

export async function updateAccountRecursively({
  request,
  eddsaKey,
}: {
  request?: sdk.UpdateAccountRequestV3
  eddsaKey?: EddsaKey
}) {
  const system = store.getState().system
  if (!request || !connectProvides.usedWeb3) {
    throw { code: UIERROR_CODE.ERROR_ON_FEE_UI }
  }
  
  const response = await LoopringAPI?.userAPI?.checkUpdateAccount({
    request,
    web3: connectProvides.usedWeb3,
    chainId: system.chainId as any,
    isHWAddr: false,
    privateKey: eddsaKey?.eddsaKey.sk,
  })
  if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
    const isNonceNotFoundError = (response as sdk.RESULT_INFO).message === 'No confirmed approve hash '
    if (isNonceNotFoundError) {
      await sdk.sleep(15 * 1000)
      return updateAccountRecursively({ request, eddsaKey })
    } else {
      throw response
    }
  } else {
    return response
  }
}
