import { Box, Container, Typography, Grid, BoxProps } from '@mui/material'
import React from 'react'
import styled from '@emotion/styled'
import { Trans, withTranslation } from 'react-i18next'
import { useHistory, useLocation } from 'react-router-dom'
import { useSettings, Button, MaxWidthContainer } from '@loopring-web/component-lib'
import { ContainerStyle, CardBox } from './style'
import { useTheme } from '@emotion/react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { SoursURL, ToRightTopArrow } from '@loopring-web/common-resources'

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
  width: 100%;
  background: url('./bgio.webp') no-repeat;
  background-position-y: 0;
  background-position-x: -360px;
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
    background: url('./bg-2.webp') center center no-repeat;
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
      <Box component={'img'} src={iconURL} alt='Network Icon' sx={{ marginRight: 1, width: '24px', height: '24px' }} />
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
  ...rest
}) => {
  return (
    <Box
      textAlign='center'
      display={'flex'}
      flexDirection={'column'}
      alignItems={'center'}
      {...rest}
    >
      <Typography
        variant='h1'
        component='h1'
        gutterBottom
        fontWeight={700}
        mb={4}
        color={'var(--color-text-primary)'}
        fontSize='80px'
        lineHeight={'80px'}
      >
        {title}
      </Typography>
      <Typography
        variant='h3'
        fontWeight={400}
        component='p'
        color={descriptionTextColor ?? 'var(--color-text-third)'}
        fontSize={'28px'}
        mb={8}
        lineHeight={'40px'}
      >
        {description.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </Typography>
      <Button
        sx={{ borderRadius: '8px' }}
        variant='contained'
        size='large'
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
  backgroundColor: bgcolor ?? (theme.mode === 'dark' ? '#1C1C1E' : '#F8F8F8'),
  borderRadius: '25px',
}))

const TitleDes = ({ title, description, ...rest }: { title: string; description: string } & BoxProps) => {
  return (
    <Box {...rest}>
      <Typography mb={2} fontSize={'24px'} color={'var(--color-text-primary)'}>
        {title}
      </Typography>
      <Typography fontSize={'16px'} color={'var(--color-text-third)'}>
        {description}
      </Typography>
    </Box>
  )
}

export const HomePage = withTranslation(['landPage', 'common'])(({ t }: any) => {
  const { search, pathname } = useLocation()
  const searchParams = new URLSearchParams(search)

  const { isMobile } = useSettings()

  const history = useHistory()
  const boxRef = React.useRef()
  const [value, setValue] = React.useState('detail1')
  const theme = useTheme()
  React.useEffect(() => {
    if (searchParams?.has('goProd')) {
      boxRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      searchParams?.delete('goProd')
      history.push(pathname + '?' + searchParams.toString())
    }
  }, [searchParams?.has('goProd')])

  console.log(SoursURL + (theme.mode === 'dark' ? 'images/landPage/homepage_p5_dark.png' : 'images/landPage/homepage_p5_light.png'))

  return (
    <>
      <ContainerStyle
        sx={{
          zIndex: 10,
          bgcolor: theme.mode === 'dark' ? '#000000' : '#FFFFFF',
          marginTop: 'calc(var(--header-height) * -1)',
        }}
      >
        <MaxWidthContainer containerProps={{
          sx: {
            backgroundImage: `url('${SoursURL + (theme.mode === 'dark' ? 'images/landPage/homepage_bg_dark.png' : 'images/landPage/homepage_bg_light.png')}')`,
            backgroundSize: '100% auto',
            backgroundPosition: 'center 130px',
            backgroundRepeat: 'no-repeat',
          }
        }} pb={8} pt={20}>
          <Box sx={{

              
          }} display={'flex'} flexDirection={'column'} alignItems={'center'}>
            <RoundIndicator
              iconURL={SoursURL + 'images/landPage/homepage_network.svg'}
              text={t('labelSupportedNetworkDes')}
            />
            <TitleGroup
              title={t('labelNavEarn')}
              description={
                t('labelTitleLiteDes')
              }
              mb={15}
              link={'https://defi.loopring.io/'}
              buttonText={t('labelLaunch')}
              descriptionTextColor={'var(--color-text-primary)'}
            />
          </Box>

          <Box
            height={'550px'}
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
          >
            <RoundBoxStyled p={8} pb={0} height={'100%'} width={'49.5%'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'}>
              <TitleDes
                title={t('labelLeadingOnChainStructuredProduct')}
                description={t('labelLeadingOnChainStructuredProductDes')}
              />
              <Box
                component={'img'}
                src={
                  SoursURL +
                  (theme.mode === 'dark'
                    ? 'earn/intro_screenshot_1.png'
                    : 'earn/intro_screenshot_1_light.png')
                }
                sx={{ width: '70%', }}
              />
            </RoundBoxStyled>

            <RoundBoxStyled p={8} pb={0} height={'100%'} width={'49.5%'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} alignItems={'center'}>
              <TitleDes
                title={t('labelTradeWithCEXLiquidity')}
                description={
                  t('labelTradeWithCEXLiquidityDes')
                }
              />
              <Box
                component={'img'}
                src={
                  SoursURL +
                  (theme.mode === 'dark'
                    ? 'earn/intro_screenshot_3.png'
                    : 'earn/intro_screenshot_3_light.png')
                }
                sx={{ width: '70%', }}/>
            </RoundBoxStyled>
          </Box>
          <RoundBoxStyled
            height={'300px'}
            p={8}
            width={'100%'}
            mt={3}
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <TitleDes
              title={t('labelUnlockThePowerOfLeveragedTrading')}
              description={
                t('labelUnlockThePowerOfLeveragedTradingDes')
              }
              mr={2}
            />
            <Box component={'img'} width={'25%'} height={'auto'} src={
                  SoursURL +
                  (theme.mode === 'dark'
                    ? 'earn/intro_screenshot_2.png'
                    : 'earn/intro_screenshot_2_light.png')
                } />
          </RoundBoxStyled>
        </MaxWidthContainer>
        <MaxWidthContainer
          containerProps={{ bgcolor: theme.mode === 'light' ? '#EDF2FA' : undefined }}
          py={15}
        >
          <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
            <RoundIndicator iconURL={SoursURL + 'images/landPage/homepage_ethereum.svg'} text={t('labelEthereumOnly')} />
            <TitleGroup
              mb={15}
              title={t('labelLoopringLayer2')}
              description={
                t('labelLoopringLayer2Des')
              }
              onClickLink={() => {
                history.push('/pro')
              }}
              buttonText={t('labelLaunch')}
            />
          </Box>
          <Box
            height={'600px'}
            display={'flex'}
            flexDirection={'row'}
            justifyContent={'space-between'}
          >
            <RoundBoxStyled
              bgcolor={theme.mode === 'light' ? 'white' : undefined}
              px={4}
              py={8}
              pb={0}
              width={'49.5%'}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'space-between'}
              alignItems={'center'}
            >
              <TitleDes
                title={t('labelTrade')}
                description={t('labelTradeDes')}
              />
              <Box width={'70%'} component={'img'} src={SoursURL +  (theme.mode === 'dark' ? 'images/landPage/homepage_p4_dark.png' : 'images/landPage/homepage_p4_light.png')} />
            </RoundBoxStyled>
            <Box
              width={'49.5%'}
              display={'flex'}
              flexDirection={'column'}
              justifyContent={'space-between'}
            >
              <RoundBoxStyled
                bgcolor={theme.mode === 'light' ? 'white' : undefined}
                px={4}
                // py={8}
                height={'32%'}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <TitleDes
                  title={t('labelEarn')}
                  description={t('labelEarnDes')}
                  mr={4}
                />
                <Box component={'img'} height={'70%'} src={SoursURL + (theme.mode === 'dark' ? 'images/landPage/homepage_p5_dark.png' : 'images/landPage/homepage_p5_light.png')} />
              </RoundBoxStyled>
              <RoundBoxStyled
                bgcolor={theme.mode === 'light' ? 'white' : undefined}
                px={4}
                height={'32%'}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <TitleDes title={t('labelNFT')} description={t('labelNFTDes')} mr={4} />
                <Box component={'img'} height={'90%'} src={SoursURL +  (theme.mode === 'dark' ? 'images/landPage/homepage_p6_dark.png' : 'images/landPage/homepage_p6_light.png')} />
              </RoundBoxStyled>
              <RoundBoxStyled
                bgcolor={theme.mode === 'light' ? 'white' : undefined}
                px={4}
                height={'32%'}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'space-between'}
              >
                <TitleDes
                  title={t('labelRedPackets2')}
                  description={t('labelRedPacketsDes2')}
                  mr={4}
                />
                <Box component={'img'} height={'90%'} src={SoursURL +  (theme.mode === 'dark' ? 'images/landPage/homepage_p7_dark.png' : 'images/landPage/homepage_p7_light.png')} />
              </RoundBoxStyled>
            </Box>
          </Box>
        </MaxWidthContainer>

        <MaxWidthContainer display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'} containerProps={{}} py={15}>
          <TitleGroup
            mb={15}
            title={t('labelLoopringSmartWallet')}
            description={t('labelLoopringSmartWalletDes2')}
            link={'https://wallet.loopring.io/'}
            buttonText={t('labelExplore')}
          />
          <Box mt={10} ml={'9.5%'} width={'80%'} component={'img'} src={SoursURL + (theme.mode === 'dark' ? 'images/landPage/homepage_p8_dark.png' : 'images/landPage/homepage_p8_light.png')} />
        </MaxWidthContainer>
        <MaxWidthContainer
          containerProps={{ bgcolor: theme.mode === 'light' ? '#F8F8F8' : undefined }}
          py={15}
        >
          <TitleGroup
            mb={15}
            title={t('labelLoopringProtocol')}
            description={t('labelLoopringProtocolDes')}
            link={'https://loopring.org'}
            buttonText={t('labelExplore')}
          />
          <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'}>
            <RoundBoxStyled
              bgcolor={theme.mode === 'light' ? 'white' : undefined}
              px={3}
              py={4}
              borderRadius={'12px'}
              width={'32%'}
            >
              <Box width={'36px'} component={'img'} src={SoursURL + 'images/landPage/homepage_icon1.svg'} />
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
              width={'32%'}
            >
              <Box width={'36px'} component={'img'} src={SoursURL + 'images/landPage/homepage_icon2.svg'} />
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
              width={'32%'}
            >
              <Box width={'36px'} component={'img'} src={SoursURL + 'images/landPage/homepage_icon3.svg'} />
              <Typography mt={2} color={'var(--color-text-primary)'} variant='h5' fontSize={'20px'}>
                {t('labelBringingCEXToDeFi')}
              </Typography>
              <Typography mt={1} color={'var(--color-text-secondary)'} fontSize={'14px'}>
                {t('labelBringingCEXToDeFiDes')}
              </Typography>
            </RoundBoxStyled>
          </Box>
        </MaxWidthContainer>
        <MaxWidthContainer containerProps={{
          sx: {
            backgroundImage: `url('${SoursURL + (theme.mode === 'dark' ? 'images/landPage/homepage_bg2_dark.png' : 'images/landPage/homepage_bg2_light.png')}')`,
            backgroundSize: 'auto 100%',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }
        }} py={15}>
          <TitleGroup
            title={t('labelReadyForDevelopers')}
            description={t('labelReadyForDevelopersDes2')}
            link={'https://docs.loopring.io'}
            buttonText={t('labelExplore')}
          />
        </MaxWidthContainer>
      </ContainerStyle>
      <BgStyle id='bgContent'></BgStyle>
    </>
  )
})
