// import { Dialog } from "@mui/material";

import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, IconButton } from '@mui/material';
import { Contact, useContact, useContact2 } from './hooks';
import { CloseIcon, colorBase, LoadingIcon, TOAST_TIME } from '@loopring-web/common-resources';
import { TextField, Toast } from '@loopring-web/component-lib';
import { useTheme } from '@emotion/react';

interface DeleteDialogProps {
  deleteInfo: {
    open: boolean
    selected: Contact | undefined
  }
  onCloseDelete: () => void;
  submitDeleteContact: (address: string, name: string) => void
  loading: boolean
}

export const Delete: React.FC<DeleteDialogProps> = (props) => {
  const {
    deleteInfo,
    onCloseDelete,
    submitDeleteContact,
    loading,
  } = props;

  
  const theme = useTheme()

  return (
    <div>
      <Dialog open={deleteInfo.open} onClose={() => {
        onCloseDelete()
      }}>
        <DialogTitle>
          <Typography variant={"h3"} textAlign={"center"}>
            Delete Contact
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
              onCloseDelete()
              // setDeleteInfo({
              //   open: false,
              //   selected: undefined
              // })
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent style={{ width: "var(--modal-width)" }}>
          <Box marginBottom={12} marginTop={6}>
            <TextField
              label={"Contact"}
              placeholder={"Enter wallet address or ENS"}
              style={{
                backgroundColor: "var(--box-card-decorate)"
              }}
              color={"primary"}
              InputProps={{
                style: {
                  background: "var(--field-opacity)",
                  height: `${theme.unit * 6}px`,
                  // color: ''
                },
              }}
              fullWidth
              // disabled
              value={`${deleteInfo.selected?.name}\/${deleteInfo.selected?.address}`}
            // onChange={e => {
            //   setAddAddress(e.target.value)
            // }}
            />
          </Box>
          {/* <Box marginBottom={10} marginTop={3}>
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
          </Box> */}
        </DialogContent>
        <DialogActions>
          <Box width={"100%"} flexDirection={"column"} display={"flex"}>
            <Button
              variant="contained"
              onClick={() => {
                submitDeleteContact!(deleteInfo.selected!.address, deleteInfo.selected!.name)

              }}
              fullWidth
            >
              {loading ? <LoadingIcon></LoadingIcon> : 'Delete'}
            </Button>
            <Box>

            </Box>
            <Button
              variant={"outlined"}
              style={{
                border: "none",
                marginTop: `${theme.unit}px`
              }}
              color={"info"}
              
              onClick={() => {
                onCloseDelete()
              }}
            >
              Cancel
            </Button>

          </Box>


        </DialogActions>
      </Dialog>
      {/* <Toast
        alertText={toastStatus === 'Succuss' 
          ? 'Add Contact Succeed' 
          : toastStatus === 'Error' 
            ? 'Add Contact Failed'
            : ''
        }
        severity={toastStatus === 'Succuss' ? 'success' : 'error'}
        open={toastStatus !== 'Init'}
        autoHideDuration={TOAST_TIME}
        onClose={()=> setToastStatus('Init')}
      /> */}

      {/* <toastStatus></toastStatus> */}
    </div>
  );
};
