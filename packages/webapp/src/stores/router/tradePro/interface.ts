import * as sdk from 'loopring-sdk';
import { TradeChannel } from 'loopring-sdk';
import { OrderInfo } from 'loopring-sdk/dist/defs/loopring_defs';
import { MarketType, TradeCalcData } from '@loopring-web/common-resources';

export type PageTradePro<C> = {
    market?: MarketType  // eg: ETH-LRC, Pair from loopring market
    tradePair?: MarketType  //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
    tradeCalcData?: Partial<TradeCalcData<C>>
    calcTradeParams?: {
        exceedDepth: boolean;
        isReverse: boolean;
        isAtoB: boolean;
        slipBips: string;
        takerRate: string | number;
        feeBips: string | number;
        output: string;
        baseAmt: string;
        quoteAmt: string;
        amountS: string;
        amountBOut: string;
        amountBOutWithoutFee: string;
        amountBOutSlip: {
            minReceived: string;
            minReceivedVal: string;
        };
        priceImpact: string;
    },
    priceImpactObj?: undefined | {    // account has activated or undefined
        value: number | string,
        priceImpactColor: string,
        priceLevel: number | string,
    },
    depth?: sdk.DepthData | undefined
    tickMap?: sdk.LoopringMap<sdk.TickerData> | undefined,
    ammPoolSnapshot?: sdk.AmmPoolSnapshot | undefined,
    tradeChannel?: undefined | TradeChannel
    orderType?: undefined | sdk.OrderType
    feeBips?: number | string,
    totalFee?: number | string,
    takerRate?: number | string,
    quoteMinAmtInfo?: number | string,
    buyMinAmtInfo?: undefined | OrderInfo;
    sellMinAmtInfo?: undefined | OrderInfo;
    lastStepAt?:'sell'|'buy'|undefined,
}

export type PageTradeProStatus<C extends { [ key: string ]: any }> = {
    pageTradePro: PageTradePro<C>,
    __DAYS__:30;
    __SUBMIT_LOCK_TIMER__: 1000;
    __TOAST_AUTO_CLOSE_TIMER__: 3000
}





