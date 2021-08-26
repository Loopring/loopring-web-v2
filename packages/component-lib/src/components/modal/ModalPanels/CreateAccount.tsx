import { Trans, WithTranslation } from "react-i18next"
import { CreateAccountBase, IconType, PanelProps } from "./BasicPanel"

// symbol
export const CreateAccount_Approve_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_CreateAccount_Approve_WaitForAuth'}>
        Waiting for {props.symbol} Auth.
        </Trans>
    }
    return <CreateAccountBase {...props} {...propsPatch} />
}

// symbol
export const CreateAccount_Approve_Refused = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_CreateAccount_Approve_Refused'}>
        {props.symbol} Auth User Refused.
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
export const CreateAccount_Refused = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_CreateAccount_Refused'}>
        {props.value} {props.symbol} CreateAccount User Refused.
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
