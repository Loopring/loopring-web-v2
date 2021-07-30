// import { Box, Modal } from '@material-ui/core';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Modal } from '@material-ui/core';
import { ModalContentStyled, ModalWalletConnectProps } from 'components';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@emotion/react';
import { Box } from '@material-ui/core/';
// import { ModalWalletConnectProps } from './Interface';
// import { Typography } from '@material-ui/core/';
// import { GatewayItem } from '@loopring-web/common-resources';
// import { ModalContentStyled } from '../../styled';
//
//
// const IconWrapperStyled = styled(Box)`
//     background-color: ${({theme}) => theme.colorBase.textPrimary};
//     width: var(--gateway-icon-size);
//     height: var(--gateway-icon-size);
//     border-radius: 50%;
// ` as typeof Box;
//
//
// const WalletConnectPanelStyled = styled(Box)`
//   width: var(--transfer-modal-width);
// ` as typeof Box;

// export const WalletConnectPanel = ( props: any & WithTranslation) => {
//     // return <WalletConnectPanelStyled display={'flex'} justifyContent={'space-between'} alignItems={'center'}
//     //                                  flexDirection={'column'}>
//     //     <Typography variant={'h3'} component='h3' className="modalTitle" marginBottom={3}>Connect Wallet</Typography>
//     //     <Box display={'flex'} justifyContent={'space-evenly'} flex={1} alignItems={'center'} alignSelf={'stretch'}
//     //          className="modalContent">
//     //         {gatewayList.map((item: GatewayItem) => (
//     //             <Box component={'a'} display={'flex'} flexDirection={'column'} justifyContent={''} alignItems={'center'}
//     //                  minWidth={84}
//     //                  key={item.key} onClick={item.handleSelect ? item.handleSelect : (event: React.MouseEvent) => {
//     //                 if (handleSelect) {
//     //                     handleSelect(event, item.key);
//     //                 }
//     //             }}>
//     //                 <IconWrapperStyled display={'flex'} justifyContent={'center'} alignItems={'center'}>
//     //                     <img src={item.imgSrc} alt={item.key}/>
//     //                 </IconWrapperStyled>
//     //                 <Typography variant={'body2'} component={'span'} marginTop={2}>{t(item.key)}</Typography>
//     //             </Box>
//     //         ))}
//     //     </Box>
//     // </WalletConnectPanelStyled>
//     return <></>
// }

export const ModalWalletConnect = withTranslation('common', {withRef: true})((
    {
        // t,
        open,
        onClose,
        step,
        panelList,
        // ...rest
    }: ModalWalletConnectProps & WithTranslation) => {
    const theme = useTheme();


    return <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <ModalContentStyled style={{boxShadow: '24'}}>
            <SwipeableViews axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={step}>
                {panelList.map((panel,index)=>{
                    return <Box key={index}>
                        {panel}
                    </Box>
                })}
            </SwipeableViews>
        </ModalContentStyled>
    </Modal>
})
