import React, { useCallback } from 'react';

import { SwitchData, TradeBtnStatus, TransferProps, useOpenModals } from '@loopring-web/component-lib';
import { AccountStatus, CoinMap, IBData, SagaStatus, WalletMap } from '@loopring-web/common-resources';
import { ConnectorNames, dumpError400, OffchainFeeReqType, OriginTransferRequestV3, toBig, VALID_UNTIL } from 'loopring-sdk';
import { useTokenMap } from '../stores/token';
import { useAccount } from '../stores/account';
import { useChargeFees } from './useChargeFees';
import { LoopringAPI } from '../stores/apis/api';
import { useSystem } from '../stores/system';
import { connectProvides } from '@loopring-web/web3-provider';
import { useCustomDCEffect } from '../hooks/common/useCustomDCEffect';
import { myLog } from 'utils/log_tools';
import { useWalletLayer1 } from '../stores/walletLayer1';
import { useWalletLayer2 } from '../stores/walletLayer2';
import { makeWalletLayer2 } from '../hooks/help';
// import { useCustomDCEffect } from '../../hooks/common/useCustomDCEffect';
// import { useChargeFeeList } from './hook';

export const useTransfer = <R extends IBData<T>, T>(): {
    // handleTransfer: (inputValue:R) => void,
    transferProps: TransferProps<R, T>
    // transferValue: R
} => {
    const {tokenMap, coinMap} = useTokenMap();
    const {account} = useAccount()
    const {exchangeInfo, chainId} = useSystem();
    const {walletLayer2,status:walletLayer2Status} = useWalletLayer2();
    const [walletMap, setWalletMap] = React.useState(makeWalletLayer2().walletMap??{} as WalletMap<R>);
    // const {setShowTransfer}  = useOpenModals();
    const [transferValue, setTransferValue] = React.useState<IBData<T>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)
    const {chargeFeeList} = useChargeFees(transferValue.belong, OffchainFeeReqType.TRANSFER, tokenMap)

    const [tranferFeeInfo, setTransferFeeInfo] = React.useState<any>()
    const [payeeAddr, setPayeeAddr] = React.useState<string>('')
    React.useEffect(()=>{
        if(walletLayer2Status === SagaStatus.DONE){
            setWalletMap(makeWalletLayer2().walletMap??{} as WalletMap<R>)
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
                const transferVol = toBig(transferValue.tradeValue).times('1e' + sellToken.decimals).toFixed(0, 0)
                const storageId = await LoopringAPI.userAPI?.getNextStorageId({
                    accountId,
                    sellTokenId: sellToken.tokenId
                }, apiKey)
                const req: OriginTransferRequestV3 = {
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
                    validUntil: VALID_UNTIL,
                }
                const response = await LoopringAPI.userAPI?.submitInternalTransfer(req,
                    connectProvides.usedWeb3,
                    chainId === 'unknown' ? 5 : chainId, connectName as ConnectorNames,
                    eddsaKey.sk, apiKey)

                    myLog(response)
                //TODO check success or failed API
            } catch (e) {
                dumpError400(e)
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
        coinMap: coinMap as CoinMap<T>,
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
