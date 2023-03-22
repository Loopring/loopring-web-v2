// import { Dialog } from "@mui/material";

import React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
} from "@mui/material";
import { Contact, useContactSend } from "./hooks";
import { CheckIcon } from "@loopring-web/common-resources";
import { CoinIcon, TextField } from "@loopring-web/component-lib";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

const BoxWithTriangle = styled(Box)<{ selected: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid;
  cursor: pointer;
  border-color: ${({ theme, selected }) =>
    selected ? theme.colorBase.borderSelect : theme.colorBase.border};

  ::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    display: ${({ selected }) => (selected ? "" : "none")};
    border-bottom: 12px solid transparent;
    border-right: 12px solid ${({ theme }) => theme.colorBase.borderSelect};
    border-top: 12px solid ${({ theme }) => theme.colorBase.borderSelect};
    border-left: 12px solid transparent;
  }

  .check-icon {
    position: absolute;
    top: 0;
    right: 0;
    color: ${({ theme }) => (theme.mode === "dark" ? "black" : "white")};
  }
`;
const SelectNetwork = (props: {
  icon: JSX.Element;
  selected: boolean;
  text: string;
  style?: React.CSSProperties;
  onClick: React.MouseEventHandler<HTMLDivElement>;
}) => {
  // const theme = useTheme()
  const { icon, selected, text, style, onClick } = props;
  return (
    <BoxWithTriangle
      selected={selected}
      borderRadius={0.5}
      paddingX={2}
      paddingY={1.5}
      style={style}
      onClick={onClick}
    >
      {icon}
      <Typography marginLeft={1.5}>{text}</Typography>
      {selected ? (
        <CheckIcon fontSize={"small"} className={"check-icon"}></CheckIcon>
      ) : undefined}
    </BoxWithTriangle>
  );
};

interface SendDialogProps {
  onCloseSend: () => void;
  sendInfo: {
    open: boolean;
    selected: Contact | undefined;
  };
}

export const Send: React.FC<SendDialogProps> = ({ sendInfo, onCloseSend }) => {
  const {
    // sendInfo,
    // setSendInfo,
    // sendLoading,
    // setSendLoading,
    submitSendingContact,
    sendNetwork,
    setSendNetwork,
  } = useContactSend();

  const theme = useTheme();

  return (
    <div>
      <Dialog
        maxWidth={"lg"}
        open={sendInfo.open}
        onClose={() => {
          onCloseSend();
        }}
      >
        <DialogTitle>
          <Typography variant={"h3"} textAlign={"center"}>
            Choose L2 or L1 Account
          </Typography>
        </DialogTitle>
        <DialogContent style={{ width: "var(--modal-width)" }}>
          <Box marginTop={6}>
            <TextField
              label={"Send to"}
              style={{
                backgroundColor: "var(--box-card-decorate)",
              }}
              InputProps={{
                style: {
                  background: "var(--field-opacity)",
                  height: `${theme.unit * 6}px`,
                },
              }}
              fullWidth
              value={`${sendInfo.selected?.name}\/${sendInfo.selected?.address}`}
            />
          </Box>
          <Box display={"flex"} marginBottom={10} marginTop={5}>
            <SelectNetwork
              onClick={() => {
                setSendNetwork("L1");
              }}
              style={{ marginRight: "4%", width: "48%" }}
              selected={sendNetwork === "L1"}
              text={"Ethereum/L1"}
              icon={<CoinIcon size={32} symbol={"ETH"}></CoinIcon>}
            />
            <SelectNetwork
              onClick={() => {
                setSendNetwork("L2");
              }}
              style={{ width: "48%" }}
              selected={sendNetwork === "L2"}
              text={"Loopring/L2"}
              icon={<CoinIcon size={32} symbol={"LRC"}></CoinIcon>}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              submitSendingContact(sendInfo.selected!, sendNetwork);
            }}
            fullWidth
          >
            Next
          </Button>
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
