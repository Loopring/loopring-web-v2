import React from 'react';
import { WalletStatus } from '@loopring-web/common-resources';

export enum WalletNotificationStatus {
    none = 'none',
    error = 'error',
    pending = 'pending',
    success = 'success',
}

export type  WalletNotificationInterface = {
    status: keyof typeof WalletNotificationStatus
    message: string,
    handleClick?: (event: React.MouseEvent) => void,
}


export type WalletConnectBtnProps = {
    handleClick: (_e: React.MouseEvent) => {},
    // notificationList: WalletNotificationInterface[],
    status?: keyof typeof WalletStatus | undefined,
    label: string,
    wait: number
}