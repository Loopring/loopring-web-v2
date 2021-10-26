import styled from '@emotion/styled/macro'
import { Box, Container, Grid, Link, List, ListItem, Typography } from '@mui/material';
import React from 'react';
import {
DiscordIcon,
LoopringDarkFooterIcon,
LoopringLightFooterIcon,
MediumIcon,
TwitterIcon,
YoutubeIcon
} from '@loopring-web/common-resources';
import { withTranslation } from 'react-i18next';
import { useTheme } from '@emotion/react';

const HeightConfig = {
headerHeight: 24,
whiteHeight: 12,
maxHeight: 253,
minHeight: 230,
}

const LinkStyle = styled(Link)`
color: var(--color-text-secondary);
line-height: 20px;
font-size: 12px;

  &:hover {
    color: var(--color-text-hover);
  }
` as typeof Link;
const FooterDiv = styled(Box)`
  background: var(--color-global-bg);
  //style={{backgroundColor: mode === 'dark' ? '#0A0B2F' : '#fff'}}
  @media screen and (max-width: 1280px) {


}
font-size: 1.4rem;

.MuiListItem-root {
padding: 0;
//width: 1080;
max-width: initial;

:hover {
    background: var(--opacity);
}

a {
    color: var(--color-global-bg)
}
}
`
const linkListMap = {
Loopring: [
    {
        linkName: 'About',
        linkHref: "https://loopring.org/#/home"
    },
    {
        linkName: 'Terms',
        linkHref: "https://loopring.io/#/legal/terms/en"
    },
    {
        linkName: 'Privacy',
        linkHref: "https://loopring.io/#/legal/privacy/en"
    },
    {
        linkName: 'News',
        linkHref: "https://loopring.org/#/blog"
    },
    {
        linkName: 'Risk',
        linkHref: "https://loopring.io/#/legal/risks/en"
    },

],
Service: [
    {
        linkName: 'Fees',
        linkHref: "https://loopring.io/#/embed/wallet_fees_en"
    },
    {
        linkName: 'VIP',
        linkHref: "https://medium.com/loopring-protocol"
    },
    {
        linkName: 'Referral',
        linkHref: "https://medium.com/loopring-protocol"
    },
    {
        linkName: 'ListingApplication',
        linkHref: "https://loopringexchange.typeform.com/to/T0bgsodw?typeform-source=medium.com"
    },
    {
        linkName: 'CreatorGrants',
        linkHref: "https://www.loopringgrants.org/"
    },

],
Support: [
    {
        linkName: 'Feedback',
        linkHref: 'https://github.com/Loopring/loopring-web-v2/issues/new'
    },
    {
        linkName: 'LoopringTutorial',
        linkHref: "https://loopring-org.gitbook.io/en/"
    },
    {
        linkName: 'CommunityDocs',
        linkHref: "https://loopring-org.gitbook.io/loopring-doc/"
    },
    {
        linkName: 'SupportCenter',
        linkHref: "https://discord.com/invite/KkYccYp"
    },

],
Product: [
    {
        linkName: 'SmartContract',
        linkHref: "https://loopring.io/#/legal/contracts/en"
    },
    {
        linkName: 'LoopringApp',
        linkHref: "https://app.loopring.io/"
    },
    {
        linkName: 'LoopringSmartWallet',
        linkHref: "https://loopring.io/#/"
    },
    {
        linkName: 'APIDocumentation',
        linkHref: "https://docs.loopring.io/en/"
    },
    // {
    //     linkName: 'ReportIssue',
    //     linkHref: "'https://github.com/Loopring/loopring-web-v2/issues/new'"
    // },
],
}

export const Footer = withTranslation(['layout'])(({t}: any) => {
const {mode} = useTheme()
const [size, setSize] = React.useState<[number, number]>([1200, 0]);
React.useLayoutEffect(() => {
    function updateSize() {
        setSize([1200, window.innerHeight - HeightConfig.headerHeight - HeightConfig.whiteHeight]);

    }

    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
}, []);
const linkListMapRender = React.useMemo(() => {

    return Reflect.ownKeys(linkListMap).map((key) => {
        return <Box key={key.toString()} display={'flex'} flexDirection={'column'} justifyContent={'center'} /* padding={3} */>
            <Typography color={'var(--color-text-third)'} sx={{mt: 4, mb: 2}}
                        variant="body2" component="div"> {t('labelFooter' + key.toString())} </Typography>
            <Box display={'flex'} flexDirection={'column'} height={'100%'} justifyContent={'flex-start'}>
                {linkListMap[ key ].map((item: any) => {
                    return <LinkStyle /* href={item.linkHref} */ onClick={() => handleLinkClick(item.linkHref)}>
                        {t('label' + 'key' + item.linkName)}
                    </LinkStyle>
                })}
            </Box>
        </Box>
    })
}, [linkListMap])

const handleLinkClick = React.useCallback((href: string) => {
    window.open(href)
}, [])

    return <FooterDiv  component={'footer'}
                       fontSize={'body1'}>
        {/*<Divider />*/}
    <Container>
        <Grid maxHeight={HeightConfig.maxHeight} minHeight={HeightConfig.minHeight} position={'relative'}
                height={size[ 1 ]} container direction="row" justifyContent="space-between" alignItems="center"
                spacing={1}>
            <Grid justifyContent="flex-start" item lg={2}>
                <Box>
                    <Link paddingX={10} target={'_blank'} href="https://medium.com/loopring-protocol">
                        {
                            mode === 'light' ?
                                <LoopringLightFooterIcon style={{transform: 'scale(10)'}}/>
                                :
                                <LoopringDarkFooterIcon style={{transform: 'scale(10)'}}/>
                        }
                    </Link>
                </Box>
            </Grid>
            <Grid justifyContent="space-between" display={'flex'} item lg={7}>
                {linkListMapRender}
            </Grid>
            <Grid /* justifyContent="flex-end" */ item lg={2}>
                <Grid container direction="row" justifyContent="flex-start" alignItems="flex-start" item xs={12}
                        md={12} lg={12}>
                    <Grid item marginTop={3.5} marginBottom={2} xs={12} md={12} lg={12}>
                        <Typography color="var(--color-text-third)" variant="body2" component="p">Follow us</Typography>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12} height={'100px'}>
                        <List style={{display: 'flex', alignItems: 'flex-start', paddingTop: 0, paddingBottom: 0}}>
                            {
                                [
                                    {
                                        linkName: <DiscordIcon htmlColor={'var(--color-text-third)'} fontSize={'large'}/>,
                                        linkHref: "https://discord.com/invite/KkYccYp"
                                    },
                                    {
                                        linkName: <TwitterIcon htmlColor={'var(--color-text-third)'} fontSize={'large'}/>,
                                        linkHref: "https://twitter.com/loopringorg"
                                    },
                                    {
                                        linkName: <YoutubeIcon htmlColor={'var(--color-text-third)'} fontSize={'large'}/>,
                                        linkHref: "https://www.youtube.com/c/Loopring"
                                    },
                                    {
                                        linkName: <MediumIcon htmlColor={'var(--color-text-third)'} fontSize={'large'}/>,
                                        linkHref: "https://medium.com/loopring-protocol"
                                    }
                                ].map((o, index) => (
                                    <ListItem key={`${o.linkName}-${index}`}>
                                        <Link fontSize={12}
                                                onClick={() => handleLinkClick(o.linkHref)}>{o.linkName}</Link>
                                    </ListItem>
                                ))
                            }
                        </List>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>

        <Typography component={'p'} variant={'body2'} marginTop={2} paddingBottom={1} textAlign={'center'}>
            <Typography style={{fontSize: '9px'}} component={'span'}>Copyright (c)
                2017-{new Date().getFullYear()}. </Typography>
            <Typography style={{fontSize: '9px'}} component={'span'}>All rights reserved.</Typography>
        </Typography>
        {/*<Typography component={'p'} variant={'body2'} paddingTop={1} paddingBottom={2}*/}
        {/*            textAlign={'center'}></Typography>*/}
    </Container>
</FooterDiv>
})
