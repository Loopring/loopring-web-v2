import styled from '@emotion/styled';
import { Box, Card, Grid, Modal as MuiModal, Typography } from '@mui/material';
import React from 'react';
import {  WithTranslation, withTranslation } from 'react-i18next';
import { ModalCloseButton, SwitchPanelStyled } from '@loopring-web/component-lib';


const StyledPaper = styled(Box)`
  //width: 100%;
  //height: 100%;
  background: var(--color-box);
  border-radius: ${({theme}) => theme.unit}px;
`

const CardStyle = styled(Card)`
    background:var(--color-global-bg);
    width: 100%;
    cursor: pointer;
    height: 0;
    padding: 0;
    padding-bottom: calc(100% + 80px);
    position: relative;
  //margin: 50px;
` as typeof Card
const BoxNFT =  styled(Box)`
  background:var(--color-global-bg); 
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

export const MyNFTPanel = withTranslation(['common', 'layout'])(({t,...rest}: & WithTranslation) => {
    const [isShow,setIsShow] = React.useState(false);
    const [popItem,setPopItem] =  React.useState<any|undefined>(undefined);
    // const {resetKeypair,} = useResetAccount()
    // const {setShowFeeSetting} = useOpenModals()
    // const {exportAccount} = useExportAccountInfo()
    const onClose = React.useCallback(() =>  setIsShow(false) ,[])
    const onDetail = React.useCallback((item:any) => {
        setPopItem(item)
        setIsShow(true)
    },[setIsShow])

    const modalContent = React.useMemo(()=>{
        return popItem && <>
          <BoxNFT width={570} height={570} margin={1} marginTop={-4}></BoxNFT>
          <Box flex={1}>
            <Typography color={'text.secondary'}> {t('labelNFTName')}</Typography>
            <Typography color={'text.primary'} variant={'h3'}>ID {popItem?.id}</Typography>
            <Box display={'flex'} flexDirection={'column'}>
              <Typography component={'h6'} color={'text.primary'} variant={'h4'}>{t('labelDetail')}</Typography>
              <Typography display={'inline-flex'}  variant={'body1'}>
                <Typography  color={'var(--color-text-third)'} width={160}> {t('labelContractAddress')}</Typography>
                <Typography></Typography>
              </Typography>
              <Typography display={'inline-flex'}  variant={'body1'}>
                <Typography  color={'var(--color-text-third)'} width={160}>{t('labelTokenID')} </Typography>
                <Typography></Typography>
              </Typography>
              <Typography display={'inline-flex'}  variant={'body1'}>
                <Typography  color={'var(--color-text-third)'} width={160}>{t('labelTokenStandard')} </Typography>
                <Typography></Typography>
              </Typography>
              <Typography display={'inline-flex'}  variant={'body1'}>
                <Typography  color={'var(--color-text-third)'} width={160}>{t('labelTokenBlockChain')} </Typography>
                <Typography></Typography>
              </Typography>
              <Typography display={'inline-flex'}  variant={'body1'}>
                <Typography  color={'var(--color-text-third)'} width={160}>{t('labelTokenMinted')} </Typography>
                <Typography></Typography>
              </Typography>
              <Typography display={'inline-flex'}  variant={'body1'}>
                <Typography  color={'var(--color-text-third)'} width={160}>{t('labelDate')} </Typography>
                <Typography></Typography>
              </Typography>

            </Box>

          </Box>
        </>
    },[popItem])
    return <StyledPaper  flex={1} className={'MuiPaper-elevation2'} marginTop={0} marginBottom={2} >
        <MuiModal
            open={isShow}
            onClose={onClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <SwitchPanelStyled width={'80%'} position={'relative'}
                               style={{alignItems:'stretch'}}>
                {/*<Box display={'flex'} width={"100%"} flexDirection={'column'}>*/}
                {/*    <ModalCloseButton onClose={onClose} {...rest} />*/}
                {/*    /!*{onBack ? <ModalBackButton onBack={onBack}  {...rest}/> : <></>}*!/*/}
                {/*</Box>*/}
                {/*<Box className={'trade-panel'}>*/}
                {/*    {content}*/}
                {/*</Box>*/}
                <Box display={'flex'} width={"100%"} flexDirection={'column'}>
                    <ModalCloseButton onClose={onClose} t={t} {...rest} />
                    {/*{onBack ? <ModalBackButton onBack={onBack}  {...rest}/> : <></>}*/}
                </Box>
                <Box display={'flex'} flexDirection={'row'} flex={1} justifyContent={'stretch'}>
                    {modalContent}
                </Box>

            </SwitchPanelStyled>
        </MuiModal>
        <Typography  paddingX={3} paddingY={3} component={'h3'} variant={'h5'}>{t('labelMyNTF', {num:0})}</Typography>

        <Grid container spacing={2} paddingX={3}>
            {[
                {source:'',name:'xxxxx',id:'xxxxx'},
                {source:'',name:'xxxxx',id:'eeffx'},
                {source:'',name:'xxxxx',id:'aabbx'},
                {source:'',name:'xxxxx',id:'ccddx'}
            ].map((item,index)=><Grid item xs={12} md={6} lg={4} flex={'1 1 120%'}>
                <CardStyle sx={{ maxWidth: 345 }} key={item.id+index} onClick={()=> {
                    onDetail(item)
                }}>
                    <Box position={'absolute'}
                         width={'100%'} height={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'}>
                       <Box flex={1} style={{background:"var(--field-opacity)"}} display={'flex'}
                            alignItems={'center'}
                            justifyContent={'center'}>
                           <img src={'http://static.loopring.io/assets/images/vips/SUPERVIP.png'} width={'100%'}/></Box>
                       <Box  padding={2} height={80}>
                           <Typography
                               color={'text.secondary'}
                               component={'h6'}>{item.name}</Typography>
                           <Typography  color={'--color-text-primary'} component={'p'}>
                               ID: #{item.id}
                           </Typography>
                       </Box>
                    </Box>
                </CardStyle>
            </Grid>)}
        </Grid>

        {/*<Typography variant={'h5'} component={'h3'} paddingLeft={2}>{t('labelTitleMyNFT')}</Typography>*/}
        {/*<Modal>*/}
    </StyledPaper>
})
