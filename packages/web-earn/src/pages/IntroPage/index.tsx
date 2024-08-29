import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { CloseIcon, ToRightTopArrow, hexToRGB } from '@loopring-web/common-resources';
import { useSettings } from '@loopring-web/component-lib';
import { SoursURL } from '@loopring-web/loopring-sdk';
import { Box, BoxProps, Button, ContainerProps, useMediaQuery } from '@mui/material';
// import { styled } from '@mui/material';
import { Container, Typography, IconButton, Card, CardMedia, CardContent, Grid } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import { useConfirmation } from '@loopring-web/core/src/stores/localStore/confirmation';
// import { confirmation } from '@loopring-web/core';

const LoopringDeFiLaunchPopup = ({ onClose }) => {
  const theme =useTheme()
  return (
    <Box
      sx={{
        position: 'absolute',
        maxWidth: '95%',
        width: '428px',
        backgroundColor: theme.mode === 'dark' ? 'var(--color-global-bg-opacity)' : '#F9F9FE',
        padding: 4,
        boxShadow: 3,
        borderRadius: '24px',
        textAlign: 'center',
        zIndex: 10,
        left: 90,
        top: 200,
      }}
    >
      <CloseIcon
        className='tag'
        sx={{
          position: 'absolute',
          right: 16,
          top: 20,
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
        }}
        style={{ width: 20, height: 20 }}
        onClick={onClose}
        component={'svg'}
      />
      <Typography variant='h3' sx={{ marginBottom: 2 }} mt={3}>
        Loopring DeFi Launches on Taiko!
      </Typography>
      <Box display='flex' justifyContent='center' mb={3} width={'100%'}>
        <Box
          src={`${SoursURL}earn/taiko_up.png`}
          alt='Loopring DeFi Launch'
          style={{ width: '95%' }}
          component={'img'}
        />
      </Box>
      <Typography variant='body1'>
        Loopring DeFi is expanding to various EVM-compatible networks using its trustless, time-tested ZK-Rollup protocol. The first deployment will be on Taiko. Join us for an exciting journey ahead!

      </Typography>
    </Box>
  )
};

const AnimationCard = styled(Box)<{ highlighted: boolean; isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.mode === 'dark' ? hexToRGB('#393E47', 0.3) : '#FFFFFF'};
  border-radius: 12px;
  padding-top: ${({ theme }) => theme.unit * 8}px;
  padding-left: ${({ theme }) => theme.unit * 5}px;
  padding-right: ${({ theme }) => theme.unit * 4}px;
  padding-bottom: ${({ theme }) => theme.unit * 2.5}px;
  height: 390px;
  height: ${({ isMobile }) => (isMobile ? '290px' : '390px')};
  width: ${({ highlighted, isMobile }) => (isMobile ? '100%' : highlighted ? '55.08%' : '20.4%')};
  transition: all 0.5s ease;
  border: ${({ highlighted, isMobile }) =>
    !isMobile && highlighted
      ? '1px solid var(--color-primary)'
      : '0.5px solid var(--color-border)'};
  overflow: hidden;
  .title {
    margin-bottom: ${({ theme }) => theme.unit * 3}px;
  }
  .sub-title {
    color: var(--color-text-secondary);
    display: ${({ highlighted, isMobile }) => (isMobile || highlighted ? '' : 'none')};
    max-height: 30px;
  }
  img {
    height: 134px;
    width: 134px;
    align-self: end;
    margin-right: ${({ highlighted, isMobile }) => (isMobile || highlighted ? '0px' : '-60px')};
    opacity: ${({ highlighted, isMobile }) => (isMobile || highlighted ? '1' : '0.5')};
    transition: all 0.5s ease;
  }
  margin-bottom: ${({ isMobile, theme }) => (isMobile ? `${theme.unit * 2.5}px` : 'auto')};
`

type SectionProps = {
  title:string
  des1:string
  des2:string
  viewMoreLink:string
  imgURL?:string
} & BoxProps



const Section: React.FC<SectionProps> = (props) => {
  const { title, des1, des2, viewMoreLink, imgURL, sx, ref,...rest } = props
  const theme = useTheme()
  const isCompact = useMediaQuery('(max-width:720px)')
  const history = useHistory()
  const { t } = useTranslation('common')
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: theme.mode === 'dark' ? '#061021' : '#FFFFFF',
        color: 'var(--color-text-primary)',
        flexDirection: 'column',
        paddingX: 7.25,
        paddingY: 8,
        width:'1152px',
        maxWidth:'90%',
        borderRadius: '12px',
        ...sx,
      }}
      ref={ref}
      {...rest}
    >
      <Typography
        gutterBottom
        sx={{
          fontSize: '30px',
          marginBottom: 9,
          fontWeight: 500,
        }}
        color={'var(--color-text-primary)'}
        textAlign={'center'}
      >
        {title}
      </Typography>
      <Box width={'100%'} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
        <Box width={isCompact ? '100%' : '45%'}>
          <Typography
            paragraph
            sx={{
              fontSize: '24px',
              marginBottom: 3,
              fontWeight: 500,
            }}
            color={'var(--color-text-primary)'}
          >
            {des1}
          </Typography>
          <Typography
            paragraph
            sx={{
              fontSize: '20px',
              marginBottom: 5,
              fontWeight: 300,
            }}
            color={'var(--color-text-primary)'}
          >
            {des2}
          </Typography>
          <Button
            variant='contained'
            sx={{
              fontSize: '16px',
              fontWeight: 400,
            }}
            onClick={() => history.push(viewMoreLink)}
          >
            {t('labelLaunch')}{' '}
            <ToRightTopArrow
              sx={{ marginLeft: 1, fontSize: '24px', fill: 'var(--color-text-button)' }}
            />{' '}
          </Button>
        </Box>
        <Box width={'45%'} display={isCompact ? 'none' : 'block'}>
          <CardMedia
            component='img'
            image={imgURL}
            alt='Dual Investment Info'
            sx={{
              
              height: 'auto',
              zIndex: 1,
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

interface IntroProps {
  
}

const Intro: React.FC<IntroProps> = ({  }) => {
  const { isMobile } = useSettings()
  
  const [state, setState] = useState({
    highlightedAnimationCard: 0
  })
  const theme = useTheme()
  const {t} = useTranslation('webEarn')
  const isCompact = useMediaQuery('(max-width:720px)');
  const history = useHistory()
  const dual = React.useRef(null)
  const {setShowTaikoLaunchBanner, confirmation} = useConfirmation()
  return (
    <Box
      marginTop={'calc(var(--header-height) * -1)'}
      position={'relative'}
      sx={{ bgcolor: theme.mode === 'light' ? '#F5F7FC' : '#25282E' }}
    >
      {confirmation.showTaikoLaunchBanner && <LoopringDeFiLaunchPopup onClose={() => {
        setShowTaikoLaunchBanner(false)
      }}/>} 
      <Box
        component={'img'}
        src={`${SoursURL}earn/intro_bg_2.png`}
        position={'absolute'}
        left={'50%'}
        top={-26}
        sx={{
          transform: 'translateX(-50%)',
        }}
        zIndex={2}
      />
      <Box
        component={'img'}
        src={`${SoursURL}earn/intro_bg_1.png`}
        position={'absolute'}
        left={0}
        right={0}
        top={0}
        width={'100%'}
        zIndex={1}
      />
      
      <Box
        width={'100%'}
        zIndex={3}
        sx={{
          marginTop: 17,
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <Typography
          width={'1152px'}
          maxWidth={'90%'}
          fontWeight={700}
          fontSize={'64px'}
          textAlign={'center'}
          marginBottom={3}
        >
          {t('labelLoopringDeFi')}
        </Typography>
        <Typography
          width={'1152px'}
          maxWidth={'90%'}
          marginBottom={4}
          fontSize={'40px'}
          textAlign={'center'}
        >
          {' '}
          {t('labelIntroDes1')}
          <br />
          {t('labelIntroDes2')}
        </Typography>
        <Typography
          width={'1152px'}
          maxWidth={'90%'}
          marginBottom={15}
          fontSize={'20px'}
          textAlign={'center'}
        >
          {t("labelIntroDes3")}
        </Typography>
        <Section
          title={t('labelInvestDualTitle')}
          des1={t('labelInvestDualDes1')}
          des2={t('labelInvestDualDes2')}
          viewMoreLink='/invest/dual'
          imgURL={
            SoursURL +
            (theme.mode === 'dark'
              ? 'earn/intro_screenshot_1.png'
              : 'earn/intro_screenshot_1_light.png')
          }
          marginBottom={6}
          sx={{
            bgcolor: theme.mode === 'dark' ? hexToRGB('#393E47', 0.8) : '#FFFFFF',
          }}
          // ref={dual}
        />
        <Section
          title={t('labelVault')}
          des1={t('labelPortalDes1')}
          des2={t('labelPortalDes2')}
          viewMoreLink='/portal'
          imgURL={
            SoursURL +
            (theme.mode === 'dark'
              ? 'earn/intro_screenshot_2.png'
              : 'earn/intro_screenshot_2_light.png')
          }
          marginBottom={6}
          sx={{
            bgcolor: theme.mode === 'dark' ? '#2A3A41' : '#E2F7F7',
          }}
        />
        <Section
          title={t('labelBtradeSwapTitle')}
          des1={t('labelBtradeDes1')}
          des2={t('labelBtradeDes2')}
          viewMoreLink='/trade/btrade'
          imgURL={
            SoursURL +
            (theme.mode === 'dark'
              ? 'earn/intro_screenshot_3.png'
              : 'earn/intro_screenshot_3_light.png')
          }
          sx={{
            bgcolor: theme.mode === 'dark' ? '#2D3449' : '#E5F3FF',
          }}
        />
      </Box>
      <Box paddingTop={20}>
        <Typography textAlign={'center'} fontSize={'45px'} fontWeight={800}>
          {t('labelLoopringProtocol')}
        </Typography>
        <Typography
          textAlign={'center'}
          color={'var(--color-text-secondary)'}
          marginTop={3}
          fontSize={'24px'}
          fontWeight={300}
        >
          {t('labelLoopringProtocolDes')}
        </Typography>
      </Box>
      <Box display={'flex'} justifyContent={'center'}>
        <Box
          display={'flex'}
          flexDirection={isMobile ? 'column' : 'row'}
          paddingY={10}
          width={'70%'}
        >
          <AnimationCard
            justifyContent={'space-between'}
            highlighted={state.highlightedAnimationCard === 0}
            onMouseOver={() => setState({ ...state, highlightedAnimationCard: 0 })}
            marginRight={'2.06%'}
            isMobile={isMobile}
          >
            <Box>
              <Typography variant={'h3'} className={'title'}>
                {t('labelUltimateSecurity')}
              </Typography>
              <Typography className={'sub-title'}>{t('labelUltimateSecurityDes')}</Typography>
            </Box>

            <img
              src={
                SoursURL +
                (theme.mode === 'dark'
                  ? 'images/web-earn/animation_card_d1.svg'
                  : 'images/web-earn/animation_card_l1.svg')
              }
            />
          </AnimationCard>
          <AnimationCard
            justifyContent={'space-between'}
            highlighted={state.highlightedAnimationCard === 1}
            onMouseOver={() => setState({ ...state, highlightedAnimationCard: 1 })}
            marginRight={'2.06%'}
            isMobile={isMobile}
          >
            <Box>
              <Typography variant={'h3'} className={'title'}>
                {t('labelLowTransactionFees')}
              </Typography>
              <Typography className={'sub-title'}>{t('labelLowTransactionFeesDes')}</Typography>
            </Box>
            <img
              src={
                SoursURL +
                (theme.mode === 'dark'
                  ? 'images/web-earn/animation_card_d2.svg'
                  : 'images/web-earn/animation_card_l2.svg')
              }
            />
          </AnimationCard>
          <AnimationCard
            justifyContent={'space-between'}
            highlighted={state.highlightedAnimationCard === 2}
            onMouseOver={() => setState({ ...state, highlightedAnimationCard: 2 })}
            isMobile={isMobile}
          >
            <Box>
              <Typography variant={'h3'} className={'title'}>
                {t('labelHighThroughput')}
              </Typography>
              <Typography variant={'h5'} className={'sub-title'}>
                {t('labelHighThroughputDes')}
              </Typography>
            </Box>
            <img
              src={
                SoursURL +
                (theme.mode === 'dark'
                  ? 'images/web-earn/animation_card_d3.svg'
                  : 'images/web-earn/animation_card_l3.svg')
              }
            />
          </AnimationCard>
        </Box>
      </Box>
      <Box display={'flex'} justifyContent={'center'}>
        <Box
          sx={{
            display: 'flex',
            // justifyContent: 'center',
            color: 'var(--color-text-primary)',
            flexDirection: 'column',
            paddingX: 5,
            paddingY: 8,
            borderRadius: '12px',
            bgcolor: theme.mode === 'dark' ? hexToRGB('#393E47', 0.3) : '#FFFFFF',
            width: '1152px',
            maxWidth: '90%',
          }}
          marginTop={8}
          marginBottom={15}
        >
          
            <Typography
              paragraph
              sx={{
                fontSize: '24px',
                marginBottom: 6,
                fontWeight: 500,
              }}
              color={'var(--color-text-primary)'}
            >
              {t("labelReadyForDevelopers")}
            </Typography>
            <Typography
              paragraph
              sx={{
                fontSize: '20px',
                marginBottom: 6,
                fontWeight: 300,
              }}
              color={'var(--color-text-primary)'}
            >
              {t("labelReadyForDevelopersDes")}
              
            </Typography>
            <Button
              variant='contained'
              sx={{
                fontSize: '16px',
                fontWeight: 400,
                width: '120px',
              }}
              onClick={() => 
                window.open('https://docs.loopring.io/', '_blank')}
            >
              {t('labelLaunch')}{' '}
              <ToRightTopArrow
                sx={{ marginLeft: 1, fontSize: '24px', fill: 'var(--color-text-button)' }}
              />{' '}
            </Button>
        </Box>
      </Box>
    </Box>
  )
};

export default Intro;