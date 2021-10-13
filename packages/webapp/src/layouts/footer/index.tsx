import styled from '@emotion/styled/macro'
import { Box, Button, Container, Grid, Link, List, ListItem, Typography } from '@mui/material';
import { LoopringDarkFooterIcon, LoopringLightFooterIcon,YoutubeIcon,TwitterIcon,MediumIcon,DiscordIcon,DropDownIcon, myLog } from '@loopring-web/common-resources';
import { WithTranslation, withTranslation } from 'react-i18next';
import { useTheme } from '@emotion/react';

const FooterDiv = styled(Box)`
@media screen and (max-width: 1280px) {


}
font-size: 1.4rem;
.MuiListItem-root{
padding: 0;
width: auto;
max-width: initial;
:hover{
background:  var(--opacity);
}
a{
color:var(--color-text-secondary) 
}
}
`

const Footer = withTranslation(['layout'])(({t}: any) => {
    const {mode} = useTheme()
    myLog(mode)

return <FooterDiv component={'footer'}  fontSize={'body1'}>
    <Container>
    <Grid container direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Grid justifyContent="flex-start" item xs={12} md={1} lg={1}>    
        <Box>
            {mode === 'light' ? 
            <Link color="textSecondary" paddingX={0.5} target={'_blank'} href="https://medium.com/loopring-protocol"><LoopringLightFooterIcon style={{transform: 'scale(11)'}}/></Link> : <Link color="textSecondary" paddingX={0.5} target={'_blank'} href="https://medium.com/loopring-protocol"><LoopringDarkFooterIcon style={{transform: 'scale(11)'}}/></Link> 
            }             
        </Box>
        </Grid>
        <Grid item xs={12} md={7} lg={7} container direction="row" justifyContent="space-around" alignItems="flex-start" spacing={1}>
        <Grid>
        <List>
        <Typography color="textThird" sx={{ mt: 4, mb: 2 }} fontSize='12px' variant="h6" component="div"> {t('Loopring')} </Typography>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://loopring.org/#/home">{t('About')}</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://loopring.pro/#/legal/terms/en">{t('Terms')}</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://loopring.pro/#/legal/privacy/en">{t('Privacy')}</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://loopring.org/#/blog">{t('News')}</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://loopring.pro/#/legal/risks/en">{t('Risk')}</Link>            
            </ListItem>
        </List>
        </Grid>
        <Grid>
        <List>
        <Typography color="textThird" sx={{ mt: 4, mb: 2 }} fontSize='12px' variant="h6" component="div"> {t('Service')} </Typography>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://loopring.pro/#/embed/wallet_fees_en">Fees</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://medium.com/loopring-protocol">VIP</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://medium.com/loopring-protocol">Referral</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://loopringexchange.typeform.com/to/T0bgsodw?typeform-source=medium.com">Listing Application</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://www.loopringgrants.org/">Creator Grants</Link>            
            </ListItem>
        </List>
        </Grid>
        <Grid>
        <List>
        <Typography color="textThird" sx={{ mt: 4, mb: 2 }} fontSize='12px' variant="h6" component="div"> {t('Support')} </Typography>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://github.com/Loopring/loopring-web-v2/issues/new">Feedback</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://loopring-org.gitbook.io/en/">Loopring Tutorial</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://loopring-org.gitbook.io/loopring-doc/">Community Docs</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://discord.gg/RCus8aNB">Support Center</Link>            
            </ListItem>
        </List>
        </Grid>
        <Grid>
        <List>
        <Typography color="textThird" sx={{ mt: 4, mb: 2 }} fontSize='12px' variant="h6" component="div"> {t('Product')} </Typography>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://loopring.pro/#/legal/contracts/en">Smart Contract</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://exchange.loopring.io/">Loopring DEX</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://loopring.io/#/">Loopring Smart Wallet</Link>            
            </ListItem>
            <ListItem>
            <Link color="textSecondary" target={'_blank'} fontSize='12px' href="https://docs.loopring.io/en/">API Documentation</Link>            
            </ListItem>
        </List>
        </Grid>     
        </Grid>
        <Grid justifyContent="flex-end"     item xs={12} md={1} lg={1}>
        <Grid container direction="row" justifyContent="flex-start" alignItems="flex-start" item xs={12} md={12} lg={12}>
        <Grid item xs={12} md={12} lg={12}>
        <Typography color="textThird"  variant="h6" component="div"> Follow us </Typography>
        </Grid>   
        <Grid item xs={12} md={12} lg={12}>
        <List style={{display:'flex',alignItems:'flex-start'}}>
            <ListItem>
            <Link paddingX={0.5} target={'_blank'} fontSize='12px' href="https://discord.com/invite/KkYccYp"><DiscordIcon style={{transform: 'scale(1.2)'}}/></Link>            
            <Link paddingX={0.5} target={'_blank'} fontSize='12px' href="https://twitter.com/loopringorg"><TwitterIcon style={{transform: 'scale(1.2)'}}/></Link>            
            <Link paddingX={0.5} target={'_blank'} fontSize='12px' href="https://www.youtube.com/c/Loopring"><YoutubeIcon style={{transform: 'scale(1.2)'}}/></Link>            
            <Link paddingX={0.5} target={'_blank'} fontSize='12px' href="https://medium.com/loopring-protocol"><MediumIcon style={{transform: 'scale(1.2)'}}/></Link>            
            </ListItem>
        </List>
        </Grid>   
        </Grid>    
        </Grid>
    </Grid> 
    
        <Typography component={'p'}  variant={'body2'} paddingTop={2} textAlign={'center'}>
            <Typography style={{fontSize:'9px'}} component={'span'}>Copyright (c) 2017-{new Date().getFullYear()}.</Typography>
            <Typography style={{fontSize:'9px'}} component={'span'}>All rights reserved.</Typography>
        </Typography>
        {/* <Typography component={'p'}  variant={'body2'} paddingTop={1} paddingBottom={2}  textAlign={'center'}> */}
            {/* <Link target={'_blank'} href={'https://github.com/Loopring/loopring-web-v2/issues/new'}> let me report issue ^. ^</Link> */}
        {/* </Typography> */}
    </Container>
</FooterDiv>
})

export default Footer
