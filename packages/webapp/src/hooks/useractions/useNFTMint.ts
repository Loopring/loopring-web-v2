import React, { useCallback } from "react";

import {
  AccountStep,
  NFTMintProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  ErrorMap,
  ErrorType,
  TradeNFT,
  myLog,
  UIERROR_CODE,
  WalletMap,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTokenMap } from "stores/token";
import { useAccount } from "stores/account";
import { useBtnStatus } from "hooks/common/useBtnStatus";
import { useModalData } from "stores/router";
import { useOnChainInfo } from "../../stores/localStore/onchainHashInfo";
import { LoopringAPI } from "../../api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import { BigNumber } from "bignumber.js";
import Web3 from "web3";
import { ChainId, NFTType } from "@loopring-web/loopring-sdk";
import { useSystem } from "../../stores/system";
import {
  ActionResult,
  ActionResultCode,
  TOAST_TIME,
} from "../../defs/common_defs";
import { checkErrorInfo } from "./utils";
import { isAccActivated } from "./checkAccStatus";
import { walletLayer2Service } from "../../services/socket";
import { makeWalletLayer2 } from "../help";
import { useWalletInfo } from "../../stores/localStore/walletInfo";

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
  const [lastRequest, setLastRequest] = React.useState<any>({});
  const { checkHWAddr, updateHW } = useWalletInfo();

  const { setShowAccount } = useOpenModals();
  const walletMap = makeWalletLayer2(true).walletMap ?? ({} as WalletMap<T>);
  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();
      if (
        !error &&
        walletMap &&
        nftMintValue &&
        nftMintValue.balance &&
        nftMintValue.tradeValue &&
        sdk
          .toBig(nftMintValue.tradeValue)
          .lte(sdk.toBig(nftMintValue?.balance ?? ""))
      ) {
        if (nftMintValue.isApproved) {
          resetBtnInfo();
        } else {
          myLog(
            "!!---> set labelNFTMintNeedApprove!!!! belong:",
            nftMintValue.tokenAddress
          );
          setLabelAndParams("labelNFTMintNeedApprove", {
            symbol: nftMintValue.name ?? "unknown NFT",
          });
        }
        enableBtn();
      } else {
        myLog("try to disable nftMint btn!");
        disableBtn();
      }
    },
    [
      resetBtnInfo,
      walletMap,
      nftMintValue,
      enableBtn,
      setLabelAndParams,
      disableBtn,
    ]
  );

  React.useEffect(() => {
    updateBtnStatus();
  }, [
    nftMintValue?.tokenAddress,
    nftMintValue?.nftId,
    nftMintValue?.tradeValue,
    nftMintValue?.balance,
  ]);

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

          myLog("submitInternalTransfer:", response);

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
      let _nftId = "",
        balance,
        meta,
        isApproved;
      let shouldUpdate = {};
      const web3: Web3 = connectProvides.usedWeb3 as Web3;
      if (data.nftIdView?.toLowerCase().startsWith("0x")) {
        _nftId = data.nftIdView;
      } else if (data.nftIdView) {
        try {
          _nftId = web3.utils.toHex(sdk.toBN(data.nftIdView));
        } catch (error) {
          const errorView: ErrorType = ErrorMap.NTF_ID_ENCODE_ERROR;
          updateBtnStatus({ errorView, ...error });
          return;
        }
      }

      if (LoopringAPI.nftAPI && exchangeInfo) {
        //step check user have this NFT
        if (
          data.tokenAddress &&
          data.tokenAddress !== nftMintValue.tokenAddress &&
          data.nftIdView &&
          data.nftIdView !== nftMintValue.nftIdView &&
          data.nftType &&
          data.nftType !== nftMintValue.nftType
        ) {
          const _id = new BigNumber(data.nftId ?? "", 16);
          [balance, meta, isApproved] = await Promise.all([
            LoopringAPI.nftAPI.getNFTBalance({
              account: account.accAddress,
              nftId: _nftId,
              nftType: data.nftType as unknown as NFTType,
              web3,
              tokenAddress: data.tokenAddress,
            }),
            LoopringAPI.nftAPI.getContractNFTMeta({
              _id: data.nftIdView,
              nftId: _nftId,
              nftType: data.nftType as unknown as NFTType,
              web3,
              tokenAddress: data.tokenAddress,
            }),
            LoopringAPI.nftAPI.isApprovedForAll({
              web3,
              from: account.accAddress,
              exchangeAddress: exchangeInfo.exchangeAddress,
              tokenAddress: data.tokenAddress,
              nftType: data.nftType as unknown as NFTType,
            }),
          ]);
          shouldUpdate = {
            ...shouldUpdate,
            tokenAddress: data.tokenAddress,
            nftIdView: data.nftIdView,
            nftType: data.nftType,
            name: meta.name ?? "unknown NFT",
            image: meta?.image ?? "",
            balance,
            isApproved,
          };
        }
      } else if (
        data.tokenAddress &&
        data.nftIdView &&
        data.nftType &&
        data.tradeValue
      ) {
        shouldUpdate = {
          tradeValue: data.tradeValue,
        };
      } else if (
        nftMintValue.balance !== 0 &&
        (!data.tokenAddress || !data.nftIdView || !data.nftType)
      ) {
        shouldUpdate = {
          ...shouldUpdate,
          tokenAddress: data.tokenAddress,
          nftIdView: data.nftIdView,
          nftType: data.nftType,
          image: "",
          name: "",
          balance: 0,
          isApproved: undefined,
        };
      }
      updateBtnStatus({});
      updateNFTMintData({
        ...nftMintValue,
        ...shouldUpdate,
      });
    },
    [nftMintValue]
  );

  const onNFTMintClick = useCallback(
    async (nftMintValue, isFirstTime: boolean = true) => {
      let result: ActionResult = { code: ActionResultCode.NoError };
      if (
        account.readyState !== AccountStatus.UN_CONNECT &&
        nftMintValue.tradeValue &&
        nftMintValue.tokenAddress &&
        nftMintValue.nftId &&
        tokenMap &&
        exchangeInfo?.exchangeAddress &&
        connectProvides.usedWeb3 &&
        LoopringAPI.nftAPI
      ) {
        const web3: Web3 = connectProvides.usedWeb3 as Web3;
        const gasLimit = parseInt(NFTGasAmounts.deposit);
        const realGasPrice = gasPrice ?? 30;
        let nonce =
          (await sdk.getNonce(connectProvides.usedWeb3, account.accAddress)) ??
          0;

        setShowAccount({
          isShow: true,
          step: AccountStep.NFTMint_WaitForAuth,
        });
        try {
          const response = await LoopringAPI.nftAPI.depositNFT({
            web3,
            from: account.accAddress,
            exchangeAddress: exchangeInfo?.exchangeAddress,
            tokenAddress: nftMintValue.tokenAddress,
            nftId: nftMintValue.nftId,
            amount: nftMintValue.tradeValue,
            gasPrice: realGasPrice,
            gasLimit,
            chainId: chainId as ChainId,
            nonce,
            nftType: nftMintValue.nftType as unknown as NFTType,
            sendByMetaMask: true,
          });
          myLog("response:", response);
          // updateDepositHash({response.result})
          // result.data = response

          if (response) {
            setShowAccount({ isShow: true, step: AccountStep.NFTMint_Submit });
            updateDepositHash(response.result, account.accAddress, undefined, {
              symbol: nftMintValue.name,
              type: "Deposit NFT",
              value: nftMintValue.tradeValue,
            });
          } else {
            // deposit failed
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTMint_Failed,
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: "No Response",
              },
            });
          }
          resetNFTMintData();
        } catch (reason) {
          sdk.dumpError400(reason);
          result.code = ActionResultCode.DepositFailed;
          result.data = reason;

          //deposit failed
          const err = checkErrorInfo(reason, true);

          myLog(
            "---- deposit NFT ERROR reason:",
            reason?.message.indexOf("User denied transaction")
          );
          myLog(reason);
          myLog("---- deposit err:", err);

          switch (err) {
            case sdk.ConnectorError.USER_DENIED:
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTMint_Denied,
              });
              break;
            default:
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTMint_Failed,
                error: {
                  code: result.code ?? UIERROR_CODE.UNKNOWN,
                  msg: reason?.message,
                },
              });
              resetNFTMintData();
              break;
          }
        }
        return;
      } else {
        result.code = ActionResultCode.DataNotReady;
      }
    },
    []
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
      handleOnNFTDataChange,
      onNFTMintClick,
      walletMap,
      coinMap: totalCoinMap,
      tradeData: nftMintValue as T,
      nftMintBtnStatus: btnStatus,
      btnInfo,
    } as unknown as NFTMintProps<T, I>;
  }, [nftMintValue]);

  return {
    nftMintProps,
    retryBtn,
  };
};
