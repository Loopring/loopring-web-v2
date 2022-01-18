import * as sdk from "@loopring-web/loopring-sdk";
import {
  ChainId,
  dumpError400,
  GetOffchainFeeAmtRequest,
  OffchainFeeReqType,
  toBig,
} from "@loopring-web/loopring-sdk";
import React from "react";
import { LoopringAPI } from "api_wrapper";
import * as _ from "lodash";
import {
  FeeChargeOrderUATDefault,
  FeeInfo,
  globalSetup,
  myLog,
  WalletMap,
} from "@loopring-web/common-resources";
import { useTokenMap } from "../../stores/token";
import { useSettings } from "@loopring-web/component-lib";
import { OffchainNFTFeeReqType } from "@loopring-web/loopring-sdk";
import { GetNFTOffchainFeeAmtRequest } from "@loopring-web/loopring-sdk";
import { useAccount } from "../../stores/account";
import { useSystem } from "../../stores/system";
import { makeWalletLayer2 } from "../help";
import store from "../../stores";

export function useChargeFees({
  tokenSymbol,
  requestType,
  amount,
  tokenAddress,
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
  const { chainId } = useSystem();
  let { feeChargeOrder } = useSettings();
  feeChargeOrder =
    chainId === ChainId.MAINNET ? feeChargeOrder : FeeChargeOrderUATDefault;
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const [chargeFeeTokenList, setChargeFeeTokenList] = React.useState<FeeInfo[]>(
    []
  );
  const [isFeeNotEnough, setIsFeeNotEnough] = React.useState<boolean>(false);
  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  const walletMap = makeWalletLayer2(true).walletMap ?? ({} as WalletMap<any>);
  const handleFeeChange = (value: FeeInfo): void => {
    if (
      walletMap &&
      value?.belong &&
      walletMap[value.belong] &&
      walletMap[value.belong]?.count &&
      // @ts-ignore
      sdk.toBig(walletMap[value.belong].count).gte(sdk.toBig(value.fee))
    ) {
      setIsFeeNotEnough(false);
    } else {
      setIsFeeNotEnough(true);
    }
    if (updateData && value) {
      updateData({
        ...value,
        __raw__: {
          ...value.__raw__,
          tokenId: tokenMap[value.belong.toString()].tokenId,
        },
      });
    }
    setFeeInfo(value);
  };

  const getFeeList = _.debounce(
    async () => {
      const { tokenMap } = store.getState().tokenMap;
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer as unknown as NodeJS.Timeout);
      }
      let tokenInfo;
      if (tokenSymbol && tokenMap) {
        tokenInfo = tokenMap[tokenSymbol];
      }
      if (
        tokenMap &&
        tokenMap.ETH &&
        LoopringAPI.userAPI &&
        LoopringAPI.globalAPI
      ) {
        try {
          const request:
            | GetOffchainFeeAmtRequest
            | GetNFTOffchainFeeAmtRequest = {
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
            fees = (
              await LoopringAPI?.globalAPI.getActiveFeeInfo({
                accountId:
                  account._accountIdNotActive &&
                  account._accountIdNotActive !== -1
                    ? account._accountIdNotActive
                    : undefined,
              })
            ).fees;
          } else if (
            [
              OffchainNFTFeeReqType.NFT_MINT,
              OffchainNFTFeeReqType.NFT_WITHDRAWAL,
              OffchainNFTFeeReqType.NFT_TRANSFER,
              OffchainNFTFeeReqType.NFT_DEPLOY,
            ].includes(requestType as any) &&
            account.accountId &&
            account.accountId !== -1 &&
            account.apiKey
          ) {
            fees = (
              await LoopringAPI.userAPI.getNFTOffchainFeeAmt(
                request as GetNFTOffchainFeeAmtRequest,
                account.apiKey
              )
            ).fees;
          } else if (
            account.accountId &&
            account.accountId !== -1 &&
            account.apiKey
          ) {
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
          if (fees) {
            const _chargeFeeTokenList = feeChargeOrder.reduce(
              (pre, item, index) => {
                let { fee, token } = fees[item] ?? {};
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
              },
              [] as Array<FeeInfo>
            );
            if (feeInfo === undefined) {
              feeInfo = _chargeFeeTokenList[0];
              setIsFeeNotEnough(true);
            } else {
              setIsFeeNotEnough(false);
            }

            setFeeInfo((state) => {
              if (state.feeRaw === undefined) {
                if (updateData && feeInfo) {
                  updateData({
                    ...feeInfo,
                    __raw__: {
                      ...feeInfo?.__raw__,
                      tokenId: tokenMap[feeInfo?.belong.toString()].tokenId,
                    },
                  });
                }
                return feeInfo;
              }
            });
            myLog(
              "chargeFeeTokenList,requestType",
              _chargeFeeTokenList,
              requestType
            );
            setChargeFeeTokenList(_chargeFeeTokenList);
          }
        } catch (reason) {
          dumpError400(reason);
          myLog("chargeFeeTokenList,error", reason);
        }
        return;
      } else {
        nodeTimer.current = setTimeout(() => {
          getFeeList();
        }, 1000); //15*60*1000 //900000
      }
    },
    globalSetup.wait,
    { trailing: true }
  );

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
  }, [tokenSymbol]);
  return {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
  };
}
