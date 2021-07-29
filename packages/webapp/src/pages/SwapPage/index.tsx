import { Box, Grid, } from '@material-ui/core'
import { WithTranslation, withTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import BasicInfoPanel from './panel/BasicInfoPanel'
import TradePanel from './panel/TradePanel'
import styled from 'styled-components'
import { useSwapPage } from './hook';
import { SwapPanel, Toast } from '@loopring-web/component-lib'
import { TradeBtnStatus } from '@loopring-web/component-lib'
import { useTokenMap } from '../../stores/token';
import { TOAST_TIME } from 'defs/common_defs'

const FixedStyle = styled(Box)`
  @media only screen and (min-height: 780px ) and (min-width: 1024px) {
    position: fixed;
  }
`

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

    const { coinMap } = useTokenMap()
    const { pathname } = useLocation()
    const pairNameList = pathname ? pathname.split('/')[pathname.split('/').length - 1].split('-') : ''
    const coinA = Array.isArray(pairNameList) ? pairNameList[0] : ''
    const coinB = Array.isArray(pairNameList) ? pairNameList[1] : ''
    const customPair = {
        coinAInfo: coinMap ? coinMap[coinA] : '',
        coinBInfo: coinMap ? coinMap[coinB] : '',
    }
    const renderPair = customPair.coinAInfo ? customPair : pair

    return <>

        <Toast alertText={swapAlertText as string} open={swapToastOpen} 
            autoHideDuration={TOAST_TIME} setOpen={setSwapToastOpen}/>

        <Grid container marginRight={3} alignContent={'flex-start'}>
            <BasicInfoPanel {...{
                ...rest,
                ...renderPair, marketArray,
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
                    // handleError={}
                           {...{handleSwapPanelEvent, ...rest}}
                />
            </FixedStyle>

        </Box>

    </>
});


// SwapPage
