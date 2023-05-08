import {
  AddressItemType,
  EXCHANGE_TYPE,
  WALLET_TYPE,
} from "@loopring-web/common-resources";
import { useTranslation } from "react-i18next";

export const useAddressTypeLists = <
  T extends WALLET_TYPE | EXCHANGE_TYPE
>() => {
  const { t } = useTranslation("common");
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
        // todo translation
        description:
          "Binance currently do not support Loopring L2 transfers. You will need to send funds to the L1 account.",
        // t(`label${WALLET_TYPE.OtherSmart}Des`),
      },
      {
        label: t(`labelExchange${EXCHANGE_TYPE.Huobi}`),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: EXCHANGE_TYPE.Huobi as T,
        // todo translation
        description:
          "Huobi currently do not support Loopring L2 transfers. You will need to send funds to the L1 account. Transactions need to wait for 24 hours.",
        // t(`label${WALLET_TYPE.OtherSmart}Des`),
      },
      {
        label: t(`labelExchange${EXCHANGE_TYPE.Others}`),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: EXCHANGE_TYPE.Others as T,
        // todo translation
        description:
          "The trading platforms currently do not support Loopring L2 transfers. You will need to send funds to the L1 account.",
        // t(`label${WALLET_TYPE.OtherSmart}Des`),
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
