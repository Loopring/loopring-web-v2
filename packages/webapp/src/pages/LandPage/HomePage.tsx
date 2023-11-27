import { Box, Container, Typography, Grid } from '@mui/material'
import React from 'react'
import styled from '@emotion/styled'
import {
  ExchangePro,
  GoIcon,
  Earnlite,
  WalletSite,
  LOOPRING_DOC,
} from '@loopring-web/common-resources'
import { Trans, withTranslation } from 'react-i18next'
import { useHistory, useLocation } from 'react-router-dom'
import { useSettings, Button } from '@loopring-web/component-lib'
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
  width: 100%;
  //position:relative;
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

    //background-size: 50% 50%;
  }
`

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
              component={'h1'}
              variant={'h1'}
              fontSize={56}
              lineHeight={'72px'}
              aria-label="Ethereum's First zkRollup Layer2"
              id='labelEthereumUnleashed'
            >
              <Trans i18nKey={'labelEthereumUnleashed'} ns={['landPage']}>
                <span>Ethereum's First zkRollup</span>
                <Typography
                  variant={'inherit'}
                  fontSize={'inherit'}
                  component='span'
                  color={'primary'}
                >
                  Layer 2
                </Typography>
              </Trans>
            </Typography>
            <Typography
              component='p'
              variant={'h4'}
              textAlign={'center'}
              whiteSpace={isMobile ? 'inherit' : 'pre-line'}
              aria-label='Your gateway to Ethereum, DeFi, NFTs, and Financial Freedom. Fast, Low-cost, & Secure'
              id='labelGatewayToEthereum'
            >
              <Trans i18nKey={'labelGatewayToEthereum'} ns={['landPage']}>
                Your gateway to Ethereum, DeFi, NFTs, and Financial Freedom. Fast, Low-cost, &
                Secure
              </Trans>
            </Typography>
          </Box>

          <Box component='section'>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
              className={'box1'}
            >
              <CardBox
                onClick={() => window.open(WalletSite, '_blank')}
                display={'flex'}
                alignItems={'stretch'}
                flexDirection={'row'}
              >
                <Box
                  display={'flex'}
                  flexDirection={'column'}
                  justifyContent={'space-between'}
                  marginRight={isMobile ? 0 : 4}
                >
                  <Box aria-label="Ethereum's First zkRollup Layer2">
                    <Typography
                      component='h4'
                      variant={'h2'}
                      // marginBottom={3}
                      aria-label='Loopring Smart Wallet'
                      id='labelLoopringSmartWallet'
                    >
                      <Trans i18nKey={'labelLoopringSmartWallet'} ns={['landPage']}>
                        Loopring Smart Wallet
                      </Trans>
                    </Typography>
                    <Typography
                      component='p'
                      variant={'h5'}
                      whiteSpace={'pre-line'}
                      aria-label='Your Gateway to Ethereum, DeFi, NFTs, and Financial Freedom'
                      id='labelLoopringSmartWalletDes'
                    >
                      <Trans i18nKey={'labelLoopringSmartWalletDes'} ns={['landPage']}>
                        Ethereum's most secure wallet, fully integrated with advanced trading
                        functionality and innovative Earn products, unlocking the true potential of
                        Layer 2.
                      </Trans>
                    </Typography>
                  </Box>
                  <Button
                    rel='noopener'
                    title={WalletSite}
                    endIcon={<GoIcon color='inherit' />}
                    onClick={() => window.open(WalletSite, '_blank')}
                  >
                    <span aria-label='wallet.loopring.io' id='labelLearnMore'>
                      <Trans i18nKey={'labelLearnMore'} ns={['landPage']}>
                        Learn More
                      </Trans>
                    </span>
                  </Button>
                </Box>
                <Box>
                  <img id='mobileBg' width='533' src={`./mobile_${theme.mode}.webp`} />
                </Box>
              </CardBox>
            </Box>
          </Box>
          <Box component='section' ref={boxRef}>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <Grid container spacing={3} className='box2'>
                <Grid item xs={12} md={6}>
                  <Box
                    flex={1}
                    height={'100%'}
                    padding={6}
                    className={'boxDetail'}
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'space-between'}
                    onClick={() => window.open(ExchangePro, '_blank')}
                  >
                    <div aria-label="Ethereum's First zkRollup Layer2">
                      <Typography
                        component='h4'
                        variant={'h2'}
                        aria-label='Ready for Developers'
                        id='labelTitlePro'
                      >
                        <Trans i18nKey={'labelTitlePro'} ns={['landPage']}>
                          Loopring Pro
                        </Trans>
                      </Typography>
                      <Typography
                        component='p'
                        variant={'h5'}
                        aria-label='Explore the Loopring DEX, Earn, and NFT Management. Powered by zkRollups, experience instant transactions with 100x lower fees than Ethereum without sacrificing any of its security.'
                        id='labelTitleProDes'
                      >
                        <Trans i18nKey={'labelTitleProDes'} ns={['landPage']}>
                          Explore the Loopring DEX, Earn, and NFT Management. Powered by zkRollups,
                          experience instant transactions with 100x lower fees than Ethereum without
                          sacrificing any of its security.
                        </Trans>
                      </Typography>
                    </div>
                    <Button
                      rel='noopener'
                      title={ExchangePro}
                      onClick={() => window.open(ExchangePro, '_blank')}
                      endIcon={<GoIcon color='inherit' />}
                    >
                      <span aria-label={ExchangePro} id='labelGo1'>
                        <Trans i18nKey={'labelGo'} ns={['landPage']}>
                          Go
                        </Trans>
                      </span>
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box
                    flex={1}
                    height={'100%'}
                    onClick={() => window.open(Earnlite, '_blank')}
                    padding={6}
                    className={'boxDetail'}
                    display={'flex'}
                    flexDirection={'column'}
                    justifyContent={'space-between'}
                  >
                    <div aria-label="Ethereum's First zkRollup Layer2">
                      <Typography
                        component='h4'
                        variant={'h2'}
                        aria-label='Ready for Developers'
                        id='labelTitleLite'
                      >
                        <Trans i18nKey={'labelTitleLite'} ns={['landPage']}>
                          Loopring Lite
                        </Trans>
                      </Typography>
                      <Typography
                        component='p'
                        variant={'h5'}
                        aria-label='Access the best DeFi Strategy just like the pros! Simply deposit stETH, and Instadapp Lite will put it to work for you using the most popular DeFi protocols.'
                      >
                        <Trans i18nKey={'labelTitleLiteDes'} ns={['landPage']}>
                          Access the most innovative structural products brought to the DeFi world.
                        </Trans>
                      </Typography>
                    </div>
                    <Button
                      rel='noopener'
                      className='light'
                      title={Earnlite}
                      endIcon={<GoIcon color='inherit' />}
                      onClick={() => window.open(Earnlite, '_blank')}
                    >
                      <span aria-label={Earnlite} id='labelGo2'>
                        <Trans i18nKey={'labelGo'} ns={['landPage']}>
                          Go
                        </Trans>
                      </span>
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Box component='section' marginBottom={3}>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <Typography
                component='h4'
                variant={'h2'}
                aria-label='Loopring Smart Wallet'
                id='labelLoopringProtocol'
                textAlign={'center'}
                marginBottom={1}
              >
                <Trans i18nKey={'labelLoopringProtocol'} ns={['landPage']}>
                  Loopring Protocol
                </Trans>
              </Typography>
              <Typography
                component='p'
                variant={'h5'}
                textAlign={'center'}
                color={'textSecondary'}
                aria-label="The world' s first ZKRollup implementation designed to scale
         Ethereum, fully optimized for trading."
                id='labelLoopringProtocolDes'
              >
                <Trans i18nKey={'labelLoopringProtocolDes'} ns={['landPage']}>
                  The world's first ZKRollup implementation designed to scale Ethereum, fully
                  optimized for trading.
                </Trans>
              </Typography>
            </Box>
          </Box>
          <Box>
            <Grid
              container
              spacing={3}
              sx={{ flexWrap: isMobile ? 'wrap' : 'nowrap' }}
              className='box4'
              id='detailBox'
            >
              <Grid
                item
                className={value == 'detail1' ? 'selected' : ''}
                onMouseOver={() => setValue('detail1')}
                md={isMobile ? 12 : value == 'detail1' ? 8 : 2}
                xs={12}
                id='detail1'
              >
                <Box
                  className={'boxDetail'}
                  sx={{
                    background: 'var(--color-box)',
                    boxSizing: 'content-box',
                  }}
                  padding={3}
                  height={400}
                  display={'flex'}
                  flexDirection={'column'}
                  justifyContent={'space-between'}
                >
                  <Box padding={2}>
                    <Typography
                      component='h4'
                      variant={'h3'}
                      paddingTop={3}
                      aria-label='Ultimate Security'
                      id='labelUltimateSecurity'
                    >
                      <Trans i18nKey={'labelUltimateSecurity'} ns={['landPage']}>
                        Ultimate Security
                      </Trans>
                    </Typography>
                    <Typography
                      component='p'
                      variant={'h5'}
                      color={'textSecondary'}
                      marginTop={3}
                      id='labelUltimateSecurityDes'
                      aria-label='Assets on Loopring L2 are equally secure as they are on the Ethereum mainnet.'
                    >
                      <Trans i18nKey={'labelUltimateSecurityDes'} ns={['landPage']}>
                        Assets on Loopring L2 are equally secure as they are on the Ethereum
                        mainnet.
                      </Trans>
                    </Typography>
                  </Box>
                  <svg width='180' height='180' viewBox='0 0 24 24'>
                    <path
                      className='fill-light'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M6.3727 13.6874C6.10281 13.7944 5.86713 13.8226 5.86713 13.8226C5.8596 13.8256 5.85199 13.8256 5.8443 13.8224C4.42033 13.2305 3.17225 12.3667 2.35694 11.0297C1.33762 9.35844 1.0495 7.26741 1 5.35012C0.999924 5.34625 1.00097 5.34244 1.00302 5.33915C1.00507 5.33587 1.00803 5.33325 1.01154 5.33162L5.84623 3.13943C5.85045 3.13747 5.85507 3.13645 5.85976 3.13645C5.86444 3.13645 5.86924 3.13754 5.87353 3.1395L6.31572 3.02101L6.35549 3.00298L6.3607 3.00109C6.3634 3.00037 6.3662 3 6.36903 3C6.37371 3 6.37836 3.00102 6.38265 3.00298L11.2149 5.19493C11.2178 5.19627 11.2202 5.19842 11.2219 5.20111C11.2235 5.20379 11.2244 5.2069 11.2243 5.21006C11.1895 6.57733 11.0232 7.97007 10.6092 9.26668C10.1293 10.7685 9.239 12.0296 7.90995 12.8881C7.42391 13.2021 6.64259 13.5804 6.3727 13.6874ZM5.85641 13.6856C6.37112 13.4737 6.86219 13.2167 7.32968 12.9147C8.63036 12.0744 9.50349 10.8398 9.97525 9.36331C10.3767 8.10613 10.5434 6.75407 10.5822 5.41903L5.85979 3.27694L1.13282 5.42029C1.18761 7.31012 1.48034 9.34117 2.46865 10.9616C3.25787 12.2558 4.46475 13.1011 5.85641 13.6856ZM2.96809 10.566C3.6348 11.6443 4.65424 12.3504 5.83243 12.8396C6.26651 12.6628 6.68071 12.4487 7.07512 12.1974C8.17684 11.4955 8.91636 10.4642 9.31606 9.23041C9.65505 8.1833 9.79684 7.05694 9.83059 5.94344L5.83523 4.15596L1.83596 5.94449C1.88361 7.52389 2.13336 9.21616 2.96809 10.566ZM7.14543 12.3078C6.73216 12.5711 6.29751 12.7942 5.84147 12.977C5.83507 12.9796 5.8286 12.9795 5.82206 12.9768C4.61128 12.4805 3.55005 11.756 2.8568 10.6348C1.99009 9.23325 1.74511 7.47965 1.70302 5.87175C1.70295 5.8685 1.70384 5.86531 1.70558 5.86255C1.70732 5.8598 1.70984 5.8576 1.71283 5.85623L5.8237 4.01779C5.82729 4.01615 5.83122 4.0153 5.8352 4.0153C5.83919 4.0153 5.84314 4.01615 5.84679 4.01779L9.95561 5.85603C9.95805 5.85716 9.96009 5.85896 9.96151 5.86121C9.96292 5.86347 9.96364 5.86608 9.96358 5.86873C9.93396 7.01536 9.79257 8.18335 9.44053 9.27073C9.03251 10.5302 8.27551 11.5878 7.14543 12.3078ZM5.51197 6.30016V10.3631L3.8121 9.00451L5.51197 6.30016ZM6.75844 8.27377H8.90904V8.28665L5.55114 10.3342L7.21561 9.00137L6.75844 8.27377ZM18.1484 21.7995C17.8785 21.9066 17.6428 21.9348 17.6428 21.9348C17.6353 21.9378 17.6277 21.9377 17.62 21.9345C16.196 21.3427 14.9479 20.4788 14.1326 19.1418C13.1133 17.4706 12.8252 15.3796 12.7757 13.4623C12.7756 13.4584 12.7767 13.4546 12.7787 13.4513C12.7808 13.448 12.7837 13.4454 12.7872 13.4438L17.6219 11.2516C17.6261 11.2496 17.6308 11.2486 17.6355 11.2486C17.6401 11.2486 17.6449 11.2497 17.6492 11.2517L18.0914 11.1332L18.1312 11.1151L18.1364 11.1132C18.138 11.1128 18.1397 11.1125 18.1414 11.1123C18.1425 11.1122 18.1436 11.1122 18.1447 11.1122C18.1494 11.1122 18.1541 11.1132 18.1583 11.1151L22.9906 13.3071C22.9935 13.3084 22.9959 13.3106 22.9976 13.3133C22.9992 13.3159 23.0001 13.3191 23 13.3222C22.9652 14.6895 22.7989 16.0822 22.3848 17.3788C21.905 18.8807 21.0147 20.1417 19.6856 21.0003C19.1996 21.3143 18.4183 21.6925 18.1484 21.7995ZM17.6321 21.7978C18.1468 21.5858 18.6379 21.3288 19.1054 21.0268C20.4061 20.1866 21.2792 18.9519 21.7509 17.4755C22.1524 16.2183 22.3191 14.8662 22.3579 13.5312L17.6355 11.3891L12.9085 13.5324C12.9633 15.4223 13.256 17.4533 14.2443 19.0737C15.0336 20.3679 16.2404 21.2132 17.6321 21.7978ZM14.7438 18.6781C15.4105 19.7565 16.4299 20.4625 17.6081 20.9517C18.0422 20.7749 18.4564 20.5609 18.8508 20.3096C19.9525 19.6077 20.6921 18.5763 21.0918 17.3426C21.4307 16.2955 21.5725 15.1691 21.6063 14.0556L17.6109 12.2681L13.6117 14.0566C13.6593 15.636 13.9091 17.3283 14.7438 18.6781ZM18.9211 20.4199C18.5079 20.6833 18.0732 20.9063 17.6172 21.0892C17.6108 21.0917 17.6043 21.0917 17.5978 21.089C16.387 20.5926 15.3257 19.8682 14.6325 18.747C13.7658 17.3454 13.5208 15.5918 13.4787 13.9839C13.4786 13.9807 13.4795 13.9775 13.4813 13.9747C13.483 13.972 13.4855 13.9698 13.4885 13.9684L17.5994 12.1299C17.603 12.1283 17.6069 12.1275 17.6109 12.1275C17.6149 12.1275 17.6188 12.1283 17.6225 12.1299L21.7313 13.9682L21.7344 13.9702L21.7372 13.9734C21.7386 13.9756 21.7393 13.9782 21.7393 13.9809C21.7097 15.1275 21.5683 16.2955 21.2162 17.3829C20.8082 18.6424 20.0512 19.6999 18.9211 20.4199ZM16.1334 16.6295L17.6492 17.3741L19.1651 16.6295L17.6492 14.0591L16.1334 16.6295ZM17.6492 19.1418L16.1333 16.8457L17.6492 17.6817L19.1651 16.8457L17.6492 19.1418ZM2.06703 21.6665L15.4072 3.96358H18.9487L5.60858 21.6665H2.06703ZM15.3074 3.76358H19.0994H19.3499L19.1991 3.96358L5.7083 21.8665H1.91632H1.66589L1.8166 21.6665L15.3074 3.76358Z'
                    />
                    <path
                      className='fill-primary'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M20.6466 3.65421H16.6042L16.5218 3.76356H19.3499L5.79077 21.7572H7.00507L12.7996 14.0676C12.7887 13.8644 12.7809 13.6624 12.7757 13.4623C12.7757 13.4584 12.7767 13.4546 12.7788 13.4513C12.7808 13.448 12.7838 13.4454 12.7873 13.4438L13.52 13.1115L20.6466 3.65421Z'
                    />
                  </svg>
                </Box>
              </Grid>
              <Grid
                item
                className={value == 'detail2' ? 'selected' : ''}
                onMouseOver={() => setValue('detail2')}
                md={isMobile ? 12 : value == 'detail2' ? 8 : 2}
                xs={12}
                id='detail2'
              >
                <Box
                  className={'boxDetail'}
                  sx={{
                    background: 'var(--color-box)',
                    boxSizing: 'content-box',
                  }}
                  padding={3}
                  height={400}
                  display={'flex'}
                  flexDirection={'column'}
                  justifyContent={'space-between'}
                >
                  <Box padding={2}>
                    <Typography
                      component='h4'
                      variant={'h3'}
                      paddingTop={3}
                      aria-label='Low Transaction Fees'
                      id='labelLowTransactionFees'
                    >
                      <Trans i18nKey={'labelLowTransactionFees'} ns={['landPage']}>
                        Low Transaction Fees
                      </Trans>
                    </Typography>
                    <Typography
                      component='p'
                      variant={'h5'}
                      color={'textSecondary'}
                      marginTop={3}
                      id='labelLowTransactionFeesDes'
                      aria-label='Loopring performs most operations, including trade and transfer settlement, off the Ethereum blockchain. This dramatically reduces gas consumption and overall transaction cost to small fractions of comparable on-chain cost.'
                    >
                      <Trans i18nKey={'labelLowTransactionFeesDes'} ns={['landPage']}>
                        Loopring performs most operations, including trade and transfer settlement,
                        off the Ethereum blockchain. This dramatically reduces gas consumption and
                        overall transaction cost to small fractions of comparable on-chain cost.
                      </Trans>
                    </Typography>
                  </Box>
                  <svg width='180' height='180' viewBox='0 0 24 24'>
                    <path
                      className='fill-light'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M3.3814 3H3.38306H3.40204H3.4211H3.44024H3.45947H3.47877H3.49815H3.51761H3.53714H3.55676H3.57646H3.59623H3.61608H3.636H3.656H3.67608H3.69624H3.71646H3.73677H3.75714H3.7776H3.79812H3.81872H3.83939H3.86013H3.88095H3.90183H3.92279H3.94382H3.96492H3.98608H4.00732H4.02863H4.05H4.07144H4.09296H4.11453H4.13618H4.15789H4.17967H4.20151H4.22342H4.2454H4.26743H4.28954H4.3117H4.33393H4.35623H4.37858H4.401H4.42348H4.44602H4.46862H4.49129H4.51401H4.53679H4.55963H4.58253H4.60549H4.62851H4.65158H4.67472H4.69791H4.72115H4.74445H4.76781H4.79122H4.81469H4.83821H4.86179H4.88542H4.9091H4.93284H4.95663H4.98047H5.00436H5.0283H5.0523H5.07634H5.10043H5.12458H5.14877H5.17301H5.19731H5.22164H5.24603H5.27046H5.29494H5.31947H5.34404H5.36866H5.39333H5.41803H5.44279H5.46758H5.49242H5.51731H5.54223H5.5672H5.59221H5.61727H5.64236H5.66749H5.69267H5.71788H5.74314H5.76843H5.79376H5.81913H5.84454H5.86998H5.89547H5.92099H5.94654H5.97213H5.99776H6.02342H6.04912H6.07485H6.10062H6.12641H6.15224H6.17811H6.20401H6.22993H6.25589H6.28188H6.30791H6.33396H6.36004H6.38615H6.41229H6.43846H6.46466H6.49088H6.51713H6.54341H6.56972H6.59605H6.62241H6.64879H6.6752H6.70163H6.72809H6.75457H6.78107H6.8076H6.83415H6.86072H6.88732H6.91393H6.94057H6.96722H6.9939H7.0206H7.04731H7.07405H7.1008H7.12757H7.15436H7.18117H7.20799H7.23483H7.26169H7.28856H7.31544H7.34235H7.36926H7.39619H7.42314H7.45009H7.47706H7.50405H7.53104H7.55805H7.58507H7.61209H7.63913H7.66618H7.69324H7.72031H7.74739H7.77447H7.80156H7.82867H7.85577H7.88289H7.91001H7.93714H7.96427H7.99141H8.01855H8.0457H8.07285H8.10001H8.12716H8.15432H8.18149H8.20865H8.23582H8.26299H8.29016H8.31733H8.3445H8.37166H8.39883H8.426H8.45316H8.48033H8.50749H8.53464H8.5618H8.58895H8.6161H8.64324H8.67037H8.69751H8.72463H8.75175H8.77887H8.80597H8.83307H8.86016H8.88725H8.91432H8.94139H8.96844H8.99549H9.02253H9.04955H9.07657H9.10357H9.13056H9.15754H9.18451H9.21147H9.23841H9.26533H9.29225H9.31915H9.34603H9.3729H9.39975H9.42659H9.45341H9.48021H9.50699H9.53376H9.56051H9.58724H9.61395H9.64064H9.66731H9.69397H9.7206H9.74721H9.7738H9.80036H9.82691H9.85343H9.87993H9.9064H9.93286H9.95928H9.98569H10.0121H10.0384H10.0647H10.091H10.1173H10.1436H10.1698H10.196H10.2221H10.2483H10.2744H10.3004H10.3265H10.3525H10.3785H10.4044H10.4304H10.4562H10.4821H10.5079H10.5337H10.5595H10.5852H10.6109H10.6365H10.6622H10.6877H10.7133H10.7388H10.7643H10.7897H10.8151H10.8405H10.8658H10.8911H10.9163H10.9415H10.9667H10.9918H11.0169H11.042H11.067H11.0919H11.1168H11.1417H11.1665H11.1913H11.2161H11.2408H11.2654H11.29H11.3146H11.3391H11.3636H11.388H11.4124H11.4367H11.461H11.4852H11.5094H11.5335H11.5576H11.5816H11.6056H11.6296H11.6534H11.6773H11.701H11.7248H11.7484H11.7721H11.7956H11.8191H11.8426H11.866H11.8893H11.9126H11.9358H11.959H11.9821H12.0052H12.0282H12.0512H12.074H12.0969H12.1196H12.1423H12.165H12.1876H12.2101H12.2326H12.255H12.2773H12.2996H12.3218H12.344H12.3661H12.3881H12.41H12.4319H12.4538H12.4755H12.4972H12.5189H12.5404H12.5619H12.5833H12.6047H12.626H12.6472H12.6684H12.6894H12.7105H12.7314H12.7523H12.7731H12.7938H12.8144H12.835H12.8555H12.876H12.8963H12.9166H12.9368H12.957H12.977H12.997H13.0169H13.0367H13.0565H13.0762H13.0958H13.1153H13.1347H13.1541H13.1734H13.1926H13.2117H13.2308H13.2497H13.2686H13.2874H13.3061H13.3247H13.3433H13.3617H13.3801H13.3984H13.4166H13.4348H13.4528H13.4708H13.4886H13.5064H13.5241H13.5417H13.5592H13.5766H13.594H13.6112H13.6284H13.6455H13.6624H13.6793H13.6961H13.7128H13.7295H13.746H13.7624H13.7787H13.795H13.8111H13.8272H13.8431H13.859H13.8748H13.8904H13.906H13.9215H13.9369H13.9522H13.9673H13.9824H13.9974H14.0123H14.0271H14.0418H14.0564H14.0708H14.0852H14.0995H14.1137H14.1278H14.1417H14.1556H14.1694H14.183H14.1966H14.2101H14.2234H14.2366H14.2498H14.2628H14.2757H14.2885H14.3012H14.3138H14.3263H14.3387H14.351H14.3631H14.3752H14.3871H14.399H14.4107H14.4223H14.4338H14.4452H14.4564H14.4676H14.4786H14.4895H14.5003H14.511H14.5216H14.5321H14.5424H14.5527H14.5628H14.5728H14.5826H14.5924H14.602H14.6116H14.621H14.6303H14.6394H14.6485H14.6574H14.6662H14.6748H14.6834H14.6918H14.7001H14.7083H14.7164H14.7243H14.7321C15.4102 3 15.8602 3.22895 16.1452 3.52166C16.4284 3.81245 16.5445 4.16183 16.564 4.3988L16.5643 4.40164V4.40449V7.13222C16.5643 7.32325 16.4094 7.47811 16.2184 7.47811H13.6143V7.33976H16.2184C16.333 7.33976 16.4259 7.24684 16.4259 7.13222V4.40739C16.408 4.19922 16.3035 3.88259 16.0461 3.61818C15.7894 3.35451 15.3762 3.13836 14.7321 3.13836C14.3054 3.13836 14.0062 3.25912 13.7939 3.45242C13.5803 3.64694 13.4475 3.92131 13.3668 4.24062C13.2358 4.75866 13.2458 5.37411 13.2545 5.91809V5.91811V5.91819V5.91827V5.91834V5.91842V5.9185V5.91857V5.91864V5.91871C13.2567 6.04945 13.2587 6.17605 13.2587 6.29618V9.34929C14.188 8.7179 15.3101 8.34895 16.5183 8.34895C16.8297 8.34895 17.1353 8.37346 17.4335 8.42065C20.5232 8.51145 23 11.0447 23 14.1564C23 17.2681 20.5232 19.8013 17.4335 19.8921C17.1353 19.9393 16.8297 19.9638 16.5183 19.9638C15.2865 19.9638 14.1442 19.5802 13.2044 18.9261C13.1852 18.9562 13.1613 18.9834 13.1331 19.0067L11.3898 20.4472C11.2619 20.5528 11.077 20.5528 10.9491 20.4472L9.28161 19.0693C9.20488 19.0059 9.09395 19.0059 9.01722 19.0693L7.34968 20.4472C7.2218 20.5528 7.03691 20.5528 6.90903 20.4472L5.24149 19.0693C5.16476 19.0059 5.05383 19.0059 4.9771 19.0693L3.30956 20.4472C3.18168 20.5528 2.99679 20.5528 2.86891 20.4472L1.12557 19.0067C1.04634 18.9412 1 18.845 1 18.7414V18.7199V18.6983V18.6766V18.6549V18.6331V18.6113V18.5895V18.5676V18.5456V18.5237V18.5016V18.4796V18.4575V18.4353V18.4131V18.3909V18.3686V18.3462V18.3239V18.3015V18.279V18.2565V18.234V18.2114V18.1888V18.1661V18.1434V18.1207V18.0979V18.0751V18.0522V18.0293V18.0064V17.9834V17.9604V17.9373V17.9142V17.8911V17.8679V17.8447V17.8215V17.7982V17.7749V17.7515V17.7281V17.7047V17.6812V17.6577V17.6342V17.6106V17.587V17.5633V17.5397V17.5159V17.4922V17.4684V17.4446V17.4208V17.3969V17.373V17.349V17.325V17.301V17.277V17.2529V17.2288V17.2046V17.1805V17.1563V17.132V17.1078V17.0835V17.0591V17.0348V17.0104V16.986V16.9615V16.937V16.9125V16.888V16.8635V16.8389V16.8142V16.7896V16.7649V16.7402V16.7155V16.6907V16.666V16.6412V16.6163V16.5915V16.5666V16.5417V16.5167V16.4918V16.4668V16.4418V16.4167V16.3917V16.3666V16.3415V16.3163V16.2912V16.266V16.2408V16.2156V16.1903V16.1651V16.1398V16.1145V16.0891V16.0638V16.0384V16.013V15.9876V15.9621V15.9367V15.9112V15.8857V15.8602V15.8346V15.8091V15.7835V15.7579V15.7323V15.7067V15.681V15.6553V15.6297V15.604V15.5782V15.5525V15.5268V15.501V15.4752V15.4494V15.4236V15.3977V15.3719V15.346V15.3202V15.2943V15.2684V15.2424V15.2165V15.1906V15.1646V15.1386V15.1126V15.0866V15.0606V15.0346V15.0085V14.9825V14.9564V14.9304V14.9043V14.8782V14.8521V14.826V14.7998V14.7737V14.7475V14.7214V14.6952V14.669V14.6429V14.6167V14.5905V14.5642V14.538V14.5118V14.4856V14.4593V14.4331V14.4068V14.3805V14.3543V14.328V14.3017V14.2754V14.2491V14.2228V14.1965V14.1702V14.1439V14.1176V14.0913V14.0649V14.0386V14.0123V13.9859V13.9596V13.9332V13.9069V13.8805V13.8542V13.8278V13.8015V13.7751V13.7488V13.7224V13.696V13.6697V13.6433V13.6169V13.5906V13.5642V13.5378V13.5115V13.4851V13.4588V13.4324V13.406V13.3797V13.3533V13.327V13.3006V13.2743V13.2479V13.2216V13.1953V13.1689V13.1426V13.1163V13.0899V13.0636V13.0373V13.011V12.9847V12.9584V12.9321V12.9058V12.8795V12.8533V12.827V12.8007V12.7745V12.7482V12.722V12.6957V12.6695V12.6433V12.6171V12.5909V12.5647V12.5385V12.5123V12.4862V12.46V12.4339V12.4077V12.3816V12.3555V12.3294V12.3033V12.2772V12.2511V12.2251V12.199V12.173V12.147V12.1209V12.0949V12.069V12.043V12.017V11.9911V11.9651V11.9392V11.9133V11.8874V11.8616V11.8357V11.8099V11.784V11.7582V11.7324V11.7066V11.6809V11.6551V11.6294V11.6037V11.578V11.5523V11.5266V11.501V11.4753V11.4497V11.4241V11.3986V11.373V11.3475V11.322V11.2965V11.271V11.2455V11.2201V11.1947V11.1693V11.1439V11.1186V11.0932V11.0679V11.0426V11.0174V10.9921V10.9669V10.9417V10.9165V10.8914V10.8663V10.8412V10.8161V10.791V10.766V10.741V10.716V10.691V10.6661V10.6412V10.6163V10.5915V10.5666V10.5418V10.5171V10.4923V10.4676V10.4429V10.4182V10.3936V10.369V10.3444V10.3198V10.2953V10.2708V10.2463V10.2219V10.1975V10.1731V10.1487V10.1244V10.1001V10.0759V10.0516V10.0274V10.0033V9.97913V9.95502V9.93095V9.90691V9.8829V9.85892V9.83498V9.81107V9.7872V9.76335V9.73954V9.71577V9.69203V9.66832V9.64465V9.62101V9.59741V9.57384V9.55031V9.52681V9.50335V9.47993V9.45654V9.43319V9.40987V9.3866V9.36336V9.34016V9.31699V9.29386V9.27078V9.24773V9.22472V9.20174V9.17881V9.15592V9.13306V9.11025V9.08747V9.06474V9.04204V9.01939V8.99678V8.9742V8.95167V8.92918V8.90674V8.88433V8.86197V8.83965V8.81737V8.79514V8.77295V8.7508V8.72869V8.70663V8.68461V8.66264V8.64071V8.61883V8.59699V8.5752V8.55345V8.53175V8.51009V8.48848V8.46691V8.44539V8.42392V8.4025V8.38112V8.35979V8.33851V8.31727V8.29609V8.27495V8.25386V8.23282V8.21182V8.19088V8.16999V8.14914V8.12835V8.1076V8.08691V8.06627V8.04567V8.02513V8.00464V7.9842V7.96381V7.94348V7.92319V7.90296V7.88278V7.86265V7.84258V7.82256V7.80259V7.78268V7.76282V7.74301V7.72326V7.70357V7.68392V7.66434V7.64481V7.62533V7.60591V7.58654V7.56724V7.54798V7.52879V7.50965V7.49057V7.47154V7.45257V7.43366V7.41481V7.39602V7.37728V7.35861V7.33999V7.32143V7.30293V7.28449V7.26611V7.24779V7.22952V7.21132V7.19318V7.17511V7.15709V7.13913V7.12123V7.1034V7.08563V7.06792V7.05027V7.03269V7.01516V6.99771V6.98031V6.96298V6.94571V6.9285V6.91136V6.89429V6.87728V6.86033V6.84345V6.82663V6.80988V6.79319V6.77658V6.76002V6.74354V6.72711V6.71076V6.69448V6.67826V6.6621V6.64602V6.63C1 5.23693 1.38964 4.33841 1.88525 3.7826C2.37985 3.22792 2.97582 3.0195 3.37974 3.00008L3.3814 3ZM13.0915 18.8455C12.9119 18.714 12.7401 18.5725 12.577 18.4216L11.0625 18.5947C11.0247 18.599 10.9884 18.5978 10.954 18.5918L10.3268 18.6635C9.96282 18.7051 9.70984 18.3103 9.89974 17.9969L10.7243 16.6364H2.18429V16.4981H10.8081L11.0461 16.1055C10.8358 15.5152 10.7183 14.8809 10.7112 14.2203H2.18429V14.0819H10.7113C10.7215 13.2719 10.8975 12.5018 11.207 11.8041H2.18429V11.6658H11.2705C11.6921 10.779 12.3319 10.0161 13.1204 9.44626V6.29618C13.1204 6.18091 13.1183 6.05775 13.1162 5.92928C13.1072 5.38462 13.0967 4.74458 13.2326 4.20671C13.3172 3.87228 13.4599 3.5694 13.7008 3.35011C13.7939 3.26537 13.9005 3.19405 14.0225 3.13836H14.0123H13.9974H13.9824H13.9673H13.9522H13.9369H13.9215H13.906H13.8904H13.8748H13.859H13.8431H13.8272H13.8111H13.795H13.7787H13.7624H13.746H13.7295H13.7128H13.6961H13.6793H13.6624H13.6455H13.6284H13.6112H13.594H13.5766H13.5592H13.5417H13.5241H13.5064H13.4886H13.4708H13.4528H13.4348H13.4166H13.3984H13.3801H13.3617H13.3433H13.3247H13.3061H13.2874H13.2686H13.2497H13.2308H13.2117H13.1926H13.1734H13.1541H13.1347H13.1153H13.0958H13.0762H13.0565H13.0367H13.0169H12.997H12.977H12.957H12.9368H12.9166H12.8963H12.876H12.8555H12.835H12.8144H12.7938H12.7731H12.7523H12.7314H12.7105H12.6894H12.6684H12.6472H12.626H12.6047H12.5833H12.5619H12.5404H12.5189H12.4972H12.4755H12.4538H12.4319H12.41H12.3881H12.3661H12.344H12.3218H12.2996H12.2773H12.255H12.2326H12.2101H12.1876H12.165H12.1423H12.1196H12.0969H12.074H12.0512H12.0282H12.0052H11.9821H11.959H11.9358H11.9126H11.8893H11.866H11.8426H11.8191H11.7956H11.7721H11.7484H11.7248H11.701H11.6773H11.6534H11.6296H11.6056H11.5816H11.5576H11.5335H11.5094H11.4852H11.461H11.4367H11.4124H11.388H11.3636H11.3391H11.3146H11.29H11.2654H11.2408H11.2161H11.1913H11.1665H11.1417H11.1168H11.0919H11.067H11.042H11.0169H10.9918H10.9667H10.9415H10.9163H10.8911H10.8658H10.8405H10.8151H10.7897H10.7643H10.7388H10.7133H10.6877H10.6622H10.6365H10.6109H10.5852H10.5595H10.5337H10.5079H10.4821H10.4562H10.4304H10.4044H10.3785H10.3525H10.3265H10.3004H10.2744H10.2483H10.2221H10.196H10.1698H10.1436H10.1173H10.091H10.0647H10.0384H10.0121H9.98569H9.95928H9.93286H9.9064H9.87993H9.85343H9.82691H9.80036H9.7738H9.74721H9.7206H9.69397H9.66731H9.64064H9.61395H9.58724H9.56051H9.53376H9.50699H9.48021H9.45341H9.42659H9.39975H9.3729H9.34603H9.31915H9.29225H9.26533H9.23841H9.21147H9.18451H9.15754H9.13056H9.10357H9.07657H9.04955H9.02253H8.99549H8.96844H8.94139H8.91432H8.88725H8.86016H8.83307H8.80597H8.77887H8.75175H8.72463H8.69751H8.67037H8.64324H8.6161H8.58895H8.5618H8.53464H8.50749H8.48033H8.45316H8.426H8.39883H8.37166H8.3445H8.31733H8.29016H8.26299H8.23582H8.20865H8.18149H8.15432H8.12716H8.10001H8.07285H8.0457H8.01855H7.99141H7.96427H7.93714H7.91001H7.88289H7.85577H7.82867H7.80156H7.77447H7.74739H7.72031H7.69324H7.66618H7.63913H7.61209H7.58507H7.55805H7.53104H7.50405H7.47706H7.45009H7.42314H7.39619H7.36926H7.34235H7.31544H7.28856H7.26169H7.23483H7.20799H7.18117H7.15436H7.12757H7.1008H7.07405H7.04731H7.0206H6.9939H6.96722H6.94057H6.91393H6.88732H6.86072H6.83415H6.8076H6.78107H6.75457H6.72809H6.70163H6.6752H6.64879H6.62241H6.59605H6.56972H6.54341H6.51713H6.49088H6.46466H6.43846H6.41229H6.38615H6.36004H6.33396H6.30791H6.28188H6.25589H6.22993H6.20401H6.17811H6.15224H6.12641H6.10062H6.07485H6.04912H6.02342H5.99776H5.97213H5.94654H5.92099H5.89547H5.86998H5.84454H5.81913H5.79376H5.76843H5.74314H5.71788H5.69267H5.66749H5.64236H5.61727H5.59221H5.5672H5.54223H5.51731H5.49242H5.46758H5.44279H5.41803H5.39333H5.36866H5.34404H5.31947H5.29494H5.27046H5.24603H5.22164H5.19731H5.17301H5.14877H5.12458H5.10043H5.07634H5.0523H5.0283H5.00436H4.98047H4.95663H4.93284H4.9091H4.88542H4.86179H4.83821H4.81469H4.79122H4.76781H4.74445H4.72115H4.69791H4.67472H4.65158H4.62851H4.60549H4.58253H4.55963H4.53679H4.51401H4.49129H4.46862H4.44602H4.42348H4.401H4.37858H4.35623H4.33393H4.3117H4.28954H4.26743H4.2454H4.22342H4.20151H4.17967H4.15789H4.13618H4.11453H4.09296H4.07144H4.05H4.02863H4.00732H3.98608H3.96492H3.94382H3.92279H3.90183H3.88095H3.86013H3.83939H3.81872H3.79812H3.7776H3.75714H3.73677H3.71646H3.69624H3.67608H3.656H3.636H3.61608H3.59623H3.57646H3.55676H3.53714H3.51761H3.49815H3.47877H3.45947H3.44024H3.4211H3.40204H3.38475C3.01735 3.15652 2.45735 3.3489 1.98852 3.87468C1.52002 4.40009 1.13836 5.26344 1.13836 6.63V6.64602V6.6621V6.67826V6.69448V6.71076V6.72711V6.74354V6.76002V6.77658V6.79319V6.80988V6.82663V6.84345V6.86033V6.87728V6.89429V6.91136V6.9285V6.94571V6.96298V6.98031V6.99771V7.01516V7.03269V7.05027V7.06792V7.08563V7.1034V7.12123V7.13913V7.15709V7.17511V7.19318V7.21132V7.22952V7.24779V7.26611V7.28449V7.30293V7.32143V7.33999V7.35861V7.37728V7.39602V7.41481V7.43366V7.45257V7.47154V7.49057V7.50965V7.52879V7.54798V7.56724V7.58654V7.60591V7.62533V7.64481V7.66434V7.68392V7.70357V7.72326V7.74301V7.76282V7.78268V7.80259V7.82256V7.84258V7.86265V7.88278V7.90296V7.92319V7.94348V7.96381V7.9842V8.00464V8.02513V8.04567V8.06627V8.08691V8.1076V8.12835V8.14914V8.16999V8.19088V8.21182V8.23282V8.25386V8.27495V8.29609V8.31727V8.33851V8.35979V8.38112V8.4025V8.42392V8.44539V8.46691V8.48848V8.51009V8.53175V8.55345V8.5752V8.59699V8.61883V8.64071V8.66264V8.68461V8.70663V8.72869V8.7508V8.77295V8.79514V8.81737V8.83965V8.86197V8.88433V8.90674V8.92918V8.95167V8.9742V8.99678V9.01939V9.04204V9.06474V9.08747V9.11025V9.13306V9.15592V9.17881V9.20174V9.22472V9.24773V9.27078V9.29386V9.31699V9.34016V9.36336V9.3866V9.40987V9.43319V9.45654V9.47993V9.50335V9.52681V9.55031V9.57384V9.59741V9.62101V9.64465V9.66832V9.69203V9.71577V9.73954V9.76335V9.7872V9.81107V9.83498V9.85892V9.8829V9.90691V9.93095V9.95502V9.97913V10.0033V10.0274V10.0516V10.0759V10.1001V10.1244V10.1487V10.1731V10.1975V10.2219V10.2463V10.2708V10.2953V10.3198V10.3444V10.369V10.3936V10.4182V10.4429V10.4676V10.4923V10.5171V10.5418V10.5666V10.5915V10.6163V10.6412V10.6661V10.691V10.716V10.741V10.766V10.791V10.8161V10.8412V10.8663V10.8914V10.9165V10.9417V10.9669V10.9921V11.0174V11.0426V11.0679V11.0932V11.1186V11.1439V11.1693V11.1947V11.2201V11.2455V11.271V11.2965V11.322V11.3475V11.373V11.3986V11.4241V11.4497V11.4753V11.501V11.5266V11.5523V11.578V11.6037V11.6294V11.6551V11.6809V11.7066V11.7324V11.7582V11.784V11.8099V11.8357V11.8616V11.8874V11.9133V11.9392V11.9651V11.9911V12.017V12.043V12.069V12.0949V12.1209V12.147V12.173V12.199V12.2251V12.2511V12.2772V12.3033V12.3294V12.3555V12.3816V12.4077V12.4339V12.46V12.4862V12.5123V12.5385V12.5647V12.5909V12.6171V12.6433V12.6695V12.6957V12.722V12.7482V12.7745V12.8007V12.827V12.8533V12.8795V12.9058V12.9321V12.9584V12.9847V13.011V13.0373V13.0636V13.0899V13.1163V13.1426V13.1689V13.1953V13.2216V13.2479V13.2743V13.3006V13.327V13.3533V13.3797V13.406V13.4324V13.4588V13.4851V13.5115V13.5378V13.5642V13.5906V13.6169V13.6433V13.6697V13.696V13.7224V13.7488V13.7751V13.8015V13.8278V13.8542V13.8805V13.9069V13.9332V13.9596V13.9859V14.0123V14.0386V14.0649V14.0913V14.1176V14.1439V14.1702V14.1965V14.2228V14.2491V14.2754V14.3017V14.328V14.3543V14.3805V14.4068V14.4331V14.4593V14.4856V14.5118V14.538V14.5642V14.5905V14.6167V14.6429V14.669V14.6952V14.7214V14.7475V14.7737V14.7998V14.826V14.8521V14.8782V14.9043V14.9304V14.9564V14.9825V15.0085V15.0346V15.0606V15.0866V15.1126V15.1386V15.1646V15.1906V15.2165V15.2424V15.2684V15.2943V15.3202V15.346V15.3719V15.3977V15.4236V15.4494V15.4752V15.501V15.5268V15.5525V15.5782V15.604V15.6297V15.6553V15.681V15.7067V15.7323V15.7579V15.7835V15.8091V15.8346V15.8602V15.8857V15.9112V15.9367V15.9621V15.9876V16.013V16.0384V16.0638V16.0891V16.1145V16.1398V16.1651V16.1903V16.2156V16.2408V16.266V16.2912V16.3163V16.3415V16.3666V16.3917V16.4167V16.4418V16.4668V16.4918V16.5167V16.5417V16.5666V16.5915V16.6163V16.6412V16.666V16.6907V16.7155V16.7402V16.7649V16.7896V16.8142V16.8389V16.8635V16.888V16.9125V16.937V16.9615V16.986V17.0104V17.0348V17.0591V17.0835V17.1078V17.132V17.1563V17.1805V17.2046V17.2288V17.2529V17.277V17.301V17.325V17.349V17.373V17.3969V17.4208V17.4446V17.4684V17.4922V17.5159V17.5397V17.5633V17.587V17.6106V17.6342V17.6577V17.6812V17.7047V17.7281V17.7515V17.7749V17.7982V17.8215V17.8447V17.8679V17.8911V17.9142V17.9373V17.9604V17.9834V18.0064V18.0293V18.0522V18.0751V18.0979V18.1207V18.1434V18.1661V18.1888V18.2114V18.234V18.2565V18.279V18.3015V18.3239V18.3462V18.3686V18.3909V18.4131V18.4353V18.4575V18.4796V18.5016V18.5237V18.5456V18.5676V18.5895V18.6113V18.6331V18.6549V18.6766V18.6983V18.7199V18.7414C1.13836 18.803 1.16569 18.8603 1.2137 18.9L2.95704 20.3405C3.03377 20.4039 3.14471 20.4039 3.22143 20.3405L4.88897 18.9627C5.01685 18.857 5.20174 18.857 5.32962 18.9627L6.99716 20.3405C7.07389 20.4039 7.18482 20.4039 7.26155 20.3405L8.92909 18.9627C9.05697 18.857 9.24186 18.857 9.36974 18.9627L11.0373 20.3405C11.114 20.4039 11.2249 20.4039 11.3017 20.3405L13.045 18.9C13.0638 18.8845 13.0794 18.866 13.0915 18.8455ZM6.27308 6.7862H2.18429V6.64785H6.27308V6.7862ZM2.18429 9.38799H6.27308V9.24963H2.18429V9.38799ZM9.31747 6.9836C9.31747 7.3338 9.03358 7.6177 8.68337 7.6177C8.33317 7.6177 8.04927 7.3338 8.04927 6.9836C8.04927 6.6334 8.33317 6.3495 8.68337 6.3495C9.03358 6.3495 9.31747 6.6334 9.31747 6.9836ZM9.45583 6.9836C9.45583 7.41022 9.10999 7.75606 8.68337 7.75606C8.25676 7.75606 7.91092 7.41022 7.91092 6.9836C7.91092 6.55699 8.25676 6.21114 8.68337 6.21114C9.10999 6.21114 9.45583 6.55699 9.45583 6.9836ZM11.3038 8.9698C11.3038 9.32 11.0199 9.6039 10.6697 9.6039C10.3195 9.6039 10.0356 9.32 10.0356 8.9698C10.0356 8.61959 10.3195 8.3357 10.6697 8.3357C11.0199 8.3357 11.3038 8.61959 11.3038 8.9698ZM11.4422 8.9698C11.4422 9.39641 11.0963 9.74226 10.6697 9.74226C10.2431 9.74226 9.89725 9.39641 9.89725 8.9698C9.89725 8.54318 10.2431 8.19734 10.6697 8.19734C11.0963 8.19734 11.4422 8.54318 11.4422 8.9698ZM8.13163 9.74238L10.7801 6.21114L10.8907 6.29416L8.24232 9.82539L8.13163 9.74238ZM10.8492 14.1564C10.8492 11.0254 13.3873 8.48731 16.5183 8.48731C19.6492 8.48731 22.1874 11.0254 22.1874 14.1564C22.1874 17.2873 19.6492 19.8254 16.5183 19.8254C15.0149 19.8254 13.6483 19.2403 12.6336 18.2853L12.6102 18.2632L10.3111 18.526C10.0613 18.5545 9.88775 18.2836 10.0181 18.0686L11.1986 16.1207L11.1873 16.0896C10.9686 15.4863 10.8492 14.8354 10.8492 14.1564ZM16.5152 10.0622C16.5534 10.0622 16.5844 10.0932 16.5844 10.1314V11.0137C17.2135 11.0286 17.7298 11.5076 17.9886 11.8846C18.0103 11.9161 18.0023 11.9591 17.9708 11.9808C17.9393 12.0024 17.8962 11.9944 17.8746 11.9629C17.6158 11.586 17.108 11.1331 16.5175 11.1523C16.1362 11.1647 15.7033 11.3741 15.2646 11.9632C15.0613 12.2785 15.0019 12.8188 15.1955 13.2922C15.3868 13.7599 15.826 14.1637 16.6279 14.2071C16.6296 14.2072 16.6313 14.2074 16.633 14.2076C16.9331 14.2462 17.3718 14.3845 17.715 14.6773C18.0617 14.973 18.3087 15.4252 18.218 16.0781C18.095 16.9636 17.4046 17.4384 16.6933 17.4848V18.309C16.6933 18.3472 16.6624 18.3782 16.6242 18.3782C16.586 18.3782 16.555 18.3472 16.555 18.309V17.4884C15.9959 17.4812 15.4379 17.21 15.1466 16.6611C15.1287 16.6273 15.1416 16.5854 15.1753 16.5675C15.2091 16.5496 15.251 16.5625 15.2689 16.5962C15.5438 17.1144 16.0833 17.3642 16.6223 17.3496C17.3009 17.3311 17.9649 16.8944 18.081 16.059C18.1646 15.4573 17.9395 15.0506 17.6252 14.7825C17.3084 14.5123 16.8987 14.3817 16.6178 14.3451C15.7652 14.2982 15.2791 13.8622 15.0675 13.3446C14.8583 12.8331 14.9181 12.2432 15.1497 11.8861C15.1505 11.8849 15.1514 11.8836 15.1522 11.8825C15.5851 11.3005 16.0293 11.0538 16.446 11.018V10.1314C16.446 10.0932 16.477 10.0622 16.5152 10.0622Z'
                    />
                    <path
                      className='fill-primary'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M14.7295 3.34778C15.1086 3.34778 15.5659 3.56461 15.7517 3.71949C14.4879 3.42212 14.0481 4.02924 13.9861 4.36998V8.92951C13.8269 9.00792 13.6719 9.08813 13.5215 9.18044V4.55583C13.5215 3.99827 14.079 3.34778 14.7295 3.34778ZM16.7739 4.37006V7.2508C16.9288 7.2508 17.2386 7.17646 17.2386 6.87909C17.2386 6.50739 17.1456 4.92762 16.7739 4.37006Z'
                    />
                  </svg>
                </Box>
              </Grid>
              <Grid
                item
                className={value == 'detail3' ? 'selected' : ''}
                onMouseOver={() => setValue('detail3')}
                md={isMobile ? 12 : value == 'detail3' ? 8 : 2}
                xs={12}
                id='detail3'
              >
                <Box
                  className={'boxDetail'}
                  sx={{
                    background: 'var(--color-box)',
                    boxSizing: 'content-box',
                  }}
                  padding={3}
                  height={400}
                  display={'flex'}
                  flexDirection={'column'}
                  justifyContent={'space-between'}
                >
                  <Box padding={2}>
                    <Typography
                      component='h4'
                      variant={'h3'}
                      paddingTop={3}
                      aria-label='High Throughput'
                      id='labelHighThroughput'
                    >
                      <Trans i18nKey={'labelHighThroughput'} ns={['landPage']}>
                        High Throughput
                      </Trans>
                    </Typography>
                    <Typography
                      component='p'
                      variant={'h5'}
                      color={'textSecondary'}
                      marginTop={3}
                      id='labelHighThroughputDes'
                      aria-label='Loopring L2 can settle ~2000 transactions per second with near instant finality.'
                    >
                      <Trans i18nKey={'labelHighThroughputDes'} ns={['landPage']}>
                        Loopring L2 can settle ~2000 transactions per second with near instant
                        finality.
                      </Trans>
                    </Typography>
                  </Box>
                  <svg width='180' height='180' viewBox='0 0 24 24'>
                    <path
                      className='fill-light'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M7.06652 1.00081L7.06635 1.00081C6.42437 1.00145 5.82628 1.14826 5.38367 1.4872C4.93538 1.83049 4.66338 2.35824 4.65685 3.08017L4.80272 3.08149L4.65685 3.08017C4.64397 4.50452 4.64107 5.92988 4.64814 7.35624C4.65126 8.03303 4.79122 8.64339 5.14123 9.08753C5.49626 9.53802 6.0491 9.79476 6.82507 9.79671H6.82513C7.87684 9.79888 8.58276 9.8002 8.94284 9.80068L10.4694 11.8159L10.4695 11.8161C10.5138 11.8748 10.5715 11.922 10.6379 11.9537C10.7043 11.9854 10.7774 12.0006 10.851 11.9982C10.9246 11.9958 10.9965 11.9758 11.0608 11.9399C11.1251 11.904 11.1799 11.8533 11.2207 11.792L11.2208 11.7918L12.5421 9.79476C12.7159 9.79496 12.8942 9.80107 13.0799 9.80744C13.2203 9.81225 13.365 9.81721 13.5151 9.81987C13.8583 9.82595 14.214 9.81918 14.5535 9.76534C15.2376 9.65687 15.8701 9.35339 16.2073 8.57464L16.0734 8.51668L16.2073 8.57463C16.3331 8.28399 16.3898 7.83534 16.3909 7.24729C16.3938 5.97625 16.3958 4.7047 16.3966 3.43263C16.3973 2.93359 16.3372 2.47143 16.1501 2.08129C15.9604 1.68584 15.645 1.3747 15.1576 1.17301L15.1574 1.17294C14.8667 1.05308 14.4094 0.999775 13.8044 1C11.5582 1.00079 9.31223 1.00106 7.06652 1.00081ZM16.0734 8.51668C15.5415 9.74531 14.2257 9.70049 13.0898 9.66179C12.8984 9.65528 12.7122 9.64893 12.5357 9.64888C12.5138 9.6486 12.4922 9.65379 12.4729 9.66395C12.4536 9.67412 12.4372 9.68893 12.4252 9.70704L11.0992 11.7113C11.0713 11.7532 11.0338 11.788 10.9897 11.8125C10.9457 11.8371 10.8965 11.8508 10.8462 11.8524C10.7959 11.8541 10.746 11.8436 10.7007 11.822C10.6554 11.8004 10.6161 11.7682 10.5859 11.7282L9.05345 9.7051C9.02818 9.67168 8.99495 9.65491 8.95375 9.65481C8.59713 9.65435 7.88769 9.65302 6.82543 9.65083C5.34226 9.64711 4.80008 8.67673 4.79402 7.35552C4.78695 5.92983 4.78985 4.50515 4.80272 3.08149C4.81507 1.71739 5.82148 1.14794 7.0665 1.14668C9.31224 1.14694 11.5582 1.14667 13.8045 1.14588C14.407 1.14565 14.8394 1.19963 15.1018 1.30781C16.0131 1.68488 16.2522 2.45337 16.2508 3.43253C16.2499 4.70454 16.248 5.97604 16.245 7.24702C16.2439 7.83171 16.1867 8.25493 16.0734 8.51668ZM12.5469 9.78753L12.5356 9.7801L12.5469 9.78752L12.5469 9.78753ZM13.2196 4.00001H14.1036V8.4112H13.2196V4.00001ZM13.0737 3.85413H13.2196H14.1036H14.2495V4.00001V8.4112V8.55708H14.1036H13.2196H13.0737V8.4112V4.00001V3.85413ZM11.9481 5.17585H11.0641V8.4113H11.9481V5.17585ZM11.0641 5.02997H10.9183V5.17585V8.4113V8.55718H11.0641H11.9481H12.094V8.4113V5.17585V5.02997H11.9481H11.0641ZM8.71267 5.95967H9.79261V8.4113H8.71267V5.95967ZM8.56679 5.81379H8.71267H9.79261H9.93849V5.95967V8.4113V8.55718H9.79261H8.71267H8.56679V8.4113V5.95967V5.81379ZM6.55716 6.54747H7.44114V8.41123H6.55716V6.54747ZM6.41128 6.40159H6.55716H7.44114H7.58701V6.54747V8.41123V8.55711H7.44114H6.55716H6.41128V8.41123V6.54747V6.40159ZM14.8574 22.8541C17.8315 22.8541 20.2426 20.4431 20.2426 17.4689C20.2426 14.4948 17.8315 12.0837 14.8574 12.0837C11.8832 12.0837 9.47219 14.4948 9.47219 17.4689C9.47219 20.4431 11.8832 22.8541 14.8574 22.8541ZM14.8574 23C17.9121 23 20.3885 20.5237 20.3885 17.4689C20.3885 14.4142 17.9121 11.9378 14.8574 11.9378C12.6531 11.9378 10.75 13.2273 9.86116 15.093H4.29176C4.13062 15.093 4 15.2237 4 15.3848V17.0027C4 17.1638 4.13062 17.2945 4.29176 17.2945H5.71601C5.71352 17.3098 5.71222 17.3256 5.71222 17.3416V18.7149C5.71222 18.731 5.71352 18.7468 5.71604 18.7622H4.29176C4.13062 18.7622 4 18.8929 4 19.054V20.6719C4 20.7351 4.02009 20.7936 4.05422 20.8413C4.02009 20.8891 4 20.9476 4 21.0108V22.6287C4 22.7898 4.13062 22.9205 4.29176 22.9205H13.9175L13.9173 22.9204C14.2228 22.9727 14.5369 23 14.8574 23ZM4.29176 15.2389H9.79425C9.53415 15.8286 9.37404 16.4723 9.33543 17.1486H4.29176C4.21119 17.1486 4.14588 17.0833 4.14588 17.0027V15.3848C4.14588 15.3042 4.21119 15.2389 4.29176 15.2389ZM5.86588 17.2945H9.32901C9.32721 17.3524 9.32631 17.4106 9.32631 17.4689C9.32631 17.9497 9.38764 18.4161 9.50291 18.8608H6.00398C5.92341 18.8608 5.8581 18.7955 5.8581 18.7149V17.3416C5.8581 17.3251 5.86084 17.3093 5.86588 17.2945ZM6.00398 19.0067H9.54288C9.73451 19.6701 10.047 20.2823 10.455 20.8178H4.29176C4.21119 20.8178 4.14588 20.7525 4.14588 20.6719V19.054C4.14588 18.9734 4.21119 18.9081 4.29176 18.9081H5.78534C5.8388 18.9686 5.91693 19.0067 6.00398 19.0067ZM4.29176 20.9637H10.57C11.2648 21.815 12.2081 22.4555 13.2893 22.7746H4.29176C4.21119 22.7746 4.14588 22.7093 4.14588 22.6287V21.0108C4.14588 20.9833 4.1535 20.9575 4.16674 20.9356C4.20463 20.9536 4.24702 20.9637 4.29176 20.9637ZM19.1721 17.4688C19.1721 19.8518 17.2403 21.7835 14.8574 21.7835C12.4745 21.7835 10.5427 19.8518 10.5427 17.4688C10.5427 15.0859 12.4745 13.1542 14.8574 13.1542C17.2403 13.1542 19.1721 15.0859 19.1721 17.4688ZM19.3179 17.4688C19.3179 19.9323 17.3209 21.9294 14.8574 21.9294C12.3939 21.9294 10.3969 19.9323 10.3969 17.4688C10.3969 15.0053 12.3939 13.0083 14.8574 13.0083C17.3209 13.0083 19.3179 15.0053 19.3179 17.4688ZM14.4603 19.7562V14.993L12.4674 18.1635L14.4603 19.7562ZM18.4429 17.3066H15.9217L16.4576 18.1596L14.5063 19.7221L18.4429 17.3217V17.3066Z'
                    />
                    <path
                      className='fill-primary'
                      fillRule='evenodd'
                      clipRule='evenodd'
                      d='M15.86 1.24893C16.3642 1.75662 16.6167 2.29228 16.6176 2.85592C16.6205 4.29631 16.6259 5.73588 16.6336 7.17465C16.6338 7.21696 16.6342 7.25873 16.6345 7.30001C16.6391 7.86132 16.6429 8.331 16.3841 8.82343C15.7369 10.0597 14.5461 10.0355 13.3683 10.0115C13.1458 10.007 12.9237 10.0025 12.7059 10.0065C12.6607 10.0073 12.6271 10.0276 12.6049 10.0675C12.144 10.8794 11.6246 11.6219 11.0465 12.2948C11.1634 12.5095 11.35 12.5742 11.6064 12.4888C11.9503 12.3751 12.5943 11.3236 12.9809 10.6923C13.0729 10.5421 13.1503 10.4158 13.2056 10.3314C13.2167 10.3143 13.2319 10.3003 13.2498 10.2905C13.2677 10.2807 13.2878 10.2754 13.3083 10.2752C13.5177 10.2716 13.7422 10.2777 13.9716 10.284C14.5868 10.3008 15.2369 10.3186 15.7216 10.1505C17.138 9.65737 17.2022 8.58175 17.1976 7.1388C17.1943 5.97781 17.1894 4.81736 17.1829 3.65744C17.1757 2.51263 16.923 1.68692 15.86 1.24893ZM6.44604 10.0279C6.49204 10.1342 6.55481 10.197 6.63437 10.2162C7.39349 10.3989 8.23352 10.4623 9.15446 10.4064L9.02839 10.1985C9.0028 10.1554 8.96756 10.1327 8.92265 10.1306L6.44604 10.0279ZM11.7909 2.6056H11.9242H13.8577H14.0417L13.9076 2.73168C13.5469 3.07079 13.0832 3.39048 12.5645 3.68515C11.5527 4.25986 10.3237 4.74377 9.22022 5.09243C8.11801 5.44067 7.13394 5.65617 6.6121 5.69066L6.60248 5.5451C7.10657 5.51178 8.07729 5.30054 9.17627 4.95333C10.2495 4.61424 11.4384 4.14757 12.4254 3.59608L11.8628 2.71788L11.7909 2.6056Z'
                    />
                  </svg>
                </Box>
              </Grid>
            </Grid>
          </Box>
          <Box component='section'>
            <Box
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <CardBox
                display={'flex'}
                alignItems={'stretch'}
                className={'box5'}
                flexDirection={'row'}
                onClick={() => window.open(LOOPRING_DOC, '_blank')}
              >
                <Box display={'flex'} flexDirection={'column'}>
                  <Box marginBottom={3} aria-label="Ethereum's First zkRollup Layer2">
                    <Typography
                      component='h4'
                      variant={'h2'}
                      aria-label='Ready for Developers'
                      id='labelReadyForDevelopers'
                    >
                      <Trans i18nKey={'labelReadyForDevelopers'} ns={['landPage']}>
                        Ready for Developers
                      </Trans>
                    </Typography>
                    <Typography
                      component='p'
                      variant={'h5'}
                      color={'textSecondary'}
                      aria-label="Build scalable payment apps, non-custodial exchanges, and NFT marketplaces on Ethereum with Loopring's battle-tested zkRollup technology. Get started with quick-start guides, protocol documentation, a Javascript SDK, and a fully open source codebase."
                      id='labelReadyForDevelopersDes'
                    >
                      <Trans i18nKey={'labelReadyForDevelopersDes'} ns={['landPage']}>
                        Build scalable payment apps, non-custodial exchanges, and NFT marketplaces
                        on Ethereum with Loopring's battle-tested zkRollup technology. Get started
                        with quick-start guides, protocol documentation, a Javascript SDK, and a
                        fully open source codebase.
                      </Trans>
                    </Typography>
                  </Box>
                  <Button
                    rel='noopener'
                    title={LOOPRING_DOC}
                    endIcon={<GoIcon color='inherit' />}
                    onClick={() => window.open(LOOPRING_DOC, '_blank')}
                  >
                    <span aria-label={LOOPRING_DOC} id='labelLearnMore3'>
                      Learn More
                    </span>
                  </Button>
                </Box>
              </CardBox>
            </Box>
          </Box>
        </Container>
      </ContainerStyle>
      <BgStyle id='bgContent'></BgStyle>
    </>
  )
})
