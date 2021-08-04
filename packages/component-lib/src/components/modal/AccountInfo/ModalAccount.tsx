import { WithTranslation, withTranslation } from 'react-i18next';
import { Modal } from '@material-ui/core';
import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@emotion/react';
import { Box } from '@material-ui/core/';
import { ModalCloseButton, ModalAccountProps, SwitchPanelStyled, ModalBackButton } from '../../../index';

export const ModalAccount = withTranslation('common', {withRef: true})((
    {
        open,
        onClose,
        step,
        onBack,
        style,
        panelList,
        ...rest
    }: ModalAccountProps & WithTranslation) => {
    const theme = useTheme();
    const {w,h} = style?style:{w:undefined,h:undefined};

    return <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >

        <SwitchPanelStyled style={{boxShadow: '24'}}
                           {...{_height: h?h:'var(--modal-height)', _width: w?w:'var(--modal-width)' }}>
            <Box display={'flex'}>
                <ModalCloseButton onClose={onClose} {...rest} />
                {onBack?<ModalBackButton onBack={onBack}  {...rest}/>:<></>}
            </Box>
            <SwipeableViews animateTransitions={false} axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={step}>
                {panelList.map((panel,index)=>{
                    return <Box key={index}>
                        {panel}
                    </Box>
                })}
            </SwipeableViews>
        </SwitchPanelStyled>
    </Modal>
})
