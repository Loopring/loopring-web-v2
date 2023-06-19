import React from "react";

import * as sdk from "@loopring-web/loopring-sdk";

import { ConnectProviders, connectProvides } from "@loopring-web/web3-provider";

import {
  AccountStep,
  SwitchData,
  TransferProps,
  useOpenModals,
  useSettings,
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
  AddressError,
  WALLET_TYPE,
  LIVE_FEE_TIMES,
  SUBMIT_PANEL_AUTO_CLOSE,
  FeeInfo,
  PriceTag,
  CurrencyToTag,
  getValuePrecisionThousand,
  EmptyValueTag,
  TRADE_TYPE,
  EXCHANGE_TYPE,
} from "@loopring-web/common-resources";

import {
  BIGO,
  DAYS,
  getTimestampDaysLater,
  LoopringAPI,
  makeWalletLayer2,
  useAddressCheck,
  useBtnStatus,
  useWalletLayer2Socket,
  walletLayer2Service,
  useSystem,
  useTokenMap,
  useAccount,
  useChargeFees,
  useModalData,
  store,
  isAccActivated,
  LAST_STEP,
  volumeToCountAsBigNumber,
  useTokenPrices,
  useIsHebao,
  RootState,
  useAddressCheckWithContacts,
  createImageFromInitials,
} from "../../index";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import Web3 from "web3";
import {
  addressToExWalletMapFn,
  exWalletToAddressMapFn,
} from "@loopring-web/core";
import { useTheme } from "@emotion/react";
import { useContacts } from "../../stores/contacts/hooks";

const checkIsHebao = (accountAddress: string) => LoopringAPI.walletAPI!.getWalletType({
  wallet: accountAddress,
}).then(walletType => {
  return walletType?.walletType?.loopringWalletContractVersion !== ""
})
type DisplayContact = {
  name: string
  address: string
  avatarURL: string
  editing: boolean
  addressType: sdk.AddressType
}
export const getAllContacts = async (offset: number, accountId: number, apiKey: string, accountAddress: string, color: string) => {
  const limit = 100
  const recursiveLoad = async (offset: number): Promise<DisplayContact[]> => {
    const isHebao = await checkIsHebao(accountAddress)
    const response = await LoopringAPI.contactAPI!.getContacts({
      isHebao,
      accountId,
      limit,
      offset
    }, apiKey)
    const displayContacts = response.contacts
      .filter(contact => contact.addressType !== sdk.AddressType.OFFICIAL)
      .map((contact) => {
        return {
          name: contact.contactName,
          address: contact.contactAddress,
          avatarURL: createImageFromInitials(32, contact.contactName, color),
          editing: false,
          addressType: contact.addressType
        } as DisplayContact
      })
    if (response.total > offset + limit) {
      const rest = await recursiveLoad(offset + limit)
      return displayContacts.concat(rest)
    } else {
      return displayContacts
    }
  }
  return recursiveLoad(offset)
}

export const useTransfer = <R extends IBData<T>, T>() => {
  const { setShowAccount, setShowTransfer } = useOpenModals();

  const {
    modals: {
      isShowTransfer: {
        symbol,
        isShow,
        info,
        address: contactAddress,
        name: contactName,
        addressType: contactAddressType,
      },
    },
  } = useOpenModals();
  const [memo, setMemo] = React.useState("");
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { account, status: accountStatus } = useAccount();
  const { exchangeInfo, chainId, forexMap } = useSystem();
  const { currency } = useSettings();
  const { tokenPrices } = useTokenPrices();

  const { transferValue, updateTransferData, resetTransferData } =
    useModalData();

  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<R>)
  );

  const [sureItsLayer2, setSureItsLayer2] =
    React.useState<WALLET_TYPE | EXCHANGE_TYPE | undefined>(undefined);

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();
  const [feeWithActive, setFeeWithActive] = React.useState(false);

  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    resetIntervalTime,
  } = useChargeFees({
    requestType: feeWithActive
      ? sdk.OffchainFeeReqType.TRANSFER_AND_UPDATE_ACCOUNT
      : sdk.OffchainFeeReqType.TRANSFER,
    updateData: ({ fee, requestType }) => {
      let _requestType = feeWithActive
        ? sdk.OffchainFeeReqType.TRANSFER_AND_UPDATE_ACCOUNT
        : sdk.OffchainFeeReqType.TRANSFER;
      if (_requestType === requestType) {
        const transferValue = store.getState()._router_modalData.transferValue;
        updateTransferData({ ...transferValue, fee });
      }
    },
    //   [feeWithActive]
    // ),
  });
  const {
    chargeFeeTokenList: activeAccountFeeList,
    checkFeeIsEnough: checkActiveFeeIsEnough,
    // resetIntervalTime: resetActiveIntervalTime,
  } = useChargeFees({
    isActiveAccount: true,
    requestType: undefined as any,
  });
  const handleOnMemoChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMemo(e.target.value);
    },
    []
  );

  const {
    address,
    realAddr,
    setAddress,
    addrStatus,
    isLoopringAddress,
    isActiveAccount,
    isAddressCheckLoading,
    isActiveAccountFee,
    isSameAddress,
    isContractAddress,
    loopringSmartWalletVersion,
    reCheck
  } = useAddressCheckWithContacts(true);

  const checkBtnStatus = React.useCallback(() => {
    if (tokenMap && transferValue.belong && tokenMap[transferValue.belong]) {
      const sellToken = tokenMap[transferValue.belong];
      const tradeValue = sdk
        .toBig(transferValue.tradeValue ?? 0)
        .times("1e" + sellToken.decimals);

      if (
        tradeValue &&
        chargeFeeTokenList.length &&
        !isFeeNotEnough.isFeeNotEnough &&
        !isSameAddress &&
        // !isAddressCheckLoading &&
        sureItsLayer2 &&
        transferValue.fee?.belong &&
        tradeValue.gt(BIGO) &&
        ((address && address.startsWith("0x")) || realAddr) &&
        (addrStatus as AddressError) === AddressError.NoError
      ) {
        enableBtn();
        return;
      }
    }
    disableBtn();
  }, [
    realAddr,
    tokenMap,
    transferValue,
    disableBtn,
    sureItsLayer2,
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
    realAddr,
    chargeFeeTokenList,
    address,
    sureItsLayer2,
    isFeeNotEnough.isFeeNotEnough,
    isAddressCheckLoading,
    transferValue,
    addrStatus
  ]);

  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(true).walletMap ?? {};
    setWalletMap(walletMap);
  }, []);

  useWalletLayer2Socket({ walletLayer2Callback });

  const resetDefault = React.useCallback(() => {
    if (info?.isRetry) {
      checkFeeIsEnough();
      return;
    }
    checkFeeIsEnough({ isRequiredAPI: true, intervalTime: LIVE_FEE_TIMES });
    // checkActiveFeeIsEnough({
    //   isRequiredAPI: true,
    //   intervalTime: LIVE_FEE_TIMES,
    // });
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
              tradeValue: undefined,
              fee: feeInfo,
              balance: walletInfo?.count,
              address: "*",
            });
            break;
          }
        }
      } else if (transferValue.belong && walletMap) {
        const walletInfo = walletMap[transferValue.belong];
        updateTransferData({
          fee: feeInfo,
          belong: transferValue.belong,
          tradeValue: undefined,
          balance: walletInfo?.count,
          address: info?.isToMyself ? account.accAddress : "*",
        });
      } else {
        updateTransferData({
          fee: feeInfo,
          belong: transferValue.belong,
          tradeValue: undefined,
          balance: undefined,
          address: info?.isToMyself ? account.accAddress : "*",
        });
      }
    }
    setMemo("");
    if (contactAddress) {
      setAddress(contactAddress);
    } else {
      setAddress("");
    }
  }, [
    checkFeeIsEnough,
    symbol,
    walletMap,
    updateTransferData,
    feeInfo,
    transferValue.belong,
    info?.isRetry,
    contactAddress,
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
      checkActiveFeeIsEnough({
        isRequiredAPI: true,
        requestType: undefined as any,
      });
    }
    return () => {
      resetIntervalTime();
      setAddress("");
      checkActiveFeeIsEnough({
        isRequiredAPI: true,
        requestType: undefined as any,
      });
    };
  }, [isShow]);

  const { checkHWAddr, updateHW } = useWalletInfo();

  const [lastRequest, setLastRequest] = React.useState<any>({});

  const processRequest = React.useCallback(
    async (
      request: sdk.OriginTransferRequestV3,
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
          setLastRequest({ request });
          const response = await LoopringAPI.userAPI.submitInternalTransfer(
            {
              request,
              web3: connectProvides.usedWeb3 as unknown as Web3,
              chainId:
                chainId !== sdk.ChainId.GOERLI ? sdk.ChainId.MAINNET : chainId,
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

          myLog("submitInternalTransfer:", response);
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            throw response;
          }
          info?.onCloseCallBack && info?.onCloseCallBack();
          setShowTransfer({ isShow: false });
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_In_Progress,
          });
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_Success,
            info: {
              hash:
                Explorer + `tx/${(response as sdk.TX_HASH_API)?.hash}-transfer`,
            },
          });
          if (isHWAddr) {
            myLog("......try to set isHWAddr", isHWAddr);
            updateHW({ wallet: account.accAddress, isHWAddr });
          }
          resetTransferData();
          walletLayer2Service.sendUserUpdate();
          await sdk.sleep(SUBMIT_PANEL_AUTO_CLOSE);
          if (
            store.getState().modals.isShowAccount.isShow &&
            store.getState().modals.isShowAccount.step ==
              AccountStep.Transfer_Success
          ) {
            setShowAccount({ isShow: false });
          }
        }
      } catch (e: any) {
        const code = sdk.checkErrorInfo(e, isNotHardwareWallet);
        switch (code) {
          case sdk.ConnectorError.NOT_SUPPORT_ERROR:
            setLastRequest({ request });
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_First_Method_Denied,
            });
            break;
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setLastRequest({ request });
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_User_Denied,
            });
            break;

          default:
            if (
              [102024, 102025, 114001, 114002].includes(
                (e as sdk.RESULT_INFO)?.code || 0
              )
            ) {
              checkFeeIsEnough({
                isRequiredAPI: true,
                requestType: feeWithActive
                  ? sdk.OffchainFeeReqType.TRANSFER_AND_UPDATE_ACCOUNT
                  : sdk.OffchainFeeReqType.TRANSFER,
              });
            }
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_Failed,
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
      setShowTransfer,
      resetTransferData,
      updateHW,
      checkFeeIsEnough,
    ]
  );

  const onTransferClick = React.useCallback(
    async (_transferValue, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;
      const transferValue = store.getState()._router_modalData.transferValue;
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
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_WaitForAuth,
          });

          const sellToken = tokenMap[transferValue.belong as string];
          const feeToken = tokenMap[transferValue.fee.belong];
          const feeRaw =
            transferValue.fee.feeRaw ?? transferValue.fee.__raw__?.feeRaw ?? 0;
          const fee = sdk.toBig(feeRaw);
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
            payPayeeUpdateAccount: !isActiveAccountFee && feeWithActive,
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
        } catch (e: any) {
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_Failed,
            error: {
              code: UIERROR_CODE.UNKNOWN,
              message: e.message,
            } as sdk.RESULT_INFO,
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
      isActiveAccountFee,
      feeWithActive,
    ]
  );

  const handlePanelEvent = React.useCallback(
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
  const activeAccountPrice = React.useMemo(() => {
    if (
      realAddr !== "" &&
      isActiveAccount == false &&
      activeAccountFeeList.length &&
      activeAccountFeeList[0] &&
      tokenPrices &&
      activeAccountFeeList[0].feeRaw
    ) {
      const feeInfo: FeeInfo = activeAccountFeeList[0];
      const feeU: any =
        volumeToCountAsBigNumber(feeInfo.belong, feeInfo.feeRaw ?? 0)?.times(
          tokenPrices[feeInfo.belong]
        ) ?? undefined;

      return feeU && currency && forexMap[currency]
        ? "～" +
            PriceTag[CurrencyToTag[currency]] +
            getValuePrecisionThousand(
              // @ts-ignore
              feeU * forexMap[currency],
              2,
              2,
              2,
              true,
              { floor: true }
            )
        : EmptyValueTag;
    } else {
      return;
    }
    // return activeAccountFeeList?.find(
    //   (item: any) => item.belong == feeInfo.belong
    // );
  }, [isActiveAccount, activeAccountFeeList, tokenPrices, currency]);

  React.useEffect(() => {
    if (realAddr !== "" && isActiveAccount === false) {
      checkActiveFeeIsEnough({
        isRequiredAPI: true,
        requestType: "TRANSFER_ACTIVE",
      });
    }
  }, [isActiveAccount, realAddr]);

  const { isHebao } = useIsHebao();
  // const contacts = useSelector((state: RootState) => state.contacts.contacts);
  // const dispatch = useDispatch();
  const {contacts} = useContacts()
  React.useEffect(() => {
    const addressType = contacts?.find(
      (x) => x.address === realAddr
    )?.addressType;
    if (isShow === false) {
      setSureItsLayer2(undefined);
    } else if (addressType !== undefined) {
      const found = addressType
        ? addressToExWalletMapFn(addressType)
        : undefined;
      setSureItsLayer2(found);
    }
  }, [realAddr, isShow, contacts]);
  const { account: {accountId, apiKey, accAddress} } = useAccount()
  
  const {currentAccountId: cachedForAccountId, updateAccountId, updateContacts}  = useContacts() 
  const theme = useTheme()
  const loadContacts = React.useCallback(async () => {
    if (accountId === cachedForAccountId) return
    updateContacts(undefined)
    try {
      const allContacts = await getAllContacts(0, accountId, apiKey, accAddress, theme.colorBase.warning)
      updateContacts
      updateContacts(allContacts)
      updateAccountId(accountId)
    } catch (e) {
      updateContacts([])
    }
  }, [cachedForAccountId, apiKey, accountId, accAddress]) 
  React.useEffect(() => {
    loadContacts()
  }, [apiKey])
  const transferProps: TransferProps<any, any> = {
    type: TRADE_TYPE.TOKEN,
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
    handleSureItsLayer2: (sure) => {
      const found = exWalletToAddressMapFn(sure)!;
      const contact = contacts?.find((x) => x.address === realAddr);
      if (isHebao !== undefined && contact) {
        LoopringAPI.contactAPI
          ?.updateContact(
            {
              contactAddress: realAddr,
              isHebao,
              accountId: account.accountId,
              addressType: found,
              contactName: contact.name,
            },
            account.apiKey
          )
          .then(() => {
            updateContacts(
              contacts?.map((x) => {
                if (x.address === realAddr) {
                  return { ...x, addressType: found };
                } else {
                  return x;
                }
              })
            )
            reCheck()
          });
      }
      setSureItsLayer2(sure);
    },
    lastFailed:
      store.getState().modals.isShowAccount.info?.lastFailed ===
      LAST_STEP.transfer,
    // isConfirmTransfer,
    sureItsLayer2,
    chargeFeeTokenList,
    activeAccountPrice,
    isFeeNotEnough,
    isLoopringAddress,
    isSameAddress,
    isAddressCheckLoading,
    addrStatus,
    memo,
    handleOnMemoChange,
    handleOnAddressChange: (value: any, isContactSelection?: boolean) => {
      checkActiveFeeIsEnough({
        isRequiredAPI: true,
        requestType: undefined as any,
      });
      setAddress((state) => {
        if (isContactSelection) {
          const contact = contacts?.find((x) => x.address === value);
          const v = contact && addressToExWalletMapFn(contact.addressType);
          v && setSureItsLayer2(v);
        } else {
          setSureItsLayer2(undefined);
        }
        if (state !== value || "") {
          // flag = true;
          setFeeWithActive((state) => {
            if (state !== false) {
              checkFeeIsEnough({
                isRequiredAPI: true,
                requestType: sdk.OffchainFeeReqType.TRANSFER,
              });
            }
            return false;
          });
        }

        return value || "";
      });
    },
    isActiveAccount,
    isActiveAccountFee,
    feeWithActive,
    handleOnFeeWithActive: (value: boolean) => {
      setFeeWithActive(value);
      if (value && !isActiveAccountFee) {
        checkFeeIsEnough({
          isRequiredAPI: true,

          requestType: sdk.OffchainFeeReqType.TRANSFER_AND_UPDATE_ACCOUNT,
        });
      } else {
        checkFeeIsEnough({
          isRequiredAPI: true,
          requestType: sdk.OffchainFeeReqType.TRANSFER,
        });
      }
    },
    isSmartContractAddress: isContractAddress,
    isFromContact: contactAddress ? true : false,
    contact: contactAddress
      ? {
          address: contactAddress,
          name: contactName!,
          addressType: contactAddressType!,
        }
      : undefined,
    loopringSmartWalletVersion,
    contacts
  };

  return {
    retryBtn,
    transferProps,
  };
};
