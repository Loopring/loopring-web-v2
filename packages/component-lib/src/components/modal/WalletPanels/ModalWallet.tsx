import { WithTranslation, withTranslation } from 'react-i18next'
import { Box, Modal } from '@mui/material'
import { useTheme } from '@emotion/react'
import {
  ModalBackButton,
  ModalCloseButton,
  ModalGuardianProps,
  QRButtonStyle,
  SwipeableViewsStyled,
  SwitchPanelStyled,
} from '../../../index'

export const ModalWallet = withTranslation('common', { withRef: true })(
  ({
    open,
    onClose,
    step,
    onBack,
    style,
    noClose,
    onQRClick,
    panelList,
    ...rest
  }: ModalGuardianProps & WithTranslation) => {
    const theme = useTheme()
    const { w, h } = style ? style : { w: undefined, h: undefined }

    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <SwitchPanelStyled
          style={{ boxShadow: '24' }}
          {...{
            _height: h ? h : 'var(--modal-height)',
            _width: w ? w : 'var(--modal-width)',
          }}
        >
          <Box display={'flex'} width={'100%'} flexDirection={'column'}>
            {noClose ? <></> : <ModalCloseButton onClose={onClose} {...rest} />}
            {onBack ? <ModalBackButton onBack={onBack} {...rest} /> : <></>}
            {onQRClick ? <QRButtonStyle onQRClick={onQRClick} {...rest} /> : <></>}
          </Box>

          <SwipeableViewsStyled
            animateTransitions={false}
            axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
            index={step}
            {...{
              _height: h ? h : 'var(--modal-height)',
              _width: w ? w : 'var(--modal-width)',
            }}
          >
            {panelList.map((panel, index) => {
              return (
                <Box flex={1} display={'flex'} alignItems={'stretch'} key={index}>
                  {panel.view}
                </Box>
              )
            })}
          </SwipeableViewsStyled>
        </SwitchPanelStyled>
      </Modal>
    )
  },
)
