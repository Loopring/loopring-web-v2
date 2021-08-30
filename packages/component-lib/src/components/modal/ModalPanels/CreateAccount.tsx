import { Trans, WithTranslation } from "react-i18next"
import { CreateAccountBase, IconType, PanelProps } from "./BasicPanel"

// symbol
export const CreateAccount_Approve_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_Approve_WaitForAuth'}>
        Waiting for {props.symbol} Approve.
        </Trans>
    }
    return <CreateAccountBase {...props} {...propsPatch} />
}

// symbol
export const CreateAccount_Approve_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_Approve_Denied'}>
        {props.symbol} Approve Denied by user.
    </Trans>
    }
    return <CreateAccountBase {...propsPatch} {...props} />
}

// symbol
export const CreateAccount_Approve_Submited = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.SubmitIcon,
        describe1: <Trans i18nKey={'label_CreateAccount_Approve_Submited'}>
        {props.symbol} Auth Submited.
    </Trans>
    }
    return <CreateAccountBase {...propsPatch} {...props} />
}

// value symbol
export const CreateAccount_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_CreateAccount_WaitForAuth'}>
        Waiting for Confirm CreateAccount {props.value} {props.symbol}.
    </Trans>
    }
    return <CreateAccountBase {...propsPatch} {...props} />
}

// value symbol
export const CreateAccount_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_CreateAccount_Denied'}>
        {props.value} {props.symbol} CreateAccount User Denied.
    </Trans>
    }
    return <CreateAccountBase {...propsPatch} {...props} />
}

// value symbol
export const CreateAccount_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.FailedIcon,
        describe1: <Trans i18nKey={'label_CreateAccount_Failed'}>
        {props.value} {props.symbol} CreateAccount Failed.
    </Trans>
    }
    return <CreateAccountBase {...propsPatch} {...props} />
}

// value symbol
export const CreateAccount_Submited = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.SubmitIcon,
        describe1: <Trans i18nKey={'label_CreateAccount_Submited'}>
        { props.value } {props.symbol} CreateAccount Submited.
    </Trans>
    }
    return <CreateAccountBase {...propsPatch} {...props} />
}
