import * as sdk from "@loopring-web/loopring-sdk";
import {
  dumpError400,
  GetNFTOffchainFeeAmtRequest,
  LoopringMap,
  OffchainNFTFeeReqType,
  toBig,
  TokenInfo,
} from "@loopring-web/loopring-sdk";
import { useAccount } from "stores/account";
import React, { useState } from "react";
import { useCustomDCEffect } from "hooks/common/useCustomDCEffect";
import { LoopringAPI } from "api_wrapper";
import * as _ from "lodash";
import { FeeInfo, globalSetup } from "@loopring-web/common-resources";

export function useChargeNFTFees({
  tokenAddress,
  tokenMap,
  requestType,
  amount,
  needRefresh,
}: {
  tokenAddress: string | undefined;
  tokenMap: LoopringMap<TokenInfo>;
  requestType: OffchainNFTFeeReqType;
  amount?: number;
  needRefresh?: boolean;
}) {
  const { account } = useAccount();

  const [chargeFeeList, setChargeFeeList] = useState<FeeInfo[]>([]);

  const getFeeList = React.useCallback(
    _.debounce(
      async (
        accountId: number,
        apiKey: string,
        tokenAddress: string | undefined,
        requestType: OffchainNFTFeeReqType,
        tokenMap: LoopringMap<TokenInfo> | undefined,
        amount: number | undefined
      ) => {
        if (
          accountId === -1 ||
          !apiKey ||
          !tokenAddress ||
          !LoopringAPI.userAPI ||
          !tokenMap
        ) {
          return;
        }

        // myLog('tokenSymbol:', tokenSymbol, ' requestType:', OffchainFeeReqType[requestType])

        let _chargeFeeList: FeeInfo[] = [];

        try {
          // const tokenInfo = tokenMap[tokenSymbol]

          const request: GetNFTOffchainFeeAmtRequest = {
            accountId,
            tokenAddress,
            requestType,
            amount: amount ? amount.toString() : "0",
          };

          // myLog('request:', request)

          const response = await LoopringAPI.userAPI.getNFTOffchainFeeAmt(
            request,
            apiKey
          );

          // myLog('response:', response)

          if (response?.raw_data?.fees instanceof Array) {
            response.raw_data.fees.forEach((item: any) => {
              const feeRaw = item.fee;
              const tokenInfo = tokenMap[item.token];
              const tokenId = tokenInfo.tokenId;
              const fastWithDraw = tokenInfo.fastWithdrawLimit;
              const fee = sdk
                .toBig(item.fee)
                .div("1e" + tokenInfo.decimals)
                .toString();
              _chargeFeeList.push({
                belong: item.token,
                fee,
                __raw__: { fastWithDraw, feeRaw, tokenId },
              });
            });
          }
        } catch (reason) {
          dumpError400(reason);
        }
        setChargeFeeList((stats) => {
          return _chargeFeeList;
        });
      },
      globalSetup.wait
    ),
    []
  );

  React.useEffect(() => {
    getFeeList(
      account.accountId,
      account.apiKey,
      tokenAddress,
      requestType,
      tokenMap,
      amount
    );
  }, []);

  return {
    chargeFeeList,
  };
}
