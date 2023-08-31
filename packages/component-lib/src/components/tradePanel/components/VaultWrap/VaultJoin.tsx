import {
  CoinInfo,
  EmptyValueTag,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  TRADE_TYPE,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import { VaultJoinWrapProps } from './Interface'
import React from 'react'
import { Grid, Typography } from '@mui/material'
import { useSettings } from '../../../../stores'
import { ButtonStyle } from '../Styled'
import { BasicACoinTrade } from '../BasicACoinTrade'
import { InputButtonDefaultProps } from '../Interface'

export const VaultJoinWrap = <T extends IBData<I>, I, V>({
  disabled,
  switchStobEvent,
  btnStatus,
  tradeData,
  vaultJoinData,
  btnI18nKey,
  onSubmitClick,
  onChangeEvent,
  propsExtends = {},
  // coinAPrecision,
  // coinBPrecision,
  ...rest
}: VaultJoinWrapProps<T, I, V>) => {
  const { t, ...i18n } = useTranslation()
  const inputBtnRef = React.useRef()
  let { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const [minFee] = React.useState<{ minFee: string } | undefined>(undefined)
  const getDisabled = React.useMemo(() => {
    return disabled || btnStatus === TradeBtnStatus.DISABLED
  }, [btnStatus, disabled])

  const inputButtonDefaultProps: InputButtonDefaultProps<I, CoinInfo<I>> = {
    label: t('labelEnterToken'),
  }
  const label = React.useMemo(() => {
    if (btnI18nKey) {
      const key = btnI18nKey.split('|')
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
      return t(`labelVaultJoinBtn`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [btnI18nKey])

  return (
    <Grid
      className={vaultJoinData ? '' : 'loading'}
      container
      direction={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flex={1}
      height={'100%'}
      paddingX={3}
    >
      <Grid
        item
        marginTop={3}
        display={'flex'}
        alignSelf={'stretch'}
        justifyContent={''}
        alignItems={'stretch'}
        flexDirection={'column'}
      >
        <BasicACoinTrade
          {...{
            ...rest,
            ...i18n,
            t,
            tradeData: tradeData as any,
            type: TRADE_TYPE.TOKEN,
            disabled,
            onChangeEvent: onChangeEvent as any,
            // walletMap,
            // tradeData,
            // coinMap,
            inputButtonDefaultProps,
            placeholderText: minFee?.minFee ? minFee.minFee : '0.00',
            inputBtnRef,
          }}
        />
      </Grid>
      <Grid item alignSelf={'stretch'}>
        <Grid container direction={'column'} spacing={1} alignItems={'stretch'}>
          <Grid item paddingBottom={3} sx={{ color: 'text.secondary' }}>
            <Grid
              container
              justifyContent={'space-between'}
              direction={'row'}
              alignItems={'center'}
              height={24}
            >
              <Typography component={'p'} variant='body2' color={'textSecondary'}>
                {t('labelLabel')}
              </Typography>
              {vaultJoinData ? <></> : EmptyValueTag}
            </Grid>

            <Grid
              container
              justifyContent={'space-between'}
              direction={'row'}
              alignItems={'center'}
              marginTop={1 / 2}
            >
              <Typography component={'p'} variant='body2' color={'textSecondary'}>
                {t('labelLabel')}
              </Typography>
              {vaultJoinData ? <></> : EmptyValueTag}
            </Grid>
          </Grid>
          <Grid item>
            <ButtonStyle
              variant={'contained'}
              size={'large'}
              color={'primary'}
              onClick={() => {
                onSubmitClick(tradeData)
              }}
              loading={!getDisabled && btnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
              disabled={
                getDisabled ||
                btnStatus === TradeBtnStatus.DISABLED ||
                btnStatus === TradeBtnStatus.LOADING
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
