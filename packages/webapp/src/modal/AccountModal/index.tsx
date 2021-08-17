import { WithTranslation, withTranslation } from 'react-i18next';
import {
    AccountStep,
    ActiveAccountProcess,
    ApproveAccount,
    Button,
    DepositApproveProcess,
    Depositing,
    DepositingProcess,
    DepositPanel,
    FailedDeposit,
    FailedTokenAccess,
    FailedUnlock,
    HadAccount,
    ModalAccount,
    ModalQRCode,
    NoAccount,
    ProcessUnlock,
    QRAddressPanel,
    SuccessUnlock,
    Toast,
    TokenAccessProcess,
    useOpenModals,
} from '@loopring-web/component-lib';
import React, { useState } from 'react';
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
import QRCode from 'qrcode.react';
import { Typography } from '@material-ui/core';

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

    const {depositProps} = useDeposit(isNewAccount)

    const {modals: {isShowAccount}, setShowConnect, setShowAccount,} = useOpenModals()

    const [openQRCode, setOpenQRCode] = useState(false)
    const addressShort = getShortAddr(account.accAddress)

    const {coinMap} = useTokenMap()

    const [copyToastOpen, setCopyToastOpen] = useState(false);

    const onSwitch = React.useCallback(() => {
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
        setShowAccount({isShow: false})
    }, [resetAccount, setShowAccount])

    const goDeposit = React.useCallback(() => {

        setShowAccount({isShow: true, step: AccountStep.Deposit});

    }, [setShowAccount])

    const goUpdateAccount = React.useCallback(async () => {

        if (!account.accAddress) {
            myLog('account.accAddress is nil')
            return
        }

        myLog('goUpdateAccount....')
        setShowAccount({isShow: true, step: AccountStep.UpdateAccountInProcess});

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
                myLog('try to sendCheckAccount...')
                walletLayer2Services.sendCheckAccount(account.accAddress)
                break
            default:
                break
        }

    }, [account, setShowAccount])
    const onQRClick = React.useCallback(() => {
        setShowAccount({isShow: true, step: AccountStep.QRCode})
    }, [])
    const unlockBtn = React.useMemo(() => {
        return <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
            setShouldShow(true);
            unlockAccount();
        }}>{t('labelUnLockLayer2')} </Button>
    }, [updateAccount, t]);
    const lockBtn = React.useMemo(() => {
        return <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
            lockAccount();
        }}>{t('labelLockLayer2')} </Button>
    }, [lockAccount, t]);
    const onBack = React.useCallback(() => {
        switch(account.readyState){
            case 'NO_ACCOUNT':
            case 'DEPOSITING':
                setShowAccount({isShow: true,step:AccountStep.NoAccount});
                break;
            case  'LOCKED':
            case  'ACTIVATED':
                setShowAccount({isShow: true,step:AccountStep.HadAccount});
                break;
            default:
                setShowAccount({isShow: false});

        }
    }, [account])
    const title = t("labelCreateLayer2Title")

    const accountList = React.useMemo(() => {
        return Object.values({
            [ AccountStep.NoAccount ]: {view: <NoAccount {...{
                goDeposit,
                ...account,
                etherscanUrl,
                onSwitch, onCopy,
                onViewQRCode, onDisconnect, addressShort,
            }} />,onQRClick},
            [ AccountStep.QRCode ]: {view: <QRAddressPanel  {...{
                    ...rest,
                    ...account,

                    etherscanUrl,

                    t
                }} />,onBack, noClose:true },
            [ AccountStep.Deposit ]: {view: <DepositPanel title={title} {...{
                ...rest,
                _height: 'var(--modal-height)',
                _width: 'var(--modal-width)',
                ...depositProps,
                t
            }} />},
            [ AccountStep.Depositing ]: {view: <Depositing label={title}
                                                    onClose={onClose}
                                                    etherscanLink={etherscanUrl + account.accAddress} {...{
                ...rest,
                t
            }} />,},
            [ AccountStep.DepositFailed ]: {view: <FailedDeposit label={title}
                                                          etherscanLink={etherscanUrl + account.accAddress}
                                                          onRetry={() => goDeposit()} {...{...rest, t}} />,onBack:()=>{
                    setShowAccount({isShow: true,step:AccountStep.Deposit});
                }},
            [ AccountStep.UpdateAccount ]: {view: <ApproveAccount {...{
                ...account,
                etherscanUrl,
                onSwitch, onCopy,
                onViewQRCode, onDisconnect, addressShort,
            }} goUpdateAccount={() => {
                goUpdateAccount()
            }}  {...{...rest, t}} />,onQRClick},
            [ AccountStep.ProcessUnlock ]: {view: <ProcessUnlock providerName={account.connectName} {...{...rest, t}} />,},
            [ AccountStep.SuccessUnlock ]: {view: <SuccessUnlock providerName={account.connectName} onClose={onClose} {...{...rest, t}} />,},
            [ AccountStep.FailedUnlock ]: {view: <FailedUnlock onRetry={() => {
                unlockAccount()
            }} {...{...rest, t}} />,},
            [ AccountStep.HadAccount ]: {view: <HadAccount {...{
                ...account,
                onSwitch, onCopy,
                etherscanUrl,

                // address: account.accAddress,
                // connectBy: account.connectName,
                onViewQRCode, onDisconnect, addressShort,
                etherscanLink: etherscanUrl + account.accAddress,
                mainBtn: account.readyState === 'ACTIVATED' ? lockBtn : unlockBtn
            }} />,onQRClick},
            [ AccountStep.TokenApproveInProcess ]: {view: <TokenAccessProcess label={title}
                                                                    providerName={account.connectName} {...{
                ...rest,
                t
            }} />,onBack:()=>{
                    setShowAccount({isShow: true,step:AccountStep.Deposit});
                }},
            [ AccountStep.DepositApproveProcess ]: {view: <DepositApproveProcess label={title}
                                                                          etherscanLink={etherscanUrl + account.accAddress}
                                                                          providerName={account.connectName} {...{
                ...rest,
                t
            }} />,},
            [ AccountStep.DepositInProcess ]: {view: <DepositingProcess label={title}
                                                                  etherscanLink={etherscanUrl + account.accAddress}
                                                                  providerName={account.connectName} {...{
                ...rest,
                t
            }} />,},
            [ AccountStep.UpdateAccountInProcess ]: {view: <ActiveAccountProcess label={title}  providerName={account.connectName} {...{
                    ...rest,
                    t
                }} />,},
            [ AccountStep.UpdateAccountFailed ]: {view: <FailedUnlock label={title} onRetry={() => {
                goUpdateAccount()
            }} {...{...rest, t}} />,onBack:()=>{
                    setShowAccount({isShow: true,step:AccountStep.UpdateAccount});
                }},
            [ AccountStep.TokenApproveFailed ]: {view: <FailedTokenAccess label={title} onRetry={() => {
                goDeposit()
            }} {...{
                t, ...rest,
                coinInfo: coinMap ? coinMap[ 'USTD' ] : undefined
            }} />,},

        })
    }, [addressShort, account, depositProps, etherscanUrl, onCopy, onSwitch, onDisconnect, onViewQRCode, t, rest])

    return <>
        <Toast alertText={t('Address Copied to Clipboard!')} open={copyToastOpen}
               autoHideDuration={TOAST_TIME} setOpen={setCopyToastOpen} severity={"success"}/>

        <ModalQRCode open={openQRCode} onClose={() => setOpenQRCode(false)} title={'ETH Address'}
                     description={account?.accAddress} url={account?.accAddress}/>

        <ModalAccount open={isShowAccount.isShow} onClose={(e) => {
            setShouldShow(false);
            onClose(e);
        }} panelList={accountList}
                      onBack={accountList[ isShowAccount.step ].onBack}
                      onQRClick={accountList[ isShowAccount.step ].onQRClick}
                      step={isShowAccount.step}/>
    </>
})