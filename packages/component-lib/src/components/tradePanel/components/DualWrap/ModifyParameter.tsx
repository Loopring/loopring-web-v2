import {
  BtnPercentage,
  ButtonStyle,
  CoinIcons,
  DualDetailProps,
  TickCardStyleItem,
  useSettings,
} from '@loopring-web/component-lib'
import React from 'react'
import { Box, Divider, Grid, Tooltip, Typography } from '@mui/material'
import * as sdk from '@loopring-web/loopring-sdk'
import { DUAL_TYPE } from '@loopring-web/loopring-sdk'
import { Mark } from '@mui/base/SliderUnstyled/SliderUnstyledProps'
import { Trans, useTranslation } from 'react-i18next'
import {
  DAY_MINUTE_FORMAT,
  getValuePrecisionThousand,
  Info2Icon,
  TokenType,
  WarningIcon2,
} from '@loopring-web/common-resources'
import moment from 'moment'

export const ModifyParameter = ({
  dualViewInfo,
  coinSell,
  onClose,
  onChange,
  isPriceEditable,
  dualProducts,
  btnConfirm,
  // getProduct,
  maxDuration = 10,
}: DualDetailProps & { maxDuration?: number; onClose: () => void }) => {
  const { t } = useTranslation()
  const { coinJson } = useSettings()
  const {
    stepLength,
    // strike,
    currentPrice: { currentPrice, precisionForPrice, base, quote, quoteUnit },
  } = dualViewInfo

  const stepEle = React.useMemo(() => {
    if (isPriceEditable) {
      const listELE: JSX.Element[] = []
      const method = dualViewInfo.dualType === DUAL_TYPE.DUAL_BASE ? 'plus' : 'minus'
      // let method = sdk
      //   .toBig(currentPrice ?? 0)
      //   .minus(strike ?? 0)
      //   .gte(0)? 'minus'  : 'plus'

      let start = sdk.toBig(stepLength ?? 0).times(
        sdk
          .toBig(currentPrice ?? 0)
          .div(stepLength ?? 1)
          .toFixed(0),
      )

      // if(strike)
      if (method === 'minus' && start.gt(currentPrice ?? 0)) {
        start = sdk.toBig(start).minus(stepLength ?? 0)
      } else if (method === 'plus' && start.lt(currentPrice ?? 0)) {
        start = sdk.toBig(start).plus(stepLength ?? 0)
      }
      for (let index = 0, item = start; index < 12; index++) {
        const dualProduct = dualProducts?.find((dualProduct) =>
          sdk.toBig(dualProduct.strike).eq(item),
        )
        const value = item.toString()
        listELE.push(
          <Grid item key={index} xs={3}>
            <TickCardStyleItem
              selected={item.eq(coinSell.renewTargetPrice ?? 0)}
              className={
                item.eq(coinSell.renewTargetPrice ?? 0)
                  ? 'btnCard dualInvestCard selected dualPrice'
                  : 'btnCard dualInvestCard dualPrice'
              }
              // selected={coinSell.renewTargetPrice ?? 0}
              onClick={() =>
                onChange({
                  ...coinSell,
                  renewDuration: coinSell.renewDuration,
                  renewTargetPrice: value,
                })
              }
            >
              <Typography
                variant={'body1'}
                component={'span'}
                display={'flex'}
                flexDirection={'column'}
                alignItems={'center'}
                justifyContent={'center'}
                width={'100%'}
              >
                <Typography
                  variant={'inherit'}
                  component={'span'}
                  display={'flex'}
                  flexDirection={'column'}
                >
                  {value}
                </Typography>
                <Typography
                  component={'span'}
                  display={'flex'}
                  variant={'body2'}
                  flexDirection={'column'}
                  color={'textSecondary'}
                >
                  {dualProduct && t('labelDualModifyAPR', { value: dualProduct.apy })}
                </Typography>
              </Typography>
            </TickCardStyleItem>
          </Grid>,
        )
        item = method === 'minus' ? item.minus(stepLength ?? 0) : item.plus(stepLength ?? 0)
      }
      return listELE.map((item) => item)
    } else {
      return []
    }
  }, [dualProducts, coinSell.renewDuration, , coinSell?.renewTargetPrice, isPriceEditable])

  return (
    <Box marginTop={-4}>
      <Typography
        component={'header'}
        height={'var(--toolbar-row-height)'}
        display={'flex'}
        paddingX={3}
        flexDirection={'row'}
        alignItems={'center'}
      >
        <Typography component={'span'} display={'inline-flex'}>
          {/* eslint-disable-next-line react/jsx-no-undef */}
          <CoinIcons
            type={TokenType.dual}
            size={32}
            tokenIcon={[coinJson[dualViewInfo.sellSymbol], coinJson[dualViewInfo.buySymbol]]}
          />
        </Typography>
        <Typography component={'span'} display={'inline-flex'} color={'textPrimary'}>
          {t('labelDualModifyParameter')}
        </Typography>
      </Typography>
      <Divider />
      {isPriceEditable && (
        <>
          <Typography
            component={'span'}
            variant={'body1'}
            display={'flex'}
            flexDirection={'column'}
            sx={{
              background: 'var(--vip-bg)',
            }}
            padding={2}
            marginBottom={2}
          >
            <Typography
              component={'span'}
              color={'textPrimary'}
              display={'inline-flex'}
              alignItems={'center'}
            >
              <WarningIcon2
                htmlColor={'var(--color-warning)'}
                fontSize={'large'}
                sx={{
                  marginRight: 1,
                }}
              />
              {t('labelDualModifySettlementDateDes')}
            </Typography>
            <Typography component={'span'} color={'textPrimary'}>
              <WarningIcon2
                htmlColor={'var(--color-warning)'}
                fontSize={'large'}
                sx={{
                  visibility: 'hidden',
                  marginRight: 1,
                }}
              />
              {t('labelDualModifySettlementDate', {
                date: moment(new Date(dualViewInfo.expireTime)).format(DAY_MINUTE_FORMAT),
                interpolation: {
                  escapeValue: false,
                },
              })}
            </Typography>
          </Typography>
          <Box display={'flex'} margin={2} flexDirection={'column'}>
            <Typography
              variant={'body1'}
              component={'span'}
              display={'inline-flex'}
              color={'textPrimary'}
              paddingBottom={1}
            >
              <Trans
                i18nKey={'labelDualCurrentPrice'}
                tOptions={{
                  price:
                    // PriceTag[CurrencyToTag[currency]] +
                    getValuePrecisionThousand(
                      currentPrice,
                      precisionForPrice,
                      precisionForPrice,
                      undefined,
                    ),
                  symbol: base,
                  baseSymbol: /USD/gi.test(quoteUnit ?? '') ? 'USDT' : quoteUnit,
                }}
              >
                LRC Current price:
                <Typography
                  component={'span'}
                  display={'inline-flex'}
                  color={'textPrimary'}
                  paddingLeft={1}
                >
                  price
                </Typography>
                :
              </Trans>
            </Typography>
            <Grid container spacing={2}>
              {stepEle}
            </Grid>
          </Box>
        </>
      )}
      <Grid item xs={12}>
        <Tooltip title={t('labelDualEditDurationDes').toString()}>
          <Typography
            component={'span'}
            variant={'body1'}
            color={'textPrimary'}
            display={'inline-flex'}
            alignItems={'center'}
            paddingX={2}
            marginY={1}
          >
            <Trans i18nKey={'labelDualEditDuration'}>
              Modify Longest Settlement Date
              <Info2Icon fontSize={'small'} color={'inherit'} sx={{ marginX: 1 / 2 }} />
            </Trans>
          </Typography>
        </Tooltip>
        <Box padding={4}>
          <BtnPercentage
            selected={Number(coinSell.renewDuration ?? 7)}
            handleChanged={(value) => {
              onChange({
                ...coinSell,
                renewDuration: value,
              })
            }}
            anchors={
              Array.from({ length: maxDuration }, (_, index) => ({
                value: index + 1,
                label:
                  (index + 1) % 5 == 0 || index == 0 || index == maxDuration - 1
                    ? t('labelDayDisplay', { item: index + 1 })
                    : '',
              })) as Mark[]
            }
            min={1}
            max={maxDuration}
            valueLabelDisplay='on'
            valuetext={(item) => t('labelDayDisplay', { item })}
            step={1}
          />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box paddingX={2} marginY={2}>
          {btnConfirm ? (
            btnConfirm
          ) : (
            <ButtonStyle
              fullWidth
              variant={'contained'}
              size={'medium'}
              color={'primary'}
              onClick={onClose}
            >
              {t('labelDualModifyConfirm')}
            </ButtonStyle>
          )}
        </Box>
      </Grid>
    </Box>
  )
}
