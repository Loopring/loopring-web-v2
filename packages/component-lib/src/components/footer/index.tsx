import styled from '@emotion/styled/macro'
import { Box, Container, Link, List, Typography } from '@mui/material';
import React from 'react';
import { DiscordIcon, LoopringIcon, MediumIcon, TwitterIcon, YoutubeIcon, } from '@loopring-web/common-resources';
import { withTranslation } from 'react-i18next';
import { useTheme } from '@emotion/react';
import { useLocation } from 'react-router-dom';

// const HeightConfig = {
//     headerHeight: 24,
//     whiteHeight: 12,
//     maxHeight: 253,
//     // minHeight: 200,
// }

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
`
const linkListMap = {
    About: [
        {
            linkName: 'Org',  // loopring.org
            linkHref: "https://loopring.org"
        },
        {
            linkName: 'Terms', //Terms of service
            linkHref: "https://www.iubenda.com/terms-and-conditions/74969935"
        },
        {
            linkName: 'Privacy',  //Privacy policy
            linkHref: "https://loopring.io/#/document/privacy_en.md"
        },
        {
            linkName: 'Risks', //Risks Disclosure
            linkHref: "https://loopring.io/#/document/risks_en.md"
        },

    ],
    Platform: [
        {
            linkName: 'Fees',  //Fees
            linkHref: "https://loopring.io/#/document/dex_fees_en.md"
        },
        {
            linkName: 'VIP', //VIP
            linkHref: "https://medium.com/loopring-protocol/introducing-loopring-vip-tiers-c6f73d753bac"
        },
        {
            linkName: 'Referrals', //Referrals
            linkHref: "https://medium.com/loopring-protocol/loopring-exchange-launches-referral-program-c61777f072d1"
        },
    ],
    Support: [
        {
            linkName: 'Feedback', //❤️ Submit a Request
            // linkHref: 'https://loopring.io/#/newticket'
            linkHref: 'https://desk.zoho.com/portal/loopring/en/home'
        },
        {
            linkName: 'CreatorGrants', // Creator Grants
            linkHref: "https://www.loopringgrants.org/"
        },
        {
            linkName: 'TokenListing',
            linkHref: "https://loopringexchange.typeform.com/to/T0bgsodw?typeform-source=medium.com"
        },
    ],
    Developers: [
        {
            linkName: 'SmartContract', // Smart Contract
            linkHref: "https://loopring.io/#/document/contracts_en.md"
        },

        {
            linkName: 'APIs',  //APIs
            linkHref: "https://docs.loopring.io/en/"
        },
        {
            linkName: 'L2Explorer',  //Layer2 Explorer
            linkHref: "https://explorer.loopring.io"
        },
        {
            linkName: 'Subgraph',  //Subgraph
            linkHref: "https://thegraph.com/hosted-service/subgraph/loopring/loopring"
        },
    ],
}

const mediaList = [
    {
        linkName: <DiscordIcon color={'inherit'} fontSize={'large'}/>,
        linkHref: "https://discord.com/invite/KkYccYp"
    },
    {
        linkName: <TwitterIcon color={'inherit'} fontSize={'large'}/>,
        linkHref: "https://twitter.com/loopringorg"
    },
    {
        linkName: <YoutubeIcon color={'inherit'} fontSize={'large'}/>,
        linkHref: "https://www.youtube.com/c/Loopring"
    },
    {
        linkName: <MediumIcon color={'inherit'} fontSize={'large'}/>,
        linkHref: "https://medium.com/loopring-protocol"
    }
]

export const Footer = withTranslation(['layout'])(({t}: any) => {
    const {mode} = useTheme()
    // const [size, setSize] = React.useState<[number, number]>([1200, 0]);
    const location = useLocation()
    const isLandingPage = location.pathname === '/' || location.pathname === '/wallet'
// const isWallet = location.pathname === '/wallet'
    React.useLayoutEffect(() => {
        function updateSize() {
            // setSize([1200, window.innerHeight - HeightConfig.headerHeight - HeightConfig.whiteHeight]);

        }

        window.addEventListener('resize', updateSize);
        updateSize();
        return () => window.removeEventListener('resize', updateSize);
    }, []);
    const linkListMapRender = React.useMemo(() => {

        return Reflect.ownKeys(linkListMap).map((key) => {
            return <Box key={key.toString()} minWidth={120} display={'flex'} flexDirection={'column'}
                        justifyContent={'center'} /* padding={3} */>
                <Typography color={'var(--color-text-third)'} sx={{mt: 4, mb: 2}}
                            variant="body2" component="div"> {t('labelFooter' + key.toString())} </Typography>
                <Box display={'flex'} flexDirection={'column'} height={'100%'} justifyContent={'flex-start'}>
                    {linkListMap[ key ].map((item: any) => {
                        return <LinkStyle /* href={item.linkHref} */ key={item.linkName}
                                                                     onClick={() => handleLinkClick(item.linkHref)}>
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
    const medias = React.useMemo(()=>{
        return                             <List style={{display: 'flex', alignItems: 'flex-start', paddingTop: 0, paddingBottom: 0}}>
            {
                mediaList.map((o, index) => (
                    <Typography paddingRight={2} key={`${o.linkName}-${index}`} >
                        <LinkStyle fontSize={28}  display={'inline-block'} width={28}
                              onClick={() => handleLinkClick(o.linkHref)}>{o.linkName}</LinkStyle>
                    </Typography>
                ))
            }
        </List>

    },[mediaList])

    return <FooterDiv component={'footer'}
                      fontSize={'body1'}>
        {/*<Divider />*/}
        <Container>
            {isLandingPage && (
                <>
                    <Box
                         position={'relative'}
                         // height={size[ 1 ]}
                         flexDirection="row"
                         justifyContent="space-between"
                         alignItems="center"
                         width={'100%'} paddingBottom={4}>
                        <Box display={'flex'} justifyContent={'space-between'} alignItems={'flex-start'} >
                            <Box marginTop={4} marginLeft={-3} minWidth={100} alignSelf={'flex-start'}
                                 justifySelf={'center'} display={'inline-flex'} alignItems={'center'}>
                                <LoopringIcon htmlColor={'var(--color-text-third)'} style={{height:'40px',width:'120px'}}/>
                            </Box>
                            {linkListMapRender}
                            <Box display={'flex'} flexDirection={'column'} width={168}>
                                <Typography color="var(--color-text-third)"
                                            variant="body2" component="p" sx={{mt: 4, mb: 2}}>Follow us</Typography>
                                <Box>
                                    {medias}
                                </Box>
                            </Box>
                        </Box>

                    </Box>
                    <Typography fontSize={12}  component={'p'} textAlign={'center'}  paddingBottom={2}
                                color={'var(--color-text-third)'}>© 2017 Loopring Technology Limited. All rights reserved.</Typography>
                </>
            )}
        </Container>
        {!isLandingPage &&
        <Box height={48} display={'flex'} justifyContent={'center'} alignItems={'center'} width={'100%'}
             style={{backgroundColor: mode === 'light' ? 'rgba(59, 90, 244, 0.05)' : 'rgba(255, 255, 255, 0.05)'}}>
          <Container> <Box display={'flex'} flex={1} width={'100%'} justifyContent={'space-between'}
                                     alignItems={'center'}>
              <Typography fontSize={12} component={'span'} color={'var(--color-text-third)'} paddingLeft={2}>© 2017 Loopring Technology Limited. All rights reserved.</Typography>
              <Box>
                  {medias}
              </Box>
            </Box> </Container>

        </Box>  }
    </FooterDiv>
})
