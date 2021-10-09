import {  WithTranslation } from "react-i18next"
import { DepositBase, IconType, PanelProps } from "./BasicPanel"

// symbol
export const Deposit_Approve_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: props.t('labelTokenAccess',{symbol:props.symbol})
    }
    return <DepositBase {...props} {...propsPatch} />
}

// symbol
export const Deposit_Approve_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1:props.t('labelFailedTokenAccess',{symbol:props.symbol,value:props.value})
    }
    return <DepositBase {...propsPatch} {...props} />
}

// symbol
export const Deposit_Approve_Submit = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.SubmitIcon,
        describe1: props.t('labelSuccessTokenAccess',{symbol:props.symbol,value:props.value})
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: props.t('labelDepositWaitForAuth',{symbol:props.symbol,value:props.value})
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: props.t('labelDepositDenied',{symbol:props.symbol ,value:props.value})
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.FailedIcon,
        describe1:  props.t('labelDepositFailed',{symbol:props.symbol,value:props.value})
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Submit = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.SubmitIcon,
        describe1:props.t('labelDepositSubmit',{symbol:props.symbol,value:props.value})
    }
    return <DepositBase {...propsPatch} {...props} />
}
