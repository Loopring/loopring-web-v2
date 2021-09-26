import * as sdk from 'loopring-sdk';
import { OrderInfo } from 'loopring-sdk';
import { MarketType, TradeCalcProData } from '@loopring-web/common-resources';
import { Ticker } from '../../ticker';
import { RawDataTradeItem, TradeProType } from '@loopring-web/component-lib';

export type marketCalcParams = {
    exceedDepth: boolean;
    isReverse: boolean;
    isAtoB: boolean;
    slipBips: string;
    takerRate: string | number;
    feeBips: string | number;
    output: string;
    sellAmt: string;
    buyAmt: string;
    amountS: string;
    amountBOut: string;
    amountBOutWithoutFee: string;
    amountBOutSlip: {
        minReceived: string;
        minReceivedVal: string;
    };
    priceImpact: string;
}

export type limitCalcParams = {
    isBuy: boolean
    priceImpact: number
    baseVol: string
    baseVolShow: string | number ,
    amountBOut: string;
    quoteVol: string
    quoteVolShow: string | number
}

export type PageTradePro<C> = {
    market: MarketType  // eg: ETH-LRC, Pair from loopring market
    // tradePair?: MarketType  //eg: ETH-LRC or LRC-ETH  ${sell}-${buy}
    request?: sdk.SubmitOrderRequestV3 | null | undefined,
    tradeCalcProData: Partial<TradeCalcProData<keyof C>>
    calcTradeParams?:Partial<marketCalcParams> | null | undefined,
    limitCalcTradeParams?:Partial<limitCalcParams> | null | undefined,
    priceImpactObj?: undefined | {    // account has activated or undefined
        value: number | string,
        priceImpactColor: string,
        priceLevel: number | string,
    },
    tradeType:TradeProType
    defaultPrice?:number,
    precisionLevels?: { value: number,label:string }[],
    depth?: sdk.DepthData | undefined,
    depthLevel?: number ,
    ticker?: Ticker| undefined,
    ammPoolSnapshot?: sdk.AmmPoolSnapshot | undefined,
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





