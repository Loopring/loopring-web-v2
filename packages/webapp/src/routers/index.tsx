import { Route, Switch } from 'react-router-dom'
import React from 'react';
import { Container, Box } from '@mui/material'
import Header from 'layouts/header'
import Footer from '../layouts/footer';
import { ModalGroup } from '../modal';
import { LAYOUT } from '../defs/common_defs';
import { QuotePage } from 'pages/QuotePage'
import { SwapPage } from 'pages/SwapPage'
import { Layer2Page } from 'pages/Layer2Page'
import { LiquidityPage } from 'pages/LiquidityPage'
import { MiningPage } from 'pages/MiningPage'
import { OrderbookPage } from 'pages/ProTradePage';



const ContentWrap = ({ children }: React.PropsWithChildren<any>) => {
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
    const proFlag = !!(process.env.REACT_APP_WITH_PRO && process.env.REACT_APP_WITH_PRO === 'true')

    return <>
        <Header />
        <Switch>
            {/*<Route exact component={LandPage} path='/landing-page'/>*/}
            <Route exact path='/landing-page'><ContentWrap><SwapPage /></ContentWrap></Route>
            <Route exact path='/'><ContentWrap><SwapPage /></ContentWrap></Route>
            <Route path='/trading/lite'><ContentWrap><SwapPage /></ContentWrap></Route>
            <Route path='/trading/lite(/:symbol)'><ContentWrap><SwapPage /></ContentWrap></Route>

            {
                proFlag && <Route path='/trading/pro'><OrderbookPage /></Route>
            }
            {
                proFlag && <Route path='/trading/pro(/:symbol)'><OrderbookPage /></Route>
            }

            <Route exact path='/markets'><ContentWrap><QuotePage /></ContentWrap> </Route>
            <Route exact path='/mining'><ContentWrap><MiningPage /></ContentWrap> </Route>
            <Route exact path='/layer2'><ContentWrap><Layer2Page /></ContentWrap></Route>
            <Route exact path='/layer2/assets'><ContentWrap><Layer2Page /></ContentWrap></Route>
            <Route exact path='/layer2/my-liquidity'><ContentWrap><Layer2Page /></ContentWrap> </Route>
            <Route exact path='/layer2/history'><ContentWrap><Layer2Page /></ContentWrap></Route>
            <Route exact path='/layer2/order'><ContentWrap><Layer2Page /></ContentWrap></Route>
            <Route exact path='/layer2/rewards'><ContentWrap><Layer2Page /></ContentWrap></Route>
            <Route exact path='/layer2/security'><ContentWrap><Layer2Page /></ContentWrap></Route>
            <Route exact path='/layer2/vip'><ContentWrap><Layer2Page /></ContentWrap></Route>
            <Route exact path='/liquidity'> <ContentWrap><LiquidityPage /></ContentWrap></Route>
            <Route exact path='/liquidity/pools/*'><ContentWrap><LiquidityPage /></ContentWrap></Route>
            <Route exact path='/liquidity/pools'><ContentWrap><LiquidityPage /></ContentWrap></Route>
            <Route exact path='/liquidity/amm-mining'><ContentWrap><LiquidityPage /></ContentWrap> </Route>
            <Route exact path='/liquidity/my-liquidity'><ContentWrap><LiquidityPage /></ContentWrap></Route>

        </Switch>
        <ModalGroup />
        <Footer />
    </>
}

export default RouterView
