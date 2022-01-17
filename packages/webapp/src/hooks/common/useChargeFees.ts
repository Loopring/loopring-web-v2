import * as sdk from "@loopring-web/loopring-sdk";
import {
  dumpError400,
  GetOffchainFeeAmtRequest,
  LoopringMap,
  OffchainFeeReqType,
  toBig,
  TokenInfo,
} from "@loopring-web/loopring-sdk";
import React, { useState } from "react";
import { LoopringAPI } from "api_wrapper";
import * as _ from "lodash";
import {
  Account,
  FeeInfo,
  globalSetup,
  WalletMap,
} from "@loopring-web/common-resources";
import { useTokenMap } from "../../stores/token";
import { useSettings } from "@loopring-web/component-lib";
import { OffchainNFTFeeReqType } from "@loopring-web/loopring-sdk/dist/defs/loopring_enums";
import { GetNFTOffchainFeeAmtRequest } from "@loopring-web/loopring-sdk/dist/defs/loopring_defs";
import { useAccount } from "../../stores/account";

export function useChargeFees({
  tokenSymbol,
  requestType,
  amount,
  tokenAddress,
  walletMap,
  updateData,
  isActiveAccount = false,
  needAmountRefresh,
}: {
  tokenAddress?: string | undefined;
  tokenSymbol?: string | undefined;
  requestType: OffchainFeeReqType | OffchainNFTFeeReqType;
  amount?: number;
  updateData: undefined | ((props: any) => void);
  isActiveAccount?: boolean;
  walletMap: WalletMap<any>;
  needAmountRefresh?: boolean;
}) {
  const [feeInfo, setFeeInfo] = React.useState<FeeInfo>(
    () =>
      ({
        belong: "ETH",
        fee: 0,
        feeRaw: undefined,
      } as FeeInfo)
  );
  const { feeChargeOrder } = useSettings();
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const [chargeFeeTokenList, setChargeFeeTokenList] = React.useState<FeeInfo[]>(
    []
  );
  const [isFeeNotEnough, setIsFeeNotEnough] = React.useState<boolean>(false);
  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  const handleFeeChange = (value: FeeInfo): void => {
    if (tokenMap) {
      value.__raw__ = {
        ...value.__raw__,
        tokenId: tokenMap[value.belong.toString()].tokenId,
      };
    }
    if (
      walletMap &&
      walletMap[value.belong] &&
      walletMap[value.belong]?.count &&
      // @ts-ignore
      sdk.toBig(walletMap[value.belong].count).gte(sdk.toBig(value.fee))
    ) {
      setIsFeeNotEnough(true);
    } else {
      setIsFeeNotEnough(false);
    }
    if (updateData) {
      updateData({ fee: value });
    }
    setFeeInfo(value);
  };

  const getFeeList = _.debounce(async () => {
    if (nodeTimer.current !== -1) {
      clearTimeout(nodeTimer as unknown as NodeJS.Timeout);
    }
    let tokenInfo;
    if (tokenSymbol && tokenMap) {
      tokenInfo = tokenMap[tokenSymbol];
    }
    if (
      account.accountId &&
      account.accountId !== -1 &&
      account.apiKey &&
      tokenMap &&
      LoopringAPI.userAPI
    ) {
      try {
        const request: GetOffchainFeeAmtRequest | GetNFTOffchainFeeAmtRequest =
          {
            accountId: account.accountId,
            tokenSymbol,
            tokenAddress,
            requestType,
            amount:
              tokenInfo && amount
                ? toBig(amount)
                    .times("1e" + tokenInfo.decimals)
                    .toFixed(0, 0)
                : "0",
          };
        let fees: any;
        if (isActiveAccount) {
          const { fees } =
            (await LoopringAPI?.globalAPI?.getActiveFeeInfo({
              accountId:
                account._accountIdNotActive &&
                account._accountIdNotActive !== -1
                  ? account._accountIdNotActive
                  : undefined,
            })) ?? {};
        } else if (
          [
            OffchainNFTFeeReqType.NFT_MINT,
            OffchainNFTFeeReqType.NFT_WITHDRAWAL,
            OffchainNFTFeeReqType.NFT_TRANSFER,
            OffchainNFTFeeReqType.NFT_DEPLOY,
          ].includes(requestType as any)
        ) {
          fees = await (
            await LoopringAPI.userAPI.getNFTOffchainFeeAmt(
              request as GetNFTOffchainFeeAmtRequest,
              account.apiKey
            )
          ).fees;
        } else {
          fees = (
            await LoopringAPI.userAPI.getOffchainFeeAmt(
              request as GetOffchainFeeAmtRequest,
              account.apiKey
            )
          ).fees;
        }

        nodeTimer.current = setTimeout(() => {
          getFeeList();
        }, 900000); //15*60*1000 //900000
        let feeInfo: any;
        const chargeFeeTokenList = feeChargeOrder.reduce((pre, item, index) => {
          let { fee, token } = fees[item];
          if (fee && token) {
            const tokenInfo = tokenMap[token];
            const tokenId = tokenInfo.tokenId;
            const fastWithDraw = tokenInfo.fastWithdrawLimit;
            const feeRaw = fee;
            fee = sdk
              .toBig(fee)
              .div("1e" + tokenInfo.decimals)
              .toString();
            const _feeInfo = {
              belong: token,
              fee,
              __raw__: { fastWithDraw, feeRaw, tokenId },
            };
            pre.push(_feeInfo);
            if (feeInfo === undefined && walletMap && walletMap[token]) {
              const { count } = walletMap[token] ?? { count: 0 };
              if (sdk.toBig(count).gt(sdk.toBig(fee))) {
                feeInfo = _feeInfo;
              }
            }
          }
          return pre;
        }, [] as Array<FeeInfo>);
        if (feeInfo === undefined) {
          feeInfo = chargeFeeTokenList[0];
          setIsFeeNotEnough(false);
        } else {
          setIsFeeNotEnough(true);
        }

        setFeeInfo((state) => {
          if (state.feeRaw === undefined) {
            return feeInfo;
          }
        });
        setChargeFeeTokenList(chargeFeeTokenList);
      } catch (reason) {
        dumpError400(reason);
      }
      return;
    }
  }, globalSetup.wait);

  React.useEffect(() => {
    if (nodeTimer.current !== -1) {
      clearTimeout(nodeTimer as unknown as NodeJS.Timeout);
    }

    getFeeList();
    return () => {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer as unknown as NodeJS.Timeout);
      }
    };
  }, [tokenSymbol, account.accountId, requestType]);

  return {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
  };
}
