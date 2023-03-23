// import { Dialog } from "@mui/material";

import React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, IconButton } from '@mui/material';
import { useContactAdd } from './hooks';
import { CloseIcon, LoadingIcon } from '@loopring-web/common-resources';
import { TextField } from '@loopring-web/component-lib';
import { useTheme } from '@emotion/react';

interface AddDialogProps {
  addOpen: boolean
  setAddOpen: (open: boolean) => void
  submitAddingContact: (address: string, name: string) => void
  loading: boolean
}

export const Add: React.FC<AddDialogProps> = ({ setAddOpen, addOpen, submitAddingContact, loading }) => {
  
  const theme = useTheme()
  const {    
    // addLoading,
    // setAddLoading,
    addShowInvalidAddress,
    addAddress,
    setAddAddress,
    addName,
    setAddName,
    addButtonDisable,
    // submitAddingContact,
    // toastStatus,
    // setToastStatus
  } = useContactAdd()

  return (
    <div>
      <Dialog  maxWidth={"lg"} open={addOpen} onClose={() => {
        setAddOpen(false)
        setAddAddress('')
        setAddName('')
      }}>
        <DialogTitle>
          <Typography variant={"h3"} textAlign={"center"}>
            Add Contact
          </Typography>
          <IconButton
            size={"medium"}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
            color={"inherit"}
            onClick={() => {
              setAddOpen(false)
              setAddAddress('')
              setAddName('')
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{width: "var(--modal-width)"}}>
          <Box marginTop={6}>
            <TextField
              label={"Address"}
              placeholder={"Enter wallet address or ENS"}
              style={{
                backgroundColor: "var(--box-card-decorate)"
              }}
              InputProps={{
                style: {
                  background: "var(--field-opacity)",
                  height: `${theme.unit * 6}px`
                },
              }}
              helperText={addShowInvalidAddress
                ? <Typography variant={"body2"} textAlign={"left"} color="var(--color-error)">Invalid address or ENS</Typography>
                : <Typography>&nbsp;</Typography>
              }
              fullWidth={true}
              value={addAddress}
              onChange={e => {
                setAddAddress(e.target.value)
              }}
            />
          </Box>
          <Box marginBottom={10} marginTop={3}>
            <TextField
              label={"Name"}
              placeholder={"Enter name for the contact"}
              style={{
                backgroundColor: "var(--box-card-decorate)"
              }}
              InputProps={{
                style: {
                  background: "var(--field-opacity)",
                  height: `${theme.unit * 6}px`
                }
              }}
              fullWidth
              value={addName}
              onChange={e => {
                setAddName(e.target.value)
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            disabled={addButtonDisable}
            onClick={() => {
              submitAddingContact(addAddress, addName)
            }}
            fullWidth>
            {loading ? <LoadingIcon></LoadingIcon> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
