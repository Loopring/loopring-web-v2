import {
    // AmmProps,
    CoinType,
    ModalPanel,
    // ResetProps, SwapProps,
    // SwitchData,
    // TradeBtnStatus,
    useOpenModals
} from '@loopring-web/component-lib';
import { ModalWalletConnectPanel } from './WalletModal';
import { ModalAccountInfo } from './AccountModal';
import React, { useState } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { useModals } from './useModals';
import { useTokenMap } from 'stores/token';
import { useWalletLayer2 } from 'stores/walletLayer2';
import { useWalletLayer1 } from 'stores/walletLayer1';
import {  AmmInData,  IBData, TradeCalcData } from '@loopring-web/common-resources';
// import { useCustomDCEffect } from 'hooks/common/useCustomDCEffect';
// import { makeWalletLayer2 } from 'hooks/help';
// import { myLog } from 'utils/log_tools';
import { useTransfer } from './useTransfer';
import { useDeposit } from './useDeposit';
import { useWithdraw } from './useWithdraw';
import { useSystem } from '../stores/system';
export function useModalProps() {

    const {
        ShowDeposit,
        ShowTransfer,
        ShowWithdraw,
        ShowResetAccount,
    } = useModals()

    // const {chainId, isConnected, connector,} = useWeb3Account()
    // const {chainId, exchangeInfo} = useSystem()
    // const {account} = useAccount()

    const {totalCoinMap: coinMap, tokenMap, marketArray, marketCoins, marketMap,} = useTokenMap()

    const walletLayer2State = useWalletLayer2();
    const walletLayer1State = useWalletLayer1();
    // const [walletMap1, setWalletMap1] = useState<WalletMap<any> | undefined>(undefined);
    // const [walletMap2, setWalletMap2] = useState<WalletMap<any> | undefined>(undefined);

    //HIGH: effect by wallet state update
    // useCustomDCEffect(() => {
    //     if (walletLayer2State.walletLayer2) {
    //         const {walletMap} = makeWalletLayer2()
    //         setWalletMap2(walletMap)
    //     }
    // }, [walletLayer2State.walletLayer2])
    //
    // useCustomDCEffect    (() => {
    //     if (walletLayer1State.walletLayer1) {
    //         // let {walletMap} =  makeWalletLayer1();
    //         setWalletMap1(walletLayer1State.walletLayer1)
    //     }
    // }, [walletLayer1State.walletLayer1])

    // useCustomDCEffect(() => {
    //     switch (walletLayer2State.status) {
    //         case "ERROR":
    //             walletLayer2State.statusUnset();
    //             // setState('ERROR')
    //             //TODO: show error at button page show error  some retry dispath again
    //             break;
    //         case "DONE":
    //             walletLayer2State.statusUnset();
    //             let {walletMap} = makeWalletLayer2();
    //             setWalletMap2(walletMap)
    //             break;
    //         default:
    //             break;
    //
    //     }
    // }, [walletLayer2State])




    const [resetValue, setResetValue] = useState<IBData<any>>({
        belong: undefined,
        tradeValue: 0,
        balance: 0
    } as IBData<unknown>)




    const tradeCalcData: TradeCalcData<CoinType> = {
        coinSell: 'ETH', //name
        coinBuy: 'LRC',
        BtoS: 0,
        StoB: 0,
        sellCoinInfoMap: coinMap,
        buyCoinInfoMap: coinMap,
        walletMap: {},
        slippage: 0.5,
        // slippageTolerance: [0.1, 0.5, 1, 'slippage:N'],
        priceImpact: '12',
        minimumReceived: '1%',
        fee: '1%'
    }
    const ammCalcData: AmmInData<{ [ key: string ]: any }> = {
        myCoinA: {belong: 'ETH', balance: 0, tradeValue: 0},
        myCoinB: {belong: 'LRC', balance: 0, tradeValue: 0},
        lpCoinA: {belong: 'ETH', balance: 0, tradeValue: 0},
        lpCoinB: {belong: 'LRC', balance: 0, tradeValue: 0},
        lpCoin: {belong: 'LP-ETH-LRC', balance: 0, tradeValue: 0},
        AtoB: 50,
        coinInfoMap: coinMap as any,
        slippage: 0.5,
        // slippageTolerance: [0.1, 0.5, 1, 'slippage:N'],
        feeJoin: '1',
        feeExit: '1',
    }

    // let resetProps: ResetProps<any, any> = {
    //     tradeData: {belong: undefined},
    //     coinMap: coinMap as CoinMap<any>,
    //     walletMap: walletMap2 as WalletMap<any>,
    //     resetBtnStatus: TradeBtnStatus.AVAILABLE,
    //     onResetClick: (tradeData: any) => {
    //         if (resetValue && resetValue.belong) {
    //         }
    //
    //         ShowResetAccount(false)
    //     },
    //     handlePanelEvent: async (data: SwitchData<any>, switchType: 'Tomenu' | 'Tobutton') => {
    //         return new Promise((res) => {
    //             if (data?.tradeData?.belong) {
    //                 if (resetValue !== data.tradeData) {
    //                     setResetValue(data.tradeData)
    //                 }
    //             } else {
    //                 setResetValue({belong: undefined, tradeValue: 0, balance: 0} as IBData<unknown>)
    //             }
    //
    //             res();
    //         })
    //     },
    //     fee: {count: 234, price: 123}
    // }
    // let swapProps: SwapProps<IBData<string>, string, any> = {
    //     tradeData: undefined,
    //     tradeCalcData,
    //     onSwapClick: (tradeData) => {
    //         myLog('Swap button click', tradeData);
    //     },
    //     handleSwapPanelEvent: async (data: any, switchType: any) => {
    //         myLog(data, switchType)
    //     },
    // };
    // let ammProps: AmmProps<AmmData<IBData<any>>, any, AmmInData<any>> = {
    //     ammDepositData: {
    //         coinA: {belong: 'ETH', balance: 0.3, tradeValue: 0},
    //         coinB: {belong: 'LRC', balance: 1000, tradeValue: 0},
    //         slippage: '',
    //     },
    //     ammWithdrawData: {
    //         coinA: {belong: 'ETH', balance: 0.3, tradeValue: 0},
    //         coinB: {belong: 'LRC', balance: 1000, tradeValue: 0},
    //         slippage: '',
    //     },
    //     // tradeCalcData,
    //     ammCalcData: ammCalcData,
    //     handleAmmAddChangeEvent: (data, type) => {
    //         myLog('handleAmmAddChangeEvent', data, type);
    //     },
    //     handleAmmRemoveChangeEvent: (data, type) => {
    //         myLog('handleAmmRemoveChangeEvent', data, type);
    //     },
    //     onAmmRemoveClick: (data) => {
    //         myLog('onAmmRemoveClick', data);
    //     },
    //     onAmmAddClick: (data) => {
    //         myLog('onAmmAddClick', data);
    //     }
    // }
    const {transferProps} = useTransfer()
    const {depositProps} = useDeposit()
    const {withdrawProps} = useWithdraw()

    return {
        depositProps, withdrawProps, transferProps,
        // resetProps, ammProps, swapProps,
    }
}


export const ModalGroup = withTranslation('common',{withRef: true})(({...rest}:WithTranslation)=>{
    const {
        depositProps,
        withdrawProps,
        transferProps,
        // resetProps,
        // ammProps,
        // swapProps,
    } = useModalProps()
    const {etherscanUrl} = useSystem();
    const {modals: {isShowAccount, isShowConnect}, setShowConnect, setShowAccount} = useOpenModals()
    // const onClose = React.useCallback(() => {
    //     setShowAccount({isShow: false})
    // }, [])
    return  <>
        <ModalPanel transferProps={transferProps} withDrawProps={withdrawProps}
                    depositProps={depositProps}
                    resetProps={{} as any}
                    ammProps={{} as any}
                    swapProps={{} as any}/>

        <ModalWalletConnectPanel {...{
            ...rest,
            // step:connectStep,
            // gatewayList,
            open: isShowConnect.isShow,
            onClose: () => setShowConnect({isShow: false})
        }} />
        <ModalAccountInfo
            {...{
                ...rest,
                depositProps,
                etherscanUrl,
                open: isShowAccount.isShow,
                onClose: () => setShowAccount({isShow: false})
            }}
        ></ModalAccountInfo>
    </>

} )