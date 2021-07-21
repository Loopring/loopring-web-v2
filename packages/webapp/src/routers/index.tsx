import { HashRouter as Router, Route, Switch, } from 'react-router-dom'

import Header from 'layouts/header'

import QuotePage from 'pages/QuotePage'
import { SwapPage } from 'pages/SwapPage'

import DebugPage from 'pages/DebugPage'

import Container from '@material-ui/core/Container'
import { Box } from '@material-ui/core'
import { DevWrapper } from '../provider/'
import { Layer2Page } from '../pages/Layer2Page'
import { LiquidityPage } from '../pages/LiquidityPage'

const RouterView = () => {
    
    return <Router>
        <Header />

        {/*<Box style={{marginTop: `var(--header-height)`}} flex={1} display={'flex'}>*/}
        <Container maxWidth="lg" style={{minHeight:'calc(100% - 64px - 32px)',display:'flex',flexDirection:'column'}}>
            {/*style={{height: '100%' }}*/}
            <Box display={'flex'} flex={1} alignItems={'stretch'} flexDirection={'row'} marginTop={3}  >
                <Switch>
                    <Route exact component={SwapPage} path='/'/>
                    <Route exact component={QuotePage} path='/markets'/>
                    <Route component={SwapPage} path='/trading/lite'/>
                    <Route component={SwapPage} path='/trading/lite(/:symbol)'/>

                    <Route exact component={Layer2Page} path='/layer2'/>
                    <Route exact component={Layer2Page} path='/layer2/assets'/>
                    <Route exact component={Layer2Page} path='/layer2/transactions'/>
                    <Route exact component={Layer2Page} path='/layer2/trades'/>
                    <Route exact component={Layer2Page} path='/layer2/ammRecords'/>
                    {/* <Route exact component={Layer2Page} path='/layer2/orders'/> */}
                    <Route exact component={Layer2Page} path='/layer2/setting'/>

                    <Route exact component={LiquidityPage} path='/liquidity'/>
                    <Route exact component={LiquidityPage} path='/liquidity/pools/*'/>
                    <Route exact component={LiquidityPage} path='/liquidity/pools'/>
                    {/*<Route exact component={LiquidityPage} path='/liquidity/pools/coinPair(/:symbol)'/>*/}
                    <Route exact component={LiquidityPage} path='/liquidity/amm-mining'/>
                    <Route exact component={LiquidityPage} path='/liquidity/my-liquidity'/>
                    <Route exact component={LiquidityPage} path='/liquidity/orderBook-Mining'/>
                    <Route exact component={LiquidityPage} path='/liquidity/maker-rebates'/>

                    <DevWrapper>
                        <Route exact path='/debug'>
                            <DebugPage/>
                        </Route>
                    </DevWrapper>

                </Switch>
            </Box>
        </Container>
        {/*</Box>*/}

    </Router>
}

export default RouterView
