
import { WithTranslation } from 'react-i18next'
import { Box, Grid, Typography } from '@mui/material'
import {
  EmptyValueTag,
  FeeInfo,
  getShortAddr,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  NFTWholeINFO,
  TOAST_TIME,
} from '@loopring-web/common-resources'
import { Button, Toast, ToastType, useAddressTypeLists } from '../../index'
import { TransferViewProps } from './Interface'
import { useSettings } from '../../../stores'
import React from 'react'
import { sanitize } from 'dompurify'

export const TransferConfirm = <T extends IBData<I> & Partial<NFTWholeINFO>, I, C extends FeeInfo>({
  t,
  sureItsLayer2,
  handleConfirm,
  tradeData,
  lastFailed,
  onTransferClick,
  realAddr,
  type,
  feeInfo,
  feeWithActive,
  memo,
}: Partial<TransferViewProps<T, I, C>> & {
  handleConfirm: (index: number) => void
} & WithTranslation) => {
  const { isMobile, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const { walletList } = useAddressTypeLists()
  const [open, setOpen] = React.useState(false)
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
            {t('labelL2toL2Title', {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            })}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Typography color={'var(--color-text-third)'} variant={'body1'}>
          {t('labelL2toL2TokenAmount')}
        </Typography>
        <Typography color={'textPrimary'} marginTop={1} variant={'body1'}>
          {tradeData?.tradeValue}
          <Typography
            component={'span'}
            color={'textSecondary'}
            dangerouslySetInnerHTML={{
              __html:
                sanitize(
                  type === 'NFT'
                    ? ' \u2A09 ' + tradeData?.name ?? 'NFT'
                    : ` ${tradeData?.belong}` ?? EmptyValueTag,
                ) ?? '',
            }}
          />
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={'var(--color-text-third)'} variant={'body1'}>
          {t('labelL2toL2Address')}
        </Typography>
        <Typography color={'textPrimary'} marginTop={1} variant={'body1'}>
          {realAddr}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={'var(--color-text-third)'} variant={'body1'}>
          {t('labelL2toL2AddressType')}
        </Typography>
        <Typography color={'textPrimary'} marginTop={1} variant={'body1'}>
          {walletList.find((item) => item.value === sureItsLayer2)?.label}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography color={'var(--color-text-third)'} variant={'body1'}>
          {feeWithActive
            ? t('labelL2toL2FeeWithActive', {
                addr: getShortAddr(realAddr ?? ''),
              })
            : t('labelL2toL2Fee')}
        </Typography>
        <Typography color={'textPrimary'} marginTop={1} variant={'body1'}>
          {feeInfo?.fee + ' '} {feeInfo?.belong}
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
            handleConfirm(1)
          }}
        >
          {t('labelConfirm')}
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
