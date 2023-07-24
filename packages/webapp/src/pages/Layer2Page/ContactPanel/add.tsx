// import { Dialog } from "@mui/material";

import React from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
  IconButton,
  OutlinedInput,
  Typography,
} from '@mui/material'
import { useContactAdd } from './hooks'
import { CloseIcon, LoadingIcon } from '@loopring-web/common-resources'
import { useTheme } from '@emotion/react'
import { isAddress } from 'ethers/lib/utils'
import { useTranslation } from 'react-i18next'

interface AddDialogProps {
  addOpen: boolean
  setAddOpen: (open: boolean) => void
  submitAddingContact: (address: string, name: string, callback: (s: boolean) => void) => void
  loading: boolean
}

export const Add: React.FC<AddDialogProps> = ({
  setAddOpen,
  addOpen,
  submitAddingContact,
  loading,
}) => {
  const theme = useTheme()
  const {
    addShowInvalidAddress,
    addAddress,
    onChangeAddress,
    addName,
    onChangeName,
    addButtonDisable,
    displayEnsResolvedAddress,
  } = useContactAdd()
  const { t } = useTranslation()

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
            {t('labelContactsAddContact')}
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
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ width: 'var(--modal-width)' }}>
          <Box marginTop={6}>
            <Typography marginBottom={0.5} color={'var(--color-text-third)'}>
              {t('labelContactsAddressTitle')}
            </Typography>
            <OutlinedInput
              label={t('labelContactsAddressTitle')}
              placeholder={t('labelContactsAddressDes')}
              style={{
                // backgroundColor: "var(--box-card-decorate)",
                background: 'var(--field-opacity)',
                height: `${theme.unit * 6}px`,
              }}
              endAdornment={
                <CloseIcon
                  cursor={'pointer'}
                  fontSize={'large'}
                  htmlColor={'var(--color-text-third)'}
                  style={{ visibility: addAddress ? 'visible' : 'hidden' }}
                  onClick={() => {
                    onChangeAddress('')
                  }}
                />
              }
              fullWidth={true}
              value={addAddress}
              onChange={(e) => {
                onChangeAddress(e.target.value)
              }}
            />
            <FormHelperText>
              {addShowInvalidAddress ? (
                <Typography variant={'body2'} textAlign={'left'} color='var(--color-error)'>
                  {t('labelContactsAddressInvalid')}
                </Typography>
              ) : displayEnsResolvedAddress ? (
                <Typography variant={'body2'} color='var(--color-text-primary)'>
                  {displayEnsResolvedAddress}
                </Typography>
              ) : (
                <Typography>&nbsp;</Typography>
              )}
            </FormHelperText>
          </Box>
          <Box marginBottom={10} marginTop={3}>
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
              endAdornment={
                <CloseIcon
                  cursor={'pointer'}
                  fontSize={'large'}
                  htmlColor={'var(--color-text-third)'}
                  style={{ visibility: addName ? 'visible' : 'hidden' }}
                  onClick={() => {
                    onChangeName('')
                  }}
                />
              }
              fullWidth
              value={addName}
              onChange={(e) => {
                onChangeName(e.target.value)
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            disabled={addButtonDisable}
            onClick={() => {
              const address = isAddress(addAddress) ? addAddress : displayEnsResolvedAddress!

              submitAddingContact(address, addName, (success) => {
                if (success) {
                  onChangeName('')
                  onChangeAddress('')
                }
              })
            }}
            fullWidth
          >
            {loading ? <LoadingIcon></LoadingIcon> : t('labelContactsAddContactBtn')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
