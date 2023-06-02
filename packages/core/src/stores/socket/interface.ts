import * as sdk from "@loopring-web/loopring-sdk";

export type TickerSocket = string;
export type SocketMap = {
  [sdk.WsTopicType.ticker]?: TickerSocket[];
  [sdk.WsTopicType.account]?: boolean;
  [sdk.WsTopicType.order]?: any[];
  [sdk.WsTopicType.trade]?: any[];
  [sdk.WsTopicType.mixtrade]?: any[];
  [sdk.WsTopicType.candlestick]?: any[];
  [sdk.WsTopicType.ammpool]?: any[];
  [sdk.WsTopicType.orderbook]?: {
    markets: any[];
    level?: number;
    count?: number;
    snapshot?: boolean;
  };
  [sdk.WsTopicType.mixorder]?: {
    showOverlap?: boolean;
    markets: any[];
    level?: number;
    count?: number;
    snapshot?: boolean;
  };
  [sdk.WsTopicType.btradedepth]?: {
    showOverlap?: boolean;
    markets: any[];
    level?: number;
    count?: number;
    snapshot?: boolean;
  };
};
