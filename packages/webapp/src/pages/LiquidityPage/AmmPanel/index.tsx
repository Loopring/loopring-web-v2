import { AmmPanel, AmmPanelType, Toast } from '@loopring-web/component-lib';
import { AmmData, AmmInData, CoinInfo, IBData, WalletMap } from '@loopring-web/common-resources';
import { useAmmPanel } from './hooks';
import React from 'react';
import { Box } from '@material-ui/core';
import { AmmPoolSnapshot, TickerData } from 'loopring-sdk';
import { TradeBtnStatus } from '@loopring-web/component-lib';
import { TOAST_TIME } from 'defs/common_defs';

export const AmmPanelView = <T extends AmmData<C extends IBData<I> ? C : IBData<I>>, I,
    ACD extends AmmInData<I>,
    C = IBData<I>>({
                       pair,
                       walletMap,
                       ammType, snapShotData,
                       ...rest
                   }: {
    pair: { coinAInfo: CoinInfo<C> | undefined, coinBInfo: CoinInfo<C> | undefined },
    snapShotData: { tickerData: TickerData | undefined, ammPoolsBalance: AmmPoolSnapshot | undefined } | undefined
    walletMap: WalletMap<C>
    ammType?: keyof typeof AmmPanelType
} & any) => {
    const {
        toastOpen,
        closeToast,

        ammCalcData,
        ammJoinData,
        ammExitData,
        handleJoinAmmPoolEvent,
        handleExitAmmPoolEvent,
        onAmmRemoveClick,
        onAmmAddClick,
        // isJoinLoading,
        // isExitLoading,
        addBtnStatus,
        removeBtnStatus,
        ammDepositBtnI18nKey,
        ammWithdrawBtnI18nKey,
        onRefreshData,
        refreshRef,
    } = useAmmPanel({
        pair,
        snapShotData, ammType: ammType ? ammType : AmmPanelType.Join
    })

    // const [index, setIndex] = React.useState(AmmPanelTypeMap[ tabSelected ]);
    // const isLoading = React.useCallback(()=>{
    //
    //     if((!snapShotData || !snapShotData.tickerData || !snapShotData.ammPoolsBalance)
    //         &&  ammDepositBtnI18nKey === undefined
    //         &&  ammWithdrawBtnI18nKey === undefined
    //     ) {
    //       return true
    //     }
    //
    //     if(isJoinLoading || isExitLoading){
    //         return true
    //
    //     }
    // },[snapShotData,ammWithdrawBtnI18nKey,ammWithdrawBtnI18nKey,isJoinLoading,isExitLoading])


    return <>
    <Toast alertText={toastOpen?.content ?? ''} severity={toastOpen?.type ?? 'success'} open={toastOpen?.open ?? false}
            autoHideDuration={TOAST_TIME} onClose={closeToast}/>

    {pair ?
        <AmmPanel {...{...rest}}
                  onRefreshData={onRefreshData}
                  refreshRef={refreshRef}
                  ammDepositData={ammJoinData}
                  ammWithdrawData={ammExitData}
                  ammCalcData={ammCalcData}
                  handleAmmAddChangeEvent={handleJoinAmmPoolEvent}
                  handleAmmRemoveChangeEvent={handleExitAmmPoolEvent}
                  onAmmRemoveClick={onAmmRemoveClick}
                  onAmmAddClick={onAmmAddClick}
                  tabSelected={ammType ? ammType : AmmPanelType.Join}
                  ammDepositBtnI18nKey={ammDepositBtnI18nKey}
                  ammWithdrawBtnI18nKey={ammWithdrawBtnI18nKey}
                  ammDepositBtnStatus={addBtnStatus}
                  ammWithdrawBtnStatus={removeBtnStatus}

        /> : <Box width={'var(--swap-box-width)'}/>}
    </>

}
