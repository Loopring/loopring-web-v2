import {
    ModalPanel, Toast,
    useOpenModals
} from '@loopring-web/component-lib';
import { ModalWalletConnectPanel } from './WalletModal';
import { ModalAccountInfo } from './AccountModal';
import { withTranslation, WithTranslation } from 'react-i18next';
import { useTransfer } from 'hooks/useractions/useTransfer';
import { useDeposit } from 'hooks/useractions/useDeposit';
import { useWithdraw } from 'hooks/useractions/useWithdraw';
import { useSystem } from '../stores/system';
import { useAccountModal } from 'hooks/useractions/useAccountModal';
import { TOAST_TIME } from '../defs/common_defs';

export const ModalGroup = withTranslation('common',{withRef: true})(({...rest}:WithTranslation)=>{
    const {transferProps} = useTransfer();
    const {depositProps} = useDeposit();
    const {
        withdrawAlertText,
        withdrawToastOpen, 
        setWithdrawToastOpen,
        withdrawProps} = useWithdraw();
    const {etherscanUrl} = useSystem();
    useAccountModal();
    const {modals: {isShowAccount, isShowConnect}, setShowConnect, setShowAccount} = useOpenModals();
    return  <>

        <Toast alertText={withdrawAlertText as string} open={withdrawToastOpen} 
            autoHideDuration={TOAST_TIME}  onClose={()=> {
            setWithdrawToastOpen(false)
        }}/>

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