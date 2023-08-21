import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography } from '@mui/material'
import {
  EmptyValueTag,
  FeeInfo,
  IBData,
  TOAST_TIME,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import {
  BanxaViewProps,
  Button,
  FeeSelect,
  Toast,
  ToastType,
} from '../../index'
import { useSettings } from '../../../stores'
import React from 'react'

export const BanxaConfirm = <T extends IBData<I>, I, C extends FeeInfo>({
  tradeData,
  onTransferClick,
  disabled,
  isFeeNotEnough,
  handleFeeChange,
  chargeFeeTokenList,
  transferBtnStatus,
  transferI18nKey,
  feeInfo,
  memo,
  balanceNotEnough,
  offBanxaValue,
}: BanxaViewProps<T, I, C> & {
  balanceNotEnough: {
    isEnough: boolean
    reason?: string
  }
}) => {
  const { isMobile } = useSettings()
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)
  const [showFeeModal, setShowFeeModal] = React.useState(false)
  const handleToggleChange = (value: C) => {
    if (handleFeeChange) {
      handleFeeChange(value)
    }
  }
  const getDisabled = React.useMemo(() => {
    return disabled || transferBtnStatus === TradeBtnStatus.DISABLED
  }, [disabled, transferBtnStatus])
  return (
    <Grid
      className={'confirm'}
      container
      paddingLeft={isMobile ? 2 : 5 / 2}
      paddingRight={isMobile ? 2 : 5 / 2}
      direction={'column'}
      alignItems={'stretch'}
      flex={1}
      height={'100%'}
      minWidth={240}
      flexWrap={'nowrap'}
      spacing={2}
    >
      <Grid item xs={12}>
        <Box
          display={'flex'}
          flexDirection={'column'}
          justifyContent={'center'}
          alignItems={'center'}
          marginBottom={2}
        >
          <Typography component={'h4'} variant={isMobile ? 'h4' : 'h3'} whiteSpace={'pre'}>
            {t('labelL2toBanxaTitle')}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Typography color={'var(--color-text-third)'} variant={'body1'}>
          {t('labelL2toL2TokenAmount')}
        </Typography>
        <Typography color={'textPrimary'} marginTop={1} variant={'body1'}>
          {tradeData?.tradeValue + ' '}
          {tradeData?.belong}
        </Typography>
        {balanceNotEnough.isEnough && (
          <Typography
            color={'var(--color-error)'}
            variant={'body2'}
            marginTop={1 / 4}
            alignSelf={'stretch'}
            position={'relative'}
          >
            {t(
              // @ts-ignore
              balanceNotEnough?.reason == 1 ? 'labelBanxaFeeNoBalance' : 'labelRampNoBalance',
              { belong: tradeData?.belong },
            )}
          </Typography>
        )}
      </Grid>
      <Grid item xs={12}>
        <Typography color={'var(--color-text-third)'} variant={'body1'}>
          {t('labelFiatAmount')}
        </Typography>
        <Typography color={'textPrimary'} marginTop={1} variant={'body1'}>
          {offBanxaValue?.fiat_amount + ' ' + offBanxaValue?.fiat_code}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={'var(--color-text-third)'} variant={'body1'}>
          {t('labelL2toL2AddressType')}
        </Typography>
        <Typography color={'textPrimary'} marginTop={1} variant={'body1'}>
          {t('labelWalletTypeOptions', { type: 'Banxa' })}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Typography color={'var(--color-text-third)'} variant={'body1'}>
          {t('labelMemo')}
        </Typography>
        <Typography color={'textPrimary'} marginTop={1} variant={'body1'}>
          {memo ?? EmptyValueTag}
        </Typography>
      </Grid>

      <Grid item xs={12} alignSelf={'stretch'} position={'relative'}>
        {!chargeFeeTokenList?.length ? (
          <Typography>{t('labelFeeCalculating')}</Typography>
        ) : (
          <>
            <FeeSelect
              chargeFeeTokenList={chargeFeeTokenList}
              handleToggleChange={(fee: FeeInfo) => {
                handleToggleChange(fee as C)
                setShowFeeModal(false)
              }}
              feeInfo={feeInfo as FeeInfo}
              open={showFeeModal}
              onClose={() => {
                setShowFeeModal(false)
              }}
              isFeeNotEnough={isFeeNotEnough.isFeeNotEnough}
              feeLoading={isFeeNotEnough.isOnLoading}
              onClickFee={() => setShowFeeModal((prev) => !prev)}
            />
          </>
        )}
      </Grid>

      <Grid item marginTop={2} alignSelf={'stretch'} paddingBottom={0}>
        <Button
          fullWidth
          variant={'contained'}
          size={'medium'}
          color={'primary'}
          onClick={async () => {
            if (onTransferClick) {
              await onTransferClick({ ...tradeData, memo } as unknown as T)
            } else {
              setOpen(true)
            }
          }}
          loading={!getDisabled && transferBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
          disabled={getDisabled || transferBtnStatus === TradeBtnStatus.LOADING}
        >
          {t(transferI18nKey ?? `labelConfirm`)}
        </Button>
      </Grid>
      <Toast
        alertText={t('errorBase', { ns: 'error' })}
        open={open}
        autoHideDuration={TOAST_TIME}
        onClose={() => {
          setOpen(false)
        }}
        severity={ToastType.error}
      />
    </Grid>
  )
}
