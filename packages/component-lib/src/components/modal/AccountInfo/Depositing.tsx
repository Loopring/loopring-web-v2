import { Box, Typography } from '@material-ui/core';
import { LinkIcon, LoadingIcon } from '@loopring-web/common-resources';
import {  WithTranslation } from 'react-i18next';
import { Link } from '@material-ui/core/';

export const Depositing =  ({t,label='depositTitleAndActive',etherscanLink,count=30}: WithTranslation &{label?:'labelDepositing'|'depositTitleAndActive',etherscanLink:string,count?:number}) => {
    // const Describe = React.useMemo(()=>{
    //     switch (providerName){
    //         case  ConnectProviders.MetaMask:
    //             return <Trans i18nKey={'labelMetaMaskProcessDescribe'}>
    //                 {/*Please adding MetaMask to your browser,*/}
    //                 Please click approve button on MetaMask popup window.
    //                 When MetaMask dialog is dismiss,
    //                 please manually click <img  alt="MetaMask" style={{verticalAlign:'middle'}} src={'static/images/MetaMaskPlugIn.png'}/> on your browser toolbar.
    //             </Trans>
    //         case  ConnectProviders.WalletConnect:
    //             return <Trans i18nKey={'labelWalletConnectProcessDescribe2'}>
    //                 Please click approve on your device.</Trans>
    //     }
    // },[providerName])
    return <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'space-evenly'}
                flexDirection={'column'}>
        <Typography component={'h3'} variant={'h2'} marginBottom={3}>{t(label)}</Typography>
        <Typography component={'p'} display={'flex'} alignItems={'center'} flexDirection={'column'}>
            <LoadingIcon color={'primary'} style={{width:60,height:60}}/>
        </Typography>
        <Typography color={'textSecondary'} component={'span'} paddingY={1}>{t('labelDepositingProcessing',{count})}</Typography>
        <Link target='_blank'  href={etherscanLink} display={'inline-block'}  marginTop={1 / 2}>
            <Typography variant={'body2'}>  <LinkIcon fontSize={'small'}  style={{verticalAlign:'middle'}} /> {'Etherscan'} </Typography>
        </Link>
        {/*<Typography variant={'body2'} color={'textSecondary'} component={'p'} marginTop={3} alignSelf={'flex-start'} paddingX={6} >*/}
        {/*    {Describe}*/}
        {/*</Typography>*/}

    </Box>
}
