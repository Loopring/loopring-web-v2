import React, { useCallback, useState } from 'react'
import {
  LoopringAPI,
  store,
  useAccount,
  useContacts,
  useToast,
  volumeToCount,
  volumeToCountAsBigNumber,
} from '@loopring-web/core'
import {
  RawDataTransactionItem,
  ToastType,
  TransactionStatus,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import { useTranslation } from 'react-i18next'
import { NetworkMap, SDK_ERROR_MAP_TO_UI, ContactType } from '@loopring-web/common-resources'
import { useLocation } from 'react-router-dom'

export type Contact = {
  name: string
  address: string
  addressType?: (typeof sdk.AddressType)[sdk.AddressTypeKeys]
  // id: string
}
type Network = 'L1' | 'L2'
const RowHeight = 78
export const viewHeightRatio = 0.85
export const viewHeightOffset = 130
const checkIsHebao = (accountAddress: string) =>
  LoopringAPI.walletAPI!.getWalletType({
    wallet: accountAddress,
  }).then((walletType) => {
    return walletType?.walletType?.loopringWalletContractVersion !== ''
  })

export const useContact = () => {
  const [addOpen, setAddOpen] = React.useState(false)
  const [deleteInfo, setDeleteInfo] = React.useState({
    open: false,
    selected: undefined as Contact | undefined,
  })
  const [sendInfo, setSendInfo] = React.useState({
    open: false,
    selected: undefined as Contact | undefined,
  })
  const [searchValue, setSearchValue] = React.useState('')
  const {
    account: { accountId, apiKey, accAddress, isContractAddress, isCFAddress },
  } = useAccount()
  const { defaultNetwork } = useSettings()
  // const cachedForAccountId = useSelector((state: RootState) => state.contacts.currentAccountId)
  const { t } = useTranslation()
  const [tableHeight] = useState(window.innerHeight * viewHeightRatio - viewHeightOffset)
  const [page, setPage] = useState(1)
  const pageSize = Math.floor(tableHeight / RowHeight)
  const {
    contacts,
    status: contactStatus,
    errorMessage: contactsErrorMessage,
    updateContacts,
  } = useContacts()
  const total = contacts?.length
  const pagination = total
    ? {
        page,
        pageSize,
        total,
      }
    : undefined

  // When localInit when unlock account Failed update contact once?
  React.useEffect(() => {
    if (contactsErrorMessage) {
      updateContacts()
    }
  }, [])
  const [selectAddress, setSelectAddress] = React.useState<ContactType | undefined>(undefined)

  const onChangeSearch = React.useCallback((input: string) => {
    setSearchValue(input)
  }, [])
  const onClearSearch = React.useCallback(() => {
    setSearchValue('')
  }, [])
  const onClickDelete = React.useCallback((address: string, name: string) => {
    setDeleteInfo({
      open: true,
      selected: {
        address,
        name,
      },
    })
  }, [])
  const onCloseDelete = React.useCallback(() => {
    setDeleteInfo({
      open: false,
      selected: undefined,
    })
  }, [])

  const onClickSend = React.useCallback(
    (address: string, name: string, addressType: (typeof sdk.AddressType)[sdk.AddressTypeKeys]) => {
      setSendInfo({
        open: true,
        selected: {
          address,
          name,
          addressType,
        },
      })
    },
    [],
  )
  const onCloseSend = React.useCallback(() => {
    setSendInfo({
      open: false,
      selected: undefined,
    })
  }, [])
  const { toastOpen, setToastOpen, closeToast } = useToast()

  React.useEffect(() => {
    if (contactsErrorMessage) {
      updateContacts()
    }
  }, [])
  const [deleteLoading, setDeleteLoading] = React.useState(false)

  const onPageChange = React.useCallback((page: number) => {
    setSearchValue('')
    setPage(page)
  }, [])
  const showPagination = total !== undefined && searchValue === ''
  const submitDeleteContact = React.useCallback(
    async (address: string, name: string) => {
      setDeleteLoading(true)
      const { accountId, apiKey, isContractAddress, isCFAddress } = store.getState().account
      const response = await LoopringAPI.contactAPI?.deleteContact(
        {
          accountId,
          isHebao: isContractAddress || isCFAddress ? true : false,
          contactAddress: address,
          // @ts-ignore
          network: NetworkMap[defaultNetwork].walletType,
        },
        apiKey,
      )

      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        setToastOpen({
          open: true,
          type: ToastType.error,
          content: t('labelContactsDeleteFailed'),
        })
      }
      updateContacts()
      setToastOpen({
        open: true,
        type: ToastType.success,
        content: t('labelContactsDeleteSuccess'),
      })
      setDeleteLoading(false)
      onCloseDelete()
      // if(result as sdk.RESULT_INFO)
    },
    [contacts],
  )
  return {
    contacts:
      contacts &&
      (searchValue === ''
        ? contacts.slice(
            (page - 1) * pageSize,
            page * pageSize >= contacts.length ? contacts.length : page * pageSize,
          )
        : contacts.filter((contact) => {
            return (
              contact.contactAddress.toLowerCase().includes(searchValue.toLowerCase()) ||
              contact.contactName.toLowerCase().includes(searchValue.toLowerCase())
            )
          })),
    selectAddress,
    setSelectAddress,
    onChangeSearch,
    onClearSearch,
    searchValue,
    toastInfo: toastOpen,
    setToast: setToastOpen,
    closeToast,
    onClickDelete,
    deleteInfo,
    onCloseDelete,
    submitDeleteContact,
    deleteLoading,

    addOpen,
    setAddOpen,
    // addLoading,
    // submitAddContact,

    onClickSend,
    onCloseSend,
    sendInfo,

    pagination,
    onPageChange,
    // loading,
    showPagination,
    // onScroll
  }
}

export const useContactSend = () => {
  const [sendNetwork, setSendNetwork] = React.useState('L2' as Network)
  const { setShowTransfer, setShowWithdraw } = useOpenModals()
  const submitSendingContact = React.useCallback(
    (contact: Contact, network: Network, onClose: () => void) => {
      if (network === 'L1') {
        setShowWithdraw({
          isShow: true,
          address: contact.address,
          name: contact.name,
          addressType: contact.addressType,
          // symbol: 'ETH',
          info: {
            onCloseCallBack: onClose,
          },
        })
      } else {
        setShowTransfer({
          isShow: true,
          address: contact.address,
          name: contact.name,
          addressType: contact.addressType,
          // symbol: 'ETH',
          info: {
            onCloseCallBack: onClose,
          },
        })
      }
    },
    [],
  )

  return {
    submitSendingContact,
    sendNetwork,
    setSendNetwork,
  }
}

type TxsFilterProps = {
  // accountId: number;
  tokenSymbol?: string
  start?: number
  end?: number
  offset?: number
  limit?: number
  types?: sdk.UserTxTypes[] | string
}

export function useContractRecord(setToastOpen: (state: any) => void) {
  const {
    account: { accountId, apiKey },
  } = useAccount()
  const { tokenMap } = store.getState().tokenMap
  const { t } = useTranslation(['error'])
  const [txs, setTxs] = useState<RawDataTransactionItem[]>([])
  const [txsTotal, setTxsTotal] = useState(0)
  const [showLoading, setShowLoading] = useState(false)
  const { search } = useLocation()
  const searchParams = new URLSearchParams(search)

  const getTxnStatus = (status: string) => {
    return status === ''
      ? TransactionStatus.processing
      : status === 'PROCESSED'
      ? TransactionStatus.processed
      : status === 'PROCESSING'
      ? TransactionStatus.processing
      : status === 'RECEIVED'
      ? TransactionStatus.received
      : TransactionStatus.failed
  }

  const getUserTxnList = useCallback(
    async ({ tokenSymbol, start, end, limit, offset }: TxsFilterProps) => {
      // const address = routeMatch.params[0];
      const tokenId = tokenSymbol ? tokenMap[tokenSymbol!].tokenId : undefined
      const response = await LoopringAPI.userAPI!.getUserBills(
        {
          accountId,
          tokenSymbol,
          tokenId,
          fromAddress: searchParams?.get('contactAddress') ?? '',
          transferAddress: searchParams?.get('contactAddress') ?? '',
          start,
          end,
          limit,
          offset,
          // @ts-ignore
          billType: '1,2,4',
        },
        apiKey,
      )
      if ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message) {
        const errorItem = SDK_ERROR_MAP_TO_UI[(response as sdk.RESULT_INFO)?.code ?? 700001]
        setToastOpen({
          open: true,
          type: ToastType.error,
          content:
            'error : ' + errorItem
              ? t(errorItem.messageKey)
              : (response as sdk.RESULT_INFO).message,
        })
      } else {
        const formattedList: RawDataTransactionItem[] = (response as any).raw_data.bills.map(
          (o: any) => {
            const feePrecision = tokenMap ? tokenMap[o.tokenF].precision : undefined
            return {
              ...o,
              txType: o.billType,
              side: o.billType as any,
              amount: {
                unit: o.token || '',
                value: Number(volumeToCount(o.token, o.amount)),
              },
              fee: {
                unit: o.tokenF || '',
                value: Number(volumeToCountAsBigNumber(o.tokenF, o.amountF || 0)),
              },
              memo: o.memo || '',
              time: o.timestamp,
              txnHash: o.hash,
              status: getTxnStatus(o.status),
              feePrecision: feePrecision,
              receiverAddress: o.to,
              senderAddress: o.from,
            } as RawDataTransactionItem
          },
        )
        setTxs(formattedList)

        setTxsTotal(response.totalNum)
        setShowLoading(false)
      }
    },
    [accountId, apiKey, t, tokenMap],
  )

  return {
    txs,
    txsTotal,
    showLoading,
    getUserTxnList,
  }
}