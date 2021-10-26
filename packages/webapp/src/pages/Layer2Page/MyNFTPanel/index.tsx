import styled from '@emotion/styled';
import { Box, Card, Grid, Link, Modal as MuiModal, Typography } from '@mui/material';
import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Button, ModalCloseButton, SwitchPanelStyled } from '@loopring-web/component-lib';
import { useModals } from 'hooks/useractions/useModals';
import { DiscordIcon, getFormattedHash, MediumIcon, TwitterIcon, YoutubeIcon } from '@loopring-web/common-resources';
import { useSystem } from '../../../stores/system';
import { useMyNFT } from './hook';


const StyledPaper = styled(Box)`
  //width: 100%;
  //height: 100%;
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`

const CardStyle = styled(Card)`
  background: var(--color-global-bg);
  width: 100%;
  cursor: pointer;
  height: 0;
  padding: 0;
  padding-bottom: calc(100% + 80px);
  position: relative;

  img {
    //width: 100%;
    object-fit: contain
  }

  //margin: 50px;
` as typeof Card
const BoxNFT = styled(Box)`
  background: var(--color-global-bg);

  img {
    object-fit: contain
  }
` as typeof Box
// const PopCard = styled(Card)`
//   background:var(--color-global-bg);
//   width: 100%;
//   cursor: pointer;
//   height: 0;
//   padding: 0;
//   padding-bottom: calc(100% + 80px);
//   position: relative;
//   //margin: 50px;
// ` as typeof Card


// const PopImgBlock = styled(Card)`
//     background:var(--color-global-bg);
//     width: 100%;
//     cursor: pointer;
//     height: 0;
//     padding: 0;
//     padding-bottom: calc(100% + 80px);
//     position: relative;
//   //margin: 50px;
// ` as typeof Card

export const MyNFTPanel = withTranslation(['common', 'layout'])(({t, ...rest}: & WithTranslation) => {
    // const {resetKeypair,} = useResetAccount()
    // const {setShowFeeSetting} = useOpenModals()
    // const {exportAccount} = useExportAccountInfo()
    const {etherscanBaseUrl} = useSystem();
    const {
        // showDeposit,
        showTransfer,
        showWithdraw,
    } = useModals()
    const {
        // showDeposit,
        popItem,
        onDetail,
        onDetailClose,
        isShow,
        NFTList,
    } = useMyNFT()

    const modalContent = React.useMemo(() => {

        return popItem && <>
          <BoxNFT display={'flex'} width={570} height={570} margin={1} marginTop={-4} alignItems={'center'}
                  justifyContent={'center'}>
            <img width={'100%'} height={'100%'} src={popItem.image}/>
          </BoxNFT>
          <Box flex={1} marginLeft={2} display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
            <Box marginBottom={3}>
              <Typography color={'text.secondary'}> {t('labelNFTTokenID')}</Typography>
              <Typography color={'text.primary'} variant={'h2'} marginTop={2}>#{popItem?.tokenId}</Typography>

            </Box>
            <Box display={'flex'} flexDirection={'column'} marginBottom={4}>
              <Typography component={'h6'} color={'text.primary'} variant={'h3'}>{t('labelNFTDetail')}</Typography>
              <Typography display={'inline-flex'} variant={'body1'} marginTop={2}>
                <Typography color={'var(--color-text-third)'} width={160}> {t('labelNFTName')}</Typography>
                <Typography color={'var(--color-text-third)'}
                            title={popItem?.name}>  {popItem?.name}</Typography>
              </Typography>

              <Typography display={'inline-flex'} variant={'body1'} marginTop={2}>
                <Typography color={'var(--color-text-third)'} width={160}>{t('labelNFTID')} </Typography>
                <Typography color={'var(--color-text-third)'}
                            title={popItem?.ntfId}>{popItem?.nftId.length > 20 ? getFormattedHash(popItem?.nftId) : popItem?.nftId}</Typography>
              </Typography>
              <Typography display={'inline-flex'} variant={'body1'} marginTop={2}>
                <Typography color={'var(--color-text-third)'} width={160}>{t('labelNFTTYPE')} </Typography>
                <Typography color={'var(--color-text-third)'}
                            title={popItem?.type}>{popItem.nftType}</Typography>
              </Typography>
              <Typography display={'inline-flex'} variant={'body1'} marginTop={2}>
                <Typography color={'var(--color-text-third)'} width={160}> {t('labelNFTContractAddress')}</Typography>
                <Link fontSize={'inherit'}
                      onClick={() => window.open(`${etherscanBaseUrl}tx/${popItem.tokenAddress}`)}> {getFormattedHash(popItem.tokenAddress)}</Link>
              </Typography>
              <Typography display={'inline-flex'} variant={'body1'} marginTop={2}>
                <Typography color={'var(--color-text-third)'} width={160}>{t('labelNFTMinter')} </Typography>

                <Link fontSize={'inherit'}
                      onClick={() => window.open(`${etherscanBaseUrl}tx/${popItem.minter}`)}> {getFormattedHash(popItem.minter)}</Link>

              </Typography>

                {/*<Typography display={'inline-flex'} variant={'body1'} marginTop={2}>*/}
                {/*  <Typography color={'var(--color-text-third)'} width={160}>{t('labelNFTTokenStandard')} </Typography>*/}
                {/*  <Typography>{popItem.created_by}</Typography>*/}
                {/*</Typography>*/}
                {/*<Typography display={'inline-flex'}  variant={'body1'} marginTop={1}>*/}
                {/*  <Typography  color={'var(--color-text-third)'} width={160}>{t('labelNFTTokenBlockChain')} </Typography>*/}
                {/*  <Typography></Typography>*/}
                {/*</Typography>*/}
                {/*<Typography display={'inline-flex'} variant={'body1'} marginTop={2}>*/}
                {/*  <Typography color={'var(--color-text-third)'} width={160}>{t('labelNFTTokenMinted')} </Typography>*/}
                {/*  <Link fontSize={'inherit'}*/}
                {/*        onClick={() => window.open(`${etherscanBaseUrl}tx/${popItem.tokenAddress}`)}> {getFormattedHash(popItem.tokenAddress)}</Link>*/}
                {/*</Typography>*/}
                <Typography display={'inline-flex'} variant={'body1'} marginTop={2} flex={1}>
                  <Typography color={'var(--color-text-third)'} width={160}>{t('labelNFTDescription')} </Typography>
                  <Typography color={'var(--color-text-third)'} component={'span'} whiteSpace={'break-spaces'} >{popItem.description} </Typography>

                    {/*<Typography>{moment(popItem?.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Typography>*/}
                </Typography>
                {/*<Typography display={'inline-flex'} variant={'body1'} marginTop={2}>*/}
                {/*  <Typography color={'var(--color-text-third)'} width={160}>{t('labelNFTDate')} </Typography>*/}
                {/*  <Typography>{moment(popItem?.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Typography>*/}
                {/*</Typography>*/}
              <Typography style={{display: 'inline-flex', alignItems: 'flex-start'}} marginTop={2}>
                  {
                      [
                          {
                              linkName: <DiscordIcon color={'inherit'} fontSize={'large'}/>,
                              linkHref: "https://discord.com/invite/KkYccYp"
                          },
                          {
                              linkName: <TwitterIcon color={'inherit'} fontSize={'large'}/>,
                              linkHref: "https://twitter.com/loopringorg"
                          },
                          {
                              linkName: <YoutubeIcon color={'inherit'} fontSize={'large'}/>,
                              linkHref: "https://www.youtube.com/c/Loopring"
                          },
                          {
                              linkName: <MediumIcon color={'inherit'} fontSize={'large'}/>,
                              linkHref: "https://medium.com/loopring-protocol"
                          }
                      ].map((o, index) => (
                          <Link paddingX={0.5} fontSize={12} key={`${o.linkName}-${index}`}
                                onClick={() => window.open(o.linkHref)}>{o.linkName}</Link>

                      ))
                  }
              </Typography>
              <Typography display={'inline-flex'} variant={'body1'} marginTop={3}>
                <Typography minWidth={100}>
                  <Button variant={'contained'} size={'small'} color={'primary'} fullWidth
                          onClick={() => showTransfer({
                              isShow: true,
                              symbol: popItem.id
                          })}>{t('labelNFTTransfer')}</Button>
                    {/*() => onShowTransfer(tokenValue) isNFT:'ntf'*/}
                </Typography>
                <Typography marginLeft={3} minWidth={100}>
                  <Button variant={'outlined'} size={'medium'} fullWidth
                          onClick={() => showWithdraw({
                              isShow: true,
                              symbol: popItem.id
                          })}>{t('labelNFTWithdraw')}</Button>

                </Typography>

              </Typography>

            </Box>

          </Box>
        </>
    }, [popItem, etherscanBaseUrl])
    return <StyledPaper flex={1} className={'MuiPaper-elevation2'} marginTop={0} marginBottom={2}>
        <MuiModal
            open={isShow}
            onClose={onDetailClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <SwitchPanelStyled width={'80%'} position={'relative'} minWidth={1000}
                               style={{alignItems: 'stretch'}}>
                {/*<Box display={'flex'} width={"100%"} flexDirection={'column'}>*/}
                {/*    <ModalCloseButton onClose={onClose} {...rest} />*/}
                {/*    /!*{onBack ? <ModalBackButton onBack={onBack}  {...rest}/> : <></>}*!/*/}
                {/*</Box>*/}
                {/*<Box className={'trade-panel'}>*/}
                {/*    {content}*/}
                {/*</Box>*/}
                <Box display={'flex'} width={"100%"} flexDirection={'column'}>
                    <ModalCloseButton onClose={onDetailClose} t={t} {...rest} />
                    {/*{onBack ? <ModalBackButton onBack={onBack}  {...rest}/> : <></>}*/}
                </Box>
                <Box display={'flex'} flexDirection={'row'} flex={1} justifyContent={'stretch'}>
                    {modalContent}
                </Box>

            </SwitchPanelStyled>
        </MuiModal>
        <Typography paddingX={3} paddingY={3} component={'h3'}
                    variant={'h5'}>{t('labelNFTMyNFT', {num: 0})}</Typography>
        <Grid container spacing={2} paddingX={3} paddingBottom={3}>
            {NFTList.map((item, index) => <Grid item xs={12} md={6} lg={4} flex={'1 1 120%'}>
                <CardStyle sx={{maxWidth: 345}} key={item.nftId + index} onClick={() => {
                    onDetail(item)
                }}>
                    <Box position={'absolute'}
                         width={'100%'} height={'100%'} display={'flex'} flexDirection={'column'}
                         justifyContent={'space-between'}>
                        <Box flex={1} style={{background: "var(--field-opacity)"}} display={'flex'}
                             alignItems={'center'}
                             justifyContent={'center'}>
                            <img width={'100%'} height={'100%'} src={item.image}/></Box>
                        <Box padding={2} height={80}>
                            <Typography
                                color={'text.secondary'}
                                component={'h6'}>{item.name}</Typography>
                            <Typography color={'--color-text-primary'} component={'p'} title={item.nftId}>
                                {t('labelNFTTokenID')} #{item.tokenId}
                                {/*#{item.nftId.length > 10 ? getFormattedHash(item.nftId) : item.nftId}*/}
                            </Typography>
                        </Box>
                    </Box>
                </CardStyle>
            </Grid>)}
        </Grid>

        {/*<Typography variant={'h5'} component={'h3'} paddingLeft={2}>{t('labelNFTTitleMyNFT')}</Typography>*/}
        {/*<Modal>*/}
    </StyledPaper>
})

