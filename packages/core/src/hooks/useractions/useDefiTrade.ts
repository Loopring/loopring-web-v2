import React from "react";
import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";
import {
  AccountStep,
  ForceWithdrawProps,
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
import { updateForceWithdrawData as updateForceWithdrawDataStore } from "@loopring-web/core";

import * as sdk from "@loopring-web/loopring-sdk";

import {
  useTokenMap,
  useAccount,
  BIGO,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  TOAST_TIME,
  useAddressCheck,
  useBtnStatus,
  walletLayer2Service,
  checkErrorInfo,
  useModalData,
  isAccActivated,
  useChargeFees,
  useSystem,
  WalletMapExtend,
  WalletLayer2Map,
} from "../../index";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import { useRouteMatch } from "react-router-dom";

export const useDefiTrade = <R extends IBData<T>, T>() => {
  const { tokenMap, totalCoinMap, idIndex } = useTokenMap();
  const { account } = useAccount();
  const { exchangeInfo, chainId } = useSystem();
  const { setShowAccount } = useOpenModals();
  const match = useRouteMatch("/layer2/:forceWithdraw");
  const {
    forceWithdrawValue,
    updateForceWithdrawData,
    resetForceWithdrawData,
  } = useModalData();
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  } = useChargeFees({
    requestType: sdk.OffchainFeeReqType.FORCE_WITHDRAWAL,
    updateData: ({ fee }) => {
      const { forceWithdrawValue } = store.getState()._router_modalData;
      store.dispatch(
        updateForceWithdrawDataStore({ ...forceWithdrawValue, fee })
      );
    },
  });

  const { checkHWAddr, updateHW } = useWalletInfo();
  // const [forceWithDrawAccount, setForceWithDrawAccount] =
  //   React.useState<by>();

  const [walletItsMap, setWalletItsMap] = React.useState<WalletMap<T>>({});

  const {
    address,
    realAddr,
    setAddress,
    checkAddAccountId,
    addrStatus,
    isLoopringAddress,
    isActiveAccount,
    isAddressCheckLoading,
  } = useAddressCheck();

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();

  const checkBtnStatus = React.useCallback(() => {
    if (
      tokenMap &&
      forceWithdrawValue?.fee?.belong &&
      forceWithdrawValue.fee?.feeRaw &&
      forceWithdrawValue.belong &&
      forceWithdrawValue.balance &&
      !!forceWithdrawValue?.withdrawAddress &&
      !isFeeNotEnough.isFeeNotEnough
    ) {
      enableBtn();
      myLog("enableBtn");
      return;
    }
    disableBtn();
  }, [
    tokenMap,
    forceWithdrawValue.fee?.belong,
    forceWithdrawValue.fee?.feeRaw,
    forceWithdrawValue.belong,
    forceWithdrawValue.balance,
    forceWithdrawValue?.withdrawAddress,
    isFeeNotEnough.isFeeNotEnough,
    disableBtn,
    enableBtn,
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [
    address,
    addrStatus,
    isFeeNotEnough.isFeeNotEnough,
    forceWithdrawValue.fee?.belong,
    forceWithdrawValue.fee?.feeRaw,
    forceWithdrawValue.belong,
    isLoopringAddress,
    isActiveAccount,
  ]);

  const walletLayer2Callback = React.useCallback(async () => {
    if (
      LoopringAPI.userAPI &&
      realAddr &&
      checkAddAccountId &&
      isLoopringAddress &&
      !isActiveAccount
    ) {
      const { userBalances } = await LoopringAPI.userAPI?.getUserBalances(
        { accountId: checkAddAccountId, tokens: "" },
        account.apiKey
      );
      let walletMap: WalletMap<T> = {};
      if (userBalances) {
        const walletLayer2 = Reflect.ownKeys(userBalances).reduce(
          (prev, item) => {
            // @ts-ignore
            return { ...prev, [idIndex[item]]: userBalances[Number(item)] };
          },
          {} as WalletLayer2Map<R>
        );
        walletMap = Reflect.ownKeys(walletLayer2).reduce((prev, item) => {
          const {
            total,
            locked,
            // pending: { withdraw },
          } = walletLayer2[item as string];
          const countBig = sdk.toBig(total).minus(sdk.toBig(locked));

          if (countBig.eq(BIGO)) {
            return prev;
          }

          return {
            ...prev,
            [item]: {
              belong: item,
              count: sdk.fromWEI(tokenMap, item, countBig.toString()),
              detail: walletLayer2[item as string],
            },
          };
        }, {} as WalletMapExtend<T>);
      }
      const key = Reflect.ownKeys(walletMap).length
        ? Reflect.ownKeys(walletMap)[0]
        : undefined;
      const _value = key ? walletMap[key] : undefined;
      updateForceWithdrawData({
        withdrawAddress: realAddr,
        belong: _value?.belong ?? "",
        tradeValue: _value?.count,
        balance: _value?.count,
      });
      setWalletItsMap({ ...walletMap });
    } else {
      setWalletItsMap({});
    }
  }, [
    account.apiKey,
    checkAddAccountId,
    idIndex,
    isActiveAccount,
    isLoopringAddress,
    realAddr,
    tokenMap,
    updateForceWithdrawData,
  ]);

  React.useEffect(() => {
    if (
      checkAddAccountId &&
      isLoopringAddress &&
      !isActiveAccount &&
      !!realAddr
    ) {
      walletLayer2Callback();
    } else {
      setWalletItsMap({});
      updateForceWithdrawData({
        withdrawAddress: "",
        belong: "",
        tradeValue: undefined,
        balance: undefined,
      });
    }
  }, [isLoopringAddress, isActiveAccount, checkAddAccountId, realAddr]);
  // useWalletLayer2Socket({ walletLayer2Callback });
  const resetDefault = React.useCallback(() => {
    checkFeeIsEnough();
    resetForceWithdrawData();
    setWalletItsMap({});
    setAddress("");
  }, [checkFeeIsEnough, resetForceWithdrawData, setAddress]);

  React.useEffect(() => {
    // @ts-ignore
    if (match?.params?.forcewithdraw?.toLowerCase() === "forcewithdraw") {
      resetDefault();
    }
  }, [match?.params]);

  const processRequest = React.useCallback(
    async (
      request: sdk.OriginForcesWithdrawalsV3,
      isNotHardwareWallet: boolean
    ) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {
          let isHWAddr = checkHWAddr(account.accAddress);

          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }

          myLog("nftWithdraw processRequest:", isHWAddr, isNotHardwareWallet);
          const response = await LoopringAPI.userAPI.submitForceWithdrawals(
            {
              request,
              web3: connectProvides.usedWeb3,
              chainId: chainId === "unknown" ? 1 : chainId,
              walletType: (ConnectProvidersSignMap[connectName] ??
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
          myLog("submitNFTWithdraw:", response);

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
                  step: AccountStep.ForceWithdraw_Denied,
                });
              } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                // setLastRequest({ request });
                setShowAccount({
                  isShow: true,
                  step: AccountStep.ForceWithdraw_First_Method_Denied,
                  info: {
                    symbol: forceWithdrawValue.belong,
                  },
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
                  step: AccountStep.ForceWithdraw_Failed,
                  error: response as sdk.RESULT_INFO,
                  info: {
                    symbol: forceWithdrawValue.belong,
                  },
                });
              }
            } else if ((response as sdk.TX_HASH_API)?.hash) {
              setShowAccount({
                isShow: true,
                step: AccountStep.ForceWithdraw_In_Progress,
              });
              await sdk.sleep(TOAST_TIME);
              setShowAccount({
                isShow: true,
                step: AccountStep.ForceWithdraw_Submit,
                info: {
                  symbol: forceWithdrawValue.belong,
                },
              });
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }
              walletLayer2Service.sendUserUpdate();
              resetDefault();
            }
          } else {
            resetDefault();
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
              step: AccountStep.ForceWithdraw_Denied,
              info: {
                symbol: forceWithdrawValue.belong,
              },
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setShowAccount({
              isShow: true,
              step: AccountStep.ForceWithdraw_First_Method_Denied,
              info: {
                symbol: forceWithdrawValue.belong,
              },
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.ForceWithdraw_Failed,
              info: {
                symbol: forceWithdrawValue.belong,
              },
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
      forceWithdrawValue.belong,
      checkFeeIsEnough,
      resetDefault,
      updateHW,
    ]
  );

  const handleForceWithdraw = React.useCallback(
    async (_inputValue: R, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;
      const forceWithdrawValue =
        store.getState()._router_modalData.forceWithdrawValue;

      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        forceWithdrawValue?.fee?.belong &&
        forceWithdrawValue.fee?.feeRaw &&
        forceWithdrawValue?.belong &&
        forceWithdrawValue?.withdrawAddress &&
        !isFeeNotEnough.isFeeNotEnough &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.ForceWithdraw_WaitForAuth,
          });

          const feeToken = tokenMap[forceWithdrawValue.fee.belong];
          const feeRaw =
            forceWithdrawValue.fee.feeRaw ??
            forceWithdrawValue.fee.__raw__?.feeRaw ??
            0;
          const fee = sdk.toBig(feeRaw);
          // const fee = sdk.toBig(forceWithdrawValue.fee.__raw__?.feeRaw ?? 0);

          const storageId = await LoopringAPI.userAPI?.getNextStorageId(
            {
              accountId,
              sellTokenId: Number(feeToken.tokenId),
            },
            apiKey
          );
          const { broker } = await LoopringAPI.userAPI?.getAvailableBroker({
            type: 1,
          });

          const request: sdk.OriginForcesWithdrawalsV3 = {
            transfer: {
              exchange: exchangeInfo.exchangeAddress,
              payerAddr: accAddress,
              payerId: accountId,
              payeeAddr: broker,
              storageId: storageId.offchainId,
              token: {
                tokenId: feeToken.tokenId,
                volume: fee.toFixed(), // TEST: fee.toString(),
              },
              validUntil: getTimestampDaysLater(DAYS),
            },
            requesterAddress: accAddress,
            tokenId: tokenMap[forceWithdrawValue.belong].tokenId,
            withdrawAddress: forceWithdrawValue.withdrawAddress ?? realAddr,
          };

          myLog("ForcesWithdrawals request:", request);

          processRequest(request, isFirstTime);
        } catch (e: any) {
          sdk.dumpError400(e);
          setShowAccount({
            isShow: true,
            step: AccountStep.ForceWithdraw_Failed,
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
      isFeeNotEnough.isFeeNotEnough,
      setShowAccount,
      realAddr,
      processRequest,
    ]
  );

  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.ForceWithdraw_WaitForAuth,
      });
      handleForceWithdraw(
        {
          belong: forceWithdrawValue.belong,
          balance: forceWithdrawValue.balance,
          tradeValue: forceWithdrawValue.tradeValue,
        } as R,
        !isHardwareRetry
      );
    },
    [forceWithdrawValue, handleForceWithdraw, setShowAccount]
  );
  // myLog("walletItsMap", walletItsMap);
  // @ts-ignore
  const forceWithdrawProps: ForceWithdrawProps<any, any> = React.useMemo(() => {
    return {
      disabled: false,
      // onChangeEvent: undefined,
      type: "TOKEN",
      addressDefault: address,
      handleOnAddressChange: (value: any) => {
        setAddress(value);
        updateForceWithdrawData({
          belong: "",
          tradeValue: undefined,
          balance: undefined,
        });
      },
      isNotAvaiableAddress: !(isLoopringAddress && !isActiveAccount),
      realAddr,
      isAddressCheckLoading,
      isLoopringAddress,
      tradeData: forceWithdrawValue as any,
      coinMap: totalCoinMap as CoinMap<T>,
      walletMap: walletItsMap,
      addrStatus,
      withdrawBtnStatus: btnStatus,
      onWithdrawClick: handleForceWithdraw,
      handlePanelEvent: async (data: SwitchData<R>) => {
        return new Promise((res: any) => {
          if (data.to === "button") {
            if (data.tradeData.belong) {
              updateForceWithdrawData({
                ...forceWithdrawValue,
                belong: data.tradeData.belong,
                tradeValue: data.tradeData.balance, //data.tradeData?.tradeValue,
                balance: data.tradeData.balance,
                // withdrawAddress: realAddr,
              });
            } else {
              updateForceWithdrawData({
                belong: "",
                tradeValue: undefined,
                balance: undefined,
                // withdrawAddress: realAddr,
              });
            }
          }
          res();
        });
      },
      handleFeeChange,
      feeInfo,
      chargeFeeTokenList,
      isFeeNotEnough,
    };
  }, [
    addrStatus,
    address,
    btnStatus,
    chargeFeeTokenList,
    feeInfo,
    forceWithdrawValue,
    handleFeeChange,
    handleForceWithdraw,
    isActiveAccount,
    isAddressCheckLoading,
    isFeeNotEnough,
    isLoopringAddress,
    realAddr,
    setAddress,
    totalCoinMap,
    updateForceWithdrawData,
    walletItsMap,
  ]); // as ForceWithdrawProps<any, any>;

  return {
    forceWithdrawProps,
    retryBtn,
  };
};
