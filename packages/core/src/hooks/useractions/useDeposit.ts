import React from "react";

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
  UIERROR_CODE,
  WalletMap,
} from "@loopring-web/common-resources";
import { connectProvides } from "@loopring-web/web3-provider";

import * as sdk from "@loopring-web/loopring-sdk";
import {
  checkErrorInfo,
  useAddressCheck,
  useAllowances,
  useBtnStatus,
  useModalData,
  useTokenMap,
  useAccount,
  useSystem,
  ActionResult,
  ActionResultCode,
  AddressError,
  BIGO,
  LoopringAPI,
  store,
  useWalletLayer1,
} from "../../index";
import { useTranslation } from "react-i18next";
import { useOnChainInfo } from "../../stores/localStore/onchainHashInfo";

export const useDeposit = <
  T extends {
    referAddress?: string;
    toAddress?: string;
    addressError?: { error: boolean; message?: string };
  } & IBData<I>,
  I
>(
  isAllowInputToAddress = false,
  opts?: { token: string | null; owner?: string | null }
) => {
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account } = useAccount();
  const [isToAddressEditable, setIsToAddressEditable] = React.useState(false);
  const { exchangeInfo, chainId, gasPrice, allowTrade } = useSystem();

  const {
    // address: toAddress,
    realAddr: realToAddress,
    setAddress: setToAddress,
    addrStatus: toAddressStatus,
    isLoopringAddress: toIsLoopringAddress,
    isAddressCheckLoading: toIsAddressCheckLoading,
  } = useAddressCheck();
  const {
    // address: referAddress,
    realAddr: realReferAddress,
    setAddress: setReferAddress,
    addrStatus: referStatus,
    isLoopringAddress: referIsLoopringAddress,
    isAddressCheckLoading: referIsAddressCheckLoading,
  } = useAddressCheck();

  const {
    depositValue,
    updateDepositData,
    resetDepositData,
    activeAccountValue: { chargeFeeList },
  } = useModalData();
  const {
    modals: {
      isShowDeposit: { symbol, isShow },
    },
    setShowDeposit,
    setShowAccount,
  } = useOpenModals();

  const { walletLayer1 } = useWalletLayer1();

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
  const isNewAccount = [
    AccountStatus.NO_ACCOUNT,
    AccountStatus.NOT_ACTIVE,
  ].includes(account.readyState as any);
  const updateBtnStatus = React.useCallback(() => {
    resetBtnInfo();
    myLog(
      isAllowInputToAddress,
      toIsLoopringAddress,
      realToAddress,
      toAddressStatus
    );
    if (
      (!isAllowInputToAddress ||
        (toIsLoopringAddress &&
          !!depositValue.toAddress &&
          depositValue.toAddress.trim() !== "" &&
          (toAddressStatus as AddressError) === AddressError.NoError)) &&
      depositValue.belong === allowanceInfo?.tokenInfo.symbol &&
      depositValue?.tradeValue &&
      allowanceInfo &&
      sdk.toBig(walletLayer1?.ETH.count ?? 0).gt(BIGO) &&
      sdk.toBig(depositValue?.tradeValue).gt(BIGO) &&
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

      // NewAccountCheck
      const index =
        chargeFeeList?.findIndex(
          ({ belong }) => belong === depositValue.belong
        ) ?? -1;
      if (
        isAllowInputToAddress ||
        (isNewAccount && index !== -1) ||
        !isNewAccount
      ) {
        enableBtn();
        return;
      }
    }
    myLog("try to disable deposit btn!");
    if (sdk.toBig(walletLayer1?.ETH.count ?? 0).eq(BIGO)) {
      setLabelAndParams("labelNOETH", {});
    }
    if (
      !(
        !isAllowInputToAddress ||
        (isAllowInputToAddress && toIsLoopringAddress)
      )
    ) {
      setLabelAndParams("labelToAddressShouldLoopring", {});
    }
    disableBtn();
  }, [
    resetBtnInfo,
    toIsLoopringAddress,
    realToAddress,
    toAddressStatus,
    depositValue.belong,
    depositValue.tradeValue,
    depositValue.balance,
    depositValue.toAddress,
    allowanceInfo,
    walletLayer1?.ETH?.count,
    disableBtn,
    chargeFeeList,
    isNewAccount,
    setLabelAndParams,
    enableBtn,
  ]);

  React.useEffect(() => {
    updateBtnStatus();
  }, [
    depositValue?.belong,
    depositValue?.tradeValue,
    depositValue?.balance,
    depositValue.toAddress,
    allowanceInfo?.tokenInfo.symbol,
    toAddressStatus,
  ]);

  const handlePanelEvent = React.useCallback(
    async (
      data: SwitchData<Partial<T>>,
      _switchType: "Tomenu" | "Tobutton"
    ) => {
      const oldValue = store.getState()._router_modalData.depositValue;

      let newValue = {
        ...oldValue,
        // belong: undefined,
        // tradeValue: 0,
        // balance: 0,
      };
      if (data?.tradeData.hasOwnProperty("referAddress")) {
        newValue.referAddress = data?.tradeData.referAddress;
        setReferAddress(newValue.referAddress ?? "");
      }
      if (data?.tradeData.hasOwnProperty("toAddress")) {
        // myLog("toAddress", toAddress);
        newValue.toAddress = data?.tradeData.toAddress;
        setToAddress(newValue.toAddress ?? "");
      }
      if (data?.tradeData.hasOwnProperty("addressError")) {
        newValue.addressError = data?.tradeData.addressError;
      }
      return new Promise<void>((resolve) => {
        if (data.to === "button") {
          if (walletLayer1 && data?.tradeData?.belong) {
            const walletInfo = walletLayer1[data.tradeData.belong];
            newValue = {
              ...newValue,
              ...data.tradeData,
              balance: walletInfo.count,
            };
          }
        }
        updateDepositData(newValue);
        resolve();
      });
    },
    [walletLayer1, updateDepositData]
  );
  const handleClear = React.useCallback(() => {
    if (isAllowInputToAddress && !isToAddressEditable) {
      return;
    }
    handlePanelEvent(
      {
        to: "button",
        tradeData: {
          referAddress: undefined,
          toAddress: undefined,
          addressError: undefined,
        } as T,
      },
      "Tobutton"
    );
  }, [handlePanelEvent, setReferAddress, setToAddress]);

  const walletLayer1Callback = React.useCallback(() => {
    const _symbol = opts?.token?.toUpperCase() ?? symbol;
    let updateData = {};
    if (_symbol && walletLayer1) {
      // updateDepositData();
      updateData = {
        belong: _symbol as any,
        balance: walletLayer1[_symbol]?.count,
        tradeValue: undefined,
      };
    } else if (!depositValue.belong && walletLayer1) {
      const keys = Reflect.ownKeys(walletLayer1);
      for (var key in keys) {
        const keyVal = keys[key] as any;
        const walletInfo = walletLayer1[keyVal];
        if (sdk.toBig(walletInfo.count).gt(0)) {
          // updateDepositData();
          updateData = {
            belong: keyVal as any,
            tradeValue: 0,
            balance: walletInfo.count,
          };
          break;
        }
      }
    }

    if (isAllowInputToAddress) {
      if (account.accAddress === "" || (account.accAddress && walletLayer1)) {
        updateData = {
          ...updateData,
          toAddress: opts?.owner?.toLowerCase(),
          addressError: undefined,
        } as T;
      }
      if (opts?.owner) {
        setIsToAddressEditable(false);
      } else {
        setIsToAddressEditable(true);
        handleClear();
      }
    } else {
      handleClear();
    }

    handlePanelEvent(
      {
        to: "button",
        tradeData: updateData,
      },
      "Tobutton"
    );
  }, [
    symbol,
    walletLayer1,
    isAllowInputToAddress,
    updateDepositData,
    depositValue.belong,
    handlePanelEvent,
    opts?.token,
    opts?.owner,
    handleClear,
  ]);

  React.useEffect(() => {
    if (isShow || isAllowInputToAddress) {
      walletLayer1Callback();
    }
  }, [isShow, isAllowInputToAddress, walletLayer1]);
  const signRefer = React.useCallback(async () => {
    if (
      referIsLoopringAddress &&
      realReferAddress &&
      LoopringAPI.exchangeAPI &&
      LoopringAPI.userAPI &&
      exchangeInfo
    ) {
      try {
        const refAccount = await LoopringAPI.exchangeAPI.getAccount({
          owner: realReferAddress,
        });
        if (
          (refAccount &&
            ((refAccount as sdk.RESULT_INFO).code ||
              (refAccount as sdk.RESULT_INFO).message)) ||
          (refAccount.accInfo && !refAccount.accInfo?.accountId)
        ) {
          return;
        }
        // const referId = refAccount.accInfo?.accountId;
        let keySeed = sdk.GlobalAPI.KEY_MESSAGE.replace(
          "${exchangeAddress}",
          exchangeInfo.exchangeAddress
        ).replace("${nonce}", "0");
        const eddsaKey = await sdk.generateKeyPair({
          web3: connectProvides.usedWeb3,
          address: account.accAddress,
          keySeed,
          walletType: account.connectName as sdk.ConnectorNames,
          chainId: chainId as any,
          accountId: account.accountId,
        });

        const response = await LoopringAPI.userAPI.SetReferrer(
          {
            address: account.accAddress,
            referrer: refAccount.accInfo.accountId,
            publicKeyX: eddsaKey.formatedPx,
            publicKeyY: eddsaKey.formatedPy,
          },
          eddsaKey.sk
        );
        myLog(
          "setRefer generateKeyPair!!! referId:",
          refAccount.accInfo.accountId,
          response
        );
      } catch (reason: any) {
        sdk.dumpError400(reason);
      }
    }
  }, [
    account.accAddress,
    account.accountId,
    account.connectName,
    chainId,
    exchangeInfo,
    realReferAddress,
    referIsLoopringAddress,
  ]);

  const handleDeposit = React.useCallback(
    async (inputValue: any) => {
      myLog("handleDeposit:", inputValue);
      if (isNewAccount && inputValue.referAddress) {
        setShowAccount({
          isShow: true,
          step: AccountStep.Deposit_Sign_WaitForRefer,
        });
        await signRefer();
      }
      const { readyState, connectName } = account;
      let result: ActionResult = { code: ActionResultCode.NoError };
      if (
        readyState !== AccountStatus.UN_CONNECT &&
        inputValue.tradeValue &&
        tokenMap &&
        exchangeInfo?.exchangeAddress &&
        connectProvides.usedWeb3 &&
        LoopringAPI.exchangeAPI &&
        (!isAllowInputToAddress ||
          (isAllowInputToAddress && toIsLoopringAddress))
      ) {
        try {
          const tokenInfo = tokenMap[inputValue.belong];
          const gasLimit = parseInt(tokenInfo.gasAmounts.deposit);
          const fee = 0;
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
              } catch (reason: any) {
                // result.code = ActionResultCode.ApproveFailed;
                // result.data = reason;

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
            info: {
              to: isAllowInputToAddress ? realToAddress : null,
            },
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
            isMetaMask,
            isAllowInputToAddress ? realToAddress : account.accAddress
          );

          myLog("response:", response);
          // updateDepositHash({response.result})
          // result.data = response

          if (response) {
            setShowAccount({
              isShow: true,
              info: {
                to: isAllowInputToAddress ? realToAddress : null,
                symbol: tokenInfo.symbol,
                value: inputValue.tradeValue,
                hash: response.result,
              },
              step: AccountStep.Deposit_Submit,
            });
            updateDepositHash(response.result, account.accAddress, undefined, {
              symbol: tokenInfo.symbol,
              type: "Deposit",
              value: inputValue.tradeValue,
            });
          } else {
            // deposit failed
            setShowAccount({
              isShow: true,
              step: AccountStep.Deposit_Failed,
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: "No Response",
              },
            });
          }

          resetDepositData();
        } catch (reason: any) {
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
                error: {
                  code: result.code ?? UIERROR_CODE.UNKNOWN,
                  msg: reason?.message,
                },
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
      signRefer,
      account,
      tokenMap,
      exchangeInfo,
      isAllowInputToAddress,
      toIsLoopringAddress,
      gasPrice,
      chainId,
      setShowAccount,
      realToAddress,
      resetDepositData,
      updateDepositHash,
    ]
  );

  const onDepositClick = React.useCallback(async () => {
    myLog("onDepositClick depositValue:", depositValue);
    setShowDeposit({ isShow: false });

    if (depositValue && depositValue.belong) {
      await handleDeposit(depositValue as T);
    }
  }, [depositValue, handleDeposit, setShowDeposit, setShowAccount]);

  const handleAddressError = React.useCallback(() => {
    if (
      referStatus &&
      ((referStatus as AddressError) !== AddressError.NoError ||
        !referIsLoopringAddress)
    ) {
      handlePanelEvent(
        {
          to: "button",
          tradeData: {
            addressError: {
              error: true,
              message: !referIsLoopringAddress
                ? "Not Loopring L2"
                : "Invalid Address",
            },
          } as T,
        },
        "Tobutton"
      );
    } else if (
      toAddressStatus &&
      ((toAddressStatus as AddressError) !== AddressError.NoError ||
        !toIsLoopringAddress)
    ) {
      handlePanelEvent(
        {
          to: "button",
          tradeData: {
            addressError: {
              error: true,
              message: !toIsLoopringAddress
                ? "Not Loopring L2"
                : "Invalid Address",
            },
          } as T,
        },
        "Tobutton"
      );
    } else {
      handlePanelEvent(
        {
          to: "button",
          tradeData: {
            addressError: undefined,
          } as T,
        },
        "Tobutton"
      );
    }
  }, [
    referIsLoopringAddress,
    toAddressStatus,
    referStatus,
    toIsLoopringAddress,
    updateDepositData,
  ]);
  React.useEffect(() => {
    handleAddressError();
  }, [referStatus, toAddressStatus]);

  const title =
    account.readyState === AccountStatus.NO_ACCOUNT
      ? t("labelCreateLayer2Title")
      : t("depositTitle");
  const depositProps: DepositProps<T, I> = {
    btnInfo,
    isNewAccount,
    title,
    type: "TOKEN",
    handleClear,
    allowTrade,
    isAllowInputToAddress,
    chargeFeeTokenList: chargeFeeList ?? [],
    tradeData: depositValue as T,
    coinMap: totalCoinMap as CoinMap<any>,
    walletMap: walletLayer1 as WalletMap<any>,
    depositBtnStatus: btnStatus,
    handlePanelEvent,
    onDepositClick,
    toIsAddressCheckLoading,
    toIsLoopringAddress,
    realToAddress,
    referIsAddressCheckLoading,
    referIsLoopringAddress,
    realReferAddress,
    isToAddressEditable,
  };

  return {
    depositProps,
  };
};
