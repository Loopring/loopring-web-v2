import { useDispatch, useSelector } from 'react-redux'
import { ModalState, ModalStatePlayLoad } from './interface';
import {
    setShowAccountInfo,
    setShowAmm, setShowConnect,
    setShowDeposit,
    setShowResetAccount,
    setShowSwap,
    setShowTransfer,
    setShowWithdraw
} from './reducer';
import {
    AmmInfoProps,
    DepositInfoProps,
    ResetInfoProps,
    SwapInfoProps,
    TransferInfoProps,
    WithdrawInfoProps
} from '../../../index';
import { AmmData, IBData } from 'static-resource';

export const useOpenModals = <T extends IBData<any>,I,A = AmmData<IBData<string>>, C = unknown>()=> {
    const dispatch = useDispatch();
    return {
        modals: useSelector((state: any) => state.modals) as ModalState<T,I>,
        setShowTransfer: (state: ModalStatePlayLoad & { props?: Partial<TransferInfoProps<T,I>> }) => dispatch(setShowTransfer(state)),
        setShowDeposit: (state: ModalStatePlayLoad & { props?: Partial<DepositInfoProps<T,I>> }) => dispatch(setShowDeposit(state)),
        setShowWithdraw: (state: ModalStatePlayLoad & { props?: Partial<WithdrawInfoProps<T,I>> }) => dispatch(setShowWithdraw(state)),
        setShowResetAccount: (state: ModalStatePlayLoad & { props?: Partial<ResetInfoProps<T,I>>}) => dispatch(setShowResetAccount(state)),
        setShowAmm: (state: ModalStatePlayLoad & { props?: AmmInfoProps<A, I, C>}) => dispatch(setShowAmm(state)),
        setShowSwap: (state: ModalStatePlayLoad & { props?: SwapInfoProps<T, I, C>}) => dispatch(setShowSwap(state)),
        setShowAccountInfo:(state:ModalStatePlayLoad) => dispatch(setShowAccountInfo(state)),
        setShowConnect:(state:ModalStatePlayLoad) => dispatch(setShowConnect(state))
    }

}
