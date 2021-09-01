import { Trans, WithTranslation } from "react-i18next"
import { IconType, PanelProps, WithdrawBase } from "./BasicPanel"

// value symbol
export const Withdraw_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_WaitForAuth'}>
    </Trans>
    }
    return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_First_Method_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_First_Method_Denied'}>
    </Trans>
    }
    return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_User_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_Denied'}>
    </Trans>
    }
    return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_In_Progress = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_Withdraw_In_Progress'}>
    </Trans>
    }
    return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_Success = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.DoneIcon,
        describe1: <Trans i18nKey={'label_Withdraw_Success'}>
        Withdraw {props.value}{props.symbol} successfully!
    </Trans>
    }
    return <WithdrawBase {...propsPatch} {...props} />
}

// value symbol
export const Withdraw_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.FailedIcon,
        describe1: <Trans i18nKey={'label_Withdraw_Failed'}>
        Withdraw {props.value}{props.symbol} failed!
    </Trans>
    }
    return <WithdrawBase {...propsPatch} {...props} />
}
