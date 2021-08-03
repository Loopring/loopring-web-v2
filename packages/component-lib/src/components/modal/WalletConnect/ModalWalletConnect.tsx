import { WithTranslation, withTranslation } from 'react-i18next';
import { Modal } from '@material-ui/core';
import { ModalCloseButton, SwitchPanelStyled, ModalWalletConnectProps } from '../../../index';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@emotion/react';
import { Box } from '@material-ui/core/';

export const ModalWalletConnect = withTranslation('common', {withRef: true})((
    {
        // t,
        open,
        onClose,
        step,
        panelList,
        ...rest
    }: ModalWalletConnectProps & WithTranslation) => {
    const theme = useTheme();


    return <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <SwitchPanelStyled style={{boxShadow: '24'}}
                           {...{_height: 'var(--modal-height)', _width: 'var(--modal-width)' }}>
            <ModalCloseButton onClose={onClose} {...rest} />
            <SwipeableViews animateTransitions={false} axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={step}>
                {panelList && panelList.map((panel,index)=>{
                    return <Box key={index}>
                        {panel}
                    </Box>
                })} 
            </SwipeableViews>
        </SwitchPanelStyled>
    </Modal>
})
