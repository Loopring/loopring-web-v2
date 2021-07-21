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
    WsTopicType
} from 'loopring-sdk';
import { LoopringAPI } from '../stores/apis/api';
import store from '../stores';
import { updateSocketURL } from '../stores/system';
import { tickerService } from './tickerService';
import { ammPoolService } from './ammPoolService';
import { CustomError, ErrorMap } from '@loopring-web/common-resources';

export type socketEventMap = { fn: (e: MessageEvent, props?: { [ key: string ]: any }) => any, deps?: any[] }

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


export type SocketEventMap = {
    [key in WsTopicType]: socketEventMap
}

const pingPong = {
    fn: (e: MessageEvent) => {
        if (e.data === 'ping') {
            // @ts-ignore
            global.loopringSocket.send('pong')
        }
    }
}

//@ts-ignore
window.socketEventMap = {
    [ SocketEventType.pingpong ]: pingPong
} as SocketEventMap;

export const addSocketEvents = (key: string, event: socketEventMap) => {
    // @ts-ignore
    window.socketEventMap = {
        // @ts-ignore
        ...window.socketEventMap,
        [ key ]: event
    }
}
export const removeSocketEvents = (key: string) => {
    // @ts-ignore
    if (window.socketEventMap && window.socketEventMap[ key ]) {
        // @ts-ignore
        delete window.socketEventMap[ key ]
    }
}
export const resetSocketEvents = () => {
    // @ts-ignore
    window.socketEventMap = {
        [ SocketEventType.pingpong ]: pingPong
    }
}

export const isConnectSocket = () => {
    const global: Window = window || globalThis;
    // @ts-ignore
    if (global.loopringSocket && global.loopringSocket.send) {
        return true;
    } else {
        return false
    }
}
export const socketClose = async () => {
    const global = window || globalThis;
    // @ts-ignore
    let ws: WebSocket | undefined = global.loopringSocket;

    return new Promise((reolve, reject) => {
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
const makeTopics = (topics: any, apiKey?: string) => {
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
export const clearInitTimer = (init?: boolean) => {
    const global: any = window || globalThis;

    if (global.__wsTimer__) {
        if (global.__wsTimer__.timer && global.__wsTimer__.timer !== -1) {
            clearTimeout(global.__wsTimer__.timer)
        }
        global.__wsTimer__.timer = -1
        global.__wsTimer__.count++;
    }
    if (init) {
        global.__wsTimer__ = {
            //...global.__wsTimer__,
            timer: -1,
            count: 0
        }
    }
}
export const socketConnect = async ({chainId, topics, apiKey}: {
    chainId: ChainId | 'unknown',
    topics: any[],
    apiKey?: string
}) => {
    try {
        if (chainId !== 'unknown' && LoopringAPI.wsAPI && topics) {
            const url = ChainId.MAINNET === chainId ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_UAT;
            const {wsKey} = await LoopringAPI.wsAPI.getWsKey();
            let baseSocket: string = `wss://ws.${url}/v3/ws?wsApiKey=${wsKey}`;
            store.dispatch(updateSocketURL({socketURL: baseSocket}));
            const global: any = window || globalThis;

            let ws: WebSocket;
            ws = new WebSocket(baseSocket);
            // @ts-ignore
            global.loopringSocket = ws;
            ws.onopen = function () {
                console.warn('Socket>>Socket', "WebSocket is open now.");
                // @ts-ignore
                ws.send(makeTopics(topics))
            };
            ws.onmessage = function (e) {
                const {data} = e;
                // data.topic.topic;
                if (data === 'ping') {
                    // console.log('Socket>>Socket ping:', e);
                    global.socketEventMap.pingpong.fn.call(global.socketEventMap.pingpong.deps, e);
                } else {
                    const result = JSON.parse(data);
                    const {topics, topic} = result;
                    if (topics) {
                        // console.log('Socket>>Socket topics first return', topics);
                    }
                    if (topic && topic.topic) {
                        const {topic: {topic: _topic}, data} = result
                        // {
                        //     "topic" : {
                        //         "topic" : "ticker",
                        //             "market" : "LRC-USDT"
                        //     },
                        //     "ts" : 1626062177522,
                        //         "data" : [ "LRC-USDT", "1626062177173", "1614688563700000000000000", "381151436640", "0.2315", "0.2408", "0.2309", "0.2408", "869", "0.2406", "0.2413" ]
                        // }
                        // console.log('Socket>>Socket topic', _topic, data);
                        global.socketEventMap[ topic.topic ].fn.call(global.socketEventMap[ topic.topic ].deps, data)

                    }

                }
                return false;
            };
            ws.onclose = async function (e) {
                // @ts-ignore
                console.error('Socket>>Socket', e);
                if (global.loopringSocket) {
                    global.loopringSocket = undefined;
                }
                console.log('Socket>>Socket', 'Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
                clearInitTimer()
                if (global.__wsTimer__.count < 5) {
                    global.__wsTimer__.timer = setTimeout(function () {
                        socketConnect.call(global, {chainId, topics, apiKey});
                    }, 1000 * global.__wsTimer__.count);
                }
            };
            ws.onerror = function (err: Event) {
                console.error('Socket>>Socket', 'Socket encountered error:', 'Closing socket');
            };

        }
    } catch (error) {
        console.error('Socket>>Socket', 'connect error, not from reconnect')

        // @ts-ignore
        if (global.loopringSocket) {
            // @ts-ignore
            global.loopringSocket.close()
        }


    }
}

export const socketSendMessage = async ({socket, chainId, apiKey}: {
    chainId: ChainId | 'unknown',
    socket: { [ key: string ]: string[] }
    apiKey?: string
}): Promise<boolean> => {
    try {
        if (socket && Reflect.ownKeys(socket).length) {
            //register ping pong event
            clearInitTimer(true);
            resetSocketEvents();
            const {topics} = makeMessageArray({socket});
            if (!isConnectSocket()) {
                await socketConnect({chainId, topics, apiKey})
            } else {
                const global: Window = window || globalThis;
                // @ts-ignore
                global.loopringSocket.send(makeTopics(topics))

            }
            return true
        } else {
            if (!isConnectSocket()) {
                socketClose();
            }
            return false
        }
    } catch (error) {
        throw  new CustomError(ErrorMap.SOCKET_ERROR)
    }

}


export const makeMessageArray = ({socket}: { socket: { [ key: string ]: string[] } }): {
    topics: any[]
} => {
    let topics: any[] = [], list: any[] = []; // let registerDispatch = [];
    Reflect.ownKeys(socket).forEach((eventType) => {
        switch (eventType) {
            case  SocketEventType.ticker:
                list = socket[ SocketEventType.ticker ].map(key => getTickerArg(key))
                if (list && list.length) {
                    makeReceiveMessageCallback(SocketEventType.ticker)
                    topics = [...topics, ...list];
                }
                break
            case  SocketEventType.account:
                if(socket[ SocketEventType.account ]){
                    list = [getAccountArg()]
                }
                if (list && list.length) {
                    makeReceiveMessageCallback(SocketEventType.account)
                    topics = [...topics, ...list];
                }
                break;
            case  SocketEventType.order:
                //FIX:  make order Topic
                list = socket[ SocketEventType.order ].map(key => getOrderArg(key))
                if (list && list.length) {
                    makeReceiveMessageCallback(SocketEventType.order)
                    topics = [...topics, ...list];
                }
                break
            case  SocketEventType.orderbook:
                //FIX:  make orderbook Topic
                list = socket[ SocketEventType.orderbook ].map(key => getOrderBookArg(key, 0))
                if (list && list.length) {
                    makeReceiveMessageCallback(SocketEventType.orderbook)
                    topics = [...topics, ...list];
                }
                break
            case  SocketEventType.trade:
                list = socket[ SocketEventType.trade ].map(key => getTradeArg(key))
                if (list && list.length) {
                    makeReceiveMessageCallback(SocketEventType.trade)
                    topics = [...topics, ...list];
                }
                break
            case  SocketEventType.candlestick:
                list = socket[ SocketEventType.candlestick ].map(key => getCandlestickArg(key))
                if (list && list.length) {
                    makeReceiveMessageCallback(SocketEventType.candlestick)
                    topics = [...topics, ...list];
                }
                break
            case  SocketEventType.ammpool:
                list = socket[ SocketEventType.ammpool ].map(key => getAmmpoolArg(key))
                if (list && list.length) {
                    makeReceiveMessageCallback(SocketEventType.ammpool)
                    topics = [...topics, ...list];
                }
                break
        }
    })
    return {topics}
}
const SocketEventMap = {
    // PING_PONG : (e)=>{
    //
    // },
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
        // @ts-ignore
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
            }
        })
    },
    [ SocketEventType.candlestick ]: (_e: any) => {

    },
    [ SocketEventType.ammpool ]: (data: string[]) => {
        // const [market,timestamp,size,volume,open,high,low,close,count,bid,ask] = data;
        // @ts-ignore
        const [poolName, poolAddress, pooled, [tokenId, volume], risky] = data;
        // @ts-ignore
        ammPoolService.sendAmmPool({poolName, poolAddress, pooled, lp: {tokenId, volume}, risky})
    },
}


export const makeReceiveMessageCallback = (type: keyof typeof SocketEventType) => {


    addSocketEvents(type, {
        // @ts-ignore
        fn: SocketEventMap [ type ]
    })
}





