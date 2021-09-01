import { Trans, WithTranslation } from "react-i18next"
import { DepositBase, IconType, PanelProps } from "./BasicPanel"

// symbol
export const Deposit_Approve_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_Approve_WaitForAuth'}>
            Waiting for {props.symbol} Deposit Approve
        </Trans>
    }
    return <DepositBase {...props} {...propsPatch} />
}

// symbol
export const Deposit_Approve_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_Approve_Denied'}>
            {props.symbol} Approve denied by user.
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// symbol
export const Deposit_Approve_Submited = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.SubmitIcon,
        describe1: <Trans i18nKey={'label_Approve_Submited'}>
            {props.symbol} Approve submitted.
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_Deposit_WaitForAuth'}>
            Please Confirm to Deposit {props.value}{props.symbol}
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_Deposit_Denied'}>
            Deposit {props.value}{props.symbol} denied by user
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.FailedIcon,
        describe1: <Trans i18nKey={'label_Deposit_Failed'}>
            Deposit {props.value}{props.symbol} failed
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Submited = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.SubmitIcon,
        describe1: <Trans i18nKey={'label_Deposit_Submited'}>
            Deposit {props.value}{props.symbol} submitted
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}
