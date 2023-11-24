import { WithTranslation, withTranslation } from 'react-i18next'
import { Box, Modal } from '@mui/material'
import {
  ModalAccountProps,
  ModalBackButton,
  ModalCloseButton,
  ModelPanelStyle,
  QRButtonStyle,
} from '../../../index'

export const ModalAccount = withTranslation('common', { withRef: true })(
  ({
    open,
    onClose,
    step,
    isLayer2Only = false,
    onBack,
    style,
    noClose,
    etherscanBaseUrl,
    onQRClick,
    panelList,
    isWebEarn,
    ...rest
  }: ModalAccountProps & WithTranslation) => {
    // const { w, h } = style ? style : { w: undefined, h: undefined };

    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <ModelPanelStyle style={{ boxShadow: '24' }}>
          <Box display={'flex'} width={'100%'} flexDirection={'column'}>
            {noClose ? <></> : <ModalCloseButton onClose={onClose} {...rest} />}
            {onBack ? <ModalBackButton onBack={onBack} {...rest} /> : <></>}
            {onQRClick ? <QRButtonStyle onQRClick={onQRClick} {...rest} /> : <></>}
          </Box>
          {panelList.map((panel, index) => {
            return (
              <Box
                display={step === index ? 'flex' : 'none'}
                alignItems={'stretch'}
                height={panel.height ? panel.height : 'var(--modal-height)'}
                width={panel.width ? panel.width : 'var(--modal-width)'}
                key={index}
              >
                {panel.view}
              </Box>
            )
          })}
        </ModelPanelStyle>
      </Modal>
    )
  },
)
