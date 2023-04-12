import React from "react";

import { ConnectProviders, connectProvides } from "@loopring-web/web3-provider";
import {
  AccountStep,
  SwitchData,
  useOpenModals,
  WithdrawProps,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  CoinMap,
  Explorer,
  IBData,
  myLog,
  SagaStatus,
  UIERROR_CODE,
  WalletMap,
  WithdrawTypes,
  AddressError,
  EXCHANGE_TYPE,
  LIVE_FEE_TIMES,
  getValuePrecisionThousand,
  globalSetup,
  SUBMIT_PANEL_AUTO_CLOSE,
  TRADE_TYPE,
} from "@loopring-web/common-resources";
import Web3 from "web3";

import * as sdk from "@loopring-web/loopring-sdk";

import {
  BIGO,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  makeWalletLayer2,
  useAddressCheck,
  useBtnStatus,
  useTokenMap,
  useAccount,
  useChargeFees,
  useWalletLayer2Socket,
  walletLayer2Service,
  useSystem,
  useModalData,
  isAccActivated,
  store,
  LAST_STEP,
} from "../../index";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import _ from "lodash";

export const useWithdraw = <R extends IBData<T>, T>() => {
  const {
    modals: {
      isShowWithdraw: {
        symbol,
        isShow,
        info
      },
    },
    setShowAccount,
    setShowWithdraw,
  } = useOpenModals();
  const { tokenMap, totalCoinMap, disableWithdrawList } = useTokenMap();
  const { account, status: accountStatus } = useAccount();
  const { exchangeInfo, chainId } = useSystem();

  const { withdrawValue, updateWithdrawData, resetWithdrawData } =
    useModalData();

  const [walletMap2, setWalletMap2] = React.useState(
    makeWalletLayer2(true, true).walletMap ?? ({} as WalletMap<R>)
  );

  const [sureIsAllowAddress, setSureIsAllowAddress] = React.useState<
    EXCHANGE_TYPE | undefined
  >(undefined);

  const [isFastWithdrawAmountLimit, setIsFastWithdrawAmountLimit] =
    React.useState<boolean>(false);

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    resetIntervalTime,
  } = useChargeFees({
    requestType: withdrawValue.withdrawType,
    amount: withdrawValue.tradeValue,
    needAmountRefresh:
      withdrawValue.withdrawType ==
      sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL,
    tokenSymbol: withdrawValue.belong,
    updateData: ({ fee, amount }) => {
      const _withdrawValue = store.getState()._router_modalData.withdrawValue;
      myLog(
        withdrawValue.withdrawType,
        _withdrawValue.withdrawType,
        withdrawValue.belong,
        _withdrawValue.belong,
        amount,
        _withdrawValue.tradeValue
      );
      if (
        withdrawValue.withdrawType == _withdrawValue.withdrawType &&
        withdrawValue.belong == _withdrawValue.belong &&
        ((withdrawValue.withdrawType ==
          sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL &&
          amount == _withdrawValue.tradeValue) ||
          withdrawValue.withdrawType ==
            sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL)
      ) {
        updateWithdrawData({ ..._withdrawValue, fee });
      }
    },
  });

  const [withdrawTypes, setWithdrawTypes] = React.useState<
    Partial<WithdrawTypes>
  >(() => {
    return {
      // [sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL]: "Fast",
      [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: "Standard",
    };
  });
  const { checkHWAddr, updateHW } = useWalletInfo();

  const [lastRequest, setLastRequest] = React.useState<any>({});

  const [withdrawI18nKey, setWithdrawI18nKey] = React.useState<string>();

  const {
    address,
    realAddr,
    isCFAddress,
    isContractAddress,
    setAddress,
    addrStatus,
    isLoopringAddress,
    isAddressCheckLoading,
  } = useAddressCheck();

  React.useEffect(() => {
    setSureIsAllowAddress(undefined);
  }, [realAddr]);

  const isNotAvailableAddress =
    // isCFAddress
    // ? "isCFAddress"
    // :
    isContractAddress &&
    disableWithdrawList.includes(withdrawValue?.belong ?? "")
      ? `isContractAddress`
      : undefined;

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();

  const checkBtnStatus = React.useCallback(() => {
    const withdrawValue = store.getState()._router_modalData.withdrawValue;
    if (tokenMap && withdrawValue.belong && tokenMap[withdrawValue.belong]) {
      const withdrawT = tokenMap[withdrawValue.belong];
      const tradeValue = sdk
        .toBig(withdrawValue.tradeValue ?? 0)
        .times("1e" + withdrawT.decimals);
      const exceedPoolLimit =
        withdrawValue.withdrawType ==
          sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL &&
        tradeValue.gt(0) &&
        withdrawT.fastWithdrawLimit &&
        tradeValue.gte(withdrawT.fastWithdrawLimit);
      // const isFeeSame = withdrawValue.fee?.belong === withdrawValue.belong;
      const isEnough = tradeValue.lte(
        sdk.toBig(withdrawValue.balance ?? 0).times("1e" + withdrawT.decimals)
      );
      // const withFeeEnough = isFeeSame
      //   ? tradeValue
      //       .plus(withdrawValue.fee?.feeRaw ?? 0)
      //       .lte(
      //         sdk
      //           .toBig(withdrawValue.balance ?? 0)
      //           .times("1e" + withdrawT.decimals)
      //       )
      //   : isEnough;
      if (
        tradeValue &&
        !exceedPoolLimit &&
        !isNotAvailableAddress &&
        chargeFeeTokenList.length &&
        !isFeeNotEnough.isFeeNotEnough &&
        withdrawValue.fee?.belong &&
        withdrawValue.fee?.feeRaw &&
        tradeValue.gt(BIGO) &&
        !isFeeNotEnough.isOnLoading &&
        withdrawValue.tradeValue &&
        realAddr &&
        isEnough &&
        (info?.isToMyself || sureIsAllowAddress) &&
        [AddressError.NoError, AddressError.IsNotLoopringContract].includes(
          addrStatus
        )
      ) {
        enableBtn();
        setIsFastWithdrawAmountLimit(false);
        return;
      }
      if (exceedPoolLimit) {
        const amt = getValuePrecisionThousand(
          sdk
            .toBig(withdrawT.fastWithdrawLimit ?? 0)
            .div("1e" + withdrawT.decimals),
          withdrawT.precision,
          withdrawT.precision,
          withdrawT.precision,
          false,
          { floor: true }
        ).toString();

        setWithdrawI18nKey(`labelL2toL1BtnExceed|${amt}`);
        setIsFastWithdrawAmountLimit(true);
        return;
      }
      // else if (isFeeSame && !withFeeEnough) {
      //   setWithdrawI18nKey(`labelL2toL1BtnExceedWithFee`);
      // }
      setIsFastWithdrawAmountLimit(false);
    }
    disableBtn();
  }, [
    tokenMap,
    withdrawValue.belong,
    withdrawValue.tradeValue,
    withdrawValue.fee?.belong,
    withdrawValue.fee?.feeRaw,
    disableBtn,
    address,
    isFeeNotEnough.isOnLoading,
    isNotAvailableAddress,
    chargeFeeTokenList.length,
    isFeeNotEnough,
    realAddr,
    info?.isToMyself,
    sureIsAllowAddress,
    addrStatus,
    enableBtn,
  ]);

  React.useEffect(() => {
    setWithdrawI18nKey(undefined);
    checkBtnStatus();
  }, [
    addrStatus,
    realAddr,
    isFeeNotEnough.isOnLoading,
    sureIsAllowAddress,
    isFeeNotEnough.isFeeNotEnough,
    withdrawValue?.withdrawType,
    withdrawValue?.fee,
    withdrawValue?.belong,
    withdrawValue?.tradeValue,
    isNotAvailableAddress,
  ]);

  React.useEffect(() => {
    if (withdrawValue.belong && LoopringAPI.exchangeAPI && tokenMap) {
      const tokenInfo = tokenMap[withdrawValue.belong];
      LoopringAPI.exchangeAPI
        .getWithdrawalAgents({
          tokenId: tokenInfo.tokenId,
          amount: sdk.toBig(tokenInfo.orderAmounts.dust).toString(),
        })
        .then((respons) => {
          if (
            withdrawValue.belong &&
            respons?.supportTokenMap[withdrawValue.belong]
          ) {
            setWithdrawTypes({
              [sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL]: "Fast",
              [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: "Standard",
            });
          } else {
            setWithdrawTypes({
              [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: "Standard",
            });
          }
        });

      // const agent = await ;
    }
  }, [withdrawValue.belong]);

  const walletLayer2Callback = () => {
    const walletMap =
      makeWalletLayer2(true, true).walletMap ?? ({} as WalletMap<R>);
    setWalletMap2(walletMap);
  };

  const resetDefault = React.useCallback(() => {
    if (info?.isRetry) {
      checkFeeIsEnough();
      return;
    }

    if (symbol) {
      if (walletMap2) {
        updateWithdrawData({
          fee: feeInfo,
          belong: symbol as any,
          balance: walletMap2[symbol]?.count,
          tradeValue: undefined,
          address: info?.isToMyself ? account.accAddress : "*",
          withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
        });
      }
    } else {
      if (!withdrawValue.belong && walletMap2) {
        const keys = Reflect.ownKeys(walletMap2);
        for (let key in keys) {
          const keyVal = keys[key];
          const walletInfo = walletMap2[keyVal];
          if (sdk.toBig(walletInfo.count).gt(0)) {
            updateWithdrawData({
              fee: feeInfo,
              belong: keyVal as any,
              tradeValue: undefined,
              balance: walletInfo?.count,
              address: info?.isToMyself ? account.accAddress : "*",
              withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
            });
            break;
          }
        }
      } else if (withdrawValue.belong && walletMap2) {
        const walletInfo = walletMap2[withdrawValue.belong];
        updateWithdrawData({
          fee: feeInfo,
          belong: withdrawValue.belong,
          tradeValue: undefined,
          balance: walletInfo?.count,
          address: info?.isToMyself ? account.accAddress : "*",
          withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
        });
      } else {
        updateWithdrawData({
          fee: feeInfo,
          belong: withdrawValue.belong,
          tradeValue: undefined,
          balance: undefined,
          address: info?.isToMyself ? account.accAddress : "*",
          withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
        });
      }
    }
    if (info?.isToMyself) {
      setAddress(account.accAddress);
    } else {
      setAddress("");
    }
  }, [
    account.accAddress,
    setAddress,
    info?.isToMyself,
    checkFeeIsEnough,
    symbol,
    walletMap2,
    updateWithdrawData,
    feeInfo,
    withdrawValue.belong,
    info?.isRetry,
  ]);

  React.useEffect(() => {
    if (
      isShow &&
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      resetDefault();
    } else {
      resetIntervalTime();
    }
    return () => {
      resetIntervalTime();
      _checkFeeIsEnough.cancel();
    };
  }, [isShow, accountStatus, account.readyState]);

  const _checkFeeIsEnough = _.debounce(() => {
    const { tradeValue: amount, withdrawType } =
      store.getState()._router_modalData.withdrawValue;
    checkFeeIsEnough({
      isRequiredAPI: true,
      intervalTime: LIVE_FEE_TIMES,
      amount,
      requestType: withdrawType,
      needAmountRefresh:
        withdrawType == sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL,
    });
  }, globalSetup.wait);

  useWalletLayer2Socket({ walletLayer2Callback });

  const processRequest = React.useCallback(
    async (
      request: sdk.OffChainWithdrawalRequestV3,
      isNotHardwareWallet: boolean
    ) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (
          connectProvides.usedWeb3 &&
          LoopringAPI.userAPI &&
          isAccActivated()
        ) {
          let isHWAddr = checkHWAddr(account.accAddress);
          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }

          myLog("withdraw processRequest:", isHWAddr, isNotHardwareWallet);

          const response = await LoopringAPI.userAPI.submitOffchainWithdraw(
            {
              request,
              web3: connectProvides.usedWeb3 as unknown as Web3,
              chainId: chainId === "unknown" ? 1 : chainId,
              walletType: (ConnectProviders[connectName] ??
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

          myLog("submitOffchainWithdraw:", response);

          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            throw response;
          }
          setShowWithdraw({ isShow: false, info });
          setShowAccount({
            isShow: true,
            step: AccountStep.Withdraw_In_Progress,
          });
          let hash =
            Explorer + `tx/${(response as sdk.TX_HASH_API)?.hash}-withdraw`;

          setShowAccount({
            isShow: true,
            step: AccountStep.Withdraw_Success,
            info: {
              hash,
              isToMyself: info?.isToMyself,
            },
          });

          if (isHWAddr) {
            myLog("......try to set isHWAddr", isHWAddr);
            updateHW({ wallet: account.accAddress, isHWAddr });
          }
          resetWithdrawData();
          walletLayer2Service.sendUserUpdate();
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE);
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step ==
              AccountStep.Withdraw_Success
          ) {
            setShowAccount({ isShow: false });
          }
        }
      } catch (e: any) {
        const code = sdk.checkErrorInfo(e, isNotHardwareWallet);
        myLog("checkErrorInfo", code, e);
        switch (code) {
          case sdk.ConnectorError.NOT_SUPPORT_ERROR:
            setLastRequest({ request });
            setShowAccount({
              isShow: true,
              step: AccountStep.Withdraw_First_Method_Denied,
            });
            break;
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setLastRequest({ request });
            setShowAccount({
              isShow: true,
              step: AccountStep.Withdraw_User_Denied,
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
              step: AccountStep.Withdraw_Failed,
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
    [
      account,
      checkHWAddr,
      chainId,
      setShowAccount,
      resetWithdrawData,
      updateHW,
      checkFeeIsEnough,
    ]
  );

  const handleWithdraw = React.useCallback(
    async (inputValue: any, address, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;

      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        address &&
        LoopringAPI.userAPI &&
        withdrawValue?.fee?.belong &&
        withdrawValue.fee?.feeRaw &&
        eddsaKey?.sk &&
        (info?.isToMyself || sureIsAllowAddress)
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.Withdraw_WaitForAuth,
          });

          const withdrawToken = tokenMap[withdrawValue.belong as string];
          const feeToken = tokenMap[withdrawValue.fee.belong];

          // const fee = sdk.toBig(withdrawValue.fee?.feeRaw ?? 0);
          const feeRaw =
            withdrawValue.fee.feeRaw ?? withdrawValue.fee.__raw__?.feeRaw ?? 0;
          const fee = sdk.toBig(feeRaw);
          const balance = sdk
            .toBig(inputValue.balance ?? 0)
            .times("1e" + withdrawToken.decimals);
          const tradeValue = sdk
            .toBig(inputValue.tradeValue ?? 0)
            .times("1e" + withdrawToken.decimals);
          const isExceedBalance =
            feeToken.tokenId === withdrawToken.tokenId &&
            tradeValue.plus(fee).gt(balance);
          const finalVol = isExceedBalance ? balance.minus(fee) : tradeValue;
          const withdrawVol = finalVol.toFixed(0, 0);

          const storageId = await LoopringAPI.userAPI.getNextStorageId(
            {
              accountId: accountId,
              sellTokenId: withdrawToken.tokenId,
            },
            apiKey
          );

          const request: sdk.OffChainWithdrawalRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            owner: accAddress,
            to: address,
            accountId: account.accountId,
            storageId: storageId?.offchainId,
            token: {
              tokenId: withdrawToken.tokenId,
              volume: withdrawVol,
            },
            maxFee: {
              tokenId: feeToken.tokenId,
              volume: fee.toString(), // TEST: fee.toString(),
            },
            fastWithdrawalMode:
              withdrawValue.withdrawType ==
              sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL, // WithdrawType.Fast,
            extraData: "",
            minGas: 0,
            validUntil: getTimestampDaysLater(DAYS),
          };

          myLog("submitOffchainWithdraw:", request);

          processRequest(request, isFirstTime);
        } catch (e: any) {
          sdk.dumpError400(e);
          setShowAccount({
            isShow: true,
            step: AccountStep.Withdraw_Failed,
            error: {
              code: UIERROR_CODE.UNKNOWN,
              msg: e?.message,
            },
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
      withdrawValue?.fee?.belong,
      withdrawValue?.fee?.feeRaw,
      withdrawValue?.fee?.__raw__?.feeRaw,
      withdrawValue?.belong,
      info,
      sureIsAllowAddress,
      setShowAccount,
      processRequest,
    ]
  );
  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTWithdraw_WaitForAuth,
      });
      processRequest(lastRequest, !isHardwareRetry);
    },
    [lastRequest, processRequest, setShowAccount]
  );
  // console.log('address ?? contactAddress', contactAddress)

  const withdrawProps: WithdrawProps<any, any> = {
    type: TRADE_TYPE.TOKEN,
    isLoopringAddress,
    isAddressCheckLoading,
    isCFAddress,
    isToMyself: info?.isToMyself,
    isContractAddress,
    withdrawI18nKey,
    accAddr: account.accAddress,
    isNotAvailableAddress,
    addressDefault: address,
    realAddr,
    disableWithdrawList,
    tradeData: withdrawValue as any,
    coinMap: totalCoinMap as CoinMap<T>,
    walletMap: walletMap2 as WalletMap<any>,
    withdrawBtnStatus: btnStatus,
    withdrawType: withdrawValue.withdrawType,
    isFastWithdrawAmountLimit,
    withdrawTypes,
    sureIsAllowAddress,
    lastFailed:
      store.getState().modals.isShowAccount.info?.lastFailed ===
      LAST_STEP.withdraw,
    handleSureIsAllowAddress: (value: EXCHANGE_TYPE) => {
      setSureIsAllowAddress(value);
    },

    onWithdrawClick: () => {
      if (withdrawValue && withdrawValue.belong) {
        handleWithdraw(withdrawValue, realAddr ? realAddr : address);
      }
    },
    handleWithdrawTypeChange: (value) => {
      // setWithdrawType(value);
      const _withdrawValue = store.getState()._router_modalData.withdrawValue;
      updateWithdrawData({
        ..._withdrawValue,
        withdrawType: value,
      });
      _checkFeeIsEnough();
    },
    handlePanelEvent: async (
      data: SwitchData<R>,
      _switchType: "Tomenu" | "Tobutton"
    ) => {
      return new Promise((res: any) => {
        if (data.to === "button") {
          if (walletMap2 && data?.tradeData?.belong) {
            const walletInfo = walletMap2[data?.tradeData?.belong as string];
            updateWithdrawData({
              ...withdrawValue,
              belong: data.tradeData?.belong,
              tradeValue: data.tradeData?.tradeValue,
              balance: walletInfo?.count,
              address: "*",
            });
            _checkFeeIsEnough.cancel();
            _checkFeeIsEnough();
          } else {
            updateWithdrawData({
              withdrawType: sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL,
              belong: undefined,
              tradeValue: undefined,
              balance: undefined,
              address: "*",
            });
          }
        }
        res();
      });
    },
    handleFeeChange,
    feeInfo,
    addrStatus,
    chargeFeeTokenList,
    isFeeNotEnough,
    handleOnAddressChange: (value: any) => {
      setAddress(value);
    },

  };

  return {
    withdrawProps,
    retryBtn,
  };
};
