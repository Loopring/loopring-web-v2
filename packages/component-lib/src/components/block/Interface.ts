import  { MouseEventHandler } from 'react';
import { CoinInfo, PriceTag, TradeFloat } from 'static-resource';
import { TradeBtnStatus } from '../panel';
import { ButtonProps } from '../basic-lib';

export type MarketBlockProps<C> = {
    coinAInfo: CoinInfo<C>,
    coinBInfo: CoinInfo<C>,
    tradeFloat: TradeFloat,
    chartData?: {
        close: number;
        timeStamp: number
    }[]
}

export type AccountInfoProps = {
    addressShort: string
    address: string,
    level?: string,
    etherscanLink: string,
    mainBtn?: JSX.Element | React.ElementType<ButtonProps>
    connectBy:string,
    onDisconnect?: any,
    onSwitch?: any,
    onLock?: any,
    onCopy?: any,
    onViewQRCode?: any,
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
