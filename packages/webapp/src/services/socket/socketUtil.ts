import {
  ChainId,
  DepthData,
  getAccountArg,
  getAmmpoolArg,
  getCandlestickArg,
  getMixOrderArg,
  getOrderArg,
  getOrderBookArg,
  getTickerArg,
  getTradeArg,
  MarketTradeInfo,
  OrderDetail,
  toBig,
} from "@loopring-web/loopring-sdk";
import { walletLayer2Service } from "./services/walletLayer2Service";
import { tickerService } from "./services/tickerService";
import { ammPoolService } from "./services/ammPoolService";
import { CustomError, ErrorMap } from "@loopring-web/common-resources";
import { LoopringAPI } from "api_wrapper";
import { SocketMap } from "../../stores/socket/interface";
import { bookService } from "./services/bookService";
import { orderbookService } from "./services/orderbookService";
import { tradeService } from "./services/tradeService";
import { mixorderService } from "./services/mixorderService";

export type SocketEvent = (e: any, ...props: any[]) => any;

export enum SocketEventType {
  pingpong = "pingpong",
  account = "account",
  order = "order",
  orderbook = "orderbook",
  trade = "trade",
  ticker = "ticker",
  mixorder = "mixorder",
  candlestick = "candlestick",
  ammpool = "ammpool",
}

export type SocketCallbackMap = {
  // [SocketEventType.pingpong]:  { fn: SocketEvent, deps?: any[] },
  [key in SocketEventType]?: { fn: SocketEvent; deps: any[] };
};
//
export type SocketEventMap = {
  [key in SocketEventType]: SocketEvent;
};

export class LoopringSocket {
  private static SocketEventMap: SocketEventMap = {
    [SocketEventType.account]: (data: { [key: string]: any }) => {
      const { totalAmount, tokenId, amountLocked, pending } = data;
      walletLayer2Service.sendAccount({
        tokenId,
        locked: amountLocked,
        total: totalAmount,
        pending,
      });
    },
    [SocketEventType.order]: (data: OrderDetail) => {
      bookService.sendBook({
        [data.market]: data as any,
      });
    },
    [SocketEventType.orderbook]: (data: DepthData, topic) => {
      // const bids = genAB(data['bids'], true)
      // const asks = genAB(data['asks'])
      const timestamp = Date.now();
      // const _data = getMidPrice({_asks:data['asks'], _bids:data['bids']})
      orderbookService.sendOrderbook({
        [topic.market]: {
          ...data,
          timestamp: timestamp,
          symbol: topic.market,
        } as any,
      });
    },
    [SocketEventType.mixorder]: (data: DepthData, topic) => {
      // const bids = genAB(data['bids'], true)
      // const asks = genAB(data['asks'])
      // const {socket} = store.getState().socket
      if (
        window.loopringSocket?.socketKeyMap &&
        window.loopringSocket?.socketKeyMap[SocketEventType.mixorder]?.level ===
          topic.level
      ) {
        const timestamp = Date.now();
        mixorderService.sendMixorder({
          [topic.market]: {
            ...data,
            timestamp: timestamp,
            symbol: topic.market,
          } as any,
        });
      }
    },
    [SocketEventType.trade]: (datas: string[][]) => {
      const marketTrades: MarketTradeInfo[] = datas.map((data) => {
        const [market, tradeTime, tradeId, side, volume, price, fee] = data;
        return {
          market,
          tradeTime,
          tradeId,
          side,
          volume,
          price,
          fee,
        } as unknown as MarketTradeInfo;
      });
      tradeService.sendTrade(marketTrades);
      // [
      //     "1584717910000",  //timestamp
      //     "123456789",  //tradeId
      //     "buy",  //side
      //     "500000",  //size
      //     "0.0008",  //price
      //     "100"  //fee
      // ]
    },
    [SocketEventType.ticker]: (data: string[]) => {
      const [
        symbol,
        timestamp,
        size,
        volume,
        open,
        high,
        low,
        close,
        count,
        bid,
        ask,
      ] = data;
      // @ts-ignore
      const [, base, quote] = symbol.match(/(\w+)-(\w+)/i);
      const base_token_volume = size;
      const quote_token_volume = volume;
      const change =
        open === undefined || Number(open) === 0
          ? undefined
          : toBig(close).minus(open).div(open);
      tickerService.sendTicker({
        [symbol]: {
          symbol,
          base,
          quote,
          base_token_volume,
          quote_token_volume,
          timestamp: Number(timestamp),
          change,
          base_fee_amt: undefined,
          quote_fee_amt: undefined,
          open,
          high,
          low,
          close,
          count,
          bid,
          ask,
        } as any,
      });
    },
    [SocketEventType.candlestick]: (_e: any) => {
      //TODO
    },
    // [ SocketEventType.candlestick ]: (data: string) => {
    //
    // },
    [SocketEventType.ammpool]: (data: [[string, string], string], topic) => {
      if (data.length) {
        ammPoolService.sendAmmPool({
          [topic.poolAddress]: { pooled: data[0], lp: data[1] },
        });
      }
    },
    [SocketEventType.pingpong]: (data: string, socket: WebSocket) => {
      if (data === "ping" && socket && socket.send && socket.readyState === 1) {
        socket.send("pong");
      } else if (window.loopringSocket.isConnectSocket()) {
        //HACK:
        window.loopringSocket.ws.send("pong");
      }
    },
  };
  private __wsTimer__: { timer: NodeJS.Timer | -1; count: number } = {
    timer: -1,
    count: 0,
  };
  private _baseUrl: string;
  constructor(url: string) {
    // const url = ChainId.MAINNET === chainId ? process.env.REACT_APP_API_URL : process.env.REACT_APP_API_URL_UAT;
    this._baseUrl = url; // baseSocket: string = `wss://ws.${url}/v3/ws?wsApiKey=${wsKey}`;
  }
  private _socketKeyMap: object | undefined;

  get socketKeyMap(): object | undefined {
    return this._socketKeyMap;
  }

  private _topics: object | undefined;

  get topics(): object | undefined {
    return this._topics;
  }

  private _socketCallbackMap: SocketCallbackMap | undefined;

  get socketCallbackMap(): SocketCallbackMap | undefined {
    return this._socketCallbackMap;
  }

  private _ws: WebSocket | undefined;

  get ws(): WebSocket | undefined {
    return this._ws;
  }

  // private static PingPong = {
  //     fn:
  // }

  public socketSendMessage = async ({
    socket,
    apiKey,
  }: {
    chainId: ChainId | "unknown";
    socket: { [key: string]: string[] };
    apiKey?: string;
  }): Promise<boolean> => {
    try {
      if (socket && Reflect.ownKeys(socket).length) {
        //register ping pong event
        this.clearInitTimer(true);
        this.resetSocketEvents();
        this._socketKeyMap = socket;
        const { topics } = this.makeMessageArray({ socket });
        if (!this.isConnectSocket()) {
          await this.socketConnect({ topics, apiKey });
        } else {
          this._ws?.send(this.makeTopics(topics, apiKey));
        }
        return true;
      } else {
        if (!this.isConnectSocket()) {
          this.socketClose();
        }
        return false;
      }
    } catch (error) {
      throw new CustomError(ErrorMap.SOCKET_ERROR);
    }
  };
  public socketClose = async () => {
    let ws: WebSocket | undefined = this._ws;

    return new Promise((reolve) => {
      if (ws) {
        ws.onclose = function (e) {
          reolve(`Socket is closed, ${e.reason}`);
        };
        ws.close();
      } else {
        reolve("no websocket");
      }
    });
  };

  public removeSocketEvents = (key: string) => {
    // @ts-ignore
    if (this._socketCallbackMap && this._socketCallbackMap[key]) {
      // @ts-ignore
      delete this._socketCallbackMap[key];
    }
  };

  private makeMessageArray = ({
    socket,
  }: {
    socket: SocketMap;
  }): {
    topics: any[];
  } => {
    let topics: any[] = [],
      list: any[] = []; // let registerDispatch = [];
    Reflect.ownKeys(socket).forEach((eventType) => {
      switch (eventType) {
        case SocketEventType.ticker:
          const tickerSocket = socket[SocketEventType.ticker];
          if (tickerSocket) {
            list = tickerSocket.map((key) => getTickerArg(key));
            if (list && list.length) {
              this.addSocketEvents(SocketEventType.ticker);
              topics = [...topics, ...list];
            }
          }
          break;
        case SocketEventType.ammpool:
          // list = socket[ SocketEventType.ammpool ].map(key => getAmmpoolArg(key))
          // if (list && list.length) {
          //     this.addSocketEvents(SocketEventType.ammpool)
          //     topics = [...topics, ...list];
          // }
          // break
          const ammpoolSocket = socket[SocketEventType.ammpool];
          if (ammpoolSocket) {
            list = ammpoolSocket.map((key) => getAmmpoolArg(key));
            if (list && list.length) {
              this.addSocketEvents(SocketEventType.ammpool);
              topics = [...topics, ...list];
            }
          }
          break;
        case SocketEventType.account:
          if (socket[SocketEventType.account]) {
            list = [getAccountArg()];
          }
          if (list && list.length) {
            this.addSocketEvents(SocketEventType.account);
            topics = [...topics, ...list];
          }
          break;
        case SocketEventType.order:
          const orderSocket = socket[SocketEventType.order];
          if (orderSocket) {
            list = orderSocket.map((key) => getOrderArg(key));
            if (list && list.length) {
              this.addSocketEvents(SocketEventType.order);
              topics = [...topics, ...list];
            }
          }

          break;

        case SocketEventType.orderbook:
          const orderbookSocket = socket[SocketEventType.orderbook];
          if (orderbookSocket) {
            const level = orderbookSocket.level ?? 0;
            const snapshot = orderbookSocket.snapshot ?? true;
            const count = orderbookSocket.count ?? 50;
            list = orderbookSocket.markets.map((key) =>
              getOrderBookArg({
                market: key,
                level,
                count,
                snapshot,
              })
            );
            if (list && list.length) {
              this.addSocketEvents(SocketEventType.orderbook);
              topics = [...topics, ...list];
            }
          }

          break;
        case SocketEventType.mixorder:
          const mixorderSocket = socket[SocketEventType.mixorder];
          if (mixorderSocket) {
            const level = mixorderSocket.level ?? 0;
            const snapshot = mixorderSocket.snapshot ?? true;
            const count = mixorderSocket.count ?? 50;
            list = mixorderSocket.markets.map((key) =>
              getMixOrderArg({
                market: key,
                level,
                count,
                snapshot,
                showOverlap: false,
              })
            );
            if (list && list.length) {
              this.addSocketEvents(SocketEventType.mixorder);
              topics = [...topics, ...list];
            }
          }

          break;
        case SocketEventType.trade:
          const tradeSocket = socket[SocketEventType.trade];
          if (tradeSocket) {
            list = tradeSocket.map((key) => getTradeArg(key));
            if (list && list.length) {
              this.addSocketEvents(SocketEventType.trade);
              topics = [...topics, ...list];
            }
          }
          break;
        case SocketEventType.candlestick:
          const candlestickSocket = socket[SocketEventType.candlestick];
          if (candlestickSocket) {
            list = candlestickSocket.map((key) => getCandlestickArg(key));
            if (list && list.length) {
              this.addSocketEvents(SocketEventType.candlestick);
              topics = [...topics, ...list];
            }
          }
          break;
      }
    });
    return { topics };
  };

  private isConnectSocket = () => {
    return !!(this._ws && this._ws.readyState === 1);
  };

  private makeTopics = (topics: any, apiKey?: string) => {
    let data: any = {
      op: "sub",
      unsubscribeAll: "true",
      topics: topics,
    };

    if (apiKey) {
      data.apiKey = apiKey;
    }
    this._topics = topics;
    return JSON.stringify(data);
    // sendMessage(flat_txt)
  };

  private addSocketEvents = (
    type: keyof typeof SocketEventType,
    deps?: any[]
  ) => {
    this._socketCallbackMap = {
      ...this._socketCallbackMap,
      [type]: {
        fn: LoopringSocket.SocketEventMap[type],
        deps: deps ? deps : [],
      },
    };
  };

  private socketConnect = async ({
    topics,
    apiKey,
  }: {
    // chainId: ChainId | 'unknown',
    topics: any[];
    apiKey?: string;
  }) => {
    try {
      const self = this;
      if (LoopringAPI.wsAPI && topics) {
        const { wsKey } = await LoopringAPI.wsAPI.getWsKey();
        this._ws = new WebSocket(`${this._baseUrl}?wsApiKey=${wsKey}`);

        this._ws.onopen = function () {
          console.warn("Socket>>Socket", "WebSocket is open now.");
          if (self._ws && self._ws.readyState === WebSocket.OPEN) {
            self._ws.send(self.makeTopics(topics, apiKey));
          }
        };
        this._ws.onmessage = function (e) {
          const { data } = e;
          // data.topic.topic;
          if (data === "ping" && self._socketCallbackMap) {
            // console.log('Socket>>Socket ping:', e);
            self._socketCallbackMap?.pingpong?.fn.call(
              self,
              data,
              ...self._socketCallbackMap.pingpong.deps
            );
          } else {
            const result = JSON.parse(data);
            const { topics, topic } = result;
            if (topics) {
              // console.log('Socket>>Socket topics first return', topics);
            }
            if (topic && topic.topic && self._socketCallbackMap) {
              const {
                topic: { topic: _topic },
                data,
              } = result;
              self._socketCallbackMap[_topic]?.fn.call(
                self,
                data,
                topic,
                ...self._socketCallbackMap[_topic].deps
              );
            }
          }
          return false;
        };
        this._ws.onclose = async function (e) {
          // console.error('Socket>>Socket', e);
          if (self._ws) {
            self._ws = undefined;
          }
          console.log(
            "Socket>>Socket",
            "Socket is closed. Reconnect will be attempted in 1 second.",
            e.reason
          );
          self.clearInitTimer();
          if (self.__wsTimer__.count < 5) {
            self.__wsTimer__.timer = setTimeout(function () {
              self.socketConnect.call(self, { topics, apiKey });
            }, 1000 * self.__wsTimer__.count);
          } else {
          }
        };
        this._ws.onerror = function (err: Event) {
          console.error(
            "Socket>>Socket",
            "Socket encountered error:",
            "Closing socket",
            err
          );
        };
      }
      return;
    } catch (error) {
      console.error("Socket>>Socket", "connect error, not from reconnect");
      // @ts-ignore
      if (this._ws) {
        // @ts-ignore
        this._ws.close();
      }
      return;
    }
  };
  private clearInitTimer = (init?: boolean) => {
    if (this.__wsTimer__) {
      if (this.__wsTimer__.timer !== -1) {
        clearTimeout(this.__wsTimer__.timer);
      }
      this.__wsTimer__.timer = -1;
      this.__wsTimer__.count++;
    }
    if (init) {
      this.__wsTimer__ = {
        //...self.__wsTimer__,
        timer: -1,
        count: 0,
      };
    }
  };
  private resetSocketEvents = () => {
    this._socketCallbackMap = undefined;
    this.addSocketEvents(SocketEventType.pingpong, [this.ws]);
  };
}

// const socketInstance = new LoopringSocket();
// // @ts-ignore
// window.loopringSocket = socketInstance;
//
// export default socketInstance;
