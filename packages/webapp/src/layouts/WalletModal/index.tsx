import { WithTranslation, withTranslation } from 'react-i18next';
import {
    FailedConnect,
    MetaMaskProcess,
    ModalWalletConnect,
    ProviderMenu,
    SuccessConnect, useOpenModals,
    WalletConnectProcess,
    WalletConnectQRCode,
    WalletConnectStep
} from '@loopring-web/component-lib';
import React from 'react';
import { GatewayItem, gatewayList as DefaultGatewayList } from '@loopring-web/common-resources';
import { ChainId } from 'loopring-sdk';
import { AccountStatus, useAccount } from '../../stores/account';
import {
    connectProvides,
    ErrorType,
    LoopringProvider,
    ProcessingType,
    useConnectHook
} from '@loopring-web/web3-provider';
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
    const {account,updateAccount, resetAccount} = useAccount();
    const {updateSystem,chainId:_chainId} = useSystem();
    const {modals: {isShowConnect}, setShowConnect, setShowAccount} = useOpenModals();
    // const [connectStep, setConnectStep] = React.useState<number>(0);
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');
    const gatewayList: GatewayItem[] = [
        {
            ...DefaultGatewayList[ 0 ],
            handleSelect: React.useCallback(async () => {
                resetAccount();
                setShowConnect({isShow:true,step:WalletConnectStep.MetaMaskProcessing});
                await connectProvides.MetaMask();
                updateAccount({connectName:LoopringProvider.MetaMask});
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
                resetAccount();
                setShowConnect({isShow:true,step:WalletConnectStep.WalletConnectProcessing});
                await connectProvides.WalletConnect();
                updateAccount({connectName:LoopringProvider.WalletConnect});
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
    const handleConnect = React.useCallback( ({accounts, chainId, provider}: { accounts: string, provider: any, chainId: number }) => {
        const accAddress= accounts[0];
        if(chainId !== _chainId) {
            updateSystem({chainId:chainId as ChainId});
            window.location.reload();
        }
        updateAccount({accAddress,readyState:AccountStatus.CONNECT})
    }, [_chainId ])
    const handleAccountDisconnect = React.useCallback(() => {
        debugger
        console.log('Disconnect')
    }, []);

    const handleError = React.useCallback(({type, errorObj}: { type: keyof typeof ErrorType, errorObj: any }) => {
        if (qrCodeUrl) {
            console.log('connect failed', type)
            setShowConnect({isShow:true,step:WalletConnectStep.FailedConnect});

        }
    }, []);
    const handleProcessing = React.useCallback(({type, opts}: { type: keyof typeof ProcessingType, opts: any }) => {
        const {qrCodeUrl} = opts;
        if (qrCodeUrl) {
            setQrCodeUrl(qrCodeUrl)
            setShowConnect({isShow:true,step:WalletConnectStep.WalletConnectQRCode});
        }
    }, []);

    useConnectHook({handleError, handleProcessing, handleConnect, handleAccountDisconnect});
    
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


