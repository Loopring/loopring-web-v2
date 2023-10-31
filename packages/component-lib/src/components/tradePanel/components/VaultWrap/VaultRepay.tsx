import {
  BackIcon,
  getValuePrecisionThousand,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  TokenType,
  TradeBtnStatus,
  VaultRepayData,
} from '@loopring-web/common-resources'
import { VaultRepayWrapProps } from './Interface'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { Grid, Typography } from '@mui/material'
import { ButtonStyle } from '../../../index'
import { useSettings } from '../../../../stores'
import { BasicACoinTrade } from '../BasicACoinTrade'

export const VaultRepayWrap = <T extends IBData<any>, I, VR extends VaultRepayData<T>>({
  disabled,
  vaultRepayBtnStatus,
  onVaultRepayClick,
  vaultRepayBtnI18nKey,
  tokenProps,
  propsExtends,
  tradeData,
  vaultRepayData,
  onChangeEvent,
  walletMap,
  tokenInfo,
  ...rest
}: VaultRepayWrapProps<T, I, VR>) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const coinRef = React.useRef()
  const { t, i18n } = useTranslation()
  const getDisabled = () => {
    return (
      disabled ||
      vaultRepayData?.tradeData === undefined ||
      vaultRepayData?.coinInfoMap === undefined
    )
  }
  const inputButtonDefaultProps = {
    label: t('labelTokenAmount'),
    subLabel: t('labelAvailable'),
    placeholderText: vaultRepayData.minRepayStr
      ? t('labelInvestMiniDual', {
          value: vaultRepayData.minRepayStr,
        })
      : '0.00',
    maxAllow: true,
    tokenType: TokenType.vault,
    order: 'right',
    // maxValue: vaultRepayData?.tradeData?.borrowed,
    ...tokenProps,
  }
  const label = React.useMemo(() => {
    if (vaultRepayBtnI18nKey) {
      const key = vaultRepayBtnI18nKey.split('|')
      return t(
        key[0],
        key && key[1]
          ? {
              arg: key[1].toString(),
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
          : {
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            },
      )
    } else {
      return t(`labelVaultRepayBtn`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [vaultRepayBtnI18nKey, network])

  return (
    <Grid
      className={vaultRepayData ? '' : 'loading'}
      container
      direction={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flex={1}
      height={'100%'}
      wrap={'nowrap'}
    >
      <Grid
        item
        marginTop={2}
        display={'flex'}
        alignSelf={'stretch'}
        justifyContent={''}
        alignItems={'stretch'}
        flexDirection={'column'}
      >
        <BasicACoinTrade
          isMaxBtn={true}
          {...{
            ...rest,
            t,
            i18n,
            tReady: true,
            disabled,
            onChangeEvent: onChangeEvent as any,
            walletMap,
            tradeData: tradeData as any,
            coinMap: vaultRepayData?.coinInfoMap as any,
            inputButtonDefaultProps,
            coinRef,
          }}
        />
        <Typography
          variant={'body1'}
          display={'inline-flex'}
          alignItems={'center'}
          paddingBottom={1}
        >
          <Typography component={'span'} variant={'inherit'} color={'textSecondary'}>
            {t('labelRepayQuota')}
          </Typography>
          <Typography
            component={'span'}
            variant={'inherit'}
            color={'textPrimary'}
            marginLeft={1 / 2}
          >
            {getValuePrecisionThousand(
              vaultRepayData?.tradeData?.borrowed,
              tokenInfo?.precision ?? 6,
              tokenInfo?.precision ?? 6,
            )}
          </Typography>
        </Typography>
      </Grid>
      <Grid item xs={12} width={'100%'} alignItems={'flex-end'} display={'flex'}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <ButtonStyle
              variant={'outlined'}
              size={'medium'}
              sx={{ height: 40 }}
              onClick={() => {
                onChangeEvent(1, {
                  tradeData: { ...tradeData, tradeValue: 0 },
                  to: 'menu',
                })
              }}
              startIcon={<BackIcon />}
              fullWidth={true}
            >
              {t('labelBack')}
            </ButtonStyle>
          </Grid>
          <Grid item xs={6}>
            <ButtonStyle
              variant={'contained'}
              size={'medium'}
              color={'primary'}
              onClick={() => {
                onVaultRepayClick()
              }}
              loading={
                !getDisabled() && vaultRepayBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'
              }
              disabled={
                getDisabled() ||
                vaultRepayBtnStatus === TradeBtnStatus.DISABLED ||
                vaultRepayBtnStatus === TradeBtnStatus.LOADING
              }
              fullWidth={true}
            >
              {label}
            </ButtonStyle>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
