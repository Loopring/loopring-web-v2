import React from "react";
import { AccountFull } from "@loopring-web/common-resources";

export enum WalletNotificationStatus {
  none = "none",
  error = "error",
  pending = "pending",
  success = "success",
}

export type WalletNotificationInterface = {
  // status: keyof typeof WalletNotificationStatus
  message: string;
  handleClick?: (event: React.MouseEvent) => void;
};

export type WalletConnectBtnProps = {
  handleClick: (_e: React.MouseEvent) => void;
  accountState: AccountFull;
  isLayer1Only?: boolean;
};
