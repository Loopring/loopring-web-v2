import { Box, Container, Grid, Typography, Link } from '@mui/material';
import React from 'react';
import moment from 'moment'
import styled from '@emotion/styled/';
import { ThemeType, SoursURL, SpeakerIcon } from '@loopring-web/common-resources';
import { withTranslation } from 'react-i18next';
import { LoopringAPI } from '../../api_wrapper';


const HeightConfig = {
    headerHeight: 64,
    whiteHeight: 32,
    maxHeight: 836,
    minHeight: 800,
}

const ContainerStyled = styled(Container)`
    padding: 0 !important;
`

const LinkStyle = styled(Link)`
    color: var(--color-button-select);
    text-decoration: underline;
    font-size: 1.6rem;
    line-height: 2.4rem;
` as typeof Link

const CardBox = styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
  // .MuiGrid-grid-xs-12 &{
    //   margin-bottom:${({theme}) => theme.unit * 10}px;
  // }
  // .MuiGrid-grid-md-12 &{
    //   margin-bottom:${({theme}) => theme.unit * 6}px;
  // }
  // .MuiGrid-grid-lg-12 &{
    //   margin-bottom:${({theme}) => theme.unit * 10}px;
  // }
  // .MuiGrid-grid-xl-12 &{
    //   margin-bottom:${({theme}) => theme.unit * 30}px;
  // }
  .card {
    display: flex;
    margin: 0 8px;
    border-radius: 4px;
    flex-direction: column;
    align-items: center;
    position: relative;
    box-shadow: var(--box-card-shadow);
  }
` as typeof Box

const ImgWrapperLeftStyled = styled(Box)`
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
`

const ImgWrapperRightStyled = styled(Box)`
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
`

const ContainerStyle = styled(Box)`
  .MuiContainer-root {
    min-width: 1200px;
  }

  ${({theme}) => {
    let result = `
       --img-banner-url: url("https://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@2x.png");
      `
    if (theme.mode === ThemeType.dark) {
      result += `
            --main-page-bg: #060D42;
            --color-primary: #4169FF;
            --layer-2: #1A32A2;
            --second-bg: #0D1655;
            --box-card-decorate:rgba(255, 255, 255, 0.1);
            --box-card-background:#2D2F4B;
            --box-card-background-hover:#4169FF;
            --box-card-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15); 
            --text-secondary: #687295;
            --border-card:1px solid #49527D;
            --border-card-hover: rgba(255, 255, 255, 0.1);
            --text-highlight:#4169FF;
            --text-third:#ffffff; 
          `
    } else {
      result += `
            --main-page-bg: #ffffff;
            --color-primary: #3B5AF4;
            --layer-2: #4169FF;
            --second-bg: #F6F7FB;
            --box-card-decorate:rgba(255, 255, 255, 0);
            --box-card-background:#ffffff;
            --box-card-background-hover:#3B5AF4;
            --box-card-shadow: 0px 10px 20px rgba(87, 129, 236, 0.1);
            --text-secondary: #A3A8CA;
            --border-card:1px solid #E9EAF2;
            --border-card-hover: rgba(255, 255, 255, 0.1);
             --text-highlight:#4169FF;
             --text-third:#ffffff;


            `
    }
    return result;
  }};
  background: var(--main-page-bg);

  body {
    background: var(--main-page-bg)
  }

`
const GridBg = styled(Grid)`
    background-size: 160%;
    background-repeat: no-repeat;
    background-position: -360px -110px;
    //background-image: var(--img-banner-url);

    ${({theme}) => {
        return `
        background-image: image-set(url("https://static.loopring.io/assets/images/landPage/img_wallet_app_${theme.mode}.webp") 1x,
        url("https://static.loopring.io/assets/images/landPage/img_wallet_app_${theme.mode}.png") 1x);
            `
    }}

` as typeof Grid


const BottomBanner = styled(Box)`
    background: var(--layer-2);

  //background-size: 100%;
//   background-repeat: no-repeat;
//   background-position: 0 100%;
//   background-size: cover;
//   background-image: image-set(url("https://static.loopring.io/assets/images/landPage/img_wallet_bottom@1x.webp") 1x,
//   url("https://static.loopring.io/assets/images/landPage/img_wallet_bottom@1x.png") 1x);
  //mask-image: linear-gradient(rgba(0, 0, 0, 1.0), transparent);
` as typeof Box


const TitleTypography = styled(Typography)`
  text-transform: uppercase;
  font-size: 4rem;
  font-weight: 700;
  white-space: pre-line;
  line-height: 5.6rem;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 6px;
    width: 96px;
    display: block;
    background: var(--color-primary);
  }
` as typeof Typography

const TitleTypographyRight = styled(Typography)`
  text-transform: uppercase;
  font-size: 4rem;
  font-weight: 700;
  white-space: pre-line;
  line-height: 5.6rem;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    height: 6px;
    width: 96px;
    display: block;
    background: var(--color-primary);
  }
` as typeof Typography

// const BoxCard = styled(Box)`
//   position: absolute;
//   border-radius: 4px;
//   display: flex;
//   flex-direction: column;
//   justify-content: space-between;
//   background: var(--box-card-background);
//   box-shadow: var(--box-card-shadow);

//   h4 {
//     text-transform: uppercase;
//     font-size: 30px;
//     font-weight: 500;
//   }

//   :before {
//     content: '';
//     position: absolute;
//     right: 0;
//     top: 0;
//     bottom: 0;
//     width: 10px;
//     display: block;
//     border-start-end-radius: 4px;
//     border-end-end-radius: 4px;

//     background: var(--box-card-decorate);
//   }
// ` as typeof Box


export const WalletPage = withTranslation(['landPage', 'common'])(({t}: any) => {
    // const value = {}
    const [size, setSize] = React.useState<[number, number]>([1200, 0]);

    const [value, setValue] = React.useState<{
        timestamp: string
        tradeVolume: string,
        totalUserNum: string,
        tradeNum: string,
        layerTwoLockedVolume: string
    } | undefined>();

    // const [currentBJTime, setCurrentBJTime] = React.useState(0)
    // const [showTotalUpgradeInfo ,setShowTotalUpgradeInfo] = React.useState(false)
    
    // const afterMaintaince = currentBJTime > maintainceEndTime
    
    React.useLayoutEffect(() => {
        function updateSize() {
            setSize([1200, window.innerHeight - HeightConfig.headerHeight - HeightConfig.whiteHeight]);

        }

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const result = React.useCallback(async () => {
        if (LoopringAPI.exchangeAPI) {
            const {
                timestamp,
                tradeVolume,
                totalUserNum,
                tradeNum,
                layerTwoLockedVolume
            } = await LoopringAPI.exchangeAPI.getProtocolPortrait()
            setValue({
                timestamp,
                tradeVolume,
                totalUserNum,
                tradeNum,
                layerTwoLockedVolume
            })
            // orderbookTradingFees: VipFeeRateInfoMap;
            // ammTradingFees: VipFeeRateInfoMap;
            // otherFees: {
            //     [key: string]: string;
            // };
            // raw_data: any;
            // raw_data.
            //setVipTable(raw_data)
        }

        // setUserFee(userFee)


    }, [])
    React.useEffect(() => {
        result()
    }, [result, LoopringAPI.exchangeAPI])

    return <ContainerStyle>
        {/* {!afterMaintaince && (
            <Box
            width={'100%'} 
            display={'flex'} 
            justifyContent={'center'} 
            lineHeight={'4.4rem'}
            height={showTotalUpgradeInfo ? '23rem' : '4.4rem'}
            style={{ 
                backgroundColor: 'rgba(251, 169, 92, 0.1)',
                cursor: 'pointer',
                whiteSpace: 'pre'
            }}
            onClick={() => setShowTotalUpgradeInfo(prevStatus => !prevStatus)}
        >
            <Typography width={'1200px'} color={'var(--color-warning)'} variant={'h6'} lineHeight={'4.4rem'} height={'4.4rem'}>
                <SpeakerIcon style={{ marginBottom: -5 }} />&nbsp;&nbsp;
                    {showTotalUpgradeInfo ? t('labelUpgradeShow') : t('labelUpgradeHide')}
                    &nbsp;&gt;&gt;
                </Typography>
        </Box>
        )} */}
        
        <Box>
            <ContainerStyled>
                <GridBg item xs={12}
                        maxHeight={HeightConfig.maxHeight}
                        // minHeight={HeightConfig.minHeight}
                        position={'relative'}
                        height={624}>
                    {/*<picture style={{'absolute'}}  >*/}
                    {/*    <source*/}
                    {/*        srcSet={`https://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.webp 1x,*/}
                    {/*             https://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@2x.webp 2x`}*/}
                    {/*        type="image/webp"/>*/}
                    {/*    <source*/}
                    {/*        srcSet={`https://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.png 1x,*/}
                    {/*             https://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@2x.png 2x`}*/}
                    {/*    />*/}
                    {/*    <img srcSet={`https://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.png 1x,*/}
                    {/*             https://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@2x.png 2x`}*/}
                    {/*         alt="img-banner"/>*/}
                    {/*</picture>*/}
                    <Box position={'absolute'} left={0} top={'50%'} style={{transform: 'translateY(-50%)'}}>
                        <Typography component={'h1'} fontSize={64} marginTop={4} whiteSpace={'pre-line'}
                                    lineHeight={'96px'}>
                            {t('labelH1TitleWallet')}
                        </Typography>
                        <Typography component={'h2'} fontSize={38} marginTop={2} whiteSpace={'pre-line'}
                                    lineHeight={'46px'}>
                            {t('labelH2TitleWallet')}
                        </Typography>
                        <Grid container width={'600px'} marginTop={8} marginLeft={-2}>
                            <Grid item xs={4}>
                                <Link href="https://play.google.com/store/apps/details?id=loopring.defi.wallet">
                                    <img style={{ width: '100%' }} src={`${SoursURL}images/landPage/appGooglePlay.webp`} alt={'Android'} />
                                </Link>
                            </Grid>
                            <Grid item xs={4}>
                                <Link href="https://download.loopring.io/LoopringWallet.apk">
                                    <img style={{ width: '100%' }} src={`${SoursURL}images/landPage/appAndroid.webp`} alt={'GooglePlay'} />
                                </Link>
                            </Grid>
                            <Grid item xs={4}>
                                <Link href="https://apps.apple.com/us/app/loopring-smart-wallet/id1550921126">
                                    <img style={{ width: '100%' }} src={`${SoursURL}images/landPage/appAppleStore.webp`} alt={'AppStore'} />
                                </Link>
                            </Grid>
                        </Grid>
                        <Box display={'flex'} alignItems={'center'}>
                            <Typography variant={'h5'} color={'var(--color-text-third)'} marginRight={1.5}>Already have a wallet?</Typography>
                            <LinkStyle href={'https://security.loopring.io'} variant={'body1'}>Manage Security</LinkStyle>
                        </Box>
                        
                    </Box>
                </GridBg>
            </ContainerStyled>
        </Box>
        <Box style={{background: 'var(--layer-2)'}}>
            <ContainerStyled>
                <Grid item xs={12}
                    //   maxHeight={HeightConfig.maxHeight}
                    //   minHeight={HeightConfig.minHeight}
                    position={'relative'}
                    height={624}>
                    <Box position={'absolute'} width={'100%'} height={624} zIndex={33}
                        left={0} top={'50%'} style={{transform: 'translateY(-50%)'}}
                        display={'flex'} justifyContent={'center'} alignItems={'center'}
                        >
                            <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
                                <Typography component={'h1'} fontSize={40} fontWeight={500} marginTop={0} whiteSpace={'pre-line'}
                                        lineHeight={'68px'} color={'var(--text-third)'}>
                                    {t('labelFirstWallet')}
                                </Typography>
                                <Typography component={'h2'} variant={'h5'} fontWeight={400} marginTop={2} textAlign={'center'} whiteSpace={'pre-line'} color={'var(--text-third)'}>
                                    {t('labelFirstWalletDetail')}
                                </Typography>
                            </Box>
                    </Box>
                </Grid>
            </ContainerStyled>
        </Box>
        <Box>
            <ContainerStyled>
                <Grid item xs={12} height={624} position={'relative'}>
                    <Box width={'100%'} height={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                        <TitleTypography component={'h3'} paddingTop={4}>
                            {t('labelWalletSecureH1')}
                        </TitleTypography>
                        <Typography variant={'h3'}>{t('labelWalletSecureH2')}</Typography>
                        <Typography whiteSpace={'pre-line'} variant={'h5'} color={'var(--color-text-secondary)'} marginTop={5}>{t('labelWalletSecureDetail')}</Typography>
                    </Box>
                    <ImgWrapperRightStyled>
                        <img style={{ width: 500 }} src={`${SoursURL}images/landPage/img_wallet_guardians@1x.webp`} alt={'secure'} />
                    </ImgWrapperRightStyled>
                </Grid>
            </ContainerStyled>
        </Box>
        <Box style={{background: 'var(--second-bg)'}}>
            <ContainerStyled>
                <Grid item xs={12}
                    // maxHeight={HeightConfig.maxHeight}
                    // minHeight={HeightConfig.minHeight}
                    position={'relative'}
                    height={624}
                    display={'flex'}
                    justifyContent={'flex-end'}
                >
                    <Box width={'100%'} height={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'flex-end'}>
                        <TitleTypographyRight component={'h3'} paddingTop={4}>
                            {t('labelWalletIdentityH1')}
                        </TitleTypographyRight>
                        <Typography variant={'h3'}>{t('labelWalletIdentityH2')}</Typography>
                        <Typography whiteSpace={'pre-line'} textAlign={'right'} variant={'h5'} color={'var(--color-text-secondary)'} marginTop={5}>{t('labelWalletIdentityDetail')}</Typography>
                    </Box>
                    <ImgWrapperLeftStyled>
                        <img style={{ width: 500 }} src={`${SoursURL}images/landPage/img_wallet_address@1x.webp`} alt={'identity'} />
                    </ImgWrapperLeftStyled>
                </Grid>
            </ContainerStyled>
        </Box>
        <Box style={{background: 'var(--layer-1)'}}>
            <ContainerStyled>
                <Grid item xs={12}
                    // maxHeight={HeightConfig.maxHeight}
                    // minHeight={HeightConfig.minHeight}
                    position={'relative'}
                    height={624}
                    display={'flex'}
                >
                    <Box width={'100%'} height={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                        <TitleTypography component={'h3'} paddingTop={4}>
                            {t('labelWalletUsageH1')}
                        </TitleTypography>
                        <Typography variant={'h3'}>{t('labelWalletUsageH2')}</Typography>
                        <Typography whiteSpace={'pre-line'} variant={'h5'} color={'var(--color-text-secondary)'} marginTop={5}>{t('labelWalletUsageDetail')}</Typography>
                    </Box>
                    <ImgWrapperRightStyled>
                        <img style={{ width: 500 }} src={`${SoursURL}images/landPage/img_wallet_operation@1x.webp`} alt={'performance'} />
                    </ImgWrapperRightStyled>
                </Grid>
            </ContainerStyled>
        </Box>
        <Box style={{background: 'var(--second-bg)'}}>
            <ContainerStyled>
                <Grid item xs={12}
                    // maxHeight={HeightConfig.maxHeight}
                    // minHeight={HeightConfig.minHeight}
                    position={'relative'}
                    height={624}
                    display={'flex'}
                    justifyContent={'flex-end'}
                >
                    <Box width={'100%'} height={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'flex-end'}>
                        <TitleTypographyRight textAlign={'right'} component={'h3'} paddingTop={4}>
                            {t('labelWalletFutureH1')}
                        </TitleTypographyRight>
                        <Typography variant={'h3'}>{t('labelWalletFutureH2')}</Typography>
                        <Typography whiteSpace={'pre-line'} textAlign={'right'} variant={'h5'} color={'var(--color-text-secondary)'} marginTop={5}>{t('labelWalletFutureDetail')}</Typography>
                    </Box>
                    <ImgWrapperLeftStyled>
                        <img style={{ width: 500 }} src={`${SoursURL}images/landPage/img_wallet_income@1x.webp`} alt={'future'} />
                    </ImgWrapperLeftStyled>
                </Grid>
            </ContainerStyled>
        </Box>
        <BottomBanner height={400}>
            <ContainerStyled>
                <Grid item xs={12} height={400} display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
                    <Typography color={'#fff'} fontSize={40} lineHeight={'56px'}>{t('labelWalletUnleashed')}</Typography>
                    <Typography color={'#fff'} variant={'h3'} marginTop={3}>{t('labelWalletUnleashedDetail')}</Typography>
                </Grid>
            </ContainerStyled>
        </BottomBanner>
        {/*<Box>*/}
        {/*    <Container>*/}
        {/*     */}
        {/*    </Container>*/}
        {/*</Box>*/}
    </ContainerStyle>
})
