import { Box, Button, Container, Grid, Typography } from '@mui/material';
import React from 'react';
import styled from '@emotion/styled/';
import { DropDownIcon, ThemeType } from '@loopring-web/common-resources';
import { withTranslation } from 'react-i18next';
import { css, useTheme } from '@emotion/react';


const HeightConfig = {
    headerHeight: 64,
    whiteHeight: 32,
    maxHeight: 836,
    minHeight: 800,
}
const CardBox =  styled(Box)`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-end;
 .card{
   display: flex;
   flex-direction: column;
   align-items: center;
   box-shadow:var(--box-card-shadow);
 } 
` as typeof Box

const ContainerStyle = styled(Box)`
  .MuiContainer-root{
    min-width: 1200px;
  }

  ${({theme}) => {
    let result = `
       --img-banner-url: url("./static/images/landPage/img_home_banner_${theme.mode}@2x.png");
      `
    if (theme.mode === ThemeType.dark) {
        result += `
            --main-page-bg: #04092E;
            --color-primary: #4169FF;
            --layer-2:#1F2034;
            --box-card-decorate:rgba(255, 255, 255, 0.1);
            --box-card-background:#2D2F4B;
            --box-card-shadow: 0px 10px 20px rgba(0, 0, 0, 0.15); 
            --text-secondary: #687295;
            --border-card:1px solid #49527D;
            
          `
    } else {
        result += `
            --main-page-bg: #ffffff;
            --color-primary: #3B5AF4;
            --layer-2:#F6F7FB;
            --box-card-decorate:rgba(255, 255, 255, 0);
            --box-card-background:#ffffff;
            --box-card-shadow: 0px 10px 20px rgba(87, 129, 236, 0.1);
            --text-secondary: #A3A8CA;
            --border-card:1px solid #E9EAF2;

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
     background-image: image-set(url("./static/images/landPage/img_home_banner_${theme.mode}@1x.webp") 1x,
      url("./static/images/landPage/img_home_banner_${theme.mode}@1x.png") 1x);
        `
}} //background-image: url("./static/images/landPage/img_home_banner_dark@2x.png");


` as typeof Grid
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


export const LandPage = withTranslation(['landPage', 'common'])(({t}: any) => {
    // const value = {}
    const [size, setSize] = React.useState<[number, number]>([1200, 0]);

    const theme = useTheme()
    React.useLayoutEffect(() => {
        function updateSize() {
            setSize([1200, window.innerHeight - HeightConfig.headerHeight - HeightConfig.whiteHeight]);

        }

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
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
                    {/*        srcSet={`./static/images/landPage/img_home_banner_${theme.mode}@1x.webp 1x,*/}
                    {/*             ./static/images/landPage/img_home_banner_${theme.mode}@2x.webp 2x`}*/}
                    {/*        type="image/webp"/>*/}
                    {/*    <source*/}
                    {/*        srcSet={`./static/images/landPage/img_home_banner_${theme.mode}@1x.png 1x,*/}
                    {/*             ./static/images/landPage/img_home_banner_${theme.mode}@2x.png 2x`}*/}
                    {/*    />*/}
                    {/*    <img srcSet={`./static/images/landPage/img_home_banner_${theme.mode}@1x.png 1x,*/}
                    {/*             ./static/images/landPage/img_home_banner_${theme.mode}@2x.png 2x`}*/}
                    {/*         alt="img-banner"/>*/}
                    {/*</picture>*/}
                    <Box position={'absolute'} left={0} top={'50%'} style={{transform: 'translateY(-50%)'}}>

                        <Typography component={'h2'}
                                    color={'var(--color-primary)'}
                                    style={{
                                        letterSpacing: '0.4em',
                                        textTransform: 'uppercase'
                                    }}>
                            {t('labelProtocol')}
                        </Typography>
                        <Typography component={'h1'} fontSize={80} marginTop={4} whiteSpace={'pre-line'}
                                    lineHeight={'96px'}>
                            {t('labelH1Title')}
                        </Typography>
                        <Typography marginTop={10} width={260}>
                            <Button href={'/trading/lite/LRC-ETH'} fullWidth={true} size={'large'} variant={'contained'}
                                    style={{
                                        height: 64,
                                        justifyContent: 'space-around',
                                        borderRadius: '0', textTransform: 'uppercase'
                                    }}>
                                {t('labelStartTrade')}
                                <i><DropDownIcon style={{transform: 'rotate(-90deg) scale(1.5)'}}/></i>
                            </Button>
                        </Typography>
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
                    <Box position={'absolute'} width={'100%'} height={768} zIndex={33}
                         left={0} top={'50%'} style={{transform: 'translateY(-50%)'}}>
                        <TitleTypography position={'absolute'} component={'h3'} zIndex={44}>
                            {t('labelTitleDEX')}
                        </TitleTypography>
                        <BoxCard width={320} height={320} top={150} zIndex={44}>
                            <Typography whiteSpace={'pre-line'} component={'h4'}
                                        margin={4}>{t('labelTradeVolume')}</Typography>
                            <Typography component={'span'} marginLeft={4}
                                        style={{fontSize: 72, fontWeight: 700}}>$386B</Typography>
                        </BoxCard>
                        <BoxCard width={340} height={340} top={214} left={394} zIndex={44}>
                            <Typography whiteSpace={'pre-line'} component={'h4'}
                                        margin={4}>{t('labelTradeUser')}</Typography>
                            <Typography component={'span'} marginLeft={4}
                                        style={{fontSize: 100, fontWeight: 700}}>$386B</Typography>
                        </BoxCard>
                        <BoxCard width={264} height={264} top={32} left={798} zIndex={44}>
                            <Typography whiteSpace={'pre-line'} component={'h4'}
                                        margin={4}>{t('labelTradeTVL')}</Typography>
                            <Typography component={'span'} marginLeft={4}
                                        style={{fontSize: 64, fontWeight: 700}}>$386B</Typography>
                        </BoxCard>
                        <BoxCard width={400} height={400} top={363} left={798} zIndex={44}>
                            <Typography whiteSpace={'pre-line'} component={'h4'}
                                        margin={4}>{t('labelTradeNofTrades')}</Typography>
                            <Typography component={'span'} marginLeft={4}
                                        style={{fontSize: 140, fontWeight: 700}}>$36B</Typography>
                        </BoxCard>
                    </Box>
                </Grid>
            </Container>
        </Box>
        <Box>
            <Container>
                <Grid item xs={12} minHeight={HeightConfig.minHeight}>
                    <TitleTypography component={'h3'} marginTop={10} marginBottom={6}>
                        {t('labelZeroKpt')}
                    </TitleTypography>
                    <CardBox paddingBottom={13}>








                    </CardBox>


                </Grid>
            </Container>
        </Box>
    </ContainerStyle>
})
