import React from 'react';
import { useOpenModals, WalletConnectStep } from '@loopring-web/component-lib';
import { ErrorType, useConnectHook } from '@loopring-web/web3-provider';
import { SagaStatus } from '@loopring-web/common-resources';
import { ChainId, sleep } from 'loopring-sdk';

import { useAccount } from 'stores/account';
import { useSystem } from 'stores/system';
import { myLog } from 'utils/log_tools';
import { networkUpdate } from 'services/account/networkUpdate';
import { checkAccount } from 'services/account/checkAccount';
import { REFRESH_RATE } from 'defs/common_defs';
import { useWalletLayer2 } from 'stores/walletLayer2';
import { systemForks } from './stores/system/saga';

export function useConnect({state}: { state: keyof typeof SagaStatus }) {
    const {
        account,
        shouldShow,
        resetAccount,
        statusUnset: statusAccountUnset,
        setShouldShow,
        status: accountStatus
    } = useAccount();
    const { updateWalletLayer2,resetLayer2 } = useWalletLayer2()

    const {updateSystem, chainId: _chainId } = useSystem();
    const {setShowConnect} = useOpenModals();
    const [stateAccount, setStateAccount] = React.useState< keyof typeof SagaStatus>('DONE');
    React.useEffect(() => {
        if (stateAccount === SagaStatus.PENDING && accountStatus === SagaStatus.DONE) {
            setStateAccount('DONE')
            statusAccountUnset();
        }
    }, [stateAccount,accountStatus])
    const handleConnect = React.useCallback(async ({
                                                       accounts,
                                                       chainId,
                                                   }: { accounts: string, provider: any, chainId: ChainId | 'unknown' }) => {
        const accAddress = accounts[ 0 ];
        myLog('After connect >>,network part start: step1 networkUpdate')
        const networkFlag = networkUpdate({chainId})
        myLog('After connect >>,network part done: step2 check account')
        if (networkFlag) {
            checkAccount(accAddress);
        }
        setShouldShow(false)
        setShowConnect({isShow: !!shouldShow ?? false, step: WalletConnectStep.SuccessConnect});
        await sleep(REFRESH_RATE)
        setShowConnect({isShow: false, step: WalletConnectStep.SuccessConnect});

    }, [shouldShow, setShowConnect, setShouldShow])

    const handleAccountDisconnect = React.useCallback(async () => {
        resetAccount({shouldUpdateProvider: true});
        setStateAccount(SagaStatus.PENDING)
        await sleep(REFRESH_RATE)
        resetLayer2()
    }, [resetAccount, setStateAccount]);

    const handleError = React.useCallback(({type, errorObj}: { type: keyof typeof ErrorType, errorObj: any }) => {
        const  chainId = account._chainId === ChainId.MAINNET ||  account._chainId === ChainId.GOERLI ? account._chainId : ChainId.MAINNET
        if(_chainId !== chainId ) {
            updateSystem({chainId})
        }
        setShowConnect({isShow: !!shouldShow ?? false, step: WalletConnectStep.FailedConnect});
        resetAccount();
        statusAccountUnset();
    }, [resetAccount, statusAccountUnset, updateSystem, account._chainId,_chainId]);

    useConnectHook({handleAccountDisconnect, handleError, handleConnect});

}