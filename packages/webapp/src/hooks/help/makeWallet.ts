import store from '../../stores';
import { WalletCoin,CoinKey } from '@loopring-web/common-resources';
import * as sdk from 'loopring-sdk';
import { myLog } from 'utils/log_tools';

export type WalletMapExtend<C> =    {
    [K in CoinKey<C>]?: WalletCoin<C> & {
    detail: sdk.UserBalanceInfo
}
}

export const makeWalletLayer2 = <C extends { [ key: string ]: any }>():{ walletMap: WalletMapExtend<C> | undefined } => {
    const {walletLayer2} = store.getState().walletLayer2;
    const {tokenMap} = store.getState().tokenMap;
    let walletMap: WalletMapExtend<C> | undefined;

    myLog('makeWalletLayer2 walletMap',walletLayer2)
    if (walletLayer2) {
        walletMap = Reflect.ownKeys(walletLayer2).reduce((prev, item) => {
            const {total, locked, pending: { withdraw }} = walletLayer2[ item as string ];
            const countBig = sdk.toBig(total).minus(sdk.toBig(locked)).toString()
            return {
                ...prev, [ item ]: {
                    belong: item,
                    count: sdk.fromWEI(tokenMap, item, countBig),
                    detail: walletLayer2[ item as string ]
                }
            }
        }, {} as  WalletMapExtend<C> )
    }

    return {walletMap}
}