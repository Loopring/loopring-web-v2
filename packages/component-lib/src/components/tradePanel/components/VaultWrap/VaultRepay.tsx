import {
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  TradeBtnStatus, VaultRepayData,
} from '@loopring-web/common-resources'
import { VaultRepayWrapProps } from './Interface'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { Box, Grid, Typography } from '@mui/material'
import { ButtonStyle, InputCoin } from '../../../index'

import { useSettings } from '../../../../stores'

export const VaultRepay = <T, I, VR extends VaultRepayData<C>, C = IBData<I>>(
  {
    disabled,
    vaultRepayBtnStatus,
    onVaultRepayClick,
    vaultRepayBtnI18nKey,
    tokenProps,
    propsExtends,
    // onRemoveChangeEvent,
    // handleError,
    // propsLPExtends = {},
    vaultRepayData,
  }: VaultRepayWrapProps<T, I, VR, C> => {
  const { coinJson, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const coinRef = React.useRef()
  const { t } = useTranslation()

  const getDisabled = () => {
    return disabled || vaultRepayData === undefined || vaultRepayData.coinInfoMap === undefined
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
  }, [vaultRepayBtnI18nKey])


  const handleCountChange = React.useCallback(
    (ibData: IBData<I>, _name: string, _ref: any) => {
      // const focus: 'coinA' | 'coinB' = _ref?.current === coinARef.current ? 'coinA' : 'coinB'
      // if (vaultRepayData[focus].tradeValue !== ibData.tradeValue) {
      //   onRemoveChangeEvent({
      //     tradeData: { ...vaultRepayData, [focus]: ibData },
      //     type: focus,
      //   })
      // }
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
      overflow={'hidden'}
    >
      <Grid
        item
        display={'flex'}
        alignSelf={'stretch'}
        alignItems={'stretch'}
        flexDirection={'column'}
      >
        <Grid item xs={12} minHeight={86} paddingTop={1}>
          <InputCoin
            ref={coinRef}
            disabled={getDisabled()}
            {...{
              ...propsToken,
              handleCountChange: (data, _name, ref) => handleCountChange(data, ref),
              isHideError: true,
              isShowCoinInfo: false,
              order: 'right',
              inputData: vaultRepayData ? vaultRepayData.tradeData : ({} as any),
              coinMap: vaultRepayData ? vaultRepayData.coinInfoMap : ({} as any),
              ...propsExtends,
            }}
          />
        </Grid>

        <Box
          borderRadius={1}
          style={{ background: 'var(--color-table-header-bg)' }}
          alignItems={'stretch'}
          display={'flex'}
          paddingY={1}
          paddingX={2}
          flexDirection={'column'}
        >
          <Typography variant={'body1'} color={'textSecondary'} alignSelf={'flex-start'}>
            {t('labelMinReceive')}
          </Typography>
        </Box>
      </Grid>

      <Grid item alignSelf={'stretch'}>
        <Grid container direction={'column'} spacing={1} alignItems={'stretch'}>
          <Grid item>
            <ButtonStyle
              variant={'contained'}
              size={'large'}
              color={'primary'}
              onClick={() => {
                onVaultRepayClick(vaultRepayData)
                // setSelectedPercentage(0);
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
