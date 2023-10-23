import { useHistory } from 'react-router-dom'
import {
  CardNFTStyled,
  ModalBackButton,
  ModalCloseButton,
  ModelPanelStyle,
  NftImage,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { Box, Button, Modal, Typography } from '@mui/material'
import {
  CreateCollectionStep,
  NFTSubRouter,
  RouterPath,
  SoursURL,
} from '@loopring-web/common-resources'
import React from 'react'

export const MintLandingPanel = () => {
  const history = useHistory()
  // const {setShowNFTMintAdvance} = useOpenModals();
  const { t } = useTranslation(['common'])
  const { isMobile } = useSettings()
  return (
    <Box flex={1} display={'flex'} justifyContent={'stretch'} flexDirection={'column'}>
      <Box marginBottom={2}>
        <Typography component={'h3'} variant={'h4'} marginBottom={1}>
          {t('labelMintSelect')}
        </Typography>
        <Typography component={'h3'} variant={'body1'} color={'textSecondary'}>
          {t('labelMintSelectDes')}
        </Typography>
      </Box>
      <Box
        flex={1}
        alignItems={'center'}
        display={'flex'}
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent={'center'}
      >
        <CardNFTStyled
          sx={{ marginBottom: isMobile ? 4 : 0 }}
          onClick={() => {
            history.push(`${RouterPath.nft}/${NFTSubRouter.mintNFT}`)
          }}
        >
          <Box
            flex={1}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            marginBottom={2}
            minHeight={200}
            width={'100%'}
          >
            <NftImage
              alt={'NFT Created'}
              onError={() => undefined}
              src={`${SoursURL}images/nft_guid1.webp`}
            />
          </Box>
          <Typography
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'space-between'}
            paddingX={2}
            component={'p'}
            variant={'body1'}
            minHeight={'160px'}
            marginBottom={3}
          >
            <>
              {t('labelMintGuid')}

              <Button variant={'contained'} color={'primary'} fullWidth={true}>
                {t('labelMintNFT')}
              </Button>
            </>
          </Typography>
        </CardNFTStyled>
        <CardNFTStyled
          sx={{ marginLeft: isMobile ? 0 : 4, marginBottom: isMobile ? 4 : 0 }}
          onClick={() => {
            history.push(`${RouterPath.nft}/${NFTSubRouter.mintNFTAdvance}`)
            // setShowNFTMintAdvance({isShow: true});
          }}
        >
          <Box
            flex={1}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'center'}
            marginBottom={2}
            minHeight={200}
            width={'100%'}
          >
            {/*<NftImage*/}
            {/*  */}
            {/*  onError={() => undefined}*/}
            {/*  src={"https://static.loopring.io/assets/images/nft-mint.png"}*/}
            {/*/>*/}
            <NftImage
              alt={'NFT Created'}
              onError={() => undefined}
              src={`${SoursURL}images/nft_guid2.webp`}
            />
          </Box>
          <Typography
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'space-between'}
            paddingX={2}
            component={'p'}
            variant={'body1'}
            minHeight={'160px'}
            marginBottom={3}
          >
            <>
              {t('labelAdMintGuid')}
              <Button variant={'contained'} color={'primary'} fullWidth={true}>
                {t('labelAdvanceMint')}
              </Button>
            </>
          </Typography>
        </CardNFTStyled>
      </Box>
    </Box>
  )
}
export const CreateUrlPanel = ({
  open,
  onClose,
  step,
}: {
  onClose: () => void
  open: boolean
  step: CreateCollectionStep
}) => {
  const { t } = useTranslation()
  const { setShowCollectionAdvance } = useOpenModals()
  const history = useHistory()
  const { isMobile } = useSettings()
  const panelList: Array<{
    view: JSX.Element
    onBack?: undefined | (() => void)
    height?: any
    width?: any
  }> = React.useMemo(() => {
    return [
      {
        view: (
          <Box
            flex={1}
            alignItems={'center'}
            display={'flex'}
            justifyContent={'center'}
            flexDirection={'column'}
            marginTop={-3}
          >
            <Typography component={'h4'} variant={'h4'} textAlign={'center'} marginBottom={3}>
              {t('labelMintSelect')}
            </Typography>
            <Box
              flex={1}
              alignItems={'center'}
              display={'flex'}
              flexDirection={isMobile ? 'column' : 'row'}
              justifyContent={'center'}
            >
              <CardNFTStyled
                sx={{ background: 'var(--color-global-bg)' }}
                onClick={() => {
                  onClose()
                  setShowCollectionAdvance({ isShow: true })
                }}
              >
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  flex={1}
                  marginBottom={2}
                  minHeight={200}
                  width={'100%'}
                >
                  <NftImage
                    alt={'Collection Created'}
                    onError={() => undefined}
                    src={`${SoursURL}images/nft_guid1.webp`}
                  />
                </Box>
                <Typography
                  display={'flex'}
                  flexDirection={'column'}
                  justifyContent={'space-between'}
                  paddingX={2}
                  component={'p'}
                  variant={'body1'}
                  minHeight={'148px'}
                  marginBottom={2}
                >
                  Fill up content in GUI and let Loopring to generate necessary metadata and upload
                  to IPFS for you, then use "Mint" to create your NFT.
                  <Button variant={'contained'} color={'primary'} fullWidth={true}>
                    {t('labelAdvanceCreateCollection')}
                  </Button>
                </Typography>
              </CardNFTStyled>
              <CardNFTStyled
                sx={{
                  marginLeft: isMobile ? 0 : 4,
                  background: 'var(--color-global-bg)',
                }}
                onClick={() => {
                  history.push(`${RouterPath.nft}/${NFTSubRouter.addCollection}`)
                }}
              >
                <Box
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  flex={1}
                  marginBottom={2}
                  minHeight={200}
                  width={'100%'}
                >
                  <NftImage
                    alt={'Collection Created'}
                    onError={() => undefined}
                    src={`${SoursURL}images/nft_guid2.webp`}
                  />
                </Box>
                {/*<Typography component={'p'} variant={'body1'} height={"48px"} marginBottom={1}*/}
                {/*>*/}
                {/*  Fill up content in GUI and let Loopring to generate necessary metadata and upload to IPFS for you, then use "Mint" to create your NFT.*/}
                {/*</Typography>*/}
                {/*<Button*/}
                {/*  variant={"outlined"}*/}
                {/*  color={"primary"}*/}
                {/*>*/}
                {/*  {t("labelMintNFT")}*/}
                {/*</Button>*/}
                <Typography
                  display={'flex'}
                  flexDirection={'column'}
                  justifyContent={'space-between'}
                  paddingX={2}
                  component={'p'}
                  variant={'body1'}
                  minHeight={'148px'}
                  marginBottom={2}
                >
                  Generate all the required metadata and upload to IPFS by yourself first, then use
                  "Advanced Mint" to create your NFT.
                  <Button variant={'contained'} color={'primary'} fullWidth={true}>
                    {t('labelCollectionCreateBtn')}
                  </Button>
                </Typography>
              </CardNFTStyled>
            </Box>
            <Box marginLeft={1}></Box>
          </Box>
        ),
        // onBack: () => setStep(CreateCollectionStep.ChooseMethod)
      },
      {
        view: <MintLandingPanel />,
      },
      {
        view: <Typography>Go toEdit Panel....</Typography>,
      },
    ]
  }, [history, isMobile, onClose, setShowCollectionAdvance, t])
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <ModelPanelStyle style={{ boxShadow: '24' }}>
        {panelList.map((panel, index) => {
          return (
            <React.Fragment key={index + '0'}>
              <Box
                display={step === index ? 'flex' : 'none'}
                width={'100%'}
                flexDirection={'column'}
              >
                <ModalCloseButton onClose={onClose} t={t} />
                {panel.onBack ? <ModalBackButton onBack={panel.onBack} /> : <></>}
              </Box>
              <Box
                display={step === index ? 'flex' : 'none'}
                alignItems={'stretch'}
                flex={1}
                key={index}
                margin={5 / 2}
              >
                {panel.view}
              </Box>
            </React.Fragment>
          )
        })}
      </ModelPanelStyle>
    </Modal>
  )
}

export const MintLandingPage = () => {
  // const history = useHistory();
  // const {t} = useTranslation(["common"]);
  // const {isMobile} = useSettings();
  return (
    <Box flex={1} display={'flex'} justifyContent={'stretch'} flexDirection={'column'}>
      <MintLandingPanel />
    </Box>
  )
}
