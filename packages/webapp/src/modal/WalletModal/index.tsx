import { WithTranslation, withTranslation } from 'react-i18next';
import {
    FailedConnect,
    MetaMaskProcess,
    ModalWalletConnect,
    ProviderMenu,
    SuccessConnect,
    Toast,
    useOpenModals,
    WalletConnectProcess,
    WalletConnectQRCode,
    WalletConnectStep
} from '@loopring-web/component-lib';
import { ChainId } from 'loopring-sdk'
import React, { useEffect, useState } from 'react';
import {
    ConnectProviders,
    GatewayItem,
    gatewayList as DefaultGatewayList,
    SagaStatus
} from '@loopring-web/common-resources';
import { useAccount } from 'stores/account';
import { connectProvides, ProcessingType, useConnectHook, walletServices } from '@loopring-web/web3-provider';
import { useSystem } from 'stores/system';
import { myLog } from '../../utils/log_tools';
import { copyToClipBoard } from '../../utils/obj_tools';
import { TOAST_TIME } from '../../defs/common_defs';

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
    const {
        account,
        updateAccount,
        setShouldShow,
        resetAccount,
        statusUnset: statusAccountUnset,
        status: accountStatus
    } = useAccount();
    const {updateSystem, chainId: _chainId, exchangeInfo} = useSystem();
    const {modals: {isShowConnect}, setShowConnect, setShowAccount} = useOpenModals();
    const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');
    const [stateCheck, setStateCheck] = React.useState<boolean>(false);
    const metaMaskCallback = React.useCallback(async () => {
        await connectProvides.MetaMask();
        updateAccount({connectName: ConnectProviders.MetaMask});
        // statusAccountUnset();
        if (connectProvides.usedProvide) {
            const chainId = Number(await connectProvides.usedWeb3?.eth.getChainId());
            updateSystem({chainId: (chainId && chainId === ChainId.GOERLI ? chainId as ChainId : ChainId.MAINNET)})
            return
        }
    }, []);
    const walletConnectCallback = React.useCallback(async () => {
        await connectProvides.WalletConnect();
        updateAccount({connectName: ConnectProviders.WalletConnect});
        // statusAccountUnset();
        if (connectProvides.usedProvide) {
            const chainId = Number(await connectProvides.usedWeb3?.eth.getChainId());
            updateSystem({chainId: (chainId && chainId === ChainId.GOERLI ? chainId as ChainId : ChainId.MAINNET)})
            return
        }
    }, []);

    const [processingCallback, setProcessingCallback] = React.useState<{ callback: () => Promise<void> } | undefined>(undefined)
    useEffect(() => {
        if (stateCheck === true && [SagaStatus.UNSET].findIndex((ele: string) => ele === accountStatus) !== -1) {
            myLog('clear cache connect done')
            setStateCheck(false)
            if (processingCallback !== undefined) {
                processingCallback.callback()
            }
        }

    }, [accountStatus, stateCheck])

    const gatewayList: GatewayItem[] = [
        {
            ...DefaultGatewayList[ 0 ],
            handleSelect: React.useCallback(async () => {
                if (account.connectName === DefaultGatewayList[ 0 ].key) {
                    setShowConnect({isShow: false});
                } else {
                    walletServices.sendDisconnect('', 'should new provider')
                    setShowConnect({isShow: true, step: WalletConnectStep.MetaMaskProcessing});
                    setProcessingCallback({callback: metaMaskCallback});
                    setStateCheck(true)
                }

            }, [account])
        },
        {
            ...DefaultGatewayList[ 1 ],
            handleSelect: React.useCallback(async () => {
                walletServices.sendDisconnect('', 'should new provider')
                setShowConnect({isShow: true, step: WalletConnectStep.WalletConnectProcessing});
                setProcessingCallback({callback: walletConnectCallback});
                setStateCheck(true)
            }, [account])
        },

    ]

    const handleProcessing = React.useCallback(({type, opts}: { type: keyof typeof ProcessingType, opts: any }) => {
        const {qrCodeUrl} = opts;
        if (qrCodeUrl) {
            setQrCodeUrl(qrCodeUrl)
            setShowConnect({isShow: true, step: WalletConnectStep.WalletConnectQRCode});
        }
    }, []);
    const [copyToastOpen, setCopyToastOpen] = useState(false);
    useConnectHook({handleProcessing});
    // const onCopy = React.useCallback(() => {
    //
    //     setCopyToastOpen(true)
    // }, [account])
    const walletList = React.useMemo(() => {
        return Object.values({
            [ WalletConnectStep.Provider ]: <ProviderMenu gatewayList={gatewayList}
                                                          providerName={account.connectName} {...{t, ...rest}}/>,
            [ WalletConnectStep.MetaMaskProcessing ]: <MetaMaskProcess {...{t, ...rest}}/>,
            [ WalletConnectStep.WalletConnectProcessing ]: <WalletConnectProcess {...{t, ...rest}}/>,
            [ WalletConnectStep.WalletConnectQRCode ]: <WalletConnectQRCode onCopy={() => {
                copyToClipBoard(qrCodeUrl);
                setCopyToastOpen(true);
            }} url={qrCodeUrl} {...{t, ...rest}}/>,
            [ WalletConnectStep.SuccessConnect ]: <SuccessConnect onClose={(e) => {
                setShouldShow(false);
                onClose(e);
            }}
                                                                  providerName={account.connectName} {...{t, ...rest}}/>,
            [ WalletConnectStep.FailedConnect ]: <FailedConnect{...{t, ...rest}} onRetry={resetAccount}/>,
        })
    }, [qrCodeUrl, account, t, rest, onClose])
    return <>
        <ModalWalletConnect open={isShowConnect.isShow} onClose={(e) => {
            setShouldShow(false);
            onClose(e);
        }} panelList={walletList} step={isShowConnect.step}/>
        <Toast alertText={t('Address Copied to Clipboard!')} open={copyToastOpen}
               autoHideDuration={TOAST_TIME} setOpen={setCopyToastOpen} severity={"success"}/>
    </>
})


