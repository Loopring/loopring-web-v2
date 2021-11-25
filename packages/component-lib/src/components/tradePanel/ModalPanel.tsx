import { Box, Modal as MuiModal } from '@mui/material';
import {
    AmmPanel,
    AmmProps,
    // DepositPanel,
    DepositPanel,
    DepositProps,
    ModalCloseButton,
    ModalPanelProps,
    ResetPanel,
    ExportAccountPanel,
    ResetProps,
    SwapPanel,
    SwapProps,
    SwitchPanelStyled,
    TransferPanel,
    TransferProps,
    useOpenModals,
    WithdrawPanel,
    WithdrawProps,
} from '../..';
import { IBData } from '@loopring-web/common-resources';
import { WithTranslation, withTranslation } from 'react-i18next';
import { useTheme } from '@emotion/react';

const DEFAULT_DEPOSIT_HEIGHT = 300;
const DEFAULT_TRANSFER_HEIGHT = 550;
const DEFAULT_WITHDRAW_HEIGHT = 550;

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
                                                       withdrawProps,
                                                       depositProps,
                                                       nftTransferProps,
                                                       nftWithdrawProps,
                                                       nftDepositProps,
                                                       resetProps,
                                                       ammProps,
                                                       swapProps,
                                                       assetsData,
                                                       ...rest
                                                   }: {
    _width?: number | string,
    _height?: number | string,
    transferProps: TransferProps<T, I>,
    withdrawProps: WithdrawProps<T, I>,
    depositProps: DepositProps<T, I>,
    nftTransferProps: TransferProps<T, I>,
    nftWithdrawProps: WithdrawProps<T, I>,
    nftDepositProps: DepositProps<T, I>,
    resetProps: ResetProps<I>,
    ammProps: AmmProps<any, any, T, any>,
    swapProps: SwapProps<T, I, any>,
    assetsData: any[],
    exportAccountProps: any,
    setExportAccountToastOpen: any,
}) => {
    const {
        modals,
        setShowAmm,
        setShowSwap,
        setShowTransfer,
        setShowDeposit,
        setShowWithdraw,
        setShowResetAccount,
        setShowExportAccount,
        setShowNFTTransfer,
        setShowNFTWithdraw,
        setShowNFTDeposit,
    } = useOpenModals()
    const {
        isShowTransfer,
        isShowWithdraw,
        isShowDeposit,
        isShowResetAccount,
        isShowExportAccount,
        isShowAmm,
        isShowSwap,
        isShowNFTTransfer,
        isShowNFTWithdraw,
        isShowNFTDeposit,
    } = modals;
    const theme = useTheme();
    return <>
        <Modal open={isShowNFTTransfer.isShow} onClose={() => setShowNFTTransfer({isShow: false})}
               content={<TransferPanel<any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit * 5 / 2}px)`,
                   type:'NFT',
                   _height: DEFAULT_TRANSFER_HEIGHT, ...nftTransferProps, assetsData,
               }}> </TransferPanel>}/>
        <Modal open={isShowNFTWithdraw.isShow} onClose={() => setShowNFTWithdraw({isShow: false})}
               content={<WithdrawPanel<any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit * 5 / 2}px)`,
                   type:'NFT',
                   _height: DEFAULT_WITHDRAW_HEIGHT, ...nftWithdrawProps, assetsData,
               }}  > </WithdrawPanel>}/>
        <Modal open={isShowNFTDeposit.isShow} onClose={() => setShowNFTDeposit({isShow: false})}
               content={<DepositPanel<any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit * 5 / 2}px)`,
                   _height: DEFAULT_DEPOSIT_HEIGHT, ...nftDepositProps,
               }} > </DepositPanel>}/>
        <Modal open={isShowTransfer.isShow} onClose={() => setShowTransfer({isShow: false})}
               content={<TransferPanel<any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit * 5 / 2}px)`,
                //    _height: DEFAULT_TRANSFER_HEIGHT + 100, ...transferProps, assetsData,
                   _height: 'auto', ...transferProps, assetsData,
               }}> </TransferPanel>}/>
        <Modal open={isShowWithdraw.isShow} onClose={() => setShowWithdraw({isShow: false})}
               content={<WithdrawPanel<any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit * 5 / 2}px)`,
                   _height: DEFAULT_WITHDRAW_HEIGHT, ...withdrawProps, assetsData,
               }}  > </WithdrawPanel>}/>
        <Modal open={isShowDeposit.isShow}
               onClose={() => setShowDeposit({isShow: false})}
               content={<DepositPanel<any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit * 5 / 2}px)`,
                   _height: DEFAULT_DEPOSIT_HEIGHT, ...depositProps,
               }} > </DepositPanel>}/>
        <Modal open={isShowResetAccount.isShow}
               onClose={() => setShowResetAccount({...isShowResetAccount, isShow: false})}
               content={<ResetPanel<any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit * 5 / 2}px)`,
                   _height: `calc(var(--modal-height) - ${theme.unit * 6}px)`, ...resetProps, assetsData,
               }} > </ResetPanel>}/>
        <Modal open={isShowExportAccount.isShow}
               onClose={() => setShowExportAccount({...isShowExportAccount, isShow: false})}
               content={<ExportAccountPanel {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit * 5 / 2}px)`,
                   _height: `calc(var(--modal-height) + ${theme.unit * 16}px)`,
               }} > </ExportAccountPanel>}/>
        <Modal open={isShowAmm.isShow}
               onClose={() => setShowAmm({...isShowAmm, isShow: false} as any)}
               content={<AmmPanel<any, any, any, any> {...{
                   ...rest,
                   _width: `calc(var(--modal-width) - ${theme.unit * 5 / 2}px)`,
                   _height: 'var(--modal-height)', ...ammProps,
               }} > </AmmPanel>}/>
        <Modal open={isShowSwap.isShow}
               onClose={() => setShowSwap({...isShowSwap, isShow: false} as any)}
               content={<SwapPanel<any, any, any> {...{
                   ...rest, _width: `calc(var(--modal-width) - ${theme.unit * 5 / 2}px)`,
                   _height: 'var(--modal-height)', ...swapProps,
               }} > </SwapPanel>}/>
    </>

}