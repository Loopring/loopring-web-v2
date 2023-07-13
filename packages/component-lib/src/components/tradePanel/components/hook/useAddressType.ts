import {
  AddressItemType,
  EXCHANGE_TYPE,
  L1L2_NAME_DEFINED,
  MapChainId,
  WALLET_TYPE,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../../../stores'

export const useAddressTypeLists = <T extends WALLET_TYPE | EXCHANGE_TYPE>() => {
  const { t } = useTranslation('common')
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const walletList: AddressItemType<T>[] = [
    {
      label: t('labelWalletTypeOptions', {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        type: t(`labelWalletType${WALLET_TYPE.EOA}`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      }),
      value: WALLET_TYPE.EOA as T,
      description: t(`label${WALLET_TYPE.EOA}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
    },
    {
      label: t('labelWalletTypeOptions', {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        type: t(`labelWalletType${WALLET_TYPE.Loopring}`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      }),
      value: WALLET_TYPE.Loopring as T,
      description: t(`label${WALLET_TYPE.Loopring}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
    },
    {
      label: t('labelWalletTypeOptions', {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        type: t(`labelWalletType${WALLET_TYPE.OtherSmart}`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        }),
      }),
      disabled: true,
      value: WALLET_TYPE.OtherSmart as T,
      description: t(`label${WALLET_TYPE.OtherSmart}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
    },
    {
      label: t(WALLET_TYPE.Exchange),
      value: WALLET_TYPE.Exchange as T,
      disabled: true,
      description: t(`label${WALLET_TYPE.Exchange}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      }),
    },
  ]
  const walletListFn: (type: WALLET_TYPE) => AddressItemType<T>[] = (type: WALLET_TYPE) => {
    if (type === WALLET_TYPE.Exchange) throw 'wrong type'
    return [
      {
        label: t('labelWalletTypeOptions', {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
          type: t(`labelWalletType${WALLET_TYPE.EOA}`, {
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
          }),
        }),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: WALLET_TYPE.EOA as T,
        description: t(`label${WALLET_TYPE.EOA}Des`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
        }),
      },
      {
        label: t('labelWalletTypeOptions', {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          type: t(`labelWalletType${WALLET_TYPE.Loopring}`, {
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
          }),
        }),
        disabled: type === WALLET_TYPE.Loopring ? false : true,
        value: WALLET_TYPE.Loopring as T,
        description: t(`label${WALLET_TYPE.Loopring}Des`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
        }),
      },
      {
        label: t('labelWalletTypeOptions', {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
          type: t(`labelWalletType${WALLET_TYPE.OtherSmart}`, {
            l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
          }),
        }),
        disabled: type === WALLET_TYPE.OtherSmart ? false : true,
        value: WALLET_TYPE.OtherSmart as T,
        description: t(`label${WALLET_TYPE.OtherSmart}Des`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
        }),
      },
      {
        label: t(`labelExchange${EXCHANGE_TYPE.Binance}`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
        }),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: EXCHANGE_TYPE.Binance as T,
        description: t('labelContactsBinanceNotSupportted', {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
        }),
      },
      {
        label: t(`labelExchange${EXCHANGE_TYPE.Huobi}`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
        }),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: EXCHANGE_TYPE.Huobi as T,
        description: t('labelContactsHuobiNotSupportted', {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
        }),
      },
      {
        label: t(`labelExchange${EXCHANGE_TYPE.Others}`, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
        }),
        disabled: type === WALLET_TYPE.EOA ? false : true,
        value: EXCHANGE_TYPE.Others as T,
        description: t('labelContactsOtherExchangesNotSupportted', {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
        }),
      },
    ]
  }
  const nonExchangeList: AddressItemType<T>[] = [
    {
      label: t(`labelNonExchangeType`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
      }),
      value: EXCHANGE_TYPE.NonExchange as T,
      disabled: false,
      description: t(`labelNonExchangeTypeDes`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
      }),
    },
  ]
  const exchangeList: AddressItemType<T>[] = [
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Binance}`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
      }),
      value: EXCHANGE_TYPE.Binance as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Binance}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
      }),
      maxWidth: 'initial',
    },
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Huobi}`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
      }),
      value: EXCHANGE_TYPE.Huobi as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Huobi}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
      }),
      maxWidth: 'initial',
    },
    {
      label: t(`labelExchange${EXCHANGE_TYPE.Others}`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
      }),
      value: EXCHANGE_TYPE.Others as T,
      disabled: false,
      description: t(`labelExchange${EXCHANGE_TYPE.Others}Des`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
      }),
      maxWidth: 'initial',
    },
  ]
  return {
    walletList,
    walletListFn,
    nonExchangeList,
    exchangeList,
  }
}
