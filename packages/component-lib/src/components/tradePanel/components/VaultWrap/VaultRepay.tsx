import {
  BackIcon,
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
import { Grid } from '@mui/material'
import { ButtonStyle, InputMaxCoin } from '../../../index'
import { useSettings } from '../../../../stores'

export const VaultRepayWrap = <
  T extends IBData<any>,
  I,
  VR extends VaultRepayData<C>,
  C = IBData<I>,
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
}: VaultRepayWrapProps<T, I, VR>) => {
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const coinRef = React.useRef()
  const { t } = useTranslation()
  const getDisabled = () => {
    return disabled || vaultRepayData === undefined || vaultRepayData?.coinInfoMap === undefined
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
      return t(`labelRemoveLiquidityBtn`, {
        l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
      })
    }
  }, [vaultRepayBtnI18nKey, network])
  const handleCountChange: any = React.useCallback(
    (_tradeData: T, _name: string, _ref: any) => {
      //const focus: 'buy' | 'sell' = _ref?.current === buyRef.current ? 'buy' : 'sell';
      if (tradeData.tradeValue !== _tradeData.tradeValue) {
        onChangeEvent(0, {
          tradeData: { ...tradeData, ..._tradeData },
          to: 'button',
        })
      }

      // onCoinValueChange(ibData);
    },
    [vaultRepayData],
  )
  const propsToken: any = {
    label: t('labelTokenAmount'),
    subLabel: t('labelAvailable'),
    placeholderText: '0.00',
    maxAllow: true,
    ...tokenProps,
    // handleError,
    handleCountChange,
    // ...rest,
  }

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
        <InputMaxCoin
          ref={coinRef}
          tokenType={TokenType.vault}
          disabled={getDisabled()}
          {...{
            ...propsToken,
            handleCountChange: (data, _name, ref) => handleCountChange(data, ref),
            isHideError: true,
            isShowCoinInfo: false,
            inputData: vaultRepayData ? vaultRepayData.tradeData : ({} as any),
            coinMap: vaultRepayData ? vaultRepayData.coinInfoMap : ({} as any),
            ...propsExtends,
          }}
        />
      </Grid>
      <Grid item xs={12} width={'100%'} alignItems={'flex-end'}>
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
