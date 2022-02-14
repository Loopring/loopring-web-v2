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
  WalletMap,
  EmptyValueTag,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTokenMap } from "stores/token";
import { useAccount } from "stores/account";
import { useBtnStatus } from "hooks/common/useBtnStatus";
import { useModalData } from "stores/router";
import { useOnChainInfo } from "../../stores/localStore/onchainHashInfo";
import { LoopringAPI } from "../../api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import Web3 from "web3";
import { ChainId, NFTType } from "@loopring-web/loopring-sdk";
import { useSystem } from "../../stores/system";
import {
  ActionResult,
  ActionResultCode,
  DAYS,
  TOAST_TIME,
} from "../../defs/common_defs";
import { checkErrorInfo } from "./utils";
import { isAccActivated } from "./checkAccStatus";
import { walletLayer2Service } from "../../services/socket";
import { makeWalletLayer2 } from "../help";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import { useChargeFees } from "../common/useChargeFees";
import { useTranslation } from "react-i18next";
import { getTimestampDaysLater } from "../../utils/dt_tools";
const NFTGasAmounts = {
  deposit: "200000",
};
export const useNFTMint = <T extends TradeNFT<I>, I>() => {
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo, chainId, gasPrice } = useSystem();
  const { nftMintValue, updateNFTMintData, resetNFTMintData } = useModalData();
  const { updateDepositHash } = useOnChainInfo();
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

  const [isAvaiableId, setIsAvaiableId] = React.useState(false);
  const [isNFTCheckLoading, setIsNFTCheckLoading] = React.useState(false);
  const { setShowAccount, setShowNFTMint } = useOpenModals();
  const walletMap = makeWalletLayer2(true).walletMap ?? ({} as WalletMap<T>);
  const tokenAddress =
    LoopringAPI.nftAPI?.computeNFTAddress({
      nftOwner: account.accAddress,
    }).tokenAddress || "";
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  } = useChargeFees({
    tokenAddress: tokenAddress,
    requestType: sdk.OffchainNFTFeeReqType.NFT_MINT,
    updateData: (feeInfo, _chargeFeeList) => {
      updateNFTMintData({
        ...nftMintValue,
        fee: feeInfo,
      });
    },
  });
  myLog("isAvaiableId", isAvaiableId, btnStatus);
  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();
      myLog(!error, nftMintValue, !isFeeNotEnough, isAvaiableId);
      if (
        !error &&
        walletMap &&
        nftMintValue &&
        tokenAddress &&
        nftMintValue.tradeValue &&
        Number(nftMintValue.tradeValue) > 0 &&
        nftMintValue.fee &&
        nftMintValue.fee.belong &&
        nftMintValue.fee.__raw__ &&
        !isFeeNotEnough &&
        isAvaiableId
      ) {
        enableBtn();
        return;
      }
      // else {
      disableBtn();
      myLog("try to disable nftMint btn!");

      // }
    },
    [
      isAvaiableId,
      isFeeNotEnough,
      resetBtnInfo,
      walletMap,
      nftMintValue,
      tokenAddress,
      enableBtn,
      setLabelAndParams,
      disableBtn,
    ]
  );

  React.useEffect(() => {
    updateBtnStatus();
  }, [isFeeNotEnough, isAvaiableId, nftMintValue, feeInfo]);

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
                step: AccountStep.NFTMint_Submit,
              });
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }
              walletLayer2Service.sendUserUpdate();

              resetNFTMintData();
              // checkFeeIsEnough();
            }
          } else {
            resetNFTMintData();
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
    [account, checkHWAddr, chainId, setShowAccount, resetNFTMintData, updateHW]
  );

  const handleOnNFTDataChange = useCallback(
    async (data: T) => {
      let shouldUpdate = {};

      if (data.nftIdView && LoopringAPI.nftAPI) {
        setIsNFTCheckLoading(true);
        let nftId: string = "";
        try {
          nftId = LoopringAPI.nftAPI.ipfsCid0ToNftID(data.nftIdView);
          shouldUpdate = {
            nftId,
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
          const value: {
            image: string;
            name: string;
            description: string;
          } = await fetch(
            sdk.LOOPRING_URLs.IPFS_META_URL + `${data.nftIdView}`
          ).then((response) => response.json());
          shouldUpdate = {
            nftId: nftId,
            name: value.name ?? t("labelUnknown"),
            image: value.image,
            description: value.description ?? EmptyValueTag,
            ...shouldUpdate,
          };
        }
      } else if (!data.nftIdView) {
        shouldUpdate = {
          nftId: "",
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
        nftMintValue.nftId &&
        nftMintValue.fee &&
        nftMintValue.fee.belong &&
        nftMintValue.fee.__raw__ &&
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
  // const resetDefault = React.useCallback(() => {
  //   checkFeeIsEnough();
  //   updateNFTMintData({
  //     fee: feeInfo,
  //     tokenAddress: "",
  //     nftIdView: "",
  //     nftType: NFTType.ERC1155.toString(),
  //     image: "",
  //     name: "",
  //     balance: 0,
  //   });
  // }, [walletMap, updateNFTMintData, feeInfo]);

  const nftMintProps: NFTMintProps<T, I> = {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    isNFTCheckLoading,
    isAvaiableId,
    handleOnNFTDataChange,
    onNFTMintClick,
    walletMap: walletMap as any,
    coinMap: totalCoinMap as any,
    tradeData: nftMintValue as T,
    nftMintBtnStatus: btnStatus,
    btnInfo,
  };

  return {
    nftMintProps,
    retryBtn,
  };
};
