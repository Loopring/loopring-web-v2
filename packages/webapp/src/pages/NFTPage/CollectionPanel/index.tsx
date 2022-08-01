import {
  ModalBackButton,
  ModalCloseButton,
  ModelPanelStyle, useOpenModals,
} from "@loopring-web/component-lib";
import { Trans, useTranslation } from "react-i18next";
import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import React from "react";
import styled from "@emotion/styled/";
import { useHistory } from 'react-router-dom';
import { CreateCollectionStep, useCollectionContract } from '@loopring-web/core';
import { LoadingBlock } from '../../LoadingPage';
import { SoursURL } from '@loopring-web/common-resources';

const StyledPaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`;


const CreateNamePanel = ({setStep}: { setStep: (step: CreateCollectionStep) => void }) => {
  const [value, setValue] = React.useState("");
  const {t} = useTranslation('common');

  const {createContract} = useCollectionContract({setStep});
  return <Box flex={1} display={"flex"} flexDirection={"column"} alignItems={"center"} justifyContent={"center"}>
    <Box marginBottom={3} width={'var(--modal-width)'}>
      <Typography component={'h4'} variant={'h4'} textAlign={'center'} marginBottom={2}>
        {t('labelCollectionCreateERC1155')}
      </Typography>
    </Box>
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
        onClick={() => {
          createContract({name: value})
          setStep(CreateCollectionStep.Loading)
        }}
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
  const [step, setStep] = React.useState(CreateCollectionStep.CreateTokenAddress);

  const panelList: Array<{
    view: JSX.Element;
    onBack?: undefined | (() => void);
    height?: any;
    width?: any;
  }> = React.useMemo(() => {
    return [
      {
        view: <CreateNamePanel setStep={setStep}/>,
      },
      {
        view: <Box minHeight={"148px"} flex={1}
                   display={'flex'} flexDirection={'column'} alignItems={'center'} width={'var(--modal-width)'}>
          <Typography component={'h4'} variant={'h4'} textAlign={'center'} marginBottom={3}>
            {t('Waiting for create Collection token Address')}
          </Typography>
          <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            <div className="loader loader--style3" title="2">
              <img
                className="loading-gif"
                alt={"loading"}
                width="36"
                src={`${SoursURL}images/loading-line.gif`}
              />
            </div>
          </Box>
        </Box>,
        onBack: () => setStep(CreateCollectionStep.CreateTokenAddress)
      },
      {
        view: <Box minHeight={"280px"} flex={1}
                   display={'flex'} flexDirection={'column'} alignItems={'center'} width={'var(--modal-width)'}>
          <Typography component={'h4'} variant={'h4'} textAlign={'center'}>
            {t('labelCollectionCreateFailed')}
          </Typography>
          <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
            {t('Collection Failed')}
          </Box>
        </Box>,
        onBack: () => setStep(CreateCollectionStep.CreateTokenAddress)
      },
      {
        view: <Box
          flex={1}
          alignItems={"center"}
          display={"flex"}
          justifyContent={"center"}
          flexDirection={"column"}
        >
          <Typography component={'h4'} variant={'h4'} textAlign={'center'} marginBottom={3}>
            {t('labelMintSelect')}
          </Typography>
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
        onBack: () => setStep(CreateCollectionStep.CreateTokenAddress)
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
