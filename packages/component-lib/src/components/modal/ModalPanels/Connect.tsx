import {  WithTranslation } from "react-i18next"
import { ConnectProviders } from "@loopring-web/common-resources"
import { ConnectBase, IconType, PanelProps } from "./BasicPanel"

// value symbol
export const MetaMaskConnectInProgress = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        providerName: ConnectProviders.MetaMask,
        iconType: IconType.LoadingIcon,
        describe1: props.t('labelMetaMaskProcessing')
    }
    return <ConnectBase {...propsPatch} {...props} />
}

export const WalletConnectConnectInProgress = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        providerName: ConnectProviders.WalletConnect,
        iconType: IconType.LoadingIcon,
        describe1:  props.t('labelWalletConnectProcessing')
    }
    return <ConnectBase {...propsPatch} {...props} />
}

// value symbol
export const ConnectSuccess = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        providerName: undefined,
        iconType: IconType.DoneIcon,
        describe1: props.t('labelSuccessConnect',{providerName:props.providerName}),
        describe2: props.t('labelSuccessConnectDescribe')
    }
    return <ConnectBase {...propsPatch} {...props} />
}

// value symbol
export const ConnectFailed = (props: PanelProps & WithTranslation) => {
    const propsPatch = {
        providerName: undefined,
        iconType: IconType.FailedIcon,
        describe1: props.t('labelFailedConnect')
    }
    return <ConnectBase {...propsPatch} {...props} />
}
