import { WithTranslation, withTranslation } from 'react-i18next';
import {
    FailedConnect,
    MetaMaskProcess,
    ModalWalletConnect,
    ProviderMenu,
    SuccessConnect,
    useOpenModals,
    WalletConnectProcess,
    WalletConnectQRCode,
    WalletConnectStep
} from '@loopring-web/component-lib';
import { ChainId } from 'loopring-sdk'
import React from 'react';
import { ConnectProviders, GatewayItem, gatewayList as DefaultGatewayList } from '@loopring-web/common-resources';
import { useAccount } from '../../stores/account';
import { connectProvides, ProcessingType, useConnectHook } from '@loopring-web/web3-provider';
import { useSystem } from '../../stores/system';

export const ModalWalletConnectPanel = withTranslation('common')(({
                                                                      onClose,
                                                                      open,
                                                                      // step,
                                                                      t,
                                                                      ...rest
                                                                  }: {
    // step?:number,
    open: boolean, onClose: (e: any) => void
} & WithTranslation) => {
    // const [_step, setStep] = React.useState<number>(step === undefined? WalletConnectStep.Provider: step);
    const {account, updateAccount, resetAccount, statusUnset: statusAccountUnset} = useAccount();
    const {updateSystem, chainId: _chainId, exchangeInfo} = useSystem();
    const {modals: {isShowConnect}, setShowConnect, setShowAccount} = useOpenModals();
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');
    const gatewayList: GatewayItem[] = [
        {
            ...DefaultGatewayList[ 0 ],
            handleSelect: React.useCallback(async () => {
                if (connectProvides.usedProvide && connectProvides.usedProvide) {
                    resetAccount();
                    connectProvides.clear();
                }
                setShowConnect({isShow: true, step: WalletConnectStep.MetaMaskProcessing});
                await connectProvides.MetaMask();
                updateAccount({connectName: ConnectProviders.MetaMask});
                if (connectProvides.usedProvide) {
                    const chainId = Number(await connectProvides.usedWeb3?.eth.getChainId());
                    updateSystem({chainId: (chainId && chainId === ChainId.GORLI ? chainId as ChainId : ChainId.MAINNET)})
                    return
                }
            }, [])
        },
        {
            ...DefaultGatewayList[ 1 ],
            handleSelect: React.useCallback(async () => {
                if (connectProvides.usedProvide && connectProvides.usedProvide) {
                    resetAccount();
                    connectProvides.clear();
                }
                setShowConnect({isShow: true, step: WalletConnectStep.WalletConnectProcessing});
                await connectProvides.WalletConnect();
                updateAccount({connectName: ConnectProviders.WalletConnect});
                if (connectProvides.usedProvide) {
                    const chainId = Number(await connectProvides.usedWeb3?.eth.getChainId());
                    updateSystem({chainId: (chainId && chainId === ChainId.GORLI ? chainId as ChainId : ChainId.MAINNET)})
                    return
                }
            }, [])
        },
        // {
        //     ...DefaultGatewayList[ 2 ],
        //     handleSelect:React.useCallback(async () => {
        //         // setShowConnect({isShow: false})
        //     },[])
        // },
        // {
        //     ...DefaultGatewayList[ 3 ],
        //     handleSelect: () => {
        //         // connect(ConnectorNames.Trezor, true)
        //         // setShowConnect({isShow: false})
        //     }
        // },
    ]

    const handleProcessing = React.useCallback(({type, opts}: { type: keyof typeof ProcessingType, opts: any }) => {
        const {qrCodeUrl} = opts;
        if (qrCodeUrl) {
            setQrCodeUrl(qrCodeUrl)
            setShowConnect({isShow: true, step: WalletConnectStep.WalletConnectQRCode});
        }
    }, []);

    useConnectHook({handleProcessing});

    const walletList = React.useMemo(() => {
        return Object.values({
            [ WalletConnectStep.Provider ]: <ProviderMenu gatewayList={gatewayList} {...{t, ...rest}}/>,
            [ WalletConnectStep.MetaMaskProcessing ]: <MetaMaskProcess/>,
            [ WalletConnectStep.WalletConnectProcessing ]: <WalletConnectProcess/>,
            [ WalletConnectStep.WalletConnectQRCode ]: <WalletConnectQRCode url={qrCodeUrl}/>,
            [ WalletConnectStep.SuccessConnect ]: <SuccessConnect/>,
            [ WalletConnectStep.FailedConnect ]: <FailedConnect handleRetry={resetAccount}/>,
        })

    }, [qrCodeUrl])
    return <ModalWalletConnect open={isShowConnect.isShow} onClose={onClose}
                               panelList={walletList} step={isShowConnect.step}/>
})


