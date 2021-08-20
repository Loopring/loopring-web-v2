import {
    AccountStatus,
    fnType,
    IBData,
    SagaStatus,
    TradeCalcData,
    TradeFloat,
    WalletMap
} from '@loopring-web/common-resources';
import React, { useCallback, useState } from 'react';
import { LoopringAPI } from 'api_wrapper';
import { useTokenMap } from 'stores/token';
import * as sdk from 'loopring-sdk';

import { useAmmMap } from 'stores/Amm/AmmMap';
import { useWalletLayer2 } from 'stores/walletLayer2';
import {
    RawDataTradeItem,
    SwapData,
    SwapTradeData,
    SwapType,
    TradeBtnStatus,
    useSettings
} from '@loopring-web/component-lib';
import { useAccount } from 'stores/account/hook';
import {
    accountStaticCallBack,
    btnClickMap, btnLabel,
    getUserTrades,
    makeCache,
    makeMarketArray,
    makeTickView,
    makeWalletLayer2,
    pairDetailBlock,
    pairDetailDone,
} from 'hooks/help';
import store from 'stores';
import { deepClone } from 'utils/obj_tools';
import { myError, myLog } from 'utils/log_tools';
import { useTranslation } from 'react-i18next';
import { usePairMatch } from 'hooks/usePairMatch';
import { useWalletHook } from 'services/wallet/useWalletHook';
import { useSocket } from 'stores/socket';
import { walletService } from 'services/wallet/walletService';
import { getTimestampDaysLater } from 'utils/dt_tools';
import { DAYS } from 'defs/common_defs';
import { MarketTradeInfo } from 'loopring-sdk/dist/defs/loopring_defs';
import { VolToNumberWithPrecision } from '../../utils/formatter_tool';

const useSwapSocket = ()=>{
    const {sendSocketTopic,socketEnd} = useSocket();
    const { account } = useAccount()
    React.useEffect(() => {
        if(account.readyState === AccountStatus.ACTIVATED){
            sendSocketTopic({[ sdk.WsTopicType.account ]: true});
        }else{
            socketEnd()
        }
        return ()=>{
            socketEnd()
        }
    }, [account.readyState]);
}
export const useSwapPage = <C extends { [key: string]: any }>() => {
    useSwapSocket()
    /** get store value **/
    const { account, status: accountStatus } = useAccount()
    const { coinMap, tokenMap, marketArray, marketCoins, marketMap, } = useTokenMap()
    const { slippage } = useSettings()
    const { walletLayer2 } = useWalletLayer2();
    const { ammMap } = useAmmMap()


    /*** api prepare ***/
    const { t } = useTranslation('common')
    const [swapBtnI18nKey, setSwapBtnI18nKey] = React.useState<string | undefined>(undefined)
    const [swapBtnStatus, setSwapBtnStatus] = React.useState(TradeBtnStatus.AVAILABLE)
    const [isSwapLoading,setIsSwapLoading] = React.useState(false)
    const [quoteMinAmt,setQuoteMinAmt]  =  React.useState<string>()
    const [swapToastOpen, setSwapToastOpen] = useState<{ flag:boolean,type:any,label:string }|undefined>(undefined)
    const [tradeData, setTradeData] = React.useState<SwapTradeData<IBData<C>> | undefined>(undefined);
    const [tradeCalcData, setTradeCalcData] = React.useState<Partial<TradeCalcData<C>>>({});
    const [tradeArray, setTradeArray] = React.useState<RawDataTradeItem[]>([]);
    const [myTradeArray, setMyTradeArray] = React.useState<RawDataTradeItem[]>([]);
    const [tradeFloat, setTradeFloat] = React.useState<TradeFloat | undefined>(undefined);
    const { pair, setPair, market, setMarket, } = usePairMatch('/trading/lite');

    const [ammPoolSnapshot, setAmmPoolSnapshot] = React.useState<sdk.AmmPoolSnapshot | undefined>(undefined);

    const [output, setOutput] = useState<any>()

    const [takerRate, setTakerRate] = useState<string>('0')

    const [feeBips, setFeeBips] = useState<string>('0')

    const [depth, setDepth] = useState<sdk.DepthData>()




    //table myTrade
    const myTradeTableCallback = React.useCallback(()=>{
        if (account.accountId && account.apiKey && LoopringAPI.userAPI) {
            getUserTrades(market)?.then((marketTrades) => {
                let _myTradeArray = makeMarketArray(market, marketTrades) as RawDataTradeItem[]
                setMyTradeArray(_myTradeArray ? _myTradeArray : [])
            })
        } else {
            setMyTradeArray([])
        }

    },[market, account.accountId, account.apiKey])
    React.useEffect(() => {
        if(accountStatus === SagaStatus.UNSET){
            myTradeTableCallback();
        }
    },[account.readyState,market,accountStatus] );
    //table marketTrade
    const marketTradeTableCallback = React.useCallback(()=>{
        if ( LoopringAPI.exchangeAPI) {
            LoopringAPI.exchangeAPI.getMarketTrades({ market }).then(({marketTrades}:{
                totalNum: any;
                marketTrades: MarketTradeInfo[];
                raw_data: any;
            })=>{
                const _tradeArray = makeMarketArray(market, marketTrades)
                setTradeArray(_tradeArray as RawDataTradeItem[])
            })

        } else {
                setTradeArray([])

        }

    },[market]);
    const updateDepth = React.useCallback(async() => {
        myLog('swap page updateDepth',market)
        if (market && LoopringAPI.exchangeAPI) {
            const { depth } = await LoopringAPI.exchangeAPI.getMixDepth({ market })
            setDepth(depth)
        }
    }, [market, setDepth])
    React.useEffect(() => {
        marketTradeTableCallback();
        updateDepth();
    },[market] );
    //Btn related function
    const btnLabelAccountActive = React.useCallback(():string|undefined=>{

        const validAmt = (output?.amountBOut && quoteMinAmt
            && sdk.toBig(output?.amountBOut).gte(sdk.toBig(quoteMinAmt))) ? true : false;
        if(isSwapLoading){
            setSwapBtnStatus(TradeBtnStatus.LOADING)
            return undefined
        }else{
            if (validAmt || quoteMinAmt === undefined ) {
                setSwapBtnStatus(TradeBtnStatus.AVAILABLE)
                return undefined

            }else if(tradeData === undefined || tradeData?.sell.tradeValue === undefined || tradeData?.buy.tradeValue === undefined){
                setSwapBtnStatus(TradeBtnStatus.DISABLED)
                return'labelEnterAmount';
            } else {
                const quote = tradeData?.buy.belong;
                const minOrderSize = VolToNumberWithPrecision(quoteMinAmt, quote) + ' ' + tradeData?.buy.belong;
                setSwapBtnStatus(TradeBtnStatus.DISABLED)
                return `labelLimitMin, ${minOrderSize}`

            }

        }
    },[quoteMinAmt,tradeData,isSwapLoading])
    const _btnLabel = Object.assign(deepClone(btnLabel), {
        [ fnType.ACTIVATED ]: [
            btnLabelAccountActive
        ]});
    React.useEffect(() => {
        if(accountStatus === SagaStatus.UNSET){
            setSwapBtnI18nKey(accountStaticCallBack(_btnLabel));
        }
    }, [account.readyState,accountStatus,isSwapLoading,tradeData?.sell.tradeValue])
    const swapCalculatorCallback = useCallback(async ({ sell, buy, slippage, ...rest }: any) => {

        const { exchangeInfo } = store.getState().system
        setIsSwapLoading(true);
        if (!LoopringAPI.userAPI || !tokenMap || !exchangeInfo || !output
            || account.readyState !== AccountStatus.ACTIVATED) {

            setSwapToastOpen({flag:true,type:'error',label:t('labelSwapFailed')})
            setIsSwapLoading(false)

            return
        }

        const baseToken = tokenMap[sell.belong as string]
        const quoteToken = tokenMap[buy.belong as string]

        const request: sdk.GetNextStorageIdRequest = {
            accountId: account.accountId,
            sellTokenId: baseToken.tokenId
        }

        const storageId = await LoopringAPI.userAPI.getNextStorageId(request, account.apiKey)

        try {

            const tradeChannel = output.exceedDepth ? sdk.TradeChannel.AMM_POOL : sdk.TradeChannel.MIXED

            const request: sdk.SubmitOrderRequestV3 = {
                exchange: exchangeInfo.exchangeAddress,
                accountId: account.accountId,
                storageId: storageId.orderId,
                sellToken: {
                    tokenId: baseToken.tokenId,
                    volume: output.amountS
                },
                buyToken: {
                    tokenId: quoteToken.tokenId,
                    volume: output.amountBOutSlip.minReceived
                },
                allOrNone: false,
                validUntil: getTimestampDaysLater(DAYS),
                maxFeeBips: parseInt(feeBips),
                fillAmountBOrS: false, // amm only false
                orderType: sdk.OrderType.TakerOnly,
                tradeChannel,
                eddsaSignature: '',
            }

            myLog(request)

            const response = await LoopringAPI.userAPI.submitOrder(request, account.eddsaKey.sk, account.apiKey)

            myLog(response)

            if (!response?.hash) {
                setSwapToastOpen({flag:true,type:'error',label:t('labelSwapFailed')})
                myError(response?.errInfo)
                setIsSwapLoading(false);
            } else {
                setSwapToastOpen({flag:true,type:'success',label:t('labelSwapSuccess')})
                walletService.sendUserUpdate()
                setTradeData({
                    ...tradeData,
                    ...{
                        sell: { ...tradeData?.sell, tradeValue: 0 },
                        buy: { ...tradeData?.buy, tradeValue: 0 },
                    }
                } as SwapTradeData<IBData<C>>)
            }
        } catch (reason) {
            setIsSwapLoading(false);
            sdk.dumpError400(reason)

            setSwapToastOpen({flag:true,type:'error',label:t('labelSwapFailed')})

            setIsSwapLoading(false)
        }

        setOutput(undefined)

        if (rest.__cache__) {
            makeCache(rest.__cache__)
        }

    }, [tradeData, output, tokenMap])

    const swapBtnClickArray = Object.assign(deepClone(btnClickMap), {
        [fnType.ACTIVATED]: [swapCalculatorCallback]
    })




    React.useEffect(()=>{
        if(accountStatus === SagaStatus.UNSET){
            walletLayer2Callback()
        }
    },[account.readyState,accountStatus,market,tradeData?.sell.belong, tradeData?.buy.belong])
    const walletLayer2Callback = React.useCallback(async ()=>{
        const base = tradeData?.sell.belong
        const quote = tradeData?.buy.belong
        if (marketArray && base && quote && market &&
            LoopringAPI.userAPI && account.readyState === AccountStatus.ACTIVATED
            && ammMap && account?.accountId && account?.apiKey) {
            const { walletMap } = makeWalletLayer2();
            const {amm} = sdk.getExistedMarket(marketArray, base, quote)
            const req: sdk.GetMinimumTokenAmtRequest = {
                accountId: account.accountId,
                market,
            }
            const { amountMap } = await LoopringAPI.userAPI.getMinimumTokenAmt(req, account.apiKey)
            const baseMinAmtInfo = amountMap[base]
            const quoteMinAmtInfo = amountMap[quote]
            const takerRate = quoteMinAmtInfo.userOrderInfo.takerRate
            const feeBips = amm && ammMap[amm]? ammMap[amm].__rawConfig__.feeBips: 0
            const totalFee = sdk.toBig(feeBips).plus(sdk.toBig(takerRate)).toString()
            setTradeData({
                sell: {
                    belong: tradeCalcData.sellCoinInfoMap ? tradeCalcData.sellCoinInfoMap[tradeCalcData.coinSell]?.simpleName : undefined,
                    balance: walletMap ? walletMap[tradeCalcData.coinSell as string]?.count : 0
                },
                buy: {
                    belong: tradeCalcData.sellCoinInfoMap ? tradeCalcData.sellCoinInfoMap[tradeCalcData.coinBuy]?.simpleName : undefined,
                    balance: walletMap ? walletMap[tradeCalcData.coinBuy as string]?.count : 0
                },
            } as SwapTradeData<IBData<C>>)
            setQuoteMinAmt(quoteMinAmtInfo?.userOrderInfo.minAmount)
            setFeeBips(totalFee)
            setTakerRate(takerRate.toString())
            setTradeCalcData({ ...tradeCalcData,walletMap, fee: totalFee } as TradeCalcData<C>)
        } else {
            setFeeBips('0')
            setTakerRate('0')

            setTradeCalcData({ ...tradeCalcData, walletMap: {}, fee: '0' } as TradeCalcData<C>)
            setTradeData({
                sell: {
                    belong: base,
                    balance: 0
                },
                buy: {
                    belong: quote,
                    balance: 0
                },
            } as SwapTradeData<IBData<C>>)
        }
        setIsSwapLoading(false)
    },[tradeData?.sell.belong, tradeData?.buy.belong, marketArray, ammMap,
        account.readyState, account.apiKey, account.accountId])
    useWalletHook({walletLayer2Callback})

    // myLog('tradeData?.sell.belong:', tradeData?.sell.belong)
    // myLog('tradeData?.buy.belong:', tradeData?.buy.belong)

    //HIGH: effect by wallet state update



    const onSwapClick = React.useCallback(({ sell, buy, slippage, ...rest }: SwapTradeData<IBData<C>>) => {
        accountStaticCallBack(swapBtnClickArray, [{ sell, buy, slippage, ...rest }])
    }, [swapBtnClickArray])

    const handleSwapPanelEvent = async (swapData: SwapData<SwapTradeData<IBData<C>>>, swapType: any): Promise<void> => {

        const { tradeData } = swapData
        resetSwap(swapType, tradeData)

    }




    const throttleSetValue = React.useCallback(async (type,_tradeData) => {

        // const { _tradeData: td, _tradeCalcData } = await calculateTradeData(type, _tradeData, _ammPoolSnapshot)//.then(()=>{
        if (!marketArray || !tokenMap || !marketMap || !ammMap || !tradeCalcData || !market
            || !depth || depth.symbol !== market) {
            let _tradeCalcData = { ...tradeCalcData } as TradeCalcData<C>
            return { _tradeData, _tradeCalcData }
        }

        const isAtoB = type === 'sell'
        let input: any = (isAtoB ? _tradeData.sell.tradeValue : _tradeData.buy.tradeValue)

        if (input) {
            input = (input.toString() as string).trim()
            if (input === '0.') {
                input = '0'
            }
        } else {
            input = '0'
        }

        myLog('input val:', input)

        const base = _tradeData.sell.belong as string
        const quote = _tradeData.buy.belong as string

        let slippage = _tradeData.slippage

        if (slippage === undefined) {
            slippage = 0.5
        }

        slippage = sdk.toBig(slippage).times(100).toString()

        // const ammMapRaw = { ['AMM-' + market]: ammMap['AMM-' + market].__rawConfig__ } as LoopringMap<AmmPoolInfoV3>

        const output = sdk.getOutputAmount(input, base, quote, isAtoB, marketArray, tokenMap,
            marketMap, depth, ammMap as any, ammPoolSnapshot, takerRate, slippage)

        setOutput(output)

        tradeCalcData.priceImpact = output?.priceImpact as string
        tradeCalcData.minimumReceived = output?.amountBOutSlip.minReceivedVal as string

        if (isAtoB) {
            _tradeData.buy.tradeValue = output?.output ? parseFloat(output?.output) : 0
        } else {
            _tradeData.sell.tradeValue = output?.output ? parseFloat(output?.output) : 0
        }

        //TODO: renew  tradeCalcData
        let _tradeCalcData = { ...tradeCalcData } as TradeCalcData<C>;

        setTradeData(_tradeData)
        setTradeCalcData({ ..._tradeCalcData, fee: feeBips })

    }, [ tradeData, ammPoolSnapshot]);

    const resetSwap = (swapType: SwapType | undefined, _tradeData: SwapTradeData<IBData<C>> | undefined) => {

        let type = undefined
        let coinKey = `${_tradeData?.sell.belong}-${_tradeData?.buy.belong}`
        //
        // let _ammPoolSnapshot = ammPoolSnapshot
        //
        switch (swapType) {
            case SwapType.SEll_CLICK:
            case SwapType.BUY_CLICK:
                return
            case SwapType.SELL_SELECTED:
                type = 'sell'
                break
            case SwapType.BUY_SELECTED:
                type = 'buy'
                break
            case SwapType.EXCHANGE_CLICK:
                myLog('Exchange Click')
                break
            default:
                break
        }

        // myLog('*******', tradeCalcData !== undefined, coinKey === `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`,
        // _tradeData !== undefined, type !== undefined, !tradeData, _tradeData)
        // myLog('tradeData:', tradeData, )

        if (tradeCalcData
            && coinKey === `${tradeCalcData.coinSell}-${tradeCalcData.coinBuy}`
            && type
            && _tradeData
            && (!tradeData || (tradeData[type]?.tradeValue !== _tradeData[type]?.tradeValue))) {
            throttleSetValue(type, _tradeData)
        } else {

            let _tradeFloat: Partial<TradeFloat> = {}
            const hasInitialPair = pair?.coinAInfo?.simpleName && pair?.coinBInfo?.simpleName && pair?.coinAInfo?.simpleName !== pair?.coinBInfo?.simpleName
            let _tradeCalcData: Partial<TradeCalcData<C>> = {
                coinSell: hasInitialPair ? pair?.coinAInfo?.simpleName : 'LRC',
                coinBuy: hasInitialPair ? pair?.coinBInfo?.simpleName : 'ETH'
            }
            const sellSymbol = _tradeCalcData.coinSell as string; //_tradeData?.sell.belong as string
            const buySymbol = _tradeCalcData.coinBuy as string; //_tradeData?.buy.belong as string
            // myLog('sellSymbol:', sellSymbol, ' buySymbol:', buySymbol )
            let coinKey = `${sellSymbol}-${buySymbol}`
            if (marketMap && marketMap[coinKey]) {
                _tradeCalcData.coinBuy = buySymbol
            } else {
                if (tokenMap && tokenMap[sellSymbol]) {
                    // myLog(' tradePairs:', tokenMap[sellSymbol].tradePairs )
                    if (tokenMap[sellSymbol].tradePairs.indexOf(buySymbol) >= 0) {
                        _tradeCalcData.coinBuy = buySymbol
                    } else {
                        const newBuy = tokenMap[sellSymbol].tradePairs[0]
                        if (newBuy) {
                            _tradeCalcData.coinBuy = newBuy
                        } else {
                            throw Error('no such symbol!')
                        }
                    }
                } else {
                    _tradeCalcData.coinSell='LRC'
                    _tradeCalcData.coinBuy='ETH'
                }
            }

            let {
                amm,
                market: market2,
                baseShow,
                quoteShow,
            } = sdk.getExistedMarket(marketArray, _tradeCalcData.coinSell as string, _tradeCalcData.coinBuy as string);

            if (market2) {

                setTradeCalcData({ ...tradeCalcData, fee: feeBips, ..._tradeCalcData } as TradeCalcData<C>);
                if (coinMap) {
                    setPair({
                        coinAInfo: coinMap[baseShow],
                        coinBInfo: coinMap[quoteShow],
                    })
                    setMarket(market2)
                }

                let apiList = [];
                //TODO wallet saga done
                if (marketArray && amm && market && ammMap) {
                    // let pairPromise =  usePairTitleBlock({market})
                    apiList = [

                        pairDetailBlock({ coinKey: market, ammKey: amm, ammMap })
                    ];
                    //HiGH: this need add websocket to update infr ticker ammpoolsbalace
                    // @ts-ignore
                    Promise.all([...apiList]).then(
                        ([ { ammPoolsBalance, tickMap }]: any[]) => {
                            setAmmPoolSnapshot(ammPoolsBalance)
                            if (tokenMap) {
                                let { _tradeCalcData: _td } = pairDetailDone({
                                    coinKey: `${_tradeCalcData.coinSell}-${_tradeCalcData.coinBuy}`,
                                    market,
                                    ammPoolsBalance,
                                    tickerData: tickMap[market] ? tickMap[market] : {},
                                    tokenMap,
                                    _tradeCalcData,
                                    coinMap,
                                    marketCoins,
                                    fee: feeBips,
                                })
                                _tradeCalcData = _td;
                                _tradeFloat = makeTickView(tickMap[market] ? tickMap[market] : {})

                                // @ts-ignore
                                setTradeCalcData(_tradeCalcData as TradeCalcData<C>);
                                // @ts-ignore
                                setTradeFloat(_tradeFloat);

                                setTradeData({
                                    sell: {
                                        belong: _tradeCalcData.sellCoinInfoMap ? _tradeCalcData.sellCoinInfoMap[_tradeCalcData.coinSell]?.simpleName : undefined,
                                        balance: _tradeCalcData.walletMap ? _tradeCalcData.walletMap[_tradeCalcData.coinSell]?.count : 0
                                    },
                                    // @ts-ignore
                                    buy: {
                                        belong: _tradeCalcData.sellCoinInfoMap ? _tradeCalcData.sellCoinInfoMap[_tradeCalcData.coinBuy]?.simpleName : undefined,
                                        balance: _tradeCalcData.walletMap ? _tradeCalcData.walletMap[_tradeCalcData.coinBuy]?.count : 0
                                    },
                                } as SwapTradeData<IBData<C>>)
                            }
                        }).catch((error) => {
                            myLog(error)
                        })
                }

            }
        }

    }

    // const inInitSwapPanel = React.useCallback(()=>{
    //     setTradeData({
    //         sell: market.,
    //         buy: T,
    //         slippage})
    // },[market])
    //Init
    React.useEffect(() => {
        resetSwap(undefined,undefined);
    },[] );
    return {
        swapToastOpen,
        setSwapToastOpen,

        tradeCalcData,
        tradeFloat,
        tradeArray,
        myTradeArray,
        tradeData,
        pair,
        marketArray,
        onSwapClick,
        swapBtnI18nKey,
        swapBtnStatus:swapBtnStatus,
        handleSwapPanelEvent,
        updateDepth,
    }

}