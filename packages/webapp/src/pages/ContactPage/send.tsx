// import { Dialog } from "@mui/material";

import React from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import { Contact, useContactSend } from './hooks';
import { CheckIcon, CloseIcon } from '@loopring-web/common-resources';
import { CoinIcon, TextField } from '@loopring-web/component-lib';
import { useTheme } from '@emotion/react';
import styled from "@emotion/styled";
import { useTranslation } from 'react-i18next';

const BoxWithTriangle = styled(Box)<{selected: boolean}>`
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid;
  cursor: pointer;
  border-color: ${({theme, selected}) => selected ? theme.colorBase.borderSelect : theme.colorBase.border};
  ::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    display: ${({selected}) => selected ? '' : 'none'};
    border-bottom: 12px solid transparent;
    border-right: 12px solid ${({theme}) => theme.colorBase.borderSelect};
    border-top: 12px solid ${({theme}) => theme.colorBase.borderSelect};
    border-left: 12px solid transparent;
  }
  .check-icon {
    position: absolute;
    top: 0;
    right: 0;
    color: ${({theme}) => theme.mode === 'dark' ? 'black' : 'white'};
  }
`
const SelectNetwork = (props : {
  icon: JSX.Element,
  selected: boolean,
  text: string,
  style?: React.CSSProperties,
  onClick: React.MouseEventHandler<HTMLDivElement>
}) => {
  // const theme = useTheme()
  const {icon, selected, text, style, onClick} = props
  return <BoxWithTriangle
    selected={selected}
    borderRadius={0.5}
    paddingX={2}
    paddingY={1.5}
    style={style}
    onClick={onClick}
    >
    {icon}
    <Typography marginLeft={1.5}>{text}</Typography>
    {selected ? <CheckIcon fontSize={"small"} className={"check-icon"}></CheckIcon> : undefined}
  </BoxWithTriangle>
}

interface SendDialogProps {
  onCloseSend: () => void;
  sendInfo: {
    open: boolean,
    selected: Contact | undefined;
  } 

}

const CloseIconStyled = styled(CloseIcon)`
  position: absolute;
  top: 5%;
  transform: translateY(-50%);
  right: ${({ theme }) => theme.unit}px;
  cursor: pointer;
`;

export const Send: React.FC<SendDialogProps> = ({ sendInfo, onCloseSend }) => {
  const {
    submitSendingContact,
    sendNetwork, 
    setSendNetwork
  } = useContactSend()

  const theme = useTheme()
  const {t} = useTranslation()
  return (
    <div>
      <Dialog maxWidth={"lg"} open={sendInfo.open} onClose={() => {
        onCloseSend()
      }}>
        <CloseIconStyled
            htmlColor={"var(--color-text-third)"}
            fontSize={"large"}
            // style={{ visibility: inputValue ? "visible" : "hidden" }}
            onClick={() => {
              onCloseSend()
              // setInputValue('')
            }}
        />
        <DialogTitle>
          <Typography marginTop={3} variant={"h3"} textAlign={"center"}>
            {t("labelContactsNetworkChoose")}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ paddingX: 4 }} style={{ width: "var(--modal-width)" }}>
          <Box paddingX={2}>
            <Box marginTop={6}>
              <TextField
                label={"Send to"}
                style={{
                  backgroundColor: "var(--box-card-decorate)"
                }}
                InputProps={{
                  style: {
                    background: "var(--field-opacity)",
                    height: `${theme.unit * 6}px`
                  },
                }}
                fullWidth
                value={`${sendInfo.selected?.name}\/${sendInfo.selected?.address}`}
              />
            </Box>
            <Box display={"flex"} marginBottom={10} marginTop={5}>
              <SelectNetwork onClick={() => { setSendNetwork('L1') }} style={{ marginRight: "4%", width: "48%" }} selected={sendNetwork === 'L1'} text={"Ethereum/L1"} icon={<CoinIcon size={32} symbol={"ETH"}></CoinIcon>} />
              <SelectNetwork onClick={() => { setSendNetwork('L2') }} style={{ width: "48%" }} selected={sendNetwork === 'L2'} text={"Loopring/L2"} icon={<CoinIcon size={32} symbol={"LRC"}></CoinIcon>} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Box width={"100%"} paddingX={2} paddingBottom={2}>
            <Button
              variant="contained"
              onClick={() => {
                submitSendingContact(sendInfo.selected!, sendNetwork)
              }}
              fullWidth>
              {t("labelContactsNext")}
            </Button>
          </Box>

        </DialogActions>
      </Dialog>
    </div>
  );
};
