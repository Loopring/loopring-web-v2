import React, { useEffect } from "react";
import { useDeepCompareEffect } from 'react-use'
import {
    AmmActivity,
    CoinInfo,
    getThousandFormattedNumbers,
    MyAmmLP,
    SagaStatus,
    TradeFloat
} from "@loopring-web/common-resources";
import { useTokenMap } from "stores/token";
import { useLocation, useRouteMatch } from 'react-router';
import moment from 'moment'
import { AmmDetailStore, useAmmMap } from '../../../stores/Amm/AmmMap';
import { useWalletLayer2 } from '../../../stores/walletLayer2';
import { makeTickView, makeWalletLayer2, useAmmTotalValue, volumeToCount, WalletMapExtend } from '../../../hooks/help';
import {
    AmmPoolActivityRule,
    AmmPoolSnapshot,
    AmmUserRewardMap,
    getExistedMarket,
    LoopringMap,
    TickerData,
    TradingInterval
} from 'loopring-sdk';
import { deepClone } from '../../../utils/obj_tools';
import { getUserAmmTransaction, makeMyAmmMarketArray } from '../../../hooks/help/marketTable';
import { AmmRecordRow } from '@loopring-web/component-lib';
import { useSystem } from '../../../stores/system';
import { makeMyAmmWithSnapshot } from '../../../hooks/help/makeUIAmmActivityMap';
import { useUserRewards } from '../../../stores/userRewards';
import { LoopringAPI } from 'api_wrapper';
import { useWalletLayer2Socket } from 'services/socket/';
import store from 'stores'
import { calcPriceByAmmTickMapDepth, swapDependAsync } from '../../SwapPage/help';

const makeAmmDetailExtendsActivityMap = ({ammMap, coinMap, ammActivityMap, ammKey}: any) => {

    if (ammMap && coinMap) {
        let ammDetail = deepClone(ammMap[ ammKey as string ]);
        const ammActivity = ammActivityMap [ ammKey as string ];

        if (ammDetail && ammDetail.coinA) {
            ammDetail.myCoinA = coinMap[ ammDetail.coinA ];
            ammDetail.myCoinB = coinMap[ ammDetail.coinB ];
            ammDetail[ 'activity' ] = ammActivity ? ammActivity : {};
        }
        return ammDetail;
    }
}
type PgAmmDetail<C extends { [ key: string ]: any }> = AmmDetailStore<C> & {
    myCoinA: CoinInfo<C>,
    myCoinB: CoinInfo<C>,
    activity: AmmActivity<C> | undefined
}

export type ammHistoryItem = {
    close: number;
    timeStamp: number;
}

export type AwardItme = {
    start: string,
    end: string,
    market: string,
    accountId: number,
    awardList: {
        token?: string,
        volume?: number,
    }[]
}

export const useCoinPair = <C extends { [ key: string ]: any }>(ammActivityMap: LoopringMap<LoopringMap<AmmPoolActivityRule[]>>) => {
    const match: any = useRouteMatch("/liquidity/pools/coinPair/:symbol")
    const {coinMap, tokenMap, marketArray, addressIndex} = useTokenMap();
    const {faitPrices} = useSystem();
    const {ammMap, getAmmMap, status: ammMapStatus} = useAmmMap();
    const {userRewardsMap, status: useUserRewardsStatus} = useUserRewards()
    const {accountId} = store.getState().account
    const tokenMapList = tokenMap ? Object.entries(tokenMap) : []
    let routerLocation = useLocation()

    // const {account} = useAccount();


    // const {ammMap, getAmmMap} = ammMapState;

    // const {ammMap,updateAmmMap} = useAmmMap();
    // const walletLayer2State = useWalletLayer2();
    const {walletLayer2} = useWalletLayer2();
    const [walletMap, setWalletMap] = React.useState<WalletMapExtend<C> | undefined>(undefined);
    // const [ammRecordArray, setAmmRecordArray] = React.useState<AmmRecordRow<C>[]>([]);
    const [ammMarketArray, setAmmMarketArray] = React.useState<AmmRecordRow<C>[]>([]);
    const [ammTotal, setAmmTotal] = React.useState(0)
    const [ammUserTotal, setAmmUserTotal] = React.useState(0)
    // const [recentTxnTotal, setRecentTxnTotal] = React.useState(0)

    const [myAmmMarketArray, setMyAmmMarketArray] = React.useState<AmmRecordRow<C>[]>([]);
    // const [recentMarketArray, setRecentMarketArray] = React.useState<any[]>([])
    const [ammUserRewardMap, setAmmUserRewardMap] = React.useState<AmmUserRewardMap | undefined>(undefined);
    const [snapShotData, setSnapShotData] = React.useState<{
        tickerData: TickerData | undefined
        ammPoolSnapshot: AmmPoolSnapshot | undefined
    } | undefined>(undefined);

    const [myAmm, setMyAmm] = React.useState<MyAmmLP<C>>(
        {
            feeA: 0,
            feeB: 0,
            feeDollar: 0,
            feeYuan: 0,
            reward: 0,
            rewardToken: undefined as any,
            balanceA: 0,
            balanceB: 0,
            balanceYuan: 0,
            balanceDollar: 0,
        })
    // const [ammPoolSnapshot, setammPoolSnapshot] = React.useState<AmmPoolSnapshot|undefined>(undefined);
    const [coinPairInfo, setCoinPairInfo] = React.useState<PgAmmDetail<C>>({
        myCoinA: undefined,
        myCoinB: undefined,
        activity: undefined,
        totalRewards: undefined,
        amountDollar: undefined,
        amountYuan: undefined,
        totalLPToken: undefined,
        totalA: undefined,
        totalB: undefined,
        rewardToken: undefined,
        rewardValue: undefined,
        feeA: undefined,
        feeB: undefined,
        isNew: undefined,
        isActivity: undefined,
        APY: undefined
    } as unknown as PgAmmDetail<C>);
    const [tradeFloat, setTradeFloat] = React.useState<TradeFloat | undefined>(undefined);
    const [pair, setPair] = React.useState<{ coinAInfo: CoinInfo<C> | undefined, coinBInfo: CoinInfo<C> | undefined }>({
        coinAInfo: undefined,
        coinBInfo: undefined,
    });
    const [pairHistory, setPairHistory] = React.useState<ammHistoryItem[]>([])
    const [awardList, setAwardLsit] = React.useState<AwardItme[]>([])
    const [isLoading, setIsLoading] = React.useState(false)
    const [lpTokenList, setLpTokenList] = React.useState<{ addr: string; price: number; }[]>([])
    const {getAmmLiquidity} = useAmmTotalValue()
    const {forex} = store.getState().system

    const getAwardList = React.useCallback(async () => {
        if (LoopringAPI.ammpoolAPI) {
            const result = await LoopringAPI.ammpoolAPI.getLiquidityMiningUserHistory({
                accountId,
                start: 0,
                end: Number(moment()),
            })
            if (result && result.userMiningInfos) {
                const formattedList = result.userMiningInfos.map(o => ({
                    start: moment(o.start).format('YYYY/MM/DD'),
                    end: moment(o.end).format('YYYY/MM/DD'),
                    market: o.market,
                    accountId: o.account_id,
                    awardList: o.awards.map(item => {
                        const market = tokenMapList.find(o => o[ 1 ].tokenId === item.tokenId)?.[ 0 ];
                        return ({
                            token: market,
                            volume: volumeToCount(market as string, item.volume)
                        })
                    })
                }))
                setAwardLsit(formattedList)
            }
        }
    }, [accountId])

    useEffect(() => {
        getAwardList()
    }, [getAwardList])

    const getLpTokenList = React.useCallback(async () => {
        if (LoopringAPI.walletAPI) {
            const result = await LoopringAPI.walletAPI.getLatestTokenPrices()
            const list = Object.entries(result.tokenPrices).map(([addr, price]) => ({
                addr,
                price,
            }))
            setLpTokenList(list)
        }
        return []
    }, [])

    useEffect(() => {
        getLpTokenList()
    }, [getLpTokenList])

    const getLpTokenPrice = React.useCallback((market: string) => {
        if (addressIndex && !!lpTokenList.length) {
            const address = Object.entries(addressIndex).find(([_, token]) => token === market)?.[ 0 ]
            if (address && lpTokenList) {
                return lpTokenList.find((o) => o.addr === address)?.price
            }
            return undefined
        }
        return undefined
    }, [addressIndex, lpTokenList])

    const getUserAmmPoolTxs = React.useCallback(({
                                                     limit = 7,
                                                     offset = 0,
                                                 }) => {
        if (ammMap && forex) {
            const url = routerLocation.pathname
            const list = url.split('/')
            const market = list[ list.length - 1 ]
            const addr = ammMap[ 'AMM-' + market ].address
            setIsLoading(true)
            getUserAmmTransaction({
                address: addr,
                limit: limit,
                offset,
            })?.then((res) => {
                let _myTradeArray = makeMyAmmMarketArray(market, res.userAmmPoolTxs)

                const formattedArray = _myTradeArray.map((o: any) => {
                    const market = `LP-${o.coinA.simpleName}-${o.coinB.simpleName}`
                    const formattedBalance = Number(volumeToCount(market, o.totalBalance))
                    const price = getLpTokenPrice(market)
                    const totalDollar = (formattedBalance || 0) * (price || 0) as any;
                    const totalYuan = totalDollar * forex
                    return ({
                        ...o,
                        totalDollar: getThousandFormattedNumbers(totalDollar.toFixed(2)),
                        totalYuan: getThousandFormattedNumbers(Number((totalYuan).toFixed(2))),
                    })
                })
                // setMyAmmMarketArray(_myTradeArray ? _myTradeArray : [])
                setMyAmmMarketArray(formattedArray || [])
                setAmmUserTotal(res.totalNum)
                setIsLoading(false)
            })
        }
    }, [ammMap, routerLocation.pathname, forex, getLpTokenPrice])

    // const getRecentAmmPoolTxs = React.useCallback(({
    //     limit = 7,
    //     offset = 0,
    // }) => {
    //     if (ammMap && forex) {
    //         const url = routerLocation.pathname
    //         const list = url.split('/')
    //         const market = list[list.length - 1]
    //         const addr = ammMap['AMM-' + market].address
    //         setIsLoading(true)
    //         getRecentAmmTransaction({
    //             address: addr,
    //             limit: limit,
    //             offset,
    //         })?.then(({ammPoolTrades, totalNum}) => {
    //             const formattedTrades = ammPoolTrades.map(o => ({
    //                 ...o,
    //                 hash: o.orderHash,
    //                 txType: '',
    //             }))
    //             let _myTradeArray = makeMyAmmMarketArray(market, formattedTrades)

    //             const formattedArray = _myTradeArray.map((o: any) => {
    //                 const market = `LP-${o.coinA.simpleName}-${o.coinB.simpleName}`
    //                 const formattedBalance = Number(volumeToCount(market, o.totalBalance))
    //                 const price = getLpTokenPrice(market)
    //                 const totalDollar = (formattedBalance || 0) * (price || 0) as any;
    //                 const totalYuan = totalDollar * forex
    //                 return ({
    //                     ...o,
    //                     totalDollar: getThousandFormattedNumbers(totalDollar.toFixed(2)),
    //                     totalYuan: getThousandFormattedNumbers(Number((totalYuan).toFixed(2))),
    //                 })
    //             })
    //             // setMyAmmMarketArray(_myTradeArray ? _myTradeArray : [])
    //             setRecentMarketArray(formattedArray || [])
    //             setRecentTxnTotal(totalNum)
    //             setIsLoading(false)
    //         })
    //     }
    // }, [ammMap, routerLocation.pathname, forex, getLpTokenPrice])

    useDeepCompareEffect(() => {
        if (!!lpTokenList.length) {
            getUserAmmPoolTxs({})
        }
    }, [getUserAmmPoolTxs, lpTokenList])

    const walletLayer2DoIt = React.useCallback((market) => {
        const {walletMap: _walletMap} = makeWalletLayer2();

        setWalletMap(_walletMap as WalletMapExtend<any>)
        if (_walletMap) {
            // getUserAmmTransaction('0xfEB069407df0e1e4B365C10992F1bc16c078E34b')?.then((marketTrades) => {
            //     let _myTradeArray = makeMyAmmMarketArray(market, marketTrades)
            //     setMyAmmMarketArray(_myTradeArray ? _myTradeArray : [])
            // })
            getUserAmmPoolTxs({})
        }
        return _walletMap
    }, [makeWalletLayer2, getUserAmmPoolTxs, makeMyAmmMarketArray, marketArray, pair])

    const getPairList = React.useCallback(async () => {
        if (LoopringAPI.exchangeAPI && coinPairInfo.coinA && coinPairInfo.coinB) {
            const {myCoinA, myCoinB} = coinPairInfo
            const market = `${myCoinA?.name}-${myCoinB?.name}`
            const ammList = await LoopringAPI.exchangeAPI.getMixCandlestick({
                market: market,
                interval: TradingInterval.d1,
                limit: 30
            })
            const formattedPairHistory = ammList.candlesticks.map(o => ({
                ...o,
                timeStamp: o.timestamp,
                date: moment(o.timestamp).format('MMM DD')
            })).sort((a, b) => a.timeStamp - b.timeStamp)
            setPairHistory(formattedPairHistory)
        }
    }, [coinPairInfo])

    React.useEffect(() => {
        getPairList()
    }, [getPairList])

    React.useEffect(() => {
        const coinKey = match?.params.symbol ?? undefined;
        let _tradeFloat: Partial<TradeFloat> | undefined = {}
        const [, coinA, coinB] = coinKey.match(/(\w+)-(\w+)/i)
        let {
            amm,
            market
        } = getExistedMarket(marketArray, coinA, coinB);

        const _coinPairInfo = makeAmmDetailExtendsActivityMap({ammMap, coinMap, ammActivityMap, ammKey: amm})
        setCoinPairInfo(_coinPairInfo ? _coinPairInfo : {})

        if (coinMap) {
            setPair({
                coinAInfo: coinMap[ coinA ],
                coinBInfo: coinMap[ coinB ]
            })
        }

        // let _walletMap: WalletMapExtend<C>|undefined = undefined
        if (walletLayer2) {
            walletLayer2DoIt(market);
        }

        if (amm && market && ammMap) {
            //TODO should add it into websocket
            getAmmMap();
            swapDependAsync(market).then(
                ({ammPoolSnapshot, tickMap, depth}) => {
                    if (tokenMap && tickMap) {
                        const _snapShotData = {
                            tickerData: tickMap[ market ],
                            ammPoolSnapshot: ammPoolSnapshot,
                        }
                        const {close} = calcPriceByAmmTickMapDepth({
                            market,
                            tradePair: market,
                            dependencyData: {ammPoolSnapshot, tickMap, depth}
                        })

                        _tradeFloat = makeTickView(tickMap[ market ] ? tickMap[ market ] : {})
                        setTradeFloat({..._tradeFloat, close: close} as TradeFloat);
                        setCoinPairInfo({..._coinPairInfo})
                        setSnapShotData(_snapShotData)

                    }
                }).catch((error) => {
                console.log(error);
                throw  Error
            })
        }

    }, []);

    // React.useEffect(() => {
    //     const {market} = getExistedMarket(marketArray, pair.coinAInfo?.simpleName as string, pair.coinBInfo?.simpleName as string);
    //     if (market && snapShotData && snapShotData.ammPoolSnapshot && walletLayer2Status === SagaStatus.UNSET) {
    //         const _walletMap = walletLayer2DoIt(market);
    //         const _myAmm: MyAmmLP<C> = makeMyAmmWithSnapshot(market, _walletMap, ammUserRewardMap, snapShotData);
    //         setMyAmm(_myAmm)
    //         // case "DONE":
    //         //             walletLayer2State.statusUnset();
    //
    //         //         break;
    //         //     default:
    //         //         break;
    //         //
    //         // }
    //     }
    // }, [walletLayer2Status])
    const walletLayer2Callback = React.useCallback(() => {
        const {market} = getExistedMarket(marketArray, pair.coinAInfo?.simpleName as string, pair.coinBInfo?.simpleName as string);
        if (market && snapShotData && snapShotData.ammPoolSnapshot) {
            const _walletMap = walletLayer2DoIt(market);
            const _myAmm: MyAmmLP<C> = makeMyAmmWithSnapshot(market, _walletMap, ammUserRewardMap, snapShotData);
            setMyAmm(_myAmm);
        }
    }, [])
    useWalletLayer2Socket({walletLayer2Callback})


    React.useEffect(() => {
        const {market} = getExistedMarket(marketArray, pair.coinAInfo?.simpleName as string, pair.coinBInfo?.simpleName as string);
        if (useUserRewardsStatus === SagaStatus.UNSET && market) {
            // const {userRewardsMap} = store.getState().userRewardsMap
            setAmmUserRewardMap(userRewardsMap)
            const _myAmm: MyAmmLP<C> = makeMyAmmWithSnapshot(market, walletMap, ammUserRewardMap, snapShotData);
            setMyAmm(_myAmm);
        }

    }, [useUserRewardsStatus])

    React.useEffect(() => {
        if (ammMapStatus === SagaStatus.UNSET && ammMap && pair.coinAInfo?.simpleName && pair.coinBInfo?.simpleName) {
            const _coinPairInfo = makeAmmDetailExtendsActivityMap(
                {
                    ammMap,
                    coinMap,
                    ammActivityMap,
                    ammKey: 'AMM-' + pair.coinAInfo.simpleName + pair.coinBInfo.simpleName
                })
            setCoinPairInfo({
                ...coinPairInfo, ..._coinPairInfo,
                tradeFloat: coinPairInfo.tradeFloat
            })

        }
    }, [ammMapStatus])

    return {
        walletMap,
        myAmm,
        // tickerData,
        coinPairInfo,
        snapShotData,
        // ammPoolSnapshot,                       App.tsx
        pair,
        tradeFloat,
        ammMarketArray,
        myAmmMarketArray,
        pairHistory,
        awardList,
        getUserAmmPoolTxs,
        showAmmPoolLoading: isLoading,
        ammTotal,
        ammUserTotal,
    }
}