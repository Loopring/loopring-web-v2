import { statusUnset as statusAccountUnset, updateAccountStatus } from '../../stores/account';
import { AccountStep, setShowAccount, setShowConnect } from '@loopring-web/component-lib';
import { dumpError400, generateKeyPair, sleep, toBig, toHex } from 'loopring-sdk';
import { connectProvides } from '@loopring-web/web3-provider';
import { LoopringAPI } from '../../stores/apis/api';
import { AccountInfo } from 'loopring-sdk/dist/defs/account_defs';
import store from '../../stores';
import { AccountStatus } from '@loopring-web/common-resources';

export async function unlockAccount({accInfo, shouldShow}: { accInfo: AccountInfo, shouldShow: boolean }) {
    const account = store.getState().account;
    const {exchangeInfo} = store.getState().system;
    if (account.eddsaKey && account.apiKey) {
        store.dispatch(updateAccountStatus({
            accountId: accInfo.accountId,
            level: accInfo.tags,
            readyState: AccountStatus.ACTIVATED
        }));
        store.dispatch(setShowConnect({isShow: false}));
        store.dispatch(statusAccountUnset(undefined))
    } else {
        store.dispatch(updateAccountStatus({
            accountId: accInfo.accountId,
            level: accInfo.tags,
            readyState: AccountStatus.LOCKED
        }));
        store.dispatch(statusAccountUnset(undefined))
        store.dispatch(setShowConnect({isShow: false}));
        store.dispatch(setShowAccount({isShow: shouldShow, step: AccountStep.ProcessUnlock}));
        try {
            if (exchangeInfo && LoopringAPI.userAPI) {
                const eddsaKey = await generateKeyPair(
                    connectProvides.usedWeb3,
                    account.accAddress,
                    exchangeInfo.exchangeAddress,
                    accInfo.nonce - 1,
                    account.connectName as any,
                )
                const sk = toHex(toBig(eddsaKey.keyPair.secretKey))
                // const px =
                // const py =
                const {apiKey} = (await LoopringAPI.userAPI.getUserApiKey({
                    accountId: accInfo.accountId
                }, sk))
                store.dispatch(updateAccountStatus({
                    apiKey,
                    eddsaKey,
                    publicKey: {
                        x: toHex(toBig(eddsaKey.keyPair.publicKeyX)),
                        y: toHex(toBig(eddsaKey.keyPair.publicKeyY)),
                    },
                    readyState: AccountStatus.ACTIVATED
                }));
                store.dispatch(setShowAccount({isShow: shouldShow, step: AccountStep.SuccessUnlock}));
                await sleep(1000)
                store.dispatch(setShowAccount({isShow: false}));
                store.dispatch(statusAccountUnset(undefined))
            }
        } catch (reason) {
            dumpError400(reason);
            store.dispatch(setShowAccount({isShow: shouldShow, step: AccountStep.FailedUnlock}));
            // event = (StatusChangeEvent.ErrorResponse)
        }

    }
}