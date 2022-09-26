import React, { ChangeEvent, useCallback } from "react";

import * as sdk from "@loopring-web/loopring-sdk";

import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";

import {
  AccountStep,
  SwitchData,
  TransferProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import {
  AccountStatus,
  CoinMap,
  Explorer,
  myLog,
  SagaStatus,
  TradeNFT,
  UIERROR_CODE,
  AddressError,
  WALLET_TYPE,
  TOAST_TIME,
  LIVE_FEE_TIMES,
} from "@loopring-web/common-resources";

import {
  useTokenMap,
  useAccount,
  BIGO,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  store,
  useAddressCheck,
  useBtnStatus,
  checkErrorInfo,
  useModalData,
  isAccActivated,
  useChargeFees,
  useWalletLayer2NFT,
  useWalletLayer2Socket,
  walletLayer2Service,
  useSystem,
  getIPFSString,
} from "../../index";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import { useHistory, useLocation } from "react-router-dom";
import Web3 from "web3";

export const useNFTTransfer = <R extends TradeNFT<T, any>, T>() => {
  const [memo, setMemo] = React.useState("");
  const {
    setShowAccount,
    setShowNFTTransfer,
    setShowNFTDetail,
    modals: {
      isShowNFTTransfer: { isShow, info },
    },
  } = useOpenModals();

  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account, status: accountStatus } = useAccount();
  const { exchangeInfo, chainId, baseURL } = useSystem();
  const { page, updateWalletLayer2NFT } = useWalletLayer2NFT();
  const { nftTransferValue, updateNFTTransferData, resetNFTTransferData } =
    useModalData();
  const history = useHistory();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search);

  const [sureItsLayer2, setSureItsLayer2] =
    React.useState<WALLET_TYPE | undefined>(undefined);
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    resetIntervalTime,
    checkFeeIsEnough,
  } = useChargeFees({
    tokenAddress: nftTransferValue.tokenAddress,
    requestType: sdk.OffchainNFTFeeReqType.NFT_TRANSFER,
    updateData: ({ fee }) => {
      const nftTransferValue =
        store.getState()._router_modalData.nftTransferValue;
      updateNFTTransferData({
        ...nftTransferValue,
        balance: sdk
          .toBig(nftTransferValue.total ?? 0)
          .minus(nftTransferValue.locked ?? 0)
          .toNumber(),
        fee,
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
  React.useEffect(() => {
    setSureItsLayer2(undefined);
  }, [realAddr]);

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();
  const handleOnMemoChange = React.useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setMemo(e.target.value);
    },
    []
  );
  const checkBtnStatus = React.useCallback(() => {
    if (
      tokenMap &&
      nftTransferValue.fee?.belong &&
      nftTransferValue?.tradeValue &&
      chargeFeeTokenList.length &&
      !isFeeNotEnough.isFeeNotEnough &&
      !isSameAddress &&
      sureItsLayer2 &&
      sdk.toBig(nftTransferValue.tradeValue).gt(BIGO) &&
      sdk
        .toBig(nftTransferValue.tradeValue)
        .lte(Number(nftTransferValue.balance) ?? 0) &&
      (addrStatus as AddressError) === AddressError.NoError &&
      realAddr
    ) {
      enableBtn();
      myLog("enableBtn");
      return;
    }
    disableBtn();
  }, [
    tokenMap,
    nftTransferValue.fee?.belong,
    nftTransferValue.tradeValue,
    nftTransferValue.balance,
    chargeFeeTokenList.length,
    isFeeNotEnough,
    isSameAddress,
    sureItsLayer2,
    addrStatus,
    realAddr,
    disableBtn,
    enableBtn,
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [
    address,
    addrStatus,
    sureItsLayer2,
    isFeeNotEnough.isFeeNotEnough,
    isSameAddress,
    nftTransferValue.tradeValue,
    nftTransferValue.fee,
  ]);

  useWalletLayer2Socket({});

  const resetDefault = React.useCallback(() => {
    if (info?.isRetry) {
      checkFeeIsEnough();
      return;
    }
    checkFeeIsEnough({ isRequiredAPI: true, intervalTime: LIVE_FEE_TIMES });
    if (nftTransferValue.nftData) {
      updateNFTTransferData({
        balance: sdk
          .toBig(nftTransferValue.total ?? 0)
          .minus(nftTransferValue.locked ?? 0)
          .toNumber(),
        belong: nftTransferValue.name as any,
        tradeValue: undefined,
        fee: feeInfo,
        address: address ? address : "*",
      });
    } else {
      updateNFTTransferData({
        fee: feeInfo,
        belong: "",
        balance: 0,
        tradeValue: 0,
        address: "*",
      });
    }
  }, [
    checkFeeIsEnough,
    nftTransferValue,
    info?.isRetry,
    updateNFTTransferData,
    feeInfo,
    address,
  ]);

  React.useEffect(() => {
    if (isShow || info?.isShowLocal) {
      resetDefault();
    } else {
      resetIntervalTime();
    }
    return () => {
      resetIntervalTime();
    };
  }, [isShow, info?.isShowLocal]);

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
              web3: connectProvides.usedWeb3 as unknown as Web3,
              chainId:
                chainId !== sdk.ChainId.GOERLI ? sdk.ChainId.MAINNET : chainId,
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

          myLog("submitInternalTransfer:", response);
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
                  step: AccountStep.NFTTransfer_User_Denied,
                });
                // setIsConfirmTransfer(false);
              } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTTransfer_First_Method_Denied,
                  info: {
                    symbol: nftTransferValue.name,
                  },
                });
              } else {
                if (
                  [102024, 102025, 114001, 114002].includes(
                    (response as sdk.RESULT_INFO)?.code || 0
                  )
                ) {
                  checkFeeIsEnough({ isRequiredAPI: true });
                }

                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTTransfer_Failed,
                  error: response as sdk.RESULT_INFO,
                  info: {
                    symbol: nftTransferValue.name,
                  },
                });
                // setIsConfirmTransfer(false);
              }
            } else if ((response as sdk.TX_HASH_API)?.hash) {
              // setIsConfirmTransfer(false);
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTTransfer_In_Progress,
              });
              await sdk.sleep(TOAST_TIME);
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTTransfer_Success,
                info: {
                  symbol: nftTransferValue.name,
                  hash:
                    Explorer +
                    `tx/${(response as sdk.TX_HASH_API)?.hash}-nftTransfer-${
                      account.accountId
                    }-${request.token.tokenId}-${request.storageId}`,
                },
              });
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }
              walletLayer2Service.sendUserUpdate();
              if (nftTransferValue.collectionMeta) {
                history.push({
                  pathname: `/NFT/assetsNFT/byCollection/${nftTransferValue.collectionMeta?.contractAddress}|${nftTransferValue.collectionMeta?.id}`,
                  search,
                });
                updateWalletLayer2NFT({
                  page: Number(searchParams.get("collectionPage")) ?? 1,
                  collection: nftTransferValue.collectionMeta?.contractAddress,
                });
              } else {
                history.push({
                  pathname: `/NFT/assetsNFT/byList`,
                  search,
                });
                updateWalletLayer2NFT({
                  page,
                  collection: undefined,
                });
              }
              setShowNFTDetail({ isShow: false });
              resetNFTTransferData();
            }
          } else {
            resetNFTTransferData();
          }
        }
      } catch (reason: any) {
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
              info: {
                symbol: nftTransferValue.name,
              },
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTTransfer_Failed,
              info: {
                symbol: nftTransferValue.name,
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
      nftTransferValue.name,
      checkFeeIsEnough,
      updateWalletLayer2NFT,
      page,
      setShowNFTDetail,
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
        nftTransferValue?.fee?.feeRaw &&
        eddsaKey?.sk
      ) {
        try {
          setShowNFTTransfer({ isShow: false });
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTTransfer_WaitForAuth,
          });
          const feeToken = tokenMap[nftTransferValue.fee.belong];
          const feeRaw =
            nftTransferValue.fee.feeRaw ??
            nftTransferValue.fee.__raw__?.feeRaw ??
            0;
          const fee = sdk.toBig(feeRaw);
          const tradeValue = nftTransferValue.tradeValue;
          const balance = nftTransferValue.balance;
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
        } catch (e: any) {
          sdk.dumpError400(e);
          // nftTransfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTTransfer_Failed,
            error: {
              code: UIERROR_CODE.UNKNOWN,
              msg: e?.message,
            },
          });
        }
      } else {
        return;
      }
    },
    [
      account,
      tokenMap,
      exchangeInfo,
      setShowAccount,
      realAddr,
      address,
      processRequest,
    ]
  );

  const handlePanelEvent = useCallback(
    async (data: SwitchData<R>, _switchType: "Tomenu" | "Tobutton") => {
      return new Promise<void>((res: any) => {
        if (data.to === "button") {
          if (data.tradeData.belong) {
            updateNFTTransferData({
              belong: data.tradeData.belong,
              tradeValue: data.tradeData?.tradeValue,
              balance: data.tradeData.balance,
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
  const nftTransferProps: TransferProps<R, T> = {
    handleOnMemoChange,
    memo,
    type: "NFT",
    addressDefault: address,
    realAddr,
    handleSureItsLayer2: (sure: WALLET_TYPE) => {
      setSureItsLayer2(sure);
    },
    // isConfirmTransfer,
    sureItsLayer2,
    tradeData: { ...nftTransferValue } as unknown as R,
    coinMap: totalCoinMap as CoinMap<T>,
    walletMap: {},
    transferBtnStatus: btnStatus,
    onTransferClick,
    handleFeeChange,
    handleOnAddressChange: (value: any) => {
      setAddress(value || "");
    },
    addrStatus,
    feeInfo,
    chargeFeeTokenList,
    isFeeNotEnough,
    handlePanelEvent,
    isLoopringAddress,
    baseURL,
    getIPFSString,
    isSameAddress,
    isAddressCheckLoading,
  };
  // const cancelNFTTransfer = () => {
  //   resetDefault();
  // };
  return {
    nftTransferProps,
    retryBtn,
    // cancelNFTTransfer,
  };
};
