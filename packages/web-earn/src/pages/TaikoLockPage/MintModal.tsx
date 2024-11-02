import {
  Box,
  Typography,
  Modal,
  Divider,
  IconButton,
  Slider,
  Checkbox,
  Tooltip,
  Input,
} from '@mui/material'
import {
  AvatarCoin,
  Button,
  ButtonStyle,
  CoinIcons,
  Loading,
  LoadingStyled,
  SpaceBetweenBox,
} from '@loopring-web/component-lib'
import {
  BackIcon,
  CheckBoxIcon,
  CheckedIcon,
  CloseIcon,
  EmptyValueTag,
  Info2Icon,
  InfoIcon,
  OrderListIcon,
  TokenType,
} from '@loopring-web/common-resources'
import { numberFormat } from '@loopring-web/core'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import _ from 'lodash'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import { useTranslation } from 'react-i18next'
import Decimal from 'decimal.js'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import { useTheme } from '@emotion/react'
import styled from '@emotion/styled'

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
  tokenAvailableAmount: string
  confirmBtnWording: string
  // onClickMaxCredit: () => void
  // collateralTokens: {
  //   name: string
  //   logo: string
  //   amount: string
  //   valueInCurrency: string
  // }[]
  // totalCollateral: string
  // maxCredit: string
  logoCoinJSON: any
}

const StyledInput = styled(Input)`
  input::placeholder {
    color: var(--color-text-secondary);
  }
`

export const MintModal = (props: MintModalProps) => {
  const { open, onClose, mintWarningChecked, onWarningCheckBoxChange, confirmBtnDisabled, onConfirmBtnClicked, onInput, inputValue, tokenAvailableAmount, onClickMax, logoCoinJSON, confirmBtnWording } = props
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
              Mint lrTAIKO
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
            <Typography color={'var(--color-text-secondary)'} mb={0.5}>
              Amount
            </Typography>
            <Typography color={'var(--color-text-secondary)'} mb={0.5}>
              Available: {tokenAvailableAmount}
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
                  <Typography ml={1} color={'var(--color-text-primary)'} >
                   lrTAIKO
                  </Typography>
                </Box>
                
              }
              endAdornment={
                <Typography component={'span'} onClick={onClickMax} sx={{cursor: 'pointer'}} ml={1} color={'var(--color-primary)'} >
                  MAX
                </Typography>
              }
              placeholder='100 - 1,000,000'
              onInput={(e) => {
                onInput((e.target as any).value)
              }}
              value={inputValue}
            />
            {/* <Input sx={{ height: '48px' }} /> */}
            <Box display={'flex'} justifyContent={'space-between'} mt={3} alignItems={'center'}>
              <Typography color={'var(--color-text-secondary)'}>Rate</Typography>
              <Typography color={'var(--color-text-secondary)'}>1 TAIKO = 1 lrTAIKO</Typography>
            </Box>
            <Box mt={5} display={'flex'} alignItems={'center'}>
              <Box>
                {mintWarningChecked ? (
                  <RadioButtonCheckedIcon
                    onClick={onWarningCheckBoxChange}
                    className='custom-size'
                    sx={{
                      color: theme.colorBase.warning,
                      fontSize: '24px',
                      cursor: 'pointer',
                    }}
                  />
                ) : (
                  <RadioButtonUncheckedIcon
                    onClick={onWarningCheckBoxChange}
                    className='custom-size'
                    sx={{ color: theme.colorBase.warning, fontSize: '24px', cursor: 'pointer' }}
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
            Risk Reminder: You can use minted lrTAIKO as collateral across other Loopring DeFi utilities. However, if you incur any losses during your investment, those losses will be deducted from your locked TAIKO upon unlocking.
            </Typography>
            <ButtonStyle
              sx={{ mt: 4}}
              fullWidth
              variant={'contained'}
              size={'large'}
              color={'primary'}
              onClick={() => {
                onConfirmBtnClicked()
              }}
              disabled={
                confirmBtnDisabled
              }
            >
              {confirmBtnWording}
            </ButtonStyle>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
