import { Trans, WithTranslation } from "react-i18next"
import { IconType, PanelProps, TransferBase } from "./BasicPanel"

// value symbol
export const Transfer_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_WaitForAuth'}>
        </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_First_Method_Refused = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_First_Method_Refused'}>
            Transfer_First_Method_Refused.
        </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_User_Refused = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_Refused'}>
        </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_In_Progress = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_Transfer_In_Progress'}>
        </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_Success = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.DoneIcon,
        describe1: <Trans i18nKey={'label_Transfer_Success'}>
        Transfer {props.value}{props.symbol} successfully!
        </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}

// value symbol
export const Transfer_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.FailedIcon,
        describe1: <Trans i18nKey={'label_Transfer_Failed'}>
            Transfer {props.value}{props.symbol} failed!
        </Trans>
    }
    return <TransferBase {...propsPatch} {...props} />
}
