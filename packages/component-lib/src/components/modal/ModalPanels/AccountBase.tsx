import { Box, Button, Typography } from '@material-ui/core/';
import { CopyIcon, getShortAddr, LinkIcon, ReverseIcon, } from '@loopring-web/common-resources';
import { Trans, WithTranslation } from 'react-i18next';
import styled from '@emotion/styled';
import { AccountBaseNewProps } from './Interface';
import {
    VipStyled 
} from '../../../';

const BoxStyled = styled(Box)`

  & .MuiButton-root {
    color: var(--color-text-secondary);

    &:hover {
      color: var(--color-text-primary);
    }
  }

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

export const AccountBasePanel = ({
                                onDisconnect,
                                accAddress,
                                level,
                                connectName,
                                etherscanUrl,
                                onCopy,
                                t,
                            }: AccountBaseNewProps & WithTranslation) => {
    const addressShort = getShortAddr(accAddress)
    const etherscanLink = etherscanUrl + accAddress;
    const connectBy = connectName === 'unknown' ? t('labelWrongNetwork') : connectName;
    // const popupState = usePopupState({
    //     variant: 'popover',
    //     popupId: 'myAddress',
    // })
    return <Box display={'flex'} flexDirection={'column'} justifyContent={'flex-start'} alignItems={'center'}>
        <Typography variant={'body2'} color={'textSecondary'} marginTop={3}>
            <Trans i18nKey="labelConnectBy" tOptions={{connectBy}}>
                Connected with <Typography variant={'body2'} component={'span'}>{connectName}</Typography>.
            </Trans>
        </Typography>
        <Typography marginTop={1} display={'flex'} alignItems={'center'}
                     justifyContent={'flex-start'}>
            <Typography component={'span'} variant={'h1'}>{addressShort}</Typography>
            {level ? <VipStyled component={'span'} variant={'body2'}
            >{level}</VipStyled> : undefined}
        </Typography>

        <BoxStyled component={'div'} display={'flex'} alignItems={'center'} justifyContent={'space-between'}
                   marginTop={1} alignSelf={'stretch'}>
            <Button target={'_blank'} href={etherscanLink} startIcon={<LinkIcon fontSize={'small'}/>}>
                <Typography variant={'body2'} marginTop={1 / 2}> {'Etherscan'} </Typography>
            </Button>
            <Button startIcon={<CopyIcon fontSize={'small'}/>} onClick={() => {
                if (onCopy) onCopy()
            }}>
                <Typography variant={'body2'} marginTop={1 / 2}> {t('labelCopyClipBoard')} </Typography>
            </Button>

            {/* <Button startIcon={<ReverseIcon fontSize={'small'}/>} onClick={() => {
                if (onSwitch) onSwitch()
            }}>   labelCopyAddress
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