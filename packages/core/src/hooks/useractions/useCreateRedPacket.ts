import {
  AccountStatus,
  Explorer,
  FeeInfo,
  myLog,
  TOAST_TIME,
  UIERROR_CODE,
  WalletMap,
} from "@loopring-web/common-resources";
import {
  RedPacketOrderData,
  store,
  useAccount,
  useModalData,
  useSystem,
  useTokenMap,
} from "../../stores";
import {
  AccountStep,
  CreateRedPacketProps,
  useOpenModals,
} from "@loopring-web/component-lib";
import React from "react";
import { makeWalletLayer2 } from "../help";
import {
  useChargeFees,
  useWalletLayer2Socket,
  walletLayer2Service,
} from "../../services";
import { useBtnStatus } from "../common";
import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "../../api_wrapper";
import {
  ConnectProvidersSignMap,
  connectProvides,
} from "@loopring-web/web3-provider";
import { getTimestampDaysLater } from "../../utils";
import { DAYS } from "../../defs";
import Web3 from "web3";
import { isAccActivated } from "./useCheckAccStatus";
import { useWalletInfo } from "../../stores/localStore/walletInfo";
import { useGetAssets } from "@loopring-web/webapp/src/pages/AssetPage/AssetPanel/hook";

export const useCreateRedPacket = <
  T extends RedPacketOrderData<I>,
  I,
  F extends FeeInfo,
  LuckInfo
>(): CreateRedPacketProps<T, I, F, LuckInfo> => {
  const { exchangeInfo, chainId } = useSystem();
  const { tokenMap, totalCoinMap } = useTokenMap();
  const { assetsRawData } = useGetAssets();

  const {
    setShowAccount,
    // modals: {
    //   isShow: { info },
    // },
  } = useOpenModals();
  const { redPacketOrder, resetRedPacketOrder, updateRedPacketOrder } =
    useModalData();
  const { account } = useAccount();
  const { checkHWAddr, updateHW } = useWalletInfo();

  // const [balanceNotEnough, setBalanceNotEnough] = React.useState(false);
  // const { offRampValue } = useModalData();
  const {
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
    // setIsFeeNotEnough,
  } = useChargeFees({
    requestType: sdk.OffchainFeeReqType.TRANSFER,
    updateData: ({ fee }) => {
      const redPacketOrder = store.getState()._router_modalData.redPacketOrder;
      updateRedPacketOrder({ ...redPacketOrder, fee });
    },
  });

  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<T>)
  );
  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(true).walletMap ?? {};
    setWalletMap(walletMap);
  }, []);

  useWalletLayer2Socket({ walletLayer2Callback });

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();

  // React.useEffect(() => {
  //   if (
  //     info?.transferRamp === AccountStep.RedPacketSend_Failed &&
  //     info?.trigger == "checkFeeIsEnough"
  //   ) {
  //     checkFeeIsEnough();
  //   }
  // }, [info?.transferRamp]);

  const checkBtnStatus = React.useCallback(() => {
    if (
      tokenMap &&
      chargeFeeTokenList.length &&
      !isFeeNotEnough.isFeeNotEnough &&
      redPacketOrder.belong &&
      tokenMap[redPacketOrder.belong] &&
      redPacketOrder.fee &&
      redPacketOrder.fee.belong
    ) {
      const sellToken = tokenMap[redPacketOrder.belong];
      const feeToken = tokenMap[redPacketOrder.fee.belong];
      const feeRaw =
        redPacketOrder.fee.feeRaw ?? redPacketOrder.fee.__raw__?.feeRaw ?? 0;
      const fee = sdk.toBig(feeRaw);
      const balance = sdk
        .toBig(redPacketOrder.balance ?? 0)
        .times("1e" + sellToken.decimals);
      const tradeValue = sdk
        .toBig(redPacketOrder.tradeValue ?? 0)
        .times("1e" + sellToken.decimals);
      const isExceedBalance = tradeValue
        .plus(feeToken.tokenId === sellToken.tokenId ? fee : "0")
        .gt(balance);
      myLog(
        "isExceedBalance",
        isExceedBalance,
        fee.toString(),
        tradeValue.toString()
      );
      if (tradeValue && !isExceedBalance) {
        enableBtn();
        return;
      } else {
        disableBtn();
        // if (isExceedBalance && feeToken.tokenId === sellToken.tokenId) {
        //   // setIsFeeEnough(isFeeNotEnoughtrue);
        //   // setIsFeeNotEnough({
        //   //   isFeeNotEnough: true,
        //   //   isOnLoading: false,
        //   // });
        //   setBalanceNotEnough(true);
        // } else
        // if (isExceedBalance) {
        //   setBalanceNotEnough(true);
        // }
        // else {
        //
        // }
      }
    }
    disableBtn();
  }, [
    chargeFeeTokenList.length,
    disableBtn,
    enableBtn,
    isFeeNotEnough.isFeeNotEnough,
    tokenMap,
    redPacketOrder.balance,
    redPacketOrder.belong,
    redPacketOrder.fee,
    redPacketOrder.tradeValue,
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [chargeFeeTokenList, isFeeNotEnough.isFeeNotEnough, redPacketOrder]);
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
          window.rampInstance &&
          isAccActivated()
        ) {
          let isHWAddr = checkHWAddr(account.accAddress);
          if (!isHWAddr && !isNotHardwareWallet) {
            isHWAddr = true;
          }
          updateRedPacketOrder({ __request__: request } as any);
          const response = await LoopringAPI.userAPI.submitInternalTransfer(
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
          if (
            (response as sdk.RESULT_INFO).code ||
            (response as sdk.RESULT_INFO).message
          ) {
            throw response;
          }
          // setIsConfirmTransfer(false);
          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketSend_In_Progress,
          });
          await sdk.sleep(TOAST_TIME);

          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketSend_Success,
            info: {
              hash:
                Explorer + `tx/${(response as sdk.TX_HASH_API)?.hash}-transfer`,
            },
          });
          if (window.rampInstance) {
            try {
              console.log("RAMP WEIGHT display on transfer done");
              // @ts-ignore
              window.rampInstance.domNodes.overlay.style.display = "";
            } catch (e) {
              console.log("RAMP WEIGHT hidden failed");
            }
          }
          if (isHWAddr) {
            myLog("......try to set isHWAddr", isHWAddr);
            updateHW({ wallet: account.accAddress, isHWAddr });
          }
          walletLayer2Service.sendUserUpdate();
          resetRedPacketOrder();
        }
      } catch (e: any) {
        const code = sdk.checkErrorInfo(e, isNotHardwareWallet);
        switch (code) {
          case sdk.ConnectorError.NOT_SUPPORT_ERROR:
            setShowAccount({
              isShow: true,
              step: AccountStep.RedPacketSend_First_Method_Denied,
            });
            break;
          case sdk.ConnectorError.USER_DENIED:
          case sdk.ConnectorError.USER_DENIED_2:
            setShowAccount({
              isShow: true,
              step: AccountStep.RedPacketSend_User_Denied,
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
              step: AccountStep.RedPacketSend_Failed,
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
            setShowAccount({
              isShow: true,
              step: AccountStep.Transfer_Failed,
            });

            break;
        }
      }
    },
    [
      // account,
      // chainId,
      // checkHWAddr,
      // resetTransferRampData,
      // setShowAccount,
      // updateHW,
      // updateTransferRampData,
    ]
  );
  const onSubmitClick = React.useCallback(
    async (transferRampValue, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;

      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        transferRampValue.address !== "*" &&
        transferRampValue?.fee &&
        transferRampValue?.fee.belong &&
        transferRampValue.fee?.__raw__ &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketSend_WaitForAuth,
          });

          const sellToken = tokenMap[transferRampValue.belong as string];
          const feeToken = tokenMap[transferRampValue.fee.belong];
          const feeRaw =
            transferRampValue.fee.feeRaw ??
            transferRampValue.fee.__raw__?.feeRaw ??
            0;
          const fee = sdk.toBig(feeRaw);
          // const balance = sdk
          //   .toBig(transferRampValue.balance ?? 0)
          //   .times("1e" + sellToken.decimals);
          const tradeValue = sdk
            .toBig(transferRampValue.tradeValue ?? 0)
            .times("1e" + sellToken.decimals);
          // const isExceedBalance =
          //   feeToken.tokenId === sellToken.tokenId &&
          //   tradeValue.plus(fee).gt(balance);
          const finalVol = tradeValue;
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
            payeeAddr: transferRampValue.address,
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
            memo: transferRampValue.memo,
          };

          myLog("transfer req:", req);

          processRequest(req, isFirstTime);
        } catch (e: any) {
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.RedPacketSend_Failed,
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
    [account, tokenMap, exchangeInfo, setShowAccount, processRequest]
  );

  const handleOnDataChange = React.useCallback(
    (key: string, value: any) => {
      const redPacketOrder = store.getState()._router_modalData.redPacketOrder;
      myLog("redPacketOrder", redPacketOrder);
      updateRedPacketOrder({ ...redPacketOrder, [key]: value });
    },
    [updateRedPacketOrder]
  );
  // const handleOnSelectedType = (ite\
  //   handleOnDataChange();
  // };

  return {
    chargeFeeTokenList,
    onSubmitClick,
    btnStatus,
    // handleOnSelectedType,
    assetsData: assetsRawData,
    handleOnDataChange,
    walletMap,
    coinMap: totalCoinMap,
    feeInfo: redPacketOrder.fee ?? feeInfo,
    handleFeeChange,
    tradeData: redPacketOrder,

    // onBack,
    // setActiveStep,
    // handleOnDataChange
    // redPacketStepValue
    // onSubmitClick
    // activeStep
    // onBack
    // selectedType
    // handleOnSelectedType
    // type: "TOKEN",
    // memo,
    // fee,
    // __request__,
    // feeInfo,
    // walletMap,
    // handleFeeChange,
    // balanceNotEnough,
    // tradeData,
    // disabled,
    // disabled: !legalEnable,
    // addressDefault: address,
    // realAddr: address,
    // tradeData,
    // coinMap: totalCoinMap as CoinMap<T>,
    // transferBtnStatus: btnStatus,
    // isLoopringAddress: true,
    // isSameAddress: false,
    // isAddressCheckLoading: WALLET_TYPE.Loopring,
    // feeInfo,
    // handleFeeChange,
    // balanceNotEnough,
    // chargeFeeTokenList,
    // isFeeNotEnough,
    // handleSureItsLayer2: () => undefined,
    // sureItsLayer2: true,
    // onSubmitClick,
    // handlePanelEvent: () => undefined,
    // addrStatus: AddressError.NoError,
    // memo,
    // walletMap,
    // handleOnMemoChange: () => undefined,
    // handleOnAddressChange: () => undefined,
  } as unknown as CreateRedPacketProps<T, I, F, LuckInfo>;
};
