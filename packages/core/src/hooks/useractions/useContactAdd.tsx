import React from 'react'
import {
  AddressError,
  EXCHANGE_TYPE,
  HEBAO_CONTRACT_MAP,
  myLog,
  NetworkMap,
  SDK_ERROR_MAP_TO_UI,
  TradeBtnStatus,
  UIERROR_CODE,
  WALLET_TYPE,
  Contact,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import {
  addressToExWalletMapFn,
  exWalletToAddressMapFn,
  LoopringAPI,
  store,
  useAddressCheck,
  useContacts,
  useSubmitBtn,
} from '@loopring-web/core'
import { ToastType, useSettings, useOpenModals } from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'

export const useContactAdd = () => {
  const { t } = useTranslation()
  const [loading, setLoading] = React.useState(false)
  const [isNameExit, setIsNameExit] = React.useState(false)
  const [isContactExit, setIsContactExit] = React.useState(false)
  const [isEdit, setIsEdit] = React.useState<{ item: Contact } | false>(false)
  const {
    modals: { isShowEditContact },
    setShowOtherExchange,
    setShowGlobalToast,
  } = useOpenModals()
  const {
    address,
    realAddr,
    setAddress,
    addrStatus,
    isCFAddress: addressTypeISCFAddress,
    isContractAddress,
    isAddressCheckLoading,
    loopringSmartWalletVersion,
    ens,
  } = useAddressCheck(false)
  const { contacts, updateContacts } = useContacts()
  const [addName, setAddName] = React.useState('')

  const [selectedAddressType, setSelectedAddressType] = React.useState<
    WALLET_TYPE | EXCHANGE_TYPE | undefined
  >(undefined)
  const allowToClickIsSure = React.useMemo(() => {
    return isAddressCheckLoading || addrStatus === AddressError.InvalidAddr || !realAddr
  }, [addrStatus, isAddressCheckLoading, realAddr])
  const mapContactAddressType = React.useCallback(():
    | (typeof sdk.AddressType)[sdk.AddressTypeKeys]
    | undefined => {
    if (addressTypeISCFAddress) {
      return sdk.AddressType.LOOPRING_HEBAO_CF
    } else if (loopringSmartWalletVersion?.isLoopringSmartWallet) {
      const item = HEBAO_CONTRACT_MAP.find(
        (item) => item[0] === loopringSmartWalletVersion?.version,
      )
      return (
        item ? item[1] : /V2_/.test(loopringSmartWalletVersion?.version ?? '') ? 2002 : undefined
      ) as any
    } else if (isContractAddress) {
      return sdk.AddressType.CONTRACT
    } else if (selectedAddressType) {
      return exWalletToAddressMapFn(selectedAddressType)
    }
  }, [
    addressTypeISCFAddress,
    isContractAddress,
    loopringSmartWalletVersion?.isLoopringSmartWallet,
    loopringSmartWalletVersion?.version,
    selectedAddressType,
  ])
  const autoSetWalletType = () => {
    if (realAddr && selectedAddressType == undefined) {
      const addressType = mapContactAddressType()
      if (addressType) {
        const type = addressToExWalletMapFn(addressType)
        myLog('onChangeAddressType before', type)
        onChangeAddressType(type)
      } else {
        onChangeAddressType(undefined)
      }
    }
  }
  const onSubmit = React.useCallback(async () => {
    setLoading(true)
    const { accountId, apiKey, isContractAddress, isCFAddress } = store.getState().account
    let createContact: sdk.CreateContactRequest | sdk.UpdateContactRequest = {
      contactAddress: realAddr,
      accountId,
      contactName: addName,
      isHebao: !!(isContractAddress || isCFAddress),
      network: NetworkMap[defaultNetwork].walletType,
      ens,
    } as any
    createContact = {
      ...createContact,
      addressType: mapContactAddressType(),
    }
    if (isEdit) {
      try {
        const response = await LoopringAPI.contactAPI?.updateContact(createContact, apiKey)
        if (
          response &&
          ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
        ) {
          throw {
            code: (response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message,
          }
        }
        setShowGlobalToast({
          isShow: true,
          info: {
            type: ToastType.success,
            content: t('labelContactsEditSuccess'),
          },
        })
        restData()
      } catch (error) {
        const _error = LoopringAPI?.globalAPI?.genErr(error as unknown as any) ?? {}
        error = {
          ...((error as any) ?? {}),
          ..._error,
        }
        if ((error as any)?.code == sdk.LoopringErrorCode.HTTP_ERROR) {
          setShowGlobalToast({
            isShow: true,
            info: {
              type: ToastType.error,
              content: t(SDK_ERROR_MAP_TO_UI[UIERROR_CODE.TIME_OUT].messageKey, { ns: 'error' }),
            },
          })
        } else if ((error as any)?.code) {
          setShowGlobalToast({
            isShow: true,
            info: {
              type: ToastType.error,
              content: t(
                SDK_ERROR_MAP_TO_UI[(error as any)?.code]?.messageKey ?? 'labelContactsEditFailed',
                { ns: 'error' },
              ),
            },
          })
        } else {
          setShowGlobalToast({
            isShow: true,
            info: {
              type: ToastType.error,
              content: t('labelContactsEditFailed'),
            },
          })
        }
      }
    } else {
      try {
        const response = await LoopringAPI.contactAPI?.createContact(createContact as any, apiKey)
        if (
          response &&
          ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
        ) {
          throw {
            code: (response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message,
          }
        }

        setShowGlobalToast({
          isShow: true,
          info: {
            type: ToastType.success,
            content: t('labelContactsAddSuccess'),
          },
        })

        restData()
      } catch (error) {
        const _error = LoopringAPI?.globalAPI?.genErr(error as unknown as any) ?? {}
        error = {
          ...((error as any) ?? {}),
          ..._error,
        }
        if ((error as any)?.code == sdk.LoopringErrorCode.HTTP_ERROR) {
          setShowGlobalToast({
            isShow: true,
            info: {
              type: ToastType.error,
              content: t(SDK_ERROR_MAP_TO_UI[UIERROR_CODE.TIME_OUT].messageKey, { ns: 'error' }),
            },
          })
        } else if ((error as any)?.code) {
          setShowGlobalToast({
            isShow: true,
            info: {
              type: ToastType.error,
              content: t(
                SDK_ERROR_MAP_TO_UI[(error as any)?.code]?.messageKey ?? 'labelContactsAddFailed',
                { ns: 'error' },
              ),
            },
          })
        } else {
          setShowGlobalToast({
            isShow: true,
            info: {
              type: ToastType.error,
              content: t('labelContactsAddFailed'),
            },
          })
        }
      }
      setLoading(false)
    }
  }, [
    realAddr,
    addName,
    mapContactAddressType,
    isEdit,
    t,
    // restData,
    // enableBtn,
  ])
  React.useEffect(() => {
    if (realAddr && addName && realAddr !== '' && !isAddressCheckLoading) {
      autoSetWalletType()
    }
    const list = contacts?.filter((item) => {
      return isEdit
        ? isEdit?.item?.contactAddress?.toLowerCase() !== item?.contactAddress?.toLowerCase()
        : true
    })

    if (addName && list?.find((item) => item.contactName === addName)) {
      setIsNameExit(true)
    } else {
      setIsNameExit(false)
    }
    if (list?.find((item) => item.contactAddress.toLowerCase() === realAddr.toLowerCase())) {
      setIsContactExit(true)
    } else {
      setIsContactExit(false)
    }
  }, [realAddr, isAddressCheckLoading, addName])
  const availableTradeCheck = React.useCallback((): {
    tradeBtnStatus: TradeBtnStatus
    label: string | undefined
  } => {
    if (realAddr && addName) {
      if (isContactExit) {
        return {
          label: `labelContactAddressExisted`,
          tradeBtnStatus: TradeBtnStatus.DISABLED,
        }
      } else if (isNameExit) {
        return {
          label: `labelContactNameExisted`,
          tradeBtnStatus: TradeBtnStatus.DISABLED,
        }
      } else {
        return {
          label: undefined,
          tradeBtnStatus: TradeBtnStatus.AVAILABLE,
        }
      }
    }
    return {
      label: undefined,
      tradeBtnStatus: TradeBtnStatus.DISABLED,
    }
  }, [realAddr, addName, isNameExit, isContactExit])

  const { btnStatus, onBtnClick, btnLabel } = useSubmitBtn({
    availableTradeCheck,
    isLoading: isAddressCheckLoading || loading,
    submitCallback: onSubmit,
  })
  React.useEffect(() => {
    if (isShowEditContact.isShow) {
      if (isShowEditContact?.info?.contactName) {
        setIsEdit(() => {
          return { item: isShowEditContact.info }
        })
        onChangeName(isShowEditContact.info.contactName)
        onChangeAddressType(
          addressToExWalletMapFn(isShowEditContact.info?.addressType ?? undefined),
        )
        onChangeAddress(isShowEditContact.info?.contactAddress)
        // if (isShowEditContact?.info?.contactAddress ) {
        //   onChangeAddress((isEdit as EditItem)?.item.contactAddress)
        // }
      } else {
        setIsEdit(false)
      }
    }

    setLoading(false)
  }, [isShowEditContact.isShow])

  const detectedWalletType = loopringSmartWalletVersion?.isLoopringSmartWallet
    ? WALLET_TYPE.Loopring
    : isContractAddress
    ? WALLET_TYPE.OtherSmart
    : WALLET_TYPE.EOA
  const onChangeAddress = (input: string) => {
    setAddress(input)
    setSelectedAddressType(undefined)
  }
  const onChangeName = (input: string) => {
    if (new TextEncoder().encode(input).length <= 48) {
      setAddName(input)
    }
  }
  const onChangeAddressType = (value: WALLET_TYPE | EXCHANGE_TYPE | undefined) => {
    myLog('onChangeAddressType', value)
    setSelectedAddressType(value)
  }
  const restData = () => {
    onChangeAddress('')
    onChangeName('')
    onChangeAddressType(undefined)
    updateContacts()
    setSelectedAddressType(undefined)
    setLoading(false)
    setShowOtherExchange({ agree: false, isShow: false })
  }

  const { defaultNetwork } = useSettings()

  return {
    contactAddProps: {
      isEdit,
      contacts,
      restData,
      selectedAddressType,
      detectedWalletType,
      addressDefault: address,
      isAddressCheckLoading,
      onChangeAddress,
      addName,
      onChangeName,
      realAddr,
      addrStatus,
      handleOnAddressChange: onChangeAddress,
      allowToClickIsSure,
      onChangeAddressType,
      btnStatus,
      isNameExit,
      isContactExit,
      btnLabel,
      submitContact: onBtnClick,
    },
  }
}
