import { Box, Button, Typography } from '@material-ui/core/';
import { CopyIcon, getShortAddr, LinkIcon, ReverseIcon, } from '@loopring-web/common-resources';
import { Trans, WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { AccountBaseProps } from './Interface';
import { VipStyled } from '../../../';

const BoxStyled = styled(Box)`
  // .MuiLink-root {
  //   height: 2rem;
  //   line-height: 2rem;
    //   color: ${({theme}) => theme.colorBase.textSecondary};
  //
  //  
  // }                                                               
  // &  .MuiButton-root{
  //       width: var(--account-button-fixed-width);
  //       height: var(--account-button-fixed-height);
  //       text-overflow: ellipsis;
  //       align-items: flex-end;
  //       position: relative;
  //       svg{
  //         position: absolute;
    //         top: ${({theme}) => theme.unit}px;
  //         left: 50%;
  //         margin-left: calc(var(--svg-size-large) / -2) ;
  //       }
  // }
  & .active {

  }

  & .unlock {
    svg {
      color: ${({theme}) => theme.colorBase.error};;
    }
  }

  & .lock {
    svg {
      color: ${({theme}) => theme.colorBase.success};;
    }
  }
` as typeof Box

export const AccountBase = ({
                                onSwitch,
                                onDisconnect,
                                accAddress,
                                level,
                                connectName,
                                etherscanUrl,
                                onCopy,
                                // onViewQRCode,
                                t
                            }: AccountBaseProps & WithTranslation) => {
    const addressShort = getShortAddr(accAddress)
    const etherscanLink = etherscanUrl + accAddress;
    const connectBy = connectName === 'unknown' ?  t('labelWrongNetwork'): connectName;
    return <Box display={'flex'} flexDirection={'column'} justifyContent={'flex-start'} alignItems={'center'}>
        <Typography  variant={'body2'} color={'textSecondary'} marginTop={3}>
            <Trans i18nKey="labelConnectBy" tOptions={{connectBy}}  >
                Connected with <Typography variant={'body2'} component={'span'}>{connectName}</Typography>.
            </Trans>
        </Typography>
        <Typography marginTop={1} display={'flex'} alignItems={'center'} justifyContent={'flex-start'}>
            <Typography component={'span'} variant={'h1'}>{addressShort}</Typography>
            {level ? <VipStyled component={'span'} variant={'body2'}
                                >{level}</VipStyled> : undefined}
        </Typography>
        <BoxStyled component={'div'} display={'flex'} alignItems={'center'} justifyContent={'space-between'}
                   marginTop={1} alignSelf={'stretch'}>
            <Button formTarget={'_blank'} href={etherscanLink} startIcon={<LinkIcon fontSize={'small'}/>}>
                <Typography variant={'body2'} marginTop={1 / 2}> {'Etherscan'} </Typography>
            </Button>
            <Button startIcon={<CopyIcon fontSize={'small'}/>} onClick={() => {
                if (onCopy) onCopy()
            }}>
                <Typography variant={'body2'} marginTop={1 / 2}> {t('labelCopyAddress')} </Typography>
            </Button>
            <Button startIcon={<ReverseIcon fontSize={'small'}/>} onClick={() => {
                if (onSwitch) onSwitch()
            }}>
                <Typography variant={'body2'} marginTop={1 / 2}>  {t('labelSwitchAccount')} </Typography>
            </Button>
            <Button startIcon={<ReverseIcon fontSize={'small'}/>} onClick={() => {
                if (onDisconnect) onDisconnect()
            }}>
                <Typography variant={'body2'} marginTop={1 / 2}>  {t('labelDisconnect')} </Typography>
            </Button>
        </BoxStyled>
    </Box>
}