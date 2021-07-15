import { InputButtonProps } from '../../basic-lib';
import { AmmData, CoinInfo, IBData } from 'static-resource';
import { AmmChgData, AmmDepositBaseProps, AmmWithdrawBaseProps } from '../components';
export enum AmmPanelType {
    Deposit='Deposit',
    WithDraw='WithDraw',
}

/**
 *
 */
export type AmmPanelBaseProps<T,I,ACD,C > = {
    ammDepositData:T,
    ammWithdrawData:T,
    tabSelected?: keyof typeof AmmPanelType,
    disableDeposit?: boolean,
    disableWithdraw?: boolean,
    ammCalcData: ACD,
    tokenDepositAProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>,
    tokenDepositBProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>,
    tokenWithDrawAProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>,
    tokenWithDrawBProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>,
    ammDepositBtnI18nKey?:string,
    ammWithdrawBtnI18nKey?:string,
    height?:number,
    width?:number,
}

export type AmmProps<T extends AmmData<C extends IBData<I>?C:IBData<I>>,I,ACD,C =IBData<I>> = AmmPanelBaseProps<T ,I,ACD,C >
    & {
    handleAmmAddChangeEvent: (data: T, focusOn:'coinA'|'coinB') => void,
    handleAmmRemoveChangeEvent: (data: T, focusOn:'coinA'|'coinB') => void,
    onChangeEvent?: (data: AmmChgData<T>) =>AmmChgData<T>,
} & AmmWithdrawBaseProps<T, I> & AmmDepositBaseProps<T, I>





