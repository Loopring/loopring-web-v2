import React from 'react';
// import { walletLa } from './walletServices';
import { Commands } from './command';
import { walletLayer2Services } from './walletLayer2Services';

export function useAccountHook(
    {
        handleLockAccount,// clear private data
        handleNoAccount,//
        // TODO
        //  step1 Approve account;  click allow from provider
        //  step2 send to ETH;  click allow from provider
        handleDepositingAccount,
        handleErrorApproveToken,
        handleErrorDepositAssign,
        handleProcessDeposit,// two or one step
        handleAssignAccount, //unlock or update account  assgin
        handleProcessAssign,
        handleProcessAccountCheck,
    }

        : any) {
    const subject = React.useMemo(() => walletLayer2Services.onSocket(), []);
    React.useEffect(() => {
        const subscription = subject.subscribe(({data, status}: { status: keyof typeof Commands, data?: any }) => {
            switch (status) {
                case 'LockAccount':
                    handleLockAccount(data);
                    break;// clear private data
                case 'NoAccount':
                    handleNoAccount(data);
                    break;//
                case 'DepositingAccount':
                    handleDepositingAccount(data);
                    break;
                case 'ErrorApproveToken':
                    handleErrorApproveToken(data);
                    break;
                case 'ErrorDepositAssign':
                    handleErrorDepositAssign(data);
                    break;
                case 'ProcessDeposit':
                    handleProcessDeposit(data);
                    break;// two or one step
                case 'AssignAccount':
                    handleAssignAccount(data);
                    break;//unlock or update account  assgin
                case 'ProcessAssign':
                    handleProcessAssign(data);
                    break;

            }
        });
        return () => subscription.unsubscribe();
    }, [subject, handleLockAccount,// clear private data
        handleNoAccount,//
        handleDepositingAccount,
        handleErrorApproveToken,
        handleErrorDepositAssign,
        handleProcessDeposit,// two or one step
        handleAssignAccount, //unlock or update account  assgin
        handleProcessAssign,
        handleProcessAccountCheck,]);
}
