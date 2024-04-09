import {
  BackIcon,
  getValuePrecisionThousand,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  TokenType,
  TradeBtnStatus,
  VaultRepayData,
} from '@loopring-web/common-resources'
import { VaultRepayWrapProps } from './Interface'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { Grid, Typography, Box, Divider } from '@mui/material'
import { ButtonStyle } from '../Styled'
import { useSettings } from '../../../../stores'
import { BasicACoinTrade } from '../BasicACoinTrade'
import {
  CoinIcon,
} from '@loopring-web/component-lib'

export const VaultRepayWrap = <
  T extends IBData<any> & { borrowed: string; max: string },
  I,
  VR extends VaultRepayData<T>,
>({
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
  handleError,
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
    subLabel: '',
    placeholderText: vaultRepayData.minRepayStr
      ? t('labelInvestMiniDual', {
          value: vaultRepayData.minRepayStr,
        })
      : '0.00',
    maxAllow: true,
    tokenType: TokenType.vault,
    order: 'right',
    tokenImageKey: vaultRepayData?.tradeData?.erc20Symbol,
    belongAlice: vaultRepayData?.tradeData?.erc20Symbol,
    // maxValue: vaultRepayData?.tradeData?.borrowed,
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
    <Box
      className={vaultRepayData ? '' : 'loading'}
      flexDirection={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flex={1}
      display={'flex'}
      height={'100%'}
    >
      <Box
        flexDirection={'column'}
        display={'flex'}
        alignSelf={'stretch'}
        alignItems={'stretch'}
        // borderBottom={'1px solid var(--color-border)'}
      >
        <BasicACoinTrade
          isMaxBtn={true}
          inputBtnRef={coinRef}
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
            ...tokenProps,
            tokenNotEnough: 'labelVaultRepayNotEnough'
          }}
        />
      </Box>
      <Divider sx={{ width: '100%', marginY: 3 }} />
      <Grid container spacing={1} alignItems={'stretch'}>
        <Grid
          item
          xs={12}
          direction={'row'}
          display={'flex'}
          marginBottom={1}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Typography
            component={'p'}
            variant='body2'
            color={'textSecondary'}
            display={'inline-flex'}
            alignItems={'center'}
          >
            {t('labelVaultRepayBalance')}
          </Typography>
          <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
            <CoinIcon
              tokenImageKey={(vaultRepayData as any).erc20Symbol}
              symbol={vaultRepayData.belong}
              type={TokenType.vault}
            />
            <Typography component={'p'} variant='body2' color={'textPrimary'}>
              {getValuePrecisionThousand(
                vaultRepayData?.tradeData?.balance,
                tokenInfo?.vaultTokenAmounts.qtyStepScale ?? 6,
                tokenInfo?.vaultTokenAmounts.qtyStepScale ?? 6,
              ) +
                ' ' +
                (vaultRepayData as any).erc20Symbol}
            </Typography>
          </Box>
        </Grid>
        <Grid
          item
          xs={12}
          direction={'row'}
          display={'flex'}
          marginBottom={1}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Typography
            component={'p'}
            variant='body2'
            color={'textSecondary'}
            display={'inline-flex'}
            alignItems={'center'}
          >
            {t('labelRepayQuota')}
          </Typography>
          <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
            <CoinIcon
              tokenImageKey={(vaultRepayData as any).erc20Symbol}
              symbol={vaultRepayData.belong}
              type={TokenType.vault}
            />
            <Typography component={'p'} variant='body2' color={'textPrimary'}>
              {getValuePrecisionThousand(
                vaultRepayData?.tradeData?.borrowed,
                tokenInfo?.precision ?? 6,
                tokenInfo?.precision ?? 6,
              ) +
                ' ' +
                (vaultRepayData as any).erc20Symbol}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Grid marginTop={3} container spacing={2}>
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
    </Box>
  )
}
