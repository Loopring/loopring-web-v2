import { getExistedMarket, toBig } from "@loopring-web/loopring-sdk";
import { store } from "../../index";

export function formatedVal(rawData: string, base: string, quote: string) {
  const { marketMap, marketArray } = store.getState().tokenMap;

  if (!rawData || !base || !quote || !marketMap || !marketArray) {
    return "";
  }

  const { market } = getExistedMarket(marketArray, base, quote);
  const marketInfo = marketMap[market];

  const showVal = toBig(rawData).toFixed(marketInfo.precisionForPrice);

  return showVal;
}

// export function useFormatedVal(rawData: string, base: string, quote: string) {
//   const { marketMap, marketArray } = useSelector(
//     (state: RootState) => state.tokenMap
//   );
//
//   const [showVal, setShowVal] = useState<string>(rawData);
//
//   useDeepCompareEffect(() => {
//     if (!rawData || !base || !quote || !marketMap || !marketArray) {
//       setShowVal("");
//       return;
//     }
//
//     const { market } = getExistedMarket(marketArray, base, quote);
//     const marketInfo = marketMap[market];
//
//     setShowVal(toBig(rawData).toFixed(marketInfo.precisionForPrice));
//   }, [marketMap, marketArray, base, quote]);
//
//   return {
//     formatedVal: showVal,
//   };
// }
