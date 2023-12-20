import React from 'react'
import {
  EmptyValueTag,
  getValuePrecisionThousand,
  Info2Icon,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  TradeBtnStatus,
  DirectionTag,
} from '@loopring-web/common-resources'
import { Box, Grid, Link, Tooltip, Typography } from '@mui/material'
import { ButtonStyle, CoinIcons, SwapType, useSettings } from '@loopring-web/component-lib'
import { useTranslation } from 'react-i18next'

export const useVaultSwapExtends = ({
  tradeCalcData,
  swapBtnI18nKey,
  swapBtnStatus,
  onSwapClick,
  disabled,
  handleSwapPanelEvent,
  tradeData,
  isSwapLoading,
  btnBorrowStatus,
  onBorrowClick,
  borrowBtnI18nKey,
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
  }, [swapBtnI18nKey, network, tradeCalcData])
  const labelBorrow = React.useMemo(() => {
    const keyParams = {
      layer2: L1L2_NAME_DEFINED[network].layer2,
      l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
      loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
      l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
      l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
      ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
    }
    if (borrowBtnI18nKey) {
      const key = borrowBtnI18nKey.split('|')
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
        return t(borrowBtnI18nKey, {
          ...keyParams,
        })
      }
    } else {
      return ''
    }
  }, [borrowBtnI18nKey, network, tradeCalcData])

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
  const BtnEle = React.useMemo(() => {
    return tradeCalcData?.isRequiredBorrow ? (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography
            variant={'body2'}
            component={'span'}
            color={'textSecondary'}
            display={'inline-flex'}
            alignItems={'center'}
          >
            <Typography
              variant={'inherit'}
              component={'span'}
              color={tradeCalcData.step == 'swap' ? 'inherit' : 'textPrimary'}
            >
              {t('labelStep1Borrow')}
            </Typography>
            {' ' + DirectionTag + ' '}
            <Typography
              variant={'inherit'}
              component={'span'}
              color={tradeCalcData.step == 'swap' ? 'textPrimary' : 'inherit'}
            >
              {t('labelStep2Swap')}
            </Typography>
          </Typography>
        </Grid>
        {labelBorrow && (
          <Grid item xs={12}>
            <Typography
              variant={'body2'}
              component={'span'}
              color={'error'}
              display={'inline-flex'}
              alignItems={'center'}
            >
              {labelBorrow}
            </Typography>
          </Grid>
        )}
        <Grid item xs={6}>
          <ButtonStyle
            sx={{
              height: 'var(--row-height)',
            }}
            variant={tradeCalcData.borrowVol != 0 ? 'contained' : 'outlined'}
            size={'medium'}
            color={'primary'}
            onClick={() => {
              onBorrowClick()
            }}
            loading={!getDisabled && btnBorrowStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
            disabled={
              getDisabled ||
              tradeCalcData.step == 'swap' ||
              btnBorrowStatus === TradeBtnStatus.DISABLED ||
              btnBorrowStatus === TradeBtnStatus.LOADING
            }
            fullWidth={true}
          >
            {t('labelVaultBorrowBtn')}
          </ButtonStyle>
        </Grid>
        <Grid item xs={6}>
          <ButtonStyle
            sx={{
              height: 'var(--row-height)',
            }}
            variant={tradeCalcData.borrowVol != 0 ? 'outlined' : 'contained'}
            size={'medium'}
            color={'primary'}
            onClick={() => {
              onSwapClick()
            }}
            loading={
              !getDisabled &&
              tradeCalcData.step === 'swap' &&
              swapBtnStatus === TradeBtnStatus.LOADING
                ? 'true'
                : 'false'
            }
            disabled={
              getDisabled ||
              tradeCalcData.step !== 'swap' ||
              swapBtnStatus === TradeBtnStatus.DISABLED ||
              swapBtnStatus === TradeBtnStatus.LOADING
            }
            fullWidth={true}
          >
            {t('labelVaultSwapBtn')}
          </ButtonStyle>
        </Grid>
      </Grid>
    ) : (
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
        {label}
      </ButtonStyle>
    )
  }, [swapBtnStatus, onSwapClick, getDisabled, label])
  return {
    BtnEle,
    maxEle,
  }
}
