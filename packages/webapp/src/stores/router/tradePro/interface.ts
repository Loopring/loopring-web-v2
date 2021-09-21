import * as sdk from 'loopring-sdk';
import { TradeChannel,OrderInfo } from 'loopring-sdk';
import { MarketType, TradeCalcProData } from '@loopring-web/common-resources';
import { TickerMap } from '../../ticker';
import { RawDataTradeItem } from '@loopring-web/component-lib';

export type PageTradePro<C> = {
    market?: MarketType  // eg: ETH-LRC, Pair from loopring market
    // tradePair?: MarketType  //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
    tradeCalcProData: Partial<TradeCalcProData<keyof C>>
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
    depth?: sdk.DepthData | undefined,
    depthLevel?: number,
    tickerMap?: TickerMap<any> | undefined,
    ammPoolSnapshot?: sdk.AmmPoolSnapshot | undefined,
    tradeChannel?: undefined | TradeChannel
    orderType?: undefined | sdk.OrderType
    feeBips?: number | string,
    totalFee?: number | string,
    takerRate?: number | string,
    quoteMinAmtInfo?: undefined | OrderInfo,
    baseMinAmtInfo?: undefined | OrderInfo;
    lastStepAt?:'base'|'quote'|undefined,
    tradeArray?:RawDataTradeItem[],
}

export type PageTradeProStatus<C extends { [ key: string ]: any }> = {
    pageTradePro: PageTradePro<C>,
    __DAYS__:30;
    __API_REFRESH__:15000;
    __SUBMIT_LOCK_TIMER__: 1000;
    __TOAST_AUTO_CLOSE_TIMER__: 3000
}





