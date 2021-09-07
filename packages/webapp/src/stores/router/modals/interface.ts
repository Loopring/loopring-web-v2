import * as sdk from 'loopring-sdk';

export type WithdrawData = {
}

export type TransferData = {
}

export type DepositData = {
}

export type ModalDataStatus = {
    withdraw: WithdrawData,
    transfer?: TransferData,
    deposit?: DepositData,
}
