import { WithTranslation, withTranslation } from 'react-i18next'
import { Box, Modal } from '@mui/material'
import {
  ModalBackButton,
  ModalCloseButton,
  ModalWalletConnectProps,
  ModelPanelStyle,
} from '../../../index'

export const ModalWalletConnect = withTranslation('common', { withRef: true })(
  ({
    // t,
    open,
    onClose,
    step,
    onBack,
    panelList,
    style,
    ...rest
  }: ModalWalletConnectProps & WithTranslation) => {
    return (
      <Modal
        open={open}
        onClose={onClose}
        disableEnforceFocus
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <ModelPanelStyle style={{ boxShadow: '24' }}>
          <Box display={'flex'} width={'100%'} flexDirection={'column'}>
            <ModalCloseButton onClose={onClose} {...rest} />
            {onBack ? <ModalBackButton onBack={onBack} {...rest} /> : <></>}
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
