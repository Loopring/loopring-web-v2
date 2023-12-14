import { Avatar, Box, Button, Container, Tabs, Tab, Typography, Grid } from '@mui/material'
import React from 'react'
import styled from '@emotion/styled'
import {
  ammAdvice,
  BlockTradeIcon,
  defiAdvice,
  SpotIcon,
  SwapIcon,
  dualAdvice,
  FiatIcon,
  fnType,
  GoIcon,
  leverageETHAdvice,
  RouterPath,
  stakeAdvice,
  TokenType,
  NFTSubRouter,
} from '@loopring-web/common-resources'
import { Trans, withTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { useNotify, WalletConnectL2Btn } from '@loopring-web/core'
import { CoinIcons, useSettings } from '@loopring-web/component-lib'
import { ContainerStyle, CardBox } from './style'
import { useTheme } from '@emotion/react'

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
  //position:relative;
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
            height={528}
          >
            <Typography
              textAlign={'center'}
              component={'h2'}
              variant={'h1'}
              display={'inline-flex'}
              alignItems={'center'}
              marginBottom={3}
            >
              <Box width={48} marginRight={1} display={'flex'}>
                <CoinIcons size={48} type={TokenType.single} tokenIcon={[coinJson['ETH']]} />
              </Box>
              Ethereum
            </Typography>
            <Typography
              component={'p'}
              variant={'h2'}
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
          <Box component='section'>
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
                    startIcon={<SwapIcon />}
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
                    startIcon={<BlockTradeIcon />}
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
                    startIcon={<FiatIcon />}
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
                  <img id='mobileBg' width='533' src={`./desktop_${theme.mode}.webp`} />
                </Box>
              </CardBox>
            </Box>
          </Box>
        </Container>
      </ContainerStyle>
      <ContainerStyle sx={{ zIndex: 10, marginBottom: 4 }}>
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'}>
          <Typography
            component={'h4'}
            variant={'h3'}
            display={'inline-flex'}
            alignItems={'center'}
            marginBottom={1}
            textAlign={'center'}
          >
            {t('labelEndProductTitle')}
          </Typography>
          <Typography
            component={'p'}
            variant={'h5'}
            textAlign={'center'}
            whiteSpace={'pre-line'}
            marginBottom={1}
            color={'textSecondary'}
          >
            {t('labelEndProductTitleDes')}
          </Typography>
        </Box>
        <Container
          maxWidth='lg'
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            width: '100%',
          }}
        >
          {isMobile ? (
            investAdviceList.map((item, index) => {
              return (
                <CardBox
                  key={item.type}
                  padding={3}
                  onClick={() => history.push(item.router)}
                  className={'hasHover'}
                  marginY={2}
                >
                  <Box
                    display={'flex'}
                    justifyContent={'space-between'}
                    flexDirection={'column'}
                    alignItems={'left'}
                  >
                    <Avatar
                      variant='circular'
                      style={{
                        height: 'var(--svg-size-huge)',
                        width: 'var(--svg-size-huge)',
                      }}
                      src={item.banner}
                    />
                    <Typography marginTop={2} component='h4' variant={'h4'} textAlign={'left'}>
                      {t(item.titleI18n, { ns: 'layout' })}
                    </Typography>

                    <Typography
                      variant={'body1'}
                      marginTop={3}
                      textAlign={'left'}
                      color={'textSecondary'}
                    >
                      {t(item.desI18n, { ns: ['landPage'] })}
                    </Typography>
                    <Button
                      sx={{ marginTop: 5 }}
                      title={item.router}
                      rel='noopener'
                      href={`#${item.router}`}
                      endIcon={<GoIcon color='inherit' />}
                    >
                      <Trans i18nKey={'labelGo'} ns={['landPage']}>
                        Go
                      </Trans>
                    </Button>
                  </Box>
                </CardBox>
              )
            })
          ) : (
            <Tabs variant={'scrollable'} className={'product'}>
              {investAdviceList.map((item, index) => {
                return (
                  <Tab
                    label={
                      <CardBox
                        padding={3}
                        onClick={() => history.push(item.router)}
                        className={'hasHover'}
                      >
                        <Box
                          display={'flex'}
                          justifyContent={'space-between'}
                          flexDirection={'column'}
                          alignItems={'left'}
                        >
                          <Avatar
                            variant='circular'
                            style={{
                              height: 'var(--svg-size-huge)',
                              width: 'var(--svg-size-huge)',
                            }}
                            src={item.banner}
                          />
                          <Typography
                            marginTop={2}
                            component='h4'
                            variant={'h4'}
                            color={'textPrimary'}
                            textAlign={'left'}
                          >
                            {t(item.titleI18n, { ns: 'layout' })}
                          </Typography>

                          <Typography
                            variant={'body1'}
                            marginTop={3}
                            textAlign={'left'}
                            color={'textSecondary'}
                          >
                            {t(item.desI18n, { ns: ['landPage'] })}
                          </Typography>
                          <Button
                            sx={{ marginTop: 5 }}
                            title={item.router}
                            rel='noopener'
                            href={`#${item.router}`}
                            endIcon={<GoIcon color='inherit' />}
                          >
                            <Trans i18nKey={'labelGo'} ns={['landPage']}>
                              Go
                            </Trans>
                          </Button>
                        </Box>
                      </CardBox>
                    }
                    key={item.type}
                    value={item.type}
                    href={`/#${item.router}`}
                  />
                )
              })}
            </Tabs>
          )}
        </Container>
      </ContainerStyle>
      <ContainerStyle sx={{ zIndex: 10, marginBottom: 8 }}>
        <Container
          maxWidth='lg'
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <Grid container spacing={3} alignItems={'stretch'}>
            <Grid item xs={12} md={6}>
              <CardBox
                height={'100%'}
                padding={6}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                alignItems={'center'}
                className={'hasHover'}
                onClick={() => history.push(`${RouterPath.nft}/${NFTSubRouter.myCollection}`)}
              >
                <img width='248' src={`./NFT.webp`} />

                <Box>
                  <Typography
                    component='h4'
                    variant={'h4'}
                    textAlign={'center'}
                    aria-label='Manage and Display Your NFT Collections'
                    marginBottom={1}
                  >
                    <Trans i18nKey={'labelNFTCollections'} ns={['landPage']}>
                      Manage and Display Your NFT Collections
                    </Trans>
                  </Typography>
                  <Typography
                    component='p'
                    variant={'body1'}
                    textAlign={'center'}
                    color={'textSecondary'}
                    aria-label='In close collaboration with your business, we’ll develop a strategic plan to integrate NFTs into your ecosystem.'
                  >
                    <Trans i18nKey={'labelNFTCollectionsDes'} ns={['landPage']}>
                      In close collaboration with your business, we’ll develop a strategic plan to
                      integrate NFTs into your ecosystem.
                    </Trans>
                  </Typography>
                </Box>
              </CardBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <CardBox
                padding={6}
                height={'100%'}
                display={'flex'}
                flexDirection={'column'}
                justifyContent={'space-between'}
                alignItems={'center'}
                className={'hasHover'}
                onClick={() => history.push(`${RouterPath.redPacket}`)}
              >
                <img width='248' src={`./Redpack.webp`} />
                <Box>
                  <Typography
                    component='h4'
                    variant={'h4'}
                    aria-label='Red Packets'
                    textAlign={'center'}
                    marginBottom={1}
                  >
                    <Trans i18nKey={'labelRedPackets'} ns={['landPage']}>
                      Red Packets
                    </Trans>
                  </Typography>
                  <Typography
                    component='p'
                    variant={'body1'}
                    textAlign={'center'}
                    color={'textSecondary'}
                    aria-label='Explore the various use cases of our revolutionary Red Packets! Send token or NFT gifts directly or gamify the experience with blind boxes.'
                  >
                    <Trans i18nKey={'labelRedPacketsDes'} ns={['landPage']}>
                      Explore the various use cases of our revolutionary Red Packets! Send token or
                      NFT gifts directly or gamify the experience with blind boxes.
                    </Trans>
                  </Typography>
                </Box>
              </CardBox>
            </Grid>
          </Grid>
        </Container>
      </ContainerStyle>

      <BgStyle id='bgContent'></BgStyle>
    </>
  )
})
