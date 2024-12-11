import {
  AccountStatus,
  CoinInfo,
  EmptyValueTag,
  getValuePrecisionThousand,
  hexToRGB,
  IBData,
  Info2Icon,
  myLog,
  OrderListIcon,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Box, CircularProgress, Grid, Input, Tooltip, Typography } from '@mui/material'
import {
  InputCoin,
  ButtonStyle,
  InputButtonProps,
  BtnInfo,
  useSettings,
  SpaceBetweenBox,
} from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import styled from '@emotion/styled'
import { useHistory } from 'react-router'
import { useTheme } from '@emotion/react'
import moment from 'moment'
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';

const GridStyle = styled(Grid)`
  input::placeholder {
    font-size: ${({ theme }) => theme.fontDefault.h5};
  }
  .coinInput-wrap {
    background-color: var(--color-global-bg);
    border: 1px solid var(--color-border);
  }
`

type TaikoLockInputProps<T, I, ACD> = {
  isJoin: true
  disabled?: boolean
  btnInfo?: BtnInfo
  isLoading: boolean
  minSellAmount: string
  maxSellAmount: string
  onSubmitClick: () => void
  switchStobEvent?: (_isStoB: boolean) => void
  onChangeEvent: (data: { tradeData?: undefined | T }) => void
  handleError?: (data: T) => void
  tokenSellProps?: Partial<InputButtonProps<T, I, CoinInfo<I>>>
  deFiSideCalcData: ACD
  tokenSell: sdk.TokenInfo
  btnStatus?: keyof typeof TradeBtnStatus | undefined
  accStatus?: AccountStatus
  btnLabel: string
  lockedPosition?: {
    amount: string
    amountInCurrency: string
    trailblazerBooster: string
  }
  taikoFarmingChecked: boolean
  onCheckBoxChange: () => void
  buttonDisabled: boolean
  daysInput: {
    value: string
    onInput: (value: string) => void
    disabled: boolean
    unlockTime: string
  }
  myPosition: {
    totalAmount: string
    totalAmountInCurrency: string
    positions: {
      amount: string
      unlocked: boolean
      lockingDays: number
      unlockTime: string
      multiplier: string
    }[]
    expirationTime: number
    totalAmountWithNoSymbol: string
    realizedUSDT: string
    unrealizedTAIKO: string
    settlementStatus: 'settled' | 'notSettled' | 'noPosition',
    showMyPosition: boolean
  }
  mintButton: {
    onClick: () => void
    disabled: boolean
  }
  redeemButton: {
    onClick: () => void
    disabled: boolean
  }
  hasPendingDeposits: boolean
  onClickPendingDeposits: () => void
  lockTaikoPlaceholder: string
  lrTAIKOTradeEarnSummary?: {
    holdingAmount: string
    mintedAmount: string
    pnl: string
  }
  showMultiplier: boolean
}

const StyledInput = styled(Input)`
  input::placeholder {
    color: var(--color-text-secondary);
  }
`

export const TaikoLockInput = <T extends IBData<I>, I, ACD extends TaikoLockInputProps<T, I, ACD>>({
  disabled,
  isJoin,
  btnInfo,
  onSubmitClick,
  switchStobEvent,
  onChangeEvent,
  handleError,
  deFiSideCalcData,
  accStatus,
  tokenSell,
  isLoading,
  btnStatus,
  tokenSellProps,
  minSellAmount,
  maxSellAmount,
  btnLabel,
  lockedPosition,
  taikoFarmingChecked,
  onCheckBoxChange,
  buttonDisabled,
  daysInput,
  myPosition,
  mintButton,
  hasPendingDeposits,
  onClickPendingDeposits,
  lockTaikoPlaceholder,
  lrTAIKOTradeEarnSummary,
  showMultiplier,
  redeemButton,
  ...rest
}: TaikoLockInputProps<T, I, ACD>) => {
  // @ts-ignore
  const coinSellRef = React.useRef()

  const { t } = useTranslation('common')
  const history = useHistory()
  const getDisabled = React.useMemo(() => {
    return disabled || deFiSideCalcData === undefined
  }, [btnStatus, deFiSideCalcData, disabled])

  const handleCountChange = React.useCallback(
    (ibData: T, _name: string, _ref: any) => {
      if (deFiSideCalcData.coinSell.tradeValue !== ibData.tradeValue) {
        myLog('defi handleCountChange', _name, ibData)
        onChangeEvent({
          tradeData: { ...ibData },
        })
      }
    },
    [deFiSideCalcData, onChangeEvent],
  )
  const propsSell = {
    label: t('tokenEnterPaymentToken'),
    subLabel: t('tokenMax'),
    emptyText: t('tokenSelectToken'),
    placeholderText:
      minSellAmount && maxSellAmount
        ? t('labelInvestMaxDefi', {
            minValue: getValuePrecisionThousand(
              minSellAmount,
              tokenSell.precision,
              tokenSell.precision,
              tokenSell.precision,
              false,
              { floor: false, isAbbreviate: true },
            ),
            maxValue: getValuePrecisionThousand(
              maxSellAmount,
              tokenSell.precision,
              tokenSell.precision,
              tokenSell.precision,
              false,
              { floor: false, isAbbreviate: true },
            ),
          })
        : '0.00',
    isShowCoinInfo: true,
    isShowCoinIcon: true,
    maxAllow: true,
    ...tokenSellProps,
    handleError: (data: any) => {
      if (
        data.tradeValue &&
        (data.tradeValue > data.balance ||
          sdk.toBig(data.tradeValue).gt(maxSellAmount) ||
          sdk.toBig(data.tradeValue).lt(minSellAmount))
      ) {
        return {
          error: true,
        }
      }
      return {
        error: false,
      }
    },
    handleCountChange: handleCountChange as any,
    ...rest,
  } as any

  // const daysDuration = Math.ceil(
  //   Number(deFiSideCalcData?.stakeViewInfo?.rewardPeriod ?? 0) / 86400000,
  // )
  let dalyEarn = deFiSideCalcData?.stakeViewInfo?.dalyEarn
    ? getValuePrecisionThousand(
        sdk
          .toBig(deFiSideCalcData.stakeViewInfo.dalyEarn)
          .div('1e' + tokenSell.decimals)
          .div(100),
        tokenSell.precision,
        tokenSell.precision,
        tokenSell.precision,
        false,
      )
    : undefined
  dalyEarn = dalyEarn && dalyEarn !== '0' ? dalyEarn + ' ' + tokenSell.symbol : EmptyValueTag
  myLog('deFiSideCalcData.stakeViewInfo', deFiSideCalcData.stakeViewInfo)
  const theme = useTheme()
  const { isMobile } = useSettings()
  const [showPositionList, setShowPositionList] = useState<boolean>(false)
  const realized = false

  return (
    <Box>
      <Box
        display={'flex'}
        style={isMobile ? { flex: 1 } : { width: '450px' }}
        justifyContent={'center'}
        paddingX={3}
        paddingTop={3}
        paddingBottom={2}
        bgcolor={'var(--color-box-third)'}
        border={'1px solid var(--color-border)'}
        borderRadius={2}
      >
        <GridStyle
          className={deFiSideCalcData ? '' : 'loading'}
          container
          direction={'column'}
          justifyContent={'space-between'}
          alignItems={'center'}
          flex={1}
        >
          <Grid
            item
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            flexDirection={'row'}
            width={'100%'}
            className={'MuiToolbar-root'}
          >
            <Typography
              height={'100%'}
              display={'inline-flex'}
              variant={'h5'}
              alignItems={'center'}
              alignSelf={'self-start'}
            >
              Lock & Earn
            </Typography>
            <OrderListIcon
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                history.push(`/l2assets/history/TaikoLockRecords`)
              }}
              fontSize={'large'}
            />
          </Grid>
          <Grid
            item
            marginTop={2}
            paddingTop={2}
            paddingBottom={3}
            flexDirection={'column'}
            display={'flex'}
            alignSelf={'stretch'}
            alignItems={'stretch'}
          >
            <InputCoin<T, I, any>
              ref={coinSellRef}
              disabled={getDisabled}
              name='coinSell'
              isHideError={true}
              order='right'
              inputData={deFiSideCalcData ? deFiSideCalcData.coinSell : {}}
              coinMap={{}}
              coinPrecision={tokenSell.precision}
              {...propsSell}
              decimalsLimit={2}
              label={
                <Typography color={'var(--color-text-secondary)'}>{t('labelAmount')}</Typography>
              }
              placeholderText={lockTaikoPlaceholder}
            />
          </Grid>
          <Grid
            item
            flexDirection={'column'}
            display={'flex'}
            alignSelf={'stretch'}
            alignItems={'stretch'}
          >
            <Typography color={'var(--color-text-secondary)'} mb={0.5}>
              Lock Duration
            </Typography>
            <StyledInput
              sx={{
                textAlign: 'right',
                paddingX: 1.5,
                height: '48px',
              }}
              inputProps={{
                style: {
                  textAlign: 'right',
                  fontSize: '20px',
                  fontFamily: 'Arial',
                },
              }}
              disableUnderline
              startAdornment={
                <Typography variant='h4' color={'var(--color-text-primary)'} mb={0.5}>
                  Days
                </Typography>
              }
              placeholder='15 ≤ Lock Duration ≤ 60'
              onInput={(e) => {
                daysInput.onInput((e.target as any).value)
              }}
              value={daysInput.value}
              disabled={daysInput.disabled}
            />
          </Grid>

          {showMultiplier && (
            <Typography
              sx={{ opacity: daysInput.value ? 1 : 0 }}
              width={'100%'}
              variant='body2'
              textAlign={'left'}
              mt={1.5}
            >
              * x{Number(daysInput.value)} Multiplier
            </Typography>
          )}
          <Typography
            sx={{ opacity: daysInput.value ? 1 : 0 }}
            width={'100%'}
            variant='body2'
            textAlign={'left'}
            mt={1}
          >
            * Your TAIKO token will be unlocked on {daysInput.unlockTime}
          </Typography>

          <Grid item alignSelf={'stretch'} marginTop={8} pb={1}>
            <Grid container direction={'column'} spacing={1} alignItems={'stretch'}>
              <Grid item>
                <ButtonStyle
                  fullWidth
                  variant={'contained'}
                  size={'large'}
                  color={'primary'}
                  onClick={() => {
                    onSubmitClick()
                  }}
                  loading={!getDisabled && btnStatus === TradeBtnStatus.LOADING ? 'true' : 'false'}
                  disabled={buttonDisabled}
                >
                  {btnLabel}
                </ButtonStyle>
              </Grid>
              <Box mt={2} width={'100%'} display={'flex'} justifyContent={'center'}>
                <Typography
                  display={'flex'}
                  alignItems={'center'}
                  textAlign={'center'}
                  variant={'body2'}
                  color={'var(--color-text-secondary)'}
                >
                  Points tracked in Taiko Trailblazers Dashboard
                </Typography>
              </Box>
              {hasPendingDeposits && (
                <Box
                  sx={{ cursor: 'pointer' }}
                  onClick={onClickPendingDeposits}
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  mt={4}
                >
                  <CircularProgress size={18} sx={{ color: 'var(--color-primary)', mr: 1 }} />
                  <Typography color={'var(--color-primary)'}>Pending Transaction</Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </GridStyle>
      </Box>

      {myPosition.showMyPosition && (
        <Box
          display={'flex'}
          style={isMobile ? { flex: 1 } : { width: '450px' }}
          justifyContent={'center'}
          bgcolor={'var(--color-box-third)'}
          border={'1px solid var(--color-border)'}
          borderRadius={2}
          width={'100%'}
          flexDirection={'column'}
          p={3}
          my={5}
        >
          <Typography
            display={'flex'}
            alignItems={'center'}
            variant={'h5'}
            color={'var(--color-text-primary)'}
          >
            My Position
          </Typography>
          <Typography mt={0.5} variant='body2' color={'var(--color-text-secondary)'}>
            Expiration date:{' '}
            {myPosition.expirationTime
              ? moment(myPosition.expirationTime).format('YYYY-MM-DD')
              : '--'}
          </Typography>
          <Box mt={2}>
            <Box mb={1} display={'flex'} alignItems={'center'}>
              <Typography width={'40%'} variant='body2' color={'var(--color-text-secondary)'}>
                Item
              </Typography>
              <Typography width={'30%'} variant='body2' color={'var(--color-text-secondary)'}>
                Status
              </Typography>
              <Typography
                width={'30%'}
                textAlign={'right'}
                variant='body2'
                color={'var(--color-text-secondary)'}
              >
                Amount
              </Typography>
            </Box>
            <Box mb={1} display={'flex'} alignItems={'center'}>
              <Typography width={'40%'}>Taiko</Typography>
              <Typography width={'30%'}>{myPosition.settlementStatus === 'settled' ? 'Unlocked' : 'Locked'}</Typography>
              <Typography width={'30%'} textAlign={'right'}>
                {myPosition?.totalAmount ?? '--'}
              </Typography>
            </Box>
            {myPosition.settlementStatus === 'notSettled' ? (
              <>
                <Box mb={1} display={'flex'} alignItems={'center'}>
                  <Tooltip
                    title={
                      <Typography variant='body2'>
                        {`The amount shown reflects the total profit (positive) or loss (negative) accrued from using lrTAIKO as collateral in Loopring DeFi.`}
                        <br />
                        <br />
                        {`If the investment hasn’t been settled, the P&L will not be displayed here. To view an investment’s unrealized P&L, please visit the dashboard of the DeFi product where the asset was invested.`}
                      </Typography>
                    }
                  >
                    <Typography width={'40%'} display={'flex'} alignItems={'center'}>
                      Profit & Loss <Info2Icon sx={{ ml: 0.5 }} />
                    </Typography>
                  </Tooltip>

                  <Tooltip
                    title={
                      <Typography variant='body2'>
                        Your P&L is still pending. Once your lock duration expires, any unrealized losses will result in a portion of your locked TAIKO being transferred to Loopring.
                      </Typography>
                    }
                  >
                    <Typography width={'30%'} display={'flex'} alignItems={'center'}>
                      Unrealized <Info2Icon sx={{ ml: 0.5 }} />
                    </Typography>
                  </Tooltip>

                  <Typography width={'30%'} textAlign={'right'}>
                    {myPosition.unrealizedTAIKO}
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Box mb={1} display={'flex'} alignItems={'center'}>
                  <Tooltip
                    title={
                      <Typography variant='body2'>
                        The profit has been credited to your Loopring account in USDT
                      </Typography>
                    }
                  >
                    <Typography width={'40%'} display={'flex'} alignItems={'center'}>
                      Profit <Info2Icon sx={{ ml: 0.5 }} />
                    </Typography>
                  </Tooltip>

                  <Tooltip
                    title={
                      <Typography variant='body2'>
                        Your P&L has been finalized. If your current TAIKO holdings are less than
                        the initially locked amount, it indicates that losses incurred during your
                        DeFi activities have been deducted from your balance.
                        
                      </Typography>
                    }
                  >
                    <Typography width={'30%'} display={'flex'} alignItems={'center'}>
                      Realized <Info2Icon sx={{ ml: 0.5 }} />
                    </Typography>
                  </Tooltip>

                  <Typography width={'30%'} textAlign={'right'}>
                    {myPosition.realizedUSDT}
                  </Typography>
                </Box>
                <Box mb={1} display={'flex'} alignItems={'center'}>
                  <Tooltip
                    title={
                      <Typography variant='body2'>
                        The loss has been deducted from your locked TAIKO balance
                      </Typography>
                    }
                  >
                    <Typography width={'40%'} display={'flex'} alignItems={'center'}>
                      Loss <Info2Icon sx={{ ml: 0.5 }} />
                    </Typography>
                  </Tooltip>

                  <Tooltip
                    title={
                      <Typography variant='body2'>
                        Your P&L has been finalized. If your current TAIKO holdings are less than
                        the initially locked amount, it indicates that losses incurred during your
                        DeFi activities have been deducted from your balance.
                      </Typography>
                    }
                  >
                    <Typography width={'30%'} display={'flex'} alignItems={'center'}>
                      Realized <Info2Icon sx={{ ml: 0.5 }} />
                    </Typography>
                  </Tooltip>

                  <Typography width={'30%'} textAlign={'right'}>
                    {myPosition.unrealizedTAIKO}
                  </Typography>
                </Box>
              </>
            )}

            <Box
              pb={1.5}
              display={'flex'}
              justifyContent={'center'}
              borderBottom={'1px solid var(--color-border)'}
              mt={2}
            >
              <KeyboardDoubleArrowUpIcon
                className='custom-size'
                style={{
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  transform: showPositionList ? 'rotate(0deg)' : 'rotate(180deg)',
                }}
                onClick={() => {
                  setShowPositionList(!showPositionList)
                }}
              />
            </Box>
          </Box>
          <Box mt={2.5}>
            <></>
            {showPositionList && (
              <>
                <Box mb={0.5} display={'flex'} justifyContent={'space-between'}>
                  <Typography color={'var(--color-text-secondary)'}>Amount (TAIKO)</Typography>
                  <Typography color={'var(--color-text-secondary)'}>Lock Duration</Typography>
                </Box>
                <Box>
                  {myPosition.positions?.map((item, index) => {
                    return (
                      <Box
                        py={2}
                        display={'flex'}
                        justifyContent={'space-between'}
                        alignItems={'center'}
                      >
                        <Box>
                          <Box display={'flex'} alignItems={'center'}>
                            <Typography
                              component={'span'}
                              fontSize={'16px'}
                              color={'var(--color-text-primary)'}
                            >
                              {item.amount}
                            </Typography>
                            <Tooltip title={'Trailblazers Points Multiplier'}>
                              <Box
                                ml={1}
                                bgcolor={hexToRGB('#EA29B6', 0.2)}
                                color={'#EA29B6'}
                                borderRadius={'4px'}
                                // py={1}
                                p={0.5}
                                fontSize={'11px'}
                              >
                                {item.multiplier}
                              </Box>
                            </Tooltip>
                          </Box>

                          {/* <Typography
                      color={item.unlocked ? 'var(--color-success)' : 'var(--color-text-secondary)'}
                    >
                      {item.unlocked ? 'Unlocked' : 'locked'}
                    </Typography> */}
                        </Box>
                        <Box>
                          <Typography
                            textAlign={'right'}
                            fontSize={'16px'}
                            color={'var(--color-text-primary)'}
                          >
                            {item.lockingDays} Days
                          </Typography>
                          {/* <Typography textAlign={'right'} color={'var(--color-text-secondary)'}>
                      {item.unlockTime}{' '}
                    </Typography> */}
                        </Box>
                      </Box>
                    )
                  })}
                </Box>
              </>
            )}
            <Box display={'flex'} justifyContent={'space-between'}>
              <ButtonStyle
                sx={{ mt: 4, mb: 4, textTransform: 'none', width: '48%' }}
                fullWidth
                variant={'contained'}
                size={'large'}
                color={'primary'}
                onClick={() => {
                  redeemButton.onClick()
                }}
                disabled={redeemButton.disabled}
              >
                Redeem
              </ButtonStyle>
              <ButtonStyle
                sx={{ mt: 4, mb: 4, textTransform: 'none', width: '48%' }}
                fullWidth
                variant={'contained'}
                size={'large'}
                color={'primary'}
                onClick={() => {
                  mintButton.onClick()
                }}
                disabled={mintButton.disabled}
              >
                Mint lrTAIKO
              </ButtonStyle>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}
