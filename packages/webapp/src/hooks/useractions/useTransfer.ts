import React, { useCallback } from 'react';

import { connectProvides } from '@loopring-web/web3-provider';

import { SwitchData, TradeBtnStatus, TransferProps, } from '@loopring-web/component-lib';
import { AccountStatus, CoinMap, IBData, SagaStatus, WalletMap } from '@loopring-web/common-resources';

import * as sdk from 'loopring-sdk'

import { useTokenMap } from 'stores/token';
import { useAccount } from 'stores/account';
import { useChargeFees } from './useChargeFees';
import { LoopringAPI } from 'api_wrapper';
import { useSystem } from 'stores/system';
import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
import { myLog } from 'utils/log_tools';
import { useWalletLayer2 } from 'stores/walletLayer2';
import { makeWalletLayer2 } from 'hooks/help';
import { ChainId } from 'loopring-sdk';

export const useTransfer = <R extends IBData<T>, T>(): {
    // handleTransfer: (inputValue:R) => void,
    transferProps: TransferProps<R, T>
    // transferValue: R
} => {
    const {tokenMap, totalCoinMap, } = useTokenMap();
    const {account} = useAccount()
    const {exchangeInfo, chainId} = useSystem();
    const {walletLayer2, status: walletLayer2Status} = useWalletLayer2();
    const [walletMap, setWalletMap] = React.useState(makeWalletLayer2().walletMap ?? {} as WalletMap<R>);
    // const {setShowTransfer}  = useOpenModals();
    const [transferValue, setTransferValue] = React.useState<IBData<T>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)
    const {chargeFeeList} = useChargeFees(transferValue.belong, sdk.OffchainFeeReqType.TRANSFER, tokenMap)

    const [tranferFeeInfo, setTransferFeeInfo] = React.useState<any>()
    const [payeeAddr, setPayeeAddr] = React.useState<string>('')
    React.useEffect(()=>{
        if(walletLayer2Status === SagaStatus.UNSET) {
            const walletMap = makeWalletLayer2().walletMap ?? {} as WalletMap<R>
            setWalletMap(walletMap)
        }
    },[walletLayer2Status])

    useCustomDCEffect(() => {

        if (chargeFeeList.length > 0) {
            setTransferFeeInfo(chargeFeeList[0])
        }

    }, [chargeFeeList, setTransferFeeInfo])

    const onTransferClick = useCallback(async(transferValue) => {
        const {accountId, accAddress, readyState, apiKey, connectName, eddsaKey} = account
        console.log('useCallback tranferFeeInfo:', tranferFeeInfo) 
        
        if (readyState === AccountStatus.ACTIVATED && tokenMap 
            && exchangeInfo && connectProvides.usedWeb3 
            && transferValue?.belong && tranferFeeInfo?.belong && eddsaKey?.sk) {
            
            try {
                const sellToken = tokenMap[ transferValue.belong as string ]
                const feeToken = tokenMap[ tranferFeeInfo.belong ]
                const transferVol = sdk.toBig(transferValue.tradeValue).times('1e' + sellToken.decimals).toFixed(0, 0)
                const storageId = await LoopringAPI.userAPI?.getNextStorageId({
                    accountId,
                    sellTokenId: sellToken.tokenId
                }, apiKey)
                const req: sdk.OriginTransferRequestV3 = {
                    exchange: exchangeInfo.exchangeAddress,
                    payerAddr: accAddress,
                    payerId: accountId,
                    payeeAddr,
                    payeeId: 0,
                    storageId: storageId?.offchainId,
                    token: {
                        tokenId: sellToken.tokenId,
                        volume: transferVol,
                    },
                    maxFee: {
                        tokenId: feeToken.tokenId,
                        volume: tranferFeeInfo.__raw__,
                    },
                    validUntil: sdk.VALID_UNTIL,
                }
                
                const response = await LoopringAPI.userAPI?.submitInternalTransfer({
                    request: req,
                    web3: connectProvides.usedWeb3,
                    chainId: chainId !== ChainId.GOERLI ? ChainId.MAINNET : chainId, 
                    walletType: connectName as sdk.ConnectorNames,
                    eddsaKey: eddsaKey.sk, 
                    apiKey,
                })

                    myLog(response)

                    if (response?.hash === undefined && response?.errInfo) {
                        // transfer failed
                    } else {
                        // transfer sucess
                    }
                    
            } catch (e) {
                sdk.dumpError400(e)
                // transfer failed
            }

        } else {
            return false
        }

    }, [account, tokenMap, tranferFeeInfo?.belong, transferValue, payeeAddr])

    const handlePanelEvent = useCallback(async (data: SwitchData<R>, switchType: 'Tomenu' | 'Tobutton') => {
        return new Promise<void>((res: any) => {
            if (data?.tradeData?.belong) {
                if (transferValue !== data.tradeData) {
                    setTransferValue(data.tradeData)
                }
            } else {
                setTransferValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
            }
            res();
        })
    }, [setTransferValue])

    const handleFeeChange = useCallback((value: { belong: any; 
        fee: number | string; 
        __raw__?: any }): void => {
            myLog('handleFeeChange:', value)
            setTransferFeeInfo(value)
    }, [setTransferFeeInfo])

    const transferProps = {
        tradeData: { belong: undefined } as any,
        coinMap: totalCoinMap as CoinMap<T>,
        walletMap: walletMap as WalletMap<T>, 
        transferBtnStatus: TradeBtnStatus.AVAILABLE,
        onTransferClick,
        handleFeeChange,
        handlePanelEvent,
        chargeFeeToken: 'ETH',
        chargeFeeTokenList: chargeFeeList,
        handleOnAddressChange: (value: any) => {
            myLog('transfer handleOnAddressChange:', value);
            setPayeeAddr(value)
        },
        handleAddressError: (_value: any) => {
            return {error: false, message: ''}
        }
    }

    return {
        transferProps ,
    }
}
