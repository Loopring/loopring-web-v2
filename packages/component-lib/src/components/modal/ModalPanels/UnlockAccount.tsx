import { Trans, WithTranslation } from "react-i18next"
import { UnlockAccountBase, IconType, PanelProps } from "./BasicPanel"

// symbol
export const UnlockAccount_WaitForAuth = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_WaitForAuth'}>
        </Trans>
    }
    return <UnlockAccountBase {...props} {...propsPatch} />
}

export const UnlockAccount_User_Denied = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.RefuseIcon,
        describe1: <Trans i18nKey={'label_Denied'}>
        </Trans>
    }
    return <UnlockAccountBase {...propsPatch} {...props} />
}

// symbol
export const UnlockAccount_Success = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.DoneIcon,
        describe1: <Trans i18nKey={'label_UnlockAccount_Success'}>
        </Trans>
    }
    return <UnlockAccountBase {...propsPatch} {...props} />
}

// value symbol
export const UnlockAccount_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        iconType: IconType.FailedIcon,
        describe1: <Trans i18nKey={'label_UnlockAccount_Failed'}>
        </Trans>
    }
    return <UnlockAccountBase {...propsPatch} {...props} />
}
