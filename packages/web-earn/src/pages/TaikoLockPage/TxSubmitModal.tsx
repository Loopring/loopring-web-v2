import { Box, Typography, Modal, Input, CircularProgress } from '@mui/material'
import { CloseIcon } from '@loopring-web/common-resources'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'

type TxSubmitModalProps = {
  open: boolean
  onClose: () => void
  status: 'init' | 'txSubmitting' | 'txSubmitted' | 'depositCompleted'
}

const StyledInput = styled(Input)`
  input::placeholder {
    color: var(--color-text-secondary);
  }
`

export const TxSubmitModal = (props: TxSubmitModalProps) => {
  const { open, onClose, status } = props
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
        >
          <Box
            display={'flex'}
            justifyContent={'space-between'}
            px={4}
            py={2}
            borderBottom={'1px solid var(--color-border)'}
            alignItems={'center'}
          >
            <Typography color={'var(--color-text-primary)'} variant='h5'>
              Lock & Earn Progress
            </Typography>
            <CloseIcon
              className='custom-size'
              style={{
                color: 'var(--color-text-secondary)',
                width: '20px',
                height: '20px',
                cursor: 'pointer',
              }}
              onClick={onClose}
            />
          </Box>

          <Box pt={5} px={4} pb={4}>
            <Box display={'flex'} justifyContent={'space-between'}>
              <Box display={'flex'} alignItems={'start'}>
                {status === 'init' ? (
                  <RadioButtonCheckedIcon
                    sx={{
                      color: theme.colorBase.textSecondary,
                      mr: 1,
                      fontSize: '20px',
                      mt: 0.3,
                    }}
                    className='custom-size'
                  />
                ) : status === 'txSubmitting' ? (
                  <CircularProgress
                    size={18}
                    sx={{
                      color: theme.colorBase.primary,
                      mr: 1.2,
                      mt: 0.5,
                    }}
                  />
                ) : (
                  <CheckCircleRoundedIcon
                    sx={{
                      color: theme.colorBase.success,
                      mr: 1,
                      fontSize: '20px',
                      mt: 0.3,
                    }}
                    className='custom-size'
                  />
                )}

                <Box>
                  <Typography
                    color={
                      status === 'init'
                        ? 'var(--color-text-secondary)'
                        : 'var(--color-text-primary)'
                    }
                    fontSize={'16px'}
                    mb={0.5}
                  >
                    Transaction Submit
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box mt={5} display={'flex'} justifyContent={'space-between'}>
              <Box display={'flex'}>
                {status === 'init' || status === 'txSubmitting' ? (
                  <RadioButtonCheckedIcon
                    sx={{
                      color: theme.colorBase.textSecondary,
                      mr: 1,
                      fontSize: '20px',
                      mt: 0.3,
                    }}
                    className='custom-size'
                  />
                ) : status === 'txSubmitted' ? (
                  <Box>
                    <CircularProgress
                      size={18}
                      sx={{
                        color: theme.colorBase.primary,
                        mr: 1.2,
                        mt: 0.5,
                      }}
                    />
                  </Box>
                ) : (
                  <CheckCircleRoundedIcon
                    sx={{
                      color: theme.colorBase.success,
                      mr: 1,
                      fontSize: '20px',
                      mt: 0.3,
                    }}
                    className='custom-size'
                  />
                )}
                <Box>
                  <Typography
                    color={
                      status === 'init' || status === 'txSubmitting'
                        ? 'var(--color-text-secondary)'
                        : 'var(--color-text-primary)'
                    }
                    fontSize={'16px'}
                    mb={0.5}
                  >
                    Asset Deposit to Loopring DeFi
                  </Typography>
                  <Typography color={'var(--color-text-secondary)'}>
                    Loopring DeFi, an app-specific ZK-Rollup, requires approximately 10 blocks for
                    confirmation. On the Taiko network, settlement may take a few minutes.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
