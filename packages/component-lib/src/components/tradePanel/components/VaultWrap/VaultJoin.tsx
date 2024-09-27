import {
  CoinInfo,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  Info2Icon,
  L1L2_NAME_DEFINED,
  MapChainId,
  TokenType,
  TRADE_TYPE,
  TradeBtnStatus,
  VaultJoinData,
} from '@loopring-web/common-resources'
import { Trans, useTranslation } from 'react-i18next'
import { VaultJoinWrapProps } from './Interface'
import React from 'react'
import { Box, Grid, Tooltip, Typography } from '@mui/material'
import { useSettings } from '../../../../stores'
import { ButtonStyle } from '../Styled'
import { BasicACoinTrade } from '../BasicACoinTrade'
import { InputButtonDefaultProps } from '../Interface'
import { BasicACoinInput } from '../BasicACoinInput'
import { CoinIcon } from '@loopring-web/component-lib'
import InfoIcon from '@mui/icons-material/Info'
import { numberFormat } from '@loopring-web/core'
import { marginLevelTypeToColor } from './utils'
import EastIcon from '@mui/icons-material/East'

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
  marginLevelChange,
  holdingCollateral,
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
      return t(isActiveAccount ? `labelVaultJoinBtn` : `labelVaultConfirm`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [btnI18nKey, isActiveAccount, network, t])

  return (
    <Grid
      className={vaultJoinData ? '' : 'loading'}
      container
      direction={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flex={1}
      height={'290px'}
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
            tReady: true,
            tradeData: tradeData as any,
            type: TRADE_TYPE.TOKEN,
            disabled,
            onChangeEvent: onChangeEvent as any,
            inputButtonDefaultProps: {
              ...inputButtonDefaultProps,
              disableBelong: !isActiveAccount,
            },
            placeholderText: '0.00',
            inputBtnRef,
            tokenNotEnough: t(
              rest.isAddOrRedeem === 'Add'
                ? `labelVaultJoinNotEnough`
                : `labelVaultRedeemNotEnough`,
              { arg: tradeData.belong },
            ),
            ...tokenProps,
          }}
        />
      </Grid>
      <Grid item alignSelf={'stretch'} marginTop={rest.isAddOrRedeem === 'Redeem' ? 2 : 6}>
        <Grid container direction={'column'} spacing={1} alignItems={'stretch'}>
          <Grid item paddingBottom={1} sx={{ color: 'text.secondary' }}>
            {rest.isAddOrRedeem === 'Add' ? (
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
                      {t('labelVaultQuota')}
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
            ) : (
              <Grid
                container
                justifyContent={'space-between'}
                direction={'row'}
                alignItems={'center'}
                height={24}
              >
                <Typography
                  component={'span'}
                  variant='body2'
                  color={'textSecondary'}
                  alignItems={'center'}
                  display={'flex'}
                >
                  {t('labelVaultHoldingCollateral')}
                </Typography>

                {holdingCollateral ? (
                  <Typography component={'span'} variant='body2' color={'textPrimary'}>
                    {holdingCollateral + ' ' + (vaultJoinData?.belong as string)}
                  </Typography>
                ) : (
                  EmptyValueTag
                )}
              </Grid>
            )}

            {!isActiveAccount ? (
              <Grid
                container
                justifyContent={'space-between'}
                direction={'row'}
                alignItems={'center'}
                marginTop={1 / 2}
              >
                <Typography
                  component={'span'}
                  variant='body2'
                  color={'textSecondary'}
                  alignItems={'center'}
                  display={'inline-flex'}
                >
                  {t('labelVaultMarginLevel')}
                </Typography>
                <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                  {marginLevelChange ? (
                    <>
                      <Typography color={marginLevelTypeToColor(marginLevelChange.from.type)}>
                        {numberFormat(marginLevelChange.from.marginLevel, { fixed: 2 })}
                      </Typography>
                      <EastIcon sx={{ marginX: 0.5 }} />
                      <Typography color={marginLevelTypeToColor(marginLevelChange.to.type)}>
                        {numberFormat(marginLevelChange.to.marginLevel, { fixed: 2 })}
                      </Typography>
                    </>
                  ) : (
                    EmptyValueTag
                  )}
                </Box>
              </Grid>
            ) : null}
          </Grid>

          {rest.isAddOrRedeem === 'Redeem' && (
            <Grid item display={'flex'} marginBottom={1}>
              <InfoIcon sx={{ marginRight: 1, color: 'var(--color-text-secondary)' }} />
              <Typography color={'var(--color-text-secondary)'} variant={'body2'}>
                {t('labelVaultRedeemAlert')}
              </Typography>
            </Grid>
          )}
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
