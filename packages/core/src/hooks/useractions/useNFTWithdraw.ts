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
  myLog,
  SagaStatus,
  TradeNFT,
  UIERROR_CODE,
  AddressError,
  EXCHANGE_TYPE,
} from "@loopring-web/common-resources";

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
  useWalletLayer2Socket,
  walletLayer2Service,
  checkErrorInfo,
  useModalData,
  isAccActivated,
  useChargeFees,
  useWalletLayer2NFT,
  useSystem,
} from "../../index";
import { useWalletInfo } from "../../stores/localStore/walletInfo";

export const useNFTWithdraw = <R extends TradeNFT<any>, T>({
  isLocalShow = false,
  doWithdrawDone,
  isToMyself = false,
}: {
  isToMyself?: boolean;
  isLocalShow?: boolean;
  doWithdrawDone?: () => void;
}) => {
  const {
    modals: {
      isShowNFTWithdraw: { isShow, nftData, nftBalance, ...nftRest },
    },
    setShowAccount,
    setShowNFTWithdraw,
  } = useOpenModals();

  const { tokenMap, totalCoinMap, disableWithdrawList } = useTokenMap();
  const { account, status: accountStatus } = useAccount();
  const { exchangeInfo, chainId } = useSystem();
  const { page, updateWalletLayer2NFT } = useWalletLayer2NFT();

  const { nftWithdrawValue, updateNFTWithdrawData, resetNFTWithdrawData } =
    useModalData();

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  } = useChargeFees({
    requestType: sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL,
    tokenAddress: nftWithdrawValue.tokenAddress,
    deployInWithdraw:
      nftWithdrawValue.isCounterFactualNFT &&
      nftWithdrawValue.deploymentStatus === "NOT_DEPLOYED",
    updateData: ({ fee }) => {
      updateNFTWithdrawData({ ...nftWithdrawValue, fee });
    },
  });

  const { checkHWAddr, updateHW } = useWalletInfo();
  const [sureIsAllowAddress, setSureIsAllowAddress] =
    React.useState<EXCHANGE_TYPE | undefined>(undefined);

  const [lastRequest, setLastRequest] = React.useState<any>({});

  const {
    address,
    realAddr,
    setAddress,
    addrStatus,
    isCFAddress,
    // isContractAddress,
    isContract1XAddress,
    isAddressCheckLoading,
  } = useAddressCheck();
  React.useEffect(() => {
    setSureIsAllowAddress(undefined);
  }, [realAddr]);

  const isNotAvaiableAddress = isCFAddress
    ? "isCFAddress"
    : isContract1XAddress
    ? "isContract1XAddress"
    : undefined;

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();

  const checkBtnStatus = React.useCallback(() => {
    if (
      tokenMap &&
      nftWithdrawValue?.fee?.belong &&
      nftWithdrawValue?.tradeValue &&
      sdk.toBig(nftWithdrawValue.tradeValue).gt(BIGO) &&
      sdk
        .toBig(nftWithdrawValue.tradeValue)
        .lte(Number(nftWithdrawValue.nftBalance) ?? 0) &&
      (addrStatus as AddressError) === AddressError.NoError &&
      !isFeeNotEnough &&
      !isNotAvaiableAddress &&
      ((address && address.startsWith("0x")) || realAddr)
    ) {
      enableBtn();
      myLog("enableBtn");
      return;
    }
    disableBtn();
  }, [
    tokenMap,
    nftWithdrawValue?.fee?.belong,
    nftWithdrawValue.tradeValue,
    nftWithdrawValue.nftBalance,
    addrStatus,
    isFeeNotEnough,
    address,
    disableBtn,
    enableBtn,
    isNotAvaiableAddress,
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [
    address,
    addrStatus,
    isFeeNotEnough,
    nftWithdrawValue.fee,
    nftWithdrawValue.tradeValue,
    isNotAvaiableAddress,
  ]);

  useWalletLayer2Socket({});

  const resetDefault = React.useCallback(() => {
    checkFeeIsEnough();
    if (nftData) {
      updateNFTWithdrawData({
        belong: nftData as any,
        balance: nftBalance,
        tradeValue: undefined,
        ...nftRest,
        fee: feeInfo,
        address: address ? address : "*",
      });
    } else {
      updateNFTWithdrawData({
        fee: feeInfo,
        belong: "",
        balance: 0,
        tradeValue: 0,
        address: "*",
      });
      setShowNFTWithdraw({ isShow: false });
    }
  }, [
    nftData,
    updateNFTWithdrawData,
    nftBalance,
    nftRest,
    address,
    feeInfo,
    setShowNFTWithdraw,
  ]);

  React.useEffect(() => {
    if (isShow) {
      resetDefault();
    }
  }, [isShow]);

  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
    } else {
      setShowNFTWithdraw({ isShow: false });
    }
  }, [accountStatus, account.readyState]);

  React.useEffect(() => {
    if (
      accountStatus === SagaStatus.UNSET &&
      account.readyState === AccountStatus.ACTIVATED
    ) {
      if (nftWithdrawValue.address) {
        myLog("addr 1");
        setAddress(nftWithdrawValue.address);
      } else {
        myLog("addr 2");
        // setAddress(account.accAddress)
        updateNFTWithdrawData({
          balance: -1,
          tradeValue: -1,
        });
      }
    }
  }, [
    setAddress,
    isShow,
    nftWithdrawValue.address,
    accountStatus,
    account.readyState,
  ]);

  const processRequest = React.useCallback(
    async (request: sdk.NFTWithdrawRequestV3, isNotHardwareWallet: boolean) => {
      const { apiKey, connectName, eddsaKey } = account;

      try {
        if (connectProvides.usedWeb3 && LoopringAPI.userAPI) {
          let isHWAddr = checkHWAddr(account.accAddress);

          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }

          myLog("nftWithdraw processRequest:", isHWAddr, isNotHardwareWallet);
          const response = await LoopringAPI.userAPI.submitNFTWithdraw(
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
                  step: AccountStep.NFTWithdraw_User_Denied,
                });
              } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
                setLastRequest({ request });
                setShowAccount({
                  isShow: true,
                  step: AccountStep.NFTWithdraw_First_Method_Denied,
                  info: {
                    symbol: nftWithdrawValue.name,
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
                  step: AccountStep.NFTWithdraw_Failed,
                  error: response as sdk.RESULT_INFO,
                  info: {
                    symbol: nftWithdrawValue.name,
                  },
                });
              }
            } else if ((response as sdk.TX_HASH_API)?.hash) {
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTWithdraw_In_Progress,
              });
              await sdk.sleep(TOAST_TIME);
              setShowAccount({
                isShow: true,
                step: AccountStep.NFTWithdraw_Success,
                info: {
                  symbol: nftWithdrawValue.name,
                  hash:
                    Explorer +
                    `tx/${(response as sdk.TX_HASH_API)?.hash}-nftWithdraw${
                      account.accountId
                    }-${request.token.tokenId}-${request.storageId}`,
                },
              });
              if (isHWAddr) {
                myLog("......try to set isHWAddr", isHWAddr);
                updateHW({ wallet: account.accAddress, isHWAddr });
              }
              if (doWithdrawDone) {
                doWithdrawDone();
              }
              resetNFTWithdrawData();
            }
            walletLayer2Service.sendUserUpdate();
            updateWalletLayer2NFT({ page });
          } else {
            resetNFTWithdrawData();
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
              step: AccountStep.NFTWithdraw_User_Denied,
              info: {
                symbol: nftWithdrawValue.name,
              },
            });
          } else if (code === sdk.ConnectorError.NOT_SUPPORT_ERROR) {
            setLastRequest({ request });
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTWithdraw_First_Method_Denied,
              info: {
                symbol: nftWithdrawValue.name,
              },
            });
          } else {
            setShowAccount({
              isShow: true,
              step: AccountStep.NFTWithdraw_Failed,
              info: {
                symbol: nftWithdrawValue.name,
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
      updateWalletLayer2NFT,
      page,
      setShowAccount,
      nftWithdrawValue.tokenId,
      checkFeeIsEnough,
      doWithdrawDone,
      resetNFTWithdrawData,
      updateHW,
    ]
  );

  const handleNFTWithdraw = React.useCallback(
    async (_nftWithdrawToken: any, address, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;
      const nftWithdrawToken = {
        ...store.getState()._router_modalData.nftWithdrawValue,
        ..._nftWithdrawToken,
      };
      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        address &&
        LoopringAPI.userAPI &&
        nftWithdrawValue.fee?.belong &&
        nftWithdrawValue.fee?.__raw__ &&
        eddsaKey?.sk
      ) {
        try {
          setShowNFTWithdraw({ isShow: false });
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTWithdraw_WaitForAuth,
          });

          const feeToken = tokenMap[nftWithdrawValue.fee.belong];
          const feeRaw =
            nftWithdrawValue.fee.feeRaw ??
            nftWithdrawValue.fee.__raw__?.feeRaw ??
            0;
          const fee = sdk.toBig(feeRaw);
          // const fee = sdk.toBig(nftWithdrawValue.fee.__raw__?.feeRaw ?? 0);
          const tradeValue = nftWithdrawToken.tradeValue;

          const storageId = await LoopringAPI.userAPI.getNextStorageId(
            {
              accountId: accountId,
              sellTokenId: nftWithdrawToken.tokenId,
            },
            apiKey
          );

          const request: sdk.NFTWithdrawRequestV3 = {
            exchange: exchangeInfo.exchangeAddress,
            owner: accAddress,
            to: address,
            accountId: account.accountId,
            storageId: storageId?.offchainId,
            token: {
              tokenId: nftWithdrawToken.tokenId,
              nftData: nftWithdrawToken.nftData,
              amount: tradeValue.toString(),
            },
            maxFee: {
              tokenId: feeToken.tokenId,
              amount: fee.toString(), // TEST: fee.toString(),
            },
            // fastWithdrawalMode: nftWithdrawType2 === WithdrawType.Fast,
            extraData: "",
            minGas: 0,
            validUntil: getTimestampDaysLater(DAYS),
          };

          myLog("submitNFTWithdraw:", request);

          processRequest(request, isFirstTime);
        } catch (e: any) {
          sdk.dumpError400(e);
          setShowAccount({
            isShow: true,
            step: AccountStep.NFTWithdraw_Failed,
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
      feeInfo,
      setShowNFTWithdraw,
      setShowAccount,
      processRequest,
    ]
  );

  React.useEffect(() => {
    if (isLocalShow) {
      resetDefault();
    }
  }, [isLocalShow]);
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
  const nftWithdrawProps: WithdrawProps<any, any> = {
    handleOnAddressChange: (value: any) => {
      setAddress(value);
    },
    sureIsAllowAddress,
    handleSureIsAllowAddress: (value) => {
      setSureIsAllowAddress(value);
    },
    type: "NFT",
    addressDefault: address,
    accAddr: account.accAddress,
    isNotAvaiableAddress,
    realAddr,
    isToMyself,
    disableWithdrawList,
    tradeData: nftWithdrawValue as any,
    coinMap: totalCoinMap as CoinMap<T>,
    walletMap: {},
    isCFAddress,
    isContractAddress: isContract1XAddress,
    isAddressCheckLoading,
    addrStatus,
    withdrawBtnStatus: btnStatus,
    withdrawType: sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL,
    withdrawTypes: {
      [sdk.OffchainNFTFeeReqType.NFT_WITHDRAWAL]: "Standard",
    } as any,
    onWithdrawClick: (tradeData: R) => {
      if (nftWithdrawValue && nftWithdrawValue.tradeValue) {
        handleNFTWithdraw(tradeData, realAddr ? realAddr : address);
      }
      setShowNFTWithdraw({ isShow: false });
    },
    handleWithdrawTypeChange: () => {},
    handlePanelEvent: async (data: SwitchData<R>) => {
      return new Promise((res: any) => {
        if (data.to === "button") {
          if (data.tradeData.belong) {
            updateNFTWithdrawData({
              tradeValue: data.tradeData?.tradeValue,
              balance: data.tradeData.nftBalance,
              address: "*",
            });
          } else {
            updateNFTWithdrawData({
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
    chargeFeeTokenList,
    isFeeNotEnough,
  } as WithdrawProps<any, any>;

  return {
    nftWithdrawProps,
    retryBtn,
  };
};
