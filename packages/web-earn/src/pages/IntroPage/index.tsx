import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ToRightTopArrow, hexToRGB } from '@loopring-web/common-resources';
import { useSettings } from '@loopring-web/component-lib';
import { SoursURL } from '@loopring-web/loopring-sdk';
import { Box, BoxProps, Button, ContainerProps, useMediaQuery } from '@mui/material';
// import { styled } from '@mui/material';
import { Container, Typography, Card, CardMedia, CardContent, Grid } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';

interface IntroProps {
  
}

const AnimationCard = styled(Box)<{ highlighted: boolean; isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: var(--color-box-third);
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
  const { title, des1, des2, viewMoreLink, imgURL, sx, ref } = props
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
        paddingX: 5,
        paddingY: 8,
        width:'1200px',
        maxWidth:'90%',
        borderRadius: '12px',
        ...sx,
      }}
      ref={ref}
      {...props}
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
            {t('labelLearnMore2')}{' '}
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
  return (
    <Box position={'relative'} sx={{bgcolor: theme.mode === 'light' ? '#F5F7FC' : '#000000',}}>
      <Box 
        component={'img'}
        src={`${SoursURL}earn/intro_bg_1.png`}
        position={'absolute'}
        left={'45%'}
        sx={{
          transform: 'translateX(-50%)'
        }}
        
        />
      <Box
        width={'100%'}
        zIndex={2}
        sx={{
          marginTop: 25,
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        <Typography width={'1200px'} maxWidth={'90%'} fontWeight={700} fontSize={'64px'} textAlign={'center'} marginBottom={6}>{t("labelLoopringDeFi")}</Typography>
        <Typography width={'1200px'} maxWidth={'90%'} marginBottom={ 15} fontSize={'30px'} textAlign={'center'}> {t("labelIntroDes")}</Typography>
        <Section
          title={t("labelInvestDualTitle")}
          des1={t("labelInvestDualDes1")}
          des2={t("labelInvestDualDes2")}
          viewMoreLink='/invest/dual'
          imgURL={SoursURL + (theme.mode === 'dark' ? 'earn/intro_screenshot_1.png' : 'earn/intro_screenshot_1_light.png')}
          marginBottom={6}
          // ref={dual}
        />
        <Section
          title={t("labelBtradeSwapTitle")}
          des1={t("labelBtradeDes1")}
          des2={t("labelBtradeDes2")}
          viewMoreLink='/trade/btrade'
          imgURL={SoursURL + (theme.mode === 'dark' ? 'earn/intro_screenshot_2.png' : 'earn/intro_screenshot_2_light.png')}
          marginBottom={6}
        />
        <Section
          title={t("labelVault")}
          des1={t("labelPortalDes1")}
          des2={t("labelPortalDes2")}
          viewMoreLink='/portal'
          imgURL={SoursURL + (theme.mode === 'dark' ? 'earn/intro_screenshot_3.png' : 'earn/intro_screenshot_3_light.png')}
        />
      </Box>
      <Box
        paddingTop={20}

      >
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
      <Box
        display={'flex'}
        justifyContent={'center'}

      >
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
    </Box>
  )
};

export default Intro;