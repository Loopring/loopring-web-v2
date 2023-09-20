import {
  EmptyValueTag,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  TradeBtnStatus,
  VaultBorrowData,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import { VaultBorrowWrapProps } from './Interface'
import { InputCoin } from '../../../basic-lib'
import React from 'react'
import { Grid, Typography } from '@mui/material'
import { useSettings } from '../../../../stores'
import { ButtonStyle } from '../Styled'

export const VaultBorrow = <T, I, B extends VaultBorrowData, C = IBData<I>>({
  disabled,
  VaultBorrowBtnStatus,
  VaultBorrowBtnI18nKey,
  onVaultBorrowClick,
  tokenProps,
  onAddChangeEvent,
  vaultBorrowData,
  propsExtends: {},
  ...rest
}: VaultBorrowWrapProps<T, I, B, C>) => {
  const coinRef = React.useRef()
  const { t } = useTranslation()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]

  const getDisabled = () => {
    return disabled || vaultBorrowData === undefined || vaultBorrowData.coinInfoMap === undefined
  }
  const handleError = () => {
    if (
      VaultBorrowBtnStatus === TradeBtnStatus.DISABLED &&
      VaultBorrowBtnI18nKey &&
      (/labelAMMNoEnough/.test(VaultBorrowBtnI18nKey) || /labelAMMMax/.test(VaultBorrowBtnI18nKey))
    ) {
      return { error: true }
    }
    return { error: false }
  }

  const handleCountChange = React.useCallback(
    (ibData: IBData<I>, _name: string, _ref: any) => {
      const focus: 'coinA' | 'coinB' = _ref?.current === coinRef.current ? 'coinA' : 'coinB'
      if (vaultBorrowData[focus].tradeValue !== ibData.tradeValue) {
        onAddChangeEvent({
          tradeData: { ...vaultBorrowData, [focus]: ibData },
          type: focus,
        })
      }
    },
    [vaultBorrowData, onAddChangeEvent],
  )
  const propsToken: any = {
    label: t('labelTokenAmount'),
    subLabel: t('labelAvailable'),
    placeholderText: '0.00',
    maxAllow: true,
    ...tokenProps,
    handleError,
    handleCountChange,
    ...rest,
  }
  const label = React.useMemo(() => {
    if (VaultBorrowBtnI18nKey) {
      const key = VaultBorrowBtnI18nKey.split('|')
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
      return t(`labelAddLiquidityBtn`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [VaultBorrowBtnI18nKey])

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
        marginTop={3}
        display={'flex'}
        alignSelf={'stretch'}
        justifyContent={''}
        alignItems={'stretch'}
        flexDirection={'column'}
      >
        <InputCoin<any, I, any>
          ref={coinRef}
          disabled={getDisabled() || VaultBorrowBtnStatus === TradeBtnStatus.LOADING}
          {...{
            ...propsToken,
            name: 'vaultToken',
            isHideError: true,
            order: 'right',
            inputData: vaultBorrowData ? vaultBorrowData.coinA : ({} as any),
            coinMap: vaultBorrowData ? vaultBorrowData.coinInfoMap : ({} as any),
            ...propsExtends,
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
              marginTop={1 / 2}
            >
              <Typography component={'p'} variant='body2' color={'textSecondary'}>
                {t('labelNetworkFee')}
              </Typography>
              <Typography component={'p'} variant='body2' color={'textPrimary'}>
                {vaultBorrowData?.fee && vaultBorrowData?.fee != '0'
                  ? vaultBorrowData.fee + ' ' + vaultBorrowData.myCoinB.belong
                  : EmptyValueTag}
              </Typography>
            </Grid>
          </Grid>
          <Grid item>
            <ButtonStyle
              variant={'contained'}
              size={'large'}
              color={'primary'}
              onClick={() => {
                onVaultBorrowClick(vaultBorrowData)
              }}
              loading={
                !getDisabled() && VaultBorrowBtnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'
              }
              disabled={
                getDisabled() ||
                VaultBorrowBtnStatus === TradeBtnStatus.DISABLED ||
                VaultBorrowBtnStatus === TradeBtnStatus.LOADING
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
