import {
  AccountStatus,
  CheckBoxIcon,
  CheckedIcon,
  CoinInfo,
  DeFiSideCalcData,
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
import React from 'react'
import { Box, Checkbox, Grid, Input, Tooltip, Typography } from '@mui/material'
import {
  InputCoin,
  ButtonStyle,
  InputButtonProps,
  BtnInfo,
  InputCoin2,
  useSettings,
} from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import styled from '@emotion/styled'
import { useHistory } from 'react-router'
import { useTheme } from '@emotion/react'
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked'
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked'
import moment from 'moment'

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
    // totalPoints: string
    // dailyEarn: string
    // unlockDate: string
    trailblazerBooster: string
  }
  taikoFarmingChecked: boolean
  onCheckBoxChange: () => void
  buttonDisabled: boolean
  daysInput: {
    value: string
    onInput: (value: string) => void
  }
  myPosition:
    | {
        totalAmount: string
        totalAmountInCurrency: string
        positions: {
          amount: string
          unlocked: boolean
          lockingDays: number
          unlockTime: string
          multiplier: string
        }[]
      }
    | undefined
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

  // const checkBoxChecked = false
  // const onCheckBoxChange = () => {

  // }

  return (
    <Box
    // className={deFiSideCalcData ? '' : 'loading'}
    // direction={'column'}
    // justifyContent={'space-between'}
    // alignItems={'center'}
    // flex={1}
    // height={'100%'}
    >
      <Box
        display={'flex'}
        style={isMobile ? { flex: 1 } : { width: '450px' }}
        justifyContent={'center'}
        paddingX={3}
        paddingTop={3}
        paddingBottom={3}
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
              Stake
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
              placeholder='≥ 15 Days'
              onInput={(e) => {
                daysInput.onInput((e.target as any).value)
              }}
              value={daysInput.value}
            />
          </Grid>

          <Typography sx={{opacity: daysInput.value ? 1 : 0}} width={'100%'} variant='body2' textAlign={'left'} mt={1.5}>
            * You can unlock your TAIKO tokens after {moment().add(Number(daysInput.value), 'days').format('YYYY-MM-DD')}
          </Typography>

          
          {/* <Grid item alignSelf={'stretch'} my={3}>
        <Box
          p={1.5}
          bgcolor={hexToRGB(theme.colorBase.warning, 0.2)}
          borderRadius={'4px'}
          display={'flex'}
        >
          <Box>
            {taikoFarmingChecked ? (
              <RadioButtonCheckedIcon
                onClick={onCheckBoxChange}
                className='custom-size'
                sx={{
                  color: theme.colorBase.warning,
                  fontSize: '24px',
                  cursor: 'pointer',
                }}
              />
            ) : (
              <RadioButtonUncheckedIcon
                onClick={onCheckBoxChange}
                className='custom-size'
                sx={{ color: theme.colorBase.warning, fontSize: '24px', cursor: 'pointer' }}
              />
            )}
          </Box>
          <Box ml={1}>
            <Typography color={'var(--color-warning)'}>
              {t('labelAcknowledgeAndProceed')}
            </Typography>
            <Typography color={'var(--color-warning)'} variant={'body2'} mt={0.5}>
              {t('labelUnlockAfterSeason2')}
            </Typography>
          </Box>
        </Box>
      </Grid> */}
          <Grid item alignSelf={'stretch'} marginTop={10} pb={2}>
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
                  disabled={
                    buttonDisabled ||
                    btnStatus === TradeBtnStatus.LOADING ||
                    btnStatus === TradeBtnStatus.DISABLED
                  }
                >
                  {btnLabel}
                </ButtonStyle>
              </Grid>
            </Grid>
          </Grid>
        </GridStyle>
      </Box>

      {myPosition && (
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
          <Tooltip title={'Loopring is actively working with the Taiko team to integrate Trailblazer points collected through Taiko Farming. You are guaranteed to receive 60x Trailblazer points by participating in this campaign. However, it may take a few days for the points to be retroactively tracked in the Taiko Trailblazer Leaderboard. '} placement={'top'}>
            <Typography display={'flex'} alignItems={'center'} variant={'h5'} color={'var(--color-text-primary)'}>
              My Position
              <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
            </Typography>
          </Tooltip>
          <Typography mt={0.5} color={'var(--color-text-secondary)'}>
            Total Amount: {myPosition.totalAmount} / {myPosition.totalAmountInCurrency}
          </Typography>
          <Box mt={2.5}>
            <Box mb={0.5} display={'flex'} justifyContent={'space-between'}>
              <Typography color={'var(--color-text-secondary)'}>Amount / Status</Typography>
              <Typography color={'var(--color-text-secondary)'}>
                Lock Duration/unlock Date
              </Typography>
            </Box>

            {myPosition.positions.map((item, index) => {
              return (
                <Box py={1} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                  <Box>
                    <Box display={'flex'} alignItems={'center'}>
                      <Typography
                        component={'span'}
                        fontSize={'16px'}
                        color={'var(--color-text-primary)'}
                      >
                        {item.amount}
                      </Typography>
                      <Box
                        ml={1}
                        bgcolor={hexToRGB(theme.colorBase.warning, 0.2)}
                        color={'var(--color-warning)'}
                        borderRadius={'4px'}
                        // py={1}
                        p={0.5}
                        fontSize={'11px'}
                      >
                        {item.multiplier}
                      </Box>
                    </Box>

                    <Typography
                      color={item.unlocked ? 'var(--color-success)' : 'var(--color-text-secondary)'}
                    >
                      {item.unlocked ? 'Unlocked' : 'locked'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography textAlign={'right'} fontSize={'16px'} color={'var(--color-text-primary)'}>
                      {item.lockingDays} Days
                    </Typography>
                    <Typography textAlign={'right'} color={'var(--color-text-secondary)'}>
                      {item.unlockTime}{' '}
                    </Typography>
                  </Box>
                </Box>
              )
            })}
          </Box>

          {/* <Typography mb={2} color={'var(--color-text-secondary)'}>
          {t('labelCurrentLockedPosition')}
        </Typography>

        <Grid
          mb={1}
          container
          justifyContent={'space-between'}
          direction={'row'}
          alignItems={'center'}
        >
          <Typography
            component={'p'}
            color={'textSecondary'}
            display={'inline-flex'}
            alignItems={'center'}
          >
            {t('labelAmount')}
          </Typography>

          <Typography component={'p'}>
            {lockedPosition ? (
              <>
                {lockedPosition?.amount ?? '--'} /{' '}
                <Typography component={'span'} color={'textSecondary'}>
                  {lockedPosition?.amountInCurrency ?? '--'}
                </Typography>
              </>
            ) : (
              '--'
            )}
          </Typography>
        </Grid>
        <Grid
          mb={1}
          container
          justifyContent={'space-between'}
          direction={'row'}
          alignItems={'center'}
        >
          <Typography
            component={'p'}
            color={'textSecondary'}
            display={'inline-flex'}
            alignItems={'center'}
          >
            {t('labelTaikoFarmingTrailblazerBooster')}
          </Typography>
          <Typography component={'p'}>60x</Typography>
        </Grid>
        <Grid
          mb={1}
          container
          justifyContent={'space-between'}
          direction={'row'}
          alignItems={'center'}
        >
          <Tooltip
            title={t('labelTaikoFarmingPointsToBeTrackedRetroactivelyDes')}
            placement={'top'}
            key={'APR'}
          >
            <Typography
              component={'p'}
              color={'textSecondary'}
              display={'inline-flex'}
              alignItems={'center'}
            >
              {t('labelTaikoFarmingPointsToBeTrackedRetroactively')}
              <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
            </Typography>
          </Tooltip>
          <Typography component={'p'}></Typography>
        </Grid> */}
        </Box>
      )}
    </Box>
  )
}
