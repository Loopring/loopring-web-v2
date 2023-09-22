import React from 'react'
import {
  DualCalcData,
  DualViewInfo,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { DualDisplayMode, DualWrapProps } from './Interface'
import { useTranslation } from 'react-i18next'
import { Box, Grid, Typography } from '@mui/material'
import { useSettings } from '../../../../stores'
import { ButtonStyle } from '../Styled'
import { InputCoin } from '../../../basic-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import { DualDetail } from './dualDetail'

export const DualWrap = <
  T extends IBData<I> & { isRenew: boolean; targetPrice: string; duration: string },
  I,
  DUAL extends DualCalcData<R>,
  R extends DualViewInfo,
>({
  refreshRef,
  disabled,
  btnInfo,
  isLoading,
  onRefreshData,
  onSubmitClick,
  onChangeEvent,
  tokenSellProps,
  dualCalcData,
  handleError,
  tokenSell,
  btnStatus,
  tokenMap,
  accStatus,
  isBeginnerMode,
  dualProducts,
  toggle,
  whitList,
  ...rest
}: DualWrapProps<T, I, DUAL> & {
  isBeginnerMode: boolean
  // setConfirmDualAutoInvest: (state: boolean) => void
}) => {
  const coinSellRef = React.useRef()
  const { t } = useTranslation()
  const { defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const priceSymbol = dualCalcData?.dualViewInfo?.currentPrice?.quote
  const [displayMode, setDisplayMode] = React.useState<DualDisplayMode>(
    isBeginnerMode ? DualDisplayMode.beginnerModeStep1 : DualDisplayMode.nonBeginnerMode,
  )

  const getDisabled = React.useMemo(() => {
    return disabled || dualCalcData === undefined
  }, [btnStatus, dualCalcData, disabled])

  const handleCountChange = React.useCallback(
    (ibData: T, _name: string, _ref: any) => {
      if (dualCalcData['coinSell'].tradeValue !== ibData.tradeValue) {
        myLog('dual handleCountChange', _name, ibData)

        onChangeEvent({
          tradeData: { ...dualCalcData?.coinSell, ...ibData },
        })
      }
    },
    [dualCalcData, onChangeEvent],
  )

  const propsSell = {
    label: t('tokenEnterPaymentToken'),
    subLabel: t('tokenMax'),
    emptyText: t('tokenSelectToken'),
    placeholderText: dualCalcData.maxSellAmount
      ? t('labelInvestMaxDual', {
          value: getValuePrecisionThousand(
            dualCalcData.maxSellAmount,
            dualCalcData.sellToken.precision,
            dualCalcData.sellToken.precision,
            dualCalcData.sellToken.precision,
            false,
            { floor: false, isAbbreviate: true },
          ),
        })
      : '0.00',
    maxAllow: true,
    name: 'coinSell',
    isHideError: true,
    order: 'right' as any,
    decimalsLimit: tokenSell.precision,
    coinPrecision: tokenSell.precision,
    inputData: dualCalcData ? dualCalcData.coinSell : ({} as any),
    coinMap: {},
    ...tokenSellProps,
    handleError: handleError as any,
    handleCountChange,
    isShowCoinInfo: true,
    isShowCoinIcon: true,
    ...rest,
  } as any
  const label = React.useMemo(() => {
    if (btnInfo?.label) {
      const key = btnInfo?.label.split('|')
      return t(
        key[0],
        key && key[1]
          ? {
              arg: key[1],
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            }
          : {
              loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
              l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
              l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
              ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
            },
      )
    } else {
      return displayMode === DualDisplayMode.beginnerModeStep1
        ? t('labelContinue', {
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          })
        : t(`labelInvestBtn`, {
            loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
            l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
            l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
            ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
          })
    }
  }, [t, btnInfo])
  const lessEarnView = React.useMemo(
    () =>
      dualCalcData.lessEarnVol && tokenMap[dualCalcData.lessEarnTokenSymbol]
        ? getValuePrecisionThousand(
            sdk
              .toBig(dualCalcData.lessEarnVol)
              .div('1e' + tokenMap[dualCalcData.lessEarnTokenSymbol].decimals),
            tokenMap[dualCalcData.lessEarnTokenSymbol].precision,
            tokenMap[dualCalcData.lessEarnTokenSymbol].precision,
            tokenMap[dualCalcData.lessEarnTokenSymbol].precision,
            false,
            { floor: true },
          )
        : EmptyValueTag,
    [dualCalcData.lessEarnTokenSymbol, dualCalcData.lessEarnVol, tokenMap],
  )
  const greaterEarnView = React.useMemo(
    () =>
      dualCalcData.greaterEarnVol && tokenMap[dualCalcData.greaterEarnTokenSymbol]
        ? getValuePrecisionThousand(
            sdk
              .toBig(dualCalcData.greaterEarnVol)
              .div('1e' + tokenMap[dualCalcData.greaterEarnTokenSymbol].decimals),
            tokenMap[dualCalcData.greaterEarnTokenSymbol].precision,
            tokenMap[dualCalcData.greaterEarnTokenSymbol].precision,
            tokenMap[dualCalcData.greaterEarnTokenSymbol].precision,
            false,
            { floor: true },
          )
        : EmptyValueTag,
    [dualCalcData.greaterEarnTokenSymbol, dualCalcData.greaterEarnVol, tokenMap],
  )

  const totalQuota = React.useMemo(
    () =>
      dualCalcData.quota && dualCalcData.sellToken
        ? getValuePrecisionThousand(
            dualCalcData.quota,
            dualCalcData.sellToken.precision,
            dualCalcData.sellToken.precision,
            dualCalcData.sellToken.precision,
            false,
            { floor: false, isAbbreviate: true },
          )
        : EmptyValueTag,
    [dualCalcData],
  )
  const renewDuration =
    !dualCalcData?.coinSell?.renewDuration && dualCalcData?.dualViewInfo
      ? Math.ceil(
          // @ts-ignore
          (dualCalcData?.dualViewInfo?.expireTime -
            (dualCalcData?.dualViewInfo?.enterTime
              ? dualCalcData?.dualViewInfo.enterTime
              : Date.now())) /
            86400000,
        )
      : dualCalcData.coinSell?.renewDuration ?? 0

  return (
    <Grid
      className={dualCalcData.dualViewInfo ? '' : 'loading'}
      container
      justifyContent={'space-between'}
      alignItems={'stretch'}
      flex={1}
      height={'100%'}
    >
      {dualCalcData.dualViewInfo && priceSymbol && (
        <>
          {displayMode !== DualDisplayMode.beginnerModeStep2 && (
            <Grid
              item
              xs={12}
              flexDirection={'column'}
              alignItems={'stretch'}
              justifyContent={'space-between'}
              display={'flex'}
            >
              <Box
                paddingX={2}
                display={'flex'}
                alignItems={'stretch'}
                justifyContent={'space-between'}
                flexDirection={'column'}
              >
                <InputCoin<any, I, any>
                  ref={coinSellRef}
                  disabled={getDisabled}
                  {...{
                    ...propsSell,
                  }}
                />
                <Typography
                  variant={'body1'}
                  display={'inline-flex'}
                  alignItems={'center'}
                  justifyContent={'space-between'}
                  paddingTop={1}
                  paddingBottom={2}
                >
                  <Typography component={'span'} variant={'inherit'} color={'textSecondary'}>
                    {t('labelDualQuota')}
                  </Typography>
                  <Typography component={'span'} variant={'inherit'} color={'textPrimary'}>
                    {totalQuota + ' ' + dualCalcData.coinSell.belong}
                  </Typography>
                </Typography>
              </Box>
            </Grid>
          )}
          {/*<Grid item xs={12}>*/}
          {/*  */}
          {/*</Grid>*/}
          <Grid
            item
            xs={12}
            // order={isMobile ? 1 : 0}
            flexDirection={'column'}
            alignItems={'stretch'}
            justifyContent={'space-between'}
          >
            <DualDetail
              dualViewInfo={
                {
                  ...dualCalcData.dualViewInfo,
                  ...dualCalcData?.dualViewInfo?.__raw__?.info,
                  ...dualCalcData.coinSell,
                } as any
              }
              coinSell={{
                ...dualCalcData.coinSell,
                renewDuration,
                renewTargetPrice: dualCalcData?.dualViewInfo?.__raw__?.info?.strike,
              }}
              currentPrice={dualCalcData.dualViewInfo.currentPrice}
              tokenMap={tokenMap}
              lessEarnTokenSymbol={dualCalcData.lessEarnTokenSymbol}
              greaterEarnTokenSymbol={dualCalcData.greaterEarnTokenSymbol}
              lessEarnView={lessEarnView}
              greaterEarnView={greaterEarnView}
              displayMode={displayMode}
              isPriceEditable={false}
              dualProducts={dualProducts}
              toggle={toggle}
              whitList={whitList}
              // getProduct={getDualProduct}
              onChange={(data) => {
                onChangeEvent({
                  tradeData: {
                    ...dualCalcData?.coinSell,
                    isRenew: data.isRenew,
                    renewTargetPrice: data.renewTargetPrice,
                    renewDuration: data.renewDuration,
                  } as any,
                })
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box paddingX={2} marginY={2}>
              <ButtonStyle
                fullWidth
                variant={'contained'}
                size={'medium'}
                color={'primary'}
                onClick={() => {
                  if (!btnInfo?.label && displayMode === DualDisplayMode.beginnerModeStep1) {
                    setDisplayMode(DualDisplayMode.beginnerModeStep2)
                  } else {
                    onSubmitClick()
                  }
                }}
                loading={!getDisabled && btnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                disabled={
                  getDisabled ||
                  btnStatus === TradeBtnStatus.LOADING ||
                  btnStatus === TradeBtnStatus.DISABLED
                }
              >
                {label}
              </ButtonStyle>
            </Box>
          </Grid>
        </>
      )}
    </Grid>
  )
}
