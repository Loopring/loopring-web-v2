import {
    ChainId,
    getAccountArg,
    getAmmpoolArg,
    getCandlestickArg,
    getOrderArg,
    getOrderBookArg,
    getTickerArg,
    getTradeArg,
    toBig,
} from 'loopring-sdk';
import { tickerService } from './tickerService';
import { ammPoolService } from './ammPoolService';
import { CustomError, ErrorMap } from '@loopring-web/common-resources';
import { LoopringAPI } from '../stores/apis/api';
// import store from '../stores';
// import { updateSocketURL } from '../stores/system';


export type SocketEvent = (e: any, ...props: any[]) => any

export enum SocketEventType {
    pingpong = 'pingpong',
    account = "account",
    order = "order",
    orderbook = "orderbook",
    trade = "trade",
    ticker = "ticker",
    candlestick = "candlestick",
    ammpool = "ammpool"
}

export type SocketCallbackMap = {
    // [SocketEventType.pingpong]:  { fn: SocketEvent, deps?: any[] },
    [key in SocketEventType]?: { fn: SocketEvent, deps: any[] }
}
//
export type SocketEventMap = {
    [key in SocketEventType]: SocketEvent
}

export class LoopringSocket {
    private static SocketEventMap: SocketEventMap = {
        [ SocketEventType.account ]: (_e: any) => {

        },
        [ SocketEventType.order ]: (_e: any) => {

        },
        [ SocketEventType.orderbook ]: (_e: any) => {

        },
        [ SocketEventType.trade ]: (_e: any) => {

        },
        [ SocketEventType.ticker ]: (data: string[]) => {
            const [symbol, timestamp, size, volume, open, high, low, close, count, bid, ask] = data;
            // @ts-ignore
            const [, base, quote] = symbol.match(/(\w+)-(\w+)/i);
            const base_token_volume = size;
            const quote_token_volume = volume;
            const change = open === undefined || Number(open) === 0 ? undefined : (toBig(close).minus(open)).div(open)
            tickerService.sendTicker({
                [ symbol ]: {
                    symbol, base, quote,
                    base_token_volume,
                    quote_token_volume,
                    timestamp: Number(timestamp),
                    change,
                    base_fee_amt: undefined,
                    quote_fee_amt: undefined,
                    open, high, low, close, count, bid, ask
                } as any
            })
        },
        [ SocketEventType.candlestick ]: (_e: any) => {

        },
        [ SocketEventType.candlestick ]: (data: string) => {

        },
        [ SocketEventType.ammpool ]: (data: string[]) => {
            // const [market,timestamp,size,volume,open,high,low,close,count,bid,ask] = data;
            // @ts-ignore
            const [poolName, poolAddress, pooled, [tokenId, volume], risky] = data;
            // @ts-ignore
            ammPoolService.sendAmmPool({poolName, poolAddress, pooled, lp: {tokenId, volume}, risky})
        },
        // @ts-ignore
        [ SocketEventType.pingpong ]: (data: string, instance:InstanceType<LoopringSocket>) => {

            if (data === 'ping') {
                instance.loopringSocket.send('pong')
            }
        },
    }
    get loopringSocket(): WebSocket | undefined {
        return this._loopringSocket;
    }
    get socketCallbackMap(): SocketCallbackMap | undefined {
        return this._socketCallbackMap;
    }
    //TODO fill the socket receiver format callback

    private _socketCallbackMap: SocketCallbackMap|undefined;
    private _loopringSocket:WebSocket|undefined;
    private __wsTimer__:{timer:NodeJS.Timer|-1,count:number} = {
        timer:-1,
        count:0
    };
    private _baseUrl:string;
    constructor(url:string) {
        // const url = ChainId.MAINNET === chainId ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_UAT;
        this._baseUrl = url; // baseSocket: string = `wss://ws.${url}/v3/ws?wsApiKey=${wsKey}`;
    }

    // private static PingPong = {
    //     fn:
    // }

    public socketSendMessage = async ({socket, apiKey}: {
        chainId: ChainId | 'unknown',
        socket: { [ key: string ]: string[] }
        apiKey?: string
    }): Promise<boolean> => {
        try {
            if (socket && Reflect.ownKeys(socket).length) {
                //register ping pong event
                this.clearInitTimer(true);
                this.resetSocketEvents();
                const {topics} = this.makeMessageArray({socket});
                if (!this.isConnectSocket() ) {
                    await this.socketConnect({ topics, apiKey})
                } else {

                    this._loopringSocket?.send(this.makeTopics(topics))

                }
                return true
            } else {
                if (!this.isConnectSocket()) {
                    this.socketClose();
                }
                return false
            }
        } catch (error) {
            throw  new CustomError(ErrorMap.SOCKET_ERROR)
        }

    }
    public socketClose = async () => {
        let ws: WebSocket | undefined = this._loopringSocket;

        return new Promise((reolve) => {
            if (ws) {
                ws.onclose = function (e) {
                    reolve(`Socket is closed, ${e.reason}`)
                };
                ws.close();
            } else {
                Promise.resolve('no websocket')
            }
        })
    }

    public removeSocketEvents = (key: string) => {
        // @ts-ignore
        if (this._socketCallbackMap && this._socketCallbackMap[ key ]) {
            // @ts-ignore
            delete this._socketCallbackMap[ key ]
        }
    }

    private makeMessageArray = ({socket}: { socket: { [ key: string ]: string[] } }): {
        topics: any[]
    } => {
        let topics: any[] = [], list: any[] = []; // let registerDispatch = [];
        Reflect.ownKeys(socket).forEach((eventType) => {
            switch (eventType) {
                case  SocketEventType.ticker:
                    list = socket[ SocketEventType.ticker ].map(key => getTickerArg(key))
                    if (list && list.length) {
                        this.addSocketEvents(SocketEventType.ticker)
                        topics = [...topics, ...list];
                    }
                    break
                case  SocketEventType.account:
                    if (socket[ SocketEventType.account ]) {
                        list = [getAccountArg()]
                    }
                    if (list && list.length) {
                        this.addSocketEvents(SocketEventType.account)
                        topics = [...topics, ...list];
                    }
                    break;
                case  SocketEventType.order:
                    //FIX:  make order Topic
                    list = socket[ SocketEventType.order ].map(key => getOrderArg(key))
                    if (list && list.length) {
                        this.addSocketEvents(SocketEventType.order)
                        topics = [...topics, ...list];
                    }
                    break
                case  SocketEventType.orderbook:
                    //FIX:  make orderbook Topic
                    list = socket[ SocketEventType.orderbook ].map(key => getOrderBookArg(key, 0))
                    if (list && list.length) {
                        this.addSocketEvents(SocketEventType.orderbook)
                        topics = [...topics, ...list];
                    }
                    break
                case  SocketEventType.trade:
                    list = socket[ SocketEventType.trade ].map(key => getTradeArg(key))
                    if (list && list.length) {
                        this.addSocketEvents(SocketEventType.trade)
                        topics = [...topics, ...list];
                    }
                    break
                case  SocketEventType.candlestick:
                    list = socket[ SocketEventType.candlestick ].map(key => getCandlestickArg(key))
                    if (list && list.length) {
                        this.addSocketEvents(SocketEventType.candlestick)
                        topics = [...topics, ...list];
                    }
                    break
                case  SocketEventType.ammpool:
                    list = socket[ SocketEventType.ammpool ].map(key => getAmmpoolArg(key))
                    if (list && list.length) {
                        this.addSocketEvents(SocketEventType.ammpool)
                        topics = [...topics, ...list];
                    }
                    break
            }
        })
        return {topics}
    }

    private isConnectSocket = () => {
        return !!(this._loopringSocket && this._loopringSocket.send);
    }

    private makeTopics = (topics: any, apiKey?: string) => {
        let data: any = {
            op: 'sub',
            unsubscribeAll: 'true',
            topics: topics,
        }

        if (apiKey) {
            data.apiKey = apiKey
        }
        // console.log('Socket>>Socket',JSON.stringify(data));
        return JSON.stringify(data)
        // sendMessage(flat_txt)
    }

    private addSocketEvents = (type: keyof typeof SocketEventType,deps?:any[]) => {

        this._socketCallbackMap = {
            ...this._socketCallbackMap,
            [ type ]: {
                fn: LoopringSocket.SocketEventMap [ type ],
                deps:deps?deps:[]
            }
        }
    }

    private socketConnect = async ({ topics, apiKey}: {
       // chainId: ChainId | 'unknown',
        topics: any[],
        apiKey?: string
    }) => {
        try {
            const self = this;
            if (LoopringAPI.wsAPI && topics) {
                const {wsKey} = await LoopringAPI.wsAPI.getWsKey();
                this._loopringSocket = new WebSocket(`${this._baseUrl}?wsApiKey=${wsKey}`);

                this._loopringSocket.onopen = function () {
                    console.warn('Socket>>Socket', "WebSocket is open now.");
                    // @ts-ignore
                    self._loopringSocket.send(self.makeTopics(topics))
                };
                this._loopringSocket.onmessage = function (e) {
                    const {data} = e;
                    // data.topic.topic;
                    if (data === 'ping' && self._socketCallbackMap) {
                        // console.log('Socket>>Socket ping:', e);
                        self._socketCallbackMap?.pingpong?.fn.call( self, data, ...self._socketCallbackMap.pingpong.deps);
                    } else {
                        const result = JSON.parse(data);
                        const {topics, topic} = result;
                        if (topics) {
                            // console.log('Socket>>Socket topics first return', topics);
                        }
                        if (topic && topic.topic && self._socketCallbackMap) {
                            const {topic: {topic}, data} = result
                             self._socketCallbackMap[ topic.topic ]?.fn.call( self, data, ...self._socketCallbackMap[ topic.topic ].deps);

                        }

                    }
                    return false;
                };
                this._loopringSocket.onclose = async function (e) {
                    // console.error('Socket>>Socket', e);
                    if (self._loopringSocket) {
                        self._loopringSocket = undefined;
                    }
                    console.log('Socket>>Socket', 'Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
                    self.clearInitTimer()
                    if (self.__wsTimer__.count < 5) {
                        self.__wsTimer__.timer = setTimeout(function () {
                            self.socketConnect.call(self, { topics, apiKey});
                        }, 1000 * self.__wsTimer__.count);
                    }
                };
                this._loopringSocket.onerror = function (err: Event) {
                    console.error('Socket>>Socket', 'Socket encountered error:', 'Closing socket', err);
                };

            }
        } catch (error) {
            console.error('Socket>>Socket', 'connect error, not from reconnect')
            // @ts-ignore
            if (this._loopringSocket) {
                // @ts-ignore
                this._loopringSocket.close()
            }
        }
    }
    private clearInitTimer = (init?: boolean) => {

        if (this.__wsTimer__) {
            if (this.__wsTimer__.timer !== -1) {
                clearTimeout(this.__wsTimer__.timer)
            }
            this.__wsTimer__.timer = -1
            this.__wsTimer__.count++;
        }
        if (init) {
            this.__wsTimer__ = {
                //...self.__wsTimer__,
                timer: -1,
                count: 0
            }
        }
    }
    private resetSocketEvents = () => {
        this._socketCallbackMap = undefined;
        this.addSocketEvents(SocketEventType.pingpong,[this])
    }
}
// const socketInstance = new LoopringSocket();
// // @ts-ignore
// window.loopringSocket = socketInstance;
//
// export default socketInstance;



