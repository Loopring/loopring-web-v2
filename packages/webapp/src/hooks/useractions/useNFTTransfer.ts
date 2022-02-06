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
  NFTWholeINFO,
  SagaStatus,
  UIERROR_CODE,
  WalletMap,
} from "@loopring-web/common-resources";

import { useTokenMap } from "stores/token";
import { useAccount } from "stores/account";
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
import store from "../../stores";
import { useChargeFees } from "../common/useChargeFees";

export const useNFTTransfer = <
  R extends IBData<T> &
    Partial<sdk.NFTTokenInfo & sdk.UserNFTBalanceInfo & NFTWholeINFO>,
  T
>({
  isLocalShow = false,
  doTransferDone,
}: {
  isLocalShow?: boolean;
  doTransferDone?: () => void;
}) => {
  const { setShowAccount, setShowNFTTransfer } = useOpenModals();

  const {
    modals: {
      isShowNFTTransfer: { nftData, nftBalance, ...nftRest },
    },
  } = useOpenModals();

  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account, status: accountStatus } = useAccount();
  const { exchangeInfo, chainId } = useSystem();

  const { nftTransferValue, updateNFTTransferData, resetNFTTransferData } =
    useModalData();

  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<R>)
  );
  const [addressOrigin, setAddressOrigin] = React.useState<
    "Wallet" | undefined
  >();
  const { chargeFeeTokenList, isFeeNotEnough, handleFeeChange, feeInfo } =
    useChargeFees({
      tokenAddress: nftTransferValue.tokenAddress,
      requestType: sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
      updateData: (feeInfo, _chargeFeeList) => {
        updateNFTTransferData({
          ...nftTransferValue,
          fee: feeInfo,
        });
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
    if (
      tokenMap &&
      nftTransferValue.fee?.belong &&
      nftTransferValue?.tradeValue &&
      sdk.toBig(nftTransferValue.tradeValue).gt(BIGO) &&
      sdk
        .toBig(nftTransferValue.tradeValue)
        .lte(Number(nftTransferValue.nftBalance) ?? 0) &&
      addrStatus === AddressError.NoError &&
      address &&
      !isFeeNotEnough
    ) {
      enableBtn();
      myLog("enableBtn");
      return;
    }
    disableBtn();
  }, [
    addrStatus,
    address,
    disableBtn,
    enableBtn,
    isFeeNotEnough,
    nftTransferValue,
    tokenMap,
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [
    address,
    addrStatus,
    isFeeNotEnough,
    nftTransferValue.tradeValue,
    nftTransferValue.fee,
  ]);

  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(true).walletMap ?? {};
    setWalletMap(walletMap);
  }, []);

  useWalletLayer2Socket({ walletLayer2Callback });

  const resetDefault = React.useCallback(() => {
    if (nftData) {
      updateNFTTransferData({
        belong: nftData as any,
        balance: nftBalance,
        tradeValue: undefined,
        ...nftRest,
        address: address ? address : "*",
      });
    } else {
      updateNFTTransferData({
        belong: "",
        balance: 0,
        tradeValue: 0,
        address: "*",
      });
      setShowNFTTransfer({ isShow: false });
    }
  }, [
    nftData,
    updateNFTTransferData,
    nftBalance,
    nftRest,
    address,
    setShowNFTTransfer,
  ]);

  React.useEffect(() => {
    if (isLocalShow) {
      resetDefault();
    }
  }, [isLocalShow]);

  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      myLog("useEffect nftTransferValue.address:", nftTransferValue.address);
      setAddress(nftTransferValue.address ? nftTransferValue.address : "");
    }
  }, [setAddress, nftTransferValue.address, accountStatus, account.readyState]);

  const { checkHWAddr, updateHW } = useWalletInfo();

  const [lastRequest, setLastRequest] = React.useState<any>({});

  const processRequest = React.useCallback(
    async (
      request: sdk.OriginNFTTransferRequestV3,
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

          const response = await LoopringAPI.userAPI?.submitNFTInTransfer(
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
                  step: AccountStep.NFTTransfer_User_Denied,
                });
              } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTTransfer_First_Method_Denied,
                });
              } else {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTTransfer_Failed,
                  error: response as sdk.RESULT_INFO,
                });
              }
            } else if ((response as sdk.TX_HASH_API)?.hash) {
              // Withdraw success
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTTransfer_In_Progress,
              });
              await sdk.sleep(TOAST_TIME);
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTTransfer_Success,
              });
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }
              walletLayer2Service.sendUserUpdate();
              if (doTransferDone) {
                doTransferDone();
              }
              resetNFTTransferData();
            }
          } else {
            resetNFTTransferData();
          }
        }
      } catch (reason) {
        const code = checkErrorInfo(reason, isNotHardwareWallet);

        if (isAccActivated()) {
          if (code === sdk.ConnectorError.USER_DENIED) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTTransfer_User_Denied,
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTTransfer_First_Method_Denied,
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTTransfer_Failed,
              error: {
                code: UIERROR_CODE.Unknow,
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
      doTransferDone,
      resetNFTTransferData,
      updateHW,
    ]
  );

  const onTransferClick = useCallback(
    async (_nftTransferValue, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;
      const nftTransferValue = {
        ...store.getState()._router_modalData.nftTransferValue,
        ..._nftTransferValue,
      };
      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        nftTransferValue?.nftData &&
        nftTransferValue?.fee?.belong &&
        nftTransferValue?.fee?.__raw__ &&
        eddsaKey?.sk
      ) {
        try {
          setShowNFTTransfer({ isShow: false });
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTTransfer_WaitForAuth,
          });
          // const sellTokenID = nftTransferValue.tokenId
          // const sellToken = tokenMap[nftTransferValue.belong as string]
          const feeToken = tokenMap[nftTransferValue.fee.belong];
          const fee = sdk.toBig(nftTransferValue.fee.__raw__?.feeRaw ?? 0);
          const tradeValue = nftTransferValue.tradeValue;
          const balance = nftTransferValue.nftBalance;
          const isExceedBalance = sdk.toBig(tradeValue).gt(balance);

          if (isExceedBalance) {
            throw Error("overflow balance");
          }

          const storageId = await LoopringAPI.userAPI?.getNextStorageId(
            {
              accountId,
              sellTokenId: nftTransferValue.tokenId,
            },
            apiKey
          );
          const req: sdk.OriginNFTTransferRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            fromAccountId: accountId,
            fromAddress: accAddress,
            toAccountId: 0,
            toAddress: realAddr ? realAddr : address,
            storageId: storageId?.offchainId,
            token: {
              tokenId: nftTransferValue.tokenId,
              nftData: nftTransferValue.nftData,
              amount: tradeValue,
            },
            maxFee: {
              tokenId: feeToken.tokenId,
              amount: fee.toString(), // TEST: fee.toString(),
            },
            validUntil: getTimestampDaysLater(DAYS),
            memo: nftTransferValue.memo,
          };

          myLog("nftTransfer req:", req);

          processRequest(req, isFirstTime);
        } catch (e) {
          sdk.dumpError400(e);
          // nftTransfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTTransfer_Failed,
            error: {
              code: UIERROR_CODE.Unknow,
              msg: e?.message,
            },
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
      setShowNFTTransfer,
      setShowAccount,
      realAddr,
      address,
      processRequest,
    ]
  );

  const handlePanelEvent = useCallback(
    async (data: SwitchData<R>, switchType: "Tomenu" | "Tobutton") => {
      return new Promise<void>((res: any) => {
        if (data.to === "button") {
          if (data.tradeData.belong) {
            updateNFTTransferData({
              tradeValue: data.tradeData?.tradeValue,
              balance: data.tradeData.nftBalance,
              address: "*",
            });
          } else {
            updateNFTTransferData({
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
    [updateNFTTransferData]
  );

  const retryBtn = React.useCallback(
    (isHardwareRetry: boolean = false) => {
      setShowAccount({
        isShow: true,
        step: AccountStep.NFTTransfer_WaitForAuth,
      });
      processRequest(lastRequest, !isHardwareRetry);
    },
    [lastRequest, processRequest, setShowAccount]
  );
  const nftTransferProps: TransferProps<any, any> = {
    addressDefault: address,
    realAddr,
    handleSureItsLayer2: (sure: boolean) => {
      if (sure) {
        setAddressOrigin("Wallet");
      }
    },
    addressOrigin,
    tradeData: nftTransferValue as any,
    coinMap: totalCoinMap as CoinMap<T>,
    walletMap: walletMap as WalletMap<T>,
    transferBtnStatus: btnStatus,
    onTransferClick: (trade: R) => {
      onTransferClick(trade);
    },
    handleFeeChange,
    handleOnAddressChange: (value: any) => {
      setAddress(value || "");
    },
    feeInfo,
    chargeFeeTokenList,
    isFeeNotEnough,
    handlePanelEvent,
    isLoopringAddress,
    isSameAddress,
    isAddressCheckLoading,
    handleAddressError: (value: any) => {
      updateNFTTransferData({ address: value, balance: -1, tradeValue: -1 });
      return { error: false, message: "" };
    },
  };

  return {
    nftTransferProps,
    retryBtn,
  };
};
