import { OrderStatus, TradeChannel } from 'loopring-sdk';
import * as sdk from 'loopring-sdk';
import { OrderInfo } from 'loopring-sdk/dist/defs/loopring_defs';

export type PageTradeLite = {
    market?:string // eg: ETH-LRC, Pair from loopring market
    tradePair?: string  //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
    calcTradeParams?: {
        exceedDepth: boolean,
        isReverse: boolean,
        isAtoB: boolean,
        slipBips: string|number,
        takerRate: string|number,
        feeBips: string|number,
        output: string|number,
        baseAmt: string|number,
        quoteAmt: string|number,
        amountS: string|number,
        amountBOut: string|number,
        amountBOutWithoutFee: string|number,
        amountBOutSlip: {
            minReceived: string|number,
            minReceivedVal: string|number,
        },
        priceImpact: string|number,
    },
    priceImpactObj?:undefined|{    // account has activated or undefined
        value:number|string,
        priceImpactColor:string,
        priceLevel:number|string,
    },
    depth?:sdk.DepthData| undefined
    tickMap?:sdk.LoopringMap<sdk.TickerData> | undefined,
    ammPoolsBalance?:sdk.AmmPoolSnapshot | undefined,
    tradeChannel?:undefined|TradeChannel
    orderType? :undefined|sdk.OrderType
    feeBips?:number|string,
    totalFee?:number|string,
    takerRate?:number|string,
    quoteMinAmtInfo?:number|string,
    buyMinAmtInfo?: undefined|OrderInfo;
    sellMinAmtInfo?: undefined|OrderInfo;
    __SUBMIT_LOCK_TIMER__:1000;
    __TOAST_AUTO_CLOSE_TIMER__:3000;

}






