import { Box, Grid, } from '@material-ui/core'
import { WithTranslation, withTranslation } from 'react-i18next'
import BasicInfoPanel from './panel/BasicInfoPanel'
import TradePanel from './panel/TradePanel'
import styled from '@emotion/styled'
import { useSwapPage } from './hook'
import { SwapPanel, Toast } from '@loopring-web/component-lib'

import { TOAST_TIME } from 'defs/common_defs'
import { FixedStyle } from 'pages/styled'
import React, { useCallback } from 'react';



export const SwapPage = withTranslation('common')(({ ...rest }: WithTranslation) => {

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

        swapToastOpen,
        setSwapToastOpen,

        updateDepth,

        debugInfo,

    } = useSwapPage();

    const onClose = React.useCallback(() => {
        setSwapToastOpen(undefined)
    }, [])
    return <>

        <Toast alertText={swapToastOpen?.label?? ''} severity={swapToastOpen?.type} open={swapToastOpen?.flag??false}
               autoHideDuration={TOAST_TIME} onClose={onClose} />

        <Grid container marginRight={3} alignContent={'stretch'} direction={'column'} flexWrap={'nowrap'}>
            <BasicInfoPanel {...{
                ...rest,
                ...pair, marketArray,
                tradeFloat, tradeArray
            }} />
            <TradePanel tradeArray={tradeArray} myTradeArray={myTradeArray} />
        </Grid>

        <Box display={'flex'} style={{ minWidth: 'var(--swap-box-width)' }}>
            <FixedStyle>
                <SwapPanel
                    onRefreshData={updateDepth}
                    tradeData={tradeData as any}
                    tradeCalcData={tradeCalcData as any}
                    onSwapClick={onSwapClick}
                    swapBtnI18nKey={swapBtnI18nKey}
                    swapBtnStatus={swapBtnStatus}
                    {...{ handleSwapPanelEvent, ...rest }}
                />

                { process.env.NODE_ENV === 'production' && <>
                {debugInfo}
                </>}

            </FixedStyle>
        </Box>

    </>
});


// SwapPage
