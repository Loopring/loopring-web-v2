import {
  AccountStatus,
  AddressError,
  CoinMap,
  FeeInfo,
  IBData,
  myLog,
  UIERROR_CODE,
  WALLET_TYPE,
  WalletMap,
} from "@loopring-web/common-resources";
import { useAccount, useModalData, useSystem, useTokenMap } from "../../stores";
import { AccountStep, useOpenModals } from "@loopring-web/component-lib";
import React from "react";
import { makeWalletLayer2 } from "../help";
import { useWalletLayer2Socket } from "../../services";
import { useBtnStatus } from "../common";
import * as sdk from "@loopring-web/loopring-sdk";
import { LoopringAPI } from "../../api_wrapper";
import { connectProvides } from "@loopring-web/web3-provider";
import { getTimestampDaysLater } from "../../utils";
import { DAYS } from "../../defs";
import { RAMP_SELL_PANEL } from "./useVendor";
import { banxaApiCall, BanxaCheck, banxaService } from "../../services/banxa";
import { ChainId } from "@loopring-web/loopring-sdk";
import _ from "lodash";
import { useRampTransPost } from "./useRampConfirm";

export const useBanxaConfirm = <T extends IBData<I>, I, _C extends FeeInfo>({
  sellPanel,
  setSellPanel,
}: {
  sellPanel: RAMP_SELL_PANEL;
  setSellPanel: (value: RAMP_SELL_PANEL) => void;
}) => {
  const subject = React.useMemo(() => banxaService.onSocket(), []);
  const nodeTimer = React.useRef<NodeJS.Timeout | -1>(-1);

  const { exchangeInfo, chainId } = useSystem();

  const {
    allowTrade: { raw_data },
  } = useSystem();
  const legalEnable = (raw_data as any)?.legal?.enable;
  const { tokenMap, totalCoinMap } = useTokenMap();
  const {
    setShowAccount,
    modals: {
      isShowAccount: { info },
    },
  } = useOpenModals();
  const { account } = useAccount();
  const [balanceNotEnough, setBalanceNotEnough] = React.useState(false);
  const { offBanxaValue, updateOffBanxaData } = useModalData();
  const {
    processRequestRampTransfer: processRequest,
    chargeFeeTokenList,
    isFeeNotEnough,
    handleFeeChange,
    feeInfo,
    checkFeeIsEnough,
  } = useRampTransPost();
  const [walletMap, setWalletMap] = React.useState(
    makeWalletLayer2(true).walletMap ?? ({} as WalletMap<T>)
  );
  const walletLayer2Callback = React.useCallback(() => {
    const walletMap = makeWalletLayer2(true).walletMap ?? {};
    setWalletMap(walletMap);
  }, []);

  useWalletLayer2Socket({ walletLayer2Callback });

  const { btnStatus, enableBtn, disableBtn } = useBtnStatus();
  const { transferBanxaValue, updateTransferBanxaData } = useModalData();

  React.useEffect(() => {
    if (
      info?.transferBanax === AccountStep.Transfer_BANXA_Failed &&
      info?.trigger == "checkFeeIsEnough"
    ) {
      checkFeeIsEnough();
    }
  }, [info?.transferBanax]);

  const checkBtnStatus = React.useCallback(() => {
    if (
      tokenMap &&
      chargeFeeTokenList.length &&
      !isFeeNotEnough.isFeeNotEnough &&
      transferBanxaValue.belong &&
      tokenMap[transferBanxaValue.belong] &&
      transferBanxaValue.fee &&
      transferBanxaValue.fee.belong &&
      transferBanxaValue.address
    ) {
      const sellToken = tokenMap[transferBanxaValue.belong];
      const feeToken = tokenMap[transferBanxaValue.fee.belong];
      const feeRaw =
        transferBanxaValue.fee.feeRaw ??
        transferBanxaValue.fee.__raw__?.feeRaw ??
        0;
      const fee = sdk.toBig(feeRaw);
      const balance = sdk
        .toBig(transferBanxaValue.balance ?? 0)
        .times("1e" + sellToken.decimals);
      const tradeValue = sdk
        .toBig(transferBanxaValue.tradeValue ?? 0)
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
        if (isExceedBalance) {
          setBalanceNotEnough(true);
        }
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
    transferBanxaValue.address,
    transferBanxaValue.balance,
    transferBanxaValue.belong,
    transferBanxaValue.fee,
    transferBanxaValue.tradeValue,
  ]);

  React.useEffect(() => {
    checkBtnStatus();
  }, [chargeFeeTokenList, isFeeNotEnough.isFeeNotEnough, transferBanxaValue]);

  const onTransferClick = React.useCallback(
    async (transferBanaxValue, isFirstTime: boolean = true) => {
      const { accountId, accAddress, readyState, apiKey, eddsaKey } = account;

      if (
        readyState === AccountStatus.ACTIVATED &&
        tokenMap &&
        LoopringAPI.userAPI &&
        exchangeInfo &&
        connectProvides.usedWeb3 &&
        transferBanaxValue.address !== "*" &&
        transferBanaxValue?.fee &&
        transferBanaxValue?.fee.belong &&
        transferBanaxValue.fee?.__raw__ &&
        eddsaKey?.sk
      ) {
        try {
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_BANXA_WaitForAuth,
          });

          const sellToken = tokenMap[transferBanaxValue.belong as string];
          const feeToken = tokenMap[transferBanaxValue.fee.belong];
          const feeRaw =
            transferBanaxValue.fee.feeRaw ??
            transferBanaxValue.fee.__raw__?.feeRaw ??
            0;
          const fee = sdk.toBig(feeRaw);
          // const balance = sdk
          //   .toBig(transferBanaxValue.balance ?? 0)
          //   .times("1e" + sellToken.decimals);
          const tradeValue = sdk
            .toBig(transferBanaxValue.tradeValue ?? 0)
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
            payeeAddr: transferBanaxValue.address,
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
            memo: transferBanaxValue.memo,
          };

          myLog("transfer req:", req);

          processRequest(req, isFirstTime);
        } catch (e: any) {
          // transfer failed
          setShowAccount({
            isShow: true,
            step: AccountStep.Transfer_BANXA_Failed,
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

  const checkOrderStatus = _.debounce(async (orders: any) => {
    if (nodeTimer.current) {
      clearTimeout(nodeTimer.current as NodeJS.Timeout);
    }
    let orderId = "dd734aec66eb781ecc7f7bb01274ec63";
    banxaApiCall({
      chainId: chainId as ChainId,
      method: sdk.ReqMethod.GET,
      url: `api/orders/${orderId}`,
      query: "",
      payload: undefined,
    });
    const memo = "OFF-Banxa Transfer";
    //TODO status=== 'pendingPayment'
    if (
      orders.status === "pendingPayment" &&
      orders.wallet_address &&
      orders.coin_code
    ) {
      banxaService.KYCDone();
      updateOffBanxaData({ ...orders });
      updateTransferBanxaData({
        belong: orders.coin_code,
        tradeValue: orders.coin_amount,
        balance: walletMap[orders.coin_code]?.count,
        address: orders.wallet_address,
        memo,
        fee: feeInfo,
      });
      setSellPanel(RAMP_SELL_PANEL.BANXA_CONFIRM);
    } else {
      setTimeout(() => {
        checkOrderStatus(orders);
      }, 1000 * 15);
    }
  }, 100);
  React.useEffect(() => {
    const subscription = subject.subscribe((props) => {
      myLog("subscription Banxa ", props);
      switch (props.status) {
        case BanxaCheck.CheckOrderStatus:
          // @ts-ignore
          checkOrderStatus(props.data.order);
          break;
        case BanxaCheck.OrderEnd:
          clearTimeout(nodeTimer.current as NodeJS.Timeout);
          break;
        default:
          break;
      }
    });
    return () => {
      clearTimeout(nodeTimer.current as NodeJS.Timeout);
      subscription.unsubscribe();
    };
  }, [subject]);

  React.useEffect(() => {
    if (
      info?.transferBanax === AccountStep.Transfer_BANXA_Failed &&
      info?.trigger == "checkFeeIsEnough"
    ) {
      checkFeeIsEnough();
    }
  }, [info?.transferBanxa]);

  const banxaViewProps = React.useMemo(() => {
    const { address, memo, fee, __request__, ...tradeData } =
      transferBanxaValue;

    return {
      type: "TOKEN",
      disabled: !legalEnable,
      addressDefault: address,
      realAddr: address,
      tradeData,
      coinMap: totalCoinMap as CoinMap<T>,
      transferBtnStatus: btnStatus,
      isLoopringAddress: true,
      isSameAddress: false,
      isAddressCheckLoading: WALLET_TYPE.Loopring,
      feeInfo,
      handleFeeChange,
      balanceNotEnough,
      chargeFeeTokenList,
      isFeeNotEnough,
      handleSureItsLayer2: () => undefined,
      sureItsLayer2: true,
      onTransferClick,
      handlePanelEvent: () => undefined,
      addrStatus: AddressError.NoError,
      memo,
      walletMap,
      handleOnMemoChange: () => undefined,
      handleOnAddressChange: () => undefined,
    } as any;
  }, [
    balanceNotEnough,
    btnStatus,
    chargeFeeTokenList,
    feeInfo,
    handleFeeChange,
    isFeeNotEnough,
    legalEnable,
    onTransferClick,
    totalCoinMap,
    transferBanxaValue,
    walletMap,
  ]);

  return { banxaViewProps, offBanxaValue };
};
