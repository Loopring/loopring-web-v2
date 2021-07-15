import { Box, Grid, } from '@material-ui/core'
import { WithTranslation, withTranslation } from 'react-i18next'
import BasicInfoPanel from './panel/BasicInfoPanel'
import TradePanel from './panel/TradePanel'
import styled from 'styled-components'
import { useSwapPage } from './hook';
import { SwapPanel } from '@loopring-web/component-lib'
import { TradeBtnStatus } from '@loopring-web/component-lib/components/panel/index';

const FixedStyle = styled(Box)`
  @media only screen and (min-height: 680px ) and (min-width: 1024px) {
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
        isSwapLoading
    } = useSwapPage();

    return <>
        <Grid container marginRight={3} alignContent={'flex-start'}>
            <BasicInfoPanel {...{
                ...rest,
                ...pair, marketArray,
                tradeFloat, tradeArray
            }} />
            <TradePanel tradeArray={tradeArray} myTradeArray={myTradeArray}/>

            {/**/}
        </Grid>

        <Box display={'flex'} style={{minWidth: 'var(--swap-box-width)'}}>
            <FixedStyle>
                <SwapPanel tradeData={tradeData}
                           tradeCalcData={tradeCalcData}
                           onSwapClick={onSwapClick}
                           swapBtnI18nKey={swapBtnI18nKey}
                           swapBtnStatus={isSwapLoading ? TradeBtnStatus.LOADING : TradeBtnStatus.AVAILABLE}
                    // handleError={}
                           {...{handleSwapPanelEvent, ...rest}}
                />
            </FixedStyle>

        </Box>

    </>
});


// SwapPage
