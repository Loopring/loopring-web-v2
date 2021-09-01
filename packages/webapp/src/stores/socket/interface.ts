export type TickerSocket = string
export type SocketMap = {
    ticker?: TickerSocket[];
    account?: boolean,
    order?: any[],
    orderbook?: any[],
    trade?: any[],
    candlestick?: any[],
    ammpool?: any[],
}
