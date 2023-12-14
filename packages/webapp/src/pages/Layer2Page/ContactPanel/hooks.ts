import React from 'react'
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
  AccountStep,
} from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import { useTranslation } from 'react-i18next'
import {
  NetworkMap,
  SDK_ERROR_MAP_TO_UI,
  ContactType,
  Contact,
} from '@loopring-web/common-resources'
import { useLocation } from 'react-router-dom'
import { connectProvides } from '@loopring-web/web3-provider'

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
  // const [addOpen, setAddOpen] = React.useState(false)
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
  const { setShowAccount, setShowEditContact } = useOpenModals()

  // const cachedForAccountId = useSelector((state: RootState) => state.contacts.currentAccountId)
  const { t } = useTranslation()
  const [tableHeight] = React.useState(window.innerHeight * viewHeightRatio - viewHeightOffset)
  const [page, setPage] = React.useState(1)
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
  // const [selectAddress, setSelectAddress] = React.useState<ContactType | undefined>(undefined)

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

  const onClickSend = React.useCallback(async (data: Contact) => {
    let isENSWrong = false
    if (data.contactAddress && data.ens && connectProvides.usedWeb3) {
      //#ts-ignore
      const provider = new ethers.providers.Web3Provider(connectProvides?.usedWeb3.currentProvider)
      //#ts-ignore
      const ens = await provider.lookupAddress(data.contactAddress)

      if (data?.ens?.toLowerCase() != ens?.toLowerCase()) {
        isENSWrong = true
      }
    }
    setShowAccount({
      isShow: true,
      step: AccountStep.SendAssetFromContact,
      info: {
        ...data,
        isENSWrong,
      },
    })
  }, [])
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
    // selectAddress,
    // setSelectAddress,
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
    setShowEditContact,
    // addOpen,
    // setAddOpen,
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
  const [txs, setTxs] = React.useState<RawDataTransactionItem[]>([])
  const [txsTotal, setTxsTotal] = React.useState(0)
  const [showLoading, setShowLoading] = React.useState(false)
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

  const getUserTxnList = React.useCallback(
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
