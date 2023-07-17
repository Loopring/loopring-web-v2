import React from 'react'
import { AccountCommands } from './command'
import { accountServices } from './accountServices'

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
  const subject = React.useMemo(() => accountServices.onSocket(), [])
  React.useEffect(() => {
    const subscription = subject.subscribe(
      ({ data, status }: { status: AccountCommands; data?: any }) => {
        switch (status) {
          case AccountCommands.ErrorNetwork:
            handleErrorAccount(data)
            break // clear private data
          case AccountCommands.LockAccount:
            handleLockAccount(data)
            break // clear private data
          case AccountCommands.NoAccount:
            handleNoAccount(data)
            break //
          case AccountCommands.DepositingAccount:
            handleDepositingAccount(data)
            break
          case AccountCommands.ErrorApproveToken:
            handleErrorApproveToken(data)
            break
          case AccountCommands.ErrorDepositSign:
            handleErrorDepositSign(data)
            break
          case AccountCommands.ProcessDeposit:
            handleProcessDeposit(data)
            break // two or one step
          case AccountCommands.SignAccount:
            handleSignAccount(data)
            break //unlock or update account  assgin
          case AccountCommands.ProcessSign:
            handleProcessSign(data)
            break
          case AccountCommands.SignDeniedByUser:
            handleSignDeniedByUser(data)
            break
          case AccountCommands.ErrorSign:
            handleSignError(data)
            break
          case AccountCommands.AccountUnlocked:
            handleAccountActive(data)
            break
        }
      },
    )
    return () => subscription.unsubscribe()
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
  ])
}
