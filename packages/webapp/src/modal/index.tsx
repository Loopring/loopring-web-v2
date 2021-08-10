import {
    ModalPanel,
    useOpenModals
} from '@loopring-web/component-lib';
import { ModalWalletConnectPanel } from './WalletModal';
import { ModalAccountInfo } from './AccountModal';
import { withTranslation, WithTranslation } from 'react-i18next';
import { useTransfer } from './useTransfer';
import { useDeposit } from './useDeposit';
import { useWithdraw } from './useWithdraw';
import { useSystem } from '../stores/system';
import { useAccountModal } from './useAccountModal';

export const ModalGroup = withTranslation('common',{withRef: true})(({...rest}:WithTranslation)=>{
    const {transferProps} = useTransfer();
    const {depositProps} = useDeposit();
    const {withdrawProps} = useWithdraw();
    const {etherscanUrl} = useSystem();
    useAccountModal();
    const {modals: {isShowAccount, isShowConnect}, setShowConnect, setShowAccount} = useOpenModals();
    return  <>
        <ModalPanel transferProps={transferProps}
                    withDrawProps={withdrawProps}
                    depositProps={depositProps}
                    resetProps={{} as any}
                    ammProps={{} as any}
                    swapProps={{} as any}
                    {...{_height: 'var(--modal-height)', _width: 'var(--modal-width)'}}
        />

        <ModalWalletConnectPanel {...{
            ...rest,
            open: isShowConnect.isShow,
            onClose: () => setShowConnect({isShow: false})
        }} />
        <ModalAccountInfo
            {...{
                ...rest,
                etherscanUrl,
                open: isShowAccount.isShow,
                onClose: () => setShowAccount({isShow: false})
            }}
        ></ModalAccountInfo>
    </>

} )