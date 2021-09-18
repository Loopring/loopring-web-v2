
import * as _ from 'lodash';
import { ammPoolService, tickerService, walletLayer2Service } from '../../services/socket';
import { useWalletLayer2 } from 'stores/walletLayer2';
import React from 'react';
import { useWalletLayer1 } from 'stores/walletLayer1';
import { AccountStatus, globalSetup, MarketType, myLog, SagaStatus } from '@loopring-web/common-resources';
import store from '../../stores';
import { orderbookService } from '../../services/socket/services/orderbookService';
import { merge } from 'rxjs';
import { bookService } from '../../services/socket/services/bookService';
import { updatePageTradePro, usePageTradePro } from '../../stores/router';
import { useSocket } from '../../stores/socket';
import { useAccount } from '../../stores/account';
import { useTokenMap } from '../../stores/token';
import { SocketMap } from '../../stores/socket/interface';
import * as sdk from 'loopring-sdk';
import { LoopringAPI } from '../../api_wrapper';
import { swapDependAsync } from '../SwapPage/help';
import { useAmmMap } from '../../stores/Amm/AmmMap';

/**
 *
 * @param throttleWait
 * @param dependencyCallback
 * @param useInfoUpdateCallback  will update your wallet balance
 * @param walletLayer1Callback
 */
export const useSocketProService = ({
                                        throttleWait = globalSetup.throttleWait,
                                        depDataCallback,
                                        userInfoUpdateCallback,
                                        walletLayer1Callback
                                      }: {
    throttleWait?: number,
    depDataCallback?:()=> void,
    userInfoUpdateCallback?: () => void,
    walletLayer1Callback?: ()=> void,
}) => {
    const {updateWalletLayer1, status: walletLayer1Status,} = useWalletLayer1();
    const {updateWalletLayer2, status: walletLayer2Status,} = useWalletLayer2();
    const subjectWallet = React.useMemo(() => walletLayer2Service.onSocket(), []);
    const subjectBook = React.useMemo(() => bookService.onSocket(), []);
    const {ammMap} = useAmmMap();

    const subjectAmmpool = React.useMemo(() => ammPoolService.onSocket(), []);
    const subjectOrderBook = React.useMemo(() => orderbookService.onSocket(), []);
    const subjectTicker = React.useMemo(() => tickerService.onSocket(), []);




    const _accountUpdate = _.throttle(({walletLayer1Status, walletLayer2Status}) => {
            if (walletLayer1Status !== SagaStatus.PENDING) {
                updateWalletLayer1()
            }
            if (walletLayer2Status !== SagaStatus.PENDING) {
                updateWalletLayer2()
            }
        }, throttleWait)
    // const _accountUpdate = ({walletLayer2Status, walletLayer1Status}: any) => {
    //     accountUpdate({walletLayer2Status, walletLayer1Status})
    // }

    const _dependencyCallback = _.throttle(() => {
        if(depDataCallback){
            depDataCallback()
        }
    }, throttleWait)
    // const  _socketUpdate = React.useCallback(socketUpdate({updateWalletLayer1,updateWalletLayer2,walletLayer1Status,walletLayer2Status}),[]);
    React.useEffect(() => {
        const subscription = merge(subjectAmmpool,subjectOrderBook,subjectTicker).subscribe((value)=>{
            const pageTradePro = store.getState()._router_pageTradePro.pageTradePro
            // @ts-ignore
            if(ammMap && value && value.ammPoolMap){
                // @ts-ignore
                const ammPoolMap = value.ammPoolMap;
                const market = pageTradePro.market;
                const {address} =  ammMap['AMM-'+market];
                const {pooled:_pooled,lp} = ammPoolMap[address]
                if(_pooled && pageTradePro.ammPoolSnapshot){
                    let pooled = pageTradePro.ammPoolSnapshot.pooled
                    pooled = [{  ...pooled[0],
                            volume: _pooled[0]
                        } ,
                        {...pooled[1],
                            volume: _pooled[1]
                        },
                    ]
                    const ammPoolSnapshot = {
                        ...pageTradePro.ammPoolSnapshot,
                        pooled,
                        lp:{
                            ...pageTradePro.ammPoolSnapshot.lp,
                            volume:lp
                        }
                    }
                    store.dispatch(updatePageTradePro( {market, ammPoolSnapshot: ammPoolSnapshot}))
                }


            }
            // @ts-ignore
            if(value && value.tickerMap){
                const market = pageTradePro.market;
                // @ts-ignore
                const tickerMap = value.tickerMap;
                if(tickerMap.market === market){
                    store.dispatch(updatePageTradePro( {market,tickMap:tickerMap}))
                }
            }
            // @ts-ignore
            if(value && value.orderbookMap){
                const market = pageTradePro.market;
                // debugger
                // @ts-ignore
                const orderbook = value.orderbookMap[market];
                if(orderbook && orderbook.symbol){
                    store.dispatch(updatePageTradePro( {market, depth: orderbook}))
                }
            }
            //Ticker will update global ticker at tickerService;
            // const walletLayer2Status = store.getState().walletLayer2.status;
            // const walletLayer1Status = store.getState().walletLayer1.status;
            // const tickerStatus  = store.getState().tickerMap.status;
            // _socketUpdate({walletLayer2Status, walletLayer1Status})
        })
        return () => subscription.unsubscribe();
    }, [subjectAmmpool,subjectOrderBook,subjectTicker]);



    React.useEffect(() => {
        const subscription = merge(subjectWallet,subjectBook).subscribe(()=>{
            const walletLayer2Status = store.getState().walletLayer2.status;
            const walletLayer1Status = store.getState().walletLayer1.status;
            _accountUpdate({walletLayer2Status, walletLayer1Status})
        })
        return () => subscription.unsubscribe();
    }, [subjectWallet,subjectBook]);

    // React.useEffect(() => {
    //     const subscription = merge(subjectWallet,subjectBook).subscribe(()=>{
    //         const walletLayer2Status = store.getState().walletLayer2.status;
    //         const walletLayer1Status = store.getState().walletLayer1.status;
    //         _socketUpdate({walletLayer2Status, walletLayer1Status})
    //     })
    //     return () => subscription.unsubscribe();
    // }, [subjectWallet,subjectBook]);
    React.useEffect(() => {
        if (userInfoUpdateCallback && walletLayer2Status === SagaStatus.UNSET) {
            userInfoUpdateCallback()
        }
    }, [walletLayer2Status])
    React.useEffect(() => {
        if (walletLayer1Callback && walletLayer1Status === SagaStatus.UNSET) {
            walletLayer1Callback()
        }
    }, [walletLayer1Status])
}

export  const useProSocket = () => {
    const {sendSocketTopic, socketEnd} = useSocket();
    const {account, status:accountStatus} = useAccount();
    const {marketArray} = useTokenMap();
    const {ammMap} = useAmmMap();

    const {pageTradePro,updatePageTradePro,__API_REFRESH__} = usePageTradePro();
    const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);

    React.useEffect(() => {
        return () => {
            clearTimeout(nodeTimer.current as NodeJS.Timeout);
        }
    }, [nodeTimer.current]);
    const noSocketLoop = React.useCallback(() => {
       if(window.loopringSocket === undefined){
           getDependencyData();
       }
        //@ts-ignore
        if (nodeTimer.current !== -1) {
            clearTimeout(nodeTimer.current as NodeJS.Timeout);
        }
        nodeTimer.current = setTimeout(noSocketLoop, __API_REFRESH__)
    }, [ nodeTimer])
    const getDependencyData = React.useCallback(async () => {
        const { market} = pageTradePro
        if (market && ammMap && LoopringAPI.exchangeAPI) {
            try {
                const {depth, ammPoolSnapshot, tickMap} = await swapDependAsync(market);
                updatePageTradePro({market, depth, ammPoolSnapshot, tickMap})
            } catch (error) {

            }

        }

    }, [pageTradePro,ammMap])


    React.useEffect(() => {
        //firstTime call it
        getDependencyData();
        noSocketLoop();
        if(ammMap && pageTradePro.market){
            const dataSocket:SocketMap = {
                [ sdk.WsTopicType.ammpool ]:[ ammMap['AMM-'+pageTradePro.market].address],
                [ sdk.WsTopicType.ticker ]:[pageTradePro.market as string],
                [ sdk.WsTopicType.orderbook ]: {markets:[pageTradePro.market],
                    level:pageTradePro.depthLevel,
                    count: 50,
                    snapshot: true
                },
            }
            if (accountStatus === SagaStatus.UNSET){
                if(account.readyState === AccountStatus.ACTIVATED) {
                    sendSocketTopic({
                        ...dataSocket,
                        [ sdk.WsTopicType.account ]: true,
                        [ sdk.WsTopicType.order]:marketArray,

                    })
                }else{
                    sendSocketTopic(dataSocket)
                }
            }

        }

        return () => {
            socketEnd()
        }
    }, [accountStatus,
        pageTradePro.market,
        pageTradePro.depthLevel]);
}

