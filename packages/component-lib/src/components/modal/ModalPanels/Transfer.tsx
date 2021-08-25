import { Trans, WithTranslation } from "react-i18next"
import { IconType, PanelProps, TransferBase } from "./BasicPanel"

// value symbol
export const Transfer_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_Transfer_WaitForAuth'}>
        Waiting for Confirm Transfer {props.value} {props.symbol}.
    </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_Refused = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_Transfer_Refused'}>
        {props.value} {props.symbol} Transfer User Refused.
    </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_Submited = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.SubmitIcon,
        describe1: <Trans i18nKey={'label_Transfer_Submited'}>
        { props.value } {props.symbol} Transfer Submited.
    </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_Success = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.DoneIcon,
        describe1: <Trans i18nKey={'label_Transfer_Success'}>
        { props.value } {props.symbol} Transfer Success.
    </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.FailedIcon,
        describe1: <Trans i18nKey={'label_Transfer_Failed'}>
        { props.value } {props.symbol} Transfer Failed.
    </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}
