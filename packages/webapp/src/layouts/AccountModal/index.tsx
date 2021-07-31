import { WithTranslation, withTranslation } from 'react-i18next';
import {
    AccountStep,
    ApproveAccount,
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
    useOpenModals,
    WalletConnectStep
} from '@loopring-web/component-lib';
import React, { useCallback, useState } from 'react';
import { copyToClipBoard } from '../../utils/obj_tools';
import { useAccount } from '../../stores/account';
import { TOAST_TIME } from '../../defs/common_defs';
import { getShortAddr } from '../../utils/web3_tools';

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
    const {account, updateAccount, status: accountStatus, errorMessage, resetAccount} = useAccount();
    const {modals: {isShowAccount}, setShowConnect, setShowAccount} = useOpenModals();
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
    const onDisconnect = React.useCallback(() => {
        resetAccount();
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
        setShowAccount({isShow: true, step:AccountStep.ProcessUnlock});
    }, [updateAccount])
    // const onSwitch = {onSwitch}
    const accountList = React.useMemo(() => {
        return Object.values({
            [ AccountStep.NoAccount ]: <NoAccount  {...{
                onSwitch, onCopy,
                address: account.accAddress,
                connectBy: account.connectName,
                onViewQRCode, onDisconnect, addressShort,
                etherscanLink: etherscanUrl + account.accAddress
            }} />,
            [ AccountStep.Deposit ]: <DepositPanel  {...depositProps} />,
            [ AccountStep.Depositing ]: <Depositing/>,
            [ AccountStep.FailedDeposit ]: <FailedDeposit/>,
            [ AccountStep.ApproveAccount ]: <ApproveAccount/>,
            [ AccountStep.ProcessUnlock ]: <ProcessUnlock/>,
            [ AccountStep.SuccessUnlock ]: <SuccessUnlock/>,
            [ AccountStep.FailedUnlock ]: <FailedUnlock/>,
            [ AccountStep.HadAccount ]: <HadAccount {...{
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
        <ModalAccount open={isShowAccount.isShow} onClose={onClose}
                      panelList={accountList} step={isShowAccount.step}/>
    </>
})