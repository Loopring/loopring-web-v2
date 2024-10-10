import { SwapProps, SwapTradeData, SwapType } from '../Interface'
import { withTranslation, WithTranslation } from 'react-i18next'
import React, { useCallback, useState } from 'react'
import { Box, Checkbox, Grid, Popover, Switch, Tooltip, Typography } from '@mui/material'
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib'
import {
  BtradeTradeCalcData,
  CheckBoxIcon,
  CheckedIcon,
  defaultBlockTradeSlipage,
  IBData,
  Info2Icon,
  myLog,
  OrderListIcon,
  RecordTabIndex,
  RouterPath,
  SCENARIO,
  SlippageBtradeTolerance,
  SlippageTolerance,
  SwapSettingIcon,
  SwapTradeCalcData,
  TokenType,
  TradeCalcData,
  VaultTradeCalcData,
} from '@loopring-web/common-resources'
import { SlippagePanel, SwapData, SwapMenuList, SwapTradeWrap } from '../components'
import { CountDownIcon } from '../components/tool/Refresh'
import { IconButtonStyled } from '../components/Styled'
import { useHistory } from 'react-router-dom'
import { TagIconList } from '../../block'
import { useSettings } from '../../../stores'
import styled from '@emotion/styled'
import { useTheme } from '@emotion/react'
import { ToastType } from '../../toast'

const PopoverStyled = styled(Popover)`
  .MuiPaper-elevation2 {
    box-shadow: none;
    padding: 0;
    width: 250px;
  }

  .MuiBackdrop-root {
    background: transparent;
  }
`

export const SwapPanel = withTranslation('common', { withRef: true })(
  <
    T extends IBData<I>,
    I,
    TCD extends BtradeTradeCalcData<I> | SwapTradeCalcData<I> | VaultTradeCalcData<T>,
  >({
    disabled,
    tradeCalcData,
    swapBtnStatus,
    tokenSellProps,
    tokenBuyProps,
    handleSwapPanelEvent,
    handleError,
    onSwapClick,
    toPro,
    market,
    onRefreshData,
    campaignTagConfig,
    refreshRef,
    tradeData,
    setToastOpen,
    titleI8nKey = 'swapTitle',
    scenario = SCENARIO.SWAP,
    hideSecondConfirmation,
    bTradeTutorial,
    marginLevelChange,
    vaultLeverage,
    refreshTime,
    ...rest
  }: SwapProps<T, I, TCD> & WithTranslation & {}) => {
    let history = useHistory()
    const [index, setIndex] = React.useState(0)
    const [type, setType] = React.useState<'buy' | 'sell' | 'exchange'>('buy')
    const [to, setTo] = React.useState<'button' | 'menu'>('button')
    const onChangeEvent = (_index: 0 | 1, { type, to, tradeData }: SwapData<SwapTradeData<T>>) => {
      myLog('hookSwap onChangeEvent', tradeData)
      if (_index !== index) {
        setIndex(_index)
      }
      switch (type) {
        case 'exchange':
          setType('buy')
          break
        default:
          setType(type)
      }
      setTo(to)

      handleSwapPanelEvent &&
        handleSwapPanelEvent(
          {
            to,
            tradeData,
            type,
          },
          (type === 'exchange' ? 'exchange' : `${type}To${to}`) as SwapType,
        )
      myLog('hookSwap panelEventNext', tradeData.slippage, tradeData)
    }
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
    const [settingPopoverOpen, setSettingPopoverOpen] = useState(false)
    const settingPopoverId = settingPopoverOpen ? 'setting-popover' : undefined
    const { slippage, swapSecondConfirmation, setSwapSecondConfirmation } = useSettings()
    const onSwitchChangeCallback = useCallback(() => {
      setToastOpen &&
        setToastOpen({
          open: true,
          content: rest.t('labelSwapSettingToggleSuccess', {
            onOrOff: !swapSecondConfirmation ? 'on' : 'off',
          }),
          type: ToastType.success,
        })
      setSwapSecondConfirmation(!swapSecondConfirmation)
    }, [swapSecondConfirmation, setSwapSecondConfirmation, setToastOpen])
    const onSlippageChangeCallBack = React.useCallback(
      (slippage: number | string, customSlippage: number | string | undefined) => {
        myLog('hookSwap slippage', slippage, tradeData)
        onChangeEvent(0, {
          tradeData: {
            ...tradeData,
            slippage: slippage,
            __cache__: {
              ...tradeData?.__cache__,
              customSlippage: customSlippage,
            },
          },
          type: 'sell',
          to: 'button',
        })
      },
      [tradeData, onChangeEvent],
    )
    const theme = useTheme()
    const props: SwitchPanelProps<'tradeMenuList' | 'trade'> = {
      index: index, // show default show
      panelList: [
        {
          key: 'trade',
          element: React.useMemo(() => {
            myLog('hookSwap view tradeData', tradeData)
            return (
              // @ts-ignore
              <SwapTradeWrap<T, I, TCD>
                key={'trade'}
                {...{
                  ...rest,
                  tradeData,
                  tradeCalcData,
                  onSwapClick,
                  onChangeEvent,
                  disabled,
                  swapBtnStatus,
                  tokenSellProps,
                  tokenBuyProps,
                  handleError,
                  marginLevelChange
                }}
              />
            )
          }, [
            rest,
            tradeCalcData,
            onSwapClick,
            tradeData,
            onChangeEvent,
            disabled,
            swapBtnStatus,
            tokenSellProps,
            tokenBuyProps,
            handleError,
          ]),
          toolBarItem: React.useMemo(
            () => (
              <>
                <Typography
                  marginTop={1}
                  height={'100%'}
                  display={'inline-flex'}
                  variant={'h5'}
                  alignItems={'center'}
                  alignSelf={'self-start'}
                  component={'span'}
                >
                  {rest.t(titleI8nKey)}
                  <Typography
                    component={'span'}
                    paddingLeft={1}
                    display={'flex'}
                    alignItems={'center'}
                  >
                    {campaignTagConfig && (
                      <TagIconList
                        scenario={scenario}
                        campaignTagConfig={campaignTagConfig}
                        symbol={market as string}
                      />
                    )}
                  </Typography>
                </Typography>

                <Box alignSelf={'flex-end'} display={'flex'} className={'toolButton'}>
                  <Typography display={'inline-block'} marginLeft={2} component={'span'}>
                    <IconButtonStyled
                      onClick={(e) => {
                        setSettingPopoverOpen(true)
                        setAnchorEl(e.currentTarget)
                      }}
                      sx={{ backgroundColor: 'var(--field-opacity)' }}
                      className={'switch outlined'}
                      aria-label='to Transaction'
                      aria-describedby={settingPopoverId}
                      size={'large'}
                    >
                      <SwapSettingIcon htmlColor={theme.colorBase.logo} />
                    </IconButtonStyled>
                    <PopoverStyled
                      id={settingPopoverId}
                      open={settingPopoverOpen}
                      anchorEl={anchorEl}
                      onClose={() => {
                        setSettingPopoverOpen(false)
                        setAnchorEl(null)
                      }}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      sx={{ background: 'transparent' }}
                    >
                      <Box paddingX={2} paddingTop={2} paddingBottom={4}>
                        <Box paddingBottom={1}>
                          <Typography marginBottom={1} component={'span'}>
                            {rest.t('labelSwapSettingTitle')}
                          </Typography>
                          <Typography
                            marginBottom={1}
                            paddingLeft={1}
                            variant={'body2'}
                            color={'var(--color-text-third)'}
                            component={'span'}
                          >
                            {rest.t('swapTolerance')}
                          </Typography>
                        </Box>
                        <SlippagePanel
                          t={rest.t}
                          max={100}
                          slippageList={
                            (tradeCalcData as BtradeTradeCalcData<I>)?.isBtrade ||
                            (tradeCalcData as VaultTradeCalcData<T>)?.isVault
                              ? (SlippageBtradeTolerance.concat(`slippage:${slippage}`) as Array<
                                  number | string
                                >)
                              : (SlippageTolerance.concat(`slippage:${slippage}`) as Array<
                                  number | string
                                >)
                          }
                          slippage={
                            tradeData?.slippage
                              ? tradeData?.slippage
                              : tradeCalcData?.slippage
                              ? tradeCalcData?.slippage
                              : defaultBlockTradeSlipage
                          }
                          handleChange={(slippage, customSlippage) => {
                            onSlippageChangeCallBack(slippage, customSlippage)
                          }}
                        />
                        {bTradeTutorial?.show && (
                          <Box
                            marginTop={1.5}
                            display={'flex'}
                            alignItems={'center'}
                            justifyContent={'space-between'}
                          >
                            <Typography color={'var(--color-text-secondary)'}>
                              {rest.t("Block Trade Tutorial")}
                            </Typography>

                            <Switch
                              checked={bTradeTutorial?.checked}
                              onChange={(_event, _checked) => {
                                bTradeTutorial?.onToggle()
                              }}
                            />
                          </Box>
                        )}
                        {(tradeCalcData as any).isVault && (
                          <Grid
                            container
                            justifyContent={'space-between'}
                            direction={'row'}
                            alignItems={'center'}
                            height={24}
                            marginTop={2.5}
                          >
                            <Typography
                              component={'span'}
                              variant='body2'
                              color={'textSecondary'}
                              display={'inline-flex'}
                              alignItems={'center'}
                            >
                              {' ' + rest.t('labelVaultLeverage')}
                            </Typography>
                            <Typography
                              component={'span'}
                              variant='body2'
                              color={'textSecondary'}
                              display={'inline-flex'}
                              alignItems={'center'}
                              sx={{textDecoration: 'underline', cursor: 'pointer'}}
                              mr={1.5}
                              onClick={() => {
                                vaultLeverage?.onClickLeverage && vaultLeverage?.onClickLeverage()
                              }}
                            >
                              {vaultLeverage?.leverage}x
                            </Typography>
                            
                          </Grid>
                        )}
                        {!hideSecondConfirmation && (
                          <Grid
                            container
                            justifyContent={'space-between'}
                            direction={'row'}
                            alignItems={'center'}
                            height={24}
                            marginTop={1}
                          >
                            <Tooltip
                              title={rest.t('labelSwapSettingSecondConfirmTootip').toString()}
                              placement={'bottom'}
                            >
                              <Typography
                                component={'span'}
                                variant='body2'
                                color={'textSecondary'}
                                display={'inline-flex'}
                                alignItems={'center'}
                              >
                                <Info2Icon
                                  fontSize={'small'}
                                  color={'inherit'}
                                  sx={{ marginX: 1 / 2 }}
                                />
                                {' ' + rest.t('labelSwapSettingSecondConfirm')}
                              </Typography>
                            </Tooltip>
                            <Switch
                              onChange={() => {
                                onSwitchChangeCallback()
                              }}
                              checked={swapSecondConfirmation !== false}
                            />
                          </Grid>
                        )}
                      </Box>
                    </PopoverStyled>
                  </Typography>
                  <Typography display={'inline-block'} marginLeft={2} component={'span'}>
                    <CountDownIcon countDownSeconds={refreshTime} onRefreshData={onRefreshData} ref={refreshRef} />
                  </Typography>
                  <Typography
                    display={'inline-block'}
                    marginLeft={2}
                    component={'span'}
                    className={'record'}
                  >
                    <IconButtonStyled
                      onClick={() => {
                        // @ts-ignore
                        tradeCalcData.isBtrade
                          ? history.push(
                              `${RouterPath.l2records}/${RecordTabIndex.BtradeSwapRecords}?market=${market}`,
                            )
                          : // @ts-ignore
                          tradeCalcData.isVault
                          ? history.push(
                              `${RouterPath.l2records}/${RecordTabIndex.VaultRecords}?market=${market}`,
                            )
                          : history.push(
                              `${RouterPath.l2records}/${RecordTabIndex.Trades}?market=${market}`,
                            )
                      }}
                      sx={{ backgroundColor: 'var(--field-opacity)' }}
                      className={'switch outlined'}
                      aria-label='to Transaction'
                      size={'large'}
                    >
                      <OrderListIcon fill={theme.colorBase.logo} fontSize={'large'} />
                    </IconButtonStyled>
                  </Typography>
                </Box>
              </>
            ),
            [
              onRefreshData,
              settingPopoverOpen,
              swapSecondConfirmation,
              onSwitchChangeCallback,
              onSlippageChangeCallBack,
              tradeData,
              theme,
            ],
          ),
        },
        {
          key: 'tradeMenuList',
          element: React.useMemo(
            () => (
              // @ts-ignore
              <SwapMenuList<T, I, TCD>
                key={'tradeMenuList'}
                {...{
                  ...rest,
                  tokenType: (tradeCalcData as VaultTradeCalcData<T>)?.isVault
                    ? TokenType.vault
                    : undefined,
                  onChangeEvent,
                  tradeCalcData,
                  swapData: {
                    tradeData,
                    type,
                    to,
                  },
                }}
              />
            ),
            [onChangeEvent, tradeCalcData, type, to, rest],
          ),
          toolBarItem: undefined,
        },
      ],
    }
    return (
      <SwitchPanel
        className={`hasLinerBg ${rest?.classWrapName}`}
        {...{ ...rest, ...props, size: 'large' }}
      />
    )
  },
) as <T extends IBData<I>, I, TCD extends TradeCalcData<I>>(
  props: SwapProps<T, I, TCD> & React.RefAttributes<any>,
) => JSX.Element
