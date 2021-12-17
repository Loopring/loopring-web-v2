import { Route, Switch, useLocation, Redirect } from 'react-router-dom'
import React from 'react';
import { Box, Container } from '@mui/material'
import Header from 'layouts/header'
// import Footer from '../layouts/footer';
import { ModalGroup } from '../modal';
import { LAYOUT } from '../defs/common_defs';
import { QuotePage } from 'pages/QuotePage'
import { SwapPage } from 'pages/SwapPage'
import { Layer2Page } from 'pages/Layer2Page'
import { LiquidityPage } from 'pages/LiquidityPage'
import { MiningPage } from 'pages/MiningPage'
import { OrderbookPage } from 'pages/ProTradePage';
import { useTicker } from '../stores/ticker';
import { LoadingBlock, LoadingPage } from '../pages/LoadingPage';
import { LandPage, WalletPage } from '../pages/LandPage'
// import { LandPage } from '../pages/LandPage/LandPage';
// import { WalletPage } from '../pages/LandPage/WalletPage'
import { ErrorMap, myLog, SagaStatus, ThemeType } from '@loopring-web/common-resources';
import { ErrorPage } from '../pages/ErrorPage';
import { Footer, useSettings } from '@loopring-web/component-lib';
import { ReportPage } from 'pages/ReportPage';
import { MarkDonwPage } from '../pages/MarkdownPage';
import { TradeRacePage } from '../pages/TradeRacePage'

const ContentWrap = ({children, state}: React.PropsWithChildren<any> & { state: keyof typeof SagaStatus }) => {
    return <>
        <Header isHideOnScroll={false}/>
        {state === 'PENDING' ?
            <LoadingBlock/>
            : state === 'ERROR' ? <ErrorPage {...ErrorMap.NO_NETWORK_ERROR} /> :
                <Container maxWidth="lg" style={{
                    minHeight: `calc(100% - ${LAYOUT.HEADER_HEIGHT}px - 32px)`,
                    display: 'flex',
                    flexDirection: 'column'
                }}>

                    <Box display={'flex'} flex={1} alignItems={'stretch'} flexDirection={'row'} marginTop={3}>
                        {children}
                    </Box>
                </Container>}
    </>
}

const RouterView = ({state}: { state: keyof typeof SagaStatus }) => {

    // const location = useLocation()

    // React.useEffect(() => {
    //     if(location.pathname){
    //         const pathname = location.pathname;
    //         if(pathname.match(/(trading\/lite)|(landing-pag)/ig))  {
    //             store.dispatch(resetSwap(undefined))
    //         }
    //         if(pathname.match(/(liquidity\/pools)/ig))  {
    //             store.dispatch(resetAmmPool(undefined))
    //         }
    //     }
    // }, [location?.pathname])
    const proFlag = (process.env.REACT_APP_WITH_PRO && process.env.REACT_APP_WITH_PRO === 'true')
    const {tickerMap} = useTicker();
    const {setTheme} = useSettings();
    const location = useLocation()
    const query = new URLSearchParams(location.search);
    React.useEffect(() => {
        if (query.has('theme')) {
            query.get('theme') === ThemeType.dark ? setTheme('dark') : setTheme('light')
        }
    }, [location.search])
    // console.log(query)
    return <>
        <Switch>
            {/* <Route exact path='/landing-page'>
                <Header isHideOnScroll={true}/>
                <LandPage />
            </Route> */}

            <Route exact path='/trading-race'>
                {query && query.has('noheader') ? <></> : <Header/>}
                <TradeRacePage />
            </Route>

            <Route exact path='/wallet'>
                {query && query.has('noheader') ? <></> : <Header isHideOnScroll={true} isLandPage/>}
                <WalletPage/>       zz
            </Route>
            <Route exact path='/loading'><LoadingPage/> </Route>
            <Route exact path='/'>
                {/* <ContentWrap> */}
                {/* {allowTrade?.order.enable ? <SwapPage/> : <Layer2Page/>} */}
                {/* </ContentWrap> */}
                {query && query.has('noheader') ? <></> : <Header isHideOnScroll={true} isLandPage/>}
                <LandPage/>
            </Route>
            <Route exact path='/report'>
                <Redirect to="/newticket" />
                {/* {query && query.has('noheader') ? <></> : <Header isHideOnScroll={true} isLandPage/>}
                <Container maxWidth="lg"
                           style={{
                               minHeight: `calc(100% - ${LAYOUT.HEADER_HEIGHT}px - 32px)`,
                               display: 'flex',
                               flexDirection: 'column'
                           }}>
                    <ReportPage/> </Container> */}
            </Route>
            <Route exact path='/newticket'>
                {query && query.has('noheader') ? <></> : <Header isHideOnScroll={true} isLandPage/>}
                    <Container maxWidth="lg"
                           style={{
                               minHeight: `calc(100% - ${LAYOUT.HEADER_HEIGHT}px - 32px)`,
                               display: 'flex',
                               flexDirection: 'column'
                           }}>
                    <ReportPage/> </Container>
            </Route>
            <Route exact path='/document'>
                {query && query.has('noheader') ? <></> : <Header isHideOnScroll={true} isLandPage/>}
                <Container maxWidth="lg"
                           style={{
                               minHeight: `calc(100% - ${LAYOUT.HEADER_HEIGHT}px - 32px)`,
                               display: 'flex',
                               flexDirection: 'column'
                           }}> <MarkDonwPage/> </Container>
            </Route>
            <Route exact path='/document/:path'>
                {query && query.has('noheader') ? <></> : <Header isHideOnScroll={true} isLandPage/>}
                <Container maxWidth="lg"
                           style={{
                               minHeight: `calc(100% - ${LAYOUT.HEADER_HEIGHT}px - 32px)`,
                               display: 'flex',
                               flexDirection: 'column'
                           }}><MarkDonwPage/> </Container>
            </Route>


            <Route path='/trade/pro'>
                {query && query.has('noheader') ? <></> : <Header isHideOnScroll={true}/>}

                {state === 'PENDING' && proFlag && tickerMap ?
                    <LoadingBlock/>
                    : state === 'ERROR' ? <ErrorPage {...ErrorMap.NO_NETWORK_ERROR} /> : <OrderbookPage/>}

            </Route>
            <Route path='/trade/lite'><ContentWrap state={state}><SwapPage/></ContentWrap></Route>
            <Route exact path='/markets'><ContentWrap state={state}><QuotePage/></ContentWrap> </Route>
            <Route exact path='/mining'><ContentWrap state={state}><MiningPage/></ContentWrap> </Route>
            <Route exact path='/layer2'><ContentWrap state={state}><Layer2Page/></ContentWrap></Route>
            <Route exact path='/layer2/*'><ContentWrap state={state}><Layer2Page/></ContentWrap></Route>

            {/*<Route exact path='/layer2/my-liquidity'><ContentWrap><Layer2Page/></ContentWrap> </Route>*/}
            {/*<Route exact path='/layer2/history'><ContentWrap><Layer2Page/></ContentWrap></Route>*/}
            {/*<Route exact path='/layer2/order'><ContentWrap><Layer2Page/></ContentWrap></Route>*/}
            {/*<Route exact path='/layer2/rewards'><ContentWrap><Layer2Page/></ContentWrap></Route>*/}
            {/*<Route exact path='/layer2/redpock'><ContentWrap><Layer2Page/></ContentWrap></Route>*/}
            {/*<Route exact path='/layer2/security'><ContentWrap><Layer2Page/></ContentWrap></Route>*/}
            {/*<Route exact path='/layer2/vip'><ContentWrap><Layer2Page/></ContentWrap></Route>*/}
            <Route exact path='/liquidity'> <ContentWrap state={state}><LiquidityPage/></ContentWrap></Route>
            <Route exact path='/liquidity/pools/*'><ContentWrap state={state}><LiquidityPage/></ContentWrap></Route>
            <Route exact path='/liquidity/pools'><ContentWrap state={state}><LiquidityPage/></ContentWrap></Route>
            <Route exact path='/liquidity/amm-mining'><ContentWrap state={state}><LiquidityPage/></ContentWrap> </Route>
            <Route exact path='/liquidity/my-liquidity'><ContentWrap
                state={state}><LiquidityPage/></ContentWrap></Route>

            

        </Switch>
        <ModalGroup/>
        {query && query.has('nofooter') ? <></> : <Footer/>}
    </>
}

export default RouterView
