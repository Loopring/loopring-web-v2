import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ContactType,
  LoopringAPI,
  store,
  useAccount,
  useContacts,
  volumeToCount,
  volumeToCountAsBigNumber,
} from '@loopring-web/core'
import { utils } from 'ethers'
import {
  RawDataTransactionItem,
  ToastType,
  TransactionStatus,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import { AddressType } from '@loopring-web/loopring-sdk'
import { useTranslation } from 'react-i18next'
import { NetworkMap, SDK_ERROR_MAP_TO_UI } from '@loopring-web/common-resources'
import { connectProvides } from '@loopring-web/web3-provider'
import { debounce } from 'lodash'
import { useTheme } from '@emotion/react'
import { useLocation } from 'react-router-dom'

export type Contact = {
  name: string
  address: string
  addressType?: sdk.AddressType
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
    account: {accountId, apiKey, accAddress, isContractAddress, isCFAddress},
  } = useAccount()
  // const cachedForAccountId = useSelector((state: RootState) => state.contacts.currentAccountId)
  const {t} = useTranslation()
  const [tableHeight] = useState(window.innerHeight * viewHeightRatio - viewHeightOffset)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const pageSize = Math.floor(tableHeight / RowHeight)
  const {contacts, status: contactStatus, errorMessage: contactsErrorMessage, updateContacts} = useContacts()
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
  const [selectAddress, setSelectAddress] = React.useState<ContactType | undefined>(undefined);

  const onChangeSearch = React.useCallback((input: string) => {
    setSearchValue(input)
  }, [])
  const onClearSearch = React.useCallback(() => {
    setSearchValue('')
  }, [])
  // const onClickEditing = React.useCallback(
  //   (address: string) => {
  //     // updateContacts(
  //     //   contacts!.map((x) => {
  //     //     return {
  //     //       ...x,
  //     //       editing: x.contactAddress === address,
  //     //     }
  //     //   }),
  //     // )
  //   },
  //   [contacts],
  // )
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
    (address: string, name: string, addressType: sdk.AddressType) => {
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
  const [toastInfo, setToastInfo] = React.useState<{
    open: boolean
    isSuccess: boolean | undefined
    type: 'Add' | 'Delete' | 'Edit' | 'Send' | 'Copy' | undefined
    customerText?: string
  }>({
    open: false,
    isSuccess: undefined,
    type: undefined,
  })

  const onEdit = React.useCallback(
    async (data: ContactType) => {
      let addressType: sdk.AddressType | undefined = undefined
      if (data.addressType === AddressType.LOOPRING_HEBAO_CF) {
        const {walletType} = (await LoopringAPI.walletAPI
          ?.getWalletType({
            wallet: data.contactAddress,
            network: NetworkMap[ defaultNetwork ].walletType as sdk.NetworkWallet
          })) ?? {walletType: undefined};
        if (walletType?.isInCounterFactualStatus) {
          addressType = sdk.AddressType.LOOPRING_HEBAO_CF
        } else if (walletType?.loopringWalletContractVersion) {
          const map: [string, sdk.AddressType][] = [
            ['V2_1_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_1_0],
            ['V2_0_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_0_0],
            ['V1_2_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0],
            ['V1_1_6', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6],
          ]
          addressType = map.find(
            (x) => x[ 0 ] === walletType?.loopringWalletContractVersion,
          )![ 1 ]
        } else if (walletType?.isContract) {
          addressType = sdk.AddressType.CONTRACT
        }
      }
      LoopringAPI.contactAPI?.updateContact(
        {
          contactAddress: data.contactAddress,
          isHebao: (isContractAddress || isCFAddress) ? true : false,
          contactName: data.contactName,
          accountId,
          addressType,
        },
        apiKey,
      )
        .then((response) => {
          if (response === true) {
            setToastInfo({
              open: true,
              isSuccess: true,
              type: 'Edit',
            })
            updateContacts();
          } else {
            throw (response.resultInfo as sdk.RESULT_INFO).message
          }
        })
        .catch((e) => {
          setToastInfo({
            open: true,
            isSuccess: false,
            type: 'Edit',
          })
        }).finally(() => {
        setSelectAddress(undefined)

      })
    },
    [contacts, apiKey, accAddress],
  )
  // const onChangeInput = React.useCallback(
  //   (address: string, inputValue) => {
  //     // updateContacts(
  //     //   contacts!.map((x) => {
  //     //     return {
  //     //       ...x,
  //     //       name: x.address === address ? inputValue : x.name,
  //     //     }
  //     //   }),
  //     // )
  //   },
  //   [contacts],
  // )
  const [deleteLoading, setDeleteLoading] = React.useState(false)
  const onCloseToast = React.useCallback(() => {
    setToastInfo({
      open: false,
      isSuccess: undefined,
      type: undefined,
    })
  }, [])
  const submitDeleteContact = React.useCallback(
    async (address: string, name: string) => {
      setDeleteLoading(true)
      const isHebao = await checkIsHebao(accAddress)
      LoopringAPI.contactAPI?.deleteContact(
        {
          accountId,
          isHebao: (isContractAddress || isCFAddress) ? true : false,
          contactAddress: address,
          contactName: name,
        },
        apiKey,
      )
        .then((response) => {
          if (response === true) {
            updateContacts()
            // updateContacts(contacts!.filter((contact) => contact.address !== address))
            setToastInfo({
              open: true,
              isSuccess: true,
              type: 'Delete',
            })
            setDeleteInfo({
              open: false,
              selected: undefined,
            })
          } else {
            throw (response.resultInfo as sdk.RESULT_INFO).message
          }
        })
        .catch((e) => {
          setToastInfo({
            open: true,
            isSuccess: false,
            type: 'Delete',
          })
        })
        .finally(() => {
          setDeleteLoading(false)
        })
    },
    [apiKey, contacts],
  )
  const [addLoading, setAddLoading] = React.useState(false)
  const {defaultNetwork} = useSettings()
  const submitAddContact = React.useCallback(
    async (address: string, name: string, callBack: (success: boolean) => void) => {
      setAddLoading(true)
      let addressType: sdk.AddressType | undefined = undefined
      const {walletType} = (await LoopringAPI.walletAPI
        ?.getWalletType({
          wallet: address,
          network: NetworkMap[ defaultNetwork ].walletType as sdk.NetworkWallet
        })) ?? {walletType: undefined};
      if (walletType?.isInCounterFactualStatus) {
        addressType = sdk.AddressType.LOOPRING_HEBAO_CF
      } else if (walletType?.loopringWalletContractVersion) {
        const map: [string, sdk.AddressType][] = [
          ['V2_1_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_1_0],
          ['V2_0_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_0_0],
          ['V1_2_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0],
          ['V1_1_6', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6],
        ]
        addressType = map.find(
          (x) => x[ 0 ] === walletType?.loopringWalletContractVersion,
        )![ 1 ]
      } else if (walletType?.isContract) {
        addressType = sdk.AddressType.CONTRACT
      }
      try {
        const response = await LoopringAPI.contactAPI?.createContact(
          {
            accountId,
            isHebao: !!(isContractAddress || isCFAddress),
            contactAddress: address,
            contactName: name,
            addressType,
            network: NetworkMap[ defaultNetwork ].walletType,
          } as any,
          apiKey,
        )
        if (
          response &&
          ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
        ) {
          throw {code: ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)}
        }
        updateContacts()
        setLoading(false)
        setToastInfo({
          open: true,
          isSuccess: true,
          type: 'Add',
        })
      } catch (error) {
        setToastInfo({
          open: true,
          isSuccess: false,
          type: 'Add',
          customerText: t('labelContactsContactExisted'),
        })
        setAddLoading(false)

      }
    },
    [apiKey, contacts, total],
  )

  const onPageChange = React.useCallback((page: number) => {
    setSearchValue('')
    setPage(page)
  }, [])
  const showPagination = total !== undefined && searchValue === ''

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
    onEdit,
    onChangeSearch,
    onClearSearch,
    searchValue,
    toastInfo,
    setToastInfo,
    onCloseToast,

    onClickDelete,
    deleteInfo,
    onCloseDelete,
    submitDeleteContact,
    deleteLoading,

    addOpen,
    setAddOpen,
    addLoading,
    submitAddContact,

    onClickSend,
    onCloseSend,
    sendInfo,

    pagination,
    onPageChange,
    loading,
    showPagination,
    // onScroll
  }
}
export const useContactAdd = () => {
  const [addLoading, setAddLoading] = React.useState(false)
  const [addAddress, setAddAddress] = React.useState('')
  const [addName, setAddName] = React.useState('')
  const [toastStatus, setToastStatus] = React.useState('Succuss' as 'Succuss' | 'Error' | 'Init')

  const onChangeName = React.useCallback((input: string) => {
    if (new TextEncoder().encode(input).length <= 48) {
      setAddName(input)
    }
  }, [])

  const [ensResolvedAddress, setEnsResolvedAddress] = useState(
    undefined as undefined | false | string,
  )
  const [asyncCheckInvalid, setAsyncCheckInvalid] = React.useState(true)
  const addButtonDisable =
    (!utils.isAddress(addAddress) && !ensResolvedAddress) || addName === '' || asyncCheckInvalid
  const ref = useRef<(input: string) => void>()
  const {defaultNetwork} = useSettings()
  useEffect(() => {
    ref.current = debounce((input: string) => {
      ;(connectProvides.usedWeb3
          ? connectProvides.usedWeb3.eth.ens.getAddress(input)
          : Promise.reject('no web3')
      )
        .then((addressResovled: string) => {
          setEnsResolvedAddress(addressResovled)
        })
        .catch((e) => {
          setEnsResolvedAddress(false)
        })
      setAsyncCheckInvalid(true)
      LoopringAPI.walletAPI
        ?.getWalletType({
          wallet: input,
          network: sdk.NetworkWallet[ NetworkMap[ defaultNetwork ].walletType ],
        })
        .then((response) => {
          const raw_data = response.raw_data
          if (raw_data) {
            setAsyncCheckInvalid(
              response.walletType?.isContract &&
              !response.walletType?.isInCounterFactualStatus &&
              !response.walletType?.loopringWalletContractVersion
                ? true
                : false,
            )
          } else {
            setAsyncCheckInvalid(true)
          }
        })
    }, 500)
  }, [setEnsResolvedAddress, setAsyncCheckInvalid])

  const onChangeAddress = React.useCallback((input: string) => {
    ref.current && ref.current(input)
    setAddAddress(input)
  }, [])
  const addShowInvalidAddress =
    addAddress !== '' && !utils.isAddress(addAddress) && ensResolvedAddress === false

  const displayEnsResolvedAddress =
    ensResolvedAddress !== undefined && ensResolvedAddress !== false
      ? ensResolvedAddress
      : undefined

  return {
    addLoading,
    setAddLoading,
    addAddress,
    onChangeAddress,
    addName,
    onChangeName,
    toastStatus,
    setToastStatus,
    addShowInvalidAddress,
    addButtonDisable,
    displayEnsResolvedAddress,
    // submitAddingContact,
  }
}

export const useContactSend = () => {
  const [sendNetwork, setSendNetwork] = React.useState('L2' as Network)
  const {setShowTransfer, setShowWithdraw} = useOpenModals()
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
    account: {accountId, apiKey},
  } = useAccount()
  const {tokenMap} = store.getState().tokenMap
  const {t} = useTranslation(['error'])
  const [txs, setTxs] = useState<RawDataTransactionItem[]>([])
  const [txsTotal, setTxsTotal] = useState(0)
  const [showLoading, setShowLoading] = useState(false)
  const {search} = useLocation()
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
    async ({tokenSymbol, start, end, limit, offset}: TxsFilterProps) => {
      // const address = routeMatch.params[0];
      const tokenId = tokenSymbol ? tokenMap[ tokenSymbol! ].tokenId : undefined
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
        const errorItem = SDK_ERROR_MAP_TO_UI[ (response as sdk.RESULT_INFO)?.code ?? 700001 ]
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
            const feePrecision = tokenMap ? tokenMap[ o.tokenF ].precision : undefined
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
