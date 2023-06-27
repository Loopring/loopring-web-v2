import { useRouteMatch } from "react-router-dom";
import { useTokenMap } from "../../stores/token";
import { getExistedMarket } from "@loopring-web/loopring-sdk";
import { MarketType } from "@loopring-web/common-resources";

export function usePairMatch({
  path,
  coinA = "LRC",
  coinB = "ETH",
  marketArray = undefined,
  tokenMap = undefined,
}: {
  path: string;
  coinA?: string;
  coinB?: string;
  marketArray?: string[];
  tokenMap?: any;
}): {
  realMarket: MarketType | undefined;
  realPair: any;
} {
  const {
    coinMap,
    tokenMap: _tokenMap,
    marketArray: _marketArray,
  } = useTokenMap();
  if (marketArray) {
  } else {
    marketArray = _marketArray;
    tokenMap = _tokenMap;
  }
  const match: any = useRouteMatch(`${path}/:market`);

  // const [pair, setPair] = useState<{ coinAInfo: CoinInfo<C> | undefined, coinBInfo: CoinInfo<C> | undefined }>({ coinAInfo: undefined, coinBInfo: undefined})
  // const [realMarket, setRealMarket] = useState('')
  // React.useEffect(()=>{

  if (!coinMap || !tokenMap || !marketArray) {
    return { realMarket: undefined, realPair: undefined };
  }

  let market = match?.params?.market;
  // myLog('router pair',market)
  // let coinA = "LRC";
  //
  // let coinB = "ETH";

  let realMarket: MarketType | undefined = `${coinA}-${coinB}`;

  let coinAInfo = coinMap[coinA];
  let coinBInfo = coinMap[coinB];

  if (market) {
    const matchRes = market.match(/(\w+)-(\w+)/i);

    if (
      matchRes &&
      matchRes.length >= 3 &&
      coinMap[matchRes[1]] &&
      coinMap[matchRes[2]]
    ) {
      coinA = matchRes[1];
      coinB = matchRes[2];
    }
    const marketTemp = getExistedMarket(marketArray, coinA, coinB).market;
    if (marketTemp) {
      realMarket = marketTemp;
      coinAInfo = coinMap[coinA];
      coinBInfo = coinMap[coinB];
    } else {
      if (tokenMap[coinA]) {
        coinAInfo = coinMap[coinA];
        coinB = tokenMap[coinA]?.tradePairs[0];
        coinBInfo = coinMap[coinB];
        realMarket = `${coinA}-${coinB}`;
      } else {
        // @ts-ignore
        [_, coinA, coinB] = marketArray[0]?.match(/(\w+)-(\w+)/i) ?? [
          "",
          "LRC",
          "ETH",
        ];
        coinAInfo = coinMap[coinA];
        coinBInfo = coinMap[coinB];
        realMarket = `${coinA}-${coinB}`;
      }
    }
  }

  // setPair({ coinAInfo, coinBInfo, })
  // setRealMarket(realMarket)
  // },[])
  return {
    realMarket,
    realPair: { coinAInfo, coinBInfo },
    // setPair,
    // setMarket,
  };
}
