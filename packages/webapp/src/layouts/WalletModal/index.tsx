import { WithTranslation, withTranslation } from 'react-i18next';
import {
    FailedConnect,
    MetaMaskProcess,
    ModalWalletConnect,
    ProviderMenu,
    SuccessConnect,
    WalletConnectProcess,
    WalletConnectQRCode,
    WalletConnectStep
} from '@loopring-web/component-lib';
import React from 'react';
import { GatewayItem, gatewayList as DefaultGatewayList } from '@loopring-web/common-resources';
import { myLog } from '../../utils/log_tools';
import { ChainId, ConnectorNames } from 'loopring-sdk';
import { useAccount } from '../../stores/account';
import { connectProvides } from '@loopring-web/web3-provider';
import { useSystem } from '../../stores/system';

export const ModalWalletConnectPanel = withTranslation('common')(({
                                                                      onClose,
                                                                      open,
                                                                      t,
                                                                      ...rest
                                                                  }: { open: boolean, onClose: (e: any) => void } & WithTranslation) => {
    const {account} = useAccount();
    const {updateSystem} = useSystem();
    const gatewayList: GatewayItem[] = [
        {
            ...DefaultGatewayList[ 0 ],
            handleSelect: React.useCallback(async () => {
                // myLog('try to connect to ', ConnectorNames.Injected);
                await connectProvides.MetaMask();
                if (connectProvides.usedProvide) {
                    const chainId = Number(await connectProvides.usedWeb3?.eth.getChainId());
                    updateSystem({chainId: (chainId && chainId === ChainId.GORLI ? chainId as ChainId : ChainId.MAINNET)})
                    return
                }
            },[])
        },
        {
            ...DefaultGatewayList[ 1 ],
            handleSelect: React.useCallback(async () => {
                await connectProvides.WalletConnect();
                if (connectProvides.usedProvide) {
                    const chainId = Number(await connectProvides.usedWeb3?.eth.getChainId());
                    updateSystem({chainId: (chainId && chainId === ChainId.GORLI ? chainId as ChainId : ChainId.MAINNET)})
                    return
                }
            },[])
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
    const url = '';
    const walletList = React.useMemo(() => {
        return Object.values({
            [ WalletConnectStep.Provider ]: <ProviderMenu gatewayList={gatewayList} {...{t, ...rest}}/>,
            [ WalletConnectStep.MetaMaskProcessing ]: <MetaMaskProcess/>,
            [ WalletConnectStep.WalletConnectProcessing ]: <WalletConnectProcess/>,
            [ WalletConnectStep.WalletConnectQRCode ]: <WalletConnectQRCode url={url}/>,
            [ WalletConnectStep.SuccessConnect ]: <SuccessConnect/>,
            [ WalletConnectStep.FailedConnect ]: <FailedConnect/>,
        })

    }, [url])
    return <>
        <ModalWalletConnect open={open} onClose={onClose}
                            panelList={walletList} step={WalletConnectStep.Provider}/> </>
})


