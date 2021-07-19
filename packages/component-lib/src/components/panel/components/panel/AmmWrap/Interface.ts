import { InputButtonProps } from '../../../../basic-lib';
import { CoinInfo } from '@loopring-web/common-resources';
import { TradeBtnStatus } from '../../../';


export type AmmChgData<AT> = {
    type: 'coinA' | 'coinB',
    tradeData: AT,
}

export type AmmDepositBaseProps<T, I> = {
    ammDepositBtnStatus?: keyof typeof TradeBtnStatus | undefined,
    onAmmAddClick: (AmmSendData: T) => void | any,
    ammDepositBtnI18nKey?: string
} & Partial<Pick<InputButtonProps<T, I, unknown>, 'handleError'>>

export type AmmDepositExtendProps<T, I, C, ACD> = {
    disabled?: boolean,
    onChangeEvent: (data: AmmChgData<T>) => void,
    tokenAProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>,
    tokenBProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>,
    ammCalcData: ACD,
}
export type AmmDepositWrapProps<T, I, ACD, C> = AmmDepositBaseProps<T, I> & AmmDepositExtendProps<T, I, C, ACD> & {
    ammData: T
}

export type AmmWithdrawBaseProps<T, I, > = {
    ammWithdrawBtnStatus?: keyof typeof TradeBtnStatus | undefined,
    onAmmRemoveClick: (AmmSendData: T) => void | any,
    ammWithdrawBtnI18nKey?: string,
    anchors?: number[],
} & Partial<Pick<InputButtonProps<T, I, unknown>, 'handleError'>>
export type AmmWithdrawExtendProps<T, I, C, ACD> = {
    disabled?: boolean,
    onChangeEvent: (data: Pick<AmmChgData<T>, 'tradeData'> & { type: 'coinA' | 'coinB' | 'percentage', percentage?: number }) => void,
    tokenAProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>,
    tokenBProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>,
    ammCalcData: ACD,
}
export type AmmWithdrawWrapProps<T, I, ACD, C> = AmmWithdrawBaseProps<T, I> & AmmWithdrawExtendProps<T, I, C, ACD> & {
    ammData: T,
    selectedPercentage: number, // anchor
}

