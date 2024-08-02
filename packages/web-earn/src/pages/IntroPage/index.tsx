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
  des:string
  viewMoreLink:string
  imgURL?:string
  isReverse?: boolean
} & BoxProps



const Section: React.FC<SectionProps> = (props) => {
  const {
    title,
    des,
    viewMoreLink,
    imgURL,
    isReverse,
    sx
  } = props
  const theme = useTheme()
  const isCompact = useMediaQuery('(max-width:720px)');
  const history = useHistory()
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.mode === 'light' ? theme.colorBase.white : theme.colorBase.black,
        color: 'var(--color-text-primary)',
        flexDirection: isCompact ? 'column' : isReverse ? 'row-reverse' : 'row',
        ...sx
      }}
      {...props}
    >
      <Box width={isCompact ? '80%' : '30%'} marginRight={isReverse ? '' : '10%'}>
        <Grid item xs={12} md={6}>
          <Typography
            gutterBottom
            sx={{
              fontSize: '45px',
              marginBottom: 3,
              fontWeight: 800,
              zIndex: 1,
              position: 'relative'
            }}
            color={'var(--color-text-primary)'}
          >
            {title}
          </Typography>
          <Typography
            paragraph
            sx={{
              fontSize: '24px',
              marginBottom: 5,
              fontWeight: 300,
              zIndex: 1,
              position: 'relative'
            }}
            color={'var(--color-text-primary)'}
          >
            {des}
          </Typography>
          <Button
            variant='contained'
            sx={{
              padding: '4px 20px',
              fontSize: '16px',
              color: 'var(--color-text-primary)',
              fontWeight: 400,
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: 'transparent',
              },
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              zIndex: 1
            }}
            onClick={() => history.push(viewMoreLink)}
          >
            Learn More  <ToRightTopArrow
            sx={{ marginLeft: 1, fontSize: '24px', color: 'var(--color-text-primary)' }}
          />{' '}
          </Button>
        </Grid>
      </Box>
      <CardMedia
        component='img'
        image={imgURL}
        alt='Dual Investment Info'
        sx={{
          width: isCompact ? '80%' : '35%',
          height: 'auto',
          marginRight: isCompact ? '' : isReverse ? '10%' : '',
          marginTop: isCompact ? 10 : 0,
          zIndex: 1
        }}
      />
    </Box>
  )
};

const Intro: React.FC<IntroProps> = ({  }) => {
  const { isMobile } = useSettings()
  
  const [state, setState] = useState({
    highlightedAnimationCard: 0
  })
  const theme = useTheme()
  const {t} = useTranslation('webEarn')
  const isCompact = useMediaQuery('(max-width:720px)');
  const history = useHistory()
  return (
    <Box>
      <Box
        width={'100%'}
        sx={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage: `url('${SoursURL}earn/intro_bg_1${
            theme.mode === 'light' ? '_light' : ''
          }.jpg')`,
          paddingTop: '44.32%',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            cursor: 'pointer',
            background: hexToRGB(
              theme.mode === 'light' ? theme.colorBase.white : theme.colorBase.black,
              0.12,
            ),
            boxShadow: `0px 40px 40px ${hexToRGB(
              theme.mode === 'light' ? theme.colorBase.black : theme.colorBase.white,
              0.12,
            )}, inset 0px 4px 6px ${hexToRGB(
              theme.mode === 'light' ? theme.colorBase.white : theme.colorBase.black,
              0.12,
            )}`,
            backdropFilter: 'blur(12px)',
            borderRadius: '8px',
            padding: '12px 20px',
            position: 'absolute',
            left: '25%',
            bottom: '17%',
            color: 'var(--color-text-primary)',
            fontSize: '24px',
          }}
          component={'div'}
          onClick={() => history.push('/l2assets') }
        >
          View More{' '}
          <ToRightTopArrow
            sx={{ marginLeft: 1, fontSize: '24px', color: 'var(--color-text-primary)' }}
          />{' '}
        </Box>
      </Box>
      <Box
        position={'relative'}
        bgcolor={theme.mode === 'light' ? theme.colorBase.white : theme.colorBase.black}
        paddingTop={isCompact ? 15 : 27.5}
      >
        <Box
          width={'25%'}
          sx={{ position: 'absolute', left: 0, top: '20%' }}
          component={'img'}
          src={`${SoursURL}earn/intro_sphere${theme.mode === 'light' ? '_light' : ''}.png`}
        />
        <Box
          width={'25%'}
          sx={{ position: 'absolute', right: 0, bottom: '5%' }}
          component={'img'}
          src={`${SoursURL}earn/intro_ring${theme.mode === 'light' ? '_light' : ''}.png`}
        />
        <Section
          title='Dual Investment'
          des='Buy the dip or sell the covered gain while earning a high yield'
          viewMoreLink='/invest/dual'
          imgURL={SoursURL + 'earn/intro_screenshot_1.png'}
        />
        <Section
          marginTop={isCompact ? 15 : 37.5}
          isReverse
          title='Portal'
          des='Loopring Portal can be treated as an isolated margin account allowing users to borrow/lend tokens with collateral. '
          viewMoreLink='/portal'
          imgURL={SoursURL + 'earn/intro_screenshot_2.png'}
        />
        <Section
          marginTop={isCompact ? 15 : 37.5}
          title='Block Trade'
          des="Boost your earnings with CIAN protocol's leveraged ETH staking strategy."
          viewMoreLink='/trade/btrade'
          imgURL={SoursURL + 'earn/intro_screenshot_3.png'}
        />
        
      </Box>
      <Box
        paddingTop={20}
        bgcolor={theme.mode === 'light' ? theme.colorBase.white : theme.colorBase.black}
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
        bgcolor={theme.mode === 'light' ? theme.colorBase.white : theme.colorBase.black}
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