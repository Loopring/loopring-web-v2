import {
  AddressItemType,
  EXCHANGE_TYPE,
  L1L2_NAME_DEFINED,
  MapChainId,
  WALLET_TYPE,
} from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";
import { useSettings } from "../../../../stores";

export const useAddressTypeLists = <
  T extends WALLET_TYPE | EXCHANGE_TYPE
>() => {
  const { t } = useTranslation("common");
  const { defaultNetwork } = useSettings();
  const network = MapChainId[defaultNetwork] ?? MapChainId[1];
  const walletList: AddressItemType<T>[] = [
    {
      label: t("labelWalletTypeOptions", {
        type: t(`labelWalletType${WALLET_TYPE.EOA}`),
      }),
      value: WALLET_TYPE.EOA as T,
      description: t(`label${WALLET_TYPE.EOA}Des`),
    },
    {
      label: t("labelWalletTypeOptions", {
        type: t(`labelWalletType${WALLET_TYPE.Loopring}`),
      }),
      value: WALLET_TYPE.Loopring as T,
      description: t(`label${WALLET_TYPE.Loopring}Des`),
    },
    {
      label: t("labelWalletTypeOptions", {
        type: t(`labelWalletType${WALLET_TYPE.OtherSmart}`),
      }),
      disabled: true,
      value: WALLET_TYPE.OtherSmart as T,
      description: t(`label${WALLET_TYPE.OtherSmart}Des`),
    },
    {
      label: t(WALLET_TYPE.Exchange),
      value: WALLET_TYPE.Exchange as T,
      disabled: true,
      description: t(`label${WALLET_TYPE.Exchange}Des`),
    },
  ];
  const walletListFn: (type: WALLET_TYPE) => AddressItemType<T>[] = (
    type: WALLET_TYPE
  ) => {
    if (type === WALLET_TYPE.Exchange) throw "wrong type";
    return [
      {
        label: t("labelWalletTypeOptions", {
          type: t(`labelWalletType${WALLET_TYPE.EOA}`),
        }),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: WALLET_TYPE.EOA as T,
        description: t(`label${WALLET_TYPE.EOA}Des`),
      },
      {
        label: t("labelWalletTypeOptions", {
          type: t(`labelWalletType${WALLET_TYPE.Loopring}`),
        }),
        disabled: type === WALLET_TYPE.Loopring ? false : true,
        value: WALLET_TYPE.Loopring as T,
        description: t(`label${WALLET_TYPE.Loopring}Des`),
      },
      {
        label: t("labelWalletTypeOptions", {
          type: t(`labelWalletType${WALLET_TYPE.OtherSmart}`),
        }),
        disabled: type === WALLET_TYPE.OtherSmart ? false : true,
        value: WALLET_TYPE.OtherSmart as T,
        description: t(`label${WALLET_TYPE.OtherSmart}Des`),
      },
      {
        label: t(`labelExchange${EXCHANGE_TYPE.Binance}`),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: EXCHANGE_TYPE.Binance as T,
        description: t("labelContactsBinanceNotSupportted", {
          layer2: L1L2_NAME_DEFINED[network].layer2,
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      },
      {
        label: t(`labelExchange${EXCHANGE_TYPE.Huobi}`),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: EXCHANGE_TYPE.Huobi as T,
        description: t("labelContactsHuobiNotSupportted", {
          layer2: L1L2_NAME_DEFINED[network].layer2,
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      },
      {
        label: t(`labelExchange${EXCHANGE_TYPE.Others}`),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: EXCHANGE_TYPE.Others as T,
        description: t("labelContactsOtherExchangesNotSupportted", {
          layer2: L1L2_NAME_DEFINED[network].layer2,
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      },
    ];
  };
  const nonExchangeList: AddressItemType<T>[] = [
    {
      label: t(`labelNonExchangeType`),
      value: EXCHANGE_TYPE.NonExchange as T,
      disabled: false,
      description: t(`labelNonExchangeTypeDes`),
    },
  ];
  const exchangeList: AddressItemType<T>[] = [
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Binance}`),
      value: EXCHANGE_TYPE.Binance as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Binance}Des`),
      maxWidth: "initial",
    },
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Huobi}`),
      value: EXCHANGE_TYPE.Huobi as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Huobi}Des`),
      maxWidth: "initial",
    },
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Others}`),
      value: EXCHANGE_TYPE.Others as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Others}Des`),
      maxWidth: "initial",
    },
  ];
  return {
    walletList,
    walletListFn,
    nonExchangeList,
    exchangeList,
  };
};
