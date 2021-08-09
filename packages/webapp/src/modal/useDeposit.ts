import React, { useCallback } from 'react';

import { DepositProps, SwitchData, TradeBtnStatus, useOpenModals } from '@loopring-web/component-lib';
import { AccountStatus, CoinMap, ConnectProviders, IBData, WalletMap } from '@loopring-web/common-resources';
import * as sdk from 'loopring-sdk';
import { useTokenMap } from '../stores/token';
import { useAccount } from '../stores/account';
import { useSystem } from '../stores/system';
import { connectProvides } from '@loopring-web/web3-provider';
import { LoopringAPI } from 'stores/apis/api';
import { dumpError400, GetAllowancesRequest } from 'loopring-sdk';
import { myLog } from 'utils/log_tools';
import { useWalletLayer1 } from '../stores/walletLayer1';
import { useCustomDCEffect } from '../hooks/common/useCustomDCEffect';

export const useDeposit = <R extends IBData<T>, T>(): {
    depositProps: DepositProps<R, T>
} => {
    const {tokenMap, coinMap} = useTokenMap();
    const {account} = useAccount()
    const {exchangeInfo, chainId, gasPrice} = useSystem();
    const [depositValue, setDepositValue] = React.useState<IBData<T>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)
    const {walletLayer1} = useWalletLayer1();
    const {setShowDeposit}  = useOpenModals();

    
    // walletMap1: WalletMap<T> | undefined, ShowDeposit: (isShow: boolean, defaultProps?: any) => void
    const handleDeposit = React.useCallback(async (inputValue: any) => {
        const {accountId, accAddress, readyState, apiKey, connectName, eddsaKey} = account

        console.log(LoopringAPI.exchangeAPI, connectProvides.usedWeb3)
        if ((readyState !== AccountStatus.UN_CONNECT
            && inputValue.tradeValue)
            && tokenMap && exchangeInfo && connectProvides.usedWeb3 && LoopringAPI.exchangeAPI) {
            try {
                const tokenInfo = tokenMap[inputValue.belong]
                const gasLimit = parseInt(tokenInfo.gasAmounts.deposit)
                let nonce = await sdk.getNonce(connectProvides.usedWeb3, account.accAddress)

                const fee = 0
                
                const isMetaMask = connectName === ConnectProviders.MetaMask

                const req: GetAllowancesRequest = { owner: account.accAddress, token: tokenInfo.symbol}

                if (tokenInfo.symbol.toUpperCase() !== 'ETH') {

                    const { tokenAllowances } = await LoopringAPI.exchangeAPI.getAllowances(req, tokenMap)
    
                    const allowance = sdk.toBig(tokenAllowances[tokenInfo.symbol])
    
                    const curValInWei = sdk.toBig(inputValue.tradeValue).times('1e' + tokenInfo.decimals)
    
                    myLog(curValInWei.toString(), allowance.toString())
    
                    if (curValInWei.gt(allowance)) {
                        myLog(curValInWei, allowance, ' need approveMax!')
                        await sdk.approveMax(connectProvides.usedWeb3, account.accAddress, tokenInfo.address,
                            exchangeInfo?.depositAddress, gasPrice ?? 30, gasLimit, chainId === 'unknown' ? undefined : chainId, nonce, isMetaMask)
                        nonce += 1
                    } else {
                        myLog('allowance is enough! don\'t need approveMax!')
                    }

                }

                myLog('before deposit:', chainId, connectName, isMetaMask)

                const response2 = await sdk.deposit(connectProvides.usedWeb3, account.accAddress,
                    exchangeInfo?.exchangeAddress, tokenInfo, inputValue.tradeValue, fee,
                    gasPrice ?? 20, gasLimit, chainId === 'unknown' ? 1 : chainId, nonce, isMetaMask)

                myLog('response2:', response2)

                //TODO check success or failed API
            } catch (e) {

                dumpError400(e)

            }

        } else {
            return false
        }

    }, [account, tokenMap, chainId, exchangeInfo, gasPrice, LoopringAPI.exchangeAPI])

    const onDepositClick = useCallback((depositValue) => {
        myLog('onDepositClick depositValue:', depositValue)
        if (depositValue && depositValue.belong) {
            handleDeposit(depositValue as R)
        }
        setShowDeposit({isShow:false})
        //ShowDeposit(false)
    }, [depositValue, handleDeposit, setShowDeposit])

    const handlePanelEvent = useCallback(async(data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise<void>((res: any) => {
            res();
        })
    }, [depositValue, setDepositValue])

    const depositProps = {
        tradeData: {belong: undefined} as any,
        coinMap: coinMap as CoinMap<any>,
        walletMap: walletLayer1 as WalletMap<any>,
        depositBtnStatus: TradeBtnStatus.AVAILABLE,
        onDepositClick,
        handlePanelEvent,
    }

    return {
        // handleDeposit,
        depositProps: depositProps as DepositProps<R, T>,
    }
}
