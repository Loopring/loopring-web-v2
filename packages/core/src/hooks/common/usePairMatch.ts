import { useRouteMatch } from "react-router-dom";
import { useTokenMap } from "../../stores/token";
import { getExistedMarket } from "@loopring-web/loopring-sdk";
import { MarketType } from "@loopring-web/common-resources";

export function usePairMatch<C extends { [key: string]: any }>(
  path: string
): {
  realMarket: MarketType | undefined;
  realPair: any;
} {
  const { coinMap, tokenMap, marketArray } = useTokenMap();
  const match: any = useRouteMatch(`${path}/:market`);

  // const [pair, setPair] = useState<{ coinAInfo: CoinInfo<C> | undefined, coinBInfo: CoinInfo<C> | undefined }>({ coinAInfo: undefined, coinBInfo: undefined})
  // const [realMarket, setRealMarket] = useState('')

  // React.useEffect(()=>{

  if (!coinMap || !tokenMap || !marketArray) {
    return { realMarket: undefined, realPair: undefined };
  }

  let market = match?.params?.market;
  // myLog('router pair',market)
  let coinA = "LRC";

  let coinB = "ETH";

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
