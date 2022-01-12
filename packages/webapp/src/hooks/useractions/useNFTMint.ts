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
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTokenMap } from "stores/token";
import { useAccount } from "stores/account";
import { useWalletLayer1 } from "stores/walletLayer1";
import { useTranslation } from "react-i18next";
import { useBtnStatus } from "hooks/common/useBtnStatus";
import { useModalData } from "stores/router";
import { useOnChainInfo } from "../../stores/localStore/onchainHashInfo";
import { LoopringAPI } from "../../api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import { BigNumber } from "bignumber.js";
import Web3 from "web3";
import { toBN } from "@loopring-web/loopring-sdk/dist/utils/formatter";
import { ChainId, NFTType } from "@loopring-web/loopring-sdk";
import { useSystem } from "../../stores/system";
import { ActionResult, ActionResultCode } from "../../defs/common_defs";
import { checkErrorInfo } from "./utils";

const NFTGasAmounts = {
  deposit: "200000",
};
export const useNFTMint = <T extends TradeNFT<I>, I>(): {
  nftMintProps: NFTMintProps<T, I>;
} => {
  // const [tradeData,setTradeData] = React.useState<Partial<T>>({})
  const { t } = useTranslation("common");
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo, chainId, gasPrice, allowTrade } = useSystem();
  const { nftMintValue, updateNFTMintData, resetNFTMintData } = useModalData();
  const {
    modals: {
      isShowNFTMint: { isShow },
    },
  } = useOpenModals();
  const { walletLayer1, updateWalletLayer1 } = useWalletLayer1();
  const { setShowNFTMint } = useOpenModals();
  const { updateDepositHash } = useOnChainInfo();
  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
  } = useBtnStatus();

  const { setShowAccount } = useOpenModals();

  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();
      if (
        !error &&
        walletLayer1 &&
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
    [enableBtn, disableBtn, setLabelAndParams, nftMintValue]
  );

  React.useEffect(() => {
    updateBtnStatus();
  }, [
    nftMintValue?.tokenAddress,
    nftMintValue?.nftId,
    nftMintValue?.tradeValue,
    nftMintValue?.balance,
  ]);

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

  const onNFTMintClick = useCallback(async (nftMintValue) => {
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
        (await sdk.getNonce(connectProvides.usedWeb3, account.accAddress)) ?? 0;

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
          setShowAccount({ isShow: true, step: AccountStep.Deposit_Failed });
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
            });
            resetNFTMintData();
            break;
        }
      }
      return;
    } else {
      result.code = ActionResultCode.DataNotReady;
    }
  }, []);

  const nftMintProps: NFTMintProps<T, I> = React.useMemo(() => {
    return {
      handleOnNFTDataChange,
      onNFTMintClick,
      walletMap: walletLayer1,
      coinMap: totalCoinMap,
      tradeData: nftMintValue as T,
      nftMintBtnStatus: btnStatus,
      btnInfo,
    } as unknown as NFTMintProps<T, I>;
  }, [nftMintValue]);

  return {
    nftMintProps,
  };
};
