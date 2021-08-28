import { InputButtonProps } from '../../basic-lib';
import { AmmPanelType } from '../Amm/Interface';
import { AmmData, CoinInfo, IBData } from '@loopring-web/common-resources';
import { AmmChgData, AmmDepositBaseProps, AmmWithdrawBaseProps } from '../components';

/**
 *
 */
export type AmmPanelBasePropsNew<T, I, ACD, C> = {

    ammDepositData: T,
    ammWithdrawData: T,
    tabSelected?: AmmPanelType,
    disableDeposit?: boolean,
    disableWithdraw?: boolean,
    ammCalcDataDeposit: ACD,
    ammCalcDataWithDraw: ACD,
    tokenDepositAProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>,
    tokenDepositBProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>,
    tokenWithDrawAProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>,
    tokenWithDrawBProps?: Partial<InputButtonProps<C, I, CoinInfo<I>>>,
    ammDepositBtnI18nKey?: string,
    ammWithdrawBtnI18nKey?: string,
    height?: number,
    width?: number,
}

export type AmmPropsNew<T extends AmmData<C extends IBData<I> ? C : IBData<I>>, I, ACD, C = IBData<I>> =
AmmPanelBasePropsNew<T, I, ACD, C>
    & {
        handleAmmAddChangeEvent: (data: T, focusOn: 'coinA' | 'coinB') => void,
        handleAmmRemoveChangeEvent: (data: T, focusOn: 'coinA' | 'coinB') => void,
        onChangeEvent?: (data: AmmChgData<T>) => AmmChgData<T>,
        refreshRef: React.Ref<any>,
        onRefreshData?: () => void,
    }
    & AmmWithdrawBaseProps<T, I>
    & AmmDepositBaseProps<T, I>

