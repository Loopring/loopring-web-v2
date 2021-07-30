import {
    AmmInfoProps,
    DepositInfoProps,
    ResetInfoProps,
    SwapInfoProps,
    TransferInfoProps,
    WithdrawInfoProps
} from '../../../components';
import { AmmData, IBData } from '@loopring-web/common-resources';

export enum ModalType {
    transfer = 'transfer',
    deposit = 'deposit',
    withdraw = 'withdraw',
}

export type ModalTypeKeys = keyof typeof ModalType

export type ModalStatePlayLoad = {
    isShow: boolean,
}

export interface ModalState<T, I, A = AmmData<IBData<string>>, C = unknown> {
    isShowTransfer: ModalStatePlayLoad & { props: Partial<TransferInfoProps<T, I>> },
    isShowWithdraw: ModalStatePlayLoad & { props: Partial<WithdrawInfoProps<T, I>> },
    isShowDeposit: ModalStatePlayLoad & { props: Partial<DepositInfoProps<T, I>> },
    isShowResetAccount: ModalStatePlayLoad & { props: Partial<ResetInfoProps<T, I>> },
    isShowSwap: ModalStatePlayLoad & { props: Partial<SwapInfoProps<T, I, C>> },
    isShowAmm: ModalStatePlayLoad & { props: Partial<AmmInfoProps<A, I, C>> },
    isShowConnect: ModalStatePlayLoad ,
    isShowAccount: ModalStatePlayLoad ,
}
