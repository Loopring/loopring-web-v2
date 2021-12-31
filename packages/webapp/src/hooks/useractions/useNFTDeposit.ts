import React, { useCallback } from "react";

import {
  AccountStep,
  DepositProps,
  SwitchData,
  useOpenModals,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  CoinMap,
  IBData,
  myLog,
  NFTWholeINFO,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTokenMap } from "stores/token";
import { useAccount } from "stores/account";
import { useSystem } from "stores/system";
import { connectProvides } from "@loopring-web/web3-provider";
import { LoopringAPI } from "api_wrapper";
import { useTranslation } from "react-i18next";
import { ActionResult, ActionResultCode, AddressError } from "defs/common_defs";
import { checkErrorInfo } from "./utils";
import { useBtnStatus } from "hooks/common/useBtnStatus";
import { useAllowances } from "hooks/common/useAllowances";
import { useModalData } from "stores/router";
import { checkAddr } from "utils/web3_tools";
import { isPosIntNum } from "utils/formatter_tool";
import { useOnChainInfo } from "../../stores/localStore/onchainHashInfo";

export const useNFTDeposit = <
  R extends IBData<T> & Partial<NFTWholeINFO>,
  T
>(): {
  nftDepositProps: DepositProps<R, T>;
} => {
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo, chainId, gasPrice } = useSystem();

  const { nftDepositValue, updateNFTDepositData, resetNFTDepositData } =
    useModalData();

  const {
    modals: {
      isShowNFTDeposit: { nftData, nftBalance, isShow, ...nftRest },
    },
  } = useOpenModals();

  // const { walletLayer1 } = useWalletLayer1()
  const { setShowNFTDeposit, setShowAccount } = useOpenModals();
  const { updateDepositHash } = useOnChainInfo();
  const { t } = useTranslation("common");

  const {
    btnStatus,
    btnInfo,
    enableBtn,
    disableBtn,
    setLabelAndParams,
    resetBtnInfo,
  } = useBtnStatus();

  const { allowanceInfo } = useAllowances({
    owner: account.accAddress,
    symbol: nftDepositValue.belong as string,
  });

  const updateBtnStatus = React.useCallback(() => {
    // myLog('!! updateBtnStatus .... nftDepositValue:', nftDepositValue, allowanceInfo?.tokenInfo)

    resetBtnInfo();

    if (
      nftDepositValue.belong === allowanceInfo?.tokenInfo.symbol &&
      nftDepositValue?.tradeValue &&
      allowanceInfo &&
      sdk
        .toBig(nftDepositValue?.tradeValue)
        .lte(sdk.toBig(nftDepositValue?.balance ?? ""))
    ) {
      const curValInWei = sdk
        .toBig(nftDepositValue?.tradeValue)
        .times("1e" + allowanceInfo?.tokenInfo.decimals);
      if (allowanceInfo.needCheck && curValInWei.gt(allowanceInfo.allowance)) {
        myLog(
          "!!---> set labelDepositNeedApprove!!!! belong:",
          nftDepositValue.belong
        );
        setLabelAndParams("labelDepositNeedApprove", {
          symbol: nftDepositValue.belong as string,
        });
      }
      enableBtn();
    } else {
      myLog("try to disable deposit btn!");
      disableBtn();
    }
  }, [
    enableBtn,
    disableBtn,
    setLabelAndParams,
    nftDepositValue,
    allowanceInfo,
  ]);

  React.useEffect(() => {
    updateBtnStatus();
  }, [
    nftDepositValue?.belong,
    nftDepositValue?.tradeValue,
    nftDepositValue?.balance,
    allowanceInfo?.tokenInfo.symbol,
  ]);

  const walletLayer1Callback = React.useCallback(() => {
    if (nftData) {
      updateNFTDepositData({
        belong: nftData as any,
        balance: nftBalance,
        tradeValue: undefined,
        ...nftRest,
      });
    } else {
      setShowNFTDeposit({ isShow: false });
    }
  }, [nftData, nftBalance, updateNFTDepositData, nftDepositValue]);

  React.useEffect(() => {
    // myLog('isShow:', isShow)
    if (isShow) {
      walletLayer1Callback();
    }
  }, [isShow]);

  const setReffer = React.useCallback(
    async (inputValue: any) => {
      let reffer: any = inputValue?.reffer;

      myLog(
        "setReffer type reffer:",
        typeof reffer,
        reffer,
        Number.isInteger(reffer)
      );

      if (
        LoopringAPI.userAPI &&
        LoopringAPI.exchangeAPI &&
        exchangeInfo?.exchangeAddress
      ) {
        if (reffer === undefined || (reffer as string).trim() === "") {
          return;
        }

        let refferId = 0;

        if (typeof reffer === "string") {
          reffer = reffer.trim();
          if (isPosIntNum(reffer)) {
            refferId = parseInt(reffer);
            myLog("got isPosIntNum");
          } else {
            try {
              const { realAddr, addressErr } = await checkAddr(
                reffer,
                connectProvides.usedWeb3
              );
              if (addressErr !== AddressError.NoError) {
                return;
              }
              const realRefferAddr = realAddr ? realAddr : reffer;
              const { accInfo, error } =
                await LoopringAPI.exchangeAPI.getAccount({
                  owner: realRefferAddr,
                });

              if (error || !accInfo?.accountId) {
                return;
              }

              refferId = accInfo?.accountId;
            } catch (reason) {
              sdk.dumpError400(reason);
            }
          }
        } else if (typeof reffer === "number") {
          refferId = reffer;
        }

        if (refferId) {
          try {
            myLog("setReffer generateKeyPair!!! refferId:", refferId);

            const eddsaKey = await sdk.generateKeyPair({
              web3: connectProvides.usedWeb3,
              address: account.accAddress,
              chainId: chainId as any,
              exchangeAddress: exchangeInfo.exchangeAddress,
              keyNonce: 0,
              walletType: account.connectName as sdk.ConnectorNames,
            });
            const request: sdk.SetReferrerRequest = {
              address: account.accAddress,
              referrer: refferId,
              publicKeyX: eddsaKey.formatedPx,
              publicKeyY: eddsaKey.formatedPy,
            };

            const response = await LoopringAPI.userAPI.SetReferrer(
              request,
              eddsaKey.sk
            );

            myLog(response);
          } catch (reason) {
            sdk.dumpError400(reason);
          }
        }
      }
    },
    [exchangeInfo, account]
  );

  const handleDeposit = React.useCallback(
    async (inputValue: any) => {
      myLog("handleDeposit:", inputValue);

      await setReffer(inputValue);

      const { readyState, connectName } = account;

      console.log(LoopringAPI.exchangeAPI, connectProvides.usedWeb3);

      let result: ActionResult = { code: ActionResultCode.NoError };

      if (
        readyState !== AccountStatus.UN_CONNECT &&
        inputValue.tradeValue &&
        tokenMap &&
        exchangeInfo?.exchangeAddress &&
        connectProvides.usedWeb3 &&
        LoopringAPI.exchangeAPI
      ) {
        try {
          const tokenInfo = tokenMap[inputValue.belong];
          const gasLimit = parseInt(tokenInfo.gasAmounts.deposit);

          const fee = 0;

          // const isMetaMask = connectName === ConnectProviders.MetaMask
          //    || connectName === ConnectProviders.WalletConnect

          const isMetaMask = true;

          const realGasPrice = gasPrice ?? 30;

          const _chainId =
            chainId === "unknown" ? sdk.ChainId.MAINNET : chainId;

          let nonce = 0;

          let nonceInit = false;

          if (allowanceInfo?.needCheck) {
            const curValInWei = sdk
              .toBig(inputValue.tradeValue)
              .times("1e" + tokenInfo.decimals);

            if (curValInWei.gt(allowanceInfo.allowance)) {
              myLog(curValInWei, allowanceInfo.allowance, " need approveMax!");

              setShowAccount({
                isShow: true,
                step: AccountStep.Deposit_Approve_WaitForAuth,
              });

              nonce = await sdk.getNonce(
                connectProvides.usedWeb3,
                account.accAddress
              );

              nonceInit = true;

              try {
                await sdk.approveMax(
                  connectProvides.usedWeb3,
                  account.accAddress,
                  tokenInfo.address,
                  exchangeInfo?.depositAddress,
                  realGasPrice,
                  gasLimit,
                  _chainId,
                  nonce,
                  isMetaMask
                );
                nonce += 1;
              } catch (reason) {
                result.code = ActionResultCode.ApproveFailed;
                result.data = reason;

                setShowAccount({
                  isShow: true,
                  step: AccountStep.Deposit_Approve_Denied,
                });
                return;
              }
            } else {
              myLog("allowance is enough! don't need approveMax!");
            }
          }

          setShowAccount({
            isShow: true,
            step: AccountStep.Deposit_WaitForAuth,
          });

          if (!nonceInit) {
            nonce = await sdk.getNonce(
              connectProvides.usedWeb3,
              account.accAddress
            );
          }

          myLog("before deposit:", chainId, connectName, isMetaMask);

          const realChainId = chainId === "unknown" ? 1 : chainId;

          const response = await sdk.deposit(
            connectProvides.usedWeb3,
            account.accAddress,
            exchangeInfo.exchangeAddress,
            tokenInfo,
            inputValue.tradeValue,
            fee,
            realGasPrice,
            gasLimit,
            realChainId,
            nonce,
            isMetaMask
          );

          myLog("response:", response);
          // updateDepositHash({response.result})
          // result.data = response

          if (response) {
            setShowAccount({ isShow: true, step: AccountStep.Deposit_Submit });
            updateDepositHash(response.result, account.accAddress, undefined, {
              symbol: tokenInfo.symbol,
              type: "Deposit",
              value: inputValue.tradeValue,
            });
          } else {
            // deposit failed
            setShowAccount({ isShow: true, step: AccountStep.Deposit_Failed });
          }

          resetNFTDepositData();
        } catch (reason: any) {
          sdk.dumpError400(reason);
          result.code = ActionResultCode.DepositFailed;
          result.data = reason;

          //deposit failed
          const err = checkErrorInfo(reason, true);

          myLog(
            "---- deposit reason:",
            reason?.message.indexOf("User denied transaction")
          );
          myLog(reason);
          myLog("---- deposit err:", err);

          switch (err) {
            case sdk.ConnectorError.USER_DENIED:
              setShowAccount({
                isShow: true,
                step: AccountStep.Deposit_Denied,
              });
              break;
            default:
              setShowAccount({
                isShow: true,
                step: AccountStep.Deposit_Failed,
              });
              resetNFTDepositData();
              break;
          }
        }
      } else {
        result.code = ActionResultCode.DataNotReady;
      }

      return result;
    },
    [
      account,
      tokenMap,
      chainId,
      exchangeInfo,
      gasPrice,
      LoopringAPI.exchangeAPI,
      setShowAccount,
    ]
  );

  const onDepositClick = useCallback(
    async (nftDepositValue) => {
      myLog("onDepositClick nftDepositValue:", nftDepositValue);
      setShowNFTDeposit({ isShow: false });

      if (nftDepositValue && nftDepositValue.belong) {
        await handleDeposit(nftDepositValue as R);
      }
    },
    [nftDepositValue, handleDeposit, setShowNFTDeposit, setShowAccount]
  );

  const handlePanelEvent = useCallback(
    async (data: SwitchData<any>, switchType: "Tomenu" | "Tobutton") => {
      return new Promise<void>((res: any) => {
        if (data.to === "button") {
          // if (walletLayer1 && data?.tradeData?.belong) {
          //     const walletInfo = walletLayer1[data?.tradeData?.belong]
          // myLog('got!!!! data:', data.to, data.tradeData, walletInfo)
          //TODO: getLayer1 NFT Token
          updateNFTDepositData({
            belong: data.tradeData?.belong,
            tradeValue: data.tradeData?.tradeValue,
            balance: 0,
            reffer: "*",
          });
          // } else {
          //     updateDepositData({ belong: undefined, tradeValue: 0, balance: 0 })
          // }
        }
        res();
      });
    },
    [updateNFTDepositData]
  );

  const handleAddressError = useCallback(
    (
      value: string
    ):
      | { error: boolean; message?: string | React.ElementType<HTMLElement> }
      | undefined => {
      myLog("handleAddressError:", value);
      updateNFTDepositData({ reffer: value, tradeValue: -1, balance: -1 });
      return undefined;
    },
    []
  );

  const nftDepositProps: DepositProps<R, T> = React.useMemo(() => {
    const isNewAccount = account.readyState === AccountStatus.NO_ACCOUNT;
    const title =
      account.readyState === AccountStatus.NO_ACCOUNT
        ? t("labelCreateLayer2Title")
        : t("depositTitle");
    return {
      btnInfo,
      isNewAccount,
      title,
      tradeData: nftDepositValue as any,
      coinMap: totalCoinMap as CoinMap<any>,
      walletMap: {},
      depositBtnStatus: btnStatus,
      handlePanelEvent,
      handleAddressError,
      onDepositClick,
    };
  }, [account.readyState, btnInfo, totalCoinMap, onDepositClick]);

  return {
    nftDepositProps,
  };
};
