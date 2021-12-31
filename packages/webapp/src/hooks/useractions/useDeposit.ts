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
  WalletMap,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";
import { useTokenMap } from "stores/token";
import { useAccount } from "stores/account";
import { useSystem } from "stores/system";
import { connectProvides } from "@loopring-web/web3-provider";
import { LoopringAPI } from "api_wrapper";
import { useWalletLayer1 } from "stores/walletLayer1";
import { useTranslation } from "react-i18next";
import { ActionResult, ActionResultCode, AddressError } from "defs/common_defs";
import { checkErrorInfo } from "./utils";
import { useBtnStatus } from "hooks/common/useBtnStatus";
import { useAllowances } from "hooks/common/useAllowances";
import { useModalData } from "stores/router";
import { checkAddr } from "utils/web3_tools";
import { isPosIntNum } from "utils/formatter_tool";
import { useOnChainInfo } from "../../stores/localStore/onchainHashInfo";

export const useDeposit = <R extends IBData<T>, T>(): {
  depositProps: DepositProps<R, T>;
} => {
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo, chainId, gasPrice, allowTrade } = useSystem();

  const { depositValue, updateDepositData, resetDepositData } = useModalData();

  const {
    modals: {
      isShowDeposit: { symbol, isShow },
    },
  } = useOpenModals();

  const { walletLayer1 } = useWalletLayer1();
  const { setShowDeposit, setShowAccount } = useOpenModals();
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
    symbol: depositValue.belong as string,
  });

  const updateBtnStatus = React.useCallback(() => {
    // myLog('!! updateBtnStatus .... depositValue:', depositValue, allowanceInfo?.tokenInfo)

    resetBtnInfo();

    if (
      depositValue.belong === allowanceInfo?.tokenInfo.symbol &&
      depositValue?.tradeValue &&
      allowanceInfo &&
      sdk
        .toBig(depositValue?.tradeValue)
        .lte(sdk.toBig(depositValue?.balance ?? ""))
    ) {
      const curValInWei = sdk
        .toBig(depositValue?.tradeValue)
        .times("1e" + allowanceInfo?.tokenInfo.decimals);
      if (allowanceInfo.needCheck && curValInWei.gt(allowanceInfo.allowance)) {
        myLog(
          "!!---> set labelDepositNeedApprove!!!! belong:",
          depositValue.belong
        );
        setLabelAndParams("labelDepositNeedApprove", {
          symbol: depositValue.belong as string,
        });
      }
      enableBtn();
    } else {
      myLog("try to disable deposit btn!");
      disableBtn();
    }
  }, [enableBtn, disableBtn, setLabelAndParams, depositValue, allowanceInfo]);

  React.useEffect(() => {
    updateBtnStatus();
  }, [
    depositValue?.belong,
    depositValue?.tradeValue,
    depositValue?.balance,
    allowanceInfo?.tokenInfo.symbol,
  ]);

  const walletLayer1Callback = React.useCallback(() => {
    if (symbol && walletLayer1) {
      updateDepositData({
        belong: symbol as any,
        balance: walletLayer1[symbol]?.count,
        tradeValue: undefined,
      });
    } else {
      if (!depositValue.belong && walletLayer1) {
        const keys = Reflect.ownKeys(walletLayer1);
        for (var key in keys) {
          const keyVal = keys[key] as any;
          const walletInfo = walletLayer1[keyVal];
          if (sdk.toBig(walletInfo.count).gt(0)) {
            updateDepositData({
              belong: keyVal as any,
              tradeValue: 0,
              balance: walletInfo.count,
            });

            return;
          }
        }
      }
    }
  }, [walletLayer1, symbol, updateDepositData, depositValue]);

  React.useEffect(() => {
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
              chainId: chainId as any,
              address: account.accAddress,
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

      // console.log(LoopringAPI.exchangeAPI, connectProvides.usedWeb3)

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

          resetDepositData();
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
              resetDepositData();
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
    async (depositValue) => {
      myLog("onDepositClick depositValue:", depositValue);
      setShowDeposit({ isShow: false });

      if (depositValue && depositValue.belong) {
        await handleDeposit(depositValue as R);
      }
    },
    [depositValue, handleDeposit, setShowDeposit, setShowAccount]
  );

  const handlePanelEvent = useCallback(
    async (data: SwitchData<any>, switchType: "Tomenu" | "Tobutton") => {
      return new Promise<void>((res: any) => {
        if (data.to === "button") {
          if (walletLayer1 && data?.tradeData?.belong) {
            const walletInfo = walletLayer1[data?.tradeData?.belong];
            // myLog('got!!!! data:', data.to, data.tradeData, walletInfo)
            updateDepositData({
              belong: data.tradeData?.belong,
              tradeValue: data.tradeData?.tradeValue,
              balance: walletInfo.count,
              reffer: "*",
            });
          } else {
            updateDepositData({ belong: undefined, tradeValue: 0, balance: 0 });
          }
        }
        res();
      });
    },
    [walletLayer1, updateDepositData]
  );

  const handleAddressError = useCallback(
    (
      value: string
    ):
      | { error: boolean; message?: string | React.ElementType<HTMLElement> }
      | undefined => {
      myLog("handleAddressError:", value);
      updateDepositData({ reffer: value, tradeValue: -1, balance: -1 });
      return undefined;
    },
    []
  );

  const depositProps = React.useMemo(() => {
    const isNewAccount = account.readyState === AccountStatus.NO_ACCOUNT;
    const title =
      account.readyState === AccountStatus.NO_ACCOUNT
        ? t("labelCreateLayer2Title")
        : t("depositTitle");
    return {
      btnInfo,
      isNewAccount,
      title,
      allowTrade,
      defaultAddress: account?.accAddress,
      tradeData: depositValue as any,
      coinMap: totalCoinMap as CoinMap<any>,
      walletMap: walletLayer1 as WalletMap<any>,
      depositBtnStatus: btnStatus,
      handlePanelEvent,
      handleAddressError,
      onDepositClick,
    };
  }, [
    account.readyState,
    btnInfo,
    totalCoinMap,
    walletLayer1,
    onDepositClick,
    account.accAddress,
    allowTrade,
  ]);

  return {
    depositProps,
  };
};
