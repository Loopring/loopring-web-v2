import React, { useCallback } from "react";

import * as sdk from "@loopring-web/loopring-sdk";

import { connectProvides } from "@loopring-web/web3-provider";

import {
  AccountStep,
  SwitchData,
  TransferProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  CoinMap,
  IBData,
  SagaStatus,
  UIERROR_CODE,
  WalletMap,
} from "@loopring-web/common-resources";

import { useTokenMap } from "stores/token";
import { useAccount } from "stores/account";
import { useChargeFees } from "../common/useChargeFees";
import { LoopringAPI } from "api_wrapper";
import { useSystem } from "stores/system";
import { myLog } from "@loopring-web/common-resources";
import { makeWalletLayer2 } from "hooks/help";
import {
  useWalletLayer2Socket,
  walletLayer2Service,
} from "../../services/socket";
import { getTimestampDaysLater } from "utils/dt_tools";
import { AddressError, BIGO, DAYS, TOAST_TIME } from "defs/common_defs";
import { useAddressCheck } from "hooks/common/useAddrCheck";
import { useWalletInfo } from "stores/localStore/walletInfo";
import { checkErrorInfo } from "./utils";
import { useBtnStatus } from "hooks/common/useBtnStatus";
import { useModalData } from "stores/router";
import { isAccActivated } from "./checkAccStatus";

export const useTransfer = <R extends IBData<T>, T>() => {
  const { setShowAccount, setShowTransfer } = useOpenModals();

  const {
    modals: {
      isShowTransfer: { symbol, isShow },
    },
  } = useOpenModals();

  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account, status: accountStatus } = useAccount();
  const { exchangeInfo, chainId } = useSystem();

  const { transferValue, updateTransferData, resetTransferData } =
    useModalData();

  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<R>)
  );
  const [addressOrigin, setAddressOrigin] = React.useState<"Wallet" | null>(
    null
  );
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  } = useChargeFees({
    requestType: sdk.OffchainFeeReqType.TRANSFER,
    updateData: (feeInfo, _chargeFeeList) => {
      updateTransferData({ ...transferValue, fee: feeInfo });
    },
  });

  const {
    address,
    realAddr,
    setAddress,
    addrStatus,
    isLoopringAddress,
    isAddressCheckLoading,
    isSameAddress,
  } = useAddressCheck();

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();
  const checkBtnStatus = React.useCallback(() => {
    if (tokenMap && transferValue.belong && tokenMap[transferValue.belong]) {
      const sellToken = tokenMap[transferValue.belong];
      const tradeValue = sdk
        .toBig(transferValue.tradeValue ?? 0)
        .times("1e" + sellToken.decimals);
      // myLog(
      //   "Trans checkBtnStatus",
      //   tradeValue,
      //   chargeFeeTokenList.length,
      //   !isFeeNotEnough,
      //   !isSameAddress,
      //   !isAddressCheckLoading,
      //   addressOrigin,
      //   transferValue.fee?.belong,
      //   tradeValue.gt(BIGO),
      //   address,
      //   address !== "",
      //   addrStatus === AddressError.NoError
      // );
      if (
        tradeValue &&
        chargeFeeTokenList.length &&
        !isFeeNotEnough &&
        !isSameAddress &&
        // !isAddressCheckLoading &&
        addressOrigin === "Wallet" &&
        transferValue.fee?.belong &&
        tradeValue.gt(BIGO) &&
        ((address && address.startsWith("0x")) || realAddr) &&
        addrStatus === AddressError.NoError
      ) {
        enableBtn();
        return;
      }
    }

    disableBtn();
  }, [
    tokenMap,
    transferValue,
    disableBtn,
    addressOrigin,
    chargeFeeTokenList.length,
    isFeeNotEnough,
    isSameAddress,
    address,
    addrStatus,
    enableBtn,
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [
    chargeFeeTokenList,
    address,
    addressOrigin,
    isFeeNotEnough,
    isAddressCheckLoading,
    transferValue,
  ]);

  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(true).walletMap ?? {};
    setWalletMap(walletMap);
  }, []);

  useWalletLayer2Socket({ walletLayer2Callback });

  const resetDefault = React.useCallback(() => {
    checkFeeIsEnough();
    if (symbol && walletMap) {
      myLog("resetDefault symbol:", symbol);
      updateTransferData({
        fee: feeInfo,
        belong: symbol as any,
        balance: walletMap[symbol]?.count,
        tradeValue: undefined,
        address: "*",
      });
    } else {
      if (!transferValue.belong && walletMap) {
        const keys = Reflect.ownKeys(walletMap);
        for (let key in keys) {
          const keyVal = keys[key];
          const walletInfo = walletMap[keyVal];
          if (sdk.toBig(walletInfo.count).gt(0)) {
            updateTransferData({
              belong: keyVal as any,
              tradeValue: 0,
              fee: feeInfo,
              balance: walletInfo.count,
              address: "*",
            });
            break;
          }
        }
      }
    }
  }, [symbol, walletMap, updateTransferData, transferValue, feeInfo]);

  React.useEffect(() => {
    if (isShow) {
      resetDefault();
    }
  }, [isShow]);

  React.useEffect(() => {
    if (
      isShow &&
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      // myLog('useEffect transferValue.address:', transferValue.address)
      if (!transferValue.address) {
        setAddress("");
      }
      // setAddress(transferValue.address ? transferValue.address : '')
    }
  }, [
    setAddress,
    isShow,
    transferValue.address,
    accountStatus,
    account.readyState,
  ]);

  const { checkHWAddr, updateHW } = useWalletInfo();

  const [lastRequest, setLastRequest] = React.useState<any>({});

  const processRequest = React.useCallback(
    async (
      request: sdk.OriginTransferRequestV3,
      isNotHardwareWallet: boolean
    ) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {
          let isHWAddr = checkHWAddr(account.accAddress);
          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }
          setLastRequest({ request });
          const response = await LoopringAPI.userAPI.submitInternalTransfer(
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
          setAddressOrigin(null);
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
                  step: AccountStep.Transfer_User_Denied,
                });
              } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.Transfer_First_Method_Denied,
                });
              } else {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.Transfer_Failed,
                  error: response as sdk.RESULT_INFO,
                });
              }
            } else if ((response as sdk.TX_HASH_API)?.hash) {
              // Withdraw success
              setShowAccount({
                isShow: true,
                step: AccountStep.Transfer_In_Progress,
              });
              await sdk.sleep(TOAST_TIME);
              setShowAccount({
                isShow: true,
                step: AccountStep.Transfer_Success,
              });
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }
              walletLayer2Service.sendUserUpdate();
              resetTransferData();
            }
          } else {
            resetTransferData();
          }
        }
      } catch (reason) {
        const code = checkErrorInfo(reason, isNotHardwareWallet);

        if (isAccActivated()) {
          if (code === sdk.ConnectorError.USER_DENIED) {
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_User_Denied,
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_First_Method_Denied,
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_Failed,
              error: {
                code: UIERROR_CODE.Unknow,
                msg: reason?.message,
              },
            });
          }
        }
      }
    },
    [account, checkHWAddr, chainId, setShowAccount, resetTransferData, updateHW]
  );

  const onTransferClick = useCallback(
    async (transferValue, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;

      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        transferValue.address !== "*" &&
        transferValue?.fee &&
        transferValue?.fee.belong &&
        transferValue.fee?.__raw__ &&
        eddsaKey?.sk
      ) {
        try {
          setShowTransfer({ isShow: false });
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_WaitForAuth,
          });

          const sellToken = tokenMap[transferValue.belong as string];
          const feeToken = tokenMap[transferValue.fee.belong];

          const fee = sdk.toBig(transferValue.fee.__raw__?.feeRaw ?? 0);
          const balance = sdk
            .toBig(transferValue.balance ?? 0)
            .times("1e" + sellToken.decimals);
          const tradeValue = sdk
            .toBig(transferValue.tradeValue ?? 0)
            .times("1e" + sellToken.decimals);
          const isExceedBalance =
            feeToken.tokenId === sellToken.tokenId &&
            tradeValue.plus(fee).gt(balance);
          const finalVol = isExceedBalance ? balance.minus(fee) : tradeValue;
          const transferVol = finalVol.toFixed(0, 0);

          const storageId = await LoopringAPI.userAPI?.getNextStorageId(
            {
              accountId,
              sellTokenId: sellToken.tokenId,
            },
            apiKey
          );
          const req: sdk.OriginTransferRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            payerAddr: accAddress,
            payerId: accountId,
            payeeAddr: realAddr ? realAddr : address,
            payeeId: 0,
            storageId: storageId?.offchainId,
            token: {
              tokenId: sellToken.tokenId,
              volume: transferVol,
            },
            maxFee: {
              tokenId: feeToken.tokenId,
              volume: fee.toString(), // TEST: fee.toString(),
            },
            validUntil: getTimestampDaysLater(DAYS),
            memo: transferValue.memo,
          };

          myLog("transfer req:", req);

          processRequest(req, isFirstTime);
        } catch (e) {
          sdk.dumpError400(e);
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_Failed,
          });
        }
      } else {
        return false;
      }
    },
    [
      account,
      tokenMap,
      exchangeInfo,
      setShowTransfer,
      setShowAccount,
      realAddr,
      address,
      processRequest,
    ]
  );

  const handlePanelEvent = useCallback(
    async (data: SwitchData<R>) => {
      return new Promise<void>((res: any) => {
        if (data.to === "button") {
          if (walletMap && data?.tradeData?.belong) {
            const walletInfo = walletMap[data?.tradeData?.belong as string];
            updateTransferData({
              belong: data.tradeData?.belong,
              tradeValue: data.tradeData?.tradeValue,
              balance: walletInfo ? walletInfo.count : 0,
              address: "*",
            });
          } else {
            updateTransferData({
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
    [walletMap, updateTransferData]
  );

  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.Transfer_WaitForAuth,
      });
      processRequest(lastRequest, !isHardwareRetry);
    },
    [lastRequest, processRequest, setShowAccount]
  );

  const transferProps: TransferProps<any, any> = {
    addressDefault: address,
    realAddr,
    tradeData: transferValue as any,
    coinMap: totalCoinMap as CoinMap<T>,
    walletMap: walletMap as WalletMap<T>,
    transferBtnStatus: btnStatus,
    onTransferClick,
    handlePanelEvent,
    handleFeeChange,
    feeInfo,
    handleSureItsLayer2: (sure: boolean) => {
      if (sure) {
        setAddressOrigin("Wallet");
      }
    },
    addressOrigin,
    chargeFeeTokenList,
    isFeeNotEnough,
    isLoopringAddress,
    isSameAddress,
    isAddressCheckLoading,
    addrStatus,
    handleOnAddressChange: (value: any) => {
      setAddress(value || "");
    },
  };

  return {
    retryBtn,
    transferProps,
  };
};
