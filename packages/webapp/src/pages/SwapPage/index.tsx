import { Box, Grid, } from '@mui/material'
import { WithTranslation, withTranslation } from 'react-i18next'
import BasicInfoPanel from './panel/BasicInfoPanel'
import TradePanel from './panel/TradePanel'
import { AlertImpact, ConfirmImpact, SwapPanel, Toast } from '@loopring-web/component-lib'

import { TOAST_TIME } from 'defs/common_defs'
import { FixedStyle } from 'pages/styled'
import React from 'react';
import { useSwap } from './hookSwap';


export const SwapPage = withTranslation('common')(({...rest}: WithTranslation) => {

    const {
        tradeCalcData,
        tradeData,
        tradeFloat,
        tradeArray,
        myTradeArray,
        marketArray,
        handleSwapPanelEvent,
        onSwapClick,
        pair,
        swapBtnI18nKey,
        swapBtnStatus,
        toastOpen,
        closeToast,
        should15sRefresh,
        // debugInfo,
        alertOpen,
        confirmOpen,
        refreshRef,
        swapFunc,
        isSwapLoading,
        pageTradeLite,
    } = useSwap();

    return <>

        <Toast alertText={toastOpen?.content ?? ''} severity={toastOpen?.type ?? 'success'}
               open={toastOpen?.open ?? false}
               autoHideDuration={TOAST_TIME} onClose={closeToast}/>

        <Grid container marginRight={3} alignContent={'stretch'} direction={'column'} flexWrap={'nowrap'}>
            <BasicInfoPanel {...{
                ...rest,
                ...pair, marketArray,
                tradeFloat, tradeArray
            }} />
            <TradePanel tradeArray={tradeArray} myTradeArray={myTradeArray}/>
        </Grid>

        <Box display={'flex'} style={{minWidth: 'var(--swap-box-width)'}}>
            <FixedStyle>
                <SwapPanel
                    //disabled={isSwapLoading}
                    tokenBuyProps={{disabled: isSwapLoading}}
                    tokenSellProps={{disabled: isSwapLoading}}
                    onRefreshData={should15sRefresh}
                    refreshRef={refreshRef}
                    tradeData={tradeData as any}
                    tradeCalcData={tradeCalcData as any}
                    onSwapClick={onSwapClick}
                    swapBtnI18nKey={swapBtnI18nKey}
                    swapBtnStatus={swapBtnStatus}
                    {...{handleSwapPanelEvent, ...rest}}
                />

            </FixedStyle>
        </Box>
        <AlertImpact handleClose={swapFunc} open={alertOpen} value={pageTradeLite?.priceImpactObj?.value as any}/>
        <ConfirmImpact handleClose={swapFunc} open={confirmOpen} value={pageTradeLite?.priceImpactObj?.value as any}/>
    </>
});


// SwapPage
