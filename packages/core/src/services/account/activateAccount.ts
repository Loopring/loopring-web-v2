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
    connectName === ConnectProviders.Unknown ||
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
