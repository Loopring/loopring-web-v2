import { Box, Typography, Modal, Input, CircularProgress } from '@mui/material'
import { CloseIcon } from '@loopring-web/common-resources'
import { useSystem } from '@loopring-web/core'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
type PendingTxsModalProps = {
  open: boolean
  onClose: () => void
  pendingTxs: {
    amount: string
    hash: string
  }[]
}

const StyledInput = styled(Input)`
  input::placeholder {
    color: var(--color-text-secondary);
  }
`

export const PendingTxsModal = (props: PendingTxsModalProps) => {
  const { open, onClose, pendingTxs } = props
  const { t } = useTranslation()
  const theme = useTheme()
  const { etherscanBaseUrl } = useSystem()

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
          px={3.5}
          pt={5}
          minHeight={'428px'}
          alignItems={'center'}
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
            Pending Transaction
          </Typography>
          <Box width={'100%'} mt={6}>
            {pendingTxs.map((tx) => {
              return (
                <Box
                  key={tx.hash}
                  display={'flex'}
                  justifyContent={'space-between'}
                  alignItems={'center'}
                >
                  <Typography display={'flex'} alignItems={'center'} fontSize={'16px'}>
                    Lock {tx.amount}{' '}
                    <OpenInNewIcon
                      sx={{
                        ml: 1,
                        cursor: 'pointer',
                        fontSize: '16px',
                        color: 'var(--color-text-primary)',
                      }}
                      onClick={() => window.open(`${etherscanBaseUrl}tx/${tx.hash}`)}
                    />
                  </Typography>
                  <CircularProgress size={18} sx={{ color: 'var(--color-primary)' }} />
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
