import {
  EmptyValueTag,
  IBData,
  Info2Icon,
  L1L2_NAME_DEFINED,
  MapChainId,
  TokenType,
  TRADE_TYPE,
  TradeBtnStatus,
  VaultBorrowData,
} from '@loopring-web/common-resources'
import { VaultBorrowWrapProps } from './Interface'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSettings } from '../../../../stores'
import { Grid, Tooltip, Typography } from '@mui/material'
import { BasicACoinTrade } from '../BasicACoinTrade'
import { ButtonStyle } from '../Styled'
export const VaultBorrowWrap = <
  T extends IBData<I> & { erc20Symbol: string },
  V extends VaultBorrowData<T>,
  I,
>({
  disabled,
  vaultBorrowBtnStatus,
  vaultBorrowBtnI18nKey,
  onVaultBorrowClick,
  tokenProps,
  onChangeEvent,
  vaultBorrowData,
  walletMap,
  tradeData,
  coinMap,
  propsExtends,
  ...rest
}: VaultBorrowWrapProps<T, I, V>) => {
  const inputBtnRef = React.useRef()
  const { t, i18n } = useTranslation()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const getDisabled = () => {
    return disabled || vaultBorrowData === undefined || vaultBorrowData?.coinInfoMap === undefined
  }
  const inputButtonDefaultProps = {
    label: t('labelVaultBrowserToken'),
    tokenType: TokenType.vault,
    placeholderText: vaultBorrowData.minBorrowStr
      ? t('labelInvestMiniDual', {
          value: vaultBorrowData.minBorrowStr,
        })
      : '0.00',
    tokenImageKey: vaultBorrowData?.tradeData?.erc20Symbol,
  }
  const label = React.useMemo(() => {
    if (vaultBorrowBtnI18nKey) {
      const key = vaultBorrowBtnI18nKey.split('|')
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
      return t(`labelVaultBorrowBtn`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [vaultBorrowBtnI18nKey])

  return (
    <Grid
      className={vaultBorrowData ? '' : 'loading'}
      container
      direction={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flex={1}
      height={'100%'}
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
          {...{
            ...rest,
            type: TRADE_TYPE.TOKEN,
            t,
            i18n,
            tReady: true,
            disabled,
            onChangeEvent,
            walletMap,
            tradeData,
            coinMap,
            inputButtonDefaultProps,
            ...tokenProps,
            inputBtnRef,
          }}
        />
        <Typography
          marginTop={2}
          component={'span'}
          display={'flex'}
          alignSelf={'stretch'}
          alignItems={'stretch'}
          flexDirection={'row'}
        >
          <Tooltip title={t('labelVaultQuotaTooltips').toString()} placement={'top'}>
            <Typography
              component={'span'}
              variant={'body1'}
              alignItems={'center'}
              color={'textSecondary'}
              display={'inline-flex'}
            >
              <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
              {t('labelVaultQuota')}
            </Typography>
          </Tooltip>
          <Typography component={'span'} variant={'body1'} color={'textPrimary'} marginLeft={1 / 2}>
            {vaultBorrowData.maxBorrowStr
              ? vaultBorrowData.maxBorrowStr + ' ' + vaultBorrowData?.belong?.toString()
              : EmptyValueTag}
          </Typography>
        </Typography>
      </Grid>

      <Grid item alignSelf={'stretch'}>
        <Grid container direction={'column'} spacing={1} alignItems={'stretch'}>
          <Grid item>
            <ButtonStyle
              variant={'contained'}
              size={'large'}
              color={'primary'}
              onClick={() => {
                onVaultBorrowClick()
              }}
              loading={
                !getDisabled() && vaultBorrowBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'
              }
              disabled={
                getDisabled() ||
                vaultBorrowBtnStatus === TradeBtnStatus.DISABLED ||
                vaultBorrowBtnStatus === TradeBtnStatus.LOADING
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
