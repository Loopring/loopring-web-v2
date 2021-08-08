import { generateKeyPair, sleep, toBig, toHex } from 'loopring-sdk';
import { connectProvides } from '@loopring-web/web3-provider';
import { LoopringAPI } from '../../stores/apis/api';
import store from '../../stores';
import { walletLayer2Services } from './walletLayer2Services';
import { myLog } from '../../utils/log_tools';

export async function unlockAccount() {
    const account = store.getState().account;
    const {exchangeInfo} = store.getState().system;
    myLog('After connect >>,unlockAccount: step1')
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
            const sk = toHex(toBig(eddsaKey.keyPair.secretKey))
            const {apiKey} = (await LoopringAPI.userAPI.getUserApiKey({
                accountId: account.accountId
            }, sk))
            myLog('After connect >>,unlockAccount: step2 apiKey',apiKey)

            walletLayer2Services.sendAccountSigned(apiKey, eddsaKey)
        }catch (e){
            walletLayer2Services.sendErrorUnlock()

        }



    }
}