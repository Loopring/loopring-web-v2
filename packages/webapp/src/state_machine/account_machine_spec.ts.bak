export enum AccountStatus {
    UNKNOWN = 'UNKNOWN',
    UNCONNNECTED = 'UNCONNNECTED',
    CONNECTED = 'CONNECTED',
    NOACCOUNT = 'NOACCOUNT',
    DEPOSITING = 'DEPOSITING',
    DEPOSIT_TO_CONFIREM = 'DEPOSIT_TO_CONFIREM',
    UNACTIVATED = 'UNACTIVATED',
    ARPROVING = 'ARPROVING',
    APPROV_TO_CONFIRM = 'APPROV_TO_CONFIRM',
    LOCKED = 'LOCKED',
    ACTIVATED = 'ACTIVATED',
}

export enum StatusChangeEvent {
    Reset = 'Reset',
    Connecting = 'Connecting',
    HasPubkey = 'HasPubkey',
    HasNoPubkey = 'HasNoPubkey',
    ErrorResponse = 'ErrorResponse',
    Reconnect = 'Reconnect',
    FinishDeposit = 'FinishDeposit',
    DepositConfirmed = 'DepositConfirmed',
    IsSmartWallet = 'IsSmartWallet',
    ApproveSubmit = 'ApproveSubmit',
    ApproveConfirmed = 'ApproveConfirmed',
    Unlock = 'Unlock',
    Lock = 'Lock',
}

export const AccountMachineSpec = (initialState: AccountStatus = AccountStatus.UNCONNNECTED) => 
{
    return {
        initialState: initialState,
        states: {
            UNCONNNECTED: {
                Connecting: AccountStatus.CONNECTED,
                Reset: AccountStatus.UNCONNNECTED,
            },
            CONNECTED: {
                HasPubkey: AccountStatus.LOCKED,
                HasNoPubkey: AccountStatus.UNACTIVATED,
                ErrorResponse: AccountStatus.NOACCOUNT,
                Reset: AccountStatus.UNCONNNECTED,
            },
            NOACCOUNT: {
                ErrorResponse: AccountStatus.NOACCOUNT,
                Reconnect: AccountStatus.CONNECTED,
                Reset: AccountStatus.UNCONNNECTED,
            },
            DEPOSITING: {
                FinishDeposit: AccountStatus.DEPOSIT_TO_CONFIREM,
                Reset: AccountStatus.UNCONNNECTED,
            },
            DEPOSIT_TO_CONFIREM: {
                HasPubkey: AccountStatus.ACTIVATED,
                HasNoPubkey: AccountStatus.DEPOSIT_TO_CONFIREM,
                ErrorResponse: AccountStatus.DEPOSIT_TO_CONFIREM,
                Reset: AccountStatus.UNCONNNECTED,
            },
            UNACTIVATED: {
                IsSmartWallet: AccountStatus.ARPROVING,
                Reset: AccountStatus.UNCONNNECTED,
            },
            ARPROVING: {
                ApproveSubmit: AccountStatus.APPROV_TO_CONFIRM,
                Reset: AccountStatus.UNCONNNECTED,
            },
            APPROV_TO_CONFIRM: {
                ApproveConfirmed: AccountStatus.ACTIVATED,
                Reset: AccountStatus.UNCONNNECTED,
            },
            LOCKED: {
                Unlock: AccountStatus.ACTIVATED,
                Reset: AccountStatus.UNCONNNECTED,
            },
            ACTIVATED: {
                Lock: AccountStatus.LOCKED,
                Reset: AccountStatus.UNCONNNECTED,
            },
        },
    }
}
