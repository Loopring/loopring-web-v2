import { Trans, WithTranslation } from "react-i18next"
import { IconType, PanelProps, WithdrawBase } from "./BasicPanel"

// value symbol
export const Withdraw_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_Withdraw_WaitForAuth'}>
        Waiting for Confirm Withdraw {props.value} {props.symbol}.
    </Trans>
    }
    return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_First_Method_Refused = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_Withdraw_First_Method_Refused'}>
        Withdraw_First_Method_Refused.
    </Trans>
    }
    return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_User_Refused = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_Withdraw_User_Refused'}>
        {props.value} {props.symbol} Withdraw User Refused.
    </Trans>
    }
    return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_In_Progress = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_Withdraw_In_Progress'}>
        { props.value } {props.symbol} Withdraw In Progress.
    </Trans>
    }
    return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_Success = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.DoneIcon,
        describe1: <Trans i18nKey={'label_Withdraw_Success'}>
        { props.value } {props.symbol} Withdraw Success.
    </Trans>
    }
    return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.FailedIcon,
        describe1: <Trans i18nKey={'label_Withdraw_Failed'}>
        { props.value } {props.symbol} Withdraw Failed.
    </Trans>
    }
    return <WithdrawBase {...propsPatch} {...props} />
}
