import React from 'react'
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton, InputAdornment,
  Typography,
} from '@mui/material'
import {
  AddressError,
  CloseIcon, EXCHANGE_TYPE,
  LoadingIcon, myLog, NetworkMap,
  TradeBtnStatus, WALLET_TYPE
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import {
  ContactType,
  exWalletToAddressMapFn, LoopringAPI, store,
  useAddressCheck,
  useBtnStatus,
  useContacts
} from '@loopring-web/core';
import { FullAddressType, TextField, Button, TOASTOPEN, ToastType, useSettings } from '@loopring-web/component-lib';
import * as sdk from '@loopring-web/loopring-sdk';

type EditItem = {
  item: ContactType
}
export const useContactAdd = ({isEdit, setToast, onClose}: {
  isEdit?: false | EditItem
  onClose: () => void,
  setToast: (props: TOASTOPEN) => void
}) => {
  const {t} = useTranslation()
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
  // const [addLoading, setAddLoading] = React.useState(false)
  const {contacts, status: contactStatus, errorMessage: contactsErrorMessage, updateContacts} = useContacts()
  const [addName, setAddName] = React.useState('')
  const [toastStatus, setToastStatus] = React.useState('Succuss' as 'Succuss' | 'Error' | 'Init')
  const {btnStatus, enableBtn, disableBtn, setLoadingBtn} = useBtnStatus()
  const [selectedAddressType, setSelectedAddressType] = React.useState<
      WALLET_TYPE | EXCHANGE_TYPE | undefined
  >(undefined)
  const allowToClickIsSure = React.useMemo(() => {
    return isAddressCheckLoading || addrStatus === AddressError.InvalidAddr || !realAddr
  }, [addrStatus, isAddressCheckLoading, realAddr])
  const mapContactAddressType = (): sdk.AddressType | undefined => {
    if (addressTypeISCFAddress) {
      createContact = {
        ...createContact,
        // @ts-ignore
        addressType: sdk.AddressType.LOOPRING_HEBAO_CF
      }
    } else if (loopringSmartWalletVersion?.isLoopringSmartWallet) {
      const map: [string, sdk.AddressType][] = [
        ['V2_1_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_1_0],
        ['V2_0_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_2_0_0],
        ['V1_2_0', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_2_0],
        ['V1_1_6', sdk.AddressType.LOOPRING_HEBAO_CONTRACT_1_1_6],
      ]
      const item = map.find(
          (x) => x[0] === loopringSmartWalletVersion?.version
      )
      return item ? item[1] : ''
    } else if (isContractAddress) {
      return sdk.AddressType.CONTRACT
    } else if (selectedAddressType) {
      return exWalletToAddressMapFn(selectedAddressType)
    }
  }
  const autoSetWalletType = () => {
    if (realAddr) {
      const addressType = mapContactAddressType()
      if (addressType) {
        const type = exWalletToAddressMapFn(addressType)
        onChangeAddressType(type)
      } else {
        onChangeAddressType(undefined);
      }
    }
  }
  React.useEffect(() => {
    if (realAddr && addName) {
      enableBtn()
      return
    }
    disableBtn()
  }, [
    addrStatus,
    realAddr,
    addName,
  ])
  React.useEffect(() => {
    if (realAddr) {
      autoSetWalletType()
    }
    disableBtn()
  }, [
    realAddr,
  ])
  React.useEffect(() => {
    myLog('item?.contactAddress', (isEdit as EditItem)?.item)
    if ((isEdit as EditItem)?.item?.contactAddress) {
      onChangeAddress((isEdit as EditItem)?.item.contactAddress)
      onChangeName((isEdit as EditItem)?.item.contactName)
      onChangeAddressType((isEdit as EditItem)?.item?.addressType ?? undefined)
    }
  }, [(isEdit as EditItem)?.item?.contactAddress])
  const detectedWalletType = loopringSmartWalletVersion?.isLoopringSmartWallet
      ? WALLET_TYPE.Loopring
      : isContractAddress
          ? WALLET_TYPE.OtherSmart
          : WALLET_TYPE.EOA
  const onChangeAddress = React.useCallback((input: string) => {
    setAddress(input)
  }, [])
  const onChangeName = React.useCallback((input: string) => {
    if (new TextEncoder().encode(input).length <= 48) {
      setAddName(input)
    }
  }, [])
  const onChangeAddressType = (value: WALLET_TYPE | EXCHANGE_TYPE | undefined) => {
    setSelectedAddressType(value)
  }
  const restData = () => {
    onChangeAddress('')
    onChangeName('')
    onChangeAddressType(undefined)
    updateContacts()
    onClose()
  }

  const {defaultNetwork} = useSettings()
  // {contactAddress: address, contactName: name, addressType}: ContactType

  const onSubmit = React.useCallback(
      async () => {
        setLoadingBtn()
        const {accountId, apiKey, isContractAddress, isCFAddress} = store.getState().account
        let createContact: sdk.CreateContactRequest | sdk.UpdateContactRequest = {
          contactAddress: realAddr,
          accountId,
          contactName: addName,
          isHebao: !!(isContractAddress || isCFAddress),
          network: NetworkMap[defaultNetwork].walletType,
        } as any
        createContact = {
          ...createContact,
          // @ts-ignore
          addressType: mapContactAddressType()
        }

        createContact = {
          ...createContact,
          // @ts-ignore
          addressType: found,
        }
        if (isEdit) {
          try {
            const response = await LoopringAPI.contactAPI?.updateContact(
                createContact,
                apiKey,
            )
            if (
                response &&
                ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
            ) {
              throw {code: ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)}
            }
            setToast({
              open: true,
              type: ToastType.success,
              content: t('labelContactsEditSuccess'),
            })
            restData()
          } catch (error) {
            //TODO: error code
            setToast({
              open: true,
              type: ToastType.error,
              content: t('labelContactsEditSuccess'),
            })
          }
        } else {
          try {
            const response = await LoopringAPI.contactAPI?.createContact(
                createContact as any,
                apiKey,
            )
            if (
                response &&
                ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)
            ) {
              throw {code: ((response as sdk.RESULT_INFO).code || (response as sdk.RESULT_INFO).message)}
            }
            // setLoading(false)
            setToast({
              open: true,
              type: ToastType.success,
              content: t('labelContactsAddSuccess'),
            })
            restData()
          } catch (error) {
            //TODO: error code
            setToast({
              open: true,
              type: ToastType.error,
              content: t('labelContactsContactExisted'),
            })

          }
        }
      },
      [contacts, loopringSmartWalletVersion],
  )

  return {
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
    setToastStatus,
    toastStatus,
    submitContact: onSubmit,
  }
}


interface AddDialogProps {
  addOpen: boolean
  setAddOpen: (open: boolean) => void
  // submitContact: () => void
  // loading: boolean
  isEdit?: false | {
    item: ContactType
  }
  onClose: () => void,
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
                                                      }) => {
  const {
    selectedAddressType,
    detectedWalletType,
    addressDefault,
    isAddressCheckLoading,
    onChangeAddress,
    addName,
    onChangeName,
    realAddr,
    handleOnAddressChange,
    allowToClickIsSure,
    onChangeAddressType,
    btnStatus,
    addrStatus,
    submitContact,// ,
  } = useContactAdd({isEdit, onClose, setToast})
  const {t} = useTranslation()
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
          setAddOpen(false)
          onChangeAddress('')
          onChangeName('')
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
              setAddOpen(false)
              onChangeAddress('')
              onChangeName('')
            }}
          >
            <CloseIcon/>
          </IconButton>
        </DialogTitle>
        <DialogContent style={{width: 'var(--modal-width)'}}>
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
                  error={!!(isInvalidAddressOrENS)}
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
                                  <LoadingIcon width={24}/>
                              ) : (
                                  <IconButton
                                      color={'inherit'}
                                      aria-label='Clear'
                                      onClick={() => handleOnAddressChange('')}
                                  >
                                    <CloseIcon/>
                                  </IconButton>
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
              ) : (
                  <>
                    {addressDefault && realAddr && !isAddressCheckLoading && (
                        <Typography
                            color={'var(--color-text-primary)'}
                            variant={'body2'}
                            marginTop={1 / 4}
                            whiteSpace={'pre-line'}
                            style={{wordBreak: 'break-all'}}
                        >
                          {realAddr.toLowerCase() === addressDefault.toLowerCase() ? '' : realAddr}
                        </Typography>
                    )}
                  </>
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
                error={!!(isInvalidAddressOrENS)}
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
                            visibility: addName ? 'visible' : 'hidden'
                          }}
                          position='end'
                      >
                        <IconButton
                            color={'inherit'}
                            aria-label='Clear'
                            onClick={() => onChangeName('')}
                        >
                          <CloseIcon cursor={'pointer'}/>
                        </IconButton>
                      </InputAdornment>
                  )
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
