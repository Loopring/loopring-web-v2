import { WithTranslation, withTranslation } from 'react-i18next';
import { Modal } from '@material-ui/core';
// import SwipeableViews from 'react-swipeable-views';
import { useTheme } from '@emotion/react';
import { Box } from '@material-ui/core/';
import {
    ModalAccountProps,
    ModalBackButton,
    ModalCloseButton,
    SwipeableViewsStyled,
    SwitchPanelStyled
} from '../../../index';

// const BoxStyle = styled(Box)`
//   height: 100%;
//   & > div {
//     width: 100%;
//     max-height: initial;
//     flex: 1;
//     height: 100%;
//   }
//
// ` as typeof Box;
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
    const {w, h} = style ? style : {w: undefined, h: undefined};

    return <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <SwitchPanelStyled style={{boxShadow: '24'}} {...{
            _height: h ? h : 'var(--modal-height)',
            _width: w ? w : 'var(--modal-width)'
        }}>
            <Box display={'flex'} width={"100%"} flexDirection={'column'}>
                <ModalCloseButton onClose={onClose} {...rest} />
                {onBack ? <ModalBackButton onBack={onBack}  {...rest}/> : <></>}
            </Box>
            <SwipeableViewsStyled animateTransitions={false} axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                                  index={step}
                                  {...{_height: h ? h : 'var(--modal-height)', _width: w ? w : 'var(--modal-width)'}}>
                {panelList.map((panel, index) => {
                    return <Box flex={1} display={'flex'}  key={index} >
                        {panel}
                    </Box>
                })}
            </SwipeableViewsStyled>
        </SwitchPanelStyled>
    </Modal>
})