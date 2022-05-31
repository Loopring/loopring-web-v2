import React from "react";

import { connectProvides } from "@loopring-web/web3-provider";
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
  WithdrawType,
  WithdrawTypes,
  AddressError,
  EXCHANGE_TYPE,
} from "@loopring-web/common-resources";

import * as sdk from "@loopring-web/loopring-sdk";

import {
  BIGO,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  makeWalletLayer2,
  TOAST_TIME,
  useAddressCheck,
  useBtnStatus,
  useTokenMap,
  useAccount,
  useChargeFees,
  useWalletLayer2Socket,
  walletLayer2Service,
  useSystem,
  checkErrorInfo,
  useModalData,
  isAccActivated,
} from "../../index";
import { useWalletInfo } from "../../stores/localStore/walletInfo";

export const useWithdraw = <R extends IBData<T>, T>() => {
  const {
    modals: {
      isShowWithdraw: { symbol, isShow, info },
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
  const [sureIsAllowAddress, setSureIsAllowAddress] =
    React.useState<EXCHANGE_TYPE | undefined>(undefined);
  const [withdrawType, setWithdrawType] = React.useState<WithdrawType>(
    sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL
  );

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  } = useChargeFees({
    requestType: withdrawType,
    tokenSymbol: withdrawValue.belong,
    updateData: React.useCallback(
      ({ fee }) => {
        updateWithdrawData({ ...withdrawValue, fee });
      },
      [withdrawValue]
    ),
  });

  const [withdrawTypes, setWithdrawTypes] = React.useState<
    Partial<WithdrawTypes>
  >({
    // [sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL]: "Fast",
    [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: "Standard",
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
    isAddressCheckLoading,
  } = useAddressCheck();

  React.useEffect(() => {
    setSureIsAllowAddress(undefined);
  }, [realAddr]);

  const isNotAvaiableAddress =
    // isCFAddress
    // ? "isCFAddress"
    // :
    isContractAddress &&
    disableWithdrawList.includes(withdrawValue?.belong ?? "")
      ? `isContractAddress`
      : undefined;

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();

  const checkBtnStatus = React.useCallback(() => {
    if (tokenMap && withdrawValue.belong && tokenMap[withdrawValue.belong]) {
      const withdrawT = tokenMap[withdrawValue.belong];
      const tradeValue = sdk
        .toBig(withdrawValue.tradeValue ?? 0)
        .times("1e" + withdrawT.decimals);
      const exceedPoolLimit =
        withdrawType === sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL &&
        tradeValue.gt(0) &&
        tradeValue.gte(sdk.toBig(withdrawT.fastWithdrawLimit));
      if (
        tradeValue &&
        !exceedPoolLimit &&
        !isNotAvaiableAddress &&
        chargeFeeTokenList.length &&
        !isFeeNotEnough &&
        withdrawValue.fee?.belong &&
        withdrawValue.fee?.feeRaw &&
        tradeValue.gt(BIGO) &&
        realAddr &&
        (info?.isToMyself || sureIsAllowAddress) &&
        (addrStatus as AddressError) === AddressError.NoError
      ) {
        enableBtn();
        return;
      }
      if (exceedPoolLimit) {
        setWithdrawI18nKey("labelL2toL1BtnExceed");
      } else {
        setWithdrawI18nKey(undefined);
      }
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
    withdrawType,
    isNotAvaiableAddress,
    chargeFeeTokenList.length,
    isFeeNotEnough,
    realAddr,
    info?.isToMyself,
    sureIsAllowAddress,
    addrStatus,
    enableBtn,
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [
    withdrawType,
    addrStatus,
    realAddr,
    sureIsAllowAddress,
    isFeeNotEnough,
    withdrawValue?.fee,
    withdrawValue?.belong,
    withdrawValue?.tradeValue,
    isNotAvaiableAddress,
  ]);

  const updateWithdrawTypes = React.useCallback(async () => {
    if (withdrawValue.belong && LoopringAPI.exchangeAPI && tokenMap) {
      setWithdrawTypes({
        [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: "Standard",
      });
      // TODO： remove first withdraw
      // const tokenInfo = tokenMap[withdrawValue.belong];
      //
      // const req: sdk.GetWithdrawalAgentsRequest = {
      //   tokenId: tokenInfo.tokenId,
      //   amount: sdk.toBig("1e" + tokenInfo.decimals).toString(),
      // };
      //
      // const agent = await LoopringAPI.exchangeAPI.getWithdrawalAgents(req);
      //
      // if (agent.supportTokenMap[withdrawValue.belong]) {
      //   myLog("------- have agent!");
      //   setWithdrawTypes({
      //     [sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL]: "Fast",
      //     [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: "Standard",
      //   });
      // } else {
      //   myLog("------- have NO agent!");
      //   setWithdrawTypes({
      //     [sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL]: "Standard",
      //   });
      // }
    }
  }, [withdrawValue, tokenMap]);

  const updateWithdrawType = React.useCallback(() => {
    // myLog('withdrawTypes:', withdrawTypes, ' withdrawType2:', withdrawType2)
    if (!withdrawTypes[sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL]) {
      // myLog('try to reset setWithdrawType!')
      setWithdrawType(sdk.OffchainFeeReqType.OFFCHAIN_WITHDRAWAL);
      // updateWithdrawData({...withdrawValue, fee: feeInfo})
    }
  }, [withdrawTypes, setWithdrawType]);

  React.useEffect(() => {
    updateWithdrawType();
  }, [withdrawTypes]);

  React.useEffect(() => {
    updateWithdrawTypes();
  }, [withdrawValue.belong]);

  const walletLayer2Callback = () => {
    const walletMap =
      makeWalletLayer2(true, true).walletMap ?? ({} as WalletMap<R>);
    setWalletMap2(walletMap);
  };

  const resetDefault = React.useCallback(() => {
    checkFeeIsEnough();
    if (info?.isRetry) {
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
              balance: walletInfo.count,
              address: info?.isToMyself ? account.accAddress : "*",
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
          balance: walletInfo.count,
          address: info?.isToMyself ? account.accAddress : "*",
        });
      } else {
        updateWithdrawData({
          fee: feeInfo,
          belong: withdrawValue.belong,
          tradeValue: undefined,
          balance: undefined,
          address: info?.isToMyself ? account.accAddress : "*",
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
    }
  }, [isShow, accountStatus, account.readyState]);

  useWalletLayer2Socket({ walletLayer2Callback });

  const processRequest = React.useCallback(
    async (
      request: sdk.OffChainWithdrawalRequestV3,
      isNotHardwareWallet: boolean
    ) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {
          let isHWAddr = checkHWAddr(account.accAddress);
          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }

          myLog("withdraw processRequest:", isHWAddr, isNotHardwareWallet);

          const response = await LoopringAPI.userAPI.submitOffchainWithdraw(
            {
              request,
              web3: connectProvides.usedWeb3,
              chainId: chainId === "unknown" ? 1 : chainId,
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

          myLog("submitOffchainWithdraw:", response);

          if (isAccActivated()) {
            if (
              (response as sdk.RESULT_INFO).code ||
              (response as sdk.RESULT_INFO).message
            ) {
              const code = checkErrorInfo(
                response as sdk.RESULT_INFO,
                isNotHardwareWallet
              );
              if (code === sdk.ConnectorError.USER_DENIED) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.Withdraw_User_Denied,
                });
              } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                setLastRequest({ request });
                setShowAccount({
                  isShow: true,
                  step: AccountStep.Withdraw_First_Method_Denied,
                });
              } else {
                if (
                  [102024, 102025, 114001, 114002].includes(
                    (response as sdk.RESULT_INFO)?.code || 0
                  )
                ) {
                  checkFeeIsEnough(true);
                }
                setShowAccount({
                  isShow: true,
                  step: AccountStep.Withdraw_Failed,
                  error: response as sdk.RESULT_INFO,
                });
              }
            } else if ((response as sdk.TX_HASH_API)?.hash) {
              setShowAccount({
                isShow: true,
                step: AccountStep.Withdraw_In_Progress,
              });
              await sdk.sleep(TOAST_TIME);
              setShowAccount({
                isShow: true,
                step: AccountStep.Withdraw_Success,
                info: {
                  hash:
                    Explorer +
                    `tx/${(response as sdk.TX_HASH_API)?.hash}-withdraw`,
                },
              });
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }

              resetWithdrawData();
            }

            walletLayer2Service.sendUserUpdate();
          } else {
            resetWithdrawData();
          }
        }
      } catch (reason: any) {
        sdk.dumpError400(reason);
        const code = checkErrorInfo(reason, isNotHardwareWallet);
        myLog("code:", code);

        if (isAccActivated()) {
          if (code === sdk.ConnectorError.USER_DENIED) {
            setShowAccount({
              isShow: true,
              step: AccountStep.Withdraw_User_Denied,
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setLastRequest({ request });
            setShowAccount({
              isShow: true,
              step: AccountStep.Withdraw_First_Method_Denied,
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.Withdraw_Failed,
              error: {
                code: UIERROR_CODE.UNKNOWN,
                msg: reason?.message,
              },
            });
          }
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
          setShowWithdraw({ isShow: false, info });
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
              withdrawType === sdk.OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL, // WithdrawType.Fast,
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
      withdrawValue.belong,
      info?.isToMyself,
      sureIsAllowAddress,
      setShowWithdraw,
      setShowAccount,
      withdrawType,
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

  const withdrawProps: WithdrawProps<any, any> = {
    type: "TOKEN",
    isAddressCheckLoading,
    isCFAddress,
    isToMyself: info?.isToMyself,
    isContractAddress,
    withdrawI18nKey,
    accAddr: account.accAddress,
    isNotAvaiableAddress,
    addressDefault: address,
    realAddr,
    disableWithdrawList,
    tradeData: withdrawValue as any,
    coinMap: totalCoinMap as CoinMap<T>,
    walletMap: walletMap2 as WalletMap<any>,
    withdrawBtnStatus: btnStatus,
    withdrawType,
    withdrawTypes,
    sureIsAllowAddress,
    handleSureIsAllowAddress: (value: EXCHANGE_TYPE) => {
      setSureIsAllowAddress(value);
    },
    onWithdrawClick: () => {
      if (withdrawValue && withdrawValue.belong) {
        handleWithdraw(withdrawValue, realAddr ? realAddr : address);
      }
      setShowWithdraw({ isShow: false, info });
    },
    handleWithdrawTypeChange: (value) => {
      // myLog('handleWithdrawTypeChange', value)
      setWithdrawType(value);
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
              belong: data.tradeData?.belong,
              tradeValue: data.tradeData?.tradeValue,
              balance: walletInfo.count,
              address: "*",
            });
          } else {
            updateWithdrawData({
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
