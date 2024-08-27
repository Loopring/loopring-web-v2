import React from 'react'
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  Info2Icon,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  TradeBtnStatus,
  WaitingIcon,
  CompleteIcon,
  VaultSwapStep,
  ToastType,
  hexToRGB,
  AlertIcon,
  ErrorIcon,
  WarningIcon,
} from '@loopring-web/common-resources'
import { Box, Grid, Link, Tooltip, Typography, Stepper, StepLabel, Step } from '@mui/material'
import { ButtonStyle, SwapType, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@emotion/react'
enum ActiveStep {
  Edit = 0,
  Borrow = 0,
  Swap = 1,
  Swaping = 1,
}

export const useVaultSwapExtends = ({
  tradeCalcData,
  swapBtnI18nKey,
  swapBtnStatus,
  onSwapClick,
  disabled,
  handleSwapPanelEvent,
  tradeData,
  isSwapLoading,
  // btnBorrowStatus,
  // onBorrowClick,
  // borrowBtnI18nKey,
  toastOpen,
  borrowedAmount
}) => {
  const { t } = useTranslation()
  const { defaultNetwork, coinJson } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const label = React.useMemo(() => {
    myLog(swapBtnI18nKey, 'swapBtnI18nKey useMemo')
    const keyParams = {
      layer2: L1L2_NAME_DEFINED[network].layer2,
      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }
    if (swapBtnI18nKey) {
      const key = swapBtnI18nKey.split('|')
      if (key) {
        return t(
          key[0],
          key && key[1]
            ? {
                arg: key[1],
                ...keyParams,
              }
            : {
                ...keyParams,
              },
        )
      } else {
        return t(swapBtnI18nKey, {
          ...keyParams,
        })
      }
    } else {
      const label = `labelVaultSwapBtn`
      return t(label, {
        ...keyParams,
      })
    }
  }, [swapBtnI18nKey, network, tradeCalcData, t])
  const labelBorrowHint = React.useMemo(() => {
    const keyParams = {
      layer2: L1L2_NAME_DEFINED[network].layer2,
      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }
    if (toastOpen?.type == ToastType.error && toastOpen?.step == VaultSwapStep.Borrow) {
      return (
        <Box marginLeft={0.5} display={'flex'} alignItems={'center'} color={'var(--color-error)'}>
          <WarningIcon />
          <Typography marginLeft={0.5} color={'var(--color-error)'} fontSize={'12px'}>
            {t('labelVaultActiveLoanError2', {
              symbol: tradeCalcData.belongSellAlice,
              value: borrowedAmount
            })}
          </Typography>
        </Box>
      )
    } else if (
      tradeCalcData?.step === VaultSwapStep.Swap ||
      tradeCalcData?.step === VaultSwapStep.Swaping
    ) {
      return (
        <Box marginLeft={0.5} display={'flex'} alignItems={'center'} color={'var(--color-success)'}>
          <CompleteIcon />
          <Typography marginLeft={0.5} color={'var(--color-success)'} fontSize={'12px'}>
            {t('labelVaultActiveLoanSuccessful', {
              symbol: tradeCalcData.belongSellAlice,
              value: borrowedAmount
            })}
          </Typography>
        </Box>
      )
    } else if (
      tradeCalcData.step === VaultSwapStep.Borrow &&
      swapBtnStatus === TradeBtnStatus.LOADING
    ) {
      return (
        <Box marginLeft={0.5} display={'flex'} alignItems={'center'} color={'var(--color-warning)'}>
          <WaitingIcon />
          <Typography marginLeft={0.5} color={'var(--color-warning)'} fontSize={'12px'}>
            {t('labelBorrowing', {
              symbol: tradeCalcData.belongSellAlice,
              value: borrowedAmount,
            })}
          </Typography>
        </Box>
      )
    } else if (swapBtnI18nKey && tradeCalcData?.isRequiredBorrow) {
      let key = swapBtnI18nKey.split('|')
      if (key) {
        const i18nKey = key.shift()
        return t(
          i18nKey,
          key?.length
            ? key.reduce(
                (prev, item, index) => {
                  prev[`arg${index ? index : ''}`] = item
                  return prev
                },
                { ...keyParams },
              )
            : {
                ...keyParams,
              },
        )
      } else {
        return t(swapBtnI18nKey, {
          ...keyParams,
        })
      }
    } else {
      return ''
    }
  }, [swapBtnI18nKey, network, tradeCalcData, tradeCalcData?.step, swapBtnStatus, toastOpen?.type, toastOpen?.step, borrowedAmount])

  const getDisabled =
    disabled || tradeCalcData === undefined || tradeCalcData.coinInfoMap === undefined
  const maxEle = React.useMemo(() => {
    return (
      <Box display={'flex'} flexDirection={'row'} justifyContent={'flex-end'}>
        <Tooltip title={t('labelVaultSwapBorrowTip')}>
          <Link
            variant={'body2'}
            color={'textSecondary'}
            display={'inline-flex'}
            alignItems={'center'}
            justifyContent={'flex-end'}
            className={
              tradeData?.sell?.balance !== '0'
                ? `max-allow ${isSwapLoading ? 'disabled' : ''}`
                : `no-balance ${isSwapLoading ? 'disabled' : ''}`
            }
            onClick={() => {
              handleSwapPanelEvent(
                {
                  type: 'sell',
                  tradeData: {
                    ...tradeData,
                    sell: {
                      ...tradeData?.sell,
                      tradeValue: tradeData?.sell?.balance,
                    },
                  },
                },
                SwapType.SELL_SELECTED,
              )
            }}
          >
            <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
            <span>{t('labelVaultSwapBorrow')}</span>
            <span>
              {tradeData?.sell?.balance !== '0' ? tradeData?.sell?.balance : EmptyValueTag}
            </span>
          </Link>
        </Tooltip>
        {/*<Tooltip title={t('labelVaultSwapHoldTip')}>*/}
        <Link
          variant={'body2'}
          color={'textSecondary'}
          display={'inline-flex'}
          alignItems={'center'}
          justifyContent={'flex-end'}
          marginX={1}
          className={
            tradeData?.sell?.count > 0
              ? `max-allow ${isSwapLoading ? 'disabled' : ''}`
              : `no-balance ${isSwapLoading ? 'disabled' : ''}`
          }
          onClick={() => {
            handleSwapPanelEvent(
              {
                type: 'sell',
                tradeData: {
                  ...tradeData,
                  sell: {
                    ...tradeData?.sell,
                    tradeValue: tradeData?.sell?.count,
                  },
                },
              },
              SwapType.SELL_SELECTED,
            )
          }}
        >
          {/*<Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />*/}
          <span>{t('labelVaultSwapHold')}</span>
          <span>
            {tradeData?.sell?.count > 0
              ? getValuePrecisionThousand(
                  tradeData?.sell?.count,
                  tradeCalcData?.sellPrecision,
                  tradeCalcData?.sellPrecision,
                  tradeCalcData?.sellPrecision,
                  false,
                )
              : EmptyValueTag}
          </span>
        </Link>
        {/*</Tooltip>*/}
      </Box>
    )
  }, [tradeData])
  const theme = useTheme()

  const BtnEle = React.useMemo(() => {
    return (
      <Grid container spacing={2}>
        {toastOpen?.type == ToastType.error && toastOpen?.step == VaultSwapStep.Borrow ? (
          <Grid item xs={12}>
            <Typography
              marginY={1}
              width={'100%'}
              variant={'body1'}
              component={'span'}
              padding={1}
              display={'inline-flex'}
              bgcolor={hexToRGB(theme.colorBase.error, 0.2)}
              borderRadius={2}
              color={'var(--color-text-button)'}
            >
              <ErrorIcon color={'error'} sx={{ marginRight: 1 / 2 }} />
              {t('labelVaultActiveLoanError', { symbol: tradeCalcData.belongSellAlice, value: '' })}
            </Typography>
          </Grid>
        ) : (
          (tradeCalcData as any)?.showHasBorrow && (
            <Grid item xs={12}>
              <Typography
                marginY={1}
                width={'100%'}
                variant={'body1'}
                component={'span'}
                padding={1}
                display={'inline-flex'}
                bgcolor={hexToRGB(theme.colorBase.warning, 0.2)}
                borderRadius={2}
                color={'var(--color-text-button)'}
              >
                <AlertIcon color={'warning'} sx={{ marginRight: 1 / 2 }} />
                {t('labelVaultActiveLoanAlert')}
              </Typography>
            </Grid>
          )
        )}
        <>
          {tradeCalcData?.isRequiredBorrow && (
            <>
              <Grid item xs={7}>
                <Stepper activeStep={Number(ActiveStep[tradeCalcData.step])}>
                  {[
                    { label: t('labelStep1Borrow'), value: VaultSwapStep.Borrow },
                    {
                      label: t('labelStep2Swap'),
                      value: VaultSwapStep.Swap,
                    },
                  ].map(({ label, value }) => {
                    return (
                      <Step key={label}>
                        <StepLabel
                          error={
                            toastOpen.type == ToastType.error &&
                            toastOpen.step == tradeCalcData.step
                          }
                          sx={{ width: '120px' }}
                        >
                          {label}
                        </StepLabel>
                      </Step>
                    )
                  })}
                </Stepper>
              </Grid>
              <Grid item xs={5} display={'flex'} justifyContent={'flex-end'}>
                
              </Grid>
              
            </>
          )}
        </>
        {labelBorrowHint && (
                <Grid item xs={12}>
                  <Typography
                    variant={'body2'}
                    component={'span'}
                    color={'error'}
                    display={'inline-flex'}
                    alignItems={'center'}
                  >
                    {labelBorrowHint}
                  </Typography>
                </Grid>
              )}
        <Grid item xs={12}>
          <ButtonStyle
            variant={'contained'}
            size={'large'}
            color={'primary'}
            onClick={() => {
              onSwapClick()
            }}
            loading={!getDisabled && swapBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
            disabled={
              getDisabled ||
              swapBtnStatus === TradeBtnStatus.DISABLED ||
              swapBtnStatus === TradeBtnStatus.LOADING
            }
            fullWidth={true}
          >
            {tradeCalcData?.isRequiredBorrow ? t('labelBorrowSwap') : label}
          </ButtonStyle>
        </Grid>
      </Grid>
    )
  }, [swapBtnStatus, onSwapClick, getDisabled, label])
  return {
    BtnEle,
    maxEle,
  }
}
