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
        <Typography textAlign={'center'} marginBottom={2} variant={'h3'}>
          {t("labelResetLoopringL2")}
        </Typography>
        {type === 'lockedReset' ? (
          <>
            <Typography marginBottom={2} color={'var(--color-text-secondary)'}>
              {t("labelResetlockedReset1")}
            </Typography>
            <Typography marginBottom={2} color={'var(--color-text-secondary)'}>
              {t("labelResetlockedReset2")}
            </Typography>
          </>
        ) : type === 'unlockedWithDual' ? (
          <>
            <Typography marginBottom={2} color={'var(--color-text-secondary)'}>
              {t("labelResetunlockedWithDual1")}
            </Typography>
            <Typography marginBottom={2} color={'var(--color-text-secondary)'}>
              {t("labelResetunlockedWithDual2")}
            </Typography>
          </>
        ) : (
          <>
            <Typography marginBottom={2} color={'var(--color-text-secondary)'}>
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
