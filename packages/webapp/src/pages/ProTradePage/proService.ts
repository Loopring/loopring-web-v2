import * as _ from "lodash";
import {
  ammMapReducer,
  ammPoolService,
  bookService,
  LoopringAPI,
  makeMarketArray,
  mixorderService,
  mixtradeService,
  SocketMap,
  store,
  swapDependAsync,
  tickerService,
  updatePageTradePro,
  useAccount,
  useAmmMap,
  usePageTradePro,
  useSocket,
  useTicker,
  useTokenMap,
  useWalletLayer1,
  useWalletLayer2,
  walletLayer2Service,
} from "@loopring-web/core";
import React from "react";
import {
  AccountStatus,
  globalSetup,
  MarketType,
  myLog,
  SagaStatus,
} from "@loopring-web/common-resources";
import { debounceTime, map, merge, of, Subject, switchAll } from "rxjs";

import * as sdk from "@loopring-web/loopring-sdk";

const TRADE_ARRAY_MAX_LENGTH = 50;

/**
 *
 * @param throttleWait
 * @param depDataCallback
 * @param userInfoUpdateCallback
 * @param walletLayer1Callback
 */
export const useSocketProService = ({
  throttleWait = globalSetup.throttleWait,
  market,
  userInfoUpdateCallback,
  walletLayer1Callback,
}: {
  throttleWait?: number;
  market: MarketType;
  depDataCallback?: () => void;
  userInfoUpdateCallback?: () => void;
  walletLayer1Callback?: () => void;
}) => {
  const { updateWalletLayer1, status: walletLayer1Status } = useWalletLayer1();
  const { updateWalletLayer2, status: walletLayer2Status } = useWalletLayer2();
  const subjectWallet = React.useMemo(() => walletLayer2Service.onSocket(), []);
  const subjectBook = React.useMemo(() => bookService.onSocket(), []);
  const { ammMap } = useAmmMap();

  const subjectAmmpool = React.useMemo(() => ammPoolService.onSocket(), []);
  const subjectMixorder = React.useMemo(() => mixorderService.onSocket(), []);
  const subjectTicker = React.useMemo(() => tickerService.onSocket(), []);
  // const subjectTrade = React.useMemo(() => tradeService.onSocket(), []);
  const subjectMixtrade = React.useMemo(() => mixtradeService.onSocket(), []);

  const _accountUpdate = _.throttle(
    ({ walletLayer1Status, walletLayer2Status }) => {
      if (walletLayer1Status !== SagaStatus.PENDING) {
        updateWalletLayer1();
      }
      if (walletLayer2Status !== SagaStatus.PENDING) {
        updateWalletLayer2();
      }
    },
    throttleWait
  );
  React.useEffect(() => {
    const subscription = merge(
      subjectAmmpool,
      subjectMixorder,
      subjectTicker,
      subjectMixtrade
    ).subscribe((value) => {
      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
      const market = pageTradePro.market;
      const address = ammMap && ammMap["AMM-" + market]?.address;

      if (
        address &&
        ammMap &&
        value &&
        // @ts-ignore
        value.ammPoolMap &&
        pageTradePro.market === market
      ) {
        // @ts-ignore
        const ammPoolMap = value.ammPoolMap;
        if (
          address &&
          ammPoolMap &&
          ammPoolMap[address]?.pooled &&
          pageTradePro.ammPoolSnapshot
        ) {
          const { pooled: _pooled, lp } = ammPoolMap[address];
          let pooled = pageTradePro.ammPoolSnapshot.pooled;
          pooled = [
            {
              ...pooled[0],
              volume: _pooled[0],
            },
            {
              ...pooled[1],
              volume: _pooled[1],
            },
          ];
          const ammPoolSnapshot = {
            ...pageTradePro.ammPoolSnapshot,
            pooled,
            lp: {
              ...pageTradePro.ammPoolSnapshot.lp,
              volume: lp,
            },
          };
          store.dispatch(
            updatePageTradePro({ market, ammPoolSnapshot: ammPoolSnapshot })
          );
          store.dispatch(
            ammMapReducer.updateRealTimeAmmMap({
              ammPoolStats: {
                ["AMM-" + market]: {
                  ...ammMap["AMM-" + market].__rawConfig__,
                  liquidity: [
                    ammPoolSnapshot.pooled[0].volume,
                    ammPoolSnapshot.pooled[1].volume,
                  ],
                  lpLiquidity: ammPoolSnapshot.lp.volume,
                },
              },
            })
          );
        }
      }
      // @ts-ignore
      if (value && value.tickerMap) {
        const market = pageTradePro.market;
        // @ts-ignore
        const tickerMap = value.tickerMap;
        if (tickerMap.market === market) {
          store.dispatch(
            updatePageTradePro({ market, ticker: tickerMap[market] })
          );
        }
      }
      // @ts-ignore
      if (value && value.mixorderMap) {
        const market = pageTradePro.market;
        // @ts-ignore
        const mixorder = value.mixorderMap[market];
        if (mixorder && mixorder.symbol) {
          store.dispatch(updatePageTradePro({ market, depth: mixorder }));
        }
      }

      if (
        value &&
        // @ts-ignore
        value.mixtrades &&
        // @ts-ignore
        value.mixtrades[0].market === pageTradePro.market
      ) {
        const market = pageTradePro.market;
        // @ts-ignore
        const _tradeArray = makeMarketArray(market, value.mixtrades);
        let tradeArray = [
          ..._tradeArray,
          ...(pageTradePro.tradeArray ? pageTradePro.tradeArray : []),
        ];

        tradeArray.length = TRADE_ARRAY_MAX_LENGTH;
        store.dispatch(updatePageTradePro({ market, tradeArray }));
      }
    });
    return () => subscription.unsubscribe();
  }, [market]);

  React.useEffect(() => {
    const subscription = merge(subjectWallet, subjectBook).subscribe(() => {
      const walletLayer2Status = store.getState().walletLayer2.status;
      const walletLayer1Status = store.getState().walletLayer1.status;
      _accountUpdate({ walletLayer2Status, walletLayer1Status });
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (userInfoUpdateCallback && walletLayer2Status === SagaStatus.UNSET) {
      userInfoUpdateCallback();
    }
  }, [walletLayer2Status]);
  React.useEffect(() => {
    if (walletLayer1Callback && walletLayer1Status === SagaStatus.UNSET) {
      walletLayer1Callback();
    }
  }, [walletLayer1Status]);
};

export const useProSocket = ({ market }: { market: MarketType }) => {
  const {
    socket,
    sendSocketTopic,
    socketEnd,
    status: socketStatus,
  } = useSocket();
  const { account, status: accountStatus } = useAccount();
  const { marketArray, marketMap } = useTokenMap();
  const { ammMap } = useAmmMap();
  const { tickerMap } = useTicker();
  const socketEventSubject = new Subject<SocketMap>();

  const { pageTradePro, updatePageTradePro, __API_REFRESH__ } =
    usePageTradePro();
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);

  React.useEffect(() => {
    getDependencyData();
  }, [pageTradePro.market, pageTradePro.depthLevel]);
  React.useEffect(() => {
    getMarketDepData();
  }, [pageTradePro.market]);
  const noSocketAndAPILoop = React.useCallback(async () => {
    const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
    if (nodeTimer.current !== -1) {
      clearTimeout(nodeTimer.current as NodeJS.Timeout);
    }
    if (
      ((window as any).loopringSocket === undefined ||
        (window as any).loopringSocket.ws === undefined ||
        !(window as any).loopringSocket.isConnectSocket()) &&
      pageTradePro.depth
    ) {
      getDependencyData();
      getMarketDepData();
    }
    // getMarketDepData();

    if (market === pageTradePro.market && LoopringAPI.exchangeAPI) {
      const { depth } = await LoopringAPI.exchangeAPI.getMixDepth({
        market: pageTradePro.market,
        level: 0,
        limit: 50,
      });
      updatePageTradePro({
        market: pageTradePro.market,
        depthForCalc: depth,
      });
      nodeTimer.current = setTimeout(noSocketAndAPILoop, __API_REFRESH__);
    }
  }, [nodeTimer, updatePageTradePro, market]);
  const getDependencyData = React.useCallback(async () => {
    try {
      const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
      if (
        market === pageTradePro.market &&
        ammMap &&
        pageTradePro.depthLevel &&
        LoopringAPI.exchangeAPI
      ) {
        const { depth, ammPoolSnapshot } = await swapDependAsync(
          pageTradePro.market,
          marketMap[pageTradePro.market].precisionForPrice -
            Number(pageTradePro.depthLevel),
          50
        );
        const { tickerMap } = store.getState().tickerMap;
        updatePageTradePro({
          market: pageTradePro.market,
          depth,
          depthForCalc: depth,
          ammPoolSnapshot,
          ticker: tickerMap[pageTradePro.market],
        });
      }
    } catch (error: any) {}
  }, [pageTradePro, ammMap, tickerMap, market]);
  const getMarketDepData = React.useCallback(async () => {
    const pageTradePro = store.getState()._router_pageTradePro.pageTradePro;
    if (market === pageTradePro.market && LoopringAPI.exchangeAPI) {
      const { marketTrades } = await LoopringAPI.exchangeAPI.getMarketTrades({
        market: pageTradePro.market,
        limit: TRADE_ARRAY_MAX_LENGTH,
      });
      const _tradeArray = makeMarketArray(pageTradePro.market, marketTrades);

      updatePageTradePro({
        market: pageTradePro.market,
        tradeArray: _tradeArray,
      });
    }
  }, [pageTradePro, ammMap, market]);

  const doSend = async (dataSocket: SocketMap) => {
    socketEnd();
    socketEventSubject.next(dataSocket);
  };
  const sendCallback = async (dataSocket: SocketMap) => {
    myLog(
      "doSocket Pro Send",
      pageTradePro.market,
      socketStatus,
      nodeTimer.current
    );
    if (socketStatus !== SagaStatus.PENDING || nodeTimer.current == -1) {
      myLog("doSocket Pro Send", pageTradePro.market);
      if (account.readyState === AccountStatus.ACTIVATED) {
        sendSocketTopic({
          ...dataSocket,
          [sdk.WsTopicType.account]: true,
          [sdk.WsTopicType.order]: marketArray, // user order
        });
      } else {
        sendSocketTopic(dataSocket);
      }
    }
    // if (nodeTimer.current !== -1) {
    //   clearTimeout(nodeTimer.current as NodeJS.Timeout);
    // }
    noSocketAndAPILoop();
  };

  React.useEffect(() => {
    socketEventSubject
      .pipe(map((item) => of(item)))
      .pipe(switchAll())
      .pipe(debounceTime(200))
      .pipe()
      .subscribe((dataSocket) => {
        if (dataSocket) {
          myLog("pro socketEventSubject", dataSocket);
          sendCallback(dataSocket);
        }
      });
    return () => {
      socketEventSubject.unsubscribe();
    };
  }, [socketEventSubject]);
  React.useEffect(() => {
    if (ammMap && pageTradePro.market && accountStatus === SagaStatus.UNSET) {
      try {
        const dataSocket: SocketMap = {
          [sdk.WsTopicType.ammpool]: ammMap["AMM-" + pageTradePro.market]
            ? [ammMap["AMM-" + pageTradePro.market].address]
            : [],
          [sdk.WsTopicType.ticker]: [pageTradePro.market as string],
          [sdk.WsTopicType.mixorder]: {
            markets: [pageTradePro.market],
            level:
              marketMap[pageTradePro.market].precisionForPrice -
              Number(pageTradePro.depthLevel),
            count: 50,
            snapshot: true,
          },
          [sdk.WsTopicType.mixtrade]: [pageTradePro.market as string],
        };
        if (socket.mixorder?.markets[0] !== pageTradePro.market) {
          doSend(dataSocket);
          myLog("doSocket market update", dataSocket);
        } else if (socket.mixorder?.markets[0] === pageTradePro.market) {
          if (socket.mixorder.level !== pageTradePro.depthLevel) {
            doSend(dataSocket);
            myLog("doSocket level update", pageTradePro.market);
          } else if (
            (account.readyState === AccountStatus.ACTIVATED &&
              !socket.account) ||
            socket.account
          ) {
            doSend(dataSocket);
            myLog("doSocket account update", pageTradePro.market);
          } else {
            myLog("NO doSocket ", pageTradePro.market);
          }
        } else {
          myLog("NO doSocket ", pageTradePro.market);
        }
      } catch (e: any) {
        socketEnd();
      }
    }
  }, [pageTradePro.market, pageTradePro.depthLevel, accountStatus]);

  React.useEffect(() => {
    return () => {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current);
      }
      socketEnd();
    };
  }, []);
};
