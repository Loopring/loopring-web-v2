import { ConnectorError, generateKeyPair } from 'loopring-sdk';
import { connectProvides } from '@loopring-web/web3-provider';
import { LoopringAPI } from 'api_wrapper';
import store from '../../stores';
import { accountServices } from './accountServices';
import { myLog } from "@loopring-web/common-resources";
import { checkErrorInfo } from 'hooks/useractions/utils';

import * as sdk from 'loopring-sdk'

export async function unlockAccount() {
    const account = store.getState().account;
    const {exchangeInfo} = store.getState().system;
    accountServices.sendSign()

    myLog('unlockAccount account:', account)

    if (exchangeInfo && LoopringAPI.userAPI && account.nonce !== undefined) {
        try {
            
            const connectName = account.connectName as sdk.ConnectorNames

            const eddsaKey = await generateKeyPair({
                web3: connectProvides.usedWeb3,
                address: account.accAddress,
                exchangeAddress: exchangeInfo.exchangeAddress,
                keyNonce: account.nonce - 1,
                walletType: connectName,
            })

            myLog('unlockAccount eddsaKey:', eddsaKey)
            myLog('unlockAccount connectName:', connectName)
            myLog('unlockAccount accountId:', account.accountId)
            
            const { apiKey, raw_data, } = (await LoopringAPI.userAPI.getUserApiKey({
                accountId: account.accountId
            }, eddsaKey.sk))

            myLog('unlockAccount raw_data:', raw_data)

            if (!apiKey && raw_data.resultInfo) {
                myLog('try to sendErrorUnlock....')
                accountServices.sendErrorUnlock()
            } else {
                myLog('try to sendAccountSigned....')
                accountServices.sendAccountSigned({accountId: account.accountId, apiKey, eddsaKey})
            }
        } catch (e) {
            myLog('unlockAccount e:', e)

            const errType = checkErrorInfo(e, true)
            switch (errType) {
                case ConnectorError.USER_DENIED:
                    accountServices.sendSignDeniedByUser()
                    return
                default:
                    break
            }
            accountServices.sendErrorUnlock()
        }

    }
}