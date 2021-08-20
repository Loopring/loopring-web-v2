import { generateKeyPair, sleep, toBig, toHex } from 'loopring-sdk';
import { connectProvides } from '@loopring-web/web3-provider';
import { LoopringAPI } from 'api_wrapper';
import store from '../../stores';
import { walletLayer2Services } from './walletLayer2Services';
import { myLog } from '../../utils/log_tools';

export async function unlockAccount() {
    const account = store.getState().account;
    const {exchangeInfo} = store.getState().system;
    walletLayer2Services.sendSign()
    if (exchangeInfo && LoopringAPI.userAPI && account.nonce !== undefined) {
        try{
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
            myLog('After connect >>,unlockAccount: step2 apiKey',apiKey)

            walletLayer2Services.sendAccountSigned(account.accountId, apiKey, eddsaKey)
        }catch (e){
            walletLayer2Services.sendErrorUnlock()

        }



    }
}