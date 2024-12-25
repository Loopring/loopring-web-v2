import { Box, Typography, Modal } from '@mui/material'
import { CloseIcon } from '@loopring-web/common-resources'
import _ from 'lodash'
import { Button } from '@loopring-web/component-lib'

type LogInToCleanLrTaikoModalModalProps = {
  open: boolean
  onClose: () => void
  onClickSignIn: () => void
}

export const LogInToCleanLrTaikoModalModal = (props: LogInToCleanLrTaikoModalModalProps) => {
  const { open, onClose, onClickSignIn } = props

  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
          position={'relative'}
          p={4}
          pt={5}
          minHeight={'428px'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <CloseIcon
            className='custom-size'
            style={{
              color: 'var(--color-text-secondary)',
              width: '20px',
              height: '20px',
              cursor: 'pointer',
              position: 'absolute',
              right: 16,
              top: 16,
            }}
            onClick={onClose}
          />
          <Typography color={'var(--color-text-primary)'} variant='h4' textAlign={'center'}>
            Clean Up lrTAIKO Dust
          </Typography>
          <Typography color={'var(--color-text-secondary)'} my={5}>
            You have remaining lrTAIKO dust in your account from previous Taiko Farming activities.
            To deposit TAIKO into the Loopring Protocol again, you must first transfer these dust
            tokens to the Loopring operator.
          </Typography>
          <Button fullWidth variant='contained' onClick={onClickSignIn}>Sign In to Proceed</Button>
        </Box>
      </Box>
    </Modal>
  )
}
