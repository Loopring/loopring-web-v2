import React from "react";

import {
  AccountStep,
  NFTDepositProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  ErrorMap,
  ErrorType,
  TradeNFT,
  myLog,
  globalSetup,
  UIERROR_CODE,
  WalletMap,
  CoinMap,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTokenMap } from "stores/token";
import { useAccount } from "stores/account";
import { useWalletLayer1 } from "stores/walletLayer1";
import { useBtnStatus } from "hooks/common/useBtnStatus";
import { useModalData } from "stores/router";
import { useOnChainInfo } from "../../stores/localStore/onchainHashInfo";
import { LoopringAPI } from "../../api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import Web3 from "web3";
import { ChainId, NFTType } from "@loopring-web/loopring-sdk";
import { useSystem } from "../../stores/system";
import { ActionResult, ActionResultCode } from "../../defs/common_defs";
import { checkErrorInfo } from "./utils";
import _ from "lodash";

const NFTGasAmounts = {
  deposit: "200000",
};
const DEAULT_NFTID_STRING =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
export const useNFTDeposit = <T extends TradeNFT<I>, I>(): {
  nftDepositProps: NFTDepositProps<T, I>;
} => {
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo, chainId, gasPrice } = useSystem();
  const [isNFTCheckLoading, setIsNFTCheckLoading] = React.useState(false);
  const { nftDepositValue, updateNFTDepositData, resetNFTDepositData } =
    useModalData();
  const { walletLayer1 } = useWalletLayer1();
  const { updateDepositHash } = useOnChainInfo();
  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
  } = useBtnStatus();

  const { setShowAccount, setShowNFTDeposit } = useOpenModals();
  const updateBtnStatus = React.useCallback(
    (error?: ErrorType & any) => {
      resetBtnInfo();
      myLog("updateBtnStatus", nftDepositValue);
      if (
        !error &&
        walletLayer1 &&
        nftDepositValue &&
        nftDepositValue.balance &&
        nftDepositValue.tradeValue &&
        sdk.toBig(nftDepositValue.tradeValue).gt(sdk.toBig(0)) &&
        sdk
          .toBig(nftDepositValue.tradeValue)
          .lte(sdk.toBig(nftDepositValue?.balance ?? ""))
      ) {
        myLog("try to enable nftDeposit btn!");
        enableBtn();
        if (!nftDepositValue.isApproved) {
          myLog(
            "!!---> set labelNFTDepositNeedApprove!!!! belong:",
            nftDepositValue.tokenAddress
          );
          setLabelAndParams("labelNFTDepositNeedApprove", {
            symbol: nftDepositValue.name ?? "unknown NFT",
          });
        }
      } else {
        myLog("try to disable nftDeposit btn!");
        disableBtn();
      }
    },
    [
      resetBtnInfo,
      nftDepositValue,
      walletLayer1,
      enableBtn,
      setLabelAndParams,
      disableBtn,
    ]
  );

  const debounceCheck = _.debounce(
    async (data, _nftId) => {
      if (LoopringAPI.nftAPI && exchangeInfo) {
        const web3: Web3 = connectProvides.usedWeb3 as Web3;
        setIsNFTCheckLoading(true);

        let [balance, meta, isApproved] = await Promise.all([
          LoopringAPI.nftAPI.getNFTBalance({
            account: account.accAddress,
            nftId: _nftId,
            nftType: data.nftType as unknown as NFTType,
            web3,
            tokenAddress: data.tokenAddress,
          }),
          LoopringAPI.nftAPI.getContractNFTMeta({
            _id: _nftId,
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
        ]).finally(() => {
          setIsNFTCheckLoading(() => false);
        });
        myLog("setIsNFTCheckLoading done", balance, meta, isApproved);

        const shouldUpdate = {
          ...data,
          nftId: _nftId,
          name: meta.name ?? "unknown NFT",
          image: meta?.image ?? "",
          description: meta.description ?? "",
          balance: Number(balance.count ?? 0),
          isApproved,
        };
        myLog("debounceCheck", shouldUpdate);
        updateNFTDepositData(shouldUpdate);
      }
    },
    globalSetup.wait,
    { trailing: true }
  );

  const handleOnNFTDataChange = React.useCallback(
    async (data: T) => {
      const web3: Web3 = connectProvides.usedWeb3 as Web3;
      let _nftId = nftDepositValue.nftId;
      let shouldUpdate = {};
      if (
        (data.nftId !== "" && (!data.nftIdView || !data.nftIdView?.trim())) ||
        (data.nftIdView && data.nftIdView.toLowerCase().startsWith("0x"))
      ) {
        _nftId = data.nftIdView ?? "";
      } else if (data.nftIdView) {
        try {
          _nftId = web3.utils
            .toHex(sdk.toBN(data.nftIdView) as any)
            .replace("0x", "");
          const prev = DEAULT_NFTID_STRING.substring(
            0,
            DEAULT_NFTID_STRING.length - _nftId.toString().length
          );
          _nftId = prev + _nftId.toString();
        } catch (error: any) {
          const errorView: ErrorType = ErrorMap.NTF_ID_ENCODE_ERROR;
          updateBtnStatus({ errorView, ...(error as any) });
          return;
        }
      }
      shouldUpdate = {
        nftId: _nftId,
      };

      //step check user have this NFT
      if (
        data.tokenAddress &&
        data.nftIdView &&
        data.nftType !== undefined &&
        _nftId &&
        (data.tokenAddress !== nftDepositValue.tokenAddress ||
          data.nftIdView !== nftDepositValue.nftIdView ||
          data.nftType !== nftDepositValue.nftType)
      ) {
        debounceCheck(data, _nftId);
      } else if (data.tokenAddress && data.nftIdView && data.nftType) {
      } else if (
        nftDepositValue.balance !== 0 &&
        (!data.tokenAddress || !data.nftIdView || data.nftType === undefined)
      ) {
        shouldUpdate = {
          ...shouldUpdate,
          description: "",
          image: "",
          name: "",
          balance: 0,
          isApproved: undefined,
        };
      }

      if (data.hasOwnProperty("tradeValue")) {
        shouldUpdate = {
          ...shouldUpdate,
          tradeValue: data.tradeValue,
        };
      }

      if (data.hasOwnProperty("tokenAddress")) {
        shouldUpdate = {
          ...shouldUpdate,
          tokenAddress: data.tokenAddress,
        };
      }
      if (data.hasOwnProperty("nftIdView")) {
        shouldUpdate = {
          ...shouldUpdate,
          nftIdView: data.nftIdView,
        };
      }
      if (data.hasOwnProperty("nftType")) {
        shouldUpdate = {
          ...shouldUpdate,
          nftType: data.nftType,
        };
      } else {
        shouldUpdate = {
          ...shouldUpdate,
          nftType: nftDepositValue.nftType ?? 0,
        };
      }
      // updateBtnStatus({});
      myLog("updateNFTDepositData", {
        ...nftDepositValue,
        ...shouldUpdate,
      });
      updateNFTDepositData({
        ...nftDepositValue,
        ...shouldUpdate,
      });
    },
    [debounceCheck, nftDepositValue, updateBtnStatus, updateNFTDepositData]
  );

  const onNFTDepositClick = React.useCallback(async () => {
    let result: ActionResult = { code: ActionResultCode.NoError };
    if (
      account.readyState !== AccountStatus.UN_CONNECT &&
      nftDepositValue.tradeValue &&
      nftDepositValue.tokenAddress &&
      nftDepositValue.nftId &&
      tokenMap &&
      exchangeInfo?.exchangeAddress &&
      connectProvides.usedWeb3 &&
      LoopringAPI.nftAPI
    ) {
      setShowNFTDeposit({ isShow: false });
      const web3: Web3 = connectProvides.usedWeb3 as Web3;
      const gasLimit = undefined; //parseInt(NFTGasAmounts.deposit) ?? undefined;
      const realGasPrice = gasPrice ?? 30;
      let nonce =
        (await sdk.getNonce(connectProvides.usedWeb3, account.accAddress)) ?? 0;
      if (!nftDepositValue.isApproved) {
        setShowAccount({
          isShow: true,
          step: AccountStep.NFTDeposit_Approve_WaitForAuth,
        });
        try {
          await LoopringAPI.nftAPI.approveNFT({
            web3,
            from: account.accAddress,
            depositAddress: exchangeInfo?.exchangeAddress,
            tokenAddress: nftDepositValue.tokenAddress,
            tokenId: nftDepositValue.nftId,
            gasPrice: realGasPrice,
            gasLimit,
            chainId: chainId as ChainId,
            nonce,
            nftType: nftDepositValue.nftType as unknown as NFTType,
            sendByMetaMask: true,
          });
        } catch (reason: any) {
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTDeposit_Approve_Denied,
          });
          return;
        }
        nonce += 1;
      } else {
        myLog("NFT is Approved ALL at History");
      }
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTDeposit_WaitForAuth,
      });
      try {
        const response = await LoopringAPI.nftAPI.depositNFT({
          web3,
          from: account.accAddress,
          exchangeAddress: exchangeInfo?.exchangeAddress,
          tokenAddress: nftDepositValue.tokenAddress,
          nftId: nftDepositValue.nftId,
          amount: nftDepositValue.tradeValue,
          gasPrice: realGasPrice,
          gasLimit,
          chainId: chainId as ChainId,
          nonce,
          nftType: nftDepositValue.nftType as unknown as NFTType,
          sendByMetaMask: true,
        });
        myLog("response:", response);
        // updateDepositHash({response.result})
        // result.data = response

        if (response) {
          setShowAccount({ isShow: true, step: AccountStep.NFTDeposit_Submit });
          updateDepositHash(response.result, account.accAddress, undefined, {
            symbol: nftDepositValue.name,
            type: "Deposit NFT",
            value: nftDepositValue.tradeValue,
          });
        } else {
          // deposit failed
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTDeposit_Failed,
            error: {
              code: UIERROR_CODE.UNKNOWN,
              msg: "No Response",
            },
          });
        }
        resetNFTDepositData();
      } catch (reason: any) {
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
              step: AccountStep.NFTDeposit_Denied,
            });
            break;
          default:
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTDeposit_Failed,
              error: {
                code: result.code ?? UIERROR_CODE.UNKNOWN,
                msg: reason?.message,
              },
            });
            resetNFTDepositData();
            break;
        }
      }
      return;
    } else {
      result.code = ActionResultCode.DataNotReady;
    }
  }, [
    account.accAddress,
    account.readyState,
    chainId,
    exchangeInfo?.exchangeAddress,
    gasPrice,
    nftDepositValue.isApproved,
    nftDepositValue.name,
    nftDepositValue.nftId,
    nftDepositValue.nftType,
    nftDepositValue.tokenAddress,
    nftDepositValue.tradeValue,
    resetNFTDepositData,
    setShowAccount,
    setShowNFTDeposit,
    tokenMap,
    updateDepositHash,
  ]);

  const nftDepositProps: NFTDepositProps<T, I> = {
    handleOnNFTDataChange,
    onNFTDepositClick,
    walletMap: walletLayer1 as WalletMap<any>,
    coinMap: totalCoinMap as CoinMap<any>,
    tradeData: nftDepositValue as T,
    nftDepositBtnStatus: btnStatus,
    isNFTCheckLoading,
    btnInfo,
  };

  React.useEffect(() => {
    updateBtnStatus();
  }, [
    nftDepositValue?.tokenAddress,
    nftDepositValue?.nftId,
    nftDepositValue?.nftType,
    nftDepositValue?.tradeValue,
    nftDepositValue?.balance,
  ]);
  return {
    nftDepositProps,
  };
};
