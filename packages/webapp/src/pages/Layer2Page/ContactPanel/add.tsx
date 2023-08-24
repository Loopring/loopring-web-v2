// import { Dialog } from "@mui/material";

import React from 'react'
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton, InputAdornment,
  OutlinedInput,
  Typography,
} from '@mui/material'
import { useContactAdd } from './hooks'
import {
  AddressError,
  CloseIcon, L1L2_NAME_DEFINED,
  LoadingIcon,
  TradeBtnStatus
} from '@loopring-web/common-resources'
import { useTheme } from '@emotion/react'
import { useTranslation } from 'react-i18next'
import { ContactType } from '@loopring-web/core';
import { FullAddressType, TextField, Button } from '@loopring-web/component-lib';

interface AddDialogProps {
  addOpen: boolean
  setAddOpen: (open: boolean) => void
  submitContact: (item: ContactType) => void
  loading: boolean
  isEdit?: false | {
    item: ContactType
  }
}

export const EditContact: React.FC<AddDialogProps> = ({
                                                        setAddOpen,
                                                        addOpen,
                                                        submitContact,
                                                        loading,
                                                        isEdit = false,
                                                      }) => {
  const theme = useTheme()
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
    handleAddressTypeSelected,
    btnStatus,
    addrStatus,
  } = useContactAdd({isEdit})
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
          <Typography variant={'h3'} textAlign={'center'}>
            {isEdit ? t('labelContactsEditContact') : t('labelContactsAddContact')}
          </Typography>
          <IconButton
            size={'medium'}
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
                  // label={t('labelL2toL1Address', {
                  //   l1ChainName: L1L2_NAME_DEFINED[ network ].l1ChainName,
                  // })}
                  // SelectProps={{IconComponent: DropDownIcon}}
                  fullWidth={true}
                  InputProps={{
                    style: {
                      paddingRight: '0',
                    },
                    endAdornment: (
                        <InputAdornment
                            style={{
                              cursor: 'pointer',
                              paddingRight: '0',
                            }}
                            position='end'
                        >
                          {addressDefault !== '' ? (
                              isAddressCheckLoading ? (
                                  <LoadingIcon width={24}/>
                              ) : (
                                  <IconButton
                                      color={'inherit'}
                                      size={'small'}
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
                          {realAddr}
                        </Typography>
                    )}
                  </>
              )}
            </Box>
            {/*<OutlinedInput*/}
            {/*  label={t('labelContactsAddressTitle')}*/}
            {/*  placeholder={t('labelContactsAddressDes')}*/}
            {/*  style={{*/}
            {/*    // backgroundColor: "var(--box-card-decorate)",*/}
            {/*    background: 'var(--field-opacity)',*/}
            {/*    height: `${theme.unit * 6}px`,*/}
            {/*  }}*/}
            {/*  value={!!isEdit && isEdit?.item.contactAddress}*/}
            {/*  disabled={!!isEdit}*/}
            {/*  endAdornment={*/}
            {/*    <CloseIcon*/}
            {/*      cursor={'pointer'}*/}
            {/*      fontSize={'large'}*/}
            {/*      htmlColor={'var(--color-text-third)'}*/}
            {/*      style={{ visibility: addAddress ? 'visible' : 'hidden' }}*/}
            {/*      onClick={() => {*/}
            {/*        onChangeAddress('')*/}
            {/*      }}*/}
            {/*    />*/}
            {/*  }*/}
            {/*  fullWidth={true}*/}
            {/*  value={addAddress}*/}
            {/*  onChange={(e) => {*/}
            {/*    onChangeAddress(e.target.value)*/}
            {/*  }}*/}
            {/*/>*/}
            {/*<FormHelperText>*/}
            {/*  {addShowInvalidAddress ? (*/}
            {/*    <Typography variant={'body2'} textAlign={'left'} color='var(--color-error)'>*/}
            {/*      {t('labelContactsAddressInvalid')}*/}
            {/*    </Typography>*/}
            {/*  ) : displayEnsResolvedAddress ? (*/}
            {/*    <Typography variant={'body2'} color='var(--color-text-primary)'>*/}
            {/*      {displayEnsResolvedAddress}*/}
            {/*    </Typography>*/}
            {/*  ) : (*/}
            {/*    <Typography>&nbsp;</Typography>*/}
            {/*  )}*/}
            {/*</FormHelperText>*/}
          </Box>
          <Box marginTop={3}>
            {/* <OutlinedInput></> */}
            <Typography marginBottom={0.5} color={'var(--color-text-third)'}>
              {t('labelContactsNameTitle')}
            </Typography>
            <OutlinedInput
              label={t('labelContactsNameTitle')}
              placeholder={t('labelContactsNameDes')}
              style={{
                // backgroundColor: "var(--box-card-decorate)",
                background: 'var(--field-opacity)',
                height: `${theme.unit * 6}px`,
              }}
              value={addName}
              endAdornment={
                <CloseIcon
                  cursor={'pointer'}
                  fontSize={'large'}
                  htmlColor={'var(--color-text-third)'}
                  style={{visibility: addName ? 'visible' : 'hidden'}}
                  onClick={() => {
                    onChangeName('')
                  }}
                />
              }
              fullWidth
              onChange={(e) => {
                onChangeName(e.target.value)
              }}
            />
          </Box>
          <Box marginTop={3}>
            <FullAddressType
                detectedWalletType={detectedWalletType}
                selectedValue={selectedAddressType}
                handleSelected={handleAddressTypeSelected}
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
              submitContact({
                addressType: selectedAddressType,
                contactAddress: realAddr
              })
            }}
            loading={btnStatus === TradeBtnStatus.LOADING && !getDisabled ? 'true' : 'false'}
            disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
          >
            {t('labelContactsAddContactBtn')}
          </Button>
          {/*<Button*/}
          {/*  variant='contained'*/}
          {/*  disabled={addButtonDisable}*/}
          {/*  onClick={() => {*/}
          {/*    const address = isAddress(addAddress) ? addAddress : displayEnsResolvedAddress!*/}

          {/*    submitAddingContact(address, addName, (success) => {*/}
          {/*      if (success) {*/}
          {/*        onChangeName('')*/}
          {/*        onChangeAddress('')*/}
          {/*      }*/}
          {/*    })*/}
          {/*  }}*/}
          {/*  fullWidth*/}
          {/*>*/}
          {/*  {loading ? <LoadingIcon></LoadingIcon> : t('labelContactsAddContactBtn')}*/}
          {/*</Button>*/}
        </DialogActions>
      </Dialog>
    </div>
  )
}
