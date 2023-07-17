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
  const { deleteInfo, onCloseDelete, submitDeleteContact, loading } = props;

  cnst theme = useTheme();
  cost { t } = useTranslation();

  rturn (
    <div>
      <Dialog
        open={deleteInfo.open}
        onClose={() => {
          onCloseDelete();
       }}
      >
        <DialogTitle>
          <Typography variant={"h3"} 'h3'Align={"cente'center'         {t("label'labelContactsDeleteContact'       </Typography>
          <IconButton
            size={"mediu'medium'        sx={{
              position: "absol'absolute'          right: 8,
              top: 8,
            }}
            color={"inher'inherit'        onClick={() => {
              onCloseDelete();
           }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ width: "var(-'var(--modal-width)'         <Box marginBottom={12} marginTop={6}>
            <TextField
              label={t("label'labelDeleteContactInfo'           style={{
                backgroundColor: "var(-'var(--box-card-decorate)'          }}
              color={"prima'primary'          InputProps={{
                style: {
                  background: "var(-'var(--field-opacity)'              height: `${theme.unit * 6}px`,
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
              variant="contained"
              onClick={() => {
                submitDeleteContact!(
                  deleteInfo.selected!.address,
                  deleteInfo.selected!.name
                );
              }}
              fullWidth
            >
              {loading ? (
                <LoadingIcon></LoadingIcon>
              ) : (
                t('labelContactsDeleteContactBtn')
              )}
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
                onCloseDelete();
              }}
            >
              {t('labelCancel')}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </div>
  );
};
