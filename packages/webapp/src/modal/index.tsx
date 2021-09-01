import { ModalPanel, Toast, useOpenModals } from '@loopring-web/component-lib';
import { ModalWalletConnectPanel } from './WalletModal';
import { ModalAccountInfo } from './AccountModal';
import { withTranslation, WithTranslation } from 'react-i18next';
import { useTransfer } from 'hooks/useractions/useTransfer';
import { useDeposit } from 'hooks/useractions/useDeposit';
import { useWithdraw } from 'hooks/useractions/useWithdraw';
import { useSystem } from '../stores/system';
import { useAccountModal } from 'hooks/useractions/useAccountModal';
import { TOAST_TIME } from '../defs/common_defs';

export const ModalGroup = withTranslation('common', {
    withRef: true,

})(({
        onAccountInfoPanelClose,
        onWalletConnectPanelClose,
        ...rest
    }:
        WithTranslation & {
        onWalletConnectPanelClose?: (event: MouseEvent) => void
        onAccountInfoPanelClose?: (event: MouseEvent) => void
    }) => {
    const {etherscanUrl} = useSystem();
    useAccountModal();
    const {modals: {isShowAccount, isShowConnect}, setShowConnect, setShowAccount} = useOpenModals();
    return <>

        <ModalWalletConnectPanel {...{
            ...rest,
            open: isShowConnect.isShow,
            onClose: onWalletConnectPanelClose
        }} />
        <ModalAccountInfo
            {...{
                ...rest,
                etherscanUrl,
                open: isShowAccount.isShow,
                onClose: onAccountInfoPanelClose
            }}
        ></ModalAccountInfo>
    </>

})