import { ButtonProps } from "../../basic-lib";
import { Account } from "@loopring-web/common-resources";

export type AccountBaseProps = {
  // addressShort: string
  // address: string,
  level?: string;
  mainBtn?: JSX.Element | React.ElementType<ButtonProps>;
  etherscanUrl: string;
  // connectBy: string,
  onDisconnect?: any;
  onSwitch?: any;
  // onLock?: any,
  onCopy?: any;
  onViewQRCode?: any;
} & Account;

export enum AccountStep {
  NoAccount,
  QRCode,
  HadAccount,
  // new
  // Deposit,
  Deposit_Approve_WaitForAuth,
  Deposit_Approve_Denied,
  Deposit_Approve_Submit,
  Deposit_WaitForAuth,
  Deposit_Denied,
  Deposit_Failed,
  Deposit_Submit,

  NFTDeposit_Approve_WaitForAuth,
  NFTDeposit_Approve_Denied,
  NFTDeposit_Approve_Submit,
  NFTDeposit_WaitForAuth,
  NFTDeposit_Denied,
  NFTDeposit_Failed,
  NFTDeposit_Submit,

  NFTMint_WaitForAuth,
  NFTMint_First_Method_Denied,
  NFTMint_In_Progress,
  NFTMint_Denied,
  NFTMint_Failed,
  NFTMint_Submit,

  NFTDeploy_WaitForAuth,
  NFTDeploy_First_Method_Denied,
  NFTDeploy_In_Progress,
  NFTDeploy_Denied,
  NFTDeploy_Failed,
  NFTDeploy_Submit,

  Transfer_WaitForAuth,
  Transfer_First_Method_Denied,
  Transfer_User_Denied,
  Transfer_In_Progress,
  Transfer_Success,
  Transfer_Failed,

  Withdraw_WaitForAuth,
  Withdraw_First_Method_Denied,
  Withdraw_User_Denied,
  Withdraw_In_Progress,
  Withdraw_Success,
  Withdraw_Failed,

  CreateAccount_Approve_WaitForAuth,
  CreateAccount_Approve_Denied,
  CreateAccount_Approve_Submit,
  CreateAccount_WaitForAuth,
  CreateAccount_Denied,
  CreateAccount_Failed,
  CreateAccount_Submit,

  UpdateAccount,
  UpdateAccount_Approve_WaitForAuth,
  UpdateAccount_First_Method_Denied,
  UpdateAccount_User_Denied,
  UpdateAccount_Success,
  UpdateAccount_Submit,
  UpdateAccount_Failed,

  // UnlockAccount,
  UnlockAccount_WaitForAuth,
  UnlockAccount_User_Denied,
  UnlockAccount_Success,
  UnlockAccount_Failed,

  ResetAccount_Approve_WaitForAuth,
  ResetAccount_First_Method_Denied,
  ResetAccount_User_Denied,
  ResetAccount_Success,
  ResetAccount_Submit,
  ResetAccount_Failed,

  ExportAccount_Approve_WaitForAuth,
  ExportAccount_User_Denied,
  ExportAccount_Success,
  ExportAccount_Failed,
}
