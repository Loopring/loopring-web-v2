import React from 'react'
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Typography,
} from '@mui/material'
import {
  AddressError,
  CloseIcon,
  EXCHANGE_TYPE,
  HEBAO_CONTRACT_MAP,
  LoadingIcon,
  myLog,
  NetworkMap,
  SDK_ERROR_MAP_TO_UI,
  TradeBtnStatus,
  UIERROR_CODE,
  WALLET_TYPE,
  ContactType,
  L1L2_NAME_DEFINED,
  MapChainId,
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
import {
  FullAddressType,
  TextField,
  Button,
  TOASTOPEN,
  ToastType,
  useSettings,
} from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'

type EditItem = {
  item: ContactType
}
export const useContactAdd = ({
  isEdit,
  setToast,
  onClose,
}: {
  isEdit?: false | EditItem
  onClose: () => void
  setToast: (props: TOASTOPEN) => void
}) => {
  const { t } = useTranslation()
  const [loading, setLoading] = React.useState(false)
  const [isNameExit, setIsNameExit] = React.useState(false)
  const [isContactExit, setIsContactExit] = React.useState(false)

  const {
    address,
    realAddr,
    setAddress,
    addrStatus,
    isCFAddress: addressTypeISCFAddress,
    isContractAddress,
    isAddressCheckLoading,
    loopringSmartWalletVersion,
  } = useAddressCheck(false)
  const {
    contacts,
    status: contactStatus,
    errorMessage: contactsErrorMessage,
    updateContacts,
  } = useContacts()
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
    loopringSmartWalletVersion?.isLoopringSmartWallet,
    loopringSmartWalletVersion?.version,
    isContractAddress,
    selectedAddressType,
  ])
  const autoSetWalletType = () => {
    if (realAddr && selectedAddressType == undefined) {
      const addressType = mapContactAddressType()
      if (addressType) {
        const type = addressToExWalletMapFn(addressType)
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
        setToast({
          open: true,
          type: ToastType.success,
          content: t('labelContactsEditSuccess'),
        })
        restData()
      } catch (error) {
        const _error = LoopringAPI?.globalAPI?.genErr(error as unknown as any) ?? {}
        error = {
          ...((error as any) ?? {}),
          ..._error,
        }
        if ((error as any)?.code == sdk.LoopringErrorCode.HTTP_ERROR) {
          setToast({
            open: true,
            type: ToastType.error,
            content: t(SDK_ERROR_MAP_TO_UI[UIERROR_CODE.TIME_OUT].messageKey, { ns: 'error' }),
          })
        } else if ((error as any)?.code) {
          setToast({
            open: true,
            type: ToastType.error,
            content: t(
              SDK_ERROR_MAP_TO_UI[(error as any)?.code]?.messageKey ?? 'labelContactsEditFailed',
              { ns: 'error' },
            ),
          })
        } else {
          setToast({
            open: true,
            type: ToastType.error,
            content: t('labelContactsEditFailed'),
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
        setToast({
          open: true,
          type: ToastType.success,
          content: t('labelContactsAddSuccess'),
        })
        restData()
      } catch (error) {
        const _error = LoopringAPI?.globalAPI?.genErr(error as unknown as any) ?? {}
        error = {
          ...((error as any) ?? {}),
          ..._error,
        }
        if ((error as any)?.code == sdk.LoopringErrorCode.HTTP_ERROR) {
          setToast({
            open: true,
            type: ToastType.error,
            content: t(SDK_ERROR_MAP_TO_UI[UIERROR_CODE.TIME_OUT].messageKey, { ns: 'error' }),
          })
        } else if ((error as any)?.code) {
          setToast({
            open: true,
            type: ToastType.error,
            content: t(
              SDK_ERROR_MAP_TO_UI[(error as any)?.code]?.messageKey ?? 'labelContactsAddFailed',
              { ns: 'error' },
            ),
          })
        } else {
          setToast({
            open: true,
            type: ToastType.error,
            content: t('labelContactsAddFailed'),
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
    setToast,
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
    myLog('item?.contactAddress', (isEdit as EditItem)?.item)
    if ((isEdit as EditItem)?.item?.contactAddress) {
      onChangeAddress((isEdit as EditItem)?.item.contactAddress)
      onChangeName((isEdit as EditItem)?.item.contactName)
      onChangeAddressType(
        addressToExWalletMapFn((isEdit as EditItem)?.item?.addressType ?? undefined),
      )
    }
    setLoading(false)
  }, [(isEdit as EditItem)?.item?.contactAddress])
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
    myLog(onChangeAddressType, 'value')
    setSelectedAddressType(value)
  }
  const restData = () => {
    onChangeAddress('')
    onChangeName('')
    onChangeAddressType(undefined)
    updateContacts()
    onClose()
    setLoading(false)
  }

  const { defaultNetwork } = useSettings()

  return {
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
  }
}

interface AddDialogProps {
  addOpen: boolean
  setAddOpen: (open: boolean) => void
  // submitContact: () => void
  // loading: boolean
  isEdit?:
    | false
    | {
        item: ContactType
      }

  contacts: ContactType[]
  onClose: () => void
  setToast: (props: TOASTOPEN) => void
}

export const EditContact: React.FC<AddDialogProps> = ({
  setAddOpen,
  addOpen,
  // submitContact,
  // loading,
  isEdit = false,
  onClose,
  setToast,
  contacts,
}) => {
  const { t } = useTranslation(['common'])
  const {
    restData,
    selectedAddressType,
    detectedWalletType,
    addressDefault,
    isAddressCheckLoading,
    addName,
    onChangeName,
    realAddr,
    isContactExit,
    // isNameExit,
    handleOnAddressChange,
    allowToClickIsSure,
    onChangeAddressType,
    btnStatus,
    addrStatus,
    submitContact, // ,
    btnLabel,
  } = useContactAdd({ isEdit, onClose, setToast })
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const label = React.useMemo(() => {
    if (btnLabel) {
      const key = btnLabel.split('|')
      return t(
        key[0],
        key && key[1]
          ? {
              arg: key[1].toString(),
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
          : {
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            },
      )
    } else {
      return t(isEdit ? `labelContactsEditContactBtn` : `labelContactsAddContactBtn`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [btnLabel, isEdit])
  const getDisabled = React.useMemo(() => {
    return btnStatus === TradeBtnStatus.DISABLED
  }, [btnStatus])

  const isInvalidAddressOrENS =
    !isAddressCheckLoading && addressDefault && addrStatus === AddressError.InvalidAddr
  return (
    <div>
      <Dialog
        maxWidth={'lg'}
        open={addOpen}
        onClose={() => {
          restData()
        }}
      >
        <DialogTitle>
          <Typography component={'span'} variant={'h3'} textAlign={'center'}>
            {isEdit ? t('labelContactsEditContact') : t('labelContactsAddContact')}
          </Typography>
          <IconButton
            size={'large'}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
            color={'inherit'}
            onClick={() => {
              restData()
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ width: 'var(--modal-width)' }}>
          <Box marginTop={4}>
            <Typography marginBottom={0.5} color={'var(--color-text-third)'}>
              {t('labelContactsAddressTitle')}
            </Typography>
            <>
              <TextField
                size={'large'}
                className={'text-address'}
                value={addressDefault}
                disabled={!!isEdit}
                error={!!isInvalidAddressOrENS}
                placeholder={t('labelPleaseInputWalletAddress')}
                onChange={(event) => handleOnAddressChange(event?.target?.value)}
                fullWidth={true}
                InputProps={{
                  style: {
                    paddingRight: '0',
                  },
                  endAdornment: (
                    <InputAdornment
                      style={{
                        cursor: 'pointer',
                        paddingRight: '.5em',
                      }}
                      position='end'
                    >
                      {addressDefault !== '' ? (
                        isAddressCheckLoading ? (
                          <LoadingIcon width={24} />
                        ) : (
                          !isEdit && (
                            <IconButton
                              color={'inherit'}
                              aria-label='Clear'
                              onClick={() => handleOnAddressChange('')}
                            >
                              <CloseIcon />
                            </IconButton>
                          )
                        )
                      ) : (
                        ''
                      )}
                    </InputAdornment>
                  ),
                }}
              />
            </>
            <Box marginLeft={1 / 2}>
              {isInvalidAddressOrENS ? (
                <Typography
                  color={'var(--color-error)'}
                  variant={'body2'}
                  marginTop={1 / 4}
                  alignSelf={'stretch'}
                  position={'relative'}
                >
                  {t('labelInvalidAddress')}
                </Typography>
              ) : isContactExit ? (
                <Typography
                  color={'var(--color-error)'}
                  variant={'body2'}
                  marginTop={1 / 4}
                  alignSelf={'stretch'}
                  position={'relative'}
                >
                  {t('labelContactsContactExisted')}
                </Typography>
              ) : (
                addressDefault &&
                realAddr &&
                !isAddressCheckLoading && (
                  <Typography
                    color={'var(--color-text-primary)'}
                    variant={'body2'}
                    marginTop={1 / 4}
                    whiteSpace={'pre-line'}
                    style={{ wordBreak: 'break-all' }}
                  >
                    {realAddr.toLowerCase() === addressDefault.toLowerCase() ? '' : realAddr}
                  </Typography>
                )
              )}
            </Box>
          </Box>
          <Box marginTop={3}>
            <Typography marginBottom={0.5} color={'var(--color-text-third)'}>
              {t('labelContactsNameTitle')}
            </Typography>
            <TextField
              size={'large'}
              className={'text-address'}
              value={addName}
              placeholder={t('labelContactsNameDes')}
              onChange={(e) => {
                onChangeName(e.target.value)
              }}
              fullWidth={true}
              InputProps={{
                style: {
                  paddingRight: '0',
                },
                endAdornment: (
                  <InputAdornment
                    style={{
                      cursor: 'pointer',
                      paddingRight: '.5em',
                      visibility: addName ? 'visible' : 'hidden',
                    }}
                    position='end'
                  >
                    <IconButton
                      color={'inherit'}
                      aria-label='Clear'
                      onClick={() => onChangeName('')}
                    >
                      <CloseIcon cursor={'pointer'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box marginTop={3}>
            <FullAddressType
              detectedWalletType={detectedWalletType}
              selectedValue={selectedAddressType}
              handleSelected={onChangeAddressType}
              disabled={allowToClickIsSure}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            fullWidth
            variant={'contained'}
            size={'medium'}
            color={'primary'}
            onClick={() => {
              submitContact()
            }}
            loading={btnStatus === TradeBtnStatus.LOADING && !getDisabled ? 'true' : 'false'}
            disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
          >
            {label}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
