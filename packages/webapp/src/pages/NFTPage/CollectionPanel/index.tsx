import {
  CoinIcon, ModalBackButton,
  ModalCloseButton,
  ModelPanelStyle, QRButtonStyle, useOpenModals,
} from "@loopring-web/component-lib";
import { Trans, useTranslation } from "react-i18next";
import { Box, Button, Modal, TextField } from "@mui/material";
import React, { useState } from "react";
import styled from "@emotion/styled/";
import { useHistory } from 'react-router-dom';

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`;

enum CreateCollectionStep {
  CreateUrl,
  AdvancePanel,
  CommonPanel,
}
const CreateNamePanel = ({setStep}: { setStep: (step: CreateCollectionStep) => void }) => {
  const [value, setValue] = React.useState("");
  const {t} = useTranslation('common');
  const {u} = useM
  return <Box flex={1} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
    <Box marginBottom={2} width={'var(--modal-width)'}>
      <TextField
        value={value}
        inputProps={{maxLength: 28}}
        fullWidth
        label={<Trans i18nKey={"labelCollectionName"}>Collection Name</Trans>}
        type={"text"}
        onChange={(e: React.ChangeEvent<{ value: string }>) => setValue(e.target.value)}
      />
    </Box>
    <Box width={'var(--modal-width)'} alignItems={'center'} display={'flex'} justifyContent={'center'}>
      <Button
        onClick={() => setStep(CreateCollectionStep.AdvancePanel)}
        variant={"contained"}
        disabled={value.trim() === ''}
        fullWidth
        color={"primary"}
      >
        {t("labelCreateCollection")}
      </Button>
    </Box>

  </Box>
}

const CreateUrlPanel = ({
                          open,
                          onClose,
                        }: {
  onClose: () => void,
  open: boolean,
  // setStep: (props: CreateCollectionStep) => void;
}) => {
  const {t} = useTranslation();
  const {setShowCollectionAdvance} = useOpenModals();
  const history = useHistory();
  const [step, setStep] = React.useState(CreateCollectionStep.CreateUrl);

  const panelList: Array<{
    view: JSX.Element;
    onBack?: undefined | (() => void);
    height?: any;
    width?: any;
  }> = React.useMemo(() => {
    return [
      {
        view: <CreateNamePanel/>,
      },
      {
        view: <Box
          flex={1}
          alignItems={"center"}
          display={"flex"}
          justifyContent={"center"}
        >
          <Box marginLeft={1}>
            <Button
              onClick={() => {
                onClose();
                setShowCollectionAdvance({isShow: true});
              }}
              variant={"outlined"}
              color={"primary"}
            >
              {t("labelAdvanceCreate")}
            </Button>
          </Box>
          <Box marginLeft={1}>
            <Button
              onClick={() => {
                history.push("/nft/CreateCollection");
              }}
              variant={"outlined"}
              color={"primary"}
            >
              {t("labelMintNFT")}
            </Button>
          </Box>
        </Box>,
        onBack: () => setStep(CreateCollectionStep.CreateUrl)
      }
    ]
  }, [])
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <ModelPanelStyle style={{boxShadow: "24"}}>

        {panelList.map((panel, index) => {
          return (
            <React.Fragment key={index + '0'}>
              <Box display={step === index ? "flex" : "none"} width={"100%"} flexDirection={"column"}>
                <ModalCloseButton onClose={onClose} t={t}/>
                {panel.onBack ? <ModalBackButton onBack={panel.onBack}/> : <></>}
              </Box>
              <Box
                display={step === index ? "flex" : "none"}
                alignItems={"stretch"}
                flex={1}
                key={index}
                margin={5 / 2}
              >
                {panel.view}
              </Box>
            </React.Fragment>
          );
        })}
      </ModelPanelStyle>
    </Modal>

  );
};
const CommonPanel = () => {
  return <></>;
};
export const NFTCollectPanel = () => {
  const {t} = useTranslation(["common"]);
  const [showCreateOpen, setCreateOpen] = React.useState(false);
  return (
    <Box
      flex={1}
      alignItems={"center"}
      display={"flex"}
      flexDirection={'column'}
      justifyContent={"center"}
      component={"section"}
      marginTop={1}
    >
      <Box display={'flex'} alignSelf={"flex-end"}>
        <Button
          onClick={() => {
            setCreateOpen(true)
          }}
          variant={"outlined"}
          color={"primary"}
        >
          {t("labelCreateCollection")}
        </Button>
      </Box>
      <Box flex={1}></Box>
      <CreateUrlPanel open={showCreateOpen} onClose={() => {
        setCreateOpen(false);
      }}
      />
    </Box>
  );
};
