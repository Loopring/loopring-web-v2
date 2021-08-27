import { Box, Grid, } from '@material-ui/core'
import { WithTranslation, withTranslation } from 'react-i18next'
import BasicInfoPanel from './panel/BasicInfoPanel'
import TradePanel from './panel/TradePanel'
import { useSwapPage } from './hook'
import { AlertImpact, ConfirmImpact, SwapPanel, Toast } from '@loopring-web/component-lib'

import { TOAST_TIME } from 'defs/common_defs'
import { FixedStyle } from 'pages/styled'
import React from 'react';


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
        debugInfo,
        alertOpen,
        confirmOpen,
        refreshRef,
        swapFunc,

        priceImpact,

    } = useSwapPage();

    return <>

        <Toast alertText={toastOpen?.content ?? ''} severity={toastOpen?.type ?? 'success'} open={toastOpen?.open ?? false}
               autoHideDuration={TOAST_TIME} onClose={closeToast} />

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
                    onRefreshData={should15sRefresh}
                    refreshRef={refreshRef}
                    tradeData={tradeData as any}
                    tradeCalcData={tradeCalcData as any}
                    onSwapClick={onSwapClick}
                    swapBtnI18nKey={swapBtnI18nKey}
                    swapBtnStatus={swapBtnStatus}
                    {...{ handleSwapPanelEvent, ...rest }}
                />{process.env.NODE_ENV !== 'production' && <>
                    {JSON.stringify(debugInfo)}
                </>}

            </FixedStyle>
        </Box>
        <AlertImpact handleClose={swapFunc} open={alertOpen} value={priceImpact} />
        <ConfirmImpact handleClose={swapFunc} open={confirmOpen} value={priceImpact}/>
    </>
});


// SwapPage
