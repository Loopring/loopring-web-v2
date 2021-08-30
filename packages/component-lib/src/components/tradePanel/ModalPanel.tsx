import { Box, Modal as MuiModal } from '@material-ui/core';
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
} from '../..';
import { IBData } from '@loopring-web/common-resources';
import { WithTranslation, withTranslation } from 'react-i18next';
import { useTheme } from '@emotion/react';

const Modal = withTranslation('common')(({
                                             open,
                                             onClose,
                                             content,
                                             _height,
                                             _width,
                                             ...rest
                                         }: ModalPanelProps & WithTranslation) => {
    return <MuiModal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        {/*<SwitchPanelStyled style={{boxShadow: '24'}} {...{_height: height, _width: width}}  >*/}
        {/*    /!*<ModalCloseButton onClose={onClose} {...rest} />*!/*/}
        {/*    */}
        {/*</SwitchPanelStyled>*/}
        {/*<>*/}

        <SwitchPanelStyled style={{boxShadow: '24'}} position={'relative'}
            {...{
                _width: `calc(var(--modal-width)`,
                _height: _height
            }}
                           flex={1} display={'flex'}>
            <Box display={'flex'} width={"100%"} flexDirection={'column'}>
                <ModalCloseButton onClose={onClose} {...rest} />
                {/*{onBack ? <ModalBackButton onBack={onBack}  {...rest}/> : <></>}*/}
            </Box>
            <Box className={'trade-panel'}>
                {content}
            </Box>

        </SwitchPanelStyled>
        {/*</>*/}

    </MuiModal>
})

export const ModalPanel = <T extends IBData<I>, I>({
                                                       transferProps,
                                                       withDrawProps,
                                                       depositProps,
                                                       resetProps,
                                                       ammProps,
                                                       swapProps,

                                                       ...rest
                                                   }: {
    _width?: number | string,
    _height?: number | string,
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
    const theme = useTheme();
    return <>
        <Modal open={isShowTransfer.isShow} onClose={() => setShowTransfer({isShow: false})}
               content={<TransferPanel<any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit*5/2}px)`,
                   _height: 'var(--lage-modal-height)', ...transferProps,
               }}> </TransferPanel>}/>
        <Modal open={isShowWithdraw.isShow} onClose={() => setShowWithdraw({isShow: false})}
               content={<WithdrawPanel<any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit*5/2}px)`,
                   _height: 'var(--lage-modal-height)', ...withDrawProps,
               }}  > </WithdrawPanel>}/>
        <Modal open={isShowDeposit.isShow}
               onClose={() => setShowDeposit({isShow: false})}
               content={<DepositPanel<any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit*5/2}px)`,
                   _height: 'var(--modal-height)', ...depositProps, 
               }} > </DepositPanel>}/>
        <Modal open={isShowResetAccount.isShow}
               onClose={() => setShowResetAccount({...isShowResetAccount, isShow: false})}
               content={<ResetPanel<any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit*5/2}px)`,
                   _height: 'var(--modal-height)', ...resetProps,
               }} > </ResetPanel>}/>
        <Modal open={isShowAmm.isShow}
               onClose={() => setShowAmm({...isShowAmm, isShow: false} as any)}
               content={<AmmPanel<any, any, any> {...{
                   ...rest,
                   _width: `calc(var(--modal-width) - ${theme.unit*5/2}px)`,
                   _height: 'var(--modal-height)', ...ammProps,
               }} > </AmmPanel>}/>
        <Modal open={isShowSwap.isShow}
               onClose={() => setShowSwap({...isShowSwap, isShow: false} as any)}
               content={<SwapPanel<any, any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit*5/2}px)`,
                   _height: 'var(--modal-height)', ...swapProps,
               }} > </SwapPanel>}/>
    </>

}