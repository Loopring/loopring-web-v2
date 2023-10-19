import { withTranslation, WithTranslation } from 'react-i18next'
import { Box, Button, Typography } from '@mui/material'

export const ResetAccountConfirmationPanel = withTranslation('common', { withRef: true })(
  ({
    type,
    t,
    onConfirmation,
  }: {
    type: 'lockedReset' | 'unlockedWithDual' | 'unlockedWithoutDual'
    onConfirmation: () => void
  } & WithTranslation) => {
    return (
      <Box display={'flex'} flexDirection={'column'} width={'var(--modal-width)'} padding={2}>
        <Typography textAlign={'center'} marginBottom={3} variant={'h3'}>
          {t("labelResetLoopringL2")}
        </Typography>
        {type === 'lockedReset' ? (
          <>
            <Typography marginBottom={2} variant={'body2'}>
              {t("labelResetlockedReset1")}
            </Typography>
            <Typography marginBottom={2} variant={'body2'}>
              {t("labelResetlockedReset2")}
            </Typography>
          </>
        ) : type === 'unlockedWithDual' ? (
          <>
            <Typography marginBottom={2} variant={'body2'}>
              {t("labelResetunlockedWithDual1")}
            </Typography>
            <Typography marginBottom={2} variant={'body2'}>
              {t("labelResetunlockedWithDual2")}
            </Typography>
          </>
        ) : (
          <>
            <Typography marginBottom={2} variant={'body2'}>
              {t("labelResetunlockedWithoutDual")}
            </Typography>
          </>
        )}
        <Button onClick={() => onConfirmation()} sx={{ alignSelf: 'end' }} variant={'contained'}>
          {t("labelOK")}
        </Button>
      </Box>
    )
  },
)

// export const TransferModal = withTranslation()
