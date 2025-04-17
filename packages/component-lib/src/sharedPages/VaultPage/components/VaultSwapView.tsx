import { Box, Typography, Modal, IconButton, Slider, Checkbox, Tooltip, Switch, Grid, Input, Select, MenuItem, Button as MuiButton } from '@mui/material'
import { CoinIcons, CountDownIcon, IconButtonStyled, InputSearch, SpaceBetweenBox } from '@loopring-web/component-lib'
import { CheckBoxIcon, CheckedIcon, CloseIcon, CompleteIcon, EmptyValueTag, hexToRGB, Info2Icon, LoadingIcon, ReverseIcon, SwapSettingIcon, TokenType, WaitingIcon } from '@loopring-web/common-resources'
import { numberFormat } from '@loopring-web/core'
import _ from 'lodash';
import { useTranslation } from 'react-i18next';
import Decimal from 'decimal.js';
// import styled from '@emotion/styled';
import { SlippagePanel } from '@loopring-web/component-lib/src/components/tradePanel/components';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useTheme } from '@emotion/react';
import React from 'react';
import { marginLevelTypeToColor } from '@loopring-web/component-lib/src/components/tradePanel/components/VaultWrap/utils';
import EastIcon from '@mui/icons-material/East';
import { Popover } from '@mui/material';
import { styled } from '@mui/material';

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

const BgButton = styled(MuiButton)<{ customBg: string }>`
  background-color: ${({ customBg }) => customBg};
  transition: all 0.2s ease-in-out;
  &:hover {
    background-color: ${({ customBg }) => customBg};
    opacity: 0.8;
  }
  &:disabled {
    background-color: var(--color-button-disabled);
  }
  
`


export interface VaultSwapViewProps {
  open: boolean
  onClose: () => void
  setting: {
    hideLeverage?: boolean
    onClickSettingLeverage: () => void
    leverage: number
    onSwitchChange: () => void
    secondConfirmationChecked: boolean
    settingPopoverOpen: boolean
    onCloseSettingPopover: () => void
    onClickSettingBtn: () => void
    slippageList: string[]
    currentSlippage: string
    onSlippageChange: (slippage: string, customSlippage: string) => void
  }
  countdown: {
    countDownSeconds: number
    onRefreshData: () => void
    ref: React.RefObject<any>
  }
  isLongOrShort: 'long' | 'short'
  onClickBalance: () => void
  onClickToken: () => void
  balance: string
  token: {
    symbol: string
    coinJSON: any
  }
  onInputAmount: (amount: string) => void
  amountInput: string
  inputPlaceholder: string
  inputAlert: {
    show: boolean
    message: string
    type: 'error' | 'warning' | 'success'
    icon?: 'completed' | 'wait'
  }
  swapRatio: string
  onClickReverse: () => void
  maxTradeValue: string
  borrowed: string
  totalQuota: string
  marginLevelChange: {
    from: {
      type: 'danger' | 'safe' | 'warning'
      marginLevel: string
    }
    to?: {
      type: 'danger' | 'safe' | 'warning'
      marginLevel: string
    } 
  }
  hourlyInterestRate: string
  tradingFee: string
  tradingFeeDescription: string
  slippageTolerance: string
  myPositions:
    | {
        tokenSymbol: string
        longOrShort: 'Long' | 'Short'
        marginLevel: string
        leverage: string
        amount: string
        // marketPrice: string
        onClickLeverage: () => void
        onClickTrade: () => void
        onClickClose: () => void
      }[]
    | undefined
  positionTypeSelection: {
    onChange: (value: string) => void
    items: [
      {
        label: string
        value: string
        tooltipTitle: string
      },
    ]
    value: string
  }
  leverageSelection: {
    onChange: (value: string) => void
    items: [
      {
        label: string
        value: string
      },
    ]
    value: string
  }
  ratioSlider: {
    currentRatio?: number
    onClickRatio: (no: number) => void
  }
  hideOther: boolean
  onClickHideOther: () => void
  onClickLongShort: (v: 'long' | 'short') => void
  tokenSelection: {
    show: boolean,
    search: string,
    onInputSearch: (search: string) => void
    tokens: {
      coinJSON: any,
      symbol: string,
      amount: string,
      onClick: () => void
    }[]
    onClickCancel: () => void
  }
  tradeBtn: {
    disabled: boolean,
    label?: string
    onClick: () => void
    loading?: boolean
    bgColor?: string
  }
  mainViewRef: React.RefObject<HTMLDivElement>
  onClickCloseAll: () => void
  onClickMax: () => void
  amounInUSDT: string
  moreToBeBorrowed: string
  showMyPositions: boolean
  showLeverageSelect: boolean
}

export const VaultSwapView = (props: VaultSwapViewProps) => {
  const {
    moreToBeBorrowed,
    onClickMax,
    amounInUSDT,
    setting: {
      hideLeverage,
      onClickSettingLeverage,
      leverage,
      onSwitchChange,
      secondConfirmationChecked,
      onCloseSettingPopover,
      settingPopoverOpen,
      onClickSettingBtn,
      slippageList,
      currentSlippage,
      onSlippageChange,
    },
    countdown,
    isLongOrShort,
    onClickBalance,
    balance,
    onClickToken,
    token,
    onInputAmount,
    amountInput,
    inputPlaceholder,
    inputAlert,
    swapRatio,
    onClickReverse,
    maxTradeValue,
    borrowed,
    totalQuota,
    marginLevelChange,
    hourlyInterestRate,
    tradingFee,
    tradingFeeDescription,
    slippageTolerance ,
    myPositions,
    leverageSelection,
    positionTypeSelection,
    ratioSlider,
    hideOther,
    onClickHideOther,
    onClickLongShort,
    tokenSelection,
    tradeBtn,
    mainViewRef,
    onClickCloseAll,
    showMyPositions,
    showLeverageSelect
  } = props
  const { t } = useTranslation()
  const theme = useTheme()
  const settingPopoverId = 'setting'
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const mainView = (
    <Box
      bgcolor={'var(--color-box)'}
      width={'var(--modal-width)'}
      // minHeight={'700px'}
      // height={'700px'}
      // maxHeight={'90%'}
      // overflow={'auto'}
      border={'1px solid var(--color-border)'}
      borderRadius={'12px'}
      display={'flex'}
      alignItems={'center'}
      flexDirection={'column'}
      position={'relative'}
      ref={mainViewRef}
    >
      <Box
        px={3}
        py={2}
        borderBottom={'1px solid var(--color-divide)'}
        display={'flex'}
        justifyContent={'space-between'}
        width={'100%'}
        alignItems={'center'}
      >
        <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
          <Typography mr={1 / 2} variant='h4'>
            Portal Trade
          </Typography>
          <Tooltip
            title={
              "To trade on Portal with leverage, you first need to borrow assets. If you're unable to execute the full amount, a portion of the borrowed assets may remain unused. The Auto Repay feature ensures any remaining borrowed assets are automatically repaid, helping you avoid unnecessary interest charges."
            }
            sx={{ ml: 1 / 2 }}
          >
            <Typography display={'flex'} alignItems={'center'}>
              <Info2Icon color={'inherit'} />
            </Typography>
          </Tooltip>
        </Box>

        <Box display={'flex'} alignItems={'center'}>
          <Box>
            <IconButtonStyled
              onClick={(e) => {
                onClickSettingBtn()
              }}
              sx={{ backgroundColor: 'var(--field-opacity)' }}
              className={'switch outlined'}
              aria-label='to Transaction'
              aria-describedby={settingPopoverId}
              size={'large'}
              ref={anchorRef}
            >
              <SwapSettingIcon htmlColor={'var(--color-logo)'} />
            </IconButtonStyled>
            <PopoverStyled
              id={settingPopoverId}
              open={settingPopoverOpen}
              onClose={onCloseSettingPopover}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              sx={{ background: 'transparent' }}
              anchorEl={anchorRef.current}
            >
              <Box
                paddingX={2}
                paddingTop={2}
                paddingBottom={4}
                display={'flex'}
                flexDirection={'column'}
              >
                <Box paddingBottom={1}>
                  <Typography marginBottom={1} component={'span'}>
                    {t('labelSwapSettingTitle')}
                  </Typography>
                  <Typography
                    marginBottom={1}
                    paddingLeft={1}
                    variant={'body2'}
                    color={'var(--color-text-third)'}
                    component={'span'}
                  >
                    {t('swapTolerance')}
                  </Typography>
                </Box>
                <SlippagePanel
                  t={t}
                  max={100}
                  slippageList={slippageList}
                  slippage={currentSlippage}
                  handleChange={(slippage, customSlippage) => {
                    onSlippageChange(slippage, customSlippage)
                  }}
                />
                {!hideLeverage && (
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
                      {' ' + t('labelVaultLeverage')}
                    </Typography>
                    <Typography
                      component={'span'}
                      variant='body2'
                      color={'textSecondary'}
                      display={'inline-flex'}
                      alignItems={'center'}
                      sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                      mr={1.5}
                      onClick={onClickSettingLeverage}
                    >
                      {leverage}x
                    </Typography>
                  </Grid>
                )}
                <Grid
                  container
                  justifyContent={'space-between'}
                  direction={'row'}
                  alignItems={'center'}
                  height={24}
                  marginTop={1}
                >
                  <Tooltip
                    title={t('labelSwapSettingSecondConfirmTootip').toString()}
                    placement={'bottom'}
                  >
                    <Typography
                      component={'span'}
                      variant='body2'
                      color={'textSecondary'}
                      display={'inline-flex'}
                      alignItems={'center'}
                    >
                      <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
                      {' ' + t('labelSwapSettingSecondConfirm')}
                    </Typography>
                  </Tooltip>
                  <Switch
                    onChange={() => {
                      onSwitchChange()
                    }}
                    checked={secondConfirmationChecked}
                  />
                </Grid>
              </Box>
            </PopoverStyled>
          </Box>

          <Box display={'inline-block'} ml={2} component={'span'}>
            <CountDownIcon {...countdown} />
          </Box>
          {/* <IconButton
            sx={{
              ml: 1,
            }}
            size={'large'}
            aria-label={t('labelClose')}
            color={'inherit'}
            onClick={(event) => {
              onClose()
            }}
          >
            <CloseIcon />
          </IconButton> */}
        </Box>
      </Box>

      <Box width={'100%'} ref={mainViewRef}>
        <Box mt={2} width={'100%'} px={3}>
          <BgButton
            variant='contained'
            sx={{
              clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%, 0 0)',
              width: '52%',
              borderRadius: '4px',
              borderTopRightRadius: '0',
              borderBottomRightRadius: '0',
              color:
                isLongOrShort === 'long' || theme.mode === 'dark'
                  ? 'var(--color-text)'
                  : 'var(--color-black)',
            }}
            customBg={
              isLongOrShort === 'long' ? 'var(--color-success)' : 'var(--color-box-secondary)'
            }
            onClick={() => onClickLongShort('long')}
          >
            Buy / Long
          </BgButton>
          <BgButton
            variant='contained'
            sx={{
              clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 10% 0)',
              width: '52%',
              borderRadius: '4px',
              borderTopLeftRadius: '0',
              borderBottomLeftRadius: '0',
              ml: '-4%',
              color:
                isLongOrShort === 'short' || theme.mode === 'dark'
                  ? 'var(--color-text)'
                  : 'var(--color-black)',
            }}
            customBg={
              isLongOrShort === 'short' ? 'var(--color-error)' : 'var(--color-box-secondary)'
            }
            onClick={() => onClickLongShort('short')}
          >
            Sell / Short
          </BgButton>
        </Box>

        <Box mt={2} width={'100%'} px={3}>
          {/* <Tooltip
            title={
              positionTypeSelection.items.find((item) => item.value === positionTypeSelection.value)
                ?.tooltipTitle ?? ''
            }
          > */}
          <Select
            value={positionTypeSelection.value}
            onChange={(e, v) => positionTypeSelection.onChange(e.target.value)}
            displayEmpty
            size='small'
          >
            {positionTypeSelection.items.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          {/* </Tooltip> */}

          {showLeverageSelect && <Select
            value={leverageSelection.value}
            sx={{ ml: 2 }}
            size='small'
            onChange={(e, v) => leverageSelection.onChange(e.target.value)}
            displayEmpty
          >
            {leverageSelection.items.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>}
        </Box>
        <Box mt={2} width={'100%'} px={3}>
          <Typography mb={0.5} fontSize={'14px'} color={'var(--color-text-third)'}>
            Amount
          </Typography>
          {/* <SpaceBetweenBox
              mb={0.5}
              leftNode={
                <Typography fontSize={'14px'} color={'var(--color-text-third)'}>
                  Amount
                </Typography>
              }
              rightNode={
                
              }
            /> */}
          <Input
            sx={{
              height: '48px',
              bgcolor: 'var(--color-bg-secondary)',
              textAlign: 'right',
              px: 2,
              fontSize: '20px',
            }}
            placeholder={inputPlaceholder}
            disableUnderline
            fullWidth
            startAdornment={
              <Box
                display={'flex'}
                alignItems={'center'}
                component={'div'}
                sx={{ cursor: 'pointer' }}
                onClick={onClickToken}
              >
                <CoinIcons type={TokenType.single} tokenIcon={[token.coinJSON]} />
                <Typography ml={0.5} fontSize={'16px'} color={'var(--color-text-primary)'}>
                  {token.symbol}
                </Typography>
                <KeyboardArrowDownIcon
                  sx={{ ml: 0.5, color: 'var(--color-text-secondary)' }}
                ></KeyboardArrowDownIcon>
              </Box>
            }
            inputProps={{ sx: { textAlign: 'right' } }}
            onInput={(e: any) => onInputAmount(e.target.value)}
            value={amountInput}
          />
          <Box
            display={'flex'}
            justifyContent={'end'}
            alignItems={'center'}
            sx={{
              opacity: inputAlert.show ? 1 : 0,
              mt: -1,
              color:
                inputAlert.type === 'error'
                  ? 'var(--color-error)'
                  : inputAlert.type === 'warning'
                  ? 'var(--color-warning)'
                  : 'var(--color-success)',
            }}
          >
            {inputAlert.icon === 'wait' ? (
              <WaitingIcon />
            ) : (
              inputAlert.icon === 'completed' && <CompleteIcon />
            )}
            <Typography
              sx={{
                textAlign: 'right',
                color:
                  inputAlert.type === 'error'
                    ? 'var(--color-error)'
                    : inputAlert.type === 'warning'
                    ? 'var(--color-warning)'
                    : 'var(--color-success)',
                fontSize: '12px',
                ml: 0.5,
              }}
            >
              {inputAlert.message || '--'}
            </Typography>
          </Box>
        </Box>
        <Box mx={3}>
          <Slider
            value={ratioSlider.currentRatio ? ratioSlider.currentRatio * 100 : 0}
            onChange={(e, value) => {
              ratioSlider.onClickRatio(
                new Decimal(value as number).div(100).toDecimalPlaces(2).toNumber(),
              )
            }}
            min={0}
            max={100}
            valueLabelDisplay={'on'}
            valueLabelFormat={(value) => `${new Decimal(value).toFixed(0)}%`}
            step={1}
            marks={[
              { value: 0, label: '' },
              { value: 25, label: '' },
              { value: 50, label: '' },
              { value: 75, label: '' },
              { value: 100, label: '' },
            ]}
            size='small'
          />
        </Box>
        <Box
          borderRadius={'8px'}
          mx={3}
          mt={2}
          display={'flex'}
          bgcolor={'var(--color-bg)'}
          border={'1px solid var(--color-border)'}
          justifyContent={'center'}
          alignItems={'center'}
          height={'48px'}
        >
          <Typography fontSize={16}>{amounInUSDT}</Typography>
        </Box>
        <Box mt={2} width={'100%'} display={'flex'} justifyContent={'center'}>
          <Typography fontSize='12px' display={'flex'} alignItems={'center'}>
            {swapRatio} <ReverseIcon sx={{ ml: 0.5, cursor: 'pointer' }} onClick={onClickReverse} />
          </Typography>
        </Box>
        <Box pb={2} mt={2} width={'100%'} px={3} borderBottom={'1px solid var(--color-border)'}>
          <SpaceBetweenBox
            leftNode={
              <Tooltip title={`The quantity you currently hold.`}>
                <Typography
                  display={'flex'}
                  alignItems={'center'}
                  variant={'body2'}
                  color={'var(--color-text-third)'}
                >
                  Available <Info2Icon sx={{ ml: 0.5 }} />
                </Typography>
              </Tooltip>
            }
            rightNode={
              <Typography
                component={'p'}
                onClick={onClickBalance}
                sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                variant={'body2'}
                color={'var(--color-text-primary)'}
              >
                {balance}
              </Typography>
            }
          />
          <SpaceBetweenBox
            leftNode={
              <Tooltip
                title={
                  <>
                    Max = Current holdings + borrowing limit
                    <br />
                    The borrowing limit is determined by the value of your collateral and your net
                    equity in this portal account. If the requested amount exceeds your current
                    holdings, the system will automatically borrow the required asset.
                  </>
                }
              >
                <Typography
                  display={'flex'}
                  alignItems={'center'}
                  variant={'body2'}
                  color={'var(--color-text-third)'}
                >
                  Max <Info2Icon sx={{ ml: 0.5 }} />
                </Typography>
              </Tooltip>
            }
            rightNode={
              <Typography
                onClick={onClickMax}
                sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                variant={'body2'}
                color={'var(--color-text-primary)'}
              >
                {maxTradeValue}
              </Typography>
            }
            mt={1}
          />
          <SpaceBetweenBox
            mt={1}
            leftNode={
              <Tooltip
                title={
                  'The amount borrowed from the system to fulfill the trade request, subject to an hourly interest rate.'
                }
              >
                <Typography
                  display={'flex'}
                  alignItems={'center'}
                  variant={'body2'}
                  color={'var(--color-text-third)'}
                >
                  Borrow <Info2Icon sx={{ ml: 0.5 }} />
                </Typography>
              </Tooltip>
            }
            rightNode={
              <Typography variant={'body2'} color={'var(--color-text-primary)'}>
                {moreToBeBorrowed}
              </Typography>
            }
          />
        </Box>
        <Box mt={2} width={'100%'} px={3}>
          <SpaceBetweenBox
            leftNode={
              <Tooltip title={'Total Quota is the maximum allowable trading amount.'}>
                <Typography
                  display={'flex'}
                  alignItems={'center'}
                  variant={'body2'}
                  color={'var(--color-text-third)'}
                >
                  Total Quota <Info2Icon sx={{ ml: 0.5 }} />
                </Typography>
              </Tooltip>
            }
            rightNode={
              <Typography variant={'body2'} color={'var(--color-text-primary)'}>
                {totalQuota}
              </Typography>
            }
          />
          <SpaceBetweenBox
            mt={1}
            leftNode={
              <Typography
                display={'flex'}
                alignItems={'center'}
                variant={'body2'}
                color={'var(--color-text-third)'}
              >
                Margin Level
              </Typography>
            }
            rightNode={
              <Box display={'flex'} alignItems={'center'}>
                {marginLevelChange ? (
                  <>
                    <Typography color={marginLevelTypeToColor(marginLevelChange.from.type)}>
                      {numberFormat(marginLevelChange.from.marginLevel, { fixed: 2 })}
                    </Typography>
                    {marginLevelChange.to && (
                      <>
                        <EastIcon sx={{ marginX: 0.5 }} />
                        <Typography color={marginLevelTypeToColor(marginLevelChange.to.type)}>
                          {numberFormat(marginLevelChange.to.marginLevel, { fixed: 2 })}
                        </Typography>
                      </>
                    )}
                  </>
                ) : (
                  EmptyValueTag
                )}
              </Box>
            }
          />

          <SpaceBetweenBox
            mt={1}
            leftNode={
              <Tooltip title={tradingFeeDescription}>
                <Typography
                  display={'flex'}
                  alignItems={'center'}
                  variant={'body2'}
                  color={'var(--color-text-third)'}
                >
                  Trading Fee (est.) <Info2Icon sx={{ ml: 0.5 }} />
                </Typography>
              </Tooltip>
            }
            rightNode={
              <Typography variant={'body2'} color={'var(--color-text-primary)'}>
                {tradingFee}
              </Typography>
            }
          />
          <SpaceBetweenBox
            mt={1}
            leftNode={
              <Tooltip
                title={
                  'Your trade will revert if the price changes unfavorably by more than this percentage.'
                }
              >
                <Typography
                  display={'flex'}
                  alignItems={'center'}
                  variant={'body2'}
                  color={'var(--color-text-third)'}
                >
                  Slippage Tolerance <Info2Icon sx={{ ml: 0.5 }} />
                </Typography>
              </Tooltip>
            }
            rightNode={
              <Typography variant={'body2'} color={'var(--color-text-primary)'}>
                {slippageTolerance}
              </Typography>
            }
          />
          <BgButton
            sx={{
              mt: 2,
              mb: 3,
              fontSize: 'clamp(10px, 5vw, 16px)',
              lineHeight: 1.2,
            }}
            variant='contained'
            customBg={tradeBtn.bgColor}
            size='large'
            fullWidth
            onClick={tradeBtn.onClick}
            disabled={tradeBtn.disabled}
          >
            {tradeBtn.loading ? (
              <LoadingIcon className='custom-size' sx={{ fontSize: 24 }} />
            ) : tradeBtn.label ? (
              <Typography color={'inherit'} noWrap={false}>
                {tradeBtn.label}
              </Typography>
            ) : isLongOrShort === 'long' ? (
              'Buy / Long'
            ) : (
              'Sell / Short'
            )}
          </BgButton>
        </Box>
        <Box bgcolor={'var(--color-box-secondary)'} width={'100%'} height={'4px'}></Box>

        {showMyPositions && <Box width={'100%'} my={3} pt={2}>
          <Typography px={3} variant='h5' mb={2}>
            My Positions
          </Typography>
          <Box px={3} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
            <Typography display={'flex'} alignItems={'center'} color={'var(--color-text-third)'}>
              <Checkbox
                checked={hideOther}
                onChange={() => {
                  onClickHideOther()
                }}
                sx={{
                  width: '16px',
                  height: '16px',
                  mr: 1,
                  ml: -0.25,
                }}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color='default'
              />
              Hide other tokens
            </Typography>

            {/* <BgButton
                variant='contained'
                size='small'
                customBg='var(--color-button-outlined)'
                onClick={onClickCloseAll}
                sx={{
                  fontSize: '11px',
                  borderRadius: '4px',
                  width: '70px',
                  height: '24px',
                }}
              >
                Close All
              </BgButton> */}
          </Box>

          <Box>
            {myPositions?.length === 0 && (
              <Box
                width={'100%'}
                height={'150px'}
                display={'flex'}
                justifyContent={'center'}
                alignItems={'center'}
              >
                <Typography variant='body2'>No positions</Typography>
              </Box>
            )}
            {myPositions?.map((item) => {
              return (
                <Box
                  key={item.tokenSymbol}
                  py={3}
                  px={3}
                  borderBottom={'1px solid var(--color-border)'}
                >
                  <Box display={'flex'} alignItems={'center'}>
                    <Typography fontSize={'17px'}>{item.tokenSymbol}</Typography>
                    <Typography
                      ml={1}
                      fontSize={'12px'}
                      borderRadius={'4px'}
                      px={1}
                      color={
                        item.longOrShort === 'Long'
                          ? theme.colorBase.success
                          : theme.colorBase.error
                      }
                      bgcolor={hexToRGB(
                        item.longOrShort === 'Long'
                          ? theme.colorBase.success
                          : theme.colorBase.error,
                        0.2,
                      )}
                    >
                      {item.longOrShort}
                    </Typography>
                    {/* <Box
                          color={
                            marginLevelType(item.marginLevel) === 'warning'
                              ? theme.colorBase.warning
                              : marginLevelType(item.marginLevel) === 'danger'
                              ? theme.colorBase.error
                              : theme.colorBase.success
                          }
                          bgcolor={hexToRGB(
                            marginLevelType(item.marginLevel) === 'warning'
                              ? theme.colorBase.warning
                              : marginLevelType(item.marginLevel) === 'danger'
                              ? theme.colorBase.error
                              : theme.colorBase.success,
                            0.2,
                          )}
                          ml={1}
                          display={'flex'}
                          alignItems={'center'}
                          fontSize={'13px'}
                          borderRadius={'4px'}
                          py={0.15}
                          px={0.5}
                        >
                          <MarginLevelIcon sx={{ mr: 0.5 }} />
                          {item.marginLevel}
                        </Box> */}
                  </Box>
                  <Typography variant='body2' color={'var(--color-text-third)'}>
                    Cross {item.leverage}
                  </Typography>
                  <Box display={'flex'} alignItems={'center'} mt={2.5}>
                    <Box>
                      <Typography variant='body2'>Amount</Typography>
                      <Typography>{item.amount}</Typography>
                    </Box>
                    {/* <Box ml={'30%'}>
                    <Typography variant='body2'>Market Price (USDT)</Typography>
                    <Typography>{item.marketPrice}</Typography>
                  </Box> */}
                  </Box>
                  <Box display={'flex'} alignItems={'center'} mt={2.5}>
                    <BgButton
                      variant='contained'
                      size='small'
                      customBg='var(--color-button-outlined)'
                      sx={{
                        width: '32%',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: theme.mode === 'light' ? 'var(--color-black)' : 'var(--color-white)',
                      }}
                      onClick={item.onClickTrade}
                    >
                      Trade
                    </BgButton>
                    <BgButton
                      variant='contained'
                      size='small'
                      customBg='var(--color-button-outlined)'
                      sx={{
                        width: '32%',
                        ml: '2%',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: theme.mode === 'light' ? 'var(--color-black)' : 'var(--color-white)',
                      }}
                      onClick={item.onClickClose}
                    >
                      Close
                    </BgButton>
                  </Box>
                </Box>
              )
            })}
          </Box>
        </Box>}
      </Box>

      {/* <Box width={'100%'} mt={2} px={3}>
          <BgButton
            variant='contained'
            customBg={isLongOrShort === 'long' ? 'var(--color-success)' : 'var(--color-error)'}
            size='large'
            fullWidth
            onClick={tradeBtn.onClick}
            disabled={tradeBtn.disabled}
          >
            {tradeBtn.loading ? (
              <LoadingIcon className='custom-size' sx={{ fontSize: 24 }} />
            ) : tradeBtn.label ? (
              tradeBtn.label
            ) : isLongOrShort === 'long' ? (
              'Buy/Long'
            ) : (
              'Sell/Short'
            )}
          </BgButton>
        </Box> */}
    </Box>
  )

  const tokenSelectionModal = (
    <Modal
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      open={tokenSelection.show}
      onClose={tokenSelection.onClickCancel}
    >
      <Box
        bgcolor={'var(--color-box)'}
        width={'350px'}
        maxWidth={'90%'}
        height={'400px'}
        overflow={'auto'}
        borderRadius={1}
        display={'flex'}
        flexDirection={'column'}
        py={4}
        
      >
        <Box px={2.5} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
          <InputSearch
            value={tokenSelection.search}
            style={{ width: '80%' }}
            onChange={(value: string) => {
              tokenSelection.onInputSearch(value)
            }}
          />
          <Typography sx={{ cursor: 'pointer' }} onClick={tokenSelection.onClickCancel}>
            Cancel
          </Typography>
        </Box>
        <Box
          display={'flex'}
          flexDirection={'column'}
          mt={2}
          height={'85%'}
          
          sx={{ overflowY: 'auto' }}
        >
          {tokenSelection.tokens.map((item) => (
            <SpaceBetweenBox
              px={2.5}
              onClick={item.onClick}
              py={1}
              alignItems={'center'}
              leftNode={
                <Box display={'flex'} alignItems={'center'}>
                  <CoinIcons type={TokenType.single} tokenIcon={[item.coinJSON, undefined]} />
                  <Typography ml={1.5}>{item.symbol}</Typography>
                </Box>
              }
              rightNode={
                <Typography color={'var(--color-text-secondary)'}>{item.amount}</Typography>
              }
              key={item.symbol}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'var(--color-box-hover)',
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Modal>
  )

  return (
    <>
      {mainView}
      {tokenSelectionModal}
    </>
  )
}

