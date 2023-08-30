import {
  AmmExitData,
  AmmInData,
  CoinInfo,
  defaultSlipage,
  EmptyValueTag,
  ExchangeIcon,
  getValuePrecisionThousand,
  IBData,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
  ReverseIcon,
  SlippageTolerance,
  TokenType,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { VaultExitWrapProps } from './Interface'
import { WithTranslation } from 'react-i18next'
import React from 'react'
import { usePopupState } from 'material-ui-popup-state/hooks'
import { Box, Grid, Link, Typography } from '@mui/material'
import {
  BtnPercentage,
  ButtonStyle,
  CoinIcons,
  IconButtonStyled,
  InputCoin,
  LinkActionStyle,
  PopoverPure,
} from '../../../index'
import { bindHover, bindPopover } from 'material-ui-popup-state/es'
import { SlippagePanel } from '../tool'
import { useSettings } from '../../../../stores'
import { SvgStyled } from './styled'
import * as sdk from '@loopring-web/loopring-sdk'

import _ from 'lodash'

export const VaultExitWrap = <
  T extends AmmExitData<C extends IBData<I> ? C : IBData<I>>,
  I,
  ACD extends AmmInData<I>,
  C = IBData<I>,
>({
  t,
  disabled,
  isStob,
  switchStobEvent,
  btnStatus,
  vaultAccountData,
  onSubmitClick,
  tokenLPProps,
  anchors,
  vaultExitBtnI18nKey,
  onChangeEvent,
  handleError,
  propsLPExtends = {},
  tradeData,
  ...rest
}: VaultExitWrapProps<T, I, ACD, C> & WithTranslation) => {
  const { coinJson, slippage, defaultNetwork } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const coinLPRef = React.useRef()
  const tokenAIcon = coinJson[vaultAccountData?.lpCoinA?.belong as string]
  const tokenBIcon = coinJson[vaultAccountData?.lpCoinB?.belong as string]
  const slippageArray: Array<number | string> = SlippageTolerance.concat(
    `slippage:${slippage}`,
  ) as Array<number | string>
  const [isPercentage, setIsPercentage] = React.useState(true)

  const percentage = React.useMemo(() => {
    return ammData?.coinLP?.tradeValue && ammData.coinLP.balance
      ? getValuePrecisionThousand(
          (ammData.coinLP.tradeValue / ammData.coinLP.balance) * 100,
          2,
          2,
          2,
          false,
        )
      : 0
  }, [ammData?.coinLP?.tradeValue, ammData.coinLP.balance])

  const label = React.useMemo(() => {
    if (vaultExitBtnI18nKey) {
      const key = vaultExitBtnI18nKey.split('|')
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
  }, [vaultExitBtnI18nKey])

  const [_isStoB, setIsStoB] = React.useState(isStob ?? true)
  const stob = React.useMemo(() => {
    if (
      vaultAccountData &&
      vaultAccountData?.lpCoinA &&
      vaultAccountData?.lpCoinB &&
      vaultAccountData.AtoB
    ) {
      let price: string
      if (_isStoB) {
        price = `1 ${vaultAccountData?.lpCoinA?.belong} \u2248 ${
          vaultAccountData.AtoB ? vaultAccountData.AtoB : EmptyValueTag
        } ${vaultAccountData?.lpCoinB?.belong}`
      } else {
        price = `1 ${vaultAccountData?.lpCoinB?.belong} \u2248 ${
          vaultAccountData.BtoA ? vaultAccountData.BtoA : EmptyValueTag
        } ${vaultAccountData?.lpCoinA?.belong}`
      }
      return (
        <>
          {price}
          <IconButtonStyled
            size={'small'}
            aria-label={t('tokenExchange')}
            onClick={() => setIsStoB(!_isStoB)}
          >
            <ReverseIcon />
          </IconButtonStyled>
        </>
      )
    } else {
      return EmptyValueTag
    }
  }, [_isStoB, vaultAccountData])

  const getDisabled = () => {
    return disabled || vaultAccountData === undefined || vaultAccountData.coinInfoMap === undefined
  }

  const handleCountChange = React.useCallback(
    (ibData: IBData<I>, _ref: any) => {
      // myLog(_ref?.current, coinLPRef.current);
      if (_ref) {
        if (ammData?.coinLP.tradeValue !== ibData.tradeValue && ammData?.coinLP.balance) {
          onRemoveChangeEvent({
            tradeData: { ...ammData, coinLP: ibData },
            type: 'lp',
          })
        }
      } else {
        onRemoveChangeEvent({
          tradeData: { ...ammData, coinLP: ibData },
          type: 'lp',
        })
      }
    },
    [ammData, onRemoveChangeEvent, coinLPRef],
  )

  const onPercentage = (value: any) => {
    if (ammData?.coinLP && ammData?.coinLP?.belong) {
      myLog('selected', Number(value))

      // setSelectedPercentage(value);
      const cloneLP = _.cloneDeep(ammData.coinLP)

      cloneLP.tradeValue = sdk
        .toBig(cloneLP?.balance ?? 0)
        .times(value)
        .div(100)
        .toNumber()

      handleCountChange(cloneLP, null)
    }
  }

  const _onSlippageChange = React.useCallback(
    (slippage: number | string, customSlippage: number | string | undefined) => {
      popupState.close()
      onRemoveChangeEvent({
        tradeData: {
          ...ammData,
          slippage: slippage,
          __cache__: {
            ...ammData.__cache__,
            customSlippage: customSlippage,
          },
        },
        type: 'lp',
      })
    },
    [ammData, onRemoveChangeEvent],
  )

  const propsLP: any = {
    label: t('labelTokenAmount'),
    subLabel: t('labelAvailable'),
    placeholderText: '0.00',
    maxAllow: true,
    ...tokenLPProps,
    handleError,
    ...rest,
  }

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'slippagePop',
  })

  // const { label, stob } = useAmmViewData({
  //   i18nKey: vaultExitBtnI18nKey,
  //   t,
  //   _isStoB,
  //   vaultAccountData,
  //   _onSwitchStob,
  //   isAdd: false,
  // });

  const showPercentage = percentage < 0 || percentage > 100 ? EmptyValueTag + '%' : `${percentage}%`
  const lpTradeValue = ammData?.coinLP?.tradeValue
  let lpBalance: any = ammData?.coinLP?.balance
  lpBalance = parseFloat(lpBalance)
  const showLP =
    lpBalance && lpTradeValue && lpTradeValue > 0 && lpTradeValue <= lpBalance
      ? getValuePrecisionThousand(lpTradeValue, 2, 6)
      : '0'

  const miniA = ammData?.coinA?.tradeValue
    ? getValuePrecisionThousand(ammData?.coinA?.tradeValue)
    : EmptyValueTag

  const miniB = ammData?.coinB?.tradeValue
    ? getValuePrecisionThousand(ammData?.coinB?.tradeValue)
    : EmptyValueTag
  return (
    <Grid
      className={vaultAccountData ? '' : 'loading'}
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
        <Typography alignSelf={'flex-end'}>
          <Link
            onClick={() => btnStatus !== TradeBtnStatus.LOADING && setIsPercentage(!isPercentage)}
          >
            {t('labelAmmSwitch')}
          </Link>
        </Typography>
        <Typography alignSelf={'center'} variant={'h2'}>
          {showPercentage}
        </Typography>
        <Grid item xs={12} hidden={!isPercentage} height={87}>
          <Box
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'space-between'}
          >
            <Typography alignSelf={'center'} variant={'body1'} marginTop={1} lineHeight={'22px'}>
              {t('labelLpAmount', { value: showLP })}
            </Typography>
            <Box alignSelf={'stretch'} marginTop={1} marginX={2} height={49}>
              <BtnPercentage
                disabled={getDisabled() || btnStatus === TradeBtnStatus.LOADING}
                selected={percentage}
                anchors={[
                  {
                    value: 0,
                    label: '0',
                  },
                  {
                    value: 25,
                    label: '',
                  },
                  {
                    value: 50,
                    label: '',
                  },
                  {
                    value: 75,
                    label: '',
                  },
                  {
                    value: 100,
                    label: t('labelAvaiable:') + '100%',
                  },
                ]}
                handleChanged={onPercentage}
              />
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} hidden={isPercentage} minHeight={86} paddingTop={1}>
          <InputCoin<IBData<I>, I, CoinInfo<I>>
            ref={coinLPRef}
            disabled={getDisabled()}
            {...{
              ...propsLP,
              handleCountChange: (data, _name, ref) => handleCountChange(data, ref),
              isHideError: true,
              isShowCoinInfo: false,
              order: 'right',
              inputData: ammData ? ammData.coinLP : ({} as any),
              coinMap: vaultAccountData ? vaultAccountData.coinInfoMap : ({} as any),
            }}
          />
        </Grid>

        <Box alignSelf={'center'} marginY={1}>
          <SvgStyled>
            <ExchangeIcon fontSize={'large'} htmlColor={'var(--color-text-third)'} />
          </SvgStyled>
        </Box>
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
          <Box
            marginTop={1}
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
          >
            <Box
              component={'span'}
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              className={'logo-icon'}
              height={'var(--withdraw-coin-size)'}
              justifyContent={'flex-start'}
              marginRight={1 / 2}
            >
              <CoinIcons size={18} type={TokenType.single} tokenIcon={[tokenAIcon]} />
              <Typography variant={'body1'} component={'span'} paddingLeft={1}>
                {ammData?.coinA?.belong}
              </Typography>
            </Box>
            <Typography variant={'body1'}>{miniA}</Typography>
          </Box>
          <Box
            marginTop={1}
            display={'flex'}
            flexDirection={'row'}
            alignItems={'center'}
            justifyContent={'space-between'}
          >
            <Box
              component={'span'}
              display={'flex'}
              flexDirection={'row'}
              alignItems={'center'}
              className={'logo-icon'}
              height={'var(--withdraw-coin-size)'}
              justifyContent={'flex-start'}
              marginRight={1 / 2}
            >
              <CoinIcons size={18} type={TokenType.single} tokenIcon={[tokenBIcon]} />
              <Typography variant={'body1'} component={'span'} paddingLeft={1}>
                {ammData?.coinB?.belong}
              </Typography>
            </Box>
            <Typography variant={'body1'}>{miniB}</Typography>
          </Box>
        </Box>
      </Grid>

      <Grid item>
        <Typography component={'p'} variant='body2' height={24} lineHeight={'24px'}>
          {stob}
        </Typography>
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
                {t('swapTolerance')}
              </Typography>
              <Typography component={'p'} variant='body2' color={'textPrimary'}>
                {vaultAccountData ? (
                  <>
                    <Typography
                      {...bindHover(popupState)}
                      component={'span'}
                      variant='body2'
                      color={'textPrimary'}
                    >
                      <LinkActionStyle>
                        {ammData.slippage
                          ? ammData.slippage
                          : vaultAccountData?.slippage
                          ? vaultAccountData?.slippage
                          : 0.5}
                        %
                      </LinkActionStyle>
                      <PopoverPure
                        className={'arrow-right'}
                        {...bindPopover(popupState)}
                        {...{
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'right',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'right',
                          },
                        }}
                      >
                        <SlippagePanel
                          {...{
                            ...rest,
                            t,
                            handleChange: _onSlippageChange,
                            slippageList: slippageArray,
                            slippage:
                              ammData && ammData.slippage ? ammData.slippage : defaultSlipage,
                          }}
                        />
                      </PopoverPure>
                    </Typography>
                  </>
                ) : (
                  EmptyValueTag
                )}
              </Typography>
            </Grid>

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
                {vaultAccountData?.fee && vaultAccountData?.fee != '0'
                  ? vaultAccountData.fee + ' ' + vaultAccountData.myCoinB.belong
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
                onSubmitClick(tradeData)
                // setSelectedPercentage(0);
              }}
              loading={!getDisabled() && btnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
              disabled={
                getDisabled() ||
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
