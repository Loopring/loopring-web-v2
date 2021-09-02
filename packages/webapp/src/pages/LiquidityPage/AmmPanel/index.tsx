import { AmmPanel, AmmPanelType, CoinIcon, Toast } from '@loopring-web/component-lib';
import { AmmInData, CoinInfo, EmptyValueTag, WalletMap } from '@loopring-web/common-resources';
import { useAmmJoin } from './hook_join'
import { useAmmExit } from './hook_exit'
import { useAmmCommon } from './hook_common'
import { Box, Divider, Grid, Typography } from '@material-ui/core';
import { AmmPoolSnapshot, TickerData, } from 'loopring-sdk';
import { TOAST_TIME } from 'defs/common_defs';
import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import styled from '@emotion/styled';

const BoxWrapperStyled = styled(Grid)`
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`
export const AmmPanelView = ({
                                 pair,
                                 walletMap,
                                 ammType, snapShotData,
                                 ...rest
                             }: {
    pair: { coinAInfo: CoinInfo<string> | undefined, coinBInfo: CoinInfo<string> | undefined },
    snapShotData: {
        tickerData: TickerData | undefined,
        ammPoolSnapshot: AmmPoolSnapshot | undefined
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
    } = useAmmCommon({pair, snapShotData})

    const {

        ammCalcData: ammCalcDataDeposit,
        ammData: ammJoinData,
        handleAmmPoolEvent: handleJoinAmmPoolEvent,
        onAmmClick: onAmmAddClick,
        btnStatus: addBtnStatus,
        btnI18nKey: ammDepositBtnI18nKey,

    } = useAmmJoin({
        ammPoolSnapshot,
        setToastOpen,
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

    } = useAmmExit({
        ammPoolSnapshot,
        setToastOpen,
        type: AmmPanelType.Exit,
        pair,
        snapShotData,
    })

    return <>
        <Toast alertText={toastOpen?.content ?? ''} severity={toastOpen?.type ?? 'success'}
               open={toastOpen?.open ?? false}
               autoHideDuration={TOAST_TIME} onClose={closeToast}/>

        {pair ?
            <AmmPanel {...{...rest}}
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
                      ammCalcDataWithDraw={ammCalcDataWithdraw}
                      handleAmmRemoveChangeEvent={handleExitAmmPoolEvent}
                      onAmmRemoveClick={onAmmRemoveClick}
                      ammWithdrawBtnI18nKey={ammWithdrawBtnI18nKey}
                      ammWithdrawBtnStatus={removeBtnStatus}

            /> : <Box width={'var(--swap-box-width)'}/>}

        {pair && ammCalcDataDeposit && ammCalcDataDeposit.lpCoin ?
            <BoxWrapperStyled marginTop={2}>
                
                <MyAmmLPAssets ammCalcData={ammCalcDataDeposit as any}/>
            </BoxWrapperStyled> : <></>

        }

    </>

}
const MyAmmLPAssets = withTranslation('common')(({ammCalcData, t}:
                                                     { ammCalcData: AmmInData<any> } & WithTranslation) => {
    return <Box className={'MuiPaper-elevation2'} paddingX={3} paddingY={2}>
        <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
            <Box display={'flex'} className={'logo-icon'} height={'var(--list-menu-coin-size)'}
                 alignItems={'center'} justifyContent={'center'}>
                <CoinIcon symbol={ammCalcData.lpCoin.belong}/>
            </Box>
            <Box paddingLeft={1}>
                <Typography variant={'h4'} component={'h3'} paddingRight={1}>
                    <Typography component={'span'} title={'sell'} className={'next-coin'}>
                        {ammCalcData.lpCoinA.belong}
                    </Typography>
                    <Typography component={'i'}>/</Typography>
                    <Typography component={'span'} title={'buy'}>
                        {ammCalcData.lpCoinB.belong}
                    </Typography>
                </Typography>
            </Box>
        </Box>
        <Divider style={{margin: '16px 0'}}/>
        <Box display={'flex'} flexDirection={'column'}>

            <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={"center"}>
                <Typography component={'p'} variant="body2" color={'textSecondary'}> {t('labelMyLPToken')} </Typography>
                <Typography component={'p'} variant="body2">{ammCalcData && ammCalcData.lpCoin.balance ? ammCalcData.lpCoin.balance : EmptyValueTag}</Typography>
            </Box>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={"center"} marginTop={1/2}>
                <Typography component={'p'} variant="body2" color={'textSecondary'}> {t('labelMyLPAToken',{symbol:ammCalcData.lpCoinA.belong})} </Typography>
                <Typography component={'p'}
                            variant="body2">{ammCalcData && ammCalcData.myCoinA.balance ? ammCalcData.myCoinA.balance : EmptyValueTag}</Typography>
            </Box>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={"center"} marginTop={1/2}>
                <Typography component={'p'} variant="body2" color={'textSecondary'}> {t('labelMyLPBToken',{symbol:ammCalcData.lpCoinB.belong})} </Typography>
                <Typography component={'p'}
                            variant="body2">{ammCalcData && ammCalcData.myCoinB.balance ? ammCalcData.myCoinB.balance : EmptyValueTag}</Typography>
            </Box>
            <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={"center"} marginTop={1/2}>
                <Typography component={'p'} variant="body2" color={'textSecondary'}> {t('labelMyLPAmountFor')} </Typography>
                <Typography component={'p'}
                            variant="body2">{ammCalcData && ammCalcData.percentage ? Number(ammCalcData.percentage) * 100 + '%' : EmptyValueTag}</Typography>
            </Box>
        </Box>
    </Box>
})

