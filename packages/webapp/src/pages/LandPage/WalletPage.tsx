import { Box, Button, Container, Grid, Typography } from '@mui/material';
import React from 'react';
import styled from '@emotion/styled/';
import { DropDownIcon, getValuePrecisionThousand, myLog, ThemeType } from '@loopring-web/common-resources';
import { withTranslation } from 'react-i18next';
import { Card } from './Card';
import { useHistory } from 'react-router-dom';
import { LoopringAPI } from '../../api_wrapper';


const HeightConfig = {
    headerHeight: 64,
    whiteHeight: 32,
    maxHeight: 836,
    minHeight: 800,
}

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

const ContainerStyle = styled(Box)`
  .MuiContainer-root {
    min-width: 1200px;
  }

  ${({theme}) => {
    let result = `
       --img-banner-url: url("http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@2x.png");
      `
    if (theme.mode === ThemeType.dark) {
      result += `
            --main-page-bg: #04092E;
            --color-primary: #4169FF;
            --layer-2:#1F2034;
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
            --layer-2:#F6F7FB;
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
  background-size: 100%;
  background-repeat: no-repeat;
  background-position: 120px calc(50% - -40px);
  //background-image: var(--img-banner-url);


  ${({theme}) => {
    return `
     background-image: image-set(url("http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.webp") 1x,
      url("http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.png") 1x);
        `
  }} //background-image: url("http://static.loopring.io/assets/images/landPage/img_home_banner_dark@2x.png");

` as typeof Grid


const BottomBanner = styled(Box)`
  //background-size: 100%;
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: cover;
  background-image: image-set(url("http://static.loopring.io/assets/images/landPage/img_home_agreement@1x.webp") 1x,
  url("http://static.loopring.io/assets/images/landPage/img_home_agreement@1x.png") 1x);
  //mask-image: linear-gradient(rgba(0, 0, 0, 1.0), transparent);
` as typeof Box


const TitleTypography = styled(Typography)`
  text-transform: uppercase;
  font-size: 5.6rem;
  font-weight: 700;
  white-space: pre-line;
  line-height: 9.6rem;
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
  font-size: 5.6rem;
  font-weight: 700;
  white-space: pre-line;
  line-height: 9.6rem;
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

const BoxCard = styled(Box)`
  position: absolute;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--box-card-background);
  box-shadow: var(--box-card-shadow);

  h4 {
    text-transform: uppercase;
    font-size: 30px;
    font-weight: 500;
  }

  :before {
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 10px;
    display: block;
    border-start-end-radius: 4px;
    border-end-end-radius: 4px;

    background: var(--box-card-decorate);
  }
` as typeof Box


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
    // const theme = useTheme();
    const history = useHistory()
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
            myLog({ timestamp,
                tradeVolume,
                totalUserNum,
                tradeNum,
                layerTwoLockedVolume })
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
        <Box>
            <Container>
                <GridBg item xs={12}
                        maxHeight={HeightConfig.maxHeight}
                        minHeight={HeightConfig.minHeight}
                        position={'relative'}
                        height={size[ 1 ]}>
                    {/*<picture style={{'absolute'}}  >*/}
                    {/*    <source*/}
                    {/*        srcSet={`http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.webp 1x,*/}
                    {/*             http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@2x.webp 2x`}*/}
                    {/*        type="image/webp"/>*/}
                    {/*    <source*/}
                    {/*        srcSet={`http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.png 1x,*/}
                    {/*             http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@2x.png 2x`}*/}
                    {/*    />*/}
                    {/*    <img srcSet={`http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@1x.png 1x,*/}
                    {/*             http://static.loopring.io/assets/images/landPage/img_home_banner_${theme.mode}@2x.png 2x`}*/}
                    {/*         alt="img-banner"/>*/}
                    {/*</picture>*/}
                    <Box position={'absolute'} left={0} top={'50%'} style={{transform: 'translateY(-50%)'}}>

                        {/* <Typography component={'h2'}
                                    color={'var(--color-primary)'}
                                    style={{
                                        letterSpacing: '0.4em',
                                        textTransform: 'uppercase'
                                    }}>
                            {t('labelProtocol')}
                        </Typography> */}
                        <Typography component={'h1'} fontSize={64} marginTop={4} whiteSpace={'pre-line'}
                                    lineHeight={'96px'}>
                            {t('labelH1TitleWallet')}
                        </Typography>
                        <Typography component={'h2'} fontSize={38} marginTop={2} whiteSpace={'pre-line'}
                                    lineHeight={'46px'}>
                            {t('labelH2TitleWallet')}
                        </Typography>
                        {/* <Typography marginTop={10} width={260}>
                            <Button onClick={() => history.push('/layer2')} fullWidth={true} size={'large'}
                                    variant={'contained'}
                                    style={{
                                        height: 64,
                                        justifyContent: 'space-around',
                                        borderRadius: '0', textTransform: 'uppercase'
                                    }}>
                                {t('labelBtnStart')}
                                <i><DropDownIcon style={{transform: 'rotate(-90deg) scale(1.5)'}}/></i>
                            </Button>
                        </Typography> */}
                    </Box>

                </GridBg>

            </Container>
        </Box>
        <Box style={{background: 'var(--layer-2)'}}>
            <Container>
                <Grid item xs={12}
                      maxHeight={HeightConfig.maxHeight}
                      minHeight={HeightConfig.minHeight}
                      position={'relative'}
                      height={size[ 1 ]}>
                    <Box position={'absolute'} width={'100%'} height={624} zIndex={33}
                        left={0} top={'50%'} style={{transform: 'translateY(-50%)'}}
                        display={'flex'} justifyContent={'center'} alignItems={'center'}
                        >
                            <Box display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'center'}>
                                <Typography component={'h1'} fontSize={56} marginTop={0} whiteSpace={'pre-line'}
                                        lineHeight={'68px'}>
                                    {t('labelFirstWallet')}
                                </Typography>
                                <Typography component={'h2'} variant={'h3'} marginTop={9}>
                                    {t('labelFirstWalletDetail')}
                                </Typography>
                            </Box>
                    </Box>
                </Grid>
            </Container>
        </Box>
        <Box marginBottom={10}>
            <Container>
                <GridBg item xs={12} height={624}>
                    <Box width={'50%'} height={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                        <TitleTypography component={'h3'} paddingTop={4}>
                            SECURE
                        </TitleTypography>
                        <Typography variant={'h3'}>Guardians, locks, and limits</Typography>
                        <Typography variant={'h5'} color={'var(--color-text-secondary)'} marginTop={10}>{t('labelWalletSecureDetail')}</Typography>
                    </Box>
                </GridBg>
            </Container>
        </Box>
        <Box style={{background: 'var(--layer-2)'}}>
            <Container>
                <Grid item xs={12}
                    // maxHeight={HeightConfig.maxHeight}
                    minHeight={HeightConfig.minHeight}
                    position={'relative'}
                    height={624}
                    display={'flex'}
                    justifyContent={'flex-end'}
                >
                    <Box width={'50%'} height={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'flex-end'}>
                        <TitleTypographyRight component={'h3'} paddingTop={4}>
                            {t('labelWalletIdentityH1')}
                        </TitleTypographyRight>
                        <Typography variant={'h3'}>{t('labelWalletIdentityH2')}</Typography>
                        <Typography textAlign={'right'} variant={'h5'} color={'var(--color-text-secondary)'} marginTop={10}>{t('labelWalletIdentityDetail')}</Typography>
                    </Box>
                </Grid>
            </Container>
        </Box>
        <Box style={{background: 'var(--layer-1)'}}>
            <Container>
                <Grid item xs={12}
                    // maxHeight={HeightConfig.maxHeight}
                    minHeight={HeightConfig.minHeight}
                    position={'relative'}
                    height={624}
                    display={'flex'}
                    justifyContent={'flex-end'}
                >
                    <Box width={'50%'} height={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'center'} alignItems={'flex-end'}>
                        <TitleTypographyRight component={'h3'} paddingTop={4}>
                            {t('labelWalletIdentityH1')}
                        </TitleTypographyRight>
                        <Typography variant={'h3'}>{t('labelWalletIdentityH2')}</Typography>
                        <Typography textAlign={'right'} variant={'h5'} color={'var(--color-text-secondary)'} marginTop={10}>{t('labelWalletIdentityDetail')}</Typography>
                    </Box>
                </Grid>
            </Container>
        </Box>
        <BottomBanner height={400}>
            <Container>
                <Grid item xs={12} position={'relative'} height={400}>
                    <Box position={'absolute'} left={0} top={'50%'} style={{transform: 'translateY(-50%)'}}>
                        <Typography
                            color={'var(--text-highlight)'}
                            component={'h4'}
                            marginTop={4} whiteSpace={'pre-line'}
                            variant={'h3'}>
                            {t('labelSuperpowers')}
                        </Typography>

                        <Typography marginTop={3} width={480} color={'var(--text-third)'}>
                            {t('describeSuperpowers')}
                        </Typography>
                        <Typography marginTop={8} width={350}>
                            <Button onClick={() => window.open('https://docs.loopring.io/en/')} fullWidth={true} size={'large'}
                                    variant={'contained'}
                                    style={{
                                        height: 64,
                                        justifyContent: 'space-around',
                                        borderRadius: '0', textTransform: 'uppercase'
                                    }}>
                                {t('labelBtnDeveloper')}
                                <i><DropDownIcon style={{transform: 'rotate(-90deg) scale(1.5)'}}/></i>
                            </Button>
                        </Typography>

                    </Box>

                </Grid>
            </Container>
        </BottomBanner>
        {/*<Box>*/}
        {/*    <Container>*/}
        {/*     */}
        {/*    </Container>*/}
        {/*</Box>*/}
    </ContainerStyle>
})
