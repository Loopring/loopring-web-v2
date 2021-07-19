import { Trans, useTranslation } from 'react-i18next';
import { Box, Container, Link, Slide, Typography } from '@material-ui/core';
import styled from '@emotion/styled';
import { ErrorObject } from '@loopring-web/common-resources';
import { getContactInfo } from '../../utils/dt_tools';

const StyleBox = styled(Box)`
  //background-image: url('./static/images/error_bg.png');
  //background-repeat: no-repeat;
  //background-size: contain;
  //background-position: bottom;
  //white-space: pre-wrap;
  ////h2{
  ////  position: relative;
  ////}
` as typeof Box

export const LoadingPage = () => {
    const {t} = useTranslation('layout');
    return <>
        <Container>
            {/*style={{height: '100%' }}*/}
            <StyleBox flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}
                      flexDirection={'column'} marginTop={4} height={680} maxWidth={1200}>
                {/*<StyleBox>*/}
                <Slide direction="up" in={true} mountOnEnter unmountOnExit>
                <Box textAlign={'center'} >
                    <Typography component={'h1'} variant={'h1'} fontWeight={500} fontFamily={'DINCondensed2'} fontSize={96} style={{textTransform: "uppercase"}} >
                        {t('titleLoopring')}
                    </Typography>
                    <Typography component={'h2'}   marginTop={3}  fontSize={32} fontFamily={'DINCondensed2'}>
                        {t('labelLoopringDescribe')}
                    </Typography>
                    {/*<Typography marginY={2} component={'p'} variant={'body1'} color={'textSecondary'}>*/}
                    {/*    <Trans i18nKey={message}>*/}
                    {/*        If you believe this is indeed a bug, please <Link*/}
                    {/*        component={'a'}*/}
                    {/*        onClick={(e) => {*/}
                    {/*            window.location.href = getContactInfo();*/}
                    {/*            e.preventDefault();*/}
                    {/*        }}*/}
                    {/*    >contact us</Link> <br/> We would appreciate your feedback*/}

                    {/*    </Trans>*/}
                    {/*    /!*{t(message)}*!/*/}
                    {/*    /!*{t(messageKey)}*!/*/}
                    {/*</Typography>*/}
                </Box>
                </Slide>
                {/*</StyleBox>*/}
            </StyleBox>

        </Container>

        {/*<Footer></Footer>*/}
    </>
}
