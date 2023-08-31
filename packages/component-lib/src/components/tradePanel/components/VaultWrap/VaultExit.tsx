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

  const getDisabled = () => {
    return disabled || vaultAccountData === undefined || vaultAccountData.coinInfoMap === undefined
  }

  // const { label, stob } = useAmmViewData({
  //   i18nKey: vaultExitBtnI18nKey,
  //   t,
  //   _isStoB,
  //   vaultAccountData,
  //   _onSwitchStob,
  //   isAdd: false,
  // });

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
      ></Grid>

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
                        {tradeData.slippage
                          ? tradeData.slippage
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
                              tradeData && tradeData.slippage ? tradeData.slippage : defaultSlipage,
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
