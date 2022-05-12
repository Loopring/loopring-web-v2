import * as sdk from "@loopring-web/loopring-sdk";
import { useSettings } from "@loopring-web/component-lib";

import React from "react";
import * as _ from "lodash";
import {
  AccountStatus,
  FeeChargeOrderDefault,
  FeeChargeOrderUATDefault,
  FeeInfo,
  globalSetup,
  myLog,
  WalletMap,
} from "@loopring-web/common-resources";
import {
  useTokenMap,
  LoopringAPI,
  useAccount,
  useSystem,
  makeWalletLayer2,
  store,
  useWalletLayer2,
} from "../../index";

export function useChargeFees({
  tokenSymbol,
  requestType,
  amount,
  tokenAddress,
  updateData,
  isActiveAccount = false,
  deployInWithdraw = undefined,
}: {
  tokenAddress?: string | undefined;
  tokenSymbol?: string | undefined;
  requestType: sdk.OffchainFeeReqType | sdk.OffchainNFTFeeReqType;
  amount?: number;
  updateData?:
    | undefined
    | ((fee: FeeInfo, chargeFeeTokenList?: FeeInfo[]) => void);
  isActiveAccount?: boolean;
  needAmountRefresh?: boolean;
  deployInWithdraw?: boolean;
}): {
  chargeFeeTokenList: FeeInfo[];
  isFeeNotEnough: boolean;
  checkFeeIsEnough: (isRequiredAPI?: boolean) => void;
  handleFeeChange: (value: FeeInfo) => void;
  feeInfo: FeeInfo;
} {
  const [feeInfo, setFeeInfo] = React.useState<FeeInfo>({
    belong: "ETH",
    fee: 0,
    feeRaw: undefined,
  } as FeeInfo);
  const { chainId } = useSystem();
  let { feeChargeOrder } = useSettings();
  feeChargeOrder =
    chainId === sdk.ChainId.MAINNET
      ? FeeChargeOrderDefault
      : FeeChargeOrderUATDefault;
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);
  const [chargeFeeTokenList, setChargeFeeTokenList] = React.useState<FeeInfo[]>(
    []
  );
  const [isFeeNotEnough, setIsFeeNotEnough] = React.useState<boolean>(false);
  const { tokenMap } = useTokenMap();
  const { account } = useAccount();
  const { status: walletLayer2Status } = useWalletLayer2();
  const handleFeeChange = (value: FeeInfo): void => {
    const walletMap =
      makeWalletLayer2(true).walletMap ?? ({} as WalletMap<any>);
    if (
      walletMap &&
      value?.belong &&
      walletMap[value.belong] &&
      walletMap[value.belong]?.count &&
      sdk
        // @ts-ignore
        .toBig(walletMap[value.belong].count)
        .gte(sdk.toBig(value.fee.toString().replace(",", "")))
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
      const walletMap =
        makeWalletLayer2(true).walletMap ?? ({} as WalletMap<any>);
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout);
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
            | sdk.GetOffchainFeeAmtRequest
            | sdk.GetNFTOffchainFeeAmtRequest = {
            accountId: account.accountId,
            //@ts-ignore
            tokenSymbol,
            tokenAddress,
            requestType,
            amount:
              tokenInfo && amount
                ? sdk
                    .toBig(amount)
                    .times("1e" + tokenInfo.decimals)
                    .toFixed(0, 0)
                : "0",
            deployInWithdraw:
              requestType === sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL
                ? deployInWithdraw
                : undefined,
          };
          let fees: any;
          if (isActiveAccount) {
            const response = await LoopringAPI.globalAPI.getActiveFeeInfo({
              accountId:
                account._accountIdNotActive &&
                account._accountIdNotActive !== -1
                  ? account._accountIdNotActive
                  : undefined,
            });

            if (
              (response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message
            ) {
            } else {
              fees = response.fees;
            }
          } else if (
            [
              sdk.OffchainNFTFeeReqType.NFT_MINT,
              sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL,
              sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
              sdk.OffchainNFTFeeReqType.NFT_DEPLOY,
            ].includes(requestType as any) &&
            account.accountId &&
            account.accountId !== -1 &&
            account.apiKey
          ) {
            const response = await LoopringAPI.userAPI.getNFTOffchainFeeAmt(
              request as sdk.GetNFTOffchainFeeAmtRequest,
              account.apiKey
            );
            if (
              (response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message
            ) {
            } else {
              fees = response.fees;
            }
          } else if (
            account.accountId &&
            account.accountId !== -1 &&
            account.apiKey
          ) {
            const response = await LoopringAPI.userAPI.getOffchainFeeAmt(
              request as sdk.GetOffchainFeeAmtRequest,
              account.apiKey
            );
            if (
              (response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message
            ) {
            } else {
              fees = response.fees;
            }
          }

          nodeTimer.current = setTimeout(() => {
            getFeeList();
          }, 900000); //15*60*1000 //900000
          let feeInfo: any = undefined;
          if (fees && feeChargeOrder) {
            const _chargeFeeTokenList = feeChargeOrder?.reduce((pre, item) => {
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
                  feeRaw,
                  hasToken: !!(walletMap && walletMap[token]),
                  __raw__: { fastWithDraw, feeRaw, tokenId },
                };
                pre.push(_feeInfo);
                if (feeInfo === undefined && walletMap && walletMap[token]) {
                  const { count } = walletMap[token] ?? { count: 0 };
                  if (
                    sdk
                      .toBig(count)
                      .gte(sdk.toBig(fee.toString().replace(",", "")))
                  ) {
                    feeInfo = _.cloneDeep(_feeInfo);
                  }
                }
              }
              return pre;
            }, [] as Array<FeeInfo>);
            setFeeInfo((state) => {
              if (feeInfo === undefined) {
                setIsFeeNotEnough(true);
                if (!state || state?.feeRaw === undefined) {
                  feeInfo = _chargeFeeTokenList[0]
                    ? _.cloneDeep(_chargeFeeTokenList[0])
                    : {
                        belong: "ETH",
                        fee: 0,
                        feeRaw: undefined,
                      };
                  if (updateData && feeInfo) {
                    updateData(
                      {
                        ...feeInfo,
                        __raw__: {
                          ...feeInfo?.__raw__,
                          tokenId: tokenMap[feeInfo?.belong.toString()].tokenId,
                        },
                      },
                      _chargeFeeTokenList
                    );
                  }
                  return feeInfo;
                } else {
                  return state;
                }
              } else {
                setIsFeeNotEnough(false);
                if (isFeeNotEnough || !state || state?.feeRaw === undefined) {
                  if (updateData && feeInfo) {
                    updateData(
                      {
                        ...feeInfo,
                        __raw__: {
                          ...feeInfo?.__raw__,
                          tokenId: tokenMap[feeInfo?.belong.toString()].tokenId,
                        },
                      },
                      _chargeFeeTokenList
                    );
                  }
                  return feeInfo;
                } else {
                  const _feeInfo = _chargeFeeTokenList?.find(
                    (ele) => ele.belong === state.belong
                  );
                  if (updateData && _feeInfo) {
                    updateData({ ..._feeInfo }, _chargeFeeTokenList);
                  }
                  return _feeInfo ?? state;
                }
              }
            });
            setChargeFeeTokenList(_chargeFeeTokenList ?? []);
          }
        } catch (reason: any) {
          myLog("chargeFeeTokenList, error", reason);
          if ((reason as sdk.RESULT_INFO).code) {
          }
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
  const checkFeeIsEnough = (isRequiredAPI?: boolean) => {
    if (isRequiredAPI) {
      getFeeList();
    } else {
      const walletMap =
        makeWalletLayer2(true).walletMap ?? ({} as WalletMap<any>);
      if (chargeFeeTokenList && walletMap) {
        chargeFeeTokenList.map((feeInfo) => {
          return {
            ...feeInfo,
            hasToken: !!(walletMap && walletMap[feeInfo.belong]),
          };
        });
      }

      if (feeInfo && feeInfo.belong && feeInfo.feeRaw) {
        const { count } = walletMap[feeInfo.belong] ?? { count: 0 };
        if (
          sdk
            .toBig(count)
            .gte(sdk.toBig(feeInfo.fee.toString().replace(",", "")))
        ) {
          setIsFeeNotEnough(false);
          return;
        }
      }
      setIsFeeNotEnough(true);
    }
  };

  React.useEffect(() => {
    if (nodeTimer.current !== -1) {
      clearTimeout(nodeTimer.current as NodeJS.Timeout);
    }
    if (
      (isActiveAccount &&
        [
          AccountStatus.NO_ACCOUNT,
          AccountStatus.DEPOSITING,
          AccountStatus.NOT_ACTIVE,
          AccountStatus.LOCKED,
        ].includes(account.readyState as any)) ||
      (!isActiveAccount &&
        walletLayer2Status === "UNSET" &&
        AccountStatus.ACTIVATED === account.readyState &&
        [
          sdk.OffchainFeeReqType.UPDATE_ACCOUNT,
          sdk.OffchainFeeReqType.UPDATE_ACCOUNT,
          sdk.OffchainFeeReqType.TRANSFER,
          sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
          sdk.OffchainNFTFeeReqType.NFT_DEPLOY,
        ].includes(Number(requestType))) ||
      (!isActiveAccount &&
        walletLayer2Status === "UNSET" &&
        sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL === requestType &&
        tokenAddress) ||
      (!isActiveAccount &&
        tokenSymbol &&
        AccountStatus.ACTIVATED === account.readyState &&
        walletLayer2Status === "UNSET" &&
        [
          sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
          sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL,
        ].includes(Number(requestType))) ||
      (!isActiveAccount &&
        tokenAddress &&
        AccountStatus.ACTIVATED === account.readyState &&
        walletLayer2Status === "UNSET" &&
        [sdk.OffchainNFTFeeReqType.NFT_MINT].includes(Number(requestType)))
    ) {
      getFeeList();
    }

    return () => {
      if (nodeTimer.current !== -1) {
        clearTimeout(nodeTimer.current as NodeJS.Timeout);
      }
    };
  }, [
    tokenAddress,
    tokenSymbol,
    requestType,
    account.readyState,
    walletLayer2Status,
  ]);

  return {
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
  };
}
