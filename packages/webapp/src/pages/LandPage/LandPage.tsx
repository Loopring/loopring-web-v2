import { Box, Button, Container, Grid, Typography } from '@material-ui/core';
import React from 'react';
import styled from '@emotion/styled/';
import { DropDownIcon, ThemeType } from '@loopring-web/common-resources';
import { withTranslation } from 'react-i18next';
import { useSpring, animated,to } from "react-spring";
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
      url("./static/images/landPage/img_home_banner_${theme.mode}@2x.webp") 2x,
      url("./static/images/landPage/img_home_banner_${theme.mode}@1x.png") 1x,
      url("./static/images/landPage/img_home_banner_${theme.mode}@2x.png") 2x);
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
    const [{ x, y, rotateX, rotateY, rotateZ, zoom, scale,height,width,background,border }, api] = useSpring(
        () => ({
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1,
            zoom: 0,
            border: 'var(--border-card)',
            height:640,
            width:400,
            background:'var(--box-card-background)',
            x: 0,
            y: 0,
            config: { mass: 5, tension: 350, friction: 40 },
        })
    )

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
                <Grid item xs={12}
                      // maxHeight={HeightConfig.maxHeight}
                      minHeight={HeightConfig.minHeight}
                      // position={'relative'}
                >
                    <TitleTypography component={'h3'} marginTop={10} marginBottom={6}>
                        {t('labelZeroKpt')}
                    </TitleTypography>
                    <CardBox paddingBottom={13}>

                        <animated.div
                            // onMouseEnter={() => }
                            className={'card'}
                            onMouseLeave={() =>api({ rotateX: 0, rotateY: 0, scale: 1,background:'var(--color-primary)' })}
                            style={{
                                transform: 'perspective(600px)',
                                height,
                                width,
                                x,
                                y,
                                background,
                                scale: to([scale, zoom], (s, z) => s + z),
                                rotateX,
                                rotateY,
                                rotateZ,
                            }}>
                            <animated.svg width="83" height="121" viewBox="0 0 83 121" fill="none" style={{  }}>
                                    <path d="M12.552 38.7206C12.552 37.5237 13.5223 36.5534 14.7192 36.5534H68.7416C69.9385 36.5534 70.9088 37.5237 70.9088 38.7206C70.9088 39.9175 69.9385 40.8878 68.7416 40.8878H14.7192C13.5223 40.8878 12.552 39.9175 12.552 38.7206Z" fill="#15162B"/>
                                    <path d="M12.552 53.2707C12.552 52.0738 13.5223 51.1035 14.7192 51.1035H68.7416C69.9385 51.1035 70.9088 52.0738 70.9088 53.2707C70.9088 54.4676 69.9385 55.4379 68.7416 55.4379H14.7192C13.5223 55.4379 12.552 54.4676 12.552 53.2707Z" fill="#15162B"/>
                                    <path d="M12.5527 67.8205C12.5527 66.6235 13.523 65.6532 14.72 65.6532H42.5177C43.7146 65.6532 44.6849 66.6235 44.6849 67.8205C44.6849 69.0174 43.7146 69.9877 42.5177 69.9877H14.72C13.523 69.9877 12.5527 69.0174 12.5527 67.8205Z" fill="#15162B"/>
                                    <path d="M51.8215 67.8205C51.8215 66.6235 52.7918 65.6532 53.9888 65.6532H68.7416C69.9385 65.6532 70.9088 66.6235 70.9088 67.8205C70.9088 69.0174 69.9385 69.9877 68.7416 69.9877H53.9888C52.7918 69.9877 51.8215 69.0174 51.8215 67.8205Z" fill="#15162B"/>
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0.420654 2.38373C0.420654 1.09636 1.46428 0.0527344 2.75165 0.0527344H58.5527C59.171 0.0527344 59.7639 0.298332 60.201 0.735497L81.5648 22.0997C82.002 22.5368 82.2476 23.1297 82.2476 23.7479V118.175C82.2536 118.49 82.1959 118.808 82.0705 119.111C81.7097 119.982 80.8597 120.55 79.9169 120.55H2.75165C1.46428 120.55 0.420654 119.507 0.420654 118.219V2.38373ZM77.5856 24.7793V115.888H5.08265V4.71473H56.3644V22.9812C56.3644 24.2685 57.4081 25.3122 58.6954 25.3122H76.1022C76.6657 25.3122 77.1825 25.1122 77.5856 24.7793ZM61.0264 8.15411L73.5223 20.6502H61.0264V8.15411Z" fill="#15162B"/>
                            </animated.svg>
                            <animated.p style={{  }}>
                                <Typography  whiteSpace={'pre-line'} fontWeight={500}  component={'h5'}
                                           >{t('Safety')}</Typography>
                            </animated.p>
                            <animated.span style={{  }}>
                                <Typography whiteSpace={'pre-line'} color={'var(--text-secondar)'} fontWeight={500} component={'span'}
                                            width={306}>{t('Roadprint ensures that user \n assets are as secure a\ns ethereum\'s main network')}</Typography>
                            </animated.span>
                            {/*<animated.div*/}
                            {/*    style={{ transform: y.interpolate(v => `translateY(${v}%`) }}*/}
                            {/*    className="glance"*/}
                            {/*/>*/}
                        </animated.div>





                        <animated.div
                            // onMouseEnter={() => }
                            className={'card'}
                            onMouseLeave={() =>api({ rotateX: 0, rotateY: 0, scale: 1,background:'var(--color-primary)' })}
                            style={{
                                transform: 'perspective(600px)',
                                height,
                                width,
                                x,
                                y,
                                background,
                                scale: to([scale, zoom], (s, z) => s + z),
                                rotateX,
                                rotateY,
                                rotateZ,
                            }}>
                            <animated.svg width="83" height="121" viewBox="0 0 83 121" fill="none" style={{  }}>
                                <path d="M12.552 38.7206C12.552 37.5237 13.5223 36.5534 14.7192 36.5534H68.7416C69.9385 36.5534 70.9088 37.5237 70.9088 38.7206C70.9088 39.9175 69.9385 40.8878 68.7416 40.8878H14.7192C13.5223 40.8878 12.552 39.9175 12.552 38.7206Z" fill="#15162B"/>
                                <path d="M12.552 53.2707C12.552 52.0738 13.5223 51.1035 14.7192 51.1035H68.7416C69.9385 51.1035 70.9088 52.0738 70.9088 53.2707C70.9088 54.4676 69.9385 55.4379 68.7416 55.4379H14.7192C13.5223 55.4379 12.552 54.4676 12.552 53.2707Z" fill="#15162B"/>
                                <path d="M12.5527 67.8205C12.5527 66.6235 13.523 65.6532 14.72 65.6532H42.5177C43.7146 65.6532 44.6849 66.6235 44.6849 67.8205C44.6849 69.0174 43.7146 69.9877 42.5177 69.9877H14.72C13.523 69.9877 12.5527 69.0174 12.5527 67.8205Z" fill="#15162B"/>
                                <path d="M51.8215 67.8205C51.8215 66.6235 52.7918 65.6532 53.9888 65.6532H68.7416C69.9385 65.6532 70.9088 66.6235 70.9088 67.8205C70.9088 69.0174 69.9385 69.9877 68.7416 69.9877H53.9888C52.7918 69.9877 51.8215 69.0174 51.8215 67.8205Z" fill="#15162B"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.420654 2.38373C0.420654 1.09636 1.46428 0.0527344 2.75165 0.0527344H58.5527C59.171 0.0527344 59.7639 0.298332 60.201 0.735497L81.5648 22.0997C82.002 22.5368 82.2476 23.1297 82.2476 23.7479V118.175C82.2536 118.49 82.1959 118.808 82.0705 119.111C81.7097 119.982 80.8597 120.55 79.9169 120.55H2.75165C1.46428 120.55 0.420654 119.507 0.420654 118.219V2.38373ZM77.5856 24.7793V115.888H5.08265V4.71473H56.3644V22.9812C56.3644 24.2685 57.4081 25.3122 58.6954 25.3122H76.1022C76.6657 25.3122 77.1825 25.1122 77.5856 24.7793ZM61.0264 8.15411L73.5223 20.6502H61.0264V8.15411Z" fill="#15162B"/>
                            </animated.svg>
                            <animated.p style={{  }}>
                                <Typography  whiteSpace={'pre-line'} fontWeight={500}  component={'h5'}
                                >{t('Safety')}</Typography>
                            </animated.p>
                            <animated.span style={{  }}>
                                <Typography whiteSpace={'pre-line'} color={'var(--text-secondar)'} fontWeight={500} component={'span'}
                                            width={306}>{t('Roadprint ensures that user \n assets are as secure a\ns ethereum\'s main network')}</Typography>
                            </animated.span>
                            {/*<animated.div*/}
                            {/*    style={{ transform: y.interpolate(v => `translateY(${v}%`) }}*/}
                            {/*    className="glance"*/}
                            {/*/>*/}
                        </animated.div>


                        <animated.div
                            // onMouseEnter={() => }
                            className={'card'}
                            onMouseLeave={() =>api({ rotateX: 0, rotateY: 0, scale: 1,background:'var(--color-primary)' })}
                            style={{
                                transform: 'perspective(600px)',
                                height,
                                width,
                                x,
                                y,
                                background,
                                scale: to([scale, zoom], (s, z) => s + z),
                                rotateX,
                                rotateY,
                                rotateZ,
                            }}>
                            <animated.svg width="83" height="121" viewBox="0 0 83 121" fill="none" style={{  }}>
                                <path d="M12.552 38.7206C12.552 37.5237 13.5223 36.5534 14.7192 36.5534H68.7416C69.9385 36.5534 70.9088 37.5237 70.9088 38.7206C70.9088 39.9175 69.9385 40.8878 68.7416 40.8878H14.7192C13.5223 40.8878 12.552 39.9175 12.552 38.7206Z" fill="#15162B"/>
                                <path d="M12.552 53.2707C12.552 52.0738 13.5223 51.1035 14.7192 51.1035H68.7416C69.9385 51.1035 70.9088 52.0738 70.9088 53.2707C70.9088 54.4676 69.9385 55.4379 68.7416 55.4379H14.7192C13.5223 55.4379 12.552 54.4676 12.552 53.2707Z" fill="#15162B"/>
                                <path d="M12.5527 67.8205C12.5527 66.6235 13.523 65.6532 14.72 65.6532H42.5177C43.7146 65.6532 44.6849 66.6235 44.6849 67.8205C44.6849 69.0174 43.7146 69.9877 42.5177 69.9877H14.72C13.523 69.9877 12.5527 69.0174 12.5527 67.8205Z" fill="#15162B"/>
                                <path d="M51.8215 67.8205C51.8215 66.6235 52.7918 65.6532 53.9888 65.6532H68.7416C69.9385 65.6532 70.9088 66.6235 70.9088 67.8205C70.9088 69.0174 69.9385 69.9877 68.7416 69.9877H53.9888C52.7918 69.9877 51.8215 69.0174 51.8215 67.8205Z" fill="#15162B"/>
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.420654 2.38373C0.420654 1.09636 1.46428 0.0527344 2.75165 0.0527344H58.5527C59.171 0.0527344 59.7639 0.298332 60.201 0.735497L81.5648 22.0997C82.002 22.5368 82.2476 23.1297 82.2476 23.7479V118.175C82.2536 118.49 82.1959 118.808 82.0705 119.111C81.7097 119.982 80.8597 120.55 79.9169 120.55H2.75165C1.46428 120.55 0.420654 119.507 0.420654 118.219V2.38373ZM77.5856 24.7793V115.888H5.08265V4.71473H56.3644V22.9812C56.3644 24.2685 57.4081 25.3122 58.6954 25.3122H76.1022C76.6657 25.3122 77.1825 25.1122 77.5856 24.7793ZM61.0264 8.15411L73.5223 20.6502H61.0264V8.15411Z" fill="#15162B"/>
                            </animated.svg>
                            <animated.p style={{  }}>
                                <Typography  whiteSpace={'pre-line'} fontWeight={500}  component={'h5'}
                                >{t('Safety')}</Typography>
                            </animated.p>
                            <animated.span style={{  }}>
                                <Typography whiteSpace={'pre-line'} color={'var(--text-secondar)'} fontWeight={500} component={'span'}
                                            width={306}>{t('Roadprint ensures that user \n assets are as secure a\ns ethereum\'s main network')}</Typography>
                            </animated.span>
                            {/*<animated.div*/}
                            {/*    style={{ transform: y.interpolate(v => `translateY(${v}%`) }}*/}
                            {/*    className="glance"*/}
                            {/*/>*/}
                        </animated.div>


                    </CardBox>


                </Grid>
            </Container>
        </Box>
    </ContainerStyle>
})
