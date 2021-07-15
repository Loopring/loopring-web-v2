import { Box, Grid, IconButton, Typography } from '@material-ui/core/';
import { ActiveIcon, CopyIcon, LinkIcon, PowerIcon, ReverseIcon } from '@loopring-web/common-resources';
import { Trans, withTranslation, WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { AccountInfoProps, Button, TypographyStrong, VipStyled } from '../';
import QRCode from 'qrcode.react';


const BoxStyled = styled(Box)`
  // .MuiLink-root {
  //   height: 2rem;
  //   line-height: 2rem;
  //   color: ${({theme}) => theme.colorBase.textSecondary};
  //
  //  
  // }                                                               
  &  .MuiButton-root{
        width: var(--account-button-fixed-width);
        height: var(--account-button-fixed-height);
        text-overflow: ellipsis;
        align-items: flex-end;
        position: relative;
        svg{
          position: absolute;
          top: ${({theme}) => theme.unit}px;
          left: 50%;
          margin-left: calc(var(--svg-size-large) / -2) ;
        }
  }
  & .active{
   
  }
  & .unlock{
    svg{
      color:  ${({theme}) => theme.colorBase.error};;
    }
  }
  & .lock{
    svg{
      color: ${({theme}) => theme.colorBase.success};;
    }
  }
` as typeof Box

export const AccountInfo = withTranslation('common')(({
                                                          address,
                                                          addressShort,
                                                          level,
                                                          connectBy,
                                                          etherscanLink,
                                                          onDisconnect,
                                                          onSwitch,
                                                          onLock,
                                                          mainBtn,
                                                          onCopy,
                                                          // onViewQRCode,
                                                          t
                                                      }: AccountInfoProps & WithTranslation) => {

    return <Grid container justifyContent={'space-between'} alignItems={'center'}>
        <Grid item xs={12} display={'flex'} flexDirection={'column'} alignItems={'flex-start'} paddingX={3}>
            <Typography component={'p'} display={'flex'} alignItems={'center'} justifyContent={'flex-start'}>
                <Typography component={'span'} variant={'h4'}>{addressShort}</Typography>
                {level ? <VipStyled component={'span'} variant={'body2'}
                                    alignSelf={'flex-start'}>{level}</VipStyled> : undefined}
            </Typography>
            <Typography component={'h6'} variant={'body2'} marginTop={1}>
                <Trans i18nKey="labelConnectBy">
                    Connected with <TypographyStrong component={'span'}>{connectBy}</TypographyStrong>.
                </Trans>
            </Typography>
            <Box alignSelf={'center'} marginY={2} display={'flex'} alignItems={'center'} flexDirection={'column'}>
                <QRCode value={address} size={160} style={{padding: 5, backgroundColor: '#fff'}}
                        aria-label={`link:${address}`}/>
                <Typography component={'span'} variant={'body2'}>
                    <Typography variant={'body2'} marginBottom={3} marginTop={1}>
                        {address}
                        <IconButton size={'small'} data-clipboard-text={address} onClick={() => {
                            if (onCopy) onCopy()
                        }}><CopyIcon/></IconButton>
                    </Typography>
                </Typography>
            </Box>
            <BoxStyled component={'div'} display={'flex'} alignItems={'center'} justifyContent={'space-between'}
                       marginTop={1} alignSelf={'stretch'}>
                <Button href={etherscanLink} variant={'outlined'} startIcon={<LinkIcon fontSize={'large'}/>}>
                    <Typography variant={'body2'} marginTop={1 / 2}> {'Etherscan'} </Typography>
                </Button>
                <Button startIcon={<ReverseIcon fontSize={'large'}/>} onClick={() => {
                    if (onSwitch) onSwitch()
                }} variant={'outlined'}>
                    <Typography variant={'body2'} marginTop={1 / 2}>  {t('labelSwitchAccount')} </Typography>
                </Button>
                <Button startIcon={<PowerIcon fontSize={'large'}/>} onClick={() => {
                    if (onDisconnect) onDisconnect()
                }} variant={'outlined'}>
                    <Typography variant={'body2'} marginTop={1 / 2}>  {t('labelDisconnect')} </Typography>
                </Button>
                {mainBtn ? mainBtn :
                    <Button className={'active'} variant={'contained'} startIcon={<ActiveIcon fontSize={'large'}/>}
                            onClick={() => {
                                if (onLock) onLock()
                            }}>
                        <Typography variant={'body2'} marginTop={1 / 2}>  {t('labelActiveLayer2')} </Typography>
                    </Button>}
            </BoxStyled>
        </Grid>
    </Grid>;

})

