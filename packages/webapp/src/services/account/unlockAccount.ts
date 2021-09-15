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
            
            const {apiKey} = (await LoopringAPI.userAPI.getUserApiKey({
                accountId: account.accountId
            }, eddsaKey.sk))

            accountServices.sendAccountSigned({accountId: account.accountId, apiKey, eddsaKey})
        } catch (e) {
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