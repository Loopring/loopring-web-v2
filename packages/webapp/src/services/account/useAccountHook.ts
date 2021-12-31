import React from "react";
// import { walletLa } from './walletServices';
import { Commands } from "./command";
import { accountServices } from "./accountServices";

export function useAccountHook({
  handleLockAccount, // clear private data
  handleNoAccount, //
  handleErrorAccount,
  handleDepositingAccount,
  handleErrorApproveToken,
  handleErrorDepositSign,
  handleProcessDeposit, // two or one step
  handleSignAccount, //unlock or update account  assgin
  handleProcessSign,
  handleSignDeniedByUser,
  handleSignError,
  handleProcessAccountCheck,
  handleAccountActive,
}: any) {
  const subject = React.useMemo(() => accountServices.onSocket(), []);
  React.useEffect(() => {
    const subscription = subject.subscribe(
      ({ data, status }: { status: keyof typeof Commands; data?: any }) => {
        switch (status) {
          case "ErrorNetwork":
            handleErrorAccount(data);
            break; // clear private data
          case "LockAccount":
            handleLockAccount(data);
            break; // clear private data
          case "NoAccount":
            handleNoAccount(data);
            break; //
          case "DepositingAccount":
            handleDepositingAccount(data);
            break;
          case "ErrorApproveToken":
            handleErrorApproveToken(data);
            break;
          case "ErrorDepositSign":
            handleErrorDepositSign(data);
            break;
          case "ProcessDeposit":
            handleProcessDeposit(data);
            break; // two or one step
          case "SignAccount":
            handleSignAccount(data);
            break; //unlock or update account  assgin
          case "ProcessSign":
            handleProcessSign(data);
            break;
          case Commands.SignDeniedByUser:
            handleSignDeniedByUser(data);
            break;
          case "ErrorSign":
            handleSignError(data);
            break;
          case "AccountUnlocked":
            handleAccountActive(data);
            break;
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [
    subject,
    handleLockAccount, // clear private data
    handleErrorAccount,
    handleNoAccount, //
    handleDepositingAccount,
    handleErrorApproveToken,
    handleErrorDepositSign,
    handleProcessDeposit, // two or one step
    handleSignAccount, //unlock or update account  assgin
    handleProcessSign,
    handleSignDeniedByUser,
    handleProcessAccountCheck,
  ]);
}
