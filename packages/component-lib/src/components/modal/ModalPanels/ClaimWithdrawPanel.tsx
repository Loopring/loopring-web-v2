import { WithTranslation, withTranslation } from 'react-i18next'

import {
  FeeInfo,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  TOAST_TIME,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import React from 'react'
import { ClaimProps } from '../../tradePanel'
import { Box, Grid, Typography } from '@mui/material'
import { Button } from '../../basic-lib'
import { useSettings } from '../../../stores'
import { Toast, ToastType } from '../../toast'
import { useTheme } from '@emotion/react'
import { FeeSelect } from './FeeSelect'

export const ClaimWithdrawPanel = withTranslation(['common', 'error'], {
  withRef: true,
})(
  <T extends IBData<I> & { tradeValueView: string }, I, Fee extends FeeInfo>({
    t,
    tradeData,
    feeInfo,
    btnInfo,
    btnStatus,
    isFeeNotEnough,
    handleFeeChange,
    chargeFeeTokenList,
    disabled,
    claimType,
    onClaimClick,
    isNFT,
    nftIMGURL,
  }: ClaimProps<T, I, Fee> & WithTranslation & { assetsData: any[] }) => {
    const { isMobile, defaultNetwork } = useSettings()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const [open, setOpen] = React.useState(false)
    const [showFeeModal, setShowFeeModal] = React.useState(false)
    const handleToggleChange = (value: Fee) => {
      if (handleFeeChange) {
        handleFeeChange(value)
      }
    }
    const getDisabled = React.useMemo(() => {
      return disabled || btnStatus === TradeBtnStatus.DISABLED
    }, [disabled, btnStatus])
    const theme = useTheme()
    return (
      <Grid
        className={'confirm'}
        container
        paddingLeft={isMobile ? 2 : 5 / 2}
        paddingRight={isMobile ? 2 : 5 / 2}
        direction={'column'}
        alignItems={'stretch'}
        flex={1}
        width={`calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`}
        // height={isMobile ? "auto" : 560}
        minWidth={'var(--swap-box-width)'}
        flexWrap={'nowrap'}
        spacing={2}
        paddingBottom={5 / 2}
      >
        <Grid item xs={12} marginTop={1}>
          <Box
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'}
            alignItems={'center'}
            marginBottom={2}
          >
            <Typography component={'h4'} variant={isMobile ? 'h4' : 'h3'} whiteSpace={'pre'}>
              {t('labelRedPacketClaimTitle', {
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              })}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          {isNFT ? (
            <Box display={'flex'} flexDirection={'column'} alignItems='center'>
              <img height={8 * theme.unit} src={nftIMGURL} />
              <Typography color={'textSecondary'} marginTop={1} variant={'body2'}>
                {tradeData?.tradeValueView + ' NFTs'}
              </Typography>
            </Box>
          ) : (
            <Typography
              component={'h5'}
              marginTop={1}
              textAlign={'center'}
              color={'textPrimary'}
              variant={'h2'}
            >
              {tradeData?.tradeValueView + ' ' + tradeData?.belong}
            </Typography>
          )}
        </Grid>
        {/*<Grid item xs={12}>*/}
        {/*  <Typography color={"var(--color-text-third)"} variant={"body1"}>*/}
        {/*    {t("labelL2toL2TokenAmount")}*/}
        {/*  </Typography>*/}
        {/*</Grid>*/}

        <Grid item xs={12}>
          <Typography color={'var(--color-text-third)'} variant={'body1'}>
            {t('labelRedPacketFrom')}
          </Typography>
          <Typography component={'span'} variant={'body1'} color={'var(--color-text-primary)'}>
            {t(`labelClaim${claimType}`, { symbol: tradeData?.belong })}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Typography color={'var(--color-text-third)'} variant={'body1'}>
            {t('labelRedPacketTo', {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            })}
          </Typography>
          <Typography component={'span'} variant={'body1'} color={'var(--color-text-primary)'}>
            {t('labelToMyL2', {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            })}
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
                  handleToggleChange(fee as Fee)
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
              if (onClaimClick) {
                onClaimClick(tradeData)
              } else {
                setOpen(true)
              }
            }}
            loading={!getDisabled && btnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
            disabled={getDisabled || btnStatus === TradeBtnStatus.LOADING}
          >
            {t(btnInfo?.label ? btnInfo?.label : `labelConfirm`)}
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
  },
) as <T, I>(props: ClaimProps<T, I> & React.RefAttributes<any>) => JSX.Element
