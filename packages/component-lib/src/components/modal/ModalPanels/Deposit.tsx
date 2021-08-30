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
export const Deposit_Approve_Refused = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_Approve_Refused'}>
            {props.symbol} Approve Refused by user.
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// symbol
export const Deposit_Approve_Submited = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.SubmitIcon,
        describe1: <Trans i18nKey={'label_Approve_Submited'}>
            {props.symbol} Auth Submited.
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_Deposit_WaitForAuth'}>
            Please Confirm to Deposit{props.value}{props.symbol}
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Refused = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_Deposit_Refused'}>
            Deposit{props.value} {props.symbol} has been refused by user
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.FailedIcon,
        describe1: <Trans i18nKey={'label_Deposit_Failed'}>
            {props.value} {props.symbol} Deposit Failed.
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Submited = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.SubmitIcon,
        describe1: <Trans i18nKey={'label_Deposit_Submited'}>
            {props.value} {props.symbol} Deposit Submited.
        </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}
