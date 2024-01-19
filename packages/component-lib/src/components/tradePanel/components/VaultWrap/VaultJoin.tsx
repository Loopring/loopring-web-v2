import {
  CoinInfo,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  Info2Icon,
  L1L2_NAME_DEFINED,
  MapChainId,
  TRADE_TYPE,
  TradeBtnStatus,
  VaultJoinData,
} from '@loopring-web/common-resources'
import { Trans, useTranslation } from 'react-i18next'
import { VaultJoinWrapProps } from './Interface'
import React from 'react'
import { Grid, Tooltip, Typography } from '@mui/material'
import { useSettings } from '../../../../stores'
import { ButtonStyle } from '../Styled'
import { BasicACoinTrade } from '../BasicACoinTrade'
import { InputButtonDefaultProps } from '../Interface'
import { BasicACoinInput } from '../BasicACoinInput'

export const VaultJoinWrap = <T extends IBData<I>, I, V extends VaultJoinData>({
  disabled,
  btnStatus,
  tradeData,
  vaultJoinData,
  btnI18nKey,
  onSubmitClick,
  onChangeEvent,
  propsExtends = {},
  isActiveAccount,
  // coinAPrecision,
  // coinBPrecision,
  tokenProps,
  ...rest
}: VaultJoinWrapProps<T, I, V>) => {
  const { t, ...i18n } = useTranslation()
  const inputBtnRef = React.useRef()
  // const inputCoinRef = React.useRef()

  let { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  // const [minFee] = React.useState<{ minFee: string } | undefined>(undefined)
  const getDisabled = React.useMemo(() => {
    return disabled || btnStatus === TradeBtnStatus.DISABLED
  }, [btnStatus, disabled])

  const inputButtonDefaultProps: InputButtonDefaultProps<I, CoinInfo<I>> = {
    label: t('labelEnterToken'),
    focusOnInput: true,
  }
  // myLog('VaultJoinWrap inputBtnRef', inputBtnRef)
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
      return t(isActiveAccount ? `labelVaultJoinBtn` : `labelVaultAddBtn`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [btnI18nKey, isActiveAccount, network, t])
  const inputEle = React.useMemo(() => {
    return !isActiveAccount ? (
      <BasicACoinInput
        {...{
          ...rest,
          ...i18n,
          t,
          tReady: true,
          tradeData: tradeData as any,
          type: TRADE_TYPE.TOKEN,
          disabled,
          onChangeEvent: onChangeEvent as any,
          inputCoinDefaultProps: inputButtonDefaultProps,
          inputCoinRef: inputBtnRef,
          ...tokenProps,
          // inputCoinProps: rest?.inputCoinProps,
        }}
      />
    ) : (
      <BasicACoinTrade
        {...{
          ...rest,
          ...i18n,
          t,
          tReady: true,
          tradeData: tradeData as any,
          type: TRADE_TYPE.TOKEN,
          disabled,
          onChangeEvent: onChangeEvent as any,
          inputButtonDefaultProps: { ...inputButtonDefaultProps, disableBelong: !isActiveAccount },
          placeholderText: '0.00',
          inputBtnRef,
          ...tokenProps,
        }}
      />
    )
  }, [
    disabled,
    i18n,
    inputButtonDefaultProps,
    isActiveAccount,
    onChangeEvent,
    rest,
    t,
    tokenProps,
    tradeData,
  ])

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
        {inputEle}
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
              <Tooltip title={t('labelVaultTotalQuoteDes').toString()}>
                <Typography
                  component={'span'}
                  variant='body2'
                  color={'textSecondary'}
                  alignItems={'center'}
                  display={'flex'}
                >
                  <Trans i18nKey={'labelVaultTotalQuote'}>
                    Total Quote
                    <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                  </Trans>
                </Typography>
              </Tooltip>

              {vaultJoinData && vaultJoinData?.maxShowVal ? (
                <Typography component={'span'} variant='body2' color={'textPrimary'}>
                  {vaultJoinData?.maxShowVal + ' ' + vaultJoinData?.belong}
                </Typography>
              ) : (
                EmptyValueTag
              )}
            </Grid>

            <Grid
              container
              justifyContent={'space-between'}
              direction={'row'}
              alignItems={'center'}
              marginTop={1 / 2}
            >
              <Tooltip title={t('labelVaultTokenQuoteDes').toString()}>
                <Typography
                  component={'span'}
                  variant='body2'
                  color={'textSecondary'}
                  alignItems={'center'}
                  display={'inline-flex'}
                >
                  {t('labelVaultTotalToken')}
                  <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                </Typography>
              </Tooltip>
              <>
                {vaultJoinData && vaultJoinData?.tradeValue ? (
                  <Typography component={'span'} variant='body2' color={'textPrimary'}>
                    {`${getValuePrecisionThousand(
                      vaultJoinData?.tradeValue,
                      vaultJoinData?.vaultTokenInfo?.decimals,
                      vaultJoinData?.vaultTokenInfo?.decimals,
                      undefined,
                    )} ${vaultJoinData?.vaultSymbol}`}
                  </Typography>
                ) : (
                  EmptyValueTag
                )}
              </>
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
