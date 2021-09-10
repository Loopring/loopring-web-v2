import { Route, useLocation,Switch } from 'react-router-dom'

import Header from 'layouts/header'

import QuotePage from 'pages/QuotePage'
import { SwapPage } from 'pages/SwapPage'

import { Container ,Box} from '@mui/material'
import { Layer2Page } from '../pages/Layer2Page'
import { LiquidityPage } from '../pages/LiquidityPage'
import { MiningPage } from '../pages/MiningPage'

import { LAYOUT } from '../defs/common_defs';
import { ModalGroup } from '../modal';
import Footer from '../layouts/footer';
import React from 'react';



const ContentWrap = ({children}: React.PropsWithChildren<any>) => {
    return <Container maxWidth="lg"
                      style={{
                          minHeight: `calc(100% - ${LAYOUT.HEADER_HEIGHT}px - 32px)`,
                          display: 'flex',
                          flexDirection: 'column'
                      }}>
        <Box display={'flex'} flex={1} alignItems={'stretch'} flexDirection={'row'} marginTop={3}>
            {children}
        </Box>
    </Container>
}

const RouterView = () => {

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
    return <>
        <Header/>
        <Switch>
            {/*<Route exact component={LandPage} path='/landing-page'/>*/}
            <Route exact path='/landing-page'><ContentWrap><SwapPage/></ContentWrap></Route>
            <Route exact path='/'><ContentWrap><SwapPage/></ContentWrap></Route>
            <Route path='/trading/lite'><ContentWrap><SwapPage/></ContentWrap></Route>
            <Route path='/trading/lite(/:symbol)'><ContentWrap><SwapPage/></ContentWrap></Route>

            <Route exact path='/markets'><ContentWrap><QuotePage/></ContentWrap> </Route>
            <Route exact path='/mining'><ContentWrap><MiningPage/></ContentWrap> </Route>
            <Route exact path='/layer2'><ContentWrap><Layer2Page/></ContentWrap></Route>
            <Route exact path='/layer2/assets'><ContentWrap><Layer2Page/></ContentWrap></Route>
            <Route exact path='/layer2/my-liquidity'><ContentWrap><Layer2Page/></ContentWrap> </Route>
            <Route exact path='/layer2/history'><ContentWrap><Layer2Page/></ContentWrap></Route>
            <Route exact path='/layer2/order'><ContentWrap><Layer2Page/></ContentWrap></Route>
            <Route exact path='/layer2/rewards'><ContentWrap><Layer2Page/></ContentWrap></Route>
            <Route exact path='/layer2/setting'><ContentWrap><Layer2Page/></ContentWrap></Route>
            <Route exact path='/liquidity'> <ContentWrap><LiquidityPage/></ContentWrap></Route>
            <Route exact path='/liquidity/pools/*'><ContentWrap><LiquidityPage/></ContentWrap></Route>
            <Route exact path='/liquidity/pools'><ContentWrap><LiquidityPage/></ContentWrap></Route>
            <Route exact path='/liquidity/amm-mining'><ContentWrap><LiquidityPage/></ContentWrap> </Route>
            <Route exact path='/liquidity/my-liquidity'><ContentWrap><LiquidityPage/></ContentWrap></Route>

        </Switch>
        <ModalGroup/>
        <Footer/>
    </>
}

export default RouterView
