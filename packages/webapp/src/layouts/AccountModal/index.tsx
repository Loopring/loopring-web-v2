import { WithTranslation, withTranslation } from 'react-i18next';
import {
    AccountStep,
    SignAccount,
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
import { getShortAddr } from '../../utils/web3_tools';
import { LockIcon, UnLockIcon } from '@loopring-web/common-resources';
import { Typography } from '@material-ui/core';
import { sleep } from 'loopring-sdk';

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
    const UnlockBtn = ({onClick}: { onClick: ({...props}: any) => void }) => {
        return <Button className={'unlock'} startIcon={<UnLockIcon fontSize={'large'}/>}
                       onClick={(event) => {
                           onClick(event)
                       }} variant={'outlined'}>
            <Typography variant={'body2'} marginTop={1 / 2}>   {t('labelUnLockLayer2')} </Typography>
        </Button>
    }


    const LockBtn = ({onClick}: { onClick: ({...props}: any) => void }) => {
        return <Button className={'lock'} startIcon={<LockIcon fontSize={'large'}/>}
                       onClick={(event) => {
                           onClick(event)
                       }} variant={'outlined'}>
            <Typography variant={'body2'} marginTop={1 / 2}>  {t('labelLockLayer2')} </Typography>
        </Button>
    }

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
    const lockCallback = React.useCallback((event) => {
        // lock(account)
        updateAccount({
            // level:string,
            apiKey: '',
            eddsaKey: '',
        })
    }, [updateAccount])
    const unLockCallback = React.useCallback((event) => {
        // unlock(account)
        // updateAccount()
        setShowAccount({isShow: true, step: AccountStep.ProcessUnlock});
    }, [updateAccount])

    const goDeposit = React.useCallback(() => {
        setShowAccount({isShow: true, step: AccountStep.Deposit});
    }, [setShowAccount, setShowDeposit])

    // const onSwitch = {onSwitch}
    const accountList = React.useMemo(() => {
        return Object.values({
            [ AccountStep.NoAccount ]: <NoAccount {...{goDeposit,
                onSwitch, onCopy,
                address: account.accAddress,
                connectBy: account.connectName,
                onViewQRCode, onDisconnect, addressShort,
                etherscanLink: etherscanUrl + account.accAddress
            }} />,
            [ AccountStep.Deposit ]: <DepositPanel  {...depositProps} />,
            [ AccountStep.Depositing ]: <Depositing/>,
            [ AccountStep.FailedDeposit ]: <FailedDeposit/>,
            [ AccountStep.SignAccount ]: <SignAccount/>,
            [ AccountStep.ProcessUnlock ]: <ProcessUnlock/>,
            [ AccountStep.SuccessUnlock ]: <SuccessUnlock/>,
            [ AccountStep.FailedUnlock ]: <FailedUnlock/>,
            [ AccountStep.HadAccount ]: <HadAccount {...{
                account,
                onSwitch, onCopy,
                address: account.accAddress,
                connectBy: account.connectName,
                onViewQRCode, onDisconnect, addressShort,
                etherscanLink: etherscanUrl + account.accAddress
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