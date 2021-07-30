import { MouseEventHandler } from 'react';
import { CoinInfo, PriceTag, TradeFloat } from '@loopring-web/common-resources';
import { TradeBtnStatus } from '../panel';

export type MarketBlockProps<C> = {
    coinAInfo: CoinInfo<C>,
    coinBInfo: CoinInfo<C>,
    tradeFloat: TradeFloat,
    chartData?: {
        close: number;
        timeStamp: number
    }[]
}


export type AssetTitleProps = {
    assetInfo: {
        isShow?: boolean
        totalAsset: number,
        priceTag: typeof PriceTag[keyof typeof PriceTag],
        [ key: string ]: any,
    },
    onShowWithdraw: MouseEventHandler<any>,
    onShowTransfer: MouseEventHandler<any>,
    onShowDeposit: MouseEventHandler<any>,
    btnShowDepositStatus?: keyof typeof TradeBtnStatus,
    btnShowTransferStatus?: keyof typeof TradeBtnStatus,
    btnShowWithdrawStatus?: keyof typeof TradeBtnStatus,
}
