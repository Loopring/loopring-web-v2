import React from "react";
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
          case Commands.ErrorNetwork:
            handleErrorAccount(data);
            break; // clear private data
          case Commands.LockAccount:
            handleLockAccount(data);
            break; // clear private data
          case Commands.NoAccount:
            handleNoAccount(data);
            break; //
          case Commands.DepositingAccount:
            handleDepositingAccount(data);
            break;
          case Commands.ErrorApproveToken:
            handleErrorApproveToken(data);
            break;
          case Commands.ErrorDepositSign:
            handleErrorDepositSign(data);
            break;
          case Commands.ProcessDeposit:
            handleProcessDeposit(data);
            break; // two or one step
          case Commands.SignAccount:
            handleSignAccount(data);
            break; //unlock or update account  assgin
          case Commands.ProcessSign:
            handleProcessSign(data);
            break;
          case Commands.SignDeniedByUser:
            handleSignDeniedByUser(data);
            break;
          case Commands.ErrorSign:
            handleSignError(data);
            break;
          case Commands.AccountUnlocked:
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
