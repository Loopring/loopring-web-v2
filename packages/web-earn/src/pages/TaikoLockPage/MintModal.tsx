import { Box, Typography, Modal, Input, CircularProgress } from '@mui/material'
import { Button, ButtonStyle, CoinIcons } from '@loopring-web/component-lib'
import { CloseIcon, TokenType } from '@loopring-web/common-resources'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
// import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import CheckBoxOutlineBlankRoundedIcon from '@mui/icons-material/CheckBoxOutlineBlankRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'

type MintModalProps = {
  open: boolean
  onClose: () => void
  mintWarningChecked: boolean
  onWarningCheckBoxChange: () => void
  onConfirmBtnClicked: () => void
  onClickMax: () => void
  confirmBtnDisabled: boolean
  onInput: (str: string) => void
  inputValue: string
  inputPlaceholder: string
  tokenAvailableAmount: string
  confirmBtnWording: string
  logoCoinJSON: any
  status: 'notSignedIn' | 'signingIn' | 'signedIn' | 'minting'
  onClickSignIn: () => void
  onClickMint: () => void
}

const StyledInput = styled(Input)`
  input::placeholder {
    color: var(--color-text-secondary);
  }
`

export const MintModal = (props: MintModalProps) => {
  const {
    open,
    onClose,
    mintWarningChecked,
    onWarningCheckBoxChange,
    confirmBtnDisabled,
    onConfirmBtnClicked,
    onInput,
    inputValue,
    tokenAvailableAmount,
    onClickMax,
    logoCoinJSON,
    confirmBtnWording,
    inputPlaceholder,
    status,
    onClickSignIn,
    onClickMint,
  } = props
  const { t } = useTranslation("common")
  const theme = useTheme()

  const mintingUI = (
    <Box pt={5} px={4} pb={4}>
      <Box display={'flex'} justifyContent={'space-between'}>
        <Typography color={'var(--color-text-secondary)'} mb={0.5}>
          {t("labelAmount")}
        </Typography>
        <Typography color={'var(--color-text-secondary)'} mb={0.5}>
          {t("labelAvailable")} {tokenAvailableAmount}
        </Typography>
      </Box>

      <StyledInput
        sx={{
          textAlign: 'right',
          paddingX: 1.5,
          height: '48px',
          width: '100%',
        }}
        inputProps={{
          style: {
            textAlign: 'right',
            fontSize: '20px',
            fontFamily: 'Arial',
          },
        }}
        disableUnderline
        startAdornment={
          <Box display={'flex'} alignItems={'center'}>
            <CoinIcons type={TokenType.single} tokenIcon={[logoCoinJSON]} />
            <Typography ml={1} color={'var(--color-text-primary)'}>
              lrTAIKO
            </Typography>
          </Box>
        }
        endAdornment={
          <Typography
            component={'span'}
            onClick={onClickMax}
            sx={{ cursor: 'pointer' }}
            ml={1}
            color={'var(--color-primary)'}
          >
            {t("labelInputMax")}
          </Typography>
        }
        placeholder={inputPlaceholder}
        onInput={(e) => {
          onInput((e.target as any).value)
        }}
        value={inputValue}
      />
      <Box display={'flex'} justifyContent={'space-between'} mt={3} alignItems={'center'}>
        <Typography color={'var(--color-text-secondary)'}>{t("labelDefiRate")}</Typography>
        <Typography color={'var(--color-text-secondary)'}>1 lrTAIKO = 1 TAIKO</Typography>
      </Box>
      <Box mt={5} display={'flex'} alignItems={'center'}>
        <Box>
          {mintWarningChecked ? (
            <CheckBoxRoundedIcon
              onClick={onWarningCheckBoxChange}
              className='custom-size'
              sx={{
                color: theme.colorBase.warning,
                fontSize: '20px',
                cursor: 'pointer',
              }}
            />
          ) : (
            <CheckBoxOutlineBlankRoundedIcon
              onClick={onWarningCheckBoxChange}
              className='custom-size'
              sx={{ color: theme.colorBase.warning, fontSize: '20px', cursor: 'pointer' }}
            />
          )}
        </Box>
        <Box ml={1}>
          <Typography color={'var(--color-warning)'}>
            {t('I acknowledge and would like to proceed.')}
          </Typography>
        </Box>
      </Box>
      <Typography color={'var(--color-text-secondary)'} mt={4}>
        {t("labelTaikoFarmingMintRiskReminder")}
      </Typography>
      <ButtonStyle
        sx={{
          mt: 4,
          textTransform: 'none',
        }}
        fullWidth
        variant={'contained'}
        size={'large'}
        color={'primary'}
        onClick={() => {
          onConfirmBtnClicked()
        }}
        disabled={confirmBtnDisabled}
      >
        {confirmBtnWording}
      </ButtonStyle>
    </Box>
  )
  const signInUI = (
    <Box pt={5} px={4} pb={4}>
      <Box display={'flex'} justifyContent={'space-between'}>
        <Box width={'75%'} display={'flex'} alignItems={'start'}>
          {status === 'signedIn' ? (
            <CheckCircleRoundedIcon
              sx={{
                color: theme.colorBase.success,
                mr: 1,
                fontSize: '24px',
                mt: 0.4,
              }}
              className='custom-size'
            />
          ) : (
            <RadioButtonCheckedIcon
              sx={{
                color: theme.colorBase.textSecondary,
                mr: 1,
                fontSize: '24px',
                mt: 0.4,
              }}
              className='custom-size'
            />
          )}

          <Box>
            <Typography color={'var(--color-text-primary)'} variant='h4' mb={0.5}>
              {t("labelCompleteSignIn")}
            </Typography>
            <Typography color={'var(--color-text-secondary)'} fontSize={'12px'}>
              {t("labelCompleteSignInDes")}
            </Typography>
          </Box>
        </Box>
        <Box>
          {status === 'notSignedIn' ? (
            <Button variant='contained' onClick={onClickSignIn}>
              {t("labelSignIn")}
            </Button>
          ) : status === 'signingIn' ? (
            <Typography
              display={'flex'}
              alignItems={'center'}
              color={'var(--color-primary)'}
              fontSize='16px'
            >
              <CircularProgress size={16} sx={{ mr: 1, color: 'var(--color-primary)' }} /> Signing
            </Typography>
          ) : (
            <Typography
              display={'flex'}
              alignItems={'center'}
              color={'var(--color-success)'}
              fontSize='16px'
            >
              <CheckRoundedIcon
                sx={{
                  fontSize: '18px',
                  mr: 1,
                  color: 'var(--color-success)',
                }}
                className='custom-size'
              />{' '}
              {t("Complete")}
            </Typography>
          )}
        </Box>
      </Box>
      <Box mt={5} display={'flex'} justifyContent={'space-between'}>
        <Box width={'75%'} display={'flex'}>
          <RadioButtonCheckedIcon
            sx={{
              color: theme.colorBase.textSecondary,
              mr: 1,
              fontSize: '24px',
              mt: 0.4,
            }}
            className='custom-size'
          />
          <Box>
            <Typography color={'var(--color-text-primary)'} variant='h4' mb={0.5}>
              {t("labelMint")}
            </Typography>
            <Typography color={'var(--color-text-secondary)'} fontSize={'12px'}>{t("labelStartMintlrTAIKO")}</Typography>
          </Box>
        </Box>
        <Button disabled={status !== 'signedIn'} variant='contained' onClick={onClickMint}>
        {t("labelMint")}
        </Button>
      </Box>
    </Box>
  )
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
              {t("labelMint")}
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
          {status === 'minting' ? mintingUI : signInUI}
        </Box>
      </Box>
    </Modal>
  )
}