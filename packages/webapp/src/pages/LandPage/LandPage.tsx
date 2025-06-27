import {
  Avatar,
  Box,
  Button,
  Container,
  Tabs,
  Tab,
  Typography,
  Grid,
  BoxProps,
} from '@mui/material'
import React from 'react'
import styled from '@emotion/styled'
import {
  ammAdvice,
  BlockTradeLandIcon,
  defiAdvice,
  SpotIcon,
  SwapLandIcon,
  dualAdvice,
  FiatLandIcon,
  fnType,
  GoIcon,
  leverageETHAdvice,
  RouterPath,
  stakeAdvice,
  TokenType,
  NFTSubRouter,
  ToRightTopArrow,
} from '@loopring-web/common-resources'
import { Trans, withTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { useNotify, WalletConnectL2Btn } from '@loopring-web/core'
import { CoinIcons, MaxWidthContainer, useSettings } from '@loopring-web/component-lib'
import { ContainerStyle, CardBox } from './style'
import { useTheme } from '@emotion/react'
import { SoursURL } from '@loopring-web/loopring-sdk'

const BgStyle = styled(Box)`
  position: absolute;
  z-index: 1;
  top: 0;
  right: 0;
  left: 0;
  min-height: 100vh;
  height: 1200px;
  overflow: hidden;
  pointer-events: none;
  background: url('./bgpro-${({ theme }) => theme.mode}.webp') no-repeat;
  background-position-y: 0;
  background-position-x: right;
  background-size: 1804px 1073px;
  @media only screen and (max-width: 768px) {
    min-width: 360px;
  }
  &:before {
    margin-top: 64px;
    content: '';
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 528px;
    background-size: 528px 528px;
  }
`

type TitleGroupProps = {
  title: string
  description: string
  link?: string
  onClickLink?: () => void
  buttonText: string
  descriptionTextColor?: string
  desFontSize?: string
} & BoxProps

const RoundIndicator = ({
  iconURL,
  text,
  ...rest
}: { iconURL: string; text: string } & BoxProps) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        borderRadius: '20px',
        height: '40px',
        border: theme.mode === 'dark' ? '1px solid #FFFFFF57' : '1px solid #E1E6F0',
        marginBottom: 2,
        paddingX: 2,
        paddingY: 1,
        backgroundColor: theme.mode === 'dark' ? '#FFFFFF14' : '#F5F7FC',
      }}
      {...rest}
    >
      <Box
        component={'img'}
        src={iconURL}
        alt='Network Icon'
        sx={{ marginRight: 1, width: '24px', height: '24px' }}
      />
      <Typography color='var(--color-text-primary)'>{text}</Typography>
    </Box>
  )
}

const TitleGroup: React.FC<TitleGroupProps> = ({
  title,
  description,
  link,
  onClickLink,
  buttonText,
  descriptionTextColor,
  desFontSize,
  ...rest
}) => {
  const theme = useTheme()
  const { isMobile } = useSettings()
  return (
    <Box
      textAlign='center'
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      width={isMobile ? '80%' : undefined}
      mt={isMobile ? 2 : 0}
      {...rest}
    >
      <Typography
        variant='h1'
        component='h1'
        gutterBottom
        fontWeight={700}
        mb={4}
        color={'var(--color-text-primary)'}
        fontSize={isMobile ? '40px' : '80px'}
        lineHeight={isMobile ? '48px' : '80px'}
      >
        {title}
      </Typography>
      <Typography
        variant='h3'
        fontWeight={isMobile ? 300 : 400}
        component='p'
        color={
          descriptionTextColor ?? (theme.mode === 'light' ? '#292C33' : 'var(--color-text-third)')
        }
        fontSize={isMobile ? '20px' : desFontSize ?? '28px'}
        mb={8}
        lineHeight={isMobile ? '24px' : '40px'}
      >
        {isMobile
          ? description.replace('\n', ' ')
          : description.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
      </Typography>
      <Button
        sx={{ borderRadius: '8px' }}
        variant='contained'
        size={isMobile ? 'small' : 'large'}
        endIcon={<ToRightTopArrow />}
        href={link ? link : undefined}
        color={'primary'}
        onClick={onClickLink ? onClickLink : undefined}
      >
        {buttonText}
      </Button>
    </Box>
  )
}

const RoundBoxStyled = styled(Box)<{ bgcolor?: string }>(({ theme, bgcolor }) => ({
  backgroundColor: bgcolor ?? (theme.mode === 'dark' ? '#31353d' : '#F8F8F8'),
  borderRadius: '25px',
}))

const TitleDes = ({
  title,
  description,
  desColor,
  ...rest
}: { title: string; description: string; desColor?: string } & BoxProps) => {
  return (
    <Box {...rest}>
      <Typography mb={2} fontSize={'24px'} color={'var(--color-text-primary)'}>
        {title}
      </Typography>
      <Typography fontSize={'16px'} color={desColor ?? 'var(--color-text-third)'}>
        {description}
      </Typography>
    </Box>
  )
}
const ButtonStyled = styled(Button)`
  .MuiBox-root {
    justify-content: flex-start;
  }
  .MuiButton-startIcon {
    height: 48px;
    width: 48px;
    svg {
      fill: var(--color-primary);
      height: 48px;
      width: 48px;
    }
  }
  span:last-child {
    text-transform: initial;
  }
`

export const LandPage = withTranslation(['landPage', 'common'])(({ t }: any) => {
  const history = useHistory()
  const { isMobile, coinJson } = useSettings()
  const theme = useTheme()
  const { notifyMap } = useNotify()

  const investAdviceList = [
    {
      ...dualAdvice,
      ...notifyMap?.invest?.investAdvice[2],
    },
    {
      ...defiAdvice,
      ...notifyMap?.invest?.investAdvice[1],
    },
    {
      ...leverageETHAdvice,
      ...notifyMap?.invest?.investAdvice[4],
    },
    {
      ...ammAdvice,
      ...notifyMap?.invest?.investAdvice[0],
    },
    {
      ...stakeAdvice,
      ...notifyMap?.invest?.investAdvice[3],
    },
  ]
  return (
    <>
      <ContainerStyle sx={{ zIndex: 10 }}>
        <Container
          maxWidth='lg'
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            flexDirection={'column'}
            height={428}
          >
            <Typography
              component={'p'}
              variant={'h1'}
              textAlign={'center'}
              whiteSpace={'pre-line'}
              marginBottom={4}
            >
              {t('labelMainDes')}
            </Typography>
            <WalletConnectL2Btn
              sx={{ width: '100%' }}
              className={'walletConnectL2Btn'}
              btnLabelProps={{
                [fnType.ACTIVATED]: [
                  function () {
                    return t(`labelGoDapps`)
                  },
                ],
              }}
              btnClickMapProps={{
                [fnType.ACTIVATED]: [
                  function () {
                    history.push(`${RouterPath.lite}`)
                  },
                ],
              }}
            />
          </Box>
          <Box
            display={'flex'}
            flexDirection={isMobile ? 'column' : 'row'}
            justifyContent={'space-between'}
            mb={5}
          >
            <RoundBoxStyled
              bgcolor={theme.mode === 'light' ? 'white' : undefined}
              px={3}
              py={4}
              borderRadius={'12px'}
              width={isMobile ? '100%' : '32%'}
              mb={isMobile ? 3 : 0}
            >
              <Box
                width={'36px'}
                component={'img'}
                src={SoursURL + 'images/landPage/homepage_icon1.svg'}
              />
              <Typography mt={2} color={'var(--color-text-primary)'} variant='h5' fontSize={'20px'}>
                {t('labelProvenAppSpecificZKRollup')}
              </Typography>
              <Typography mt={1} color={'var(--color-text-secondary)'} fontSize={'14px'}>
                {t('labelProvenAppSpecificZKRollupDes')}
              </Typography>
            </RoundBoxStyled>
            <RoundBoxStyled
              bgcolor={theme.mode === 'light' ? 'white' : undefined}
              px={3}
              py={4}
              borderRadius={'12px'}
              width={isMobile ? '100%' : '32%'}
              mb={isMobile ? 3 : 0}
            >
              <Box
                width={'36px'}
                component={'img'}
                src={SoursURL + 'images/landPage/homepage_icon2.svg'}
              />
              <Typography mt={2} color={'var(--color-text-primary)'} variant='h5' fontSize={'20px'}>
                {t('labelAuditedAndSecure')}
              </Typography>
              <Typography mt={1} color={'var(--color-text-secondary)'} fontSize={'14px'}>
                {t('labelAuditedAndSecureDes')}
              </Typography>
            </RoundBoxStyled>
            <RoundBoxStyled
              bgcolor={theme.mode === 'light' ? 'white' : undefined}
              px={3}
              py={4}
              borderRadius={'12px'}
              width={isMobile ? '100%' : '32%'}
              mb={isMobile ? 3 : 0}
            >
              <Box
                width={'36px'}
                component={'img'}
                src={SoursURL + 'images/landPage/homepage_icon3.svg'}
              />
              <Typography mt={2} color={'var(--color-text-primary)'} variant='h5' fontSize={'20px'}>
                {t('labelBringingCEXToDeFi')}
              </Typography>
              <Typography mt={1} color={'var(--color-text-secondary)'} fontSize={'14px'}>
                {t('labelBringingCEXToDeFiDes')}
              </Typography>
            </RoundBoxStyled>
          </Box>

          <MaxWidthContainer
            containerProps={{ bgcolor: theme.mode === 'light' ? '#EDF2FA' : undefined }}
            mb={20}
          >
            <Box
              height={isMobile ? 'auto' : '600px'}
              display={'flex'}
              flexDirection={isMobile ? 'column' : 'row'}
              justifyContent={'space-between'}
            >
              <RoundBoxStyled
                bgcolor={theme.mode === 'light' ? 'white' : undefined}
                px={4}
                py={8}
                pb={0}
                width={isMobile ? '100%' : '49%'}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <TitleDes
                  title={t('labelTrade')}
                  desColor={theme.mode === 'light' ? 'var(--color-text-secondary)' : undefined}
                  description={t('labelTradeDes')}
                />
                <Box
                  width={'85%'}
                  component={'img'}
                  src={
                    SoursURL +
                    (theme.mode === 'dark'
                      ? 'images/landPage/homepage_p4_dark.png'
                      : 'images/landPage/homepage_p4_light.png')
                  }
                />
              </RoundBoxStyled>
              <Box
                width={isMobile ? '100%' : '49%'}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
              >
                {/* <RoundBoxStyled
                  bgcolor={theme.mode === 'light' ? 'white' : undefined}
                  px={4}
                  // py={8}
                  height={isMobile ? '150px' : '49%'}
                  mt={isMobile ? 3 : 0}
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                >
                  <TitleDes
                    desColor={theme.mode === 'light' ? 'var(--color-text-secondary)' : undefined}
                    title={t('labelEarn')}
                    description={t('labelEarnDes')}
                    mr={4}
                  />
                  <Box
                    component={'img'}
                    height={'70%'}
                    src={
                      SoursURL +
                      (theme.mode === 'dark'
                        ? 'images/landPage/homepage_p5_dark.png'
                        : 'images/landPage/homepage_p5_light.png')
                    }
                  />
                </RoundBoxStyled> */}
                <RoundBoxStyled
                bgcolor={theme.mode === 'light' ? 'white' : undefined}
                px={4}
                height={isMobile ? '150px' : '49%'}
                mt={isMobile ? 3 : 0}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <TitleDes desColor={theme.mode === 'light' ? 'var(--color-text-secondary)' : undefined} title={t('labelNFT')} description={t('labelNFTDes')} mr={4} />
                <Box
                  component={'img'}
                  height={'90%'}
                  src={
                    SoursURL +
                    (theme.mode === 'dark'
                      ? 'images/landPage/homepage_p6_dark.png'
                      : 'images/landPage/homepage_p6_light.png')
                  }
                />
              </RoundBoxStyled>
                <RoundBoxStyled
                  bgcolor={theme.mode === 'light' ? 'white' : undefined}
                  px={4}
                  height={isMobile ? '150px' : '49%'}
                  mt={isMobile ? 3 : 0}
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                >
                  <TitleDes
                    title={t('labelRedPackets2')}
                    description={t('labelRedPacketsDes2')}
                    desColor={theme.mode === 'light' ? 'var(--color-text-secondary)' : undefined}
                    mr={4}
                  />
                  <Box
                    component={'img'}
                    height={'90%'}
                    src={
                      SoursURL +
                      (theme.mode === 'dark'
                        ? 'images/landPage/homepage_p7_dark.png'
                        : 'images/landPage/homepage_p7_light.png')
                    }
                  />
                </RoundBoxStyled>
              </Box>
            </Box>
          </MaxWidthContainer>
          {/* <Box component='section'>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
              className={'box6'}
            >
              <CardBox
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
                flexDirection={isMobile ? 'column' : 'row'}
              >
                <Box
                  display={'flex'}
                  flexDirection={'column'}
                  flex={1}
                  alignItems={'stretch'}
                  paddingRight={isMobile ? 0 : 5}
                >
                  <Typography
                    component={'h4'}
                    variant={'h4'}
                    display={'inline-flex'}
                    alignItems={'center'}
                    textAlign={'left'}
                    marginBottom={1}
                  >
                    {t('labelProductsTitle')}
                  </Typography>
                  <Typography
                    component={'p'}
                    variant={'h5'}
                    textAlign={'left'}
                    whiteSpace={'pre-line'}
                    marginBottom={4}
                    color={'textSecondary'}
                  >
                    {t('labelProductsTitleDes')}
                  </Typography>

                  <ButtonStyled
                    fullWidth
                    title={`#${RouterPath.pro}`}
                    href={`#${RouterPath.pro}`}
                    className='menuItem'
                    variant={'text'}
                    startIcon={<SpotIcon />}
                  >
                    <Box display={'flex'} flexDirection={'column'}>
                      <Typography component={'span'} display={'inline-flex'} alignItems={'center'}>
                        {t('labelSpot')}
                        <GoIcon color='inherit' />
                      </Typography>
                      <Typography component={'span'} color={'textSecondary'}>
                        {t('labelSpotDes')}
                      </Typography>
                    </Box>
                  </ButtonStyled>
                  <ButtonStyled
                    fullWidth
                    title={`#${RouterPath.lite}`}
                    href={`#${RouterPath.lite}`}
                    className='menuItem'
                    variant={'text'}
                    startIcon={<SwapLandIcon />}
                  >
                    <Box display={'flex'} flexDirection={'column'}>
                      <Typography component={'span'} display={'inline-flex'} alignItems={'center'}>
                        {t('labelSwap')}

                        <GoIcon color='inherit' />
                      </Typography>
                      <Typography component={'span'} color={'textSecondary'}>
                        {t('labelSwapDes')}
                      </Typography>
                    </Box>
                  </ButtonStyled>
                  <ButtonStyled
                    fullWidth
                    title={`#${RouterPath.btrade}`}
                    href={`#${RouterPath.btrade}`}
                    className='menuItem'
                    variant={'text'}
                    startIcon={<BlockTradeLandIcon />}
                  >
                    <Box display={'flex'} flexDirection={'column'}>
                      <Typography component={'span'} display={'inline-flex'} alignItems={'center'}>
                        {t('labelBlockTrade')}

                        <GoIcon color='inherit' />
                      </Typography>
                      <Typography component={'span'} color={'textSecondary'}>
                        {t('labelBlockTradeDes')}
                      </Typography>
                    </Box>
                  </ButtonStyled>
                  <ButtonStyled
                    fullWidth
                    title={`#${RouterPath.fiat}`}
                    href={`#${RouterPath.fiat}`}
                    className='menuItem'
                    variant={'text'}
                    startIcon={<FiatLandIcon />}
                  >
                    <Box display={'flex'} flexDirection={'column'}>
                      <Typography component={'span'} display={'inline-flex'} alignItems={'center'}>
                        {t('labelFiat')}

                        <GoIcon color='inherit' />
                      </Typography>
                      <Typography component={'span'} color={'textSecondary'}>
                        {t('labelFiatDes')}
                      </Typography>
                    </Box>
                  </ButtonStyled>
                </Box>
                <Box>
                  <img id='mobileBg' width='533' src={`${SoursURL}images/landPage/homepage_p4_${theme.mode}.png`} />
                </Box>
              </CardBox>
            </Box>
          </Box> */}
        </Container>
      </ContainerStyle>

      <BgStyle id='bgContent'></BgStyle>
    </>
  )
})
