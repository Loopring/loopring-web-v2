import { WithTranslation, withTranslation } from 'react-i18next';
import {
    AccountStep,
    ApproveAccount,
    Button,
    Depositing,
    DepositPanel,
    DepositProps,
    FailedDeposit,
    FailedUnlock,
    HadAccount,
    ModalAccount,
    ModalQRCode,
    NoAccount,
    ProcessUnlock,
    SuccessUnlock,
    Toast,
    useOpenModals
} from '@loopring-web/component-lib';
import React, { useCallback, useState } from 'react';
import { copyToClipBoard } from '../../utils/obj_tools';
import { useAccount } from '../../stores/account';
import { TOAST_TIME } from '../../defs/common_defs';
import { getShortAddr, LockIcon, UnLockIcon } from '@loopring-web/common-resources';
import { Typography } from '@material-ui/core';
import { sleep } from 'loopring-sdk';
import { walletLayer2Services } from '../../services/account/walletLayer2Services';
import { lockAccount } from '../../services/account/lockAccount';
import { unlockAccount } from '../../services/account/unlockAccount';

export const ModalAccountInfo = withTranslation('common')(({
                                                               onClose,
                                                               etherscanUrl,
                                                               open,
                                                               depositProps,
                                                               t,
                                                               ...rest
                                                           }: {
    open: boolean,
    onClose: (e: any) => void,
    depositProps: DepositProps<any, any>,
    etherscanUrl: string
} & WithTranslation) => {
    const {account, updateAccount,setShouldShow, resetAccount, statusUnset: statusAccountUnset} = useAccount();
    const {modals: {isShowAccount}, setShowConnect, setShowAccount, setShowDeposit} = useOpenModals();
    const [openQRCode, setOpenQRCode] = useState(false);
    const addressShort = getShortAddr(account.accAddress)

    // const [accountInfoProps, setAccountBaseProps] = React.useState<undefined | AccountBaseProps>(undefined)
    const [copyToastOpen, setCopyToastOpen] = useState(false);
    const onSwitch = useCallback(() => {
        setShowAccount({isShow: false})
        setShowConnect({isShow: true})
    }, [setShowConnect, setShowAccount])
    const onCopy = React.useCallback(() => {
        copyToClipBoard(account.accAddress);
        setCopyToastOpen(true)
    }, [account])
    const onViewQRCode = React.useCallback(() => {
        setOpenQRCode(true)
    }, [])
    const onDisconnect = React.useCallback(async () => {
        resetAccount();
        await sleep(10);
        statusAccountUnset();
        setShowAccount({isShow: false})
        // // setShowAccount({isShow: false,step:AccountStep.});
    }, [resetAccount, setShowAccount])


    const goDeposit = React.useCallback(() => {
        setShowAccount({isShow: true, step: AccountStep.Deposit});
    }, [setShowAccount, setShowDeposit])

    const unlockBtn =  React.useMemo(()=>{
        return <Button variant={'contained'} fullWidth size={'medium'}  onClick={() => {
            unlockAccount();
        }}>{t('labelUnLockLayer2')} </Button>},[updateAccount]);
    const lockBtn = React.useMemo(()=>{
        return <Button variant={'contained'} fullWidth size={'medium'}  onClick={() => {
            lockAccount();
        }}>{t('labelLockLayer2')} </Button>},[lockAccount]);
    // const onSwitch = {onSwitch}
    const accountList = React.useMemo(() => {
        return Object.values({
            [ AccountStep.NoAccount ]: <NoAccount {...{goDeposit,
                ...account,
                etherscanUrl,
                onSwitch, onCopy,
                // address: account.accAddress,
                // connectBy: account.connectName,
                onViewQRCode, onDisconnect, addressShort,
            }} />,
            [ AccountStep.Deposit ]: <DepositPanel  {...depositProps} />,
            [ AccountStep.Depositing ]: <Depositing/>,
            [ AccountStep.FailedDeposit ]: <FailedDeposit/>,
            [ AccountStep.SignAccount ]: <ApproveAccount/>,
            [ AccountStep.ProcessUnlock ]: <ProcessUnlock/>,
            [ AccountStep.SuccessUnlock ]: <SuccessUnlock/>,
            [ AccountStep.FailedUnlock ]: <FailedUnlock/>,
            [ AccountStep.HadAccount ]: <HadAccount {...{
                ...account,
                onSwitch, onCopy,
                etherscanUrl,
                // address: account.accAddress,
                // connectBy: account.connectName,
                onViewQRCode, onDisconnect, addressShort,
                etherscanLink: etherscanUrl + account.accAddress,
                mainBtn: account.readyState === 'ACTIVATED'?  lockBtn: unlockBtn
            }} />
        })
    }, [addressShort, account, depositProps, etherscanUrl, onCopy, onSwitch, onDisconnect, onViewQRCode])
    return <>   <Toast alertText={t('Address Copied to Clipboard!')} open={copyToastOpen}
                       autoHideDuration={TOAST_TIME} setOpen={setCopyToastOpen} severity={"success"}/>

        <ModalQRCode open={openQRCode} onClose={() => setOpenQRCode(false)} title={'ETH Address'}
                     description={account?.accAddress} url={account?.accAddress}/>
        <ModalAccount open={isShowAccount.isShow} onClose={(e)=>{
            setShouldShow(false);
            onClose(e);}} panelList={accountList} step={isShowAccount.step}/>
    </>
})