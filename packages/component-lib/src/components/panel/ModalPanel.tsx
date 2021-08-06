import { Modal as MuiModal } from '@material-ui/core';
import {
    AmmPanel,
    AmmProps,
    DepositPanel,
    DepositProps,
    ModalCloseButton,
    ModalPanelProps,
    ResetPanel,
    ResetProps,
    SwapPanel,
    SwapProps,
    SwitchPanelStyled,
    TransferPanel,
    TransferProps,
    useOpenModals,
    WithdrawPanel,
    WithdrawProps
} from '../../';
import { IBData } from '@loopring-web/common-resources';
import { WithTranslation, withTranslation } from 'react-i18next';


const Modal = withTranslation('common')(({
                                             open,
                                             onClose,
                                             content,
                                             height,
                                             width,
                                             ...rest
                                         }: ModalPanelProps & WithTranslation) => {
    return <MuiModal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <SwitchPanelStyled {...{_height: height, _width: width}} style={{boxShadow: '24'}}>
            <ModalCloseButton onClose={onClose} {...rest} />
            {content}
        </SwitchPanelStyled>
    </MuiModal>
})

export const ModalPanel = <T extends IBData<I>, I>({
                                                       transferProps,
                                                       withDrawProps,
                                                       depositProps,
                                                       resetProps,
                                                       ammProps,
                                                       swapProps
                                                   }: {
    transferProps: TransferProps<T, I>,
    withDrawProps: WithdrawProps<T, I>,
    depositProps: DepositProps<T, I>,
    resetProps: ResetProps<T, I>
    ammProps: AmmProps<any, T, any>
    swapProps: SwapProps<T, I, any>
}) => {
    const {
        modals,
        setShowAmm,
        setShowSwap,
        setShowTransfer,
        setShowDeposit,
        setShowWithdraw,
        setShowResetAccount
    } = useOpenModals()
    const {
        isShowTransfer,
        isShowWithdraw,
        isShowDeposit,
        isShowResetAccount,
        isShowAmm,
        isShowSwap
    } = modals;
    return <>
        <Modal open={isShowTransfer.isShow} onClose={() => setShowTransfer({isShow: false})}
               content={<TransferPanel<any, any> {...{
                   _width: 'var(--lage-modal-width)',
                   _height: 'var(--lage-modal-height)', ...transferProps, ...isShowTransfer.props
               }}> </TransferPanel>}/>
        <Modal open={isShowWithdraw.isShow} onClose={() => setShowWithdraw({isShow: false})}
               content={<WithdrawPanel<any, any> {...{
                   _width: 'var(--lage-modal-width)',
                   _height: 'var(--lage-modal-height)', ...withDrawProps, ...isShowWithdraw.props
               }}  > </WithdrawPanel>}/>
        <Modal open={isShowDeposit.isShow}
               onClose={() => setShowDeposit({isShow: false})}
               content={<DepositPanel<any, any> {...{...depositProps, ...isShowDeposit.props}} > </DepositPanel>}/>
        <Modal open={isShowResetAccount.isShow}
               onClose={() => setShowResetAccount({...isShowResetAccount, isShow: false})}
               content={<ResetPanel<any, any> {...{...resetProps, ...isShowResetAccount.props}} > </ResetPanel>}/>
        <Modal open={isShowAmm.isShow}
               onClose={() => setShowAmm({...isShowAmm, isShow: false} as any)}
               content={<AmmPanel<any, any, any> {...{...ammProps, ...isShowAmm.props}} > </AmmPanel>}/>
        <Modal open={isShowSwap.isShow}
               onClose={() => setShowSwap({...isShowSwap, isShow: false} as any)}
               content={<SwapPanel<any, any, any> {...{...swapProps, ...isShowSwap.props}} > </SwapPanel>}/>
    </>

}