import { Trans, WithTranslation } from "react-i18next"
import { ConnectProviders } from "@loopring-web/common-resources"
import { ConnectBase, IconType, PanelProps } from "./BasicPanel"

// value symbol
export const MetaMask_Connect_In_Progress = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        providerName: ConnectProviders.MetaMask,
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_MetaMask_Connect_In_Progress'}>
        </Trans>
    }
    return <ConnectBase {...propsPatch} {...props} />
}

export const WalletConnect_Connect_In_Progress = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        providerName: ConnectProviders.WalletConnect,
        iconType: IconType.LoadingIcon,
        describe1: <Trans i18nKey={'label_WalletConnect_Connect_In_Progress'}>
        </Trans>
    }
    return <ConnectBase {...propsPatch} {...props} />
}

// value symbol
export const Connect_Success = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        providerName: undefined,
        iconType: IconType.DoneIcon,
        describe1: <Trans i18nKey={'label_Connect_Success'}>
        </Trans>
    }
    return <ConnectBase {...propsPatch} {...props} />
}

// value symbol
export const Connect_Failed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        providerName: undefined,
        iconType: IconType.FailedIcon,
        describe1: <Trans i18nKey={'label_Connect_Failed'}>
        </Trans>
    }
    return <ConnectBase {...propsPatch} {...props} />
}
