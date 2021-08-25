import { Trans, WithTranslation } from "react-i18next"
import { DepositBase, IconType, PanelProps } from "./BasicPanel"

// symbol
export const Deposit_Approve_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'labelDepositApproveWaitForAuth'}>
        Waiting for {props.symbol} Auth.
        </Trans>
    }
    return <DepositBase {...props} {...propsPatch} />
}

// symbol
export const Deposit_Approve_Refused = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'labelApproveRefused'}>
        {props.symbol} Auth User Refused.
    </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// symbol
export const Deposit_Approve_Submited = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.GoodIcon,
        describe1: <Trans i18nKey={'labelApproveSubmited'}>
        {props.symbol} Auth Submited.
    </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'labelDepositWaitForAuth'}>
        Waiting for Confirm Deposit {props.value} {props.symbol}.
    </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Refused = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'labelRefused'}>
        {props.value} {props.symbol} Deposit User Refused.
    </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}

// value symbol
export const Deposit_Submited = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.GoodIcon,
        describe1: <Trans i18nKey={'labelSubmited'}>
        { props.value } {props.symbol} Deposit Submited.
    </Trans>
    }
    return <DepositBase {...propsPatch} {...props} />
}
