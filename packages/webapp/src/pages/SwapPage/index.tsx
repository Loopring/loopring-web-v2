import { Box, Grid, } from '@material-ui/core'
import { WithTranslation, withTranslation } from 'react-i18next'
import BasicInfoPanel from './panel/BasicInfoPanel'
import TradePanel from './panel/TradePanel'
import styled from '@emotion/styled'
import { useSwapPage } from './hook'
import { SwapPanel, Toast } from '@loopring-web/component-lib'

import { TOAST_TIME } from 'defs/common_defs'
import { FixedStyle } from 'pages/styled'



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
        btnStatus,
        swapToastOpen,
        setSwapToastOpen,
        swapAlertText,

    } = useSwapPage();

    return <>

        <Toast alertText={swapAlertText as string} open={swapToastOpen} 
            autoHideDuration={TOAST_TIME} setOpen={setSwapToastOpen}/>

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
                <SwapPanel tradeData={tradeData as any}
                           tradeCalcData={tradeCalcData as any}
                           onSwapClick={onSwapClick}
                           swapBtnI18nKey={swapBtnI18nKey}
                           swapBtnStatus={btnStatus}
                           {...{handleSwapPanelEvent, ...rest}}
                />
            </FixedStyle>

        </Box>

    </>
});


// SwapPage
