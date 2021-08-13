import { Box, Button, Typography } from '@material-ui/core/';
import { CopyIcon, getShortAddr, LinkIcon, ReverseIcon, } from '@loopring-web/common-resources';
import { Trans, WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { AccountBaseProps } from './Interface';
import { boxLiner, PopoverPure, VipStyled } from '../../../';
import { bindHover, bindPopover } from 'material-ui-popup-state/es';
import { usePopupState } from 'material-ui-popup-state/hooks';
import QRCode from 'qrcode.react';
const PopStyle = styled(Box)`
  ${({theme})=>boxLiner({theme})}
  border-radius: ${({theme})=>theme.unit/2}px
`
const BoxStyled = styled(Box)`
  // .MuiLink-root {
  //   height: 2rem;
  //   line-height: 2rem;
  //   color: var(--color-text-secondary);
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
      color: var(--color-error);;
    }
  }

  & .lock {
    svg {
      color: var(--color-success);;
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
                                t,
                            }: AccountBaseProps & WithTranslation) => {
    const addressShort = getShortAddr(accAddress)
    const etherscanLink = etherscanUrl + accAddress;
    const connectBy = connectName === 'unknown' ? t('labelWrongNetwork') : connectName;
    const popupState = usePopupState({
        variant: 'popover',
        popupId: 'myAddress',
    })
    return <Box display={'flex'} flexDirection={'column'} justifyContent={'flex-start'} alignItems={'center'}>
        <Typography variant={'body2'} color={'textSecondary'} marginTop={3}>
            <Trans i18nKey="labelConnectBy" tOptions={{connectBy}}>
                Connected with <Typography variant={'body2'} component={'span'}>{connectName}</Typography>.
            </Trans>
        </Typography>
        <Typography  {...bindHover(popupState)} marginTop={1} display={'flex'} alignItems={'center'}
                     justifyContent={'flex-start'}>
            <Typography component={'span'} variant={'h1'}>{addressShort}</Typography>
            {level ? <VipStyled component={'span'} variant={'body2'}
            >{level}</VipStyled> : undefined}
        </Typography>
        <PopoverPure
            className={'_arrow-top-center'}
            {...bindPopover(popupState)}
            {...{
                anchorOrigin: {vertical: 'top', horizontal: 'center'},
                transformOrigin: {vertical: 'bottom', horizontal: 'center'}
            }}
        >
            <PopStyle paddingTop={2} paddingX={2} width={180} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
                {/*<QRCodePanel {...{*/}
                {/*    ...rest, t, title: '', description: '',*/}
                {/*    url: etherscanLink*/}
                {/*}} />*/}
                <QRCode value={etherscanLink} size={80} style={{ backgroundColor: '#fff'}} aria-label={`link:${etherscanLink}`}/>
                <Typography  marginTop={2}  variant={'body2'} color={'textSecondary'} style={{wordBreak:'break-all'}}>{accAddress}</Typography>
                <Button onClick={() => {
                    if (onCopy) onCopy()
                }}>
                    <Typography variant={'body2'} > {t('labelCopyAddress')} </Typography>
                </Button>
            </PopStyle>

        </PopoverPure>


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
            {/* <Button startIcon={<ReverseIcon fontSize={'small'}/>} onClick={() => {
                if (onSwitch) onSwitch()
            }}>
                <Typography variant={'body2'} marginTop={1 / 2}>  {t('labelSwitchAccount')} </Typography>
            </Button> */}
            <Button startIcon={<ReverseIcon fontSize={'small'}/>} onClick={() => {
                if (onDisconnect) onDisconnect()
            }}>
                <Typography variant={'body2'} marginTop={1 / 2}>  {t('labelDisconnect')} </Typography>
            </Button>
        </BoxStyled>
    </Box>
}