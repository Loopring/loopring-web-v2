// import { Dialog } from "@mui/material";

import React from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton,
} from '@mui/material'
import { Contact } from './hooks'
import { CloseIcon, LoadingIcon } from '@loopring-web/common-resources'
import { TextField } from '@loopring-web/component-lib'
import { useTheme } from '@emotion/react'
import { useTranslation } from 'react-i18next'

interface DeleteDialogProps {
  deleteInfo: {
    open: boolean
    selected: Contact | undefined
  }
  onCloseDelete: () => void
  submitDeleteContact: (address: string, name: string) => void
  loading: boolean
}

export const Delete: React.FC<DeleteDialogProps> = (props) => {
  const { deleteInfo, onCloseDelete, submitDeleteContact, loading } = props

  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <div>
      <Dialog
        open={deleteInfo.open}
        onClose={() => {
          onCloseDelete()
        }}
      >
        <DialogTitle>
          <Typography variant={'h3'} textAlign={'center'}>
            {t('labelContactsDeleteContact')}
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
              onCloseDelete()
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ width: 'var(--modal-width)' }}>
          <Box marginBottom={12} marginTop={6}>
            <TextField
              label={t('labelDeleteContactInfo')}
              style={{
                backgroundColor: 'var(--box-card-decorate)',
              }}
              color={'primary'}
              InputProps={{
                style: {
                  background: 'var(--field-opacity)',
                  height: `${theme.unit * 6}px`,
                },
              }}
              fullWidth
              value={`${deleteInfo.selected?.name}\/${deleteInfo.selected?.address}`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Box width={'100%'} flexDirection={'column'} display={'flex'}>
            <Button
              variant='contained'
              onClick={() => {
                submitDeleteContact!(deleteInfo.selected!.address, deleteInfo.selected!.name)
              }}
              fullWidth
            >
              {loading ? <LoadingIcon></LoadingIcon> : t('labelContactsDeleteContactBtn')}
            </Button>
            <Box></Box>
            <Button
              variant={'outlined'}
              style={{
                border: 'none',
                marginTop: `${theme.unit}px`,
              }}
              color={'info'}
              onClick={() => {
                onCloseDelete()
              }}
            >
              {t('labelCancel')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </div>
  )
}
