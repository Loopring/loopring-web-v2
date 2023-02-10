import {
  AccountStatus,
  getValuePrecisionThousand,
  IBData,
  LIVE_FEE_TIMES,
  myLog,
  SUBMIT_PANEL_AUTO_CLOSE,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import {
  store,
  useAccount,
  useModalData,
  useSystem,
  useTokenMap,
} from "../../stores";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import {
  AccountStep,
  ClaimProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import { useBtnStatus } from "../common";
import React from "react";
import { volumeToCount } from "../help";
import {
  useChargeFees,
  useWalletLayer2Socket,
  walletLayer2Service,
} from "../../services";
import * as sdk from "@loopring-web/loopring-sdk";
import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";
import { LoopringAPI } from "../../api_wrapper";
import { isAccActivated } from "./useCheckAccStatus";
import Web3 from "web3";
import { getTimestampDaysLater } from "../../utils";
import { DAYS } from "../../defs";

export const useClaimConfirm = <
  T extends IBData<I> & { tradeValueView: string },
  I
>() => {
  const { exchangeInfo, chainId } = useSystem();
  const { account } = useAccount();
  const {
    allowTrade: { raw_data },
  } = useSystem();
  const legalEnable = (raw_data as any)?.legal?.enable;
  const { tokenMap, idIndex } = useTokenMap();
  const { checkHWAddr, updateHW } = useWalletInfo();

  const {
    setShowAccount,
    modals: {
      isShowClaimWithdraw: { claimToken, isShow },
      isShowAccount: { info },
    },
  } = useOpenModals();
  const { claimValue, updateClaimData } = useModalData();
  const { btnStatus, enableBtn, disableBtn, btnInfo } = useBtnStatus();
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    resetIntervalTime,
  } = useChargeFees({
    requestType: sdk.OffchainFeeReqType.TRANSFER,
    updateData: ({ fee }) => {
      const claimValue = store.getState()._router_modalData.claimValue;
      updateClaimData({ ...claimValue, fee });
    },
  });
  useWalletLayer2Socket({ walletLayer2Callback: undefined });
  const resetDefault = React.useCallback(() => {
    if (info?.isRetry) {
      checkFeeIsEnough();
      return;
    }
    checkFeeIsEnough({ isRequiredAPI: true, intervalTime: LIVE_FEE_TIMES });

    if (claimToken) {
      if (claimToken?.isNft) {
        updateClaimData({
          ...claimToken.nftTokenInfo,
          belong: claimToken.nftTokenInfo?.metadata?.base?.name ?? "NFT",
          tradeValue: Number(claimToken.total),
          volume: claimToken.total,
          balance: Number(claimToken.total),
        });
      } else {
        const token = tokenMap[idIndex[claimToken.tokenId]];
        updateClaimData({
          belong: idIndex[claimToken.tokenId],
          tradeValue: volumeToCount(token.symbol, claimToken.total),
          volume: claimToken.total,
          balance: volumeToCount(token.symbol, claimToken.total),
        });
      }
    } else {
    }
  }, [checkFeeIsEnough, updateClaimData, feeInfo, claimToken, info?.isRetry]);

  React.useEffect(() => {
    if (isShow) {
      resetDefault();
    } else {
      resetIntervalTime();
    }
    return () => {
      resetIntervalTime();
    };
  }, [isShow]);
  const processRequest = React.useCallback(
    async (
      request: sdk.OriginLuckTokenWithdrawsRequestV3,
      isNotHardwareWallet: boolean = false
    ) => {
      const { apiKey, connectName, eddsaKey } = account;
      const claimValue = store.getState()._router_modalData.claimValue;

      try {
        if (
          connectProvides.usedWeb3 &&
          LoopringAPI.luckTokenAPI &&
          isAccActivated()
        ) {
          let isHWAddr = checkHWAddr(account.accAddress);

          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }

          myLog("ClaimConfirm processRequest:", isHWAddr, isNotHardwareWallet);
          const response =
            await LoopringAPI.luckTokenAPI.sendLuckTokenWithdraws(
              {
                request: request,
                web3: connectProvides.usedWeb3 as unknown as Web3,
                chainId: chainId === "unknown" ? 1 : chainId,
                walletType: (ConnectProvidersSignMap[connectName] ??
                  connectName) as unknown as sdk.ConnectorNames,
                eddsaKey: eddsaKey.sk,
                apiKey,
                isHWAddr,
              },
              {
                accountId: account.accountId,
                counterFactualInfo: eddsaKey.counterFactualInfo,
              }
            );
          myLog("submitNFTWithdraw:", response);

          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            throw response;
          }
          setShowAccount({
            isShow: true,
            step: AccountStep.ClaimWithdraw_In_Progress,
          });
          setShowAccount({
            isShow: true,
            step: AccountStep.ClaimWithdraw_Submit,
            info: {
              symbol: claimValue.belong,
            },
          });
          if (isHWAddr) {
            myLog("......try to set isHWAddr", isHWAddr);
            updateHW({ wallet: account.accAddress, isHWAddr });
          }
          walletLayer2Service.sendUserUpdate();

          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE);
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step ==
              AccountStep.ClaimWithdraw_Submit
          ) {
            setShowAccount({ isShow: false });
          }
        }
      } catch (e: any) {
        const code = sdk.checkErrorInfo(e, isNotHardwareWallet);
        switch (code) {
          case sdk.ConnectorError.NOT_SUPPORT_ERROR:
            setShowAccount({
              isShow: true,
              step: AccountStep.ClaimWithdraw_First_Method_Denied,
              info: {
                symbol: claimValue.belong,
              },
            });
            break;
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setShowAccount({
              isShow: true,
              step: AccountStep.ClaimWithdraw_Denied,
              info: {
                symbol: claimValue.belong,
              },
            });
            break;
          default:
            if (
              [102024, 102025, 114001, 114002].includes(
                (e as sdk.RESULT_INFO)?.code || 0
              )
            ) {
              checkFeeIsEnough({ isRequiredAPI: true });
            }
            setShowAccount({
              isShow: true,
              step: AccountStep.ClaimWithdraw_Failed,
              info: {
                symbol: claimValue.belong,
              },
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: e?.message,
                ...(e instanceof Error
                  ? {
                      message: e?.message,
                      stack: e?.stack,
                    }
                  : e ?? {}),
              },
            });
            break;
        }
      }
    },
    [account]
  );

  const onClaimClick = React.useCallback(
    async (_data: Partial<T>, isHardwareRetry = false) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;
      const claimValue = store.getState()._router_modalData.claimValue;
      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        claimValue?.fee?.belong &&
        claimValue.fee?.feeRaw &&
        claimValue?.tradeValue &&
        claimValue?.belong &&
        !isFeeNotEnough.isFeeNotEnough &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.ClaimWithdraw_WaitForAuth,
          });
          const feeToken = tokenMap[claimValue.fee.belong];
          const feeRaw =
            claimValue.fee.feeRaw ?? claimValue.fee.__raw__?.feeRaw ?? 0;
          const fee = sdk.toBig(feeRaw);
          const token = tokenMap[claimValue?.belong];
          const amount = sdk
            .toBig(claimValue?.tradeValue ?? 0)
            .times("1e" + token.decimals);

          const storageId = await LoopringAPI.userAPI?.getNextStorageId(
            {
              accountId,
              sellTokenId: Number(feeToken.tokenId),
            },
            apiKey
          );
          const { broker } = await LoopringAPI.userAPI?.getAvailableBroker({
            type: 2,
          });
          const request: sdk.OriginLuckTokenWithdrawsRequestV3 = {
            tokenId: token.tokenId,
            feeTokenId: feeToken.tokenId,
            amount: amount.toString(),
            claimer: accAddress,
            transfer: {
              exchange: exchangeInfo.exchangeAddress,
              payerAddr: accAddress,
              payerId: accountId,
              payeeAddr: broker,
              storageId: storageId.offchainId,
              token: {
                tokenId: feeToken.tokenId,
                volume: fee.toFixed(), // TEST: fee.toString(),
              },
              validUntil: getTimestampDaysLater(DAYS),
            },
          };

          myLog("claimWithdrawals request:", request);

          processRequest(request, isHardwareRetry);
        } catch (e: any) {
          // sdk.dumpError400(e);
          setShowAccount({
            isShow: true,
            step: AccountStep.ClaimWithdraw_Failed,
            error: {
              code: e?.code ?? UIERROR_CODE.UNKNOWN,
              message: e.message,
              ...(e instanceof Error
                ? {
                    message: e?.message,
                    stack: e?.stack,
                  }
                : e ?? {}),
            } as sdk.RESULT_INFO,
          });
        }

        return true;
      } else {
        return false;
      }
    },
    [
      account,
      tokenMap,
      exchangeInfo,
      isFeeNotEnough.isFeeNotEnough,
      setShowAccount,
      processRequest,
    ]
  );
  const checkBtnStatus = React.useCallback(() => {
    const claimValue = store.getState()._router_modalData.claimValue;
    if (
      tokenMap &&
      chargeFeeTokenList.length &&
      isFeeNotEnough &&
      !isFeeNotEnough.isFeeNotEnough &&
      claimValue.belong &&
      claimValue.tradeValue &&
      claimValue.fee &&
      claimValue.fee.belong
    ) {
      enableBtn();
      return;
    }
    disableBtn();
  }, [
    chargeFeeTokenList.length,
    disableBtn,
    enableBtn,
    isFeeNotEnough.isFeeNotEnough,
    tokenMap,
    claimValue?.balance,
    claimValue?.belong,
    claimValue?.fee?.feeRaw,
    claimValue?.tradeValue,
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [
    chargeFeeTokenList,
    claimValue?.tradeValue,
    isFeeNotEnough?.isFeeNotEnough,
    claimValue?.fee?.feeRaw,
  ]);

  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.ClaimWithdraw_WaitForAuth,
      });
      onClaimClick({}, isHardwareRetry);
    },
    [setShowAccount]
  );
  return {
    retryBtn,
    claimProps: {
      btnStatus,
      btnInfo,
      disabled: !(legalEnable === true),
      tradeData: {
        tradeValue: claimValue?.tradeValue,
        belong: claimValue?.belong,
        balance: claimValue?.belong,
        tradeValueView: getValuePrecisionThousand(
          claimValue?.tradeValue,
          tokenMap[claimValue?.belong?.toString() ?? ""]?.precision,
          tokenMap[claimValue?.belong?.toString() ?? ""]?.precision,
          tokenMap[claimValue?.belong?.toString() ?? ""]?.precision,
          false
        ),
      },
      chargeFeeTokenList,
      isFeeNotEnough,
      handleFeeChange,
      feeInfo,
      checkFeeIsEnough,
      onClaimClick,
    } as any as ClaimProps<any, any>,
  };
};
