import { Trans, WithTranslation } from "react-i18next"
import { DepositBase, IconType, PanelProps } from "./BasicPanel"

// symbol
export const Deposit_Approve_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'labelApproveWaitForAuth'}>
            Waiting for {props.symbol} Deposit Approve
        </Trans>
    }
    return <DepositBase {...props} {...propsPatch} />
}

// symbol
export const Deposit_Approve_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'labelApproveDenied'}>
            {props.symbol} Approve denied by user.
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// symbol
export const Deposit_Approve_Submit = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.SubmitIcon,
        describe1: <Trans i18nKey={'labelApproveSubmit'}>
            {props.symbol} Approve submitted.
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: props.t('labelDepositWaitForAuth',{symbol:props.symbol})
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: props.t('labelDepositDenied',{symbol:props.symbol})
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.FailedIcon,
        describe1: <Trans i18nKey={'labelDepositFailed'}>
            Deposit {props.value}{props.symbol} failed
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Submit = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.SubmitIcon,
        describe1: <Trans i18nKey={'labelDepositSubmit'}>
            Deposit {props.value}{props.symbol} submitted
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}
