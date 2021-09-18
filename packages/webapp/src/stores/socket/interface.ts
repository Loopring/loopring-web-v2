export type TickerSocket = string
export type SocketMap = {
    ticker?: TickerSocket[];
    account?: boolean,
    order?: any[],
    orderbook?:{markets:any[],
        level?:number,
        count?:number,
        snapshot?:boolean,
    } ,
    trade?: any[],
    candlestick?: any[],
    ammpool?: any[],
}
