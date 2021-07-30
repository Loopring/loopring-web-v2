import { WithTranslation, withTranslation } from 'react-i18next';
import { Box, Modal } from '@material-ui/core';
import {
    AccountStep, ApproveAccount, Depositing, DepositPanel, DepositProps, FailedDeposit, FailedUnlock, HadAccount,
    ModalAccount,
    ModalCloseButton,
    ModalContentStyled,
    ModalQRCode, NoAccount, ProcessUnlock, SuccessUnlock,
    WalletConnectStep
} from '@loopring-web/component-lib';
import React from 'react';
import { AccountBaseProps } from '@loopring-web/component-lib';

export const ModalAccountInfo = withTranslation('common')(({
                                                               onClose,
                                                               open,
                                                               depositProps,
                                                               t,
                                                               ...rest
                                                           }: { open:boolean, onClose:(e:any)=>void,depositProps:DepositProps<any,any>} & AccountBaseProps & WithTranslation) => {

    const accountList =  React.useMemo(()=>{
        return Object.values({
            [AccountStep.NoAccount]:<NoAccount  {...rest}/>,
            [AccountStep.Deposit]: <DepositPanel  {...{...depositProps,...rest}} />,
            [AccountStep.Depositing]:<Depositing/>,
            [AccountStep.FailedDeposit]:<FailedDeposit/>,
            [AccountStep.ApproveAccount]:<ApproveAccount/>,
            [AccountStep.ProcessUnlock]:<ProcessUnlock/>,
            [AccountStep.SuccessUnlock]:<SuccessUnlock/>,
            [AccountStep.FailedUnlock]:<FailedUnlock/>,
            [AccountStep.HadAccount]:<HadAccount   {...rest}/>,
        })

    },[])
    return  <ModalAccount open={open} onClose={onClose}
                          panelList={accountList} step={WalletConnectStep.Provider}/>
})