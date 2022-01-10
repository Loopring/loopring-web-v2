import React from "react";
import store from "stores";
import { TokenType } from "@loopring-web/component-lib";
import { AccountStatus, EmptyValueTag } from "@loopring-web/common-resources";
import { useAccount } from "stores/account";
import { makeWalletLayer2, volumeToCountAsBigNumber } from "hooks/help";
import { WsTopicType } from "@loopring-web/loopring-sdk";
import { useSocket } from "stores/socket";
import { useWalletLayer2Socket } from "services/socket";
import { useSystem } from "stores/system";
import BigNumber from "bignumber.js";
import { useTokenPrices } from "stores/tokenPrices";
import { LoopringAPI } from "api_wrapper";
import moment from "moment";

export type TrendDataItem = {
  timeStamp: number;
  close: number;
};

export type ITokenInfoItem = {
  token: string;
  detail: {
    price: string;
    symbol: string;
    updatedAt: number;
  };
};

export type AssetsRawDataItem = {
  token: {
    type: TokenType;
    value: string;
  };
  amount: string;
  available: string;
  locked: string;
  smallBalance: boolean;
  tokenValueDollar: number;
  name: string;
  tokenValueYuan: number;
};

export const useGetAssets = () => {
  // const [chartData, setChartData] = React.useState<TrendDataItem[]>([])
  const [assetsMap, setAssetsMap] = React.useState<{ [key: string]: any }>({});
  const [assetsRawData, setAssetsRawData] = React.useState<AssetsRawDataItem[]>(
    []
  );
  const [userAssets, setUserAssets] = React.useState<any[]>([]);
  // const [formattedData, setFormattedData] = React.useState<{name: string; value: number}[]>([])
  const { account } = useAccount();
  const { sendSocketTopic, socketEnd } = useSocket();
  const { forex } = useSystem();
  const { tokenPrices } = useTokenPrices();
  const { ammMap } = store.getState().amm.ammMap;

  const { marketArray, tokenMap } = store.getState().tokenMap;

  React.useEffect(() => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      sendSocketTopic({ [WsTopicType.account]: true });
    } else {
      socketEnd();
    }
    return () => {
      socketEnd();
    };
  }, [account.readyState]);

  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(false);
    const assetsKeyList =
      walletMap && walletMap.walletMap ? Object.keys(walletMap.walletMap) : [];
    const assetsDetailList =
      walletMap && walletMap.walletMap
        ? Object.values(walletMap.walletMap)
        : [];
    let map: { [key: string]: any } = {};

    assetsKeyList.forEach(
      (key, index) =>
        (map[key] = {
          token: key,
          detail: assetsDetailList[index],
        })
    );

    setAssetsMap(map);
  }, []);
  useWalletLayer2Socket({ walletLayer2Callback });

  const tokenPriceList = tokenPrices
    ? Object.entries(tokenPrices).map((o) => ({
        token: o[0],
        detail: o[1],
      }))
    : [];

  const getUserAssets = React.useCallback(async () => {
    if (LoopringAPI && LoopringAPI.userAPI && tokenMap) {
      const { accAddress } = account;
      const res = await LoopringAPI.userAPI.getUserVIPAssets({
        address: accAddress,
        assetTypes: "DEX",
      });
      if (res.raw_data && res.raw_data.data) {
        const ethValueList = res.raw_data.data.map((o: any) => ({
          timeStamp: moment(o.createdAt).format("YYYY-MM-DD"),
          close: o.ethValue,
        }));
        setUserAssets(ethValueList);
        return;
      }
      setUserAssets([]);
      return;
    }
    setUserAssets([]);
  }, [account, tokenMap]);

  const getAssetsRawData = React.useCallback(() => {
    if (
      tokenMap &&
      !!Object.keys(tokenMap).length &&
      !!Object.keys(assetsMap).length &&
      !!tokenPriceList.length
    ) {
      const tokenKeys = Object.keys(tokenMap);
      let data: any[] = [];
      tokenKeys.forEach((key, index) => {
        let item = undefined;
        if (assetsMap[key]) {
          const tokenInfo = assetsMap[key];
          const isLpToken = tokenInfo.token.split("-")[0] === "LP";
          let tokenValueDollar = 0;
          const withdrawAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail.pending.withdraw
          );
          const depositAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail.pending.deposit
          );
          const totalAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail?.total
          )
            ?.plus(depositAmount || 0)
            .plus(withdrawAmount || 0);
          if (!isLpToken) {
            const tokenPriceUSDT =
              tokenInfo.token === "DAI"
                ? 1
                : Number(
                    tokenPriceList.find((o) => o.token === tokenInfo.token)
                      ? tokenPriceList.find((o) => o.token === tokenInfo.token)
                          ?.detail
                      : 0
                  ) /
                  Number(
                    tokenPriceList.find((o) => o.token === "USDT")?.detail
                  );
            const rawData = (totalAmount as BigNumber).times(tokenPriceUSDT);
            tokenValueDollar = rawData?.toNumber() || 0;
          } else {
            const price = tokenPrices?.[tokenInfo.token] || 0;
            if (totalAmount && price) {
              tokenValueDollar = totalAmount.times(price).toNumber();
            }
          }
          const isSmallBalance = tokenValueDollar < 1;
          const lockedAmount = volumeToCountAsBigNumber(
            tokenInfo.token,
            tokenInfo.detail?.detail.locked
          );
          const frozenAmount = lockedAmount
            ?.plus(withdrawAmount || 0)
            .plus(depositAmount || 0);
          item = {
            token: {
              type:
                tokenInfo.token.split("-")[0] === "LP"
                  ? TokenType.lp
                  : TokenType.single,
              value: tokenInfo.token,
            },
            // amount: getThousandFormattedNumbers(volumeToCount(tokenInfo.token, tokenInfo.detail?.detail.total as string)) || EmptyValueTag,
            amount: totalAmount?.toNumber() || EmptyValueTag,
            // available: getThousandFormattedNumbers(Number(tokenInfo.detail?.count)) || EmptyValueTag,
            available: Number(tokenInfo.detail?.count) || EmptyValueTag,
            // locked: String(volumeToCountAsBigNumber(tokenInfo.token, tokenInfo.detail?.detail.locked)) || EmptyValueTag,
            locked: String(frozenAmount) || EmptyValueTag,
            smallBalance: isSmallBalance,
            tokenValueDollar,
            name: tokenInfo.token,
            tokenValueYuan: Number(
              (tokenValueDollar * (Number(forex) || 6.5)).toFixed(2)
            ),
          };
        } else {
          item = {
            token: {
              type:
                key.split("-")[0] === "LP" ? TokenType.lp : TokenType.single,
              value: key,
            },
            amount: EmptyValueTag,
            available: EmptyValueTag,
            locked: 0,
            smallBalance: true,
            tokenValueDollar: 0,
            name: key,
            tokenValueYuan: 0,
          };
        }
        if (item) {
          data.push(item);
        }
      });
      data.sort((a, b) => {
        const deltaDollar = b.tokenValueDollar - a.tokenValueDollar;
        const deltaAmount =
          (b.amount && Number(b.amount) ? Number(b.amount) : 0) -
          (a.amount && Number(a.amount) ? Number(a.amount) : 0);
        const deltaName = b.token.value < a.token.value ? 1 : -1;
        return deltaDollar !== 0
          ? deltaDollar
          : deltaAmount !== 0
          ? deltaAmount
          : deltaName;
      });
      const dataWithPrecision = data.map((o) => {
        const token = o.token.value;
        let precision = 0;

        if (token.split("-").length === 3) {
          const rawList = token.split("-");
          rawList.splice(0, 1, "AMM");
          const ammToken = rawList.join("-");
          precision = ammMap ? ammMap[ammToken]?.precisions?.amount : 0;
        } else {
          precision = tokenMap[o.token.value].precision;
        }
        return {
          ...o,
          precision: precision,
        };
      });
      setAssetsRawData(dataWithPrecision);
    }
  }, [assetsMap, tokenMap, tokenPrices]);

  React.useEffect(() => {
    getAssetsRawData();
  }, [getAssetsRawData]);

  return {
    assetsRawData,
    marketArray,
    userAssets,
    getUserAssets,
  };
};
