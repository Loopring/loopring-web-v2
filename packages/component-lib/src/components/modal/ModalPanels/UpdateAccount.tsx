import { Trans, WithTranslation } from "react-i18next"
import { UpdateAccountBase, IconType, PanelProps } from "./BasicPanel"
import { Box, Typography } from '@material-ui/core/';
import { AnimationArrow, Button } from '../../../index';
import { AccountBasePanel,AccountBaseProps, } from './index';

export const UpdateAccount = ({
    t,
    goUpdateAccount,
    ...props
}: WithTranslation &AccountBaseProps & { goUpdateAccount?: () => void }) => {
    return <Box flex={1} display={'flex'} flexDirection={'column'} justifyContent={'space-between'}
        alignItems={'center'}>
        <AccountBasePanel {...props} t={t} />
        <Box display={'flex'} marginTop={2} alignSelf={'stretch'} paddingX={5} flexDirection={'column'} alignItems={'center'}>
            <Typography variant={'body2'} >
                {t('labelActivatedAccountDeposit')}
            </Typography>
            <AnimationArrow className={'arrowCta'} />
            <Button variant={'contained'} fullWidth size={'medium'} onClick={() => {
                if (goUpdateAccount) {
                    goUpdateAccount()
                }
            }}>{t('labelActivateAccount')} </Button>
        </Box>
    </Box>
}

// symbol
export const UpdateAccount_Approve_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: props.t('labelTokenAccess',{symbol:props.symbol})
    }
    return <UpdateAccountBase {...props} {...propsPatch} />
}

export const UpdateAccount_First_Method_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'labelFirstSignDenied'}>
        </Trans>
    }
    return <UpdateAccountBase {...propsPatch} {...props} />
}

export const UpdateAccount_User_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'labelSignDenied'}>
        </Trans>
    }
    return <UpdateAccountBase {...propsPatch} {...props} />
}

// symbol
export const UpdateAccount_Success = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.DoneIcon,
        describe1: <Trans i18nKey={'labelUpdateAccountSuccess'}>
        </Trans>,
        describe2: <Trans i18nKey={'labelUpdateAccountSuccess2'}>
        </Trans>
    }
    return <UpdateAccountBase {...propsPatch} {...props} />
}

// value symbol
export const UpdateAccount_Submit = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.SubmitIcon,
        describe1: props.t('labelUpdateAccountSubmit')
    }
    return <UpdateAccountBase {...propsPatch} {...props} />
}

// value symbol
export const UpdateAccount_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.FailedIcon,
        describe1: <Trans i18nKey={'labelUpdateAccountFailed'}>
            {props.value} {props.symbol} Update Account Failed.
        </Trans>
    }
    return <UpdateAccountBase {...propsPatch} {...props} />
}
