import { Trans, useTranslation } from 'react-i18next';
import { Box, Container, Link, Slide, Typography } from '@material-ui/core';
import styled from '@emotion/styled';
import { ErrorObject } from '@loopring-web/common-resources';
import { getContactInfo } from '../../utils/dt_tools';

const StyleBox = styled(Box)`
  background: var(--color-box-linear);
  //background-repeat: no-repeat;
  //background-size: contain;
  //background-position: bottom;
  //white-space: pre-wrap;
  ////h2{
  ////  position: relative;
  ////}
  /*
  Set the color of the icon
*/
  svg path,
  svg rect{
    fill: var(--color-primary)
  }
` as typeof Box

export const LoadingPage = () => {
    const {t} = useTranslation('layout');
    return <>
        {/*<Container>*/}
            {/*style={{height: '100%' }}*/}
            <StyleBox flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}
                      flexDirection={'column'} height={'100%'}  width={'100%'}>
                <div className="loader loader--style3" title="2">
                    <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg"
                         xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                         width="40px" height="40px" viewBox="0 0 50 50" enableBackground={'new 0 0 50 50'}
                         xmlSpace="preserve">
  <path fill="#000"
        d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z">
    <animateTransform attributeType="xml"
                      attributeName="transform"
                      type="rotate"
                      from="0 25 25"
                      to="360 25 25"
                      dur="0.6s"
                      repeatCount="indefinite"/>
    </path>
  </svg>
                </div>
                {/*<StyleBox>*/}
                {/*<Slide direction="up" in={true} mountOnEnter unmountOnExit>*/}
                {/*<Box textAlign={'center'} >*/}
                {/*    <Typography component={'h1'} variant={'h1'} fontWeight={500} fontFamily={'DINCondensed2'} fontSize={96} style={{textTransform: "uppercase"}} >*/}
                {/*        {t('titleLoopring')}*/}
                {/*    </Typography>*/}
                {/*    <Typography component={'h2'}   marginTop={3}  fontSize={32} fontFamily={'DINCondensed2'}>*/}
                {/*        {t('labelLoopringDescribe')}*/}
                {/*    </Typography>*/}
                {/*    /!*<Typography marginY={2} component={'p'} variant={'body1'} color={'textSecondary'}>*!/*/}
                {/*    /!*    <Trans i18nKey={message}>*!/*/}
                {/*    /!*        If you believe this is indeed a bug, please <Link*!/*/}
                {/*    /!*        component={'a'}*!/*/}
                {/*    /!*        onClick={(e) => {*!/*/}
                {/*    /!*            window.location.href = getContactInfo();*!/*/}
                {/*    /!*            e.preventDefault();*!/*/}
                {/*    /!*        }}*!/*/}
                {/*    /!*    >contact us</Link> <br/> We would appreciate your feedback*!/*/}

                {/*    /!*    </Trans>*!/*/}
                {/*    /!*    /!*{t(message)}*!/*!/*/}
                {/*    /!*    /!*{t(messageKey)}*!/*!/*/}
                {/*    /!*</Typography>*!/*/}
                {/*</Box>*/}
                {/*</Slide>*/}
                {/*</StyleBox>*/}
            </StyleBox>

        {/*</Container>*/}

        {/*<Footer></Footer>*/}
    </>
}
