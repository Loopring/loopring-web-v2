import { AmmPanelNew, AmmPanelType, Toast } from '@loopring-web/component-lib';
import { CoinInfo, WalletMap } from '@loopring-web/common-resources';
import { useAmmCalc, useAmmCommon } from './hooks'
import { Box } from '@material-ui/core';
import { AmmPoolSnapshot, TickerData, } from 'loopring-sdk';
import { TOAST_TIME } from 'defs/common_defs';

export const AmmPanelView = ({
        pair,
        walletMap,
        ammType, snapShotData,
        ...rest
    }: {
        pair: { coinAInfo: CoinInfo<string> | undefined, coinBInfo: CoinInfo<string> | undefined },
        snapShotData: {
            tickerData: TickerData | undefined,
            ammPoolsBalance: AmmPoolSnapshot | undefined
        } | undefined
        walletMap: WalletMap<string>
        ammType?: keyof typeof AmmPanelType
    } & any) => {

    const {
        toastOpen,
        setToastOpen,
        closeToast,
        refreshRef,
        ammPoolSnapshot,
        updateAmmPoolSnapshot,
    } = useAmmCommon(pair)

    const {

        ammCalcData: ammCalcDataDeposit,
        ammData: ammJoinData,
        handleAmmPoolEvent: handleJoinAmmPoolEvent,
        onAmmClick: onAmmAddClick,
        btnStatus: addBtnStatus,
        btnI18nKey: ammDepositBtnI18nKey,

    } = useAmmCalc({
        ammPoolSnapshot,
        setToastOpen,
        type: AmmPanelType.Join,
        pair,
        snapShotData,
    })

    const {

        ammCalcData: ammCalcDataWithdraw,
        ammData: ammExitData,
        handleAmmPoolEvent: handleExitAmmPoolEvent,
        onAmmClick: onAmmRemoveClick,
        btnStatus: removeBtnStatus,
        btnI18nKey: ammWithdrawBtnI18nKey,

    } = useAmmCalc({
        ammPoolSnapshot,
        setToastOpen,
        type: AmmPanelType.Exit,
        pair,
        snapShotData,
    })

    return <>
        <Toast alertText={toastOpen?.content ?? ''} severity={toastOpen?.type ?? 'success'} open={toastOpen?.open ?? false}
            autoHideDuration={TOAST_TIME} onClose={closeToast} />

        {pair ?
            <AmmPanelNew {...{ ...rest }}
                onRefreshData={updateAmmPoolSnapshot}
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
