import React, { useCallback } from "react";

import {
  AccountStep,
  NFTMintProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  ErrorType,
  TradeNFT,
  myLog,
  UIERROR_CODE,
  EmptyValueTag,
  MINT_LIMIT,
  SagaStatus,
  Explorer,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTokenMap } from "stores/token";
import { useAccount } from "stores/account";
import { useBtnStatus } from "hooks/common/useBtnStatus";
import { useModalData } from "stores/router";
import { LoopringAPI } from "../../api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import { useSystem } from "../../stores/system";
import {
  ActionResult,
  ActionResultCode,
  DAYS,
  TOAST_TIME,
} from "../../defs/common_defs";
import { checkErrorInfo } from "./utils";
import { isAccActivated } from "./checkAccStatus";
import {
  useWalletLayer2Socket,
  walletLayer2Service,
} from "../../services/socket";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import { useChargeFees } from "../common/useChargeFees";
import { useTranslation } from "react-i18next";
import { getTimestampDaysLater } from "../../utils/dt_tools";
import { useWalletLayer2NFT } from "../../stores/walletLayer2NFT";
import store from "../../stores";
export const useNFTMint = <T extends TradeNFT<I>, I>() => {
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account, status: accountStatus } = useAccount();
  const { exchangeInfo, chainId } = useSystem();
  const { nftMintValue, updateNFTMintData } = useModalData();
  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
  } = useBtnStatus();
  const { t } = useTranslation("common");
  const [lastRequest, setLastRequest] = React.useState<any>({});
  const { checkHWAddr, updateHW } = useWalletInfo();
  const { page, updateWalletLayer2NFT } = useWalletLayer2NFT();
  const [isAvaiableId, setIsAvaiableId] = React.useState(false);
  const [isNFTCheckLoading, setIsNFTCheckLoading] = React.useState(false);
  const { setShowAccount, setShowNFTMint } = useOpenModals();
  const [tokenAddress, setTokenAddress] =
    React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    const account = store.getState().account;
    if (
      account.readyState === AccountStatus.ACTIVATED &&
      accountStatus === SagaStatus.UNSET
    ) {
      setTokenAddress(() => {
        if (account.accAddress && LoopringAPI.nftAPI) {
          return (
            LoopringAPI.nftAPI?.computeNFTAddress({
              nftOwner: account.accAddress,
              nftFactory: sdk.NFTFactory[chainId],
              nftBaseUri: "",
            }).tokenAddress || undefined
          );
        } else {
          return undefined;
        }
      });
    }
  }, [accountStatus]);

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    checkFeeIsEnough,
    handleFeeChange,
    feeInfo,
  } = useChargeFees({
    tokenAddress: tokenAddress?.toLowerCase(),
    requestType: sdk.OffchainNFTFeeReqType.NFT_MINT,
    updateData: (feeInfo, _chargeFeeList) => {
      updateNFTMintData({
        ...nftMintValue,
        fee: feeInfo,
      });
    },
  });
  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();
      if (
        !error &&
        nftMintValue.royaltyPercentage &&
        Number.isInteger(nftMintValue.royaltyPercentage / 1) &&
        nftMintValue.royaltyPercentage >= 0 &&
        nftMintValue.royaltyPercentage <= 10 &&
        nftMintValue &&
        tokenAddress &&
        nftMintValue.tradeValue &&
        Number(nftMintValue.tradeValue) > 0 &&
        Number(nftMintValue.tradeValue) <= MINT_LIMIT &&
        (nftMintValue.image !== undefined || nftMintValue.name !== undefined) &&
        nftMintValue.fee &&
        nftMintValue.fee.belong &&
        nftMintValue.fee.__raw__ &&
        !isFeeNotEnough &&
        isAvaiableId
      ) {
        enableBtn();
        return;
      }
      if (
        (!nftMintValue.image && !nftMintValue.name) ||
        !(
          nftMintValue.royaltyPercentage &&
          Number.isInteger(nftMintValue.royaltyPercentage / 1) &&
          nftMintValue.royaltyPercentage >= 0 &&
          nftMintValue.royaltyPercentage <= 10
        )
      ) {
        setLabelAndParams("labelNFTMintNoMetaBtn", {});
      }
      disableBtn();
      myLog("try to disable nftMint btn!");
    },
    [
      isAvaiableId,
      isFeeNotEnough,
      resetBtnInfo,
      nftMintValue,
      tokenAddress,
      enableBtn,
      setLabelAndParams,
      disableBtn,
    ]
  );

  useWalletLayer2Socket({});

  React.useEffect(() => {
    updateBtnStatus();
  }, [isFeeNotEnough, isAvaiableId, nftMintValue, feeInfo]);

  const resetDefault = React.useCallback(() => {
    checkFeeIsEnough();
    updateNFTMintData({
      ...nftMintValue,
      tradeValue: 0,
      nftIdView: "",
      image: undefined,
      name: "",
      nftId: undefined,
      description: "",
      tokenAddress,
      fee: feeInfo,
    });
  }, [checkFeeIsEnough, tokenAddress, updateNFTMintData]);
  const processRequest = React.useCallback(
    async (request: sdk.NFTMintRequestV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {
          let isHWAddr = checkHWAddr(account.accAddress);

          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }

          setLastRequest({ request });

          const response = await LoopringAPI.userAPI?.submitNFTMint(
            {
              request,
              web3: connectProvides.usedWeb3,
              chainId:
                chainId !== sdk.ChainId.GOERLI ? sdk.ChainId.MAINNET : chainId,
              walletType: connectName as sdk.ConnectorNames,
              eddsaKey: eddsaKey.sk,
              apiKey,
              isHWAddr,
            },
            {
              accountId: account.accountId,
              counterFactualInfo: eddsaKey.counterFactualInfo,
            }
          );

          myLog("submitNFTMint:", response);

          if (isAccActivated()) {
            if (
              (response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message
            ) {
              // Withdraw failed
              const code = checkErrorInfo(
                response as sdk.RESULT_INFO,
                isNotHardwareWallet
              );
              if (code === sdk.ConnectorError.USER_DENIED) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTMint_Denied,
                });
              } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTMint_First_Method_Denied,
                });
              } else {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTMint_Failed,
                  error: response as sdk.RESULT_INFO,
                });
                resetDefault();
              }
            } else if ((response as sdk.TX_HASH_API)?.hash) {
              // Withdraw success
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTMint_In_Progress,
              });
              await sdk.sleep(TOAST_TIME);
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTMint_Success,
                info: {
                  hash:
                    Explorer +
                    `tx/${(response as sdk.TX_HASH_API)?.hash}-nftMint`,
                },
              });
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }
              walletLayer2Service.sendUserUpdate();
              updateWalletLayer2NFT({ page });
              resetDefault();
              // checkFeeIsEnough();
            }
          } else {
            resetDefault();
          }
        }
      } catch (reason) {
        const code = checkErrorInfo(reason, isNotHardwareWallet);

        if (isAccActivated()) {
          if (code === sdk.ConnectorError.USER_DENIED) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_Denied,
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_First_Method_Denied,
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_Failed,
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: reason?.message,
              },
            });
          }
        }
      }
    },
    [account, checkHWAddr, chainId, setShowAccount, resetDefault, updateHW]
  );

  const handleOnNFTDataChange = useCallback(
    async (data: T) => {
      let shouldUpdate = {};

      if (
        data.nftIdView &&
        LoopringAPI.nftAPI &&
        nftMintValue.nftIdView !== data.nftIdView
      ) {
        setIsNFTCheckLoading(true);
        let nftId: string = "";
        try {
          nftId = LoopringAPI.nftAPI.ipfsCid0ToNftID(data.nftIdView);
          shouldUpdate = {
            nftId,
            // nftIdView: data.nftIdView,
            ...shouldUpdate,
          };
          setIsAvaiableId(true);
        } catch (error) {
          myLog("handleOnNFTDataChange -> data.nftId", error);
          setIsAvaiableId(false);
          shouldUpdate = {
            nftId: "",
            // nftIdView:'',
          };
        }

        if (nftId && nftId !== "") {
          try {
            const value = await fetch(
              sdk.LOOPRING_URLs.IPFS_META_URL + `${data.nftIdView}`
            ).then((response) => response.json());

            if (value) {
              shouldUpdate = {
                nftId: nftId,
                name: value.name ?? t("labelUnknown"),
                image: value.image,
                description: value.description ?? EmptyValueTag,
                balance: MINT_LIMIT,
                royaltyPercentage: value.royalty_percentage,
                ...shouldUpdate,
              };
            } else {
              shouldUpdate = {
                nftId: nftId,
                name: undefined,
                image: undefined,
                description: undefined,
                balance: undefined,
                ...shouldUpdate,
              };
            }
          } catch (error) {
            shouldUpdate = {
              nftId: nftId,
              name: undefined,
              image: undefined,
              description: undefined,
              balance: undefined,
              ...shouldUpdate,
            };
            myLog(error);
          }
        }
      } else if (data.nftIdView) {
      } else if (!data.nftIdView) {
        setIsAvaiableId(false);
        shouldUpdate = {
          nftId: "",
          name: undefined,
          image: undefined,
          description: undefined,
          balance: undefined,
        };
      }
      setIsNFTCheckLoading(false);
      updateNFTMintData({
        ...nftMintValue,
        ...data,
        ...shouldUpdate,
      });
    },
    [nftMintValue]
  );

  const onNFTMintClick = useCallback(
    async (_nftMintValue, isFirstTime: boolean = true) => {
      let result: ActionResult = { code: ActionResultCode.NoError };
      if (
        account.readyState === AccountStatus.ACTIVATED &&
        nftMintValue.tradeValue &&
        tokenAddress &&
        nftMintValue.nftId &&
        nftMintValue.fee &&
        nftMintValue.fee.belong &&
        nftMintValue.fee.__raw__ &&
        (nftMintValue.image !== undefined || nftMintValue.name !== undefined) &&
        nftMintValue.royaltyPercentage &&
        Number.isInteger(nftMintValue.royaltyPercentage / 1) &&
        nftMintValue.royaltyPercentage >= 0 &&
        nftMintValue.royaltyPercentage <= 10 &&
        LoopringAPI.userAPI &&
        LoopringAPI.nftAPI &&
        !isFeeNotEnough &&
        exchangeInfo &&
        isAvaiableId
      ) {
        setShowNFTMint({ isShow: false });
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTMint_WaitForAuth,
        });
        try {
          const { accountId, accAddress, apiKey } = account;
          const fee = sdk.toBig(nftMintValue.fee.__raw__?.feeRaw ?? 0);
          const feeToken = tokenMap[nftMintValue.fee.belong];
          const storageId = await LoopringAPI.userAPI.getNextStorageId(
            {
              accountId,
              sellTokenId: feeToken.tokenId,
            },
            apiKey
          );
          const req: sdk.NFTMintRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            minterId: accountId,
            minterAddress: accAddress,
            toAccountId: accountId,
            toAddress: accAddress,
            nftType: 0,
            tokenAddress,
            nftId: nftMintValue.nftId,
            amount: nftMintValue.tradeValue.toString(),
            validUntil: getTimestampDaysLater(DAYS),
            storageId: storageId?.offchainId,
            maxFee: {
              tokenId: feeToken.tokenId,
              amount: fee.toString(), // TEST: fee.toString(),
            },
            counterFactualNftInfo: {
              nftOwner: account.accAddress,
              nftFactory: sdk.NFTFactory[chainId],
              nftBaseUri: "",
            },
            royaltyPercentage: Math.floor(nftMintValue.royaltyPercentage) ?? 0,
            forceToMint: false,
          };
          myLog("onNFTMintClick req:", req);

          processRequest(req, isFirstTime);
        } catch (e) {
          sdk.dumpError400(e);
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTMint_Failed,
            error: { code: 400, message: e.message } as sdk.RESULT_INFO,
          });
        }
        return;
      } else {
        result.code = ActionResultCode.DataNotReady;
      }
    },
    [nftMintValue]
  );
  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTMint_WaitForAuth,
      });
      processRequest(lastRequest, !isHardwareRetry);
    },
    [lastRequest, processRequest, setShowAccount]
  );

  const nftMintProps: NFTMintProps<T, I> = React.useMemo(() => {
    return {
      chargeFeeTokenList,
      isFeeNotEnough,
      handleFeeChange,
      feeInfo,
      isNFTCheckLoading,
      isAvaiableId,
      handleOnNFTDataChange,
      onNFTMintClick,
      walletMap: {} as any,
      coinMap: totalCoinMap as any,
      tradeData: nftMintValue as T,
      nftMintBtnStatus: btnStatus,
      btnInfo,
    };
  }, [
    btnInfo,
    btnStatus,
    chargeFeeTokenList,
    feeInfo,
    handleFeeChange,
    handleOnNFTDataChange,
    isAvaiableId,
    isFeeNotEnough,
    isNFTCheckLoading,
    nftMintValue,
    onNFTMintClick,
    totalCoinMap,
  ]);

  return {
    nftMintProps,
    retryBtn,
  };
};
