import { updateAccountStatus } from '../stores/account';
import { AccountStep, setShowAccount, setShowConnect } from '@loopring-web/component-lib';
import { generateKeyPair, sleep, toBig, toHex } from 'loopring-sdk';
import { connectProvides } from '@loopring-web/web3-provider';
import { LoopringAPI } from '../stores/apis/api';
import { AccountInfo } from 'loopring-sdk/dist/defs/account_defs';
import store from '../stores';
import { AccountStatus } from '@loopring-web/common-resources';

export async function unlockAccount({accInfo}: { accInfo: AccountInfo }) {
    // const  dispach =  store.dispatch;
    const account = store.getState().account;
    const {exchangeInfo} = store.getState().system;
    // const {isShowConnect}  = store.getState().modals
    // setShowConnect, setShowAccount
    // const {account, updateAccount, resetAccount} = useAccount();
    // const {updateSystem, chainId: _chainId, exchangeInfo} = useSystem();
    // const {modals: {isShowConnect}, setShowConnect, setShowAccount} = useOpenModals();
    // store.dispatch

    if (account.eddsaKey && account.apiKey) {
        store.dispatch(updateAccountStatus({
            accountId: accInfo.accountId,
            level: accInfo.tags,
            readyState: AccountStatus.ACTIVATED
        }));
        store.dispatch(setShowConnect({isShow: false}));
    } else {
        store.dispatch(updateAccountStatus({
            accountId: accInfo.accountId,
            level: accInfo.tags,
            readyState: AccountStatus.LOCKED
        }));
        store.dispatch(setShowConnect({isShow: false}));
        store.dispatch(setShowAccount({isShow: true, step: AccountStep.ProcessUnlock}));

        // await sleep(1000)
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
                store.dispatch(setShowAccount({isShow: true, step: AccountStep.SuccessUnlock}));
                await sleep(1000)
                store.dispatch(setShowAccount({isShow: false}));
            }
        } catch (reason) {
            // dumpError400(reason);
            store.dispatch(setShowAccount({isShow: true, step: AccountStep.FailedUnlock}));
            // event = (StatusChangeEvent.ErrorResponse)
        }

    }
}