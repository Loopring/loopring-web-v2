import { Trans, WithTranslation } from "react-i18next"
import { IconType, PanelProps, TransferBase } from "./BasicPanel"

// value symbol
export const Transfer_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: props.t('labelWaitForAuth')
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_First_Method_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'labelFirstSignDenied'}>
            Transfer_First_Method_Denied.
        </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_User_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'labelSignDenied'}>
        </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_In_Progress = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'labelTransferInProgress'}>
        </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_Success = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.DoneIcon,
        describe1: <Trans i18nKey={'labelTransferSuccess'}>
        Transfer {props.value}{props.symbol} successfully!
        </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.FailedIcon,
        describe1: <Trans i18nKey={'labelTransferFailed'}>
            Transfer {props.value}{props.symbol} failed!
        </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}
