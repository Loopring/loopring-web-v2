import { WithTranslation, withTranslation } from 'react-i18next';
import {
    AccountStep, ActiveAccountProcess,
    ApproveAccount,
    Button, DepositApproveProcess,
    Depositing,
    DepositPanel,
    DepositProps,
    FailedDeposit, FailedTokenAccess,
    FailedUnlock,
    HadAccount,
    ModalAccount,
    ModalQRCode,
    NoAccount,
    ProcessUnlock,
    SuccessUnlock,
    Toast, TokenAccessProcess,
    useOpenModals
} from '@loopring-web/component-lib';
import React, { useCallback, useState } from 'react';
import { copyToClipBoard } from 'utils/obj_tools';
import { useAccount } from 'stores/account';
import { TOAST_TIME } from 'defs/common_defs';
import { ConnectProviders, getShortAddr, LockIcon, UnLockIcon } from '@loopring-web/common-resources';
import { sleep } from 'loopring-sdk';
import { lockAccount } from 'services/account/lockAccount';
import { unlockAccount } from 'services/account/unlockAccount';
import { useTokenMap } from 'stores/token';
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
    const {account,shouldShow, updateAccount,setShouldShow, resetAccount, statusUnset: statusAccountUnset} = useAccount();
    const {modals: {isShowAccount}, setShowConnect, setShowAccount, setShowDeposit} = useOpenModals();
    const [openQRCode, setOpenQRCode] = useState(false);
    const addressShort = getShortAddr(account.accAddress)
     const {coinMap} = useTokenMap();
    // const [accountInfoProps, setAccountBaseProps] = React.useState<undefined | AccountBaseProps>(undefined)
    const [copyToastOpen, setCopyToastOpen] = useState(false);
    const onSwitch = useCallback(() => {
        setShowAccount({isShow: false})
        setShouldShow(true);
        setShowConnect({isShow: shouldShow ?? false})
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
            [ AccountStep.Deposit ]: <DepositPanel title={"depositTitleAndActive"} {...{...rest, ...depositProps,t}}/>,
            [ AccountStep.Depositing ]: <Depositing label={"depositTitleAndActive"} etherscanLink={etherscanUrl + account.accAddress}  onDepositSubmit={()=>undefined}  { ...{...rest,t}}/>,
            [ AccountStep.FailedDeposit ]: <FailedDeposit label={"depositTitleAndActive"} etherscanLink={etherscanUrl + account.accAddress}  onRetry={()=>undefined} { ...{...rest,t}} />,
            [ AccountStep.SignAccount ]: <ApproveAccount   {...{
                ...account,
                etherscanUrl,
                onSwitch, onCopy,
                onViewQRCode, onDisconnect, addressShort,
            }}  goActiveAccount={()=>undefined}  { ...{...rest,t}}/>,
            [ AccountStep.ProcessUnlock ]: <ProcessUnlock providerName = {account.connectName} { ...{...rest,t}}/>,
            [ AccountStep.SuccessUnlock ]: <SuccessUnlock providerName = {account.connectName} { ...{...rest,t}}/>,
            [ AccountStep.FailedUnlock ]: <FailedUnlock onRetry={()=>undefined} { ...{...rest,t}}/>,
            [ AccountStep.HadAccount ]: <HadAccount {...{
                ...account,
                onSwitch, onCopy,
                etherscanUrl,
                // address: account.accAddress,
                // connectBy: account.connectName,
                onViewQRCode, onDisconnect, addressShort,
                etherscanLink: etherscanUrl + account.accAddress,
                mainBtn: account.readyState === 'ACTIVATED'?  lockBtn: unlockBtn
            }} />,
            [ AccountStep.TokenAccessProcess ]: <TokenAccessProcess label={"depositTitleAndActive"} providerName = {account.connectName} { ...{...rest,t}}/>,
            [ AccountStep.DepositApproveProcess ] : <DepositApproveProcess label={"depositTitleAndActive"} etherscanLink={etherscanUrl + account.accAddress} providerName = {account.connectName} { ...{...rest,t}}/>,
            [ AccountStep.ActiveAccountProcess ]: <ActiveAccountProcess  providerName = {account.connectName} { ...{...rest,t}}/>,
            [ AccountStep.FailedTokenAccess ]: <FailedTokenAccess onRetry={()=>undefined} {...{t,...rest, coinInfo: coinMap?coinMap['USTD']:undefined}}/>,


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