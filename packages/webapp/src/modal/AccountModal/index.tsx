import { WithTranslation, withTranslation } from 'react-i18next';
import {
    AccountStep,
    ActiveAccountProcess,
    ApproveAccount,
    Button,
    DepositApproveProcess,
    Depositing,
    DepositPanel,
    FailedDeposit,
    FailedTokenAccess,
    FailedUnlock,
    HadAccount,
    ModalAccount,
    ModalQRCode,
    NoAccount,
    ProcessUnlock,
    SuccessUnlock,
    Toast,
    TokenAccessProcess,
    useOpenModals
} from '@loopring-web/component-lib';
import React, { useCallback, useState } from 'react';
import { copyToClipBoard } from 'utils/obj_tools';
import { useAccount } from 'stores/account';
import { ActionResult, ActionResultCode, REFRESH_RATE, TOAST_TIME } from 'defs/common_defs';
import { getShortAddr } from '@loopring-web/common-resources';
import { updateAccountFromServer } from 'services/account/activeAccount';
import { lockAccount } from 'services/account/lockAccount';
import { unlockAccount } from 'services/account/unlockAccount';
import { useTokenMap } from 'stores/token';
import { myLog } from 'utils/log_tools';
import { walletServices } from '@loopring-web/web3-provider';
import { useDeposit } from 'modal/useDeposit';
import { sleep } from 'loopring-sdk';

import { walletLayer2Services } from '../../services/account/walletLayer2Services'

export const ModalAccountInfo = withTranslation('common')(({
                                                               onClose,
                                                               etherscanUrl,
                                                               open,
                                                               t,
                                                               ...rest
                                                           }: {
    open: boolean,
    onClose: (e: any) => void,
    etherscanUrl: string
} & WithTranslation) => {
    const {
        account,
        shouldShow,
        updateAccount,
        setShouldShow,
        resetAccount,
    } = useAccount();

    const isNewAccount = true

    const { depositProps } = useDeposit(isNewAccount)

    const { modals: { isShowAccount }, setShowConnect, setShowAccount, } = useOpenModals()

    const [openQRCode, setOpenQRCode] = useState(false)
    const addressShort = getShortAddr(account.accAddress)
    
    const {coinMap} = useTokenMap()
    
    const [copyToastOpen, setCopyToastOpen] = useState(false);
    const onSwitch = useCallback(() => {
        setShowAccount({isShow: false})
        setShouldShow(true);
        setShowConnect({isShow: shouldShow ?? false})
    }, [setShowConnect, setShowAccount, shouldShow])
    const onCopy = React.useCallback(() => {
        copyToClipBoard(account.accAddress);
        setCopyToastOpen(true)
    }, [account])
    const onViewQRCode = React.useCallback(() => {
        setOpenQRCode(true)
    }, [])
    const onDisconnect = React.useCallback(async () => {
        walletServices.sendDisconnect('', 'customer click disconnect');
        setShowAccount({ isShow: false })
    }, [resetAccount, setShowAccount])

    const goDeposit = React.useCallback(() => {

        setShowAccount({isShow: true, step: AccountStep.Deposit});

    }, [setShowAccount])

    const goUpdateAccount = React.useCallback(async() => {

        if (!account.accAddress) {
            myLog('account.accAddress is nil')
            return
        }

        myLog('goUpdateAccount....')
        setShowAccount({isShow: true, step: AccountStep.ActiveAccountProcess});

        const result: ActionResult = await updateAccountFromServer()

        switch (result.code) {
            case ActionResultCode.NoError:
                setShowAccount({isShow: true, step: AccountStep.SuccessUnlock})
                await sleep(REFRESH_RATE)
                setShowAccount({isShow: false})
                break
            case ActionResultCode.GetAccError:
            case ActionResultCode.GenEddsaKeyError:
            case ActionResultCode.UpdateAccoutError:
                break
            default:
                break
        }
        walletLayer2Services.sendCheckAccount(account.accAddress)

    }, [account, setShowAccount])

    const unlockBtn = React.useMemo(() => {
        return <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
            setShouldShow(true);
            unlockAccount();
        }}>{t('labelUnLockLayer2')} </Button>
    }, [updateAccount]);
    const lockBtn = React.useMemo(() => {
        return <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
            lockAccount();
        }}>{t('labelLockLayer2')} </Button>
    }, [lockAccount]);
    
    const title = t("labelCreateLayer2Title")
    
    const accountList = React.useMemo(() => {
        return Object.values({
            [ AccountStep.NoAccount ]: <NoAccount {...{
                goDeposit,
                ...account,
                etherscanUrl,
                onSwitch, onCopy,
                onViewQRCode, onDisconnect, addressShort,
            }} />,
            [ AccountStep.Deposit ]: <DepositPanel title={title} {...{
                ...rest,
                _height: 'var(--modal-height)',
                _width: 'var(--modal-width)',
                ...depositProps,
                t
            }} />,
            [ AccountStep.Depositing ]: <Depositing label={title}
                                                    onClose={onClose}
                                                    etherscanLink={etherscanUrl + account.accAddress} {...{...rest, t}} />,
            [ AccountStep.FailedDeposit ]: <FailedDeposit label={title}
                                                          etherscanLink={etherscanUrl + account.accAddress}
                                                          onRetry={ () => goDeposit() } {...{...rest, t}} />,
            [ AccountStep.SignAccount ]: <ApproveAccount {...{
                ...account,
                etherscanUrl,
                onSwitch, onCopy,
                onViewQRCode, onDisconnect, addressShort,
            }} goUpdateAccount={() => {
                goUpdateAccount()
            }}  {...{...rest, t}} />,
            [ AccountStep.ProcessUnlock ]: <ProcessUnlock providerName={account.connectName} {...{...rest, t}} />,
            [ AccountStep.SuccessUnlock ]: <SuccessUnlock providerName={account.connectName} {...{...rest, t}} />,
            [ AccountStep.FailedUnlock ]: <FailedUnlock onRetry={() => {
                unlockAccount()
            }} {...{...rest, t}} />,
            [ AccountStep.HadAccount ]: <HadAccount {...{
                ...account,
                onSwitch, onCopy,
                etherscanUrl,
                // address: account.accAddress,
                // connectBy: account.connectName,
                onViewQRCode, onDisconnect, addressShort,
                etherscanLink: etherscanUrl + account.accAddress,
                mainBtn: account.readyState === 'ACTIVATED' ? lockBtn : unlockBtn
            }} />,
            [ AccountStep.TokenAccessProcess ]: <TokenAccessProcess label={title}
                                                    providerName={account.connectName} {...{
                ...rest,
                t
            }} />,
            [ AccountStep.DepositApproveProcess ]: <DepositApproveProcess label={title}
                                                        etherscanLink={etherscanUrl + account.accAddress}
                                                        providerName={account.connectName} {...{
                ...rest,
                t
            }} />,
            [ AccountStep.ActiveAccountProcess ]: <ActiveAccountProcess providerName={account.connectName} {...{
                ...rest,
                t
            }} />,
            [ AccountStep.ActiveAccountFailed ]: <FailedUnlock label={title} onRetry={() => {
                goUpdateAccount()
            }} {...{...rest, t}} />,
            [ AccountStep.FailedTokenAccess ]: <FailedTokenAccess label={title} onRetry={() => { goDeposit() }} {...{
                t, ...rest,
                coinInfo: coinMap ? coinMap[ 'USTD' ] : undefined
            }} />,

        })
    }, [addressShort, account, depositProps, etherscanUrl, onCopy, onSwitch, onDisconnect, onViewQRCode])

    return <>
        <Toast alertText={t('Address Copied to Clipboard!')} open={copyToastOpen}
               autoHideDuration={TOAST_TIME} setOpen={setCopyToastOpen} severity={"success"}/>

        <ModalQRCode open={openQRCode} onClose={() => setOpenQRCode(false)} title={'ETH Address'}
                     description={account?.accAddress} url={account?.accAddress}/>

        <ModalAccount open={isShowAccount.isShow} onClose={(e) => {
            setShouldShow(false);
            onClose(e);
        }} panelList={accountList} step={isShowAccount.step}/>
    </>
})