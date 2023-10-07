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
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import {
  addressToExWalletMapFn,
  exWalletToAddressMapFn,
  LoopringAPI,
  store,
  useAddressCheck,
  useBtnStatus,
  useContacts,
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
  const { btnStatus, enableBtn, disableBtn, setLoadingBtn } = useBtnStatus()
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
      return item
        ? item[1]
        : /V2_/.test(loopringSmartWalletVersion?.version ?? '')
        ? 2002
        : undefined
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
  React.useEffect(() => {
    if (realAddr && addName) {
      enableBtn()
      return
    }
    disableBtn()
  }, [addrStatus, realAddr, addName, selectedAddressType])
  React.useEffect(() => {
    if (realAddr && realAddr !== '' && !isAddressCheckLoading) {
      autoSetWalletType()
    }
    disableBtn()
  }, [realAddr, isAddressCheckLoading])
  React.useEffect(() => {
    myLog('item?.contactAddress', (isEdit as EditItem)?.item)
    if ((isEdit as EditItem)?.item?.contactAddress) {
      onChangeAddress((isEdit as EditItem)?.item.contactAddress)
      onChangeName((isEdit as EditItem)?.item.contactName)
      onChangeAddressType(
        addressToExWalletMapFn((isEdit as EditItem)?.item?.addressType ?? undefined),
      )
    }
  }, [(isEdit as EditItem)?.item?.contactAddress])
  const detectedWalletType = loopringSmartWalletVersion?.isLoopringSmartWallet
    ? WALLET_TYPE.Loopring
    : isContractAddress
    ? WALLET_TYPE.OtherSmart
    : WALLET_TYPE.EOA
  const onChangeAddress = (input: string) => {
    setAddress(input)
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
  }

  const { defaultNetwork } = useSettings()

  const onSubmit = React.useCallback(async () => {
    setLoadingBtn()
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

        enableBtn()
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
        // setLoading(false)
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
        enableBtn()
      }
    }
  }, [
    setLoadingBtn,
    realAddr,
    addName,
    defaultNetwork,
    mapContactAddressType,
    isEdit,
    setToast,
    t,
    restData,
    enableBtn,
  ])

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
    submitContact: onSubmit,
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
  const {
    restData,
    selectedAddressType,
    detectedWalletType,
    addressDefault,
    isAddressCheckLoading,
    addName,
    onChangeName,
    realAddr,
    handleOnAddressChange,
    allowToClickIsSure,
    onChangeAddressType,
    btnStatus,
    addrStatus,
    submitContact, // ,
  } = useContactAdd({ isEdit, onClose, setToast })
  const { t } = useTranslation()
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
              ) : !isEdit &&
                contacts?.find(
                  (item) => item.contactAddress.toLowerCase() === realAddr.toLowerCase(),
                ) ? (
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
            {isEdit ? t('labelContactsEditContactBtn') : t('labelContactsAddContactBtn')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
