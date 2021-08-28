import { AmmPanelNew, AmmPanelType, Toast } from '@loopring-web/component-lib';
import { AmmData, AmmInData, CoinInfo, IBData, WalletMap } from '@loopring-web/common-resources';
import { useAmmJoin } from './hook_join';
import { Box } from '@material-ui/core';
import { AmmPoolSnapshot, TickerData } from 'loopring-sdk';
import { TOAST_TIME } from 'defs/common_defs';
import React from 'react';
import { useAmmExit } from './hook_exit';

export const AmmPanelView = <T extends AmmData<C extends IBData<I> ? C : IBData<I>>, I,
    ACD extends AmmInData<I>,
    C = IBData<I>>({
        pair,
        walletMap,
        ammType, snapShotData,
        ...rest
    }: {
        pair: { coinAInfo: CoinInfo<C> | undefined, coinBInfo: CoinInfo<C> | undefined },
        snapShotData: {
            tickerData: TickerData | undefined,
            ammPoolsBalance: AmmPoolSnapshot | undefined
        } | undefined
        walletMap: WalletMap<C>
        ammType?: keyof typeof AmmPanelType
    } & any) => {

    const {
        toastOpen: toastOpenJoin,
        closeToast: closeToastJoin,

        ammCalcData: ammCalcDataDeposit,
        ammJoinData,
        handleJoinAmmPoolEvent,
        onAmmAddClick,
        addBtnStatus,
        ammDepositBtnI18nKey,
        onRefreshData: onRefreshDataJoin,

    } = useAmmJoin({
        pair,
        snapShotData,
    })

    const {
        toastOpen: toastOpenExit,
        closeToast: closeToastExit,
        ammCalcData: ammCalcDataWithdraw,
        ammExitData,
        handleExitAmmPoolEvent,
        removeBtnStatus,
        onAmmRemoveClick,
        ammWithdrawBtnI18nKey,
        onRefreshData: onRefreshDataExit,

    } = useAmmExit({
        pair,
        snapShotData,
    })

    const refreshRef = React.createRef()

    React.useEffect(() => {
        if (refreshRef.current && pair) {
            // @ts-ignore
            refreshRef.current.firstElementChild.click();
        }

    }, []);

    return <>
        <Toast alertText={toastOpenJoin?.content ?? ''} severity={toastOpenJoin?.type ?? 'success'} open={toastOpenJoin?.open ?? false}
            autoHideDuration={TOAST_TIME} onClose={closeToastJoin} />
        <Toast alertText={toastOpenExit?.content ?? ''} severity={toastOpenExit?.type ?? 'success'} open={toastOpenExit?.open ?? false}
            autoHideDuration={TOAST_TIME} onClose={closeToastExit} />

        {pair ?
            <AmmPanelNew {...{ ...rest }}
                onRefreshData={() => {
                    onRefreshDataJoin()
                    onRefreshDataExit()
                }}
                refreshRef={refreshRef}

                ammDepositData={ammJoinData}
                ammCalcDataDeposit={ammCalcDataDeposit}
                handleAmmAddChangeEvent={handleJoinAmmPoolEvent}
                onAmmAddClick={onAmmAddClick}
                tabSelected={ammType ? ammType : AmmPanelType.Join}
                ammDepositBtnI18nKey={ammDepositBtnI18nKey}
                ammDepositBtnStatus={addBtnStatus}

                ammWithdrawData={ammExitData}
                ammCalcDataWithDraw={ ammCalcDataWithdraw }
                handleAmmRemoveChangeEvent={handleExitAmmPoolEvent}
                onAmmRemoveClick={onAmmRemoveClick}
                ammWithdrawBtnI18nKey={ammWithdrawBtnI18nKey}
                ammWithdrawBtnStatus={removeBtnStatus}

            /> : <Box width={'var(--swap-box-width)'} />}
    </>

}
