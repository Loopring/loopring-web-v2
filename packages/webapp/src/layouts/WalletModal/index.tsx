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
import { ConnectorNames } from 'loopring-sdk';
import { useAccount } from '../../stores/account';

export const ModalWalletConnectPanel = withTranslation('common')(({
                                                                      onClose,
                                                                      open,
                                                                      t,
                                                                      ...rest
                                                                  }: { open: boolean, onClose: (e: any) => void } & WithTranslation) => {
    const {account} = useAccount();

    const gatewayList: GatewayItem[] = [
        {
            ...DefaultGatewayList[ 0 ],
            handleSelect: () => {
                myLog('try to connect to ', ConnectorNames.Injected)
                // setShowConnect({isShow: false})
            }
        },
        {
            ...DefaultGatewayList[ 1 ],
            handleSelect: () => {
                // setShowConnect({isShow: false})
            }
        },
        {
            ...DefaultGatewayList[ 2 ],
            handleSelect: () => {
                // setShowConnect({isShow: false})
            }
        },
        {
            ...DefaultGatewayList[ 3 ],
            handleSelect: () => {
                // connect(ConnectorNames.Trezor, true)
                // setShowConnect({isShow: false})
            }
        },
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


