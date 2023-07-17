import { Box, Grid, Step, StepLabel, Stepper } from '@mui/material'
import { BackIcon, DropDownIcon, TradeBtnStatus } from '@loopring-web/common-resources'
import { SwitchData } from '../../Interface'
import { IconButtonStyled } from '../Styled'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../../../stores'
import { BtnInfo, Button } from '../../../index'
import styled from '@emotion/styled'
import React from 'react'

export const ToolBarItemBack = <T extends any>({
  onChangeEvent,
  tradeData,
}: {
  tradeData: T
  onChangeEvent: (index: 0 | 1, data: SwitchData<T>) => Promise<void> | void
}) => {
  return (
    <Grid container justifyContent={'flex-start'}>
      <IconButtonStyled
        edge='start'
        sx={{ transform: 'rotate(90deg)', transformOrigin: '50%' }}
        className={'switch'}
        color='inherit'
        onClick={() => {
          onChangeEvent(0, { tradeData, to: 'button' })
        }}
        aria-label='to Professional'
      >
        <DropDownIcon />
      </IconButtonStyled>
    </Grid>
  )
}

const BoxStyle = styled(Box)`
  .MuiSvgIcon-root.MuiSvgIcon-fontSizeMedium {
    height: var(--btn-icon-size-large);
    width: var(--btn-icon-size-large);

    .MuiStepIcon-text {
      font-size: ${({ theme }) => theme.fontDefault.body1};
      fill: var(--color-text-button);
    }
  }

  .MuiStepConnector-root.Mui-active .MuiStepConnector-line {
    border-color: var(--color-primary);
  }
` as typeof Grid

export function HorizontalLabelPositionBelowStepper({
  activeStep,
  steps,
}: {
  activeStep: number
  steps: string[]
}) {
  const { t } = useTranslation('common')
  const { isMobile } = useSettings()
  return (
    <>
      <BoxStyle sx={{ width: '100%' }} marginTop={isMobile ? 3 : 0}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{t(label)}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </BoxStyle>
    </>
  )
}

export const BtnMain = React.memo(
  ({
    defaultLabel = 'labelMintNext',
    btnInfo,
    disabled,
    onClick,
    btnStatus,
    fullWidth,
  }: {
    defaultLabel?: string
    btnInfo?: BtnInfo
    disabled: () => boolean
    onClick: () => void
    fullWidth?: boolean
    btnStatus?: keyof typeof TradeBtnStatus
  }) => {
    const { t } = useTranslation()
    return (
      <Button
        variant={'contained'}
        size={'medium'}
        color={'primary'}
        fullWidth={fullWidth}
        className={'step'}
        endIcon={<BackIcon fontSize={'small'} sx={{ transform: 'rotate(180deg)' }} />}
        loading={!disabled() && btnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
        disabled={disabled() || btnStatus === TradeBtnStatus.LOADING}
        onClick={onClick}
      >
        {btnInfo ? t(btnInfo.label, btnInfo.params) : t(defaultLabel)}
      </Button>
    )
  },
)
