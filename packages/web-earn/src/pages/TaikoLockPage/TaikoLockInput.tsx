import {
  AccountStatus,
  CoinInfo,
  DeFiSideCalcData,
  EmptyValueTag,
  getValuePrecisionThousand,
  IBData,
  Info2Icon,
  myLog,
  OrderListIcon,
  TradeBtnStatus,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { Box, Grid, Tooltip, Typography } from '@mui/material'
import { InputCoin, ButtonStyle, InputButtonProps, BtnInfo } from '@loopring-web/component-lib'
import * as sdk from '@loopring-web/loopring-sdk'
import styled from '@emotion/styled'
import { useHistory } from 'react-router'

const GridStyle = styled(Grid)`
  input::placeholder {
    font-size: ${({ theme }) => theme.fontDefault.h5};
  }
  .coinInput-wrap {
    background-color: var(--color-global-bg);
    border: 1px solid var(--color-border);
  }
`

type StakingInputProps<T, I, ACD> = {
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
    totalPoints: string
    dailyEarn: string
    unlockDate: string
  }
}

export const TaikoLockInput = <T extends IBData<I>, I, ACD extends StakingInputProps<T, I, ACD>>({
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

  ...rest
}: StakingInputProps<T, I, ACD>) => {
  // @ts-ignore
  const coinSellRef = React.useRef()

  const { t } = useTranslation()
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
        : // <Typography variant={"body1"} color={"var(--color-text-third)"}>
          //
          // </Typography>
          '0.00',
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
  return (
    <GridStyle
      className={deFiSideCalcData ? '' : 'loading'}
      container
      direction={'column'}
      justifyContent={'space-between'}
      alignItems={'center'}
      flex={1}
      height={'100%'}
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
          LOCK
        </Typography>
        <OrderListIcon 
        sx={{cursor: 'pointer'}} onClick={() => {
          history.push(`/l2assets/history/TaikoLockRecords`)

        }} fontSize={'large'} />
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
        // borderTop={'1px solid var(--color-border)'}
        // borderBottom={'1px solid var(--color-border)'}
      >
        <InputCoin<T, I, any>
          ref={coinSellRef}
          disabled={getDisabled}
          {...{
            ...propsSell,
            name: 'coinSell',
            isHideError: true,
            order: 'right',
            inputData: deFiSideCalcData ? deFiSideCalcData.coinSell : ({} as any),
            coinMap: {},
            coinPrecision: tokenSell.precision,
          }}
          label={<Typography color={'var(--color-text-secondary)'}>Amount</Typography>}
        />
      </Grid>
      <Grid
        item
        alignSelf={'stretch'}
        marginTop={3}
        pb={6}
        borderBottom={'1px solid var(--color-border)'}
      >
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
                getDisabled ||
                btnStatus === TradeBtnStatus.LOADING ||
                btnStatus === TradeBtnStatus.DISABLED
              }
            >
              {btnLabel}
            </ButtonStyle>
          </Grid>
        </Grid>
      </Grid>
      <Box marginTop={3} width={'100%'} borderRadius={1}>
        <Typography mb={2} color={'var(--color-text-secondary)'}>
          My Current Locked Position
        </Typography>

        <Grid
          mb={1}
          container
          justifyContent={'space-between'}
          direction={'row'}
          alignItems={'center'}
        >
          <Tooltip title={t('labelLRCStakeAPRTooltips').toString()} placement={'top'} key={'APR'}>
            <Typography
              component={'p'}
              color={'textSecondary'}
              display={'inline-flex'}
              alignItems={'center'}
            >
              Amount
              <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
            </Typography>
          </Tooltip>
          <Typography component={'p'}>
            {lockedPosition?.amount ?? '--'} / <Typography component={'span'} color={'textSecondary'}>{lockedPosition?.amountInCurrency ?? '--'}</Typography> 
          </Typography>
        </Grid>
        <Grid
          mb={1}
          container
          justifyContent={'space-between'}
          direction={'row'}
          alignItems={'center'}
        >
          <Tooltip title={t('labelLRCStakeAPRTooltips').toString()} placement={'top'} key={'APR'}>
            <Typography
              component={'p'}
              color={'textSecondary'}
              display={'inline-flex'}
              alignItems={'center'}
            >
              Total Points
              <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
            </Typography>
          </Tooltip>
          <Typography component={'p'}>{lockedPosition?.totalPoints ?? '--'}</Typography>
        </Grid>
        <Grid
          mb={1}
          container
          justifyContent={'space-between'}
          direction={'row'}
          alignItems={'center'}
        >
          <Tooltip title={t('labelLRCStakeAPRTooltips').toString()} placement={'top'} key={'APR'}>
            <Typography
              component={'p'}
              color={'textSecondary'}
              display={'inline-flex'}
              alignItems={'center'}
            >
              Daily Earning Points
              <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
            </Typography>
          </Tooltip>
          <Typography component={'p'}>{lockedPosition?.dailyEarn ?? '--'}</Typography>
        </Grid>
        <Grid container justifyContent={'space-between'} direction={'row'} alignItems={'center'}>
          <Tooltip title={t('labelLRCStakeAPRTooltips').toString()} placement={'top'} key={'APR'}>
            <Typography
              component={'p'}
              color={'textSecondary'}
              display={'inline-flex'}
              alignItems={'center'}
            >
              Unlock Date
              <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
            </Typography>
          </Tooltip>
          <Typography component={'p'}>{lockedPosition?.unlockDate ?? '--'}</Typography>
        </Grid>
      </Box>
    </GridStyle>
  )
}
