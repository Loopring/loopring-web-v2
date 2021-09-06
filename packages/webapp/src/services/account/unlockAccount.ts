import { ConnectorError, generateKeyPair } from 'loopring-sdk';
import { connectProvides } from '@loopring-web/web3-provider';
import { LoopringAPI } from 'api_wrapper';
import store from '../../stores';
import { accountServices } from './accountServices';
import { myLog } from "@loopring-web/common-resources";
import { checkErrorInfo } from 'hooks/useractions/utils';

export async function unlockAccount() {
    const account = store.getState().account;
    const {exchangeInfo} = store.getState().system;
    accountServices.sendSign()
    if (exchangeInfo && LoopringAPI.userAPI && account.nonce !== undefined) {
        try {
            const eddsaKey = await generateKeyPair(
                connectProvides.usedWeb3,
                account.accAddress,
                exchangeInfo.exchangeAddress,
                account.nonce - 1,
                account.connectName as any,
            )
            const {apiKey} = (await LoopringAPI.userAPI.getUserApiKey({
                accountId: account.accountId
            }, eddsaKey.sk))
            myLog('After connect >>,unlockAccount: step2 apiKey', apiKey)

            accountServices.sendAccountSigned(account.accountId, apiKey, eddsaKey)
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