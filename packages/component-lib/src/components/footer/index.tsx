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

  :hover {
    color: var(--color-text-hover);
  }
` as typeof Link;
const FooterDiv = styled(Box)`
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
    loopring: [
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
    service: [
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
    aaa: [
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
    bbb: [
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
            return <Box key={key.toString()} display={'flex'} flexDirection={'column'} padding={3}>
                <Typography color={'var(--color-text-third)'} sx={{mt: 4, mb: 2}} fontSize='12px'
                            variant="h6" component="div"> {t('labelFooter' + key.toString())} </Typography>
                <Box display={'flex'} flexDirection={'column'}>
                    {linkListMap[ key ].map((item: any) => {
                        return <LinkStyle href={item.linkHref}>
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

    return <FooterDiv style={{backgroundColor: mode === 'dark' ? '#0A0B2F' : '#fff'}} component={'footer'}
                      fontSize={'body1'}>
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
                {linkListMapRender}
                {/*<Grid item lg={7} container direction="row" justifyContent="space-around" alignItems="flex-start"*/}
                {/*      spacing={1}>*/}
                {/*    <Grid>*/}

                {/*    </Grid>*/}
                {/*    <Grid>*/}
                {/*        <List>*/}
                {/*            <Typography color={'var(--color-text-third)'} sx={{mt: 4, mb: 2}} fontSize='12px'*/}
                {/*                        variant="h6" component="div"> {t('Service')} </Typography>*/}
                {/*            {*/}
                {/*                [*/}
                {/*                    {*/}
                {/*                        linkName: 'Fees',*/}
                {/*                        linkHref: "https://loopring.io/#/embed/wallet_fees_en"*/}
                {/*                    },*/}
                {/*                    {*/}
                {/*                        linkName: 'VIP',*/}
                {/*                        linkHref: "https://medium.com/loopring-protocol"*/}
                {/*                    },*/}
                {/*                    {*/}
                {/*                        linkName: 'Referral',*/}
                {/*                        linkHref: "https://medium.com/loopring-protocol"*/}
                {/*                    },*/}
                {/*                    {*/}
                {/*                        linkName: 'Listing Application',*/}
                {/*                        linkHref: "https://loopringexchange.typeform.com/to/T0bgsodw?typeform-source=medium.com"*/}
                {/*                    },*/}
                {/*                    {*/}
                {/*                        linkName: 'Creator Grants',*/}
                {/*                        linkHref: "https://www.loopringgrants.org/"*/}
                {/*                    },*/}

                {/*                ].map((o, index) => (*/}
                {/*                    <ListItem key={`${o.linkName}-${index}`}>*/}
                {/*                        <Link style={{color: 'var(--color-text-secondary)'}} fontSize={12}*/}
                {/*                              href={o.linkHref}>{o.linkName}</Link>*/}
                {/*                    </ListItem>*/}
                {/*                ))*/}
                {/*            }*/}
                {/*        </List>*/}
                {/*    </Grid>*/}
                {/*    <Grid>*/}
                {/*        <List>*/}
                {/*            <Typography color={'var(--color-text-third)'} sx={{mt: 4, mb: 2}} fontSize='12px'*/}
                {/*                        variant="h6" component="div"> {t('Support')} </Typography>*/}
                {/*            {*/}
                {/*                [*/}
                {/*                    {*/}
                {/*                        linkName: 'Feedback',*/}
                {/*                        linkHref: 'https://github.com/Loopring/loopring-web-v2/issues/new'*/}
                {/*                    },*/}
                {/*                    {*/}
                {/*                        linkName: 'Loopring Tutorial',*/}
                {/*                        linkHref: "https://loopring-org.gitbook.io/en/"*/}
                {/*                    },*/}
                {/*                    {*/}
                {/*                        linkName: 'Community Docs',*/}
                {/*                        linkHref: "https://loopring-org.gitbook.io/loopring-doc/"*/}
                {/*                    },*/}
                {/*                    {*/}
                {/*                        linkName: 'Support Center',*/}
                {/*                        linkHref: "https://discord.gg/RCus8aNB"*/}
                {/*                    },*/}

                {/*                ].map((o, index) => (*/}
                {/*                    <ListItem key={`${o.linkName}-${index}`}>*/}
                {/*                        <Link style={{color: 'var(--color-text-secondary)'}} fontSize={12}*/}
                {/*                              href={o.linkHref}>{o.linkName}</Link>*/}
                {/*                    </ListItem>*/}
                {/*                ))*/}
                {/*            }*/}
                {/*        </List>*/}
                {/*    </Grid>*/}
                {/*    <Grid>*/}
                {/*        <List>*/}
                {/*            <Typography color={'var(--color-text-third)'} sx={{mt: 4, mb: 2}} fontSize='12px'*/}
                {/*                        variant="h6" component="div"> {t('Product')} </Typography>*/}
                {/*            {*/}
                {/*                [*/}
                {/*                    {*/}
                {/*                        linkName: 'Smart Contract',*/}
                {/*                        linkHref: "https://loopring.io/#/legal/contracts/en"*/}
                {/*                    },*/}
                {/*                    {*/}
                {/*                        linkName: 'Loopring App',*/}
                {/*                        linkHref: "https://app.loopring.io/"*/}
                {/*                    },*/}
                {/*                    {*/}
                {/*                        linkName: 'Loopring Smart Wallet',*/}
                {/*                        linkHref: "https://loopring.io/#/"*/}
                {/*                    },*/}
                {/*                    {*/}
                {/*                        linkName: 'API Documentation',*/}
                {/*                        linkHref: "https://docs.loopring.io/en/"*/}
                {/*                    },*/}

                {/*                ].map((o, index) => (*/}
                {/*                    <ListItem key={`${o.linkName}-${index}`}>*/}
                {/*                        <Link style={{color: 'var(--color-text-secondary)'}} fontSize={12}*/}
                {/*                              href={o.linkHref}>{o.linkName}</Link>*/}
                {/*                    </ListItem>*/}
                {/*                ))*/}
                {/*            }*/}
                {/*        </List>*/}
                {/*    </Grid>*/}
                {/*</Grid>*/}
                <Grid justifyContent="flex-end" item lg={2}>
                    <Grid container direction="row" justifyContent="flex-start" alignItems="flex-start" item xs={12}
                          md={12} lg={12}>
                        <Grid item xs={12} md={12} lg={12}>
                            <Typography color="textThird" variant="h6" component="div"> Follow us </Typography>
                        </Grid>
                        <Grid item xs={12} md={12} lg={12}>
                            <List style={{display: 'flex', alignItems: 'flex-start'}}>
                                {
                                    [
                                        {
                                            linkName: <DiscordIcon fontSize={'large'}/>,
                                            linkHref: "https://discord.com/invite/KkYccYp"
                                        },
                                        {
                                            linkName: <TwitterIcon fontSize={'large'}/>,
                                            linkHref: "https://twitter.com/loopringorg"
                                        },
                                        {
                                            linkName: <YoutubeIcon fontSize={'large'}/>,
                                            linkHref: "https://www.youtube.com/c/Loopring"
                                        },
                                        {
                                            linkName: <MediumIcon fontSize={'large'}/>,
                                            linkHref: "https://medium.com/loopring-protocol"
                                        }
                                    ].map((o, index) => (
                                        <ListItem key={`${o.linkName}-${index}`}>
                                            <Link paddingX={0.5} fontSize={12}
                                                  onClick={() => handleLinkClick(o.linkHref)}>{o.linkName}</Link>
                                        </ListItem>
                                    ))
                                }
                            </List>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Typography component={'p'} variant={'body2'} paddingTop={2} textAlign={'center'}>
                <Typography style={{fontSize: '9px'}} component={'span'}>Copyright (c)
                    2017-{new Date().getFullYear()}.</Typography>
                <Typography style={{fontSize: '9px'}} component={'span'}>All rights reserved.</Typography>
            </Typography>
            {/*<Typography component={'p'} variant={'body2'} paddingTop={1} paddingBottom={2}*/}
            {/*            textAlign={'center'}></Typography>*/}
        </Container>
    </FooterDiv>
})

// const TestStyled = styled(Link)`color: ${({theme}) => theme.colorBase.textThird}`;

// const Footer = withTranslation(['layout'])(({t}: any) => {
//     const {mode} = useTheme()
//     const [size, setSize] = React.useState<[number, number]>([1200, 0]);
//     React.useLayoutEffect(() => {
//         function updateSize() {
//             setSize([1200, window.innerHeight - HeightConfig.headerHeight - HeightConfig.whiteHeight]);
//
//         }
//
//         window.addEventListener('resize', updateSize);
//         updateSize();
//         return () => window.removeEventListener('resize', updateSize);
//     }, []);
//
//     // {
//     //     .map((o, index) => (
//     //         <ListItem key={`${o.linkName}-${index}`}>
//     //             <Link style={{color: 'var(--color-text-secondary)'}} fontSize={12}
//     //                   href={o.linkHref}>{o.linkName}</Link>
//     //         </ListItem>
//     //     ))
//     // }
//
//     <List>
//         <Typography color={'var(--color-text-third)'} sx={{mt: 4, mb: 2}} fontSize='12px'
//                     variant="h6" component="div"> {t('Loopring')} </Typography>
//
//     </List>
//     const handleLinkClick = React.useCallback((href: string) => {
//         window.open(href)
//     }, [])
//
//     return <FooterDiv style={{backgroundColor: mode === 'dark' ? '#0A0B2F' : '#fff'}} component={'footer'}
//                       fontSize={'body1'}>
//         <Container>
//             <Grid maxHeight={HeightConfig.maxHeight} minHeight={HeightConfig.minHeight} position={'relative'}
//                   height={size[ 1 ]} container direction="row" justifyContent="space-between" alignItems="center"
//                   spacing={1}>
//                 <Grid justifyContent="flex-start" item lg={2}>
//                     <Box>
//                         <Link paddingX={10} target={'_blank'} href="https://medium.com/loopring-protocol">
//                             {
//                                 mode === 'light' ?
//                                     <LoopringLightFooterIcon style={{transform: 'scale(10)'}}/>
//                                     :
//                                     <LoopringDarkFooterIcon style={{transform: 'scale(10)'}}/>
//                             }
//                         </Link>
//                     </Box>
//                 </Grid>
//                 <Grid item lg={7} container direction="row" justifyContent="space-around" alignItems="flex-start"
//                       spacing={1}>
//                     <Grid>
//
//                     </Grid>
//                     <Grid>
//                         <List>
//                             <Typography color={'var(--color-text-third)'} sx={{mt: 4, mb: 2}} fontSize='12px'
//                                         variant="h6" component="div"> {t('Service')} </Typography>
//                             {
//                                 [
//                                     {
//                                         linkName: 'Fees',
//                                         linkHref: "https://loopring.io/#/embed/wallet_fees_en"
//                                     },
//                                     {
//                                         linkName: 'VIP',
//                                         linkHref: "https://medium.com/loopring-protocol"
//                                     },
//                                     {
//                                         linkName: 'Referral',
//                                         linkHref: "https://medium.com/loopring-protocol"
//                                     },
//                                     {
//                                         linkName: 'Listing Application',
//                                         linkHref: "https://loopringexchange.typeform.com/to/T0bgsodw?typeform-source=medium.com"
//                                     },
//                                     {
//                                         linkName: 'Creator Grants',
//                                         linkHref: "https://www.loopringgrants.org/"
//                                     },
//
//                                 ].map((o, index) => (
//                                     <ListItem key={`${o.linkName}-${index}`}>
//                                         <Link style={{color: 'var(--color-text-secondary)'}} fontSize={12}
//                                               href={o.linkHref}>{o.linkName}</Link>
//                                     </ListItem>
//                                 ))
//                             }
//                         </List>
//                     </Grid>
//                     <Grid>
//                         <List>
//                             <Typography color={'var(--color-text-third)'} sx={{mt: 4, mb: 2}} fontSize='12px'
//                                         variant="h6" component="div"> {t('Support')} </Typography>
//                             {
//                                 [
//                                     {
//                                         linkName: 'Feedback',
//                                         linkHref: 'https://github.com/Loopring/loopring-web-v2/issues/new'
//                                     },
//                                     {
//                                         linkName: 'Loopring Tutorial',
//                                         linkHref: "https://loopring-org.gitbook.io/en/"
//                                     },
//                                     {
//                                         linkName: 'Community Docs',
//                                         linkHref: "https://loopring-org.gitbook.io/loopring-doc/"
//                                     },
//                                     {
//                                         linkName: 'Support Center',
//                                         linkHref: "https://discord.gg/RCus8aNB"
//                                     },
//
//                                 ].map((o, index) => (
//                                     <ListItem key={`${o.linkName}-${index}`}>
//                                         <Link style={{color: 'var(--color-text-secondary)'}} fontSize={12}
//                                               href={o.linkHref}>{o.linkName}</Link>
//                                     </ListItem>
//                                 ))
//                             }
//                         </List>
//                     </Grid>
//                     <Grid>
//                         <List>
//                             <Typography color={'var(--color-text-third)'} sx={{mt: 4, mb: 2}} fontSize='12px'
//                                         variant="h6" component="div"> {t('Product')} </Typography>
//                             {
//                                 [
//                                     {
//                                         linkName: 'Smart Contract',
//                                         linkHref: "https://loopring.io/#/legal/contracts/en"
//                                     },
//                                     {
//                                         linkName: 'Loopring App',
//                                         linkHref: "https://app.loopring.io/"
//                                     },
//                                     {
//                                         linkName: 'Loopring Smart Wallet',
//                                         linkHref: "https://loopring.io/#/"
//                                     },
//                                     {
//                                         linkName: 'API Documentation',
//                                         linkHref: "https://docs.loopring.io/en/"
//                                     },
//
//                                 ].map((o, index) => (
//                                     <ListItem key={`${o.linkName}-${index}`}>
//                                         <Link style={{color: 'var(--color-text-secondary)'}} fontSize={12}
//                                               href={o.linkHref}>{o.linkName}</Link>
//                                     </ListItem>
//                                 ))
//                             }
//                         </List>
//                     </Grid>
//                 </Grid>
//                 <Grid justifyContent="flex-end" item lg={2}>
//                     <Grid container direction="row" justifyContent="flex-start" alignItems="flex-start" item xs={12}
//                           md={12} lg={12}>
//                         <Grid item xs={12} md={12} lg={12}>
//                             <Typography color="textThird" variant="h6" component="div"> Follow us </Typography>
//                         </Grid>
//                         <Grid item xs={12} md={12} lg={12}>
//                             <List style={{display: 'flex', alignItems: 'flex-start'}}>
//                                 {
//                                     [
//                                         {
//                                             linkName: <DiscordIcon style={{transform: 'scale(1.2)'}}/>,
//                                             linkHref: "https://discord.com/invite/KkYccYp"
//                                         },
//                                         {
//                                             linkName: <TwitterIcon style={{transform: 'scale(1.2)'}}/>,
//                                             linkHref: "https://twitter.com/loopringorg"
//                                         },
//                                         {
//                                             linkName: <YoutubeIcon style={{transform: 'scale(1.2)'}}/>,
//                                             linkHref: "https://www.youtube.com/c/Loopring"
//                                         },
//                                         {
//                                             linkName: <MediumIcon style={{transform: 'scale(1.2)'}}/>,
//                                             linkHref: "https://medium.com/loopring-protocol"
//                                         }
//                                     ].map((o, index) => (
//                                         <ListItem key={`${o.linkName}-${index}`}>
//                                             <Link paddingX={0.5} fontSize={12}
//                                                   onClick={() => handleLinkClick(o.linkHref)}>{o.linkName}</Link>
//                                         </ListItem>
//                                     ))
//                                 }
//                             </List>
//                         </Grid>
//                     </Grid>
//                 </Grid>
//             </Grid>
//
//             <Typography component={'p'} variant={'body2'} paddingTop={2} textAlign={'center'}>
//                 <Typography style={{fontSize: '9px'}} component={'span'}>Copyright (c)
//                     2017-{new Date().getFullYear()}.</Typography>
//                 <Typography style={{fontSize: '9px'}} component={'span'}>All rights reserved.</Typography>
//             </Typography>
//             <Typography component={'p'} variant={'body2'} paddingTop={1} paddingBottom={2}
//                         textAlign={'center'}></Typography>
//         </Container>
//     </FooterDiv>
// })

// export default Footer
